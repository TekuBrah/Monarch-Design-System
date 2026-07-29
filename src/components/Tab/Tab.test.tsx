import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Tab } from './Tab'

// Tab exports no variant union — its axes are boolean/optional state props.
describe('Tab', () => {
  it('renders without crashing', () => {
    render(<Tab label="Overview" />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
  })

  it('reflects selection through aria-selected', () => {
    const { unmount } = render(<Tab label="Overview" />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false')
    unmount()

    render(<Tab label="Overview" isSelected />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
  })

  it('applies the selected modifier class when isSelected is set', () => {
    render(<Tab label="Overview" isSelected />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass('mn-tab--selected')
  })

  it('omits aria-controls when no tabpanel is wired', () => {
    render(<Tab label="Overview" />)
    expect(screen.getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('aria-controls')
  })

  // Deviation, flagged: role="tab" requires a role="tablist" parent, so auditing
  // a bare <Tab> would fail axe's aria-required-parent rule for a reason that is
  // not a defect in Tab. It is audited inside the tablist it is always used in
  // (the Tabs container supplies this in real usage).
  it('has no axe violations in its default state, inside a tablist', async () => {
    const { container } = render(
      <div role="tablist">
        <Tab label="Overview" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
