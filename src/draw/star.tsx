import { memo, useId, useLayoutEffect, useRef, type Ref } from 'react'
import { RULES } from '../game/rules.ts'
import { CENTER, PALETTE, drawnRings, polar, radii, sliverPath, starPath, type DrawnRing } from './geometry.ts'

/** Halo lights, innermost first: gold, warm white, coral. */
const HALO_LIGHTS = ['#ffcf5a', '#fff6d6', '#ff8a6a']
/** A bulb that isn't lit: a missed ring's, or every bulb on the unlit Ready star. */
const UNLIT = '#4a3a4a'
const CORD = '#e9b25a'

const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
const mixRGB = (from: string, to: string, t: number) => [0, 1, 2].map((i) => Math.round(channel(from, i) + (channel(to, i) - channel(from, i)) * t))
const mix = (from: string, to: string, t: number) => `rgb(${mixRGB(from, to, t).join(' ')})`

/** Where a ring's bulbs sit: along its whole outline, out along each point and in round each valley. */
const bulbSpots = (index: number, width: number, rotation: number, per: number) => {
  const { ri, ro, rv } = radii(index)
  const spots: [number, number][] = []
  const run = (p: [number, number], q: [number, number], steps: number) => {
    for (let s = 0; s < steps; s++) spots.push([p[0] + ((q[0] - p[0]) * s) / steps, p[1] + ((q[1] - p[1]) * s) / steps])
  }
  for (let k = 0; k < 5; k++) {
    const t = rotation + k * 72 - 90
    const a = polar(ri, t - width / 2)
    const b = polar(ro, t)
    const c = polar(ri, t + width / 2)
    const v = polar(rv, t + 36)
    run(a, b, per)
    run(b, c, per)
    run(c, v, Math.max(1, per >> 1))
    run(v, polar(ri, t + 72 - width / 2), Math.max(1, per >> 1))
  }
  return spots
}

/** One locked ring: deep coloured vinyl with a light seam. Memoised: a lock redraws only the rings that changed. */
const RingShape = memo(function RingShape({ index, width, rotation, fill, edge, line }: { index: number; width: number; rotation: number; fill: string; edge: string; line: number }) {
  return <path d={starPath(index, width, rotation)} fill={fill} stroke={edge} strokeOpacity="0.5" strokeWidth={line} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
})

/** A bulb's glow, one image per colour, drawn once and then stamped for every bulb of that colour. */
const glows = new Map<string, HTMLCanvasElement>()
const glowOf = ([r, g, b]: number[]) => {
  const key = `${r},${g},${b}`
  let sprite = glows.get(key)
  if (!sprite) {
    sprite = document.createElement('canvas')
    sprite.width = sprite.height = 64
    const ctx = sprite.getContext('2d')!
    const fade = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    fade.addColorStop(0, `rgba(${key},1)`)
    fade.addColorStop(0.35, `rgba(${key},0.55)`)
    fade.addColorStop(1, `rgba(${key},0)`)
    ctx.fillStyle = fade
    ctx.fillRect(0, 0, 64, 64)
    glows.set(key, sprite)
  }
  return sprite
}

type LightsProps = { size: number; height: number; rings: DrawnRing[]; fit: number; everyK: number; palette: string[]; dim: boolean; outer: number }

/**
 * Every ring's row of bulbs, on a canvas: lit in its band's colour on a perfect lock, dark on a miss and on the
 * unlit star. A few thousand bulbs as SVG made each lock repaint them all (30 ms at 100 rings); stamped on a
 * canvas they take a couple of milliseconds, and their glows add up ('lighter') the way real bulbs' light does.
 */
const Lights = memo(function Lights({ size, height, rings, fit, everyK, palette, dim, outer }: LightsProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(height * dpr)
    // Star space (the 300×420 box) through the camera, onto device pixels.
    const k = (size / 300) * dpr * fit
    ctx.setTransform(k, 0, 0, k, (size / 300) * dpr * CENTER * (1 - fit), (size / 300) * dpr * CENTER * (1 - fit))
    const r = 1.35 / fit
    const count = rings.length
    // Rings closer on screen than a bulb is wide would only blur together: light every k-th ring and the outermost.
    const shown = rings.filter((ring) => ring.index === count - 1 || ring.index % everyK === everyK - 1)
    // Bulbs about 11 px apart on screen: a small star gets a few clear bulbs, not a fuzz of them.
    const per = (index: number) => Math.max(1, Math.min(6, Math.round((radii(index).ro * 0.56 * fit) / 11)))
    // How far apart the lit rows sit on screen, 0.3 (packed) to 1: as rows pack in, glows soften and bulbs keep
    // their colour, so the bands still read at 100 rings instead of adding up to white.
    const open = Math.max(0.3, Math.min(1, ((radii(1).ro - radii(0).ro) * fit * everyK) / 9))
    const colour = (index: number) => mixRGB(palette[Math.floor(index / 3) % palette.length], '#ffffff', 0.3)
    const last = rings[count - 1]
    const tips = last ? [0, 1, 2, 3, 4].map((k) => polar(radii(last.index).ro - 2, last.rotation + k * 72 - 90)) : []
    const spots = shown.map((ring) => bulbSpots(ring.index, ring.width, ring.rotation, per(ring.index)))
    ctx.globalCompositeOperation = 'lighter'
    if (!dim) {
      // The lamp in the middle: warm light across the inner rings.
      const lamp = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, outer * 0.6)
      lamp.addColorStop(0, `rgba(255,241,200,${(0.55 * (0.4 + 0.6 * open)).toFixed(2)})`)
      lamp.addColorStop(0.5, `rgba(255,208,138,${(0.18 * (0.4 + 0.6 * open)).toFixed(2)})`)
      lamp.addColorStop(1, 'rgba(255,184,96,0)')
      ctx.fillStyle = lamp
      ctx.beginPath()
      ctx.arc(CENTER, CENTER, outer * 0.6, 0, Math.PI * 2)
      ctx.fill()
      const g = r * 3.4
      ctx.globalAlpha = open
      shown.forEach((ring, i) => {
        if (!ring.perfect) return
        const sprite = glowOf(colour(ring.index))
        for (const [x, y] of spots[i]) ctx.drawImage(sprite, x - g, y - g, g * 2, g * 2)
      })
      ctx.globalAlpha = 1
      // The five tips always shine warm gold, big and clear, as a parol's tip bulbs do.
      const tipGlow = glowOf([255, 226, 160])
      for (const [x, y] of tips) ctx.drawImage(tipGlow, x - r * 6, y - r * 6, r * 12, r * 12)
    }
    ctx.globalCompositeOperation = 'source-over'
    shown.forEach((ring, i) => {
      const lit = !dim && ring.perfect
      ctx.fillStyle = lit ? `rgb(${mixRGB(`#${colour(ring.index).map((c) => c.toString(16).padStart(2, '0')).join('')}`, '#ffffff', 0.15 + 0.3 * open).join(',')})` : UNLIT
      ctx.beginPath()
      for (const [x, y] of spots[i]) {
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
      ctx.fill()
    })
    if (!dim) {
      ctx.fillStyle = '#fff8e6'
      ctx.beginPath()
      for (const [x, y] of tips) {
        ctx.moveTo(x + r * 1.9, y)
        ctx.arc(x, y, r * 1.9, 0, Math.PI * 2)
      }
      ctx.fill()
    }
  }, [size, height, rings, fit, everyK, palette, dim, outer])
  return <canvas ref={ref} className="star-lights" style={{ position: 'absolute', inset: 0, width: size, height }} aria-hidden="true" />
})

type Props = {
  size: number
  /** Lock errors in degrees, one per locked ring: the engine's `locks`. */
  locks: number[]
  /** The ring after these is spinning in: drawn on its own layer, turned by `spinRef`. */
  spinning?: boolean
  /** Receives the spinning layer; set its `style.transform` to `rotate(<ringOffset>deg)` every frame. */
  spinRef?: Ref<SVGSVGElement>
  /** Each night's colours, ring by ring. */
  palette?: string[]
  /** Unlit: the lantern before tonight's first ring (the Ready screen), its bulbs dark. */
  dim?: boolean
  /** The points are nearly too thin: the glow turns red. */
  danger?: boolean
  /** The error of the lock that ended the run: its overhang falls away. */
  failed?: number
  /** Perfect locks in a row (the run's streak): a perfect lock's sparkles grow with it, and a widen sends a ring out. */
  streak?: number
}

/**
 * A parol as San Fernando's giant lanterns are made (design lab: mockups/parol.tsx, B): concentric five-pointed
 * rings of deep coloured vinyl, each traced by a row of bulbs, round a tambor (drum) that is a flower of light,
 * with halos of bulbs and two tails of lights. Lights come in bands of three rings, like a rotor's pattern; a
 * missed ring's bulbs stay dark, so perfect play lights more of the lantern. Bulbs, halos and tails keep their
 * size on screen at any ring count, and every ring is drawn upright (geometry.ts), so a long run ends on the most
 * spectacular parol rather than a faded one.
 * The locked star only redraws the rings that changed when a ring locks; the spinning ring is a separate layer
 * the browser turns on the GPU, so spinning costs no redraw.
 */
export const Star = memo(function Star({ size, locks, spinning = false, spinRef, palette = PALETTE, dim = false, danger = false, failed, streak = 1 }: Props) {
  const id = useId().replace(/:/g, '')
  const rings = drawnRings(locks)
  const count = locks.length
  const last = rings[rings.length - 1]
  const width = last?.width ?? 36
  const rotation = last?.rotation ?? 0
  // Milestones on the star itself: halos at 10, 50 and 80, longer tails at 25, 50 and 75, the rotor chase from 60.
  const halo = count >= 80 ? 3 : count >= 50 ? 2 : count >= 10 ? 1 : 0
  const rotor = count >= 60 && !dim
  const outer = radii(Math.max(0, count - 1 + (spinning ? 1 : 0))).ro
  // The camera pulls back as the star grows, leaving room (in screen units) for the halos round it.
  const fit = Math.min(1, (138 - (halo ? 14 + (halo - 1) * 9 : 2)) / outer)
  const camera = `translate(${CENTER} ${CENTER}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-CENTER})`
  /** A length that stays the same on screen whatever the camera does (the box is 300 wide). */
  const u = (px: number) => px / fit
  const height = (size * 420) / 300
  const layer = { width: size, height, viewBox: '0 0 300 420', 'aria-hidden': true as const }

  // Colours: deep vinyl for the body and the night's colours brightened for the lights (in bands of three rings, see Lights).
  const body = (index: number) => mix(palette[index % palette.length], '#120612', dim ? 0.62 : 0.45)
  const seam = (index: number) => mix(palette[index % palette.length], '#ffffff', 0.35)
  const light = (i: number) => mix(palette[i], '#ffffff', 0.3)
  const line = fit > 0.5 ? 1 : 0.6
  const everyK = Math.max(1, Math.ceil(3 / ((radii(1).ro - radii(0).ro) * fit)))

  const haloR = (h: number) => outer + u(10 + h * 9)
  const haloBulbs = (h: number, phase?: number) =>
    Array.from({ length: 60 }, (_, k) => {
      if (phase !== undefined && k % 3 !== phase) return null
      const [x, y] = polar(haloR(h), k * 6 + h * 3)
      return <circle key={k} cx={x} cy={y} r={u(k % 2 ? 1.2 : 1.9)} fill={dim ? UNLIT : HALO_LIGHTS[h]} />
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

  // Tails of lights on gold cords, hanging from the two lower tips: in screen units, so they never shrink, and
  // longer at 25, 50 and 75 rings.
  const tailLength = 96 + 18 * Math.min(3, Math.floor(count / 25))
  const tails = [54, 126].map((deg, side) => {
    const [sx, sy] = polar(radii(Math.max(0, count - 1)).ro - 3, deg + rotation)
    const x = CENTER + (sx - CENTER) * fit
    const y = CENTER + (sy - CENTER) * fit
    const dir = side === 0 ? 1 : -1
    return { x, y, dir }
  })

  // The newest lock's effect, on a small layer of its own: animating it never redraws the star.
  // A perfect lock flashes gold; an off-angle lock (or the one that ended the run) drops its overhang.
  const newest = rings[count - 1]
  const before = rings[count - 2]
  const drop = (index: number, w: number, turn: number, error: number) => (
    <svg key={`drop-${count}-${failed ?? ''}`} className="lock-drop" {...layer}>
      <g transform={camera}>
        <path d={sliverPath(index, w, turn, error)} fill={body(index)} stroke={seam(index)} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
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

  return (
    <div style={{ position: 'relative', width: size, height }}>
      {spinning && (
        // The spinning ring, behind the locked rings so only its rim shows outside them: translucent vinyl, a bright
        // seam, light streaks behind each tip and a bulb at each. It turns about the star's centre (150, 150 of the
        // 300×420 box), and the camera's scale about that centre doesn't change that.
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
          <g transform={camera}>
            {/* A frame of light waiting to lock: a faint fill, a soft glow and a thin bright line. */}
            <path d={starPath(count, width, rotation)} fill="#fff1c2" fillOpacity="0.06" stroke="#ffd98a" strokeWidth="5" strokeOpacity="0.22" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={starPath(count, width, rotation)} fill="none" stroke="#fff6dc" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {[0, 1, 2, 3, 4].map((k) => {
              const ro = radii(count).ro
              const t = rotation + k * 72 - 90
              const [tx, ty] = polar(ro - 2, t)
              const [sx, sy] = polar(ro - 2, t - 16)
              return (
                <g key={k}>
                  <path d={`M${sx} ${sy}A${ro - 2} ${ro - 2} 0 0 1 ${tx} ${ty}`} fill="none" stroke="#fff1c2" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" vectorEffect="non-scaling-stroke" />
                  <circle cx={tx} cy={ty} r={u(2.4)} fill="#fffaf0" />
                </g>
              )
            })}
          </g>
        </svg>
      )}

      <svg width={size} height={height} viewBox="0 0 300 420" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-aura`}>
            <stop offset="0" stopColor={danger ? '#ff6a4a' : '#ff9a5a'} stopOpacity={dim ? 0.12 : 0.42} />
            <stop offset="0.6" stopColor={danger ? '#ff6a4a' : '#7a3ab8'} stopOpacity={dim ? 0.04 : 0.14} />
            <stop offset="1" stopColor="#7a3ab8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={camera}>
          <circle cx={CENTER} cy={CENTER} r={outer + u(85)} fill={`url(#${id}-aura)`} />

          {/* Halos: rings of light with their own bulbs, as giant lanterns stack them. */}
          {Array.from({ length: halo }, (_, h) => (
            <g key={h}>
              <circle cx={CENTER} cy={CENTER} r={haloR(h)} fill="none" stroke={HALO_LIGHTS[h]} strokeWidth={u(5)} opacity={dim ? 0.05 : 0.16} />
              <circle cx={CENTER} cy={CENTER} r={haloR(h)} fill="none" stroke={HALO_LIGHTS[h]} strokeWidth={u(1)} opacity={dim ? 0.25 : 0.7} />
              {!rotor && haloBulbs(h)}
            </g>
          ))}

          {/* Gold dashes where the spinning ring's points belong */}
          {spinning && <path d={starPath(count, width, rotation)} fill="none" stroke="#ffd27a" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}

          {/* Locked rings, outside in, so each inner ring leaves a coloured rim */}
          {[...rings].reverse().map((ring) => (
            <RingShape key={ring.index} index={ring.index} width={ring.width} rotation={ring.rotation} fill={body(ring.index)} edge={seam(ring.index)} line={line} />
          ))}

          {/* Spokes of light from the tambor out to the tips */}
          {!dim &&
            [0, 1, 2, 3, 4].map((k) => {
              const [x, y] = polar(radii(Math.max(0, count - 1)).ro, rotation + k * 72 - 90)
              return <path key={k} d={`M${CENTER} ${CENTER}L${x.toFixed(1)} ${y.toFixed(1)}`} stroke="#fff3d0" strokeWidth={u(1)} opacity="0.5" />
            })}
        </g>
      </svg>

      <Lights size={size} height={height} rings={rings} fit={fit} everyK={everyK} palette={palette} dim={dim} outer={outer} />

      {/* Above the lights: the tambor and the tails. */}
      <svg width={size} height={height} viewBox="0 0 300 420" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-heart`}>
            <stop offset="0" stopColor="#fff1c8" stopOpacity={dim ? 0.15 : 0.6} />
            <stop offset="1" stopColor="#fff1c8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={camera}>
          {/* The tambor: a flower of light, ten petals in the night's colours round a white heart. */}
          <circle cx={CENTER} cy={CENTER} r={u(18)} fill={`url(#${id}-heart)`} />
          {Array.from({ length: 10 }, (_, k) => (
            <ellipse key={k} cx={CENTER} cy={CENTER - u(9)} rx={u(3.4)} ry={u(8)} fill={dim ? mix(palette[k % palette.length], '#120612', 0.55) : light(k % palette.length)} opacity="0.92" transform={`rotate(${k * 36} ${CENTER} ${CENTER})`} />
          ))}
          <circle cx={CENTER} cy={CENTER} r={u(5.5)} fill={dim ? '#cbb98f' : '#fffaf0'} />
          <circle cx={CENTER} cy={CENTER} r={u(16)} fill="none" stroke={dim ? '#8a7650' : '#ffcf5a'} strokeWidth={u(1.2)} />
        </g>

        {count > 0 &&
          tails.map(({ x, y, dir }, side) => (
            <g key={side}>
              <path d={`M${x.toFixed(1)} ${y.toFixed(1)}c${dir * 8} ${tailLength * 0.4} ${-dir * 10} ${tailLength * 0.7} ${dir * 2} ${tailLength}`} fill="none" stroke={CORD} strokeWidth="1.4" opacity={dim ? 0.45 : 0.8} />
              {Array.from({ length: 9 }, (_, k) => {
                const t = (k + 1) / 10
                return <circle key={k} cx={x + dir * Math.sin(t * 5) * 6} cy={y + tailLength * t} r="2.3" fill={dim ? UNLIT : light(k % palette.length)} />
              })}
              {/* A tassel: a gold cap and a fan of red and gold fringe. */}
              <g transform={`translate(${(x + dir * 2).toFixed(1)} ${(y + tailLength).toFixed(1)})`} opacity={dim ? 0.5 : 1}>
                {[-3, -2, -1, 0, 1, 2, 3].map((f) => (
                  <path key={f} d={`M${f * 0.9} 3l${f * 1.3} 16`} stroke={f % 2 ? '#f2b632' : '#d8342c'} strokeWidth="1.4" strokeLinecap="round" />
                ))}
                <rect x="-4" y="-2" width="8" height="6" rx="2.5" fill="#f2b632" />
              </g>
            </g>
          ))}
      </svg>
      {chase}
      {effect}
      {widen}
    </div>
  )
})
