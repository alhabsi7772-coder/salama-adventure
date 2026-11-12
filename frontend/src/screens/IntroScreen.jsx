import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sword } from "lucide-react";
import { INTRO } from "@/game/levels";
import { useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { SceneView } from "@/components/game/SceneView";
import { Subtitle } from "@/components/game/Subtitle";
import { Character } from "@/components/game/Character";

export default function IntroScreen() {
  const [i, setI] = useState(0);
  const { update } = useGame();
  const nav = useNavigate();
  const s = INTRO[i], last = i === INTRO.length - 1;
  useEffect(() => { audio.unlock(); audio.music(i === 1 ? "tension" : "calm"); audio.ambience(s.amb); if (i === 1) audio.sfx("thunder"); }, [i, s.amb]);
  const end = () => { audio.sfx("whoosh"); update({ introSeen: true }); nav("/map"); };
  const advance = () => setTimeout(() => setI((k) => (k < INTRO.length - 1 ? k + 1 : k)), 1300);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black" data-testid="intro-screen">
      <AnimatePresence mode="sync">
        <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }}>
          <SceneView img={s.img} fx={s.fx} />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[9vh] bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[9vh] bg-black" />
      {i === 2 && <Character who="mentor" className="absolute bottom-[9vh] left-[6%] z-10 h-[64vh]" />}
      {i === 3 && <Character pose="cheer" className="absolute bottom-[9vh] left-[6%] z-10 h-[58vh]" />}

      <button type="button" onClick={end} className="btn-ghost absolute left-4 top-[calc(9vh+12px)] z-30 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white" data-testid="skip-intro-button">
        تخطّي <SkipForward size={15} />
      </button>
      <div className="absolute right-4 top-[calc(9vh+16px)] z-30 flex gap-1.5">
        {INTRO.map((_, k) => <span key={k} className={`h-1 w-8 rounded-full transition-colors ${k <= i ? "bg-[var(--gold)]" : "bg-white/25"}`} />)}
      </div>

      <div className="absolute inset-x-0 bottom-[9vh] z-20 p-4 sm:p-8">
        <motion.div key={`t-${i}`} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mx-auto max-w-4xl text-center md:mr-[6%] md:text-right">
          <p className="font-display text-xs font-bold text-[var(--gold)] sm:text-sm">{s.kicker}</p>
          {last && <h2 className="foil mt-2 font-display text-4xl font-black sm:text-5xl lg:text-6xl">سفيرة السلامة</h2>}
          <Subtitle id={s.line} onDone={last ? undefined : advance} className="mt-3 font-display text-xl font-bold leading-loose text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.9)] sm:text-2xl lg:text-3xl" testId="intro-subtitle" />
          {!last && <button type="button" onClick={() => setI(i + 1)} className="mt-3 text-xs text-slate-300 underline-offset-4 hover:underline" data-testid="intro-next-button">التالي</button>}
          {last && (
            <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: "spring" }} type="button" onClick={end}
              className="btn-gold mt-6 inline-flex items-center gap-3 rounded-full px-10 py-4 text-xl sm:text-2xl" data-testid="intro-start-adventure-button">
              <Sword size={24} /> ابدئي المغامرة
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
