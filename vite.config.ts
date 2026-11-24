import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Link previews need absolute URLs. On Vercel this is the production domain (a custom domain, once added, takes over).
const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
const site = production ? `https://${production}` : 'http://localhost:5174'

export default defineConfig({
  plugins: [react(), { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', site) }],
})
