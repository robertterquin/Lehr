import React from 'react';
import { Parol } from '../ParolStar';
import {
  Board, C, Card, GhostButton, Hud, Icon, IconButton, Label, Overlay, PrimaryButton, SANS, SERIF, Screen, StatTile, TODAY_ROWS, WeekStars, WidthMeter, Wordmark, type Stage,
} from './kit';

// Lock sequences (degrees off, 0 = perfect) that produce each screen's star under the real rules.
const OPENING = [0, 0, 0, 4, 0, 0, -5];
const SHORT_RUN = [0, 0, 3, 0, -4, 0, 6, 0, 0, -7, 5, 0];
const THIN = [0, 3, 0, -6, 0, 7, 0, 0, -5, 4];
const LONG_RUN = [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, -4, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0];
const TONIGHT = Array.from({ length: 12 }, () => 0);
/** A long, skilled run: an occasional small miss, mostly perfect locks. */
const expertRun = (rings: number) => Array.from({ length: rings }, (_, i) => (i % 9 === 4 ? 3 : i % 13 === 7 ? -2 : 0));
const FESTIVAL = expertRun(70);
const HUNDRED = expertRun(100);

/** Light rays of a star that has risen into the sky. */
const Glints: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="glint-core">
        <stop offset="0" stopColor="#fffaf0" stopOpacity="0.9" />
        <stop offset="0.25" stopColor="#ffe7a8" stopOpacity="0.45" />
        <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="glint-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffaf0" stopOpacity="0" />
        <stop offset="0.5" stopColor="#fffaf0" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="glint-h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fffaf0" stopOpacity="0" />
        <stop offset="0.5" stopColor="#fffaf0" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="100" fill="url(#glint-core)" />
    <rect x="98.5" y="0" width="3" height="200" fill="url(#glint-v)" />
    <rect x="0" y="98.5" width="200" height="3" fill="url(#glint-h)" />
    <rect x="99" y="30" width="2" height="140" fill="url(#glint-v)" transform="rotate(45 100 100)" />
    <rect x="99" y="30" width="2" height="140" fill="url(#glint-v)" transform="rotate(-45 100 100)" />
  </svg>
);

const StarStage: React.FC<{ top?: number; size?: number; children: React.ReactNode }> = ({ top = 84, size = 330, children }) => (
  <div style={{ position: 'absolute', left: (390 - size) / 2, top, width: size }}>{children}</div>
);

const Callout: React.FC<{ title: string; note?: string; color?: string; top?: number }> = ({ title, note, color = C.ink, top = 548 }) => (
  <div style={{ position: 'absolute', left: 20, right: 20, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
    <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1, color }}>{title}</span>
    {note && <span style={{ fontSize: 13, color: C.muted }}>{note}</span>}
  </div>
);

const Meter: React.FC<{ width: number; danger?: boolean; spin?: string }> = (props) => (
  <div style={{ position: 'absolute', left: 40, right: 40, top: 624 }}>
    <WidthMeter {...props} />
  </div>
);

const TapHint: React.FC<{ text?: string }> = ({ text = 'Tap to lock the spinning ring' }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center' }}>
    <span style={{ fontSize: 13, padding: '7px 14px', borderRadius: 16, background: 'rgba(10,9,24,0.7)', color: C.ink }}>{text}</span>
  </div>
);

const RunScreen: React.FC<{ stage?: Stage; rings: number; streak: number; note?: string; children: React.ReactNode }> = ({ stage = 0, rings, streak, note, children }) => (
  <Screen stage={stage}>
    <Hud rings={rings} streak={streak} note={note} />
    {children}
  </Screen>
);

export const P01Loading: React.FC = () => (
  <Screen>
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, paddingBottom: 120 }}>
      <Parol size={180} locks={[0, 0, 0, 0]} light={0.5} />
      <Wordmark size={54} />
      <span style={{ fontSize: 14, color: C.muted }}>Lighting tonight’s star…</span>
      <div style={{ width: 120, height: 4, borderRadius: 2, background: '#241d44' }}>
        <div style={{ width: '60%', height: 4, borderRadius: 2, background: C.gold }} />
      </div>
    </div>
  </Screen>
);

export const P02Ready: React.FC = () => (
  <Screen>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Wordmark />
      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton name="sound" label="Sound on" />
        <IconButton name="board" label="Today's board" />
        <IconButton name="settings" label="Settings" />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 78, textAlign: 'center' }}>
      <Label>Sunday · 22 November</Label>
    </div>
    <StarStage top={96} size={270}>
      <Parol size={270} locks={TONIGHT} dim />
    </StarStage>
    <div style={{ position: 'absolute', left: 24, right: 24, top: 476, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
      <span style={{ fontFamily: SERIF, fontSize: 30 }}>Tonight’s star</span>
      <span style={{ fontSize: 14, lineHeight: 1.45, color: C.muted }}>Lock each spinning ring onto the one inside it. Everyone builds the same star today.</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 572, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <WeekStars lit={[false, false, true, true, true, true, false]} today={6} />
      <span style={{ fontSize: 13 }}>4-day streak · light today to make it 5</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 14, background: 'rgba(20,15,48,0.85)', border: `1px solid ${C.line}`, fontSize: 13 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: '#cd8a52', color: '#1a1206', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
        Yesterday you finished <strong>#3</strong> · 39 rings
      </div>
      <PrimaryButton>Light the first ring</PrimaryButton>
    </div>
  </Screen>
);

const Step: React.FC<{ n: number; title: string; text: string; children: React.ReactNode }> = ({ n, title, text, children }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
    <div style={{ width: 72, height: 72, flex: 'none', borderRadius: 16, background: '#15112f', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{children}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 15, fontWeight: 700 }}>
        {n}. {title}
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.4, color: C.muted }}>{text}</span>
    </div>
  </div>
);

export const P03HowToPlay: React.FC = () => (
  <Screen>
    <StarStage>
      <Parol size={330} locks={[0]} spin={20} />
    </StarStage>
    <Overlay align="end">
      <Card sheet>
        <span style={{ fontFamily: SERIF, fontSize: 28 }}>How to light a parol</span>
        <Step n={1} title="A ring spins in" text="Each new ring of the star turns around the centre.">
          <Parol size={66} compact locks={[0, 0]} spin={22} />
        </Step>
        <Step n={2} title="Tap to lock it" text="Lock when its points meet the gold dashes. Within 1.5° is perfect.">
          <Parol size={66} compact locks={[0, 0, 0]} glowLast />
        </Step>
        <Step n={3} title="Off-angle gets trimmed" text="The overhang falls away and the points get thinner. Below 8° the run ends.">
          <Parol size={66} compact locks={[0, 0, 9]} trimLast />
        </Step>
        <Step n={4} title="5 perfect in a row" text="Five perfect locks widen the points back.">
          <Parol size={66} compact locks={[0, 0, 0, 0, 0]} glowLast />
        </Step>
        <PrimaryButton>Got it</PrimaryButton>
      </Card>
    </Overlay>
  </Screen>
);

export const P04Spinning: React.FC = () => (
  <RunScreen rings={7} streak={1}>
    <StarStage>
      <Parol size={330} locks={OPENING} spin={16} />
    </StarStage>
    <Callout title="Line it up" note="Tap when the points meet the gold dashes" />
    <Meter width={27} />
    <TapHint />
  </RunScreen>
);

export const P05Perfect: React.FC = () => (
  <RunScreen rings={8} streak={1}>
    <StarStage>
      <Parol size={330} locks={[...OPENING, 0]} glowLast />
    </StarStage>
    <Callout title="Perfect" note="Locked within 1.5° · the points stay 27°" color={C.gold} />
    <Meter width={27} />
    <TapHint />
  </RunScreen>
);

export const P06PerfectFive: React.FC = () => (
  <RunScreen stage={1} rings={12} streak={5}>
    <StarStage>
      <Parol size={330} locks={[...OPENING, 0, 0, 0, 0, 0]} glowLast halo={1} />
    </StarStage>
    <Callout title="Perfect ×5" note="The points widen back to 33° · 10 rings earned a halo" color={C.gold} />
    <Meter width={33} spin="1.5× · reverses next" />
    <TapHint />
  </RunScreen>
);

export const P07Trim: React.FC = () => (
  <RunScreen rings={8} streak={0}>
    <StarStage>
      <Parol size={330} locks={[...OPENING, 9]} trimLast />
    </StarStage>
    <Callout title="9° off" note="The overhang is trimmed · the points are now 18°" color={C.coral} />
    <Meter width={18} />
    <TapHint />
  </RunScreen>
);

export const P08Danger: React.FC = () => (
  <RunScreen stage={1} rings={10} streak={0}>
    <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(255,80,60,0.35)' }} />
    <StarStage>
      <Parol size={330} locks={THIN} spin={-11} danger halo={1} />
    </StarStage>
    <Callout title="Careful" note="The points are 11° · one more 4° miss ends the run" color={C.coral} />
    <Meter width={11} danger spin="1.4× · counter-clockwise" />
    <TapHint />
  </RunScreen>
);

export const P09Milestone: React.FC = () => (
  <RunScreen stage={3} rings={30} streak={4}>
    <StarStage top={136}>
      <Parol size={330} locks={LONG_RUN} />
    </StarStage>
    <div style={{ position: 'absolute', left: 30, right: 30, top: 88, display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 18, background: 'rgba(20,15,48,0.9)', border: '1px solid rgba(255,210,122,0.5)' }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, color: C.gold }}>30 rings</span>
        <span style={{ fontSize: 13 }}>The neighbours light their parols</span>
      </div>
    </div>
    <Callout title="Keep going" note="At 40 the carolers come down the street" />
    <Meter width={30} spin="1.9× · clockwise" />
    <TapHint />
  </RunScreen>
);

export const P10Paused: React.FC = () => (
  <RunScreen rings={7} streak={1}>
    <StarStage>
      <Parol size={330} locks={OPENING} />
    </StarStage>
    <Overlay>
      <Card width={340}>
        <span style={{ fontFamily: SERIF, fontSize: 30, textAlign: 'center' }}>Paused</span>
        <span style={{ fontSize: 14, lineHeight: 1.5, color: C.muted, textAlign: 'center' }}>The ring that was spinning will start over. Your 7 rings, streak and 27° points are kept.</span>
        <PrimaryButton icon="play">Resume</PrimaryButton>
        <GhostButton>Start a new star</GhostButton>
      </Card>
    </Overlay>
  </RunScreen>
);

const Wire: React.FC = () => (
  <svg width="390" height="120" viewBox="0 0 390 120" style={{ position: 'absolute', left: 0, top: 0 }}>
    <path d="M0 34C120 66 270 66 390 34" stroke="#4a4166" strokeWidth="1.5" fill="none" />
    <path d="M195 58V86" stroke="#4a4166" strokeWidth="1.5" />
  </svg>
);

export const P11Results: React.FC = () => (
  <Screen stage={1}>
    <Wire />
    <StarStage top={74} size={210}>
      <Parol size={210} locks={SHORT_RUN} halo={1} />
    </StarStage>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 372, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
      <Label>Run ended</Label>
      <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1 }}>The points got too thin</span>
      <span style={{ fontSize: 13, color: C.muted }}>Ring 13 locked 7° off, leaving 4° points (8° needed)</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 480, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
      <StatTile value="12" label="rings" />
      <StatTile value="7" label="perfect" color={C.gold} />
      <StatTile value="#14" label="today" />
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 560, display: 'flex', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 12, background: 'rgba(255,210,122,0.12)', color: C.gold, border: '1px solid rgba(255,210,122,0.4)' }}>New best today</span>
      <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 12, background: 'rgba(255,210,122,0.12)', color: C.gold, border: '1px solid rgba(255,210,122,0.4)' }}>Day 5 · streak kept</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 600 }}>
      <Board rows={[...TODAY_ROWS, { rank: '14', name: 'You · Parol-3F1A', score: '12', you: true }]} rowHeight={26} />
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 22, display: 'flex', gap: 10 }}>
      <PrimaryButton>Light again</PrimaryButton>
      <GhostButton icon="share">Share star</GhostButton>
    </div>
  </Screen>
);

export const P12Board: React.FC = () => (
  <Screen background="linear-gradient(180deg, #1a1440 0%, #0f0c26 100%)">
    <div style={{ position: 'absolute', left: 16, right: 20, top: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconButton name="back" label="Back" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: SERIF, fontSize: 26 }}>Today’s board</span>
        <span style={{ fontSize: 12, color: C.muted }}>Sunday 22 Nov · resets 8:00 AM PH time</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 84, display: 'flex', gap: 8 }}>
      {['Today', 'Yesterday'].map((tab, i) => (
        <span key={tab} style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 18, background: i === 0 ? C.gold : 'transparent', color: i === 0 ? '#2a1606' : C.muted, border: i === 0 ? 'none' : `1px solid ${C.line}` }}>
          {tab}
        </span>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 134 }}>
      <Board
        rowHeight={34}
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
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26 }}>
      <Card>
        <Label>Your name on the board</Label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 12, background: '#15112f', border: `1px solid ${C.line}`, fontSize: 15 }}>
          <span style={{ flex: 1 }}>Parol-3F1A</span>
          <Icon name="edit" size={18} />
        </label>
        <span style={{ fontSize: 12, color: C.faint }}>3–18 letters, numbers, spaces, - or _</span>
      </Card>
    </div>
  </Screen>
);

/** The 1080×1350 share card, drawn at any width. A 100-ring run gets the gold card with the risen star. */
export const ShareCard: React.FC<{ width: number; gold?: boolean }> = ({ width, gold = false }) => {
  const s = width / 432;
  return (
    <div
      style={{
        width,
        height: 540 * s,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 14 * s,
        boxSizing: 'border-box',
        border: gold ? `${4 * s}px solid ${C.gold}` : undefined,
        background: gold
          ? 'linear-gradient(180deg, #241a4e 0%, #3a2458 45%, #b8607a 78%, #f2a66a 100%)'
          : 'radial-gradient(90% 60% at 50% 35%, #2e2158 0%, #120f2c 60%, #0a0918 100%)',
        color: C.ink,
        fontFamily: SANS,
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 432 540" style={{ position: 'absolute', inset: 0 }}>
          {!gold && <path d="M0 40C140 76 292 76 432 40" stroke="#4a4166" strokeWidth="1.5" fill="none" />}
          {!gold && <path d="M216 67V92" stroke="#4a4166" strokeWidth="1.5" />}
          <path d="M0 478L28 462L56 478V540H0ZM56 470L100 446L144 470V540H56ZM144 476L196 452L248 476V540H144ZM248 470L300 446L352 470V540H248ZM352 478L392 456L432 478V540H352Z" fill="#090713" />
        </svg>
      </div>
      {gold ? (
        <div style={{ position: 'absolute', left: 96 * s, top: 54 * s, width: 240 * s, height: 240 * s }}>
          <Glints size={240 * s} />
          <div style={{ position: 'absolute', left: 50 * s, top: 46 * s }}>
            <Parol size={140 * s} locks={HUNDRED} compact />
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', left: 116 * s, top: 82 * s }}>
          <Parol size={200 * s} locks={SHORT_RUN} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 24 * s, right: 24 * s, top: 14 * s, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: SERIF, fontSize: 20 * s }}>Parol</span>
        <span style={{ fontSize: 12 * s, color: gold ? C.ink : C.muted }}>22 Nov 2026</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: (gold ? 330 : 372) * s, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 * s }}>
        {gold && <span style={{ fontSize: 12 * s, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>The star rose</span>}
        <span style={{ fontFamily: SERIF, fontSize: (gold ? 34 : 28) * s }}>{gold ? '100 rings' : '12 rings lit'}</span>
        <span style={{ fontSize: 14 * s }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>{gold ? '82 perfect' : '7 perfect'}</span> · {gold ? '#2 today' : '#14 today'}
        </span>
      </div>
      <span style={{ position: 'absolute', left: 0, right: 0, bottom: 14 * s, textAlign: 'center', fontSize: 12 * s, color: C.muted }}>[GAME URL]</span>
    </div>
  );
};

export const P13Share: React.FC = () => (
  <Screen stage={1}>
    <Overlay align="end">
      <Card sheet>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: SERIF, fontSize: 26 }}>Share your star</span>
          <IconButton name="close" label="Close" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ShareCard width={270} />
        </div>
        <PrimaryButton icon="share">Share</PrimaryButton>
        <div style={{ display: 'flex', gap: 10 }}>
          <GhostButton icon="download">Save image</GhostButton>
          <GhostButton icon="copy">Copy text</GhostButton>
        </div>
      </Card>
    </Overlay>
  </Screen>
);

const Toggle: React.FC<{ label: string; note?: string; on: boolean }> = ({ label, note, on }) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 }}>
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 15 }}>{label}</span>
      {note && <span style={{ fontSize: 12, color: C.faint }}>{note}</span>}
    </span>
    <span role="switch" aria-checked={on} style={{ width: 48, height: 28, borderRadius: 14, background: on ? C.gold : '#2f2856', position: 'relative', flex: 'none' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: 11, background: on ? '#2a1606' : C.muted }} />
    </span>
  </label>
);

export const P14Settings: React.FC = () => (
  <Screen>
    <StarStage top={96} size={270}>
      <Parol size={270} locks={TONIGHT} dim />
    </StarStage>
    <Overlay align="end">
      <Card sheet>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: SERIF, fontSize: 26 }}>Settings</span>
          <IconButton name="close" label="Close" />
        </div>
        <Toggle label="Sound" note="Bells on each lock, chimes on perfects" on />
        <Toggle label="Vibration" note="Android only · iPhones don’t allow it on the web" on />
        <Toggle label="Reduced motion" note="Calmer spin trails and no fireworks" on={false} />
        <div style={{ height: 1, background: C.line }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 }}>
          <span style={{ fontSize: 15 }}>How to play</span>
          <span style={{ fontSize: 13, color: C.gold }}>Show again</span>
        </div>
        <span style={{ fontSize: 12, color: C.faint, textAlign: 'center' }}>Parol · a new star every night at 8:00 AM PH time</span>
      </Card>
    </Overlay>
  </Screen>
);

const MilestoneToast: React.FC<{ rings: number; text: string; top?: number }> = ({ rings, text, top = 88 }) => (
  <div style={{ position: 'absolute', left: 24, right: 24, top, display: 'flex', justifyContent: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 18, background: 'rgba(20,15,48,0.9)', border: '1px solid rgba(255,210,122,0.5)' }}>
      <span style={{ fontFamily: SERIF, fontSize: 18, color: C.gold, whiteSpace: 'nowrap' }}>{rings} rings</span>
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  </div>
);

export const P16Festival: React.FC = () => (
  <RunScreen stage={7} rings={70} streak={2}>
    <MilestoneToast rings={70} text="The lantern festival begins" />
    <StarStage top={136}>
      <Parol size={330} locks={FESTIVAL} spin={10} />
    </StarStage>
    <Callout title="Rotor mode" note="Rings dance like a giant lantern · fireworks at 80" color={C.gold} />
    <Meter width={33} spin="2.0× · counter-clockwise" />
    <TapHint />
  </RunScreen>
);

export const P17StarRises: React.FC = () => (
  <Screen stage={9}>
    <Hud rings={100} streak={1} />
    <svg width="390" height="844" viewBox="0 0 390 844" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff1c2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M187 236L203 236L250 700L140 700Z" fill="url(#beam)" opacity="0.5" />
      <path d="M0 520C120 552 270 552 390 520" stroke="#4a4166" strokeWidth="1.5" fill="none" />
      <path d="M195 544V560" stroke="#4a4166" strokeWidth="1.5" />
    </svg>
    <div style={{ position: 'absolute', left: 75, top: 96, width: 240, height: 240 }}>
      <Glints size={240} />
      <div style={{ position: 'absolute', left: 50, top: 46 }}>
        <Parol size={140} locks={HUNDRED} compact />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 24, right: 24, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
      <Label color={C.gold}>100 rings</Label>
      <span style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.1 }}>Your parol became a star</span>
      <span style={{ fontSize: 14, lineHeight: 1.45, color: C.ink }}>The Star of Bethlehem shines over the barangay.</span>
    </div>
    <div style={{ position: 'absolute', left: 24, right: 24, top: 510, display: 'flex', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 12, background: 'rgba(20,15,48,0.85)', color: C.gold, border: '1px solid rgba(255,210,122,0.5)' }}>Gold star on today’s streak</span>
      <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 12, background: 'rgba(20,15,48,0.85)', color: C.gold, border: '1px solid rgba(255,210,122,0.5)' }}>Gold share card</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 13, color: C.ink, textAlign: 'center', padding: '6px 12px', borderRadius: 14, background: 'rgba(10,9,24,0.7)', alignSelf: 'center' }}>The run goes on · every 10 rings adds a star to your sky</span>
      <PrimaryButton>Keep going</PrimaryButton>
    </div>
  </Screen>
);
