"""Clone the narrator voice from voice_sample.wav and generate every game line with it."""
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from elevenlabs import ElevenLabs, VoiceSettings

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")
LINES = json.loads((ROOT.parent / "frontend/src/game/lines.json").read_text(encoding="utf-8"))
OUT = ROOT.parent / "frontend/public/voice/v2"
VOICE_FILE = ROOT / "voice_id.txt"
SKIP = {"intro-1"}  # played from the user's original recording


def tts_text(text: str) -> str:
    return text.replace("«", "").replace("»", "").replace("…", "، ").replace("—", "، ").replace("9999", "تسعة تسعة تسعة تسعة").replace("٩٩٩٩", "تسعة تسعة تسعة تسعة")


def main(force: bool = False) -> None:
    client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
    if VOICE_FILE.exists():
        voice_id = VOICE_FILE.read_text().strip()
    else:
        with open(ROOT / "voice_sample.wav", "rb") as f:
            voice = client.voices.ivc.create(name="Safirat Narrator", files=[f], description="Arabic female narrator for Safety Ambassador game")
        voice_id = voice.voice_id
        VOICE_FILE.write_text(voice_id)
    print("voice", voice_id)
    OUT.mkdir(parents=True, exist_ok=True)
    done = []
    for key, text in LINES.items():
        target = OUT / f"{key}.mp3"
        if key in SKIP:
            continue
        if target.exists() and not force:
            done.append(key)
            continue
        try:
            audio = client.text_to_speech.convert(
                text=tts_text(text), voice_id=voice_id, model_id="eleven_multilingual_v2", output_format="mp3_44100_128",
                voice_settings=VoiceSettings(stability=0.55, similarity_boost=0.9, style=0.25, use_speaker_boost=True),
            )
            target.write_bytes(b"".join(audio))
            done.append(key)
            print("ok", key)
        except Exception as exc:  # keep going; report at the end
            print("fail", key, exc)
    (OUT / "manifest.json").write_text(json.dumps({"v": int(time.time()), "voice_id": voice_id, "ids": done}, ensure_ascii=False))
    print(f"generated {len(done)}/{len(LINES) - len(SKIP)}")


if __name__ == "__main__":
    main(force="--force" in sys.argv)
