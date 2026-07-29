import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Divider } from './Divider'
import type { DividerOrientation, DividerWeight } from './Divider'

const ORIENTATIONS: DividerOrientation[] = ['horizontal', 'vertical']
const WEIGHTS: DividerWeight[] = [1, 2]

describe('Divider', () => {
  it('renders without crashing', () => {
    expect(render(<Divider />).container.firstChild).toHaveClass('mn-divider')
  })

  it.each(ORIENTATIONS)('renders the %s orientation', orientation => {
    render(<Divider orientation={orientation} />)
    const sep = screen.getByRole('separator')
    expect(sep).toHaveClass(`mn-divider--${orientation}`)
    expect(sep).toHaveAttribute('aria-orientation', orientation)
  })

  it.each(WEIGHTS)('renders weight %s', weight => {
    render(<Divider weight={weight} />)
    expect(screen.getByRole('separator')).toHaveClass(`mn-divider--w${weight}`)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Divider />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
