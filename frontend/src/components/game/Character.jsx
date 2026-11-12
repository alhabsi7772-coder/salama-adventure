import { CHARS } from "@/game/levels";

export function Character({ who = "hero", pose = "idle", className = "", talking = false }) {
  const c = CHARS[who];
  const src = c.img[pose] || c.img.idle;
  const cls = who === "mentor" ? "pose-idle" : `pose-${pose}`;
  return (
    <div className={`pointer-events-none select-none ${className}`} data-testid={`character-${who}-${pose}`}>
      <img key={src} src={src} alt={c.name} draggable={false}
        className={`h-full w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,.55)] ${cls} ${talking ? "talking" : ""}`} />
    </div>
  );
}

export function Portrait({ who = "hero", pose = "idle", size = 64 }) {
  const c = CHARS[who];
  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--gold)]/60 bg-gradient-to-b from-[#1c2d5e] to-[#0b1430] shadow-[0_0_24px_rgba(212,175,55,.25)]"
      style={{ width: size, height: size }} data-testid={`portrait-${who}`}>
      <img src={c.img[pose] || c.img.idle} alt={c.name} className="absolute left-1/2 top-[6%] w-[150%] max-w-none -translate-x-1/2" draggable={false} />
    </div>
  );
}
