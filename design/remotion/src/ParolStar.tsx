import React, { useId } from 'react';
import { PALETTE, playLocks, radii, sliverPath, starPath } from './parol';

const BAMBOO = '#5b3a1c';
const BAMBOO_SHEEN = '#c8995a';
const CENTER = 150;

const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
const mix = (from: string, to: string, t: number) =>
  `rgb(${[0, 1, 2].map((i) => Math.round(channel(from, i) + (channel(to, i) - channel(from, i)) * t)).join(' ')})`;

const tip = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
};

type Props = {
  size: number
  /** Lock errors in degrees, one per locked ring (0 = perfect). */
  locks: number[]
  /** A ring spinning in, this many degrees past alignment. */
  spin?: number | null
  /** Show the last ring's trimmed overhang falling away. */
  trimLast?: boolean
  glowLast?: boolean
  light?: number
  halo?: 0 | 1 | 2
  /** Unlit preview: paper not yet glowing. */
  dim?: boolean
  danger?: boolean
  sway?: number
  /** Star only, no tails, in a square box: for small icons. */
  compact?: boolean
};

/**
 * A parol: concentric five-pointed rings of backlit paper on a bamboo frame, a tambor (drum) at the
 * centre, two fringed tails (buntot) with tassels, and optional halos with bulbs like Pampanga lanterns.
 */
export const Parol: React.FC<Props> = ({ size, locks, spin = null, trimLast = false, glowLast = false, light = 1, halo = 0, dim = false, danger = false, sway = 0, compact = false }) => {
  const id = useId().replace(/:/g, '');
  const rings = playLocks(locks);
  const last = rings[rings.length - 1];
  const outerIndex = Math.max(0, rings.length - 1 + (spin !== null ? 1 : 0));
  const outer = radii(outerIndex).ro;
  const haloR = outer + 16;
  const glow = dim ? 0.12 : light;
  // The camera pulls back as the star grows, so even a 40-ring parol fits the frame.
  const fit = Math.min(1, 138 / (halo > 0 ? haloR + (halo - 1) * 12 : outer));
  const camera = `translate(${CENTER} ${CENTER}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-CENTER})`;

  // Tails hang from the tips of the two lower points of the outermost ring.
  const tails = [54, 126].map((deg, side) => {
    const [x, y] = tip(radii(Math.max(0, rings.length - 1)).ro - 4, deg + (last?.rotation ?? 0));
    const dir = side === 0 ? 1 : -1;
    const strand = (dx: number, len: number, wobble: number) =>
      `M${x + dx} ${y}C${x + dx + dir * (10 + sway)} ${y + len * 0.35} ${x + dx - dir * (wobble - sway)} ${y + len * 0.65} ${x + dx + dir * (4 + sway * 1.4)} ${y + len}`;
    return { x, y, dir, strands: [strand(-3, 112, 10), strand(0, 120, 14), strand(3, 106, 9)], end: [x + dir * (4 + sway * 1.4), y + 120] as [number, number] };
  });

  const ringFill = (index: number) => `url(#${id}-paper-${index % PALETTE.length})`;

  return (
    <svg width={size} height={compact ? size : (size * 420) / 300} viewBox={compact ? '0 0 300 300' : '0 0 300 420'} style={{ overflow: 'visible' }}>
      <defs>
        {PALETTE.map((color, i) => (
          <radialGradient key={i} id={`${id}-paper-${i}`} gradientUnits="userSpaceOnUse" cx={CENTER} cy={CENTER} r="150">
            <stop offset="0" stopColor={mix(color, '#fffaf0', dim ? 0.1 : 0.6)} />
            <stop offset="0.45" stopColor={color} />
            <stop offset="1" stopColor={mix(color, '#120a04', 0.28)} />
          </radialGradient>
        ))}
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={danger ? '#ff6a4a' : '#ffbe5a'} stopOpacity={0.55 * glow} />
          <stop offset="1" stopColor="#ffbe5a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-tambor`}>
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.6" stopColor={dim ? '#8a7650' : '#ffe39a'} />
          <stop offset="1" stopColor={dim ? '#5a4a30' : '#f2b632'} />
        </radialGradient>
        <filter id={`${id}-bulb`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <g transform={camera}>
      <circle cx={CENTER} cy={CENTER} r={outer + 60} fill={`url(#${id}-halo)`} />

      {/* Halos: bamboo hoops wrapped in gold paper, with bulbs */}
      {Array.from({ length: halo }, (_, h) => {
        const r = haloR + h * 12;
        return (
          <g key={h}>
            <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke="#f2b632" strokeWidth="6" opacity={dim ? 0.15 : 0.35} />
            <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke={BAMBOO} strokeWidth="1.8" />
            {!dim &&
              Array.from({ length: 15 }, (_, k) => {
                const [bx, by] = tip(r, k * 24 + h * 12);
                return <circle key={k} cx={bx} cy={by} r="2.2" fill="#fff6d6" />;
              })}
          </g>
        );
      })}

      {/* Buntot: fringed crepe-paper tails with tassels */}
      {rings.length > 0 &&
        !compact &&
        tails.map((tail, side) => (
          <g key={side} opacity={dim ? 0.4 : 1}>
            {tail.strands.map((d, s) => (
              <path key={s} d={d} fill="none" stroke={['#f2b632', '#d8342c', '#f4ecd8'][s]} strokeWidth="2.6" strokeLinecap="round" />
            ))}
            <path d={`M${tail.end[0]} ${tail.end[1] - 4}l-5 6l5 14l5 -14z`} fill="#d8342c" stroke={BAMBOO} strokeWidth="0.8" />
            {[-4, -2, 0, 2, 4].map((dx) => (
              <path key={dx} d={`M${tail.end[0] + dx * 0.6} ${tail.end[1] + 14}l${dx * 0.5} 9`} stroke="#f2b632" strokeWidth="1" />
            ))}
          </g>
        ))}

      {/* The ring spinning in, with a gold guide where the points sit */}
      {spin !== null && (
        <g>
          <path d={starPath(rings.length, last?.width ?? 36, last?.rotation ?? 0)} fill="none" stroke="#ffd27a" strokeWidth="1.6" strokeDasharray="4 4" />
          {[0.12, 0.24].map((opacity, n) => (
            <path key={n} d={starPath(rings.length, last?.width ?? 36, (last?.rotation ?? 0) + spin - (n === 0 ? 14 : 7))} fill={PALETTE[rings.length % PALETTE.length]} opacity={opacity} />
          ))}
          <path d={starPath(rings.length, last?.width ?? 36, (last?.rotation ?? 0) + spin)} fill={ringFill(rings.length)} fillOpacity="0.92" stroke={BAMBOO} strokeWidth="2" strokeLinejoin="round" />
        </g>
      )}

      {/* Trimmed overhang falling away */}
      {trimLast && last && !last.perfect && (
        <path
          d={sliverPath(last.index, last.fromWidth, last.fromRotation, last.delta)}
          fill={ringFill(last.index)}
          stroke={BAMBOO}
          strokeWidth="1.2"
          opacity="0.8"
          style={{ translate: '16px 52px', rotate: '14deg', transformOrigin: '150px 150px' }}
        />
      )}

      {/* Locked rings, outside in, so each inner ring leaves a coloured rim */}
      {[...rings].reverse().map((ring) => (
        <g key={ring.index} style={glowLast && ring.index === last?.index ? { filter: 'drop-shadow(0 0 9px rgba(255, 214, 130, 0.95))' } : undefined}>
          <path d={starPath(ring.index, ring.width, ring.rotation)} fill={ringFill(ring.index)} fillOpacity={dim ? 0.3 : 1} stroke={dim ? 'rgba(244,236,216,0.35)' : BAMBOO} strokeWidth="2" strokeLinejoin="round" />
          {!dim && <path d={starPath(ring.index, ring.width, ring.rotation)} fill="none" stroke={BAMBOO_SHEEN} strokeWidth="0.6" opacity="0.5" strokeLinejoin="round" />}
        </g>
      ))}

      {/* Bulbs on the points of perfect rings */}
      {!dim &&
        rings
          .filter((ring) => ring.perfect)
          .map((ring) =>
            [0, 1, 2, 3, 4].map((k) => {
              const [bx, by] = tip(radii(ring.index).ro - 3, ring.rotation + k * 72 - 90);
              return (
                <g key={`${ring.index}-${k}`}>
                  <circle cx={bx} cy={by} r="4" fill="#ffe7a8" opacity={0.6 * glow} filter={`url(#${id}-bulb)`} />
                  <circle cx={bx} cy={by} r="1.6" fill="#fffaf0" opacity={glow} />
                </g>
              );
            }),
          )}

      {/* Tambor: the drum at the centre */}
      <circle cx={CENTER} cy={CENTER} r="17" fill={`url(#${id}-tambor)`} stroke={BAMBOO} strokeWidth="2" />
      <circle cx={CENTER} cy={CENTER} r="10" fill="none" stroke={BAMBOO} strokeWidth="0.9" opacity="0.8" />
      {Array.from({ length: 8 }, (_, k) => {
        const [sx, sy] = tip(10, k * 45);
        const [ex, ey] = tip(17, k * 45);
        return <path key={k} d={`M${sx} ${sy}L${ex} ${ey}`} stroke={BAMBOO} strokeWidth="0.8" opacity="0.8" />;
      })}
      </g>
    </svg>
  );
};
