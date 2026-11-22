import React from 'react';

/**
 * The barangay street at night, drawn from Filipino references: a bahay kubo (thatch, bamboo, stilts),
 * a concrete row house with a sari-sari store, and a bahay na bato (stone ground floor, capiz windows,
 * tile roof); a concrete utility pole with tangled wires and a sodium street lamp; coconut palms; and the
 * parish church at the end of the street. All in a 390×844 box, anchored to the bottom.
 */

export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const GROUND = 812;
export const BULBS = ['#f2b632', '#d8342c', '#2e9a5a', '#2f6fd0', '#f4ecd8', '#c43a8a'];
export const WARM = '#ffc96b';

export const starPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, k) => {
    const a = ((k * 36 - 90) * Math.PI) / 180;
    const rr = k % 2 === 0 ? r : r * 0.42;
    return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join('L');

/** A small parol hanging on a string: star, hoop, tambor and two tails with tassels. */
export const MiniParol: React.FC<{ x: number; y: number; r: number; color: string; lit: boolean; string?: number }> = ({ x, y, r, color, lit, string = 10 }) => (
  <g>
    <path d={`M${x} ${y - r * 1.25 - string}V${y - r * 1.25}`} stroke="#5c5470" strokeWidth="0.6" />
    {lit && <circle cx={x} cy={y} r={r * 2.6} fill={color} opacity="0.2" />}
    <path d={`M${x - r * 0.35} ${y + r * 0.55}q${-r * 0.3} ${r * 1.2} ${-r * 0.1} ${r * 2}M${x + r * 0.35} ${y + r * 0.55}q${r * 0.3} ${r * 1.2} ${r * 0.1} ${r * 2}`} stroke={lit ? '#f2b632' : '#3a3150'} strokeWidth="0.9" fill="none" />
    <circle cx={x - r * 0.45} cy={y + r * 2.6} r={r * 0.16} fill={lit ? '#d8342c' : '#2e2846'} />
    <circle cx={x + r * 0.45} cy={y + r * 2.6} r={r * 0.16} fill={lit ? '#d8342c' : '#2e2846'} />
    <circle cx={x} cy={y} r={r * 1.18} fill="none" stroke={lit ? '#8a6a3a' : '#3a3150'} strokeWidth="0.8" />
    <path d={`M${starPoints(x, y, r)}Z`} fill={lit ? color : '#221c3a'} stroke={lit ? '#5b3a1c' : '#3a3150'} strokeWidth="0.7" />
    <path d={`M${starPoints(x, y, r * 0.62)}Z`} fill={lit ? '#fff3d0' : '#2a2346'} opacity={lit ? 0.55 : 1} />
    <circle cx={x} cy={y} r={r * 0.24} fill={lit ? '#fffaf0' : '#3a3150'} />
  </g>
);

/** A row of Christmas bulbs hanging along a curve. */
export const BulbString: React.FC<{ from: [number, number]; to: [number, number]; sag: number; count: number; on: boolean; offset?: number }> = ({ from, to, sag, count, on, offset = 0 }) => {
  const at = (t: number): [number, number] => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t + sag * 4 * t * (1 - t)];
  const mid = at(0.5);
  return (
    <g>
      <path d={`M${from[0]} ${from[1]}Q${mid[0]} ${mid[1] + sag} ${to[0]} ${to[1]}`} stroke="#2a2442" strokeWidth="0.8" fill="none" />
      {Array.from({ length: count }, (_, k) => {
        const [bx, by] = at((k + 0.5) / count);
        const color = BULBS[(k + offset) % BULBS.length];
        const lit = on || (k + offset) % 4 === 0;
        return (
          <g key={k}>
            {lit && <circle cx={bx} cy={by + 3} r="4.5" fill={color} opacity="0.28" />}
            <ellipse cx={bx} cy={by + 3} rx="1.5" ry="2.2" fill={lit ? color : '#2a2442'} />
          </g>
        );
      })}
    </g>
  );
};

export const Kubo: React.FC<{ x: number; lit: boolean; parolLit: boolean; lights: boolean }> = ({ x, lit, parolLit, lights }) => (
  <g transform={`translate(${x} 0)`}>
    {/* Concrete footings and bamboo posts: the house stands on stilts */}
    {[10, 44, 86, 118].map((px) => (
      <g key={px}>
        <rect x={px - 5} y={GROUND - 12} width="10" height="12" fill="#3a3646" />
        <rect x={px - 2} y={758} width="4" height={GROUND - 12 - 758} fill="#4a3a2a" />
      </g>
    ))}
    <path d="M10 796L44 764M44 796L86 764M86 796L118 764" stroke="#3a2d22" strokeWidth="1.4" />
    <rect x="2" y="754" width="124" height="6" fill="#5a4530" />
    {/* Walls of vertical bamboo poles, tied at two rails */}
    <rect x="6" y="700" width="116" height="54" fill="#33271e" />
    {Array.from({ length: 39 }, (_, i) => (
      <path key={i} d={`M${7.5 + i * 3} 700V754`} stroke={i % 2 ? '#4a3828' : '#544030'} strokeWidth="1.7" />
    ))}
    <path d="M6 713H122M6 744H122" stroke="#241a12" strokeWidth="1.3" />
    {/* Window with its shutter propped open on a stick */}
    <rect x="22" y="714" width="34" height="27" fill={lit ? WARM : '#18120d'} opacity={lit ? 0.92 : 1} />
    <path d="M22 714H56V741H22Z" fill="none" stroke="#241a12" strokeWidth="1.4" />
    <path d="M18 714L60 714L66 702L12 702Z" fill="#4a3826" stroke="#2a1f16" strokeWidth="0.8" />
    <path d="M24 714L20 726" stroke="#5a4530" strokeWidth="1.2" />
    <MiniParol x={39} y={724} r={6} color="#d8342c" lit={parolLit} string={4} />
    {/* Door and bamboo ladder */}
    <rect x="80" y="712" width="22" height="42" fill={lit ? '#3e2c18' : '#17110c'} />
    {lit && <rect x="90" y="712" width="2" height="42" fill={WARM} opacity="0.7" />}
    <path d="M82 754L77 812M100 754L105 812" stroke="#5a4530" strokeWidth="2" />
    {[766, 778, 790, 802].map((y) => (
      <path key={y} d={`M${80.5 - (y - 754) * 0.08} ${y}H${101.5 + (y - 754) * 0.08}`} stroke="#5a4530" strokeWidth="1.6" />
    ))}
    {/* Thatched hip roof: thick layers with a shaggy edge */}
    <path d="M-10 706L30 652H98L138 706Z" fill="#3b3521" />
    <path d="M-4 692H132M6 678H122M18 665H110" stroke="#2b2616" strokeWidth="1.3" />
    {Array.from({ length: 26 }, (_, i) => (
      <path key={i} d={`M${34 + i * 2.5} 654L${18 + i * 4.2} 704`} stroke="#463f28" strokeWidth="0.6" opacity="0.7" />
    ))}
    {Array.from({ length: 50 }, (_, i) => (
      <path key={i} d={`M${-10 + i * 3} 703l${(i % 3) - 1} ${7 + (i % 4)}`} stroke="#4a4229" strokeWidth="1.1" />
    ))}
    <path d="M30 652H98" stroke="#55492c" strokeWidth="3" />
    {lights && <BulbString from={[-8, 708]} to={[136, 708]} sag={4} count={12} on />}
  </g>
);

const SariSari: React.FC<{ x: number; lit: boolean; parolLit: boolean; lights: boolean; id: string }> = ({ x, lit, parolLit, lights, id }) => (
  <g transform={`translate(${x} 0)`}>
    <defs>
      <clipPath id={`${id}-roof`}>
        <path d="M-6 694L64 668L134 694Z" />
      </clipPath>
      <clipPath id={`${id}-win`}>
        <rect x="10" y="726" width="70" height="46" />
      </clipPath>
    </defs>
    {/* Concrete walls */}
    <rect x="2" y="690" width="124" height={GROUND - 690} fill="#2a2536" />
    <path d="M2 702H126M2 790H126" stroke="#231f2e" strokeWidth="1" />
    {/* Corrugated iron (yero) roof */}
    <path d="M-6 694L64 668L134 694Z" fill="#30343f" />
    <g clipPath={`url(#${id}-roof)`}>
      {Array.from({ length: 36 }, (_, i) => (
        <path key={i} d={`M${-6 + i * 4} 660V696`} stroke="#3e4350" strokeWidth="1.4" />
      ))}
    </g>
    <rect x="-6" y="694" width="140" height="4" fill="#3c404c" />
    {/* Painted store sign */}
    <rect x="9" y="704" width="72" height="17" rx="1" fill="#efe3c6" />
    <text x="45" y="715.6" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="7.2" fill="#a2261c" letterSpacing="0.2">
      SARI-SARI STORE
    </text>
    {/* Store window: goods on shelves behind wire mesh */}
    <rect x="10" y="726" width="70" height="46" fill={lit ? '#f7c77a' : '#1a1622'} />
    {lit && (
      <g>
        {[734, 747, 760].map((y, row) => (
          <g key={y}>
            <rect x="12" y={y + 7} width="66" height="1.4" fill="#7a5a32" />
            {Array.from({ length: 11 }, (_, k) => (
              <rect key={k} x={13 + k * 6} y={y + (k % 2)} width="4" height={7 - (k % 2)} fill={['#d8342c', '#2f6fd0', '#f2b632', '#2e9a5a', '#f4ecd8'][(k + row) % 5]} opacity="0.85" />
            ))}
          </g>
        ))}
        {[13, 75].map((sx) => Array.from({ length: 6 }, (_, k) => <rect key={`${sx}-${k}`} x={sx} y={728 + k * 7} width="3" height="6" fill={['#c43a8a', '#f2b632', '#2f6fd0'][k % 3]} />))}
      </g>
    )}
    <g clipPath={`url(#${id}-win)`} stroke="#3a3346" strokeWidth="0.6" opacity="0.85">
      {Array.from({ length: 30 }, (_, i) => (
        <path key={i} d={`M${-40 + i * 5} 726l46 46M${-40 + i * 5} 772l46 -46`} />
      ))}
    </g>
    <rect x="10" y="726" width="70" height="46" fill="none" stroke="#3d3850" strokeWidth="1.6" />
    <rect x="6" y="772" width="78" height="6" fill="#3b3448" />
    {/* Steel grille gate */}
    <rect x="90" y="724" width="30" height={GROUND - 724} fill="#1b1726" />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M${92 + i * 3.4} 724V${GROUND}`} stroke="#3d3850" strokeWidth="1" />
    ))}
    <path d="M90 744H120M90 788H120" stroke="#3d3850" strokeWidth="1.2" />
    {lit && <rect x="91" y="726" width="28" height="18" fill={WARM} opacity="0.35" />}
    <MiniParol x={105} y={712} r={7} color="#2e9a5a" lit={parolLit} string={6} />
    {lights && <BulbString from={[-6, 699]} to={[134, 699]} sag={3} count={12} on offset={2} />}
  </g>
);

const Bato: React.FC<{ x: number; lit: boolean; parolLit: boolean; lights: boolean }> = ({ x, lit, parolLit, lights }) => (
  <g transform={`translate(${x} 0)`}>
    {/* Stone ground floor (silong) with an arched zaguan door */}
    <rect x="0" y="744" width="130" height={GROUND - 744} fill="#2a2634" />
    {Array.from({ length: 9 }, (_, row) => (
      <g key={row}>
        <path d={`M0 ${748 + row * 8}H130`} stroke="#1f1c28" strokeWidth="0.8" />
        {Array.from({ length: 9 }, (_, k) => (
          <path key={k} d={`M${(row % 2 ? 7 : 0) + k * 15} ${748 + row * 8}v8`} stroke="#1f1c28" strokeWidth="0.8" />
        ))}
      </g>
    ))}
    <path d={`M44 ${GROUND}V776A21 21 0 0 1 86 776V${GROUND}Z`} fill="#1a1520" stroke="#3a3446" strokeWidth="1.5" />
    <path d={`M65 755V${GROUND}`} stroke="#2a2030" strokeWidth="1" />
    {lit && <path d="M47 776A18 18 0 0 1 83 776Z" fill={WARM} opacity="0.55" />}
    {/* Wooden upper floor overhanging the stone */}
    <rect x="-4" y="690" width="138" height="54" fill="#3a2a22" />
    <rect x="-4" y="740" width="138" height="5" fill="#4b3527" />
    {/* Three bays of sliding capiz windows */}
    {[2, 45, 88].map((bx) => (
      <g key={bx}>
        <rect x={bx} y="695" width="40" height="32" fill={lit ? '#f3dcaa' : '#2f2a44'} opacity={lit ? 0.95 : 1} />
        {Array.from({ length: 5 }, (_, c) => (
          <path key={`c${c}`} d={`M${bx + (c + 1) * 6.66} 695v32`} stroke="#6e5230" strokeWidth="0.7" />
        ))}
        {Array.from({ length: 3 }, (_, r) => (
          <path key={`r${r}`} d={`M${bx} ${695 + (r + 1) * 8}h40`} stroke="#6e5230" strokeWidth="0.7" />
        ))}
        <rect x={bx} y="695" width="40" height="32" fill="none" stroke="#24170f" strokeWidth="1.8" />
        <path d={`M${bx + 20} 695v32`} stroke="#24170f" strokeWidth="1.4" />
        {/* Ventanilla: small sliding panel behind balusters */}
        <rect x={bx} y="729" width="40" height="10" fill={lit ? '#a8763c' : '#1f1a2a'} opacity="0.8" />
        {Array.from({ length: 11 }, (_, k) => (
          <path key={`b${k}`} d={`M${bx + 2 + k * 3.6} 729v10`} stroke="#24170f" strokeWidth="1.2" />
        ))}
      </g>
    ))}
    <MiniParol x={65} y={709} r={7.5} color="#f2b632" lit={parolLit} string={2} />
    {/* Clay tile hip roof */}
    <path d="M-12 694L18 664H112L142 694Z" fill="#4a2527" />
    {[670, 676, 682, 688].map((y, r) => (
      <path key={y} d={`M${-12 + (694 - y) * 1}${' '}${y}${Array.from({ length: 30 }, () => 'q2.5 3 5 0').join('')}`} stroke="#5d2f31" strokeWidth="1" fill="none" opacity={0.9 - r * 0.05} />
    ))}
    <path d="M18 664H112" stroke="#62353a" strokeWidth="3" />
    {lights && <BulbString from={[-10, 696]} to={[140, 696]} sag={4} count={13} on offset={4} />}
  </g>
);

export const Palm: React.FC<{ x: number; lean: number; height: number }> = ({ x, lean, height }) => {
  const top: [number, number] = [x + lean, GROUND - height];
  const fronds = [-150, -115, -75, -35, -5, 30, 160];
  return (
    <g>
      <path d={`M${x} ${GROUND - 70}Q${x + lean * 0.2} ${GROUND - height * 0.6} ${top[0]} ${top[1]}`} stroke="#0d0a1c" strokeWidth="4.5" fill="none" />
      {fronds.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const len = 34;
        const ex = top[0] + len * Math.cos(a);
        const ey = top[1] + len * Math.sin(a) + 14;
        const mx = top[0] + len * 0.55 * Math.cos(a);
        const my = top[1] + len * 0.55 * Math.sin(a) - 6;
        return (
          <g key={deg}>
            <path d={`M${top[0]} ${top[1]}Q${mx} ${my} ${ex} ${ey}`} stroke="#0d0a1c" strokeWidth="1.6" fill="none" />
            {Array.from({ length: 7 }, (_, k) => {
              const t = (k + 1) / 8;
              const px = (1 - t) * (1 - t) * top[0] + 2 * (1 - t) * t * mx + t * t * ex;
              const py = (1 - t) * (1 - t) * top[1] + 2 * (1 - t) * t * my + t * t * ey;
              return <path key={k} d={`M${px} ${py}l${-3 + 6 * (k % 2)} 7`} stroke="#0d0a1c" strokeWidth="1.2" />;
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Parish church at the end of the street: bell tower, pediment, rose window. */
export const Church: React.FC<{ lit: boolean }> = ({ lit }) => (
  <g>
    <rect x="212" y="600" width="16" height="90" fill="#16112c" />
    <path d="M212 600L220 586L228 600Z" fill="#16112c" />
    <path d="M220 586V576M216 580H224" stroke="#16112c" strokeWidth="1.5" />
    <rect x="216" y="608" width="8" height="10" rx="4" fill={lit ? '#ffc96b' : '#221a3e'} />
    <rect x="228" y="626" width="52" height="64" fill="#16112c" />
    <path d="M228 626L254 606L280 626Z" fill="#16112c" />
    <path d="M254 606V596M250 600H258" stroke="#16112c" strokeWidth="1.5" />
    <circle cx="254" cy="640" r="6" fill={lit ? '#ffd27a' : '#221a3e'} />
    <path d="M246 690V664A8 8 0 0 1 262 664V690" fill={lit ? '#ffc96b' : '#221a3e'} opacity={lit ? 0.85 : 1} />
  </g>
);

/** Pampanga-style giant lantern: concentric rings of colour around a star, edged with bulbs. */
export const GiantLantern: React.FC<{ x: number; y: number; r: number; colors: string[] }> = ({ x, y, r, colors }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.7} fill={colors[0]} opacity="0.18" />
    {colors.map((color, i) => (
      <circle key={i} cx={x} cy={y} r={r * (1 - i * 0.22)} fill={color} opacity="0.9" />
    ))}
    <path d={`M${starPoints(x, y, r * 0.55)}Z`} fill="#fff3d0" opacity="0.9" />
    {Array.from({ length: 16 }, (_, k) => {
      const a = (k * 22.5 * Math.PI) / 180;
      return <circle key={k} cx={x + r * Math.cos(a)} cy={y + r * Math.sin(a)} r="1.3" fill="#fffaf0" />;
    })}
  </g>
);

/** A child caroler: one carries a parol on a stick, another a tansan (bottle-cap) tambourine. */
export const Caroler: React.FC<{ x: number; tall: number; item: 'parol' | 'tambourine' | 'none'; facing?: 1 | -1 }> = ({ x, tall, item, facing = 1 }) => {
  // Standing on the sidewalk in front of the houses.
  const head = GROUND - 8 - tall;
  const ink = '#0c0918';
  return (
    <g>
      <circle cx={x} cy={head + 3.6} r="3.6" fill={ink} />
      <path d={`M${x - 3.8} ${head + 2}q3.8 -4.5 7.6 0`} fill="#1a1426" />
      <path d={`M${x - 4} ${head + 8}h8l1.4 ${tall * 0.38}h-10.8z`} fill={ink} />
      <path d={`M${x - 3.4} ${head + 8 + tall * 0.38}h6.8v${tall * 0.14}h-6.8z`} fill="#141024" />
      <path d={`M${x - 2.2} ${head + 8 + tall * 0.52}v${tall * 0.3}M${x + 2.2} ${head + 8 + tall * 0.52}v${tall * 0.3}`} stroke={ink} strokeWidth="2" />
      <path d={`M${x - 3.6 * facing} ${head + 9}l${-4 * facing} ${tall * 0.25}`} stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
      <path d={`M${x + 3.6 * facing} ${head + 9}l${4 * facing} ${-4}`} stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
      <path d={`M${x - 3.6} ${head + 9}q${3.6} 2 7.2 0`} stroke="#ffb35a" strokeWidth="0.7" opacity="0.6" fill="none" />
      {item === 'parol' && (
        <g>
          <path d={`M${x + 7.6 * facing} ${head + 5}l${5 * facing} ${-18}`} stroke="#6a4a2a" strokeWidth="1.2" />
          <MiniParol x={x + 13 * facing} y={head - 20} r={5.5} color="#f2b632" lit string={0} />
        </g>
      )}
      {item === 'tambourine' && (
        <g>
          <circle cx={x + 8.6 * facing} cy={head + 4} r="4" fill="none" stroke="#9a8a6a" strokeWidth="1" />
          {Array.from({ length: 6 }, (_, k) => {
            const a = (k * 60 * Math.PI) / 180;
            return <circle key={k} cx={x + 8.6 * facing + 4 * Math.cos(a)} cy={head + 4 + 4 * Math.sin(a)} r="1" fill="#c8b890" />;
          })}
        </g>
      )}
    </g>
  );
};

/** The night sky shared by every scene: stars, the moon, fireworks from 80 rings and Simbang Gabi dawn from 90. */
export const Sky: React.FC<{ stage: Stage; moon?: boolean; id: string }> = ({ stage, moon = true, id }) => (
  <g>
    <defs>
        <linearGradient id={`${id}-dawn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#e8845a" stopOpacity="0" />
          <stop offset="0.7" stopColor="#c8607a" stopOpacity="0.35" />
          <stop offset="0.86" stopColor="#f2a66a" stopOpacity="0.6" />
        </linearGradient>
    </defs>
      {stage >= 9 && <rect width="390" height="844" fill={`url(#${id}-dawn)`} />}
    {[[40, 110], [350, 80], [300, 190], [70, 250], [360, 320], [18, 380], [214, 150], [250, 130], [120, 170], [330, 420]].map(([sx, sy], i) => (
      <circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 1.4 : 1} fill="#fff" opacity={(0.35 + (i % 4) * 0.12) * (stage >= 9 ? 0.45 : 1)} />
    ))}
    {moon && stage < 9 && <path d="M350 108a14 14 0 1 0 10 23a11 11 0 1 1 -10 -23z" fill="#f4ecd8" opacity="0.8" />}

    {stage >= 8 &&
      [[56, 300, '#f2b632'], [336, 240, '#d8342c'], [80, 150, '#2f6fd0']].map(([fx, fy, color], i) => (
        <g key={i}>
          {Array.from({ length: 14 }, (_, k) => {
            const a = (k * (360 / 14) * Math.PI) / 180;
            return <path key={k} d={`M${Number(fx) + 7 * Math.cos(a)} ${Number(fy) + 7 * Math.sin(a)}L${Number(fx) + 26 * Math.cos(a)} ${Number(fy) + 26 * Math.sin(a)}`} stroke={color as string} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />;
          })}
          <circle cx={Number(fx)} cy={Number(fy)} r="2.5" fill="#fffaf0" />
        </g>
      ))}

  </g>
);

type HouseKind = 'kubo' | 'sari' | 'bato';
const ORDERS: HouseKind[][] = [
  ['kubo', 'sari', 'bato'],
  ['sari', 'bato', 'kubo'],
  ['bato', 'kubo', 'sari'],
  ['kubo', 'bato', 'sari'],
];

export const Street: React.FC<{ stage?: Stage; width?: number | string; height?: number | string; moon?: boolean; tile?: number }> = ({
  stage = 0,
  width = '100%',
  height = '100%',
  moon = true,
  tile = 0,
}) => {
  const id = `street-${tile}`;
  const windowsLit = stage >= 2;
  const parolsLit = stage >= 3;
  const lights = stage >= 2;
  const order = ORDERS[tile % ORDERS.length];
  const xs = [0, 130, 260];
  return (
    <svg width={width} height={height} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id={`${id}-lamp`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#ffb35a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb35a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Sky stage={stage} moon={moon} id={id} />

      {/* Everything on the ground sits 30 px low so the street stays under the in-run meter */}
      <g transform="translate(0 30)">
      {/* The far barangay: hills dotted with lit houses */}
      {stage >= 5 && (
        <g>
          <path d="M0 700Q50 662 110 676T230 664T390 672V712H0Z" fill="#110d27" />
          {[[16, 690], [38, 684], [66, 680], [92, 683], [128, 679], [150, 676], [176, 672], [204, 670], [236, 669], [262, 672], [290, 676], [316, 677], [344, 676], [372, 677]].map(([hx, hy], i) => (
            <rect key={i} x={hx} y={hy + 4} width="2" height="2" fill={['#ffc96b', '#ffd27a', '#ff9d8a'][i % 3]} />
          ))}
        </g>
      )}

      <Church lit={stage >= 9} />
      {stage >= 7 && (
        <g>
          <GiantLantern x={74} y={650} r={20} colors={['#d8342c', '#f2b632', '#2f6fd0', '#f4ecd8']} />
          <GiantLantern x={330} y={646} r={23} colors={['#2e9a5a', '#c43a8a', '#f2b632', '#f4ecd8']} />
        </g>
      )}
      <Palm x={366} lean={-14} height={170} />
      <Palm x={16} lean={10} height={150} />

      {order.map((kind, i) =>
        kind === 'kubo' ? (
          <Kubo key={kind} x={xs[i]} lit={windowsLit} parolLit={parolsLit} lights={lights} />
        ) : kind === 'sari' ? (
          // The sari-sari store stays open late, so it glows from the first ring.
          <SariSari key={kind} id={`${id}-sari`} x={xs[i]} lit parolLit={parolsLit} lights={lights} />
        ) : (
          <Bato key={kind} x={xs[i]} lit={windowsLit} parolLit={parolsLit} lights={lights} />
        ),
      )}

      {/* Concrete utility pole: crossarm, insulators, transformer, sodium street lamp, tangled wires */}
      <g>
        <path d="M-10 640Q60 668 128 620M-10 650Q64 676 128 626M128 620Q260 650 400 612M128 626Q250 660 400 622M134 640Q260 684 400 636M128 650Q160 668 196 694" stroke="#0e0b1c" strokeWidth="1" fill="none" />
        <rect x="125" y="604" width="6" height={GROUND - 604} fill="#3a3848" />
        <rect x="108" y="616" width="40" height="3" fill="#3a3848" />
        {[110, 120, 136, 146].map((ix) => (
          <rect key={ix} x={ix - 1.2} y="611" width="2.4" height="5" rx="1" fill="#a8a6b8" />
        ))}
        <rect x="131" y="634" width="11" height="17" rx="3" fill="#33313f" />
        <path d="M131 662q16 -10 30 -4" stroke="#3a3848" strokeWidth="2" fill="none" />
        <path d="M156 655h11l-2 4h-7z" fill="#4a4858" />
        <path d="M157 659L118 812H206Z" fill={`url(#${id}-lamp)`} opacity="0.55" />
        <circle cx="161.5" cy="660" r="5" fill="#ffb35a" opacity="0.5" />
        <ellipse cx="161.5" cy="659.8" rx="3.4" ry="1.6" fill="#ffe0a8" />
      </g>

      {/* Bulbs strung from the pole across the street */}
      <BulbString from={[128, 618]} to={[-6, 664]} sag={10} count={7} on={lights} />
      <BulbString from={[131, 620]} to={[396, 652]} sag={12} count={13} on={lights} offset={3} />

      {/* The road */}
      <rect x="0" y={GROUND} width="390" height={844 - GROUND} fill="#0b0916" />
      <rect x="0" y={GROUND} width="390" height="2" fill="#262038" />
      {[20, 80, 140, 200, 260, 320].map((dx) => (
        <rect key={dx} x={dx} y="832" width="26" height="1.6" fill="#2a2440" />
      ))}

      {stage >= 4 && (
        <g>
          <Caroler x={24} tall={30} item="parol" />
          <Caroler x={46} tall={25} item="tambourine" />
          <Caroler x={338} tall={27} item="tambourine" facing={-1} />
          <Caroler x={362} tall={31} item="parol" facing={-1} />
        </g>
      )}
      </g>
    </svg>
  );
};
