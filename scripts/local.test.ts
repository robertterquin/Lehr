import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEFAULT_SETTINGS, MAX_LOGGED, achieve, achieved, albumNights, bestOn, logRun, loggedRuns, nightsInARow, playedNights, readSettings, streakOf, writeSettings, type RunLog, type Store } from '../src/game/local.ts'

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
  // One missed night (2 Dec) is a rest that keeps the streak; two in a row break it.
  assert.equal(nightsInARow(store, '2026-12-03'), 4)
  assert.equal(nightsInARow(store, '2026-12-04'), 0)
})

test('a rest night: one a week, Monday to Sunday, never two nights in a row', () => {
  const played = (...dates: string[]) => Object.fromEntries(dates.map((d) => [d, 5]))
  // Mon 30 Nov played, Tue 1 Dec missed, Wed played, Thu missed, Fri played: the second miss that week breaks it.
  assert.deepEqual(streakOf(played('2026-11-30', '2026-12-02', '2026-12-04'), '2026-12-04'), { count: 2, rests: ['2026-12-03'] })
  // A rest in each week is fine: Sun 6 Dec and Wed 9 Dec.
  assert.deepEqual(streakOf(played('2026-12-04', '2026-12-05', '2026-12-07', '2026-12-08', '2026-12-10'), '2026-12-10'), { count: 5, rests: ['2026-12-09', '2026-12-06'] })
  // Played the 10th, missed the 11th: tonight (the 12th) the streak of 1 is kept by the rest.
  assert.deepEqual(streakOf(played('2026-12-10'), '2026-12-12'), { count: 1, rests: ['2026-12-11'] })
  // Two nights missed before tonight: nothing to keep, so no rest either.
  assert.deepEqual(streakOf(played('2026-12-01'), '2026-12-12'), { count: 0, rests: [] })
})

test('the album keeps each night’s best star, and takes in nights only the log had', () => {
  const store = memoryStore()
  store.setItem('parol-runs', JSON.stringify([{ ...run('2026-11-01', 4), locks: [0, 1, 2, 9] }]))
  logRun(store, { ...run('2026-11-02', 12), locks: [0, 0] })
  logRun(store, { ...run('2026-11-02', 30), locks: [0, 0, 0] })
  logRun(store, { ...run('2026-11-02', 8), locks: [5] })
  const album = albumNights(store)
  assert.equal(album['2026-11-01'].rings, 4)
  assert.equal(album['2026-11-02'].rings, 30)
  assert.deepEqual(album['2026-11-02'].locks, [0, 0, 0])
})

test('an achievement is new only once', () => {
  const store = memoryStore()
  assert.deepEqual(achieve(store, ['firstNight', 'rings50'], '2026-12-01'), ['firstNight', 'rings50'])
  assert.deepEqual(achieve(store, ['firstNight', 'streak10'], '2026-12-02'), ['streak10'])
  assert.deepEqual(achieved(store), { firstNight: '2026-12-01', rings50: '2026-12-01', streak10: '2026-12-02' })
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
