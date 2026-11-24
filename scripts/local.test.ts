import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEFAULT_SETTINGS, MAX_LOGGED, bestOn, logRun, loggedRuns, nightsInARow, playedNights, readSettings, writeSettings, type RunLog, type Store } from '../src/game/local.ts'

const memoryStore = (): Store => {
  const data = new Map<string, string>()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) }
}

const run = (date: string, rings: number): RunLog => ({
  date, night: 'barangay', seed: 1, startedAt: `${date}T12:00:00Z`, durationMs: 1000, rings, perfects: 0, endWidth: 3, endError: 9, locks: [], pauses: 0, viewport: '390x844', pointer: 'coarse',
})

test('settings start from the defaults and keep what was changed', () => {
  const store = memoryStore()
  assert.deepEqual(readSettings(store), DEFAULT_SETTINGS)
  writeSettings(store, { ...DEFAULT_SETTINGS, vibration: false })
  assert.equal(readSettings(store).vibration, false)
  assert.equal(readSettings(store).seenHowTo, false)
})

test('today’s best comes from the log, day by day', () => {
  const store = memoryStore()
  assert.equal(bestOn(store, '2026-11-22'), 0)
  logRun(store, run('2026-11-22', 12))
  logRun(store, run('2026-11-22', 30))
  logRun(store, run('2026-11-23', 50))
  assert.equal(bestOn(store, '2026-11-22'), 30)
  assert.equal(bestOn(store, '2026-11-23'), 50)
})

test('the log keeps only the most recent runs, and broken storage reads as empty', () => {
  const store = memoryStore()
  for (let i = 0; i < MAX_LOGGED + 5; i += 1) logRun(store, run('2026-11-22', i))
  assert.equal(loggedRuns(store).length, MAX_LOGGED)
  assert.equal(loggedRuns(store)[0].rings, 5)
  const broken: Store = { getItem: () => '{not json', setItem: () => { throw new Error('full') } }
  assert.deepEqual(loggedRuns(broken), [])
  assert.doesNotThrow(() => logRun(broken, run('2026-11-22', 1)))
})

test('nights in a row count back from today, or from yesterday before today’s first run', () => {
  const store = memoryStore()
  assert.equal(nightsInARow(store, '2026-12-01'), 0)
  logRun(store, run('2026-11-28', 5))
  logRun(store, run('2026-11-29', 5))
  logRun(store, run('2026-11-30', 5))
  logRun(store, run('2026-11-30', 9))
  assert.equal(nightsInARow(store, '2026-12-01'), 3)
  logRun(store, run('2026-12-01', 5))
  assert.equal(nightsInARow(store, '2026-12-01'), 4)
  assert.equal(nightsInARow(store, '2026-12-03'), 0)
})

test('played nights outlast the log, keep each night’s best, and take in nights only the old log had', () => {
  const store = memoryStore()
  store.setItem('parol-runs', JSON.stringify([run('2026-11-01', 4)]))
  logRun(store, run('2026-11-02', 30))
  logRun(store, run('2026-11-02', 12))
  for (let i = 0; i < MAX_LOGGED; i++) logRun(store, run('2026-11-03', 1))
  assert.ok(!loggedRuns(store).some((r) => r.date !== '2026-11-03'))
  assert.deepEqual(playedNights(store), { '2026-11-01': 4, '2026-11-02': 30, '2026-11-03': 1 })
  assert.equal(nightsInARow(store, '2026-11-03'), 3)
})
