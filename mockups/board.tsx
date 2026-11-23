// Where tonight's board sits (development only, Phase 9): a rank line on the landing page and the end
// screen, the board as a bottom sheet, and the one-time name prompt. ?s=<id> shows one at 390×844.
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Garland } from '../src/ui/parts.tsx'
import { MiniParol } from '../src/draw/street.tsx'
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
/** The board's contents, the same on a phone sheet and the desktop panel. */
function BoardBody({ day }: { day: 'Tonight' | 'Yesterday' }) {
  const rows = day === 'Tonight' ? TONIGHT : TONIGHT.map(([name, rings], i) => [['Tala', 'Kidlat', 'Liwayway', 'Paolo', 'Amihan', 'Mayumi', 'Dalisay', 'bituin88', 'Ligaya', 'Jun P.'][i], rings + 9] as const)
  return (
    <>
      <Segments on={day} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map(([name, rings], i) => (
          <Rank key={name} rank={i + 1} name={name} rings={rings} />
        ))}
      </div>
      <Text style={{ textAlign: 'center', color: dusk, letterSpacing: 4, margin: '2px 0' }}>···</Text>
      <Rank rank={day === 'Tonight' ? 312 : 205} name="You · Bituing Gabi" rings={day === 'Tonight' ? 52 : 61} you />
      <Text style={{ marginTop: 14, fontSize: 12, textAlign: 'center', color: dusk }}>{day === 'Tonight' ? '4,120 lit tonight’s star · closes at midnight, Manila' : 'Final · 5,804 lit last night’s star'}</Text>
    </>
  )
}

function Board({ day }: { day: 'Tonight' | 'Yesterday' }) {
  return (
    <>
      <End />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,20,0.55)' }} />
      <Sheet title={day === 'Tonight' ? night.name : 'Intramuros'}>
        <BoardBody day={day} />
      </Sheet>
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

/** On desktop the board takes the words' place on the right: no dimming, the star stays in view. */
function DeskBoard() {
  return (
    <>
      <Ground w={DW} h={DH} wide stage={5} dim={0.35} />
      <TopBar left={<span />} right={<Icons />} />
      <DeskGarland lit={5} toGo={8} />
      <StarAt x={DW * 0.32} size={380} top={210} locks={RUN} glow="rgba(255,170,80,0.3)" failed={9} />
      <section style={{ position: 'absolute', left: DW * 0.55, top: 150, width: 440, padding: '22px 24px 24px', borderRadius: 28, background: 'linear-gradient(180deg, #2a1828, #140c1a)', border: '1px solid rgba(255,207,122,0.35)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ font: `400 28px ${serif}` }}>
            <span style={{ fontSize: 15, fontFamily: 'var(--font-ui)', fontWeight: 700, color: gold, marginRight: 10 }}>←</span>
            {night.name}
          </Text>
        </div>
        <BoardBody day="Tonight" />
      </section>
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

/* ── Desktop board, redrawn: no card. Three ways to float the board over the street ─────────────── */

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
const Tabs = () => (
  <div style={{ display: 'flex', gap: 22, fontSize: 14, fontWeight: 700 }}>
    <span style={{ color: gold, paddingBottom: 4, borderBottom: `2px solid ${gold}` }}>Tonight</span>
    <span style={{ color: dusk, paddingBottom: 4 }}>Yesterday</span>
  </div>
)

const Line = ({ rank, name, rings, you = false, faint = false }: { rank: number | string; name: string; rings: number; you?: boolean; faint?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', color: you ? gold : faint ? dusk : 'var(--ink)' }}>
    <span style={{ width: 44, font: `400 ${you ? 22 : 18}px ${serif}`, color: you || (typeof rank === 'number' && rank <= 3) ? gold : dusk }}>{rank}</span>
    <span style={{ flex: 1, fontSize: 15, fontWeight: you ? 700 : 400 }}>{name}</span>
    <span style={{ font: `400 ${you ? 22 : 18}px ${serif}` }}>{rings}</span>
  </div>
)

/** A · Floating list: the board is words over the street, like the end screen. */
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

/** B · Lanterns: the top three hang as parols with their names; the rest is a short list. */
function DeskLanterns() {
  const top = [
    { name: 'Tala', rings: 128, x: 70, y: 64, r: 17, color: night.palette[2] },
    { name: 'Liwayway', rings: 142, x: 210, y: 44, r: 24, color: night.palette[3] },
    { name: 'bituin88', rings: 117, x: 350, y: 72, r: 15, color: night.palette[1] },
  ]
  return (
    <DeskBack>
      <section style={{ position: 'absolute', left: DW * 0.55, top: 176, width: 420, display: 'flex', flexDirection: 'column', gap: 8, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Back />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
          <Eyebrow>Tonight’s board · {night.name}</Eyebrow>
          <Tabs />
        </div>
        <div style={{ position: 'relative', height: 172 }}>
          <svg width={420} height={120} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden="true">
            <path d="M0 8Q210 40 420 8" stroke="#5c5470" strokeWidth="1" fill="none" />
            {top.map((p) => (
              <MiniParol key={p.name} x={p.x} y={p.y} r={p.r} color={p.color} lit string={p.y - p.r * 1.25 - 14} />
            ))}
          </svg>
          {top.map((p, i) => (
            <div key={p.name} style={{ position: 'absolute', left: p.x - 60, top: p.y + p.r * 2.9 + 4, width: 120, textAlign: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: gold, fontFamily: serif, marginRight: 6 }}>{[2, 1, 3][i]}</span>
                {p.name}
              </Text>
              <Text style={{ font: `400 20px ${serif}` }}>{p.rings}</Text>
            </div>
          ))}
        </div>
        <div>
          {TONIGHT.slice(3, 8).map(([name, rings], i) => (
            <Line key={name} rank={i + 4} name={name} rings={rings} />
          ))}
          <Line rank={312} name="You · Bituing Gabi" rings={52} you />
        </div>
        <Text style={{ fontSize: 12, color: dusk }}>4,120 lit tonight’s star · closes at midnight, Manila</Text>
      </section>
    </DeskBack>
  )
}

/** C · Around you: the top three in one line, then the players just above and below you, and who to pass. */
function DeskAround() {
  const near: [number, string, number][] = [
    [309, 'Kai', 55],
    [310, 'Marisol', 54],
    [311, 'Rafa', 53],
    [312, 'You · Bituing Gabi', 52],
    [313, 'Lumen', 52],
    [314, 'Datu', 51],
  ]
  return (
    <DeskBack>
      <section style={{ position: 'absolute', left: DW * 0.55, top: 176, width: 420, display: 'flex', flexDirection: 'column', gap: 10, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Back />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
          <Eyebrow>Tonight’s board · {night.name}</Eyebrow>
          <Tabs />
        </div>
        <Text style={{ fontSize: 14, color: cream }}>
          <span style={{ color: gold, fontFamily: serif }}>1</span> Liwayway <Num size={15}>142</Num>
          <span style={{ color: dusk, margin: '0 8px' }}>·</span>
          <span style={{ color: gold, fontFamily: serif }}>2</span> Tala <Num size={15}>128</Num>
          <span style={{ color: dusk, margin: '0 8px' }}>·</span>
          <span style={{ color: gold, fontFamily: serif }}>3</span> bituin88 <Num size={15}>117</Num>
        </Text>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 14 }}>
          <Text style={{ font: `400 96px/0.9 ${serif}`, color: gold }}>#312</Text>
          <Text style={{ fontSize: 15, color: cream }}>of 4,120</Text>
        </div>
        <Text style={{ fontSize: 15, color: cream }}>
          <b style={{ color: gold }}>4 more rings</b> and you pass Kai
        </Text>
        <div style={{ marginTop: 6 }}>
          {near.map(([rank, name, rings]) => (
            <Line key={rank} rank={rank} name={name} rings={rings} you={rank === 312} faint={rank !== 312} />
          ))}
        </div>
        <Text style={{ fontSize: 12, color: dusk }}>Closes at midnight, Manila</Text>
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
  { id: 'desk-board', label: 'Desktop · the board in the words’ place', View: DeskBoard, desk: true },
  { id: 'desk-float', label: 'A · Floating list', View: DeskFloat, desk: true },
  { id: 'desk-lanterns', label: 'B · Lanterns for the top three', View: DeskLanterns, desk: true },
  { id: 'desk-around', label: 'C · Around you', View: DeskAround, desk: true },
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
