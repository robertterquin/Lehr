// Stained-glass window geometry: the day's seed bends the lead lines, never the piece count.
// shortcut: Harbour sunrise is hard-coded here; split out a theme object when themes 2–7 arrive (Phase 8).
import { WINDOW_PANES, randomForSeed, type GatherLog, type Outcome } from '../engine/engine.ts'

export type Point = readonly [number, number]
export type PieceKind = 'glass' | 'ray' | 'sun-core' | 'sun-ring'

export type Piece = {
  /** Pane index that lights this piece (story order). */
  order: number
  kind: PieceKind
  points: Point[]
  colors: readonly [string, string]
  angle: number
}

export const WINDOW_WIDTH = 300
export const WINDOW_HEIGHT = 446
export const ARCH_PATH = 'M20 430V250A260 260 0 0 1 150 24.83A260 260 0 0 1 280 250V430Z'
export const FRAME_PATH = `M6 446V250A288 288 0 0 1 150 0.58A288 288 0 0 1 294 250V446Z${ARCH_PATH}`
/** The two iron bars sit on unjittered rows so the panels join in straight lines. */
export const BAR_YS = [170.3, 314.6] as const
export const THEME_NAME = 'Harbour sunrise'

const COLS = 9
const ROWS = 14
const X0 = 20
const X1 = 280
const Y0 = 26
const Y1 = 430
const HORIZON_ROW = 9
const FIXED_ROWS = new Set([0, 5, HORIZON_ROW, 10, ROWS])
const DX = (X1 - X0) / COLS
const DY = (Y1 - Y0) / ROWS
const HORIZON = Y0 + HORIZON_ROW * DY
const LOWER_SEA = BAR_YS[1]
const SUN: Point = [150, 196]
const SUN_RADIUS = 40
const SUN_CORE = 14
const SUN_RING_SEGMENTS = 10
const RAY_COUNT = 7
const DEG = Math.PI / 180

const inArch = ([x, y]: Point) =>
  y >= 250 ? x >= 20 && x <= 280 : Math.hypot(x - 280, y - 250) <= 260 && Math.hypot(x - 20, y - 250) <= 260

const centroid = (points: readonly Point[]): Point => [
  points.reduce((sum, p) => sum + p[0], 0) / points.length,
  points.reduce((sum, p) => sum + p[1], 0) / points.length,
]

const inPolygon = ([x, y]: Point, polygon: readonly Point[]) => {
  let inside = false
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [xa, ya] = polygon[a]
    const [xb, yb] = polygon[b]
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) inside = !inside
  }
  return inside
}

const polar = (radius: number, angle: number): Point => [SUN[0] + radius * Math.cos(angle), SUN[1] + radius * Math.sin(angle)]

const hill = (x: number) => HORIZON - 20 * Math.exp(-(((x - 62) / 38) ** 2)) - 13 * Math.exp(-(((x - 238) / 28) ** 2))

type Pick = <T>(options: readonly T[]) => T

/** Harbour sunrise palette: two shades per piece give each pane a streaky, hand-made look. */
const colorsFor = (kind: PieceKind, [x, y]: Point, pick: Pick, random: () => number): readonly [string, string] => {
  if (kind === 'ray') return ['#f2ad3a', '#f8c862']
  if (kind === 'sun-core') return ['#fff3b0', '#ffe07a']
  if (kind === 'sun-ring') return ['#f6c33f', '#eea235']
  if (y > HORIZON) {
    const glintHalfWidth = 12 + (y - HORIZON) * 0.26
    if (Math.abs(x - 150) < glintHalfWidth && random() < 0.85) return pick([['#f2b84b', '#e39436'], ['#f6cc6a', '#eaa443']] as const)
    return pick([['#0f5566', '#0b4352'], ['#156b7b', '#0f5566'], ['#1b7c88', '#136474'], ['#0d4a5b', '#093a48']] as const)
  }
  if (y > hill(x)) return pick([['#2e2152', '#241a42'], ['#3a2a60', '#2e2152']] as const)
  const fromSun = Math.hypot(x - SUN[0], y - SUN[1])
  if (y > 238 || (fromSun < 78 && y > 150)) return pick([['#e46f39', '#d45a2e'], ['#ee8a45', '#e06f37']] as const)
  if (y > 160) return pick([['#c23b5e', '#a82e50'], ['#b33259', '#962748']] as const)
  if (y > 92) return pick([['#6c3190', '#592a7e'], ['#7a3799', '#652e88']] as const)
  return pick([['#24398f', '#1c2d78'], ['#2b44a0', '#21368a']] as const)
}

/** Story order: lower sea first, then the sun, then upward through horizon and sky to the rays. */
const storyRank = (kind: PieceKind, [, y]: Point) =>
  kind === 'sun-core' || kind === 'sun-ring' ? 1 : kind === 'glass' && y > LOWER_SEA ? 0 : 2

export function buildWindow(seed: number): Piece[] {
  const random = randomForSeed(seed)
  const pick: Pick = (options) => options[Math.floor(random() * options.length)]

  const grid: Point[][] = []
  for (let row = 0; row <= ROWS; row += 1) {
    grid.push([])
    for (let col = 0; col <= COLS; col += 1) {
      const x = X0 + col * DX + (col === 0 || col === COLS ? 0 : (random() - 0.5) * 16)
      const y = Y0 + row * DY + (FIXED_ROWS.has(row) ? 0 : (random() - 0.5) * 14)
      grid[row].push([x, y])
    }
  }

  const rays: Point[][] = Array.from({ length: RAY_COUNT }, (_, k) => {
    const angle = (-160 + (k * 140) / (RAY_COUNT - 1)) * DEG
    return [polar(50, angle - 3 * DEG), polar(250, angle - 6.5 * DEG), polar(250, angle + 6.5 * DEG), polar(50, angle + 3 * DEG)]
  })

  const raw: { kind: PieceKind; points: Point[]; at: Point }[] = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      // Which cells exist is decided on the regular grid, so every seed gives the same count.
      const cell: Point[] = [
        [X0 + col * DX, Y0 + row * DY],
        [X0 + (col + 1) * DX, Y0 + row * DY],
        [X0 + (col + 1) * DX, Y0 + (row + 1) * DY],
        [X0 + col * DX, Y0 + (row + 1) * DY],
      ]
      if (cell.every((p) => Math.hypot(p[0] - SUN[0], p[1] - SUN[1]) < SUN_RADIUS + 3)) continue
      if (rays.some((ray) => cell.every((p) => inPolygon(p, ray)))) continue
      if (!inArch(centroid(cell)) && !cell.some(inArch)) continue
      const points = [grid[row][col], grid[row][col + 1], grid[row + 1][col + 1], grid[row + 1][col]]
      raw.push({ kind: 'glass', points, at: centroid(points) })
    }
  }
  for (const ray of rays) raw.push({ kind: 'ray', points: ray, at: centroid(ray) })
  const core = Array.from({ length: 16 }, (_, k) => polar(SUN_CORE, (k / 16) * 2 * Math.PI))
  raw.push({ kind: 'sun-core', points: core, at: SUN })
  for (let k = 0; k < SUN_RING_SEGMENTS; k += 1) {
    const from = (k / SUN_RING_SEGMENTS) * 2 * Math.PI
    const to = ((k + 1) / SUN_RING_SEGMENTS) * 2 * Math.PI
    const ring: Point[] = []
    for (let s = 0; s <= 4; s += 1) ring.push(polar(SUN_RADIUS, from + ((to - from) * s) / 4))
    for (let s = 4; s >= 0; s -= 1) ring.push(polar(SUN_CORE + 1, from + ((to - from) * s) / 4))
    raw.push({ kind: 'sun-ring', points: ring, at: centroid(ring) })
  }

  raw.sort((a, b) => storyRank(a.kind, a.at) - storyRank(b.kind, b.at) || b.at[1] - a.at[1] || a.at[0] - b.at[0])
  const pieces = raw.map((piece, order) => ({
    order,
    kind: piece.kind,
    points: piece.points,
    colors: colorsFor(piece.kind, piece.at, pick, random),
    angle: Math.round(random() * 180),
  }))
  if (pieces.length !== WINDOW_PANES) throw new Error(`Window has ${pieces.length} pieces, expected ${WINDOW_PANES}`)
  return pieces
}

/** What filled each pane, in pane order, from the engine's run log. A brilliant release fills 4. */
export const paneOutcomes = (log: readonly GatherLog[]): Outcome[] =>
  log.flatMap((entry) => Array.from({ length: entry.panes }, () => entry.outcome)).slice(0, WINDOW_PANES)

export const pathOf = (points: readonly Point[]) =>
  `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`
