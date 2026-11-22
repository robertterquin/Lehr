// Self-check for the demo script: run with `node parol.test.ts`.
import assert from 'node:assert/strict';
import { DEMO, GAMEPLAY_SECONDS, PERFECT_COUNT, START_WIDTH } from './src/parol.ts';

assert.equal(DEMO.length, 12);
assert.equal(DEMO[3].width, START_WIDTH - 6, 'a 6° lock trims 6° off the points');
assert.equal(DEMO[8].widened, true, 'the 5th perfect in a row widens the points');
assert.equal(DEMO[8].width, START_WIDTH, 'widening is capped at the starting width');
assert.equal(DEMO[9].width, START_WIDTH - 4);
assert.equal(PERFECT_COUNT, 10);
assert.ok(GAMEPLAY_SECONDS > 13 && GAMEPLAY_SECONDS < 16, `gameplay lasts ${GAMEPLAY_SECONDS.toFixed(2)} s`);
console.log(`ok: ${DEMO.length} rings, ${PERFECT_COUNT} perfect, ${GAMEPLAY_SECONDS.toFixed(2)} s of play`);
