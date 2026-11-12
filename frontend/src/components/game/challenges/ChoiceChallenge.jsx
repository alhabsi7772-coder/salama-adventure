import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { audio } from "@/game/audio";

const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
export { shuffle };

export function ChoiceChallenge({ step, api }) {
  const opts = useMemo(() => shuffle(step.options.map((o, i) => ({ ...o, i }))), [step]);
  const [bad, setBad] = useState([]);
  const [good, setGood] = useState(null);
  const pick = (o) => {
    if (good !== null || bad.includes(o.i)) return;
    audio.sfx("click");
    if (o.ok) { setGood(o.i); api.right(o.why); } else { setBad((b) => [...b, o.i]); api.wrong(o.why); }
  };
  return (
    <div className="space-y-2.5" data-testid="choice-challenge">
      {opts.map((o, k) => {
        const isBad = bad.includes(o.i), isGood = good === o.i;
        return (
          <motion.button key={o.i} type="button" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + k * 0.08 }}
            onClick={() => pick(o)} disabled={isBad || good !== null} data-testid={`choice-option-${k}`}
            className={`opt flex w-full items-center gap-3 rounded-xl border p-3.5 text-right text-[15px] leading-relaxed sm:text-base ${isGood ? "border-emerald-400 bg-emerald-500/20" : isBad ? "border-red-400/60 bg-red-500/10 opacity-70" : "border-white/15 bg-white/[.04]"}`}>
            <span className={`grid size-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${isGood ? "bg-emerald-400 text-emerald-950" : isBad ? "bg-red-400 text-red-950" : "bg-[var(--gold)]/20 text-[var(--gold-hi)]"}`}>
              {isGood ? <Check size={16} /> : isBad ? <X size={16} /> : "أبج"[k]}
            </span>
            <span className="flex-1">{o.text}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
