// Tonight's board and the one-time name prompt: words floating over the dimmed street, no card
// (the floating option A from the design mockups). On desktop they stand in the right-hand column with the star still in view.
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react'
import { useDialogFocus } from './focus.ts'
import { fetchBoard, saveName, type Board } from '../board.ts'
import { t } from '../copy.ts'

type Day = 'tonight' | 'yesterday'
const DAYS: Day[] = ['tonight', 'yesterday']
const stop = (event: PointerEvent) => event.stopPropagation()
export const count = (n: number) => n.toLocaleString('en-US')

export function TonightBoard({ secret, dates, names, back, onBack, initialDay = 'tonight' }: { secret: string; dates: Record<Day, string>; names: Record<Day, string>; back: string; onBack: () => void; initialDay?: Day }) {
  const [day, setDay] = useState<Day>(initialDay)
  const box = useRef<HTMLDivElement>(null)
  useDialogFocus(box)
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
  const nameOf = (name: string | null, mine: boolean) => (mine ? `${t().you}${name ? ` · ${name}` : ''}` : (name ?? t().neighbour))

  return (
    <div ref={box} className="overlay overlay-board" role="dialog" aria-modal="true" aria-labelledby="board-title" onPointerDown={stop}>
      <section className="board">
        <button type="button" className="board-back" autoFocus onClick={onBack}>
          <span aria-hidden="true">←</span> {back}
        </button>
        <div className="board-head">
          <div>
            <span className="over-eyebrow">{tonight ? t().boardTonight : t().boardLast}</span>
            <h2 id="board-title" className="board-title">{names[day]}</h2>
          </div>
          <div className="board-tabs" role="tablist" aria-label={t().whichNight}>
            {DAYS.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={d === day} className="board-tab" onClick={() => setDay(d)}>
                {d === 'tonight' ? t().tabTonight : t().tabYesterday}
              </button>
            ))}
          </div>
        </div>

        {board === undefined ? (
          <p className="board-note">{t().boardLoading}</p>
        ) : board instanceof Error ? (
          <p className="board-note">{t().boardOffline}</p>
        ) : board.total === 0 ? (
          <p className="board-note">{tonight ? t().boardEmptyTonight : t().boardEmptyLast}</p>
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
              {tonight ? t().boardFootTonight(board.total) : t().boardFootLast(board.total)}
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
  const box = useRef<HTMLDivElement>(null)
  useDialogFocus(box)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      onDone(await saveName(secret, name))
    } catch (failure) {
      // The server answers in English: show its two name rules in the player's language.
      const message = failure instanceof Error ? failure.message : ''
      setError(message.includes('another name') ? t().nameRude : message.includes('16 letters') ? t().nameRules : t().nameFailed)
      setSaving(false)
    }
  }
  return (
    <div ref={box} className="overlay overlay-board" role="dialog" aria-modal="true" aria-labelledby="name-title" onPointerDown={stop}>
      <form className="board name-form" onSubmit={submit}>
        <span className="over-eyebrow">{t().nameEyebrow}</span>
        <label id="name-title" htmlFor="board-name" className="board-title">
          {t().nameTitle}
        </label>
        <p className="name-note">{t().nameNote}</p>
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
          {error || t().nameHelp}
        </p>
        <button type="submit" className="primary" disabled={saving || !name.trim()}>
          {saving ? t().nameJoining : t().nameJoin}
        </button>
        <button type="button" className="link name-skip" onClick={onSkip}>
          {t().nameSkip}
        </button>
      </form>
    </div>
  )
}
