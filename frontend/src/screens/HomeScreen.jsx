import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clapperboard, Map as MapIcon, Sword } from "lucide-react";
import { useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { SceneView } from "@/components/game/SceneView";
import { Input } from "@/components/ui/input";

export default function HomeScreen() {
  const { st, update, stats } = useGame();
  const nav = useNavigate();
  const [name, setName] = useState(st.name);
  const [cls, setCls] = useState(st.cls);
  const started = stats.done > 0 || st.introSeen;
  const start = (to) => {
    audio.unlock(); audio.sfx("click");
    update({ name: name.trim(), cls: cls.trim() });
    nav(to);
  };
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[var(--ink)]" data-testid="home-screen" onPointerDown={() => audio.unlock()}>
      <SceneView img="/scenes/keyart.webp" fx="rain" />
      <div className="absolute inset-0 bg-gradient-to-l from-[rgba(5,9,22,.96)] via-[rgba(5,9,22,.6)] to-transparent" />
      <div className="relative z-10 flex min-h-full items-center px-5 py-10 sm:px-12 lg:px-20">
        <div className="w-full max-w-xl">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-xs font-bold text-[var(--gold)] sm:text-sm">لعبة مغامرات تعليمية · سلطنة عُمان</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8 }} className="foil mt-3 font-display text-5xl font-black leading-[1.15] sm:text-6xl lg:text-7xl" data-testid="game-title">سفيرة السلامة</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 font-display text-lg font-bold text-slate-100 md:text-2xl">مواجهة النينو في مدرسة رقية للبنات</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-4 max-w-md text-base leading-relaxed text-slate-300">ثماني مهمات سينمائية في وجه العاصفة. اكتشفي الأخطار، اتخذي القرارات، واجمعي الأختام الرسمية والشارات حتى تنالي «شارة سفيرة السلامة».</motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass mt-8 rounded-2xl p-5" data-testid="registration-card">
            <p className="mb-3 font-display text-sm font-bold text-[var(--gold-hi)]">بيانات جواز السفر والشهادة</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-slate-400">اسم الطالبة
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="مثال: مريم سالم" className="mt-1 h-11 border-white/15 bg-black/30 text-base text-white" data-testid="student-name-input" />
              </label>
              <label className="block text-xs text-slate-400">الصف / الشعبة
                <Input value={cls} onChange={(e) => setCls(e.target.value)} maxLength={20} placeholder="مثال: ١١-٢" className="mt-1 h-11 border-white/15 bg-black/30 text-base text-white" data-testid="student-class-input" />
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => start(started ? "/map" : "/intro")} className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-4 text-lg" data-testid="start-adventure-button">
                <Sword size={20} /> {started ? "تابعي المغامرة" : "ابدئي المغامرة"}
              </button>
              {started && <button type="button" onClick={() => start("/intro")} className="btn-ghost flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm" data-testid="replay-intro-button"><Clapperboard size={16} /> المقدّمة</button>}
              {!started && <button type="button" onClick={() => { update({ introSeen: true }); start("/map"); }} className="btn-ghost flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm" data-testid="skip-to-map-button"><MapIcon size={16} /> الخريطة مباشرة</button>}
            </div>
          </motion.div>
          <p className="mt-6 text-xs text-slate-500">مدرسة رقية للبنات (١٠-١٢) · فريق الأمن والسلامة · رقم الطوارئ في سلطنة عُمان ٩٩٩٩ · يُفضّل استخدام سماعات الرأس</p>
        </div>
      </div>
    </div>
  );
}
