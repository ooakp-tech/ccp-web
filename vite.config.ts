import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app is served from the IIS site root (http://server/). If it ever moves
// under a virtual directory (http://server/fan/), change `base` to '/fan/' -
// the router basename and every asset URL are derived from it.
export default defineConfig({
  plugins: [react()],
  base: '/',
  // `npm run dev`: /api/... goes to the hosted ModelFeed API, so dev calls are
  // same-origin exactly like production (where IIS serves both).
  server: {
    proxy: {
      '/api': { target: 'https://velvet.love', changeOrigin: true, secure: true },
    },
  },
  build: {
    outDir: 'dist',
    // Hashed JS/CSS go to dist/static so they never mix with the hand-managed
    // images copied from public/assets to dist/assets.
    assetsDir: 'static',
  },
})
