// What Parol keeps on this device (v1 has no accounts): settings, the playtest log of finished runs, and
// today's best, worked out from that log. Storage can be blocked (private modes): everything falls back to
// memory for the visit instead of failing.

export type Store = Pick<Storage, 'getItem' | 'setItem'>

const memory = new Map<string, string>()
const inMemory: Store = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => void memory.set(key, value) }

/** The browser's localStorage when it works, else memory. */
export const deviceStore = (): Store => {
  try {
    window.localStorage.getItem('parol')
    return window.localStorage
  } catch {
    return inMemory
  }
}

const read = <T>(store: Store, key: string, fallback: T): T => {
  try {
    const value = store.getItem(key)
    return value === null ? fallback : (JSON.parse(value) as T)
  } catch {
    return fallback
  }
}

const write = (store: Store, key: string, value: unknown) => {
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // Full or blocked storage: the value lasts until the page closes.
    memory.set(key, JSON.stringify(value))
  }
}

export type Settings = { vibration: boolean; calm: boolean | null; seenHowTo: boolean }
const SETTINGS_KEY = 'parol-settings'
/** `calm: null` follows the device's reduced-motion setting. */
export const DEFAULT_SETTINGS: Settings = { vibration: true, calm: null, seenHowTo: false }

export const readSettings = (store: Store): Settings => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(store, SETTINGS_KEY, {}) })
export const writeSettings = (store: Store, settings: Settings) => write(store, SETTINGS_KEY, settings)

/** One finished run, for playtests: where runs end and how each lock went. */
export type RunLog = {
  date: string
  night: string
  seed: number
  startedAt: string
  durationMs: number
  rings: number
  perfects: number
  /** Point width the run ended at, and the miss that ended it. */
  endWidth: number
  endError: number
  /** Each counted lock's error, to 0.1°. */
  locks: number[]
  pauses: number
  viewport: string
  pointer: 'coarse' | 'fine'
}

const LOG_KEY = 'parol-runs'
/** The log keeps the most recent runs only, so it never fills the device's storage. */
export const MAX_LOGGED = 200

export const loggedRuns = (store: Store) => read<RunLog[]>(store, LOG_KEY, [])
export const logRun = (store: Store, run: RunLog) => write(store, LOG_KEY, [...loggedRuns(store), run].slice(-MAX_LOGGED))

const dayBefore = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)

/** Nights in a row with at least one run, up to today (or yesterday, before today's first run). */
// shortcut: counted from the playtest log, which keeps the last 200 runs; the Phase 9 streak calendar replaces it.
export const nightsInARow = (store: Store, today: string) => {
  const dates = new Set(loggedRuns(store).map((run) => run.date))
  let day = dates.has(today) ? today : dayBefore(today)
  let nights = 0
  while (dates.has(day)) {
    nights += 1
    day = dayBefore(day)
  }
  return nights
}

/** The most rings in a logged run on `date` (0 when none). */
export const bestOn = (store: Store, date: string) => loggedRuns(store).reduce((best, run) => (run.date === date && run.rings > best ? run.rings : best), 0)
