// What the server accepts as a finished run: tonight's star, sane inputs, and a run that really ended. The score
// is never taken from the phone: it is whatever replaying the taps on the day's seed gives. No browser code.
import { getManilaDate, seedForDate } from './daily.ts'
import { replay, type Input } from './engine.ts'

export const MAX_INPUTS = 10_000
/** A run started just before midnight in Manila still counts for that night if it ends within the hour. */
const LATE_MS = 60 * 60 * 1000
const TYPES = new Set(['tap', 'pause', 'resume'])

export type Checked = { day: string; rings: number; perfects: number; inputs: Input[] }

export const checkRun = (body: unknown, now = new Date()): Checked => {
  const { day, inputs } = (body ?? {}) as { day?: unknown; inputs?: unknown }
  if (day !== getManilaDate(now) && day !== getManilaDate(new Date(now.getTime() - LATE_MS))) throw new Error('That run is not from tonight’s star')
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > MAX_INPUTS) throw new Error('That run has no taps, or too many')
  const clean: Input[] = inputs.map((input) => {
    const { type, atMs } = (input ?? {}) as { type?: unknown; atMs?: unknown }
    if (typeof type !== 'string' || !TYPES.has(type) || typeof atMs !== 'number') throw new Error('That run has a broken tap')
    return { type: type as Input['type'], atMs }
  })
  const engine = replay(seedForDate(day), clean)
  if (!engine.run.ended) throw new Error('That run has not ended')
  return { day, rings: engine.run.rings, perfects: engine.run.perfects, inputs: clean }
}
