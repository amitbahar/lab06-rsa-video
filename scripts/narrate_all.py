"""Generate narration for every scene in SCRIPT.md and record scene durations.

Usage: narrate_all.py [S01 S06 ...]   (no args = all scenes)

Writes video/public/audio/SNN.wav and updates video/src/durations.json
({"S01": {"seconds": 11.8, "frames": 369, "sentences": [[start, end, text], ...]}, ...}).
Frames = audio + padding at 30 fps. Each sentence is synthesized separately and joined with
GAP_S of silence, so sentence start/end times (seconds in the WAV) are exact.
"""
import fcntl, json, math, pathlib, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

FPS, PAD_S = 30, 0.8
VOICE, SPEED = "am_michael", 1.0
GAP_S = 0.4
root = pathlib.Path(__file__).resolve().parent.parent
audio_dir = root / "video/public/audio"
dur_file = root / "video/src/durations.json"


def parse_script():
    text = (root / "SCRIPT.md").read_text()
    scenes = {}
    for block in re.split(r"^## ", text, flags=re.M)[1:]:
        m = re.match(r"(S\d\d)\b", block)
        if not m:
            continue
        nar = block.split("**Narration**", 1)[1].split("**Visuals**", 1)[0]
        lines = [l[1:].strip() for l in nar.splitlines() if l.startswith(">")]
        scenes[m.group(1)] = " ".join(lines)
    return scenes


def main():
    scenes = parse_script()
    wanted = sys.argv[1:] or list(scenes)
    audio_dir.mkdir(parents=True, exist_ok=True)
    k = Kokoro(str(root / "models/kokoro-v1.0.int8.onnx"), str(root / "models/voices-v1.0.bin"))
    new = {}
    for sid in wanted:
        parts, sents, t, sr = [], [], 0.0, 24000
        for sent in re.split(r"(?<=[.?!])\s+", scenes[sid].strip()):
            audio, sr = k.create(sent, voice=VOICE, speed=SPEED, lang="en-us")
            if parts:
                parts.append(np.zeros(int(GAP_S * sr), dtype=audio.dtype))
                t += GAP_S
            parts.append(audio)
            sents.append([round(t, 3), round(t + len(audio) / sr, 3), sent])
            t += len(audio) / sr
        samples = np.concatenate(parts)
        sf.write(audio_dir / f"{sid}.wav", samples, sr)
        secs = len(samples) / sr
        new[sid] = {"seconds": round(secs, 2), "frames": math.ceil((secs + PAD_S) * FPS), "sentences": sents}
        print(f"{sid}: {secs:.2f}s -> {new[sid]['frames']} frames")
    # lock so two agents re-narrating different scenes at once don't clobber each other
    with open(dur_file.with_suffix(".lock"), "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        durations = json.loads(dur_file.read_text()) if dur_file.exists() else {}
        durations.update(new)
        durations = dict(sorted(durations.items()))
        dur_file.write_text(json.dumps(durations, indent=2) + "\n")
    total = sum(d["frames"] for d in durations.values())
    print(f"total: {total} frames ({total / FPS:.1f}s)")


if __name__ == "__main__":
    main()
