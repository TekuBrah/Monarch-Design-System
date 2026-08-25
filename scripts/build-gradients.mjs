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

// Two KINDS of gradient live in this group, and the kind is DECLARED in the
// token source — never inferred from the stop values. Do not reintroduce a
// heuristic here: a fully opaque stop is legitimate in a scrim, so alpha,
// opacity, and every other property of the value misfiles at least one entry.
//
//   scrim — stops are literal #hex over a surface. Emits BOTH tiers: the
//           static --gradient-<name> and the theme-aware
//           --mapped-gradient-<name> that fades into --gradient-surface.
//   brand — stops are {family} references into the mapped surface layer.
//           Emits the --mapped-gradient-<name> tier ONLY (see below).
const KINDS = new Set(['scrim', 'brand'])

const entries = [] // [{ name, kind, value, description }]

for (const [name, token] of Object.entries(gradientGroup)) {
  if (!token || typeof token !== 'object' || typeof token.value !== 'string') {
    console.error(`ERROR: Gradient.${name} — unexpected shape: ${JSON.stringify(token)}`)
    process.exit(1)
  }
  if (!token.value.startsWith('linear-gradient(')) {
    console.error(`ERROR: Gradient.${name} value does not start with "linear-gradient(":\n  "${token.value}"`)
    process.exit(1)
  }
  // A missing kind is a hard exit, not a default. Token Studio does not know
  // about this key, so a re-export that drops it MUST break the build loudly
  // rather than silently refiling every brand gradient as a scrim.
  if (!KINDS.has(token.kind)) {
    console.error(
      `ERROR: Gradient.${name} — kind is ${JSON.stringify(token.kind)}; expected one of: ${[...KINDS].join(' | ')}` +
      `\n  The kind must be declared on the token in design-tokens/Brand/Value.json.` +
      `\n  If this entry came from a fresh Token Studio export, re-apply "kind" by hand.`
    )
    process.exit(1)
  }
  entries.push({ name, kind: token.kind, value: token.value, description: token.description ?? '' })
}

console.log(`Collected ${entries.length} gradient(s): ${entries.map(e => e.name).join(', ')}`)

// ── src/styles/globals.css ────────────────────────────────────────────────────

const SENTINEL = '/* === Gradients === */'
let css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf8')
const cutAt = css.indexOf(SENTINEL)
if (cutAt !== -1) css = css.slice(0, cutAt).trimEnd() + '\n'

// Everything the mapped layer declared, harvested from the CSS it already wrote
// (the mapped block sits above this sentinel, so the truncated `css` still holds
// all of it). This mirrors build-mapped.mjs resolveValue()'s alias check: a
// reference to a token that does not exist is a hard exit here, rather than a
// var() that silently resolves to nothing at runtime.
const knownMappedVars = new Set(
  [...css.matchAll(/^[ \t]*(--mapped-[a-z0-9-]+)[ \t]*:/gim)].map(m => m[1])
)

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

// Resolves a {family} stop in a BRAND gradient to the mapped surface token for
// that family. One reference form, one target shape, no fallback: the point of
// composing from the mapped layer is that a consumer never has to reach past it
// into brand primitives to build a band.
function toBrandStop(family, ctx) {
  const v = `--mapped-surface-${family}-default`
  if (!knownMappedVars.has(v)) {
    console.error(`ERROR [${ctx}]: {${family}} → ${v} — not found in mapped layer`)
    process.exit(1)
  }
  return `var(${v})`
}

const mappedEntries = entries.map(({ name, kind, value }) => {
  const ctx = `Gradient.${name}`
  const mappedValue = kind === 'scrim'
    ? value.replace(/#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?/g, toMappedStop)
    : value.replace(/\{([a-z0-9-]+)\}/gi, (_, family) => toBrandStop(family, ctx))

  // Post-condition, applied per kind. This REPLACES a check that only looked for
  // leftover hex — which a brand gradient passed trivially while still emitting a
  // flat page-coloured band, because toMappedStop() maps any opaque stop to
  // var(--gradient-surface). That silent pass was the defect, not just the wrong
  // output. Now any stop the declared kind’s resolver did not consume survives to
  // here and exits: hex left in a brand value, a {reference} left in a scrim value.
  const leftovers = [
    ...[...mappedValue.matchAll(/#[0-9a-fA-F]{3,8}/g)].map(m => m[0]),
    ...[...mappedValue.matchAll(/\{[^}]*\}/g)].map(m => m[0]),
  ]
  if (leftovers.length) {
    console.error(
      `ERROR [${ctx}] (kind=${kind}): unresolved stop(s) ${leftovers.join(', ')} after mapping:` +
      `\n  "${mappedValue}"`
    )
    process.exit(1)
  }
  return { name, kind, value: mappedValue }
})

const gradientBlock = [
  `\n${SENTINEL}`,
  ':root {',
  ...entries.filter(e => e.kind === 'scrim').map(({ name, value }) => `  --gradient-${name}: ${value};`),
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
  '   --gradient-surface is the supported override point.',
  '',
  '   BRAND gradients (kind=brand) are emitted into this same block and have NO',
  '   --gradient-* counterpart above, deliberately. That static tier exists to',
  '   preserve Figma’s literal white scrim values; a brand band has no literal',
  '   identity to preserve, and emitting one would publish a hardcoded,',
  '   theme-blind hex pair — a sanctioned way to bypass the mapped layer, which',
  '   is the exact violation composing from mapped tokens was meant to close.',
  '   They sit on `*` rather than :root for the substitution reason above: it',
  '   keeps them correct wherever data-theme is set, not only when it happens to',
  '   land on the same element as :root. */',
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
for (const { name, kind, value, description } of entries) {
  tsLines.push(`  '${name}': {`)
  tsLines.push(`    kind: '${kind}',`)
  // Only a scrim has a static tier. Omitting var/value for a brand gradient is
  // not tidiness — with `as const` it makes gradients[<brand>].var a compile
  // error, so the type system enforces what the CSS emission already decided:
  // there is no theme-blind hex form of a brand band to reach for.
  if (kind === 'scrim') {
    tsLines.push(`    var: '--gradient-${name}',`)
    tsLines.push(`    value: '${value}',`)
  }
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
  `export { shadows } from './shadows'`,
  `export type { Shadows } from './shadows'`,
  '',
].join('\n'))
console.log('✓ src/tokens/index.ts')

// ── Summary ───────────────────────────────────────────────────────────────────
// The summary reports the var that was actually emitted for each kind — a brand
// gradient has no --gradient-* line to print.
for (const { name, kind, value, description } of entries) {
  if (kind === 'scrim') console.log(`  --gradient-${name}: ${value}`)
  console.log(`  --mapped-gradient-${name}: ${mappedByName.get(name)}`)
  if (description) console.log(`    → ${description} [${kind}]`)
}
