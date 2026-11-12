"""Generate every game line with one professional female Modern Standard Arabic narrator voice."""
import asyncio
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.openai import OpenAITextToSpeech

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")
LINES = json.loads((ROOT.parent / "frontend/src/game/lines.json").read_text(encoding="utf-8"))
OUT = ROOT.parent / "frontend/public/voice/v2"
VOICE = os.environ.get("NARRATOR_VOICE", "nova")


def tts_text(text: str) -> str:
    for a, b in (("«", ""), ("»", ""), ("…", "، "), ("—", "، "), ("9999", "تسعة تسعة تسعة تسعة"), ("٩٩٩٩", "تسعة تسعة تسعة تسعة"), ("(", ""), (")", "")):
        text = text.replace(a, b)
    return text


async def one(tts, sem, key, text, force):
    target = OUT / f"{key}.mp3"
    if target.exists() and not force:
        return key
    async with sem:
        for attempt in range(3):
            try:
                audio = await tts.generate_speech(text=tts_text(text), model="tts-1-hd", voice=VOICE, speed=0.95)
                target.write_bytes(audio)
                print("ok", key)
                return key
            except Exception as exc:
                print("retry", key, attempt, exc)
                await asyncio.sleep(2)
    return None


async def main(force: bool) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    tts = OpenAITextToSpeech(api_key=os.environ["EMERGENT_LLM_KEY"])
    sem = asyncio.Semaphore(6)
    done = await asyncio.gather(*(one(tts, sem, k, t, force) for k, t in LINES.items()))
    ids = [d for d in done if d]
    (OUT / "manifest.json").write_text(json.dumps({"v": int(time.time()), "voice": VOICE, "ids": ids}, ensure_ascii=False))
    print(f"generated {len(ids)}/{len(LINES)}")


if __name__ == "__main__":
    asyncio.run(main("--force" in sys.argv))
