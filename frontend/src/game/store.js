import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LEVELS, starsFor } from "./levels";
import { audio } from "./audio";

const KEY = "safety-ambassador:v2";
const BASE = { name: "", cls: "", levels: {}, collected: [], achievements: [], introSeen: false, finishedAt: null,
  volumes: { master: 0.85, music: 0.5, sfx: 0.8, voice: 1 }, subtitles: true };

const load = () => {
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s ? { ...BASE, ...s, volumes: { ...BASE.volumes, ...s.volumes } } : BASE; }
  catch (e) { return BASE; }
};

const Ctx = createContext(null);

export const computeAchievements = (st) => {
  const lv = st.levels, done = Object.values(lv).filter((l) => l.done);
  const stars = done.reduce((a, l) => a + l.stars, 0);
  const has = new Set(st.achievements);
  const rules = {
    first: !!lv[1]?.done,
    eagle: !!(lv[1]?.hotClean || lv[2]?.hotClean),
    wadi: lv[3]?.stars === 3,
    fire: lv[6]?.stars === 3,
    clock: !!lv[7]?.timedFirst,
    learner: done.some((l) => l.learned),
    collector: st.collected.length >= 8,
    perfect: done.filter((l) => l.stars === 3).length >= 3,
    gold: stars >= 24,
    ambassador: done.length >= LEVELS.length,
  };
  return Object.keys(rules).filter((k) => rules[k] && !has.has(k));
};

export function GameProvider({ children }) {
  const [st, setSt] = useState(load);
  const ref = useRef(st);
  useEffect(() => { ref.current = st; localStorage.setItem(KEY, JSON.stringify(st)); }, [st]);
  useEffect(() => { audio.setVolumes(st.volumes); }, [st.volumes]);

  const update = useCallback((patch) => setSt((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) })), []);

  const complete = useCallback((id, r) => {
    const stars = starsFor(r.mistakes);
    const xp = Math.max(60, 100 + stars * 40 + (r.collected ? 30 : 0) - r.hints * 10);
    const out = { stars, xp, newAch: [] };
    const s = ref.current;
    {
      const prev = s.levels[id];
      const best = !prev || xp >= prev.xp;
      const rec = { done: true, stars: Math.max(stars, prev?.stars || 0), xp: Math.max(xp, prev?.xp || 0), mistakes: best ? r.mistakes : prev.mistakes,
        hotClean: prev?.hotClean || r.hotClean, timedFirst: prev?.timedFirst || r.timedFirst, learned: prev?.learned || r.mistakes > 0,
        date: new Date().toISOString() };
      const collected = r.collected && !s.collected.includes(id) ? [...s.collected, id] : s.collected;
      const next = { ...s, levels: { ...s.levels, [id]: rec }, collected };
      const newAch = computeAchievements(next);
      out.newAch = newAch;
      const all = Object.values(next.levels).filter((l) => l.done).length >= LEVELS.length;
      const final = { ...next, achievements: [...s.achievements, ...newAch], finishedAt: all ? s.finishedAt || new Date().toISOString() : s.finishedAt };
      ref.current = final;
      setSt(final);
    }
    return out;
  }, []);

  const reset = useCallback(() => setSt((s) => ({ ...BASE, volumes: s.volumes, subtitles: s.subtitles })), []);

  const stats = useMemo(() => {
    const done = LEVELS.filter((l) => st.levels[l.id]?.done);
    return {
      done: done.length, total: LEVELS.length,
      stars: done.reduce((a, l) => a + st.levels[l.id].stars, 0),
      xp: done.reduce((a, l) => a + st.levels[l.id].xp, 0),
      current: (LEVELS.find((l) => !st.levels[l.id]?.done) || LEVELS[LEVELS.length - 1]).id,
    };
  }, [st.levels]);

  const value = useMemo(() => ({ st, update, complete, reset, stats }), [st, update, complete, reset, stats]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useGame = () => useContext(Ctx);

export const toAr = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
export const fmtDate = (iso) => {
  try { return new Intl.DateTimeFormat("ar-OM", { day: "numeric", month: "long", year: "numeric" }).format(iso ? new Date(iso) : new Date()); }
  catch (e) { return new Date().toLocaleDateString("ar"); }
};
