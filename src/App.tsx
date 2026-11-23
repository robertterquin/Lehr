import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { getManilaDate, seedForDate, weekdayIndex } from './game/daily.ts'
import { createEngine, nextAlignmentMs, pause, resume, ringOffset, tap, type Engine } from './game/engine.ts'
import { milestoneText, nextGoal } from './game/feedback.ts'
import { bestOn, deviceStore, logRun, loggedRuns, nightsInARow, readSettings, writeSettings, type Settings as SavedSettings } from './game/local.ts'
import { RULES } from './game/rules.ts'
import { NIGHTS, night as nightById, type NightId, type Night } from './draw/nights.tsx'
import { Panorama } from './draw/panorama.tsx'
import { Star } from './draw/star.tsx'
import type { Stage } from './draw/street.tsx'
import { SOUNDS, buzz, isMuted, play, setMusic, setMuted, setVibration, stopMusic, unlockAudio } from './sound/audio.ts'
import { ArcGauge, Callout, CountUp, Garland, IconButton, PauseIcon, SoundIcon, Streak } from './ui/parts.tsx'
import { Glints, HowToPlay, NewDay, Settings, StarRises } from './ui/screens.tsx'

const params = new URLSearchParams(location.search)
const today = getManilaDate()
// ?night=dagat previews another night; the day's star (seed) never changes with it.
const tonight: Night = params.get('night') ? nightById(params.get('night') as NightId) : NIGHTS[weekdayIndex(today)]
const seed = seedForDate(today)
// ?bench records how long each lock takes to draw, for checking phones.
const BENCH: number[] | null = params.has('bench') ? ((window as unknown as { lockMs: number[] }).lockMs = []) : null
// Development only: ?from=98 starts a run 98 perfect rings in, to check the late screens. Never logged.
const FROM = import.meta.env.DEV ? Math.max(0, Number(params.get('from')) || 0) : 0
const store = deviceStore()
/** The dim preview star on the Ready screen. */
const PREVIEW = Array.from({ length: 12 }, () => 0)

/** What the first runs say, ring by ring: what to do, then what can go wrong, then how to recover. */
const COACH: [string, string][] = [
  ['Tap when the points line up', 'Then the next ring spins in'],
  ['A miss trims the points', `Below ${RULES.minWidth}° the run ends`],
  [`${RULES.widenEvery} perfect in a row`, `widen the points back by ${RULES.widenBy}°`],
]

type Phase = 'ready' | 'playing' | 'paused' | 'risen' | 'ended'
type Panel = 'how' | 'settings' | null

const WIDE = '(min-width: 960px) and (min-height: 600px)'
const DANGER_BELOW = 15
/** Where the stars of the constellation past 100 sit, as fractions of the screen, clear of the star. */
const SKY: [number, number][] = [[0.78, 0.17], [0.2, 0.5], [0.82, 0.52], [0.12, 0.22], [0.6, 0.08], [0.33, 0.1], [0.9, 0.33], [0.08, 0.38], [0.5, 0.03], [0.7, 0.42]]

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

type SceneProps = { stage: Stage; wide: boolean; width: number; height: number; moon: boolean }

/** Tonight's scene: on a phone the scene itself, on a wide screen one panoramic street. */
const SceneLayer = memo(function SceneLayer({ stage, wide, width, height, moon }: SceneProps) {
  return wide ? <Panorama night={tonight} stage={stage} width={width} height={height} /> : <tonight.Scene stage={stage} moon={moon} />
})

/** The night scene behind everything. At a milestone the new scene flickers on over the old one, then the old one goes. */
function Scenery({ stage, ...rest }: SceneProps) {
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
          <SceneLayer stage={s} {...rest} />
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const { width, height, wide } = useViewport()
  const [phase, setPhase] = useState<Phase>('ready')
  const [engine, setEngine] = useState<Engine>(() => createEngine(seed))
  const [settings, setSettings] = useState<SavedSettings>(() => readSettings(store))
  // No rules sheet up front: the first runs teach by doing (see `coach`); How to play stays in Settings.
  const [panel, setPanel] = useState<Panel>(null)
  const [muted, setMutedState] = useState(isMuted)
  const [best, setBest] = useState(() => bestOn(store, today))
  const [bestBefore, setBestBefore] = useState(0)
  const [newDay, setNewDay] = useState(false)
  const [systemCalm, setSystemCalm] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const calm = settings.calm ?? systemCalm
  const runsLogged = loggedRuns(store).length
  const firstVisit = runsLogged === 0

  const engineRef = useRef(engine)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const calmRef = useRef(calm)
  calmRef.current = calm
  /** performance.now() at the start of the run: run time is milliseconds since then. */
  const baseRef = useRef(0)
  const spinRef = useRef<SVGSVGElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => setVibration(settings.vibration), [settings.vibration])
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemCalm(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  // The day changes at midnight in Manila: offer tonight's new star when the run in hand is over.
  useEffect(() => {
    const check = window.setInterval(() => setNewDay(getManilaDate() !== today), 30_000)
    return () => window.clearInterval(check)
  }, [])

  const saveSettings = (next: SavedSettings) => {
    setSettings(next)
    writeSettings(store, next)
  }
  const closePanel = () => {
    if (panel === 'how' && !settings.seenHowTo) saveSettings({ ...settings, seenHowTo: true })
    setPanel(null)
  }

  const commit = (next: Engine) => {
    engineRef.current = next
    setEngine(next)
  }
  /** Run time for an input at `stamp`, never earlier than the last input, so a run always replays. */
  const runTime = (stamp: number) => {
    const inputs = engineRef.current.inputs
    return Math.max(inputs.length ? inputs[inputs.length - 1].atMs : 0, stamp - baseRef.current)
  }
  /** Moves the star for a moment, on the GPU; skipped with reduced motion. */
  const nudge = (frames: Keyframe[], duration: number) => {
    if (!calmRef.current) stageRef.current?.animate(frames, { duration, easing: 'ease-out' })
  }
  /** The whoosh (and, when the points are thin, the heartbeat) as a ring spins in, `delay` seconds from now. */
  const ringIn = (next: Engine, delay = 0) => {
    play(SOUNDS.ringIn, delay)
    if (next.run.width < DANGER_BELOW) play(SOUNDS.danger, delay + 0.05)
  }

  const finish = (done: Engine) => {
    const inputs = done.inputs
    const durationMs = inputs.length ? inputs[inputs.length - 1].atMs : 0
    setBestBefore(bestOn(store, today))
    if (!FROM) logRun(store, {
      date: today,
      night: tonight.id,
      seed,
      startedAt: new Date(Date.now() - (performance.now() - baseRef.current)).toISOString(),
      durationMs: Math.round(durationMs),
      rings: done.run.rings,
      perfects: done.run.perfects,
      endWidth: Math.round(done.run.width * 10) / 10,
      endError: Math.round((done.endError ?? 0) * 10) / 10,
      locks: done.locks.map((error) => Math.round(error * 10) / 10),
      pauses: inputs.filter((input) => input.type === 'pause').length,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pointer: window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine',
    })
    setBest(bestOn(store, today))
  }

  const start = useCallback((stamp: number) => {
    unlockAudio()
    let next = createEngine(seed)
    while (next.run.rings < FROM) next = tap(next, nextAlignmentMs(next))
    // Run time starts so that the ring now spinning in starts now.
    baseRef.current = stamp - next.ring.startMs
    commit(next)
    setPanel(null)
    setPhase('playing')
    ringIn(next)
  }, [])

  const press = useCallback((stamp: number) => {
    if (phaseRef.current !== 'playing') return
    const started = performance.now()
    const before = engineRef.current
    const next = tap(before, runTime(stamp))
    if (next.run === before.run) return commit(next)
    commit(next)
    if (BENCH) requestAnimationFrame(() => BENCH.push(performance.now() - started))

    if (next.run.ended) {
      play(SOUNDS.trim)
      play(SOUNDS.end, 0.35)
      buzz(220)
      stopMusic()
      finish(next)
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
    if (rings === 100) {
      // The star rises: the run holds on the celebration until Keep going, then the ring spins in again.
      play(SOUNDS.starRises, 0.2)
      buzz([20, 60, 20, 60, 40])
      commit(pause(next, runTime(stamp)))
      setPhase('risen')
      return
    }
    const milestone = rings % RULES.milestoneEvery === 0
    if (milestone) play(SOUNDS.milestone, 0.2)
    setMusic(rings)
    ringIn(next, milestone ? RULES.milestoneBreakMs / 1000 : 0)
  }, [])

  const pauseNow = useCallback((stamp: number) => {
    if (phaseRef.current !== 'playing') return
    commit(pause(engineRef.current, runTime(stamp)))
    stopMusic()
    setPhase('paused')
  }, [])

  const resumeNow = useCallback((stamp: number) => {
    if (phaseRef.current !== 'paused' && phaseRef.current !== 'risen') return
    unlockAudio()
    const next = resume(engineRef.current, runTime(stamp))
    commit(next)
    setMusic(next.run.rings)
    ringIn(next)
    setPhase('playing')
  }, [])

  const toggleSound = (on = muted) => {
    unlockAudio()
    setMuted(!on)
    setMutedState(!on)
    if (on && phaseRef.current === 'playing') setMusic(engineRef.current.run.rings)
  }

  const downloadLog = () => {
    const blob = new Blob([JSON.stringify(loggedRuns(store), null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `parol-playtest-${today}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  }

  // Keyboard: Space or Enter starts and locks (key repeat ignored), Esc pauses, resumes and closes panels.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === ' ' || event.key === 'Enter') {
        // Let a focused button or switch handle its own Space or Enter.
        if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement) return
        event.preventDefault()
        if (phaseRef.current === 'ready') start(event.timeStamp)
        else press(event.timeStamp)
      } else if (event.key === 'Escape') {
        if (phaseRef.current === 'playing') pauseNow(event.timeStamp)
        else if (phaseRef.current === 'paused') resumeNow(event.timeStamp)
        else setPanel(null)
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
  }, [start, press, pauseNow, resumeNow])

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
  const inRun = phase !== 'ready'
  const stage = (inRun ? Math.min(10, Math.floor(run.rings / 10)) : 0) as Stage
  const playing = phase === 'playing'
  // The run star leaves room for the gauge around it (24% wider than the star) and the count above.
  const starSize = Math.round(
    phase === 'ready'
      ? wide
        ? Math.min(470, height * 0.58)
        : Math.max(190, Math.min(300, width - 90, (height - 520) / 1.25))
      : Math.max(190, Math.min(wide ? 460 : 300, (width - 40) / 1.24, (height - 446) / 1.24)),
  )
  const danger = inRun && !run.ended && run.width < DANGER_BELOW
  const milestone = inRun && !run.ended && phase !== 'risen' ? milestoneText(run.rings) : null
  const skyStars = inRun ? Math.min(SKY.length, Math.max(0, Math.floor((run.rings - 100) / 10))) : 0

  const coachStep = playing && runsLogged < 3 && run.rings < COACH.length ? COACH[run.rings] : null
  const star = (
    <div className={`stage${phase === 'ended' ? ' stage-ended' : ''}`} ref={stageRef}>
      <Star
        size={starSize}
        locks={inRun ? engine.locks : PREVIEW}
        spinning={phase === 'playing' || phase === 'paused' || phase === 'risen'}
        spinRef={spinRef}
        palette={tonight.palette}
        danger={danger}
        failed={phase === 'ended' ? engine.endError : undefined}
      />
      {phase === 'playing' && <ArcGauge size={starSize} width={run.width} danger={danger} />}
      {/* The lock word sits in the gauge's open bottom, right under the star; the coach and a milestone take its turn. */}
      {playing && !coachStep && !milestone && <Callout engine={engine} top={Math.round(starSize * 1.12) - 38} />}
    </div>
  )
  const soundButton = (
    <IconButton label="Sound" pressed={!muted} onPress={() => toggleSound()}>
      <SoundIcon off={muted} />
    </IconButton>
  )
  const settingsButton = (
    <IconButton label="Settings" onPress={() => setPanel('settings')}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="10" cy="10" r="2.6" />
        <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6" />
      </svg>
    </IconButton>
  )
  const buttons = (
    <div className="buttons">
      {soundButton}
      {settingsButton}
    </div>
  )
  /** The first three runs teach by doing, one line per ring, in the lock word's place; later runs start with one hint. */
  const coach = coachStep && (
    <p key={run.rings} className="coach" role="status">
      <span className="toast-rings">
        {run.rings + 1} of {COACH.length}
      </span>
      <span className="coach-line">{run.rings === 0 && wide ? 'Press Space when the points line up' : coachStep[0]}</span>
      <span className="coach-note">{coachStep[1]}</span>
    </p>
  )
  const hint = playing && !coachStep && run.rings === 0 && (
    <p className="hint">
      <span className="hint-word">{wide ? 'Press Space' : 'Tap'}</span> when the points line up
    </p>
  )
  const goal = nextGoal(run.rings)
  const nights = phase === 'ready' ? nightsInARow(store, today) : 0
  const garland = <Garland width={width - 32} lit={Math.floor((inRun ? run.rings : best) / RULES.milestoneEvery)} palette={tonight.palette} toGo={inRun ? goal.toGo : undefined} />
  const toast = milestone && (
    <p key={run.rings} className="toast" role="status">
      <span className="toast-rings">{run.rings} rings</span>
      <span className="toast-line">{milestone}</span>
    </p>
  )
  const action = (
    <div className="poster-action">
      <button type="button" className="primary" onClick={() => start(performance.now())}>
        {firstVisit ? 'Start · it takes a minute' : 'Light the first ring'} <span aria-hidden="true">→</span>
      </button>
      {best > 0 && (
        <span className="best-line">
          Best today <strong>{best}</strong>
          {nights > 1 && (
            <>
              <span className="dot">·</span>
              <strong>{nights}</strong> nights in a row
            </>
          )}
        </span>
      )}
    </div>
  )
  const newBest = phase === 'ended' && run.rings > bestBefore && run.rings > 0
  /** The message and meter show only while playing; paused, risen and ended show floating text instead. */
  const live = phase === 'playing'

  return (
    <main className={`game ${wide ? 'wide' : 'narrow'}${danger ? ' in-danger' : ''}${calm ? ' calm' : ''}${phase === 'ended' || phase === 'paused' || phase === 'risen' ? ` is-dim is-${phase}` : ''}`} onPointerDown={(event) => event.button === 0 && press(event.timeStamp)}>
      {/* On a phone the garland hangs where the moon would. */}
      <Scenery stage={stage} wide={wide} width={width} height={height} moon={wide} />
      {skyStars > 0 && (
        <div className="sky" aria-hidden="true">
          {SKY.slice(0, skyStars).map(([x, y]) => (
            <div key={`${x}-${y}`} className="sky-star" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
              <Glints size={60} />
            </div>
          ))}
        </div>
      )}

      {phase === 'ready' ? (
        // The poster: tonight's place is the headline, beside the star on desktop and above it on a phone.
        <div className="poster">
          <header className="ready-bar">
            <span className="wordmark">Parol</span>
            {buttons}
          </header>
          {garland}
          <div className="poster-body">
            <div className="poster-words">
              <span className="eyebrow">{tonight.araw} · tonight’s star</span>
              <h1 className="poster-title">{tonight.name}</h1>
              <p className="poster-blurb">Light all ten parols on the street tonight.</p>
              {wide && action}
            </div>
            {star}
            {!wide && action}
          </div>
        </div>
      ) : (
        // One centred layout on every screen: the count above, the star in its gauge, the message below.
        <div className="run">
          <header className="run-bar">
            <div className="run-count" aria-label={`${run.rings} rings`}>
              {live && <span className="count">{run.rings}</span>}
              {live && <Streak streak={run.streak} />}
            </div>
            {live ? (
              <IconButton label="Pause" ring onPress={() => pauseNow(performance.now())}>
                <PauseIcon />
              </IconButton>
            ) : (
              buttons
            )}
          </header>
          {garland}
          {/* The gauge reaches 12% of the star beyond it. */}
          <div className="gauge-room" style={{ marginBottom: Math.round(starSize * 0.12) + 6 }} />
          {star}
          {live && coach ? coach : <div className="callout" />}
          {live && toast}
          {hint}
        </div>
      )}

      {phase === 'paused' && (
        <section className="over now" role="dialog" aria-labelledby="paused-title" onPointerDown={(event) => event.stopPropagation()}>
          <h2 id="paused-title" className="over-eyebrow">Paused</h2>
          <p className="over-score">
            <strong>{run.rings}</strong>
            <span>{run.rings === 1 ? 'ring' : 'rings'} so far</span>
          </p>
          <button type="button" className="primary over-button" autoFocus onClick={() => resumeNow(performance.now())}>
            Resume
          </button>
        </section>
      )}
      {phase === 'risen' && <StarRises locks={engine.locks} palette={tonight.palette} onKeepGoing={() => resumeNow(performance.now())} />}
      {phase === 'ended' && (
        // The run-over: no card, just the score floating over the dimmed street and one button.
        <section className="over" role="dialog" aria-labelledby="ended-title" onPointerDown={(event) => event.stopPropagation()}>
          <h2 id="ended-title" className="over-eyebrow">The star rests</h2>
          <p className="over-score">
            {/* Counts up as the words rise (they fade in 1.1 s after the run ends); a new best is gold and gets a sweep of light. */}
            <strong className={newBest ? 'best' : undefined}>
              <CountUp to={run.rings} delayMs={1100} calm={calm} />
            </strong>
            <span>
              {run.rings === 1 ? 'ring' : 'rings'} · {run.perfects} perfect
              {newBest ? (
                <>
                  {' · '}
                  <b>new best today</b>
                </>
              ) : (
                best > run.rings && ` · best today ${best}`
              )}
            </span>
          </p>
          {/* Why it ended and how close the next milestone was, in one line: the reason to light again. */}
          <p className="near-miss">
            Points wore below {RULES.minWidth}° <b>{goal.toGo} more for {goal.what}</b>
          </p>
          <button type="button" className="primary over-button" autoFocus onClick={() => start(performance.now())}>
            Light again
          </button>
        </section>
      )}

      {panel === 'how' && <HowToPlay palette={tonight.palette} onClose={closePanel} />}
      {panel === 'settings' && (
        <Settings
          sound={!muted}
          vibration={settings.vibration}
          calm={calm}
          runs={loggedRuns(store).length}
          onSound={(on) => toggleSound(on)}
          onVibration={(on) => saveSettings({ ...settings, vibration: on })}
          onCalm={(on) => saveSettings({ ...settings, calm: on })}
          onHowTo={() => setPanel('how')}
          onDownloadLog={downloadLog}
          onClose={closePanel}
        />
      )}
      {newDay && (phase === 'ready' || phase === 'ended') && <NewDay best={best} onSee={() => location.reload()} />}
    </main>
  )
}
