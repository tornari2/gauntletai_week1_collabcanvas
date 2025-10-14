import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: false, // Disable source maps in production for better performance
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for error logging
        drop_debugger: true,
        pure_funcs: ['console.log'] // Remove console.log in production
      }
    },
    // Code splitting and chunking
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks for better caching
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'konva': ['konva', 'react-konva'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // Target modern browsers for smaller bundle size
    target: 'es2015',
    // Optimize deps
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  // Optimize dev server (already fast locally, but ensure it stays fast)
  server: {
    warmup: {
      clientFiles: ['./src/components/*.jsx', './src/context/*.jsx']
    }
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'konva', 'react-konva', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  }
})


