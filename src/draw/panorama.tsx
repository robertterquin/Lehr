import { memo, type ReactNode } from 'react'
import type { Night } from './nights.tsx'
import { starPoints, type Stage } from './street.tsx'

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
  const barangay = night.id === 'barangay'
  const rooftop = night.id === 'rooftop'
  const city = barangay || rooftop
  const edgeBulbs = city || night.id === 'sanfernando' || night.id === 'simbahan'

  if (city) {
    for (const [from, to] of [[0, side + 4], [width - side - 4, width]]) {
      for (const row of [0, 1]) {
        let x = from - next() * 30
        while (x < to) {
          const w = (48 + next() * 70) * k
          const h = (rooftop ? 90 + next() * 190 : row === 0 ? 120 + next() * 120 : 60 + next() * 70) * k
          const top = ground - h
          const pitched = barangay && next() < 0.55
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
          if (rooftop && row === 0 && next() < 0.35) {
            shapes.push(<rect key={`tank-${x}`} x={x + w * 0.48} y={top - 16 * k} width={18 * k} height={16 * k} rx={2 * k} fill="#1f4a88" />)
            shapes.push(<ellipse key={`tank-lid-${x}`} cx={x + w * 0.57} cy={top - 16 * k} rx={9 * k} ry={2 * k} fill="#3f6fc8" />)
          }
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
    for (let x = 8 * k; x < width; x += 18 * k) {
      const y = paddyTop + 28 * k + ((x / k) % 3) * 23 * k
      surface.push(<path key={`rice-${x}`} d={`M${x} ${y + 8 * k}l${-2 * k} ${-7 * k}M${x} ${y + 8 * k}l${3 * k} ${-6 * k}`} stroke="#2e5a3a" strokeWidth={k} />)
    }
    const kuboX = side * 0.14
    surface.push(
      <g key="palayan-kubo">
        <path d={`M${kuboX} ${ground - 20 * k}V${ground - 76 * k}H${kuboX + 78 * k}V${ground - 20 * k}Z`} fill="#382b20" />
        <path d={`M${kuboX - 10 * k} ${ground - 76 * k}L${kuboX + 24 * k} ${ground - 108 * k}H${kuboX + 60 * k}L${kuboX + 90 * k} ${ground - 76 * k}Z`} fill="#4d4528" />
        <path d={`M${kuboX + 10 * k} ${ground - 20 * k}V${ground}M${kuboX + 66 * k} ${ground - 20 * k}V${ground}`} stroke="#4a3a2a" strokeWidth={3 * k} />
        <rect x={kuboX + 16 * k} y={ground - 58 * k} width={20 * k} height={15 * k} fill="#ffc96b" opacity={stage >= 2 ? 0.8 : 0.25} />
      </g>,
    )
    const treeX = width - side * 0.18
    surface.push(<path key="palayan-tree-trunk" d={`M${treeX} ${ground}Q${treeX - 4 * k} ${ground - 58 * k} ${treeX + 12 * k} ${ground - 102 * k}`} stroke="#111024" strokeWidth={6 * k} fill="none" />)
    for (const a of [-42, -18, 8, 34]) surface.push(<path key={`palayan-frond-${a}`} d={`M${treeX + 12 * k} ${ground - 102 * k}q${a * k} ${-18 * k} ${a * 1.55 * k} ${-2 * k}`} stroke="#111024" strokeWidth={3 * k} fill="none" />)
  } else if (night.id === 'intramuros') {
    const wallTop = ground - 100 * k
    surface.push(<rect key="wall" x="0" y={wallTop} width={width} height={height - wallTop} fill="#2a2234" />)
    for (let y = wallTop + 18 * k; y < ground; y += 18 * k) surface.push(<path key={`course-${y}`} d={`M0 ${y}H${width}`} stroke="#211a2a" strokeWidth={k} />)
    for (let x = 0; x < width; x += 30 * k) surface.push(<path key={`joint-${x}`} d={`M${x} ${wallTop}V${ground}`} stroke="#211a2a" strokeWidth={k} opacity="0.8" />)
    for (let x = 0; x < width; x += 34 * k) surface.push(<rect key={`merlon-${x}`} x={x} y={wallTop - 12 * k} width={18 * k} height={12 * k} fill="#352c40" />)
    for (const x of [side * 0.18, width - side * 0.18]) {
      surface.push(<path key={`farol-post-${x}`} d={`M${x} ${ground - 12 * k}V${wallTop - 72 * k}`} stroke="#1e1a2c" strokeWidth={3 * k} />)
      surface.push(<path key={`farol-${x}`} d={`M${x - 9 * k} ${wallTop - 66 * k}h${18 * k}l${-3 * k} ${-13 * k}h${-12 * k}z`} fill="#ffd9a0" />)
      surface.push(<circle key={`farol-glow-${x}`} cx={x} cy={wallTop - 59 * k} r={17 * k} fill="#ffb35a" opacity={stage >= 2 ? 0.24 : 0.1} />)
    }
    surface.push(<path key="intramuros-garita" d={`M${side * 0.56} ${wallTop}V${wallTop - 38 * k}H${side * 0.56 + 28 * k}V${wallTop}M${side * 0.56 - 3 * k} ${wallTop - 38 * k}A${17 * k} ${14 * k} 0 0 1 ${side * 0.56 + 31 * k} ${wallTop - 38 * k}`} stroke="#352c40" strokeWidth={5 * k} fill="#352c40" />)
  } else if (night.id === 'dagat') {
    const seaTop = ground - 122 * k
    surface.push(<path key="islands" d={`M0 ${seaTop}Q${width * 0.14} ${seaTop - 26 * k} ${width * 0.3} ${seaTop - 8 * k}Q${width * 0.5} ${seaTop - 38 * k} ${width * 0.68} ${seaTop - 8 * k}Q${width * 0.86} ${seaTop - 30 * k} ${width} ${seaTop - 10 * k}V${seaTop}Z`} fill="#141034" />)
    surface.push(<rect key="sea" x="0" y={seaTop} width={width} height={height - seaTop} fill="#141a44" />)
    for (let y = seaTop + 14 * k, i = 0; y < height; y += 15 * k, i += 1) {
      const start = (i % 2) * 18 * k
      for (let x = start; x < width; x += 62 * k) surface.push(<path key={`ripple-${i}-${x}`} d={`M${x} ${y}h${28 * k}`} stroke="#2a3470" strokeWidth={k} />)
    }
    for (const [x, houseWidth, roof] of [[side * 0.08, 88, 58], [width - side * 0.68, 72, 52]] as [number, number, number][]) {
      const houseY = seaTop - 4 * k
      surface.push(
        <g key={`dagat-house-${x}`}>
          <rect x={x} y={houseY - 34 * k} width={houseWidth * k} height={34 * k} fill="#3a2c22" />
          <path d={`M${x - 8 * k} ${houseY - 32 * k}L${x + houseWidth * k / 2} ${houseY - roof * k}L${x + houseWidth * k + 8 * k} ${houseY - 32 * k}Z`} fill="#4a3a26" />
          {[0.14, 0.42, 0.72].map((t) => <path key={t} d={`M${x + houseWidth * k * t} ${houseY}V${ground - 4 * k}`} stroke="#4a3a1e" strokeWidth={3 * k} />)}
          <rect x={x + houseWidth * k * 0.48} y={houseY - 23 * k} width={15 * k} height={12 * k} fill="#ffc96b" opacity={stage >= 2 ? 0.78 : 0.22} />
        </g>,
      )
    }
    for (const [x, y] of [[side * 0.5, ground - 28 * k], [width - side * 0.3, ground - 52 * k]] as [number, number][]) {
      surface.push(<path key={`bangka-${x}`} d={`M${x} ${y}q32 ${8 * k} ${64 * k} 0l${-8 * k} ${9 * k}h${-48 * k}z`} fill="#e8e0cc" />)
      surface.push(<path key={`outrigger-${x}`} d={`M${x - 14 * k} ${y - 4 * k}h${12 * k}M${x + 66 * k} ${y - 4 * k}h${12 * k}`} stroke="#c8b890" strokeWidth={2 * k} />)
    }
  } else if (night.id === 'sanfernando') {
    surface.push(<rect key="plaza" x="0" y={ground - 52 * k} width={width} height={height - ground + 52 * k} fill="#100d1e" />)
    for (const x of [side * 0.34, width - side * 0.34]) {
      const cy = ground - 106 * k
      const lit = stage >= 2
      surface.push(
        <g key={`lantern-${x}`}>
          <path d={`M${x - 31 * k} ${ground}L${x - 8 * k} ${cy + 24 * k}M${x + 31 * k} ${ground}L${x + 8 * k} ${cy + 24 * k}M${x - 31 * k} ${ground - 28 * k}H${x + 31 * k}M${x - 20 * k} ${ground - 54 * k}H${x + 20 * k}`} stroke="#2b2840" strokeWidth={2 * k} fill="none" />
          <circle cx={x} cy={cy} r={31 * k} fill="#c43a8a" opacity={lit ? 0.2 : 0.08} />
          <circle cx={x} cy={cy} r={25 * k} fill="#d8342c" opacity={lit ? 0.85 : 0.3} />
          <circle cx={x} cy={cy} r={18 * k} fill="#2e9a5a" opacity={lit ? 0.95 : 0.35} />
          <circle cx={x} cy={cy} r={11 * k} fill="#f2b632" opacity={lit ? 1 : 0.4} />
          <path d={`M${starPoints(x, cy, 17 * k)}Z`} fill="#f4ecd8" opacity={lit ? 0.95 : 0.45} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6
            return <circle key={i} cx={x + Math.cos(a) * 28 * k} cy={cy + Math.sin(a) * 28 * k} r={2 * k} fill={i % 2 ? '#f2b632' : '#f4ecd8'} opacity={lit ? 1 : 0.35} />
          })}
        </g>,
      )
    }
    for (let x = 4 * k; x < width; x += 14 * k) {
      const tall = 17 + ((x / k) % 4) * 4
      surface.push(<circle key={`crowd-head-${x}`} cx={x} cy={ground - tall * k} r={3 * k} fill="#0d0a1c" />)
      surface.push(<path key={`crowd-body-${x}`} d={`M${x - 5 * k} ${ground}v${-(tall - 6) * k}q${5 * k} ${-5 * k} ${10 * k} 0v${(tall - 6) * k}z`} fill="#0d0a1c" />)
    }
  } else if (night.id === 'simbahan') {
    surface.push(<rect key="plaza" x="0" y={ground - 54 * k} width={width} height={height - ground + 54 * k} fill="#0e0b18" />)
    for (const x of [side * 0.28, width - side * 0.28]) {
      const canopy = x < width / 2 ? '#d8342c' : '#7a3a9a'
      surface.push(
        <g key={`stall-${x}`}>
          <path d={`M${x - 40 * k} ${ground - 28 * k}L${x - 25 * k} ${ground - 58 * k}H${x + 25 * k}L${x + 40 * k} ${ground - 28 * k}Z`} fill={canopy} />
          {[-24, -8, 8, 24].map((offset) => <path key={offset} d={`M${x + offset * k} ${ground - 28 * k}q${8 * k} ${7 * k} ${16 * k} 0`} stroke="#f4ecd8" strokeWidth={3 * k} fill="none" />)}
          <rect x={x - 35 * k} y={ground - 28 * k} width={70 * k} height={28 * k} fill="#4a3420" />
          <rect x={x - 29 * k} y={ground - 25 * k} width={58 * k} height={18 * k} fill="#ffc96b" opacity={stage >= 2 ? 0.18 : 0.06} />
          <path d={`M${x - 34 * k} ${ground}V${ground - 28 * k}M${x + 34 * k} ${ground}V${ground - 28 * k}`} stroke="#3a2a1c" strokeWidth={3 * k} />
          <circle cx={x} cy={ground - 42 * k} r={5 * k} fill="#f2b632" opacity={stage >= 2 ? 0.9 : 0.35} />
          <path d={`M${x} ${ground - 40 * k}v${14 * k}`} stroke="#5b3a1c" strokeWidth={k} />
        </g>,
      )
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
