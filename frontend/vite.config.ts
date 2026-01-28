/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor'
            }
            if (id.includes('dompurify')) {
              return 'dompurify'
            }
          }
          // Split contexts into separate chunk since they're used everywhere
          if (id.includes('/context/')) {
            return 'contexts'
          }
          // Split utilities into separate chunk
          if (id.includes('/utils/') || id.includes('/constants/')) {
            return 'utils'
          }
          return undefined
        },
      },
    },
    // Target modern browsers for smaller bundles
    target: 'es2022',
    // Minification settings for optimal bundle size
    minify: 'esbuild',
    // Reasonable chunk size warning
    chunkSizeWarningLimit: 300,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
