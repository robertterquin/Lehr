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

import { Street, type Stage } from './street';

export { Street, type Stage };
export const stageFor = (rings: number) => Math.min(10, Math.floor(rings / 10)) as Stage;

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
