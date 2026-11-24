// The album (mockups/season.tsx): every night's star you built, Simbang Gabi's nine nights in December, one
// parol up close with its final rank, achievements, and the golden parol on Christmas Eve. Words float over the
// dimmed street like the board.
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { fetchBoard } from '../board.ts'
import { t } from '../copy.ts'
import { night as nightById, type NightId } from '../draw/nights.tsx'
import { Star } from '../draw/star.tsx'
import { ACHIEVEMENTS } from '../game/achievements.ts'
import { inNovena, novenaDates, weekdayIndex } from '../game/daily.ts'
import type { AlbumNight } from '../game/local.ts'
import { readyCard, shareOrSave, type ReadyCard } from '../share.ts'
import { count } from './board.tsx'
import { useDialogFocus } from './focus.ts'
import { Glints } from './screens.tsx'

const stop = (event: PointerEvent) => event.stopPropagation()
const dayMonth = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString(t().dateLocale, { day: 'numeric', month: 'short', timeZone: 'UTC' })
/** Simbang Gabi's album page shows from its first night to the end of December. */
const novenaSeason = (today: string) => today.slice(5) >= '12-16'

/** A small star from the album: the whole star in a circle, its tails cut off below. */
function Thumb({ entry, size }: { entry: AlbumNight; size: number }) {
  return (
    <span className="album-thumb" style={{ width: size, height: size }} aria-hidden="true">
      <span style={{ position: 'absolute', left: -size * 0.05, top: -size * 0.05 }}>
        <Star size={size * 1.1} locks={entry.locks} palette={nightById(entry.night as NightId).palette} />
      </span>
    </span>
  )
}

export function Album({ album, achieved, today, secret, back, onBack }: { album: Record<string, AlbumNight>; achieved: Record<string, string>; today: string; secret: string; back: string; onBack: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  useDialogFocus(box)
  const [open, setOpen] = useState<string | null>(null)
  const season = novenaSeason(today)
  const dates = season ? novenaDates(today) : Object.keys(album).sort().reverse()
  const lit = novenaDates(today).filter((date) => date in album).length
  const got = ACHIEVEMENTS.filter((id) => id in achieved)
  return (
    <div ref={box} className="overlay overlay-board" role="dialog" aria-modal="true" aria-labelledby="album-title" onPointerDown={stop}>
      {open && album[open] ? (
        <ParolView date={open} entry={album[open]} secret={secret} onBack={() => setOpen(null)} />
      ) : (
        <section className="board">
          <button type="button" className="board-back" autoFocus onClick={onBack}>
            <span aria-hidden="true">←</span> {back}
          </button>
          <div>
            <span className="over-eyebrow">{season ? t().albumEyebrowSeason(today.slice(0, 4)) : t().album}</span>
            <h2 id="album-title" className="board-title">
              {t().albumTitle}
            </h2>
            <p className="board-note">{season ? t().albumNovenaNote(lit) : dates.length ? t().albumAllNote(dates.length) : t().albumEmpty}</p>
          </div>
          <ul className="album-grid">
            {dates.map((date) => {
              const entry = album[date]
              const label = `${dayMonth(date)}${entry ? ` · ${nightById(entry.night as NightId).name} · ${t().rings(entry.rings)}` : ''}`
              return (
                <li key={date}>
                  {entry ? (
                    <button type="button" className="album-slot" aria-label={label} onClick={() => setOpen(date)}>
                      <Thumb entry={entry} size={84} />
                      <span className="album-date">
                        {dayMonth(date)} <b>· {entry.rings}</b>
                      </span>
                    </button>
                  ) : (
                    <span className={`album-slot is-empty${date === today ? ' is-tonight' : ''}`} aria-label={label}>
                      <span className="album-ring" />
                      <span className="album-date">{dayMonth(date)}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="album-achievements">
            <span className="over-eyebrow">{t().achievementsTitle(got.length, ACHIEVEMENTS.length)}</span>
            <ul>
              {ACHIEVEMENTS.map((id) => (
                <li key={id} className={id in achieved ? 'is-got' : undefined}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 1.2l1.9 4.2 4.6.5-3.4 3.1 1 4.5L8 11.2 3.9 13.5l1-4.5L1.5 5.9l4.6-.5z" />
                  </svg>
                  {t().achievements[id]}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

/** One parol up close: its night, its numbers, its final rank on that night's board, and Share. */
function ParolView({ date, entry, secret, onBack }: { date: string; entry: AlbumNight; secret: string; onBack: () => void }) {
  const place = nightById(entry.night as NightId)
  const starRef = useRef<HTMLDivElement>(null)
  const [rank, setRank] = useState<{ rank: number; total: number } | null>(null)
  const [card, setCard] = useState<ReadyCard | null>(null)
  useEffect(() => {
    fetchBoard(date, secret).then((board) => board.me?.rank && setRank({ rank: board.me.rank, total: board.total }), () => {})
  }, [date, secret])
  useEffect(() => {
    if (starRef.current) readyCard({ rings: entry.rings, perfects: entry.perfects, rank: rank?.rank ?? null, date, site: location.host }, starRef.current).then(setCard, () => {})
  }, [entry, date, rank])
  const nth = inNovena(date) ? novenaDates(date).indexOf(date) + 1 : null
  return (
    <section className="board parol-view">
      <button type="button" className="board-back" autoFocus onClick={onBack}>
        <span aria-hidden="true">←</span> {t().album}
      </button>
      <div ref={starRef} className="parol-view-star" aria-hidden="true">
        <Star size={220} locks={entry.locks} palette={place.palette} />
      </div>
      <span className="over-eyebrow">{t().parolEyebrow(nth, t().weekdays[weekdayIndex(date)], dayMonth(date))}</span>
      <h2 id="album-title" className="board-title">
        {place.name}
      </h2>
      <p className="parol-view-stats">
        {t().rings(entry.rings)} <span className="dot">·</span> {t().perfects(entry.perfects)}
        {rank && (
          <>
            <span className="dot">·</span>
            <b>#{count(rank.rank)}</b>
            {t().ofTotal(rank.total)}
          </>
        )}
      </p>
      <button type="button" className="primary" disabled={!card} onClick={() => card && shareOrSave(card)}>
        {t().shareThisParol}
      </button>
    </section>
  )
}

/** Christmas Eve, all nine nights lit: the night's star turns golden and becomes the album's cover. */
export function GoldenParol({ entry, date, onAlbum, onClose }: { entry: AlbumNight; date: string; onAlbum: () => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  useDialogFocus(box)
  const starRef = useRef<HTMLDivElement>(null)
  const [card, setCard] = useState<ReadyCard | null>(null)
  useEffect(() => {
    if (starRef.current) readyCard({ rings: entry.rings, perfects: entry.perfects, rank: null, date, site: location.host, golden: true }, starRef.current).then(setCard, () => {})
  }, [entry, date])
  return (
    <div ref={box} className="overlay golden" role="dialog" aria-modal="true" aria-labelledby="golden-title" onPointerDown={stop} onKeyDown={(event) => event.key === 'Escape' && onClose()}>
      <div className="rise-star golden-star" aria-hidden="true">
        <Glints size={240} />
        <div ref={starRef} className="rise-parol">
          <Star size={150} locks={entry.locks} palette={nightById(entry.night as NightId).palette} />
        </div>
      </div>
      <section className="over now">
        <span className="over-eyebrow">{t().eveEyebrow(dayMonth(date))}</span>
        <h2 id="golden-title" className="rise-title">
          {t().eveTitle}
        </h2>
        <p className="over-reason">{t().eveReason}</p>
        <p className="over-reason golden-note">{t().eveNote}</p>
        <button type="button" className="primary over-button" autoFocus onClick={onAlbum}>
          {t().openAlbum}
        </button>
        <button type="button" className="link" disabled={!card} onClick={() => card && shareOrSave(card)}>
          {t().shareGolden}
        </button>
      </section>
    </div>
  )
}
