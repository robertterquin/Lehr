// Today's star: everyone plays the same seeded run, and the day changes over at midnight in Manila.

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000 // UTC+8, no daylight saving

/** The calendar date in Manila, as YYYY-MM-DD. */
export const getManilaDate = (date = new Date()) => new Date(date.getTime() + MANILA_OFFSET_MS).toISOString().slice(0, 10)

/** FNV-1a hash of the date, so every device derives the same seed. */
export const seedForDate = (manilaDate: string) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < manilaDate.length; index += 1) {
    hash ^= manilaDate.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Mulberry32: a small, fast seeded random source returning numbers in [0, 1). */
export const randomForSeed = (seed: number) => {
  let state = seed >>> 0
  return () => {
    let value = (state += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** 0 for Monday through 6 for Sunday: which of the seven nights a Manila date gets. */
export const weekdayIndex = (manilaDate: string) => (new Date(`${manilaDate}T00:00:00Z`).getUTCDay() + 6) % 7

/** The Manila week a date falls in, Monday to Sunday. */
export const weekDates = (manilaDate: string) => {
  const monday = Date.parse(`${manilaDate}T00:00:00Z`) - weekdayIndex(manilaDate) * 86_400_000
  return Array.from({ length: 7 }, (_, i) => new Date(monday + i * 86_400_000).toISOString().slice(0, 10))
}

/** Simbang Gabi: the nine dawn Masses before Christmas, 16 to 24 December (Manila dates) of `manilaDate`'s year. */
export const novenaDates = (manilaDate: string) => Array.from({ length: 9 }, (_, i) => `${manilaDate.slice(0, 4)}-12-${16 + i}`)
export const inNovena = (manilaDate: string) => novenaDates(manilaDate).includes(manilaDate)
