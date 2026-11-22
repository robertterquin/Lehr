// Redesign mockups (development only), phone size: ?d=r1|r2|r3 picks the direction, ?s=landing|play|end the screen.
import { StrictMode, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import '../src/index.css'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Star } from '../src/draw/star.tsx'

const night = NIGHTS[6]
const RUN = Array.from({ length: 24 }, (_, i) => (i % 7 === 3 ? 4 : i === 20 ? -6 : 0))
const PREVIEW = Array.from({ length: 12 }, () => 0)
const WIDTH = 26 // point width after RUN, for the gauges
const serif = 'var(--font-display)'
const W = 390
const H = 844

const params = new URLSearchParams(location.search)
const direction = params.get('d') ?? 'r1'
const screen = params.get('s') ?? 'landing'

/** Turns the spinning ring a little past alignment, as a still. */
const turn = (el: SVGSVGElement | null) => el?.style.setProperty('transform', 'rotate(14deg)')

function StarAt({ size, top, locks, spinning = false, glow }: { size: number; top: number; locks: number[]; spinning?: boolean; glow?: string }) {
  return (
    <div style={{ position: 'absolute', left: (W - size) / 2, top }}>
      {glow && <div style={{ position: 'absolute', left: -size * 0.35, top: -size * 0.3, width: size * 1.7, height: size * 1.6, background: `radial-gradient(closest-side, ${glow}, transparent)` }} />}
      <Star size={size} locks={locks} palette={night.palette} spinning={spinning} spinRef={turn} />
    </div>
  )
}

/** Point width as an arc around the star: full at 36°, a red notch at the 8° minimum. */
function ArcGauge({ size, top, color, track, width = 2 }: { size: number; top: number; color: string; track: string; width?: number }) {
  const r = size * 0.5
  const c = size / 2
  const sweep = 300
  const at = (deg: number) => {
    const a = ((deg - 240) * Math.PI) / 180
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const arc = (to: number) => {
    const [x0, y0] = at(0)
    const [x1, y1] = at(to)
    return `M${x0} ${y0}A${r} ${r} 0 ${to > 180 ? 1 : 0} 1 ${x1} ${y1}`
  }
  const [nx, ny] = at((8 / 36) * sweep)
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: (W - size) / 2, top }} aria-hidden="true">
      <path d={arc(sweep)} stroke={track} strokeWidth={width} fill="none" strokeLinecap="round" />
      <path d={arc((WIDTH / 36) * sweep)} stroke={color} strokeWidth={width + 1} fill="none" strokeLinecap="round" />
      <circle cx={nx} cy={ny} r={3} fill="#ff8a7a" />
    </svg>
  )
}

const Text = ({ style, children }: { style?: CSSProperties; children: ReactNode }) => <p style={{ margin: 0, ...style }}>{children}</p>

const Icon = ({ path, style }: { path: ReactNode; style?: CSSProperties }) => (
  <span style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
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

/* ── R1 · Lantern glow: a warm night, a blooming star, the gauge wrapped around the star ───────── */

function R1() {
  const ground = (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0f26 0%, #121a3d 42%, #2b1a3a 72%, #5a2f22 100%)' }} />
      <div style={{ position: 'absolute', left: -100, right: -100, bottom: -60, height: 380, background: 'radial-gradient(closest-side, rgba(255,150,70,0.45), transparent)' }} />
      <night.Scene stage={2} moon={false} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 70%, rgba(40,15,10,0.35))' }} />
    </>
  )
  const gold = '#ffcf7a'
  if (screen === 'landing')
    return (
      <>
        {ground}
        <header style={{ position: 'absolute', top: 18, left: 22, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: serif, fontSize: 24 }}>Parol</span>
          <div style={{ display: 'flex' }}>
            <Icon path={SOUND} />
            <Icon path={GEAR} />
          </div>
        </header>
        <StarAt size={300} top={86} locks={PREVIEW} glow="rgba(255,170,80,0.5)" />
        <section style={{ position: 'absolute', left: 24, right: 24, bottom: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', textShadow: '0 2px 18px rgba(20,8,5,0.8)' }}>
          <Text style={{ font: '700 11px var(--font-ui)', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold }}>
            {night.araw} · tonight
          </Text>
          <Text style={{ font: `400 60px/0.95 ${serif}` }}>{night.name}</Text>
          <Text style={{ fontSize: 14, lineHeight: 1.5, color: '#e8d9c8', maxWidth: 300 }}>{night.blurb}.</Text>
          <span style={{ marginTop: 12, height: 56, padding: '0 30px', borderRadius: 999, background: `linear-gradient(180deg, #ffe2a6, #f6a743)`, color: '#2a1606', font: '700 16px var(--font-ui)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 40px rgba(255,160,70,0.5)' }}>
            Light the first ring <span aria-hidden="true">→</span>
          </span>
          <Text style={{ fontSize: 13, color: '#e8d9c8' }}>
            Best today <span style={{ fontFamily: serif, fontSize: 17, color: '#fff' }}>52</span>
          </Text>
        </section>
      </>
    )
  if (screen === 'play')
    return (
      <>
        {ground}
        <header style={{ position: 'absolute', top: 14, left: 22, right: 14, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Text style={{ font: `400 64px/1 ${serif}` }}>24</Text>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} style={{ width: 9, height: 9, rotate: '45deg', background: i < 3 ? gold : 'transparent', border: `1px solid ${i < 3 ? gold : '#6a5a7a'}` }} />
              ))}
            </div>
          </div>
          <Icon path={PAUSE} style={{ border: '1px solid rgba(255,255,255,0.2)' }} />
        </header>
        <StarAt size={300} top={150} locks={RUN} spinning glow="rgba(255,170,80,0.45)" />
        <ArcGauge size={372} top={114} color={gold} track="rgba(255,255,255,0.12)" />
        <Text style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', font: '700 11px var(--font-ui)', letterSpacing: '0.18em', color: '#e8d9c8' }}>26° · 1.6×</Text>
        <Text style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', font: `italic 400 34px ${serif}`, color: gold, textShadow: '0 0 24px rgba(255,190,90,0.7)' }}>Perfect</Text>
      </>
    )
  return (
    <>
      {ground}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,20,0.35)' }} />
      <StarAt size={230} top={110} locks={RUN} glow="rgba(255,170,80,0.3)" />
      <section style={{ position: 'absolute', left: 24, right: 24, bottom: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Text style={{ font: '700 11px var(--font-ui)', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold }}>The star rests</Text>
        <Text style={{ font: `400 120px/0.9 ${serif}` }}>24</Text>
        <Text style={{ fontSize: 15, color: '#e8d9c8' }}>
          rings · 19 perfect · <span style={{ color: gold }}>new best today</span>
        </Text>
        <span style={{ marginTop: 14, height: 56, padding: '0 30px', borderRadius: 999, background: 'linear-gradient(180deg, #ffe2a6, #f6a743)', color: '#2a1606', font: '700 16px var(--font-ui)', display: 'flex', alignItems: 'center', boxShadow: '0 10px 40px rgba(255,160,70,0.5)' }}>
          Light again
        </span>
      </section>
    </>
  )
}

/* ── R2 · Bokeh: the street out of focus behind a sharp star; light, thin type on glass ─────────── */

const BOKEH = Array.from({ length: 46 }, (_, i) => {
  const r = Math.sin(i * 12.9898) * 43758.5453
  const f = r - Math.floor(r)
  const g = (Math.sin(i * 78.233) * 12345.678) % 1
  const colors = ['#ffcf7a', '#ff8a5a', '#ff5a7a', '#7ac8ff', '#9affc0', '#ffe9b8']
  return { x: f * W, y: 470 + Math.abs(g) * 380, s: 18 + ((i * 37) % 70), c: colors[i % colors.length], o: 0.18 + ((i * 13) % 40) / 100 }
})

function R2() {
  const glass: CSSProperties = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(14px)' }
  const thin = (size: number, extra: CSSProperties = {}): CSSProperties => ({ font: `200 ${size}px/1 var(--font-ui)`, letterSpacing: '-0.02em', ...extra })
  const ground = (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 30%, #1b1f45 0%, #0b0c1e 60%, #05050d 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(5px)', opacity: 0.55 }}>
        <night.Scene stage={3} moon={false} />
      </div>
      {BOKEH.map((b, i) => (
        <span key={i} style={{ position: 'absolute', left: b.x - b.s / 2, top: b.y - b.s / 2, width: b.s, height: b.s, borderRadius: '50%', background: b.c, opacity: b.o, filter: `blur(${2 + (b.s % 9)}px)`, mixBlendMode: 'screen' }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,13,0.2), transparent 40%, rgba(5,5,13,0.5))' }} />
    </>
  )
  if (screen === 'landing')
    return (
      <>
        {ground}
        <header style={{ position: 'absolute', top: 20, left: 24, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: '600 13px var(--font-ui)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Parol</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Icon path={SOUND} style={glass} />
            <Icon path={GEAR} style={glass} />
          </div>
        </header>
        <StarAt size={290} top={110} locks={PREVIEW} glow="rgba(255,220,160,0.28)" />
        <section style={{ position: 'absolute', left: 24, right: 24, bottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <Text style={{ font: '500 11px var(--font-ui)', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Tonight</Text>
          <Text style={{ font: `400 64px/0.95 ${serif}` }}>{night.name}</Text>
          <Text style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', maxWidth: 280 }}>{night.blurb}.</Text>
          <span style={{ ...glass, marginTop: 10, height: 56, width: '100%', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 15px var(--font-ui)', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.92)', color: '#0b0c1e' }}>Light the first ring</span>
          <span style={{ ...glass, padding: '6px 14px', borderRadius: 999, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Best today · 52</span>
        </section>
      </>
    )
  if (screen === 'play')
    return (
      <>
        {ground}
        <header style={{ position: 'absolute', top: 18, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Icon path={SOUND} style={glass} />
          <div style={{ textAlign: 'center' }}>
            <Text style={thin(72)}>24</Text>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 10 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} style={{ width: 16, height: 2, borderRadius: 1, background: i < 3 ? '#ffe9b8' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
          <Icon path={PAUSE} style={glass} />
        </header>
        <StarAt size={300} top={170} locks={RUN} spinning glow="rgba(255,220,160,0.25)" />
        <ArcGauge size={372} top={134} color="#ffffff" track="rgba(255,255,255,0.1)" width={1.5} />
        <span style={{ ...glass, position: 'absolute', left: '50%', translate: '-50% 0', top: 620, padding: '8px 18px', borderRadius: 999, font: '600 12px var(--font-ui)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Perfect</span>
        <Text style={{ position: 'absolute', left: 0, right: 0, top: 672, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>26° · 1.6×</Text>
      </>
    )
  return (
    <>
      {ground}
      <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(3px)', background: 'rgba(5,5,13,0.35)' }} />
      <section style={{ position: 'absolute', left: 24, right: 24, top: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <Text style={{ font: '500 11px var(--font-ui)', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>The star rests</Text>
        <Text style={thin(150)}>24</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>rings · 19 perfect</Text>
        <span style={{ ...glass, padding: '6px 14px', borderRadius: 999, fontSize: 12, color: '#ffe9b8' }}>New best today</span>
      </section>
      <span style={{ position: 'absolute', left: 24, right: 24, bottom: 48, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 15px var(--font-ui)', background: 'rgba(255,255,255,0.92)', color: '#0b0c1e' }}>Light again</span>
    </>
  )
}

/* ── R3 · Capiz: shell-pearl panels in mahogany frames; the meter is a row of capiz chips ────────── */

const capiz: CSSProperties = {
  background:
    'repeating-linear-gradient(0deg, rgba(90,58,28,0.55) 0 2px, transparent 2px 26px), repeating-linear-gradient(90deg, rgba(90,58,28,0.55) 0 2px, transparent 2px 26px), linear-gradient(135deg, rgba(246,238,222,0.95), rgba(226,214,236,0.92) 45%, rgba(240,226,200,0.95))',
  border: '6px solid #5b3a1c',
  boxShadow: 'inset 0 0 0 2px #8a5a2c, 0 18px 40px rgba(0,0,0,0.45)',
  color: '#2a1606',
}

function Chips({ top }: { top: number }) {
  return (
    <div style={{ position: 'absolute', left: 28, right: 28, top, display: 'grid', gridTemplateColumns: 'repeat(36, 1fr)', gap: 2 }} aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <span key={i} style={{ height: 14, borderRadius: 2, background: i < WIDTH ? 'linear-gradient(180deg, #fff6e0, #e8d6b8)' : 'rgba(255,255,255,0.08)', boxShadow: i < WIDTH ? '0 0 6px rgba(255,220,150,0.5)' : 'none', outline: i === 7 ? '1px solid #ff8a7a' : 'none' }} />
      ))}
    </div>
  )
}

function R3() {
  const wood = '#5b3a1c'
  const button: CSSProperties = { height: 56, borderRadius: 10, background: `linear-gradient(180deg, #7a4e26, ${wood})`, border: '2px solid #2a1606', boxShadow: 'inset 0 0 0 2px #b0763c', color: '#ffe2a6', font: `400 20px ${serif}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  const ground = (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 28%, #2a1e55 0%, #140f30 55%, #0a0918 100%)' }} />
      <night.Scene stage={3} moon={false} />
    </>
  )
  if (screen === 'landing')
    return (
      <>
        {ground}
        <header style={{ position: 'absolute', top: 16, left: 20, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: serif, fontSize: 26 }}>Parol</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Icon path={SOUND} style={{ ...capiz, border: `3px solid ${wood}`, borderRadius: 10, width: 40, height: 40 }} />
            <Icon path={GEAR} style={{ ...capiz, border: `3px solid ${wood}`, borderRadius: 10, width: 40, height: 40 }} />
          </div>
        </header>
        <StarAt size={270} top={78} locks={PREVIEW} glow="rgba(255,190,90,0.35)" />
        <section style={{ ...capiz, position: 'absolute', left: 18, right: 18, bottom: 26, borderRadius: 18, padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
          <Text style={{ font: '700 11px var(--font-ui)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a5a2c' }}>{night.araw} · tonight</Text>
          <Text style={{ font: `400 46px/1 ${serif}` }}>{night.name}</Text>
          <Text style={{ fontSize: 13, lineHeight: 1.5, color: '#4a3020' }}>{night.blurb}.</Text>
          <span style={{ ...button, alignSelf: 'stretch', marginTop: 10 }}>Light the first ring</span>
          <Text style={{ fontSize: 12, color: '#6a4a2a', marginTop: 4 }}>Best today · 52 rings</Text>
        </section>
      </>
    )
  if (screen === 'play')
    return (
      <>
        {ground}
        <header style={{ ...capiz, position: 'absolute', top: 12, left: 12, right: 12, height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 16px' }}>
          <Text style={{ font: `400 36px/1 ${serif}` }}>24</Text>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: 3, border: '2px solid #8a5a2c', background: i < 3 ? 'radial-gradient(circle at 35% 35%, #fffbe8, #f2b632)' : 'rgba(90,58,28,0.15)' }} />
            ))}
          </div>
          <Icon path={PAUSE} style={{ color: '#2a1606' }} />
        </header>
        <StarAt size={320} top={110} locks={RUN} spinning glow="rgba(255,190,90,0.35)" />
        <Text style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', font: `400 34px ${serif}`, color: '#ffd27a', textShadow: '0 2px 16px rgba(5,5,20,0.8)' }}>Perfect</Text>
        <Chips top={624} />
        <Text style={{ position: 'absolute', left: 28, right: 28, top: 646, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
          <span>26° of 36°</span>
          <span>8° holds</span>
        </Text>
      </>
    )
  return (
    <>
      {ground}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,24,0.45)' }} />
      <StarAt size={220} top={90} locks={RUN} glow="rgba(255,190,90,0.3)" />
      <section style={{ ...capiz, position: 'absolute', left: 22, right: 22, bottom: 40, borderRadius: 20, padding: '22px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
        <Text style={{ font: '700 11px var(--font-ui)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a5a2c' }}>The star rests</Text>
        <Text style={{ font: `400 96px/0.95 ${serif}` }}>24</Text>
        <Text style={{ fontSize: 14, color: '#4a3020' }}>rings · 19 perfect</Text>
        <Text style={{ fontSize: 12, fontWeight: 700, color: '#a8452a' }}>New best today</Text>
        <span style={{ ...button, alignSelf: 'stretch', marginTop: 12 }}>Light again</span>
      </section>
    </>
  )
}

const DIRECTIONS = { r1: R1, r2: R2, r3: R3 }
const View = DIRECTIONS[direction as keyof typeof DIRECTIONS] ?? R1

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main style={{ position: 'relative', width: W, height: H, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
      <View />
    </main>
  </StrictMode>,
)
