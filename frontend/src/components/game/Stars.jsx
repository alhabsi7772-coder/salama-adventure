import { Star } from "lucide-react";

export function Stars({ n = 0, size = 18, total = 3, testId }) {
  return (
    <div className="flex items-center gap-0.5" data-testid={testId} aria-label={`${n} من ${total} نجوم`}>
      {Array.from({ length: total }, (_, i) => (
        <Star key={i} size={size} strokeWidth={1.6}
          className={i < n ? "fill-[var(--gold)] text-[var(--gold-hi)] drop-shadow-[0_0_6px_rgba(212,175,55,.7)]" : "text-slate-500/70"} />
      ))}
    </div>
  );
}
