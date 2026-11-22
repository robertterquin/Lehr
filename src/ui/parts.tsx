// The pieces of the run screen: streak stars, the width meter, the message after a lock and the pause button.
import type { Engine } from '../game/engine.ts'
import { lockFeedback, spinLabel } from '../game/feedback.ts'
import { RULES } from '../game/rules.ts'

const STAR = 'M8 1L10 6H15L11 9.5L12.5 15L8 11.8L3.5 15L5 9.5L1 6H6Z'

/** Five stars, lit for the perfects in a row towards the next widen. */
export function Streak({ streak, size = 16 }: { streak: number; size?: number }) {
  const lit = streak > 0 && streak % RULES.widenEvery === 0 ? RULES.widenEvery : streak % RULES.widenEvery
  const label = streak === 0 ? 'No streak' : lit === RULES.widenEvery ? `${RULES.widenEvery} perfect · points widen` : `${streak} perfect in a row`
  return (
    <div className="streak">
      <div className="streak-stars" aria-hidden="true">
        {Array.from({ length: RULES.widenEvery }, (_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 16 16">
            <path d={STAR} fill={i < lit ? '#ffd27a' : '#1d1838'} stroke={i < lit ? '#b8862a' : '#3a3160'} strokeWidth="1" />
          </svg>
        ))}
      </div>
      <span className="streak-label">{label}</span>
    </div>
  )
}

/** Point width against the 8° minimum, with the spinning ring's speed and direction. */
export function Meter({ engine }: { engine: Engine }) {
  const width = Math.max(0, engine.run.width)
  const danger = width < 15
  return (
    <div className={`meter${danger ? ' danger' : ''}`}>
      <div className="meter-row">
        <span>
          Point width <strong>{Math.round(width)}°</strong>
        </span>
        <span>Spin {spinLabel(engine.ring.index)}</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${(width / RULES.startWidth) * 100}%` }} />
        <div className="meter-min" style={{ left: `${(RULES.minWidth / RULES.startWidth) * 100}%` }} />
      </div>
      <span className="meter-note">{danger ? 'Points are nearly too thin · lock perfect to widen them' : `Below ${RULES.minWidth}° the points can’t hold a ring`}</span>
    </div>
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
          <span className="callout-note">{feedback.note}</span>
        </div>
      )}
    </div>
  )
}

export function IconButton({ label, onPress, pressed, children }: { label: string; onPress: () => void; pressed?: boolean; children: React.ReactNode }) {
  return (
    // Pointer-down on a button must not also lock a ring.
    <button type="button" className="icon-button" aria-label={label} aria-pressed={pressed} onPointerDown={(event) => event.stopPropagation()} onClick={onPress}>
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
