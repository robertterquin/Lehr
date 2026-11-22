import { memo, type ReactNode } from 'react'
import type { Night } from './nights.tsx'
import type { Stage } from './street.tsx'

const BULBS = ['#f2b632', '#d8342c', '#2e9a5a', '#2f6fd0', '#f4ecd8', '#c43a8a']

/** Seeded random, so the skyline is the same on every render. */
const random = (seed: number) => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

/**
 * One street across a wide screen: tonight's scene once in the middle at its own scale, and a lower skyline
 * of rooftops, lit windows and a string of bulbs continuing it to both edges, instead of repeating the
 * phone-width scene. The bulbs come on with the street lights (20 rings) and the sky warms at dawn (90).
 */
export const Panorama = memo(function Panorama({ night, stage, width, height }: { night: Night; stage: Stage; width: number; height: number }) {
  const sceneWidth = Math.round((390 * height) / 844)
  const side = Math.max(0, (width - sceneWidth) / 2)
  const k = height / 844
  const ground = height - 2 * k
  const next = random(7)
  const shapes: ReactNode[] = []
  for (const [from, to] of [[0, side + 4], [width - side - 4, width]]) {
    for (const row of [0, 1]) {
      let x = from - next() * 30
      while (x < to) {
        const w = (48 + next() * 70) * k
        const h = (row === 0 ? 120 + next() * 120 : 60 + next() * 70) * k
        const top = ground - h
        const pitched = next() < 0.55
        shapes.push(
          <path
            key={`${from}-${row}-${x}`}
            d={pitched ? `M${x} ${ground}V${top}L${x + w / 2} ${top - w * 0.35}L${x + w} ${top}V${ground}Z` : `M${x} ${ground}V${top}H${x + w}V${ground}Z`}
            fill={row === 0 ? '#151132' : '#0d0a1c'}
          />,
        )
        for (let wy = top + 10 * k; wy < ground - 16 * k; wy += 18 * k)
          for (let wx = x + 8 * k; wx < x + w - 10 * k; wx += 16 * k)
            if (next() < (row === 0 ? 0.12 : 0.22)) shapes.push(<rect key={`${wx}-${wy}`} x={wx} y={wy} width={5 * k} height={7 * k} fill="#ffc96b" opacity={row === 0 ? 0.35 : 0.7} />)
        x += w + next() * 14 * k
      }
    }
  }
  const lightsOn = stage >= 2
  const y0 = ground - 170 * k
  for (let i = 0, x = 6; x < width; i += 1, x += 22 * k) {
    if (x > side - 6 && x < width - side + 6) continue
    const t = (x % (260 * k)) / (260 * k)
    shapes.push(<circle key={`bulb-${i}`} cx={x} cy={y0 + Math.sin(Math.PI * t) * 26 * k} r={2.2 * k} fill={BULBS[i % BULBS.length]} opacity={lightsOn || i % 4 === 0 ? 0.95 : 0.3} />)
  }
  const stars = Array.from({ length: Math.round(width / 9) }, (_, i) => (
    <circle key={i} cx={next() * width} cy={next() * height * 0.55} r={next() < 0.2 ? 1.3 : 0.8} fill="#fff" opacity={(0.25 + next() * 0.4) * (stage >= 9 ? 0.45 : 1)} />
  ))
  const fade = 'linear-gradient(90deg, transparent, rgba(13,10,28,0.55), transparent)'
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} aria-hidden="true">
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="panorama-dawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.35" stopColor="#e8845a" stopOpacity="0" />
            <stop offset="0.7" stopColor="#c8607a" stopOpacity="0.35" />
            <stop offset="0.86" stopColor="#f2a66a" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {stage >= 9 && <rect width={width} height={height} fill="url(#panorama-dawn)" />}
        {stars}
        {stage < 9 && <path d={`M${width - 64} 70a18 18 0 1 0 13 30a14 14 0 1 1 -13 -30z`} fill="#f4ecd8" opacity="0.8" />}
        {shapes}
        <rect x="0" y={ground} width={width} height={height - ground} fill="#0b0916" />
      </svg>
      <div style={{ position: 'absolute', left: side, bottom: 0, width: sceneWidth, height }}>
        <night.Scene stage={stage} moon={false} />
      </div>
      {/* Soft seams where the scene meets the skyline */}
      <div style={{ position: 'absolute', left: side - 40, width: 80, bottom: 0, height: height * 0.35, background: fade }} />
      <div style={{ position: 'absolute', left: width - side - 40, width: 80, bottom: 0, height: height * 0.35, background: fade }} />
    </div>
  )
})
