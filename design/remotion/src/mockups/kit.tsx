import React from 'react';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadYoungSerif } from '@remotion/google-fonts/YoungSerif';

export const { fontFamily: SERIF } = loadYoungSerif('normal', { weights: ['400'], subsets: ['latin'] });
export const { fontFamily: SANS } = loadManrope('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });

export const C = {
  ink: '#f7f0e3',
  muted: '#c9bfe0',
  faint: '#a99fc4',
  gold: '#ffd27a',
  goldDeep: '#f2a33a',
  coral: '#ff9d8a',
  surface: '#1a1538',
  surfaceHigh: '#221c46',
  line: '#2f2856',
  night: 'radial-gradient(120% 70% at 50% 28%, #2a1e55 0%, #140f30 55%, #0a0918 100%)',
};

/**
 * The journey, one stage per 10 rings: 1 first halo · 2 street lights · 3 neighbours' parols · 4 carolers ·
 * 5 the whole barangay · 6 rotor mode · 7 lantern festival · 8 fireworks · 9 Simbang Gabi dawn · 10 the star rises.
 */
export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const stageFor = (rings: number) => Math.min(10, Math.floor(rings / 10)) as Stage;

const Caroler: React.FC<{ x: number; tall: number; star?: boolean }> = ({ x, tall, star = false }) => {
  const top = 836 - tall;
  return (
    <g>
      <circle cx={x} cy={top + 4} r="4.2" fill="#05040c" />
      <path d={`M${x - 5} ${top + 9}h10l3 ${tall - 9}h-16z`} fill="#05040c" />
      {star ? (
        <g>
          <path d={`M${x + 6} ${top + 14}l10 -22`} stroke="#05040c" strokeWidth="1.4" />
          <circle cx={x + 16} cy={top - 10} r="9" fill="#ffd27a" opacity="0.25" />
          <path d={`M${x + 16} ${top - 16}l2 4.5h5l-4 3l1.6 5l-4.6 -3l-4.6 3l1.6 -5l-4 -3h5z`} fill="#ffd27a" />
        </g>
      ) : (
        <circle cx={x + 9} cy={top + 16} r="4.5" fill="none" stroke="#c8995a" strokeWidth="1.2" />
      )}
    </g>
  );
};

const SmallParol: React.FC<{ x: number; y: number; r: number; color: string; lit: boolean }> = ({ x, y, r, color, lit }) => {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const a = ((k * 36 - 90) * Math.PI) / 180;
    const rr = k % 2 === 0 ? r : r * 0.45;
    return `${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
  });
  return (
    <g>
      <path d={`M${x} ${y - r - 14}V${y - r}`} stroke="#3a3160" strokeWidth="0.8" />
      {lit && <circle cx={x} cy={y} r={r * 2.4} fill={color} opacity="0.22" />}
      <path d={`M${pts.join('L')}Z`} fill={lit ? color : '#1b1638'} stroke={lit ? '#5b3a1c' : '#3a3160'} strokeWidth="0.8" />
      <path d={`M${x - 2} ${y + r * 0.6}l-2 ${r * 1.4}M${x + 2} ${y + r * 0.6}l2 ${r * 1.4}`} stroke={lit ? '#f2b632' : '#2a2448'} strokeWidth="0.9" />
    </g>
  );
};

/** Night street in a 390×844 design box, anchored to the bottom so it works at any aspect ratio. */
export const Street: React.FC<{ stage?: Stage; width?: number | string; height?: number | string; moon?: boolean }> = ({ stage = 0, width = '100%', height = '100%', moon = true }) => {
  const windows = [
    [44, 748], [62, 748], [134, 760], [226, 742], [244, 742], [316, 756], [340, 756],
  ];
  const bulbColors = ['#f2b632', '#d8342c', '#2e9a5a', '#2f6fd0', '#f4ecd8', '#c43a8a'];
  return (
    <svg width={width} height={height} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#e8845a" stopOpacity="0" />
          <stop offset="0.7" stopColor="#c8607a" stopOpacity="0.35" />
          <stop offset="0.86" stopColor="#f2a66a" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Simbang Gabi dawn warms the sky from the horizon up */}
      {stage >= 9 && <rect width="390" height="844" fill="url(#dawn)" />}
      {[[40, 110], [350, 80], [300, 190], [70, 250], [360, 320], [18, 380], [214, 150], [250, 130], [120, 170], [330, 420]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 1} fill="#fff" opacity={(0.35 + (i % 4) * 0.12) * (stage >= 9 ? 0.45 : 1)} />
      ))}
      {/* The moon sets once Simbang Gabi's dawn comes up */}
      {moon && stage < 9 && <path d="M30 430a14 14 0 1 0 10 23a11 11 0 1 1 -10 -23z" fill="#f4ecd8" opacity="0.8" />}

      {/* The whole barangay: far hills dotted with lit houses */}
      {stage >= 5 && (
        <g>
          <path d="M0 702Q50 668 110 680T230 668T390 676V710H0Z" fill="#110d27" />
          {[[16, 690], [38, 684], [66, 680], [92, 683], [128, 679], [150, 676], [176, 672], [204, 670], [236, 669], [262, 672], [290, 676], [316, 677], [344, 676], [372, 677]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y + 6} r="1.2" fill={['#ffc96b', '#ffd27a', '#ff9d8a'][i % 3]} opacity="0.9" />
          ))}
        </g>
      )}

      {/* Fireworks over the town */}
      {stage >= 8 && (
        <g>
          {[[56, 300, '#f2b632'], [336, 240, '#d8342c'], [80, 150, '#2f6fd0']].map(([x, y, color], i) => (
            <g key={i}>
              {Array.from({ length: 12 }, (_, k) => {
                const a = (k * 30 * Math.PI) / 180;
                return <path key={k} d={`M${Number(x) + 8 * Math.cos(a)} ${Number(y) + 8 * Math.sin(a)}L${Number(x) + 26 * Math.cos(a)} ${Number(y) + 26 * Math.sin(a)}`} stroke={color as string} strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />;
              })}
            </g>
          ))}
        </g>
      )}

      {/* Lantern festival: giant lanterns rise in the plaza */}
      {stage >= 7 && (
        <g>
          {[[66, 700, 15, '#d8342c'], [322, 698, 17, '#2e9a5a'], [196, 694, 13, '#f2b632']].map(([x, y, r, color], i) => (
            <g key={i}>
              <circle cx={Number(x)} cy={Number(y)} r={Number(r) * 1.9} fill={color as string} opacity="0.18" />
              <circle cx={Number(x)} cy={Number(y)} r={Number(r)} fill="none" stroke={color as string} strokeWidth="3" opacity="0.9" />
              <circle cx={Number(x)} cy={Number(y)} r={Number(r) * 0.55} fill={color as string} opacity="0.6" />
            </g>
          ))}
        </g>
      )}

      {/* Rooftops: nipa-roofed houses on stilts between concrete row houses */}
      <path d="M0 772V736L24 718L48 736V772H58V744L92 716L126 744V772H140V728L174 700L208 728V772H218V738L252 714L286 738V772H296V742L330 720L364 742V772H390V844H0Z" fill="#090713" />
      <path d="M92 716L60 742M92 716L124 742M174 700L142 726M174 700L206 726M252 714L220 736M252 714L284 736" stroke="#15112b" strokeWidth="1" />
      {windows.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="9" height="10" fill="#ffc96b" opacity={stage >= 2 || i % 3 === 0 ? 0.85 : 0.18} />
      ))}

      {/* String of lights across the street */}
      <path d="M0 694C110 712 280 712 390 694" stroke="#2a2340" strokeWidth="1.2" fill="none" />
      {Array.from({ length: 13 }, (_, k) => {
        const x = 15 + k * 30;
        const y = 694 + 16 * Math.sin((Math.PI * x) / 390) - 2;
        const on = stage >= 2 || k % 4 === 0;
        return (
          <g key={k}>
            {on && <circle cx={x} cy={y + 4} r="6" fill={bulbColors[k % 6]} opacity="0.25" />}
            <circle cx={x} cy={y + 4} r="2.6" fill={on ? bulbColors[k % 6] : '#2a2448'} />
          </g>
        );
      })}

      {/* Neighbours' parols under the eaves */}
      {[[92, 746, '#d8342c'], [174, 732, '#2e9a5a'], [252, 746, '#f2b632'], [330, 752, '#2f6fd0']].map(([x, y, color], i) => (
        <SmallParol key={i} x={Number(x)} y={Number(y)} r={8} color={color as string} lit={stage >= 3} />
      ))}

      {/* Carolers with a star on a stick and tambourines */}
      {stage >= 4 && (
        <g>
          <Caroler x={22} tall={26} star />
          <Caroler x={52} tall={20} />
          <Caroler x={334} tall={22} />
          <Caroler x={356} tall={19} star />
        </g>
      )}
    </svg>
  );
};

export const Screen: React.FC<{ width?: number; height?: number; stage?: Stage; children: React.ReactNode; background?: string; street?: boolean }> = ({
  width = 390,
  height = 844,
  stage = 0,
  background = C.night,
  street = true,
  children,
}) => (
  <div style={{ width, height, position: 'relative', overflow: 'hidden', background, color: C.ink, fontFamily: SANS }}>
    {street && <Street stage={stage} />}
    {children}
  </div>
);

type IconName = 'pause' | 'play' | 'sound' | 'board' | 'settings' | 'share' | 'close' | 'back' | 'edit' | 'download' | 'copy';
const ICONS: Record<IconName, React.ReactNode> = {
  pause: <path d="M7 4v12M13 4v12" />,
  play: <path d="M6 4l10 6-10 6z" />,
  sound: <><path d="M3 8v4h3l4 3V5L6 8Z" /><path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" /></>,
  board: <path d="M3 17h14M5 17V10M10 17V5M15 17v-4" />,
  settings: <><circle cx="10" cy="10" r="2.6" /><path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6" /></>,
  share: <><path d="M10 3v10M6 7l4-4 4 4" /><path d="M4 11v5h12v-5" /></>,
  close: <path d="M5 5l10 10M15 5L5 15" />,
  back: <path d="M12 4l-6 6 6 6" />,
  edit: <path d="M4 16l1-4 8-8 3 3-8 8zM11 6l3 3" />,
  download: <><path d="M10 3v10M6 9l4 4 4-4" /><path d="M4 16h12" /></>,
  copy: <><rect x="7" y="7" width="9" height="9" rx="1.5" /><path d="M4 13V5a1 1 0 0 1 1-1h8" /></>,
};

export const Icon: React.FC<{ name: IconName; size?: number }> = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
);

export const IconButton: React.FC<{ name: IconName; label: string }> = ({ name, label }) => (
  <button type="button" aria-label={label} style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${C.line}`, background: 'rgba(20,15,48,0.85)', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Icon name={name} />
  </button>
);

export const PrimaryButton: React.FC<{ children: React.ReactNode; width?: number | string; icon?: IconName }> = ({ children, width = '100%', icon }) => (
  <button type="button" style={{ width, height: 56, borderRadius: 28, border: 'none', background: `linear-gradient(180deg, ${C.gold} 0%, ${C.goldDeep} 100%)`, color: '#2a1606', fontFamily: SANS, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 28px rgba(255,190,90,0.28)' }}>
    {icon && <Icon name={icon} />}
    {children}
  </button>
);

export const GhostButton: React.FC<{ children: React.ReactNode; width?: number | string; icon?: IconName }> = ({ children, width = '100%', icon }) => (
  <button type="button" style={{ width, height: 54, borderRadius: 27, border: `1px solid #4a4166`, background: 'rgba(20,15,48,0.6)', color: C.ink, fontFamily: SANS, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
    {icon && <Icon name={icon} size={18} />}
    {children}
  </button>
);

export const Wordmark: React.FC<{ size?: number }> = ({ size = 30 }) => <span style={{ fontFamily: SERIF, fontSize: size, lineHeight: 1 }}>Parol</span>;

export const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.muted }) => (
  <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>{children}</span>
);

const StarGlyph: React.FC<{ on: boolean; size: number; dashed?: boolean }> = ({ on, size, dashed }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.8L3.5 15L5 9.5L1 6H6Z" fill={on ? C.gold : '#1d1838'} stroke={on ? '#b8862a' : dashed ? C.gold : '#3a3160'} strokeWidth="1" strokeDasharray={dashed ? '2 2' : undefined} />
  </svg>
);

/** Five streak stars: lit count = perfect locks in a row (mod 5; all five on the widening lock). */
export const StreakStars: React.FC<{ streak: number; size?: number }> = ({ streak, size = 16 }) => {
  const lit = streak > 0 && streak % 5 === 0 ? 5 : streak % 5;
  return (
    <div style={{ display: 'flex', gap: Math.round(size * 0.4) }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarGlyph key={i} on={i < lit} size={size} />
      ))}
    </div>
  );
};

export const WeekStars: React.FC<{ lit: boolean[]; today: number }> = ({ lit, today }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {days.map((day, i) => (
        <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <StarGlyph on={lit[i]} size={24} dashed={i === today && !lit[i]} />
          <span style={{ fontSize: 10, color: C.faint }}>{day}</span>
        </div>
      ))}
    </div>
  );
};

export const Hud: React.FC<{ rings: number; streak: number; note?: string }> = ({ rings, streak, note }) => (
  <div style={{ position: 'absolute', left: 20, right: 20, top: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, width: 120 }}>
      <Label>Rings</Label>
      <span style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1 }}>{rings}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <StreakStars streak={streak} />
      <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{note ?? (streak === 0 ? 'No streak' : streak % 5 === 0 ? '5 perfect · points widen' : `${streak} perfect in a row`)}</span>
    </div>
    <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
      <IconButton name="pause" label="Pause" />
    </div>
  </div>
);

/** Point width against the 8° minimum. */
export const WidthMeter: React.FC<{ width: number; danger?: boolean; spin?: string }> = ({ width, danger = false, spin = '1.3× · clockwise' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted }}>
      <span>
        Point width <strong style={{ color: danger ? C.coral : C.ink }}>{width}°</strong>
      </span>
      <span>Spin {spin}</span>
    </div>
    <div style={{ position: 'relative', height: 8, borderRadius: 4, background: '#241d44' }}>
      <div style={{ position: 'absolute', inset: 0, width: `${(width / 36) * 100}%`, borderRadius: 4, background: danger ? 'linear-gradient(90deg, #a8241e, #ff6a4a)' : 'linear-gradient(90deg, #d8342c, #f2b632)', boxShadow: danger ? '0 0 12px rgba(255,106,74,0.7)' : undefined }} />
      <div style={{ position: 'absolute', left: `${(8 / 36) * 100}%`, top: -3, width: 2, height: 14, background: '#ff8a7a' }} />
    </div>
    <span style={{ fontSize: 11, color: danger ? C.coral : C.faint }}>{danger ? 'Points are nearly too thin · lock perfect to widen them' : 'Below 8° the points can’t hold a ring'}</span>
  </div>
);

export const StatTile: React.FC<{ value: string; label: string; color?: string }> = ({ value, label, color = C.ink }) => (
  <div style={{ padding: '10px 12px', borderRadius: 14, background: C.surface, border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontFamily: SERIF, fontSize: 26, color }}>{value}</span>
    <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
  </div>
);

export type BoardRow = { rank: string; name: string; score: string; you?: boolean; medal?: 'gold' | 'silver' | 'bronze' };
const MEDALS = { gold: '#f2c14e', silver: '#c9cfd8', bronze: '#cd8a52' };

export const Board: React.FC<{ rows: BoardRow[]; title?: string; rowHeight?: number }> = ({ rows, title = "Today's board", rowHeight = 30 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 14px', borderRadius: 16, background: '#15112f', border: `1px solid ${C.line}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6 }}>
      <Label>{title}</Label>
      <Label>Rings</Label>
    </div>
    {rows.map((row) => (
      <div key={row.rank + row.name} style={{ display: 'flex', alignItems: 'center', gap: 10, height: rowHeight, padding: '0 8px', borderRadius: 8, fontSize: 13, background: row.you ? 'rgba(255,210,122,0.12)' : undefined, color: row.you ? C.gold : C.ink }}>
        <span style={{ width: 28, display: 'flex', alignItems: 'center' }}>
          {row.medal ? (
            <span style={{ width: 20, height: 20, borderRadius: 10, background: MEDALS[row.medal], color: '#1a1206', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{row.rank}</span>
          ) : (
            <span style={{ color: C.muted }}>{row.rank}</span>
          )}
        </span>
        <span style={{ flex: 1 }}>{row.name}</span>
        <span style={{ fontWeight: 700 }}>{row.score}</span>
      </div>
    ))}
  </div>
);

export const TODAY_ROWS: BoardRow[] = [
  { rank: '1', name: 'Parol-4C1E', score: '61', medal: 'gold' },
  { rank: '2', name: 'Lumen_PH', score: '48', medal: 'silver' },
  { rank: '3', name: 'Ate Joy', score: '39', medal: 'bronze' },
];

export const Overlay: React.FC<{ children: React.ReactNode; align?: 'center' | 'end' }> = ({ children, align = 'center' }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,24,0.72)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: align === 'center' ? 'center' : 'flex-end', justifyContent: 'center', padding: align === 'center' ? 20 : 0 }}>
    {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; width?: number | string; sheet?: boolean }> = ({ children, width = '100%', sheet = false }) => (
  <div style={{ width, display: 'flex', flexDirection: 'column', gap: 14, padding: sheet ? '22px 20px 34px' : '26px 22px', borderRadius: sheet ? '24px 24px 0 0' : 22, background: C.surfaceHigh, border: `1px solid ${C.line}` }}>
    {children}
  </div>
);
