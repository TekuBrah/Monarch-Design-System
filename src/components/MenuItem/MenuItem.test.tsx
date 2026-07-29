import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
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
})
