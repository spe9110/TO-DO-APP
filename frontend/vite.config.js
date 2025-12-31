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
        target: "http://todo-backend:3000",
        // target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
