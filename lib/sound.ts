// Procedural WebAudio: zero downloads, zero assets.
// Engine hum, horn, rain, Fuji-night percussion, UI blips.
// Everything lazy-starts on a user gesture (autoplay policy) and
// respects the persisted mute flag.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

try {
  muted = localStorage.getItem("omo-muted") === "1";
} catch {
  muted = false;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("omo-muted", m ? "1" : "0");
  } catch {}
  if (master && ctx) {
    master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
  }
}

/** Create/resume context. MUST be called from a click/tap handler first. */
export function ensureAudio(): boolean {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

function now(): number {
  return ctx ? ctx.currentTime : 0;
}

function env(g: GainNode, t: number, peak: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function tone(opts: {
  from: number;
  to?: number;
  dur: number;
  type?: OscillatorType;
  peak?: number;
  delay?: number;
}) {
  if (!ctx || !master || muted) return;
  const t = now() + (opts.delay ?? 0);
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(opts.from, t);
  if (opts.to !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t + opts.dur);
  env(g, t, opts.peak ?? 0.25, opts.dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + opts.dur + 0.05);
}

function noiseBurst(opts: { dur: number; peak?: number; filter?: number; type?: BiquadFilterType; delay?: number }) {
  if (!ctx || !master || muted) return;
  const t = now() + (opts.delay ?? 0);
  const len = Math.max(1, Math.floor(ctx.sampleRate * opts.dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = opts.type ?? "highpass";
  f.frequency.value = opts.filter ?? 6000;
  const g = ctx.createGain();
  env(g, t, opts.peak ?? 0.2, opts.dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
}

// ---------- UI ----------
export function blip() {
  tone({ from: 660, to: 880, dur: 0.09, type: "triangle", peak: 0.18 });
}

export function coin() {
  tone({ from: 880, dur: 0.09, type: "square", peak: 0.12 });
  tone({ from: 1318, dur: 0.16, type: "square", peak: 0.1, delay: 0.08 });
}

export function errorBuzz() {
  tone({ from: 160, to: 110, dur: 0.22, type: "sawtooth", peak: 0.16 });
}

// ---------- horn: two-tone PÒÒN ----------
export function horn() {
  if (!ensureAudio()) return;
  tone({ from: 370, dur: 0.5, type: "square", peak: 0.16 });
  tone({ from: 466, dur: 0.5, type: "square", peak: 0.16 });
}

// ---------- micra engine: looped while driving ----------
let engOsc1: OscillatorNode | null = null;
let engOsc2: OscillatorNode | null = null;
let engGain: GainNode | null = null;
let engFilter: BiquadFilterNode | null = null;

export function engineStart() {
  if (!ensureAudio() || !ctx || !master || engOsc1) return;
  engOsc1 = ctx.createOscillator();
  engOsc2 = ctx.createOscillator();
  engGain = ctx.createGain();
  engFilter = ctx.createBiquadFilter();
  engOsc1.type = "sawtooth";
  engOsc2.type = "square";
  engOsc1.frequency.value = 58;
  engOsc2.frequency.value = 29;
  engFilter.type = "lowpass";
  engFilter.frequency.value = 420;
  engGain.gain.value = 0.0;
  engGain.gain.setTargetAtTime(muted ? 0 : 0.11, now(), 0.4);
  engOsc1.connect(engFilter);
  engOsc2.connect(engFilter);
  engFilter.connect(engGain);
  engGain.connect(master);
  engOsc1.start();
  engOsc2.start();
}

/** v: 0 idle .. 1 flat out */
export function engineSpeed(v: number) {
  if (!ctx || !engOsc1 || !engOsc2 || !engFilter || !engGain) return;
  const t = now();
  const vv = Math.max(0, Math.min(1.6, v));
  engOsc1.frequency.setTargetAtTime(58 + vv * 55, t, 0.15);
  engOsc2.frequency.setTargetAtTime(29 + vv * 28, t, 0.15);
  engFilter.frequency.setTargetAtTime(420 + vv * 700, t, 0.2);
  engGain.gain.setTargetAtTime(muted ? 0 : 0.08 + vv * 0.05, t, 0.2);
}

export function engineStop() {
  if (!ctx || !engOsc1 || !engOsc2 || !engGain) return;
  const t = now();
  engGain.gain.setTargetAtTime(0, t, 0.15);
  const o1 = engOsc1;
  const o2 = engOsc2;
  setTimeout(() => {
    try {
      o1.stop();
      o2.stop();
    } catch {}
  }, 500);
  engOsc1 = null;
  engOsc2 = null;
  engGain = null;
  engFilter = null;
}

// ---------- rain: filtered noise bed ----------
let rainSrc: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;

export function rainStart() {
  if (!ensureAudio() || !ctx || !master || rainSrc) return;
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // pinkish patter
    const w = Math.random() * 2 - 1;
    last = last * 0.94 + w * 0.06;
    ch[i] = (last * 6 + w * 0.25) * 0.5;
  }
  rainSrc = ctx.createBufferSource();
  rainSrc.buffer = buf;
  rainSrc.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 2800;
  f.Q.value = 0.4;
  rainGain = ctx.createGain();
  rainGain.gain.value = 0;
  rainGain.gain.setTargetAtTime(muted ? 0 : 0.16, now(), 1.2);
  rainSrc.connect(f);
  f.connect(rainGain);
  rainGain.connect(master);
  rainSrc.start();
}

export function rainStop() {
  if (!ctx || !rainSrc || !rainGain) return;
  rainGain.gain.setTargetAtTime(0, now(), 0.6);
  const s = rainSrc;
  setTimeout(() => {
    try {
      s.stop();
    } catch {}
  }, 1500);
  rainSrc = null;
  rainGain = null;
}

// ---------- Fuji night: talking drum + shaker + kick scheduler ----------
let fujiTimer: ReturnType<typeof setInterval> | null = null;
let fujiStep = 0;

export function fujiStart() {
  if (!ensureAudio() || fujiTimer) return;
  fujiStep = 0;
  // 132bpm 16ths ≈ 113ms
  fujiTimer = setInterval(() => {
    if (muted) {
      fujiStep = (fujiStep + 1) % 16;
      return;
    }
    const s = fujiStep % 16;
    if (s % 4 === 0) tone({ from: 120, to: 42, dur: 0.22, type: "sine", peak: 0.5 }); // kick
    if (s % 2 === 0) noiseBurst({ dur: 0.05, peak: s % 4 === 2 ? 0.16 : 0.09, filter: 7000 }); // shaker
    if (s === 0 || s === 6 || s === 10 || s === 12) {
      // talking drum: bent sine calls
      tone({ from: 150 + (s % 3) * 30, to: 90, dur: 0.18, type: "sine", peak: 0.3 });
    }
    if (s === 14) tone({ from: 220, to: 330, dur: 0.12, type: "triangle", peak: 0.14 }); // reply
    fujiStep = (fujiStep + 1) % 16;
  }, 113);
}

export function fujiStop() {
  if (fujiTimer) {
    clearInterval(fujiTimer);
    fujiTimer = null;
  }
}

/** Single drum hit (dance button, greetings). */
export function drumHit() {
  tone({ from: 170, to: 95, dur: 0.2, type: "sine", peak: 0.32 });
  noiseBurst({ dur: 0.05, peak: 0.1, filter: 7000 });
}
