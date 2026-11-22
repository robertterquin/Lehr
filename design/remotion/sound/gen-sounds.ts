// Synthesizes Parol's sound effects to WAV (44.1 kHz, 16-bit mono) with no dependencies, using the same
// building blocks a Web Audio version in the game would use: sine partials, envelopes and filtered noise.
// Usage: node sound/gen-sounds.ts   → public/sfx/*.wav and src/mockups/sound-peaks.json
import { mkdirSync, writeFileSync } from 'node:fs';

const RATE = 44100;
const OUT = new URL('../public/sfx/', import.meta.url);
const PEAKS = new URL('../src/mockups/sound-peaks.json', import.meta.url);

type Signal = Float32Array;
const buffer = (seconds: number): Signal => new Float32Array(Math.round(seconds * RATE));

// Deterministic noise so the files are identical on every run.
let seed = 12345;
const noise = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};

/** Adds a decaying sine partial. */
const partial = (out: Signal, at: number, freq: number, amp: number, decay: number, attack = 0.004, detune = 0) => {
  const start = Math.round(at * RATE);
  for (let i = 0; start + i < out.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / attack) * Math.exp(-t / decay);
    if (env < 1e-4 && t > attack) break;
    out[start + i] += amp * env * Math.sin(2 * Math.PI * (freq + detune * Math.sin(2 * Math.PI * 5 * t)) * t);
  }
};

/** Adds a noise burst through a simple resonant band-pass (two one-pole filters around a centre). */
const noiseBurst = (out: Signal, at: number, seconds: number, amp: number, center: number, decay: number) => {
  const start = Math.round(at * RATE);
  let low = 0;
  let band = 0;
  const f = 2 * Math.sin((Math.PI * center) / RATE);
  for (let i = 0; i < seconds * RATE && start + i < out.length; i++) {
    const t = i / RATE;
    const high = noise() - low - 0.5 * band;
    band += f * high;
    low += f * band;
    out[start + i] += amp * band * Math.exp(-t / decay) * Math.min(1, t / 0.002);
  }
};

/** A glass-and-capiz bell: inharmonic partials with a slow shimmer. */
const bell = (out: Signal, at: number, freq: number, amp: number, decay = 1.1) => {
  [
    [1, 1],
    [2.01, 0.45],
    [2.76, 0.32],
    [5.4, 0.12],
    [8.9, 0.05],
  ].forEach(([ratio, gain], k) => partial(out, at, freq * ratio, amp * gain, decay / (1 + k * 0.6), 0.002, k === 0 ? 0.6 : 0));
};

/** A kulintang-style gong: low inharmonic partials with a long decay and a slight pitch wobble. */
const gong = (out: Signal, at: number, freq: number, amp: number) => {
  [
    [1, 1, 2.6],
    [1.52, 0.5, 1.8],
    [2.11, 0.32, 1.3],
    [2.98, 0.16, 0.8],
  ].forEach(([ratio, gain, decay]) => partial(out, at, freq * ratio, amp * gain, decay, 0.008, 0.8));
  noiseBurst(out, at, 0.05, amp * 0.25, 900, 0.015);
};

// D major pentatonic, the streak climbs it: D5 E5 F♯5 A5 B5.
const PENTATONIC = [587.33, 659.25, 739.99, 880, 987.77];

const SOUNDS: Record<string, { seconds: number; make: (out: Signal) => void; note: string }> = {
  tap: { seconds: 0.12, note: 'UI tap: a soft wooden click', make: (o) => { partial(o, 0, 1180, 0.5, 0.025, 0.001); noiseBurst(o, 0, 0.02, 0.4, 3000, 0.004); } },
  'ring-in': { seconds: 0.35, note: 'A ring spins in: a soft paper whoosh', make: (o) => noiseBurst(o, 0, 0.35, 0.5, 700, 0.12) },
  lock: { seconds: 0.25, note: 'Lock: a bamboo knock', make: (o) => { partial(o, 0, 520, 0.7, 0.06, 0.001); partial(o, 0, 1380, 0.3, 0.03, 0.001); noiseBurst(o, 0, 0.03, 0.5, 2400, 0.006); } },
  ...Object.fromEntries(
    PENTATONIC.map((freq, i) => [
      `perfect-${i + 1}`,
      { seconds: 1.6, note: `Perfect, streak ${i + 1}: a capiz bell on ${['D5', 'E5', 'F♯5', 'A5', 'B5'][i]}`, make: (o: Signal) => { partial(o, 0, 520, 0.4, 0.05, 0.001); bell(o, 0.01, freq, 0.55); } },
    ]),
  ),
  widen: { seconds: 1.9, note: 'Perfect ×5: the five bells run up, the points widen', make: (o) => PENTATONIC.forEach((freq, i) => bell(o, i * 0.07, freq * 2, 0.32, 0.9)) },
  trim: {
    seconds: 0.6,
    note: 'Off-angle: paper tears and the sliver falls',
    make: (o) => {
      partial(o, 0, 520, 0.4, 0.05, 0.001);
      for (let k = 0; k < 7; k++) noiseBurst(o, 0.02 + k * 0.018, 0.05, 0.35 - k * 0.03, 1800 + k * 260, 0.02);
      noiseBurst(o, 0.15, 0.4, 0.2, 500, 0.15);
    },
  },
  danger: { seconds: 0.7, note: 'Points nearly too thin: a low double thump', make: (o) => { partial(o, 0, 72, 0.9, 0.09, 0.004); partial(o, 0.22, 66, 0.7, 0.1, 0.004); } },
  milestone: { seconds: 3.2, note: 'Milestone: a kulintang gong with a shimmer of bells', make: (o) => { gong(o, 0, 196, 0.55); [880, 1174.66, 1318.51].forEach((freq, i) => bell(o, 0.18 + i * 0.09, freq, 0.16, 1.4)); } },
  end: { seconds: 2.6, note: 'Run ends: three bells falling, D5 B4 G4', make: (o) => [587.33, 493.88, 392].forEach((freq, i) => bell(o, i * 0.32, freq, 0.42, 1.3)) },
  'star-rises': {
    seconds: 4.5,
    note: '100 rings: bells climb two octaves over a deep gong',
    make: (o) => {
      gong(o, 0, 98, 0.6);
      [...PENTATONIC.map((f) => f / 2), ...PENTATONIC, ...PENTATONIC.map((f) => f * 2)].forEach((freq, i) => bell(o, 0.2 + i * 0.11, freq, 0.22, 1.6));
    },
  },
};

const toWav = (signal: Signal) => {
  let peak = 1e-6;
  for (const v of signal) peak = Math.max(peak, Math.abs(v)); // a loop, not a spread: long sounds overflow the call stack
  const gain = 0.89 / peak; // normalise to about −1 dBFS
  const data = Buffer.alloc(signal.length * 2);
  signal.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * gain)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return { wav: Buffer.concat([header, data]), gain };
};

mkdirSync(OUT, { recursive: true });
const peaks: Record<string, { note: string; seconds: number; peaks: number[] }> = {};
for (const [name, sound] of Object.entries(SOUNDS)) {
  const signal = buffer(sound.seconds);
  sound.make(signal);
  const { wav, gain } = toWav(signal);
  writeFileSync(new URL(`${name}.wav`, OUT), wav);
  const bins = 96;
  const size = Math.ceil(signal.length / bins);
  peaks[name] = {
    note: sound.note,
    seconds: sound.seconds,
    peaks: Array.from({ length: bins }, (_, b) => Math.min(1, gain * Math.max(0, ...signal.slice(b * size, (b + 1) * size).map(Math.abs)))).map((v) => Math.round(v * 1000) / 1000),
  };
}
writeFileSync(PEAKS, JSON.stringify(peaks));
console.log(`wrote ${Object.keys(SOUNDS).length} sounds:`, Object.keys(SOUNDS).join(', '));
