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

/** Each locked ring's shape, replayed from the lock errors under the rules. */
export const drawnRings = (locks: number[], rules: Rules = RULES): DrawnRing[] => {
  let run = startRun(rules)
  return locks.map((error, index) => {
    run = lock(run, error, rules)
    return { index, width: run.width, rotation: run.rotation, perfect: Math.abs(error) <= rules.perfectWithin + 1e-9 }
  })
}
