import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  resolve: {
    alias: {
      '@monarch/design-system/styles.css': resolve(__dirname, 'src/styles/package.css'),
      '@monarch/design-system': resolve(__dirname, 'src/index.ts'),
    },
  },
})
