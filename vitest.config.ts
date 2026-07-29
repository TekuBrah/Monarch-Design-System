import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// Kept separate from vite.config.ts on purpose:
//  - Phase 2.3 adds a library-build config to vite.config.ts; test settings
//    shouldn't entangle with that.
//  - A `test` block in vite.config.ts would force the production config to
//    import from 'vitest/config' (or carry a /// <reference types="vitest" />),
//    making the app build depend on test tooling.
// svgr is included because components pull icons in as SVG modules (Icon/Logo),
// so the pattern scales past Button without another config change.
export default defineConfig({
  plugins: [react(), svgr()],
  test: {
    environment: 'jsdom',
    // Explicit imports (`import { describe, it, expect } from 'vitest'`) instead
    // of globals — keeps tsconfig.app.json free of a "types": ["vitest/globals"]
    // entry, since it already typechecks everything under src/.
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
