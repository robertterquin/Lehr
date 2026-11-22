// Every screen of the game in the lantern-glow direction (R1), development only.
// ?s=board shows the phone screens side by side; ?s=<id> one screen at 390×844; &w=1 the desktop version at 1440×900.
import { StrictMode, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import '../src/index.css'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Panorama } from '../src/draw/panorama.tsx'
import { Star } from '../src/draw/star.tsx'
import type { Stage } from '../src/draw/street.tsx'

const night = NIGHTS[6]
const RUN = Array.from({ length: 24 }, (_, i) => (i % 7 === 3 ? 4 : i === 20 ? -6 : 0))
const DANGER = Array.from({ length: 31 }, (_, i) => (i % 4 === 1 ? 5 : i % 9 === 2 ? -4 : 0))
const PREVIEW = Array.from({ length: 12 }, () => 0)
const serif = 'var(--font-display)'
const gold = '#ffcf7a'
const cream = '#e8d9c8'
const coral = '#ff8a7a'

type Frame = { w: number; h: number; wide: boolean }

/** Turns the spinning ring a little past alignment, as a still. */
const turn = (deg: number) => (el: SVGSVGElement | null) => el?.style.setProperty('transform', `rotate(${deg}deg)`)

const Text = ({ style, children }: { style?: CSSProperties; children: ReactNode }) => <p style={{ margin: 0, ...style }}>{children}</p>

/* ── Shared pieces ───────────────────────────────────────────────────────────────────────────────── */

function Ground({ w, h, wide, stage = 2, dim = 0 }: Frame & { stage?: Stage; dim?: number }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0f26 0%, #121a3d 42%, #2b1a3a 72%, #5a2f22 100%)' }} />
      <div style={{ position: 'absolute', left: -100, right: -100, bottom: -60, height: h * 0.45, background: 'radial-gradient(closest-side, rgba(255,150,70,0.45), transparent)' }} />
      {wide ? <Panorama night={night} stage={stage} width={w} height={h} /> : <night.Scene stage={stage} moon={false} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 70%, rgba(40,15,10,0.35))' }} />
      {dim > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(10,6,20,${dim})` }} />}
    </>
  )
}

function StarAt({ x, size, top, locks, spinning = false, glow, deg = 14, failed }: { x: number; size: number; top: number; locks: number[]; spinning?: boolean; glow?: string; deg?: number; failed?: number }) {
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top }}>
      {glow && <div style={{ position: 'absolute', left: -size * 0.35, top: -size * 0.3, width: size * 1.7, height: size * 1.6, background: `radial-gradient(closest-side, ${glow}, transparent)` }} />}
      <Star size={size} locks={locks} palette={night.palette} spinning={spinning} spinRef={turn(deg)} failed={failed} />
    </div>
  )
}

/** Point width as an arc around the star: full at 36°, a red notch at the 8° minimum. */
function ArcGauge({ x, size, top, width, color }: { x: number; size: number; top: number; width: number; color: string }) {
  const r = size * 0.5 - 2
  const c = size / 2
  const at = (deg: number) => {
    const a = ((deg - 240) * Math.PI) / 180
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const arc = (to: number) => {
    const [x0, y0] = at(0)
    const [x1, y1] = at(to)
    return `M${x0} ${y0}A${r} ${r} 0 ${to > 180 ? 1 : 0} 1 ${x1} ${y1}`
  }
  const [nx, ny] = at((8 / 36) * 300)
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: x - size / 2, top, filter: `drop-shadow(0 0 6px ${color})` }} aria-hidden="true">
      <path d={arc(300)} stroke="rgba(255,255,255,0.12)" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={arc((width / 36) * 300)} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={nx} cy={ny} r={3} fill={coral} />
    </svg>
  )
}

const Icon = ({ path, ring = false }: { path: ReactNode; ring?: boolean }) => (
  <span style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: ring ? '1px solid rgba(255,255,255,0.2)' : undefined }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  </span>
)
const SOUND = (
  <>
    <path d="M3 8v4h3l4 3V5L6 8Z" />
    <path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />
  </>
)
const PAUSE = <path d="M7 4v12M13 4v12" />
const GEAR = (
  <>
    <circle cx="10" cy="10" r="2.6" />
    <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6" />
  </>
)
const CLOSE = <path d="M5 5l10 10M15 5 5 15" />

const Button = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ marginTop: 12, height: 56, padding: '0 30px', borderRadius: 999, background: 'linear-gradient(180deg, #ffe2a6, #f6a743)', color: '#2a1606', font: '700 16px var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 40px rgba(255,160,70,0.5)', ...style }}>
    {children}
  </span>
)
const Eyebrow = ({ children, color = gold }: { children: ReactNode; color?: string }) => (
  <Text style={{ font: '700 11px var(--font-ui)', letterSpacing: '0.2em', textTransform: 'uppercase', color }}>{children}</Text>
)
/** Floating words over the scene, no card. */
const Words = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <section style={{ position: 'absolute', left: 24, right: 24, bottom: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', textWrap: 'balance', textShadow: '0 2px 18px rgba(20,8,5,0.85)', ...style }}>
    {children}
  </section>
)

function TopBar({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <header style={{ position: 'absolute', top: 14, left: 22, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {left}
      {right}
    </header>
  )
}

const Streak = ({ lit, color = gold }: { lit: number; color?: string }) => (
  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} style={{ width: 9, height: 9, rotate: '45deg', background: i < lit ? color : 'transparent', border: `1px solid ${i < lit ? color : '#6a5a7a'}` }} />
    ))}
  </div>
)
const Count = ({ n, lit, color }: { n: number; lit: number; color?: string }) => (
  <div>
    <Text style={{ font: `400 64px/1 ${serif}` }}>{n}</Text>
    <Streak lit={lit} color={color} />
  </div>
)

/** The bottom sheet: warm dark glass, a gold hairline, floating over the dimmed screen. */
function Sheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 24px 40px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(180deg, rgba(42,24,40,0.97), rgba(20,12,26,0.98))', borderTop: '1px solid rgba(255,207,122,0.35)', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ font: `400 28px ${serif}` }}>{title}</Text>
        <span style={{ marginRight: -10, color: cream }}>
          <Icon path={CLOSE} />
        </span>
      </div>
      {children}
    </section>
  )
}

const Row = ({ label, note, children, line = true }: { label: string; note?: string; children: ReactNode; line?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 56, borderBottom: line ? '1px solid rgba(255,255,255,0.08)' : undefined }}>
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 16 }}>
      {label}
      {note && <span style={{ fontSize: 12, color: '#a8988a' }}>{note}</span>}
    </span>
    {children}
  </div>
)
const Toggle = ({ on }: { on: boolean }) => (
  <span style={{ width: 48, height: 28, borderRadius: 14, padding: 3, boxSizing: 'border-box', background: on ? 'linear-gradient(180deg, #ffe2a6, #f6a743)' : 'rgba(255,255,255,0.14)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
    <span style={{ width: 22, height: 22, borderRadius: 11, background: on ? '#2a1606' : cream }} />
  </span>
)
const Link = ({ children }: { children: ReactNode }) => <span style={{ color: gold, fontWeight: 700, fontSize: 15 }}>{children}</span>

/* ── Screens ─────────────────────────────────────────────────────────────────────────────────────── */

function Landing({ w, h, wide }: Frame) {
  const brand = <span style={{ fontFamily: serif, fontSize: 24 }}>Parol</span>
  const icons = (
    <div style={{ display: 'flex' }}>
      <Icon path={SOUND} />
      <Icon path={GEAR} />
    </div>
  )
  if (wide) {
    const size = Math.min(470, h * 0.56)
    return (
      <>
        <Ground w={w} h={h} wide stage={0} />
        <TopBar left={brand} right={icons} />
        <StarAt x={w * 0.34} size={size} top={h * 0.12} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
        <section style={{ position: 'absolute', left: w * 0.56, top: h * 0.2, width: 460, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, textShadow: '0 2px 18px rgba(20,8,5,0.8)' }}>
          <Eyebrow>{night.araw} · tonight</Eyebrow>
          <Text style={{ font: `400 96px/0.95 ${serif}` }}>{night.name}</Text>
          <Text style={{ fontSize: 17, lineHeight: 1.55, color: cream, maxWidth: 400 }}>{night.blurb}.</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 10 }}>
            <Button style={{ marginTop: 0 }}>
              Light the first ring <span aria-hidden="true">→</span>
            </Button>
            <Text style={{ fontSize: 14, color: cream }}>
              Best today <span style={{ fontFamily: serif, fontSize: 19, color: '#fff' }}>52</span>
            </Text>
          </div>
        </section>
      </>
    )
  }
  return (
    <>
      <Ground w={w} h={h} wide={false} />
      <TopBar left={brand} right={icons} />
      <StarAt x={w / 2} size={300} top={86} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 44, gap: 10 }}>
        <Eyebrow>{night.araw} · tonight</Eyebrow>
        <Text style={{ font: `400 60px/0.95 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 14, lineHeight: 1.5, color: cream, maxWidth: 300 }}>{night.blurb}.</Text>
        <Button>
          Light the first ring <span aria-hidden="true">→</span>
        </Button>
        <Text style={{ fontSize: 13, color: cream }}>
          Best today <span style={{ fontFamily: serif, fontSize: 17, color: '#fff' }}>52</span>
        </Text>
      </Words>
    </>
  )
}

function HowTo({ w, h }: Frame) {
  const steps = [
    { title: 'A ring spins in', text: 'Each new ring turns around the centre.', locks: [0, 0] },
    { title: 'Tap to lock it', text: 'When its points meet the gold dashes. Within 2.5° is perfect.', locks: [0, 0, 0] },
    { title: 'Off-angle gets trimmed', text: 'The points get thinner. Below 8° the run ends.', locks: [0, 0, 9] },
    { title: '5 perfect in a row', text: 'Widen the points back by 6°.', locks: [9, 0, 0, 0, 0, 0] },
  ]
  return (
    <>
      <Ground w={w} h={h} wide={false} dim={0.5} />
      <StarAt x={w / 2} size={240} top={70} locks={PREVIEW} glow="rgba(255,170,80,0.3)" />
      <Sheet title="How to play">
        {steps.map((step, i) => (
          <div key={step.title} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.08)' : undefined }}>
            <span style={{ width: 62, height: 62, flex: 'none', overflow: 'hidden', borderRadius: 31, background: 'rgba(255,207,122,0.08)', position: 'relative' }}>
              <span style={{ position: 'absolute', left: -44, top: -44 }}>
                <Star size={150} locks={step.locks} palette={night.palette} spinning={i === 0} spinRef={turn(20)} />
              </span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ font: `400 18px ${serif}` }}>{step.title}</span>
              <span style={{ fontSize: 13, lineHeight: 1.45, color: cream }}>{step.text}</span>
            </span>
          </div>
        ))}
        <Button style={{ marginTop: 18 }}>Light the first ring</Button>
      </Sheet>
    </>
  )
}

function FirstRing({ w, h }: Frame) {
  return (
    <>
      <Ground w={w} h={h} wide={false} />
      <TopBar left={<Count n={0} lit={0} />} right={<Icon path={PAUSE} ring />} />
      <StarAt x={w / 2} size={300} top={150} locks={[]} spinning glow="rgba(255,170,80,0.4)" deg={22} />
      <ArcGauge x={w / 2} size={372} top={114} width={36} color={gold} />
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', font: '700 11px var(--font-ui)', letterSpacing: '0.18em', color: cream }}>36° · 1.0×</Text>
      <Words style={{ bottom: 190 }}>
        <Text style={{ font: `italic 400 22px ${serif}`, color: gold }}>Tap</Text>
        <Text style={{ fontSize: 14, color: cream, maxWidth: 300 }}>when the points meet the gold dashes</Text>
      </Words>
    </>
  )
}

function Play({ w, h, wide }: Frame) {
  if (wide) {
    const size = Math.min(460, h * 0.52)
    return (
      <>
        <Ground w={w} h={h} wide stage={3} />
        <TopBar left={<Count n={24} lit={3} />} right={<Icon path={PAUSE} ring />} />
        <StarAt x={w / 2} size={size} top={h * 0.17} locks={RUN} spinning glow="rgba(255,170,80,0.45)" />
        <ArcGauge x={w / 2} size={size * 1.24} top={h * 0.17 - size * 0.12} width={26} color={gold} />
        <Text style={{ position: 'absolute', left: 0, right: 0, top: h * 0.17 - size * 0.12 - 30, textAlign: 'center', font: '700 12px var(--font-ui)', letterSpacing: '0.18em', color: cream }}>26° · 1.6×</Text>
        <Text style={{ position: 'absolute', left: 0, right: 0, top: h * 0.17 + size * 1.18, textAlign: 'center', font: `italic 400 44px ${serif}`, color: gold, textShadow: '0 0 24px rgba(255,190,90,0.7)' }}>Perfect</Text>
      </>
    )
  }
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={3} />
      <TopBar left={<Count n={24} lit={3} />} right={<Icon path={PAUSE} ring />} />
      <StarAt x={w / 2} size={300} top={150} locks={RUN} spinning glow="rgba(255,170,80,0.45)" />
      <ArcGauge x={w / 2} size={372} top={114} width={26} color={gold} />
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', font: '700 11px var(--font-ui)', letterSpacing: '0.18em', color: cream }}>26° · 1.6×</Text>
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', font: `italic 400 34px ${serif}`, color: gold, textShadow: '0 0 24px rgba(255,190,90,0.7)' }}>Perfect</Text>
    </>
  )
}

function Danger({ w, h }: Frame) {
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={4} />
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 120px rgba(255,90,80,0.35)' }} />
      <TopBar left={<Count n={31} lit={0} />} right={<Icon path={PAUSE} ring />} />
      <StarAt x={w / 2} size={300} top={150} locks={DANGER} spinning glow="rgba(255,120,90,0.35)" deg={-9} />
      <ArcGauge x={w / 2} size={372} top={114} width={11} color={coral} />
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', font: '700 11px var(--font-ui)', letterSpacing: '0.18em', color: coral }}>11° · 1.9×</Text>
      <Text style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', font: `italic 400 34px ${serif}`, color: coral, textShadow: '0 0 24px rgba(255,120,100,0.6)' }}>7° off</Text>
    </>
  )
}

function Milestone({ w, h }: Frame) {
  const locks = Array.from({ length: 30 }, (_, i) => (i % 6 === 2 ? 3 : 0))
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={5} />
      <TopBar left={<Count n={30} lit={5} />} right={<Icon path={PAUSE} ring />} />
      <StarAt x={w / 2} size={300} top={150} locks={locks} glow="rgba(255,190,90,0.6)" />
      <ArcGauge x={w / 2} size={372} top={114} width={30} color={gold} />
      <Words style={{ top: 560, bottom: 'auto', gap: 6 }}>
        <Eyebrow>30 rings</Eyebrow>
        <Text style={{ font: `400 28px/1.15 ${serif}`, maxWidth: 300 }}>The neighbours light their parols</Text>
      </Words>
    </>
  )
}

function Paused({ w, h }: Frame) {
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={3} dim={0.45} />
      <StarAt x={w / 2} size={230} top={110} locks={RUN} spinning glow="rgba(255,170,80,0.25)" />
      <Words>
        <Eyebrow>Paused</Eyebrow>
        <Text style={{ font: `400 120px/0.9 ${serif}`, marginBottom: 6 }}>24</Text>
        <Text style={{ fontSize: 15, color: cream }}>rings so far</Text>
        <Button style={{ marginTop: 14 }}>Resume</Button>
      </Words>
    </>
  )
}

function Hundred({ w, h }: Frame) {
  const locks = Array.from({ length: 100 }, (_, i) => (i % 9 === 4 ? 2 : 0))
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={10} dim={0.15} />
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} style={{ position: 'absolute', left: (i * 97) % w, top: 30 + ((i * 53) % 260), width: 3, height: 3, borderRadius: 2, background: '#fff', boxShadow: '0 0 8px 2px rgba(255,240,200,0.8)', opacity: 0.5 + (i % 3) * 0.2 }} />
      ))}
      <StarAt x={w / 2} size={250} top={90} locks={locks} glow="rgba(255,235,180,0.75)" />
      <Words>
        <Eyebrow>100 rings</Eyebrow>
        <Text style={{ font: `400 40px/1.05 ${serif}`, maxWidth: 300 }}>Your parol became a star</Text>
        <Text style={{ fontSize: 15, lineHeight: 1.5, color: cream, maxWidth: 250 }}>The Star of Bethlehem shines over the barangay.</Text>
        <Button style={{ marginTop: 14 }}>Keep going</Button>
      </Words>
    </>
  )
}

function End({ w, h, wide, best = false }: Frame & { best?: boolean }) {
  const detail = best ? (
    <Text style={{ fontSize: 15, color: cream }}>
      rings · 19 perfect · <span style={{ color: gold }}>new best today</span>
    </Text>
  ) : (
    <>
      <Text style={{ fontSize: 15, color: cream }}>rings · 12 perfect</Text>
      <Text style={{ fontSize: 13, color: cream, marginTop: 2 }}>
        Best today <span style={{ fontFamily: serif, fontSize: 17, color: '#fff' }}>52</span>
      </Text>
    </>
  )
  const n = best ? 24 : 17
  const locks = best ? RUN : RUN.slice(0, 17)
  if (wide) {
    const size = Math.min(420, h * 0.5)
    return (
      <>
        <Ground w={w} h={h} wide stage={3} dim={0.35} />
        <StarAt x={w * 0.34} size={size} top={h * 0.16} locks={locks} glow="rgba(255,170,80,0.3)" failed={best ? undefined : 9} />
        <section style={{ position: 'absolute', left: w * 0.56, top: h * 0.24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
          <Eyebrow>The star rests</Eyebrow>
          <Text style={{ font: `400 160px/0.9 ${serif}`, marginBottom: 8 }}>{n}</Text>
          {detail}
          <Button style={{ marginTop: 20 }}>Light again</Button>
        </section>
      </>
    )
  }
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={3} dim={0.35} />
      <StarAt x={w / 2} size={230} top={110} locks={locks} glow="rgba(255,170,80,0.3)" failed={best ? undefined : 9} />
      <Words>
        <Eyebrow>The star rests</Eyebrow>
        <Text style={{ font: `400 120px/0.9 ${serif}`, marginBottom: 6 }}>{n}</Text>
        {detail}
        <Button style={{ marginTop: 14 }}>Light again</Button>
      </Words>
    </>
  )
}

function Settings({ w, h }: Frame) {
  return (
    <>
      <Ground w={w} h={h} wide={false} dim={0.5} />
      <StarAt x={w / 2} size={260} top={86} locks={PREVIEW} glow="rgba(255,170,80,0.3)" />
      <Sheet title="Settings">
        <Row label="Sound">
          <Toggle on />
        </Row>
        <Row label="Vibration" note="Android only">
          <Toggle on />
        </Row>
        <Row label="Reduced motion">
          <Toggle on={false} />
        </Row>
        <Row label="How to play">
          <Link>Show again</Link>
        </Row>
        <Row label="Playtest log" note="38 runs kept on this device" line={false}>
          <Link>Download</Link>
        </Row>
      </Sheet>
    </>
  )
}

function NewDay({ w, h }: Frame) {
  return (
    <>
      <Ground w={w} h={h} wide={false} stage={0} dim={0.55} />
      <StarAt x={w / 2} size={230} top={110} locks={PREVIEW} glow="rgba(255,170,80,0.35)" />
      <Words>
        <Eyebrow>Past midnight in Manila</Eyebrow>
        <Text style={{ font: `400 40px/1.05 ${serif}`, maxWidth: 340 }}>A new star is ready</Text>
        <Text style={{ fontSize: 15, color: cream }}>Your best yesterday: 52 rings</Text>
        <Button style={{ marginTop: 14 }}>See tonight’s star</Button>
      </Words>
    </>
  )
}

const SCREENS: { id: string; label: string; View: (frame: Frame) => ReactNode; wide?: boolean }[] = [
  { id: 'landing', label: '01 Landing', View: Landing, wide: true },
  { id: 'howto', label: '02 How to play', View: HowTo },
  { id: 'first', label: '03 First ring', View: FirstRing },
  { id: 'play', label: '04 Perfect', View: Play, wide: true },
  { id: 'danger', label: '05 Off · danger', View: Danger },
  { id: 'milestone', label: '06 Milestone', View: Milestone },
  { id: 'paused', label: '07 Paused', View: Paused },
  { id: 'hundred', label: '08 100 rings', View: Hundred },
  { id: 'best', label: '09 End · new best', View: (f) => <End {...f} best />, wide: true },
  { id: 'end', label: '10 End', View: End },
  { id: 'settings', label: '11 Settings', View: Settings },
  { id: 'newday', label: '12 New day', View: NewDay },
]

const Phone = ({ w, h, wide, View }: Frame & { View: (frame: Frame) => ReactNode }) => (
  <main style={{ position: 'relative', width: w, height: h, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
    <View w={w} h={h} wide={wide} />
  </main>
)

const params = new URLSearchParams(location.search)
const id = params.get('s') ?? 'board'
const wide = params.get('w') === '1'
const scale = Number(params.get('scale') ?? 0.42)
const only = SCREENS.find((s) => s.id === id)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {only ? (
      <Phone w={wide ? 1440 : 390} h={wide ? 900 : 844} wide={wide && !!only.wide} View={only.View} />
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${390 * scale}px)`, gap: 18, padding: 18, fontFamily: 'var(--font-ui)', color: '#bba' }}>
        {SCREENS.map((s) => (
          <figure key={s.id} style={{ margin: 0 }}>
            <div style={{ width: 390 * scale, height: 844 * scale, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                <Phone w={390} h={844} wide={false} View={s.View} />
              </div>
            </div>
            <figcaption style={{ fontSize: 12, marginTop: 6 }}>{s.label}</figcaption>
          </figure>
        ))}
      </div>
    )}
  </StrictMode>,
)
