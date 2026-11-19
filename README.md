# RSA explainer video (Lab 6)

~3 min Remotion video explaining RSA. Script: [SCRIPT.md](SCRIPT.md).

## Layout
- `SCRIPT.md`: scene-by-scene narration and visuals (S01–S10)
- `scripts/narrate_all.py`: turns SCRIPT.md narration into `video/public/audio/SNN.wav` and `video/src/durations.json` (Kokoro TTS)
- `video/src/scenes/SNN_*.tsx`: one file per scene; `video/src/shared/`: theme and shared components
- `scripts/make_timewarp.py`: scene cues were timed to the v1 voice; this maps them onto the current narration sentence by sentence (`video/src/timewarp.json`). Re-run after re-narrating.
- `releases/`: finished renders. `rsa_v1.mp4` = first complete version (female voice `af_heart`), `rsa_v2.mp4` = male voice `am_michael`

## Setup
```bash
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
mkdir -p models && cd models
wget https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
wget https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd ../video && npm install
```

## Build
```bash
.venv/bin/python scripts/narrate_all.py          # all scenes (or: narrate_all.py S05)
.venv/bin/python scripts/make_timewarp.py        # re-sync scene cues to the new audio
cd video && npx remotion studio                  # preview
npx remotion render RSA ../out/rsa.mp4           # full video
npx remotion render S05 ../out/S05.mp4           # one scene
```

## Going back to an earlier version
- Whole video, first version: `git checkout v1` (or just play `releases/rsa_v1.mp4`). Each tag (`v1`, `v2`, …) is a complete, renderable version.
- One scene only, e.g. S05 back to v1 (code + its narration audio):
  `git checkout v1 -- video/src/scenes/S05_KeyGen.tsx video/public/audio/S05.wav`
  then restore its narration in SCRIPT.md and its entry in `video/src/durations.json` from `git show v1:video/src/durations.json`.
  Note: v1 scenes have no timewarp, so a v1 scene file should be paired with its v1 audio and the S0X entry removed from `timewarp.json`.
