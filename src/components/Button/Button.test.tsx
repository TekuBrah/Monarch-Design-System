import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Button } from './Button'
import type { ButtonVariant } from './Button'
import { Icon } from '../Icon'

// Read from Button.tsx, not assumed: ButtonVariant = 'primary' | 'secondary' | 'tertiary'.
// Typed as ButtonVariant[] so adding/removing a variant in the source fails
// the typecheck here rather than silently leaving a variant untested.
const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary']

const sha = (html: string) => createHash('sha256').update(html).digest('hex')

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button label="Save" />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    render(<Button variant={variant} label="Save" />)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(`mn-btn--${variant}`)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Button label="Save" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── Gate 66 · G29 — error tone ──────────────────────────────────────
  describe('tone="error" (G29)', () => {
    it('renders its modifier on tertiary', () => {
      render(<Button variant="tertiary" tone="error" label="Delete receipt" />)
      expect(screen.getByRole('button', { name: 'Delete receipt' })).toHaveAttribute(
        'class',
        'mn-btn mn-btn--tertiary mn-btn--m mn-btn--error',
      )
    })

    it.each(VARIANTS)('the default tone renders no error modifier on %s', variant => {
      render(<Button variant={variant} label="Save" />)
      expect(screen.getByRole('button', { name: 'Save' })).not.toHaveClass('mn-btn--error')
    })

    // Figma draws the error appearance on Tertiary only; it is not built on the others.
    it.each(['primary', 'secondary'] as const)('is ignored on %s', variant => {
      render(<Button variant={variant} tone="error" label="Save" />)
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('class', `mn-btn mn-btn--${variant} mn-btn--m`)
    })

    it("explicit tone='default' is identical to omitting it", () => {
      const a = render(<Button variant="tertiary" label="Save" />).container.innerHTML
      const b = render(<Button variant="tertiary" tone="default" label="Save" />).container.innerHTML
      expect(b).toBe(a)
    })

    // Hashes captured from the v2.4.1 tree (820736e) before any edit.
    it.each([
      ['primary default', <Button label="Save" />, '47a5e4d728bd2a77a16cd35bd7ffa1bf74b2235a0473ae1b48af3abff6179020'],
      [
        'tertiary with an icon',
        <Button variant="tertiary" size="l" label="Delete receipt" leadingIcon={<Icon name="question_mark" size="m" />} />,
        '1a75edbefb0e3a6ea22d4916375558388e75ae8cd83d6d78d5fe5181b19d4e2b',
      ],
    ] as const)('the %s render is byte-identical to v2.4.1', (_n, el, hash) => {
      expect(sha(render(el).container.innerHTML)).toBe(hash)
    })

    // jsdom applies no stylesheet, so the binding is read from the CSS source.
    it('binds the label to text/error/default in every state and the icon to icon/error/default', () => {
      const css = readFileSync(resolve(process.cwd(), 'src/components/Button/Button.css'), 'utf8')
      const block = (sel: string) => {
        const i = css.indexOf(`${sel} {`)
        expect(i, sel).toBeGreaterThan(-1)
        return css.slice(i, css.indexOf('}', i))
      }
      const tone = block('.mn-btn--tertiary.mn-btn--error')
      for (const prop of ['--btn-text:', '--btn-text-hover:', '--btn-text-pressed:']) {
        expect(tone).toMatch(new RegExp(`${prop}\\s*var\\(--mapped-text-error-default\\);`))
      }
      expect(block('.mn-btn--tertiary.mn-btn--error:not(:disabled) > .mn-element-wrapper')).toMatch(
        /color:\s*var\(--mapped-icon-error-default\);/,
      )
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <Button variant="tertiary" tone="error" label="Delete budget" leadingIcon={<Icon name="question_mark" size="m" />} />,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
