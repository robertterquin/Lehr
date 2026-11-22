// Renders every Parol mockup to a static Design-canvas artboard (.dc.html), so the canvas matches the
// repo's renders exactly. Run: node canvas/build.mjs  → canvas/out/project/*.dc.html + canvas.json
import React from 'react';
// @ts-expect-error @types/react-dom is not installed; esbuild bundles it fine
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Parol } from '../src/ParolStar';
import { C, SANS, Label } from '../src/mockups/kit';
import * as phone from '../src/mockups/phone';
import * as more from '../src/mockups/more';
import * as states from '../src/mockups/states';
import * as desktop from '../src/mockups/desktop';
import { DS02SoundDesign, MS01MotionStoryboard } from '../src/mockups/motion';
import { NIGHT_SCREENS, W01Week } from '../src/mockups/week';

// Resolved from the bundle in canvas/out/, so files land in canvas/out/project/.
const OUT = new URL('./project/', import.meta.url);
type Board = { file: string; title: string; page: string; w: number; h: number; El: React.FC };

const STAR_COUNTS = [7, 12, 34, 70, 100];
/** The star at five ring counts: halos at 10/50/80, longer tails, rotor from 60. */
const StarSheet: React.FC = () => (
  <div style={{ width: 1400, height: 560, background: C.night, color: C.ink, fontFamily: SANS, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 24, padding: '40px 40px 48px', boxSizing: 'border-box' }}>
    {STAR_COUNTS.map((n) => (
      <div key={n} style={{ width: 248, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Parol size={248} locks={phone.expertRun(n)} />
        <Label color={C.gold}>{`${n} rings`}</Label>
      </div>
    ))}
  </div>
);
const ShareSmall: React.FC = () => <phone.ShareCard width={432} />;
const GoldShareSmall: React.FC = () => <phone.ShareCard width={432} gold />;

const P = (file: string, title: string, page: string, El: React.FC): Board => ({ file, title, page, w: 390, h: 844, El });
const BOARDS: Board[] = [
  P('P01-Loading.dc.html', 'Loading', 'start', phone.P01Loading),
  P('ParolReady.dc.html', 'Ready', 'start', phone.P02Ready),
  P('P03-How-to-play.dc.html', 'How to play', 'start', phone.P03HowToPlay),
  P('P26-Journey-map.dc.html', "Tonight's journey", 'start', more.P26JourneyMap),
  P('P14-Settings.dc.html', 'Settings', 'start', phone.P14Settings),
  P('Main.dc.html', 'Spinning ring', 'play', phone.P04Spinning),
  P('P05-Perfect.dc.html', 'Perfect', 'play', phone.P05Perfect),
  P('ParolPerfect.dc.html', 'Perfect ×5', 'play', phone.P06PerfectFive),
  P('ParolTrim.dc.html', 'Off-angle lock trims', 'play', phone.P07Trim),
  P('P08-Danger.dc.html', 'Danger', 'play', phone.P08Danger),
  P('P10-Paused.dc.html', 'Paused', 'play', phone.P10Paused),
  P('P19-Milestone-20.dc.html', '20 · Street lights', 'journey', more.P19Lights),
  P('P09-Milestone-30.dc.html', '30 · Neighbours’ parols', 'journey', phone.P09Milestone),
  P('P20-Milestone-40.dc.html', '40 · Carolers', 'journey', more.P20Carolers),
  P('P21-Milestone-50.dc.html', '50 · The barangay', 'journey', more.P21Barangay),
  P('P22-Milestone-60.dc.html', '60 · Rotor mode', 'journey', more.P22Rotor),
  P('P16-Milestone-70.dc.html', '70 · Lantern festival', 'journey', phone.P16Festival),
  P('P23-Milestone-80.dc.html', '80 · Fireworks', 'journey', more.P23Fireworks),
  P('P24-Milestone-90.dc.html', '90 · Simbang Gabi dawn', 'journey', more.P24Dawn),
  P('P17-Star-rises-100.dc.html', '100 · The star rises', 'journey', phone.P17StarRises),
  P('P25-Past-100.dc.html', 'Past 100 · Constellation', 'journey', more.P25Constellation),
  P('ParolOver.dc.html', 'Run ended', 'after', phone.P11Results),
  P('P13-Share.dc.html', 'Share', 'after', phone.P13Share),
  P('P12-Board.dc.html', "Today's board", 'after', phone.P12Board),
  { file: 'ParolShare.dc.html', title: 'Share card (1080×1350 at 40%)', page: 'after', w: 432, h: 540, El: ShareSmall },
  { file: 'P18-Gold-share-card.dc.html', title: 'Gold share card, 100+ (at 40%)', page: 'after', w: 432, h: 540, El: GoldShareSmall },
  { file: 'W01-Seven-nights.dc.html', title: 'Seven nights', page: 'nights', w: 1900, h: 1000, El: W01Week },
  ...NIGHT_SCREENS.map(({ night, Screen }, i) => P(`N0${i + 1}-${night.name.replace(/ /g, '-')}.dc.html`, `${night.araw} · ${night.name}`, 'nights', Screen)),
  P('S01-First-visit.dc.html', 'First visit', 'edge', states.S01FirstTime),
  P('S02-Offline.dc.html', 'Offline', 'edge', states.S02Offline),
  P('S03-Name-not-allowed.dc.html', 'Name not allowed', 'edge', states.S03NameError),
  P('S04-New-day.dc.html', 'New day', 'edge', states.S04NewDay),
  P('S05-Empty-board.dc.html', 'Empty board', 'edge', states.S05EmptyBoard),
  P('S06-Reduced-motion.dc.html', 'Reduced motion', 'edge', states.S06ReducedMotion),
  { file: 'D01-Ready.dc.html', title: 'Desktop · Ready', page: 'desktop', w: 1440, h: 900, El: desktop.D01Ready },
  { file: 'ParolDesk.dc.html', title: 'Desktop · Spinning ring', page: 'desktop', w: 1440, h: 900, El: desktop.D02Spinning },
  { file: 'D03-Results.dc.html', title: 'Desktop · Run ended', page: 'desktop', w: 1440, h: 900, El: desktop.D03Results },
  { file: 'D04-Board.dc.html', title: 'Desktop · Board', page: 'desktop', w: 1440, h: 900, El: desktop.D04Board },
  { file: 'ParolStar.dc.html', title: 'The star at 7, 12, 34, 70 and 100 rings', page: 'system', w: 1400, h: 560, El: StarSheet },
  { file: 'DS01-Design-system.dc.html', title: 'Design system', page: 'system', w: 1800, h: 2260, El: states.DS01DesignSystem },
  { file: 'MS01-Motion-storyboard.dc.html', title: 'Motion storyboard', page: 'system', w: 1900, h: 2080, El: MS01MotionStoryboard },
  { file: 'DS02-Sound-design.dc.html', title: 'Sound design', page: 'system', w: 1900, h: 1440, El: DS02SoundDesign },
  { file: 'B01-Logo.dc.html', title: 'Logo', page: 'system', w: 1600, h: 800, El: more.B01Logo },
  { file: 'B02-App-icon.dc.html', title: 'App icon', page: 'system', w: 1024, h: 1024, El: more.B02AppIcon },
  { file: 'B03-Link-preview.dc.html', title: 'Link preview', page: 'system', w: 1200, h: 630, El: more.B03LinkPreview },
];

const PAGES = [
  ['start', 'Start'], ['play', 'Play'], ['journey', 'Journey to 100'], ['after', 'After the run'],
  ['nights', 'Seven nights'], ['edge', 'Edge cases'], ['desktop', 'Desktop'], ['system', 'Star, system and brand'],
];

const FONTS = 'https://fonts.googleapis.com/css2?family=Young+Serif&amp;family=Manrope:wght@400;500;600;700;800&amp;display=swap';
const page = (b: Board) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Parol, ${b.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="${FONTS}">
<style>
body{margin:0}
</style>
</helmet>
${renderToStaticMarkup(<b.El />)}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${b.w},"height":${b.h}}}'>
class Component extends DCLogic {
  renderVals() {
    return {};
  }
}
</script>
</body>
</html>
`;

mkdirSync(OUT, { recursive: true });
const sizes: [string, number][] = [];
for (const b of BOARDS) {
  const html = page(b);
  if (html.includes('{{')) throw new Error(`${b.file} contains {{, which the canvas reads as a hole`);
  writeFileSync(new URL(b.file, OUT), html);
  sizes.push([b.file, html.length]);
}

// Lay each page out in rows (80 px apart, 120 px between rows); phones and big sheets never share a row.
const PER_ROW: Record<string, [number, number]> = { start: [5, 2], play: [6, 2], journey: [5, 2], after: [5, 2], nights: [7, 1], edge: [6, 2], desktop: [2, 2], system: [2, 2] };
const boards: Record<string, object> = {};
const notes: Record<string, object> = {};
for (const [id, name] of PAGES) {
  const list = BOARDS.filter((b) => b.page === id);
  let x = 0;
  let y = 0;
  let rowH = 0;
  let inRow = 0;
  let maxW = 0;
  list.forEach((b, i) => {
    const big = b.w > 432;
    const limit = PER_ROW[id][big ? 1 : 0];
    if (i > 0 && (inRow >= limit || big !== list[i - 1].w > 432)) {
      x = 0;
      y += rowH + 120;
      rowH = 0;
      inRow = 0;
    }
    boards[b.file] = { x, y, w: b.w, h: b.h, title: b.title, page: id };
    x += b.w + 80;
    inRow += 1;
    rowH = Math.max(rowH, b.h);
    maxW = Math.max(maxW, x - 80);
  });
  notes[`title-${id}`] = { x: 0, y: -300, text: `Parol · ${name.toLowerCase()}`, kind: 'title1', maxW, page: id };
}
const canvas = {
  v: 3,
  createdOnFiles: { v: 1, at: '2026-11-22T09:00:00Z' },
  title: 'Parol Mockups',
  launch: { view: 'canvas', page: 'play' },
  pages: PAGES.map(([id, name]) => ({ id, name })),
  boards,
  order: BOARDS.map((b) => b.file),
  notes,
  designSystems: [],
};
writeFileSync(new URL('canvas.json', OUT), JSON.stringify(canvas));
console.log(sizes.map(([f, n]) => `${f} ${(n / 1024).toFixed(0)}K`).join('\n'));
console.log('total', (sizes.reduce((a, [, n]) => a + n, 0) / 1048576).toFixed(1), 'MB in', sizes.length, 'artboards');
