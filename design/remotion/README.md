# Parol design source

Remotion project that renders the Parol demo video (`../parol-demo.mp4`), the run prototype with sound (`../parol-run-prototype.mp4`) and every page mockup (`../mockups/`).

- `src/parol.ts`: star geometry and the lock rules (perfect keeps the width, off-angle trims it, 5 perfects widen it).
- `src/ParolStar.tsx`: the parol drawing used by the mockups: backlit paper rings, bamboo frame, tambor, halos, tails.
- `src/mockups/`: phone (`phone.tsx`) and desktop (`desktop.tsx`) pages, sharing `kit.tsx`; motion storyboard and sound sheet (`motion.tsx`); the seven nightly scenes and palettes (`nights.tsx`) and their screens (`week.tsx`).
- `src/RunPrototype.tsx`: a scripted run under the real rules, with every sound cue.
- `sound/gen-sounds.ts`: synthesizes `public/sfx/*.wav` and the waveform data; `sound/check-sounds.ts` checks tuning and clipping.

```bash
npm install
npx remotion studio                                    # preview
npx remotion still P04-Spinning out.png --scale=2      # one page
node parol.test.ts                                     # rules self-check
node sound/gen-sounds.ts && node sound/check-sounds.ts # make and check the sounds
npx remotion render Run-prototype out.mp4 --scale=2    # the run with sound
```
