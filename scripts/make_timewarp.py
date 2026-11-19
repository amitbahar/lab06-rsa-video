"""Map scene cue times from the v1 (af_heart) narration onto the current narration.

Scene files were timed against the v1 WAVs. This finds each sentence's start/end in the
v1 audio (longest silences = sentence breaks), pairs them with the exact sentence times
recorded in durations.json, and writes video/src/timewarp.json:
  {"S01": [[old_s, new_s], ...]}  (piecewise-linear anchors)
Re-run after re-narrating; scenes whose sentence count changed fall back to linear scaling.
Usage: make_timewarp.py   (needs git tag v1)
"""
import io, json, pathlib, subprocess
import numpy as np, soundfile as sf

root = pathlib.Path(__file__).resolve().parent.parent
dur = json.loads((root / "video/src/durations.json").read_text())


def old_sentence_spans(wav, new_sents, ref_len):
    """Pick the v1 pauses that best split the audio into sentences shaped like the new ones
    (dynamic programming over all silent gaps; cost = squared log length-ratio deviation)."""
    x, sr = sf.read(io.BytesIO(wav))
    hop = int(0.01 * sr)
    rms = np.sqrt(np.convolve(x**2, np.ones(hop) / hop, mode="same"))[::hop]
    voiced = rms > 0.01 * rms.max()
    idx = np.flatnonzero(voiced)
    first, last = int(idx[0]), int(idx[-1]) + 1
    gaps, i = [], first
    while i < last:
        if not voiced[i]:
            j = i
            while j < last and not voiced[j]:
                j += 1
            if j - i >= 8:  # >= 80 ms
                gaps.append((i, j))
            i = j
        else:
            i += 1
    n = len(new_sents)
    new_len = ref_len  # v1-voice lengths of each sentence read alone
    r = (last - first) * 0.01 / (sum(ref_len) + 0.4 * (len(ref_len) - 1))
    # bounds[k] = (start of sentence k+1 region) ; node 0 = first, node len+1 = last
    starts = [first] + [g[1] for g in gaps]
    ends = [g[0] for g in gaps] + [last]
    m = len(gaps)
    INF = float("inf")
    # cost[k][a]: best cost having placed k sentences, the k-th ending at boundary a (gap index a, or m = last)
    def seg_cost(si, a, k):
        L = (ends[a] - starts[si]) * 0.01
        if L <= 0:
            return INF
        return (np.log(L / (r * new_len[k]))) ** 2 + 0.002 * (gaps[a][1] - gaps[a][0] if a < m else 0) * -1
    best = {(0, -1): (0.0, None)}  # (k sentences placed, last boundary gap idx) -> cost, back
    for k in range(n):
        nxt = {}
        for (kk, a), (c, _) in best.items():
            if kk != k:
                continue
            si = a + 1  # sentence starts after gap a (start index into starts)
            cands = [m] if k == n - 1 else range(si, m)
            for b in cands:
                cc = c + seg_cost(si, b, k)
                if cc < nxt.get((k + 1, b), (INF,))[0]:
                    nxt[(k + 1, b)] = (cc, (k, a))
        best.update(nxt)
    # backtrack
    key, spans = (n, m), []
    while key[0] > 0:
        _, back = best[key]
        si, b = back[1] + 1, key[1]
        spans.append((starts[si] * 0.01, ends[b] * 0.01))
        key = back
    return spans[::-1], len(x) / sr


from kokoro_onnx import Kokoro
k = Kokoro(str(root / "models/kokoro-v1.0.int8.onnx"), str(root / "models/voices-v1.0.bin"))
V1_VOICE = "af_heart"
warp = {}
for sid, d in dur.items():
    wav = subprocess.run(["git", "show", f"v1:video/public/audio/{sid}.wav"], cwd=root, capture_output=True, check=True).stdout
    sents = d["sentences"]
    ref = [len(k.create(t, voice=V1_VOICE, speed=1.0, lang="en-us")[0]) / 24000 for _, _, t in sents]
    old, old_len = old_sentence_spans(wav, sents, ref)
    pts = [[0.0, 0.0]]
    for (os_, oe), (ns, ne, _) in zip(old, sents):
        pts += [[round(os_, 3), ns], [round(oe, 3), ne]]
    pts.append([round(old_len + 5, 3), round(d["seconds"] + 5 * d["seconds"] / old_len, 3)])
    warp[sid] = pts
    ratios = [float(round((ne - ns) / max(oe - os_, 0.01), 2)) for (os_, oe), (ns, ne, _) in zip(old, sents)]
    print(sid, "new/old:", ratios, "old starts:", [round(a, 2) for a, _ in old])
(root / "video/src/timewarp.json").write_text(json.dumps(warp, indent=1) + "\n")
