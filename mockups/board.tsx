// Where tonight's board sits (development only, Phase 9): a rank line on the landing page and the end
// screen, the board as a bottom sheet, and the one-time name prompt. ?s=<id> shows one at 390×844.
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Garland } from '../src/ui/parts.tsx'
import { Button, Eyebrow, GEAR, Icon, PREVIEW, RUN, SOUND, Sheet, StarAt, Text, TopBar, Words, cream, gold, night, serif, Ground } from './kit.tsx'

const W = 390
const H = 844
const dusk = '#a8988a'

const Brand = () => <span style={{ fontFamily: serif, fontSize: 24 }}>Parol</span>
const Icons = () => (
  <div style={{ display: 'flex' }}>
    <Icon path={SOUND} />
    <Icon path={GEAR} />
  </div>
)
const Num = ({ children, size = 17, color = '#fff' }: { children: ReactNode; size?: number; color?: string }) => <span style={{ fontFamily: serif, fontSize: size, color }}>{children}</span>
const LinkText = ({ children }: { children: ReactNode }) => <span style={{ color: gold, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(255,207,122,0.4)' }}>{children}</span>
const GarlandAt = ({ lit, toGo }: { lit: number; toGo?: number }) => (
  <div style={{ position: 'absolute', top: 60, left: 16 }}>
    <Garland width={W - 32} lit={lit} palette={night.palette} toGo={toGo} />
  </div>
)

/** Landing: the rank joins today's best on its one quiet line. */
function Landing() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <GarlandAt lit={5} />
      <StarAt x={W / 2} size={250} top={176} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 40, gap: 10 }}>
        <Eyebrow>{night.araw} · tonight’s star</Eyebrow>
        <Text style={{ font: `400 60px/0.95 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 14, color: cream }}>Light all ten parols on the street tonight.</Text>
        <Button>
          Light the first ring <span aria-hidden="true">→</span>
        </Button>
        <Text style={{ fontSize: 13, color: cream }}>
          Best today <Num>52</Num> <span style={{ color: dusk, margin: '0 6px' }}>·</span> <LinkText>#312 tonight</LinkText>
        </Text>
      </Words>
    </>
  )
}

/** First visit: no rank yet, so the line says the game is alive. */
function LandingNew() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <GarlandAt lit={0} />
      <StarAt x={W / 2} size={250} top={176} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 40, gap: 10 }}>
        <Eyebrow>{night.araw} · tonight’s star</Eyebrow>
        <Text style={{ font: `400 60px/0.95 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 14, color: cream }}>Light all ten parols on the street tonight.</Text>
        <Button>
          Start · it takes a minute <span aria-hidden="true">→</span>
        </Button>
        <Text style={{ fontSize: 13, color: cream }}>
          <Num>4,120</Num> lit tonight’s star · <LinkText>See the board</LinkText>
        </Text>
      </Words>
    </>
  )
}

/** End: one line for the rank, between how close the next milestone was and Light again. */
function End() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={5} dim={0.35} />
      <TopBar left={<span />} right={<Icons />} />
      <GarlandAt lit={5} toGo={8} />
      <StarAt x={W / 2} size={200} top={180} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
      <Words style={{ bottom: 40 }}>
        <Eyebrow>The star rests</Eyebrow>
        <Text style={{ font: `400 120px/0.9 ${serif}`, marginBottom: 6 }}>52</Text>
        <Text style={{ fontSize: 15, color: cream }}>
          rings · 41 perfect · <span style={{ color: gold }}>new best today</span>
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 1.45, color: dusk }}>
          Points wore below 8°
          <br />
          <b style={{ color: gold }}>8 more for the lantern festival</b>
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, color: cream }}>
          <Num size={20} color={gold}>
            #312
          </Num>{' '}
          of 4,120 tonight · up 40 · <LinkText>See the board</LinkText>
        </Text>
        <Button style={{ marginTop: 10 }}>Light again</Button>
      </Words>
    </>
  )
}

const TONIGHT = [
  ['Liwayway', 142],
  ['Tala', 128],
  ['bituin88', 117],
  ['Amihan', 109],
  ['Kidlat', 104],
  ['Mayumi', 98],
  ['Jun P.', 95],
  ['Dalisay', 91],
  ['Paolo', 88],
  ['Ligaya', 86],
] as const

function Segments({ on }: { on: 'Tonight' | 'Yesterday' }) {
  return (
    <div style={{ display: 'flex', padding: 3, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 6 }}>
      {(['Tonight', 'Yesterday'] as const).map((label) => (
        <span key={label} style={{ flex: 1, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, background: label === on ? 'linear-gradient(180deg, #ffe2a6, #f6a743)' : 'transparent', color: label === on ? '#2a1606' : cream }}>
          {label}
        </span>
      ))}
    </div>
  )
}

const Rank = ({ rank, name, rings, you = false }: { rank: number; name: string; rings: number; you?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: you ? 50 : 38, padding: you ? '0 14px' : '0 4px', margin: you ? '6px -10px 0' : 0, borderRadius: 14, background: you ? 'rgba(255,207,122,0.1)' : 'transparent', border: you ? '1px solid rgba(255,207,122,0.35)' : 'none' }}>
    <span style={{ width: 40, font: `400 ${rank <= 3 ? 20 : 17}px ${serif}`, color: rank <= 3 || you ? gold : dusk }}>{rank}</span>
    <span style={{ flex: 1, fontSize: 15, fontWeight: you ? 700 : 400 }}>{name}</span>
    <span style={{ font: `400 18px ${serif}` }}>{rings}</span>
  </div>
)

/** The board: tonight's top ten and your own row pinned under them. */
function Board({ day }: { day: 'Tonight' | 'Yesterday' }) {
  const rows = day === 'Tonight' ? TONIGHT : TONIGHT.map(([name, rings], i) => [['Tala', 'Kidlat', 'Liwayway', 'Paolo', 'Amihan', 'Mayumi', 'Dalisay', 'bituin88', 'Ligaya', 'Jun P.'][i], rings + 9] as const)
  return (
    <>
      <End />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,20,0.55)' }} />
      <Sheet title={day === 'Tonight' ? night.name : 'Intramuros'}>
        <Segments on={day} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(([name, rings], i) => (
            <Rank key={name} rank={i + 1} name={name} rings={rings} />
          ))}
        </div>
        <Text style={{ textAlign: 'center', color: dusk, letterSpacing: 4, margin: '2px 0' }}>···</Text>
        <Rank rank={day === 'Tonight' ? 312 : 205} name="You · Bituing Gabi" rings={day === 'Tonight' ? 52 : 61} you />
        <Text style={{ marginTop: 14, fontSize: 12, textAlign: 'center', color: dusk }}>{day === 'Tonight' ? '4,120 lit tonight’s star · closes at midnight, Manila' : 'Final · 5,804 lit last night’s star'}</Text>
      </Sheet>
    </>
  )
}

/** The first time you'd join the board: a name, once. */
function Name() {
  return (
    <>
      <End />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,20,0.55)' }} />
      <Sheet title="Your name">
        <Text style={{ fontSize: 14, lineHeight: 1.5, color: cream, marginTop: -4 }}>It goes on the board, for everyone who lights tonight’s star.</Text>
        <div style={{ marginTop: 16, height: 56, borderRadius: 16, border: `1px solid ${gold}`, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 17 }}>
          Bituing Gabi<span style={{ width: 2, height: 22, marginLeft: 2, background: gold }} />
        </div>
        <Text style={{ marginTop: 8, fontSize: 12, color: dusk }}>Up to 16 letters, numbers or spaces · you can change it in Settings</Text>
        <Button style={{ marginTop: 18 }}>Join the board</Button>
        <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: cream }}>Not now</Text>
      </Sheet>
    </>
  )
}

const SCREENS: { id: string; label: string; View: () => ReactNode }[] = [
  { id: 'landing', label: 'Landing · your rank', View: Landing },
  { id: 'landing-new', label: 'Landing · first visit', View: LandingNew },
  { id: 'end', label: 'End · rank line', View: End },
  { id: 'board', label: 'Board · tonight', View: () => <Board day="Tonight" /> },
  { id: 'yesterday', label: 'Board · yesterday', View: () => <Board day="Yesterday" /> },
  { id: 'name', label: 'Name, once', View: Name },
]

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
      <div style={{ padding: 18, display: 'flex', gap: 14, fontFamily: 'var(--font-ui)', color: '#cbbfae' }}>
        {SCREENS.map((s) => (
          <figure key={s.id} style={{ margin: 0 }}>
            <div style={{ width: W * scale, height: H * scale, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                <Phone View={s.View} />
              </div>
            </div>
            <figcaption style={{ fontSize: 12, marginTop: 6 }}>{s.label}</figcaption>
          </figure>
        ))}
      </div>
    )}
  </StrictMode>,
)
