import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, SprayCan, Wind } from "lucide-react";
import { audio } from "@/game/audio";
import { shuffle } from "./ChoiceChallenge";

const EXT = [
  { name: "ماء", tag: "خرطوم مائي", color: "#2563eb", icon: Droplets, why: "خطر! الماء موصل للكهرباء، ولا يُستخدم أبداً قرب مصدر كهربائي." },
  { name: "رغوة", tag: "رغوة إطفاء", color: "#f59e0b", icon: SprayCan, why: "الرغوة تحتوي على ماء، فلا تُستخدم مع حريق ملاصق للكهرباء." },
  { name: "ثاني أكسيد الكربون", tag: "CO₂", color: "#111827", icon: Wind, ok: true, why: "صحيح! ثاني أكسيد الكربون لا يوصّل الكهرباء ولا يترك بقايا، فهو الخيار الآمن لحريق ملاصق لمصدر كهربائي." },
];
const STEPS = [
  { t: "اسحبي", d: "مسمار الأمان", why: "ابدئي أولاً بسحب مسمار الأمان، فبدونه لا تعمل الطفاية." },
  { t: "وجّهي", d: "الخرطوم نحو قاعدة اللهب", why: "بعد سحب المسمار، وجّهي الخرطوم نحو قاعدة اللهب لا نحو أعلاه." },
  { t: "اضغطي", d: "على المقبض", why: "الآن اضغطي على المقبض لإطلاق مادة الإطفاء." },
  { t: "حرّكي", d: "الخرطوم يميناً ويساراً", why: "أخيراً حرّكي الخرطوم يميناً ويساراً حتى ينطفئ اللهب تماماً." },
];

export function ExtChallenge({ api }) {
  const [bad, setBad] = useState([]);
  const [ok, setOk] = useState(false);
  return (
    <div className="grid grid-cols-3 gap-3" data-testid="ext-challenge">
      {EXT.map((e, i) => (
        <motion.button key={e.name} type="button" whileHover={{ y: -6 }} whileTap={{ scale: 0.96 }} disabled={ok || bad.includes(i)} data-testid={`ext-option-${i}`}
          onClick={() => { audio.sfx("click"); if (e.ok) { setOk(true); api.right(e.why); } else { setBad([...bad, i]); api.wrong(e.why); } }}
          className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center ${ok && e.ok ? "border-emerald-400 bg-emerald-500/15" : bad.includes(i) ? "border-red-400/50 opacity-50" : "border-white/15 bg-white/[.04]"}`}>
          <div className="relative h-24 w-10 rounded-t-full rounded-b-lg border-2 border-white/20 shadow-inner" style={{ background: `linear-gradient(90deg, #7f1d1d, #dc2626 45%, #991b1b)` }}>
            <span className="absolute inset-x-1 top-8 rounded-sm py-1 text-[9px] font-bold text-white" style={{ background: e.color }}>{e.tag}</span>
          </div>
          <e.icon size={18} className="text-[var(--gold-hi)]" />
          <span className="text-xs font-bold leading-snug sm:text-sm">{e.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function OrderChallenge({ api }) {
  const cards = useMemo(() => shuffle(STEPS.map((s, i) => ({ ...s, i }))), []);
  const [got, setGot] = useState([]);
  const tap = (c) => {
    if (got.includes(c.i)) return;
    if (c.i === got.length) {
      audio.sfx("pop");
      const ng = [...got, c.i]; setGot(ng);
      if (ng.length === STEPS.length) api.right("أحسنتِ! اسحبي، وجّهي، اضغطي، حرّكي — انطفأ الحريق.");
    } else api.wrong(STEPS[got.length].why);
  };
  return (
    <div data-testid="order-challenge">
      <div className="mb-3 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-dashed border-[var(--gold)]/40 p-2">
        <span className="text-xs text-slate-400">الترتيب الذي اخترتِه:</span>
        {got.map((i, k) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-emerald-500/25 px-3 py-1 text-sm font-bold text-emerald-200">{k + 1}. {STEPS[i].t}</motion.span>)}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <button key={c.i} type="button" onClick={() => tap(c)} disabled={got.includes(c.i)} data-testid={`order-step-${c.i}`}
            className={`opt rounded-xl border p-3 text-right ${got.includes(c.i) ? "border-emerald-400/50 bg-emerald-500/10 opacity-50" : "border-white/15 bg-white/[.04]"}`}>
            <p className="font-display text-lg font-bold text-[var(--gold-hi)]">{c.t}</p>
            <p className="text-xs text-slate-300">{c.d}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
