import assert from 'node:assert/strict'
import { test } from 'node:test'
import { TICK_MS, advanceTime } from '../src/game/loop.ts'

const count = (ticks: number) => ticks + 1

test('real time advances in whole 60 Hz ticks and carries the rest', () => {
  const { state, carryMs } = advanceTime(0, 0, 100, count)
  assert.equal(state, 6)
  assert.ok(Math.abs(carryMs - (100 - 6 * TICK_MS)) < 1e-9)
  assert.equal(advanceTime(state, carryMs, TICK_MS, count).state, 7)
})

test('a stalled tab is capped instead of fast-forwarding', () => {
  assert.equal(advanceTime(0, 0, 5000, count).state, 15)
})

test('time running backwards changes nothing', () => {
  const { state, carryMs } = advanceTime(3, 4, -30, count)
  assert.equal(state, 3)
  assert.equal(carryMs, 4)
})
