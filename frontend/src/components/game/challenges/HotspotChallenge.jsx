import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ScanSearch } from "lucide-react";
import { audio } from "@/game/audio";
import { toAr } from "@/game/store";

export function HotspotChallenge({ step, api }) {
  const [found, setFound] = useState([]);
  const [miss, setMiss] = useState(null);
  const [hint, setHint] = useState(null);
  const box = useRef(null);
  const tap = (e) => {
    const r = box.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    const i = step.spots.findIndex((s) => Math.hypot(s.x - x, (s.y - y) * (r.height / r.width)) < s.r);
    if (i >= 0 && !found.includes(i)) {
      const nf = [...found, i];
      setFound(nf); setHint(null);
      if (nf.length === step.spots.length) api.right(`أحسنتِ! اكتشفتِ كل الأخطار. ${step.spots[i].label}: ${step.spots[i].why}`);
      else api.partial(`${step.spots[i].label}: ${step.spots[i].why}`);
    } else if (i < 0) {
      setMiss({ x, y, k: Date.now() });
      api.flag("hotDirty");
      api.wrong("هذا الموضع لا يمثّل خطراً مباشراً. ابحثي عمّا قد يسبب صعقة أو سقوطاً أو يعيق الخروج.");
    }
  };
  const useHint = () => {
    const i = step.spots.findIndex((_, k) => !found.includes(k));
    if (i < 0) return;
    audio.sfx("pop"); setHint(i); api.hint();
  };
  return (
    <div data-testid="hotspot-challenge">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-[var(--gold-hi)]"><ScanSearch size={16} /> الأخطار المكتشفة: <b data-testid="hotspot-found-count">{toAr(found.length)} / {toAr(step.spots.length)}</b></span>
        <button type="button" onClick={useHint} className="btn-ghost flex items-center gap-1 rounded-full px-3 py-1 text-xs" data-testid="hotspot-hint-button"><Lightbulb size={13} /> تلميح</button>
      </div>
      <div ref={box} onClick={tap} className="relative aspect-[1264/848] w-full cursor-crosshair overflow-hidden rounded-xl border border-[var(--gold)]/30" data-testid="hotspot-image">
        <img src={step.img} alt="ابحثي عن الأخطار" className="h-full w-full object-cover" draggable={false} />
        {step.spots.map((s, i) => (found.includes(i) || hint === i) && (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            <div className={`relative grid size-12 place-items-center rounded-full border-[3px] ${found.includes(i) ? "border-emerald-400 bg-emerald-400/20" : "border-[var(--gold)] bg-[var(--gold)]/10"}`}>
              {hint === i && !found.includes(i) && <span className="pulse-ring" />}
              <span className="font-display text-sm font-bold text-white">{found.includes(i) ? "✓" : "؟"}</span>
            </div>
            {found.includes(i) && <p className="mt-1 whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-center text-[11px]">{s.label}</p>}
          </motion.div>
        ))}
        {miss && <motion.span key={miss.k} initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.7 }}
          className="pointer-events-none absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-400" style={{ left: `${miss.x}%`, top: `${miss.y}%` }} />}
      </div>
    </div>
  );
}
