import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardBalance } from './CardBalance'

const props = { type: 'Savings', name: 'Main account', amount: 'RM 1,200.00' }

// CardBalance exports no variant union and takes no onClick — it is purely
// presentational, so the smoke check is render + content + axe.
describe('CardBalance', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardBalance {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-balance')
  })

  it('renders its type, name and amount', () => {
    render(<CardBalance {...props} />)
    expect(screen.getByText('Savings')).toBeInTheDocument()
    expect(screen.getByText('Main account')).toBeInTheDocument()
    expect(screen.getByText('RM 1,200.00')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardBalance {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
