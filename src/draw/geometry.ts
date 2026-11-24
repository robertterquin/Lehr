// Star geometry: every ring is the same five-pointed star, scaled up, in a 300×420 box centred at (150, 150).
import { RULES, lock, startRun, type Rules } from '../game/rules.ts'

/** Paper colours of the first night; each night has its own (src/draw/nights.tsx). */
export const PALETTE = ['#f4ecd8', '#d8342c', '#f2b632', '#2e9a5a', '#2f6fd0', '#c43a8a']
export const CENTER = 150

export const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)]
}

/** Outer tip, inner corner and valley radii of ring `ring`. */
export const radii = (ring: number) => {
  const ro = 46 + ring * 9
  const ri = ro * 0.44
  return { ri, ro, rv: ri * 0.93 }
}

/** Outline of ring `ring` with points `width` degrees wide, turned by `rotation`. */
export const starPath = (ring: number, width: number, rotation: number) => {
  const { ri, ro, rv } = radii(ring)
  const points: [number, number][] = []
  for (let k = 0; k < 5; k++) {
    const t = rotation + k * 72 - 90
    points.push(polar(ri, t - width / 2), polar(ro, t), polar(ri, t + width / 2), polar(rv, t + 36))
  }
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`
}

export type DrawnRing = { index: number; width: number; rotation: number; perfect: boolean }

/** The narrowest points a ring is drawn with: the run's width still thins the star, but never into spikes. */
export const DRAWN_MIN_WIDTH = 20

/**
 * How wide a ring's points are drawn for the run's `width`: eased from the full 36° down to 20° as the width
 * falls to the 8° minimum. A run ends when its points are too thin, so drawn as they are, every long run would
 * finish as a spiky asterisk; eased, it stays a parol. The gauge still shows the true width.
 */
export const drawnWidth = (width: number, rules: Rules = RULES) =>
  DRAWN_MIN_WIDTH + (rules.startWidth - DRAWN_MIN_WIDTH) * Math.max(0, Math.min(1, (width - rules.minWidth) / (rules.startWidth - rules.minWidth)))

/**
 * Each locked ring's shape, replayed from the lock errors under the rules. Every ring is drawn upright
 * (rotation 0): the run's turn from off-angle locks is a drawing choice, and turned layers piled up into a
 * ten-pointed web that no longer looked like a parol. The spinning ring is drawn upright too, so a perfect tap
 * still lines up with the star.
 */
export const drawnRings = (locks: number[], rules: Rules = RULES): DrawnRing[] => {
  let run = startRun(rules)
  return locks.map((error, index) => {
    run = lock(run, error, rules)
    return { index, width: drawnWidth(run.width, rules), rotation: 0, perfect: Math.abs(error) <= rules.perfectWithin + 1e-9 }
  })
}

/** The overhang trimmed off ring `ring` (points `width` wide at `rotation`) when it locks `error` degrees off. */
export const sliverPath = (ring: number, width: number, rotation: number, error: number) => {
  const { ri, ro } = radii(ring)
  let d = ''
  for (let k = 0; k < 5; k++) {
    const t = rotation + k * 72 - 90
    const a1 = error > 0 ? t + width / 2 : t - width / 2 + error
    const a2 = error > 0 ? t + width / 2 + error : t - width / 2
    d += `M${[polar(ri - 2, a1), polar(ro - 8, a1), polar(ro - 12, a2), polar(ri - 2, a2)].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`
  }
  return d
}
