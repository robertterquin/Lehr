# Lehr — Game rules

Status: final design, before development. 20 November 2026.
Sister game to Afterlight (same studio approach: one input, daily course, fair rules).
Mockups: https://claude.ai/artifact/BeJLjVTA2yueCCfdX9AK2q

**The name.** A lehr is the long oven where finished glass cools slowly so it doesn't crack. Earlier working names were dropped: "Kiln" (Double Fine, 2026) and "Leadlight" (2025 puzzle game) are taken, and "Dawnglass" was replaced by the shorter Lehr.

The rules are implemented in `src/engine/engine.ts` and balanced with `npm run sim` (`scripts/balance-sim.ts`, which plays the real engine). If the code and this document disagree, update this document.

## Premise

Players blow glass bubbles, the way crown glass was made for windows before factories, and each bubble becomes one pane of a stained-glass window. Everyone builds the same window each day. The window is a dawn scene; the goal is to light it all, sun first.

## Controls

- **Hold** (touch, mouse or Space) to blow: the bubble grows. **Release** to set it.
- Escape or the pause button pauses (see *Pause and tab switch* below). The sound button mutes sound and vibration.

## Core run rules

All sizes are percentages of the current target size. `e` is the release error: bubble size − 100.

- **Growth.** The bubble starts at 40% and grows exponentially: size = 40 · e^(k·t), k = 0.8 per second, so it reaches the target in about 1.15 s. It speeds up as it grows, like real glass as the wall thins.
- **Warm-up.** The first 10 gathers start at 60% (about 0.6 s each), so a retry gets back into the run fast. Difficulty is the same; only the wait is shorter.
- **Speed.** k rises 5% every 10 gathers, up to 2× the starting speed. The cap applies after the daily wind, as in Afterlight.
- **Daily wind.** Each gather after the first 10 gets a seeded speed change of −8% to +8%. Everyone gets the same sequence that day.
- **Heat.** Heat starts at 16 and never goes above 16. The crack ring is drawn at (100 + heat)% of the target, so heat is the visible gap between the target outline and the crack ring.

On release:

| Result | When | Effect |
|---|---|---|
| **Cracked** | e > heat | Run ends. |
| **Too thick** | e < −30 | Run ends (glass too thick to spin flat). |
| **Flawless** | −3 ≤ e ≤ 3 | Fills 1 pane. Reheat: heat +2 (max 16). Streak +1. |
| **Brilliant** | heat was ≥ 15 when the gather started, and e ≥ 6 | Fills **4** panes. No heat cost, no reheat. Streak unchanged. |
| **Over** | 3 < e ≤ heat, not brilliant | Fills 1 pane. Heat −0.18 × e. Streak resets. |
| **Under** | −30 ≤ e < −3 | Fills 1 pane. Heat −0.3 × \|e\|. Streak resets. |

- **Holding too long.** If the bubble grows past the crack ring while still held, it cracks at once and the run ends.
- **Cooling.** After every gather that doesn't end the run, heat drops by 0.2 + 0.008 × (gathers set so far). This keeps even expert runs finite (a few minutes).
- **Flawless streak.** Every 5th flawless in a row fills 2 panes instead of 1.
- **Fair window.** The flawless band always covers at least 2 simulation ticks of growth at the current speed. At high speed it widens to stay fair, like Afterlight's perfect window.
- **Brilliant zone** is shown only while it is open (heat ≥ 15 at the start of the gather), as a bright band between 106% and the crack ring.
  - Because cooling grows each gather, even a flawless release can't lift heat back to 15 after 100 gathers (16 − (0.2 + 0.008 × 100) = 15), so the zone closes for good late in a run. This is intended: it's a natural late-run limit, not a bug.
- **Quick taps don't count.** A release within 0.15 s (9 ticks) of the press is a mis-tap: no pane, no penalty, heat and streak unchanged. The bubble goes back to its start, a "Hold to blow, then let go" hint shows, and the next fresh press starts it over. Real releases always take longer (the warm-up bubble needs about 0.64 s), so this never affects balance. Mis-taps are counted for playtests.
- **Between gathers.** After a release, the pane sets with a short animation (about 0.4 s) and input is ignored. The next gather starts only on a **fresh press**; holding through doesn't start it.
- **Pause and tab switch.** Pausing, switching tabs or minimising scraps the gather in progress, and that gather starts over on resume. Nothing else changes (heat, streak and score stay). This stops players pausing near the target to line up their timing.
- **Simulation:** 60 ticks per second, fixed step, same as Afterlight. Press and release are mapped to the tick they happened on.

## Score and ranking

- **Score = panes filled.** One number, which is also how much of the window is lit.
- Ranking: panes, then flawless count, then the earliest time the server accepted the score.
- Retries are unlimited; only each player's best run of the day counts.

## The window

- 130 irregular pieces in a pointed stone arch, joined by lead lines, with two horizontal iron bars. Pieces not yet lit show the picture faintly, like the glazier's full-size drawing.
- **Hybrid art:** a hand-designed theme (picture, palette, regions) per window. Code cuts it into irregular pieces and sets the reveal order. The daily seed bends the lead lines and picks the glass shades, but which pieces exist is decided on a regular grid, so every day has exactly 130 (`src/window/geometry.ts`).
- **Reveal order follows the story,** not bottom-up: lower sea, then the sun (panes 37–47 in Harbour sunrise: a core and a ring of 10), then upward to the rays. Panes light one at a time.
- **Every 10th pane** sends a light flare across the lit part of the window, like Afterlight's beacon flare. Visual and sound only.
- **After 130 (later version):** play continues into **tomorrow's window** as a sneak peek, and the score keeps counting.
- **After 130 (v1):** the run ends as a win and shows the "The window is whole" screen.
- Themes rotate weekly like Afterlight's courses. First theme: Harbour sunrise.

## Feedback

- **Look-ahead:** the next 3 gathers show as glass colour; hotter colour means faster growth (the daily wind).
- **Heat is visible:** the crack ring closes in as heat drops, and the glass turns a duller red as it cools. A flawless release flashes the furnace (glory hole) and pushes the ring out.
- **Sound:** the blowing tone rises in pitch with size. A soft reference note plays for the target size, so players can time by ear. Flawless gets a glass chime that rises through the streak; brilliant gets a bright bell; a crack gets a sharp break.
- **Haptics (Android):** tick on set, double tick on flawless, rising pattern on brilliant, long buzz on a crack.
- Reduced-motion setting removes scenic motion and flashes, keeping the gameplay readable.

## Type

- **Logo:** Cinzel, semibold, letter-spaced, like letters carved in stone.
- **Titles, window names (italic) and big numbers:** Cormorant Garamond, semibold. Never below 500 weight on the dark background.
- **Everything else:** Manrope, shared with Afterlight. Use tabular figures for counters.

## Expected scores (simulated)

From `npm run sim` on the real engine, 3,000 endless runs per cell across 28 daily courses. Players are modelled as timing noise in milliseconds.

| Player | Always safe: median / best 10% | Brilliant at full heat: median / best 10% |
|---|---|---|
| Casual (90 ms) | 12 / 21 | 12 / 22 |
| Average (60 ms) | 27 / 48 | 22 / 55 |
| Good (40 ms) | 73 / 99 | 56 / 124 |
| Great (28 ms) | 125 / 149 | 184 / 231 |

Going for brilliant is a gamble for most players (a lower typical score, better best runs) and pays off for experts. Always letting go early (aiming at 92%) ends at about 9 panes, so the safe-play exploit doesn't work.

A brilliant release is worth 4 panes, decided in Phase 1. The early prototype simulation counted it as 4, and the push-your-luck balance was tuned on that; at 3, going for brilliant hurt everyone except experts.

## Daily course

- The date is UTC (`YYYY-MM-DD`) and changes at 00:00 UTC, which is 08:00 in the Philippines.
- FNV-1a hashes the date into the daily seed; Mulberry32 drives the wind and the window cuts, as in Afterlight.

## Fairness and ethics

- No lives, ads, paid boosts, random rewards or reminder notifications.
- Later (not in v1): runs record the press and release tick of every gather, and the server replays them against the day's seed before accepting a score, like Afterlight.

## v1 scope: core game first

**In:** blowing, heat, flawless, brilliant, streak, warm-up, look-ahead, sound, one window theme (Harbour sunrise), ready / run / run-ended screens, best score saved on the device.

**Later, once playtests say people love it:** new Supabase project with anonymous players and a daily board, server replay, day streak, share card, tomorrow's-window preview, more themes.

**Playtest bar for v1:** 3–5 people, first session, no prompting. Pass if most of them retry at least 3 times on their own and nobody calls the crack "random".

**Playtest logging (v1):** each run saves, on the device, every gather's release error `e`, result, heat before and after, and growth speed, plus how many retries happened in the session. An export button copies it as JSON. Use it to compare real players with `npm run sim` and retune before launch.

## Tech stack

Same as Afterlight, so code and habits carry over:

- React, TypeScript and Vite; Motion for animation; oxlint; `node --test` for tests.
- All game rules live in **one shared engine file** with no browser code, driven by ticks and the daily seed. The browser uses it now; the server will import the same file later to replay runs.
- Sounds are generated with Web Audio in code, like Afterlight's bells and splashes, so no sound files are needed.
- Fonts from `@fontsource` packages: Cinzel, Cormorant Garamond, Manrope.
- Browser-first, for phones and desktop. Mockups for both are on the canvas.

## Still open (doesn't block v1)

- Trademark, domain and app-store check for "Lehr", before launch. A quick web search found no game with the name, but "Lehre" is a common German word, so short domains may be taken.
- Window themes 2–7. v1 only needs Harbour sunrise.
