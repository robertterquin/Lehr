import React from 'react';
import { Composition, Folder, Still } from 'remotion';
import { GAMEPLAY_SECONDS } from './parol';
import { DEMO_SECONDS, ParolDemo } from './ParolDemo';
import { EndCard, FinaleScene, GameplayScene, TitleScene } from './scenes';
import { D01Ready, D02Spinning, D03Results, D04Board } from './mockups/desktop';
import {
  P01Loading, P02Ready, P03HowToPlay, P04Spinning, P05Perfect, P06PerfectFive, P07Trim, P08Danger, P09Milestone, P10Paused, P11Results, P12Board, P13Share, P14Settings, P16Festival, P17StarRises, ShareCard,
} from './mockups/phone';
import { A01AppMap, B01Logo, B02AppIcon, B03LinkPreview, P19Lights, P20Carolers, P21Barangay, P22Rotor, P23Fireworks, P24Dawn, P25Constellation, P26JourneyMap } from './mockups/more';

const ShareCardFull: React.FC = () => <ShareCard width={1080} />;
const GoldShareCardFull: React.FC = () => <ShareCard width={1080} gold />;

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
        <Still id="P16-Milestone-70" component={P16Festival} width={390} height={844} />
        <Still id="P17-Star-rises-100" component={P17StarRises} width={390} height={844} />
        <Still id="P18-Gold-share-card" component={GoldShareCardFull} width={1080} height={1350} />
        <Still id="P19-Milestone-20" component={P19Lights} width={390} height={844} />
        <Still id="P20-Milestone-40" component={P20Carolers} width={390} height={844} />
        <Still id="P21-Milestone-50" component={P21Barangay} width={390} height={844} />
        <Still id="P22-Milestone-60" component={P22Rotor} width={390} height={844} />
        <Still id="P23-Milestone-80" component={P23Fireworks} width={390} height={844} />
        <Still id="P24-Milestone-90" component={P24Dawn} width={390} height={844} />
        <Still id="P25-Past-100" component={P25Constellation} width={390} height={844} />
        <Still id="P26-Journey-map" component={P26JourneyMap} width={390} height={844} />
      </Folder>
      <Folder name="Brand">
        <Still id="B01-Logo" component={B01Logo} width={1600} height={800} />
        <Still id="B02-App-icon" component={B02AppIcon} width={1024} height={1024} />
        <Still id="B03-Link-preview" component={B03LinkPreview} width={1200} height={630} />
        <Still id="A01-App-map" component={A01AppMap} width={2640} height={2120} />
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
