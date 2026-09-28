import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { InlineMessage } from './InlineMessage'
import { Icon } from '../Icon'

// ── Static read of InlineMessage.css ────────────────────────────────────────
// vitest.config.ts sets no `test.css`, so no stylesheet is applied in jsdom and
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
 * The value `prop` takes on `part` (a class, or null for the root itself) when
 * the root carries `rootClasses`. Only plain class selectors — `.root`,
 * `.a.b`, `.a.b .part` — are considered; this file declares colour and border
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

const rootClasses = (tone: 'neutral' | 'warning' | 'ai', framed: boolean) =>
  ['mn-inline-message', `mn-inline-message--${tone}`, ...(framed ? ['mn-inline-message--framed'] : [])]

describe('InlineMessage', () => {
  it('renders the title and the body', () => {
    render(<InlineMessage title="Couldn't read this photo">Try again in good light.</InlineMessage>)
    expect(screen.getByText("Couldn't read this photo")).toBeInTheDocument()
    expect(screen.getByText('Try again in good light.')).toBeInTheDocument()
  })

  it('defaults to the neutral tone, framed', () => {
    const { container } = render(<InlineMessage title="Add a receipt" />)
    expect((container.firstChild as HTMLElement).className).toBe(
      'mn-inline-message mn-inline-message--neutral mn-inline-message--framed',
    )
  })

  it('applies the warning tone modifier', () => {
    const { container } = render(<InlineMessage tone="warning" title="Couldn't read this photo" />)
    expect(container.firstChild).toHaveClass('mn-inline-message--warning')
    expect(container.firstChild).not.toHaveClass('mn-inline-message--neutral')
  })

  it('drops the framed modifier when isFramed is false', () => {
    const { container } = render(<InlineMessage title="Add a receipt" isFramed={false} />)
    expect(container.firstChild).not.toHaveClass('mn-inline-message--framed')
  })

  it('appends className after its own modifiers', () => {
    const { container } = render(<InlineMessage title="Add a receipt" className="extra" />)
    expect((container.firstChild as HTMLElement).className).toBe(
      'mn-inline-message mn-inline-message--neutral mn-inline-message--framed extra',
    )
  })

  it('renders the actions region when actions are supplied', () => {
    render(<InlineMessage title="Couldn't read this photo" actions={<button>Retake photo</button>} />)
    const action = screen.getByRole('button', { name: 'Retake photo' })
    expect(action.parentElement).toHaveClass('mn-inline-message__actions')
  })

  it('renders no body or actions region when they are omitted', () => {
    const { container } = render(<InlineMessage title="Add a receipt" />)
    expect(container.querySelector('.mn-inline-message__body')).toBeNull()
    expect(container.querySelector('.mn-inline-message__actions')).toBeNull()
  })

  it('is a group named by its title', () => {
    render(<InlineMessage title="Couldn't read this photo">Body</InlineMessage>)
    expect(screen.getByRole('group', { name: "Couldn't read this photo" })).toBeInTheDocument()
  })

  // ── NON-BLOCKING ─────────────────────────────────────────────────────────
  // The component's defining promise is that it never stands between the user
  // and the surrounding flow. Three separate ways an inline message can break
  // that, one test each, so a regression names which one it is.

  it('does not move focus when it renders', () => {
    const { rerender } = render(
      <div>
        <button>Before</button>
      </div>,
    )
    const before = screen.getByRole('button', { name: 'Before' })
    before.focus()
    rerender(
      <div>
        <button>Before</button>
        <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>}>
          Body
        </InlineMessage>
      </div>,
    )
    expect(document.activeElement).toBe(before)
  })

  it('carries no dialog semantics and hides nothing around it', () => {
    const { container } = render(
      <div>
        <button>Before</button>
        <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>} />
        <button>After</button>
      </div>,
    )
    expect(container.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal]')).toBeNull()
    // Gate 62b: the warning tone's own decorative glyph is an aria-hidden <svg>
    // (Icon marks every glyph so). It hides nothing AROUND the message, which is
    // what this test guards, so it alone is excluded — nothing else is.
    const hidden = [...container.querySelectorAll('[inert], [aria-hidden="true"]')].filter(
      el => !el.closest('.mn-inline-message__icon'),
    )
    expect(hidden).toEqual([])
  })

  it('leaves the surrounding controls operable', () => {
    const onBefore = vi.fn()
    const onAfter = vi.fn()
    render(
      <div>
        <button onClick={onBefore}>Before</button>
        <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>} />
        <button onClick={onAfter}>After</button>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Before' }))
    fireEvent.click(screen.getByRole('button', { name: 'After' }))
    expect(onBefore).toHaveBeenCalledTimes(1)
    expect(onAfter).toHaveBeenCalledTimes(1)
  })

  // ── TONE IS CARRIED BY THE CONTAINER, NOT THE TEXT (Gate 62b) ──────────────
  // Ruled by the review thread: title and body use the same text tokens in every
  // tone. Gate 62 coloured the warning title with --mapped-text-warning-default
  // (2.22:1 in light); these fail if any tone changes a text colour again.

  it('binds the warning title and body to the same text colour as neutral, framed and unframed', () => {
    for (const framed of [true, false]) {
      for (const part of ['mn-inline-message__title', 'mn-inline-message__body']) {
        const neutral = boundValue(rootClasses('neutral', framed), part, ['color'])
        const warning = boundValue(rootClasses('warning', framed), part, ['color'])
        expect(neutral, `${part} framed=${framed} has no colour`).toBe('var(--mapped-text-default-default)')
        expect(`${part} framed=${framed}: ${warning}`).toBe(`${part} framed=${framed}: ${neutral}`)
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

  it('has no axe violations in the neutral tone', async () => {
    const { container } = render(<InlineMessage title="Add a receipt">Snap one to keep it with this transaction.</InlineMessage>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations in the warning tone with an action', async () => {
    const { container } = render(
      <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>}>
        Try again with the receipt flat, in good light and in focus.
      </InlineMessage>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── G45 (Gate 73): the ai tone ────────────────────────────────────────────
  // Figma `❖ System message` appearance=ai (casestudy_02 1201:16589). Every
  // gradient stop is bound to a brand primitive; the text is on-colour.
  const AI_GRADIENT =
    'linear-gradient( 90deg, var(--brand-blue-400)   2.404%, var(--brand-blue-500)   28.942%, var(--brand-violet-500) 100% )'
  const squash = (v: string | undefined) => v?.replace(/\s+/g, ' ')

  it('applies the ai tone modifier', () => {
    const { container } = render(<InlineMessage tone="ai" title="Maxis Promotion Available." />)
    expect(container.firstChild).toHaveClass('mn-inline-message--ai')
  })

  it('paints the ai tone with the three bound brand stops, framed and unframed', () => {
    for (const framed of [true, false]) {
      const bg = boundValue(rootClasses('ai', framed), null, ['background', 'background-image'])
      expect(`framed=${framed}: ${squash(bg)}`).toBe(`framed=${framed}: ${squash(AI_GRADIENT)}`)
    }
  })

  it('binds the ai title and body to the on-colour text token, framed and unframed', () => {
    for (const framed of [true, false]) {
      for (const part of ['mn-inline-message__title', 'mn-inline-message__body']) {
        const colour = boundValue(rootClasses('ai', framed), part, ['color'])
        expect(`${part} framed=${framed}: ${colour}`).toBe(
          `${part} framed=${framed}: var(--mapped-text-primary-on-color)`,
        )
      }
    }
  })

  it('renders the leading icon_aiinsights glyph at size m in the ai tone', () => {
    const { container } = render(<InlineMessage tone="ai" title="Maxis Promotion Available." />)
    const root = container.firstChild as HTMLElement
    const glyph = root.querySelector('.mn-inline-message__icon')
    expect(root.firstElementChild).toBe(glyph)
    const expected = render(<Icon name="icon_aiinsights" size="m" />).container.innerHTML
    expect(glyph!.innerHTML).toBe(expected)
  })

  it('scopes only the ai actions region dark so a composed Button renders Inverse', () => {
    const action = <button>View</button>
    const ai = render(<InlineMessage tone="ai" title="Maxis" actions={action} />).container
    expect(ai.querySelector('.mn-inline-message__actions')).toHaveAttribute('data-theme', 'dark')
    for (const tone of ['neutral', 'warning'] as const) {
      const other = render(<InlineMessage tone={tone} title="Maxis" actions={action} />).container
      expect(other.querySelector('.mn-inline-message__actions')).not.toHaveAttribute('data-theme')
    }
  })

  it('has no axe violations in the ai tone with an action', async () => {
    const { container } = render(
      <InlineMessage tone="ai" title="Maxis Promotion Available." actions={<button>View</button>}>
        RM69/month Potential Savings.
      </InlineMessage>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
