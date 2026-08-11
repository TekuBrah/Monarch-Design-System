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

  // NO-CHANGE PROOF: the four new badge props must reproduce exactly what was
  // hard-coded before they existed — color="slate" size="l", circle, unnamed.
  it('defaults the badge to the previously hard-coded values', () => {
    const { container } = render(<SummaryItem {...props} />)
    const badge = container.querySelector('.mn-icon-object')!
    expect(badge).toHaveClass('mn-icon-object--slate')
    expect(badge).toHaveClass('mn-icon-object--l')
    expect(badge).toHaveClass('mn-icon-object--circle')
    expect(badge).not.toHaveAttribute('role')
    expect(badge).not.toHaveAttribute('aria-label')
  })

  it('forwards each badge prop to IconObject', () => {
    const { container } = render(
      <SummaryItem {...props} iconColor="teal" iconSize="xs" shape="square" iconAriaLabel="Wallet" />,
    )
    const badge = container.querySelector('.mn-icon-object')!
    expect(badge).toHaveClass('mn-icon-object--teal')
    expect(badge).toHaveClass('mn-icon-object--xs')
    expect(badge).toHaveClass('mn-icon-object--square')
    expect(screen.getByRole('img', { name: 'Wallet' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<SummaryItem {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with a named badge', async () => {
    const { container } = render(<SummaryItem {...props} iconAriaLabel="Wallet" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
