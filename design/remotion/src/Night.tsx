import React from 'react';
import { AbsoluteFill } from 'remotion';

/** Night sky over a row of barrio rooftops with lit windows and a string of lights. */
export const Night: React.FC<{ twinkle?: number }> = ({ twinkle = 0 }) => (
  <AbsoluteFill style={{ background: 'radial-gradient(120% 70% at 50% 30%, #241a4a 0%, #120f2c 55%, #0a0918 100%)' }}>
    <svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
      {[[40, 120], [350, 90], [300, 200], [70, 260], [360, 330], [20, 400], [190, 60], [250, 140]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill="#fff" opacity={0.35 + 0.35 * Math.abs(Math.sin(twinkle + i))} />
      ))}
      <path d="M0 740L30 740L30 712L58 694L86 712L86 740L120 740L120 722L150 704L180 722L180 740L214 740L214 716L248 696L282 716L282 740L310 740L310 724L338 708L366 724L366 740L390 740V844H0Z" fill="#090713" />
      <rect x="52" y="718" width="10" height="10" fill="#ffc96b" opacity="0.8" />
      <rect x="146" y="726" width="9" height="9" fill="#ffc96b" opacity="0.7" />
      <rect x="240" y="720" width="10" height="10" fill="#ffc96b" opacity="0.8" />
      <rect x="332" y="728" width="9" height="9" fill="#ffc96b" opacity="0.6" />
      <path d="M0 700C100 712 290 712 390 700" stroke="#2a2340" strokeWidth="1.2" fill="none" />
      {[[70, 706, '#f2b632'], [160, 711, '#d8342c'], [250, 711, '#2e9a5a'], [330, 705, '#2f6fd0']].map(([x, y, color], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color as string} opacity={0.6 + 0.4 * Math.abs(Math.sin(twinkle * 1.3 + i))} />
      ))}
    </svg>
  </AbsoluteFill>
);
