import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkRun } from '../src/game/check.ts'
import { getManilaDate, seedForDate } from '../src/game/daily.ts'
import { createEngine, nextAlignmentMs, tap, type Engine } from '../src/game/engine.ts'

const NOW = new Date('2026-11-24T12:00:00Z') // 20:00 in Manila
const DAY = getManilaDate(NOW)

/** A real run on `day`: `perfect` aligned taps, then taps halfway between points until the run ends. */
const playRun = (perfect: number, day = DAY) => {
  let engine: Engine = createEngine(seedForDate(day))
  for (let i = 0; i < perfect; i++) engine = tap(engine, nextAlignmentMs(engine))
  for (let i = 0; i < 50 && !engine.run.ended; i++) engine = tap(engine, nextAlignmentMs(engine) + (30 / engine.ring.speed) * 1000)
  assert.ok(engine.run.ended)
  return engine
}

test('the server scores a run by replaying its taps', () => {
  const engine = playRun(12)
  const checked = checkRun({ day: DAY, inputs: engine.inputs }, NOW)
  assert.equal(checked.rings, engine.run.rings)
  assert.equal(checked.perfects, engine.run.perfects)
})

test('a claimed score is ignored: only the taps count', () => {
  const engine = playRun(12)
  const checked = checkRun({ day: DAY, inputs: engine.inputs, rings: 999 }, NOW)
  assert.equal(checked.rings, engine.run.rings)
})

test('a run from another day’s star is refused', () => {
  const engine = playRun(3, '2026-11-20')
  assert.throws(() => checkRun({ day: '2026-11-20', inputs: engine.inputs }, NOW), /tonight/)
})

test('a run started just before midnight counts for that night within the hour', () => {
  const engine = playRun(3)
  const justAfter = new Date('2026-11-24T16:20:00Z') // 00:20 the next day in Manila
  assert.equal(checkRun({ day: DAY, inputs: engine.inputs }, justAfter).rings, engine.run.rings)
  assert.throws(() => checkRun({ day: DAY, inputs: engine.inputs }, new Date('2026-11-24T17:30:00Z')), /tonight/)
})

test('unfinished, empty, broken and backwards runs are refused', () => {
  const engine = playRun(5)
  assert.throws(() => checkRun({ day: DAY, inputs: engine.inputs.slice(0, 5) }, NOW), /not ended/)
  assert.throws(() => checkRun({ day: DAY, inputs: [] }, NOW), /no taps/)
  assert.throws(() => checkRun({ day: DAY, inputs: [{ type: 'swipe', atMs: 1 }] }, NOW), /broken/)
  assert.throws(() => checkRun({ day: DAY, inputs: [{ type: 'tap', atMs: '1' }] }, NOW), /broken/)
  assert.throws(() => checkRun({ day: DAY, inputs: [...engine.inputs].reverse() }, NOW), /back in time/)
  assert.throws(() => checkRun(null, NOW), /tonight/)
})
