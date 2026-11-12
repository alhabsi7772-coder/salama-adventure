import { useState } from "react";
import { Delete, Phone, PhoneCall } from "lucide-react";
import { audio } from "@/game/audio";
import { EMERGENCY } from "@/game/levels";
import { toAr } from "@/game/store";

export function DialChallenge({ api }) {
  const [num, setNum] = useState("");
  const [calling, setCalling] = useState(false);
  const press = (d) => { if (calling || num.length >= 8) return; audio.sfx("tick"); setNum((n) => n + d); };
  const call = () => {
    if (calling) return;
    if (num === EMERGENCY) {
      setCalling(true); audio.sfx("ring");
      setTimeout(() => api.right("تم استلام بلاغكِ. ابقين داخل الحافلة في مكان آمن بعيداً عن مجرى الوادي حتى تصل الجهات المختصة."), 2300);
    } else {
      api.wrong(`هذا ليس رقم الطوارئ. تذكّري: رقم الطوارئ الموحّد في سلطنة عُمان هو ${toAr(EMERGENCY)} للشرطة والإسعاف والدفاع المدني.`);
      setNum("");
    }
  };
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2rem] border-4 border-slate-700 bg-slate-950 p-4 shadow-2xl" data-testid="dial-challenge">
      <div className="mb-3 flex h-14 items-center justify-center rounded-xl bg-slate-900 font-mono-num text-2xl text-emerald-300" dir="ltr" data-testid="dial-display">
        {calling ? <span className="flex items-center gap-2 text-base"><PhoneCall size={18} className="animate-pulse" /> جارٍ الاتصال…</span> : num || <span className="text-sm text-slate-500">اكتبي الرقم</span>}
      </div>
      <div className="grid grid-cols-3 gap-2" dir="ltr">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((d) => (
          <button key={d} type="button" onClick={() => press(d)} data-testid={`dial-key-${d}`}
            className="h-12 rounded-full bg-slate-800 font-mono-num text-lg text-white transition-colors hover:bg-slate-700 active:scale-95">{d}</button>
        ))}
        <button type="button" aria-label="حذف آخر رقم" onClick={() => setNum((n) => n.slice(0, -1))} data-testid="dial-delete" className="grid h-12 place-items-center rounded-full text-slate-400 hover:text-white"><Delete size={20} /></button>
        <button type="button" aria-label="اتصال" onClick={call} data-testid="dial-call" className="grid h-12 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400"><Phone size={20} /></button>
      </div>
    </div>
  );
}
