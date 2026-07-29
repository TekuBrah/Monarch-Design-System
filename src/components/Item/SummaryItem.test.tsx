import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { SummaryItem } from './SummaryItem'

const props = { amount: 'RM 400.00', type: 'Available' }

// No variant union and no interaction — presentational only.
describe('SummaryItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<SummaryItem {...props} />)
    expect(container.firstChild).toHaveClass('mn-summary-item')
  })

  it('renders its amount and type', () => {
    render(<SummaryItem {...props} />)
    expect(screen.getByText('RM 400.00')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<SummaryItem {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
