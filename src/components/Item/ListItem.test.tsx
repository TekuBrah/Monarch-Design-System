import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ListItem } from './ListItem'
import type { ListItemType } from './ListItem'

const TYPES: ListItemType[] = ['default', 'profile', 'crypto']
const props = { title: 'Netflix', amount: 'RM 55.00' }

describe('ListItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<ListItem {...props} />)
    expect(container.firstChild).toHaveClass('mn-list-item')
  })

  it.each(TYPES)('renders the %s type', type => {
    const { container } = render(<ListItem {...props} type={type} />)
    expect(container.firstChild).toHaveClass(`mn-list-item--${type}`)
  })

  it('renders its title', () => {
    render(<ListItem {...props} />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<ListItem {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Netflix/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ListItem {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Netflix/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ListItem {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
