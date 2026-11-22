import assert from 'node:assert/strict'
import { test } from 'node:test'
import { drawnRings, radii, starPath } from '../src/draw/geometry.ts'
import { createEngine, nextAlignmentMs, tap } from '../src/game/engine.ts'

test('the star is drawn from the engine’s locks: same widths and turns, perfects marked', () => {
  let engine = createEngine(7)
  for (const degrees of [0, 6, 0, 0, 0, 0, 0, -4]) engine = tap(engine, nextAlignmentMs(engine) + (degrees / engine.ring.speed) * 1000)
  const rings = drawnRings(engine.locks)
  assert.equal(rings.length, engine.run.rings)
  assert.ok(Math.abs(rings[rings.length - 1].width - engine.run.width) < 1e-9)
  assert.ok(Math.abs(rings[rings.length - 1].rotation - engine.run.rotation) < 1e-9)
  assert.deepEqual(rings.map((r) => r.perfect), [true, false, true, true, true, true, true, false])
})

test('each ring is a larger copy of the same five-pointed outline', () => {
  assert.ok(radii(1).ro > radii(0).ro)
  assert.equal(starPath(0, 36, 0).split('L').length, 20)
})
