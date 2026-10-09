import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl()
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@clerk')) return 'vendor-clerk';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('motion')) return 'vendor-motion';
            if (id.includes('@dnd-kit')) return 'vendor-dnd';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor';
          }
        }
      }
    }
  }
})
