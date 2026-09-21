import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/components/InlineMessage/InlineMessage.test.tsx'
let s = readFileSync(p, 'utf8')
const eol = s.includes('\r\n') ? '\r\n' : '\n'
s = s.replace(/\r\n/g, '\n')
const rep = (a, b) => { if (!s.includes(a)) { console.error('MISSING:', a.slice(0, 70)); process.exit(1) } s = s.replace(a, b) }

rep(`import { axe } from 'jest-axe'
import { InlineMessage } from './InlineMessage'
`, `import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { InlineMessage } from './InlineMessage'
import { Icon } from '../Icon'

// ── Static read of InlineMessage.css ────────────────────────────────────────
// vitest.config.ts sets no \`test.css\`, so no stylesheet is applied in jsdom and
// getComputedStyle cannot see a colour binding. The tone rules below are
// therefore asserted against the stylesheet itself: which declaration wins for
// a given part, on a root carrying a given set of classes.
const CSS = readFileSync(resolve(process.cwd(), 'src/components/InlineMessage/InlineMessage.css'), 'utf8')

interface Rule { selector: string; decls: Array<[string, string]>; order: number }

const RULES: Rule[] = [...CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(
  (m, order) => {
    const decls = m[2]
      .split(';')
      .map(d => d.trim())
      .filter(Boolean)
      .map(d => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()] as [string, string])
    return m[1].split(',').map(selector => ({ selector: selector.trim(), decls, order }))
  },
)

const classesOf = (compound: string) => compound.split('.').filter(Boolean)

/**
 * The value \`prop\` takes on \`part\` (a class, or null for the root itself) when
 * the root carries \`rootClasses\`. Only plain class selectors — \`.root\`,
 * \`.a.b\`, \`.a.b .part\` — are considered; this file declares colour and border
 * through nothing else. Specificity is the class count; ties go to source order.
 */
function boundValue(rootClasses: string[], part: string | null, props: string[]): string | undefined {
  let best: { spec: number; order: number; value: string } | undefined
  for (const rule of RULES) {
    if (!/^[.\w\s-]+$/.test(rule.selector)) continue
    const compounds = rule.selector.split(/\s+/)
    let ancestor: string[] = []
    let target: string[]
    if (part === null) {
      if (compounds.length !== 1) continue
      target = classesOf(compounds[0])
      if (!target.every(c => rootClasses.includes(c))) continue
    } else {
      target = classesOf(compounds[compounds.length - 1])
      if (target.length !== 1 || target[0] !== part) continue
      if (compounds.length > 2) continue
      ancestor = compounds.length === 2 ? classesOf(compounds[0]) : []
      if (!ancestor.every(c => rootClasses.includes(c))) continue
    }
    for (const [name, value] of rule.decls) {
      if (!props.includes(name)) continue
      const spec = ancestor.length + target.length
      if (!best || spec > best.spec || (spec === best.spec && rule.order >= best.order)) {
        best = { spec, order: rule.order, value }
      }
    }
  }
  return best?.value
}

const rootClasses = (tone: 'neutral' | 'warning', framed: boolean) =>
  ['mn-inline-message', \`mn-inline-message--\${tone}\`, ...(framed ? ['mn-inline-message--framed'] : [])]
`)

rep(`    expect(container.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal]')).toBeNull()
    expect(container.querySelector('[inert], [aria-hidden="true"]')).toBeNull()`,
`    expect(container.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal]')).toBeNull()
    // Gate 62b: the warning tone's own decorative glyph is an aria-hidden <svg>
    // (Icon marks every glyph so). It hides nothing AROUND the message, which is
    // what this test guards, so it alone is excluded — nothing else is.
    const hidden = [...container.querySelectorAll('[inert], [aria-hidden="true"]')].filter(
      el => !el.closest('.mn-inline-message__icon'),
    )
    expect(hidden).toEqual([])`)

rep(`  it('has no axe violations in the neutral tone', async () => {`,
`  // ── TONE IS CARRIED BY THE CONTAINER, NOT THE TEXT (Gate 62b) ──────────────
  // Ruled by the review thread: title and body use the same text tokens in every
  // tone. Gate 62 coloured the warning title with --mapped-text-warning-default
  // (2.22:1 in light); these fail if any tone changes a text colour again.

  it('binds the warning title and body to the same text colour as neutral, framed and unframed', () => {
    for (const framed of [true, false]) {
      for (const part of ['mn-inline-message__title', 'mn-inline-message__body']) {
        const neutral = boundValue(rootClasses('neutral', framed), part, ['color'])
        const warning = boundValue(rootClasses('warning', framed), part, ['color'])
        expect(neutral, \`\${part} framed=\${framed} has no colour\`).toBe('var(--mapped-text-default-default)')
        expect(\`\${part} framed=\${framed}: \${warning}\`).toBe(\`\${part} framed=\${framed}: \${neutral}\`)
      }
    }
  })

  it('frames the warning tone with the warning border token, and neutral with its own', () => {
    expect(boundValue(rootClasses('warning', true), null, ['border', 'border-color'])).toBe(
      'var(--mapped-border-warning-default)',
    )
    expect(boundValue(rootClasses('neutral', true), null, ['border', 'border-color'])).toContain(
      'var(--mapped-border-subtlest-default)',
    )
  })

  it.each([true, false])('renders the leading warning glyph at size m when isFramed is %s', isFramed => {
    const { container } = render(<InlineMessage tone="warning" title="Couldn't read this photo" isFramed={isFramed} />)
    const root = container.firstChild as HTMLElement
    const glyph = root.querySelector('.mn-inline-message__icon')
    expect(glyph).not.toBeNull()
    expect(root.firstElementChild).toBe(glyph)
    const expected = render(<Icon name="warning" size="m" />).container.innerHTML
    expect(glyph!.innerHTML).toBe(expected)
  })

  it('renders no tone glyph in the neutral tone', () => {
    const { container } = render(<InlineMessage title="Add a receipt">Body</InlineMessage>)
    expect(container.querySelector('.mn-inline-message__icon')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('has no axe violations in the neutral tone', async () => {`)

writeFileSync(p, s.replace(/\n/g, eol))
console.log('ok', eol === '\r\n' ? 'CRLF' : 'LF')
