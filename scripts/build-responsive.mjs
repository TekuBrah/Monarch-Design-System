import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')

function slugify(path) {
  return path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const META = new Set(['value', 'type', '$extensions', 'description'])

// Walk a Token Studio tree collecting type:"number" tokens.
function collectNumberTokens(node, pathParts = []) {
  if (!node || typeof node !== 'object') return []
  const tokens = []
  if (node.type === 'number' && node.value !== undefined) {
    tokens.push({ slug: slugify(pathParts.join('/')), value: node.value, path: pathParts.join('/') })
  }
  for (const [key, child] of Object.entries(node)) {
    if (META.has(key) || !child || typeof child !== 'object') continue
    tokens.push(...collectNumberTokens(child, [...pathParts, key]))
  }
  return tokens
}

// ── Read sources ──────────────────────────────────────────────────────────────
const desktopSrc = JSON.parse(readFileSync(resolve(root, 'design-tokens/Responsive/Desktop.json'), 'utf8'))
const mobileSrc  = JSON.parse(readFileSync(resolve(root, 'design-tokens/Responsive/Mobile.json'), 'utf8'))

// Get known brand scale vars from globals.css (built by build-brand-colors.mjs)
const cssContent = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const knownScaleVars = new Set([...cssContent.matchAll(/--brand-scale-[\w-]+(?=\s*:)/g)].map(m => m[0]))
console.log(`Loaded ${knownScaleVars.size} scale vars from globals.css`)

// ── Spacing ───────────────────────────────────────────────────────────────────
// spacing group is identical in both files — use Mobile (authoritative base).
const spacingEntries = [] // [{ step, cssValue }]

for (const [step, token] of Object.entries(mobileSrc.spacing || {})) {
  if (!token || typeof token !== 'object') continue

  let cssValue
  if (step === 'none' || (typeof token.value === 'number' && token.value === 0)) {
    cssValue = '0'
  } else if (typeof token.value === 'string') {
    const m = token.value.match(/^\{Scale\.(.+)\}$/)
    if (!m) {
      console.error(`ERROR: spacing[${step}]: cannot parse ref "${token.value}"`)
      process.exit(1)
    }
    const scaleVar = `--brand-scale-${m[1]}`
    if (!knownScaleVars.has(scaleVar)) {
      console.error(`ERROR: spacing[${step}] → ${scaleVar} — not found in globals.css`)
      process.exit(1)
    }
    cssValue = `var(${scaleVar})`
  } else {
    console.error(`ERROR: spacing[${step}]: unexpected value type: ${JSON.stringify(token.value)}`)
    process.exit(1)
  }

  spacingEntries.push({ step, cssValue })
}

console.log(`Spacing: ${spacingEntries.length} steps resolved`)

// ── Font tokens ───────────────────────────────────────────────────────────────
const mobileFontTokens  = collectNumberTokens(mobileSrc.Font  || {}, ['Font'])
const desktopFontTokens = collectNumberTokens(desktopSrc.Font || {}, ['Font'])

// Validate slug collisions
function assertNoCollisions(tokens, label) {
  const seen = new Map()
  const bad = []
  for (const { slug, path } of tokens) {
    if (seen.has(slug)) bad.push(`  "${slug}": "${seen.get(slug)}"  vs  "${path}"`)
    else seen.set(slug, path)
  }
  if (bad.length) { console.error(`ERROR: Slug collisions in ${label}:\n${bad.join('\n')}`); process.exit(1) }
}
assertNoCollisions(mobileFontTokens,  'Mobile Font')
assertNoCollisions(desktopFontTokens, 'Desktop Font')

// Validate symmetric slug sets
const mobileSet  = new Set(mobileFontTokens.map(t => t.slug))
const desktopSet = new Set(desktopFontTokens.map(t => t.slug))
const onlyMobile  = [...mobileSet].filter(s => !desktopSet.has(s))
const onlyDesktop = [...desktopSet].filter(s => !mobileSet.has(s))
if (onlyMobile.length || onlyDesktop.length) {
  if (onlyMobile.length)  console.error(`ERROR: In Mobile only:\n  ${onlyMobile.join('\n  ')}`)
  if (onlyDesktop.length) console.error(`ERROR: In Desktop only:\n  ${onlyDesktop.join('\n  ')}`)
  process.exit(1)
}

// Compute diff: tokens where desktop value differs from mobile
const desktopMap = new Map(desktopFontTokens.map(t => [t.slug, t.value]))
const diffTokens = mobileFontTokens
  .filter(t => desktopMap.get(t.slug) !== t.value)
  .map(t => ({ slug: t.slug, desktopValue: desktopMap.get(t.slug) }))

console.log(`Font: ${mobileFontTokens.length} tokens, ${diffTokens.length} differ across breakpoints`)

// ── src/styles/globals.css ────────────────────────────────────────────────────
const SENTINEL = '/* === Spacing === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

const spacingBlock = [
  `\n${SENTINEL}`,
  ':root {',
  ...spacingEntries.map(({ step, cssValue }) => `  --spacing-${step}: ${cssValue};`),
  '}',
].join('\n')

const fontBaseBlock = [
  '\n/* === Responsive Font === */',
  ':root {',
  ...mobileFontTokens.map(t => `  --responsive-${t.slug}: ${t.value}px;`),
  '}',
].join('\n')

const fontMediaBlock = [
  '\n@media (min-width: 768px) {',
  '  :root {',
  ...diffTokens.map(t => `    --responsive-${t.slug}: ${t.desktopValue}px;`),
  '  }',
  '}',
  '',
].join('\n')

writeFileSync(
  resolve(root, 'src/styles/globals.css'),
  css + spacingBlock + '\n' + fontBaseBlock + '\n' + fontMediaBlock
)
console.log('✓ src/styles/globals.css (spacing + responsive font appended)')

// ── src/tokens/responsive.ts ──────────────────────────────────────────────────
const tsLines = [
  'export const spacing = {',
  ...spacingEntries.map(({ step }) => `  '${step}': '--spacing-${step}',`),
  '} as const',
  '',
  'export type Spacing = typeof spacing',
  '',
  'export const responsiveFont = {',
  ...mobileFontTokens.map(t => `  '${t.slug}': '--responsive-${t.slug}',`),
  '} as const',
  '',
  'export type ResponsiveFont = typeof responsiveFont',
  '',
]
writeFileSync(resolve(root, 'src/tokens/responsive.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/responsive.ts')

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
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nSpacing: ${spacingEntries.length} steps`)
console.log(`Font: ${mobileFontTokens.length} tokens — ${diffTokens.length} responsive overrides in @media (min-width: 768px)`)
if (diffTokens.length) {
  console.log('  ' + diffTokens.map(t => `--responsive-${t.slug}`).join('\n  '))
}
