import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Breadcrumbs } from './Breadcrumbs'
import type { BreadcrumbItem } from './Breadcrumbs'

// BreadcrumbItem is a data shape, not a variant union — there is no variant
// axis to iterate here, so the smoke check is structural instead.
const ITEMS: BreadcrumbItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'wallet', label: 'Wallet', href: '/wallet' },
  { id: 'detail', label: 'Detail' },
]

describe('Breadcrumbs', () => {
  it('renders without crashing', () => {
    render(<Breadcrumbs items={ITEMS} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('renders one link per item', () => {
    render(<Breadcrumbs items={ITEMS} />)
    expect(screen.getAllByRole('link')).toHaveLength(ITEMS.length)
  })

  it('marks only the last item as the current page', () => {
    render(<Breadcrumbs items={ITEMS} />)
    expect(screen.getByRole('link', { name: /Detail/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Home/ })).not.toHaveAttribute('aria-current')
  })

  it('accepts a custom accessible name', () => {
    render(<Breadcrumbs items={ITEMS} ariaLabel="You are here" />)
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Breadcrumbs items={ITEMS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
