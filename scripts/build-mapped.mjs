import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')

// ── Slugify: lowercase, collapse non-alphanumeric runs to '-', trim edges ─────
function slugify(path) {
  return path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Token walker ──────────────────────────────────────────────────────────────
// Recurses the Token Studio JSON tree. Handles mixed nodes (a node can be BOTH
// a color token with `value`/`type` AND have child token objects).
const META = new Set(['value', 'type', '$extensions', 'description'])

function collectTokens(node, pathParts = []) {
  if (!node || typeof node !== 'object') return []
  const tokens = []

  if (node.type === 'color' && node.value !== undefined) {
    tokens.push({ slug: slugify(pathParts.join('/')), value: String(node.value), path: pathParts.join('/') })
  }

  for (const [key, child] of Object.entries(node)) {
    if (META.has(key) || !child || typeof child !== 'object') continue
    tokens.push(...collectTokens(child, [...pathParts, key]))
  }

  return tokens
}

// ── Value resolver ────────────────────────────────────────────────────────────
// Raw hex (#rrggbb or #rrggbbaa) → emit as-is.
// {Group.Step} reference → var(--alias-<group>-<step>); fail loudly if missing.
function resolveValue(value, knownAliasVars, ctx) {
  if (value.startsWith('#')) return value

  const m = value.match(/^\{([^.]+)\.(.+)\}$/)
  if (!m) {
    console.error(`ERROR [${ctx}]: Cannot parse value syntax: "${value}"`)
    process.exit(1)
  }
  const [, group, step] = m
  const aliasVar = `--alias-${group.toLowerCase()}-${step}`
  if (!knownAliasVars.has(aliasVar)) {
    console.error(`ERROR [${ctx}]: ${value} → ${aliasVar} — not found in alias layer`)
    process.exit(1)
  }
  return `var(${aliasVar})`
}

// ── Read sources ──────────────────────────────────────────────────────────────
const lightSrc = JSON.parse(readFileSync(resolve(root, 'design-tokens/Mapped/Light.json'), 'utf8'))
const darkSrc  = JSON.parse(readFileSync(resolve(root, 'design-tokens/Mapped/Dark.json'),  'utf8'))

// Build known alias var set from globals.css
const cssContent = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const knownAliasVars = new Set([...cssContent.matchAll(/--alias-[\w-]+(?=\s*:)/g)].map(m => m[0]))
console.log(`Loaded ${knownAliasVars.size} alias vars from globals.css`)

// ── Collect ───────────────────────────────────────────────────────────────────
const lightTokens = collectTokens(lightSrc)
const darkTokens  = collectTokens(darkSrc)

// ── Validate: slug collisions ─────────────────────────────────────────────────
function assertNoCollisions(tokens, label) {
  const seen = new Map()
  const bad = []
  for (const { slug, path } of tokens) {
    if (seen.has(slug)) bad.push(`  "${slug}": "${seen.get(slug)}"  vs  "${path}"`)
    else seen.set(slug, path)
  }
  if (bad.length) { console.error(`ERROR: Slug collisions in ${label}:\n${bad.join('\n')}`); process.exit(1) }
}
assertNoCollisions(lightTokens, 'Light.json')
assertNoCollisions(darkTokens,  'Dark.json')

// ── Validate: both modes have identical slugs ─────────────────────────────────
const lightSet = new Set(lightTokens.map(t => t.slug))
const darkSet  = new Set(darkTokens.map(t => t.slug))
const onlyLight = [...lightSet].filter(s => !darkSet.has(s))
const onlyDark  = [...darkSet].filter(s => !lightSet.has(s))
if (onlyLight.length || onlyDark.length) {
  if (onlyLight.length) console.error(`ERROR: In Light only:\n  ${onlyLight.join('\n  ')}`)
  if (onlyDark.length)  console.error(`ERROR: In Dark only:\n  ${onlyDark.join('\n  ')}`)
  process.exit(1)
}

// ── Resolve values ────────────────────────────────────────────────────────────
const lightResolved = lightTokens.map(t => ({ ...t, cssValue: resolveValue(t.value, knownAliasVars, `light/${t.path}`) }))
const darkResolved  = darkTokens.map(t =>  ({ ...t, cssValue: resolveValue(t.value, knownAliasVars, `dark/${t.path}`) }))

// ── src/tokens/mapped.ts ──────────────────────────────────────────────────────
const tsLines = ['export const mapped = {']
for (const { slug } of lightResolved) {
  tsLines.push(`  '${slug}': '--mapped-${slug}',`)
}
tsLines.push('} as const', '', 'export type Mapped = typeof mapped', '')
writeFileSync(resolve(root, 'src/tokens/mapped.ts'), tsLines.join('\n'))
console.log('✓ src/tokens/mapped.ts')

// ── src/tokens/index.ts ───────────────────────────────────────────────────────
writeFileSync(resolve(root, 'src/tokens/index.ts'), [
  `export { brand } from './brand'`,
  `export type { Brand } from './brand'`,
  `export { alias } from './alias'`,
  `export type { Alias } from './alias'`,
  `export { mapped } from './mapped'`,
  `export type { Mapped } from './mapped'`,
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── src/styles/globals.css ────────────────────────────────────────────────────
const SENTINEL = '/* === Mapped Light === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

const lightBlock = [
  `\n${SENTINEL}`,
  ':root {',
  ...lightResolved.map(({ slug, cssValue }) => `  --mapped-${slug}: ${cssValue};`),
  '}',
].join('\n')

const darkBlock = [
  '\n/* === Mapped Dark === */',
  '[data-theme="dark"] {',
  ...darkResolved.map(({ slug, cssValue }) => `  --mapped-${slug}: ${cssValue};`),
  '}',
  '',
].join('\n')

writeFileSync(resolve(root, 'src/styles/globals.css'), css + lightBlock + '\n' + darkBlock)
console.log('✓ src/styles/globals.css (mapped light + dark appended)')

// ── Summary ───────────────────────────────────────────────────────────────────
const groups = [...new Set(lightResolved.map(t => t.path.split('/')[0]))]
console.log(`\n${lightResolved.length} tokens across groups: ${groups.join(', ')}`)
