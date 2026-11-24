// What Parol keeps on this device (no accounts): settings, the playtest log of finished runs, the nights played
// and the album of their stars, achievements, and the random secret that is this device's place on the board.
// Storage can be blocked (private modes): everything falls back to memory for the visit instead of failing.
import { weekDates } from './daily.ts'

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

/** A night in the album: the best run's star (its lock errors) and where it was lit. */
export type AlbumNight = { night: string; rings: number; perfects: number; locks: number[] }
const ALBUM_KEY = 'parol-album'

/** The album: each night's best star, by date. Nights still only in the log are merged in. */
export const albumNights = (store: Store): Record<string, AlbumNight> => {
  const album = read<Record<string, AlbumNight>>(store, ALBUM_KEY, {})
  for (const run of loggedRuns(store))
    if (!(run.date in album) || album[run.date].rings < run.rings) album[run.date] = { night: run.night, rings: run.rings, perfects: run.perfects, locks: run.locks }
  return album
}

export const logRun = (store: Store, run: RunLog) => {
  const nights = playedNights(store)
  write(store, NIGHTS_KEY, { ...nights, [run.date]: Math.max(nights[run.date] ?? 0, run.rings) })
  const album = albumNights(store)
  if (!(run.date in album) || album[run.date].rings < run.rings)
    write(store, ALBUM_KEY, { ...album, [run.date]: { night: run.night, rings: run.rings, perfects: run.perfects, locks: run.locks } })
  write(store, LOG_KEY, [...loggedRuns(store), run].slice(-MAX_LOGGED))
}

export const dayBefore = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)

/**
 * The streak: nights played in a row, up to today (or yesterday, before today's first run). One missed night a
 * week (Monday to Sunday) is a rest that keeps it, but never two nights in a row. `rests` are the nights kept.
 */
export const streakOf = (nights: Record<string, number>, today: string) => {
  let day = today in nights ? today : dayBefore(today)
  let count = 0
  const rests: string[] = []
  for (;;) {
    if (day in nights) count += 1
    else {
      const restedBefore = rests[rests.length - 1] === dayAfter(day)
      const restedThisWeek = rests.some((rest) => weekDates(rest)[0] === weekDates(day)[0])
      if (restedBefore || restedThisWeek) break
      rests.push(day)
    }
    day = dayBefore(day)
  }
  // A rest with no night played before it keeps nothing.
  if (rests[rests.length - 1] === dayAfter(day)) rests.pop()
  return { count, rests }
}

const dayAfter = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)

export const nightsInARow = (store: Store, today: string) => streakOf(playedNights(store), today).count

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

const ACHIEVED_KEY = 'parol-achievements'
/** Achievements earned on this device, each with the date it was first earned. */
export const achieved = (store: Store) => read<Record<string, string>>(store, ACHIEVED_KEY, {})
/** Records any of `ids` not earned before; returns just the new ones. */
export const achieve = (store: Store, ids: string[], date: string) => {
  const had = achieved(store)
  const fresh = ids.filter((id) => !(id in had))
  if (fresh.length) write(store, ACHIEVED_KEY, { ...had, ...Object.fromEntries(fresh.map((id) => [id, date])) })
  return fresh
}
