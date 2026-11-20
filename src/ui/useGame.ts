import { useCallback, useEffect, useRef, useState } from 'react'
import { createGame, pause, press, release, resume, startRun, type DailyChallenge, type GameState } from '../engine/engine.ts'
import { advanceTime } from './loop.ts'

/**
 * Runs the engine at fixed 60 Hz ticks on requestAnimationFrame. Every input first catches the
 * simulation up to the moment it happened, so a press or release lands on the right tick.
 */
export function useGame(challenge: DailyChallenge) {
  const [game, setGame] = useState(() => createGame(challenge))
  const clock = useRef({ game, carryMs: 0, last: 0 })

  const catchUp = useCallback((now: number) => {
    const state = clock.current
    const step = advanceTime(state.game, state.carryMs, state.last ? now - state.last : 0)
    state.game = step.game
    state.carryMs = step.carryMs
    state.last = Math.max(state.last, now)
  }, [])

  const act = useCallback(
    (change: (current: GameState) => GameState, at = performance.now()) => {
      catchUp(at)
      clock.current.game = change(clock.current.game)
      setGame(clock.current.game)
    },
    [catchUp],
  )

  useEffect(() => {
    let frame = 0
    const tick = (now: number) => {
      catchUp(now)
      setGame(clock.current.game)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [catchUp])

  const start = useCallback(() => act((current) => startRun(current.phase === 'ready' ? current : createGame(challenge))), [act, challenge])

  const controls = {
    start,
    press: (at?: number) => act(press, at),
    release: (at?: number) => act(release, at),
    pause: () => act(pause),
    resume: () => act(resume),
  }

  // Keyboard: Space blows (ignoring key repeat), Escape pauses. Space also starts or restarts a run.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        act((current) => (current.phase === 'paused' ? resume(current) : pause(current)))
        return
      }
      if (event.code !== 'Space' || event.target instanceof HTMLButtonElement) return
      event.preventDefault()
      if (event.repeat) return
      const phase = clock.current.game.phase
      if (phase === 'ready' || phase === 'over') start()
      else act(press, event.timeStamp)
    }
    const up = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.target instanceof HTMLButtonElement) return
      event.preventDefault()
      act(release, event.timeStamp)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [act, start])

  // Switching tabs, minimising or leaving the window pauses (and scraps the bubble in progress).
  useEffect(() => {
    const hide = () => act(pause)
    const onVisibility = () => document.visibilityState === 'hidden' && hide()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', hide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', hide)
    }
  }, [act])

  return { game, ...controls }
}
