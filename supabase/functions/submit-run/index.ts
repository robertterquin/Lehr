// Records a finished run on tonight's board. The phone sends only the day and its taps; this replays them with
// the game's own engine (src/game), so the score is the server's, never the phone's.
// Deploy: npx supabase functions deploy submit-run --project-ref fiteuuuyqfnvqjuihkgm
import { checkRun } from '../../../src/game/check.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const MAX_BYTES = 512_000

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (request.method !== 'POST') return reply(405, { message: 'Send a run with POST' })

  const text = await request.text()
  if (text.length > MAX_BYTES) return reply(413, { message: 'That run is too long' })
  let body: { secret?: unknown }
  try {
    body = JSON.parse(text)
  } catch {
    return reply(400, { message: 'That run is not JSON' })
  }
  const { secret } = body
  if (typeof secret !== 'string' || secret.length < 32 || secret.length > 64) return reply(400, { message: 'Missing player' })

  let run
  try {
    run = checkRun(body)
  } catch (error) {
    return reply(422, { message: error instanceof Error ? error.message : 'That run does not replay' })
  }

  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const saved = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/record_run`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_secret: secret, p_day: run.day, p_rings: run.rings, p_perfects: run.perfects, p_inputs: run.inputs }),
  })
  if (!saved.ok) {
    console.error('record_run failed', saved.status, await saved.text())
    return reply(502, { message: 'The board could not save that run' })
  }
  return reply(200, await saved.json())
})
