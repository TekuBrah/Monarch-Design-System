import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MenuItem } from './MenuItem'
import type { MenuItemType } from './MenuItem'

const TYPES: MenuItemType[] = ['default', 'crypto', 'account', 'checkbox', 'radio']

describe('MenuItem', () => {
  it('renders without crashing, as an option', () => {
    render(<MenuItem label="Savings" />)
    expect(screen.getByRole('option', { name: /Savings/ })).toBeInTheDocument()
  })

  it.each(TYPES)('renders the %s type', type => {
    const { container } = render(<MenuItem label="Savings" type={type} />)
    expect(container.firstChild).toHaveClass(`mn-menu-item--${type}`)
  })

  it('reflects selection through aria-selected', () => {
    render(<MenuItem label="Savings" isSelected />)
    expect(screen.getByRole('option', { name: /Savings/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('passes its id back through onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<MenuItem label="Savings" id="savings" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('option', { name: /Savings/ }))
    expect(onSelect).toHaveBeenCalledWith('savings')
  })

  // Step 1.4's investigation confirmed `id` is genuinely optional here — rows
  // without a caller-assigned id fire onSelect with undefined, by design.
  it('fires onSelect with undefined when no id was supplied', () => {
    const onSelect = vi.fn()
    render(<MenuItem label="Savings" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('option', { name: /Savings/ }))
    expect(onSelect).toHaveBeenCalledWith(undefined)
  })

  // Deviation, flagged: role="option" requires a role="listbox" parent, so a bare
  // MenuItem would fail axe's aria-required-parent for a reason that is not a
  // defect in MenuItem. Audited inside the listbox it always lives in (supplied
  // by Menu in real usage) — same treatment as Tab/tablist in Batch 1.
  it('has no axe violations in its default state, inside a listbox', async () => {
    const { container } = render(
      <div role="listbox" aria-label="Accounts">
        <MenuItem label="Savings" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // Gate 73-B — guards the row-height defect correction, and with it the DS
  // convention it is named for: a wrapper around a fixed-size control is a
  // flex box, never an inline formatting context. Without `display: flex` the
  // inline-block control sits on a baseline and the line box reserves
  // descender space, which rendered the row 55px against Figma's 48.
  // jsdom applies no stylesheet, so this is read from the CSS.
  it('gives the control wrapper a flex context, so it cannot reserve descender space', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/components/MenuItem/MenuItem.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '')
    const start = css.indexOf('.mn-menu-item__control {')
    expect(start).toBeGreaterThan(-1)
    const body = css.slice(start, css.indexOf('}', start))
    expect(body).toMatch(/display:\s*flex/)
    expect(body).toMatch(/align-items:\s*center/)
  })

  // Gate 73-B. The axe test above covers `default` ONLY, and that is exactly
  // how an unnamed option shipped: `checkbox` and `radio` put their label
  // inside an `aria-hidden` + `inert` wrapper, so the row announced nothing.
  // Found by OptionList, which is the first component to put these two types
  // under axe. This closes the hole rather than just the instance.
  it.each(['checkbox', 'radio'] as const)(
    'names the %s row, whose only text is inside an aria-hidden wrapper',
    async type => {
      const { container } = render(
        <div role="listbox" aria-label="Accounts">
          <MenuItem type={type} label="Savings" />
        </div>,
      )
      expect(screen.getByRole('option', { name: 'Savings' })).toBeInTheDocument()
      expect(await axe(container)).toHaveNoViolations()
    },
  )
})
