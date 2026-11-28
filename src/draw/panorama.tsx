import { memo, type ReactNode } from 'react'
import type { Night } from './nights.tsx'
import type { Stage } from './street.tsx'

const BULBS = ['#f2b632', '#d8342c', '#2e9a5a', '#2f6fd0', '#f4ecd8', '#c43a8a']

/** Seeded random, so the skyline is the same on every render. */
const random = (seed: number) => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

/**
 * A wide extension of tonight's setting: the phone-width scene sits in the middle while its landscape
 * continues to both edges. The bulbs come on with the street lights (20 rings) and the sky warms at dawn (90).
 */
export const Panorama = memo(function Panorama({ night, stage, width, height }: { night: Night; stage: Stage; width: number; height: number }) {
  const sceneWidth = Math.round((390 * height) / 844)
  const side = Math.max(0, (width - sceneWidth) / 2)
  const k = height / 844
  const ground = height - 2 * k
  const next = random(7)
  const shapes: ReactNode[] = []
  const surface: ReactNode[] = []
  const city = night.id === 'barangay' || night.id === 'rooftop'
  const edgeBulbs = city || night.id === 'sanfernando' || night.id === 'simbahan'

  if (city) {
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
  }

  if (night.id === 'palayan') {
    const paddyTop = ground - 116 * k
    surface.push(<path key="palayan-hills" d={`M0 ${paddyTop}L${width * 0.2} ${paddyTop - 58 * k}L${width * 0.42} ${paddyTop - 6 * k}L${width * 0.7} ${paddyTop - 76 * k}L${width} ${paddyTop - 12 * k}V${paddyTop}Z`} fill="#17123a" />)
    for (let row = 0; row < 5; row += 1) {
      const y = paddyTop + row * 23 * k
      surface.push(<rect key={`paddy-${row}`} x="0" y={y} width={width} height={18 * k} fill={row % 2 ? '#1c1846' : '#201c52'} />)
      surface.push(<path key={`dike-${row}`} d={`M0 ${y + 18 * k}Q${width / 2} ${y + 15 * k} ${width} ${y + 18 * k}`} stroke="#0f0c22" strokeWidth={4 * k} fill="none" />)
    }
  } else if (night.id === 'intramuros') {
    const wallTop = ground - 100 * k
    surface.push(<rect key="wall" x="0" y={wallTop} width={width} height={height - wallTop} fill="#2a2234" />)
    for (let y = wallTop + 18 * k; y < ground; y += 18 * k) surface.push(<path key={`course-${y}`} d={`M0 ${y}H${width}`} stroke="#211a2a" strokeWidth={k} />)
    for (let x = 0; x < width; x += 30 * k) surface.push(<path key={`joint-${x}`} d={`M${x} ${wallTop}V${ground}`} stroke="#211a2a" strokeWidth={k} opacity="0.8" />)
  } else if (night.id === 'dagat') {
    const seaTop = ground - 122 * k
    surface.push(<path key="islands" d={`M0 ${seaTop}Q${width * 0.14} ${seaTop - 26 * k} ${width * 0.3} ${seaTop - 8 * k}Q${width * 0.5} ${seaTop - 38 * k} ${width * 0.68} ${seaTop - 8 * k}Q${width * 0.86} ${seaTop - 30 * k} ${width} ${seaTop - 10 * k}V${seaTop}Z`} fill="#141034" />)
    surface.push(<rect key="sea" x="0" y={seaTop} width={width} height={height - seaTop} fill="#141a44" />)
    for (let y = seaTop + 14 * k, i = 0; y < height; y += 15 * k, i += 1) {
      const start = (i % 2) * 18 * k
      for (let x = start; x < width; x += 62 * k) surface.push(<path key={`ripple-${i}-${x}`} d={`M${x} ${y}h${28 * k}`} stroke="#2a3470" strokeWidth={k} />)
    }
  } else if (night.id === 'sanfernando') {
    surface.push(<rect key="plaza" x="0" y={ground - 52 * k} width={width} height={height - ground + 52 * k} fill="#100d1e" />)
    for (const x of [side * 0.34, width - side * 0.34]) {
      surface.push(<path key={`lantern-frame-${x}`} d={`M${x - 28 * k} ${ground}L${x} ${ground - 92 * k}L${x + 28 * k} ${ground}`} stroke="#2b2840" strokeWidth={2 * k} fill="none" />)
      surface.push(<circle key={`lantern-${x}`} cx={x} cy={ground - 106 * k} r={24 * k} fill="#f2b632" opacity={stage >= 2 ? 0.38 : 0.16} />)
    }
  } else if (night.id === 'simbahan') {
    surface.push(<rect key="plaza" x="0" y={ground - 54 * k} width={width} height={height - ground + 54 * k} fill="#0e0b18" />)
    for (const x of [side * 0.28, width - side * 0.28]) {
      surface.push(<path key={`stall-${x}`} d={`M${x - 38 * k} ${ground - 28 * k}L${x - 26 * k} ${ground - 52 * k}H${x + 26 * k}L${x + 38 * k} ${ground - 28 * k}Z`} fill="#4a3420" />)
      surface.push(<rect key={`counter-${x}`} x={x - 34 * k} y={ground - 28 * k} width={68 * k} height={28 * k} fill="#3a2a1c" />)
    }
  }

  const lightsOn = stage >= 2
  const y0 = ground - 170 * k
  if (edgeBulbs) {
    for (let i = 0, x = 6; x < width; i += 1, x += 22 * k) {
      if (x > side - 6 && x < width - side + 6) continue
      const t = (x % (260 * k)) / (260 * k)
      shapes.push(<circle key={`bulb-${i}`} cx={x} cy={y0 + Math.sin(Math.PI * t) * 26 * k} r={2.2 * k} fill={BULBS[i % BULBS.length]} opacity={lightsOn || i % 4 === 0 ? 0.95 : 0.3} />)
    }
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
        {city && <rect x="0" y={ground} width={width} height={height - ground} fill="#0b0916" />}
        {surface}
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
