import { useState } from "react";
import { motion } from "framer-motion";
import { audio } from "@/game/audio";

const NODES = {
  c112: { x: 70, y: 22, n: "فصلكِ ١١-٢" }, lab: { x: 20, y: 22, n: "مختبر العلوم" }, up: { x: 84, y: 22, n: "الممر العلوي" },
  lib: { x: 46, y: 22, n: "المكتبة" }, east: { x: 84, y: 52, n: "الممر الشرقي" }, lobby: { x: 46, y: 52, n: "البهو" },
  exit: { x: 84, y: 80, n: "مخرج الطوارئ الشرقي" }, bus: { x: 50, y: 88, n: "موقف الحافلات" }, field: { x: 18, y: 84, n: "الملعب الرياضي" },
};
const STAGES = [
  { at: "c112", q: "أنتِ في فصلكِ ١١-٢ والدخان يأتي من جهة المختبر. إلى أين؟", opts: [
    { t: "غرباً نحو مختبر العلوم", to: "lab", why: "هذا اتجاه مصدر الحريق والدخان الكثيف. ابتعدي عنه واتبعي الأسهم الخضراء." },
    { t: "شرقاً عبر الممر العلوي", to: "up", ok: true },
    { t: "أدخل المكتبة وأغلق الباب", to: "lib", why: "الاختباء داخل الغرف يحبسكِ مع الدخان. واصلي نحو المخرج." }] },
  { at: "up", q: "وصلتِ إلى الممر العلوي. السهم الأخضر يشير إلى الأسفل…", opts: [
    { t: "جنوباً عبر الممر الشرقي", to: "east", ok: true },
    { t: "أعود إلى الفصل لأخذ حقيبتي", to: "c112", why: "لا عودة لأي غرض أثناء الإخلاء؛ سلامتكِ أولاً." }] },
  { at: "east", q: "أمامكِ مخرج الطوارئ، والبهو إلى الغرب.", opts: [
    { t: "غرباً نحو البهو والبوابة الرئيسية", to: "lobby", why: "الدخان ينتشر نحو البهو والطريق أطول. مخرج الطوارئ أمامكِ مباشرة." },
    { t: "مخرج الطوارئ الشرقي", to: "exit", ok: true }] },
  { at: "exit", q: "خرجتِ من المبنى! أين نقطة التجميع؟", opts: [
    { t: "موقف الحافلات", to: "bus", why: "نقطة التجميع المحددة في المخطط هي الملعب الرياضي؛ هناك تُحصى الطالبات ويكون المكان بعيداً عن حركة السيارات." },
    { t: "الملعب الرياضي — نقطة التجميع", to: "field", ok: true }] },
];

export function MapChallenge({ api }) {
  const [stage, setStage] = useState(0);
  const [path, setPath] = useState(["c112"]);
  const cur = NODES[path[path.length - 1]];
  const pick = (o) => {
    audio.sfx("click");
    if (!o.ok) { api.wrong(o.why); return; }
    const np = [...path, o.to]; setPath(np);
    if (stage === STAGES.length - 1) api.right("وصلتِ إلى الملعب الرياضي — نقطة التجميع الآمنة — وتمّ إحصاؤكِ مع زميلاتكِ.");
    else { api.partial("اتجاه صحيح! تابعي الأسهم الخضراء."); setStage(stage + 1); }
  };
  const s = STAGES[Math.min(stage, STAGES.length - 1)];
  return (
    <div data-testid="map-challenge">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-emerald-400/30 bg-[#0b1a2c]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <rect x="10" y="12" width="82" height="50" rx="2" fill="#122a44" stroke="#2c5a86" strokeWidth=".5" />
          <rect x="6" y="72" width="26" height="24" rx="3" fill="#164a2e" stroke="#34d399" strokeWidth=".5" />
          <rect x="38" y="80" width="26" height="14" rx="2" fill="#2a2a38" stroke="#555" strokeWidth=".4" />
          <path d="M70 22 L84 22 L84 52 L84 80 L18 84" fill="none" stroke="#34d399" strokeWidth=".8" strokeDasharray="2 1.5" opacity=".55" />
          <polyline points={path.map((p) => `${NODES[p].x},${NODES[p].y}`).join(" ")} fill="none" stroke="#f3e5ab" strokeWidth="1.2" />
          <circle cx="20" cy="22" r="5" fill="rgba(239,68,68,.35)"><animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" /></circle>
        </svg>
        {Object.entries(NODES).map(([k, n]) => (
          <span key={k} className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-slate-200 sm:text-xs" style={{ left: `${n.x}%`, top: `${n.y + 6}%` }}>{n.n}</span>
        ))}
        <motion.div className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--sky)] shadow-[0_0_14px_var(--sky)]"
          animate={{ left: `${cur.x}%`, top: `${cur.y}%` }} transition={{ type: "spring", damping: 18 }} data-testid="map-hero-marker" />
      </div>
      <p className="mt-3 font-display text-sm font-bold text-[var(--gold-hi)]" data-testid="map-question">{s.q}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {s.opts.map((o, i) => (
          <button key={o.t} type="button" onClick={() => pick(o)} data-testid={`map-option-${i}`} className="opt rounded-xl border border-white/15 bg-white/[.04] p-3 text-right text-sm">{o.t}</button>
        ))}
      </div>
    </div>
  );
}
