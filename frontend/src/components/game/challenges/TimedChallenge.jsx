import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Timer } from "lucide-react";
import { audio } from "@/game/audio";
import { toAr } from "@/game/store";
import { shuffle } from "./ChoiceChallenge";

export function TimedChallenge({ step, api }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(() => shuffle(step.cards), [step, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(step.seconds);
  const [running, setRunning] = useState(false);
  const clean = useRef(true);
  const over = useRef(false);

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1) { clearInterval(t); return 0; }
      if (l <= 6) audio.sfx("tick");
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running && left === 0 && !over.current) {
      over.current = true; clean.current = false; setRunning(false);
      api.wrong("انتهى الوقت! لا بأس، السرعة مهمة لكن الأهم أن تتذكري القاعدة. حاولي مجدداً.");
    }
  }, [left, running, api]);

  const start = () => { audio.sfx("whoosh"); over.current = false; setI(0); setLeft(step.seconds); setRound((r) => r + 1); setRunning(true); };
  const answer = (safe) => {
    const c = cards[i];
    if (c.safe === safe) {
      audio.sfx("pop");
      if (i === cards.length - 1) { setRunning(false); over.current = true; if (clean.current) api.flag("timedFirst"); api.right("اجتزتِ تحدّي الوقت! القرارات السريعة الصحيحة تأتي من معرفة القواعد."); }
      else { api.partial(c.why); setI(i + 1); }
    } else { clean.current = false; api.wrong(`${c.safe ? "هذا تصرّف آمن" : "هذا تصرّف خطر"}: ${c.why}`); setI(Math.min(i + 1, cards.length - 1)); if (i === cards.length - 1) { setRunning(false); over.current = true; } }
  };

  if (!running) return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--gold)]/30 bg-black/30 p-6 text-center" data-testid="timed-challenge">
      <Timer size={36} className="text-[var(--gold)]" />
      <p className="text-sm text-slate-300">{toAr(step.cards.length)} مواقف · {toAr(step.seconds)} ثانية. قرّري: آمن أم خطر؟</p>
      <button type="button" onClick={start} className="btn-gold rounded-full px-8 py-3" data-testid="timed-start-button">{round ? "إعادة المحاولة" : "ابدئي العدّ التنازلي"}</button>
    </div>
  );
  const c = cards[i];
  return (
    <div data-testid="timed-challenge">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${left <= 6 ? "bg-red-500" : "bg-[var(--gold)]"}`} style={{ width: `${(left / step.seconds) * 100}%` }} />
        </div>
        <span className={`font-mono-num text-lg font-bold ${left <= 6 ? "text-red-400" : "text-[var(--gold-hi)]"}`} data-testid="timed-seconds-left">{toAr(left)}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: -40, rotate: -2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 40 }}
          className="rounded-2xl border border-white/15 bg-white/[.06] p-5 text-center font-display text-lg leading-relaxed" data-testid="timed-card">
          <p className="mb-1 text-xs text-slate-400">الموقف {toAr(i + 1)} من {toAr(cards.length)}</p>{c.text}
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => answer(true)} data-testid="timed-safe-button" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-display font-bold hover:bg-emerald-500 active:scale-95"><ShieldCheck size={18} /> آمن</button>
        <button type="button" onClick={() => answer(false)} data-testid="timed-danger-button" className="flex items-center justify-center gap-2 rounded-xl bg-red-700 py-3 font-display font-bold hover:bg-red-600 active:scale-95"><ShieldAlert size={18} /> خطر</button>
      </div>
    </div>
  );
}
