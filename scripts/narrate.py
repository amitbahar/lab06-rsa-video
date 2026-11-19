"""Generate narration WAV with Kokoro. Usage: narrate.py "text" out.wav [voice] [speed]"""
import sys, pathlib, soundfile as sf
from kokoro_onnx import Kokoro

root = pathlib.Path(__file__).resolve().parent.parent
text, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
k = Kokoro(str(root / "models/kokoro-v1.0.int8.onnx"), str(root / "models/voices-v1.0.bin"))
samples, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
sf.write(out, samples, sr)
print(f"{out}: {len(samples)/sr:.2f}s")
