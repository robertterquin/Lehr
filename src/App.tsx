import { memo, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { getManilaDate, seedForDate, weekdayIndex } from './game/daily.ts'
import { createEngine, nextAlignmentMs, ringOffset, tap, type Engine } from './game/engine.ts'
import { NIGHTS, night as nightById, type NightId, type Night } from './draw/nights.tsx'
import { Star } from './draw/star.tsx'
import type { Stage } from './draw/street.tsx'

// Phase 4 preview: tonight's night and a star that plays itself, to check the drawing and its smoothness on
// real devices. ?rings=100 starts from a 100-ring star, ?night=dagat picks a night. Phase 5 replaces this with play.
const params = new URLSearchParams(location.search)
const START_RINGS = Math.max(0, Math.min(300, Number(params.get('rings') ?? 34) || 0))
const today = getManilaDate()
const tonight: Night = params.get('night') ? nightById(params.get('night') as NightId) : NIGHTS[weekdayIndex(today)]
const seed = seedForDate(today)
const BENCH: number[] | null = params.has('bench') ? ((window as unknown as { lockMs: number[] }).lockMs = []) : null

/** Where the self-playing star taps: on the alignment, with a 3° miss every seventh ring. */
const autoTapMs = (engine: Engine) => nextAlignmentMs(engine) + (engine.run.rings % 7 === 3 ? (3 / engine.ring.speed) * 1000 : 0)

const warmUp = () => {
  let engine = createEngine(seed)
  while (engine.run.rings < START_RINGS && !engine.run.ended) engine = tap(engine, autoTapMs(engine))
  return engine
}

// The scene is a big static drawing: it redraws only when the milestone stage changes, never on a lock.
const Scenery = memo(function Scenery({ stage }: { stage: Stage }) {
  return <tonight.Scene stage={stage} />
})

export default function App() {
  const [engine, setEngine] = useState(warmUp)
  const spinRef = useRef<SVGSVGElement>(null)
  const engineRef = useRef(engine)
  engineRef.current = engine

  useEffect(() => {
    // Run time is engine time: line the clock up with the ring that is spinning now.
    const base = performance.now() - engineRef.current.ring.startMs
    let frame = 0
    const loop = () => {
      const now = performance.now() - base
      const current = engineRef.current
      if (now >= autoTapMs(current)) {
        // Draw the lock within this frame; ?bench records how long that takes, for checking phones.
        const started = performance.now()
        engineRef.current = tap(current, autoTapMs(current))
        flushSync(() => setEngine(engineRef.current))
        if (BENCH) BENCH.push(performance.now() - started)
      } else spinRef.current?.style.setProperty('transform', `rotate(${ringOffset(current.ring, now)}deg)`)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  const rings = engine.run.rings
  // innerWidth can read 0 before layout (embedded views): fall back to a phone width.
  const size = Math.max(200, Math.min(330, (window.innerWidth || 390) - 60))
  return (
    <main className="play" style={{ background: 'radial-gradient(120% 70% at 50% 28%, #2a1e55 0%, #140f30 55%, #0a0918 100%)' }}>
      <Scenery stage={Math.min(10, Math.floor(rings / 10)) as Stage} />
      <p className="play-count">
        <span className="play-label">Rings</span> <span className="play-number">{rings}</span>
      </p>
      <div className="play-star">
        <Star size={size} locks={engine.locks} spinning spinRef={spinRef} palette={tonight.palette} danger={engine.run.width < 15} />
      </div>
      <p className="play-note">
        {tonight.name} · {tonight.place}
      </p>
    </main>
  )
}
