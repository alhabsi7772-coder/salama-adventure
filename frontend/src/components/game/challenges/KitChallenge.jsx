import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Backpack, Bandage, Candy, Flashlight, Gamepad2, Headphones, PillBottle, Snowflake, SprayCan, Volleyball, Layers } from "lucide-react";
import { audio } from "@/game/audio";
import { toAr } from "@/game/store";
import { shuffle } from "./ChoiceChallenge";

const ITEMS = [
  { id: "band", name: "ضمادات جروح", icon: Bandage, ok: true },
  { id: "anti", name: "مطهرات طبية", icon: PillBottle, ok: true },
  { id: "ice", name: "أكياس ثلج", icon: Snowflake, ok: true },
  { id: "light", name: "كشاف ضوئي", icon: Flashlight, ok: true },
  { id: "blanket", name: "بطانية إغاثة خفيفة", icon: Layers, ok: true },
  { id: "game", name: "لعبة إلكترونية", icon: Gamepad2, why: "اللعبة للتسلية فقط، ولا تفيد في الطوارئ." },
  { id: "candy", name: "حلوى", icon: Candy, why: "الحلوى ليست من مستلزمات الإسعاف." },
  { id: "perf", name: "عطر", icon: SprayCan, why: "العطر ليس مطهراً طبياً، وقد يكون قابلاً للاشتعال." },
  { id: "head", name: "سماعات", icon: Headphones, why: "السماعات تحجب عنكِ التعليمات والتنبيهات." },
  { id: "ball", name: "كرة", icon: Volleyball, why: "مكان الكرة في الملعب، لا في حقيبة الطوارئ." },
];

export function KitChallenge({ api }) {
  const items = useMemo(() => shuffle(ITEMS), []);
  const [inBag, setInBag] = useState([]);
  const [shakeId, setShakeId] = useState(null);
  const [over, setOver] = useState(false);
  const bag = useRef(null);
  const need = ITEMS.filter((i) => i.ok).length;

  const drop = (it) => {
    if (inBag.includes(it.id)) return;
    if (it.ok) {
      audio.sfx("pop");
      const nb = [...inBag, it.id]; setInBag(nb);
      if (nb.length === need) api.right("الحقيبة جاهزة لكل الظروف! كل غرض فيها له دور في الإسعاف أو الإضاءة أو التدفئة.");
      else api.partial(`«${it.name}» غرض ضروري للطوارئ.`);
    } else { setShakeId(`${it.id}-${Date.now()}`); api.wrong(it.why); }
  };
  const overBag = (pt) => {
    const r = bag.current?.getBoundingClientRect();
    return r && pt.x >= r.left - 20 && pt.x <= r.right + 20 && pt.y >= r.top - 20 && pt.y <= r.bottom + 20;
  };

  return (
    <div data-testid="kit-challenge">
      <div ref={bag} className={`mb-3 flex items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-colors ${over ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-red-400/50 bg-red-950/30"}`} data-testid="kit-bag-dropzone">
        <Backpack size={44} className="shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold">حقيبة الطوارئ <span className="text-[var(--gold-hi)]" data-testid="kit-count">{toAr(inBag.length)} / {toAr(need)}</span></p>
          <div className="mt-1 flex flex-wrap gap-1">
            {inBag.map((id) => { const it = ITEMS.find((x) => x.id === id); return <motion.span key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[11px] text-emerald-100">{it.name}</motion.span>; })}
            {!inBag.length && <span className="text-xs text-slate-400">اسحبي الأغراض إلى هنا أو اضغطي عليها</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {items.map((it) => {
          const used = inBag.includes(it.id);
          return (
            <motion.button key={it.id} type="button" drag={false}
              onDrag={(e, info) => setOver(overBag({ x: e.clientX ?? info.point.x, y: e.clientY ?? info.point.y }))}
              onDragEnd={(e, info) => { setOver(false); const p = { x: e.clientX ?? info.point.x, y: e.clientY ?? info.point.y }; if (overBag(p)) drop(it); }}
              onTap={() => !used && drop(it)}
              animate={shakeId?.startsWith(it.id) ? { x: [0, -8, 8, -5, 0] } : {}} disabled={used} data-testid={`kit-item-${it.id}`}
              className={`flex touch-none flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${used ? "border-emerald-400/40 bg-emerald-500/10 opacity-40" : "border-white/15 bg-white/[.05] hover:border-[var(--gold)]/60"}`}>
              <it.icon size={26} className="text-[var(--gold-hi)]" />
              <span className="text-xs font-medium leading-snug">{it.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
