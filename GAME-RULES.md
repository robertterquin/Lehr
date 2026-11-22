# Parol — Game rules

Lock each spinning ring onto the one inside it and light a Filipino Christmas parol, one ring at a time. Everyone plays the same star each day; the score is how many rings you lock.

The numbers live in [src/game/rules.ts](src/game/rules.ts) and are checked by `npm run sim` (the balance simulation) and `npm test`. The look, screens and sound are in [design/PAROL-DESIGN.md](design/PAROL-DESIGN.md).

## The star

- Every ring is the same five-pointed star, a size larger than the one inside it. The star looks the same every 72°, so a ring lines up five times per turn.
- Each point spans a **width**, in degrees. A run starts at **36°**.

## A run

1. A new ring spins in around the star, starting **36° from alignment** (halfway between two), so it first lines up after turning 36°. Taps in its first **0.15 s** (while it fades in) are ignored. Each ring starts the moment the one before it locks, except after every 10th ring: then the next waits **1.5 s**, so the milestone lands (taps in that wait are ignored).
2. The player taps (or clicks, or presses Space) to lock it. One tap locks one ring.
3. The lock's **error** is how far the ring sits from the nearest alignment, from −36° to 36°.
   - **Perfect** (error within **2.5°** either way): nothing is trimmed and the streak grows.
   - **Off-angle**: the overhang is trimmed off, so the points lose width equal to the error (a 7° miss turns 29° points into 22°). The streak resets. The star turns by half the error, which only changes the drawing.
   - Every **5 perfects in a row** widen the points by **6°**, never past 36°.
4. If a lock would leave the points under **8°** wide, they can't hold the ring: **the run ends**, and that ring doesn't count. Points left at exactly 8° still hold.
5. The next ring spins in. Below 15° the screen shows the danger state; the rules don't change.

## Speed and direction

- The first ring spins at **50° a second** (shown as 1.0×). Each ring is a little faster, quickly at first and then flattening: speed = 50 × (1 + 0.35 × ln(1 + ring ÷ 2)), capped at **2.5×**.

| Ring | 1 | 8 | 21 | 51 | 101 | 201 |
|---|---|---|---|---|---|---|
| Speed | 1.0× | 1.5× | 1.8× | 2.1× | 2.4× | 2.5× |
| Degrees a second | 50 | 76 | 92 | 107 | 119 | 125 |

- The spin **reverses direction every 5 rings**.
- The day's seed nudges each ring's speed by a whole percent from **−8% to +8%**, so every day's star plays a little differently.

## The day

- The day changes over at **midnight in Manila** (UTC+8). Everyone gets the same seed for that date (a hash of the date, `src/game/daily.ts`), so everyone plays the same star.
- The look follows the weekday (the seven nights); the rules never change with it.

## Score

- The score is **rings locked**. Ties go to more perfect locks, then to whoever finished their run earlier in the day.
- Milestones every 10 rings (halo at 10, street lights at 20 and on to the star rising at 100) change only the look and sound, never the rules. The run never stops at a milestone.

## Timing

- Time drives everything: the spinning ring's angle comes from when it started, its speed and its direction, and the lock error from the exact time of the tap, to the millisecond. Nothing is rounded to screen frames: at 100° a second one 60 Hz frame is 1.7°, nearly the whole perfect window, so frame-rounded taps would make perfects luck.
- A run is the day's seed plus its inputs (taps, pauses, resumes) with their times. Replaying them always gives the same run, so the server can check a score (Phase 9); inputs that go back in time are rejected. The engine is [src/game/engine.ts](src/game/engine.ts).

## Pause

- Pausing (the button, Esc, or leaving the tab) hides the star. When play resumes, the current ring spins in again from the start, so a pause can't be used to line up a lock.

## Balance

`npm run sim` plays 3,000 runs per skill level over 60 days. A simulated player aims each tap at an alignment; their timing is off by a normal error whose spread depends on skill (from studies of tapping at moving targets), with an occasional lapse three times as wide and a little extra error on the first ring after the spin reverses.

| Player | Timing spread | Target | Median run | Middle 80% | Perfect locks | Reach 100 |
|---|---|---|---|---|---|---|
| Casual | 40 ms | ~15 | 15 | 10–22 | 61% | 0% |
| Average | 30 ms | ~30 | 23 | 15–35 | 70% | 0% |
| Good | 22 ms | ~60 | 46 | 30–70 | 78% | 0% |
| Great | 16 ms | 100+ | 124 | 75–196 | 84% | 73% |

- How the numbers were chosen: a search over the first ring's speed, the perfect window, how fast the speed climbs and the cap, scored by how close each skill's median lands to its target. The starting numbers from the mockups (90° a second, 1.5° perfect) gave a great player a median of 21 rings.
- Average and good players land a little under their targets with every setting tried. That gap comes from the assumed timing spreads, not the rules, so the playtest logs (Phase 8) replace these guesses with real players before any further tuning.
- `scripts/balance.test.ts` fails if a rule change pushes any skill level's median outside 0.6–1.6× its target, or lets a less skilled player out-reach a more skilled one.
