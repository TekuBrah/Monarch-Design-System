import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ButtonGroup } from './ButtonGroup'
import type { ButtonGroupItem } from './ButtonGroup'

// ButtonGroupItem is a data shape, not a variant union — ButtonGroup exports no
// variant axis of its own; it is a composite layout around Button/IconButton.
const ITEMS: ButtonGroupItem[] = [
  { id: 'save', label: 'Save' },
  { id: 'cancel', label: 'Cancel' },
]

describe('ButtonGroup', () => {
  it('renders without crashing', () => {
    const { container } = render(<ButtonGroup buttons={ITEMS} />)
    expect(container.firstChild).toHaveClass('mn-button-group')
  })

  it('exposes a group landmark with a default accessible name', () => {
    render(<ButtonGroup buttons={ITEMS} />)
    expect(screen.getByRole('group', { name: 'Button group' })).toBeInTheDocument()
  })

  // Composite: one Button per item, PLUS the leading "more actions" IconButton.
  it('renders one Button per item plus the leading more-actions trigger', () => {
    render(<ButtonGroup buttons={ITEMS} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(ITEMS.length + 1)
  })

  // Step 1.4 normalized both handlers to () => void — verify the wiring fires
  // through the composite to the right child.
  it('invokes the clicked item\'s own onClick', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(<ButtonGroup buttons={[{ id: 'save', label: 'Save', onClick: onSave }, { id: 'cancel', label: 'Cancel', onClick: onCancel }]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('invokes onMoreClick from the leading trigger', () => {
    const onMoreClick = vi.fn()
    render(<ButtonGroup buttons={ITEMS} onMoreClick={onMoreClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    expect(onMoreClick).toHaveBeenCalledTimes(1)
  })

  it('forwards isDisabled through to the child Button', () => {
    render(<ButtonGroup buttons={[{ id: 'save', label: 'Save', isDisabled: true }]} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ButtonGroup buttons={ITEMS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
