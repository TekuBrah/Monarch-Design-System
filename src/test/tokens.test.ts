/* Token-value coverage — Gate 34.
 *
 * SCOPE, AND WHY IT IS THIS AND NOT MORE. Before this file, nothing asserted a
 * token RESOLVES to anything; the only guard on the pipeline was CI's drift
 * check, which proves the generated files match the generator, not that what
 * the generator produced is usable. An unresolved var() yields the empty
 * string — no error, no warning, no visible symptom except an unstyled
 * element — so resolution is the failure mode with the worst signal-to-noise
 * and it is covered exhaustively here (every --mapped-* token, both themes).
 *
 * DELIBERATE EXCLUSIONS
 *   - Exact colour values. Asserting `--mapped-surface-page === '#ffffff'`
 *     re-states the token source in a second place; the next legitimate Figma
 *     change then fails a test that was only ever a copy. Nothing here pins a
 *     hex. What is pinned is STRUCTURE: does it resolve, does it flip, is it
 *     declared in both themes.
 *   - Contrast ratios. They belong to a component plus a pairing, not to a
 *     token in isolation, and the repo measures them in a real browser
 *     (CLAUDE.md, Verification discipline) because rendered and computed
 *     figures differ.
 *   - --brand-*, --spacing-*, --responsive-* as separate suites. They are
 *     already covered transitively: every --mapped-* resolves THROUGH them, so
 *     a broken brand primitive fails these tests at the mapped token that
 *     consumes it, naming the missing link.
 *   - The @media (min-width: 768px) responsive-font override. It redeclares 14
 *     --responsive-font-* tokens that no --mapped-* consumes; nothing in the
 *     colour graph depends on viewport.
 *   - "Zero --alias-* in component CSS", which the gate brief proposed. It
 *     would fail today on 22 references across 5 files, ALL of them legitimate:
 *     CLAUDE.md's pairing rule permits a both-halves-alias pair (theme-
 *     invariant by construction) and Badge / Chips / HeaderBg / StatusBar /
 *     TrendIndicator use exactly that. The rule is about MIXING layers, not
 *     about alias itself.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import {
  readGlobals,
  parseBlocks,
  darkBlock,
  environment,
  resolveToken,
  resolveValue,
  relativeLuminance,
  type CssBlock,
} from './tokenCss'

const blocks = readGlobals()
const light = environment(blocks, 'light')
const dark = environment(blocks, 'dark')

const mappedNames = [...light.keys()].filter(n => n.startsWith('--mapped-')).sort()

/** Collect failures and assert once, so a failure names every offender. */
function failures<T>(items: T[], check: (item: T) => string | null): string[] {
  return items.map(i => check(i)).filter((m): m is string => m !== null)
}

describe('token resolution', () => {
  it('resolves every --mapped-* token to a non-empty value in light', () => {
    expect(mappedNames.length).toBeGreaterThan(0)
    const bad = failures(mappedNames, name => {
      try {
        const value = resolveToken(name, light)
        return value === '' ? `${name} resolves to the empty string` : null
      } catch (e) {
        return `${name}: ${(e as Error).message}`
      }
    })
    expect(bad).toEqual([])
  })

  it('resolves every --mapped-* token to a non-empty value in dark', () => {
    const bad = failures(mappedNames, name => {
      try {
        const value = resolveToken(name, dark)
        return value === '' ? `${name} resolves to the empty string` : null
      } catch (e) {
        return `${name}: ${(e as Error).message}`
      }
    })
    expect(bad).toEqual([])
  })

  it('resolves every declared custom property in both themes, with no cycles', () => {
    const bad: string[] = []
    for (const [theme, env] of [['light', light], ['dark', dark]] as const) {
      for (const name of env.keys()) {
        try {
          resolveToken(name, env)
        } catch (e) {
          bad.push(`${theme} ${name}: ${(e as Error).message}`)
        }
      }
    }
    expect(bad).toEqual([])
  })
})

describe('theme parity', () => {
  it('declares the same token names in the light and dark mapped blocks', () => {
    const darkNames = new Set(darkBlock(blocks)!.declarations.map(d => d[0]))
    // The light counterpart is the :root block that declares --mapped-* names.
    const lightBlock = blocks.find(
      b => b.selector === ':root' && b.declarations.some(d => d[0].startsWith('--mapped-')),
    )!
    const lightNames = new Set(lightBlock.declarations.map(d => d[0]))

    const onlyLight = [...lightNames].filter(n => !darkNames.has(n)).sort()
    const onlyDark = [...darkNames].filter(n => !lightNames.has(n)).sort()
    expect({ onlyLight, onlyDark }).toEqual({ onlyLight: [], onlyDark: [] })
  })

  it('declares only --mapped-* tokens inside [data-theme="dark"]', () => {
    // The cascade contract: --alias-*, --brand-*, --spacing-*, --shadow-* and
    // the static --gradient-* tier never dark-flip. Components rely on that to
    // build theme-invariant colour pairs; a non-mapped name appearing here
    // would silently start flipping one half of every such pair.
    const strays = darkBlock(blocks)!
      .declarations.map(d => d[0])
      .filter(n => !n.startsWith('--mapped-'))
      .sort()
    expect(strays).toEqual([])
  })
})

describe('theme-flip semantics', () => {
  const flips = (name: string) => resolveToken(name, light) !== resolveToken(name, dark)

  const onColor = mappedNames.filter(n => n.includes('on-color'))

  it('keeps every on-color token on the light side of the ramp in both themes', () => {
    // These describe content sitting on a FIXED coloured surface, which does
    // not follow the app theme, so a dark binding is a semantic error however
    // it arrived. The whole family was once bound to Foundations.black in
    // Mapped/Dark.json (logged E-3); Badge `default` measured contrast 1.03.
    //
    // The threshold is derived, not chosen to fit: measured at Gate 34, the
    // LOWEST relative luminance across all 53 on-color tokens in both themes
    // is 0.2935 (--mapped-text-disabled-on-color in dark), while E-3's defect
    // value #0d0f11 sits at 0.0047. 0.15 has roughly 2x headroom above every
    // legitimate value and 30x below the defect it exists to catch.
    //
    // NOT asserted here: that these tokens are theme-INVARIANT. Four of the 53
    // do flip — the two Interactive -hover/-pressed surfaces deliberately (set
    // to Figma's Inverse-variant dark values in the v1.6.0 repair) and the
    // text/icon disabled pair unexplained. Writing the stricter assertion
    // would mean either changing token bindings, which is a Figma-source
    // decision, or carrying a four-name exception list, which is the kind of
    // hand-maintained array that rots. Reported instead.
    expect(onColor.length).toBeGreaterThan(0)

    const unparseable: string[] = []
    const tooDark: string[] = []

    for (const name of onColor) {
      for (const [theme, env] of [['light', light], ['dark', dark]] as const) {
        const value = resolveToken(name, env)
        const luminance = relativeLuminance(value)
        if (luminance === null) unparseable.push(`${name} (${theme}): ${value}`)
        else if (luminance < 0.15) tooDark.push(`${name} (${theme}): ${value} L=${luminance.toFixed(4)}`)
      }
    }

    // Fail on unparseable rather than skipping, so the test cannot go vacuous
    // by every value quietly becoming something luminance cannot read.
    expect({ unparseable, tooDark }).toEqual({ unparseable: [], tooDark: [] })
  })

  it('keeps every pure-white on-color token white in both themes', () => {
    // Sharper than the luminance floor and derived the same way — by value,
    // not by a name list. E-3 turned #ffffff into #0d0f11; this fails on any
    // drift off white at all, including a drift to a light grey that the
    // luminance floor would still accept.
    const whites = onColor.filter(n => resolveToken(n, light).toLowerCase() === '#ffffff')
    expect(whites.length).toBeGreaterThan(0)
    const drifted = failures(whites, n =>
      resolveToken(n, dark).toLowerCase() === '#ffffff' ? null : `${n} is ${resolveToken(n, dark)} in dark`,
    )
    expect(drifted).toEqual([])
  })

  it('flips the page chrome between themes', () => {
    // One token per family named in the cascade contract (surface / text /
    // icon / border). If the dark block stopped being applied at all — a
    // selector change, a lost block, a build script writing light values into
    // it — every one of these goes identical while the resolution tests above
    // stay green.
    const chrome = [
      '--mapped-surface-page',
      '--mapped-surface-subtlest-default',
      '--mapped-text-default-default',
      '--mapped-icon-default-default',
      '--mapped-border-default-default',
    ]
    const stuck = failures(chrome, n => (flips(n) ? null : `${n} is identical in both themes`))
    expect(stuck).toEqual([])
  })
})

describe('gradient emission', () => {
  const starBlock = blocks.find(b => b.selector === '*')!
  const starNames = starBlock.declarations.map(d => d[0]).sort()

  it('emits every --mapped-gradient-* on * rather than :root', () => {
    // Load-bearing, not stylistic: a custom property referencing another is
    // substituted where it is DECLARED, so a :root declaration bakes in
    // :root's --gradient-surface and any override further down does nothing.
    // ToastMobile sets data-theme="dark" on a DESCENDANT div — exactly the
    // case a :root declaration gets wrong.
    expect(starNames.length).toBeGreaterThan(0)
    expect(starNames.filter(n => n.startsWith('--mapped-gradient-'))).toEqual(starNames)

    const onRoot = blocks
      .filter(b => b.selector === ':root')
      .flatMap(b => b.declarations.map(d => d[0]))
      .filter(n => n.startsWith('--mapped-gradient-'))
    expect(onRoot).toEqual([])
  })

  it('resolves the brand endpoint pair to a bare colour in both themes', () => {
    // Each endpoint holds ONE colour: no angle, no stop position, no
    // linear-gradient() wrapper. That is the v1.9.0 contract consumers compose
    // against; anything reappearing in the value breaks every call site.
    for (const name of ['--mapped-gradient-primary-from', '--mapped-gradient-primary-to']) {
      for (const [theme, env] of [['light', light], ['dark', dark]] as const) {
        const value = resolveToken(name, env)
        expect(value, `${name} in ${theme}`).not.toBe('')
        expect(value, `${name} in ${theme}`).not.toMatch(/linear-gradient|deg|%/)
      }
    }
  })

  it('re-resolves the scrim gradients per theme with no dark block', () => {
    // The scrims carry no [data-theme="dark"] override by design — they fade
    // into --gradient-surface, which defaults to --mapped-surface-page and
    // flips in the mapped layer. If that indirection were ever flattened to a
    // literal, these would stop responding to the theme silently.
    for (const name of ['--mapped-gradient-default', '--mapped-gradient-subtle']) {
      expect(resolveToken(name, light), name).not.toBe(resolveToken(name, dark))
    }
  })
})

describe('component consumption', () => {
  const TOKEN_PREFIX = /^--(mapped|alias|brand|spacing|responsive|gradient|shadow|font)-/

  function componentCssFiles(): string[] {
    const root = resolve(process.cwd(), 'src/components')
    const out: string[] = []
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = join(root, entry.name)
      for (const f of readdirSync(dir)) if (f.endsWith('.css')) out.push(join(dir, f))
    }
    return out.sort()
  }

  it('references only design-system tokens that are actually declared', () => {
    // A renamed or deleted token is invisible today: var(--typo) yields the
    // empty string and the element renders unstyled with no error anywhere.
    // Component-local properties (--btn-bg, --menu-width, --ring-center-y) are
    // deliberately out of scope — they are declared in the component's own CSS
    // or set inline from its .tsx, and neither is a token-layer fact.
    const declared = new Set<string>()
    for (const file of ['src/styles/globals.css', 'src/styles/typography.css']) {
      const parsed: CssBlock[] = parseBlocks(readFileSync(resolve(process.cwd(), file), 'utf8'))
      for (const b of parsed) for (const [name] of b.declarations) declared.add(name)
    }

    const files = componentCssFiles()
    expect(files.length).toBeGreaterThan(0)

    const bad: string[] = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const match of text.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
        const name = match[1]
        if (TOKEN_PREFIX.test(name) && !declared.has(name)) {
          const shown = file.replace(/\\/g, '/').split('/src/').pop()
          bad.push(`${shown}: ${name}`)
        }
      }
    }
    expect([...new Set(bad)].sort()).toEqual([])
  })
})

describe('resolver self-check', () => {
  it('throws on an undeclared token rather than yielding the empty string', () => {
    // Guards the guard. If resolveValue ever started returning '' for a missing
    // name, every resolution test above would pass vacuously.
    expect(() => resolveValue('var(--nope)', new Map())).toThrow(/undeclared token --nope/)
    expect(resolveValue('var(--nope, red)', new Map())).toBe('red')
  })

  it('throws on a reference cycle rather than running away', () => {
    const env = new Map([
      ['--a', 'var(--b)'],
      ['--b', 'var(--a)'],
    ])
    expect(() => resolveToken('--a', env)).toThrow(/cycle/)
  })
})
