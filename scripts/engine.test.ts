import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEngine, nextAlignmentMs, pause, replay, resume, ringError, tap, type Engine } from '../src/game/engine.ts'
import { RULES } from '../src/game/rules.ts'

const SEED = 20261122

/** When the current ring is `degrees` past its first alignment (negative: before it). */
const at = (engine: Engine, degrees: number) => nextAlignmentMs(engine) + (degrees / engine.ring.speed) * 1000

/** Taps each ring `degrees` past alignment, in order. */
const play = (errors: number[], engine = createEngine(SEED)) => errors.reduce((e, degrees) => tap(e, at(e, degrees)), engine)

test('a ring starts 36° from alignment and lines up after spinning 36°', () => {
  const engine = createEngine(SEED)
  assert.equal(Math.abs(ringError(engine, 0)), 36)
  assert.ok(Math.abs(ringError(engine, nextAlignmentMs(engine))) < 1e-9)
})

test('the lock error comes from the exact tap time, not a frame', () => {
  const engine = createEngine(SEED)
  const oneFrameLate = tap(engine, nextAlignmentMs(engine) + 1000 / 60)
  const expected = engine.ring.speed / 60
  assert.ok(Math.abs(oneFrameLate.run.width - (expected <= RULES.perfectWithin ? 36 : 36 - expected)) < 1e-9)
  assert.equal(tap(engine, at(engine, 1)).run.perfects, 1)
})

test('exactly 2.5° off is perfect, worked out from time; 3° off trims 3°', () => {
  assert.equal(play([RULES.perfectWithin]).run.perfects, 1)
  assert.ok(Math.abs(play([3]).run.width - 33) < 1e-9)
  assert.ok(Math.abs(play([-3]).run.width - 33) < 1e-9)
})

test('taps while a ring spins in are ignored, but still recorded for replay', () => {
  const engine = tap(createEngine(SEED), RULES.spinInMs - 1)
  assert.equal(engine.run.rings, 0)
  assert.equal(engine.inputs.length, 1)
})

test('each lock starts the next ring at that moment, with its own speed; the spin reverses every 5 rings', () => {
  const engine = play([0, 0, 0, 0, 0])
  assert.equal(engine.ring.index, 5)
  assert.equal(engine.ring.startMs, engine.inputs[4].atMs)
  assert.equal(engine.ring.direction, -1)
  assert.equal(play([0, 0, 0, 0]).ring.direction, 1)
})

test('after every 10th ring the next waits 1.5 s, and taps in that wait are ignored', () => {
  const ten = play([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  const lockedAt = ten.inputs[ten.inputs.length - 1].atMs
  assert.equal(ten.ring.startMs, lockedAt + RULES.milestoneBreakMs)
  assert.equal(tap(ten, lockedAt + 1000).run.rings, 10)
  assert.equal(play([0, 0, 0, 0, 0, 0, 0, 0, 0]).ring.startMs, play([0, 0, 0, 0, 0, 0, 0, 0, 0]).inputs[8].atMs)
})

test('five perfects widen, an off-angle lock turns the star, and the run ends below 8°', () => {
  assert.ok(Math.abs(play([9, 0, 0, 0, 0, 0]).run.width - 33) < 1e-9)
  assert.ok(Math.abs(play([8]).run.rotation - 4) < 1e-9)
  const over = play([14, 14, 3])
  assert.equal(over.run.ended, true)
  assert.equal(over.run.rings, 2)
  assert.equal(tap(over, at(over, 0)).run, over.run)
  assert.equal(over.locks.length, 2)
})

test('a pause ignores taps and spins the ring in again on resume', () => {
  const paused = pause(createEngine(SEED), 400)
  assert.equal(tap(paused, 500).run.rings, 0)
  const resumed = resume(paused, 5000)
  assert.equal(resumed.ring.startMs, 5000)
  assert.equal(tap(resumed, 5000 + RULES.spinInMs - 1).run.rings, 0)
  assert.equal(tap(resumed, at(resumed, 0)).run.perfects, 1)
})

test('a run replays exactly from its seed and inputs, and inputs going back in time are rejected', () => {
  let engine = play([0, 4, 0, -2, 0, 7, 0])
  engine = pause(engine, engine.inputs[engine.inputs.length - 1].atMs + 300)
  engine = resume(engine, engine.inputs[engine.inputs.length - 1].atMs + 2000)
  engine = play([0, 0, -5], engine)
  assert.deepEqual(replay(SEED, engine.inputs), engine)
  assert.throws(() => replay(SEED, [{ type: 'tap', atMs: 900 }, { type: 'tap', atMs: 800 }]))
  assert.throws(() => replay(SEED, [{ type: 'tap', atMs: Number.NaN }]))
})
