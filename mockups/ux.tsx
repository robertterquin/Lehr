// Three UX directions on the lantern-glow look (development only). The board shows them side by side;
// ?s=<id> shows one screen at 390×844.
//   U1 Clear lantern: the same screens, said plainly. Next reward under the count, labelled gauge, why a
//      run ended and how close the next milestone was, a first run that teaches by doing.
//   U2 Garland: the night's ten milestones hang across the top as ten parols; each lights up for real.
//   U3 Close-up: nothing but the star. The count is a giant numeral behind it; the streak sits in the gauge.
import { StrictMode, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { MiniParol } from '../src/draw/street.tsx'
import { ArcGauge, Button, Count, Eyebrow, GEAR, Icon, PAUSE, PREVIEW, RUN, SOUND, StarAt, Streak, Text, TopBar, Words, coral, cream, gold, night, serif, Ground } from './kit.tsx'

const W = 390
const H = 844
const dusk = '#a8988a'
const FIRST = [0]

const at = (size: number, deg: number, out = 0): [number, number] => {
  const r = size / 2 - 2 + out
  const a = ((deg - 240) * Math.PI) / 180
  return [size / 2 + r * Math.cos(a), size / 2 + r * Math.sin(a)]
}

const Brand = () => <span style={{ fontFamily: serif, fontSize: 24 }}>Parol</span>
const Icons = () => (
  <div style={{ display: 'flex' }}>
    <Icon path={SOUND} />
    <Icon path={GEAR} />
  </div>
)
const Num = ({ children, size = 17 }: { children: ReactNode; size?: number }) => <span style={{ fontFamily: serif, fontSize: size, color: '#fff' }}>{children}</span>
const Abs = ({ style, children }: { style: CSSProperties; children: ReactNode }) => <div style={{ position: 'absolute', ...style }}>{children}</div>

/* ── U1 · Clear lantern ──────────────────────────────────────────────────────────────────────────── */

/** The next milestone, under the count: how many rings to go, and a thin bar for the ten. */
const NextGoal = ({ toGo, what, done }: { toGo: number; what: string; done: number }) => (
  <div style={{ marginTop: 12, width: 230 }}>
    <Text style={{ fontSize: 12, lineHeight: 1.35, color: cream }}>
      <span style={{ color: gold, fontWeight: 700 }}>{toGo} to go</span> · {what}
    </Text>
    <div style={{ marginTop: 6, height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.14)' }}>
      <div style={{ width: `${done * 10}%`, height: 2, borderRadius: 1, background: gold }} />
    </div>
  </div>
)

/** The gauge with plain labels: the points' width at the tip of the arc, the 8° limit at its notch. */
function LabelledGauge({ size, top, width }: { size: number; top: number; width: number }) {
  const [tx, ty] = at(size, (width / 36) * 300, 16)
  const [nx, ny] = at(size, (8 / 36) * 300, 16)
  const left = (W - size) / 2
  return (
    <>
      <ArcGauge x={W / 2} size={size} top={top} width={width} color={gold} />
      <Abs style={{ left: left + tx, top: top + ty, translate: '-50% -50%', font: '700 12px var(--font-ui)', color: gold }}>{width}°</Abs>
      <Abs style={{ left: left + nx, top: top + ny, translate: '-50% -50%', font: '700 10px var(--font-ui)', color: coral }}>8°</Abs>
    </>
  )
}

function U1Landing() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <StarAt x={W / 2} size={300} top={86} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 40, gap: 10 }}>
        <Eyebrow>{night.araw} · tonight’s star</Eyebrow>
        <Text style={{ font: `400 60px/0.95 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 14, lineHeight: 1.5, color: cream, maxWidth: 300 }}>Everyone in the Philippines lights this same star tonight.</Text>
        <Button>
          Light the first ring <span aria-hidden="true">→</span>
        </Button>
        <Text style={{ fontSize: 13, color: cream }}>
          Best today <Num>52</Num> <span style={{ color: dusk, margin: '0 6px' }}>·</span> <Num>3</Num> nights in a row
        </Text>
      </Words>
    </>
  )
}

/** First run: no rules sheet. The first ring spins slowly and the screen says only what to do now. */
function U1First() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Count n={0} lit={0} />} right={<Icon path={PAUSE} ring />} />
      <StarAt x={W / 2} size={300} top={170} locks={FIRST} spinning glow="rgba(255,170,80,0.45)" deg={30} />
      <Words style={{ bottom: 150, gap: 6 }}>
        <Eyebrow>1 of 3</Eyebrow>
        <Text style={{ font: `400 30px/1.15 ${serif}` }}>Tap when the points line up</Text>
        <Text style={{ fontSize: 14, color: cream }}>Then the next ring spins in</Text>
      </Words>
    </>
  )
}

function U1Play() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={3} />
      <TopBar
        left={
          <div>
            <Count n={24} lit={3} />
            <NextGoal toGo={6} what="the neighbours’ parols" done={4} />
          </div>
        }
        right={<Icon path={PAUSE} ring />}
      />
      <StarAt x={W / 2} size={270} top={205} locks={RUN} spinning glow="rgba(255,170,80,0.45)" />
      <LabelledGauge size={320} top={180} width={26} />
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 575, textAlign: 'center', font: `italic 400 34px ${serif}`, color: gold, textShadow: '0 0 24px rgba(255,190,90,0.7)' }}>Perfect</Text>
    </>
  )
}

function U1End() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={2} dim={0.35} />
      <StarAt x={W / 2} size={220} top={90} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
      <Words style={{ bottom: 40 }}>
        <Eyebrow>The star rests</Eyebrow>
        <Text style={{ font: `400 120px/0.9 ${serif}`, marginBottom: 6 }}>24</Text>
        <Text style={{ fontSize: 15, color: cream }}>rings · 19 perfect</Text>
        <Text style={{ fontSize: 13, color: dusk }}>The points wore down below 8°</Text>
        <Text style={{ marginTop: 10, font: `400 20px/1.25 ${serif}`, color: gold, maxWidth: 300 }}>6 more and the neighbours light their parols</Text>
        <Button style={{ marginTop: 14 }}>Light again</Button>
        <Text style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: gold }}>Share tonight’s star</Text>
      </Words>
    </>
  )
}

/* ── U2 · Garland ────────────────────────────────────────────────────────────────────────────────── */

/** Tonight's ten milestones as ten parols on a string across the top. The next one waits, outlined. */
function Garland({ lit, toGo, top = 0 }: { lit: number; toGo?: number; top?: number }) {
  const x0 = -6
  const x1 = W + 6
  const sag = 30
  const point = (t: number): [number, number] => [x0 + (x1 - x0) * t, 22 + sag * 4 * t * (1 - t)]
  return (
    <svg width={W} height={124} style={{ position: 'absolute', left: 0, top }} aria-hidden="true">
      <path d={`M${x0} 22Q${(x0 + x1) / 2} ${22 + sag * 2} ${x1} 22`} stroke="#5c5470" strokeWidth="1" fill="none" />
      {Array.from({ length: 10 }, (_, i) => {
        const [x, y] = point((i + 0.5) / 10)
        const next = i === lit
        return (
          <g key={i}>
            <MiniParol x={x} y={y + 22} r={11} color={night.palette[(i % (night.palette.length - 1)) + 1]} lit={i < lit} string={10} />
            {next && <circle cx={x} cy={y + 22} r={17} fill="none" stroke={gold} strokeWidth="1.2" strokeDasharray="2 3" />}
            {next && toGo !== undefined && (
              <text x={x} y={y + 66} textAnchor="middle" fill={gold} style={{ font: '700 12px var(--font-ui)' }}>
                {toGo}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function U2Landing() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <Garland lit={5} top={60} />
      <StarAt x={W / 2} size={250} top={196} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 44, gap: 10 }}>
        <Eyebrow>{night.araw} · tonight</Eyebrow>
        <Text style={{ font: `400 60px/0.95 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 14, lineHeight: 1.5, color: cream }}>
          Light all ten parols on the street. Today you’ve lit <Num size={16}>5</Num>.
        </Text>
        <Button>
          Light the first ring <span aria-hidden="true">→</span>
        </Button>
      </Words>
    </>
  )
}

function U2Play() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={2} />
      <TopBar left={<Count n={24} lit={3} />} right={<Icon path={PAUSE} ring />} />
      <Garland lit={2} toGo={6} top={104} />
      <StarAt x={W / 2} size={260} top={290} locks={RUN} spinning glow="rgba(255,170,80,0.45)" />
      <ArcGauge x={W / 2} size={322} top={259} width={26} color={gold} />
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', font: `italic 400 34px ${serif}`, color: gold, textShadow: '0 0 24px rgba(255,190,90,0.7)' }}>Perfect</Text>
    </>
  )
}

function U2End() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={2} dim={0.35} />
      <Garland lit={2} toGo={6} top={20} />
      <StarAt x={W / 2} size={210} top={170} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
      <Words style={{ bottom: 48 }}>
        <Eyebrow>The star rests</Eyebrow>
        <Text style={{ font: `400 120px/0.9 ${serif}`, marginBottom: 6 }}>24</Text>
        <Text style={{ fontSize: 15, color: cream }}>
          rings · <span style={{ color: gold }}>2 of 10 parols lit</span>
        </Text>
        <Text style={{ fontSize: 14, color: cream }}>6 rings short of the third</Text>
        <Button style={{ marginTop: 14 }}>Light again</Button>
      </Words>
    </>
  )
}

/* ── U3 · Close-up ───────────────────────────────────────────────────────────────────────────────── */

/** The count as a giant numeral behind the star: always readable, never in the way. */
const Giant = ({ n, top, opacity = 0.16 }: { n: number; top: number; opacity?: number }) => (
  <Text style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', font: `400 260px/1 ${serif}`, color: '#fff3dc', opacity }}>{n}</Text>
)

/** The streak in the gauge's open bottom, between the arc's two ends. */
function GaugeStreak({ size, top, lit }: { size: number; top: number; lit: number }) {
  const [x, y] = at(size, 330)
  return (
    <Abs style={{ left: (W - size) / 2 + x, top: top + y - 4, translate: '-50% 0' }}>
      <Streak lit={lit} />
    </Abs>
  )
}

function U3Landing() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <StarAt x={W / 2} size={320} top={110} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 44, gap: 10 }}>
        <Text style={{ font: `400 44px/1 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 13, color: cream }}>
          {night.araw} · best today <Num>52</Num>
        </Text>
        <Button>Light</Button>
      </Words>
    </>
  )
}

function U3Play() {
  const size = 380
  const top = 190
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={3} />
      <Abs style={{ top: 14, right: 14 }}>
        <Icon path={PAUSE} ring />
      </Abs>
      <Giant n={24} top={40} />
      <StarAt x={W / 2} size={312} top={top + 34} locks={RUN} spinning glow="rgba(255,170,80,0.5)" />
      <ArcGauge x={W / 2} size={size} top={top} width={26} color={gold} />
      <GaugeStreak size={size} top={top} lit={3} />
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', font: `italic 400 34px ${serif}`, color: gold, textShadow: '0 0 24px rgba(255,190,90,0.7)' }}>Perfect</Text>
    </>
  )
}

function U3End() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={2} dim={0.35} />
      <Giant n={24} top={60} opacity={0.95} />
      <StarAt x={W / 2} size={230} top={300} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
      <Words style={{ bottom: 48 }}>
        <Text style={{ fontSize: 15, color: cream }}>rings tonight · 19 perfect</Text>
        <Text style={{ font: `400 20px/1.25 ${serif}`, color: gold, maxWidth: 300 }}>6 more and the neighbours light their parols</Text>
        <Button style={{ marginTop: 14 }}>Light again</Button>
      </Words>
    </>
  )
}

/* ── Board ───────────────────────────────────────────────────────────────────────────────────────── */

const ROWS: { id: string; title: string; note: string; screens: { id: string; label: string; View: () => ReactNode }[] }[] = [
  {
    id: 'u1',
    title: 'U1 · Clear lantern',
    note: 'Same screens, said plainly: next reward under the count, a labelled gauge, why it ended and how close you were, a first run that teaches by doing.',
    screens: [
      { id: 'u1-landing', label: 'Landing', View: U1Landing },
      { id: 'u1-first', label: 'First run', View: U1First },
      { id: 'u1-play', label: 'Play', View: U1Play },
      { id: 'u1-end', label: 'End', View: U1End },
    ],
  },
  {
    id: 'u2',
    title: 'U2 · Garland',
    note: 'Tonight’s ten milestones hang across the top as ten parols. Each one lights for real; the next waits, outlined, with the rings to go.',
    screens: [
      { id: 'u2-landing', label: 'Landing', View: U2Landing },
      { id: 'u2-play', label: 'Play', View: U2Play },
      { id: 'u2-end', label: 'End', View: U2End },
    ],
  },
  {
    id: 'u3',
    title: 'U3 · Close-up',
    note: 'Nothing but the star. The count is a giant numeral behind it, the streak sits in the gauge’s gap, the end is the number.',
    screens: [
      { id: 'u3-landing', label: 'Landing', View: U3Landing },
      { id: 'u3-play', label: 'Play', View: U3Play },
      { id: 'u3-end', label: 'End', View: U3End },
    ],
  },
]

const Phone = ({ View }: { View: () => ReactNode }) => (
  <main style={{ position: 'relative', width: W, height: H, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
    <View />
  </main>
)

const params = new URLSearchParams(location.search)
const only = ROWS.flatMap((row) => row.screens).find((s) => s.id === params.get('s'))
const scale = Number(params.get('scale') ?? 0.4)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {only ? (
      <Phone View={only.View} />
    ) : (
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 22, fontFamily: 'var(--font-ui)', color: '#cbbfae' }}>
        {ROWS.map((row) => (
          <section key={row.id} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <div style={{ width: 170, flex: 'none' }}>
              <p style={{ margin: 0, font: `400 20px ${serif}`, color: '#fff' }}>{row.title}</p>
              <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.5 }}>{row.note}</p>
            </div>
            {row.screens.map((s) => (
              <figure key={s.id} style={{ margin: 0 }}>
                <div style={{ width: W * scale, height: H * scale, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                    <Phone View={s.View} />
                  </div>
                </div>
                <figcaption style={{ fontSize: 12, marginTop: 6 }}>{s.label}</figcaption>
              </figure>
            ))}
          </section>
        ))}
      </div>
    )}
  </StrictMode>,
)
