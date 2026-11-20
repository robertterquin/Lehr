import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  SET_TICKS,
  advance,
  coolingAfter,
  createDailyChallenge,
  createGame,
  flawlessTolerance,
  judge,
  pause,
  press,
  release,
  resume,
  seedForDate,
  sizeOf,
  speedForGather,
  startRun,
  startSizeForGather,
  windPercentForGather,
  type GameState,
} from '../src/engine/engine.ts'

const DAY = '2026-11-20'
const challenge = { date: DAY, seed: seedForDate(DAY) }
const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`)

const playing = (overrides: Partial<GameState> = {}, endless = false): GameState => ({
  ...startRun(createGame(challenge, { endless })),
  ...overrides,
})

/** Release with an exact error by starting the bubble at 100 + error and releasing at once. */
const releaseAt = (error: number, overrides: Partial<GameState> = {}, endless = false) =>
  release({ ...playing(overrides, endless), phase: 'blowing', startSize: 100 + error, blowTicks: 0 })

const advanceUntil = (game: GameState, done: (g: GameState) => boolean) => {
  for (let guard = 0; guard < 10_000; guard += 1) {
    if (done(game)) return game
    game = advance(game)
  }
  throw new Error('never reached')
}

test('the daily course follows the UTC date', () => {
  assert.equal(seedForDate(DAY), seedForDate(DAY))
  assert.notEqual(seedForDate(DAY), seedForDate('2026-11-21'))
  assert.equal(createDailyChallenge(new Date('2026-11-20T23:59:59.999Z')).date, '2026-11-20')
  assert.equal(createDailyChallenge(new Date('2026-11-21T08:00:00+08:00')).date, '2026-11-21')
})

test('wind is calm for the first 10 gathers, then a seeded −8 to +8 percent', () => {
  for (let gather = 0; gather < 10; gather += 1) assert.equal(windPercentForGather(challenge.seed, gather), 0)
  const winds = Array.from({ length: 2000 }, (_, i) => windPercentForGather(challenge.seed, i + 10))
  assert.ok(winds.every((w) => Number.isInteger(w) && w >= -8 && w <= 8))
  assert.ok(winds.includes(-8) && winds.includes(8))
  assert.equal(windPercentForGather(challenge.seed, 42), windPercentForGather(challenge.seed, 42))
})

test('speed rises 5% every 10 gathers and is capped at 2× after the wind', () => {
  assert.equal(speedForGather(challenge.seed, 0), 0.8)
  assert.equal(speedForGather(challenge.seed, 9), 0.8)
  const wind = windPercentForGather(challenge.seed, 10)
  close(speedForGather(challenge.seed, 10), 0.8 * 1.05 * (1 + wind / 100))
  for (let gather = 250; gather < 300; gather += 1) assert.equal(speedForGather(challenge.seed, gather), 1.6)
})

test('the bubble starts at 60% during warm-up, then 40%, and grows exponentially', () => {
  assert.equal(startSizeForGather(9), 60)
  assert.equal(startSizeForGather(10), 40)
  const game = playing({ phase: 'blowing', startSize: 40, speed: 0.8 })
  // ln(2.5) / 0.8 s ≈ 1.145 s ≈ 68.7 ticks to reach the target.
  assert.ok(sizeOf({ ...game, blowTicks: 68 }) < 100)
  assert.ok(sizeOf({ ...game, blowTicks: 69 }) >= 100)
})

test('release results follow the rule table, edges included', () => {
  assert.equal(judge(3, 16, true), 'flawless')
  assert.equal(judge(-3, 16, true), 'flawless')
  assert.equal(judge(3.01, 16, false), 'over')
  assert.equal(judge(-3.01, 16, true), 'under')
  assert.equal(judge(6, 16, true), 'brilliant')
  assert.equal(judge(5.99, 16, true), 'over')
  assert.equal(judge(6, 16, false), 'over')
  assert.equal(judge(16, 16, true), 'brilliant')
  assert.equal(judge(16.01, 16, true), 'cracked')
  assert.equal(judge(-30, 16, true), 'under')
  assert.equal(judge(-30.01, 16, true), 'too-thick')
  assert.equal(judge(1, 0.5, true), 'cracked')
})

test('the flawless band widens only when one tick of growth exceeds 3%', () => {
  assert.equal(flawlessTolerance(0.8), 3)
  assert.equal(flawlessTolerance(1.6), 3)
  close(flawlessTolerance(6), 100 * (Math.exp(6 / 60) - 1))
})

test('a flawless release fills a pane, reheats up to 16, then the glass cools', () => {
  const game = releaseAt(0)
  assert.equal(game.phase, 'setting')
  assert.equal(game.panes, 1)
  assert.equal(game.streak, 1)
  close(game.heat, 16 - coolingAfter(1))
  close(releaseAt(2, { heat: 10 }).heat, 12 - coolingAfter(1))
})

test('over and under releases cost heat and reset the streak', () => {
  const over = releaseAt(5, { streak: 3, brilliantOpen: false })
  assert.equal(over.streak, 0)
  close(over.heat, 16 - 5 * 0.18 - coolingAfter(1))
  const under = releaseAt(-10, { streak: 3 })
  assert.equal(under.streak, 0)
  assert.equal(under.panes, 1)
  close(under.heat, 16 - 10 * 0.3 - coolingAfter(1))
})

test('a brilliant release fills 4 panes, costs no heat and keeps the streak', () => {
  const game = releaseAt(8, { streak: 3 })
  assert.equal(game.log.at(-1)!.outcome, 'brilliant')
  assert.equal(game.panes, 4)
  assert.equal(game.streak, 3)
  assert.equal(game.brilliant, 1)
  close(game.heat, 16 - coolingAfter(1))
})

test('every 5th flawless in a row fills 2 panes', () => {
  assert.equal(releaseAt(0, { streak: 4 }).panes, 2)
  assert.equal(releaseAt(0, { streak: 9 }).panes, 2)
  assert.equal(releaseAt(0, { streak: 5 }).panes, 1)
})

test('the brilliant zone opens at heat 15 and closes for good after gather 100', () => {
  assert.equal(resume({ ...playing(), phase: 'paused', heat: 15 }).brilliantOpen, true)
  assert.equal(resume({ ...playing(), phase: 'paused', heat: 14.99 }).brilliantOpen, false)
  const next = (game: GameState) => advanceUntil(game, (g) => g.phase === 'idle')
  close(next(releaseAt(0, { gathers: 99 })).heat, 15)
  assert.equal(next(releaseAt(0, { gathers: 99 })).brilliantOpen, true)
  assert.equal(next(releaseAt(0, { gathers: 100 })).brilliantOpen, false)
})

test('holding past the crack ring cracks the bubble at once', () => {
  const game = advanceUntil(press(playing({ heat: 5 })), (g) => g.phase === 'over')
  const last = game.log.at(-1)!
  assert.equal(game.endReason, 'cracked')
  assert.equal(last.outcome, 'cracked')
  assert.ok(last.error > 5)
  assert.ok(sizeOf({ ...game, blowTicks: game.blowTicks - 1 }) - 100 <= 5, 'cracked on the first tick past the ring')
})

test('releasing far too early ends the run as too thick', () => {
  const game = releaseAt(-31, { panes: 7 })
  assert.equal(game.phase, 'over')
  assert.equal(game.endReason, 'too-thick')
  assert.equal(game.panes, 7)
})

test('a new gather needs a fresh press after the 0.4 s setting', () => {
  let game = releaseAt(0)
  assert.equal(press(game).phase, 'setting')
  for (let i = 0; i < SET_TICKS - 1; i += 1) game = advance(game)
  assert.equal(game.phase, 'setting')
  game = advance(game)
  assert.equal(game.phase, 'idle')
  assert.equal(release(game), game)
  assert.equal(press(game).phase, 'blowing')
})

test('pausing scraps the gather in progress and keeps everything else', () => {
  let game = press(playing({ panes: 12, heat: 13, streak: 2, gathers: 12 }))
  for (let i = 0; i < 30; i += 1) game = advance(game)
  const resumed = resume(pause(game))
  assert.equal(pause(game).phase, 'paused')
  assert.equal(advance(pause(game)).tick, pause(game).tick, 'time stops while paused')
  assert.equal(resumed.phase, 'idle')
  assert.equal(resumed.blowTicks, 0)
  assert.deepEqual([resumed.panes, resumed.heat, resumed.streak, resumed.gathers], [12, 13, 2, 12])
})

test('in v1 the run ends as a win at 130 panes; endless runs keep counting', () => {
  const won = releaseAt(0, { panes: 129 })
  assert.equal(won.phase, 'over')
  assert.equal(won.endReason, 'complete')
  assert.equal(won.panes, 130)
  assert.equal(releaseAt(8, { panes: 128 }).panes, 130)
  const endless = releaseAt(0, { panes: 129 }, true)
  assert.equal(endless.phase, 'setting')
  assert.equal(endless.panes, 130)
})

test('every release is logged for playtests', () => {
  const game = releaseAt(5, { brilliantOpen: false })
  assert.deepEqual(game.log.at(-1), {
    gather: 0,
    error: 5,
    outcome: 'over',
    panes: 1,
    speed: 0.8,
    heatBefore: 16,
    heatAfter: game.heat,
  })
})
