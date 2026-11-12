import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const STY = {
  ok: { icon: CheckCircle2, cls: "border-emerald-400/50 bg-emerald-950/80 text-emerald-50", head: "text-emerald-300" },
  no: { icon: XCircle, cls: "border-red-400/50 bg-red-950/80 text-red-50", head: "text-red-300" },
  info: { icon: Info, cls: "border-sky-400/40 bg-slate-900/85 text-sky-50", head: "text-sky-300" },
};

export function Feedback({ fb }) {
  return (
    <AnimatePresence mode="wait">
      {fb && (
        <motion.div key={fb.k} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
          className={`mt-3 flex items-start gap-3 rounded-xl border p-3 backdrop-blur-md ${STY[fb.type].cls}`} role="status" aria-live="assertive" data-testid={`feedback-${fb.type}`}>
          {(() => { const I = STY[fb.type].icon; return <I size={22} className={`mt-0.5 shrink-0 ${STY[fb.type].head}`} />; })()}
          <div className="text-sm leading-relaxed">
            {fb.title && <p className={`font-display font-bold ${STY[fb.type].head}`}>{fb.title}</p>}
            <p>{fb.text}</p>
            {fb.extra && <p className="mt-1 text-xs opacity-80">{fb.extra}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
