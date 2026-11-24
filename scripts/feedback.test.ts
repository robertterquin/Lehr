import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEngine, nextAlignmentMs, tap, type Engine } from '../src/game/engine.ts'
import { lockFeedback, milestoneText, nextGoal } from '../src/game/feedback.ts'

const play = (errors: number[], engine: Engine = createEngine(99)) =>
  errors.reduce((e, degrees) => tap(e, nextAlignmentMs(e) + (degrees / e.ring.speed) * 1000), engine)

test('the message after each lock: Galing! for a perfect, ×5 on a widen, or how far off', () => {
  assert.equal(lockFeedback(createEngine(99)), null)
  assert.equal(lockFeedback(play([0]))?.title, 'Galing!')
  assert.deepEqual(lockFeedback(play([9, 0, 0, 0, 0, 0])), { title: 'Galing! ×5', tone: 'gold' })
  assert.deepEqual(lockFeedback(play([-7])), { title: '7° off', tone: 'coral' })
})


test('every 10 rings is a milestone with its own line, and past 100 each adds a star', () => {
  assert.equal(milestoneText(9), null)
  assert.equal(milestoneText(20), 'The street lights come on')
  assert.equal(milestoneText(100), 'Your parol became a star')
  assert.equal(milestoneText(130), 'A new star joins your sky')
})

test('the next goal counts down to the next milestone and names what it brings', () => {
  assert.deepEqual(nextGoal(0), { at: 10, toGo: 10, what: 'a halo' })
  assert.deepEqual(nextGoal(24), { at: 30, toGo: 6, what: 'the neighbours’ parols' })
  assert.deepEqual(nextGoal(30), { at: 40, toGo: 10, what: 'the carolers' })
  assert.deepEqual(nextGoal(99), { at: 100, toGo: 1, what: 'the Star of Bethlehem' })
  assert.deepEqual(nextGoal(105), { at: 110, toGo: 5, what: 'a new star in the sky' })
})
