import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { BottomNavigation } from './BottomNavigation'
import type { BottomNavItem } from './BottomNavigation'

// BottomNavItem is a data shape, not a variant union — no variant axis to iterate.
const ITEMS: BottomNavItem[] = [
  { id: 'home', icon: 'home', label: 'Home', isSelected: true },
  { id: 'wallet', icon: 'icon_wallet', label: 'Wallet' },
  { id: 'more', icon: 'more_horiz', label: 'More' },
]

describe('BottomNavigation', () => {
  it('renders without crashing', () => {
    const { container } = render(<BottomNavigation items={ITEMS} />)
    expect(container.firstChild).toHaveClass('mn-bottom-nav')
  })

  it('exposes a navigation landmark', () => {
    render(<BottomNavigation items={ITEMS} />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders one button per item', () => {
    render(<BottomNavigation items={ITEMS} />)
    expect(screen.getAllByRole('button')).toHaveLength(ITEMS.length)
  })

  it('marks only the selected item as the current page', () => {
    render(<BottomNavigation items={ITEMS} />)
    expect(screen.getByRole('button', { name: /Home/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /Wallet/ })).not.toHaveAttribute('aria-current')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<BottomNavigation items={ITEMS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
