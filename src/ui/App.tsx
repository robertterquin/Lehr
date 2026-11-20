import { useState } from 'react'
import { WINDOW_PANES, createDailyChallenge, type Outcome } from '../engine/engine.ts'
import { THEME_NAME } from '../window/geometry.ts'
import StainedWindow from './StainedWindow.tsx'

// shortcut: Phase 2 preview with a sample pattern of flawless and brilliant panes; replaced by the real run in Phase 3.
const challenge = createDailyChallenge()
const sampleOutcomes: Outcome[] = Array.from({ length: WINDOW_PANES }, (_, i) =>
  i % 23 >= 19 ? 'brilliant' : i % 4 === 0 ? 'flawless' : 'over',
)

export default function App() {
  const [lit, setLit] = useState(58)
  const [complete, setComplete] = useState(false)

  return (
    <main className="preview">
      <h1 className="wordmark">Lehr</h1>
      <StainedWindow
        className="preview-window"
        seed={challenge.seed}
        lit={lit}
        outcomes={sampleOutcomes}
        newest={lit > 0 ? [lit - 1, lit] : undefined}
        complete={complete}
        glow={complete}
      />
      <p className="tagline">
        {THEME_NAME} · {challenge.date}
      </p>
      <div className="preview-controls">
        <label>
          Lit panes <strong>{complete ? WINDOW_PANES : lit}</strong>
          <input type="range" min={0} max={WINDOW_PANES} value={lit} onChange={(event) => setLit(Number(event.target.value))} />
        </label>
        <label className="preview-check">
          <input type="checkbox" checked={complete} onChange={(event) => setComplete(event.target.checked)} />
          Window complete
        </label>
      </div>
    </main>
  )
}
