import * as Icons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACHIEVEMENTS, COLLECTIBLES, LEVELS } from "@/game/levels";
import { fmtDate, toAr, useGame } from "@/game/store";
import { Stars } from "./Stars";

export function StampMark({ level, date, size = 72 }) {
  const s = level.stamp;
  return (
    <div className="inline-flex flex-col items-center" style={{ transform: `rotate(${s.tilt}deg)` }} data-testid={`stamp-${level.id}`}>
      <img src={`/badges/b${level.id}.webp`} alt="" className="rounded-full object-cover drop-shadow-[0_4px_6px_rgba(0,0,0,.35)]" style={{ width: size, height: size }} />
      <div className="-mt-1 rounded-md border-2 px-2 py-0.5 text-center font-display text-[11px] font-bold leading-snug" style={{ color: s.ink, borderColor: s.ink }}>
        <span className="block">{s.title}</span>
        {date && <span className="block font-mono-num text-[9px] font-medium">{date}</span>}
      </div>
    </div>
  );
}

export const Ico = ({ name, ...p }) => { const I = Icons[name] || Icons.Star; return <I {...p} />; };

export function PassportDialog({ open, onOpenChange }) {
  const { st, stats } = useGame();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="leather max-h-[92dvh] max-w-3xl overflow-y-auto border-4 border-[#5c3a21] p-0 text-slate-100 thin-scroll" data-testid="passport-dialog">
        <div className="p-5 sm:p-7">
          <DialogHeader className="text-right">
            <DialogTitle className="foil font-doc text-3xl font-bold">جواز سفر الأمن والسلامة</DialogTitle>
            <DialogDescription className="text-[var(--gold-hi)]/70">مدرسة رقية للبنات · سلطنة عُمان</DialogDescription>
          </DialogHeader>
          <div className="paper mt-4 grid grid-cols-3 gap-3 rounded-xl p-4 text-sm sm:grid-cols-6">
            {[["الاسم", st.name || "—"], ["الصف", st.cls || "—"], ["الأختام", `${toAr(stats.done)} / ${toAr(stats.total)}`], ["النجوم", `${toAr(stats.stars)} / ٢٤`], ["نقاط الخبرة", toAr(stats.xp)], ["الأدوات", `${toAr(st.collected.length)} / ٨`]].map(([k, v]) => (
              <div key={k}><p className="text-[11px] text-[#8a6a2a]">{k}</p><p className="truncate font-display font-bold" data-testid={`passport-${k}`}>{v}</p></div>
            ))}
          </div>
          <Tabs defaultValue="stamps" className="mt-4" dir="rtl">
            <TabsList className="grid w-full grid-cols-3 bg-black/30">
              <TabsTrigger value="stamps" data-testid="passport-tab-stamps">الأختام</TabsTrigger>
              <TabsTrigger value="ach" data-testid="passport-tab-achievements">الإنجازات</TabsTrigger>
              <TabsTrigger value="items" data-testid="passport-tab-items">أدوات السلامة</TabsTrigger>
            </TabsList>
            <TabsContent value="stamps">
              <div className="paper grid grid-cols-2 gap-4 rounded-xl p-4 sm:grid-cols-4">
                {LEVELS.map((l) => {
                  const r = st.levels[l.id];
                  return (
                    <div key={l.id} className="flex min-h-[150px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#b99a5a]/60 p-2">
                      {r?.done ? (<><StampMark level={l} date={fmtDate(r.date)} /><Stars n={r.stars} size={13} /></>) : (
                        <p className="text-center text-xs text-[#8a6a2a]">المرحلة {l.ordinal}<br />بانتظار الختم</p>)}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="ach">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ACHIEVEMENTS.map((a) => {
                  const on = st.achievements.includes(a.id);
                  return (
                    <div key={a.id} className={`flex items-center gap-3 rounded-xl p-3 ${on ? "bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/50" : "bg-black/25 opacity-60"}`} data-testid={`achievement-${a.id}`}>
                      <span className={`grid size-10 place-items-center rounded-full ${on ? "bg-[var(--gold)] text-[#1a1203]" : "bg-white/10 text-slate-400"}`}><Ico name={on ? a.icon : "Lock"} size={18} /></span>
                      <div><p className="font-display text-sm font-bold">{a.title}</p><p className="text-xs text-slate-300">{a.desc}</p></div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="items">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LEVELS.map((l) => {
                  const c = COLLECTIBLES[l.id], on = st.collected.includes(l.id);
                  return (
                    <div key={l.id} className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center ${on ? "bg-[var(--sky)]/15 ring-1 ring-[var(--sky)]/40" : "bg-black/25 opacity-55"}`} data-testid={`collectible-card-${l.id}`}>
                      <Ico name={on ? c.icon : "HelpCircle"} size={26} className={on ? "text-[var(--sky)]" : "text-slate-500"} />
                      <p className="text-xs font-bold">{on ? c.name : "مخفية في " + l.place}</p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
