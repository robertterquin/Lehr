import { memo, useId, type Ref } from 'react'
import { RULES } from '../game/rules.ts'
import { CENTER, PALETTE, drawnRings, polar, radii, sliverPath, starPath } from './geometry.ts'

const BAMBOO = '#5b3a1c'
const BAMBOO_SHEEN = '#c8995a'

const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
const mix = (from: string, to: string, t: number) =>
  `rgb(${[0, 1, 2].map((i) => Math.round(channel(from, i) + (channel(to, i) - channel(from, i)) * t)).join(' ')})`

/** One locked ring. Memoised: a lock redraws only the rings whose shape or line weight changed. */
const RingShape = memo(function RingShape({ index, width, rotation, fill, frame, dim, sheen }: { index: number; width: number; rotation: number; fill: string; frame: number; dim: boolean; sheen: boolean }) {
  const d = starPath(index, width, rotation)
  return (
    <g>
      <path d={d} fill={fill} fillOpacity={dim ? 0.3 : 1} stroke={dim ? 'rgba(244,236,216,0.35)' : BAMBOO} strokeWidth={frame} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {sheen && <path d={d} fill="none" stroke={BAMBOO_SHEEN} strokeWidth={frame * 0.35} opacity="0.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
    </g>
  )
})

/** One ring's five point bulbs: the soft glow (drawn inside the shared blur) or the bright core. */
const RingBulbs = memo(function RingBulbs({ index, rotation, rotor, part, alpha }: { index: number; rotation: number; rotor: boolean; part: 'glow' | 'core'; alpha: number }) {
  return [0, 1, 2, 3, 4].map((k) => {
    const [x, y] = polar(radii(index).ro - 3, rotation + k * 72 - 90)
    const lead = rotor && (index + k) % 3 === 0
    const bright = rotor && !lead ? 0.35 : 1
    return part === 'glow' ? (
      <circle key={k} cx={x} cy={y} r="4" fill={lead ? '#fff1c2' : '#ffe7a8'} opacity={0.6 * bright * alpha} />
    ) : (
      <circle key={k} cx={x} cy={y} r="1.6" fill="#fffaf0" opacity={bright * alpha} />
    )
  })
})

type Props = {
  size: number
  /** Lock errors in degrees, one per locked ring: the engine's `locks`. */
  locks: number[]
  /** The ring after these is spinning in: drawn on its own layer, turned by `spinRef`. */
  spinning?: boolean
  /** Receives the spinning layer; set its `style.transform` to `rotate(<ringOffset>deg)` every frame. */
  spinRef?: Ref<SVGSVGElement>
  /** Paper colours, ring by ring: each night has its own. */
  palette?: string[]
  /** Unlit: paper not yet glowing (the Ready screen). */
  dim?: boolean
  /** The points are nearly too thin: the glow turns red. */
  danger?: boolean
  /** The error of the lock that ended the run: its overhang falls away. */
  failed?: number
  /** Perfect locks in a row (the run's streak): a perfect lock's sparkles grow with it, and a widen sends a ring out. */
  streak?: number
}

/**
 * A parol: concentric five-pointed rings of backlit paper on a bamboo frame, a tambor (drum) at the centre,
 * two fringed tails (buntot) with tassels, and halos with bulbs like Pampanga lanterns.
 * The locked star only redraws when a ring locks; the spinning ring is a separate layer the browser turns
 * on the GPU, so spinning costs no redraw.
 */
export const Star = memo(function Star({ size, locks, spinning = false, spinRef, palette = PALETTE, dim = false, danger = false, failed, streak = 1 }: Props) {
  const id = useId().replace(/:/g, '')
  const rings = drawnRings(locks)
  const count = locks.length
  const last = rings[rings.length - 1]
  const width = last?.width ?? 36
  const rotation = last?.rotation ?? 0
  // Milestones on the star itself: halos at 10/50/80, longer tails at 25/50/75, rotor colours from 60.
  const halo = count >= 80 ? 3 : count >= 50 ? 2 : count >= 10 ? 1 : 0
  const tailScale = 1 + 0.25 * Math.min(3, Math.floor(count / 25))
  const rotor = count >= 60 && !dim
  const outer = radii(Math.max(0, count - 1 + (spinning ? 1 : 0))).ro
  const haloR = outer + 16
  const glow = dim ? 0.12 : 1
  // The camera pulls back as the star grows, so any number of rings fits the frame.
  const fit = Math.min(1, 138 / (halo > 0 ? haloR + (halo - 1) * 12 : outer))
  const camera = `translate(${CENTER} ${CENTER}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-CENTER})`
  // Frame lines thin out as the camera pulls back, so a big star keeps its colours instead of turning to bamboo.
  // Rounded to steps so most locks leave every older ring's line weight, and so its drawing, untouched.
  const frame = Math.round(Math.max(0.25, Math.min(1.4, fit * 1.8)) * 10) / 10
  // On a big star the rings are thin bands: bulbs soften so the paper colours still read.
  const crowd = Math.round(Math.min(1, fit * 1.6) * 20) / 20
  const ringFill = (index: number) => `url(#${id}-paper-${index % palette.length})`
  const height = (size * 420) / 300

  const tails = [54, 126].map((deg, side) => {
    const [x, y] = polar(radii(Math.max(0, count - 1)).ro - 4, deg + rotation)
    const dir = side === 0 ? 1 : -1
    const strand = (dx: number, len: number, wobble: number) =>
      `M${x + dx} ${y}C${x + dx + dir * 10} ${y + len * 0.35} ${x + dx - dir * wobble} ${y + len * 0.65} ${x + dx + dir * 4} ${y + len}`
    return {
      strands: [strand(-3, 112 * tailScale, 10), strand(0, 120 * tailScale, 14), strand(3, 106 * tailScale, 9)],
      end: [x + dir * 4, y + 120 * tailScale] as [number, number],
    }
  })

  const layer = { width: size, height, viewBox: '0 0 300 420', 'aria-hidden': true as const }
  const lit = dim ? [] : rings.filter((ring) => rotor || ring.perfect)

  const haloBulbs = (h: number, phase?: number) =>
    Array.from({ length: 15 }, (_, k) => {
      if (phase !== undefined && k % 3 !== phase) return null
      const [x, y] = polar(haloR + h * 12, k * 24 + h * 12)
      return <circle key={k} cx={x} cy={y} r="2.2" fill="#fff6d6" />
    })
  // Rotor mode (60+): the halo bulbs chase round the star. Three layers, one per third of the bulbs, fade in
  // turn; fading a whole layer runs on the GPU, so the chase never redraws the star.
  const chase = rotor && halo > 0
    ? [0, 1, 2].map((phase) => (
        <svg key={phase} className="rotor-chase" {...layer} style={{ animationDelay: `${phase * 300 - 900}ms` }}>
          <g transform={camera}>{Array.from({ length: halo }, (_, h) => haloBulbs(h, phase))}</g>
        </svg>
      ))
    : null

  // The newest lock's effect, on a small layer of its own: animating it never redraws the star.
  // A perfect lock flashes gold; an off-angle lock (or the one that ended the run) drops its overhang.
  const newest = rings[count - 1]
  const before = rings[count - 2]
  const drop = (index: number, w: number, turn: number, error: number) => (
    <svg key={`drop-${count}-${failed ?? ''}`} className="lock-drop" {...layer}>
      <g transform={camera}>
        <path d={sliverPath(index, w, turn, error)} fill={palette[index % palette.length]} stroke={BAMBOO} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  )
  const effect = dim
    ? null
    : failed !== undefined
      ? drop(count, width, rotation, failed)
      : newest?.perfect
        ? (
            <svg key={`glow-${count}`} className="lock-glow" {...layer}>
              <defs>
                <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>
              <g transform={camera}>
                <path d={starPath(newest.index, newest.width, newest.rotation)} fill="none" stroke="#ffe7a8" strokeWidth="6" filter={`url(#${id}-glow)`} vectorEffect="non-scaling-stroke" />
                <path d={starPath(newest.index, newest.width, newest.rotation)} fill="none" stroke="#fff6dc" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                {/* A sparkle at each tip, bigger with every perfect in a row (1 to 5), the same size on screen at any ring count. */}
                {[0, 1, 2, 3, 4].map((k) => {
                  const [x, y] = polar(radii(newest.index).ro - 1, newest.rotation + k * 72 - 90)
                  const level = ((Math.max(1, streak) - 1) % RULES.widenEvery) + 1
                  return (
                    <g key={k} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${((0.5 + level * 0.22) / fit).toFixed(3)})`}>
                      <path className="tip-spark" d="M0 -7L1.5 -1.5L7 0L1.5 1.5L0 7L-1.5 1.5L-7 0L-1.5 -1.5Z" fill="#fff6dc" style={{ animationDelay: `${k * 30}ms` }} />
                    </g>
                  )
                })}
              </g>
            </svg>
          )
        : newest && drop(newest.index, before?.width ?? RULES.startWidth, before?.rotation ?? 0, locks[count - 1])
  // Five perfect in a row widen the points: a ring of light goes out from the star, on a layer of its own.
  const widen =
    !dim && newest?.perfect && failed === undefined && streak > 0 && streak % RULES.widenEvery === 0 ? (
      <svg key={`widen-${count}`} className="widen-ring" {...layer}>
        <g transform={camera}>
          <circle cx={CENTER} cy={CENTER} r={radii(newest.index).ro + 8} fill="none" stroke="#ffe7a8" strokeWidth={(3 / fit).toFixed(2)} />
        </g>
      </svg>
    ) : null
  // After a milestone the next ring waits before it spins in.
  const spinDelay = count > 0 && count % RULES.milestoneEvery === 0 ? RULES.milestoneBreakMs : 0

  const paper = (
    <defs>
      {palette.map((color, i) => (
        // The gradient spans the whole star, so outer rings of a big star keep their colour.
        <radialGradient key={i} id={`${id}-paper-${i}`} gradientUnits="userSpaceOnUse" cx={CENTER} cy={CENTER} r={Math.max(150, outer + 10)}>
          <stop offset="0" stopColor={mix(color, '#fffaf0', dim ? 0.1 : 0.6)} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={mix(color, '#120a04', 0.28)} />
        </radialGradient>
      ))}
    </defs>
  )

  return (
    <div style={{ position: 'relative', width: size, height }}>
      {spinning && (
        // The spinning ring, behind the locked rings so only its rim shows outside them: bamboo spokes, translucent paper and light streaks behind each tip. It turns about the
        // star's centre (150, 150 of the 300×420 box), and the camera's scale about that centre doesn't change that.
        <svg
          key={count}
          ref={spinRef}
          className="spin-in"
          width={size}
          height={height}
          viewBox="0 0 300 420"
          style={{ position: 'absolute', inset: 0, overflow: 'visible', transformOrigin: '50% 35.7143%', willChange: 'transform', animationDelay: `${spinDelay}ms` }}
          aria-hidden="true"
        >
          {paper}
          <g transform={camera}>
            <path d={starPath(count, width, rotation)} fill={ringFill(count)} fillOpacity="0.5" stroke={BAMBOO} strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {[0, 1, 2, 3, 4].map((k) => {
              const ro = radii(count).ro
              const t = rotation + k * 72 - 90
              const [tx, ty] = polar(ro - 2, t)
              const [sx, sy] = polar(ro - 2, t - 16)
              return (
                <g key={k}>
                  <path d={`M${CENTER} ${CENTER}L${tx} ${ty}`} stroke={BAMBOO_SHEEN} strokeWidth="1" opacity="0.75" vectorEffect="non-scaling-stroke" />
                  <path d={`M${sx} ${sy}A${ro - 2} ${ro - 2} 0 0 1 ${tx} ${ty}`} fill="none" stroke="#fff1c2" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" vectorEffect="non-scaling-stroke" />
                  <circle cx={tx} cy={ty} r={2.2 / fit} fill="#fffaf0" opacity="0.9" />
                </g>
              )
            })}
          </g>
        </svg>
      )}

      <svg width={size} height={height} viewBox="0 0 300 420" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden="true">
        {paper}
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor={danger ? '#ff6a4a' : '#ffbe5a'} stopOpacity={0.55 * glow} />
            <stop offset="1" stopColor="#ffbe5a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-tambor`}>
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="0.6" stopColor={dim ? '#8a7650' : '#ffe39a'} />
            <stop offset="1" stopColor={dim ? '#5a4a30' : '#f2b632'} />
          </radialGradient>
          <filter id={`${id}-bulb`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <g transform={camera}>
          <circle cx={CENTER} cy={CENTER} r={outer + 60} fill={`url(#${id}-halo)`} />

          {Array.from({ length: halo }, (_, h) => {
            const r = haloR + h * 12
            return (
              <g key={h}>
                <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke="#f2b632" strokeWidth="6" opacity={dim ? 0.15 : 0.35} />
                <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke={BAMBOO} strokeWidth="1.8" />
                {!dim && !rotor && haloBulbs(h)}
              </g>
            )
          })}

          {count > 0 &&
            tails.map((tail, side) => (
              <g key={side} opacity={dim ? 0.4 : 1}>
                {tail.strands.map((d, s) => (
                  <path key={s} d={d} fill="none" stroke={['#f2b632', '#d8342c', '#f4ecd8'][s]} strokeWidth="2.6" strokeLinecap="round" />
                ))}
                <path d={`M${tail.end[0]} ${tail.end[1] - 4}l-5 6l5 14l5 -14z`} fill="#d8342c" stroke={BAMBOO} strokeWidth="0.8" />
                {[-4, -2, 0, 2, 4].map((dx) => (
                  <path key={dx} d={`M${tail.end[0] + dx * 0.6} ${tail.end[1] + 14}l${dx * 0.5} 9`} stroke="#f2b632" strokeWidth="1" />
                ))}
              </g>
            ))}

          {/* Gold dashes where the spinning ring's points belong */}
          {spinning && <path d={starPath(count, width, rotation)} fill="none" stroke="#ffd27a" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}

          {/* Locked rings, outside in, so each inner ring leaves a coloured rim */}
          {[...rings].reverse().map((ring) => (
            <RingShape key={ring.index} index={ring.index} width={ring.width} rotation={ring.rotation} fill={ringFill(ring.index)} frame={frame} dim={dim} sheen={!dim && fit > 0.5} />
          ))}

          {/* Bulbs on perfect rings' points: one blur for all the glows, not one per bulb */}
          <g filter={`url(#${id}-bulb)`}>
            {lit.map((ring) => (
              <RingBulbs key={ring.index} index={ring.index} rotation={ring.rotation} rotor={rotor} part="glow" alpha={crowd} />
            ))}
          </g>
          {lit.map((ring) => (
            <RingBulbs key={ring.index} index={ring.index} rotation={ring.rotation} rotor={rotor} part="core" alpha={0.4 + 0.6 * crowd} />
          ))}

          <circle cx={CENTER} cy={CENTER} r="17" fill={`url(#${id}-tambor)`} stroke={BAMBOO} strokeWidth="2" />
          <circle cx={CENTER} cy={CENTER} r="10" fill="none" stroke={BAMBOO} strokeWidth="0.9" opacity="0.8" />
          {Array.from({ length: 8 }, (_, k) => {
            const [sx, sy] = polar(10, k * 45)
            const [ex, ey] = polar(17, k * 45)
            return <path key={k} d={`M${sx} ${sy}L${ex} ${ey}`} stroke={BAMBOO} strokeWidth="0.8" opacity="0.8" />
          })}
        </g>
      </svg>
      {chase}
      {effect}
      {widen}
    </div>
  )
})
