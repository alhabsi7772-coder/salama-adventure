import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lightbulb, Target, Map as MapIcon, Trophy } from "lucide-react";
import { COLLECTIBLES, LEVELS, LINES } from "@/game/levels";
import { toast } from "sonner";
import { useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { SceneView } from "@/components/game/SceneView";
import { TopBar } from "@/components/game/TopBar";
import { Subtitle } from "@/components/game/Subtitle";
import { Dialogue } from "@/components/game/Dialogue";
import { Character, Portrait } from "@/components/game/Character";
import { Feedback } from "@/components/game/Feedback";
import { RewardOverlay } from "@/components/game/RewardOverlay";
import { Ico } from "@/components/game/PassportDialog";
import { ChoiceChallenge } from "@/components/game/challenges/ChoiceChallenge";
import { HotspotChallenge } from "@/components/game/challenges/HotspotChallenge";
import { MatchChallenge } from "@/components/game/challenges/MatchChallenge";
import { DialChallenge } from "@/components/game/challenges/DialChallenge";
import { MapChallenge } from "@/components/game/challenges/MapChallenge";
import { ExtChallenge, OrderChallenge } from "@/components/game/challenges/ExtOrderChallenge";
import { TimedChallenge } from "@/components/game/challenges/TimedChallenge";
import { KitChallenge } from "@/components/game/challenges/KitChallenge";

const CH = { choice: ChoiceChallenge, hotspot: HotspotChallenge, match: MatchChallenge, dial: DialChallenge, map: MapChallenge, ext: ExtChallenge, order: OrderChallenge, timed: TimedChallenge, kit: KitChallenge };
const KIND = { choice: "قرار حاسم", hotspot: "اكتشفي الأخطار", match: "طابقي الإجابات", dial: "اتصال طوارئ", map: "مخطط الإخلاء", ext: "اختاري الأداة", order: "رتّبي الخطوات", timed: "تحدّي الوقت", kit: "اسحبي وأفلتي" };
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
const ENCOURAGE = ["لا بأس، كل سفيرة تتعلّم من أخطائها.", "فكّري بهدوء، أنتِ قادرة على ذلك.", "حاولي مرة أخرى، الإجابة الآمنة قريبة."];

export default function LevelScreen() {
  const { id } = useParams();
  const level = LEVELS.find((l) => l.id === Number(id));
  const { st, complete } = useGame();
  const nav = useNavigate();
  const [phase, setPhase] = useState("card");
  const [si, setSi] = useState(0);
  const [fb, setFb] = useState(null);
  const [pose, setPose] = useState("idle");
  const [shake, setShake] = useState(0);
  const [narrDone, setNarrDone] = useState(false);
  const [got, setGot] = useState(false);
  const [result, setResult] = useState(null);
  const stats = useRef({ mistakes: 0, hints: 0, hotDirty: false, timedFirst: false });
  const poseT = useRef(0);
  const siRef = useRef(0);
  siRef.current = si;

  const unlocked = level && (level.id === 1 || st.levels[level.id - 1]?.done || st.levels[level.id]?.done);

  useEffect(() => {
    if (!level) return;
    setPhase("card"); setSi(0); setFb(null); setGot(false); setResult(null); setPose("idle");
    stats.current = { mistakes: 0, hints: 0, hotDirty: false, timedFirst: false };
    audio.sfx("whoosh");
    LEVELS.find((l) => l.id === level.id + 1) && [level.action.img, LEVELS[level.id]?.scene.img].forEach((s) => { if (s) { const i = new Image(); i.src = s; } });
    audio.preload([level.scene.line, level.mentor, ...level.steps.map((s) => s.prompt), level.action.line, level.tip, level.stamp.line]);
    const t = setTimeout(() => setPhase((p) => (p === "card" ? "scene" : p)), 3200);
    return () => clearTimeout(t);
  }, [level]);

  const amb = phase === "result" || phase === "reward" ? "calm" : level?.scene.amb;
  useEffect(() => { if (amb) audio.ambience(amb); }, [amb]);
  useEffect(() => { audio.music(phase === "play" ? "tension" : phase === "reward" ? "victory" : phase === "result" ? "calm" : "think"); }, [phase]);
  useEffect(() => { setNarrDone(false); }, [phase, si]);

  const flashPose = useCallback((p, ms) => { clearTimeout(poseT.current); setPose(p); poseT.current = setTimeout(() => setPose("think"), ms); }, []);

  const api = useMemo(() => ({
    right: (why) => {
      audio.sfx("right"); audio.speak(pickOne(["ok-1", "ok-2", "ok-3"])); flashPose("cheer", 1800);
      setFb({ k: Date.now(), type: "ok", title: "تصرّف صحيح!", text: why || "أحسنتِ." });
      setTimeout(() => {
        setFb(null);
        if (siRef.current < level.steps.length - 1) setSi(siRef.current + 1); else setPhase("result");
      }, 2600);
    },
    wrong: (why) => {
      stats.current.mistakes += 1; audio.sfx("wrong"); audio.speak(pickOne(["no-1", "no-2", "no-3"])); flashPose("sad", 2000); setShake((s) => s + 1);
      setFb({ k: Date.now(), type: "no", title: "ليس هذا هو التصرّف الآمن", text: why, extra: pickOne(ENCOURAGE) });
    },
    partial: (text) => { audio.sfx("pop"); flashPose("cheer", 900); setFb({ k: Date.now(), type: "info", title: "اكتشاف صحيح", text }); },
    hint: () => { stats.current.hints += 1; },
    flag: (f) => { if (f === "hotDirty") stats.current.hotDirty = true; if (f === "timedFirst") stats.current.timedFirst = true; },
  }), [level, flashPose]);

  if (!level) return <Navigate to="/map" replace />;
  if (!unlocked) return <Navigate to="/map" replace />;

  const step = level.steps[si];
  const hasHot = level.steps.some((s) => s.kind === "hotspot");
  const finish = () => {
    audio.sfx("click");
    const r = complete(level.id, { mistakes: stats.current.mistakes, hints: stats.current.hints, collected: got, hotClean: hasHot && !stats.current.hotDirty, timedFirst: stats.current.timedFirst });
    setResult(r); setPhase("reward");
  };
  const img = phase === "result" || phase === "reward" ? level.action.img : phase === "play" && step.shot ? step.shot : level.scene.img;
  const fx = phase === "result" || phase === "reward" ? level.action.fx : level.scene.fx;
  const col = COLLECTIBLES[level.id];
  const next = LEVELS.find((l) => l.id === level.id + 1);
  const Challenge = CH[step.kind];

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--ink)] lg:block" data-testid="level-screen">
      <div className={`relative shrink-0 transition-[height] duration-700 lg:absolute lg:inset-0 lg:h-auto ${phase === "play" ? "h-[30dvh]" : "h-full"}`}>
        <SceneView img={img} fx={fx} dim={phase === "play"} shake={phase === "play" ? shake : 0}>
          {["scene", "brief", "play"].includes(phase) && !got && (
            <button type="button" aria-label={`أداة مخفية: ${col.name}`} data-testid="collectible-item"
              onClick={(e) => { e.stopPropagation(); setGot(true); audio.sfx("collect"); toast.success("وجدتِ أداة سلامة مخفية!", { description: `${col.name} — ستُضاف إلى مجموعتكِ مع +٣٠ XP عند إكمال المرحلة.` }); }}
              className="collectible absolute z-20 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--gold)]/25 text-[var(--gold-hi)] opacity-80 shadow-[0_0_18px_rgba(243,229,171,.7)] ring-1 ring-[var(--gold-hi)]/70 transition-opacity hover:opacity-100"
              style={{ left: `${col.x}%`, top: `${col.y}%` }}>
              <Ico name={col.icon} size={18} />
            </button>
          )}
        </SceneView>
        <div className="absolute inset-x-0 top-0 z-30"><TopBar title={phase === "card" ? "" : `المرحلة ${level.ordinal} · ${level.title}`} /></div>
        {phase === "play" && <Character pose={pose} className="absolute bottom-0 left-[4%] z-10 hidden h-[62vh] lg:block" />}
      </div>

      <AnimatePresence mode="wait">
        {phase === "card" && (
          <motion.button key="card" type="button" onClick={() => setPhase("scene")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 px-6 text-center" data-testid="level-title-card">
            <motion.div initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ duration: 1 }} className="absolute inset-x-0 top-0 h-1/2 origin-top bg-black" />
            <motion.div initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ duration: 1 }} className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-black" />
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="font-display text-sm font-bold text-[var(--gold)]">المرحلة {level.ordinal} · {level.place}</motion.p>
            <motion.h1 initial={{ y: 30, opacity: 0, scale: 1.08 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.9 }} className="foil mt-3 font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{level.title}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-3 text-base text-slate-300 md:text-lg">{level.sub}</motion.p>
          </motion.button>
        )}

        {phase === "scene" && (
          <motion.div key="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-6">
            <div className="glass-strong mx-auto max-w-4xl rounded-2xl p-5 sm:p-6" data-testid="scene-narration">
              <p className="mb-2 font-display text-xs font-bold text-[var(--gold)]">الراوية</p>
              <Subtitle id={level.scene.line} onDone={() => setNarrDone(true)} className="text-lg leading-loose text-slate-50 sm:text-xl" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">{got ? "✓ وجدتِ أداة السلامة المخفية" : "تلميح: هناك أداة سلامة مخفية تلمع في المشهد…"}</p>
                <button type="button" onClick={() => { audio.sfx("click"); setPhase("brief"); }} data-testid="scene-continue-button"
                  className={`${narrDone ? "btn-gold" : "btn-ghost"} flex items-center gap-1 rounded-full px-6 py-2.5 text-sm font-bold`}>متابعة <ChevronLeft size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "brief" && (
          <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-end p-3 sm:p-6">
            <Character who="mentor" className="pointer-events-none absolute bottom-0 left-[3%] hidden h-[70vh] md:block" talking={!narrDone} />
            <div className="relative mx-auto w-full max-w-3xl md:mr-[8%] md:ml-auto">
              <Dialogue who="mentor" line={level.mentor} onDone={() => setNarrDone(true)}>
                <div className="flex flex-col gap-3 rounded-xl bg-[var(--gold)]/10 p-3 ring-1 ring-[var(--gold)]/30 sm:flex-row sm:items-center sm:justify-between" data-testid="mission-objective">
                  <p className="flex items-start gap-2 text-sm"><Target size={18} className="mt-0.5 shrink-0 text-[var(--gold)]" /><span><b className="font-display text-[var(--gold-hi)]">هدف المهمة: </b>{level.objective}</span></p>
                  <button type="button" onClick={() => { audio.sfx("whoosh"); setPose("think"); setPhase("play"); }} className="btn-gold shrink-0 rounded-full px-6 py-2.5 text-sm" data-testid="start-challenge-button">ابدئي التحدّي</button>
                </div>
              </Dialogue>
            </div>
          </motion.div>
        )}

        {phase === "play" && (
          <motion.aside key={`play-${si}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="glass-strong relative z-20 min-h-0 flex-1 overflow-y-auto p-4 thin-scroll sm:p-6 lg:absolute lg:bottom-4 lg:right-4 lg:top-20 lg:w-[560px] lg:rounded-3xl" data-testid="challenge-panel">
            <div className="mb-3 flex items-center gap-3">
              <div className="lg:hidden"><Portrait pose={pose} size={48} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-bold text-[var(--gold)]" data-testid="challenge-kind">{KIND[step.kind]}</p>
                <div className="mt-1 flex gap-1.5">{level.steps.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < si ? "bg-emerald-400" : k === si ? "bg-[var(--gold)]" : "bg-white/15"}`} />)}</div>
              </div>
            </div>
            <Subtitle id={step.prompt} className="mb-4 font-display text-lg font-bold leading-relaxed text-white sm:text-xl" testId="challenge-prompt" />
            <Challenge key={`${level.id}-${si}`} step={step} api={api} />
            <Feedback fb={fb} />
          </motion.aside>
        )}

        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-6">
            <div className="glass-strong mx-auto max-w-4xl rounded-2xl p-5 sm:p-6" data-testid="result-panel">
              <p className="mb-2 font-display text-xs font-bold text-emerald-300">نجحت المهمة</p>
              <Subtitle id={level.action.line} onDone={() => setNarrDone(true)} className="text-lg leading-loose text-slate-50" />
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--sky)]/10 p-3 ring-1 ring-[var(--sky)]/30" data-testid="lesson-takeaway">
                <Lightbulb size={20} className="mt-0.5 shrink-0 text-[var(--sky)]" />
                <p className="text-sm leading-relaxed"><b className="font-display text-[var(--sky)]">الدرس المستفاد: </b>{LINES[level.tip]}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={finish} className="btn-gold rounded-full px-7 py-3 text-sm" data-testid="claim-stamp-button">استلمي الختم والمكافأة</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "reward" && result && (
        <RewardOverlay level={level} result={result} collected={got}>
          {next ? (
            <button type="button" onClick={() => { audio.sfx("click"); nav(`/level/${next.id}`); }} className="btn-gold rounded-full px-7 py-3" data-testid="next-level-button">المرحلة التالية</button>
          ) : (
            <button type="button" onClick={() => { audio.sfx("click"); nav("/results"); }} className="btn-gold flex items-center justify-center gap-2 rounded-full px-7 py-3" data-testid="final-results-button"><Trophy size={18} /> النتائج النهائية</button>
          )}
          <button type="button" onClick={() => { audio.sfx("click"); nav("/map"); }} className="btn-ghost flex items-center justify-center gap-2 rounded-full px-6 py-3" data-testid="back-to-map-button"><MapIcon size={16} /> الخريطة</button>
        </RewardOverlay>
      )}
    </div>
  );
}
