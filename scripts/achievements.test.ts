import assert from 'node:assert/strict'
import { test } from 'node:test'
import { earnedBy } from '../src/game/achievements.ts'
import { inNovena, novenaDates } from '../src/game/daily.ts'

const played = (...dates: string[]) => Object.fromEntries(dates.map((d) => [d, 5]))

test('a run earns what its locks show', () => {
  const tenPerfect = [...Array(10).fill(0), 7, ...Array(5).fill(1)]
  const earned = earnedBy({ locks: tenPerfect, nights: played('2026-12-01'), streak: 1, today: '2026-12-01' })
  assert.deepEqual(earned, ['firstNight', 'streak10', 'cleanHalo'])
  const long = Array.from({ length: 100 }, (_, i) => (i % 3 ? 0 : 6))
  const big = earnedBy({ locks: long, nights: played('2026-12-01'), streak: 7, today: '2026-12-01' })
  for (const id of ['perfect25', 'rings50', 'rings100', 'nights7'] as const) assert.ok(big.includes(id), id)
  assert.ok(!big.includes('cleanHalo'))
})

test('seven places means the whole Monday-to-Sunday week, and the novena all nine nights', () => {
  const week = ['2026-11-30', '2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04', '2026-12-05', '2026-12-06']
  assert.ok(earnedBy({ locks: [], nights: played(...week), streak: 7, today: '2026-12-06' }).includes('sevenPlaces'))
  assert.ok(!earnedBy({ locks: [], nights: played(...week.slice(1)), streak: 6, today: '2026-12-06' }).includes('sevenPlaces'))
  assert.ok(earnedBy({ locks: [], nights: played(...novenaDates('2026-12-24')), streak: 9, today: '2026-12-24' }).includes('novena'))
})

test('Simbang Gabi runs 16 to 24 December', () => {
  assert.deepEqual(novenaDates('2026-12-20').slice(0, 2), ['2026-12-16', '2026-12-17'])
  assert.equal(novenaDates('2026-12-20')[8], '2026-12-24')
  assert.ok(inNovena('2026-12-16') && inNovena('2026-12-24'))
  assert.ok(!inNovena('2026-12-15') && !inNovena('2026-12-25'))
})
