// Fixed-step game loop: the game always advances in whole 60 Hz ticks, so a run can be replayed exactly.

export const SIMULATION_HZ = 60
export const TICK_MS = 1000 / SIMULATION_HZ
const MAX_CATCH_UP_MS = 250

/**
 * Advances `state` by real elapsed time in fixed ticks, carrying the remainder.
 * Large gaps (a stalled tab) are capped so the game never fast-forwards through a ring.
 */
export function advanceTime<State>(state: State, carryMs: number, elapsedMs: number, tick: (state: State) => State) {
  let carry = carryMs + Math.min(MAX_CATCH_UP_MS, Math.max(0, elapsedMs))
  let next = state
  // The epsilon stops float rounding (6 × 16.666… = 100.00000000000001) from delaying a tick by a frame.
  while (carry >= TICK_MS - 1e-9) {
    next = tick(next)
    carry -= TICK_MS
  }
  return { state: next, carryMs: carry }
}
