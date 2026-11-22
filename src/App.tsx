import { getManilaDate } from './game/daily.ts'

/** Phase 1 placeholder: the night sky, the name and today's date in Manila, until the game screens arrive. */
export default function App() {
  const today = new Date(`${getManilaDate()}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  return (
    <main className="night">
      <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 6L61 38H95L67 58L78 92L50 71L22 92L33 58L5 38H39Z" fill="none" stroke="#ffd27a" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="50" cy="52" r="7" fill="#ffd27a" />
      </svg>
      <p className="date">{today}</p>
      <h1 className="wordmark">Parol</h1>
      <p className="tagline">Lock each spinning ring onto the one inside it and light tonight’s star.</p>
    </main>
  )
}
