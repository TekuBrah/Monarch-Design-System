import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { TrendIndicator } from './TrendIndicator'
import type { TrendDirection } from './TrendIndicator'

const DIRECTIONS: TrendDirection[] = ['up', 'down', 'flat']

describe('TrendIndicator', () => {
  it('renders without crashing', () => {
    const { container } = render(<TrendIndicator direction="up" label="2.49%" />)
    expect(container.firstChild).toHaveClass('mn-trend')
  })

  it.each(DIRECTIONS)('renders the %s direction', direction => {
    const { container } = render(<TrendIndicator direction={direction} label="2.49%" />)
    expect(container.firstChild).toHaveClass(`mn-trend--${direction}`)
  })

  it('renders its label', () => {
    render(<TrendIndicator direction="down" label="-2.49%" />)
    expect(screen.getByText('-2.49%')).toBeInTheDocument()
  })

  // The whole point of the component: colour and glyph shape are invisible to a
  // screen reader, so direction has to be a word.
  it.each([
    ['up', 'Increase, 2.49%'],
    ['down', 'Decrease, 2.49%'],
    ['flat', 'No change, 2.49%'],
  ] as const)('announces %s as a word', (direction, expected) => {
    render(<TrendIndicator direction={direction} label="2.49%" />)
    expect(screen.getByRole('img', { name: expected })).toBeInTheDocument()
  })

  // A signed label would otherwise be stated twice — "Decrease, minus 2.49%".
  it('strips a leading sign from the announcement but keeps it visible', () => {
    render(<TrendIndicator direction="down" label="-2.49%" />)
    expect(screen.getByRole('img', { name: 'Decrease, 2.49%' })).toBeInTheDocument()
    expect(screen.getByText('-2.49%')).toBeInTheDocument()
  })

  it('strips a leading plus as well', () => {
    render(<TrendIndicator direction="up" label="+10.2%" />)
    expect(screen.getByRole('img', { name: 'Increase, 10.2%' })).toBeInTheDocument()
  })

  it('lets ariaLabel override the composed announcement', () => {
    render(<TrendIndicator direction="up" label="2.49%" ariaLabel="Up 2.49 percent today" />)
    expect(screen.getByRole('img', { name: 'Up 2.49 percent today' })).toBeInTheDocument()
  })

  it.each(DIRECTIONS)('has no axe violations in the %s direction', async direction => {
    const { container } = render(<TrendIndicator direction={direction} label="2.49%" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
