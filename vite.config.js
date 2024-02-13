import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import config from './config'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: config.API_HOST,
        secure: false,
      },
    },
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-script-tag'],
  },
  build: {
    outDir: 'dist', // Make sure this matches your Netlify publish directory
  },
})