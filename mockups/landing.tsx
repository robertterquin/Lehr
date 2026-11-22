// Landing page mockups (development only). ?v=a|b|c|d picks a direction; it adapts to phone and desktop.
import { StrictMode, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import '../src/index.css'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Panorama } from '../src/draw/panorama.tsx'
import { Star } from '../src/draw/star.tsx'

const night = NIGHTS[6] // Sunday: Simbahan, as in the screenshot
const PREVIEW = Array.from({ length: 12 }, () => 0)
const DATE = 'Sunday 22 November'
const BEST = 52
const serif = 'var(--font-display)'
const GOLD = '#ffd27a'

function useSize() {
  const read = () => ({ w: window.innerWidth || 390, h: window.innerHeight || 844 })
  const [size, setSize] = useState(read)
  useEffect(() => {
    const update = () => setSize(read())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

const Icons = () => (
  <div className="buttons">
    <button type="button" className="icon-button" aria-label="Sound">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8v4h3l4 3V5L6 8Z" />
        <path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />
      </svg>
    </button>
    <button type="button" className="icon-button" aria-label="Settings">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="10" cy="10" r="2.6" />
        <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6" />
      </svg>
    </button>
  </div>
)

const Bar = ({ wordmark = true }: { wordmark?: boolean }) => (
  <header style={{ position: 'absolute', zIndex: 2, top: 0, left: 0, right: 0, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontFamily: serif, fontSize: 26, lineHeight: 1, visibility: wordmark ? 'visible' : 'hidden' }}>Parol</span>
    <Icons />
  </header>
)

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd style={{ font: '600 12px var(--font-ui)', padding: '3px 9px', borderRadius: 6, border: '1px solid #4a4166', borderBottomWidth: 3, color: 'var(--ink)' }}>{children}</kbd>
)

const Eyebrow = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ font: '700 12px/1.3 var(--font-ui)', letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, ...style }}>{children}</span>
)

/** The star hanging from a wire strung across the street. */
function HungStar({ w, size, top, dim = true }: { w: number; size: number; top: number; dim?: boolean }) {
  const cx = w / 2
  return (
    <>
      <svg width={w} height={top + 40} style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
        <path d={`M0 ${top * 0.25}Q${cx} ${top * 0.95} ${w} ${top * 0.25}`} stroke="#4a4166" strokeWidth="1.5" fill="none" />
        <path d={`M${cx} ${top * 0.6}V${top + size * 0.12}`} stroke="#4a4166" strokeWidth="1.5" />
      </svg>
      <div style={{ position: 'absolute', left: cx - size / 2, top }}>
        <div style={{ position: 'absolute', left: -size * 0.25, top: -size * 0.15, width: size * 1.5, height: size * 1.1, background: 'radial-gradient(closest-side, rgba(255,190,90,0.22), transparent)' }} />
        <Star size={size} locks={PREVIEW} palette={night.palette} dim={dim} />
      </div>
    </>
  )
}

/** A — Afterlight: the star hangs over one panoramic street; the words float at the bottom with one button. */
function A({ w, h, wide }: { w: number; h: number; wide: boolean }) {
  const size = wide ? Math.min(420, h * 0.5) : Math.min(290, w - 90)
  return (
    <>
      <Panorama night={night} stage={0} width={w} height={h} />
      <Bar />
      <HungStar w={w} size={size} top={wide ? 70 : 84} />
      <section style={{ position: 'absolute', left: '50%', bottom: wide ? 44 : 32, translate: '-50% 0', width: 'min(460px, calc(100% - 40px))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', textShadow: '0 2px 16px rgba(5,5,20,0.75)' }}>
        <div style={{ position: 'absolute', zIndex: -1, inset: '-48px -90px -36px', background: 'radial-gradient(closest-side, rgba(10,9,24,0.75), transparent)' }} />
        <Eyebrow>
          {night.araw} · {night.name}
        </Eyebrow>
        <h1 style={{ margin: 0, font: `400 ${wide ? 52 : 38}px/1.05 ${serif}` }}>Light tonight’s parol</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
          Best today <strong style={{ color: 'var(--ink)' }}>{BEST} rings</strong>
        </p>
        <button type="button" className="primary" style={{ width: 'auto', minWidth: 220, borderRadius: 16, padding: '0 24px', marginTop: 6 }}>
          Light the first ring
        </button>
        {wide && (
          <span style={{ fontSize: 13, color: 'var(--faint)' }}>
            or press <Kbd>Space</Kbd>
          </span>
        )}
      </section>
    </>
  )
}

/** B — Poster: tonight's place is the headline, set big beside the star on desktop, above it on a phone. */
function B({ w, h, wide }: { w: number; h: number; wide: boolean }) {
  const size = wide ? Math.min(470, h * 0.58) : Math.min(260, w - 120)
  const words = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: wide ? 16 : 8, alignItems: wide ? 'flex-start' : 'center', textAlign: wide ? 'left' : 'center' }}>
      <Eyebrow>Tonight · {DATE}</Eyebrow>
      <h1 style={{ margin: 0, font: `400 ${wide ? 104 : 54}px/0.95 ${serif}`, letterSpacing: '-0.02em' }}>{night.name}</h1>
      <p style={{ margin: 0, maxWidth: 360, fontSize: wide ? 17 : 14, lineHeight: 1.5, color: 'var(--muted)' }}>{night.blurb}.</p>
      {wide && <div style={{ width: 56, height: 2, background: GOLD, opacity: 0.7, margin: '8px 0' }} />}
      {wide && (
        <p style={{ margin: 0, maxWidth: 360, fontSize: 15, lineHeight: 1.5 }}>
          Lock each spinning ring onto the one inside it. Everyone in the Philippines lights the same star tonight.
        </p>
      )}
    </div>
  )
  const action = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexDirection: wide ? 'row' : 'column', marginTop: wide ? 28 : 0 }}>
      <button type="button" className="primary" style={{ width: wide ? 'auto' : 'min(100%, 320px)', minWidth: 220, borderRadius: 16, padding: '0 26px' }}>
        Light the first ring
      </button>
      <span style={{ fontSize: 14, color: 'var(--muted)' }}>
        Best today <strong style={{ fontFamily: serif, fontSize: 20, color: 'var(--ink)', fontWeight: 400 }}>{BEST}</strong>
      </span>
    </div>
  )
  return (
    <>
      <Panorama night={night} stage={0} width={w} height={h} />
      <Bar />
      {wide ? (
        <>
          <div style={{ position: 'absolute', left: Math.max(48, (w - 1280) / 2 + 48), top: '20%', width: 520 }}>
            {words}
            {action}
          </div>
          <div style={{ position: 'absolute', right: Math.max(40, (w - 1280) / 2 + 80), top: h * 0.12 }}>
            <div style={{ position: 'absolute', inset: '-10% -20%', background: 'radial-gradient(closest-side, rgba(255,190,90,0.25), transparent)' }} />
            <Star size={size} locks={PREVIEW} palette={night.palette} />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 20, right: 20, top: 84 }}>{words}</div>
          <div style={{ position: 'absolute', left: (w - size) / 2, top: 250 }}>
            <Star size={size} locks={PREVIEW} palette={night.palette} />
          </div>
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 30, display: 'flex', justifyContent: 'center' }}>{action}</div>
        </>
      )}
    </>
  )
}

/** C — The star is the button: no title, no button; tap the star itself. The corners carry the rest. */
function C({ w, h, wide }: { w: number; h: number; wide: boolean }) {
  const size = wide ? Math.min(460, h * 0.56) : Math.min(300, w - 70)
  const ringTop = wide ? h * 0.1 : 110
  return (
    <>
      <style>{`@keyframes breathe { 0%,100% { opacity: .35; scale: .96 } 50% { opacity: .9; scale: 1.02 } }`}</style>
      <Panorama night={night} stage={0} width={w} height={h} />
      <Bar />
      <button type="button" aria-label="Light the first ring" style={{ position: 'absolute', left: (w - size) / 2, top: ringTop, width: size, height: size, border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
        <span style={{ position: 'absolute', inset: '-6%', borderRadius: '50%', border: `1.5px solid ${GOLD}`, animation: 'breathe 2.4s ease-in-out infinite', boxShadow: '0 0 40px rgba(255,210,122,0.35)' }} />
        <span style={{ position: 'absolute', left: 0, top: 0 }}>
          <Star size={size} locks={PREVIEW} palette={night.palette} dim />
        </span>
      </button>
      <p style={{ position: 'absolute', left: 0, right: 0, top: ringTop + size * 1.08, margin: 0, textAlign: 'center' }}>
        <Eyebrow>{wide ? 'Click the star or press Space' : 'Tap the star to light it'}</Eyebrow>
      </p>
      <div style={{ position: 'absolute', left: 20, bottom: 22, display: 'flex', flexDirection: 'column', gap: 2, textShadow: '0 2px 12px #0a0918' }}>
        <span style={{ fontFamily: serif, fontSize: 22 }}>{night.name}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{DATE}</span>
      </div>
      <div style={{ position: 'absolute', right: 20, bottom: 22, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, textShadow: '0 2px 12px #0a0918' }}>
        <span style={{ fontFamily: serif, fontSize: 22 }}>{BEST}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>best today</span>
      </div>
    </>
  )
}

/** D — Capiz window: the star seen through a bahay na bato window, shutters of capiz shell thrown open. */
function D({ w, h, wide }: { w: number; h: number; wide: boolean }) {
  const ww = wide ? Math.min(520, h * 0.62) : Math.min(310, w - 70)
  const wh = ww * 1.12
  const left = (w - ww) / 2
  const top = wide ? 76 : 82
  const shutter = ww * 0.34
  const pane = (x: number, flip: boolean) => {
    const cols = 3
    const rows = 7
    const cw = shutter / cols
    const rh = (wh * 0.86) / rows
    return (
      <g transform={`translate(${x} ${wh * 0.12}) ${flip ? `translate(${shutter} 0) scale(-1 1)` : ''} skewY(${flip ? -6 : 6})`}>
        <rect width={shutter} height={wh * 0.86} fill="#3a2414" />
        {Array.from({ length: cols * rows }, (_, i) => (
          <rect key={i} x={(i % cols) * cw + 3} y={Math.floor(i / cols) * rh + 3} width={cw - 6} height={rh - 6} fill="#f4ecd8" opacity={0.28 + ((i * 7) % 5) * 0.05} />
        ))}
      </g>
    )
  }
  return (
    <>
      <Panorama night={night} stage={0} width={w} height={h} />
      <Bar />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,24,0.35)' }} />
      <svg width={w} height={top + wh + 30} style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
        <defs>
          <clipPath id="arch">
            <path d={`M${left} ${top + wh}V${top + ww / 2}A${ww / 2} ${ww / 2} 0 0 1 ${left + ww} ${top + ww / 2}V${top + wh}Z`} />
          </clipPath>
          <radialGradient id="inside">
            <stop offset="0" stopColor="#3a2a66" />
            <stop offset="1" stopColor="#140f30" />
          </radialGradient>
        </defs>
        <path d={`M${left} ${top + wh}V${top + ww / 2}A${ww / 2} ${ww / 2} 0 0 1 ${left + ww} ${top + ww / 2}V${top + wh}Z`} fill="url(#inside)" />
        {pane(left - shutter - 6, false)}
        {pane(left + ww + 6, true)}
        <path d={`M${left} ${top + wh}V${top + ww / 2}A${ww / 2} ${ww / 2} 0 0 1 ${left + ww} ${top + ww / 2}V${top + wh}`} fill="none" stroke="#5b3a1c" strokeWidth="10" />
        <path d={`M${left - 8} ${top + wh}V${top + ww / 2}A${ww / 2 + 8} ${ww / 2 + 8} 0 0 1 ${left + ww + 8} ${top + ww / 2}V${top + wh}`} fill="none" stroke="#2a1a0e" strokeWidth="4" />
        <rect x={left - 30} y={top + wh} width={ww + 60} height="14" rx="3" fill="#5b3a1c" />
      </svg>
      <div style={{ position: 'absolute', left: left + ww * 0.12, top: top + ww * 0.1, clipPath: 'none' }}>
        <Star size={ww * 0.76} locks={PREVIEW} palette={night.palette} />
      </div>
      <section style={{ position: 'absolute', left: 0, right: 0, top: top + wh + 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: '0 20px' }}>
        <Eyebrow>
          {night.araw} · {night.name}
        </Eyebrow>
        <h1 style={{ margin: 0, font: `400 ${wide ? 40 : 30}px/1.1 ${serif}` }}>Tonight’s star is waiting</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="primary" style={{ width: 'auto', minWidth: 220, borderRadius: 16, padding: '0 24px' }}>
            Light the first ring
          </button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Best today · {BEST}</span>
        </div>
      </section>
    </>
  )
}

const VARIANTS = { a: A, b: B, c: C, d: D }

function Mockup() {
  const { w, h } = useSize()
  const wide = w >= 960 && h >= 600
  const key = (new URLSearchParams(location.search).get('v') ?? 'a') as keyof typeof VARIANTS
  const View = VARIANTS[key] ?? A
  return (
    <main style={{ position: 'relative', width: '100vw', height: '100svh', overflow: 'hidden', background: 'radial-gradient(120% 70% at 50% 28%, #2a1e55 0%, #140f30 55%, #0a0918 100%)', color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>
      <View w={w} h={h} wide={wide} />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Mockup />
  </StrictMode>,
)
