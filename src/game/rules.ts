// Parol's rules as numbers and pure functions, shared by the game, the balance simulation and (later) the server.
// The reasons behind each number are in GAME-RULES.md.
import { randomForSeed } from './daily.ts'

export const RULES = {
  /** Degrees each star point spans at the start of a run. */
  startWidth: 36,
  /** Below this the points can't hold a ring and the run ends. */
  minWidth: 8,
  /** A lock within this many degrees of alignment is perfect: nothing is trimmed. */
  perfectWithin: 2.5,
  /** This many perfects in a row widen the points again… */
  widenEvery: 5,
  /** …by this many degrees, never past startWidth. */
  widenBy: 6,
  /** Spin speed of the first ring, degrees per second (shown as 1.0×). */
  baseSpeed: 50,
  /** How quickly the speed climbs ring by ring (the curve is 1 + speedGrowth × ln(1 + ring / 2)). */
  speedGrowth: 0.35,
  /** Rings never spin faster than this multiple of baseSpeed. */
  maxSpeedFactor: 2.5,
  /** The day's seed nudges each ring's speed by up to ± this percent. */
  speedJitter: 8,
  /** The spin reverses direction every this many rings. */
  reverseEvery: 5,
  /** A new ring fades in for this long; taps in that time are ignored. */
  spinInMs: 150,
  /** Every this many rings is a milestone… */
  milestoneEvery: 10,
  /** …and the next ring waits this long, so the moment lands. */
  milestoneBreakMs: 1500,
}
export type Rules = typeof RULES

/** How much faster ring `ring` (0-based) spins than the first: quick at first, flattening towards the cap. */
export const speedFactor = (ring: number, rules: Rules = RULES) => Math.min(rules.maxSpeedFactor, 1 + rules.speedGrowth * Math.log(1 + ring / 2))

/** The day's seeded nudge for one ring, a whole percent from −speedJitter to +speedJitter. */
export const speedJitterPercent = (seed: number, ring: number, rules: Rules = RULES) =>
  Math.round((randomForSeed((seed ^ Math.imul(ring + 1, 0x9e3779b9)) >>> 0)() * 2 - 1) * rules.speedJitter)

/** Spin speed of ring `ring` on the day with `seed`, in degrees per second. */
export const ringSpeed = (seed: number, ring: number, rules: Rules = RULES) =>
  rules.baseSpeed * speedFactor(ring, rules) * (1 + speedJitterPercent(seed, ring, rules) / 100)

/** 1 clockwise, −1 counter-clockwise; reverses every `reverseEvery` rings. */
export const ringDirection = (ring: number, rules: Rules = RULES) => (Math.floor(ring / rules.reverseEvery) % 2 === 0 ? 1 : -1)

/** Signed distance (degrees, −36 to 36) from the ring's angle to the nearest alignment: the star repeats every 72°. */
export const lockError = (angle: number) => ((((angle % 72) + 108) % 72) - 36)

export type Run = {
  /** Rings locked: the score. */
  rings: number
  perfects: number
  /** Current point width in degrees. */
  width: number
  /** How far off-angle locks have turned the star, degrees (drawing only). */
  rotation: number
  /** Perfect locks in a row. */
  streak: number
  ended: boolean
}

export const startRun = (rules: Rules = RULES): Run => ({ rings: 0, perfects: 0, width: rules.startWidth, rotation: 0, streak: 0, ended: false })

/** Locks the spinning ring `error` degrees off alignment. A lock that leaves the points too thin ends the run and doesn't count. */
export const lock = (run: Run, error: number, rules: Rules = RULES): Run => {
  if (run.ended) return run
  const off = Math.abs(error)
  // The epsilon keeps a lock computed as 2.5000000001° (float rounding) perfect.
  if (off <= rules.perfectWithin + 1e-9) {
    const streak = run.streak + 1
    const width = streak % rules.widenEvery === 0 ? Math.min(rules.startWidth, run.width + rules.widenBy) : run.width
    return { ...run, rings: run.rings + 1, perfects: run.perfects + 1, streak, width }
  }
  const width = run.width - off
  // The same epsilon keeps points left at 7.9999999° (a lock timed in ms) holding, like exactly 8°.
  if (width < rules.minWidth - 1e-9) return { ...run, width, streak: 0, ended: true }
  return { ...run, rings: run.rings + 1, width, streak: 0, rotation: run.rotation + error / 2 }
}
