import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],
          'konva': ['konva', 'react-konva'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    target: 'es2015'
  },
  server: {
    warmup: {
      clientFiles: ['./src/components/*.jsx', './src/context/*.jsx']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'konva', 'react-konva', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database']
  }
})

