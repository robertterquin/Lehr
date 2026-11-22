// What the screen says about the run: the message after each lock, the spin label and why a run ended.
import type { Engine } from './engine.ts'
import { RULES, ringDirection, speedFactor } from './rules.ts'

export type Feedback = { title: string; note: string; tone: 'gold' | 'coral' }

const isPerfect = (error: number) => Math.abs(error) <= RULES.perfectWithin + 1e-9

/** The message for the latest lock, or null before the first. */
export const lockFeedback = (engine: Engine): Feedback | null => {
  const error = engine.locks[engine.locks.length - 1]
  if (error === undefined) return null
  const width = Math.round(engine.run.width)
  if (isPerfect(error) && engine.run.streak % RULES.widenEvery === 0) return { title: `Perfect ×${RULES.widenEvery}`, note: `The points widen back to ${width}°`, tone: 'gold' }
  if (isPerfect(error)) return { title: 'Perfect', note: `Locked within ${RULES.perfectWithin}° · the points stay ${width}°`, tone: 'gold' }
  return { title: `${Math.round(Math.abs(error))}° off`, note: `The overhang is trimmed · the points are now ${width}°`, tone: 'coral' }
}

/** Speed and direction of ring `ring`, as the meter shows it. */
export const spinLabel = (ring: number) => `${speedFactor(ring).toFixed(1)}× · ${ringDirection(ring) === 1 ? 'clockwise' : 'counter-clockwise'}`

/** Why the run ended, once it has. */
export const endNote = (engine: Engine) => {
  const off = Math.abs(engine.endError ?? 0)
  // Just the miss: the points it left are under the minimum by definition, and rounding them could read as 8°.
  return `Ring ${engine.run.rings + 1} locked ${Math.round(off)}° off`
}

const MILESTONES: Record<number, string> = {
  10: 'Your parol earned a halo',
  20: 'The street lights come on',
  30: 'The neighbours light their parols',
  40: 'The carolers come down the street',
  50: 'A second halo · the barangay lights up',
  60: 'Rotor mode: every ring lights up',
  70: 'The lantern festival begins',
  80: 'A third halo · fireworks over the town',
  90: 'Simbang Gabi dawn',
  100: 'Your parol became a star',
}

/** What a milestone brings, when `rings` is one; past 100 every 10 rings adds a star to the sky. */
export const milestoneText = (rings: number) =>
  rings <= 0 || rings % RULES.milestoneEvery !== 0 ? null : (MILESTONES[rings] ?? 'A new star joins your sky')
