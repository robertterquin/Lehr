import React from 'react';
import { PALETTE } from '../parol';
import { BulbString, Caroler, GiantLantern, GROUND, Kubo, MiniParol, Palm, Sky, Street, WARM, type Stage } from './street';

/**
 * Seven nights, one per weekday (Manila time), so everyone plays the same look on the same day.
 * A night changes the star's paper colours and the scene; the rules and the streak's scale never change.
 * Every scene keeps the milestone ladder: lights at 20, parols at 30, carolers at 40, far lights at 50,
 * giant lanterns at 70, fireworks at 80, dawn at 90.
 */

const INK = '#16112c';
const DARK = '#0d0a1c';
const UNLIT = '#221a3e';
const win = (lit: boolean) => (lit ? WARM : UNLIT);
/** Deterministic 0..1 noise, so window patterns are the same on every render. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type SceneProps = { stage: Stage; moon?: boolean };

/** Sky, the scene's ground layer (30 px low, under the in-run meter), and the milestone extras every night shares. */
const Frame: React.FC<SceneProps & { id: string; lanterns: [number, number][]; carolers: number[]; horizon: number; children: React.ReactNode; road?: string }> = ({
  stage, moon = true, id, lanterns, carolers, horizon, children, road = '#0b0916',
}) => (
  <svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0 }}>
    <Sky stage={stage} moon={moon} id={id} />
    <g transform="translate(0 30)">
      {stage >= 5 &&
        Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={8 + i * 24 + hash(i) * 10} y={horizon - 3 - hash(i + 40) * 6} width="2" height="2" fill={['#ffc96b', '#ffd27a', '#ff9d8a'][i % 3]} opacity="0.85" />
        ))}
      {stage >= 7 && lanterns.map(([x, y], i) => <GiantLantern key={i} x={x} y={y} r={18} colors={i % 2 ? ['#2e9a5a', '#c43a8a', '#f2b632', '#f4ecd8'] : ['#d8342c', '#f2b632', '#2f6fd0', '#f4ecd8']} />)}
      {children}
      <rect x="0" y={GROUND} width="390" height={844 - GROUND} fill={road} />
      {stage >= 4 && carolers.map((x, i) => <Caroler key={i} x={x} tall={25 + (i % 3) * 3} item={i % 2 ? 'tambourine' : 'parol'} facing={x > 195 ? -1 : 1} />)}
    </g>
  </svg>
);

/* ── Tuesday · San Fernando, Pampanga: the giant lantern capital ───────────────────────────── */

const Scaffold: React.FC<{ x: number; top: number }> = ({ x, top }) => (
  <g stroke="#2b2840" strokeWidth="1.6">
    <path d={`M${x - 22} ${GROUND}L${x - 6} ${top}M${x + 22} ${GROUND}L${x + 6} ${top}`} />
    {[0.25, 0.5, 0.75].map((t) => {
      const y = GROUND - (GROUND - top) * t;
      const half = 22 - 16 * t;
      return <path key={t} d={`M${x - half} ${y}H${x + half}M${x - half} ${y}L${x + half - 4} ${y - (GROUND - top) * 0.25}`} strokeWidth="0.9" />;
    })}
  </g>
);

/** Sorbetes: the painted dirty-ice-cream cart, three tubs under lids, bell and wheels. */
const Sorbetes: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x} y={GROUND - 34} width="44" height="22" rx="2" fill="#c8302a" />
    <rect x={x + 2} y={GROUND - 30} width="40" height="5" fill="#f2b632" />
    <rect x={x + 2} y={GROUND - 22} width="40" height="5" fill="#2f6fd0" />
    {[8, 22, 36].map((dx) => (
      <g key={dx}>
        <rect x={x + dx - 5} y={GROUND - 40} width="10" height="6" fill="#e8e0cc" />
        <ellipse cx={x + dx} cy={GROUND - 40} rx="5.5" ry="2" fill="#f4ecd8" />
      </g>
    ))}
    <path d={`M${x + 44} ${GROUND - 26}h10`} stroke="#3a3848" strokeWidth="2" />
    <circle cx={x + 10} cy={GROUND - 7} r="6.5" fill="#1a1626" stroke="#4a4858" strokeWidth="1.2" />
    <circle cx={x + 34} cy={GROUND - 7} r="6.5" fill="#1a1626" stroke="#4a4858" strokeWidth="1.2" />
  </g>
);

const Crowd: React.FC<{ from: number; to: number; seed: number; glow?: boolean }> = ({ from, to, seed, glow = false }) => (
  <g>
    {Array.from({ length: Math.floor((to - from) / 9) }, (_, i) => {
      const x = from + i * 9 + hash(seed + i) * 4;
      const tall = 20 + hash(seed + i + 9) * 9;
      return (
        <g key={i}>
          <circle cx={x} cy={GROUND - tall} r="3.4" fill={DARK} />
          <path d={`M${x - 5} ${GROUND}v${-tall + 9}q5 -5 10 0v${tall - 9}z`} fill={DARK} />
          {glow && i % 5 === 2 && <rect x={x + 2} y={GROUND - tall - 6} width="3" height="5" rx="0.6" fill="#bfe0ff" opacity="0.85" />}
        </g>
      );
    })}
  </g>
);

export const SanFernando: React.FC<SceneProps> = ({ stage, moon }) => {
  const lights = stage >= 2;
  return (
    <Frame stage={stage} moon={moon} id="sanfernando" lanterns={[]} carolers={[176, 236]} horizon={690}>
      {/* The Metropolitan Cathedral of San Fernando: its great dome over a plain facade */}
      <g fill="#1f1a40">
        <rect x="226" y="616" width="64" height="30" />
        <path d="M222 618A36 34 0 0 1 294 618Z" />
        <rect x="252" y="572" width="12" height="14" />
        <path d="M250 574A8 8 0 0 1 266 574Z" />
        <path d="M258 566V558M254 561H262" stroke={INK} strokeWidth="1.6" />
        <rect x="206" y="646" width="104" height="120" />
        <path d="M206 646L258 622L310 646Z" />
      </g>
      <path d="M223 618A35 33 0 0 1 293 618M252 574A6 6 0 0 1 264 574M206 646L258 622L310 646" stroke="#3a3260" strokeWidth="1.5" fill="none" />
      {[224, 246, 270, 292].map((x) => (
        <rect key={x} x={x - 3} y="676" width="6" height="12" rx="3" fill={win(lights)} opacity="0.85" />
      ))}
      <path d="M248 766V732A10 10 0 0 1 268 732V766" fill={win(lights)} opacity="0.85" />

      {/* Two giant lanterns on steel scaffolds: tonight they glow from the first ring */}
      <Scaffold x={66} top={712} />
      <Scaffold x={330} top={708} />
      <g opacity={lights ? 1 : 0.6}>
        <GiantLantern x={66} y={700} r={26} colors={['#c8202a', '#1e8a4c', '#2450b8', '#f2a20c', '#fff4dc']} />
        <GiantLantern x={330} y={696} r={28} colors={['#7a3ab8', '#f2a20c', '#c8202a', '#1e8a4c', '#fff4dc']} />
      </g>
      <BulbString from={[92, 712]} to={[302, 708]} sag={14} count={12} on={lights} />

      <Sorbetes x={132} />
      <Crowd from={0} to={120} seed={3} glow />
      <Crowd from={300} to={392} seed={17} glow />
      {stage >= 3 && <MiniParol x={206} y={656} r={6} color="#f2b632" lit />}
    </Frame>
  );
};

/* ── Wednesday · a Manila rooftop: water tank, laundry line, the skyline and the LRT ───────── */

export const Rooftop: React.FC<SceneProps> = ({ stage, moon }) => {
  const lights = stage >= 2;
  const towers = [[0, 44, 640], [40, 30, 676], [66, 38, 600], [100, 26, 690], [124, 46, 628], [168, 34, 660], [200, 28, 590], [226, 40, 646], [262, 30, 682], [290, 50, 610], [338, 28, 670], [364, 30, 636]];
  return (
    <Frame stage={stage} moon={moon} id="rooftop" lanterns={[[90, 660], [300, 662]]} carolers={[150, 196]} horizon={700}>
      {/* The skyline: windows only below the meter, a red beacon on the tallest towers */}
      {towers.map(([x, w, top], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={760 - top} fill={i % 2 ? '#141030' : '#18133a'} />
          {Array.from({ length: Math.floor((w - 4) / 7) * Math.floor((760 - Math.max(top, 640)) / 9) }, (_, k) => {
            const cols = Math.floor((w - 4) / 7);
            const wx = x + 4 + (k % cols) * 7;
            const wy = Math.max(top, 640) + 4 + Math.floor(k / cols) * 9;
            const on = hash(i * 97 + k) < (lights ? 0.55 : 0.3);
            return on ? <rect key={k} x={wx} y={wy} width="3" height="4" fill={hash(k + i) < 0.7 ? '#ffd9a0' : '#bfe0ff'} opacity="0.75" /> : null;
          })}
          {top < 620 && <circle cx={x + w / 2} cy={top - 4} r="1.8" fill="#ff4a3a" />}
          {top < 620 && <path d={`M${x + w / 2} ${top}V${top - 4}`} stroke="#141030" strokeWidth="1.2" />}
        </g>
      ))}

      {/* The LRT on its viaduct, a lit train crossing */}
      <rect x="0" y="736" width="390" height="7" fill="#262238" />
      {[30, 130, 230, 330].map((x) => <rect key={x} x={x} y="743" width="8" height="30" fill="#1e1a30" />)}
      <g>
        <rect x="150" y="718" width="150" height="18" rx="4" fill="#3c3a52" />
        {Array.from({ length: 13 }, (_, k) => <rect key={k} x={156 + k * 11} y="722" width="7" height="6" rx="1" fill="#fff1c8" opacity="0.9" />)}
        <rect x="150" y="731" width="150" height="2" fill="#6a5fd0" />
      </g>

      {/* The rooftop: parapet, stair hut, water tank on its stand, laundry line, monobloc chairs, a potted plant */}
      <rect x="0" y="770" width="390" height="42" fill="#2a2638" />
      <rect x="0" y="766" width="390" height="5" fill="#3a3648" />
      <rect x="18" y="716" width="54" height="54" fill="#24202f" />
      <rect x="14" y="712" width="62" height="5" fill="#33303f" />
      <rect x="34" y="730" width="18" height="40" fill={lights ? '#ffc96b' : '#3a2f4a'} opacity={lights ? 0.9 : 1} />
      <g>
        <path d="M300 770V734M340 770V734M296 734H344M300 750L340 742" stroke="#4a4858" strokeWidth="2" />
        <rect x="298" y="688" width="44" height="46" rx="6" fill="#2a5ab0" />
        <path d="M298 698h44M298 712h44M298 726h44" stroke="#3f6fc8" strokeWidth="1.5" />
        <ellipse cx="320" cy="688" rx="22" ry="4" fill="#3f6fc8" />
      </g>
      <path d="M76 722Q180 744 296 716" stroke="#8a8698" strokeWidth="0.8" fill="none" />
      {[[100, '#d8342c', 'shirt'], [128, '#f4ecd8', 'towel'], [154, '#2f6fd0', 'shorts'], [184, '#f2b632', 'shirt'], [214, '#c43a8a', 'towel'], [244, '#e8e0cc', 'shirt']].map(([x, color, kind]) => {
        const cx = Number(x);
        const cy = 722 + 22 * 4 * ((cx - 76) / 220) * (1 - (cx - 76) / 220) - 6 * ((cx - 76) / 220);
        return kind === 'shirt' ? (
          <path key={cx} d={`M${cx - 9} ${cy + 1}l-4 6l4 2v14h18v-14l4 -2l-4 -6z`} fill={String(color)} opacity="0.55" />
        ) : kind === 'towel' ? (
          <rect key={cx} x={cx - 8} y={cy} width="16" height="24" fill={String(color)} opacity="0.5" />
        ) : (
          <path key={cx} d={`M${cx - 8} ${cy}h16l1 15h-7l-1.5 -8l-1.5 8h-7z`} fill={String(color)} opacity="0.55" />
        );
      })}
      {[[110, 1], [154, -1]].map(([x, f]) => (
        <path key={x} d={`M${x} 798L${x + 2 * f} 784M${x + 13 * f} 798L${x + 12 * f} 784M${x + 1 * f} 784H${x + 14 * f}M${x + 2 * f} 784L${x - 1 * f} 767Q${x + 1 * f} 764 ${x + 4 * f} 766L${x + 5 * f} 784`} stroke="#e8e4f0" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.75" />
      ))}
      <path d="M262 798h18l-3 -14h-12z" fill="#8a4a2a" />
      {[-8, -3, 2, 7].map((dx) => <path key={dx} d={`M${271 + dx * 0.4} 784q${dx} -12 ${dx * 1.4} -22`} stroke="#2e6a3a" strokeWidth="3" fill="none" />)}
      <BulbString from={[0, 768]} to={[390, 768]} sag={10} count={16} on={lights} offset={2} />
      {stage >= 3 && <MiniParol x={204} y={712} r={7} color="#2f6fd0" lit string={6} />}
    </Frame>
  );
};

/* ── Thursday · Palayan: rice paddies under Mayon in the province ───────────────────────────── */

const Carabao: React.FC<{ x: number }> = ({ x }) => (
  <g fill={DARK}>
    <ellipse cx={x} cy={GROUND - 12} rx="22" ry="10" />
    <ellipse cx={x + 22} cy={GROUND - 14} rx="8" ry="6" />
    <path d={`M${x + 18} ${GROUND - 19}q-10 -10 -2 -14M${x + 26} ${GROUND - 19}q10 -10 2 -14`} stroke={DARK} strokeWidth="2.2" fill="none" />
    <path d={`M${x - 14} ${GROUND - 4}h30`} stroke={DARK} strokeWidth="4" />
  </g>
);

const Banana: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <path d={`M${x} ${GROUND}V${GROUND - 46}`} stroke="#141026" strokeWidth="5" />
    {[-60, -20, 15, 55, 140, 200].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return <path key={deg} d={`M${x} ${GROUND - 46}q${22 * Math.cos(a)} ${22 * Math.sin(a) - 12} ${40 * Math.cos(a)} ${40 * Math.sin(a) + 4}q${-14 * Math.cos(a)} ${-6} ${-40 * Math.cos(a)} ${-40 * Math.sin(a) - 4}`} fill="#141026" />;
    })}
  </g>
);

export const Palayan: React.FC<SceneProps> = ({ stage, moon }) => {
  const lights = stage >= 2;
  return (
    <Frame stage={stage} moon={moon} id="palayan" lanterns={[[200, 668], [310, 676]]} carolers={[176, 344]} horizon={718} road="#0a0b16">
      {/* Mayon: the near-perfect cone, a thin plume from the crater */}
      <path d="M40 724L218 600L232 600L400 716V724Z" fill="#17123a" />
      <path d="M218 600L232 600L250 616Q228 612 214 618Z" fill="#221b4a" />
      <path d="M226 598q-6 -14 6 -22q10 -8 4 -20" stroke="#4a4166" strokeWidth="5" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Paddies: water mirroring the sky between dikes, rows of young rice */}
      {[0, 1, 2, 3].map((row) => {
        const y = 728 + row * 21;
        return (
          <g key={row}>
            <rect x="0" y={y} width="390" height="17" fill={row % 2 ? '#1c1846' : '#201c52'} />
            <path d={`M0 ${y + 17}Q195 ${y + 14} 390 ${y + 17}V${y + 21}H0Z`} fill="#0f0c22" />
            {Array.from({ length: 34 }, (_, k) => (
              <path key={k} d={`M${6 + k * 11.5 + (row % 2) * 5} ${y + 13}l-1 -5M${6 + k * 11.5 + (row % 2) * 5} ${y + 13}l1.4 -4.5`} stroke="#2e5a3a" strokeWidth="0.9" />
            ))}
          </g>
        );
      })}
      {/* The moon's path on the paddies */}
      {[732, 750, 772, 794].map((y, i) => <rect key={y} x={344 - i * 2} y={y} width={12 + i * 4} height="1.4" fill="#f4ecd8" opacity={0.5 - i * 0.08} />)}
      <Palm x={300} lean={-8} height={150} />
      <Banana x={372} />
      <Kubo x={-6} lit={lights} parolLit={stage >= 3} lights={lights} />
      <Carabao x={176} />
      <path d="M124 776V700" stroke="#5b3a1c" strokeWidth="2.4" />
      <BulbString from={[124, 702]} to={[300, 724]} sag={10} count={9} on={lights} offset={1} />
      {/* Fireflies in the dark, more as the night goes on */}
      {Array.from({ length: 8 + stage * 2 }, (_, i) => (
        <circle key={i} cx={130 + hash(i) * 250} cy={650 + hash(i + 50) * 120} r="1.2" fill="#d8ff8a" opacity={0.5 + hash(i + 9) * 0.5} />
      ))}
    </Frame>
  );
};

/* ── Friday · Intramuros: the walled city, a garita, a gate, a kalesa and gas lamps ────────── */

const Farol: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 1.5} y={GROUND - 62} width="3" height="62" fill="#1e1a2c" />
    <path d={`M${x - 6} ${GROUND - 62}h12l-2 -14h-8z`} fill="#ffd9a0" />
    <path d={`M${x - 6} ${GROUND - 62}h12l-2 -14h-8z`} stroke="#1e1a2c" strokeWidth="1.2" fill="none" />
    <path d={`M${x - 9} ${GROUND - 54}h18`} stroke="#1e1a2c" strokeWidth="1.4" />
    <path d={`M${x - 7} ${GROUND - 76}h14l-7 -6z`} fill="#1e1a2c" />
    <circle cx={x} cy={GROUND - 68} r="14" fill="#ffb35a" opacity="0.22" />
  </g>
);

const Kalesa: React.FC<{ x: number }> = ({ x }) => (
  <g>
    {/* horse */}
    <path d={`M${x} ${GROUND - 26}q10 -4 26 0q6 -10 12 -16l4 2q-3 8 -6 16q-2 6 -8 6h-22z`} fill={DARK} />
    {[2, 8, 20, 26].map((dx) => <path key={dx} d={`M${x + dx} ${GROUND - 20}V${GROUND}`} stroke={DARK} strokeWidth="2" />)}
    <path d={`M${x} ${GROUND - 24}q-6 4 -6 12`} stroke={DARK} strokeWidth="1.6" fill="none" />
    {/* carriage: shafts, box, canopy, big wheel, lamp */}
    <path d={`M${x - 2} ${GROUND - 22}h-14`} stroke="#3a2a1c" strokeWidth="1.4" />
    <rect x={x - 46} y={GROUND - 34} width="30" height="16" rx="2" fill="#2a1e3a" />
    <path d={`M${x - 48} ${GROUND - 34}q16 -18 34 0`} fill="#1c1428" />
    <circle cx={x - 32} cy={GROUND - 11} r="11" fill="none" stroke="#3a3050" strokeWidth="1.6" />
    {Array.from({ length: 6 }, (_, k) => {
      const a = (k * 30 * Math.PI) / 180;
      return <path key={k} d={`M${x - 32 - 11 * Math.cos(a)} ${GROUND - 11 - 11 * Math.sin(a)}L${x - 32 + 11 * Math.cos(a)} ${GROUND - 11 + 11 * Math.sin(a)}`} stroke="#3a3050" strokeWidth="0.8" />;
    })}
    <rect x={x - 17} y={GROUND - 40} width="4" height="5" fill="#ffd9a0" />
    <circle cx={x - 15} cy={GROUND - 38} r="6" fill="#ffb35a" opacity="0.3" />
  </g>
);

export const Intramuros: React.FC<SceneProps> = ({ stage, moon }) => {
  const lights = stage >= 2;
  return (
    <Frame stage={stage} moon={moon} id="intramuros" lanterns={[[72, 664], [250, 660]]} carolers={[250, 300]} horizon={712} road="#100c18">
      {/* Manila Cathedral beyond the wall: dome and bell tower */}
      <g fill={INK}>
        <rect x="290" y="640" width="46" height="70" />
        <path d="M288 642A25 24 0 0 1 338 642Z" />
        <rect x="309" y="606" width="8" height="12" />
        <path d="M313 606V596M309 600H317" stroke={INK} strokeWidth="1.5" />
        <rect x="348" y="600" width="22" height="110" />
        <path d="M346 602L359 584L372 602Z" />
      </g>
      <rect x="355" y="652" width="8" height="12" rx="4" fill={win(stage >= 9 || lights)} opacity="0.8" />
      {/* The wall: adobe blocks, a garita (sentry box) on the bastion, and the arched gate */}
      <rect x="0" y="712" width="390" height="100" fill="#2a2234" />
      {Array.from({ length: 5 }, (_, row) => (
        <path key={row} d={`M0 ${730 + row * 18}H390`} stroke="#211a2a" strokeWidth="1" />
      ))}
      {Array.from({ length: 5 * 14 }, (_, k) => {
        const row = Math.floor(k / 14);
        const x = (k % 14) * 30 + (row % 2) * 15;
        return <path key={k} d={`M${x} ${712 + row * 18}v18`} stroke="#211a2a" strokeWidth="1" />;
      })}
      <rect x="0" y="706" width="390" height="7" fill="#352c40" />
      <g>
        <rect x="40" y="680" width="22" height="28" fill="#352c40" />
        <path d="M38 682A13 12 0 0 1 64 682Z" fill="#2a2234" />
        <rect x="48" y="690" width="6" height="10" rx="3" fill="#0d0a14" />
        <path d="M36 708L40 714H62L66 708Z" fill="#2a2234" />
      </g>
      <g>
        <rect x="130" y="690" width="90" height="122" fill="#352c40" />
        <path d="M126 692H224L175 668Z" fill="#2a2234" />
        <circle cx="175" cy="684" r="6" fill="#4a3c50" />
        <path d="M146 812V758A29 29 0 0 1 204 758V812Z" fill="#0a0812" />
        <path d="M150 812V760A25 25 0 0 1 200 760V812" fill={lights ? '#3a2a20' : '#120e1a'} />
        <path d="M175 742v8" stroke="#1e1a2c" strokeWidth="1" />
        <path d="M170 750h10l-1 8h-8z" fill="#ffd9a0" />
        <circle cx="175" cy="754" r="12" fill="#ffb35a" opacity="0.25" />
      </g>
      <BulbString from={[0, 708]} to={[130, 694]} sag={6} count={7} on={lights} />
      <BulbString from={[220, 694]} to={[390, 708]} sag={6} count={9} on={lights} offset={4} />
      {stage >= 3 && [70, 280, 340].map((x, i) => <MiniParol key={x} x={x} y={730} r={6} color={['#a61e2a', '#d4a030', '#1e6a70'][i]} lit string={14} />)}
      {/* Cobbles */}
      {Array.from({ length: 40 }, (_, k) => (
        <path key={k} d={`M${(k % 20) * 20 + (Math.floor(k / 20) % 2) * 10} ${GROUND + 10 + Math.floor(k / 20) * 12}q5 -4 10 0`} stroke="#241e30" strokeWidth="1" fill="none" transform="translate(0 -30)" />
      ))}
      <Kalesa x={70} />
      <Farol x={244} />
      <Farol x={372} />
    </Frame>
  );
};

/* ── Saturday · Dagat: a fishing village on stilts, bangkas on a moonlit sea ───────────────── */

const Bangka: React.FC<{ x: number; y: number; lamp?: boolean }> = ({ x, y, lamp = false }) => (
  <g>
    <path d={`M${x} ${y}q40 8 80 0l-8 8h-64z`} fill="#e8e0cc" />
    <path d={`M${x + 2} ${y + 2}q38 7 76 0`} stroke="#2f6fd0" strokeWidth="2" fill="none" />
    <path d={`M${x + 18} ${y - 2}q-6 -10 -28 -8M${x + 62} ${y - 2}q6 -10 28 -8`} stroke="#8a6a3a" strokeWidth="1.4" fill="none" />
    <path d={`M${x - 22} ${y - 9}h20M${x + 82} ${y - 9}h20`} stroke="#c8b890" strokeWidth="2.4" strokeLinecap="round" />
    {lamp && (
      <g>
        <path d={`M${x + 40} ${y}v-18`} stroke="#5b3a1c" strokeWidth="1.2" />
        <circle cx={x + 40} cy={y - 20} r="2.6" fill="#fff1c8" />
        <circle cx={x + 40} cy={y - 20} r="12" fill="#ffd27a" opacity="0.25" />
        <rect x={x + 37} y={y + 14} width="6" height="22" fill="#ffd27a" opacity="0.25" />
      </g>
    )}
  </g>
);

export const Dagat: React.FC<SceneProps> = ({ stage, moon }) => {
  const lights = stage >= 2;
  return (
    <Frame stage={stage} moon={moon} id="dagat" lanterns={[[170, 672], [262, 664]]} carolers={[18, 44]} horizon={722} road="#0c0c22">
      {/* Islands on the horizon and a lighthouse on the far point */}
      <path d="M150 724Q190 700 240 712Q270 704 300 724Z" fill="#141034" />
      <path d="M300 724Q340 690 390 700V724Z" fill="#141034" />
      <path d="M362 700l3 -26h6l3 26z" fill="#d8d0e0" />
      <path d="M362 690h12" stroke="#d8342c" strokeWidth="3" />
      <circle cx="368" cy="672" r="3" fill="#fff1c8" />
      <path d="M368 672L260 650L262 662Z" fill="#fff1c8" opacity="0.12" />
      {/* The sea, with the moon's path broken by ripples */}
      <rect x="0" y="724" width="390" height="120" fill="#141a44" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${hash(i) * 340} ${736 + i * 7}h${20 + hash(i + 7) * 30}`} stroke="#2a3470" strokeWidth="1" />
      ))}
      {[730, 744, 760, 778, 796].map((y, i) => <rect key={y} x={340 - i * 3} y={y} width={18 + i * 6} height="1.6" fill="#f4ecd8" opacity={0.55 - i * 0.08} />)}
      {/* Stilt houses over the water, joined by a bamboo walkway */}
      {[[0, 92], [86, 70]].map(([x, w], i) => (
        <g key={i}>
          {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M${x + 6 + k * (w - 12) / 4} 726V800`} stroke="#3a2a1c" strokeWidth="2" />)}
          <rect x={x} y="690" width={w} height="36" fill="#3a2c22" />
          <path d={`M${x - 8} 692L${x + w / 2} ${664 - i * 4}L${x + w + 8} 692Z`} fill="#4a3a26" />
          <path d={`M${x - 8} 692L${x + w / 2} ${664 - i * 4}L${x + w + 8} 692`} stroke="#2a1e14" strokeWidth="1" fill="none" />
          {Array.from({ length: Math.floor(w / 6) }, (_, k) => <path key={k} d={`M${x + 3 + k * 6} 692v34`} stroke="#2a2018" strokeWidth="0.8" />)}
          <rect x={x + w / 2 - 9} y="700" width="18" height="14" fill={win(lights)} opacity="0.85" />
          {stage >= 3 && <MiniParol x={x + w / 2} y={704} r={5.5} color={['#f2785a', '#2fa8b8'][i]} lit string={4} />}
        </g>
      ))}
      <path d="M156 724h60" stroke="#8a6a3a" strokeWidth="3" />
      <path d="M160 724v24M188 724v24M212 724v24" stroke="#3a2a1c" strokeWidth="1.5" />
      {/* Nets drying on poles */}
      <path d="M232 724V688M262 724V694" stroke="#5b3a1c" strokeWidth="1.6" />
      <path d="M232 690Q247 712 262 696" stroke="#8a8698" strokeWidth="0.7" fill="none" />
      {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${234 + k * 5} 694v${10 + (k % 3) * 3}`} stroke="#8a8698" strokeWidth="0.5" />)}
      <BulbString from={[92, 690]} to={[232, 690]} sag={8} count={8} on={lights} />
      <Bangka x={230} y={780} lamp />
      <Bangka x={110} y={804} />
    </Frame>
  );
};

/* ── Sunday · Simbahan: the church plaza after Simbang Gabi, bibingka and puto bumbong ─────── */

const Stall: React.FC<{ x: number; label: string; canopy: string; lit: boolean; children: React.ReactNode }> = ({ x, label, canopy, lit, children }) => (
  <g>
    <path d={`M${x} ${GROUND}V${GROUND - 56}M${x + 76} ${GROUND}V${GROUND - 56}`} stroke="#3a2a1c" strokeWidth="2" />
    <path d={`M${x - 6} ${GROUND - 54}L${x + 4} ${GROUND - 70}H${x + 72}L${x + 82} ${GROUND - 54}Z`} fill={canopy} />
    {Array.from({ length: 5 }, (_, k) => (
      <path key={k} d={`M${x - 6 + k * 18} ${GROUND - 54}q9 6 18 0`} fill={k % 2 ? canopy : '#f4ecd8'} />
    ))}
    <rect x={x + 6} y={GROUND - 84} width="64" height="13" rx="2" fill="#f4ecd8" />
    <text x={x + 38} y={GROUND - 74.6} fontSize="7" fontWeight="800" fill="#2a1e3a" textAnchor="middle" fontFamily="Manrope" letterSpacing="0.3">{label}</text>
    <rect x={x - 2} y={GROUND - 22} width="80" height="22" fill="#4a3420" />
    {lit && <rect x={x - 2} y={GROUND - 52} width="80" height="30" fill="#ffc96b" opacity="0.14" />}
    {children}
  </g>
);

export const Simbahan: React.FC<SceneProps> = ({ stage, moon }) => {
  const lights = stage >= 2;
  return (
    <Frame stage={stage} moon={moon} id="simbahan" lanterns={[[40, 664], [356, 660]]} carolers={[200, 228]} horizon={700} road="#0e0b18">
      {/* An earthquake-baroque church: buttresses, a scrolled pediment, a separate bell tower in tiers */}
      <g fill="#1e1834">
        <path d="M120 812V650H260V812Z" />
        <path d="M112 812L120 680V812ZM268 812L260 680V812Z" fill="#171230" />
        <path d="M132 650Q140 630 160 628Q170 600 190 596Q210 600 220 628Q240 630 248 650Z" />
        <path d="M190 596V584M185 589H195" stroke="#1e1834" strokeWidth="2" />
        <rect x="290" y="676" width="34" height="136" />
        <rect x="294" y="640" width="26" height="36" />
        <rect x="298" y="612" width="18" height="28" />
        <path d="M296 612L307 596L318 612Z" />
      </g>
      <circle cx="190" cy="668" r="9" fill={win(lights)} opacity="0.7" />
      <circle cx="190" cy="668" r="9" fill="none" stroke="#1e1834" strokeWidth="1.5" strokeDasharray="3 2" />
      {[150, 230].map((x) => <rect key={x} x={x - 4} y="690" width="8" height="16" rx="4" fill={win(lights)} opacity="0.8" />)}
      <rect x="303" y="650" width="8" height="14" rx="4" fill={win(lights)} opacity="0.7" />
      {/* The doors stand open: the dawn mass has just ended */}
      <path d="M174 812V738A16 16 0 0 1 206 738V812Z" fill="#ffc96b" opacity="0.9" />
      <path d="M150 812L174 812L206 812L230 812L206 760L174 760Z" fill="#ffc96b" opacity="0.08" />
      {/* Stalls: bibingka baked between coals, puto bumbong steamed in bamboo */}
      <Stall x={8} label="BIBINGKA" canopy="#d8342c" lit={lights}>
        {[22, 54].map((dx) => (
          <g key={dx}>
            <ellipse cx={8 + dx} cy={GROUND - 26} rx="11" ry="4" fill="#6a3a22" />
            <ellipse cx={8 + dx} cy={GROUND - 30} rx="10" ry="3" fill="#e8a83a" />
            <ellipse cx={8 + dx} cy={GROUND - 34} rx="9" ry="3" fill="#3a2418" />
            <ellipse cx={8 + dx} cy={GROUND - 35} rx="6" ry="1.6" fill="#ff7a3a" />
            <circle cx={8 + dx} cy={GROUND - 35} r="9" fill="#ff7a3a" opacity="0.25" />
          </g>
        ))}
      </Stall>
      <Stall x={306} label="PUTO BUMBONG" canopy="#7a3a9a" lit={lights}>
        <rect x={318} y={GROUND - 38} width="30" height="16" rx="3" fill="#9a9aa8" />
        {[322, 328, 334, 340].map((x) => <rect key={x} x={x} y={GROUND - 50} width="3.2" height="12" fill="#8a9a3a" />)}
        <path d="M352 778q12 -2 18 4" stroke="#3e8a3e" strokeWidth="5" fill="none" />
        {[354, 360, 366].map((x) => <rect key={x} x={x} y={GROUND - 32} width="4" height="10" rx="2" fill="#8a3aa8" />)}
        <path d="M326 772q-4 -8 2 -14q6 -6 0 -12" stroke="#c8c0d8" strokeWidth="1.4" fill="none" opacity="0.5" />
      </Stall>
      <BulbString from={[84, 742]} to={[120, 700]} sag={4} count={4} on={lights} />
      <BulbString from={[260, 700]} to={[306, 742]} sag={4} count={4} on={lights} offset={2} />
      {stage >= 3 && [140, 240].map((x, i) => <MiniParol key={x} x={x} y={712} r={7} color={['#e8a83a', '#7a3a9a'][i]} lit string={8} />)}
    </Frame>
  );
};

/* ── The week ──────────────────────────────────────────────────────────────────────────── */

export type NightId = 'barangay' | 'sanfernando' | 'rooftop' | 'palayan' | 'intramuros' | 'dagat' | 'simbahan';
export type Night = { id: NightId; day: string; araw: string; name: string; place: string; blurb: string; palette: string[]; Scene: React.FC<SceneProps> };

export const NIGHTS: Night[] = [
  { id: 'barangay', day: 'Monday', araw: 'Lunes', name: 'Barangay', place: 'A street like yours', blurb: 'Bahay kubo, sari-sari store, bahay na bato and the parish church', palette: PALETTE, Scene: ({ stage, moon }) => <Street stage={stage} moon={moon} /> },
  { id: 'sanfernando', day: 'Tuesday', araw: 'Martes', name: 'San Fernando', place: 'Pampanga', blurb: 'The giant lantern capital: lanterns on steel frames, a sorbetes cart, the cathedral dome', palette: ['#c8202a', '#f2a20c', '#1e8a4c', '#2450b8', '#fff4dc', '#7a3ab8'], Scene: SanFernando },
  { id: 'rooftop', day: 'Wednesday', araw: 'Miyerkules', name: 'Rooftop', place: 'Manila', blurb: 'A water tank, the laundry line, the skyline and the last LRT going home', palette: ['#f4ecd8', '#f06a4a', '#1f9c9a', '#f5c842', '#4a86e8', '#d0408c'], Scene: Rooftop },
  { id: 'palayan', day: 'Thursday', araw: 'Huwebes', name: 'Palayan', place: 'Albay', blurb: 'Rice paddies under Mayon, a kubo, a sleeping carabao and fireflies', palette: ['#f4ecd8', '#d9b55a', '#4e9a2e', '#b8442a', '#e8d29a', '#8a5a2c'], Scene: Palayan },
  { id: 'intramuros', day: 'Friday', araw: 'Biyernes', name: 'Intramuros', place: 'Manila', blurb: 'The old walls, a garita, the gate, a kalesa and gas lamps on cobbles', palette: ['#f6ebd0', '#a61e2a', '#d4a030', '#1e6a70', '#2a3e8a', '#c8607a'], Scene: Intramuros },
  { id: 'dagat', day: 'Saturday', araw: 'Sabado', name: 'Dagat', place: 'A fishing village', blurb: 'Houses on stilts, bangkas with lamps, a lighthouse and the moon on the sea', palette: ['#f4ecd8', '#2fa8b8', '#f2785a', '#e8c060', '#24509a', '#4eb888'], Scene: Dagat },
  { id: 'simbahan', day: 'Sunday', araw: 'Linggo', name: 'Simbahan', place: 'After Simbang Gabi', blurb: 'The church doors open after dawn mass, bibingka and puto bumbong stalls', palette: ['#f4ecd8', '#7a3a9a', '#e8a83a', '#3e8a3e', '#d8342c', '#b88ad8'], Scene: Simbahan },
];

export const night = (id: NightId) => NIGHTS.find((n) => n.id === id) ?? NIGHTS[0];
