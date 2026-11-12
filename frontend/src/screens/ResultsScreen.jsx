import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, BookOpenCheck, FileBadge2, Gem, Map as MapIcon, Sparkles, Star, Target } from "lucide-react";
import { ACHIEVEMENTS, LEVELS } from "@/game/levels";
import { toAr, useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { SceneView } from "@/components/game/SceneView";
import { TopBar } from "@/components/game/TopBar";
import { Stars } from "@/components/game/Stars";
import { Subtitle } from "@/components/game/Subtitle";
import { Ico } from "@/components/game/PassportDialog";

export const evaluate = (stars, done) => {
  if (done < LEVELS.length) return { t: "مغامرة قيد الإنجاز", d: "أكملي بقية المراحل لتحصلي على التقييم النهائي والشهادة." };
  if (stars >= 22) return { t: "سفيرة متميّزة", d: "أداء استثنائي! قراراتكِ كانت آمنة ودقيقة في معظم المواقف." };
  if (stars >= 16) return { t: "سفيرة متقدّمة", d: "أداء رائع! أتقنتِ أغلب إجراءات السلامة، ويمكنكِ إعادة بعض المراحل لجمع نجوم أكثر." };
  return { t: "سفيرة واعدة", d: "أحسنتِ بإكمال المهمة! راجعي الدروس المستفادة وأعيدي المراحل لتعزيز معرفتكِ." };
};

const Stat = ({ icon: I, label, value, testId, color = "var(--gold)" }) => (
  <div className="glass rounded-2xl p-4">
    <I size={20} style={{ color }} />
    <p className="mt-2 font-display text-3xl font-black" data-testid={testId}>{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
);

export default function ResultsScreen() {
  const { st, stats } = useGame();
  const nav = useNavigate();
  const ev = evaluate(stats.stars, stats.done);
  const all = stats.done === stats.total;
  const mastery = Math.round((stats.stars / 24) * 100);
  useEffect(() => { audio.music(all ? "victory" : "calm"); audio.ambience("calm"); if (all) audio.sfx("fanfare"); }, [all]);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[var(--ink)] thin-scroll" data-testid="results-screen">
      <div className="fixed inset-0"><SceneView img="/scenes/ceremony.webp" fx="sparkle" dim /></div>
      <div className="relative z-10">
        <TopBar title="النتائج النهائية" />
        <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 lg:mt-10">
            <p className="font-display text-sm font-bold text-[var(--gold)]">{all ? "اكتملت المهمة الكبرى" : "تقرير المغامرة"}</p>
            <h1 className="foil mt-2 font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl" data-testid="results-evaluation">{ev.t}</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-200 md:text-lg">{st.name ? `${st.name}، ` : ""}{ev.d}</p>
            {all && <div className="glass mt-4 max-w-3xl rounded-2xl p-4"><Subtitle id="finale" className="font-doc text-lg leading-relaxed text-[var(--gold-hi)]" /></div>}
          </motion.section>

          <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={Sparkles} label="مجموع النقاط (XP)" value={toAr(stats.xp)} testId="results-total-xp" color="var(--sky)" />
            <Stat icon={Target} label="المهمات المكتملة" value={`${toAr(stats.done)}/${toAr(stats.total)}`} testId="results-missions" />
            <Stat icon={Star} label="النجوم المكتسبة" value={`${toAr(stats.stars)}/٢٤`} testId="results-stars" />
            <Stat icon={Award} label="الإنجازات" value={`${toAr(st.achievements.length)}/${toAr(ACHIEVEMENTS.length)}`} testId="results-achievements" color="#34d399" />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="glass-strong rounded-2xl p-5 lg:col-span-3" data-testid="learning-progress">
              <h2 className="flex items-center gap-2 font-display text-base font-bold md:text-lg"><BookOpenCheck size={18} className="text-[var(--gold)]" /> مسار التعلّم · إتقان {toAr(mastery)}٪</h2>
              <div className="mt-4 space-y-2.5">
                {LEVELS.map((l) => {
                  const r = st.levels[l.id];
                  return (
                    <div key={l.id} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 truncate sm:w-56">{l.title}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${((r?.stars || 0) / 3) * 100}%` }} transition={{ duration: 1, delay: l.id * 0.08 }} className="h-full rounded-full bg-gradient-to-l from-[var(--gold-hi)] to-[var(--gold-lo)]" /></div>
                      <Stars n={r?.stars || 0} size={13} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="glass-strong rounded-2xl p-5 lg:col-span-2">
              <h2 className="flex items-center gap-2 font-display text-base font-bold md:text-lg"><Gem size={18} className="text-[var(--sky)]" /> الإنجازات المفتوحة</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ACHIEVEMENTS.map((a) => {
                  const on = st.achievements.includes(a.id);
                  return (
                    <div key={a.id} className={`flex items-center gap-2 rounded-xl p-2 text-xs ${on ? "bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/40" : "bg-black/25 opacity-50"}`}>
                      <Ico name={on ? a.icon : "Lock"} size={15} className={on ? "text-[var(--gold)]" : "text-slate-500"} /><span className="font-bold">{a.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" disabled={!all} onClick={() => { audio.sfx("click"); nav("/certificate"); }} data-testid="open-certificate-button"
              className="btn-gold flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg disabled:pointer-events-none disabled:opacity-40">
              <FileBadge2 size={20} /> {all ? "شهادة الإنجاز" : "الشهادة بعد إكمال المراحل الثماني"}
            </button>
            <button type="button" onClick={() => nav("/map")} className="btn-ghost flex items-center justify-center gap-2 rounded-full px-6 py-3" data-testid="results-map-button"><MapIcon size={16} /> العودة للخريطة</button>
          </section>
        </main>
      </div>
    </div>
  );
}
