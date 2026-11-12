import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookUser, Map, Settings2, Sparkles, Star } from "lucide-react";
import { toAr, useGame } from "@/game/store";
import { audio } from "@/game/audio";
import { SettingsDialog } from "./SettingsDialog";
import { PassportDialog } from "./PassportDialog";

const IconBtn = ({ label, onClick, children, testId }) => (
  <button type="button" aria-label={label} title={label} data-testid={testId}
    onClick={() => { audio.sfx("click"); onClick(); }}
    className="btn-ghost grid size-10 place-items-center rounded-full text-slate-100 sm:size-11">{children}</button>
);

export function TopBar({ title, showMap = true }) {
  const { stats } = useGame();
  const nav = useNavigate();
  const [set, setSet] = useState(false);
  const [pass, setPass] = useState(false);
  return (
    <header className="pointer-events-auto relative z-30 flex items-center justify-between gap-2 px-3 py-3 sm:px-6" data-testid="top-bar">
      <div className="flex min-w-0 items-center gap-2">
        {showMap && <IconBtn label="الخريطة" testId="topbar-map-button" onClick={() => nav("/map")}><Map size={18} /></IconBtn>}
        {title && <p className="truncate font-display text-sm font-bold text-[var(--gold-hi)] sm:text-base" data-testid="topbar-title">{title}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="glass hidden items-center gap-3 rounded-full px-4 py-2 text-sm sm:flex">
          <span className="flex items-center gap-1" data-testid="topbar-stars"><Star size={15} className="fill-[var(--gold)] text-[var(--gold)]" />{toAr(stats.stars)}</span>
          <span className="h-4 w-px bg-white/20" />
          <span className="flex items-center gap-1" data-testid="topbar-xp"><Sparkles size={15} className="text-[var(--sky)]" />{toAr(stats.xp)} XP</span>
        </div>
        <IconBtn label="جواز السفر" testId="topbar-passport-button" onClick={() => setPass(true)}><BookUser size={18} /></IconBtn>
        <IconBtn label="الإعدادات" testId="topbar-settings-button" onClick={() => setSet(true)}><Settings2 size={18} /></IconBtn>
      </div>
      <SettingsDialog open={set} onOpenChange={setSet} />
      <PassportDialog open={pass} onOpenChange={setPass} />
    </header>
  );
}
