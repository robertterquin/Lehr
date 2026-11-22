import React from 'react';
import { Parol } from '../ParolStar';
import { C, Hud, Label, SANS, SERIF, Wordmark } from './kit';
import { Callout, Meter, StarStage, expertRun } from './phone';
import { NIGHTS, type Night } from './nights';

const RINGS = 34;

/** A run at 34 rings on one night: lights and neighbours' parols are on, so the scene is alive. */
const NightRun: React.FC<{ night: Night }> = ({ night }) => (
  <div style={{ width: 390, height: 844, position: 'relative', overflow: 'hidden', background: C.night, color: C.ink, fontFamily: SANS }}>
    <night.Scene stage={3} />
    <Hud rings={RINGS} streak={3} />
    <StarStage top={96}>
      <Parol size={330} locks={expertRun(RINGS)} spin={12} palette={night.palette} />
    </StarStage>
    <Callout title={night.name} note={`${night.day} night · ${night.place}`} />
    <Meter width={33} spin="1.8× · clockwise" />
  </div>
);

export const NIGHT_SCREENS = NIGHTS.map((night) => {
  const Screen: React.FC = () => <NightRun night={night} />;
  return { night, Screen };
});

export const W01Week: React.FC = () => (
  <div style={{ width: 1900, height: 1000, background: 'linear-gradient(180deg, #140f30 0%, #0a0918 100%)', color: C.ink, fontFamily: SANS, padding: '64px 70px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 40 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
      <Wordmark size={72} />
      <span style={{ fontSize: 28, color: C.muted }}>Seven nights · a new place and new paper every day of the week</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 30 }}>
      {NIGHT_SCREENS.map(({ night, Screen }, i) => (
        <div key={night.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 218, height: 472, borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.line}` }}>
            <div style={{ width: 390, height: 844, transform: 'scale(0.559)', transformOrigin: '0 0' }}>
              <Screen />
            </div>
          </div>
          <Label color={C.gold}>{`N0${i + 1} · ${night.araw}`}</Label>
          <span style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.1 }}>{night.name}</span>
          <span style={{ fontSize: 14, color: C.muted }}>{night.day} · {night.place}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {night.palette.map((color) => (
              <span key={color} style={{ width: 24, height: 24, borderRadius: 12, background: color, border: `1px solid ${C.line}` }} />
            ))}
          </div>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: C.faint }}>{night.blurb}</span>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 40, fontSize: 15, lineHeight: 1.5, color: C.ink }}>
      <span style={{ flex: 1 }}>· The night follows the weekday in Manila time, so everyone on today’s board plays the same place.</span>
      <span style={{ flex: 1 }}>· Only the look changes: the paper colours and the scene. The rules, the seed and the streak’s scale stay the same.</span>
      <span style={{ flex: 1 }}>· Every scene keeps the milestone ladder: lights at 20, parols at 30, carolers at 40, far lights at 50, giant lanterns at 70, fireworks at 80, dawn at 90.</span>
    </div>
  </div>
);
