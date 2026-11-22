import React from 'react';
import { C, Label, SANS, SERIF, Wordmark } from './kit';
import { P04Spinning, P05Perfect, P06PerfectFive, P07Trim, P08Danger, P11Results, P17StarRises } from './phone';
import { P19Lights } from './more';
import { S06ReducedMotion } from './states';
import PEAKS from './sound-peaks.json';

type Track = { name: string; from: number; to: number; ease: string; repeat?: boolean };
type Moment = { id: string; title: string; Screen: React.FC; text: string; span: number; tracks: Track[]; cues: { at: number; file: string }[] };

const MOMENTS: Moment[] = [
  {
    id: 'M1', title: 'A ring spins in', Screen: P04Spinning, span: 1.2,
    text: 'Fades and scales in from 96% while it spins. The spin is constant: no easing, so the player can read it. Each ring is 6°/s faster; the direction flips every 5 rings.',
    tracks: [{ name: 'Fade + scale in', from: 0, to: 0.15, ease: 'ease-out' }, { name: 'Spin', from: 0, to: 1.2, ease: 'linear' }],
    cues: [{ at: 0, file: 'ring-in' }],
  },
  {
    id: 'M2', title: 'Perfect lock', Screen: P05Perfect, span: 1.2,
    text: 'The ring snaps onto alignment, flashes gold and fades back. The callout pops in. Each perfect in a streak rings one note higher.',
    tracks: [{ name: 'Snap to angle', from: 0, to: 0.08, ease: 'ease-out' }, { name: 'Glow in / out', from: 0, to: 0.66, ease: '0.06 in · 0.6 out' }, { name: 'Callout', from: 0, to: 0.9, ease: 'back-out, holds' }],
    cues: [{ at: 0, file: 'perfect-1' }],
  },
  {
    id: 'M3', title: 'Perfect ×5: points widen', Screen: P06PerfectFive, span: 1.2,
    text: 'The points grow back 6° with a little overshoot, and the whole star swells 5% and settles. The meter fills with the same curve.',
    tracks: [{ name: 'Points widen', from: 0, to: 0.35, ease: 'back-out (2)' }, { name: 'Star pulse 5%', from: 0, to: 0.35, ease: 'up 0.12 · down' }, { name: 'Meter fill', from: 0, to: 0.35, ease: 'back-out (2)' }],
    cues: [{ at: 0, file: 'perfect-5' }, { at: 0.08, file: 'widen' }],
  },
  {
    id: 'M4', title: 'Off-angle: the trim', Screen: P07Trim, span: 1.4,
    text: 'The overhang is cut off and falls under gravity, drifting and tumbling slightly as it fades. The star gives a 2 px shake so the miss is felt.',
    tracks: [{ name: 'Shake 2 px', from: 0, to: 0.25, ease: 'decaying sine' }, { name: 'Sliver falls', from: 0, to: 1.2, ease: 'gravity (t²)' }, { name: 'Meter shrinks', from: 0, to: 0.2, ease: 'ease-out' }],
    cues: [{ at: 0, file: 'trim' }],
  },
  {
    id: 'M5', title: 'Danger', Screen: P08Danger, span: 2.2,
    text: 'Below 15° the screen edge breathes red once a second and the meter glows. A low double thump marks every new ring, like a heartbeat.',
    tracks: [{ name: 'Red vignette', from: 0, to: 2.2, ease: 'sine, 1 Hz', repeat: true }, { name: 'Meter glow', from: 0, to: 2.2, ease: 'held' }],
    cues: [{ at: 0, file: 'danger' }, { at: 1.1, file: 'danger' }],
  },
  {
    id: 'M6', title: 'Milestone', Screen: P19Lights, span: 2.8,
    text: 'The toast drops in and holds while the street changes: at 20 the string lights flicker on from left to right. The next ring waits 1.5 s so the moment lands.',
    tracks: [{ name: 'Toast in · hold · out', from: 0.2, to: 2.6, ease: 'back-out 0.3 · 0.3 out' }, { name: 'Lights flicker on', from: 0.2, to: 1.0, ease: 'stepped, left → right' }, { name: 'Pause before next ring', from: 0, to: 1.5, ease: '' }],
    cues: [{ at: 0, file: 'perfect-1' }, { at: 0.2, file: 'milestone' }],
  },
  {
    id: 'M7', title: 'The run ends', Screen: P11Results, span: 1.8,
    text: 'The last sliver falls, the star shrinks back to hang on its wire and dims, then the results rise into place. Three bells fall: D, B, G.',
    tracks: [{ name: 'Sliver falls', from: 0, to: 1.2, ease: 'gravity (t²)' }, { name: 'Star shrinks + dims', from: 0.2, to: 1.4, ease: 'ease-in-out cubic' }, { name: 'Results rise 40 px', from: 1.0, to: 1.4, ease: 'ease-out cubic' }],
    cues: [{ at: 0, file: 'trim' }, { at: 0.35, file: 'end' }],
  },
  {
    id: 'M8', title: 'The star rises at 100', Screen: P17StarRises, span: 3.2,
    text: 'The parol lifts off its wire into the sky, its rays open and the light beam falls on the street. Bells climb two octaves over a deep gong.',
    tracks: [{ name: 'Lift off the wire', from: 0, to: 2.5, ease: 'ease-in-out' }, { name: 'Rays open', from: 1.2, to: 2.5, ease: 'ease-out' }, { name: 'Text + buttons in', from: 2.5, to: 3.1, ease: 'ease-out' }],
    cues: [{ at: 0, file: 'star-rises' }],
  },
  {
    id: 'M9', title: 'Reduced motion', Screen: S06ReducedMotion, span: 1.2,
    text: 'When the system asks for less motion: rings still spin (it is the game), but shakes, pulses, falling slivers and fireworks become 0.15 s fades. Sounds stay.',
    tracks: [{ name: 'Every effect → fade', from: 0, to: 0.15, ease: 'linear' }, { name: 'Spin', from: 0, to: 1.2, ease: 'linear' }],
    cues: [{ at: 0, file: 'perfect-1' }],
  },
];

const Thumb: React.FC<{ Screen: React.FC; scale?: number }> = ({ Screen, scale = 0.5 }) => (
  <div style={{ width: 390 * scale, height: 844 * scale, borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.line}`, flexShrink: 0 }}>
    <div style={{ width: 390, height: 844, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
      <Screen />
    </div>
  </div>
);

/** One moment's tracks on a shared time axis, with its sound cues as gold markers. */
const Timeline: React.FC<{ moment: Moment }> = ({ moment }) => {
  const W = 300;
  const x = (s: number) => (s / moment.span) * W;
  const ticks = Array.from({ length: Math.floor(moment.span / 0.2) + 1 }, (_, i) => i * 0.2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {moment.tracks.map((track) => (
        <div key={track.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>{track.name}</span>
            <span style={{ color: C.faint, fontFamily: 'monospace', fontSize: 12 }}>{(track.to - track.from).toFixed(2)} s</span>
          </div>
          <svg width={W} height="14">
            <rect width={W} height="14" rx="3" fill="#1d1838" />
            <rect x={x(track.from)} width={Math.max(3, x(track.to) - x(track.from))} height="14" rx="3" fill={track.repeat ? 'url(#pulse)' : '#f2b632'} opacity="0.85" />
            <defs>
              <linearGradient id="pulse" x1="0" x2="0.1" spreadMethod="reflect">
                <stop offset="0" stopColor="#ff6a4a" />
                <stop offset="1" stopColor="#5a1e28" />
              </linearGradient>
            </defs>
          </svg>
          {track.ease && <span style={{ fontSize: 11, color: C.muted }}>{track.ease}</span>}
        </div>
      ))}
      <svg width={W} height="34" style={{ marginTop: 2 }}>
        <line x1="0" y1="8" x2={W} y2="8" stroke="#3a3160" />
        {ticks.map((s) => (
          <g key={s}>
            <line x1={x(s)} y1="4" x2={x(s)} y2="12" stroke="#3a3160" />
            {Math.round(s * 10) % 4 === 0 && (
              <text x={Math.min(W - 14, x(s))} y="26" fontSize="10" fill={C.faint} fontFamily="monospace">
                {s.toFixed(1)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {moment.cues.map((cue, i) => (
          <span key={i} style={{ fontSize: 12, padding: '4px 9px', borderRadius: 10, color: C.gold, background: 'rgba(255,210,122,0.1)', border: '1px solid rgba(255,210,122,0.4)' }}>
            ♪ {cue.file}.wav · {cue.at.toFixed(2)} s
          </span>
        ))}
      </div>
    </div>
  );
};

const Sheet: React.FC<{ width: number; height: number; subtitle: string; children: React.ReactNode }> = ({ width, height, subtitle, children }) => (
  <div style={{ width, height, background: 'linear-gradient(180deg, #140f30 0%, #0a0918 100%)', color: C.ink, fontFamily: SANS, padding: '64px 70px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 44 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
      <Wordmark size={72} />
      <span style={{ fontSize: 28, color: C.muted }}>{subtitle}</span>
    </div>
    {children}
  </div>
);

/** Easing curves used across the game, drawn as y over t. */
const CURVES: { name: string; use: string; f: (t: number) => number }[] = [
  { name: 'Linear', use: 'Ring spin', f: (t) => t },
  { name: 'Ease-out cubic', use: 'Results, meter, rays', f: (t) => 1 - (1 - t) ** 3 },
  { name: 'Back-out (2)', use: 'Widen, callouts, toast', f: (t) => 1 + 3 * (t - 1) ** 3 + 2 * (t - 1) ** 2 },
  { name: 'Gravity t²', use: 'Falling slivers', f: (t) => t * t },
  { name: 'Ease-in-out cubic', use: 'Star shrinks, star rises', f: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2) },
];

export const MS01MotionStoryboard: React.FC = () => (
  <Sheet width={1900} height={2080} subtitle="Motion storyboard · every moment, its timing, curve and sound">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
      {MOMENTS.map((moment) => (
        <div key={moment.id} style={{ display: 'flex', gap: 22, padding: 22, borderRadius: 22, background: C.surface, border: `1px solid ${C.line}` }}>
          <Thumb Screen={moment.Screen} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <Label color={C.gold}>{moment.id}</Label>
            <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.1 }}>{moment.title}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: C.muted }}>{moment.text}</span>
            <Timeline moment={moment} />
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <span style={{ fontFamily: SERIF, fontSize: 34 }}>Curves</span>
      <div style={{ display: 'flex', gap: 28 }}>
        {CURVES.map((curve) => {
          const points = Array.from({ length: 41 }, (_, i) => {
            const t = i / 40;
            return `${(10 + t * 200).toFixed(1)} ${(150 - curve.f(t) * 120).toFixed(1)}`;
          }).join(' L');
          return (
            <div key={curve.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 18, borderRadius: 18, background: C.surface, border: `1px solid ${C.line}` }}>
              <svg width="220" height="170" viewBox="0 0 220 170">
                <rect x="10" y="30" width="200" height="120" fill="none" stroke="#2f2856" />
                <path d={`M${points}`} fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{curve.name}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{curve.use}</span>
            </div>
          );
        })}
      </div>
    </div>
  </Sheet>
);

const SOUND_ROWS: { file: keyof typeof PEAKS; when: string }[] = [
  { file: 'ring-in', when: 'Each ring starts spinning' },
  { file: 'perfect-1', when: 'Perfect lock, streak 1 (6, 11…)' },
  { file: 'perfect-2', when: 'Perfect, streak 2' },
  { file: 'perfect-3', when: 'Perfect, streak 3' },
  { file: 'perfect-4', when: 'Perfect, streak 4' },
  { file: 'perfect-5', when: 'Perfect, streak 5 (with widen)' },
  { file: 'widen', when: 'Five perfects: the points widen' },
  { file: 'trim', when: 'Off-angle lock' },
  { file: 'danger', when: 'A ring spins in with points under 15°' },
  { file: 'milestone', when: 'Every 10 rings' },
  { file: 'end', when: 'The run ends' },
  { file: 'star-rises', when: '100 rings' },
  { file: 'tap', when: 'Buttons and toggles' },
];

const NOTES = ['D5', 'E5', 'F♯5', 'A5', 'B5'];

const Wave: React.FC<{ peaks: number[]; seconds: number; color: string }> = ({ peaks, seconds, color }) => {
  // Every waveform shares one time scale (4.5 s across), so lengths compare at a glance.
  const W = 620 * (seconds / 4.5);
  const bar = W / peaks.length;
  return (
    <svg width="620" height="56">
      <line x1="0" y1="28" x2="620" y2="28" stroke="#2f2856" />
      {peaks.map((p, i) => (
        <rect key={i} x={i * bar} y={28 - Math.max(0.5, p * 26)} width={Math.max(0.6, bar * 0.7)} height={Math.max(1, p * 52)} fill={color} />
      ))}
    </svg>
  );
};

export const DS02SoundDesign: React.FC = () => (
  <Sheet width={1900} height={1440} subtitle="Sound design · capiz bells, bamboo and a kulintang gong">
    <div style={{ display: 'grid', gridTemplateColumns: '1122px minmax(0, 1fr)', gap: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 26px', borderRadius: 22, background: C.surface, border: `1px solid ${C.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 260px 620px', alignItems: 'center', gap: 20, paddingBottom: 8, borderBottom: `1px solid ${C.line}` }}>
          <Label>File</Label>
          <Label>Plays when</Label>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Label>Waveform · 0 s</Label>
            <Label>4.5 s</Label>
          </div>
        </div>
        {SOUND_ROWS.map((row) => {
          const sound = PEAKS[row.file];
          const perfect = row.file.startsWith('perfect');
          const color = perfect || row.file === 'widen' || row.file === 'star-rises' ? '#ffd27a' : row.file === 'trim' || row.file === 'danger' ? '#ff9d8a' : row.file === 'milestone' || row.file === 'end' ? '#c9bfe0' : '#a99fc4';
          return (
            <div key={row.file} style={{ display: 'grid', gridTemplateColumns: '150px 260px 620px', alignItems: 'center', gap: 20, padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontFamily: 'monospace', fontSize: 15 }}>{row.file}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 14 }}>{row.when}</span>
                <span style={{ fontSize: 12, color: C.faint }}>{sound.note} · {sound.seconds} s</span>
              </div>
              <Wave peaks={sound.peaks} seconds={sound.seconds} color={color} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 26, borderRadius: 22, background: C.surface, border: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: SERIF, fontSize: 30 }}>The streak is a scale</span>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: C.muted }}>
            Each perfect in a row rings the next note of D major pentatonic, so a streak climbs and the fifth perfect lands on the top note just as the points widen. Any miss starts the climb again.
          </span>
          <svg width="100%" viewBox="0 0 640 230">
            {[0, 1, 2, 3, 4].map((line) => (
              <line key={line} x1="20" x2="620" y1={60 + line * 22} y2={60 + line * 22} stroke="#4a4166" />
            ))}
            {/* Treble staff: D5 on the 4th line from the bottom; A5 and B5 need a ledger line. Stems go down above the middle line. */}
            {[0, 1, 2, 4, 5].map((step, i) => {
              const cx = 100 + i * 110;
              const cy = 82 - step * 11;
              return (
                <g key={i}>
                  <ellipse cx={cx} cy={cy} rx="13" ry="9.5" fill="#ffd27a" transform={`rotate(-18 ${cx} ${cy})`} />
                  {step >= 4 && <line x1={cx - 22} x2={cx + 22} y1="38" y2="38" stroke="#4a4166" />}
                  <line x1={cx - 12} y1={cy} x2={cx - 12} y2={cy + 64} stroke="#ffd27a" strokeWidth="2.5" />
                  {i === 2 && <text x={cx - 40} y={cy + 8} fontSize="26" fill="#ffd27a">♯</text>}
                  <text x={cx} y="200" fontSize="18" fill={C.ink} textAnchor="middle" fontFamily={SANS}>{NOTES[i]}</text>
                  <text x={cx} y="222" fontSize="13" fill={C.faint} textAnchor="middle" fontFamily={SANS}>perfect {i + 1}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 26, borderRadius: 22, background: C.surface, border: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: SERIF, fontSize: 30 }}>Instruments</span>
          {[
            ['Capiz bell', 'Glass-like partials at 1, 2.01, 2.76, 5.4 and 8.9× with a slow shimmer. Perfects, widen, the star rising.'],
            ['Bamboo knock', 'A short 520 Hz knock under every lock, so a tap always answers.'],
            ['Kulintang gong', 'Low partials at 1, 1.52, 2.11 and 2.98× with a 2.6 s ring. Milestones (G3) and the star rising (G2).'],
            ['Paper', 'Band-passed noise: the whoosh of a spinning ring and the tear of a trim.'],
            ['Heartbeat', 'Two thumps at 72 and 66 Hz when the points are thin.'],
          ].map(([name, text]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: C.muted }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 26, borderRadius: 22, background: C.surface, border: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: SERIF, fontSize: 30 }}>Rules</span>
          {[
            'All sounds are made in the browser with Web Audio: no sample files to download, the same recipe as these previews.',
            'Sound starts after the first tap (browsers block audio before it). The sound button in the HUD and Settings mutes it; the choice is remembered.',
            'Every sound peaks at −1 dBFS; the ring-in whoosh plays at −9 dB so the locks stand out.',
            'The music adds a layer every 10 rings, so the ear tracks progress. Carolers at 40 bring a tambourine rhythm.',
            'Haptics on phones: a light tick on lock, a double tick on perfect ×5, a long buzz when the run ends.',
          ].map((rule) => (
            <span key={rule} style={{ fontSize: 14, lineHeight: 1.5 }}>· {rule}</span>
          ))}
        </div>
      </div>
    </div>
  </Sheet>
);
