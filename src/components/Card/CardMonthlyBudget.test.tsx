import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardMonthlyBudget } from './CardMonthlyBudget'
import type { CardMonthlyBudgetState } from './CardMonthlyBudget'

const STATES: CardMonthlyBudgetState[] = ['default', 'addNew']

describe('CardMonthlyBudget', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardMonthlyBudget />)
    expect(container.firstChild).toHaveClass('mn-card-monthly-budget')
  })

  it.each(STATES)('renders the %s state', state => {
    const { container } = render(<CardMonthlyBudget state={state} />)
    expect(container.firstChild).toHaveClass('mn-card-monthly-budget')
  })

  // `default` shows the ring + summary; `addNew` swaps the whole body for a
  // single "Add New Budget" button plus its own modifier class.
  it('renders the addNew state as an action button with its modifier class', () => {
    const { container } = render(<CardMonthlyBudget state="addNew" />)
    expect(container.firstChild).toHaveClass('mn-card-monthly-budget--add-new')
    expect(screen.getByRole('button', { name: /Add New Budget/ })).toBeInTheDocument()
  })

  it('renders the nested ProgressRing in its default state', () => {
    render(<CardMonthlyBudget />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardMonthlyBudget />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
