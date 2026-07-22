import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const src = JSON.parse(readFileSync(resolve(root, 'design-tokens/Brand/Value.json'), 'utf8'))

function slugify(path) {
  return path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const WEIGHT_MAP = { Regular: 400, Medium: 500, SemiBold: 600 }

const FONT_SIZE_MAP = { '0': 12, '1': 14, '2': 16, '3': 20, '4': 24, '5': 32, '6': 40, '7': 48, '8': 60 }

// Read known responsive vars from globals.css
const cssContent = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const knownResponsiveVars = new Set(
  [...cssContent.matchAll(/--responsive-[\w-]+(?=\s*:)/g)].map(m => m[0])
)
console.log(`Loaded ${knownResponsiveVars.size} responsive vars from globals.css`)

// ── Resolvers ─────────────────────────────────────────────────────────────────

function resolveFontWeight(ref) {
  const m = ref.match(/^\{Font\.Poppins\.Weight\.(.+)\}$/)
  if (!m) { console.error(`ERROR: Cannot parse fontWeight ref: "${ref}"`); process.exit(1) }
  const name = m[1]
  if (!(name in WEIGHT_MAP)) {
    console.error(`ERROR: Unknown weight name "${name}" — allowed: ${Object.keys(WEIGHT_MAP).join(', ')}`)
    process.exit(1)
  }
  return WEIGHT_MAP[name]
}

function resolveLineHeight(ref) {
  const m = ref.match(/^\{(.+)\}$/)
  if (!m) { console.error(`ERROR: Cannot parse lineHeight ref: "${ref}"`); process.exit(1) }
  // Split on '.' — 'line height' (space) becomes a single segment after joining
  const parts = m[1].split('.')
  const varName = `--responsive-${slugify(parts.join('/'))}`
  if (!knownResponsiveVars.has(varName)) {
    console.error(`ERROR: "${ref}" → "${varName}" not found in globals.css`)
    console.error(`  Known line-height vars:\n  ` +
      [...knownResponsiveVars].filter(v => v.includes('line-height')).join('\n  '))
    process.exit(1)
  }
  return varName
}

function resolveTextDecoration(ref) {
  const m = ref.match(/^\{textDecoration\.(.+)\}$/)
  if (!m) { console.error(`ERROR: Cannot parse textDecoration ref: "${ref}"`); process.exit(1) }
  return m[1] // 'none' | 'underline'
}

// ── Collect styles ────────────────────────────────────────────────────────────

const styles = [] // [{ className, group, props }]

// Header: responsive font-size (both mobile and desktop via var())
for (const [key, token] of Object.entries(src.header)) {
  const val = token.value
  const className = `type-header-${key}`

  const sizeVar = `--responsive-font-headings-${key}-text-size`
  if (!knownResponsiveVars.has(sizeVar)) {
    console.error(`ERROR: header.${key} → "${sizeVar}" not found in globals.css`)
    process.exit(1)
  }

  styles.push({
    className,
    group: 'header',
    props: {
      fontFamily: 'var(--font-family-primary)',
      fontWeight: resolveFontWeight(val.fontWeight),
      fontSize: `var(${sizeVar})`,
      lineHeight: `var(${resolveLineHeight(val.lineHeight)})`,
      letterSpacing: '0',
      textTransform: 'none',
      textDecoration: resolveTextDecoration(val.textDecoration),
    },
  })
}

// Body: static font-size from {fontSize.N}
for (const [key, token] of Object.entries(src.body)) {
  const val = token.value
  const className = `type-body-${key.replace('_', '-')}` // caption_link → caption-link

  const fsMatch = val.fontSize.match(/^\{fontSize\.(\d+)\}$/)
  if (!fsMatch) { console.error(`ERROR: Cannot parse fontSize ref: "${val.fontSize}"`); process.exit(1) }
  const fsIndex = fsMatch[1]
  if (!(fsIndex in FONT_SIZE_MAP)) {
    console.error(`ERROR: Unknown fontSize index "${fsIndex}"`)
    process.exit(1)
  }

  styles.push({
    className,
    group: 'body',
    props: {
      fontFamily: 'var(--font-family-primary)',
      fontWeight: resolveFontWeight(val.fontWeight),
      fontSize: `${FONT_SIZE_MAP[fsIndex]}px`,
      lineHeight: `var(${resolveLineHeight(val.lineHeight)})`,
      letterSpacing: '0',
      textTransform: 'none',
      textDecoration: resolveTextDecoration(val.textDecoration),
    },
  })
}

// Validate slug collisions
const classNames = new Set()
const collisions = []
for (const { className } of styles) {
  if (classNames.has(className)) collisions.push(className)
  else classNames.add(className)
}
if (collisions.length) {
  console.error(`ERROR: Class name collisions:\n  ${collisions.join('\n  ')}`)
  process.exit(1)
}

console.log(`Collected ${styles.length} styles (${styles.filter(s => s.group === 'header').length} header, ${styles.filter(s => s.group === 'body').length} body) — no collisions`)

// ── src/styles/typography.css ─────────────────────────────────────────────────

const cssLines = [
  '/* === Typography === */',
  ':root {',
  `  --font-family-primary: 'Poppins', sans-serif;`,
  '}',
  '',
]

for (const { className, props } of styles) {
  cssLines.push(`.${className} {`)
  cssLines.push(`  font-family: ${props.fontFamily};`)
  cssLines.push(`  font-weight: ${props.fontWeight};`)
  cssLines.push(`  font-size: ${props.fontSize};`)
  cssLines.push(`  line-height: ${props.lineHeight};`)
  cssLines.push(`  letter-spacing: ${props.letterSpacing};`)
  cssLines.push(`  text-transform: ${props.textTransform};`)
  cssLines.push(`  text-decoration: ${props.textDecoration};`)
  cssLines.push(`}`)
  cssLines.push('')
}

writeFileSync(resolve(root, 'src/styles/typography.css'), cssLines.join('\n'))
console.log('✓ src/styles/typography.css')

// ── src/tokens/typography.ts ──────────────────────────────────────────────────

const tsLines = ['export const typography = {']

for (const { className, props } of styles) {
  tsLines.push(`  '${className}': {`)
  tsLines.push(`    className: '${className}',`)
  tsLines.push(`    fontFamily: '${props.fontFamily}',`)
  tsLines.push(`    fontWeight: ${props.fontWeight},`)
  tsLines.push(`    fontSize: '${props.fontSize}',`)
  tsLines.push(`    lineHeight: '${props.lineHeight}',`)
  tsLines.push(`    letterSpacing: '${props.letterSpacing}',`)
  tsLines.push(`    textTransform: '${props.textTransform}' as const,`)
  tsLines.push(`    textDecoration: '${props.textDecoration}' as const,`)
  tsLines.push(`  },`)
}

tsLines.push('} as const', '', 'export type Typography = typeof typography', '')
writeFileSync(resolve(root, 'src/tokens/typography.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/typography.ts')

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
  // Hand-authored token modules (not part of the 5-layer pipeline) — re-exported
  // here so a full rebuild doesn't drop them from the barrel.
  `export { gradients } from './gradients'`,
  `export type { Gradients } from './gradients'`,
  `export { shadows } from './shadows'`,
  `export type { Shadows } from './shadows'`,
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nTypography classes:`)
for (const { className, props } of styles) {
  console.log(`  .${className.padEnd(28)} weight=${props.fontWeight} size=${props.fontSize}`)
}
