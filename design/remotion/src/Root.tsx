import React from 'react';
import { Composition, Folder, Still } from 'remotion';
import { GAMEPLAY_SECONDS } from './parol';
import { DEMO_SECONDS, ParolDemo } from './ParolDemo';
import { EndCard, FinaleScene, GameplayScene, TitleScene } from './scenes';
import { D01Ready, D02Spinning, D03Results, D04Board } from './mockups/desktop';
import {
  P01Loading, P02Ready, P03HowToPlay, P04Spinning, P05Perfect, P06PerfectFive, P07Trim, P08Danger, P09Milestone, P10Paused, P11Results, P12Board, P13Share, P14Settings, ShareCard,
} from './mockups/phone';

const ShareCardFull: React.FC = () => <ShareCard width={1080} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ParolDemo" component={ParolDemo} durationInFrames={Math.round(DEMO_SECONDS * 30)} fps={30} width={1080} height={1920} />
      <Composition id="Title" component={TitleScene} durationInFrames={75} fps={30} width={1080} height={1920} />
      <Composition id="Gameplay" component={GameplayScene} durationInFrames={Math.round(GAMEPLAY_SECONDS * 30)} fps={30} width={1080} height={1920} />
      <Composition id="Finale" component={FinaleScene} durationInFrames={135} fps={30} width={1080} height={1920} />
      <Composition id="EndCard" component={EndCard} durationInFrames={75} fps={30} width={1080} height={1920} />
      <Folder name="Phone">
        <Still id="P01-Loading" component={P01Loading} width={390} height={844} />
        <Still id="P02-Ready" component={P02Ready} width={390} height={844} />
        <Still id="P03-How-to-play" component={P03HowToPlay} width={390} height={844} />
        <Still id="P04-Spinning" component={P04Spinning} width={390} height={844} />
        <Still id="P05-Perfect" component={P05Perfect} width={390} height={844} />
        <Still id="P06-Perfect-x5" component={P06PerfectFive} width={390} height={844} />
        <Still id="P07-Trim" component={P07Trim} width={390} height={844} />
        <Still id="P08-Danger" component={P08Danger} width={390} height={844} />
        <Still id="P09-Milestone" component={P09Milestone} width={390} height={844} />
        <Still id="P10-Paused" component={P10Paused} width={390} height={844} />
        <Still id="P11-Results" component={P11Results} width={390} height={844} />
        <Still id="P12-Board" component={P12Board} width={390} height={844} />
        <Still id="P13-Share" component={P13Share} width={390} height={844} />
        <Still id="P14-Settings" component={P14Settings} width={390} height={844} />
        <Still id="P15-Share-card" component={ShareCardFull} width={1080} height={1350} />
      </Folder>
      <Folder name="Desktop">
        <Still id="D01-Ready" component={D01Ready} width={1440} height={900} />
        <Still id="D02-Spinning" component={D02Spinning} width={1440} height={900} />
        <Still id="D03-Results" component={D03Results} width={1440} height={900} />
        <Still id="D04-Board" component={D04Board} width={1440} height={900} />
      </Folder>
    </>
  );
};
