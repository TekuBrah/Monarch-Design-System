import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ProgressRing } from './ProgressRing'
import type { ProgressRingSize } from './ProgressRing'

const SIZES: ProgressRingSize[] = ['m', 'l']

describe('ProgressRing', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressRing value={65} />)
    expect(container.firstChild).toHaveClass('mn-progress-ring')
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<ProgressRing value={65} size={size} />)
    expect(container.firstChild).toHaveClass(`mn-progress-ring--${size}`)
  })

  it('exposes its value through the progressbar role', () => {
    render(<ProgressRing value={65} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '65')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ProgressRing value={65} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
