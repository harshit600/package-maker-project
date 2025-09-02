import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import config from './config'
import svgr from 'vite-plugin-svgr';

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
  plugins: [react(), svgr()],
  optimizeDeps: {
    exclude: ['react-script-tag'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  base: './', // This ensures assets are loaded with relative paths
})