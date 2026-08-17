import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const src = JSON.parse(readFileSync(resolve(root, 'design-tokens/Brand/Value.json'), 'utf8'))

const gradientGroup = src.Gradient
if (!gradientGroup || typeof gradientGroup !== 'object') {
  console.error('ERROR: No "Gradient" group found in Brand/Value.json')
  process.exit(1)
}

// ── Collect and validate ──────────────────────────────────────────────────────

const entries = [] // [{ name, value, description }]

for (const [name, token] of Object.entries(gradientGroup)) {
  if (!token || typeof token !== 'object' || typeof token.value !== 'string') {
    console.error(`ERROR: Gradient.${name} — unexpected shape: ${JSON.stringify(token)}`)
    process.exit(1)
  }
  if (!token.value.startsWith('linear-gradient(')) {
    console.error(`ERROR: Gradient.${name} value does not start with "linear-gradient(":\n  "${token.value}"`)
    process.exit(1)
  }
  entries.push({ name, value: token.value, description: token.description ?? '' })
}

console.log(`Collected ${entries.length} gradient(s): ${entries.map(e => e.name).join(', ')}`)

// ── src/styles/globals.css ────────────────────────────────────────────────────

const SENTINEL = '/* === Gradients === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

// ── Derive the theme-aware mapped pair ────────────────────────────────────────
// The static --gradient-* pair above is hardcoded to #ffffff stops, so it fades
// to white on a dark page. --mapped-gradient-* restates the same alpha shape
// against var(--mapped-surface-page), which already flips per theme in the
// mapped layer — so ONE :root declaration is correct in both themes and there
// is no [data-theme="dark"] block to drift out of sync.
//
// Emitted here rather than by build-mapped.mjs on purpose: that script's
// resolveValue() accepts only #hex or {Group.Step} and hard-exits on anything
// else, and there is no Gradient group in Mapped/Light.json / Dark.json to
// carry these. Deriving from the same `entries` keeps the two pairs in step.

// The stops resolve through --gradient-surface rather than naming
// --mapped-surface-page directly. That indirection is what makes the pair
// surface-parameterised: --gradient-surface DEFAULTS to --mapped-surface-page
// (declared once in the block below), so with no override these gradients emit
// and resolve exactly as they always have. A consumer painting a non-page
// surface sets `--gradient-surface: var(--mapped-surface-<that surface>)` on the
// scoping element and the scrim fades into that surface instead — no seam.
// Custom properties inherit and are substituted at use site, which is why one
// declaration covers every descendant and both themes.

// Rewrites a #ffffff / #ffffffAA stop to the equivalent gradient-surface stop.
// Approved token-source-gap pattern (a): no token exists for a partial-alpha
// surface, so color-mix supplies it at Figma's actual percentage.
function toMappedStop(hex) {
  const alpha = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1
  if (alpha === 1) return 'var(--gradient-surface)'
  // Zero-alpha stops render identically regardless of hue (gradient
  // interpolation is premultiplied), so plain `transparent` is exact.
  if (alpha === 0) return 'transparent'
  const pct = Math.round(alpha * 100)
  return `color-mix(in srgb, var(--gradient-surface) ${pct}%, transparent)`
}

const mappedEntries = entries.map(({ name, value }) => {
  const mappedValue = value.replace(/#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?/g, toMappedStop)
  if (mappedValue.includes('#')) {
    console.error(`ERROR: Gradient.${name} — unconverted hex stop remains after mapping:\n  "${mappedValue}"`)
    process.exit(1)
  }
  return { name, value: mappedValue }
})

const gradientBlock = [
  `\n${SENTINEL}`,
  ':root {',
  ...entries.map(({ name, value }) => `  --gradient-${name}: ${value};`),
  '',
  '  /* The surface the mapped gradients fade into. Defaults to the page surface;',
  '     override on any scoping element to fade into that surface instead',
  '     (e.g. --gradient-surface: var(--mapped-surface-subtlest-default)). */',
  '  --gradient-surface: var(--mapped-surface-page);',
  '}',
  '',
  '/* Theme-aware equivalents — fade into --gradient-surface, not into white.',
  '   Flip automatically via --mapped-surface-page; no dark block needed.',
  '',
  '   Declared on `*`, NOT on :root, and that is load-bearing. A custom property',
  '   that references another custom property is substituted where it is',
  '   DECLARED, not where it is used — so a :root declaration bakes in :root\'s',
  '   --gradient-surface (the page surface) and descendants inherit the',
  '   already-resolved string. Overriding --gradient-surface further down then',
  '   has no effect. Measured, both themes: the :root form did not respond to an',
  '   override; this form responds on the element itself and via an ancestor.',
  '   Cost of `*`: the pair is recomputed per element, and --mapped-gradient-*',
  '   can no longer be overridden directly at an ancestor and inherited down —',
  '   --gradient-surface is the supported override point. */',
  '* {',
  ...mappedEntries.map(({ name, value }) => `  --mapped-gradient-${name}: ${value};`),
  '}',
  '',
].join('\n')

writeFileSync(resolve(root, 'src/styles/globals.css'), css + gradientBlock)
console.log('✓ src/styles/globals.css (gradients appended)')

// ── src/tokens/gradients.ts ───────────────────────────────────────────────────

const mappedByName = new Map(mappedEntries.map(e => [e.name, e.value]))

const tsLines = ['export const gradients = {']
for (const { name, value, description } of entries) {
  tsLines.push(`  '${name}': {`)
  tsLines.push(`    var: '--gradient-${name}',`)
  tsLines.push(`    value: '${value}',`)
  tsLines.push(`    mappedVar: '--mapped-gradient-${name}',`)
  tsLines.push(`    mappedValue: '${mappedByName.get(name)}',`)
  tsLines.push(`    description: '${description}',`)
  tsLines.push(`  },`)
}
tsLines.push('} as const', '', 'export type Gradients = typeof gradients', '')

writeFileSync(resolve(root, 'src/tokens/gradients.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/gradients.ts')

// ── src/tokens/index.ts ───────────────────────────────────────────────────────

writeFileSync(resolve(root, 'src/tokens/index.ts'), [
  `export { brand } from './brand'`,
  `export type { Brand } from './brand'`,
  `export { alias } from './alias'`,
  `export type { Alias } from './alias'`,
  `export { mapped } from './mapped'`,
  `export type { Mapped } from './mapped'`,
  `export { spacing, responsiveFont } from './responsive'`,
  `export type { Spacing, ResponsiveFont } from './responsive'`,
  `export { typography } from './typography'`,
  `export type { Typography } from './typography'`,
  `export { gradients } from './gradients'`,
  `export type { Gradients } from './gradients'`,
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── Summary ───────────────────────────────────────────────────────────────────
for (const { name, value, description } of entries) {
  console.log(`  --gradient-${name}: ${value}`)
  if (description) console.log(`    → ${description}`)
}
