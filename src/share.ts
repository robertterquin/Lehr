// The share card (design P15; the gold card P18 from 100 rings): a 1080×1350 image of the star you built,
// drawn on a canvas from the end screen's own star layers, so the card shows exactly that star.
import { t } from './copy.ts'

export const CARD_W = 1080
export const CARD_H = 1350
/** The design's card is 432 wide: its numbers scale by this. */
const S = CARD_W / 432
const INK = '#f7f0e3'
const GOLD = '#ffcf7a'
const MUTED = '#c9bfe0'
const SERIF = '"Young Serif", Georgia, serif'
const UI = '"Manrope Variable", "Avenir Next", sans-serif'
const SKYLINE = 'M0 478L28 462L56 478V540H0ZM56 470L100 446L144 470V540H56ZM144 476L196 452L248 476V540H144ZM248 470L300 446L352 470V540H248ZM352 478L392 456L432 478V540H352Z'

export type CardRun = { rings: number; perfects: number; rank: number | null; date: string; site: string }

/** What goes with the image when shared: the score, the rank if it's this run's, and the link. */
export const shareText = (run: CardRun) => t().shareText(run.rings, run.rank, `https://${run.site}`)

/** Room around the star's 300×420 box: its glow spills past the box on screen, and an image would cut it off. */
const PAD = 120

const loadSvg = (svg: SVGSVGElement) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const copy = svg.cloneNode(true) as SVGSVGElement
    copy.setAttribute('viewBox', `${-PAD} ${-PAD} ${300 + 2 * PAD} ${420 + 2 * PAD}`)
    copy.setAttribute('width', String(300 + 2 * PAD))
    copy.setAttribute('height', String(420 + 2 * PAD))
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    // A data URL: the page's CSP allows data: images, not blob: ones.
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`
  })

/** The star's own layers, minus the moving ones: the ring spinning in, the lock flash, the falling sliver. */
const starLayers = (star: HTMLElement) => [...star.querySelectorAll('svg')].filter((svg) => !svg.matches('.spin-in, .lock-glow, .lock-drop'))

/** Text centred on x, in runs of [text, font, colour], as one line; a line too wide for the card (Filipino runs
 *  longer) steps its type down to fit. */
const line = (ctx: CanvasRenderingContext2D, y: number, given: [string, string, string][]) => {
  const measure = (parts: [string, string, string][]) => parts.map(([text, font]) => ((ctx.font = font), ctx.measureText(text).width))
  const room = CARD_W - 120
  const full = measure(given).reduce((a, b) => a + b, 0)
  const fit = Math.min(1, room / full)
  const parts = given.map(([text, font, colour]): [string, string, string] => [text, font.replace(/(\d+)px/, (_, px) => `${Math.floor(Number(px) * fit)}px`), colour])
  const widths = measure(parts)
  let x = CARD_W / 2 - widths.reduce((a, b) => a + b, 0) / 2
  ctx.textAlign = 'left'
  parts.forEach(([text, font, colour], i) => {
    ctx.font = font
    ctx.fillStyle = colour
    ctx.fillText(text, x, y)
    x += widths[i]
  })
}

export async function drawCard(run: CardRun, star: HTMLElement): Promise<HTMLCanvasElement> {
  const gold = run.rings >= 100
  // A canvas only draws a web font the page has loaded.
  await Promise.all([document.fonts.load(`400 70px ${SERIF}`), document.fonts.load(`700 35px ${UI}`), document.fonts.load(`400 30px ${UI}`)])
  const layers = await Promise.all(starLayers(star).map(loadSvg))

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')!

  // The sky: night blue, or the gold card's dusk running to dawn.
  const sky = gold ? ctx.createLinearGradient(0, 0, 0, CARD_H) : ctx.createRadialGradient(540, 470, 0, 540, 470, 900)
  const stops: [number, string][] = gold ? [[0, '#241a4e'], [0.45, '#3a2458'], [0.78, '#b8607a'], [1, '#f2a66a']] : [[0, '#2e2158'], [0.6, '#120f2c'], [1, '#0a0918']]
  for (const [at, colour] of stops) sky.addColorStop(at, colour)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // The wire the parol hangs from, and the rooftops along the bottom.
  ctx.save()
  ctx.scale(S, S)
  if (!gold) {
    ctx.strokeStyle = '#4a4166'
    ctx.lineWidth = 1.5
    ctx.stroke(new Path2D('M0 40C140 76 292 76 432 40M216 67V92'))
  }
  ctx.fillStyle = '#090713'
  ctx.fill(new Path2D(SKYLINE))
  ctx.restore()

  // The star with its glow; on the gold card smaller, risen, with rays.
  const size = gold ? 350 : 500
  const left = (CARD_W - size) / 2
  const top = gold ? 250 : 205
  const cx = CARD_W / 2
  const cy = top + size / 2
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gold ? 320 : 340)
  glow.addColorStop(0, gold ? 'rgba(255, 250, 240, 0.85)' : 'rgba(255, 190, 90, 0.38)')
  glow.addColorStop(gold ? 0.3 : 0.5, gold ? 'rgba(255, 231, 168, 0.4)' : 'rgba(255, 190, 90, 0.12)')
  glow.addColorStop(1, 'rgba(255, 190, 90, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  if (gold) {
    for (const [angle, length, width] of [[0, 300, 7], [90, 300, 7], [45, 210, 5], [-45, 210, 5]]) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((angle * Math.PI) / 180)
      const ray = ctx.createLinearGradient(0, -length, 0, length)
      ray.addColorStop(0, 'rgba(255, 250, 240, 0)')
      ray.addColorStop(0.5, 'rgba(255, 250, 240, 0.95)')
      ray.addColorStop(1, 'rgba(255, 250, 240, 0)')
      ctx.fillStyle = ray
      ctx.fillRect(-width / 2, -length, width, length * 2)
      ctx.restore()
    }
  }
  const pad = (PAD * size) / 300
  // The risen star burns gold-white, as on the 100-ring screen (the .rise-parol kindle).
  if (gold) ctx.filter = 'brightness(2.9) saturate(0.85) drop-shadow(0 0 14px rgba(255, 230, 160, 0.95))'
  for (const layer of layers) ctx.drawImage(layer, left - pad, top - pad, size + 2 * pad, (size * 420) / 300 + 2 * pad)
  ctx.filter = 'none'

  // Words: the name and date at the top, the score under the star, the link at the bottom.
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.font = `400 50px ${SERIF}`
  ctx.fillStyle = INK
  ctx.fillText('Parol', 60, 88)
  ctx.textAlign = 'right'
  ctx.font = `400 30px ${UI}`
  ctx.fillStyle = gold ? INK : MUTED
  const date = new Date(`${run.date}T00:00:00Z`).toLocaleDateString(t().dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  ctx.fillText(date, CARD_W - 60, 84)

  const rank: [string, string, string][] = run.rank ? [[t().cardRank(run.rank), `400 35px ${UI}`, INK]] : []
  if (gold) {
    ctx.letterSpacing = '5px'
    line(ctx, 850, [[t().cardRose, `700 30px ${UI}`, GOLD]])
    ctx.letterSpacing = '0px'
    line(ctx, 950, [[t().rings(run.rings), `400 85px ${SERIF}`, INK]])
    line(ctx, 1030, [[t().perfects(run.perfects), `700 35px ${UI}`, GOLD], ...rank])
    ctx.strokeStyle = GOLD
    ctx.lineWidth = 10
    ctx.strokeRect(5, 5, CARD_W - 10, CARD_H - 10)
  } else {
    line(ctx, 1000, [[t().cardLit(run.rings), `400 70px ${SERIF}`, INK]])
    line(ctx, 1075, [[t().perfects(run.perfects), `700 35px ${UI}`, GOLD], ...rank])
  }
  line(ctx, 1300, [[run.site, `400 30px ${UI}`, MUTED]])
  return canvas
}
