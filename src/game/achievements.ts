// Small achievements: earned once, shown once as a gold line at the end of a run, then kept in the album.
// What earns each (the words are in src/copy.ts). No browser code.
import { RULES } from './rules.ts'
import { novenaDates, weekDates } from './daily.ts'

export const ACHIEVEMENTS = ['firstNight', 'streak10', 'cleanHalo', 'perfect25', 'rings50', 'rings100', 'nights7', 'sevenPlaces', 'novena', 'top10'] as const
export type Achievement = (typeof ACHIEVEMENTS)[number]

const perfect = (error: number) => Math.abs(error) <= RULES.perfectWithin + 1e-9

/** The longest run of perfect locks in a row. */
const longestPerfect = (locks: number[]) => locks.reduce(([best, now], error) => (perfect(error) ? [Math.max(best, now + 1), now + 1] : [best, 0]), [0, 0])[0]

/**
 * What a finished run earns: from its counted locks (errors in degrees, in order), the nights played including
 * tonight, the streak after it, and today's Manila date. `top10` comes from the board, apart.
 */
export const earnedBy = ({ locks, nights, streak, today }: { locks: number[]; nights: Record<string, number>; streak: number; today: string }): Achievement[] => {
  const rings = locks.length
  const earned: Achievement[] = ['firstNight']
  if (longestPerfect(locks) >= 10) earned.push('streak10')
  if (rings >= 10 && locks.slice(0, 10).every(perfect)) earned.push('cleanHalo')
  if (locks.filter(perfect).length >= 25) earned.push('perfect25')
  if (rings >= 50) earned.push('rings50')
  if (rings >= 100) earned.push('rings100')
  if (streak >= 7) earned.push('nights7')
  // Each weekday is its own place, so a whole week played is all seven places.
  if (weekDates(today).every((day) => day in nights)) earned.push('sevenPlaces')
  if (novenaDates(today).every((day) => day in nights)) earned.push('novena')
  return earned
}
