// Tonight's board on Supabase, over plain fetch. Reads go through the board() and set_name() database functions;
// a finished run goes to the submit-run edge function, which replays it. With no Supabase settings (.env.local)
// the board is simply off and the game plays as before.

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const BOARD_ON = Boolean(URL && KEY)

export type BoardRow = { rank: number; name: string | null; rings: number; me: boolean }
export type Board = {
  /** Players who lit that night's star. */
  total: number
  top: BoardRow[]
  /** This device's player: null before its first run or name. rank and rings are null with no run that day. */
  me: { name: string | null; rank: number | null; rings: number | null } | null
}
/** Where a run left you: your best tonight, its rank, the rank before it (null on your first run) and the total. */
export type Placed = { rings: number; rank: number; before: number | null; total: number }

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${URL}${path}`, {
    method: 'POST',
    headers: { apikey: KEY!, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message ?? 'The board can’t be reached right now')
  return data as T
}

export const fetchBoard = (day: string, secret: string) => post<Board>('/rest/v1/rpc/board', { p_day: day, p_secret: secret })
export const saveName = (secret: string, name: string) => post<string>('/rest/v1/rpc/set_name', { p_secret: secret, p_name: name })
export const submitRun = (secret: string, day: string, inputs: unknown[]) => post<Placed>('/functions/v1/submit-run', { secret, day, inputs })
