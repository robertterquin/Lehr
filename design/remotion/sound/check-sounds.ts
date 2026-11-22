// Self-check for the generated sounds: run with `node sound/check-sounds.ts` after gen-sounds.ts.
// Checks each perfect chime is tuned to its note and that no file clips.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = new URL('../public/sfx/', import.meta.url);
const read = (name: string) => {
  const buf = readFileSync(new URL(name, DIR));
  const samples = new Float32Array((buf.length - 44) / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = buf.readInt16LE(44 + i * 2) / 32768;
  return samples;
};

/** Signal power at one frequency (Goertzel), over the first 0.4 s. */
const power = (s: Float32Array, freq: number) => {
  const n = Math.min(s.length, 0.4 * 44100);
  const k = 2 * Math.cos((2 * Math.PI * freq) / 44100);
  let a = 0;
  let b = 0;
  for (let i = 0; i < n; i++) [a, b] = [s[i] + k * a - b, a];
  return a * a + b * b - k * a * b;
};

const NOTES = [587.33, 659.25, 739.99, 880, 987.77];
NOTES.forEach((note, i) => {
  const s = read(`perfect-${i + 1}.wav`);
  const others = NOTES.filter((n) => n !== note).map((n) => power(s, n));
  assert.ok(power(s, note) > 10 * Math.max(...others), `perfect-${i + 1} is tuned to ${note} Hz`);
});

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.wav'))) {
  let peak = 0;
  for (const v of read(file)) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak < 0.95 && peak > 0.5, `${file} peak ${peak.toFixed(2)} is loud but not clipping`);
}
console.log('ok: chimes tuned D5 E5 F#5 A5 B5; no sound clips');
