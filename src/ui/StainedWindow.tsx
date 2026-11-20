import { memo, useId, useMemo } from 'react'
import { WINDOW_PANES, type Outcome } from '../engine/engine.ts'
import { ARCH_PATH, BAR_YS, FRAME_PATH, THEME_NAME, WINDOW_HEIGHT, WINDOW_WIDTH, buildWindow, pathOf, type PieceKind } from '../window/geometry.ts'

type Props = {
  seed: number
  /** How many panes are lit, in story order. */
  lit: number
  /** What filled each pane; flawless panes get a glint. */
  outcomes?: readonly Outcome[]
  /** Pane range [from, to) filled by the latest release, highlighted. */
  newest?: readonly [number, number]
  complete?: boolean
  glow?: boolean
  className?: string
}

const LEAD = '#26221f'
const DRAW_ORDER: Record<PieceKind, number> = { glass: 0, ray: 1, 'sun-ring': 2, 'sun-core': 3 }

/** Stone joints on the arch and jambs: radial lines across the frame band. */
const JOINTS =
  'M24 204.9L-15.4 197.9M44.4 140.1L8.2 123.2M86.8 76L57.1 49.3M276 204.9L315.4 197.9M255.6 140.1L291.8 123.2M213.2 76L242.9 49.3M6 320H20M6 388H20M280 320H294M280 388H294M143 0V30M157 0V30'

// Memoized: the window redraws once per pane, never on bubble animation frames.
export default memo(function StainedWindow({ seed, lit, outcomes = [], newest, complete = false, glow = false, className }: Props) {
  const id = useId().replace(/:/g, '')
  const pieces = useMemo(
    () =>
      buildWindow(seed)
        .map((piece) => ({ ...piece, d: pathOf(piece.points) }))
        .sort((a, b) => DRAW_ORDER[a.kind] - DRAW_ORDER[b.kind]),
    [seed],
  )
  const litCount = complete ? WINDOW_PANES : Math.max(0, Math.min(WINDOW_PANES, lit))
  const isNewest = (order: number) => newest !== undefined && order >= newest[0] && order < newest[1]

  return (
    <svg
      className={className}
      viewBox={`0 0 ${WINDOW_WIDTH} ${WINDOW_HEIGHT}`}
      role="img"
      aria-label={`${THEME_NAME} window, ${litCount} of ${WINDOW_PANES} pieces lit`}
      style={glow ? { filter: 'drop-shadow(0 0 18px rgba(255, 196, 110, 0.55))' } : undefined}
    >
      <defs>
        <clipPath id={`${id}-arch`}>
          <path d={ARCH_PATH} />
        </clipPath>
        <clipPath id={`${id}-frame`}>
          <path d={FRAME_PATH} clipRule="evenodd" />
        </clipPath>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6c5e" />
          <stop offset="1" stopColor="#4c4037" />
        </linearGradient>
        <radialGradient id={`${id}-seedy`} cx="0.28" cy="0.24" r="0.45">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0.36" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.49" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-sunlight`} gradientUnits="userSpaceOnUse" cx="150" cy="196" r="220">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#ffd68c" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffd68c" stopOpacity="0" />
        </radialGradient>
        {pieces.map((piece) => (
          <linearGradient key={piece.order} id={`${id}-g${piece.order}`} gradientTransform={`rotate(${piece.angle} 0.5 0.5)`}>
            <stop offset="0" stopColor={piece.colors[0]} />
            <stop offset="1" stopColor={piece.colors[1]} />
          </linearGradient>
        ))}
      </defs>

      <g clipPath={`url(#${id}-arch)`}>
        <path d={ARCH_PATH} fill="#1b1512" />
        {pieces.map((piece) => {
          const on = piece.order < litCount
          return (
            <g key={piece.order}>
              <path
                d={piece.d}
                fill={`url(#${id}-g${piece.order})`}
                fillOpacity={on ? 1 : 0.22}
                stroke={LEAD}
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {on && <path d={piece.d} fill={`url(#${id}-seedy)`} />}
              {on && outcomes[piece.order] === 'flawless' && <path d={piece.d} fill={`url(#${id}-shine)`} />}
              {on && isNewest(piece.order) && <path d={piece.d} fill="#fff" fillOpacity="0.28" stroke="#ffe7b3" strokeWidth="1.2" />}
            </g>
          )
        })}
        {complete && <rect width={WINDOW_WIDTH} height={WINDOW_HEIGHT} fill={`url(#${id}-sunlight)`} style={{ mixBlendMode: 'screen' }} />}
      </g>

      {BAR_YS.map((y) => (
        <g key={y}>
          <path d={`M20 ${y}H280`} stroke="#171412" strokeWidth="4.5" />
          <path d={`M20 ${y - 1.9}H280`} stroke="#7a7068" strokeWidth="0.8" opacity="0.55" />
        </g>
      ))}
      <path d={ARCH_PATH} fill="none" stroke={LEAD} strokeWidth="5" />
      <path d={FRAME_PATH} fillRule="evenodd" fill={`url(#${id}-stone)`} />
      <path d={JOINTS} clipPath={`url(#${id}-frame)`} stroke="#2f2721" strokeWidth="1.2" />
      <path d="M20 430V250A260 260 0 0 1 150 24.83A260 260 0 0 1 280 250V430" fill="none" stroke="#2a221d" strokeWidth="1.5" />
      <path d="M6 431H294" stroke="#9a8878" strokeWidth="1.2" />
    </svg>
  )
})
