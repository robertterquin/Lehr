// Tonight's board and the one-time name prompt: words floating over the dimmed street, no card
// (mockups/board.tsx, option A). On desktop they stand in the right-hand column with the star still in view.
import { useEffect, useState, type FormEvent, type PointerEvent } from 'react'
import { fetchBoard, saveName, type Board } from '../board.ts'

type Day = 'tonight' | 'yesterday'
const DAYS: Day[] = ['tonight', 'yesterday']
const stop = (event: PointerEvent) => event.stopPropagation()
export const count = (n: number) => n.toLocaleString('en-US')

export function TonightBoard({ secret, dates, names, back, onBack }: { secret: string; dates: Record<Day, string>; names: Record<Day, string>; back: string; onBack: () => void }) {
  const [day, setDay] = useState<Day>('tonight')
  const [boards, setBoards] = useState<Partial<Record<Day, Board | Error>>>({})
  const { tonight: tonightDate, yesterday: yesterdayDate } = dates
  useEffect(() => {
    const all: Record<Day, string> = { tonight: tonightDate, yesterday: yesterdayDate }
    for (const d of DAYS) {
      fetchBoard(all[d], secret).then(
        (board) => setBoards((shown) => ({ ...shown, [d]: board })),
        (error: Error) => setBoards((shown) => ({ ...shown, [d]: error })),
      )
    }
  }, [secret, tonightDate, yesterdayDate])

  const board = boards[day]
  const tonight = day === 'tonight'
  const me = board && !(board instanceof Error) ? board.me : null
  const meBelow = me?.rank && board && !(board instanceof Error) && !board.top.some((row) => row.me)
  const nameOf = (name: string | null, mine: boolean) => (mine ? `You${name ? ` · ${name}` : ''}` : (name ?? 'A neighbour'))

  return (
    <div className="overlay overlay-board" role="dialog" aria-modal="true" aria-labelledby="board-title" onPointerDown={stop}>
      <section className="board">
        <button type="button" className="board-back" autoFocus onClick={onBack}>
          <span aria-hidden="true">←</span> {back}
        </button>
        <div className="board-head">
          <div>
            <span className="over-eyebrow">{tonight ? 'Tonight’s board' : 'Last night · final'}</span>
            <h2 id="board-title" className="board-title">{names[day]}</h2>
          </div>
          <div className="board-tabs" role="tablist" aria-label="Which night">
            {DAYS.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={d === day} className="board-tab" onClick={() => setDay(d)}>
                {d === 'tonight' ? 'Tonight' : 'Yesterday'}
              </button>
            ))}
          </div>
        </div>

        {board === undefined ? (
          <p className="board-note">Lighting up the board…</p>
        ) : board instanceof Error ? (
          <p className="board-note">{board.message}</p>
        ) : board.total === 0 ? (
          <p className="board-note">{tonight ? 'No one has lit tonight’s star yet. Be the first.' : 'No one lit last night’s star.'}</p>
        ) : (
          <>
            <ol className="board-list">
              {board.top.map((row, i) => (
                <li key={i} className={`board-row${row.me ? ' is-me' : ''}${row.rank <= 3 ? ' is-top' : ''}`}>
                  <span className="board-rank">{row.rank}</span>
                  <span className="board-name">{nameOf(row.name, row.me)}</span>
                  <span className="board-rings">{row.rings}</span>
                </li>
              ))}
              {meBelow && me && (
                <li className="board-row is-me">
                  <span className="board-rank">{me.rank}</span>
                  <span className="board-name">{nameOf(me.name, true)}</span>
                  <span className="board-rings">{me.rings}</span>
                </li>
              )}
            </ol>
            <p className="board-note">
              {count(board.total)} lit {tonight ? 'tonight’s star · closes at midnight, Manila' : 'last night’s star'}
            </p>
          </>
        )}
      </section>
    </div>
  )
}

/** The first time you open the board: a name, once. Not now still shows the board. */
export function NamePrompt({ secret, initial, onDone, onSkip }: { secret: string; initial: string | null; onDone: (name: string) => void; onSkip: () => void }) {
  const [name, setName] = useState(initial ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      onDone(await saveName(secret, name))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'That name didn’t save')
      setSaving(false)
    }
  }
  return (
    <div className="overlay overlay-board" role="dialog" aria-modal="true" aria-labelledby="name-title" onPointerDown={stop}>
      <form className="board name-form" onSubmit={submit}>
        <span className="over-eyebrow">Join tonight’s board</span>
        <label id="name-title" htmlFor="board-name" className="board-title">
          Your name
        </label>
        <p className="name-note">Everyone who lights tonight’s star sees it.</p>
        <input
          id="board-name"
          className="name-input"
          value={name}
          maxLength={16}
          autoFocus
          autoComplete="nickname"
          spellCheck={false}
          aria-describedby="name-help"
          aria-invalid={error ? true : undefined}
          onChange={(event) => setName(event.target.value)}
        />
        <p id="name-help" className={`board-note${error ? ' is-error' : ''}`} role={error ? 'alert' : undefined}>
          {error || 'Up to 16 letters, numbers or spaces · change it any time in Settings'}
        </p>
        <button type="submit" className="primary" disabled={saving || !name.trim()}>
          {saving ? 'Joining…' : 'Join the board'}
        </button>
        <button type="button" className="link name-skip" onClick={onSkip}>
          Not now
        </button>
      </form>
    </div>
  )
}
