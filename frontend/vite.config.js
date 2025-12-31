import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/TO-DO-APP/' : '/', // GitHub Pages will serve the frontend at https://spe9110.github.io/TO-DO-APP/,
  build: {
    outDir: 'dist', // Where your build files will be placed
  },
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/api/v1': {
        target: "https://to-do-app-kpx0.onrender.com",
        changeOrigin: true
      }
    }
  }
})
