// The link preview (Messenger, Facebook, X): tonight's star over the street and the name, at 1200×630.
// Capture: headless Chrome at --window-size=1200,630 on /mockups/og.html, saved as PNG, then converted: sips -s format jpeg -s formatOptions 85 og.png --out public/og.jpg.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import '../src/index.css'
import { NIGHTS } from '../src/draw/nights.tsx'
import { Panorama } from '../src/draw/panorama.tsx'
import { Star } from '../src/draw/star.tsx'

const W = 1200
const H = 630
const night = NIGHTS[6]
/** A run of 24 rings, a miss now and then. */
const RUN = Array.from({ length: 24 }, (_, i) => (i % 7 === 3 ? 4 : i === 20 ? -6 : 0))
const line = { margin: 0 }

function Preview() {
  return (
    <main style={{ position: 'relative', width: W, height: H, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0f26 0%, #121a3d 42%, #2b1a3a 72%, #5a2f22 100%)' }} />
      <div style={{ position: 'absolute', left: -100, right: -100, bottom: -60, height: H * 0.45, background: 'radial-gradient(closest-side, rgba(255,150,70,0.45), transparent)' }} />
      <Panorama night={night} stage={5} width={W} height={H} />
      <div style={{ position: 'absolute', left: 330 - 150, top: 96 }}>
        <div style={{ position: 'absolute', left: -105, top: -90, width: 510, height: 480, background: 'radial-gradient(closest-side, rgba(255,170,80,0.55), transparent)' }} />
        <Star size={300} locks={RUN} palette={night.palette} />
      </div>
      <section style={{ position: 'absolute', left: 620, top: 150, width: 520, display: 'flex', flexDirection: 'column', gap: 14, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <p style={{ ...line, font: '700 17px var(--font-ui)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>A Filipino Christmas game · every night</p>
        <p style={{ ...line, font: '400 150px/0.9 var(--font-display)' }}>Parol</p>
        <p style={{ ...line, fontSize: 28, lineHeight: 1.35, color: '#e8d9c8', textWrap: 'balance' }}>Lock the spinning rings and light tonight’s star.</p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)
