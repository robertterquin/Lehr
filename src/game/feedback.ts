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
  return `Ring ${engine.run.rings + 1} locked ${Math.round(off)}° off, leaving ${Math.max(0, Math.round(engine.run.width))}° points (${RULES.minWidth}° needed)`
}
