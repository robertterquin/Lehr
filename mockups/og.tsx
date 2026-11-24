// The link preview (Messenger, Facebook, X): tonight's star over the street and the name, at 1200×630.
// Capture: headless Chrome at --window-size=1200,630 on /mockups/og.html, saved as PNG, then converted: sips -s format jpeg -s formatOptions 85 og.png --out public/og.jpg.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Ground, RUN, StarAt, Text, cream, serif } from './kit.tsx'

const W = 1200
const H = 630

function Preview() {
  return (
    <main style={{ position: 'relative', width: W, height: H, overflow: 'hidden', color: 'var(--ink)', fontFamily: 'var(--font-ui)', background: '#0a0918' }}>
      <Ground w={W} h={H} wide stage={5} />
      <StarAt x={330} size={300} top={96} locks={RUN} glow="rgba(255,170,80,0.55)" />
      <section style={{ position: 'absolute', left: 620, top: 150, width: 520, display: 'flex', flexDirection: 'column', gap: 14, textShadow: '0 2px 18px rgba(20,8,5,0.85)' }}>
        <Text style={{ font: '700 17px var(--font-ui)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>A Filipino Christmas game · every night</Text>
        <Text style={{ font: `400 150px/0.9 ${serif}` }}>Parol</Text>
        <Text style={{ fontSize: 28, lineHeight: 1.35, color: cream, textWrap: 'balance' }}>Lock the spinning rings and light tonight’s star.</Text>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)
