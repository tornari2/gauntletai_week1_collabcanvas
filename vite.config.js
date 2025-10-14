import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb for Firebase + Konva
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks for better caching
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'konva': ['konva', 'react-konva'],
        }
      }
    }
  }
})

