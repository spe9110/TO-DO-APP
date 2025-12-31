import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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
