// What the screen says about the run: the message after each lock and the milestones.
import type { Engine } from './engine.ts'
import { RULES } from './rules.ts'

export type Feedback = { title: string; tone: 'gold' | 'coral' }

const isPerfect = (error: number) => Math.abs(error) <= RULES.perfectWithin + 1e-9

/** The message for the latest lock, or null before the first. */
export const lockFeedback = (engine: Engine): Feedback | null => {
  const error = engine.locks[engine.locks.length - 1]
  if (error === undefined) return null
  if (isPerfect(error) && engine.run.streak % RULES.widenEvery === 0) return { title: `Perfect ×${RULES.widenEvery}`, tone: 'gold' }
  if (isPerfect(error)) return { title: 'Perfect', tone: 'gold' }
  return { title: `${Math.round(Math.abs(error))}° off`, tone: 'coral' }
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

/** Each milestone as a reward to reach: "6 to go · the neighbours’ parols". */
const GOALS: Record<number, string> = {
  10: 'a halo',
  20: 'the street lights',
  30: 'the neighbours’ parols',
  40: 'the carolers',
  50: 'a second halo',
  60: 'rotor mode',
  70: 'the lantern festival',
  80: 'fireworks',
  90: 'Simbang Gabi dawn',
  100: 'the Star of Bethlehem',
}

/** The next milestone after `rings`: where it is, how many rings to go and what it brings. */
export const nextGoal = (rings: number) => {
  const at = (Math.floor(Math.max(0, rings) / RULES.milestoneEvery) + 1) * RULES.milestoneEvery
  return { at, toGo: at - rings, what: GOALS[at] ?? 'a new star in the sky' }
}

/** What a milestone brings, when `rings` is one; past 100 every 10 rings adds a star to the sky. */
export const milestoneText = (rings: number) =>
  rings <= 0 || rings % RULES.milestoneEvery !== 0 ? null : (MILESTONES[rings] ?? 'A new star joins your sky')
