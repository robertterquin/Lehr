import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createGame, press, seedForDate, startRun } from '../src/engine/engine.ts'
import { TICK_MS, advanceTime } from '../src/ui/loop.ts'

const blowing = () => press(startRun(createGame({ date: '2026-11-20', seed: seedForDate('2026-11-20') })))

test('real time advances the engine in whole 60 Hz ticks and carries the rest', () => {
  const { game, carryMs } = advanceTime(blowing(), 0, 100)
  assert.equal(game.blowTicks, 6)
  assert.ok(Math.abs(carryMs - (100 - 6 * TICK_MS)) < 1e-9)
  const next = advanceTime(game, carryMs, TICK_MS)
  assert.equal(next.game.blowTicks, 7)
})

test('a stalled tab is capped instead of fast-forwarding through the bubble', () => {
  assert.equal(advanceTime(blowing(), 0, 5000).game.blowTicks, 15)
})

test('time running backwards (an input stamped before the last frame) changes nothing', () => {
  const start = blowing()
  const { game, carryMs } = advanceTime(start, 4, -30)
  assert.equal(game, start)
  assert.equal(carryMs, 4)
})
