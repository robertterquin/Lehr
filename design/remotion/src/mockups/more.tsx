import React from 'react';
import { playLocks } from '../parol';
import { Parol } from '../ParolStar';
import { C, IconButton, SANS, SERIF, Screen, Street, Wordmark, type Stage } from './kit';
import {
  Callout, Glints, Meter, MilestoneToast, RunScreen, StarStage, TapHint, TONIGHT, expertRun,
  P01Loading, P02Ready, P03HowToPlay, P04Spinning, P05Perfect, P06PerfectFive, P07Trim, P08Danger, P09Milestone, P10Paused, P11Results, P12Board, P13Share, P14Settings, P16Festival, P17StarRises,
} from './phone';
import { S01FirstTime, S02Offline, S03NameError, S04NewDay, S05EmptyBoard, S06ReducedMotion } from './states';

type Milestone = { rings: number; stage: Stage; toast: string; title: string; note: string };

/** An in-run screen at a milestone; star width and streak come from replaying the run under the rules. */
const MilestoneScreen: React.FC<Milestone> = ({ rings, stage, toast, title, note }) => {
  const locks = expertRun(rings);
  const last = playLocks(locks)[rings - 1];
  return (
    <RunScreen stage={stage} rings={rings} streak={last.perfect ? last.streak : 0}>
      <MilestoneToast rings={rings} text={toast} />
      <StarStage top={136}>
        <Parol size={330} locks={locks} spin={12} />
      </StarStage>
      <Callout title={title} note={note} color={C.gold} />
      <Meter width={last.width} rings={rings} />
      <TapHint />
    </RunScreen>
  );
};

export const P19Lights: React.FC = () => <MilestoneScreen rings={20} stage={2} toast="The street lights come on" title="Street lights" note="Next: the neighbours light their parols at 30" />;
export const P20Carolers: React.FC = () => <MilestoneScreen rings={40} stage={4} toast="The carolers come down the street" title="Carolers" note="Next: the whole barangay lights up at 50" />;
export const P21Barangay: React.FC = () => <MilestoneScreen rings={50} stage={5} toast="A second halo · the barangay lights up" title="Halfway to the sky" note="Next: rotor mode at 60" />;
export const P22Rotor: React.FC = () => <MilestoneScreen rings={60} stage={6} toast="Rotor mode: your rings start to dance" title="Rotor mode" note="Next: the lantern festival at 70" />;
export const P23Fireworks: React.FC = () => <MilestoneScreen rings={80} stage={8} toast="A third halo · fireworks over the town" title="Fireworks" note="Next: Simbang Gabi dawn at 90" />;
export const P24Dawn: React.FC = () => <MilestoneScreen rings={90} stage={9} toast="Simbang Gabi dawn" title="Dawn is coming" note="10 more rings and your parol becomes a star" />;

/** Past 100: the risen star keeps growing, and every 10 rings lights a star of the player's own constellation. */
export const P25Constellation: React.FC = () => {
  const locks = expertRun(130);
  const last = playLocks(locks)[129];
  const center: [number, number] = [195, 290];
  // Clear of the fireworks, which burst at the top left, top right and left of the sky.
  const stars: [number, number][] = [[300, 140], [84, 420], [318, 440]];
  return (
    <RunScreen stage={10} rings={130} streak={last.perfect ? last.streak : 0}>
      <MilestoneToast rings={130} text="3 stars in your sky" />
      <svg width="390" height="844" viewBox="0 0 390 844" style={{ position: 'absolute', inset: 0 }}>
        {[...stars.map((star) => [center, star]), [stars[0], stars[1]], [stars[1], stars[2]]].map(([a, b], i) => (
          <path key={i} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke="#ffe7a8" strokeWidth="1" strokeDasharray="3 5" opacity="0.6" />
        ))}
      </svg>
      {stars.map(([x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60 }}>
          <Glints size={60} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: center[0] - 130, top: center[1] - 130, width: 260, height: 260 }}>
        <Glints size={260} />
        <div style={{ position: 'absolute', left: 50, top: 50 }}>
          <Parol size={160} locks={locks} spin={12} compact />
        </div>
      </div>
      <Callout title="Your constellation" note="Every 10 rings past 100 adds a star to your sky" color={C.gold} />
      <Meter width={last.width} rings={130} />
      <TapHint />
    </RunScreen>
  );
};

const JOURNEY = [
  { rings: 10, title: 'First halo', text: 'A bamboo hoop of bulbs rings your star' },
  { rings: 20, title: 'Street lights', text: 'The string lights across the street come on' },
  { rings: 30, title: 'Neighbours’ parols', text: 'Every house lights its own parol' },
  { rings: 40, title: 'Carolers', text: 'Children sing down the street' },
  { rings: 50, title: 'The whole barangay', text: 'A second halo; the far hills twinkle' },
  { rings: 60, title: 'Rotor mode', text: 'Your rings dance like a giant lantern' },
  { rings: 70, title: 'Lantern festival', text: 'Giant lanterns glow over the plaza' },
  { rings: 80, title: 'Fireworks', text: 'A third halo; fireworks over the town' },
  { rings: 90, title: 'Simbang Gabi dawn', text: 'The sky warms and a church bell rings' },
  { rings: 100, title: 'The star rises', text: 'Your parol becomes the Star of Bethlehem' },
];

export const P26JourneyMap: React.FC = () => {
  const best = 39;
  return (
    <Screen background="linear-gradient(180deg, #1a1440 0%, #0f0c26 100%)" street={false}>
      <div style={{ position: 'absolute', left: 16, right: 20, top: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconButton name="back" label="Back" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: SERIF, fontSize: 26 }}>Tonight’s journey</span>
          <span style={{ fontSize: 12, color: C.muted }}>Your best today: {best} rings · 1 ring from the carolers</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, right: 20, top: 92, display: 'flex', flexDirection: 'column' }}>
        {JOURNEY.map((step, i) => {
          const reached = step.rings <= best;
          const next = !reached && (i === 0 || JOURNEY[i - 1].rings <= best);
          return (
            <div key={step.rings} style={{ display: 'flex', gap: 14, minHeight: 64 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36 }}>
                <span
                  style={{
                    width: 36, height: 36, borderRadius: 18, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    background: reached ? C.gold : next ? 'rgba(255,210,122,0.14)' : '#1a1538',
                    color: reached ? '#2a1606' : next ? C.gold : C.faint,
                    border: next ? `1.5px dashed ${C.gold}` : `1px solid ${reached ? '#b8862a' : C.line}`,
                  }}
                >
                  {step.rings}
                </span>
                {i < JOURNEY.length - 1 && <span style={{ flex: 1, width: 2, background: reached ? C.gold : C.line }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: reached || next ? C.ink : C.muted }}>
                  {step.title}
                  {next && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: C.gold }}>NEXT</span>}
                </span>
                <span style={{ fontSize: 12, color: C.faint }}>{step.text}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 22, padding: '10px 14px', borderRadius: 14, background: 'rgba(20,15,48,0.85)', border: `1px solid ${C.line}`, fontSize: 13, textAlign: 'center' }}>
        Past 100, every 10 rings adds a star to your own constellation
      </div>
    </Screen>
  );
};

/** Logo lockup: the star mark beside the wordmark. */
export const B01Logo: React.FC = () => (
  <div style={{ width: 1600, height: 800, background: C.night, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, color: C.ink, fontFamily: SANS }}>
    <Parol size={380} locks={TONIGHT} compact />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Wordmark size={240} />
      <span style={{ fontSize: 46, color: C.muted, paddingLeft: 10 }}>Light tonight’s star</span>
    </div>
  </div>
);

/** App icon: square art; the platform applies its own corner mask. */
export const B02AppIcon: React.FC = () => (
  <div style={{ width: 1024, height: 1024, background: 'radial-gradient(70% 70% at 50% 45%, #3a2a6e 0%, #1a1440 60%, #0c0a1e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Parol size={820} locks={TONIGHT} compact />
  </div>
);

/** Link preview (Open Graph) image, 1200×630. */
export const B03LinkPreview: React.FC = () => (
  <div style={{ width: 1200, height: 630, position: 'relative', overflow: 'hidden', background: C.night, color: C.ink, fontFamily: SANS }}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: 'absolute', left: i * 300, bottom: 0, width: 300, height: 649 }}>
        <Street stage={3} moon={false} tile={i} />
      </div>
    ))}
    <div style={{ position: 'absolute', left: 90, top: 150, display: 'flex', flexDirection: 'column', gap: 18, width: 560 }}>
      <Wordmark size={120} />
      <span style={{ fontSize: 40, lineHeight: 1.25 }}>Spin. Lock. Light tonight’s star.</span>
      <span style={{ fontSize: 26, color: C.muted }}>A new parol to build every night</span>
    </div>
    <div style={{ position: 'absolute', left: 700, top: 40 }}>
      <Parol size={400} locks={expertRun(14)} />
    </div>
  </div>
);

// ——— The app map: every screen in the order players move through them ———

const SCALE = 0.42;
const Thumb: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 390 * SCALE }}>
    <div style={{ width: 390 * SCALE, height: 844 * SCALE, overflow: 'hidden', borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
      <div style={{ width: 390, height: 844, transform: `scale(${SCALE})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
    <span style={{ fontSize: 17, color: C.ink, textAlign: 'center' }}>{label}</span>
  </div>
);

const Arrow: React.FC = () => (
  <svg width="34" height="20" viewBox="0 0 34 20" style={{ marginTop: 170, flex: 'none' }}>
    <path d="M2 10H28M22 4l7 6-7 6" stroke={C.gold} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Row: React.FC<{ title: string; note: string; items: [string, React.FC][]; side?: [string, React.FC][] }> = ({ title, note, items, side = [] }) => (
  <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
    <div style={{ width: 220, flex: 'none', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 140 }}>
      <span style={{ fontFamily: SERIF, fontSize: 34 }}>{title}</span>
      <span style={{ fontSize: 16, lineHeight: 1.45, color: C.muted }}>{note}</span>
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      {items.map(([label, Page], i) => (
        <React.Fragment key={label}>
          {i > 0 && <Arrow />}
          <Thumb label={label}>
            <Page />
          </Thumb>
        </React.Fragment>
      ))}
      {side.length > 0 && <div style={{ width: 2, alignSelf: 'stretch', margin: '0 26px', background: C.line }} />}
      <div style={{ display: 'flex', gap: 24 }}>
        {side.map(([label, Page]) => (
          <Thumb key={label} label={label}>
            <Page />
          </Thumb>
        ))}
      </div>
    </div>
  </div>
);

export const A01AppMap: React.FC = () => (
  <div style={{ width: 2640, height: 2560, background: 'linear-gradient(180deg, #120f2c 0%, #0a0918 100%)', color: C.ink, fontFamily: SANS, padding: '70px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 50 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
      <Wordmark size={72} />
      <span style={{ fontSize: 28, color: C.muted }}>App map · every screen, in the order players move through them</span>
    </div>
    <Row title="Start" note="Open the game, see tonight’s star, learn the rules once." items={[['Loading', P01Loading], ['Ready', P02Ready], ['How to play', P03HowToPlay]]} side={[['Settings', P14Settings], ['Tonight’s journey', P26JourneyMap]]} />
    <Row title="Play" note="Rings spin in; tap to lock. Each lock is perfect, trimmed, or close to the end." items={[['Spinning', P04Spinning], ['Perfect', P05Perfect], ['Perfect ×5', P06PerfectFive], ['Off-angle trim', P07Trim], ['Danger', P08Danger]]} side={[['Paused', P10Paused]]} />
    <Row title="Journey" note="The street comes alive every 10 rings, up to the star rising at 100." items={[['20 · lights', P19Lights], ['30 · neighbours', P09Milestone], ['40 · carolers', P20Carolers], ['50 · barangay', P21Barangay], ['60 · rotor', P22Rotor], ['70 · festival', P16Festival], ['80 · fireworks', P23Fireworks], ['90 · dawn', P24Dawn], ['100 · star rises', P17StarRises], ['130 · constellation', P25Constellation]]} />
    <Row title="After the run" note="See how you did, share your star, and check the board." items={[['Run ended', P11Results], ['Share', P13Share], ['Today’s board', P12Board]]} />
    <Row title="Edge cases" note="First visit, no signal, a rejected name, the day rolling over, an empty board, reduced motion." items={[['First visit', S01FirstTime], ['Offline', S02Offline], ['Name not allowed', S03NameError], ['New day', S04NewDay], ['Empty board', S05EmptyBoard], ['Reduced motion', S06ReducedMotion]]} />
  </div>
);
