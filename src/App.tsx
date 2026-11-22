import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { getManilaDate, seedForDate, weekdayIndex } from './game/daily.ts'
import { createEngine, pause, resume, ringOffset, tap, type Engine } from './game/engine.ts'
import { endNote, milestoneText } from './game/feedback.ts'
import { RULES } from './game/rules.ts'
import { NIGHTS, night as nightById, type NightId, type Night } from './draw/nights.tsx'
import { Star } from './draw/star.tsx'
import type { Stage } from './draw/street.tsx'
import { SOUNDS, buzz, isMuted, play, setMusic, setMuted, stopMusic, unlockAudio } from './sound/audio.ts'
import { Callout, IconButton, Meter, PauseIcon, SoundIcon, Streak } from './ui/parts.tsx'

const params = new URLSearchParams(location.search)
const today = getManilaDate()
// ?night=dagat previews another night; the day's star (seed) never changes with it.
const tonight: Night = params.get('night') ? nightById(params.get('night') as NightId) : NIGHTS[weekdayIndex(today)]
const seed = seedForDate(today)
// ?bench records how long each lock takes to draw, for checking phones.
const BENCH: number[] | null = params.has('bench') ? ((window as unknown as { lockMs: number[] }).lockMs = []) : null

type Phase = 'ready' | 'playing' | 'paused' | 'ended'

const WIDE = '(min-width: 960px) and (min-height: 600px)'
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const DANGER_BELOW = 15

/** Window size, kept current: picks the layout and the star's size. */
function useViewport() {
  const read = () => ({ width: window.innerWidth || 390, height: window.innerHeight || 844, wide: window.matchMedia(WIDE).matches })
  const [viewport, setViewport] = useState(read)
  useEffect(() => {
    const update = () => setViewport(read())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return viewport
}

const SceneTiles = memo(function SceneTiles({ stage, tiles }: { stage: Stage; tiles: number }) {
  return Array.from({ length: tiles }, (_, i) => (
    <div key={i} className="scenery-tile">
      <tonight.Scene stage={stage} moon={i === tiles - 1} />
    </div>
  ))
})

/**
 * The night scene behind the run. Wide screens line up four copies of the phone scene, with one moon.
 * At a milestone the new scene flickers on over the old one, left to right, then the old one goes.
 */
function Scenery({ stage, tiles }: { stage: Stage; tiles: number }) {
  const [shown, setShown] = useState<Stage[]>([stage])
  if (shown[shown.length - 1] !== stage) setShown([shown[shown.length - 1], stage])
  useEffect(() => {
    if (shown.length < 2) return
    const done = window.setTimeout(() => setShown([stage]), 1000)
    return () => window.clearTimeout(done)
  }, [shown, stage])
  return (
    <div className="scenery" aria-hidden="true">
      {shown.map((s, i) => (
        <div key={s} className={`scenery-layer${i > 0 ? ' scene-in' : ''}`}>
          <SceneTiles stage={s} tiles={tiles} />
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const { width, height, wide } = useViewport()
  const [phase, setPhase] = useState<Phase>('ready')
  const [engine, setEngine] = useState<Engine>(() => createEngine(seed))
  const [muted, setMutedState] = useState(isMuted)
  const engineRef = useRef(engine)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  /** performance.now() at the start of the run: run time is milliseconds since then. */
  const baseRef = useRef(0)
  const spinRef = useRef<SVGSVGElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const commit = (next: Engine) => {
    engineRef.current = next
    setEngine(next)
  }
  /** Run time for an input at `stamp`, never earlier than the last input, so a run always replays. */
  const runTime = (stamp: number) => {
    const inputs = engineRef.current.inputs
    return Math.max(inputs.length ? inputs[inputs.length - 1].atMs : 0, stamp - baseRef.current)
  }
  /** Moves the star for a moment, on the GPU; skipped when the system asks for less motion. */
  const nudge = (frames: Keyframe[], duration: number) => {
    if (!calm()) stageRef.current?.animate(frames, { duration, easing: 'ease-out' })
  }
  /** The whoosh (and, when the points are thin, the heartbeat) as a ring spins in, `delay` seconds from now. */
  const ringIn = (next: Engine, delay = 0) => {
    play(SOUNDS.ringIn, delay)
    if (next.run.width < DANGER_BELOW) play(SOUNDS.danger, delay + 0.05)
  }

  const start = useCallback((stamp: number) => {
    unlockAudio()
    baseRef.current = stamp
    const next = createEngine(seed)
    commit(next)
    setPhase('playing')
    ringIn(next)
  }, [])

  const press = useCallback((stamp: number) => {
    if (phaseRef.current === 'ready') return start(stamp)
    if (phaseRef.current !== 'playing') return
    const started = performance.now()
    const before = engineRef.current
    const next = tap(before, runTime(stamp))
    if (next === before || next.run === before.run) return commit(next)
    commit(next)
    if (BENCH) requestAnimationFrame(() => BENCH.push(performance.now() - started))

    if (next.run.ended) {
      play(SOUNDS.trim)
      play(SOUNDS.end, 0.35)
      buzz(220)
      stopMusic()
      setPhase('ended')
      return
    }
    const { rings, streak, perfects } = next.run
    if (perfects > before.run.perfects) {
      play(SOUNDS.perfect[(streak - 1) % SOUNDS.perfect.length])
      if (streak % RULES.widenEvery === 0) {
        play(SOUNDS.widen, 0.08)
        buzz([12, 40, 12])
        nudge([{ scale: 1 }, { scale: 1.05, offset: 0.35 }, { scale: 1 }], 350)
      } else buzz(8)
    } else {
      play(SOUNDS.trim)
      buzz(16)
      nudge([{ translate: '0 0' }, { translate: '-2px 0' }, { translate: '2px 0' }, { translate: '-1px 0' }, { translate: '0 0' }], 250)
    }
    const milestone = rings % RULES.milestoneEvery === 0
    if (milestone) play(rings === 100 ? SOUNDS.starRises : SOUNDS.milestone, 0.2)
    setMusic(rings)
    ringIn(next, milestone ? RULES.milestoneBreakMs / 1000 : 0)
  }, [start])

  const pauseNow = useCallback((stamp: number) => {
    if (phaseRef.current !== 'playing') return
    commit(pause(engineRef.current, runTime(stamp)))
    stopMusic()
    setPhase('paused')
  }, [])

  const resumeNow = useCallback((stamp: number) => {
    if (phaseRef.current !== 'paused') return
    unlockAudio()
    const next = resume(engineRef.current, runTime(stamp))
    commit(next)
    setMusic(next.run.rings)
    ringIn(next)
    setPhase('playing')
  }, [])

  const toggleSound = () => {
    unlockAudio()
    setMuted(!muted)
    setMutedState(!muted)
    if (muted && phaseRef.current === 'playing') setMusic(engineRef.current.run.rings)
  }

  // Keyboard: Space or Enter locks (key repeat ignored), Esc pauses and resumes.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === ' ' || event.key === 'Enter') {
        // Let a focused button handle its own Space or Enter.
        if (event.target instanceof HTMLButtonElement) return
        event.preventDefault()
        press(event.timeStamp)
      } else if (event.key === 'Escape') {
        if (phaseRef.current === 'playing') pauseNow(event.timeStamp)
        else resumeNow(event.timeStamp)
      }
    }
    // Leaving the tab pauses, so the ring never spins on unseen.
    const onVisibility = () => {
      if (document.hidden) pauseNow(performance.now())
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [press, pauseNow, resumeNow])

  // Turn the spinning ring every frame, from the clock: no re-render, no redraw.
  useEffect(() => {
    if (phase !== 'playing') return
    let frame = 0
    const loop = () => {
      spinRef.current?.style.setProperty('transform', `rotate(${ringOffset(engineRef.current.ring, performance.now() - baseRef.current)}deg)`)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [phase])

  const { run } = engine
  const stage = Math.min(10, Math.floor(run.rings / 10)) as Stage
  const playing = phase === 'playing'
  const starSize = Math.round(wide ? Math.min(520, height - 260) : Math.max(220, Math.min(330, width - 60, height - 440)))
  const danger = phase !== 'ready' && !run.ended && run.width < DANGER_BELOW
  const milestone = phase !== 'ready' && !run.ended ? milestoneText(run.rings) : null

  const star = (
    <div className={`stage${phase === 'ended' ? ' stage-ended' : ''}`} ref={stageRef}>
      <Star
        size={starSize}
        locks={engine.locks}
        spinning={phase === 'playing' || phase === 'paused'}
        spinRef={spinRef}
        palette={tonight.palette}
        dim={phase === 'ready'}
        danger={danger}
        failed={phase === 'ended' ? engine.endError : undefined}
      />
    </div>
  )
  const rings = (
    <p className="rings">
      <span className="rings-label">Rings</span> <span className="rings-number">{run.rings}</span>
    </p>
  )
  const buttons = (
    <div className="buttons">
      <IconButton label="Sound" pressed={!muted} onPress={toggleSound}>
        <SoundIcon off={muted} />
      </IconButton>
      {phase !== 'ready' && (
        <IconButton label="Pause" onPress={() => pauseNow(performance.now())}>
          <PauseIcon />
        </IconButton>
      )}
    </div>
  )
  const hint = playing && run.rings === 0 && <p className="hint">{wide ? 'Press Space or click' : 'Tap'} when the points meet the gold dashes</p>
  const toast = milestone && (
    <p key={run.rings} className="toast" role="status">
      <span className="toast-rings">{run.rings} rings</span> {milestone}
    </p>
  )

  return (
    <main className={`game ${wide ? 'wide' : 'narrow'}${danger ? ' in-danger' : ''}`} onPointerDown={(event) => event.button === 0 && press(event.timeStamp)}>
      <Scenery stage={stage} tiles={wide ? 4 : 1} />
      {phase === 'ready' ? (
        <div className="ready">
          <header className="ready-bar">{buttons}</header>
          <p className="date">
            {tonight.araw} · {tonight.name}
          </p>
          {star}
          <h1 className="ready-title">Tonight’s star</h1>
          <p className="ready-note">Lock each spinning ring onto the one inside it. The same star for everyone today.</p>
          <p className="ready-start">{wide ? 'Press Space or click to light the first ring' : 'Tap to light the first ring'}</p>
        </div>
      ) : wide ? (
        <div className="desk">
          <header className="desk-bar">
            <span className="wordmark-small">Parol</span>
            {buttons}
          </header>
          <aside className="desk-side">
            {rings}
            <Streak streak={run.streak} size={22} />
            <Meter engine={engine} />
          </aside>
          {star}
          <aside className="desk-side">
            <Callout engine={engine} />
            {hint}
          </aside>
          {toast}
        </div>
      ) : (
        <div className="phone">
          <header className="hud">
            {rings}
            <Streak streak={run.streak} />
            {buttons}
          </header>
          {toast}
          {star}
          <Callout engine={engine} />
          <Meter engine={engine} />
          {hint}
        </div>
      )}

      {phase === 'paused' && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="paused-title">
          <div className="card">
            <h2 id="paused-title" className="card-title">Paused</h2>
            <p className="card-note">The ring spins in again when you go back.</p>
            <button type="button" className="primary" autoFocus onPointerDown={(event) => event.stopPropagation()} onClick={() => resumeNow(performance.now())}>
              Resume
            </button>
          </div>
        </div>
      )}
      {phase === 'ended' && (
        <div className="overlay overlay-ended" role="dialog" aria-modal="true" aria-labelledby="ended-title">
          <div className="card">
            <span className="card-label">Run ended</span>
            <h2 id="ended-title" className="card-title">The points got too thin</h2>
            <p className="card-note">{endNote(engine)}</p>
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{run.rings}</span>
                <span className="stat-label">rings</span>
              </div>
              <div className="stat">
                <span className="stat-value gold">{run.perfects}</span>
                <span className="stat-label">perfect</span>
              </div>
            </div>
            <button type="button" className="primary" autoFocus onPointerDown={(event) => event.stopPropagation()} onClick={() => start(performance.now())}>
              Light again
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
