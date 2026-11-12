import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Gem, Sparkles } from "lucide-react";
import { ACHIEVEMENTS, COLLECTIBLES } from "@/game/levels";
import { toAr } from "@/game/store";
import { audio } from "@/game/audio";
import { Stars } from "./Stars";
import { StampMark, Ico } from "./PassportDialog";
import { Subtitle } from "./Subtitle";

const Confetti = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {Array.from({ length: 46 }, (_, i) => (
      <motion.span key={i} className="absolute top-0 block h-3 w-1.5 rounded-sm"
        style={{ left: `${(i * 37) % 100}%`, background: ["#d4af37", "#38bdf8", "#9e1b32", "#34d399", "#f3e5ab"][i % 5] }}
        initial={{ y: -40, rotate: 0, opacity: 1 }} animate={{ y: "105vh", rotate: 540 + i * 20, opacity: [1, 1, 0] }}
        transition={{ duration: 2.6 + (i % 7) * 0.3, delay: (i % 10) * 0.08, ease: "easeIn" }} />
    ))}
  </div>
);

function useCount(to, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); let raf;
    const f = (t) => { const p = Math.min(1, (t - t0) / ms); setV(Math.round(to * (1 - (1 - p) ** 3))); if (p < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

export function RewardOverlay({ level, result, collected, children }) {
  const xp = useCount(result.xp);
  useEffect(() => { audio.sfx("fanfare"); const t = setTimeout(() => audio.sfx("stamp"), 650); return () => clearTimeout(t); }, []);
  const achs = ACHIEVEMENTS.filter((a) => result.newAch.includes(a.id));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,8,20,.82)] p-4 backdrop-blur-md" data-testid="reward-overlay">
      <Confetti />
      <motion.div initial={{ y: 40, scale: 0.94 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", damping: 18 }}
        className="glass-strong relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 text-center thin-scroll sm:p-8">
        <p className="font-display text-xs font-bold text-[var(--gold)]">مهمة مكتملة · المرحلة {level.ordinal}</p>
        <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">{level.title}</h2>
        <motion.div initial={{ scale: 3, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 14 }}
          className="paper mx-auto mt-5 w-fit rounded-xl px-6 py-4">
          <StampMark level={level} size={88} />
        </motion.div>
        <div className="mt-5 flex items-center justify-center gap-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: "spring" }}><Stars n={result.stars} size={34} testId="reward-stars" /></motion.div>
          <div className="flex items-center gap-1.5 font-display text-2xl font-black text-[var(--sky)]" data-testid="reward-xp"><Sparkles size={22} />+{toAr(xp)}<span className="text-sm">XP</span></div>
        </div>
        <Subtitle id={level.stamp.line} className="mx-auto mt-4 max-w-md font-doc text-lg leading-relaxed text-[var(--gold-hi)]" testId="reward-stamp-message" />
        {(collected || achs.length > 0) && (
          <div className="mt-4 space-y-2 text-right">
            {collected && <div className="flex items-center gap-3 rounded-xl bg-[var(--sky)]/15 p-3 ring-1 ring-[var(--sky)]/40" data-testid="reward-collectible"><Gem className="text-[var(--sky)]" size={20} /><span className="text-sm">أداة سلامة جديدة: <b>{COLLECTIBLES[level.id].name}</b></span></div>}
            {achs.map((a, i) => (
              <motion.div key={a.id} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.4 + i * 0.2 }}
                className="flex items-center gap-3 rounded-xl bg-[var(--gold)]/15 p-3 ring-1 ring-[var(--gold)]/50" data-testid={`reward-achievement-${a.id}`}>
                <span className="grid size-9 place-items-center rounded-full bg-[var(--gold)] text-[#1a1203]"><Ico name={a.icon} size={17} /></span>
                <div><p className="flex items-center gap-1 font-display text-sm font-bold"><Award size={14} /> إنجاز جديد: {a.title}</p><p className="text-xs text-slate-300">{a.desc}</p></div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-center">{children}</div>
      </motion.div>
    </motion.div>
  );
}
