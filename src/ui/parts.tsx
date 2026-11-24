// The pieces of the run screen: streak stars, the width meter, the message after a lock and the pause button.
import type { Engine } from '../game/engine.ts'
import { lockFeedback } from '../game/feedback.ts'
import { RULES } from '../game/rules.ts'
import { MiniParol } from '../draw/street.tsx'
import { t } from '../copy.ts'
import { weekdayIndex } from '../game/daily.ts'
import { useEffect, useState } from 'react'

/** The end score counts up from 0 (0.7 s, easing out) once the words have risen; reduced motion shows it at once. */
export function CountUp({ to, delayMs, calm }: { to: number; delayMs: number; calm: boolean }) {
  const [shown, setShown] = useState(calm ? to : 0)
  useEffect(() => {
    if (calm) return setShown(to)
    const start = performance.now() + delayMs
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 700))
      setShown(Math.round(to * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [to, delayMs, calm])
  return shown
}

/** Five diamonds, lit for the perfects in a row towards the next widen. */
export function Streak({ streak }: { streak: number }) {
  const lit = streak > 0 && streak % RULES.widenEvery === 0 ? RULES.widenEvery : streak % RULES.widenEvery
  const label = streak === 0 ? t().streakLabelNone : lit === RULES.widenEvery ? t().streakLabelWiden : t().streakLabel(streak)
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
  // The width, in plain numbers, just inside the arc's tip; the coral notch marks the limit.
  const shown = Math.max(0, Math.min(width, RULES.startWidth))
  const label = (deg: number) => {
    const a = ((deg - 240) * Math.PI) / 180
    return [c + (r - 16) * Math.cos(a), c + (r - 16) * Math.sin(a)]
  }
  const [tx, ty] = label((shown / RULES.startWidth) * SWEEP)
  const arc = `M${x0} ${y0}A${r} ${r} 0 1 1 ${x1} ${y1}`
  const length = (2 * Math.PI * r * SWEEP) / 360
  const filled = (Math.max(0, Math.min(width, RULES.startWidth)) / RULES.startWidth) * length
  return (
    <svg className={`gauge${danger ? ' danger' : ''}`} width={box} height={box} style={{ left: (size - box) / 2, top: (size - box) / 2 }} role="img" aria-label={t().gaugeLabel(Math.round(width))}>
      <path d={arc} className="gauge-track" />
      <path d={arc} className="gauge-fill" style={{ strokeDasharray: `${filled} ${length}` }} />
      <circle cx={mx} cy={my} r="3" className="gauge-min" />
      <text x={tx} y={ty} className="gauge-width" textAnchor="middle" dominantBaseline="central">
        {Math.round(shown)}°
      </text>
    </svg>
  )
}

const PAROLS = 10

/**
 * Tonight's ten milestones as ten parols on a string: one lights for every ten rings, and the next waits,
 * outlined, with the rings to go under it. A parol remounts when it lights, so it glows in.
 */
export function Garland({ width, lit, palette, toGo }: { width: number; lit: number; palette: string[]; toGo?: number }) {
  const w = Math.round(Math.min(width, 640))
  const top = 10
  const sag = 22
  const on = Math.max(0, Math.min(PAROLS, lit))
  return (
    <svg className="garland" width={w} height={toGo === undefined ? 92 : 108} role="img" aria-label={t().garlandLabel(on, toGo !== undefined && on < PAROLS ? toGo : undefined)}>
      <path d={`M0 ${top}Q${w / 2} ${top + sag * 2} ${w} ${top}`} className="garland-string" />
      {Array.from({ length: PAROLS }, (_, i) => {
        const t = (i + 0.5) / PAROLS
        const x = t * w
        const y = top + sag * 4 * t * (1 - t) + 20
        return (
          <g key={`${i}-${i < on}`} className={i < on ? 'garland-on' : undefined} data-parol={i}>
            <MiniParol x={x} y={y} r={10} color={palette[(i % (palette.length - 1)) + 1]} lit={i < on} string={9} />
            {i === on && <circle cx={x} cy={y} r={16} className="garland-next" />}
            {i === on && toGo !== undefined && (
              <text x={x} y={y + 44} className="garland-to-go" textAnchor="middle">
                {toGo}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** The message after each lock. It replays its fade for every lock, and screen readers hear it. */
export function Callout({ engine, top }: { engine: Engine; top: number }) {
  const feedback = lockFeedback(engine)
  return (
    <div className="callout in-gap" style={{ top }} aria-live="polite">
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

/**
 * The nights row under the landing button: this week (Monday to Sunday), or during Simbang Gabi its nine nights.
 * A star for each night played, white-gold for a 100-ring night, a moon for a rest night that kept the streak,
 * tonight dashed until it's played. Under it the streak (or the novena's count) and the way into the album.
 */
export function WeekStars({ days, labels, nights, today, streak, rests, season, onAlbum }: {
  days: string[]
  labels: string[]
  nights: Record<string, number>
  today: string
  streak: number
  rests: string[]
  season: boolean
  onAlbum: () => void
}) {
  const playedTonight = today in nights
  const lit = days.filter((day) => day in nights).length
  const rest = rests.find((day) => days.includes(day))
  const note = season
    ? t().novenaNote(lit)
    : streak === 0 ? t().streakNone
    : rest ? t().streakRested(streak, t().weekdays[weekdayIndex(rest)])
    : !playedTonight ? t().streakKeep(streak)
    : streak === 1 ? t().streakStarts
    : t().streakNights(streak)
  return (
    <div className="week">
      <div className="week-row" role="img" aria-label={t().weekLabel(note, lit)}>
        {days.map((day, i) => {
          const best = nights[day]
          const state = best !== undefined ? (best >= 100 ? 'gold' : 'lit') : rests.includes(day) ? 'rest' : day === today ? 'tonight' : day > today ? 'later' : 'missed'
          return (
            <span key={day} className={`week-day is-${state}${day === today ? ' is-today' : ''}`} aria-hidden="true">
              <svg className="week-star" viewBox="0 0 16 16">
                {state === 'rest' ? <path d="M10.8 2.2a6 6 0 1 0 3 9.6 5 5 0 1 1-3-9.6z" /> : <path d="M8 1.2l1.9 4.2 4.6.5-3.4 3.1 1 4.5L8 11.2 3.9 13.5l1-4.5L1.5 5.9l4.6-.5z" />}
              </svg>
              {labels[i]}
            </span>
          )
        })}
      </div>
      <span className="week-note">
        {note}
        <span className="dot">·</span>
        <button type="button" className="link inline-link" onClick={onAlbum}>
          {t().album}
        </button>
      </span>
    </div>
  )
}
