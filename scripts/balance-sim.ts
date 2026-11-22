// Parol balance simulation: simulated players of four skill levels play many days on the real engine.
// A player aims each tap at the ring's next alignment; their timing is off by a normal error (ms) that depends on skill,
// with an occasional lapse three times as wide, and a little worse on the first ring after the spin reverses.
// Usage: npm run sim            → the reach table for the rules in src/game/rules.ts
import { randomForSeed, seedForDate } from '../src/game/daily.ts'
import { createEngine, nextAlignmentMs, tap } from '../src/game/engine.ts'
import { RULES, ringDirection, type Rules } from '../src/game/rules.ts'

export type Skill = { name: string; timingMs: number; lapseRate: number; target: number }

/** Timing spread from published tap-to-moving-target studies: skilled players ~15 ms, casual ~40 ms. */
export const SKILLS: Skill[] = [
  { name: 'Casual', timingMs: 40, lapseRate: 0.03, target: 15 },
  { name: 'Average', timingMs: 30, lapseRate: 0.02, target: 30 },
  { name: 'Good', timingMs: 22, lapseRate: 0.01, target: 60 },
  { name: 'Great', timingMs: 16, lapseRate: 0.005, target: 100 },
]

const MAX_RINGS = 1000 // shortcut: a run that reaches this is counted as 1000, fine while targets stay ≤ 150

const normal = (random: () => number) => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random())

/** One run: returns rings locked and perfects. */
export const playRun = (seed: number, skill: Skill, random: () => number, rules: Rules = RULES) => {
  let engine = createEngine(seed, rules)
  while (!engine.run.ended && engine.run.rings < MAX_RINGS) {
    const ring = engine.ring.index
    const reversed = ring > 0 && ringDirection(ring, rules) !== ringDirection(ring - 1, rules)
    const spread = skill.timingMs * (reversed ? 1.25 : 1) * (random() < skill.lapseRate ? 3 : 1)
    // A tap that would land during spin-in is held until the ring can take it.
    engine = tap(engine, Math.max(engine.ring.startMs + rules.spinInMs, nextAlignmentMs(engine, rules) + normal(random) * spread), rules)
  }
  return engine.run
}

const percentile = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]

/** Plays `runsPerDay` runs per skill on each of `days` days and summarises the reach. */
export const simulate = (rules: Rules = RULES, days = 60, runsPerDay = 50) =>
  SKILLS.map((skill) => {
    const random = randomForSeed(seedForDate(skill.name))
    const rings: number[] = []
    let perfects = 0
    for (let day = 0; day < days; day += 1) {
      const seed = seedForDate(new Date(Date.UTC(2026, 11, 1 + day)).toISOString().slice(0, 10))
      for (let i = 0; i < runsPerDay; i += 1) {
        const run = playRun(seed, skill, random, rules)
        rings.push(run.rings)
        perfects += run.perfects
      }
    }
    rings.sort((a, b) => a - b)
    const total = rings.reduce((a, b) => a + b, 0)
    const reach = (n: number) => rings.filter((r) => r >= n).length / rings.length
    return {
      skill: skill.name,
      target: skill.target,
      median: percentile(rings, 0.5),
      p10: percentile(rings, 0.1),
      p90: percentile(rings, 0.9),
      perfectRate: perfects / Math.max(1, total),
      reach10: reach(10),
      reach30: reach(30),
      reach60: reach(60),
      reach100: reach(100),
    }
  })

if (import.meta.main) {
  const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(5)
  console.log('Skill     target  median  p10–p90     perfect   ≥10   ≥30   ≥60  ≥100')
  for (const row of simulate()) {
    console.log(
      `${row.skill.padEnd(9)} ${String(row.target).padStart(6)}  ${String(row.median).padStart(6)}  ${`${row.p10}–${row.p90}`.padEnd(10)}  ${pct(row.perfectRate)}    ${pct(row.reach10)} ${pct(row.reach30)} ${pct(row.reach60)} ${pct(row.reach100)}`,
    )
  }
}
