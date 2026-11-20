import { BRILLIANT_FROM, MAX_HEAT, TOO_THICK, WINDOW_PANES, windPercentForGather, type GatherLog } from '../engine/engine.ts'

type HudProps = {
  piece: number
  streak: number
  heat: number
  brilliantOpen: boolean
  onPause: () => void
}

const STREAK_DISCS = 5

export function Hud({ piece, streak, heat, brilliantOpen, onPause }: HudProps) {
  const litDiscs = streak > 0 && streak % STREAK_DISCS === 0 ? STREAK_DISCS : streak % STREAK_DISCS
  const toBonus = STREAK_DISCS - (streak % STREAK_DISCS)
  const heatShare = Math.max(0, Math.min(1, heat / MAX_HEAT))

  return (
    <header className="hud">
      <div className="hud-count" aria-label={`Piece ${piece} of ${WINDOW_PANES}`}>
        <span className="hud-label">Piece</span>
        <span className="hud-value">{piece}</span>
        <span className="hud-of">/ {WINDOW_PANES}</span>
      </div>

      <div className="hud-streak">
        <div className="discs" aria-hidden="true">
          {Array.from({ length: STREAK_DISCS }, (_, i) => (
            <span key={i} className={i < litDiscs ? 'disc lit' : 'disc'} />
          ))}
        </div>
        <span className="hud-note">{streak === 0 ? 'No flawless streak' : toBonus === 1 ? `${streak} flawless · next fills 2` : `${streak} flawless in a row`}</span>
      </div>

      <div className="hud-heat">
        <span className="hud-label">Heat</span>
        <div className="heat-track" role="meter" aria-label="Heat" aria-valuemin={0} aria-valuemax={MAX_HEAT} aria-valuenow={Math.round(heat * 10) / 10}>
          <div className={brilliantOpen ? 'heat-fill open' : 'heat-fill'} style={{ width: `${heatShare * 100}%` }} />
        </div>
        <span className={brilliantOpen ? 'hud-note open' : 'hud-note'}>{brilliantOpen ? 'Brilliant open' : 'Cooling'}</span>
      </div>

      <button className="icon-button" type="button" aria-label="Pause" onClick={onPause}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 3v12M12 3v12" />
        </svg>
      </button>
    </header>
  )
}

/** The next three gathers' speed, shown as glass colour: hotter means faster growth. */
export function LookAhead({ seed, gather }: { seed: number; gather: number }) {
  const next = [1, 2, 3].map((offset) => {
    const wind = windPercentForGather(seed, gather + offset)
    return wind >= 3 ? 'fast' : wind <= -3 ? 'slow' : 'steady'
  })
  return (
    <div className="look-ahead" aria-label={`Next bubbles: ${next.join(', ')}`}>
      <span className="hud-label">Next</span>
      <div className="look-ahead-dots" aria-hidden="true">
        {next.map((speed, i) => (
          <span key={i} className={`gather-dot ${speed}`} />
        ))}
      </div>
      <span className="look-ahead-words" aria-hidden="true">
        {next.join(' · ')}
      </span>
    </div>
  )
}

type GaugeProps = {
  size: number
  heat: number
  tolerance: number
  brilliantOpen: boolean
  last?: GatherLog
}

const GAUGE_MIN = 100 + TOO_THICK
const GAUGE_MAX = 120
const at = (percent: number) => `${(Math.max(0, Math.min(1, (percent - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN))) * 100).toFixed(2)}%`

const resultLabel = (entry: GatherLog) => {
  switch (entry.outcome) {
    case 'flawless':
      return entry.panes === 2 ? 'Flawless · 5 in a row fills 2' : 'Flawless'
    case 'brilliant':
      return 'Brilliant · 4 panes'
    case 'over':
      return `${Math.round(entry.error)}% over`
    case 'under':
      return `${Math.round(-entry.error)}% under`
    case 'cracked':
      return 'Cracked'
    case 'too-thick':
      return 'Too thick to spin'
  }
}

export function Gauge({ size, heat, tolerance, brilliantOpen, last }: GaugeProps) {
  const crack = 100 + heat
  return (
    <div className="gauge">
      <div className="gauge-head">
        <span>
          Size <strong>{Math.round(size)}%</strong>
        </span>
        <span className={last ? `gauge-result ${last.outcome}` : 'gauge-result'} aria-live="polite">
          {last ? resultLabel(last) : `Flawless ${Math.round(100 - tolerance)}–${Math.round(100 + tolerance)}%`}
        </span>
      </div>
      <div className="gauge-track" aria-hidden="true">
        <div className="gauge-fill" style={{ width: at(size) }} />
        <div className="gauge-flawless" style={{ left: at(100 - tolerance), width: `calc(${at(100 + tolerance)} - ${at(100 - tolerance)})` }} />
        {brilliantOpen && crack > 100 + BRILLIANT_FROM && (
          <div className="gauge-brilliant" style={{ left: at(100 + BRILLIANT_FROM), width: `calc(${at(crack)} - ${at(100 + BRILLIANT_FROM)})` }} />
        )}
        <div className="gauge-crack" style={{ left: at(crack) }} />
        <div className="gauge-marker" style={{ left: at(size) }} />
      </div>
      <div className="gauge-scale" aria-hidden="true">
        <span>{GAUGE_MIN}% too thick</span>
        {brilliantOpen && <span className="gauge-scale-brilliant">Brilliant ×4</span>}
        <span>Cracks</span>
      </div>
    </div>
  )
}
