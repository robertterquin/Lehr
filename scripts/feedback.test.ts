import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEngine, nextAlignmentMs, tap, type Engine } from '../src/game/engine.ts'
import { endNote, lockFeedback, milestoneText } from '../src/game/feedback.ts'

const play = (errors: number[], engine: Engine = createEngine(99)) =>
  errors.reduce((e, degrees) => tap(e, nextAlignmentMs(e) + (degrees / e.ring.speed) * 1000), engine)

test('the message after each lock: perfect, perfect ×5, or how far off', () => {
  assert.equal(lockFeedback(createEngine(99)), null)
  assert.equal(lockFeedback(play([0]))?.title, 'Perfect')
  assert.deepEqual(lockFeedback(play([9, 0, 0, 0, 0, 0])), { title: 'Perfect ×5', tone: 'gold' })
  assert.deepEqual(lockFeedback(play([-7])), { title: '7° off', tone: 'coral' })
})

test('the end says which ring missed and by how much', () => {
  assert.equal(endNote(play([14, 14, 5])), 'Ring 3 locked 5° off')
})

test('every 10 rings is a milestone with its own line, and past 100 each adds a star', () => {
  assert.equal(milestoneText(9), null)
  assert.equal(milestoneText(20), 'The street lights come on')
  assert.equal(milestoneText(100), 'Your parol became a star')
  assert.equal(milestoneText(130), 'A new star joins your sky')
})
