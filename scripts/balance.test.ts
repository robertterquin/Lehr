import assert from 'node:assert/strict'
import { test } from 'node:test'
import { simulate } from './balance-sim.ts'

test('every skill level reaches near its target, and more skill always goes further', () => {
  const rows = simulate(undefined, 20, 25)
  for (const row of rows) {
    const ratio = row.median / row.target
    assert.ok(ratio > 0.6 && ratio < 1.6, `${row.skill}: median ${row.median} rings vs target ${row.target}`)
  }
  for (let i = 1; i < rows.length; i += 1) assert.ok(rows[i].median > rows[i - 1].median, `${rows[i].skill} beats ${rows[i - 1].skill}`)
})
