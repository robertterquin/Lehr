# Parol — Development phases

The plan for replacing Lehr with Parol and building Parol to launch. The design lives in [design/PAROL-DESIGN.md](design/PAROL-DESIGN.md) and on the [Parol Mockups canvas](https://claude.ai/artifact/SqEiH7UcVE4ntsC5gQPtBe); the rules in [GAME-RULES.md](GAME-RULES.md). Each phase ends with a check before the next one starts.

Phases 0–8 are **v1**: the game played on the device, with no accounts or board. Phases 9–10 happen only if the v1 playtest passes.

Sizes are relative effort, not dates.

## Status

- [x] Phase 0 · Keep the old game, rename everything — `lehr-prototype` tagged; repo, remote and folder are Parol (no Vercel project existed yet)
- [ ] Phase 1 · Clear Lehr out — Lehr code gone, empty Parol screen builds and runs; Vercel deploy still to do
- [x] Phase 2 · The rules on paper — rules in `src/game/rules.ts` and GAME-RULES.md; simulated medians 15 / 23 / 46 / 124 rings
- [x] Phase 3 · Game engine, no visuals — `src/game/engine.ts`; runs replay exactly from seed + inputs; the simulation plays on it
- [ ] Phase 4 · The star and the street — star, street and seven nights in `src/draw/`, spinning ring on its own GPU layer; smoothness check on a real phone still to do
- [ ] Phase 5 · A playable run
- [ ] Phase 6 · Feel
- [ ] Phase 7 · The other screens
- [ ] Phase 8 · Playtest and tune
- [ ] Phase 9 · The daily online loop
- [ ] Phase 10 · Launch polish

## Phase 0 · Keep the old game, rename everything *(small)*

- Tag the current code `lehr-prototype` and push the tag, so Lehr can always be restored.
- Rename the GitHub repo from Lehr to Parol, then the local folder, the git remote, the Vercel project and the saved project notes.

**Done when:** the tag is on GitHub, and the Parol repo and folder work with nothing lost.

## Phase 1 · Clear Lehr out *(small)*

- Delete Lehr's rules (`GAME-RULES.md`), engine (`src/engine/`), stained-glass window (`src/window/`), furnace and gauge screens (`src/ui/`), balance simulation and their tests.
- Keep the tooling (Vite, React, TypeScript, Motion, oxlint, `node --test`, Vercel), the fixed-step game loop and the daily seed (FNV-1a + Mulberry32): both carry over unchanged.
- Swap the fonts to Young Serif and Manrope, and rename the package and page title to Parol.

**Done when:** the app builds, an empty Parol night screen loads from the Vercel link, and the kept tests pass.

## Phase 2 · The rules on paper *(small)*

- Write `GAME-RULES.md`: the perfect window, 36° starting points, 8° minimum, +6° for every 5 perfects in a row, the spin speed curve, reversing every 5 rings, the milestone ladder, the seven nights, the daily seed.
- A balance simulation (`npm run sim`) that checks the target reach: casual ~15 rings, good ~60, great 100+.

**Done when:** the simulation's results match the target table, and every number is written down.

## Phase 3 · Game engine, no visuals *(medium, the most important)*

- One engine built on `src/game/rules.ts`, where a run is the day's seed plus timed inputs, so a server can replay runs later: daily seed (each ring's speed and direction), spin-in, lock, trim, widen, streak, run end, pause.
- Taps are timed to the millisecond and the lock error comes from the exact tap time, never a frame (one 60 Hz frame is nearly the whole perfect window at speed). Time drives the ring, so the engine needs no fixed-tick loop.
- Tests for each rule and its edges: exactly 2.5° off, exactly 8° wide, the widen cap at 36°, a tap during spin-in.
- The simulation runs on the real engine, so the two can never disagree.

**Done when:** all tests pass, and the simulation reproduces the table in `GAME-RULES.md`.

## Phase 4 · The star and the street *(medium)*

- Move the parol (rings, bamboo frame, tambor, tails, halos, bulbs, camera pull-back), the realistic street and the seven nights from `design/remotion/` into the game as SVG.
- Each night's paper colours and the milestone scenery from 20 to 100.

**Done when:** a 100-ring star and a full street stay smooth on a mid-range phone.

## Phase 5 · A playable run *(large)*

- Lock by tap, click or Space; too-quick taps are ignored.
- On screen: rings and streak, the Perfect / off-angle messages, the width meter, danger state.
- Pause, and pause on tab switch.
- Phone and desktop layouts.

**Done when:** a full run plays from the first ring to the end, on both phone and desktop.

## Phase 6 · Feel *(medium)*

- Sounds made with Web Audio, following the sound sheet (DS02): capiz bells climbing the streak, bamboo knock, paper trim, heartbeat, gong at milestones, the star rising.
- Music layers that build every 10 rings.
- Phone vibration, every animation in the motion storyboard (MS01), reduced-motion mode.

**Done when:** the game feels like the run prototype video (`design/parol-run-prototype.mp4`), sound included.

## Phase 7 · The other screens *(medium)*

- Loading, Ready, How to play, Settings, the milestone moments, the 100-ring star and past 100, Run ended, Tonight's journey.
- Offline and first-visit states.
- Playtest logging, so we see where runs end.

**Done when:** every v1 screen on the canvas exists in the game.

## Phase 8 · Playtest and tune *(medium)*

- Real people play for several days; tune the numbers with the simulation.

**Done when:** people want "one more run", and reach matches the targets. This is the gate for Phases 9–10.

## Phase 9 · The daily online loop *(large)*

- A new Supabase project (separate from Afterlight), player names with a filter, today's board.
- Runs checked on the server by replaying their inputs.
- The streak calendar, the day changing over on Manila time.
- The share card and gold share card images.

**Done when:** two phones see the same star and the same board, and a tampered score is rejected.

## Phase 10 · Launch polish *(medium)*

- Filipino copy, an accessibility check, link preview, app icon and installable app, a final performance pass, the real domain.

**Done when:** Parol is live at its link and ready to share.
