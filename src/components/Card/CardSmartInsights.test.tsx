import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardSmartInsights } from './CardSmartInsights'

const props = { title: 'Spending up 12%', description: 'Compared to last month' }

// No variant union. Its onLinkClick is outside Step 1.4's normalized five, so
// this stays render + content + axe.
describe('CardSmartInsights', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardSmartInsights {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-smart-insights')
  })

  it('renders its title and description', () => {
    render(<CardSmartInsights {...props} />)
    expect(screen.getByText('Spending up 12%')).toBeInTheDocument()
    expect(screen.getByText('Compared to last month')).toBeInTheDocument()
  })

  // linkLabel defaults to 'View', so the link affordance always renders — it is
  // not conditional on the prop being passed.
  it('always renders the link affordance, defaulting its label to "View"', () => {
    const { unmount } = render(<CardSmartInsights {...props} />)
    expect(screen.getByRole('button', { name: /View/ })).toBeInTheDocument()
    unmount()

    render(<CardSmartInsights {...props} linkLabel="See details" />)
    expect(screen.getByRole('button', { name: /See details/ })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardSmartInsights {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
