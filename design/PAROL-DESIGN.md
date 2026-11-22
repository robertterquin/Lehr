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
| Desktop | D01 Ready · D02 Spinning · D03 Run ended · D04 Board |
| Brand | B01 Logo · B02 App icon (1024, platform masks the corners) · B03 Link preview (1200×630) |
