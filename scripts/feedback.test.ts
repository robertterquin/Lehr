import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEngine, nextAlignmentMs, tap, type Engine } from '../src/game/engine.ts'
import { endNote, lockFeedback, spinLabel } from '../src/game/feedback.ts'

const play = (errors: number[], engine: Engine = createEngine(99)) =>
  errors.reduce((e, degrees) => tap(e, nextAlignmentMs(e) + (degrees / e.ring.speed) * 1000), engine)

test('the message after each lock: perfect, perfect ×5 with the new width, or how far off', () => {
  assert.equal(lockFeedback(createEngine(99)), null)
  assert.equal(lockFeedback(play([0]))?.title, 'Perfect')
  assert.deepEqual(lockFeedback(play([9, 0, 0, 0, 0, 0])), { title: 'Perfect ×5', note: 'The points widen back to 33°', tone: 'gold' })
  assert.deepEqual(lockFeedback(play([-7])), { title: '7° off', note: 'The overhang is trimmed · the points are now 29°', tone: 'coral' })
})

test('the meter names speed and direction; the end says which ring and why', () => {
  assert.equal(spinLabel(0), '1.0× · clockwise')
  assert.equal(spinLabel(7), '1.5× · counter-clockwise')
  assert.equal(endNote(play([14, 14, 5])), 'Ring 3 locked 5° off, leaving 3° points (8° needed)')
})
