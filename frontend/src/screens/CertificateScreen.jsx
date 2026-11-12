import { useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowRight, Download, Printer, ShieldCheck } from "lucide-react";
import { LEVELS } from "@/game/levels";
import { fmtDate, toAr, useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { evaluate } from "./ResultsScreen";

function Certificate({ st, stats, innerRef }) {
  const ev = evaluate(stats.stars, stats.done);
  return (
    <div id="certificate" ref={innerRef} dir="rtl" className="relative mx-auto aspect-[297/210] w-[1123px] overflow-hidden bg-[#fbf6e9] text-[#1f2a44] shadow-2xl" data-testid="certificate">
      <div className="absolute inset-[18px] border-[3px] border-[#b08a34]" />
      <div className="absolute inset-[28px] border border-[#b08a34]/60" />
      <div className="absolute inset-0 opacity-[.06]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#1b3a6b 0 2px,transparent 2px 14px)" }} />
      <div className="absolute right-0 top-0 h-full w-[18px] bg-[#9e1b32]" />
      <div className="absolute left-0 top-0 h-full w-[18px] bg-[#0e6b45]" />
      <div className="relative flex h-full flex-col items-center px-24 pt-14 text-center">
        <div className="flex w-full items-start justify-between text-sm">
          <div className="text-right leading-relaxed"><p className="font-display font-bold">سلطنة عُمان</p><p>مدرسة رقية للبنات (١٠-١٢)</p><p>فريق الأمن والسلامة</p></div>
          <div className="grid size-20 place-items-center rounded-full border-4 border-[#b08a34] bg-[#1b3a6b] text-[#f3e5ab]"><ShieldCheck size={40} /></div>
          <div className="text-left leading-relaxed" dir="rtl"><p>التاريخ: {fmtDate(st.finishedAt)}</p><p>رقم الشهادة: {toAr(String(Date.parse(st.finishedAt || 0) || 0).slice(-6))}</p></div>
        </div>
        <h1 className="mt-4 font-doc text-6xl font-bold text-[#996515]">شهادة إنجاز وتقدير</h1>
        <p className="mt-4 font-doc text-2xl">يسرّ إدارة مدرسة رقية للبنات وفريق الأمن والسلامة منح الطالبة</p>
        <p className="mt-3 min-w-[420px] border-b-2 border-dotted border-[#b08a34] pb-2 font-doc text-5xl font-bold text-[#1b3a6b]" data-testid="certificate-student-name">{st.name || "سفيرة السلامة"}</p>
        {st.cls && <p className="mt-2 font-display text-lg">الصف: {st.cls}</p>}
        <p className="mt-4 max-w-3xl font-doc text-2xl leading-relaxed">لقب <b className="text-[#9e1b32]">«سفيرة السلامة»</b> لإتمامها بنجاح مغامرة «مواجهة النينو في مدرسة رقية» بمراحلها الثماني، وإظهارها وعياً متميزاً بإجراءات الأمن والسلامة في مواجهة التقلبات المناخية.</p>
        <div className="mt-5 flex items-center gap-10 font-display text-base">
          <span>النجوم: <b>{toAr(stats.stars)} / ٢٤</b></span><span>النقاط: <b>{toAr(stats.xp)}</b></span><span>الإنجازات: <b>{toAr(st.achievements.length)}</b></span><span>التقدير: <b className="text-[#9e1b32]">{ev.t}</b></span>
        </div>
        <div className="mt-4 flex gap-2">{LEVELS.map((l) => <img key={l.id} src={`/badges/b${l.id}.webp`} alt="" crossOrigin="anonymous" className="size-12 rounded-full border-2 border-[#b08a34] object-cover" />)}</div>
        <div className="absolute inset-x-24 bottom-14 flex items-end justify-between font-doc text-lg">
          <div className="text-center"><p className="mb-6">مشرفة الأمن والسلامة</p><p className="border-t border-[#1f2a44]/50 px-10 pt-1 text-sm">التوقيع</p></div>
          <div className="text-center"><p className="mb-6">مديرة المدرسة</p><p className="border-t border-[#1f2a44]/50 px-10 pt-1 text-sm">التوقيع والختم</p></div>
        </div>
      </div>
    </div>
  );
}

export default function CertificateScreen() {
  const { st, stats } = useGame();
  const nav = useNavigate();
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  if (stats.done < stats.total) return <Navigate to="/results" replace />;

  const pdf = async () => {
    audio.sfx("click"); setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#fbf6e9", useCORS: true });
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      doc.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 297, 210);
      doc.save(`شهادة-سفيرة-السلامة-${st.name || "الطالبة"}.pdf`);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-[#0b1226] thin-scroll" data-testid="certificate-screen">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-[#0b1226]/90 px-4 py-3 backdrop-blur print:hidden">
        <button type="button" onClick={() => nav("/results")} className="btn-ghost flex items-center gap-2 rounded-full px-4 py-2 text-sm" data-testid="certificate-back-button"><ArrowRight size={16} /> النتائج</button>
        <div className="flex gap-2">
          <button type="button" onClick={() => { audio.sfx("click"); window.print(); }} className="btn-ghost flex items-center gap-2 rounded-full px-5 py-2 text-sm" data-testid="certificate-print-button"><Printer size={16} /> طباعة</button>
          <button type="button" onClick={pdf} disabled={busy} className="btn-gold flex items-center gap-2 rounded-full px-5 py-2 text-sm" data-testid="certificate-download-pdf-button"><Download size={16} /> {busy ? "جارٍ التجهيز…" : "تحميل PDF"}</button>
        </div>
      </div>
      <div className="origin-top-right p-4 sm:p-8" style={{ zoom: "var(--cz)" }}>
        <style>{`:root{--cz:min(1, calc((100vw - 32px) / 1123px))}`}</style>
        <Certificate st={st} stats={stats} innerRef={ref} />
      </div>
    </div>
  );
}
