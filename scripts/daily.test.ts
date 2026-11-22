import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getManilaDate, randomForSeed, seedForDate, weekdayIndex } from '../src/game/daily.ts'

test('the day changes over at midnight in Manila, not UTC', () => {
  assert.equal(getManilaDate(new Date('2026-11-22T15:59:59Z')), '2026-11-22')
  assert.equal(getManilaDate(new Date('2026-11-22T16:00:00Z')), '2026-11-23')
})

test('every device gets the same seed for a day, and a new one the next day', () => {
  assert.equal(seedForDate('2026-11-22'), seedForDate('2026-11-22'))
  assert.notEqual(seedForDate('2026-11-22'), seedForDate('2026-11-23'))
})

test('the seeded random source repeats exactly and stays in [0, 1)', () => {
  const a = randomForSeed(42)
  const b = randomForSeed(42)
  for (let i = 0; i < 1000; i += 1) {
    const value = a()
    assert.equal(value, b())
    assert.ok(value >= 0 && value < 1)
  }
})

test('the week starts on Monday: 2026-11-23 is a Monday, 2026-11-22 a Sunday', () => {
  assert.equal(weekdayIndex('2026-11-23'), 0)
  assert.equal(weekdayIndex('2026-11-22'), 6)
})
