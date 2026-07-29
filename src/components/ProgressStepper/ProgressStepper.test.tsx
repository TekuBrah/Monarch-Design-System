import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ProgressStepper } from './ProgressStepper'

// ProgressStepper exports no variant union — totalSteps/currentStep are numeric.
describe('ProgressStepper', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressStepper />)
    expect(container.firstChild).toHaveClass('mn-progress-stepper')
  })

  it('exposes progress through the progressbar role', () => {
    render(<ProgressStepper totalSteps={5} currentStep={2} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemin', '1')
    expect(bar).toHaveAttribute('aria-valuemax', '5')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ProgressStepper />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
