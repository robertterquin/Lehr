# Lehr — Development phases

The plan for building Lehr. The rules themselves live in [GAME-RULES.md](GAME-RULES.md); this file is the order we build them in. Each phase ends with a check before the next one starts.

Phases 1–6 are **v1**: the core game, played on the device. Phases 7–8 happen only if the v1 playtest passes.

Sizes are relative effort, not dates.

## Status

- [ ] Phase 0 · Setup — app scaffolded and building; Vercel deploy still to do
- [x] Phase 1 · Game engine, no visuals — 17 tests pass; brilliant set to 4 panes
- [ ] Phase 2 · The window — built and tested (130 pieces every day, SVG, ~3 ms redraw on desktop); real-phone check waits for the Vercel deploy
- [ ] Phase 3 · A playable run
- [ ] Phase 4 · Feel
- [ ] Phase 5 · The other screens and playtest logging
- [ ] Phase 6 · Playtest and tune
- [ ] Phase 7 · Daily online loop
- [ ] Phase 8 · Launch polish

## Phase 0 · Setup *(small)*

- Create the app with Vite, React and TypeScript, plus Motion, oxlint, `node --test` and the `@fontsource` packages for Cinzel, Cormorant Garamond and Manrope.
- Folders: `src/engine/` for the game rules (no browser code) and `src/ui/` for screens.
- Deploy to Vercel early, so testers have a link from day one.

**Done when:** an empty dark Lehr screen loads on a phone from the Vercel link.

## Phase 1 · Game engine, no visuals *(medium, the most important)*

- One engine with every rule from GAME-RULES.md: daily seed, growth, warm-up, speed and wind, heat, the six release results, cooling, streak, brilliant zone, fair flawless band, run end.
- Driven by ticks (60 a second), so the server can replay runs later.
- Tests for each rule, especially edge cases: exactly ±3%, heat exactly 15, gather 100.
- Switch the balance simulation to use the real engine (`scripts/balance-sim.ts`, `npm run sim`), so the simulation and the game can never disagree.

**Done when:** all tests pass, and the simulation run on the real engine reproduces the score table in GAME-RULES.md.

## Phase 2 · The window *(medium)*

- Move the window generator from the mockups into code: irregular pieces, lead lines, stone arch, iron bars, story order (sun at panes 37–45), faint unlit drawing, flawless glints, newest-pane highlight.
- Draw it as SVG paths, not the mockups' clipped boxes, so phones stay smooth.

**Done when:** the window matches the mockup and stays smooth on a mid-range phone.

## Phase 3 · A playable run *(large)*

- Input: hold and release by touch, mouse or Space. A new bubble starts only on a fresh press; input is ignored during the 0.4 s setting animation.
- Furnace scene: bubble, target outline, flawless band, brilliant band, crack ring, glowing furnace.
- On-screen info: piece count, streak discs, heat meter, look-ahead, gauge.
- Pause and tab switch scrap the current bubble.
- Phone and desktop layouts.

**Done when:** a full run can be played from the first bubble to a crack, on both phone and desktop.

## Phase 4 · Feel *(medium)*

- Sounds made in code with Web Audio: blowing tone rising in pitch, target reference note, flawless chime rising through the streak, brilliant bell, crack.
- Android vibration patterns.
- Furnace flash on flawless, crack animation, light flare every 10th pane.
- Reduced-motion mode.

**Done when:** it feels good to play with eyes half-closed, and sound alone tells you how you did.

## Phase 5 · The other screens and playtest logging *(medium)*

- Ready, run ended and window complete screens (130 panes = a win in v1).
- Best score saved on the device.
- Playtest log of every release (error, result, heat, speed, retries) with an **Export** button.

**Done when:** ready → run → results → retry works end to end, and a run's log can be exported.

## Phase 6 · Playtest and tune *(small to medium)*

- Give 3–5 people the link with no explanation; collect their exported logs.
- Compare real players with the simulation; adjust tuning numbers only, not code.
- **Decision:** pass if most testers retry at least 3 times on their own and nobody calls the crack "random".

**Done when:** it passes, or we know exactly what to fix.

## After the playtest passes

### Phase 7 · Daily online loop

A new Supabase project: anonymous players, server replay of runs using the same engine, daily board, player names, day streak.

### Phase 8 · Launch polish

Share card, continuing into tomorrow's window, themes 2–7, trademark and domain check, link previews for social media, making the repo public.

## Why this order

- **Engine before visuals.** It's the riskiest and most reused part: the game, the simulation and the server all depend on it. Testing it alone catches rule bugs before they hide behind animation.
- **Playable before pretty.** Phase 3 shows whether the core action feels right before time goes into sound and polish.
- **Online last.** No leaderboard until the game has passed its playtest.
