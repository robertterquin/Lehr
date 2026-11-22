# Parol — design reference

Visual and journey design for Parol. Mockups: [mockups/](mockups/) (rendered from [remotion/](remotion/)). Rules, numbers and balance go in the game rules document once Parol replaces Lehr in this repo.

## The star

A traditional parol: concentric five-pointed rings of backlit paper on a bamboo frame (the Kapampangan parol is built from concentric layers), a **tambor** (drum) at the centre, two **buntot** tails of crepe paper ending in tassels, and halos with bulbs like Pampanga's giant lanterns. Every ring is the same star shape scaled up. The camera pulls back as the star grows, so any number of rings fits the screen.

- A **perfect** lock (within 1.5°) keeps the points' width and lights bulbs on that ring's points.
- An **off-angle** lock trims the overhang, which falls away, and the points get thinner by the error.
- **Five perfects in a row** widen the points back by 6° (never past the starting 36°).
- Points below **8°** can't hold a ring: the run ends.

## The journey: milestones every 10 rings

The street comes alive as the star grows, and the run never stops at a milestone.

| Rings | Milestone | On the star | In the street |
|---|---|---|---|
| 10 | First halo | A bamboo hoop with bulbs | — |
| 20 | Street lights | — | The string lights across the street come on |
| 25 | — | Tails grow longer | — |
| 30 | Neighbours' parols | — | Every house lights its own parol under the eaves |
| 40 | Carolers | — | Children with a star on a stick and tambourines; a carolling rhythm joins the music |
| 50 | The whole barangay | Second halo; tails grow again | Far hills twinkle with lit houses |
| 60 | Rotor mode | Bulbs on every ring chase around the star, like a giant lantern's rotor | — |
| 70 | Lantern festival | — | Giant lanterns glow over the rooftops in the plaza |
| 75 | — | Tails grow a third time | — |
| 80 | Fireworks | Third halo | Fireworks burst in the sky |
| 90 | Simbang Gabi dawn | — | The sky warms toward dawn and the moon sets; a church bell rings |
| 100 | **The star rises** | The parol lifts off its wire and becomes one bright star with light rays: the Star of Bethlehem | Dawn, fireworks, festival |

- **At 100:** a celebration screen ("Your parol became a star"), a chime, a **gold star** on that day of the streak, and the **gold share card**. The run continues with **Keep going**.
- **Past 100:** every 10 rings adds a star to the player's own constellation around the risen star.
- **Sound:** each milestone adds a layer to the music, so the sound tells the player how far they are.

## Target reach (to tune with the balance simulation)

| Player | Typical run | Reaches |
|---|---|---|
| Casual | ~15 | First halo, sometimes street lights |
| Average | ~30 | Neighbours' parols |
| Good | ~60 | Rotor mode |
| Great | 100+ | The star rises, on good days |

## The street

Drawn from Filipino references so every element can be named at a glance:

- **Bahay kubo:** a thick, shaggy thatch hip roof with a wide overhang, walls of vertical bamboo poles, a window shutter propped open on a stick, the floor on bamboo stilts set on concrete footings, a bamboo ladder.
- **Row house with a sari-sari store:** corrugated iron (yero) roof, a painted "SARI-SARI STORE" sign, goods on shelves behind a wire-mesh window, a steel grille gate. The store stays lit from the first ring.
- **Bahay na bato:** a stone ground floor with an arched zaguan door; an overhanging wooden upper floor with sliding capiz windows over ventanillas with balusters; a clay tile hip roof.
- A concrete **utility pole** with crossarm, insulators, transformer and sagging wires; a **sodium street lamp** casting light on the road; **Christmas bulbs** strung across the street; two **coconut palms**; the **parish church** with its bell tower at the end of the street; real **mini parols** (star, hoop, tambor, tails) in every window.
- Milestones change the scene: lights at 20, parols at 30, carolers (a parol on a stick, a bottle-cap tambourine) at 40, far hills at 50, Pampanga-style giant lanterns at 70, fireworks at 80, dawn at 90, when the moon sets and the church lights up.

## Seven nights

The look changes with the weekday (Manila time), so everyone on a day's board plays the same place. Only the paper colours and the scene change; the rules, the seed and the streak's scale do not. Overview: [mockups/W01-Seven-nights.png](mockups/W01-Seven-nights.png).

| Day | Night | Scene | Paper |
|---|---|---|---|
| Lunes · Monday | Barangay | Bahay kubo, sari-sari store, bahay na bato, the parish church | Pearl, red, gold, green, blue, magenta |
| Martes · Tuesday | San Fernando, Pampanga | Giant lanterns on steel frames, a sorbetes cart, the crowd, the cathedral dome | Lantern red, amber, emerald, sapphire, ivory, violet |
| Miyerkules · Wednesday | Rooftop, Manila | Water tank, laundry line, monobloc chairs, the skyline and a lit LRT train | Pearl, coral, teal, yellow, sky blue, pink |
| Huwebes · Thursday | Palayan, Albay | Rice paddies under Mayon, a kubo, a sleeping carabao, fireflies | Pearl, straw, leaf green, rust, rice, bamboo |
| Biyernes · Friday | Intramuros, Manila | The walls, a garita, the gate, a kalesa, gas lamps, the cathedral | Ivory, crimson, antique gold, teal, navy, rose |
| Sabado · Saturday | Dagat | Stilt houses, bangkas with lamps, nets, a lighthouse, the moon on the sea | Pearl, aqua, coral, sand, deep blue, seafoam |
| Linggo · Sunday | Simbahan | A baroque church after Simbang Gabi, bibingka and puto bumbong stalls | Pearl, ube purple, bibingka gold, banana leaf, red, lavender |

Every scene keeps the milestone ladder: lights at 20, parols at 30, carolers at 40, far lights at 50, giant lanterns at 70, fireworks at 80, dawn at 90.

## Motion and sound

Watch and listen: [parol-run-prototype.mp4](parol-run-prototype.mp4) (a 23-ring run with every sound in place). Timings, curves and cues: [mockups/MS01-Motion-storyboard.png](mockups/MS01-Motion-storyboard.png); sounds: [mockups/DS02-Sound-design.png](mockups/DS02-Sound-design.png).

| Moment | Motion | Sound |
|---|---|---|
| Ring spins in | Fades in 0.15 s; constant spin, 6°/s faster per ring, direction flips every 5 rings | Paper whoosh, −9 dB |
| Perfect | Snaps 0.08 s; gold glow 0.06 s in, 0.6 s out | Capiz bell climbing D5 E5 F♯5 A5 B5 with the streak |
| Perfect ×5 | Points widen 0.35 s back-out; star swells 5% | Five bells run up |
| Off-angle | Sliver falls 1.2 s under gravity; 2 px shake 0.25 s | Paper tear |
| Danger (under 15°) | Red edge breathes at 1 Hz; meter glows | Low double thump on each ring |
| Milestone | Toast drops in 0.3 s, holds 2.1 s; street changes (lights flicker on left to right over 0.8 s); next ring waits 1.5 s | Kulintang gong with bells |
| Run ends | Star shrinks and dims 1.2 s; results rise 0.4 s | Three falling bells, D B G |
| 100 rings | Parol lifts off its wire 2.5 s; rays open | Gong under bells climbing two octaves |
| Reduced motion | Shakes, pulses, slivers and fireworks become 0.15 s fades; the spin stays | Unchanged |

All sounds are synthesized (Web Audio in the game; [remotion/sound/gen-sounds.ts](remotion/sound/gen-sounds.ts) for these previews), start after the first tap, and mute from the HUD or Settings.

## Look

- Night indigo sky; capiz/papel de Japon colours: pearl, red, gold, green, blue, magenta; bamboo brown frame.
- Type: Young Serif for titles and numbers, Manrope for everything else.

## Every screen

The whole app on one page: [mockups/A01-App-map.png](mockups/A01-App-map.png).

| Flow | Screens (files in `mockups/`) |
|---|---|
| Start | P01 Loading · P02 Ready · P03 How to play · P14 Settings · P26 Tonight's journey (milestone map) |
| Play | P04 Spinning · P05 Perfect · P06 Perfect ×5 · P07 Off-angle trim · P08 Danger · P10 Paused |
| Journey | P19 20 · P09 30 · P20 40 · P21 50 · P22 60 · P16 70 · P23 80 · P24 90 · P17 100 (star rises) · P25 past 100 (constellation) |
| After the run | P11 Run ended · P13 Share · P12 Today's board · P15 share card · P18 gold share card (100+) |
| Nights | W01 Seven nights · N01 Barangay · N02 San Fernando · N03 Rooftop · N04 Palayan · N05 Intramuros · N06 Dagat · N07 Simbahan |
| Desktop | D01 Ready · D02 Spinning · D03 Run ended · D04 Board |
| Edge cases | S01 First visit · S02 Offline · S03 Name not allowed · S04 New day · S05 Empty board · S06 Reduced motion |
| Brand | B01 Logo · B02 App icon (1024, platform masks the corners) · B03 Link preview (1200×630) |
| System | DS01 Design system: colours with measured WCAG contrast, type scale, components, rules for building · MS01 Motion storyboard · DS02 Sound design |
