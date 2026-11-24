import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/young-serif/400.css'
import './index.css'
import App from './App.tsx'

// Offline: once loaded, the game opens and plays without a connection (public/sw.js). Production only, so
// development always serves fresh code.
if (import.meta.env.PROD && 'serviceWorker' in navigator) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
