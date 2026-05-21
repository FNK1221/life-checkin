import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/life-checkin/test/',
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: '../dist-test',
    assetsDir: 'assets',
    sourcemap: false
  }
})
