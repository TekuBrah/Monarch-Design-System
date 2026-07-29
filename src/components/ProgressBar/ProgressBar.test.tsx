import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ProgressBar } from './ProgressBar'
import type { ProgressBarSize } from './ProgressBar'

const SIZES: ProgressBarSize[] = ['s', 'm']

describe('ProgressBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressBar value={60} ariaLabel="Goal progress" />)
    expect(container.firstChild).toHaveClass('mn-progress-bar')
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<ProgressBar value={60} size={size} ariaLabel="Goal progress" />)
    expect(container.firstChild).toHaveClass(`mn-progress-bar--${size}`)
  })

  it('exposes its value through the progressbar role', () => {
    render(<ProgressBar value={60} ariaLabel="Goal progress" />)
    expect(screen.getByRole('progressbar', { name: 'Goal progress' })).toHaveAttribute('aria-valuenow', '60')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ProgressBar value={60} ariaLabel="Goal progress" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
