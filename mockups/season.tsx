// Reasons to come back, as mockups (development only): the Simbang Gabi novena (Dec 16–24) with a golden
// parol on Christmas Eve, an album of every star you built, a rest night that keeps a streak, last night's
// rank on the landing, and small achievements. In Filipino, the game's default. ?s=<id> shows one at 390×844.
import { StrictMode, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Star } from '../src/draw/star.tsx'
import { Garland } from '../src/ui/parts.tsx'
import { Glints } from '../src/ui/screens.tsx'
import { Button, Eyebrow, GEAR, Ground, Icon, PREVIEW, RUN, SOUND, StarAt, Text, TopBar, Words, cream, gold, night, serif } from './kit.tsx'

const W = 390
const H = 844
const dusk = '#c4b6a8'

const Brand = () => <span style={{ fontFamily: serif, fontSize: 24 }}>Parol</span>
const Icons = () => (
  <div style={{ display: 'flex' }}>
    <Icon path={SOUND} />
    <Icon path={GEAR} />
  </div>
)
const GarlandAt = ({ lit, toGo }: { lit: number; toGo?: number }) => (
  <div style={{ position: 'absolute', top: 60, left: 16 }}>
    <Garland width={W - 32} lit={lit} palette={night.palette} toGo={toGo} />
  </div>
)
const LinkText = ({ children }: { children: ReactNode }) => <span style={{ color: gold, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(255,207,122,0.4)' }}>{children}</span>
const Num = ({ children, size = 17, color = '#fff' }: { children: ReactNode; size?: number; color?: string }) => <span style={{ fontFamily: serif, fontSize: size, color }}>{children}</span>
const Dot = () => <span style={{ color: dusk, margin: '0 7px' }}>·</span>

/* ── The small star glyph and the night rows ─────────────────────────────────────────────────────────── */

const STAR = 'M8 1.2l1.9 4.2 4.6.5-3.4 3.1 1 4.5L8 11.2 3.9 13.5l1-4.5L1.5 5.9l4.6-.5z'
type Mark = 'lit' | 'gold' | 'tonight' | 'missed' | 'later' | 'rest'

function Glyph({ mark, size = 16 }: { mark: Mark; size?: number }) {
  if (mark === 'rest')
    // A rest night: a crescent moon, so the streak reads as kept, not broken.
    return (
      <svg width={size} height={size} viewBox="0 0 16 16">
        <path d="M10.8 2.2a6 6 0 1 0 3 9.6 5 5 0 1 1-3-9.6z" fill="rgba(255,207,122,0.55)" />
      </svg>
    )
  const style: Record<Exclude<Mark, 'rest'>, CSSProperties> = {
    lit: { fill: gold, stroke: gold },
    gold: { fill: '#fff3d0', stroke: '#fff3d0', filter: 'drop-shadow(0 0 4px rgba(255,214,130,0.95))' },
    tonight: { fill: 'none', stroke: gold, strokeDasharray: '2 1.6' },
    missed: { fill: 'none', stroke: 'rgba(196,182,168,0.75)' },
    later: { fill: 'none', stroke: 'rgba(196,182,168,0.3)' },
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d={STAR} strokeWidth={1.2} strokeLinejoin="round" style={style[mark]} />
    </svg>
  )
}

/** A row of nights: a glyph over a label, the way the landing's week row draws them. */
function Nights({ marks, labels, today, note }: { marks: Mark[]; labels: string[]; today: number; note: ReactNode }) {
  return (
    <div style={{ position: 'relative', isolation: 'isolate', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <div style={{ position: 'absolute', inset: '-16px -48px -12px', zIndex: -1, background: 'radial-gradient(closest-side, rgba(16,8,18,0.7), transparent)' }} />
      <div style={{ display: 'flex', gap: marks.length > 7 ? 10 : 14 }}>
        {marks.map((mark, i) => (
          <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, font: '700 10px var(--font-ui)', color: i === today ? gold : dusk }}>
            <Glyph mark={mark} />
            {labels[i]}
          </span>
        ))}
      </div>
      <Text style={{ fontSize: 12, color: cream, maxWidth: 260, textWrap: 'balance' }}>{note}</Text>
    </div>
  )
}

const NOVENA_DAYS = ['16', '17', '18', '19', '20', '21', '22', '23', '24']
const novena = (lit: number, tonight = true): Mark[] => NOVENA_DAYS.map((_, i) => (i < lit ? 'lit' : i === lit && tonight ? 'tonight' : 'later'))

/** Stars "you built" on other nights: different errors, so each one looks different, as the album would. */
const STARS: { locks: number[]; palette: number }[] = [
  { locks: Array.from({ length: 18 }, (_, i) => (i % 5 === 2 ? 5 : 0)), palette: 1 },
  { locks: Array.from({ length: 31 }, (_, i) => (i % 3 === 1 ? 3 : i % 7 === 0 ? -6 : 0)), palette: 2 },
  { locks: Array.from({ length: 12 }, (_, i) => (i % 4 === 3 ? -4 : 0)), palette: 3 },
  { locks: Array.from({ length: 44 }, (_, i) => (i % 6 === 2 ? 4 : 0)), palette: 4 },
  { locks: RUN, palette: 5 },
]

/* ── 1 · The landing during Simbang Gabi, with last night's rank ─────────────────────────────────────── */

function Landing() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <GarlandAt lit={0} />
      <StarAt x={W / 2} size={200} top={150} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 70, gap: 9 }}>
        <Eyebrow>Huwebes · ika-3 gabi ng Simbang Gabi</Eyebrow>
        <Text style={{ font: `400 56px/0.95 ${serif}` }}>Intramuros</Text>
        <Text style={{ fontSize: 14, color: cream }}>Sindihan ang sampung parol sa kalye ngayong gabi.</Text>
        <Button>
          Sindihan ang unang singsing <span aria-hidden="true">→</span>
        </Button>
        {/* Before tonight's first run, the line is last night's result: a reason to open the app at all. */}
        <Text style={{ fontSize: 13, color: cream, marginTop: 2 }}>
          Kagabi <Num color={gold}>#48</Num> sa 3,120 <Dot />
          <LinkText>Tingnan ang talaan</LinkText>
        </Text>
        <Nights
          marks={novena(2)}
          labels={NOVENA_DAYS}
          today={2}
          note={
            <>
              Simbang Gabi · 2 sa 9 <Dot />
              <LinkText>Album</LinkText>
            </>
          }
        />
      </Words>
    </>
  )
}

/* ── 2 · The end of tonight's run: the night joins the album, and an achievement ──────────────────────── */

function End() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={4} dim={0.35} />
      <TopBar left={<span />} right={<Icons />} />
      <GarlandAt lit={4} toGo={8} />
      <StarAt x={W / 2} size={210} top={150} locks={STARS[3].locks} glow="rgba(255,170,80,0.3)" />
      <Words style={{ bottom: 30, gap: 8 }}>
        <Eyebrow>Nagpapahinga ang bituin</Eyebrow>
        <Text style={{ font: `400 120px/0.9 ${serif}`, color: gold }}>44</Text>
        <Text style={{ fontSize: 15, color: cream }}>
          singsing · 31 sakto · <span style={{ color: gold }}>bagong pinakamataas ngayon</span>
        </Text>
        {/* The night is kept: the one line that says tonight counted. */}
        <Text style={{ marginTop: 6, fontSize: 14, color: gold, fontWeight: 700 }}>Ika-3 gabi ng Simbang Gabi · naidagdag sa album</Text>
        <Nights marks={novena(3, false)} labels={NOVENA_DAYS} today={2} note="6 na gabi pa bago ang gintong parol" />
        {/* An achievement shows once, as one gold line, then lives in the album. */}
        <Text style={{ marginTop: 8, fontSize: 13, color: cream }}>
          <Glyph mark="gold" size={13} /> Bagong tagumpay: <b style={{ color: gold }}>10 saktong sunod-sunod</b>
        </Text>
        <Button style={{ marginTop: 10 }}>Sindihan muli</Button>
      </Words>
    </>
  )
}

/* ── 3 · Christmas Eve: all nine nights, the golden parol ─────────────────────────────────────────────── */

function Eve() {
  const size = 170
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={9} dim={0.2} />
      <TopBar left={<span />} right={<Icons />} />
      <div style={{ position: 'absolute', left: W / 2 - 130, top: 110, width: 260, height: 260 }}>
        <Glints size={260} />
        <div style={{ position: 'absolute', left: 130 - size / 2, top: 130 - size / 2 + 8, filter: 'brightness(2.9) saturate(0.85) drop-shadow(0 0 10px rgba(255,230,160,0.95))' }}>
          <Star size={size} locks={STARS[1].locks} palette={NIGHTS[0].palette} />
        </div>
      </div>
      <Words style={{ bottom: 40, gap: 10 }}>
        <Eyebrow>Bisperas ng Pasko · 24 Dis</Eyebrow>
        <Text style={{ font: `400 40px/1.05 ${serif}` }}>Nabuo mo ang Simbang Gabi</Text>
        <Text style={{ fontSize: 14, lineHeight: 1.5, color: cream, maxWidth: 300 }}>Siyam na gabi, siyam na parol. Ang gintong parol na ito ang pabalat ng iyong album.</Text>
        <Nights marks={NOVENA_DAYS.map(() => 'gold')} labels={NOVENA_DAYS} today={8} note="9 sa 9 · Maligayang Pasko" />
        <Button style={{ marginTop: 14 }}>Buksan ang album</Button>
        <Text style={{ fontSize: 14, fontWeight: 700, color: gold }}>Ibahagi ang gintong parol</Text>
      </Words>
    </>
  )
}

/* ── 4 · The album: every night's star, the season and the achievements ───────────────────────────────── */

const SLOTS = [
  { day: '16', place: 'Barangay', rings: 18 },
  { day: '17', place: 'San Fernando', rings: 31 },
  { day: '18', place: 'Intramuros', rings: 44 },
]

function Album() {
  const cell = (W - 48 - 20) / 3
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={4} dim={0.72} />
      <section style={{ position: 'absolute', left: 24, right: 24, top: 22, display: 'flex', flexDirection: 'column', gap: 10, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Text style={{ fontSize: 14, fontWeight: 700, color: cream }}>← Ang bituin ngayong gabi</Text>
        <div style={{ marginTop: 14 }}>
          <Eyebrow>Album · Simbang Gabi 2026</Eyebrow>
          <Text style={{ font: `400 38px/1.1 ${serif}` }}>Ang iyong mga parol</Text>
          <Text style={{ fontSize: 13, color: cream, marginTop: 4 }}>3 sa 9 na gabi · ang ika-9 ay magiging gintong parol</Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 6 }}>
          {NOVENA_DAYS.map((day, i) => {
            const slot = SLOTS[i]
            return (
              <div key={day} style={{ height: cell + 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                {slot ? (
                  <div style={{ width: cell, height: cell, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ marginTop: -4 }}>
                      <Star size={cell * 0.95} locks={STARS[i].locks} palette={NIGHTS[STARS[i].palette].palette} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: cell * 0.62, height: cell * 0.62, margin: cell * 0.19, borderRadius: '50%', border: `1px dashed ${i === 3 ? gold : 'rgba(196,182,168,0.35)'}` }} />
                )}
                <Text style={{ font: '700 11px var(--font-ui)', color: slot ? cream : dusk }}>
                  {day} Dis{slot && <span style={{ fontWeight: 400, color: gold }}> · {slot.rings}</span>}
                </Text>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 8 }}>
          <Eyebrow>Mga tagumpay · 3 sa 12</Eyebrow>
          {[
            ['10 saktong sunod-sunod', true],
            ['Unang sinag nang walang sablay', true],
            ['Pitong lugar sa isang linggo', true],
            ['100 singsing', false],
          ].map(([label, got]) => (
            <Text key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 14, color: got ? cream : dusk }}>
              <Glyph mark={got ? 'gold' : 'later'} size={14} />
              {label}
            </Text>
          ))}
        </div>
      </section>
    </>
  )
}

/* ── 5 · One parol from the album ──────────────────────────────────────────────────────────────────────── */

function Parol() {
  return (
    <>
      <Ground w={W} h={H} wide={false} stage={4} dim={0.55} />
      <Text style={{ position: 'absolute', left: 24, top: 22, fontSize: 14, fontWeight: 700, color: cream }}>← Album</Text>
      <StarAt x={W / 2} size={250} top={110} locks={STARS[1].locks} glow="rgba(255,170,80,0.45)" />
      <Words style={{ bottom: 44, gap: 9 }}>
        <Eyebrow>Ika-2 gabi · Miyerkules, 17 Dis</Eyebrow>
        <Text style={{ font: `400 52px/1 ${serif}` }}>San Fernando</Text>
        <Text style={{ fontSize: 15, color: cream }}>
          <Num>31</Num> singsing <Dot /> 22 sakto <Dot /> <Num color={gold}>#96</Num> sa 2,870
        </Text>
        <Button style={{ marginTop: 14 }}>Ibahagi ang parol na ito</Button>
      </Words>
    </>
  )
}

/* ── 6 · A rest night: one missed night a week keeps the streak ────────────────────────────────────────── */

function Rest() {
  return (
    <>
      <Ground w={W} h={H} wide={false} />
      <TopBar left={<Brand />} right={<Icons />} />
      <GarlandAt lit={0} />
      <StarAt x={W / 2} size={200} top={150} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
      <Words style={{ bottom: 96, gap: 9 }}>
        <Eyebrow>Biyernes · ang bituin ngayong gabi</Eyebrow>
        <Text style={{ font: `400 56px/0.95 ${serif}` }}>Rooftop</Text>
        <Text style={{ fontSize: 14, color: cream }}>Sindihan ang sampung parol sa kalye ngayong gabi.</Text>
        <Button>
          Sindihan ang unang singsing <span aria-hidden="true">→</span>
        </Button>
        <Text style={{ fontSize: 13, color: cream, marginTop: 2 }}>
          Kagabi <Num color={gold}>#212</Num> sa 2,940 <Dot />
          <LinkText>Tingnan ang talaan</LinkText>
        </Text>
        <Nights
          marks={['lit', 'lit', 'rest', 'lit', 'tonight', 'later', 'later']}
          labels={['L', 'M', 'M', 'H', 'B', 'S', 'L']}
          today={4}
          note="4 gabing sunod-sunod · nagpahinga ka noong Miyerkules"
        />
      </Words>
    </>
  )
}

const SCREENS: { id: string; label: string; View: () => ReactNode }[] = [
  { id: 'landing', label: '1 · Simbang Gabi on the landing, with Kagabi', View: Landing },
  { id: 'end', label: '2 · The night joins the album · an achievement', View: End },
  { id: 'eve', label: '3 · Christmas Eve · the golden parol', View: Eve },
  { id: 'album', label: '4 · The album', View: Album },
  { id: 'parol', label: '5 · One parol', View: Parol },
  { id: 'rest', label: '6 · A rest night keeps the streak', View: Rest },
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
      <div style={{ padding: 18, display: 'flex', flexWrap: 'wrap', gap: 14, width: 1024, fontFamily: 'var(--font-ui)', color: '#cbbfae' }}>
        {SCREENS.map((s) => (
          <figure key={s.id} style={{ margin: 0 }}>
            <div style={{ width: W * scale, height: H * scale, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                <Phone View={s.View} />
              </div>
            </div>
            <figcaption style={{ fontSize: 12, marginTop: 6, width: W * scale }}>{s.label}</figcaption>
          </figure>
        ))}
      </div>
    )}
  </StrictMode>,
)
