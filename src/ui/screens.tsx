// The screens around a run: How to play, Settings, the star rising at 100 and a new day.
import { useId, useRef, useState, type ReactNode } from 'react'
import { useDialogFocus } from './focus.ts'
import { Star } from '../draw/star.tsx'
import { t } from '../copy.ts'

/** A bottom sheet over the screen; Esc and the close button close it. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  useDialogFocus(box)
  return (
    <div ref={box} className="overlay overlay-sheet" role="dialog" aria-modal="true" aria-labelledby={id} onPointerDown={(event) => event.stopPropagation()}>
      <div className="sheet">
        <div className="sheet-head">
          <h2 id={id} className="sheet-title">{title}</h2>
          <button type="button" className="icon-button" aria-label={t().close} onClick={onClose}>
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

/** The star each step of How to play shows; the words are in src/copy.ts (`steps`). */
const STEP_LOCKS = [[0, 0], [0, 0, 0], [0, 0, 9], [9, 0, 0, 0, 0, 0]]

export function HowToPlay({ palette, onClose }: { palette: string[]; onClose: () => void }) {
  return (
    <Sheet title={t().howToPlay} onClose={onClose}>
      <ol className="steps">
        {t().steps.map(([title, text], i) => (
          <li key={i} className="step">
            <MiniStar locks={STEP_LOCKS[i]} palette={palette} />
            <div className="step-text">
              <span className="step-title">{title}</span>
              <span className="step-note">{text}</span>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="primary" autoFocus onClick={onClose}>
        {t().gotIt}
      </button>
    </Sheet>
  )
}

function Toggle({ label, note, on, onChange }: { label: string; note?: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="toggle">
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        {note && <span className="toggle-note">{note}</span>}
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
  /** The name on tonight's board: undefined hides the row (board off), null is not set yet. */
  boardName?: string | null
  onBoardName?: () => void
  onDownloadLog: () => void
  onClose: () => void
}

export function Settings({ sound, vibration, calm, runs, onSound, onVibration, onCalm, onHowTo, boardName, onBoardName, onDownloadLog, onClose }: SettingsProps) {
  return (
    <Sheet title={t().settingsTitle} onClose={onClose}>
      <Toggle label={t().sound} on={sound} onChange={onSound} />
      <Toggle label={t().vibration} note={t().androidOnly} on={vibration} onChange={onVibration} />
      <Toggle label={t().reducedMotion} on={calm} onChange={onCalm} />
      <div className="divider" />
      <div className="row">
        <span>{t().howToPlay}</span>
        <button type="button" className="link" onClick={onHowTo}>
          {t().showAgain}
        </button>
      </div>
      {boardName !== undefined && (
        <div className="row">
          <span className="row-text">
            {t().boardName}
            <span className="toggle-note">{boardName ?? t().notSet}</span>
          </span>
          <button type="button" className="link" onClick={onBoardName}>
            {boardName ? t().change : t().add}
          </button>
        </div>
      )}
      <div className="row">
        <span className="row-text">
          {t().playtestLog}
          <span className="toggle-note">{t().runsKept(runs)}</span>
        </span>
        <button type="button" className="link" disabled={runs === 0} onClick={onDownloadLog}>
          {t().download}
        </button>
      </div>
    </Sheet>
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
    <>
      <div className="rise-star" aria-hidden="true">
        <Glints size={240} />
        <div className="rise-parol">
          <Star size={150} locks={locks} palette={palette} />
        </div>
      </div>
      <section className="over now" role="dialog" aria-labelledby="rise-title" onPointerDown={(event) => event.stopPropagation()}>
        <h2 id="rise-title" className="over-eyebrow">{t().risenEyebrow}</h2>
        <p className="rise-title">{t().risenTitle}</p>
        <p className="over-reason">{t().risenReason}</p>
        <button type="button" className="primary over-button" autoFocus onClick={onKeepGoing}>
          {t().keepGoing}
        </button>
      </section>
    </>
  )
}

/** The day changed in Manila while the game was open. */
export function NewDay({ best, onSee }: { best: number; onSee: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  useDialogFocus(box)
  return (
    <div ref={box} className="overlay" role="dialog" aria-modal="true" aria-labelledby="newday-title" onPointerDown={(event) => event.stopPropagation()}>
      <section className="over now">
        <span className="over-eyebrow">{t().newDayEyebrow}</span>
        <h2 id="newday-title" className="rise-title">{t().newDayTitle}</h2>
        {best > 0 && <p className="over-reason">{t().bestYesterday(best)}</p>}
        <button type="button" className="primary over-button" autoFocus onClick={onSee}>
          {t().seeTonight}
        </button>
      </section>
    </div>
  )
}

/** Where the browser can't share an image (most desktops): the card, to save, and its words, to copy. */
export function ShareSheet({ image, file, text, rings, onClose }: { image: string; file: string; text: string; rings: number; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})
  return (
    <Sheet title={t().shareTitle} onClose={onClose}>
      <img className="share-preview" src={image} alt={t().shareAlt(rings)} />
      <a className="primary" href={image} download={file} autoFocus>
        {t().saveImage}
      </a>
      <button type="button" className="link share-copy" onClick={copy}>
        {copied ? t().copied : t().copyText}
      </button>
    </Sheet>
  )
}
