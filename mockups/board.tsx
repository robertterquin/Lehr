// Where tonight's board sits (development only, Phase 9): a rank line on the landing page and the end
// screen, the board as a bottom sheet, and the one-time name prompt. ?s=<id> shows one at 390×844.
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Garland } from '../src/ui/parts.tsx'
import { Button, Eyebrow, GEAR, Icon, PREVIEW, RUN, SOUND, StarAt, Text, TopBar, Words, cream, gold, night, serif, Ground } from './kit.tsx'

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

/** The board: tonight's top ten and your own row pinned under them. */
const YESTERDAY = TONIGHT.map(([, rings], i) => [['Tala', 'Kidlat', 'Liwayway', 'Paolo', 'Amihan', 'Mayumi', 'Dalisay', 'bituin88', 'Ligaya', 'Jun P.'][i], rings + 9] as const)

/** Phone: the board floats over the dimmed street in the end screen's place, like the desktop list. */
function Board({ day }: { day: 'Tonight' | 'Yesterday' }) {
  const tonight = day === 'Tonight'
  const rows = tonight ? TONIGHT : YESTERDAY
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={5} dim={0.6} />
      <section style={{ position: 'absolute', left: 24, right: 24, top: 22, display: 'flex', flexDirection: 'column', gap: 10, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Back />
        <div style={{ marginTop: 18 }}>
          <Eyebrow>{tonight ? 'Tonight’s board' : 'Last night · final'}</Eyebrow>
          <Text style={{ font: `400 40px/1.1 ${serif}` }}>{tonight ? night.name : 'Intramuros'}</Text>
        </div>
        <Tabs on={day} />
        <div>
          {rows.map(([name, rings], i) => (
            <Line key={name} rank={i + 1} name={name} rings={rings} />
          ))}
          <Line rank={tonight ? 312 : 205} name="You · Bituing Gabi" rings={tonight ? 52 : 61} you />
        </div>
        <Text style={{ fontSize: 12, color: dusk }}>{tonight ? '4,120 lit tonight’s star · closes at midnight, Manila' : '5,804 lit last night’s star'}</Text>
      </section>
    </>
  )
}

/* ── Desktop (1440×900): the star on the left, the words on the right, as the game lays them out ─────── */

const DW = 1440
const DH = 900

const DeskGarland = ({ lit, toGo }: { lit: number; toGo?: number }) => (
  <div style={{ position: 'absolute', top: 64, left: (DW - 640) / 2 }}>
    <Garland width={640} lit={lit} palette={night.palette} toGo={toGo} />
  </div>
)

/** The right-hand column, where the landing and end words stand. */
const Column = ({ children }: { children: ReactNode }) => (
  <section style={{ position: 'absolute', left: DW * 0.55, top: 200, width: 460, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>{children}</section>
)

function DeskLanding() {
  return (
    <>
      <Ground w={DW} h={DH} wide />
      <TopBar left={<Brand />} right={<Icons />} />
      <DeskGarland lit={5} />
      <StarAt x={DW * 0.32} size={430} top={190} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Column>
        <Eyebrow>{night.araw} · tonight’s star</Eyebrow>
        <Text style={{ font: `400 96px/0.95 ${serif}` }}>{night.name}</Text>
        <Text style={{ fontSize: 17, color: cream }}>Light all ten parols on the street tonight.</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14 }}>
          <Button style={{ marginTop: 0 }}>
            Light the first ring <span aria-hidden="true">→</span>
          </Button>
          <Text style={{ fontSize: 14, color: cream }}>
            Best today <Num>52</Num> <span style={{ color: dusk, margin: '0 6px' }}>·</span> <LinkText>#312 tonight</LinkText>
          </Text>
        </div>
      </Column>
    </>
  )
}

function DeskEnd() {
  return (
    <>
      <Ground w={DW} h={DH} wide stage={5} dim={0.35} />
      <TopBar left={<span />} right={<Icons />} />
      <DeskGarland lit={5} toGo={8} />
      <StarAt x={DW * 0.32} size={380} top={210} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
      <Column>
        <Eyebrow>The star rests</Eyebrow>
        <Text style={{ font: `400 160px/0.9 ${serif}`, marginBottom: 8 }}>52</Text>
        <Text style={{ fontSize: 16, color: cream }}>
          rings · 41 perfect · <span style={{ color: gold }}>new best today</span>
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 1.45, color: dusk }}>
          Points wore below 8° · <b style={{ color: gold }}>8 more for the lantern festival</b>
        </Text>
        <Text style={{ marginTop: 6, fontSize: 16, color: cream }}>
          <Num size={22} color={gold}>
            #312
          </Num>{' '}
          of 4,120 tonight · up 40 · <LinkText>See the board</LinkText>
        </Text>
        <Button style={{ marginTop: 14 }}>Light again</Button>
      </Column>
    </>
  )
}

/** The first time you'd join the board: a name, once, floating like the board itself. */
function Name() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={5} dim={0.6} />
      <section style={{ position: 'absolute', left: 24, right: 24, bottom: 48, display: 'flex', flexDirection: 'column', gap: 10, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Eyebrow>Join tonight’s board</Eyebrow>
        <Text style={{ font: `400 40px/1.1 ${serif}` }}>Your name</Text>
        <Text style={{ fontSize: 14, lineHeight: 1.5, color: cream }}>Everyone who lights tonight’s star sees it.</Text>
        <div style={{ marginTop: 10, height: 56, borderBottom: `2px solid ${gold}`, display: 'flex', alignItems: 'center', font: `400 26px ${serif}` }}>
          Bituing Gabi<span style={{ width: 2, height: 28, marginLeft: 3, background: gold }} />
        </div>
        <Text style={{ fontSize: 12, color: dusk }}>Up to 16 letters, numbers or spaces · change it any time in Settings</Text>
        <Button style={{ marginTop: 16 }}>Join the board</Button>
        <Text style={{ marginTop: 4, textAlign: 'center', fontSize: 14, fontWeight: 700, color: cream }}>Not now</Text>
      </section>
    </>
  )
}

/* ── The board on desktop: no card, floating over the street ──────────────────────────────────────── */

/** The end screen behind the board: the star stays, the words step aside. */
const DeskBack = ({ children }: { children: ReactNode }) => (
  <>
    <Ground w={DW} h={DH} wide stage={5} dim={0.35} />
    <TopBar left={<span />} right={<Icons />} />
    <DeskGarland lit={5} toGo={8} />
    <StarAt x={DW * 0.32} size={380} top={210} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
    {/* A soft dark glow behind the words, as the run-over has, so they read over the sky. */}
    <div style={{ position: 'absolute', left: DW * 0.5, top: 120, width: 640, height: 720, background: 'radial-gradient(closest-side, rgba(16,8,18,0.55), transparent)' }} />
    {children}
  </>
)

const Back = () => <Text style={{ fontSize: 14, fontWeight: 700, color: cream }}>← The star rests</Text>

/** Tonight / Yesterday as two words, the chosen one underlined in gold. */
const Tabs = ({ on = 'Tonight' }: { on?: 'Tonight' | 'Yesterday' }) => (
  <div style={{ display: 'flex', gap: 22, fontSize: 14, fontWeight: 700 }}>
    {(['Tonight', 'Yesterday'] as const).map((label) => (
      <span key={label} style={{ color: label === on ? gold : dusk, paddingBottom: 4, borderBottom: `2px solid ${label === on ? gold : 'transparent'}` }}>
        {label}
      </span>
    ))}
  </div>
)

const Line = ({ rank, name, rings, you = false, faint = false }: { rank: number | string; name: string; rings: number; you?: boolean; faint?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', color: you ? gold : faint ? dusk : 'var(--ink)' }}>
    <span style={{ width: 44, font: `400 ${you ? 22 : 18}px ${serif}`, color: you || (typeof rank === 'number' && rank <= 3) ? gold : dusk }}>{rank}</span>
    <span style={{ flex: 1, fontSize: 15, fontWeight: you ? 700 : 400 }}>{name}</span>
    <span style={{ font: `400 ${you ? 22 : 18}px ${serif}` }}>{rings}</span>
  </div>
)

/** Desktop: the board is words over the street in the end screen's place, the star still in view. */
function DeskFloat() {
  return (
    <DeskBack>
      <section style={{ position: 'absolute', left: DW * 0.55, top: 176, width: 420, display: 'flex', flexDirection: 'column', gap: 10, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Back />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
          <div>
            <Eyebrow>Tonight’s board</Eyebrow>
            <Text style={{ font: `400 44px/1.1 ${serif}` }}>{night.name}</Text>
          </div>
          <Tabs />
        </div>
        <div>
          {TONIGHT.map(([name, rings], i) => (
            <Line key={name} rank={i + 1} name={name} rings={rings} />
          ))}
          <Line rank={312} name="You · Bituing Gabi" rings={52} you />
        </div>
        <Text style={{ fontSize: 12, color: dusk }}>4,120 lit tonight’s star · closes at midnight, Manila</Text>
      </section>
    </DeskBack>
  )
}

const SCREENS: { id: string; label: string; View: () => ReactNode; desk?: boolean }[] = [
  { id: 'landing', label: 'Landing · your rank', View: Landing },
  { id: 'landing-new', label: 'Landing · first visit', View: LandingNew },
  { id: 'end', label: 'End · rank line', View: End },
  { id: 'board', label: 'Board · tonight', View: () => <Board day="Tonight" /> },
  { id: 'yesterday', label: 'Board · yesterday', View: () => <Board day="Yesterday" /> },
  { id: 'name', label: 'Name, once', View: Name },
  { id: 'desk-landing', label: 'Desktop · landing', View: DeskLanding, desk: true },
  { id: 'desk-end', label: 'Desktop · end', View: DeskEnd, desk: true },
  { id: 'desk-float', label: 'Desktop · the board', View: DeskFloat, desk: true },
]

const Phone = ({ View, desk = false }: { View: () => ReactNode; desk?: boolean }) => (
  <main style={{ position: 'relative', width: desk ? DW : W, height: desk ? DH : H, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
    <View />
  </main>
)

const params = new URLSearchParams(location.search)
const only = SCREENS.find((s) => s.id === params.get('s'))
const scale = 0.4

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {only ? (
      <Phone View={only.View} desk={only.desk} />
    ) : (
      <div style={{ padding: 18, display: 'flex', flexWrap: 'wrap', gap: 14, width: 1024, fontFamily: 'var(--font-ui)', color: '#cbbfae' }}>
        {SCREENS.map((s) => {
          const k = s.desk ? 0.22 : scale
          return (
            <figure key={s.id} style={{ margin: 0 }}>
              <div style={{ width: (s.desk ? DW : W) * k, height: (s.desk ? DH : H) * k, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ transform: `scale(${k})`, transformOrigin: '0 0' }}>
                  <Phone View={s.View} desk={s.desk} />
                </div>
              </div>
              <figcaption style={{ fontSize: 12, marginTop: 6 }}>{s.label}</figcaption>
            </figure>
          )
        })}
      </div>
    )}
  </StrictMode>,
)
