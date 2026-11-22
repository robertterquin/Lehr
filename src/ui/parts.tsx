// The pieces of the run screen: streak stars, the width meter, the message after a lock and the pause button.
import type { Engine } from '../game/engine.ts'
import { lockFeedback } from '../game/feedback.ts'
import { RULES } from '../game/rules.ts'

/** Five diamonds, lit for the perfects in a row towards the next widen. */
export function Streak({ streak }: { streak: number }) {
  const lit = streak > 0 && streak % RULES.widenEvery === 0 ? RULES.widenEvery : streak % RULES.widenEvery
  const label = streak === 0 ? 'No streak' : lit === RULES.widenEvery ? `${RULES.widenEvery} perfect · points widen` : `${streak} perfect in a row`
  // The diamonds say it on screen; the label says it to screen readers.
  return (
    <div className="streak" role="img" aria-label={label}>
      {Array.from({ length: RULES.widenEvery }, (_, i) => (
        <span key={i} className={i < lit ? 'lit' : undefined} />
      ))}
    </div>
  )
}

const SWEEP = 300

/**
 * Point width as an arc around the star, so the player never looks away from it: a full sweep at 36°,
 * shrinking as misses trim the points, with a mark at the 8° minimum. It turns coral when they're thin.
 */
export function ArcGauge({ size, width, danger }: { size: number; width: number; danger: boolean }) {
  const box = size * 1.24
  const r = box / 2 - 3
  const c = box / 2
  const at = (deg: number) => {
    const a = ((deg - 240) * Math.PI) / 180
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const [x0, y0] = at(0)
  const [x1, y1] = at(SWEEP)
  const [mx, my] = at((RULES.minWidth / RULES.startWidth) * SWEEP)
  const arc = `M${x0} ${y0}A${r} ${r} 0 1 1 ${x1} ${y1}`
  const length = (2 * Math.PI * r * SWEEP) / 360
  const filled = (Math.max(0, Math.min(width, RULES.startWidth)) / RULES.startWidth) * length
  return (
    <svg className={`gauge${danger ? ' danger' : ''}`} width={box} height={box} style={{ left: (size - box) / 2, top: (size - box) / 2 }} role="img" aria-label={`Point width ${Math.round(width)}°`}>
      <path d={arc} className="gauge-track" />
      <path d={arc} className="gauge-fill" style={{ strokeDasharray: `${filled} ${length}` }} />
      <circle cx={mx} cy={my} r="3" className="gauge-min" />
    </svg>
  )
}

/** The message after each lock. It replays its fade for every lock, and screen readers hear it. */
export function Callout({ engine }: { engine: Engine }) {
  const feedback = lockFeedback(engine)
  return (
    <div className="callout" aria-live="polite">
      {feedback && (
        <div key={engine.locks.length} className="callout-body">
          <span className={`callout-title ${feedback.tone}`}>{feedback.title}</span>
        </div>
      )}
    </div>
  )
}

export function IconButton({ label, onPress, pressed, ring, children }: { label: string; onPress: () => void; pressed?: boolean; ring?: boolean; children: React.ReactNode }) {
  return (
    // Pointer-down on a button must not also lock a ring.
    <button type="button" className={`icon-button${ring ? ' ring' : ''}`} aria-label={label} aria-pressed={pressed} onPointerDown={(event) => event.stopPropagation()} onClick={onPress}>
      {children}
    </button>
  )
}

export const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 3v12M12 3v12" />
  </svg>
)

export const SoundIcon = ({ off }: { off: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8v4h3l4 3V5L6 8Z" />
    {off ? <path d="M13.5 8l4 4M17.5 8l-4 4" /> : <path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />}
  </svg>
)
