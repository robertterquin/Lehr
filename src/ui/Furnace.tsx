import { useId } from 'react'
import { BRILLIANT_FROM, MAX_HEAT } from '../engine/engine.ts'

type Props = {
  /** Bubble size as % of the target. */
  size: number
  heat: number
  tolerance: number
  brilliantOpen: boolean
  cracked: boolean
}

const TARGET_RADIUS = 72
const CX = 236
const CY = 128
const radiusFor = (percent: number) => (TARGET_RADIUS * Math.max(0, percent)) / 100

const mix = (cool: string, hot: string, t: number) => {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `rgb(${[0, 1, 2].map((i) => Math.round(channel(cool, i) + (channel(hot, i) - channel(cool, i)) * t)).join(' ')})`
}

/** Glass glows brightest at its rim (more hot glass along the line of sight) and dulls as it cools. */
const glassStops = (heat: number) => {
  const t = Math.max(0, Math.min(1, heat / MAX_HEAT))
  return [
    [0, mix('#6e2512', '#d9581f', t)],
    [0.6, mix('#93361a', '#f07a2c', t)],
    [0.88, mix('#b4561c', '#ffb84f', t)],
    [0.97, mix('#c8742e', '#ffd57a', t)],
    [1, mix('#7a2a14', '#c8481b', t)],
  ] as const
}

export default function Furnace({ size, heat, tolerance, brilliantOpen, cracked }: Props) {
  const id = useId().replace(/:/g, '')
  const r = radiusFor(size)
  const crackR = radiusFor(100 + heat)
  const neck = Math.min(r * 0.42, 26)
  const neckX = CX - r * 0.92
  const brilliantInner = radiusFor(100 + BRILLIANT_FROM)

  return (
    <svg className="furnace" viewBox="0 0 390 270" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-hole`}>
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.35" stopColor="#ffe08a" />
          <stop offset="0.75" stopColor="#ff9a3c" />
          <stop offset="1" stopColor="#d4501a" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glass`}>
          {glassStops(heat).map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </radialGradient>
        <linearGradient id={`${id}-pipe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9bec4" />
          <stop offset="0.5" stopColor="#7d838a" />
          <stop offset="1" stopColor="#4b5056" />
        </linearGradient>
        <linearGradient id={`${id}-tint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d838a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8a6a4a" />
          <stop offset="1" stopColor="#5d4a78" />
        </linearGradient>
        <linearGradient id={`${id}-marver`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4d52" />
          <stop offset="0.15" stopColor="#34373b" />
          <stop offset="1" stopColor="#1e2023" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* The glory hole: the reheating furnace */}
      <circle cx="372" cy="70" r="120" fill={`url(#${id}-halo)`} />
      <circle cx="372" cy="70" r="60" fill="#2e2925" stroke="#4a423b" strokeWidth="3" />
      <circle cx="372" cy="70" r="46" fill="#1a1512" />
      <circle cx="372" cy="70" r="38" fill={`url(#${id}-hole)`} />
      <circle cx="326" cy="40" r="2.5" fill="#5a524a" />
      <circle cx="320" cy="78" r="2.5" fill="#5a524a" />
      <circle cx="338" cy="114" r="2.5" fill="#5a524a" />

      {/* The marver (steel table) and a pair of jacks */}
      <rect x="0" y="222" width="390" height="48" fill={`url(#${id}-marver)`} />
      <path d="M0 222.5H390" stroke="#8b9097" strokeWidth="1" />
      <ellipse cx={CX} cy="234" rx={Math.max(20, r)} ry="7" fill="#ff9a3c" opacity={0.15 + (0.25 * Math.max(0, heat)) / MAX_HEAT} filter={`url(#${id}-blur)`} />
      <path d="M30 241C20 241 16 247 22 251C28 255 36 252 40 248L150 246M40 248L150 252" stroke="#9aa0a6" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* Bands behind the bubble: brilliant zone, crack ring */}
      {brilliantOpen && crackR > brilliantInner && (
        <circle cx={CX} cy={CY} r={(brilliantInner + crackR) / 2} fill="none" stroke="#fff1c2" strokeWidth={crackR - brilliantInner} opacity="0.2" />
      )}
      <circle cx={CX} cy={CY} r={crackR} fill="none" stroke="#e0563a" strokeWidth="1.4" strokeDasharray="3 5" />

      {/* Blowpipe, heat-tinted near the hot end */}
      <rect x="-10" y="124.5" width="182" height="7" rx="3.5" fill={`url(#${id}-pipe)`} />
      <rect x="96" y="124.5" width="76" height="7" fill={`url(#${id}-tint)`} />
      <rect x="40" y="123.5" width="34" height="9" rx="2" fill="#3a3430" opacity="0.65" />

      {/* The gather */}
      <path d={`M166 122L${neckX} ${CY - neck}L${neckX} ${CY + neck}L166 134Z`} fill={mix('#c8742e', '#ffd57a', Math.max(0, heat) / MAX_HEAT)} />
      <circle cx={CX} cy={CY} r={r} fill={`url(#${id}-glass)`} />
      <ellipse cx={CX + r * 0.36} cy={CY - r * 0.45} rx={r * 0.28} ry={r * 0.15} fill="#fffbe6" opacity="0.35" transform={`rotate(30 ${CX + r * 0.36} ${CY - r * 0.45})`} />
      {cracked && (
        <path
          d={`M${CX - r * 0.1} ${CY - r}L${CX + r * 0.08} ${CY - r * 0.55}L${CX - r * 0.12} ${CY - r * 0.1}L${CX + r * 0.2} ${CY + r * 0.25}L${CX + r * 0.05} ${CY + r}M${CX + r * 0.08} ${CY - r * 0.55}L${CX + r * 0.6} ${CY - r * 0.75}M${CX - r * 0.12} ${CY - r * 0.1}L${CX - r * 0.85} ${CY - r * 0.2}M${CX + r * 0.2} ${CY + r * 0.25}L${CX + r * 0.85} ${CY + r * 0.45}`}
          stroke="#ffe7b3"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
      )}

      {/* Target outline with the flawless band */}
      <circle cx={CX} cy={CY} r={TARGET_RADIUS} fill="none" stroke="#ffd27a" strokeWidth={(TARGET_RADIUS * 2 * tolerance) / 100} opacity="0.32" />
      <circle cx={CX} cy={CY} r={TARGET_RADIUS} fill="none" stroke="#f6ece1" strokeWidth="1.2" strokeDasharray="5 5" />
    </svg>
  )
}
