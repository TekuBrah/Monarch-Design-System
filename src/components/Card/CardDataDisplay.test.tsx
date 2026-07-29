import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardDataDisplay } from './CardDataDisplay'

const props = { info: 'Total spend', content: 'RM 850.00' }

// No variant union, no interaction — presentational only.
describe('CardDataDisplay', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardDataDisplay {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-data-display')
  })

  it('renders its info and content', () => {
    render(<CardDataDisplay {...props} />)
    expect(screen.getByText('Total spend')).toBeInTheDocument()
    expect(screen.getByText('RM 850.00')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardDataDisplay {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
