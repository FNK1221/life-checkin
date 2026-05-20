import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/life-checkin/',
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
