import { memo, useMemo } from "react";

const rnd = (i, s) => ((Math.sin(i * 9301 + s * 49297) + 1) / 2);

const Drops = ({ n = 70, speed = 0.7 }) => Array.from({ length: n }, (_, i) => (
  <span key={i} className="drop" style={{ left: `${rnd(i, 1) * 110}%`, animationDuration: `${speed + rnd(i, 2) * 0.5}s`, animationDelay: `${-rnd(i, 3) * 2}s`, opacity: 0.35 + rnd(i, 4) * 0.5 }} />
));
const Streaks = ({ n = 16 }) => Array.from({ length: n }, (_, i) => (
  <span key={i} className="streak" style={{ top: `${rnd(i, 5) * 100}%`, animationDuration: `${1.2 + rnd(i, 6)}s`, animationDelay: `${-rnd(i, 7) * 3}s` }} />
));
const Smoke = ({ n = 12 }) => Array.from({ length: n }, (_, i) => (
  <span key={i} className="smoke" style={{ left: `${rnd(i, 8) * 100}%`, top: `${rnd(i, 9) * 50}%`, width: `${18 + rnd(i, 10) * 18}vmin`, height: `${18 + rnd(i, 10) * 18}vmin`, animationDuration: `${7 + rnd(i, 11) * 6}s`, animationDelay: `${-rnd(i, 12) * 8}s` }} />
));
const Embers = ({ n = 26 }) => Array.from({ length: n }, (_, i) => (
  <span key={i} className="ember" style={{ left: `${rnd(i, 13) * 100}%`, animationDuration: `${4 + rnd(i, 14) * 5}s`, animationDelay: `${-rnd(i, 15) * 6}s` }} />
));
const Motes = ({ n = 30, sparkle }) => Array.from({ length: n }, (_, i) => (
  <span key={i} className={sparkle ? "spark" : "mote"} style={{ left: `${rnd(i, 16) * 100}%`, top: `${rnd(i, 17) * 100}%`, animationDuration: `${3 + rnd(i, 18) * 4}s`, animationDelay: `${-rnd(i, 19) * 4}s` }} />
));

const FX = {
  rain: () => <><Drops /><div className="flash" /></>,
  drip: () => <><Drops n={26} speed={1.3} /><div className="flash" /></>,
  drizzle: () => <Drops n={30} speed={1.1} />,
  storm: () => <><Drops n={110} speed={0.5} /><Streaks n={8} /><div className="flash" /></>,
  wind: () => <><Streaks /><Drops n={40} speed={0.45} /><div className="flash" /></>,
  smoke: () => <><Smoke /><div className="alarm-glow" /></>,
  embers: () => <><Embers /><Smoke n={5} /></>,
  heat: () => <><div className="heat" /><Motes n={18} /></>,
  mist: () => <Smoke n={8} />,
  dust: () => <Motes />,
  sparkle: () => <Motes n={26} sparkle />,
};

export const SceneFX = memo(function SceneFX({ type }) {
  const Comp = FX[type];
  return Comp ? <div className="fx" aria-hidden="true"><Comp /></div> : null;
});

export const SceneView = memo(function SceneView({ img, fx, dim = false, shake = 0, alt = "", children }) {
  const key = useMemo(() => `${img}-${shake}`, [img, shake]);
  return (
    <div className={`absolute inset-0 overflow-hidden bg-[var(--ink)] grain ${shake ? "shake" : ""}`} key={key} data-testid="scene-view">
      <img src={img} alt={alt} className="kb absolute inset-0 h-full w-full object-cover" draggable={false} />
      <SceneFX type={fx} />
      <div className={`absolute inset-0 vignette transition-opacity duration-700 ${dim ? "opacity-100" : "opacity-70"}`} />
      {dim && <div className="absolute inset-0 bg-[rgba(5,9,22,.35)]" />}
      {children}
    </div>
  );
});
