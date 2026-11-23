// Where the word after each lock could sit (development only): today's spot under the tassels, in the
// gauge's open bottom, or over the star's centre. ?s=<id> shows one at 390×844.
import { StrictMode, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Garland } from '../src/ui/parts.tsx'
import { ArcGauge, Count, Icon, PAUSE, RUN, StarAt, Text, TopBar, gold, coral, night, serif, Ground } from './kit.tsx'

const W = 390
const H = 844
const SIZE = 282
const TOP = 300
const GAUGE = Math.round(SIZE * 1.24)
const MID = TOP + SIZE / 2

type Word = { text: string; color: string; glow: string }
const PERFECT: Word = { text: 'Perfect', color: gold, glow: 'rgba(255,190,90,0.7)' }
const OFF: Word = { text: '7° off', color: coral, glow: 'rgba(255,120,100,0.6)' }

const say = (word: Word, style: CSSProperties) => (
  <Text style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', font: `italic 400 34px ${serif}`, color: word.color, textShadow: `0 0 24px ${word.glow}`, ...style }}>{word.text}</Text>
)

function Run({ children }: { children: ReactNode }) {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={2} />
      <TopBar left={<Count n={24} lit={3} />} right={<Icon path={PAUSE} ring />} />
      <div style={{ position: 'absolute', top: 100, left: 16 }}>
        <Garland width={W - 32} lit={2} palette={night.palette} toGo={6} />
      </div>
      <StarAt x={W / 2} size={SIZE} top={TOP} locks={RUN} spinning glow="rgba(255,170,80,0.45)" />
      <ArcGauge x={W / 2} size={GAUGE} top={MID - GAUGE / 2} width={26} color={gold} />
      {children}
    </>
  )
}

/** Today: under the tassels, low on the screen, over the street. */
const Now = (word: Word) => () => <Run>{say(word, { top: TOP + SIZE * 1.4 + 8 })}</Run>

/** In the gauge's open bottom: right under the star, between the arc's two ends and the tassels. */
const Gap = (word: Word) => () => <Run>{say(word, { top: MID + GAUGE / 2 - 34, fontSize: 30 })}</Run>

/** Over the star's centre for a moment, like a stamp, then gone: where the eye already is. */
const Centre = (word: Word) => () => (
  <Run>
    <div style={{ position: 'absolute', left: W / 2 - 90, top: MID - 40, width: 180, height: 80, background: 'radial-gradient(closest-side, rgba(20,10,20,0.55), transparent)' }} />
    {say(word, { top: MID - 26, fontSize: 40 })}
  </Run>
)

const OPTIONS = [
  { id: 'now', title: 'Now', note: 'Under the tassels, over the street: far from the star, and low on a phone.', make: Now },
  { id: 'gap', title: 'A · In the gauge’s gap', note: 'Right under the star, inside the arc’s open bottom. Close to the action, never covers it.', make: Gap },
  { id: 'centre', title: 'B · Over the centre', note: 'A short stamp over the star’s middle, where the eye already is. Covers old rings for 0.9 s.', make: Centre },
]

const SCREENS = OPTIONS.flatMap((o) => [
  { id: `${o.id}-perfect`, View: o.make(PERFECT) },
  { id: `${o.id}-off`, View: o.make(OFF) },
])

const Phone = ({ View }: { View: () => ReactNode }) => (
  <main style={{ position: 'relative', width: W, height: H, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
    <View />
  </main>
)

const params = new URLSearchParams(location.search)
const only = SCREENS.find((s) => s.id === params.get('s'))
const scale = 0.4

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {only ? (
      <Phone View={only.View} />
    ) : (
      <div style={{ padding: 18, display: 'flex', gap: 22, fontFamily: 'var(--font-ui)', color: '#cbbfae' }}>
        {OPTIONS.map((o) => (
          <section key={o.id} style={{ width: W * scale * 2 + 12 }}>
            <p style={{ margin: 0, font: `400 18px ${serif}`, color: '#fff' }}>{o.title}</p>
            <p style={{ margin: '6px 0 12px', fontSize: 12, lineHeight: 1.45, minHeight: 34 }}>{o.note}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[PERFECT, OFF].map((word) => {
                const View = o.make(word)
                return (
                  <div key={word.text} style={{ width: W * scale, height: H * scale, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                      <Phone View={View} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    )}
  </StrictMode>,
)
