// What Parol keeps on this device (no accounts): settings, the playtest log of finished runs, today's best
// worked out from that log, and the random secret that is this device's place on the board. Storage can be blocked (private modes): everything falls back to
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

/** `askedName`: the board has asked for a name once, so Not now isn't asked again. */
export type Settings = { vibration: boolean; calm: boolean | null; seenHowTo: boolean; askedName: boolean }
const SETTINGS_KEY = 'parol-settings'
/** `calm: null` follows the device's reduced-motion setting. */
export const DEFAULT_SETTINGS: Settings = { vibration: true, calm: null, seenHowTo: false, askedName: false }

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
const NIGHTS_KEY = 'parol-nights'

/** Every night played, with its best rings: kept apart from the log, which drops old runs, so a streak never shortens.
 *  Nights still only in the log (from before this record) are merged in. */
export const playedNights = (store: Store): Record<string, number> => {
  const nights = read<Record<string, number>>(store, NIGHTS_KEY, {})
  for (const run of loggedRuns(store)) if (!(run.date in nights) || nights[run.date] < run.rings) nights[run.date] = run.rings
  return nights
}

export const logRun = (store: Store, run: RunLog) => {
  const nights = playedNights(store)
  write(store, NIGHTS_KEY, { ...nights, [run.date]: Math.max(nights[run.date] ?? 0, run.rings) })
  write(store, LOG_KEY, [...loggedRuns(store), run].slice(-MAX_LOGGED))
}

export const dayBefore = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)

/** Nights in a row with at least one run, up to today (or yesterday, before today's first run). */
export const nightsInARow = (store: Store, today: string) => {
  const nights = playedNights(store)
  let day = today in nights ? today : dayBefore(today)
  let count = 0
  while (day in nights) {
    count += 1
    day = dayBefore(day)
  }
  return count
}

/** The most rings in a logged run on `date` (0 when none). */
export const bestOn = (store: Store, date: string) => loggedRuns(store).reduce((best, run) => (run.date === date && run.rings > best ? run.rings : best), 0)

const PLAYER_KEY = 'parol-player'
/** This device's player on the board: a random secret, made once. Only its hash leaves the server's door. */
// shortcut: clearing site data loses the secret and with it the name and tonight's rank; accounts would fix that.
export const playerSecret = (store: Store) => {
  const saved = read<string | null>(store, PLAYER_KEY, null)
  if (saved) return saved
  const secret = crypto.randomUUID()
  write(store, PLAYER_KEY, secret)
  return secret
}
