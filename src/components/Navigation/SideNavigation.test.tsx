import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { SideNavigation } from './SideNavigation'
import type { SideNavItem } from './SideNavigation'

// SideNavItem is a data shape, not a variant union — isCompact is the real axis.
const ITEMS: SideNavItem[] = [
  { id: 'home', icon: 'home', label: 'Home', isSelected: true },
  { id: 'wallet', icon: 'icon_wallet', label: 'Wallet' },
]

describe('SideNavigation', () => {
  it('renders without crashing', () => {
    const { container } = render(<SideNavigation items={ITEMS} />)
    expect(container.firstChild).toHaveClass('mn-side-nav')
  })

  it('exposes a navigation landmark with one button per item', () => {
    render(<SideNavigation items={ITEMS} />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Home/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Wallet/ })).toBeInTheDocument()
  })

  it('applies the compact modifier class when isCompact is set', () => {
    const { container } = render(<SideNavigation items={ITEMS} isCompact />)
    expect(container.firstChild).toHaveClass('mn-side-nav--compact')
  })

  it('renders the expand/collapse trigger only when onToggleCompact is given', () => {
    const { unmount } = render(<SideNavigation items={ITEMS} />)
    expect(screen.queryByRole('button', { name: /navigation/i })).not.toBeInTheDocument()
    unmount()

    render(<SideNavigation items={ITEMS} onToggleCompact={() => {}} />)
    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toBeInTheDocument()
  })

  it('marks the selected item as the current page', () => {
    render(<SideNavigation items={ITEMS} />)
    expect(screen.getByRole('button', { name: /Home/ })).toHaveAttribute('aria-current', 'page')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<SideNavigation items={ITEMS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
