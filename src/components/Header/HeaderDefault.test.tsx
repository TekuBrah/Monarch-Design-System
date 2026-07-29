import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { HeaderDefault } from './HeaderDefault'

// HeaderDefault exports no variant union — its axes are boolean/optional props.
describe('HeaderDefault', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeaderDefault title="Transfer" />)
    expect(container.firstChild).toHaveClass('mn-header-default')
  })

  it('renders its title and back control', () => {
    render(<HeaderDefault title="Transfer" />)
    expect(screen.getByText('Transfer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders the trailing action link only when actionLabel is given', () => {
    const { unmount } = render(<HeaderDefault title="Transfer" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    unmount()

    render(<HeaderDefault title="Transfer" actionLabel="Skip" />)
    expect(screen.getByRole('link', { name: 'Skip' })).toBeInTheDocument()
  })

  it('swaps the title for a ProgressStepper when isProgressStepper is set', () => {
    render(<HeaderDefault title="Transfer" isProgressStepper currentStep={2} totalSteps={5} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('Transfer')).not.toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<HeaderDefault title="Transfer" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
