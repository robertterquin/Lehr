// Every screen of the game in the lantern-glow direction (R1), development only.
// ?s=board shows the phone screens side by side; ?s=<id> one screen at 390×844; &w=1 the desktop version at 1440×900.
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Star } from '../src/draw/star.tsx'
import {
  night,
  RUN,
  DANGER,
  PREVIEW,
  serif,
  gold,
  cream,
  coral,
  type Frame,
  turn,
  Text,
  Ground,
  StarAt,
  ArcGauge,
  Icon,
  SOUND,
  PAUSE,
  GEAR,
  CLOSE,
  Button,
  Eyebrow,
  Words,
  TopBar,
  Streak,
  Count,
  Sheet,
  Row,
  Toggle,
  Link,
} from './kit.tsx'

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
