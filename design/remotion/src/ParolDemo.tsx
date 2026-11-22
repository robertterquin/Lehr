import React from 'react';
import { AbsoluteFill, Track, useVideoConfig } from 'remotion';
import { GAMEPLAY_SECONDS } from './parol';
import { EndCard, FinaleScene, GameplayScene, TitleScene } from './scenes';

export const DEMO_SECONDS = 2.5 + GAMEPLAY_SECONDS + 4.5 + 2.5;

export const ParolDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#0a0918' }}>
      <Track name="Scenes">
        <TitleScene name="Title" durationInFrames={Math.round(2.5 * fps)} />
        <GameplayScene name="Gameplay" from={Math.round(2.5 * fps)} durationInFrames={Math.round(GAMEPLAY_SECONDS * fps)} />
        <FinaleScene name="Finale" from={Math.round((2.5 + GAMEPLAY_SECONDS) * fps)} durationInFrames={Math.round(4.5 * fps)} />
        <EndCard name="End card" from={Math.round((7 + GAMEPLAY_SECONDS) * fps)} durationInFrames={Math.round(2.5 * fps)} />
      </Track>
    </AbsoluteFill>
  );
};
