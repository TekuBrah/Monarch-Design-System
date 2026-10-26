import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { FieldMessage } from './FieldMessage'
import type { FieldMessageTone } from './FieldMessage'
import { Icon } from '../Icon'
import { readComponentCss, declaration } from '../../test/componentCss'
import { readGlobals, environment, resolveToken } from '../../test/tokenCss'

/* Gate 91 (v2.10.0) — FieldMessage mirrors Figma `<Error message>` (279:4741)
   and `<Helper message>` (279:4770). Token bindings are read from
   FieldMessage.css (jsdom applies no stylesheet) and resolved through
   globals.css in both themes, which proves each token is declared. */

const TONES: FieldMessageTone[] = ['error', 'helper']
const SPEC: Record<FieldMessageTone, { glyph: 'error' | 'help_outline'; type: string; icon: string; text: string }> = {
  error: { glyph: 'error', type: 'type-body-caption-semibold', icon: '--mapped-icon-error-default', text: '--mapped-text-error-default' },
  helper: { glyph: 'help_outline', type: 'type-body-caption', icon: '--mapped-icon-subtle-default', text: '--mapped-text-subtle-default' },
}
const RULES = readComponentCss('src/components/FieldMessage/FieldMessage.css')
const GLOBALS = readGlobals()

describe('FieldMessage', () => {
  it.each(TONES)('renders the %s tone modifier on the root', tone => {
    const { container } = render(<FieldMessage tone={tone}>Message</FieldMessage>)
    expect(container.firstElementChild!.className).toBe(`mn-field-message mn-field-message--${tone}`)
  })

  it.each(TONES)('renders the %s glyph first, as a 16px Icon', tone => {
    const { container } = render(<FieldMessage tone={tone}>Message</FieldMessage>)
    expect(container.firstElementChild!.firstElementChild!.outerHTML).toBe(
      renderToStaticMarkup(<Icon name={SPEC[tone].glyph} size="s" />),
    )
  })

  it.each(TONES)('sets the %s text in its Figma type style', tone => {
    const { container } = render(<FieldMessage tone={tone}>Enter an amount</FieldMessage>)
    const text = container.querySelector('.mn-field-message__text')!
    expect(text.textContent).toBe('Enter an amount')
    expect(text.className).toBe(`mn-field-message__text ${SPEC[tone].type}`)
  })

  it.each(TONES)('binds the %s glyph and text to their Figma tokens', tone => {
    expect(declaration(RULES, `.mn-field-message--${tone}`, 'color')).toBe(`var(${SPEC[tone].icon})`)
    expect(declaration(RULES, `.mn-field-message--${tone} .mn-field-message__text`, 'color')).toBe(`var(${SPEC[tone].text})`)
    for (const theme of ['light', 'dark'] as const) {
      const env = environment(GLOBALS, theme)
      expect(resolveToken(SPEC[tone].icon, env)).toMatch(/^#[0-9a-f]{6}$/)
      expect(resolveToken(SPEC[tone].text, env)).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('lays out as a row with a Scale/100 gap, items centred', () => {
    expect(declaration(RULES, '.mn-field-message', 'display')).toBe('flex')
    expect(declaration(RULES, '.mn-field-message', 'align-items')).toBe('center')
    expect(declaration(RULES, '.mn-field-message', 'gap')).toBe('var(--brand-scale-100)')
  })

  it('passes id through to the root', () => {
    const { container } = render(<FieldMessage tone="error" id="amount-error">Message</FieldMessage>)
    expect(container.firstElementChild).toHaveAttribute('id', 'amount-error')
  })

  it('omits id when none is given', () => {
    const { container } = render(<FieldMessage tone="helper">Message</FieldMessage>)
    expect(container.firstElementChild).not.toHaveAttribute('id')
  })

  it.each(TONES)('carries no role and no live region in the %s tone', tone => {
    const { container } = render(<FieldMessage tone={tone}>Message</FieldMessage>)
    expect(container.querySelectorAll('[role], [aria-live], [aria-atomic]')).toHaveLength(0)
  })

  it.each(TONES)('hides the %s glyph from assistive technology', tone => {
    const { container } = render(<FieldMessage tone={tone}>Message</FieldMessage>)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it.each(TONES)('has no axe violations in the %s tone', async tone => {
    const { container } = render(<FieldMessage tone={tone}>Message</FieldMessage>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
