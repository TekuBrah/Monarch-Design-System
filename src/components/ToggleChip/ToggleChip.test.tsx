import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ToggleChip } from './ToggleChip'

// ToggleChip exports no variant union — isSelected is its axis. It is a toggle
// button, so selection is exposed via aria-pressed rather than aria-selected.
describe('ToggleChip', () => {
  it('renders without crashing', () => {
    render(<ToggleChip label="Groceries" />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toBeInTheDocument()
  })

  it('reflects selection through aria-pressed', () => {
    const { unmount } = render(<ToggleChip label="Groceries" />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toHaveAttribute('aria-pressed', 'false')
    unmount()

    render(<ToggleChip label="Groceries" isSelected />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies the selected modifier class when isSelected is set', () => {
    render(<ToggleChip label="Groceries" isSelected />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toHaveClass('mn-toggle-chip--selected')
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ToggleChip label="Groceries" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Groceries' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ToggleChip label="Groceries" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
