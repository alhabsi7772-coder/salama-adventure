import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { audio } from "@/game/audio";
import { shuffle } from "./ChoiceChallenge";

const COLORS = ["#38bdf8", "#f59e0b", "#34d399", "#f472b6"];

export function MatchChallenge({ step, api }) {
  const right = useMemo(() => shuffle(step.pairs.map((p, i) => ({ t: p.b, i }))), [step]);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const pickA = (i) => { if (!done.includes(i)) { audio.sfx("click"); setSel(i); } };
  const pickB = (i) => {
    if (sel === null || done.includes(i)) return;
    if (i === sel) {
      const nd = [...done, i]; setDone(nd); setSel(null);
      if (nd.length === step.pairs.length) api.right("كل علامة لها إسعاف مناسب. الإسعاف الصحيح يبدأ بالملاحظة الدقيقة.");
      else api.partial(`صحيح: «${step.pairs[i].a}» ← ${step.pairs[i].b}.`);
    } else {
      setSel(null);
      api.wrong(`«${right.find((r) => r.i === i).t}» ليس الإسعاف المناسب لـ«${step.pairs[sel].a}». فكّري: ما الذي يحتاجه الجسم في هذه الحالة؟`);
    }
  };
  const cell = (on, c) => `opt w-full rounded-xl border p-3 text-right text-sm leading-relaxed ${on ? "" : "border-white/15 bg-white/[.04]"}`;
  return (
    <div data-testid="match-challenge">
      <p className="mb-2 flex items-center gap-2 text-xs text-slate-300"><Link2 size={14} /> اختاري علامة من اليمين، ثم الإسعاف المناسب من اليسار.</p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-2.5">
          {step.pairs.map((p, i) => (
            <button key={i} type="button" onClick={() => pickA(i)} data-testid={`match-sign-${i}`} className={cell(done.includes(i) || sel === i)}
              style={done.includes(i) ? { borderColor: COLORS[i], background: `${COLORS[i]}22` } : sel === i ? { borderColor: "var(--gold)", background: "rgba(212,175,55,.14)" } : {}}>
              {p.a}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {right.map((r) => (
            <button key={r.i} type="button" onClick={() => pickB(r.i)} data-testid={`match-action-${r.i}`} className={cell(done.includes(r.i))}
              disabled={done.includes(r.i)} style={done.includes(r.i) ? { borderColor: COLORS[r.i], background: `${COLORS[r.i]}22` } : {}}>
              {r.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
