// Lehr game engine: every rule from GAME-RULES.md, driven by fixed 60 Hz ticks.
// No browser code, so the game, the balance simulation and (later) the server share it.

export const SIMULATION_HZ = 60
export const WINDOW_PANES = 130
export const MAX_HEAT = 16
export const BRILLIANT_HEAT = 15
export const BRILLIANT_FROM = 6
export const FLAWLESS_TOLERANCE = 3
export const TOO_THICK = -30
export const SET_TICKS = 24 // 0.4 s setting animation, input ignored
export const MIS_TAP_TICKS = 9 // a release within 0.15 s of the press is a mis-tap, not a release

const START_SIZE = 40
const WARMUP_START_SIZE = 60
const WARMUP_GATHERS = 10
const BASE_SPEED = 0.8
const SPEED_STEP = 0.05
const GATHERS_PER_SPEED_STEP = 10
const MAX_SPEED = BASE_SPEED * 2
const REHEAT = 2
const OVER_COST = 0.18
const UNDER_COST = 0.3
const COOL_BASE = 0.2
const COOL_GROWTH = 0.008
const BRILLIANT_PANES = 4
const STREAK_BONUS_EVERY = 5

export type Phase = 'ready' | 'idle' | 'blowing' | 'setting' | 'paused' | 'over'
export type Outcome = 'flawless' | 'brilliant' | 'over' | 'under' | 'cracked' | 'too-thick'
export type EndReason = 'cracked' | 'too-thick' | 'complete'

export type DailyChallenge = {
  date: string
  seed: number
}

export type GatherLog = {
  gather: number
  error: number
  outcome: Outcome
  panes: number
  heatBefore: number
  heatAfter: number
  speed: number
}

export type GameState = {
  phase: Phase
  challenge: DailyChallenge
  endless: boolean
  tick: number
  gathers: number
  panes: number
  heat: number
  streak: number
  flawless: number
  brilliant: number
  speed: number
  startSize: number
  brilliantOpen: boolean
  blowTicks: number
  setUntil: number
  log: GatherLog[]
  endReason: EndReason | null
  /** The last press was a quick tap that got ignored (shown as a "hold to blow" hint). */
  misTap: boolean
  misTaps: number
}

export const getUtcDate = (date = new Date()) => date.toISOString().slice(0, 10)

export const seedForDate = (utcDate: string) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < utcDate.length; index += 1) {
    hash ^= utcDate.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export const createDailyChallenge = (date = new Date()): DailyChallenge => {
  const utcDate = getUtcDate(date)
  return { date: utcDate, seed: seedForDate(utcDate) }
}

export const randomForSeed = (seed: number) => {
  let state = seed >>> 0
  return () => {
    let value = (state += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** Seeded speed change for one gather, an integer from −8 to +8 percent. Calm during warm-up. */
export const windPercentForGather = (seed: number, gather: number) => {
  if (gather < WARMUP_GATHERS) return 0
  const gatherSeed = (seed ^ Math.imul(gather, 0x9e3779b9)) >>> 0
  return Math.floor(randomForSeed(gatherSeed)() * 17) - 8
}

/** Growth rate k (per second) for a gather. The 2× cap applies after the wind, as in Afterlight. */
export const speedForGather = (seed: number, gather: number) => {
  const climb = BASE_SPEED * (1 + SPEED_STEP * Math.floor(gather / GATHERS_PER_SPEED_STEP))
  return Math.min(MAX_SPEED, climb * (1 + windPercentForGather(seed, gather) / 100))
}

export const startSizeForGather = (gather: number) => (gather < WARMUP_GATHERS ? WARMUP_START_SIZE : START_SIZE)

/** Half-width of the flawless band: ±3%, widened so the band always spans at least 2 ticks of growth. */
export const flawlessTolerance = (speed: number) =>
  Math.max(FLAWLESS_TOLERANCE, 100 * (Math.exp(speed / SIMULATION_HZ) - 1))

export const coolingAfter = (gathersSet: number) => COOL_BASE + COOL_GROWTH * gathersSet

/** The bubble's size as a percentage of the target. */
export const sizeOf = (game: GameState) => game.startSize * Math.exp((game.speed * game.blowTicks) / SIMULATION_HZ)

/** Release result for an error (size − 100). Checks run in rule-table order. */
export const judge = (error: number, heat: number, brilliantOpen: boolean, tolerance = FLAWLESS_TOLERANCE): Outcome => {
  if (error > heat) return 'cracked'
  if (error < TOO_THICK) return 'too-thick'
  if (Math.abs(error) <= tolerance) return 'flawless'
  if (brilliantOpen && error >= BRILLIANT_FROM) return 'brilliant'
  return error > 0 ? 'over' : 'under'
}

const prepareGather = (game: GameState): GameState => ({
  ...game,
  phase: 'idle',
  speed: speedForGather(game.challenge.seed, game.gathers),
  startSize: startSizeForGather(game.gathers),
  brilliantOpen: game.heat >= BRILLIANT_HEAT,
  blowTicks: 0,
})

export const createGame = (challenge = createDailyChallenge(), { endless = false } = {}): GameState => ({
  phase: 'ready',
  challenge,
  endless,
  tick: 0,
  gathers: 0,
  panes: 0,
  heat: MAX_HEAT,
  streak: 0,
  flawless: 0,
  brilliant: 0,
  speed: speedForGather(challenge.seed, 0),
  startSize: startSizeForGather(0),
  brilliantOpen: true,
  blowTicks: 0,
  setUntil: 0,
  log: [],
  endReason: null,
  misTap: false,
  misTaps: 0,
})

export const startRun = (game: GameState): GameState => (game.phase === 'ready' ? prepareGather(game) : game)

/** A fresh press starts blowing. Ignored unless waiting for the next gather. */
export const press = (game: GameState): GameState => (game.phase === 'idle' ? { ...game, phase: 'blowing', misTap: false } : game)

/** Releasing sets the pane, unless it came so soon after the press that it was only a tap. */
export const release = (game: GameState): GameState => {
  if (game.phase !== 'blowing') return game
  if (game.blowTicks < MIS_TAP_TICKS) return { ...game, phase: 'idle', blowTicks: 0, misTap: true, misTaps: game.misTaps + 1 }
  return resolve(game, sizeOf(game) - 100)
}

/** Pausing scraps the gather in progress; heat, streak and score stay. */
export const pause = (game: GameState): GameState =>
  game.phase === 'idle' || game.phase === 'blowing' || game.phase === 'setting' ? { ...game, phase: 'paused', blowTicks: 0 } : game

export const resume = (game: GameState): GameState => (game.phase === 'paused' ? prepareGather(game) : game)

export const advance = (game: GameState): GameState => {
  if (game.phase === 'blowing') {
    const next = { ...game, tick: game.tick + 1, blowTicks: game.blowTicks + 1 }
    const error = sizeOf(next) - 100
    // Holding past the crack ring cracks the bubble at once.
    return error > next.heat ? resolve(next, error) : next
  }
  if (game.phase === 'setting') {
    const next = { ...game, tick: game.tick + 1 }
    return next.tick >= next.setUntil ? prepareGather(next) : next
  }
  if (game.phase === 'idle') return { ...game, tick: game.tick + 1 }
  return game
}

const resolve = (game: GameState, error: number): GameState => {
  const outcome = judge(error, game.heat, game.brilliantOpen, flawlessTolerance(game.speed))
  const entry = { gather: game.gathers, error, outcome, speed: game.speed, heatBefore: game.heat }

  if (outcome === 'cracked' || outcome === 'too-thick') {
    return {
      ...game,
      phase: 'over',
      endReason: outcome,
      log: [...game.log, { ...entry, panes: 0, heatAfter: game.heat }],
    }
  }

  let { heat, streak, flawless, brilliant } = game
  let filled = 1
  if (outcome === 'flawless') {
    streak += 1
    flawless += 1
    heat = Math.min(MAX_HEAT, heat + REHEAT)
    if (streak % STREAK_BONUS_EVERY === 0) filled = 2
  } else if (outcome === 'brilliant') {
    brilliant += 1
    filled = BRILLIANT_PANES
  } else {
    streak = 0
    heat -= Math.abs(error) * (outcome === 'over' ? OVER_COST : UNDER_COST)
  }

  const gathers = game.gathers + 1
  heat -= coolingAfter(gathers)
  const panes = game.endless ? game.panes + filled : Math.min(WINDOW_PANES, game.panes + filled)
  const complete = !game.endless && panes >= WINDOW_PANES

  return {
    ...game,
    phase: complete ? 'over' : 'setting',
    endReason: complete ? 'complete' : null,
    setUntil: game.tick + SET_TICKS,
    gathers,
    panes,
    heat,
    streak,
    flawless,
    brilliant,
    blowTicks: 0,
    log: [...game.log, { ...entry, panes: filled, heatAfter: heat }],
  }
}
