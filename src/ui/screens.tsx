// The screens around a run: How to play, Settings, Tonight's journey, the star rising at 100 and a new day.
import { useId, type ReactNode } from 'react'
import { RULES } from '../game/rules.ts'
import { Star } from '../draw/star.tsx'

/** A bottom sheet over the screen; Esc and the close button close it. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const id = useId()
  return (
    <div className="overlay overlay-sheet" role="dialog" aria-modal="true" aria-labelledby={id} onPointerDown={(event) => event.stopPropagation()}>
      <div className="sheet">
        <div className="sheet-head">
          <h2 id={id} className="sheet-title">{title}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** A small star in a square: drawn larger and cropped to its rings, so a few rings fill the box. */
function MiniStar({ locks, palette }: { locks: number[]; palette: string[] }) {
  return (
    <div className="mini-star" aria-hidden="true">
      <div className="mini-star-zoom">
        <Star size={150} locks={locks} palette={palette} />
      </div>
    </div>
  )
}

const STEPS = [
  { title: 'A ring spins in', text: 'Each new ring of the star turns around the centre.', locks: [0, 0] },
  { title: 'Tap to lock it', text: `Lock when its points meet the gold dashes. Within ${RULES.perfectWithin}° is perfect.`, locks: [0, 0, 0] },
  { title: 'Off-angle gets trimmed', text: `The overhang falls away and the points get thinner. Below ${RULES.minWidth}° the run ends.`, locks: [0, 0, 9] },
  { title: `${RULES.widenEvery} perfect in a row`, text: `${RULES.widenEvery} perfect locks widen the points back by ${RULES.widenBy}°.`, locks: [9, 0, 0, 0, 0, 0] },
]

export function HowToPlay({ palette, onClose }: { palette: string[]; onClose: () => void }) {
  return (
    <Sheet title="How to light a parol" onClose={onClose}>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step.title} className="step">
            <MiniStar locks={step.locks} palette={palette} />
            <div className="step-text">
              <span className="step-title">{step.title}</span>
              <span className="step-note">{step.text}</span>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="primary" autoFocus onClick={onClose}>
        Got it
      </button>
    </Sheet>
  )
}

function Toggle({ label, note, on, onChange }: { label: string; note: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="toggle">
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        <span className="toggle-note">{note}</span>
      </span>
      <input type="checkbox" role="switch" checked={on} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

export type SettingsProps = {
  sound: boolean
  vibration: boolean
  calm: boolean
  runs: number
  onSound: (on: boolean) => void
  onVibration: (on: boolean) => void
  onCalm: (on: boolean) => void
  onHowTo: () => void
  onDownloadLog: () => void
  onClose: () => void
}

export function Settings({ sound, vibration, calm, runs, onSound, onVibration, onCalm, onHowTo, onDownloadLog, onClose }: SettingsProps) {
  return (
    <Sheet title="Settings" onClose={onClose}>
      <Toggle label="Sound" note="Bells on each lock, chimes on perfects, music as the star grows" on={sound} onChange={onSound} />
      <Toggle label="Vibration" note="Android only · iPhones don’t allow it on the web" on={vibration} onChange={onVibration} />
      <Toggle label="Reduced motion" note="Short fades instead of shakes, falls and flickers; the ring still spins" on={calm} onChange={onCalm} />
      <div className="divider" />
      <div className="row">
        <span>How to play</span>
        <button type="button" className="link" onClick={onHowTo}>
          Show again
        </button>
      </div>
      <div className="row">
        <span className="row-text">
          Playtest log
          <span className="toggle-note">{runs === 1 ? '1 run' : `${runs} runs`} kept on this device</span>
        </span>
        <button type="button" className="link" disabled={runs === 0} onClick={onDownloadLog}>
          Download
        </button>
      </div>
      <p className="footnote">Parol · a new star every night at midnight, Philippine time</p>
    </Sheet>
  )
}

const JOURNEY = [
  { rings: 10, title: 'First halo', text: 'A bamboo hoop of bulbs rings your star' },
  { rings: 20, title: 'Street lights', text: 'The string lights across the street come on' },
  { rings: 30, title: 'Neighbours’ parols', text: 'Every house lights its own parol' },
  { rings: 40, title: 'Carolers', text: 'Children sing down the street' },
  { rings: 50, title: 'The whole barangay', text: 'A second halo; the far hills twinkle' },
  { rings: 60, title: 'Rotor mode', text: 'Your star lights up like a giant lantern' },
  { rings: 70, title: 'Lantern festival', text: 'Giant lanterns glow over the plaza' },
  { rings: 80, title: 'Fireworks', text: 'A third halo; fireworks over the town' },
  { rings: 90, title: 'Simbang Gabi dawn', text: 'The sky warms and the church lights up' },
  { rings: 100, title: 'The star rises', text: 'Your parol becomes the Star of Bethlehem' },
]

/** Tonight's milestones, with what today's best has reached and what comes next. */
export function Journey({ best, onBack }: { best: number; onBack: () => void }) {
  const next = JOURNEY.find((step) => step.rings > best)
  return (
    <div className="journey" role="dialog" aria-modal="true" aria-labelledby="journey-title" onPointerDown={(event) => event.stopPropagation()}>
      <header className="journey-head">
        <button type="button" className="icon-button" aria-label="Back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4l-6 6 6 6" />
          </svg>
        </button>
        <div>
          <h2 id="journey-title" className="sheet-title">Tonight’s journey</h2>
          <p className="toggle-note">
            {best === 0 ? 'Light your first ring to start' : `Your best today: ${best} rings`}
            {next && best > 0 ? ` · ${next.rings - best} to ${next.title.toLowerCase()}` : ''}
          </p>
        </div>
      </header>
      <ol className="journey-steps">
        {JOURNEY.map((step) => {
          const reached = step.rings <= best
          const isNext = step === next
          return (
            <li key={step.rings} className={`journey-step${reached ? ' reached' : ''}${isNext ? ' next' : ''}`}>
              <span className="journey-dot">{step.rings}</span>
              <span className="journey-text">
                <span className="journey-title">
                  {step.title}
                  {isNext && <span className="journey-badge">Next</span>}
                </span>
                <span className="toggle-note">{step.text}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="journey-foot">Past 100, every 10 rings adds a star to your own constellation</p>
    </div>
  )
}

/** Light rays of a star that has risen into the sky. */
export function Glints({ size }: { size: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className="glints">
      <defs>
        <radialGradient id={`${id}-core`}>
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#ffe7a8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fffaf0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fffaf0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill={`url(#${id}-core)`} />
      <rect x="98.5" y="0" width="3" height="200" fill={`url(#${id}-v)`} />
      <rect x="0" y="98.5" width="200" height="3" fill={`url(#${id}-h)`} />
      <rect x="99" y="30" width="2" height="140" fill={`url(#${id}-v)`} transform="rotate(45 100 100)" />
      <rect x="99" y="30" width="2" height="140" fill={`url(#${id}-v)`} transform="rotate(-45 100 100)" />
    </svg>
  )
}

/** 100 rings: the parol lifts off its wire and becomes the Star of Bethlehem; the run goes on after. */
export function StarRises({ locks, palette, onKeepGoing }: { locks: number[]; palette: string[]; onKeepGoing: () => void }) {
  return (
    <div className="overlay overlay-rise" role="dialog" aria-modal="true" aria-labelledby="rise-title" onPointerDown={(event) => event.stopPropagation()}>
      <div className="rise">
        <div className="rise-star">
          <Glints size={240} />
          <div className="rise-parol">
            <Star size={150} locks={locks} palette={palette} />
          </div>
        </div>
        <span className="card-label gold">100 rings</span>
        <h2 id="rise-title" className="rise-title">Your parol became a star</h2>
        <p className="card-note">The Star of Bethlehem shines over the barangay.</p>
        <p className="rise-note">The run goes on · every 10 rings adds a star to your sky</p>
        <button type="button" className="primary" autoFocus onClick={onKeepGoing}>
          Keep going
        </button>
      </div>
    </div>
  )
}

/** The day changed in Manila while the game was open. */
export function NewDay({ best, onSee }: { best: number; onSee: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="newday-title" onPointerDown={(event) => event.stopPropagation()}>
      <div className="card">
        <h2 id="newday-title" className="card-title">A new star is ready</h2>
        <p className="card-note">
          It’s past midnight in the Philippines, so tonight’s star is new.{best > 0 ? ` Your best yesterday: ${best} rings.` : ''}
        </p>
        <button type="button" className="primary" autoFocus onClick={onSee}>
          See tonight’s star
        </button>
      </div>
    </div>
  )
}
