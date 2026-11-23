// Shared pieces for the mockup pages (development only): the night backdrop, the star, the gauge and the type.
import type { CSSProperties, ReactNode } from 'react'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import '../src/index.css'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Panorama } from '../src/draw/panorama.tsx'
import { Star } from '../src/draw/star.tsx'
import type { Stage } from '../src/draw/street.tsx'

export const night = NIGHTS[6]
export const RUN = Array.from({ length: 24 }, (_, i) => (i % 7 === 3 ? 4 : i === 20 ? -6 : 0))
export const DANGER = Array.from({ length: 31 }, (_, i) => (i % 4 === 1 ? 5 : i % 9 === 2 ? -4 : 0))
export const PREVIEW = Array.from({ length: 12 }, () => 0)
export const serif = 'var(--font-display)'
export const gold = '#ffcf7a'
export const cream = '#e8d9c8'
export const coral = '#ff8a7a'

export type Frame = { w: number; h: number; wide: boolean }

/** Turns the spinning ring a little past alignment, as a still. */
export const turn = (deg: number) => (el: SVGSVGElement | null) => el?.style.setProperty('transform', `rotate(${deg}deg)`)

export const Text = ({ style, children }: { style?: CSSProperties; children: ReactNode }) => <p style={{ margin: 0, ...style }}>{children}</p>

/* ── Shared pieces ───────────────────────────────────────────────────────────────────────────────── */

export function Ground({ w, h, wide, stage = 2, dim = 0 }: Frame & { stage?: Stage; dim?: number }) {
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

export function StarAt({ x, size, top, locks, spinning = false, glow, deg = 14, failed }: { x: number; size: number; top: number; locks: number[]; spinning?: boolean; glow?: string; deg?: number; failed?: number }) {
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top }}>
      {glow && <div style={{ position: 'absolute', left: -size * 0.35, top: -size * 0.3, width: size * 1.7, height: size * 1.6, background: `radial-gradient(closest-side, ${glow}, transparent)` }} />}
      <Star size={size} locks={locks} palette={night.palette} spinning={spinning} spinRef={turn(deg)} failed={failed} />
    </div>
  )
}

/** Point width as an arc around the star: full at 36°, a red notch at the 8° minimum. */
export function ArcGauge({ x, size, top, width, color }: { x: number; size: number; top: number; width: number; color: string }) {
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

export const Icon = ({ path, ring = false }: { path: ReactNode; ring?: boolean }) => (
  <span style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: ring ? '1px solid rgba(255,255,255,0.2)' : undefined }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  </span>
)
export const SOUND = (
  <>
    <path d="M3 8v4h3l4 3V5L6 8Z" />
    <path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />
  </>
)
export const PAUSE = <path d="M7 4v12M13 4v12" />
export const GEAR = (
  <>
    <circle cx="10" cy="10" r="2.6" />
    <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6" />
  </>
)
export const CLOSE = <path d="M5 5l10 10M15 5 5 15" />

export const Button = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ marginTop: 12, height: 56, padding: '0 30px', borderRadius: 999, background: 'linear-gradient(180deg, #ffe2a6, #f6a743)', color: '#2a1606', font: '700 16px var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 40px rgba(255,160,70,0.5)', ...style }}>
    {children}
  </span>
)
export const Eyebrow = ({ children, color = gold }: { children: ReactNode; color?: string }) => (
  <Text style={{ font: '700 11px var(--font-ui)', letterSpacing: '0.2em', textTransform: 'uppercase', color }}>{children}</Text>
)
/** Floating words over the scene, no card. */
export const Words = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <section style={{ position: 'absolute', left: 24, right: 24, bottom: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', textWrap: 'balance', textShadow: '0 2px 18px rgba(20,8,5,0.85)', ...style }}>
    {children}
  </section>
)

export function TopBar({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <header style={{ position: 'absolute', top: 14, left: 22, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {left}
      {right}
    </header>
  )
}

export const Streak = ({ lit, color = gold }: { lit: number; color?: string }) => (
  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} style={{ width: 9, height: 9, rotate: '45deg', background: i < lit ? color : 'transparent', border: `1px solid ${i < lit ? color : '#6a5a7a'}` }} />
    ))}
  </div>
)
export const Count = ({ n, lit, color }: { n: number; lit: number; color?: string }) => (
  <div>
    <Text style={{ font: `400 64px/1 ${serif}` }}>{n}</Text>
    <Streak lit={lit} color={color} />
  </div>
)

/** The bottom sheet: warm dark glass, a gold hairline, floating over the dimmed screen. */
export function Sheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 24px 40px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(180deg, #2a1828, #140c1a)', borderTop: '1px solid rgba(255,207,122,0.35)', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}>
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

export const Row = ({ label, note, children, line = true }: { label: string; note?: string; children: ReactNode; line?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 56, borderBottom: line ? '1px solid rgba(255,255,255,0.08)' : undefined }}>
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 16 }}>
      {label}
      {note && <span style={{ fontSize: 12, color: '#a8988a' }}>{note}</span>}
    </span>
    {children}
  </div>
)
export const Toggle = ({ on }: { on: boolean }) => (
  <span style={{ width: 48, height: 28, borderRadius: 14, padding: 3, boxSizing: 'border-box', background: on ? 'linear-gradient(180deg, #ffe2a6, #f6a743)' : 'rgba(255,255,255,0.14)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
    <span style={{ width: 22, height: 22, borderRadius: 11, background: on ? '#2a1606' : cream }} />
  </span>
)
export const Link = ({ children }: { children: ReactNode }) => <span style={{ color: gold, fontWeight: 700, fontSize: 15 }}>{children}</span>

