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
  server: {
    port: 5175,
    // Add proxy configuration here
    proxy: {
      '/v1': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
        });
      },
    }
    },
  },
})