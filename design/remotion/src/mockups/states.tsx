import React from 'react';
import { Parol } from '../ParolStar';
import { Board, C, Card, GhostButton, Icon, IconButton, Label, Overlay, PrimaryButton, SANS, SERIF, Screen, StatTile, StreakStars, WidthMeter, Wordmark } from './kit';
import { SHORT_RUN, TONIGHT } from './phone';

const Chip: React.FC<{ children: React.ReactNode; tone?: 'gold' | 'coral' | 'plain' }> = ({ children, tone = 'gold' }) => {
  const color = tone === 'gold' ? C.gold : tone === 'coral' ? C.coral : C.ink;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 12, background: 'rgba(20,15,48,0.85)', color, border: `1px solid ${tone === 'plain' ? C.line : color}` }}>
      {children}
    </span>
  );
};

/** First visit: no streak, no rank yet, and an invitation instead of stats. */
export const S01FirstTime: React.FC = () => (
  <Screen>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Wordmark />
      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton name="sound" label="Sound on" />
        <IconButton name="settings" label="Settings" />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 78, textAlign: 'center' }}>
      <Label>Sunday · 22 November</Label>
    </div>
    <div style={{ position: 'absolute', left: 60, top: 100 }}>
      <Parol size={270} locks={TONIGHT} dim />
    </div>
    <div style={{ position: 'absolute', left: 24, right: 24, top: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <span style={{ fontFamily: SERIF, fontSize: 30 }}>Light your first parol</span>
      <span style={{ fontSize: 14, lineHeight: 1.45, color: C.muted }}>Lock each spinning ring onto the one inside it. One tap, one ring. Everyone builds the same star tonight.</span>
      <Chip>Your streak starts tonight</Chip>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26 }}>
      <PrimaryButton>Start · it takes a minute</PrimaryButton>
    </div>
  </Screen>
);

/** No connection: the run still counts on this phone and uploads later. */
export const S02Offline: React.FC = () => (
  <Screen stage={1}>
    <div style={{ position: 'absolute', left: 105, top: 115 }}>
      <Parol size={180} locks={SHORT_RUN} />
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'rgba(40,22,30,0.95)', border: '1px solid rgba(255,157,138,0.55)' }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.coral} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M2 7a12 12 0 0 1 16 0M5 10.5a7 7 0 0 1 10 0M8.5 14a2 2 0 0 1 3 0M3 3l14 14" />
      </svg>
      <span style={{ fontSize: 13, lineHeight: 1.35 }}>
        You’re offline. This run is saved on your phone and goes on the board when you’re back online.
      </span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
      <Label>Run ended</Label>
      <span style={{ fontFamily: SERIF, fontSize: 30 }}>The points got too thin</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 480, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
      <StatTile value="12" label="rings" />
      <StatTile value="7" label="perfect" color={C.gold} />
      <StatTile value="—" label="rank waits for signal" />
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26, display: 'flex', gap: 10 }}>
      <PrimaryButton>Light again</PrimaryButton>
      <GhostButton icon="download">Save image</GhostButton>
    </div>
  </Screen>
);

/** The board's name field rejecting a name, with the reason and a way out. */
export const S03NameError: React.FC = () => (
  <Screen background="linear-gradient(180deg, #1a1440 0%, #0f0c26 100%)" street={false}>
    <div style={{ position: 'absolute', left: 16, right: 20, top: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconButton name="back" label="Back" />
      <span style={{ fontFamily: SERIF, fontSize: 26 }}>Your name</span>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 96, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label htmlFor="name" style={{ fontSize: 13, color: C.muted }}>
        Name on the board
      </label>
      <div id="name" style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 14px', borderRadius: 12, background: '#15112f', border: `1.5px solid ${C.coral}`, fontSize: 16 }}>
        <span style={{ flex: 1 }}>xx_badword_xx</span>
        <Icon name="close" size={18} />
      </div>
      <span role="alert" style={{ fontSize: 13, color: C.coral }}>
        That name isn’t allowed. Try another.
      </span>
      <span style={{ fontSize: 12, color: C.faint }}>3–18 letters, numbers, spaces, - or _. Names are checked in English and Filipino.</span>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <PrimaryButton>Save name</PrimaryButton>
        <GhostButton>Use Parol-3F1A</GhostButton>
      </div>
    </div>
  </Screen>
);

/** The day changes at 8:00 AM PH time (00:00 UTC) while the game is open. */
export const S04NewDay: React.FC = () => (
  <Screen>
    <div style={{ position: 'absolute', left: 60, top: 100 }}>
      <Parol size={270} locks={TONIGHT} dim />
    </div>
    <Overlay>
      <Card width={340}>
        <span style={{ fontFamily: SERIF, fontSize: 28, textAlign: 'center' }}>A new star is ready</span>
        <span style={{ fontSize: 14, lineHeight: 1.5, color: C.muted, textAlign: 'center' }}>
          It’s 8:00 AM in the Philippines, so yesterday’s board has closed. You finished #14 with 12 rings, and your streak is safe.
        </span>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StreakStars streak={4} size={20} />
        </div>
        <PrimaryButton>See tonight’s star</PrimaryButton>
      </Card>
    </Overlay>
  </Screen>
);

/** Early in the day, before anyone has played. */
export const S05EmptyBoard: React.FC = () => (
  <Screen background="linear-gradient(180deg, #1a1440 0%, #0f0c26 100%)" street={false}>
    <div style={{ position: 'absolute', left: 16, right: 20, top: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconButton name="back" label="Back" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: SERIF, fontSize: 26 }}>Today’s board</span>
        <span style={{ fontSize: 12, color: C.muted }}>Opened at 8:00 AM PH time</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
      <Parol size={150} locks={[0]} compact />
      <span style={{ fontFamily: SERIF, fontSize: 28 }}>No stars yet today</span>
      <span style={{ fontSize: 14, lineHeight: 1.5, color: C.muted }}>Light the first parol on the board. Your name goes at the top until someone beats you.</span>
      <PrimaryButton width={260}>Light the first star</PrimaryButton>
    </div>
  </Screen>
);

/** Reduced motion: no spin trails, no fireworks, the ring steps instead of sweeping, labels say what happened. */
export const S06ReducedMotion: React.FC = () => (
  <Screen>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <Label>Rings</Label>
        <span style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1 }}>7</span>
      </div>
      <IconButton name="pause" label="Pause" />
    </div>
    <div style={{ position: 'absolute', left: 30, top: 84 }}>
      <Parol size={330} locks={[0, 0, 0, 4, 0, 0, -5]} spin={10} light={0.6} />
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 516, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1 }}>10° to go</span>
      <span style={{ fontSize: 13, lineHeight: 1.4, color: C.muted }}>Reduced motion: the ring turns in small steps and tells you how far it is</span>
    </div>
    <div style={{ position: 'absolute', left: 40, right: 40, top: 608 }}>
      <WidthMeter width={27} rings={7} />
    </div>
  </Screen>
);

/** One sheet with every colour, type style and component, for building the game. */
const Swatch: React.FC<{ name: string; hex: string; use: string; contrast?: string; dark?: boolean }> = ({ name, hex, use, contrast, dark = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 200 }}>
    <div style={{ height: 84, borderRadius: 14, background: hex, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'flex-end', padding: 10, boxSizing: 'border-box', color: dark ? C.ink : '#1a1206', fontSize: 13, fontWeight: 700 }}>{contrast}</div>
    <span style={{ fontSize: 16, fontWeight: 700 }}>{name}</span>
    <span style={{ fontSize: 14, color: C.muted, fontFamily: 'monospace' }}>{hex}</span>
    <span style={{ fontSize: 13, color: C.faint, lineHeight: 1.4 }}>{use}</span>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
    <span style={{ fontFamily: SERIF, fontSize: 40 }}>{title}</span>
    {children}
  </div>
);

export const DS01DesignSystem: React.FC = () => (
  <div style={{ width: 1800, height: 2260, background: 'linear-gradient(180deg, #140f30 0%, #0a0918 100%)', color: C.ink, fontFamily: SANS, padding: '70px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 56 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
      <Wordmark size={72} />
      <span style={{ fontSize: 28, color: C.muted }}>Design system · colours, type and components</span>
    </div>

    <Section title="Colour">
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        <Swatch name="Night" hex="#140F30" use="Background. Sky gradient #2A1E55 → #0A0918" contrast="Ink on night 16.2:1" dark />
        <Swatch name="Surface" hex="#221C46" use="Cards, sheets, tiles" contrast="Ink 14.0:1" dark />
        <Swatch name="Ink" hex="#F7F0E3" use="Primary text and numbers" contrast="Text" />
        <Swatch name="Muted" hex="#C9BFE0" use="Secondary text" contrast="On night 10.5:1" />
        <Swatch name="Faint" hex="#A99FC4" use="Hints and footnotes" contrast="On night 7.4:1" />
        <Swatch name="Gold" hex="#FFD27A" use="Perfect, streak, primary button (dark text on gold 12.1:1)" contrast="On night 12.9:1" />
        <Swatch name="Coral" hex="#FF9D8A" use="Trim, danger, errors" contrast="On night 9.2:1" />
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 16, color: C.muted, width: 200 }}>Parol paper</span>
        {[['Pearl', '#F4ECD8'], ['Red', '#D8342C'], ['Gold', '#F2B632'], ['Green', '#2E9A5A'], ['Blue', '#2F6FD0'], ['Magenta', '#C43A8A'], ['Bamboo', '#5B3A1C']].map(([name, hex]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 70, height: 70, borderRadius: 35, background: hex, border: `1px solid ${C.line}` }} />
            <span style={{ fontSize: 13 }}>{name}</span>
            <span style={{ fontSize: 12, color: C.faint, fontFamily: 'monospace' }}>{hex}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Type">
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', rowGap: 18, alignItems: 'baseline' }}>
        <span style={{ fontSize: 15, color: C.muted }}>Display · Young Serif 56</span>
        <span style={{ fontFamily: SERIF, fontSize: 56 }}>Tonight’s star</span>
        <span style={{ fontSize: 15, color: C.muted }}>Number · Young Serif 40</span>
        <span style={{ fontFamily: SERIF, fontSize: 40 }}>Rings 42</span>
        <span style={{ fontSize: 15, color: C.muted }}>Title · Young Serif 30</span>
        <span style={{ fontFamily: SERIF, fontSize: 30 }}>Perfect ×5</span>
        <span style={{ fontSize: 15, color: C.muted }}>Button · Manrope 700 17</span>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Light the first ring</span>
        <span style={{ fontSize: 15, color: C.muted }}>Body · Manrope 400 14 / 1.5</span>
        <span style={{ fontSize: 14, lineHeight: 1.5 }}>Lock each spinning ring onto the one inside it.</span>
        <span style={{ fontSize: 15, color: C.muted }}>Label · Manrope 11, 0.14em caps</span>
        <Label>Run ended</Label>
      </div>
    </Section>

    <Section title="Components">
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 340 }}>
          <span style={{ fontSize: 15, color: C.muted }}>Buttons · 56 / 54 / 44 px tall</span>
          <PrimaryButton>Light again</PrimaryButton>
          <GhostButton icon="share">Share star</GhostButton>
          <div style={{ display: 'flex', gap: 10 }}>
            <IconButton name="pause" label="Pause" />
            <IconButton name="sound" label="Sound" />
            <IconButton name="board" label="Board" />
            <IconButton name="settings" label="Settings" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
          <span style={{ fontSize: 15, color: C.muted }}>Meters and streak</span>
          <WidthMeter width={27} rings={7} />
          <WidthMeter width={11} rings={10} danger />
          <StreakStars streak={3} size={22} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip>New best today</Chip>
            <Chip tone="coral">9° off</Chip>
            <Chip tone="plain">No streak</Chip>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 380 }}>
          <span style={{ fontSize: 15, color: C.muted }}>Tiles and board</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            <StatTile value="12" label="rings" />
            <StatTile value="7" label="perfect" color={C.gold} />
            <StatTile value="#14" label="today" />
          </div>
          <Board rows={[{ rank: '1', name: 'Parol-4C1E', score: '61', medal: 'gold' }, { rank: '14', name: 'You · Parol-3F1A', score: '12', you: true }]} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 15, color: C.muted }}>The star: unlit, spinning, trimmed, perfect</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <Parol size={120} locks={[0, 0, 0, 0, 0, 0]} dim compact />
            <Parol size={120} locks={[0, 0, 0, 0, 0]} spin={14} compact />
            <Parol size={120} locks={[0, 0, 0, 0, 0, 9]} trimLast compact />
            <Parol size={120} locks={[0, 0, 0, 0, 0, 0]} glowLast compact />
          </div>
        </div>
      </div>
    </Section>

    <Section title="Rules for building">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 28, fontSize: 16, lineHeight: 1.55, color: C.muted }}>
        <span>
          <strong style={{ color: C.ink }}>Touch:</strong> every control is at least 44 × 44 px. The whole screen is the tap target for locking, except buttons.
        </span>
        <span>
          <strong style={{ color: C.ink }}>Never colour alone:</strong> perfect and trim are always named in words (“Perfect”, “9° off”), not only gold and coral.
        </span>
        <span>
          <strong style={{ color: C.ink }}>Motion:</strong> rings spin in over 0.15 s, locks snap in 0.08 s, slivers fall for 1.2 s. Reduced motion steps the ring and drops trails and fireworks.
        </span>
      </div>
    </Section>
  </div>
);
