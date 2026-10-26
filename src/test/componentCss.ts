import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/* Gate 91 — a static reader for ONE component stylesheet.

   jsdom applies no CSS here (`vitest.config.ts` sets no `test.css`), so a
   computed-style test would pass against anything. Token bindings are
   therefore read from the stylesheet itself. This is the same brace-depth
   scan Gate 86 wrote inside HeaderBg.avatar.test.tsx, lifted here so the
   three Gate 91 component tests share one copy instead of three. It records
   each rule's enclosing at-rules and keeps every declaration, not only
   custom properties (which is all `parseBlocks` in ./tokenCss keeps). */

export type CssRule = { selectors: string[]; context: string[]; decls: Map<string, string> }

export function readComponentCss(repoPath: string): CssRule[] {
  const css = readFileSync(resolve(process.cwd(), repoPath), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const rules: CssRule[] = []
  const context: string[] = []
  let from = 0
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      const head = css.slice(from, i).trim()
      if (head.startsWith('@')) {
        context.push(head)
        from = i + 1
        continue
      }
      const close = css.indexOf('}', i)
      const decls = new Map<string, string>()
      for (const part of css.slice(i + 1, close).split(';')) {
        const c = part.indexOf(':')
        if (c < 0) continue
        decls.set(part.slice(0, c).trim(), part.slice(c + 1).trim())
      }
      rules.push({ selectors: head.split(',').map(s => s.replace(/\s+/g, ' ').trim()), context: [...context], decls })
      i = close
      from = close + 1
    } else if (css[i] === '}') {
      context.pop()
      from = i + 1
    }
  }
  return rules
}

/** The value `property` takes in the LAST top-level rule whose selector list
 *  contains `selector` exactly — source order decides between equal rules.
 *  `undefined` when no such rule declares it. */
export function declaration(rules: CssRule[], selector: string, property: string): string | undefined {
  let value: string | undefined
  for (const r of rules) {
    if (r.context.length === 0 && r.selectors.includes(selector) && r.decls.has(property)) value = r.decls.get(property)
  }
  return value
}
