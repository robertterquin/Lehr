import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DRAWN_MIN_WIDTH, drawnRings, drawnWidth, radii, starPath } from '../src/draw/geometry.ts'
import { createEngine, nextAlignmentMs, tap } from '../src/game/engine.ts'

test('the star is drawn from the engine’s locks: upright, points eased, perfects marked', () => {
  let engine = createEngine(7)
  for (const degrees of [0, 6, 0, 0, 0, 0, 0, -4]) engine = tap(engine, nextAlignmentMs(engine) + (degrees / engine.ring.speed) * 1000)
  const rings = drawnRings(engine.locks)
  assert.equal(rings.length, engine.run.rings)
  assert.ok(Math.abs(rings[rings.length - 1].width - drawnWidth(engine.run.width)) < 1e-9)
  assert.ok(rings.every((r) => r.rotation === 0))
  assert.deepEqual(rings.map((r) => r.perfect), [true, false, true, true, true, true, true, false])
})

test('points are drawn from 36° down to 20°, never spikes, while the width still shows', () => {
  assert.equal(drawnWidth(36), 36)
  assert.equal(drawnWidth(8), DRAWN_MIN_WIDTH)
  assert.equal(drawnWidth(2), DRAWN_MIN_WIDTH)
  assert.ok(drawnWidth(30) > drawnWidth(20) && drawnWidth(20) > drawnWidth(12))
})

test('each ring is a larger copy of the same five-pointed outline', () => {
  assert.ok(radii(1).ro > radii(0).ro)
  assert.equal(starPath(0, 36, 0).split('L').length, 20)
})
