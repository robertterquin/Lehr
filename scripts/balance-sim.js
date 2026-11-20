// Lehr balance simulation: thousands of runs per skill level, safe vs push-your-luck play.
// Usage: node scripts/balance-sim.js '{"overCost":0.2}'  (override any value in `base`)
// shortcut: models players as steady Gaussian timing noise; replace with real playtest data once it exists.
const base = { start: 16, flaw: 3, reheat: 2, overCost: 0.18, underCost: 0.3, floor: -30, k0: 0.8, speedEvery: 10, speedStep: 0.05, speedCap: 2, drain: 0.2, drainGrow: 0.008, bril: 6, brilCost: 0, brilPts: 3, brilFree: true, brilStreak: true, brilHeat: 15 };
const cfg = { ...base, ...JSON.parse(process.argv[2] || '{}') };
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function run(sigmaMs, strat, T) {
  let m = cfg.start, pieces = 0, streak = 0, panes = 0, bril = 0;
  for (;;) {
    const k = cfg.k0 * Math.min(cfg.speedCap, 1 + cfg.speedStep * Math.floor(pieces / cfg.speedEvery));
    const sd = (k * sigmaMs) / 10;
    const safeAim = Math.min(100, 100 + m - 2 * sd);
    const greedyAim = 100 + Math.min(m - 1.5 * sd, cfg.bril + sd);
    const zoneOpen = m >= cfg.brilHeat;
    const greedy = zoneOpen && (strat === 'greedy' || (strat === 'adaptive' && greedyAim - 100 >= cfg.bril));
    const e = (greedy ? greedyAim : safeAim) - 100 + gauss() * sd;
    if (e > m || e < cfg.floor) break;
    pieces++;
    if (Math.abs(e) <= cfg.flaw) { streak++; m = Math.min(cfg.start, m + cfg.reheat); }
    else if (zoneOpen && e >= cfg.bril) { bril++; if (!cfg.brilStreak) streak = 0; m -= (cfg.brilFree ? 0 : e * cfg.overCost) + cfg.brilCost; }
    else { streak = 0; m -= Math.abs(e) * (e > 0 ? cfg.overCost : cfg.underCost); }
    m -= cfg.drain + cfg.drainGrow * pieces;
    panes += streak >= 5 && streak % 5 === 0 ? 2 : 1;
    if (pieces > 3000) break;
  }
  return panes + bril * cfg.brilPts;
}
const med = (f) => { const a = Array.from({ length: 3000 }, f).sort((x, y) => x - y); return a[1500]; };
const pct = (f, p) => { const a = Array.from({ length: 3000 }, f).sort((x, y) => x - y); return a[Math.floor(p * 2999)]; };
console.log('player          safe: median  p90 | brilliant at full heat: median  p90');
for (const [label, s] of [['casual 90ms', 90], ['average 60ms', 60], ['good 40ms', 40], ['great 28ms', 28]]) {
  const safe = () => run(s, 'safe'), push = () => run(s, 'adaptive');
  console.log(label.padEnd(15), String(med(safe)).padStart(12), String(pct(safe, 0.9)).padStart(5), ' |', String(med(push)).padStart(31), String(pct(push, 0.9)).padStart(5));
}
