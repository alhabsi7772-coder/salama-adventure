const HIJAZ = [0, 1, 4, 5, 7, 8, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const hz = (root, scale, deg, oct = 0) => {
  const n = scale.length, o = Math.floor(deg / n) + oct;
  return root * 2 ** ((scale[((deg % n) + n) % n] + 12 * o) / 12);
};
const MOODS = {
  calm: { bpm: 76, root: 146.83, scale: MAJOR, prog: [0, 5, 3, 4], arp: [0, 2, 4, 7, 4, 2], drum: false, gain: 0.5 },
  tension: { bpm: 96, root: 146.83, scale: HIJAZ, prog: [0, 0, 6, 1], arp: [0, 4, 7, 8, 7, 4, 1, 4], drum: true, gain: 0.55 },
  think: { bpm: 84, root: 130.81, scale: HIJAZ, prog: [0, 3, 0, 4], arp: [0, 2, 4, 2], drum: false, gain: 0.45 },
  victory: { bpm: 112, root: 174.61, scale: MAJOR, prog: [0, 3, 4, 0], arp: [0, 2, 4, 7, 9, 7, 4, 2], drum: true, gain: 0.6 },
};

class Engine {
  ctx = null; buses = {}; samples = new Map(); vol = { master: 0.85, music: 0.5, sfx: 0.8, voice: 1 };
  mood = "none"; step = 0; nextT = 0; timer = 0; amb = null; ambType = "none"; voiceSrc = null; voiceTok = 0;
  manifest = null; noise = null;

  unlock() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      const c = (this.ctx = new C());
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -12; comp.ratio.value = 4; comp.connect(c.destination);
      const g = (to) => { const n = c.createGain(); n.connect(to); return n; };
      this.buses.master = g(comp);
      ["music", "sfx", "voice"].forEach((k) => (this.buses[k] = g(this.buses.master)));
      this.buses.amb = g(this.buses.sfx);
      const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = b;
      this.applyVol();
      this.timer = window.setInterval(() => this.tick(), 60);
      ["rain", "wind", "river", "thunder1", "thunder2"].forEach((s) => this.sample(s));
      this.ready = fetch("/voice/v2/manifest.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((m) => (this.manifest = m)).catch(() => {});
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.pendingAmb) this.ambience(this.pendingAmb);
  }

  setVolumes(v) { this.vol = { ...this.vol, ...v }; this.applyVol(); }
  applyVol(duck = this.voiceSrc != null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, b = this.buses, v = this.vol;
    b.master.gain.setTargetAtTime(v.master, t, 0.05);
    b.music.gain.setTargetAtTime(v.music * (duck ? 0.35 : 1) * 0.6, t, 0.2);
    b.sfx.gain.setTargetAtTime(v.sfx, t, 0.05);
    b.amb.gain.setTargetAtTime(duck ? 0.45 : 0.9, t, 0.3);
    b.voice.gain.setTargetAtTime(v.voice * 1.1, t, 0.05);
  }

  sample(name) {
    if (!this.ctx) return null;
    if (!this.samples.has(name)) {
      this.samples.set(name, fetch(`/sfx/${name}.mp3`).then((r) => r.arrayBuffer()).then((a) => this.ctx.decodeAudioData(a)).catch(() => null));
    }
    return this.samples.get(name);
  }

  tone(bus, type, f0, f1, dur, vol, at = 0, attack = 0.01) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  burst(bus, ftype, freq, dur, vol, at = 0, f1) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + at, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = ftype; f.frequency.setValueAtTime(freq, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  sfx(name) {
    if (!this.ctx) return;
    const b = this.buses.sfx, T = (...a) => this.tone(b, ...a);
    const map = {
      click: () => { T("triangle", 900, 600, 0.06, 0.25); },
      pop: () => { T("sine", 500, 1100, 0.12, 0.3); },
      hover: () => { T("sine", 1400, 1400, 0.04, 0.05); },
      right: () => { [0, 4, 7, 12].forEach((s, i) => T("triangle", 523.25 * 2 ** (s / 12), 523.25 * 2 ** (s / 12), 0.4, 0.22, i * 0.07)); T("sine", 1568, 1568, 0.6, 0.08, 0.28); },
      wrong: () => { T("sawtooth", 220, 140, 0.35, 0.12); T("square", 110, 90, 0.4, 0.06, 0.05); },
      stamp: () => { T("sine", 120, 40, 0.35, 0.8); this.burst(b, "lowpass", 900, 0.18, 0.6); },
      whoosh: () => { this.burst(b, "bandpass", 300, 0.7, 0.35, 0, 3000); },
      collect: () => { [0, 7, 12, 16, 19].forEach((s, i) => T("sine", 880 * 2 ** (s / 12), 880 * 2 ** (s / 12), 0.35, 0.16, i * 0.05)); },
      ring: () => { [0, 0.25, 1.2, 1.45].forEach((d) => { T("sine", 440, 440, 0.2, 0.2, d); T("sine", 480, 480, 0.2, 0.2, d); }); },
      hiss: () => { this.burst(b, "highpass", 2500, 1.4, 0.35); },
      tick: () => { T("square", 1800, 1800, 0.025, 0.06); },
      fanfare: () => { [[0, 0], [4, 0.14], [7, 0.28], [12, 0.42], [7, 0.62], [12, 0.76]].forEach(([s, d]) => { T("sawtooth", 392 * 2 ** (s / 12), 392 * 2 ** (s / 12), 0.5, 0.09, d); T("triangle", 392 * 2 ** (s / 12), 392 * 2 ** (s / 12), 0.7, 0.18, d); }); T("sine", 98, 98, 1.6, 0.3, 0.76, 0.05); },
      thunder: () => { this.sample(Math.random() > 0.5 ? "thunder1" : "thunder2")?.then((buf) => buf && this.playBuf(buf, this.buses.amb, 0.9)); },
    };
    map[name]?.();
  }

  playBuf(buf, bus, vol = 1, loop = false) {
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; s.loop = loop; g.gain.value = vol; s.connect(g).connect(bus);
    s.start(0, loop ? Math.random() * Math.max(0, buf.duration - 2) : 0);
    return { s, g };
  }

  ambience(type) {
    if (!this.ctx) { this.pendingAmb = type; return; }
    this.pendingAmb = null;
    if (type === this.ambType) return;
    this.ambType = type;
    const c = this.ctx, old = this.amb;
    if (old) { old.out.gain.setTargetAtTime(0, c.currentTime, 0.5); setTimeout(() => old.stop(), 2200); }
    this.amb = null;
    if (!type || type === "none") return;
    const out = c.createGain(); out.gain.value = 0; out.connect(this.buses.amb);
    out.gain.setTargetAtTime(1, c.currentTime, 0.6);
    const stops = []; let alive = true;
    const loop = (name, vol) => this.sample(name)?.then((buf) => { if (buf && alive) { const n = this.playBuf(buf, out, vol, true); stops.push(() => n.s.stop()); } });
    const every = (ms, fn) => { const id = setInterval(fn, ms); stops.push(() => clearInterval(id)); };
    const rec = {
      rain: () => { loop("rain", 0.7); every(9000, () => Math.random() > 0.5 && this.sfx("thunder")); },
      wind: () => { loop("wind", 0.8); loop("rain", 0.25); },
      flood: () => { loop("river", 0.8); loop("rain", 0.5); every(11000, () => Math.random() > 0.4 && this.sfx("thunder")); },
      alarm: () => { every(900, () => { this.tone(out, "square", 880, 660, 0.4, 0.05); }); },
      fire: () => { every(120, () => Math.random() > 0.4 && this.burst(out, "highpass", 1500 + Math.random() * 3000, 0.03, Math.random() * 0.25)); },
      heat: () => { every(2600, () => [0, 0.08, 0.16, 0.24].forEach((d) => this.tone(out, "sine", 4200, 4300, 0.06, 0.012, d))); },
      calm: () => { every(3400, () => Math.random() > 0.4 && [0, 0.12].forEach((d) => this.tone(out, "sine", 2400 + Math.random() * 800, 3200, 0.1, 0.02, d))); },
    };
    (rec[type] || rec.calm)();
    this.amb = { out, stop: () => { alive = false; stops.forEach((f) => f()); out.disconnect(); } };
  }

  music(mood) {
    if (mood === this.mood) return;
    this.mood = mood; this.step = 0;
    if (this.ctx) this.nextT = this.ctx.currentTime + 0.1;
  }

  tick() {
    const c = this.ctx, m = MOODS[this.mood];
    if (!c || !m || c.state !== "running") return;
    const sp = 60 / m.bpm / 2;
    if (this.nextT < c.currentTime) this.nextT = c.currentTime + 0.05;
    while (this.nextT < c.currentTime + 0.25) {
      const st = this.step, bar = Math.floor(st / 8) % m.prog.length, deg = m.prog[bar], t = this.nextT - c.currentTime, bus = this.buses.music;
      if (st % 8 === 0) {
        [0, 2, 4].forEach((d) => { this.tone(bus, "triangle", hz(m.root, m.scale, deg + d), hz(m.root, m.scale, deg + d), sp * 8.5, 0.05 * m.gain, t, 0.6); this.tone(bus, "sine", hz(m.root, m.scale, deg + d, 1) * 1.003, hz(m.root, m.scale, deg + d, 1), sp * 8, 0.025 * m.gain, t, 0.8); });
        this.tone(bus, "sine", hz(m.root, m.scale, deg, -1), hz(m.root, m.scale, deg, -1), sp * 6, 0.16 * m.gain, t, 0.02);
      }
      const a = m.arp[st % m.arp.length];
      if (st % 2 === 0 || this.mood === "victory" || this.mood === "tension") this.tone(bus, "triangle", hz(m.root, m.scale, deg + a, 1), hz(m.root, m.scale, deg + a, 1), sp * 1.6, 0.07 * m.gain, t);
      if (m.drum) {
        if (st % 8 === 0 || st % 8 === 5) this.tone(bus, "sine", 110, 45, 0.3, 0.35 * m.gain, t);
        if (st % 4 === 2) this.burst(bus, "bandpass", 2800, 0.05, 0.12 * m.gain, t);
      }
      this.step++; this.nextT += sp;
    }
  }

  voiceUrl(id) {
    return this.manifest?.ids?.includes(id) ? `/voice/v2/${id}.mp3?v=${this.manifest.v}` : null;
  }

  async loadVoice(id) {
    await this.ready;
    const url = this.voiceUrl(id);
    if (!url || !this.ctx) return null;
    const k = `v:${url}`;
    if (!this.samples.has(k)) this.samples.set(k, fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject())).then((a) => this.ctx.decodeAudioData(a)).catch(() => null));
    return this.samples.get(k);
  }
  preload(ids) { ids.forEach((i) => this.loadVoice(i)); }

  async speak(id) {
    this.stopVoice();
    const tok = ++this.voiceTok;
    const buf = await this.loadVoice(id);
    if (!buf || tok !== this.voiceTok) return 0;
    const s = this.ctx.createBufferSource(); s.buffer = buf; s.connect(this.buses.voice);
    this.voiceSrc = s; this.applyVol(true);
    s.onended = () => { if (this.voiceSrc === s) { this.voiceSrc = null; this.applyVol(false); } };
    s.start(this.ctx.currentTime + 0.05);
    return buf.duration;
  }
  stopVoice() {
    this.voiceTok++;
    const s = this.voiceSrc; this.voiceSrc = null;
    if (s) { try { s.stop(); } catch (e) { /* already stopped */ } }
    this.applyVol(false);
  }
}

export const audio = new Engine();
