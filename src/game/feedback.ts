// What the screen says about the run: the message after each lock and the milestones (words in src/copy.ts).
import type { Engine } from './engine.ts'
import { RULES } from './rules.ts'
import { t } from '../copy.ts'

export type Feedback = { title: string; tone: 'gold' | 'coral' }

const isPerfect = (error: number) => Math.abs(error) <= RULES.perfectWithin + 1e-9

/** The message for the latest lock, or null before the first. */
export const lockFeedback = (engine: Engine): Feedback | null => {
  const error = engine.locks[engine.locks.length - 1]
  if (error === undefined) return null
  if (isPerfect(error) && engine.run.streak % RULES.widenEvery === 0) return { title: t().perfectWiden, tone: 'gold' }
  if (isPerfect(error)) return { title: t().perfect, tone: 'gold' }
  return { title: t().off(Math.round(Math.abs(error))), tone: 'coral' }
}

/** The next milestone after `rings`: where it is, how many rings to go and what it brings. */
export const nextGoal = (rings: number) => {
  const at = (Math.floor(Math.max(0, rings) / RULES.milestoneEvery) + 1) * RULES.milestoneEvery
  return { at, toGo: at - rings, what: t().goals[at] ?? t().goalSky }
}

/** A reason to try one more time: ten rings on a first night, then one beyond tonight's best. */
export const personalGoal = (best: number, rings = 0) => {
  const target = best > 0 ? best + 1 : RULES.milestoneEvery
  return { target, toGo: Math.max(0, target - rings), met: rings >= target }
}

/** The final ring's direction turns its signed alignment error into an actionable early-or-late cue. */
export const endCoach = (error: number, direction: 1 | -1) => {
  const early = error * direction < 0
  return {
    title: early ? t().endEarly : t().endLate,
    detail: t().endMiss(Math.round(Math.abs(error) * 10) / 10),
  }
}

/** What a milestone brings, when `rings` is one; past 100 every 10 rings adds a star to the sky. */
export const milestoneText = (rings: number) =>
  rings <= 0 || rings % RULES.milestoneEvery !== 0 ? null : (t().milestones[rings] ?? t().milestoneSky)
