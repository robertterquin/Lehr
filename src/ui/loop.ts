import { SIMULATION_HZ, advance, type GameState } from '../engine/engine.ts'

export const TICK_MS = 1000 / SIMULATION_HZ
const MAX_CATCH_UP_MS = 250

/**
 * Advances the engine by real elapsed time in fixed ticks, carrying the remainder.
 * Large gaps (a stalled tab) are capped so the game never fast-forwards through a bubble.
 */
export function advanceTime(game: GameState, carryMs: number, elapsedMs: number) {
  let carry = carryMs + Math.min(MAX_CATCH_UP_MS, Math.max(0, elapsedMs))
  let next = game
  // The epsilon stops float rounding (6 × 16.666… = 100.00000000000001) from delaying a tick by a frame.
  while (carry >= TICK_MS - 1e-9) {
    next = advance(next)
    carry -= TICK_MS
  }
  return { game: next, carryMs: carry }
}
