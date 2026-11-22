// Parol game engine: a run is the day's seed plus timed inputs, so the same inputs always give the same result
// (on the phone, in the balance simulation and when the server replays a run). No browser code.
// Times are milliseconds since the run started, exact to the input event, never rounded to frames.
import { RULES, lock, lockError, ringDirection, ringSpeed, startRun, type Rules, type Run } from './rules.ts'

export type Ring = {
  /** 0-based: the ring after `index` locks. */
  index: number
  /** When this ring started spinning in (ms since the run started). */
  startMs: number
  /** Degrees per second. */
  speed: number
  /** 1 clockwise, −1 counter-clockwise. */
  direction: 1 | -1
}

export type Input = { type: 'tap' | 'pause' | 'resume'; atMs: number }

export type Engine = {
  seed: number
  run: Run
  ring: Ring
  paused: boolean
  /** The error of each lock that counted, in order: what the star is drawn from. */
  locks: number[]
  /** The error of the lock that ended the run, once it has ended. */
  endError?: number
  /** Every input received, in order: what the server replays. */
  inputs: Input[]
}

const ringAt = (seed: number, index: number, startMs: number, rules: Rules): Ring => ({
  index,
  startMs,
  speed: ringSpeed(seed, index, rules),
  direction: ringDirection(index, rules) as 1 | -1,
})

export const createEngine = (seed: number, rules: Rules = RULES): Engine => ({
  seed,
  run: startRun(rules),
  ring: ringAt(seed, 0, 0, rules),
  paused: false,
  locks: [],
  inputs: [],
})

/**
 * Where the spinning ring sits relative to alignment, in degrees. A ring starts half a point-gap (36°) behind
 * alignment, so its first alignment comes 36° of spin after it appears.
 */
export const ringOffset = (ring: Ring, atMs: number) => ring.direction * (((Math.max(0, atMs - ring.startMs) / 1000) * ring.speed) - 36)

/** The lock error a tap at `atMs` would make: −36° to 36°. */
export const ringError = (engine: Engine, atMs: number) => lockError(ringOffset(engine.ring, atMs))

/** The spinning ring's angle on screen: alignment follows the star's turn from earlier off-angle locks. */
export const ringAngle = (engine: Engine, atMs: number) => engine.run.rotation + ringOffset(engine.ring, atMs)

/** When the ring would next line up exactly, after spin-in: what a perfect player aims for. */
export const nextAlignmentMs = (engine: Engine, rules: Rules = RULES) => {
  const { startMs, speed } = engine.ring
  const step = (72 / speed) * 1000
  let at = startMs + (36 / speed) * 1000
  while (at - startMs < rules.spinInMs) at += step
  return at
}

const record = (engine: Engine, input: Input): Engine => ({ ...engine, inputs: [...engine.inputs, input] })

/** A tap locks the spinning ring, unless the run is over, paused, or the ring is still spinning in. */
export const tap = (engine: Engine, atMs: number, rules: Rules = RULES): Engine => {
  const logged = record(engine, { type: 'tap', atMs })
  if (engine.run.ended || engine.paused || atMs - engine.ring.startMs < rules.spinInMs) return logged
  const error = ringError(engine, atMs)
  const run = lock(engine.run, error, rules)
  if (run.ended) return { ...logged, run, endError: error }
  // After a milestone the next ring waits; taps before it starts spinning in are ignored like spin-in taps.
  const startMs = atMs + (run.rings % rules.milestoneEvery === 0 ? rules.milestoneBreakMs : 0)
  return { ...logged, run, locks: [...engine.locks, error], ring: ringAt(engine.seed, run.rings, startMs, rules) }
}

/** Pausing hides the star; a run that is over can't be paused. */
export const pause = (engine: Engine, atMs: number): Engine => ({ ...record(engine, { type: 'pause', atMs }), paused: !engine.run.ended })

/** Resuming spins the current ring in again from the start, so a pause can't line up a lock. */
export const resume = (engine: Engine, atMs: number): Engine =>
  engine.paused ? { ...record(engine, { type: 'resume', atMs }), paused: false, ring: { ...engine.ring, startMs: atMs } } : record(engine, { type: 'resume', atMs })

/** Rebuilds a run from its seed and inputs. Throws on inputs that go back in time (a tampered or broken run). */
export const replay = (seed: number, inputs: Input[], rules: Rules = RULES): Engine => {
  let engine = createEngine(seed, rules)
  let last = 0
  for (const input of inputs) {
    if (!Number.isFinite(input.atMs) || input.atMs < last) throw new Error(`Input at ${input.atMs} ms goes back in time`)
    last = input.atMs
    engine = input.type === 'tap' ? tap(engine, input.atMs, rules) : input.type === 'pause' ? pause(engine, input.atMs) : resume(engine, input.atMs)
  }
  return engine
}
