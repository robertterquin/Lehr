import assert from 'node:assert/strict'
import { test } from 'node:test'
import { WINDOW_PANES, seedForDate, type GatherLog } from '../src/engine/engine.ts'
import { WINDOW_HEIGHT, WINDOW_WIDTH, buildWindow, paneOutcomes } from '../src/window/geometry.ts'

const dates = Array.from({ length: 365 }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10))

test('every day of the year cuts exactly 130 pieces, lit in a full story order', () => {
  for (const date of dates) {
    const pieces = buildWindow(seedForDate(date))
    assert.equal(pieces.length, WINDOW_PANES, date)
    assert.deepEqual(
      pieces.map((p) => p.order),
      Array.from({ length: WINDOW_PANES }, (_, i) => i),
    )
  }
})

test('the same day always cuts the same window; another day bends the lead differently', () => {
  const today = buildWindow(seedForDate('2026-11-20'))
  assert.deepEqual(buildWindow(seedForDate('2026-11-20')), today)
  const tomorrow = buildWindow(seedForDate('2026-11-21'))
  assert.notDeepEqual(
    tomorrow.map((p) => p.points),
    today.map((p) => p.points),
  )
  assert.deepEqual(
    tomorrow.map((p) => p.kind),
    today.map((p) => p.kind),
  )
})

test('the story lights the lower sea, then the sun at panes 37–47, with the rays near the end', () => {
  const pieces = buildWindow(seedForDate('2026-11-20'))
  const sun = pieces.filter((p) => p.kind === 'sun-core' || p.kind === 'sun-ring').map((p) => p.order + 1)
  assert.deepEqual(sun, Array.from({ length: 11 }, (_, i) => 37 + i))
  assert.ok(pieces.slice(0, 36).every((p) => p.kind === 'glass'))
  assert.ok(pieces.filter((p) => p.kind === 'ray').every((p) => p.order >= 90))
})

test('glass pieces stay inside the window frame', () => {
  for (const piece of buildWindow(seedForDate('2026-11-20'))) {
    if (piece.kind === 'ray') continue // rays run past the arch and are clipped by it
    for (const [x, y] of piece.points) assert.ok(x >= 0 && x <= WINDOW_WIDTH && y >= 0 && y <= WINDOW_HEIGHT)
  }
})

test('the run log maps to panes, with brilliant filling 4 and the final crack filling none', () => {
  const entry = (outcome: GatherLog['outcome'], panes: number): GatherLog => ({
    gather: 0, error: 0, outcome, panes, speed: 0.8, heatBefore: 16, heatAfter: 16,
  })
  assert.deepEqual(paneOutcomes([entry('flawless', 1), entry('brilliant', 4), entry('under', 1), entry('cracked', 0)]), [
    'flawless', 'brilliant', 'brilliant', 'brilliant', 'brilliant', 'under',
  ])
})
