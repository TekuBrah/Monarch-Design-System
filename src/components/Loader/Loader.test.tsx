import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Loader } from './Loader'

// Loader exports no variant union — it has a single visual form.
describe('Loader', () => {
  it('renders without crashing, with a default accessible name', () => {
    render(<Loader />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('accepts a custom accessible name', () => {
    render(<Loader ariaLabel="Fetching accounts" />)
    expect(screen.getByRole('status', { name: 'Fetching accounts' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Loader />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
