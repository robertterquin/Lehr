import { useMemo, type PointerEvent } from 'react'
import { WINDOW_PANES, createDailyChallenge, flawlessTolerance, sizeOf, type GameState } from '../engine/engine.ts'
import { THEME_NAME, paneOutcomes } from '../window/geometry.ts'
import Furnace from './Furnace.tsx'
import { Gauge, Hud, LookAhead } from './Hud.tsx'
import StainedWindow from './StainedWindow.tsx'
import { useGame } from './useGame.ts'

/** The bubble size to draw: live while blowing, frozen at release while it sets or after the run. */
const shownSize = (game: GameState) => {
  if (game.phase === 'blowing') return sizeOf(game)
  const last = game.log.at(-1)
  if ((game.phase === 'setting' || game.phase === 'over') && last) return 100 + last.error
  return game.startSize
}

const END_TITLES = { cracked: 'The gather cracked', 'too-thick': 'Too thick to spin flat', complete: 'The window is whole' } as const

// shortcut: plain ready / paused / run-ended cards so a run is playable; Phase 5 builds the designed screens.
export default function App() {
  const challenge = useMemo(() => createDailyChallenge(), [])
  const { game, start, press, release, pause, resume } = useGame(challenge)
  const last = game.log.at(-1)
  const outcomes = useMemo(() => paneOutcomes(game.log), [game.log])
  const newestFrom = game.phase === 'setting' && last ? game.panes - last.panes : -1
  const newest = useMemo(() => (newestFrom >= 0 ? ([newestFrom, game.panes] as const) : undefined), [newestFrom, game.panes])
  const tolerance = flawlessTolerance(game.speed)
  const showResult = game.phase === 'setting' || game.phase === 'over' ? last : undefined

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    press(event.timeStamp)
  }
  const onPointerUp = (event: PointerEvent<HTMLElement>) => release(event.timeStamp)

  return (
    <main className="run" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onContextMenu={(event) => event.preventDefault()}>
      <Hud piece={Math.min(game.panes + 1, WINDOW_PANES)} streak={game.streak} heat={game.heat} brilliantOpen={game.brilliantOpen} onPause={pause} />

      <section className="stage">
        <div className="window-area">
          <StainedWindow className="run-window" seed={challenge.seed} lit={game.panes} outcomes={outcomes} newest={newest} complete={game.endReason === 'complete'} />
          <p className="window-caption">
            {THEME_NAME} · {game.panes} of {WINDOW_PANES} lit
          </p>
        </div>

        <div className="furnace-area">
          <LookAhead seed={challenge.seed} gather={game.gathers} />
          <Furnace size={shownSize(game)} heat={game.heat} tolerance={tolerance} brilliantOpen={game.brilliantOpen} cracked={game.endReason === 'cracked'} />
          <Gauge size={shownSize(game)} heat={game.heat} tolerance={tolerance} brilliantOpen={game.brilliantOpen} last={showResult} />
        </div>
      </section>

      <p className="hint">
        <span className="hint-touch">Hold to blow · release to set</span>
        <span className="hint-keys">
          <kbd>Space</kbd> hold to blow · release to set <kbd>Esc</kbd> pause
        </span>
      </p>

      {game.phase === 'ready' && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="ready-title">
          <div className="card">
            <h1 className="wordmark">Lehr</h1>
            <h2 id="ready-title" className="card-title">
              {THEME_NAME}
            </h2>
            <p className="card-text">Blow each bubble to the outline. Let go inside the gold band for a flawless pane.</p>
            <button className="primary" type="button" autoFocus onClick={start}>
              Light the furnace
            </button>
          </div>
        </div>
      )}

      {game.phase === 'paused' && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="paused-title">
          <div className="card">
            <h2 id="paused-title" className="card-title">
              Paused
            </h2>
            <p className="card-text">The bubble you were blowing was scrapped. Heat, streak and panes are kept.</p>
            <button className="primary" type="button" autoFocus onClick={resume}>
              Resume
            </button>
          </div>
        </div>
      )}

      {game.phase === 'over' && game.endReason && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="over-title">
          <div className="card">
            <h2 id="over-title" className="card-title">
              {END_TITLES[game.endReason]}
            </h2>
            <p className="card-text">
              {game.panes} panes · {game.flawless} flawless · {game.brilliant} brilliant
            </p>
            <button className="primary" type="button" autoFocus onClick={start}>
              Fire again
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
