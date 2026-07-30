import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dts({
      entryRoot: 'src',
      include: ['src'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MonarchDesignSystem',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
  },
})
