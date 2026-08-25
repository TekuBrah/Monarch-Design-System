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
//           Emits ONE var, --mapped-gradient-<base>-stops, holding the COLOUR
//           STOP LIST ONLY — no angle, no linear-gradient() wrapper. The
//           consumer composes whatever angle it needs:
//               linear-gradient(<angle>, var(--mapped-gradient-primary-stops))
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

// Post-condition, applied per kind. This REPLACES a check that only looked for
// leftover hex — which a brand gradient passed trivially while still emitting a
// flat page-coloured band, because toMappedStop() maps any opaque stop to
// var(--gradient-surface). That silent pass was the defect, not just the wrong
// output. Now any stop the declared kind’s resolver did not consume survives to
// here and exits: hex left in a brand value, a {reference} left in a scrim value.
function assertResolved(value, ctx, kind) {
  const leftovers = [
    ...[...value.matchAll(/#[0-9a-fA-F]{3,8}/g)].map(m => m[0]),
    ...[...value.matchAll(/\{[^}]*\}/g)].map(m => m[0]),
  ]
  if (leftovers.length) {
    console.error(
      `ERROR [${ctx}] (kind=${kind}): unresolved stop(s) ${leftovers.join(', ')} after mapping:` +
      `\n  "${value}"`
    )
    process.exit(1)
  }
  // A brand entry publishes STOPS, never a whole gradient. If the wrapper is
  // still attached the split below did not happen, and every consumer writing
  // linear-gradient(<angle>, var(--…-stops)) would emit a nested gradient that
  // silently drops the declaration.
  if (kind === 'brand' && /linear-gradient\(/i.test(value)) {
    console.error(`ERROR [${ctx}]: stops value still carries a linear-gradient() wrapper:\n  "${value}"`)
    process.exit(1)
  }
}

// Splits "linear-gradient(<angle>, <stops>)" into angle and stop list. Applied
// to the SOURCE value, where a brand entry's stops are {family} references and
// contain no nested parentheses — so a first-comma split is exact here and no
// paren matching is needed. (It would NOT be exact after resolution, once the
// stops hold var(...) calls.)
const BRAND_SHAPE = /^linear-gradient\(\s*([^,]+?)\s*,\s*([\s\S]+)\)\s*$/

// A gradient has no interaction-state axis, so the `-default` suffix the Figma
// entry inherits from the surface naming is dropped from the emitted var:
// Gradient.primary-default → --mapped-gradient-primary-stops. The SOURCE key is
// deliberately left alone so a fresh Token Studio export still matches it.
function stopsVarName(name, ctx) {
  const base = name.replace(/-default$/, '')
  if (!base) {
    console.error(`ERROR [${ctx}]: name reduces to empty after dropping "-default"`)
    process.exit(1)
  }
  return `--mapped-gradient-${base}-stops`
}

// Dropping "-default" can collide two source entries onto one var. Catch it
// here rather than letting the later declaration silently win in the CSS.
const seenVars = new Map()
function claimVar(varName, name, ctx) {
  if (seenVars.has(varName)) {
    console.error(`ERROR [${ctx}]: ${varName} already emitted by Gradient.${seenVars.get(varName)}`)
    process.exit(1)
  }
  seenVars.set(varName, name)
  return varName
}

const mappedEntries = entries.map(({ name, kind, value }) => {
  const ctx = `Gradient.${name}`

  // brand: publish the stop list alone. The angle is DELIBERATELY discarded — it
  // is a layout decision belonging to whatever paints the band, not a property
  // of the brand colours. Baking 0deg into the token forced any consumer wanting
  // another direction to restate both stops by hand, which means reaching past
  // the mapped layer — the exact bypass this tier exists to prevent.
  if (kind === 'brand') {
    const m = BRAND_SHAPE.exec(value)
    if (!m) {
      console.error(`ERROR [${ctx}]: cannot split angle from stops in:\n  "${value}"`)
      process.exit(1)
    }
    const [, angle, rawStops] = m
    const stops = rawStops.replace(/\{([a-z0-9-]+)\}/gi, (_, family) => toBrandStop(family, ctx))
    assertResolved(stops, ctx, kind)
    console.log(`  ${ctx}: angle "${angle}" dropped — composed by the consumer`)
    return { name, kind, varName: claimVar(stopsVarName(name, ctx), name, ctx), value: stops }
  }

  const mappedValue = value.replace(/#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?/g, toMappedStop)
  assertResolved(mappedValue, ctx, kind)
  return { name, kind, varName: claimVar(`--mapped-gradient-${name}`, name, ctx), value: mappedValue }
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
  '   land on the same element as :root.',
  '',
  '   A brand entry emits --mapped-gradient-<base>-stops: the COLOUR STOP LIST',
  '   ONLY, with no angle and no linear-gradient() wrapper. Consume it as',
  '',
  '       background: linear-gradient(<angle>, var(--mapped-gradient-primary-stops));',
  '',
  '   The angle is deliberately NOT in the token. Direction is a layout property',
  '   of the thing being painted — a header band, a card wash and a progress fill',
  '   want different angles from the same brand colours — while the stops are the',
  '   brand fact. Shipping 0deg inside the token left a consumer wanting 90deg no',
  '   move except restating both stops by hand, i.e. reaching past the mapped',
  '   layer into brand primitives, which is the bypass this tier exists to close.',
  '   Scrims keep their wrapper: their angle IS the Figma value being preserved. */',
  '* {',
  ...mappedEntries.map(({ varName, value }) => `  ${varName}: ${value};`),
  '}',
  '',
].join('\n')

writeFileSync(resolve(root, 'src/styles/globals.css'), css + gradientBlock)
console.log('✓ src/styles/globals.css (gradients appended)')

// ── src/tokens/gradients.ts ───────────────────────────────────────────────────

const mappedByName = new Map(mappedEntries.map(e => [e.name, e]))

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
  // A brand entry exposes stopsVar/stopsValue, a scrim exposes mappedVar/
  // mappedValue. The names differ on purpose: under `as const`,
  // gradients['primary-default'].mappedVar is a compile error, so a consumer
  // cannot reach for a whole-gradient var that no longer exists — the same
  // enforcement idiom `var` already uses to keep brand off the static tier.
  const m = mappedByName.get(name)
  if (kind === 'brand') {
    tsLines.push(`    stopsVar: '${m.varName}',`)
    tsLines.push(`    stopsValue: '${m.value}',`)
  } else {
    tsLines.push(`    mappedVar: '${m.varName}',`)
    tsLines.push(`    mappedValue: '${m.value}',`)
  }
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
  const m = mappedByName.get(name)
  console.log(`  ${m.varName}: ${m.value}`)
  if (description) console.log(`    → ${description} [${kind}]`)
}
