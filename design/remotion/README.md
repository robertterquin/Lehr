# Parol design source

Remotion project that renders the Parol demo video (`../parol-demo.mp4`) and every page mockup (`../mockups/`).

- `src/parol.ts`: star geometry and the lock rules (perfect keeps the width, off-angle trims it, 5 perfects widen it).
- `src/ParolStar.tsx`: the parol drawing used by the mockups: backlit paper rings, bamboo frame, tambor, halos, tails.
- `src/mockups/`: phone (`phone.tsx`) and desktop (`desktop.tsx`) pages, sharing `kit.tsx`.

```bash
npm install
npx remotion studio                                    # preview
npx remotion still P04-Spinning out.png --scale=2      # one page
node parol.test.ts                                     # rules self-check
```
