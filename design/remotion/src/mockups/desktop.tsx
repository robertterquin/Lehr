import React from 'react';
import { Parol } from '../ParolStar';
import { Board, C, Card, GhostButton, Icon, IconButton, Label, PrimaryButton, SANS, SERIF, StatTile, Street, StreakStars, TODAY_ROWS, WeekStars, WidthMeter, Wordmark, type Stage } from './kit';

const OPENING = [0, 0, 0, 4, 0, 0, -5];
const SHORT_RUN = [0, 0, 3, 0, -4, 0, 6, 0, 0, -7, 5, 0];

/** Four street segments side by side keep rooftops at a natural size on a wide screen. */
const DesktopScreen: React.FC<{ stage?: Stage; children: React.ReactNode }> = ({ stage = 0, children }) => (
  <div style={{ width: 1440, height: 900, position: 'relative', overflow: 'hidden', background: C.night, color: C.ink, fontFamily: SANS }}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: 'absolute', left: i * 360, bottom: 0, width: 360, height: 779 }}>
        <Street stage={stage} moon={false} tile={i} />
      </div>
    ))}
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', left: 1352, top: 120 }}>
      <path d="M18 4a16 16 0 1 0 14 26a13 13 0 1 1 -14 -26z" fill="#f4ecd8" opacity="0.8" />
    </svg>
    {children}
  </div>
);

const TopBar: React.FC<{ right?: React.ReactNode }> = ({ right }) => (
  <div style={{ position: 'absolute', left: 48, right: 48, top: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Wordmark size={34} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{right}</div>
  </div>
);

const Kbd: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted, whiteSpace: 'nowrap' }}>
    <kbd style={{ fontFamily: SANS, fontSize: 12, padding: '3px 10px', borderRadius: 6, border: '1px solid #4a4166', borderBottomWidth: 3, color: C.ink }}>{k}</kbd>
    {children}
  </span>
);

export const D01Ready: React.FC = () => (
  <DesktopScreen>
    <TopBar
      right={
        <>
          <Label>Sunday · 22 November</Label>
          <IconButton name="sound" label="Sound on" />
          <IconButton name="board" label="Today's board" />
          <IconButton name="settings" label="Settings" />
        </>
      }
    />
    <div style={{ position: 'absolute', left: 250, top: 120 }}>
      <Parol size={420} locks={Array.from({ length: 12 }, () => 0)} dim />
    </div>
    <div style={{ position: 'absolute', left: 790, top: 190, width: 420, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: SERIF, fontSize: 58, lineHeight: 1.02 }}>Tonight’s star</span>
        <span style={{ fontSize: 17, lineHeight: 1.55, color: C.muted }}>Lock each spinning ring onto the one inside it. Perfect locks keep the points wide. Everyone builds the same star today.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <WeekStars lit={[false, false, true, true, true, true, false]} today={6} />
        <span style={{ fontSize: 14 }}>4-day streak · light today to make it 5</span>
      </div>
      <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 14, background: C.surface, border: `1px solid ${C.line}`, fontSize: 14 }}>
        <span style={{ width: 24, height: 24, borderRadius: 12, background: '#cd8a52', color: '#1a1206', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
        Yesterday you finished <strong>#3</strong> · 39 rings
      </div>
      <PrimaryButton width={320}>Light the first ring</PrimaryButton>
      <div style={{ display: 'flex', gap: 22 }}>
        <Kbd k="Space">or click to lock</Kbd>
        <Kbd k="Esc">pause</Kbd>
      </div>
    </div>
  </DesktopScreen>
);

export const D02Spinning: React.FC = () => (
  <DesktopScreen>
    <TopBar right={<><Label>Sunday · 22 November</Label><IconButton name="pause" label="Pause" /></>} />
    <div style={{ position: 'absolute', left: 120, top: 210, width: 280, display: 'flex', flexDirection: 'column', gap: 30 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Label>Rings</Label>
        <span style={{ fontFamily: SERIF, fontSize: 84, lineHeight: 1 }}>7</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <StreakStars streak={1} size={22} />
        <span style={{ fontSize: 14, color: C.muted }}>1 perfect in a row · 5 widens the points</span>
      </div>
      <WidthMeter width={27} />
    </div>
    <div style={{ position: 'absolute', left: 480, top: 96 }}>
      <Parol size={480} locks={OPENING} spin={16} />
    </div>
    <div style={{ position: 'absolute', left: 1050, top: 230, width: 290, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 36 }}>Line it up</span>
        <span style={{ fontSize: 15, lineHeight: 1.55, color: C.muted }}>Lock when the points meet the gold dashes. Within 1.5° is perfect and keeps them 27° wide.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label>Spin</Label>
        <span style={{ fontSize: 17 }}>1.3× · clockwise</span>
        <span style={{ fontSize: 13, color: C.faint }}>Reverses every 4 rings</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Kbd k="Space">or click to lock</Kbd>
        <Kbd k="Esc">pause</Kbd>
      </div>
    </div>
  </DesktopScreen>
);

export const D03Results: React.FC = () => (
  <DesktopScreen stage={1}>
    <TopBar right={<Label>Sunday · 22 November</Label>} />
    <svg width="1440" height="200" viewBox="0 0 1440 200" style={{ position: 'absolute', left: 0, top: 60 }}>
      <path d="M0 30C300 110 700 110 1440 20" stroke="#4a4166" strokeWidth="2" fill="none" />
      <path d="M440 92V140" stroke="#4a4166" strokeWidth="2" />
    </svg>
    <div style={{ position: 'absolute', left: 270, top: 196 }}>
      <Parol size={340} locks={SHORT_RUN} halo={1} />
    </div>
    <div style={{ position: 'absolute', left: 760, top: 150, width: 520, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label>Run ended</Label>
        <span style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1.05 }}>The points got too thin</span>
        <span style={{ fontSize: 15, color: C.muted }}>Ring 13 locked 7° off, leaving 4° points (8° needed)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        <StatTile value="12" label="rings" />
        <StatTile value="7" label="perfect" color={C.gold} />
        <StatTile value="#14" label="today" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 12, background: 'rgba(255,210,122,0.12)', color: C.gold, border: '1px solid rgba(255,210,122,0.4)' }}>New best today</span>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 12, background: 'rgba(255,210,122,0.12)', color: C.gold, border: '1px solid rgba(255,210,122,0.4)' }}>Day 5 · streak kept</span>
      </div>
      <Board rows={[...TODAY_ROWS, { rank: '14', name: 'You · Parol-3F1A', score: '12', you: true }]} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PrimaryButton width={200}>Light again</PrimaryButton>
        <GhostButton width={180} icon="download">Save image</GhostButton>
        <Kbd k="Space">light again</Kbd>
      </div>
    </div>
  </DesktopScreen>
);

export const D04Board: React.FC = () => (
  <DesktopScreen>
    <TopBar right={<IconButton name="close" label="Close" />} />
    <div style={{ position: 'absolute', left: 260, top: 110, width: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: SERIF, fontSize: 40 }}>Today’s board</span>
        <span style={{ fontSize: 13, color: C.muted }}>Resets 8:00 AM PH time</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Today', 'Yesterday'].map((tab, i) => (
          <span key={tab} style={{ fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 18, background: i === 0 ? C.gold : 'transparent', color: i === 0 ? '#2a1606' : C.muted, border: i === 0 ? 'none' : `1px solid ${C.line}` }}>
            {tab}
          </span>
        ))}
      </div>
      <Board
        rowHeight={36}
        rows={[
          ...TODAY_ROWS,
          { rank: '4', name: 'Kuya Ben', score: '35' },
          { rank: '5', name: 'parolmaker', score: '33' },
          { rank: '6', name: 'Parol-9A20', score: '29' },
          { rank: '7', name: 'Mika_S', score: '26' },
          { rank: '8', name: 'Parol-77D3', score: '24' },
          { rank: '9', name: 'tito_rey', score: '21' },
          { rank: '10', name: 'Parol-0B6F', score: '19' },
          { rank: '…', name: '', score: '' },
          { rank: '14', name: 'You · Parol-3F1A', score: '12', you: true },
        ]}
      />
    </div>
    <div style={{ position: 'absolute', left: 880, top: 190, width: 320, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <Label>Your name on the board</Label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 12, background: '#15112f', border: `1px solid ${C.line}`, fontSize: 15 }}>
          <span style={{ flex: 1 }}>Parol-3F1A</span>
          <Icon name="edit" size={18} />
        </label>
        <span style={{ fontSize: 12, color: C.faint }}>3–18 letters, numbers, spaces, - or _</span>
      </Card>
      <Card>
        <Label>Your best today</Label>
        <span style={{ fontFamily: SERIF, fontSize: 34 }}>12 rings · #14</span>
        <span style={{ fontSize: 13, color: C.muted }}>3 rings from #10</span>
      </Card>
    </div>
  </DesktopScreen>
);
