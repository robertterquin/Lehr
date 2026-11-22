import React from 'react';
import { BAMBOO, PALETTE, radii, sliverPath, starPath } from './parol';

export type DrawnRing = { index: number; width: number; rotation: number; glow: number; sheen: number };
export type Sliver = { index: number; width: number; rotation: number; delta: number; fall: number };

type Props = {
  size: number
  rings: DrawnRing[]
  spinning?: { index: number; width: number; rotation: number; opacity: number } | null
  guide?: { index: number; width: number; rotation: number } | null
  slivers?: Sliver[]
  light: number
  tailSway?: number
};

/** A parol in a 300×380 box: rings from the outside in, so each inner ring leaves a coloured rim. */
export const Star: React.FC<Props> = ({ size, rings, spinning, guide, slivers = [], light, tailSway = 0 }) => {
  const outer = radii(Math.max(0, rings.length - 1)).rv;
  const tail = (dx: number, sway: number) =>
    `M${150 + dx} ${150 + outer}C${150 + dx + sway} ${200 + outer} ${150 + dx - sway} ${250 + outer * 0.5} ${150 + dx + sway * 0.5} ${300 + outer * 0.3}`;
  return (
    <svg width={size} height={(size * 380) / 300} viewBox="0 0 300 380" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="halo">
          <stop offset="0" stopColor="#ffbe5a" stopOpacity={0.5 * light} />
          <stop offset="1" stopColor="#ffbe5a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="sheen" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="170" fill="url(#halo)" />
      {rings.length > 0 && (
        <g opacity={0.35 + 0.65 * light}>
          <path d={tail(-10, 14 + tailSway) + tail(16, -12 - tailSway)} fill="none" stroke="#f2b632" strokeWidth="3" strokeLinecap="round" />
          <path d={tail(4, 10 + tailSway)} fill="none" stroke="#d8342c" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {guide && <path d={starPath(guide.index, guide.width, guide.rotation)} fill="none" stroke="#ffd27a" strokeWidth="1.6" strokeDasharray="4 4" />}
      {spinning && (
        <path
          d={starPath(spinning.index, spinning.width, spinning.rotation)}
          fill={PALETTE[spinning.index % 6]}
          fillOpacity={0.9 * spinning.opacity}
          stroke={BAMBOO}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}
      {slivers.map((s) => (
        <path
          key={`sliver-${s.index}`}
          d={sliverPath(s.index, s.width, s.rotation, s.delta)}
          fill={PALETTE[s.index % 6]}
          stroke={BAMBOO}
          strokeWidth="1.2"
          opacity={1 - s.fall}
          style={{ translate: `${s.fall * 30}px ${s.fall * s.fall * 260}px`, rotate: `${s.fall * 30}deg`, transformOrigin: '150px 150px' }}
        />
      ))}
      {[...rings].reverse().map((ring) => (
        <g key={ring.index} style={ring.glow > 0 ? { filter: `drop-shadow(0 0 ${4 + 12 * ring.glow}px rgba(255, 214, 130, ${ring.glow}))` } : undefined}>
          <path d={starPath(ring.index, ring.width, ring.rotation)} fill={PALETTE[ring.index % 6]} stroke={BAMBOO} strokeWidth="1.6" strokeLinejoin="round" />
          <path d={starPath(ring.index, ring.width, ring.rotation)} fill="url(#sheen)" opacity={ring.sheen} />
        </g>
      ))}
      <circle cx="150" cy="150" r="13" fill={light > 0.05 ? '#ffd27a' : '#6b5a3a'} />
      <circle cx="150" cy="150" r="5" fill="#fffaf0" opacity={0.3 + 0.7 * light} />
    </svg>
  );
};
