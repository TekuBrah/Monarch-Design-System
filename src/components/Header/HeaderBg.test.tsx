import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { HeaderBg } from './HeaderBg'
import type { HeaderBgVariant } from './HeaderBg'

const VARIANTS: HeaderBgVariant[] = ['default', 'noSearchBar', 'compact']
const props = { background: <div data-testid="bg" /> }

// Per Step 0.3, HeaderBg deliberately uses non-flipping --alias-* tokens for its
// photo-overlay chrome. That is documented and intentional, so no dark-mode
// colour assertions are made here (same exclusion as Field in Batch 2).
describe('HeaderBg', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeaderBg {...props} />)
    expect(container.firstChild).toHaveClass('mn-header-bg')
  })

  // Only `compact` emits a modifier class; the other two differ by whether the
  // search Field renders (showSearch === variant === 'default').
  it.each(VARIANTS)('renders the %s variant', variant => {
    const { container } = render(<HeaderBg {...props} variant={variant} />)
    expect(container.firstChild).toHaveClass('mn-header-bg')
  })

  it('renders the search field only in the default variant', () => {
    const { unmount } = render(<HeaderBg {...props} variant="default" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    unmount()

    render(<HeaderBg {...props} variant="noSearchBar" />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('applies the compact modifier class', () => {
    const { container } = render(<HeaderBg {...props} variant="compact" />)
    expect(container.firstChild).toHaveClass('mn-header-bg--compact')
  })

  it('renders its notifications trigger', () => {
    render(<HeaderBg {...props} />)
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<HeaderBg {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
