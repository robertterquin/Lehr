import React from 'react';
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadYoungSerif } from '@remotion/google-fonts/YoungSerif';
import { Night } from './Night';
import { DEMO, PERFECT_COUNT, START_WIDTH } from './parol';
import { Star, type DrawnRing, type Sliver } from './Star';

const { fontFamily: serif } = loadYoungSerif('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: sans } = loadManrope('normal', { weights: ['500', '700'], subsets: ['latin'] });

const INK = '#f7f0e3';
const MUTED = '#c9bfe0';
const GOLD = '#ffd27a';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** The finished star from the demo run, all rings lit. */
const finishedRings: DrawnRing[] = DEMO.map((ring) => ({ index: ring.index, width: ring.width, rotation: ring.rotation, glow: 0, sheen: ring.perfect ? 0.55 : 0.2 }));

const TitleSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: sans, color: INK }}>
      <Night twinkle={frame / fps} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 300 }}>
        <div style={{ opacity: interpolate(frame, [0, 0.8 * fps], [0, 1], { ...clamp, easing: ease }), scale: interpolate(frame, [0, 2.5 * fps], [0.9, 1], clamp) }}>
          <Star size={620} rings={finishedRings} light={interpolate(frame, [0.3 * fps, 1.6 * fps], [0, 1], clamp)} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 440, gap: 24 }}>
        <div style={{ fontFamily: serif, fontSize: 200, lineHeight: 1, opacity: interpolate(frame, [0.4 * fps, 1.1 * fps], [0, 1], clamp), translate: `0 ${interpolate(frame, [0.4 * fps, 1.1 * fps], [40, 0], { ...clamp, easing: ease })}px` }}>
          Parol
        </div>
        <div style={{ fontSize: 60, color: MUTED, opacity: interpolate(frame, [0.9 * fps, 1.6 * fps], [0, 1], clamp) }}>Spin. Lock. Light the star.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const TitleScene = Interactive.create({ Component: TitleSceneInner, layout: 'absolute-fill' });

const GameplaySceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const locked = DEMO.filter((ring) => ring.lockAt <= t);
  const current = DEMO.find((ring) => ring.startAt <= t && t < ring.lockAt) ?? null;
  const last = locked[locked.length - 1];
  const sinceLock = last ? t - last.lockAt : Infinity;

  const rings: DrawnRing[] = locked.map((ring) => {
    const dt = t - ring.lockAt;
    const width = ring.widened ? interpolate(dt, [0, 0.35], [ring.fromWidth, ring.width], { ...clamp, easing: ease }) : ring.width;
    return { index: ring.index, width, rotation: ring.rotation, glow: ring.perfect ? interpolate(dt, [0, 0.6], [1, 0], clamp) : 0, sheen: ring.perfect ? 0.55 : 0.2 };
  });
  const slivers: Sliver[] = locked
    .filter((ring) => !ring.perfect && t - ring.lockAt < 1.2)
    .map((ring) => ({ index: ring.index, width: ring.fromWidth, rotation: ring.fromRotation, delta: ring.delta, fall: (t - ring.lockAt) / 1.2 }));
  const speed = 150 + (current?.index ?? 0) * 14;
  const spinning = current
    ? {
        index: current.index,
        width: current.fromWidth,
        rotation: current.fromRotation + current.delta + current.direction * speed * (current.lockAt - t),
        opacity: interpolate(t - current.startAt, [0, 0.15], [0, 1], clamp),
      }
    : null;
  const guide = current ? { index: current.index, width: current.fromWidth, rotation: current.fromRotation } : null;

  const streak = last ? last.streak * (last.perfect ? 1 : 0) : 0;
  const litPips = streak > 0 && streak % 5 === 0 ? 5 : streak % 5;
  const width = rings[rings.length - 1]?.width ?? START_WIDTH;
  const callout = !last || sinceLock > 0.9 ? null : last.widened ? 'Perfect ×5' : last.perfect ? 'Perfect' : `${Math.abs(last.delta)}° off`;
  const calloutNote = !last || sinceLock > 0.9 ? '' : last.widened ? 'the points widen back' : last.perfect ? '' : 'the overhang is trimmed';
  const tapPulse = last ? interpolate(sinceLock, [0, 0.45], [0, 1], clamp) : 1;

  return (
    <AbsoluteFill style={{ fontFamily: sans, color: INK }}>
      <Night twinkle={t} />

      <AbsoluteFill style={{ padding: '120px 90px 0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 36, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED }}>Rings</span>
          <span style={{ fontFamily: serif, fontSize: 150, lineHeight: 1 }}>{locked.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, paddingTop: 20 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="54" height="54" viewBox="0 0 16 16">
                <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.8L3.5 15L5 9.5L1 6H6Z" fill={i < litPips ? GOLD : '#1d1838'} stroke={i < litPips ? '#b8862a' : '#3a3160'} strokeWidth="1" />
              </svg>
            ))}
          </div>
          <span style={{ fontSize: 36, color: MUTED }}>{streak === 0 ? 'No streak' : `${streak} perfect in a row`}</span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 300 }}>
        <Star size={900} rings={rings} spinning={spinning} guide={guide} slivers={slivers} light={Math.min(1, 0.25 + locked.length * 0.07)} />
      </AbsoluteFill>

      {callout && (
        <AbsoluteFill style={{ top: 1290, alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: serif,
              fontSize: 110,
              color: last?.perfect ? GOLD : '#ff9d8a',
              scale: interpolate(sinceLock, [0, 0.25], [0.7, 1], { ...clamp, easing: ease }),
              opacity: interpolate(sinceLock, [0, 0.1, 0.7, 0.9], [0, 1, 1, 0], clamp),
            }}
          >
            {callout}
          </span>
          <span style={{ fontSize: 46, color: MUTED, opacity: interpolate(sinceLock, [0, 0.1, 0.7, 0.9], [0, 1, 1, 0], clamp) }}>{calloutNote}</span>
        </AbsoluteFill>
      )}

      <div style={{ position: 'absolute', top: 1590, left: 120, right: 120, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 40, color: MUTED }}>
          <span>
            Point width <strong style={{ color: INK }}>{Math.round(width)}°</strong>
          </span>
          <span>min 8°</span>
        </div>
        <div style={{ position: 'relative', height: 20, borderRadius: 10, background: '#241d44' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${(width / START_WIDTH) * 100}%`, borderRadius: 10, background: 'linear-gradient(90deg, #d8342c, #f2b632)' }} />
          <div style={{ position: 'absolute', left: '22%', top: -8, width: 4, height: 36, background: '#ff8a7a' }} />
        </div>
      </div>

      <AbsoluteFill style={{ top: 1730, alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 400, height: 100 }}>
          <div
            style={{
              position: 'absolute',
              width: 90,
              height: 90,
              borderRadius: 45,
              border: `4px solid ${GOLD}`,
              scale: interpolate(tapPulse, [0, 1], [0.6, 2.2]),
              opacity: 1 - tapPulse,
            }}
          />
          <span style={{ fontSize: 46 }}>Tap to lock</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const GameplayScene = Interactive.create({ Component: GameplaySceneInner, layout: 'absolute-fill' });

const FinaleSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const swing = Math.sin(t * 2.2) * interpolate(t, [0, 3], [6, 2], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: sans, color: INK }}>
      <Night twinkle={t} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <path d="M0 120C330 210 750 210 1080 120" stroke="#4a4166" strokeWidth="4" fill="none" />
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 186 }}>
        <div style={{ rotate: `${swing}deg`, transformOrigin: '50% 0%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 4, height: 90, background: '#4a4166' }} />
          <div style={{ scale: interpolate(frame, [0, 0.8 * fps], [0.85, 1], { ...clamp, easing: ease }) }}>
            <Star size={760} rings={finishedRings} light={interpolate(frame, [0, 0.8 * fps], [0.6, 1], clamp)} tailSway={swing * 2} />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1180, alignItems: 'center', gap: 16, opacity: interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], clamp) }}>
        <span style={{ fontFamily: serif, fontSize: 130 }}>{DEMO.length} rings lit</span>
        <span style={{ fontSize: 56, color: GOLD }}>{PERFECT_COUNT} perfect</span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const FinaleScene = Interactive.create({ Component: FinaleSceneInner, layout: 'absolute-fill' });

const EndCardInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = interpolate(frame, [0, 0.6 * fps], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ fontFamily: sans, color: INK }}>
      <Night twinkle={frame / fps} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 32, opacity: show }}>
        <span style={{ fontFamily: serif, fontSize: 220, lineHeight: 1 }}>Parol</span>
        <span style={{ fontSize: 64, color: MUTED, textAlign: 'center', padding: '0 120px' }}>A new star to light every night</span>
        <span style={{ fontSize: 48, color: GOLD, marginTop: 40 }}>Coming soon</span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const EndCard = Interactive.create({ Component: EndCardInner, layout: 'absolute-fill' });
