import { useEffect, useMemo, useRef, useState } from "react";
import { audio } from "@/game/audio";
import { LINES } from "@/game/levels";
import { useGame } from "@/game/store";

export function useNarration(id, { auto = true } = {}) {
  const [dur, setDur] = useState(null);
  useEffect(() => {
    if (!id || !auto) return undefined;
    let alive = true;
    setDur(null);
    const t = setTimeout(() => audio.speak(id).then((d) => alive && setDur(d || 0)), 150);
    return () => { alive = false; clearTimeout(t); audio.stopVoice(); };
  }, [id, auto]);
  return dur;
}

export function Subtitle({ id, text, className = "", onDone, testId = "subtitle-text" }) {
  const { st } = useGame();
  const content = text || LINES[id] || "";
  const words = useMemo(() => content.split(" "), [content]);
  const dur = useNarration(id);
  const [n, setN] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    setN(0);
    if (dur === null && id) return undefined;
    const per = dur ? Math.min(650, Math.max(90, (dur * 900) / words.length)) : 110;
    let i = 0, end;
    const iv = setInterval(() => {
      i += 1; setN(i);
      if (i >= words.length) {
        clearInterval(iv);
        end = setTimeout(() => done.current?.(), dur ? Math.max(400, dur * 1000 - words.length * per) : 600);
      }
    }, per);
    return () => { clearInterval(iv); clearTimeout(end); };
  }, [dur, words, id]);
  if (!st.subtitles) return <p className={`${className} opacity-60`} data-testid={testId}>…</p>;
  return (
    <p className={className} onClick={() => setN(words.length)} data-testid={testId}>
      {words.map((w, i) => (
        <span key={i} className="transition-opacity duration-500" style={{ opacity: i < n ? 1 : 0.08 }}>{w} </span>
      ))}
    </p>
  );
}
