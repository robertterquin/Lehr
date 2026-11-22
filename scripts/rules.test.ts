import assert from 'node:assert/strict'
import { test } from 'node:test'
import { RULES, lock, lockError, ringDirection, ringSpeed, speedFactor, speedJitterPercent, startRun, type Run } from '../src/game/rules.ts'

const play = (errors: number[], run: Run = startRun()) => errors.reduce((r, e) => lock(r, e), run)

test('a lock exactly at the perfect limit is perfect; just past it trims', () => {
  assert.deepEqual(play([RULES.perfectWithin]), { ...startRun(), rings: 1, perfects: 1, streak: 1 })
  const trimmed = play([RULES.perfectWithin + 0.5])
  assert.equal(trimmed.width, RULES.startWidth - RULES.perfectWithin - 0.5)
  assert.equal(trimmed.perfects, 0)
})

test('an off-angle lock trims the points by the error, either direction, and breaks the streak', () => {
  const run = play([0, 0, -7])
  assert.equal(run.width, 29)
  assert.equal(run.streak, 0)
  assert.equal(run.rotation, -3.5)
})

test('five perfects in a row widen the points, never past the start width', () => {
  assert.equal(play([0, 0, 0, 0, 0]).width, 36)
  assert.equal(play([9, 0, 0, 0, 0, 0]).width, 33)
  assert.equal(play([9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).width, 36)
})

test('points left exactly at the minimum hold; below it the run ends and that ring does not count', () => {
  assert.equal(play([14, 14]).width, RULES.minWidth)
  assert.equal(play([14, 14]).ended, false)
  const over = play([14, 14, RULES.perfectWithin + 0.5])
  assert.equal(over.ended, true)
  assert.equal(over.rings, 2)
  assert.equal(lock(over, 0), over)
})

test('lock error wraps to the nearest of the five alignments', () => {
  assert.equal(lockError(0), 0)
  assert.equal(lockError(71), -1)
  assert.equal(lockError(-1), -1)
  assert.equal(lockError(144 + 3), 3)
  assert.equal(lockError(-720 + 36), -36)
})

test('speed rises then flattens at the cap; the seed nudges it within the jitter; direction reverses every 5', () => {
  assert.equal(speedFactor(0), 1)
  assert.ok(speedFactor(10) > speedFactor(5))
  assert.equal(speedFactor(10_000), RULES.maxSpeedFactor)
  for (let ring = 0; ring < 200; ring += 1) {
    assert.ok(Math.abs(speedJitterPercent(12345, ring)) <= RULES.speedJitter)
    assert.equal(ringSpeed(12345, ring), ringSpeed(12345, ring))
  }
  assert.deepEqual([0, 4, 5, 9, 10].map((ring) => ringDirection(ring)), [1, 1, -1, -1, 1])
})
