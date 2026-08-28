/* A static resolver for the generated token CSS, used by tokens.test.ts.
 *
 * WHY STATIC AND NOT getComputedStyle. `vitest.config.ts` sets no `test.css`
 * option, so CSS imports are stubbed and no stylesheet is ever applied in
 * jsdom — nothing in this suite can read a resolved custom property from the
 * DOM. Parsing the generated file is not a workaround for that; it is the
 * stronger check, because it resolves the whole var() chain deterministically
 * and reports WHICH link is missing rather than the empty string a browser
 * hands back.
 *
 * Declarations are collected BY SELECTOR, not by assuming `:root`. The
 * gradient layer emits `--mapped-gradient-*` on `*` deliberately (a custom
 * property that references another is substituted where it is DECLARED, so a
 * `:root` declaration bakes in `:root`'s `--gradient-surface`). A `:root`-only
 * read would return nothing for those four and look like a failure.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface CssBlock {
  /** The selector this block was written against, e.g. `:root`, `*`. */
  selector: string
  /** Enclosing at-rules, e.g. `['@media (min-width: 768px)']`. */
  context: string[]
  declarations: Array<[string, string]>
}

const GLOBALS = resolve(process.cwd(), 'src/styles/globals.css')
const DARK_SELECTOR = '[data-theme="dark"]'

/** Selectors whose custom properties apply to every element in either theme. */
const UNIVERSAL = [':root', '*']

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function parseDeclarations(body: string): Array<[string, string]> {
  const out: Array<[string, string]> = []
  for (const part of body.split(';')) {
    const i = part.indexOf(':')
    if (i < 0) continue
    const name = part.slice(0, i).trim()
    if (!name.startsWith('--')) continue
    out.push([name, part.slice(i + 1).trim()])
  }
  return out
}

/**
 * Brace-depth scan that keeps a selector stack, so a `:root` nested inside an
 * `@media` is not confused with a top-level one. The generated files nest at
 * most one level, but the stack is what makes that provable rather than assumed.
 */
export function parseBlocks(css: string): CssBlock[] {
  const clean = stripComments(css)
  const blocks: CssBlock[] = []
  const stack: string[] = []
  let buf = ''

  for (const ch of clean) {
    if (ch === '{') {
      stack.push(buf.trim().replace(/\s+/g, ' '))
      buf = ''
    } else if (ch === '}') {
      const selector = stack.pop()
      if (selector !== undefined && !selector.startsWith('@')) {
        blocks.push({
          selector,
          context: stack.filter(s => s.startsWith('@')),
          declarations: parseDeclarations(buf),
        })
      }
      buf = ''
    } else {
      buf += ch
    }
  }
  return blocks
}

export function readGlobals(): CssBlock[] {
  return parseBlocks(readFileSync(GLOBALS, 'utf8'))
}

/** The block a theme override lives in, or undefined if there is none. */
export function darkBlock(blocks: CssBlock[]): CssBlock | undefined {
  return blocks.find(b => b.selector === DARK_SELECTOR && b.context.length === 0)
}

/** Every name declared anywhere in the file, regardless of selector or theme. */
export function allDeclaredNames(blocks: CssBlock[]): Set<string> {
  return new Set(blocks.flatMap(b => b.declarations.map(d => d[0])))
}

/**
 * The custom properties in force for one theme, later declarations winning.
 * `[data-theme="dark"]` has the same specificity as `:root` and is emitted
 * after it, so appending it last is the cascade, not a shortcut.
 */
export function environment(blocks: CssBlock[], theme: 'light' | 'dark'): Map<string, string> {
  const map = new Map<string, string>()
  for (const b of blocks) {
    if (b.context.length > 0) continue // @media overrides are viewport-conditional
    const universal = UNIVERSAL.includes(b.selector)
    const dark = b.selector === DARK_SELECTOR
    if (!universal && !(theme === 'dark' && dark)) continue
    for (const [name, value] of b.declarations) map.set(name, value)
  }
  return map
}

export class ResolveError extends Error {}

/**
 * Substitute every `var()` in `value` against `env`, honouring fallbacks.
 * Throws rather than returning '' — the empty string is precisely the symptom
 * this suite exists to make loud.
 */
export function resolveValue(value: string, env: Map<string, string>, seen: Set<string> = new Set()): string {
  let out = value
  let guard = 0

  while (out.includes('var(')) {
    if (guard++ > 200) throw new ResolveError(`runaway substitution in: ${value}`)

    const start = out.indexOf('var(')
    let depth = 0
    let end = -1
    for (let i = start + 3; i < out.length; i++) {
      if (out[i] === '(') depth++
      else if (out[i] === ')') {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
    if (end < 0) throw new ResolveError(`unbalanced var() in: ${value}`)

    const inner = out.slice(start + 4, end)
    const comma = inner.indexOf(',')
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim()
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim()

    if (seen.has(name)) throw new ResolveError(`cycle through ${name}`)

    let replacement: string
    if (env.has(name)) replacement = env.get(name)!
    else if (fallback !== null) replacement = fallback
    else throw new ResolveError(`undeclared token ${name}`)

    const next = new Set(seen)
    next.add(name)
    out = out.slice(0, start) + resolveValue(replacement, env, next) + out.slice(end + 1)
  }

  return out.trim()
}

/** Resolve a declared token by name, guarding against self-reference. */
export function resolveToken(name: string, env: Map<string, string>): string {
  const raw = env.get(name)
  if (raw === undefined) throw new ResolveError(`${name} is not declared`)
  return resolveValue(raw, env, new Set([name]))
}

/**
 * WCAG relative luminance of a `#rrggbb` value, or null if the value is not a
 * plain six-digit hex (a gradient, a color-mix, a keyword). Callers must treat
 * null as "cannot judge" and say so, never as a pass.
 */
export function relativeLuminance(value: string): number | null {
  const m = /^#([0-9a-f]{6})$/i.exec(value.trim())
  if (!m) return null
  const channels = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255)
  const linear = channels.map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}
