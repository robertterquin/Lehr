// Lehr balance simulation on the real engine: many runs per skill level, safe play vs push-your-luck.
// Usage: npm run sim            (or: node scripts/balance-sim.ts 1000  for a quicker, rougher pass)
// shortcut: models players as steady Gaussian timing noise; replace with real playtest logs after Phase 6.
import {
  BRILLIANT_FROM,
  SIMULATION_HZ,
  advance,
  createGame,
  press,
  release,
  seedForDate,
  startRun,
  type GameState,
} from '../src/engine/engine.ts'

type Strategy = 'safe' | 'brilliant'

const RUNS = Number(process.argv[2] ?? 3000)

const gauss = () => {
  let u = 0
  let v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** The size (as % of target) a player aims for, given what they can see on screen. */
const aimFor = (game: GameState, sdPercent: number, strategy: Strategy) => {
  const safe = Math.min(100, 100 + game.heat - 2 * sdPercent)
  if (strategy === 'safe' || !game.brilliantOpen) return safe
  const greedy = 100 + Math.min(game.heat - 1.5 * sdPercent, BRILLIANT_FROM + sdPercent)
  return greedy - 100 >= BRILLIANT_FROM ? greedy : safe
}

function playRun(sigmaMs: number, strategy: Strategy, date: string) {
  let game = startRun(createGame({ date, seed: seedForDate(date) }, { endless: true }))
  while (game.phase !== 'over') {
    const sdPercent = (game.speed * sigmaMs) / 10
    const aim = aimFor(game, sdPercent, strategy)
    const seconds = Math.log(aim / game.startSize) / game.speed + (gauss() * sigmaMs) / 1000
    const releaseTick = Math.max(1, Math.round(seconds * SIMULATION_HZ))
    game = press(game)
    while (game.phase === 'blowing' && game.blowTicks < releaseTick) game = advance(game)
    game = release(game)
    while (game.phase === 'setting') game = advance(game)
    if (game.gathers > 3000) break
  }
  return game.panes
}

const day = (index: number) => new Date(Date.UTC(2026, 10, 1 + (index % 28))).toISOString().slice(0, 10)
const percentile = (scores: number[], p: number) => scores[Math.floor(p * (scores.length - 1))]
const sample = (sigmaMs: number, strategy: Strategy) =>
  Array.from({ length: RUNS }, (_, i) => playRun(sigmaMs, strategy, day(i))).sort((a, b) => a - b)

console.log(`${RUNS} runs per cell, spread over 28 daily courses`)
console.log('player            safe: median  p90 | brilliant at full heat: median  p90')
for (const [label, sigmaMs] of [['casual 90ms', 90], ['average 60ms', 60], ['good 40ms', 40], ['great 28ms', 28]] as const) {
  const safe = sample(sigmaMs, 'safe')
  const push = sample(sigmaMs, 'brilliant')
  console.log(
    label.padEnd(17),
    String(percentile(safe, 0.5)).padStart(11),
    String(percentile(safe, 0.9)).padStart(5),
    ' |',
    String(percentile(push, 0.5)).padStart(31),
    String(percentile(push, 0.9)).padStart(5),
  )
}
const exploit = Array.from({ length: RUNS }, (_, i) => {
  let game = startRun(createGame({ date: day(i), seed: seedForDate(day(i)) }, { endless: true }))
  while (game.phase !== 'over' && game.gathers < 3000) {
    const ticks = Math.round(((Math.log(92 / game.startSize) / game.speed) + (gauss() * 60) / 1000) * SIMULATION_HZ)
    game = press(game)
    while (game.phase === 'blowing' && game.blowTicks < Math.max(1, ticks)) game = advance(game)
    game = release(game)
    while (game.phase === 'setting') game = advance(game)
  }
  return game.panes
}).sort((a, b) => a - b)
console.log(`always letting go at 92% (average player): median ${percentile(exploit, 0.5)}`)
