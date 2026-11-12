import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, RotateCw, Trophy, X, Smartphone } from "lucide-react";
import { LEVELS } from "@/game/levels";
import { toAr, useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { TopBar } from "@/components/game/TopBar";
import { Stars } from "@/components/game/Stars";
import { Subtitle } from "@/components/game/Subtitle";
import { Progress } from "@/components/ui/progress";

const POS = [[70, 46], [44, 34], [87, 42], [50, 53], [66, 67], [28, 58], [44, 82], [14, 66]];
const pathD = POS.map(([x, y], i) => (i ? `S ${(x + POS[i - 1][0]) / 2} ${(y + POS[i - 1][1]) / 2 + (i % 2 ? -10 : 10)} ${x} ${y}` : `M ${x} ${y}`)).join(" ");

export default function MapScreen() {
  const { st, stats } = useGame();
  const nav = useNavigate();
  const [sel, setSel] = useState(stats.current);
  const [hero, setHero] = useState(stats.current);
  const [hint, setHint] = useState(true);
  const scroller = useRef(null);
  useEffect(() => { audio.ambience("calm"); audio.music("calm"); }, []);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth * POS[sel - 1][0]) / 100 - el.clientWidth / 2;
  }, [sel]);

  const status = (l) => (st.levels[l.id]?.done ? "done" : l.id === 1 || st.levels[l.id - 1]?.done ? "open" : "locked");
  const L = LEVELS.find((l) => l.id === sel);
  const go = (l) => {
    audio.sfx("whoosh"); setHero(l.id);
    setTimeout(() => nav(`/level/${l.id}`), 900);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[var(--ink)]" data-testid="map-screen">
      <div className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-[var(--ink)]/90 to-transparent"><TopBar title="خريطة المغامرة" showMap={false} /></div>

      <img src="/scenes/worldmap.webp" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
      <div className="no-scrollbar relative min-h-0 flex-1 scroll-smooth overflow-x-auto overflow-y-hidden" dir="ltr" data-testid="map-scroll" ref={scroller}>
        <div className="relative mx-auto h-full shadow-[0_0_80px_rgba(0,0,0,.8)]" style={{ aspectRatio: "1264 / 848" }}>
          <img src="/scenes/worldmap.webp" alt="خريطة مدرسة رقية ومحيطها" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 vignette" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={pathD} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 9 }} />
            <path d={pathD} fill="none" stroke="#f3e5ab" strokeDasharray="10 9" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} opacity=".85" />
          </svg>
          {LEVELS.map((l, i) => {
            const s = status(l), r = st.levels[l.id];
            return (
              <button key={l.id} type="button" onClick={() => { audio.sfx("pop"); setSel(l.id); }} data-testid={`map-node-${l.id}`} aria-label={`المرحلة ${l.ordinal}: ${l.title}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i][0]}%`, top: `${POS[i][1]}%` }}>
                {s === "open" && <span className="pulse-ring" />}
                <span className={`relative grid size-16 place-items-center overflow-hidden rounded-full border-[3px] transition-transform duration-300 group-hover:scale-110 sm:size-20 ${sel === l.id ? "ring-4 ring-[var(--sky)]/70" : ""} ${s === "done" ? "border-[var(--gold)] shadow-[0_0_24px_rgba(212,175,55,.6)]" : s === "open" ? "border-[var(--gold-hi)] bg-[var(--oman-red)]" : "border-slate-500 bg-slate-800/90 grayscale"}`}>
                  {s === "done" ? <img src={`/badges/b${l.id}.webp`} alt="" className="h-full w-full object-cover" />
                    : s === "locked" ? <Lock size={22} className="text-slate-400" /> : <span className="font-display text-2xl font-black text-white">{toAr(l.id)}</span>}
                </span>
                <span className="mt-1 block whitespace-nowrap rounded-full bg-black/70 px-2.5 py-0.5 text-center font-display text-[11px] font-bold text-slate-100 backdrop-blur-sm" dir="rtl">{l.place}</span>
                {r?.done && <span className="mt-0.5 flex justify-center"><Stars n={r.stars} size={12} /></span>}
              </button>
            );
          })}
          <motion.div className="pointer-events-none absolute z-10 h-24 w-16 -translate-x-1/2 sm:h-28" data-testid="map-hero-token"
            animate={{ left: `${POS[hero - 1][0]}%`, top: `calc(${POS[hero - 1][1]}% - 7.5rem)` }} transition={{ duration: 0.9, ease: "easeInOut" }}>
            <img src={hero === stats.current ? "/chars/hero-idle.webp" : "/chars/hero-run.webp"} alt="" className="pose-idle h-full w-auto drop-shadow-[0_8px_10px_rgba(0,0,0,.7)]" />
          </motion.div>
        </div>
      </div>

      <div className="glass absolute right-3 top-16 z-30 flex items-center gap-3 rounded-full px-3 py-1.5 text-xs sm:hidden" data-testid="map-mobile-progress">
        <span>{toAr(stats.done)}/{toAr(stats.total)} مراحل</span><span>★ {toAr(stats.stars)}</span><span>{toAr(stats.xp)} XP</span>
        {stats.done === stats.total && <button type="button" onClick={() => nav("/results")} className="font-bold text-[var(--gold)]" data-testid="map-mobile-results-button">النتائج</button>}
      </div>
      <AnimatePresence>
        {hint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-3 top-28 z-30 flex items-center gap-2 rounded-xl bg-black/70 p-2.5 text-xs text-slate-200 backdrop-blur sm:hidden portrait:flex landscape:hidden">
            <Smartphone size={16} className="rotate-90 text-[var(--gold)]" /> للحصول على أفضل تجربة أديري جهازكِ أفقياً، أو اسحبي الخريطة جانبياً.
            <button type="button" aria-label="إغلاق" onClick={() => setHint(false)} className="mr-auto" data-testid="rotate-hint-close"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 p-3 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="glass pointer-events-auto hidden rounded-2xl p-4 sm:block lg:w-80" data-testid="map-progress-card">
          <p className="font-display text-sm font-bold text-[var(--gold-hi)]">{st.name ? `السفيرة ${st.name}` : "سفيرة السلامة"} {st.cls && <span className="text-xs text-slate-400">· {st.cls}</span>}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-300"><span>التقدّم العام</span><span data-testid="map-progress-text">{toAr(stats.done)} / {toAr(stats.total)} مراحل</span></div>
          <Progress value={(stats.done / stats.total) * 100} className="mt-1.5 h-2 bg-white/10" />
          <div className="mt-2 flex justify-between text-xs"><span>★ {toAr(stats.stars)} / ٢٤</span><span>{toAr(stats.xp)} XP</span><span>🏅 {toAr(st.achievements.length)}</span></div>
          {stats.done === stats.total && <button type="button" onClick={() => nav("/results")} className="btn-gold mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm" data-testid="map-results-button"><Trophy size={16} /> النتائج والشهادة</button>}
        </div>
        {L && (
          <motion.div key={L.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-strong pointer-events-auto rounded-2xl p-4 sm:p-5 lg:w-[440px]" data-testid="level-preview-card">
            <div className="flex gap-4">
              <img src={L.scene.img} alt="" className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-bold text-[var(--gold)]">المرحلة {L.ordinal} · {L.place}</p>
                <h3 className="font-display text-lg font-black leading-snug">{L.title}</h3>
                <p className="mt-1 text-xs text-slate-300">{L.objective}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Stars n={st.levels[L.id]?.stars || 0} size={16} testId="preview-stars" />
              {status(L) === "locked" ? <span className="flex items-center gap-1 text-xs text-slate-400"><Lock size={13} /> أكملي المرحلة السابقة أولاً</span> : (
                <button type="button" onClick={() => go(L)} className="btn-gold flex items-center gap-2 rounded-full px-6 py-2.5 text-sm" data-testid="play-level-button">
                  {status(L) === "done" ? <><RotateCw size={15} /> إعادة اللعب</> : <><Play size={15} /> انطلقي</>}
                </button>)}
            </div>
          </motion.div>
        )}
      </div>
      {!st.levels[1]?.done && <div className="sr-only"><Subtitle id="map-hello" /></div>}
    </div>
  );
}
