import { motion } from "framer-motion";
import { Portrait } from "./Character";
import { Subtitle } from "./Subtitle";
import { CHARS } from "@/game/levels";

export function Dialogue({ who = "mentor", line, text, pose, onDone, children, testId = "dialogue-box" }) {
  const c = CHARS[who];
  return (
    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 22 }}
      className="glass-strong rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(212,175,55,.12)]" data-testid={testId}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Portrait who={who} pose={pose} size={60} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-[var(--gold)]">
            {c.name}{c.role && <span className="mr-2 text-xs font-medium text-slate-400">· {c.role}</span>}
          </p>
          <Subtitle id={line} text={text} onDone={onDone} className="mt-1 text-base leading-relaxed text-slate-100 sm:text-lg" />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
