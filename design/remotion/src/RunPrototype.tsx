import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Parol } from './ParolStar';
import { playLocks, type LockedRing } from './parol';
import { C, Hud, Label, SANS, SERIF, StatTile, Street, WidthMeter, type Stage } from './mockups/kit';
import { MilestoneToast } from './mockups/phone';

// One scripted run under the real rules: a miss, five perfects that widen, the 10-ring halo, the 20-ring
// street lights, two bad misses into danger, then a 7° miss that leaves the points too thin (run ends at 23).
const LOCKS = [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, -7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 9, -8, 0, 7];
const DANGER_BELOW = 15;
const MILESTONES: Record<number, string> = { 10: 'Your parol earned a halo', 20: 'The street lights come on' };

type Timed = LockedRing & { startAt: number; lockAt: number; direction: 1 | -1 };
const RUN: Timed[] = (() => {
  let clock = 1.2;
  return playLocks(LOCKS).map((ring) => {
    const spin = Math.max(0.72, 1.1 - ring.index * 0.018);
    const timed: Timed = { ...ring, startAt: clock, lockAt: clock + spin, direction: Math.floor(ring.index / 5) % 2 === 0 ? 1 : -1 };
    clock += spin + (MILESTONES[ring.index + 1] ? 1.5 : 0.32);
    return timed;
  });
})();
const FAIL = RUN[RUN.length - 1];
const SCORE = RUN.length - 1;
export const RUN_SECONDS = FAIL.lockAt + 5;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const backOut = Easing.out(Easing.back(2));

/** Every sound cue of the run, in seconds: what the game would play through Web Audio. */
type Cue = { at: number; file: string; volume?: number };
const CUES: Cue[] = [
  { at: 0.3, file: 'tap' },
  ...RUN.flatMap((ring) => {
    const cues: Cue[] = [{ at: ring.startAt, file: 'ring-in', volume: 0.35 }];
    if (ring.fromWidth < DANGER_BELOW) cues.push({ at: ring.startAt + 0.05, file: 'danger', volume: 0.8 });
    if (ring === FAIL) return [...cues, { at: ring.lockAt, file: 'trim' }, { at: ring.lockAt + 0.35, file: 'end' }];
    cues.push(ring.perfect ? { at: ring.lockAt, file: `perfect-${((ring.streak - 1) % 5) + 1}`, volume: 0.8 } : { at: ring.lockAt, file: 'trim' });
    if (ring.widened) cues.push({ at: ring.lockAt + 0.08, file: 'widen', volume: 0.7 });
    if (MILESTONES[ring.index + 1]) cues.push({ at: ring.lockAt + 0.2, file: 'milestone' });
    return cues;
  }),
];

const Toast: React.FC<{ t: number }> = ({ t }) => {
  const ring = RUN.find((r) => MILESTONES[r.index + 1] && t >= r.lockAt + 0.2 && t < r.lockAt + 2.6);
  if (!ring) return null;
  const dt = t - ring.lockAt - 0.2;
  const show = interpolate(dt, [0, 0.3], [0, 1], { ...clamp, easing: backOut }) * interpolate(dt, [2.1, 2.4], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, show), translate: `0 ${(1 - show) * -16}px` }}>
      <MilestoneToast rings={ring.index + 1} text={MILESTONES[ring.index + 1]} />
    </div>
  );
};

/** Street lights at 20 rings: they flicker on, left to right, over 0.8 s. */
const StreetLayer: React.FC<{ t: number }> = ({ t }) => {
  const at = RUN[19].lockAt + 0.2;
  const stage: Stage = t >= RUN[9].lockAt ? 1 : 0;
  const sweep = interpolate(t, [at, at + 0.8], [0, 1], clamp);
  const flicker = sweep >= 1 ? 1 : [0.2, 0.9, 0.35, 1, 0.6, 1][Math.floor(sweep * 6) % 6];
  const edge = sweep * 130 - 15;
  return (
    <>
      <Street stage={stage} />
      {sweep > 0 && (
        <div style={{ position: 'absolute', inset: 0, background: C.night, opacity: flicker, maskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 15}%)` }}>
          <Street stage={2} />
        </div>
      )}
    </>
  );
};

const Results: React.FC<{ t: number }> = ({ t }) => {
  const rise = interpolate(t, [FAIL.lockAt + 1, FAIL.lockAt + 1.4], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (rise <= 0) return null;
  const perfect = RUN.filter((r) => r.perfect).length;
  return (
    <div style={{ position: 'absolute', left: 20, right: 20, top: 456, opacity: rise, translate: `0 ${(1 - rise) * 40}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
      <Label>Run ended</Label>
      <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1 }}>The points got too thin</span>
      <span style={{ fontSize: 13, color: C.muted }}>
        Ring {SCORE + 1} locked {FAIL.delta}° off, leaving {FAIL.width}° points (8° needed)
      </span>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 8 }}>
        <StatTile value={String(SCORE)} label="rings" />
        <StatTile value={String(perfect)} label="perfect" color={C.gold} />
        <StatTile value="#9" label="today" />
      </div>
    </div>
  );
};

export const RunPrototype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const locked = RUN.filter((r) => r.lockAt <= t);
  const current = RUN.find((r) => r.startAt <= t && t < r.lockAt) ?? null;
  const last = locked[locked.length - 1];
  const dt = last ? t - last.lockAt : Infinity;
  const ended = t >= FAIL.lockAt;

  // The ring spins in towards alignment and is `delta` degrees off when the player taps.
  const active = current ?? RUN.find((r) => r.startAt > t) ?? FAIL; // keeps the spin label steady between rings
  const speed = 150 + active.index * 6;
  const spin = current ? current.delta + current.direction * speed * (current.lockAt - t) : null;
  const glow = last?.perfect && !ended ? interpolate(dt, [0, 0.06, 0.66], [0, 1, 0], clamp) : 0;
  const fall = last && !last.perfect && dt < 1.2 ? dt / 1.2 : undefined;
  const pulse = last?.widened ? interpolate(dt, [0, 0.12, 0.35], [0, 1, 0], clamp) : 0;
  const shake = last && !last.perfect && dt < 0.25 ? 2 * Math.sin(dt * 90) * (1 - dt / 0.25) : 0;
  const sink = ended ? interpolate(dt, [0.2, 1.4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;

  const width = !last ? 36 : last.widened ? Math.round(interpolate(dt, [0, 0.35], [last.fromWidth, last.width], { ...clamp, easing: backOut })) : Math.max(0, last.width);
  const danger = (current?.fromWidth ?? last?.width ?? 36) < DANGER_BELOW;
  const streak = last && last.perfect && !ended ? last.streak : 0;
  const callout = !last || dt > 0.9 || ended ? null : last.widened ? ['Perfect ×5', 'The points widen back', C.gold] : last.perfect ? ['Perfect', '', C.gold] : [`${Math.abs(last.delta)}° off`, 'The overhang is trimmed', C.coral];

  return (
    <AbsoluteFill style={{ background: C.night, color: C.ink, fontFamily: SANS, overflow: 'hidden' }}>
      <StreetLayer t={t} />
      {danger && !ended && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(255,80,60,0.4)', opacity: 0.55 + 0.45 * Math.sin(t * Math.PI * 2) }} />}
      <Hud rings={ended ? SCORE : locked.length} streak={streak} />
      <Toast t={t} />

      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 84,
          width: 330,
          translate: `${shake}px ${-10 * sink}px`,
          scale: String(1 + 0.05 * pulse - 0.36 * sink),
          transformOrigin: '50% 0%',
        }}
      >
        <Parol size={330} locks={locked.map((r) => r.delta)} spin={spin} glow={glow} trimLast={fall !== undefined} fall={fall} danger={danger && !ended} light={ended ? 1 - 0.35 * sink : 1} />
      </div>

      {callout && (
        <div style={{ position: 'absolute', left: 20, right: 20, top: 538, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: interpolate(dt, [0, 0.08, 0.7, 0.9], [0, 1, 1, 0], clamp), scale: String(interpolate(dt, [0, 0.15], [0.9, 1], { ...clamp, easing: backOut })) }}>
          <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1, color: callout[2] }}>{callout[0]}</span>
          {callout[1] && <span style={{ fontSize: 13, color: C.muted }}>{callout[1]}</span>}
        </div>
      )}
      {!ended && (
        <div style={{ position: 'absolute', left: 40, right: 40, top: 608 }}>
          <WidthMeter width={width} rings={active.index} danger={danger} />
        </div>
      )}
      {t < RUN[0].startAt + 0.4 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', opacity: interpolate(t, [RUN[0].startAt, RUN[0].startAt + 0.4], [1, 0], clamp) }}>
          <span style={{ fontSize: 13, padding: '7px 14px', borderRadius: 16, background: 'rgba(10,9,24,0.7)' }}>Tap to lock the spinning ring</span>
        </div>
      )}
      <Results t={t} />

      {CUES.map((cue, i) => (
        <Sequence key={i} from={Math.round(cue.at * fps)} layout="none">
          <Audio src={staticFile(`sfx/${cue.file}.wav`)} volume={cue.volume ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
