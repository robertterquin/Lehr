// The parol design lab (development only): today's parol beside three redesigns, each at 3, 12, 30, 60 and 100
// rings, so the choice is judged across a whole run. Today's star gets worse as it grows (thin spikes, washed-out
// colour, tails and bulbs shrinking to nothing); each direction is built to get more glorious instead.
//   A · Ilaw — today's parol made luminous: a lamp inside, frame lines that fade as rings pack in, a glowing rim,
//       and tails, tip bulbs and halo that keep their size on screen at any ring count.
//   B · Parul Sampernandu — the San Fernando giant lantern: deep coloured vinyl lit by rows of bulbs along every
//       ring, coloured ring by ring like a rotor, a bulb rosette at the tambor and extra halo rings.
//   C · Papel — the handmade parol: papel de Hapon with a crinkle, a cut fringe round the edge, bamboo spokes,
//       and long fringed paper tails.
// ?s=<id> shows one row; the page alone shows all four.
import { StrictMode, useId, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import '../src/index.css'
import { CENTER, drawnRings, polar, radii, starPath, type DrawnRing } from '../src/draw/geometry.ts'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Star } from '../src/draw/star.tsx'

/** A believable run: mostly perfect, a miss now and then, so the star turns and thins like a real one. */
const runLocks = (n: number) => Array.from({ length: n }, (_, i) => (i % 7 === 3 ? 5 : i % 11 === 6 ? -4 : i % 5 === 1 ? 1.5 : 0))
const STAGES = [3, 12, 30, 60, 100]
const PAL = NIGHTS[1].palette

const hex = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)
const mix = (a: string, b: string, t: number) => `rgb(${[0, 1, 2].map((i) => Math.round(hex(a, i) + (hex(b, i) - hex(a, i)) * t)).join(' ')})`
const f1 = (n: number) => n.toFixed(1)

/** What every direction needs: the rings, the outermost radius, a camera that keeps the star in frame, and a
 *  unit that stays the same size on screen whatever the camera does. */
function frame(locks: number[], room: number) {
  const rings = drawnRings(locks)
  const n = rings.length
  const last = rings[n - 1] ?? { index: 0, width: 36, rotation: 0, perfect: true }
  const ro = radii(Math.max(0, n - 1)).ro
  const fit = Math.min(1, 112 / (ro + room))
  const cam = `translate(${CENTER} ${CENTER}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-CENTER})`
  /** A length in screen units (the 300-wide box), whatever the camera's zoom. */
  const u = (px: number) => px / fit
  /** A star-space point in screen space, for things drawn outside the camera (tails). */
  const screen = ([x, y]: [number, number]): [number, number] => [CENTER + (x - CENTER) * fit, CENTER + (y - CENTER) * fit]
  return { rings, n, last, ro, fit, cam, u, screen }
}

/** Tips of a ring, in star space. */
const tips = (r: DrawnRing, inset = 0) => [0, 1, 2, 3, 4].map((k) => polar(radii(r.index).ro - inset, r.rotation + k * 72 - 90))

/** Two tails hanging from the lower tips, drawn in screen units so they never shrink. `strip` draws one strand. */
function Tails({ from, length, strip }: { from: [number, number][]; length: number; strip: (x: number, y: number, dir: 1 | -1, len: number) => ReactNode }) {
  return (
    <>
      {from.map(([x, y], side) => (
        <g key={side}>{strip(x, y, side === 0 ? 1 : -1, length)}</g>
      ))}
    </>
  )
}

/* ── A · Ilaw ──────────────────────────────────────────────────────────────────────────────────────────────── */

function Ilaw({ size, locks }: { size: number; locks: number[] }) {
  const id = useId().replace(/:/g, '')
  const { rings, n, last, ro, cam, u, screen, fit } = frame(locks, n0(locks) >= 10 ? 16 : 4)
  const halo = n >= 10
  // Bamboo lines step back as rings pack in, so colour carries a big star instead of brown lines.
  const frameAlpha = Math.max(0.12, Math.min(0.85, fit * 1.7 - 0.25))
  const lower = [54, 126].map((d) => screen(polar(ro - 3, last.rotation + d)))
  return (
    <svg width={size} height={(size * 420) / 300} viewBox="0 0 300 420" overflow="visible">
      <defs>
        {PAL.map((c, i) => (
          <radialGradient key={i} id={`${id}p${i}`} gradientUnits="userSpaceOnUse" cx={CENTER} cy={CENTER} r={ro + 10}>
            <stop offset="0" stopColor={mix(c, '#fffaf0', 0.7)} />
            <stop offset="0.5" stopColor={mix(c, '#fff2d0', 0.12)} />
            <stop offset="1" stopColor={mix(c, '#3a1404', 0.18)} />
          </radialGradient>
        ))}
        <radialGradient id={`${id}lamp`}>
          <stop offset="0" stopColor="#fffbe8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffd98a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb850" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}aura`}>
          <stop offset="0" stopColor="#ffbe5a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffbe5a" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={u(3).toFixed(2)} />
        </filter>
      </defs>
      <g transform={cam}>
        <circle cx={CENTER} cy={CENTER} r={ro + u(70)} fill={`url(#${id}aura)`} />
        {halo && (
          <g>
            <circle cx={CENTER} cy={CENTER} r={ro + u(14)} fill="none" stroke="#ffcf7a" strokeWidth={u(6)} opacity="0.25" filter={`url(#${id}blur)`} />
            <circle cx={CENTER} cy={CENTER} r={ro + u(14)} fill="none" stroke="#e9b25a" strokeWidth={u(1.6)} />
            {Array.from({ length: 20 }, (_, k) => {
              const [x, y] = polar(ro + u(14), k * 18)
              return <circle key={k} cx={x} cy={y} r={u(2.2)} fill="#fff6d6" />
            })}
          </g>
        )}
        {[...rings].reverse().map((r) => (
          <path key={r.index} d={starPath(r.index, r.width, r.rotation)} fill={`url(#${id}p${r.index % PAL.length})`} stroke="#5a3414" strokeOpacity={frameAlpha} strokeWidth={u(0.9)} strokeLinejoin="round" />
        ))}
        {/* The lamp inside: light that brightens the paper from the middle out. */}
        <circle cx={CENTER} cy={CENTER} r={ro * 0.85} fill={`url(#${id}lamp)`} style={{ mixBlendMode: 'screen' }} />
        {/* A glowing gold rim on the outermost ring keeps the silhouette bold at any size. */}
        <path d={starPath(last.index, last.width, last.rotation)} fill="none" stroke="#ffd98a" strokeWidth={u(5)} opacity="0.55" filter={`url(#${id}blur)`} />
        <path d={starPath(last.index, last.width, last.rotation)} fill="none" stroke="#fff0c8" strokeWidth={u(1.4)} strokeLinejoin="round" />
        {/* Bulbs: the outermost tips, and the tips of every fifth perfect ring, always the same size on screen. */}
        {rings
          .filter((r) => r.index === last.index || (r.perfect && r.index % 5 === 4))
          .flatMap((r) => tips(r, 2).map(([x, y], k) => (
            <g key={`${r.index}-${k}`}>
              <circle cx={x} cy={y} r={u(5)} fill="#ffe7a8" opacity="0.45" filter={`url(#${id}blur)`} />
              <circle cx={x} cy={y} r={u(2)} fill="#fffaf0" />
            </g>
          )))}
        <circle cx={CENTER} cy={CENTER} r={u(13)} fill="#ffe7a8" stroke="#8a5a22" strokeWidth={u(1.5)} />
        <circle cx={CENTER} cy={CENTER} r={u(7)} fill="#fffaf0" />
      </g>
      <Tails
        from={lower}
        length={118}
        strip={(x, y, dir, len) => (
          <>
            {['#f2b632', '#d8342c', '#fff4dc'].map((c, s) => (
              <path key={s} d={`M${f1(x + (s - 1) * 3)} ${f1(y)}c${dir * 10} ${len * 0.35} ${-dir * 12} ${len * 0.62} ${dir * 4} ${len}`} fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
            ))}
            <path d={`M${f1(x + dir * 4)} ${f1(y + len - 4)}l-5 6l5 14l5 -14z`} fill="#d8342c" />
          </>
        )}
      />
    </svg>
  )
}
const n0 = (locks: number[]) => locks.length

/* ── B · Parul Sampernandu ─────────────────────────────────────────────────────────────────────────────────── */

const BULBS = ['#fff6d6', '#ffcf5a', '#ff6a5a', '#5ee0a0', '#6aa8ff', '#e08aff']
const HALO = ['#ffcf5a', '#fff6d6', '#ff8a6a']

function Sampernandu({ size, locks }: { size: number; locks: number[] }) {
  const id = useId().replace(/:/g, '')
  const { rings, n, last, ro, cam, u, screen } = frame(locks, n0(locks) >= 10 ? 34 : 6)
  const halos = n >= 50 ? 2 : n >= 10 ? 1 : 0
  const lower = [54, 126].map((d) => screen(polar(ro - 3, last.rotation + d)))
  // Rows of bulbs along each ring's whole outline, the points and the valleys between them, so the core fills with
  // concentric rings of light as a giant lantern's does. Colour comes in bands of three rings, like a rotor's
  // pattern; a missed ring stays dark, so perfect play lights more of the lantern.
  const along = (r: DrawnRing) => {
    const { ri, ro: o, rv } = radii(r.index)
    const out: [number, number][] = []
    const run = (p: [number, number], q: [number, number], steps: number) => {
      for (let s = 0; s < steps; s++) out.push([p[0] + ((q[0] - p[0]) * s) / steps, p[1] + ((q[1] - p[1]) * s) / steps])
    }
    for (let k = 0; k < 5; k++) {
      const t = r.rotation + k * 72 - 90
      const a = polar(ri, t - r.width / 2)
      const b = polar(o, t)
      const c = polar(ri, t + r.width / 2)
      const v = polar(rv, t + 36)
      const next = polar(ri, t + 72 - r.width / 2)
      run(a, b, 4)
      run(b, c, 4)
      run(c, v, 2)
      run(v, next, 2)
    }
    return out
  }
  const band = (r: DrawnRing) => BULBS[Math.floor(r.index / 3) % BULBS.length]
  return (
    <svg width={size} height={(size * 420) / 300} viewBox="0 0 300 420" overflow="visible">
      <defs>
        <radialGradient id={`${id}aura`}>
          <stop offset="0" stopColor="#ff9a5a" stopOpacity="0.45" />
          <stop offset="0.6" stopColor="#7a3ab8" stopOpacity="0.15" />
          <stop offset="1" stopColor="#7a3ab8" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={u(2.2).toFixed(2)} />
        </filter>
      </defs>
      <g transform={cam}>
        <circle cx={CENTER} cy={CENTER} r={ro + u(90)} fill={`url(#${id}aura)`} />
        {/* Halo rings with their own bulbs and spokes, as giant lanterns stack them. */}
        {Array.from({ length: halos }, (_, h) => {
          const r = ro + u(10 + h * 9)
          return (
            <g key={h}>
              <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke={HALO[h]} strokeWidth={u(5)} opacity="0.22" filter={`url(#${id}glow)`} />
              <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke={HALO[h]} strokeWidth={u(1)} opacity="0.7" />
              {Array.from({ length: 60 }, (_, k) => {
                const [x, y] = polar(r, k * 6 + h * 3)
                return <circle key={k} cx={x} cy={y} r={u(k % 2 ? 1.2 : 1.9)} fill={HALO[h]} />
              })}
            </g>
          )
        })}
        {[...rings].reverse().map((r) => (
          <path key={r.index} d={starPath(r.index, r.width, r.rotation)} fill={mix(PAL[r.index % PAL.length], '#120612', 0.45)} stroke={mix(PAL[r.index % PAL.length], '#ffffff', 0.35)} strokeOpacity="0.5" strokeWidth={u(0.6)} strokeLinejoin="round" />
        ))}
        {/* Spokes of light from the tambor to the outer tips. */}
        {tips(last).map(([x, y], k) => (
          <path key={k} d={`M${CENTER} ${CENTER}L${f1(x)} ${f1(y)}`} stroke="#fff3d0" strokeWidth={u(1)} opacity="0.55" />
        ))}
        <g filter={`url(#${id}glow)`}>
          {rings.filter((r) => r.perfect).flatMap((r) => along(r).map(([x, y], k) => <circle key={`${r.index}-${k}`} cx={x} cy={y} r={u(2.4)} fill={band(r)} />))}
        </g>
        {rings.flatMap((r) => along(r).map(([x, y], k) => <circle key={`${r.index}-${k}`} cx={x} cy={y} r={u(0.95)} fill={r.perfect ? mix(band(r), '#ffffff', 0.6) : '#4a3a4a'} />))}
        {/* The tambor: a rosette of bulbs in rings round the drum. */}
        {/* The tambor: a flower of light, ten petals in the bulb colours round a white heart. */}
        <circle cx={CENTER} cy={CENTER} r={u(17)} fill="#fff1c8" opacity="0.35" filter={`url(#${id}glow)`} />
        {Array.from({ length: 10 }, (_, k) => (
          <ellipse key={k} cx={CENTER} cy={CENTER - u(9)} rx={u(3.4)} ry={u(8)} fill={BULBS[k % BULBS.length]} opacity="0.9" transform={`rotate(${k * 36} ${CENTER} ${CENTER})`} />
        ))}
        <circle cx={CENTER} cy={CENTER} r={u(5.5)} fill="#fffaf0" />
        <circle cx={CENTER} cy={CENTER} r={u(16)} fill="none" stroke="#ffcf5a" strokeWidth={u(1.2)} />
      </g>
      <Tails
        from={lower}
        length={110}
        strip={(x, y, dir, len) => (
          <>
            <path d={`M${f1(x)} ${f1(y)}c${dir * 8} ${len * 0.4} ${-dir * 10} ${len * 0.7} ${dir * 2} ${len}`} fill="none" stroke="#e9b25a" strokeWidth="1.4" opacity="0.8" />
            {Array.from({ length: 9 }, (_, k) => {
              const t = (k + 1) / 10
              return <circle key={k} cx={x + dir * Math.sin(t * 5) * 6} cy={y + len * t} r="2.3" fill={BULBS[k % BULBS.length]} />
            })}
          </>
        )}
      />
    </svg>
  )
}

/* ── C · Papel ─────────────────────────────────────────────────────────────────────────────────────────────── */

function Papel({ size, locks }: { size: number; locks: number[] }) {
  const id = useId().replace(/:/g, '')
  const { rings, n, last, ro, cam, u, screen } = frame(locks, 10)
  const lower = [54, 126].map((d) => screen(polar(ro - 3, last.rotation + d)))
  // The cut fringe (palamuti): short strokes standing out from the outermost ring's edge.
  const fringe = () => {
    const out: string[] = []
    const { ri, ro: o } = radii(last.index)
    for (let k = 0; k < 5; k++) {
      const t = last.rotation + k * 72 - 90
      const edges: [[number, number], [number, number]][] = [
        [polar(ri, t - last.width / 2), polar(o, t)],
        [polar(o, t), polar(ri, t + last.width / 2)],
      ]
      for (const [p, q] of edges) {
        const len = Math.hypot(q[0] - p[0], q[1] - p[1])
        const nx = (q[1] - p[1]) / len
        const ny = -(q[0] - p[0]) / len
        const steps = Math.max(6, Math.round(len / u(3.2)))
        for (let s = 0; s <= steps; s++) {
          const x = p[0] + ((q[0] - p[0]) * s) / steps
          const y = p[1] + ((q[1] - p[1]) * s) / steps
          // Out from the star: flip the normal if it points to the centre.
          const flip = (x - CENTER) * nx + (y - CENTER) * ny < 0 ? -1 : 1
          out.push(`M${f1(x)} ${f1(y)}l${f1(nx * flip * u(5))} ${f1(ny * flip * u(5))}`)
        }
      }
    }
    return out.join('')
  }
  return (
    <svg width={size} height={(size * 420) / 300} viewBox="0 0 300 420" overflow="visible">
      <defs>
        {/* Papel de Hapon: a fine crinkle through the colour. */}
        <filter id={`${id}crinkle`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.25" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.55" result="shade" />
          <feComposite in="shade" in2="SourceGraphic" operator="in" result="crinkle" />
          <feBlend in="SourceGraphic" in2="crinkle" mode="multiply" />
        </filter>
        <radialGradient id={`${id}warm`}>
          <stop offset="0" stopColor="#fff2c8" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#ffd28a" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffb860" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}aura`}>
          <stop offset="0" stopColor="#ffc070" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffc070" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam}>
        <circle cx={CENTER} cy={CENTER} r={ro + u(60)} fill={`url(#${id}aura)`} />
        <path d={fringe()} stroke={mix(PAL[last.index % PAL.length], '#fff4dc', 0.25)} strokeWidth={u(1.2)} strokeLinecap="round" />
        <g filter={`url(#${id}crinkle)`}>
          {[...rings].reverse().map((r) => (
            <path key={r.index} d={starPath(r.index, r.width, r.rotation)} fill={mix(PAL[r.index % PAL.length], '#fff8ec', 0.18)} stroke={mix(PAL[r.index % PAL.length], '#2a1404', 0.35)} strokeOpacity={n > 30 ? 0.18 : 0.45} strokeWidth={u(0.7)} strokeLinejoin="round" />
          ))}
        </g>
        <circle cx={CENTER} cy={CENTER} r={ro * 0.8} fill={`url(#${id}warm)`} style={{ mixBlendMode: 'screen' }} />
        {/* Bamboo: five spokes to the tips and the outer frame, nothing else, so a big star stays paper, not lines. */}
        {tips(last).map(([x, y], k) => (
          <path key={k} d={`M${CENTER} ${CENTER}L${f1(x)} ${f1(y)}`} stroke="#8a5a2a" strokeWidth={u(1.8)} strokeLinecap="round" opacity="0.8" />
        ))}
        <path d={starPath(last.index, last.width, last.rotation)} fill="none" stroke="#7a4a1e" strokeWidth={u(2)} strokeLinejoin="round" />
        <circle cx={CENTER} cy={CENTER} r={u(12)} fill={PAL[1]} stroke="#7a4a1e" strokeWidth={u(1.8)} />
        <circle cx={CENTER} cy={CENTER} r={u(5)} fill="#fff4dc" />
      </g>
      <Tails
        from={lower}
        length={150}
        strip={(x, y, dir, len) => (
          <>
            {Array.from({ length: 7 }, (_, s) => {
              const dx = (s - 3) * 2.2
              const l = len * (0.82 + ((s * 37) % 10) / 50)
              return <path key={s} d={`M${f1(x + dx)} ${f1(y)}c${dir * (8 + s)} ${l * 0.35} ${-dir * (10 + s)} ${l * 0.65} ${dir * (3 + s * 0.6)} ${l}`} fill="none" stroke={PAL[s % PAL.length]} strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            })}
            <circle cx={x + dir * 5} cy={y + len * 0.98} r="5" fill={PAL[0]} />
          </>
        )}
      />
    </svg>
  )
}

/* ── The page ──────────────────────────────────────────────────────────────────────────────────────────────── */

const ROWS: { id: string; title: string; note: string; Draw: (p: { size: number; locks: number[] }) => ReactNode }[] = [
  { id: 'today', title: 'Today', note: 'Gets worse as it grows: thin spikes, washed-out colour, tails and bulbs shrink away.', Draw: ({ size, locks }) => <Star size={size} locks={locks} palette={PAL} /> },
  { id: 'ilaw', title: 'A · Ilaw', note: 'Today’s parol made luminous: a lamp inside, fading frame, glowing rim; tails, bulbs and halo keep their size.', Draw: Ilaw },
  { id: 'sampernandu', title: 'B · Parul Sampernandu', note: 'The giant lantern: rows of bulbs on every ring like a rotor, deep vinyl colours, bulb rosette, stacked halos.', Draw: Sampernandu },
  { id: 'papel', title: 'C · Papel', note: 'The handmade parol: papel de Hapon crinkle, cut fringe, bamboo spokes, long fringed paper tails.', Draw: Papel },
]

function Row({ row }: { row: (typeof ROWS)[number] }) {
  return (
    <section style={{ padding: '18px 24px 8px' }}>
      <p style={{ margin: 0, font: '400 22px var(--font-display)', color: '#f7f0e3' }}>{row.title}</p>
      <p style={{ margin: '4px 0 0', font: '500 13px var(--font-ui)', color: '#c9bfe0' }}>{row.note}</p>
      <div style={{ display: 'flex', gap: 18, marginTop: 6 }}>
        {STAGES.map((n) => (
          <figure key={n} style={{ margin: 0, width: 300, textAlign: 'center', color: '#a99fc4', font: '600 12px var(--font-ui)' }}>
            <div style={{ height: 380, overflow: 'hidden' }}>
              <row.Draw size={300} locks={runLocks(n)} />
            </div>
            <figcaption>{n} rings</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

const only = ROWS.find((r) => r.id === new URLSearchParams(location.search).get('s'))
/** ?hero: the giant lantern large, early and late in a run, to judge the detail. */
const hero = new URLSearchParams(location.search).has('hero')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hero ? (
      <main style={{ width: 1400, height: 860, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', paddingTop: 30, background: 'radial-gradient(ellipse at 50% 35%, #241a48, #0b0918 70%)' }}>
        <Sampernandu size={560} locks={runLocks(12)} />
        <Sampernandu size={560} locks={runLocks(100)} />
      </main>
    ) : (
      <main style={{ width: 1640, background: 'radial-gradient(ellipse at 50% 30%, #241a48, #0b0918 70%)' }}>
        {(only ? [only] : ROWS).map((row) => (
          <Row key={row.id} row={row} />
        ))}
      </main>
    )}
  </StrictMode>,
)
