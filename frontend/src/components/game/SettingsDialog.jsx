import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Music, Volume2, Waves, Mic, RotateCcw } from "lucide-react";
import { useGame } from "@/game/store";
import { audio } from "@/game/audio";

const CH = [
  { id: "master", label: "الصوت العام", icon: Volume2 },
  { id: "music", label: "الموسيقى الخلفية", icon: Music },
  { id: "sfx", label: "المؤثرات الصوتية", icon: Waves },
  { id: "voice", label: "صوت الراوية", icon: Mic },
];

export function SettingsDialog({ open, onOpenChange }) {
  const { st, update, reset } = useGame();
  const setVol = (id, v) => update((s) => ({ volumes: { ...s.volumes, [id]: v } }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="glass-strong max-w-md border-[var(--gold)]/30 text-slate-100" data-testid="settings-dialog">
        <DialogHeader className="text-right">
          <DialogTitle className="font-display text-xl text-[var(--gold)]">الإعدادات</DialogTitle>
          <DialogDescription className="text-slate-400">تحكّمي بكل قناة صوتية بشكل مستقل.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {CH.map(({ id, label, icon: Icon }) => (
            <div key={id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Icon size={16} className="text-[var(--gold)]" />{label}</span>
                <span className="font-mono-num text-xs text-slate-400" data-testid={`volume-${id}-value`}>{Math.round(st.volumes[id] * 100)}%</span>
              </div>
              <Slider dir="rtl" value={[st.volumes[id] * 100]} max={100} step={5} data-testid={`volume-${id}-slider`}
                onValueChange={([v]) => setVol(id, v / 100)} onValueCommit={() => audio.sfx("click")} />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <span className="text-sm">إظهار الترجمة النصية</span>
            <Switch checked={st.subtitles} onCheckedChange={(v) => update({ subtitles: v })} data-testid="subtitles-switch" />
          </div>
          <button type="button" data-testid="reset-progress-button"
            onClick={() => { if (window.confirm("هل تريدين مسح كل التقدّم والبدء من جديد؟")) { reset(); onOpenChange(false); } }}
            className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm text-red-300">
            <RotateCcw size={15} /> إعادة ضبط التقدّم
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
