import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ChartLegendItem } from './ChartLegendItem'
import type { ChartLegendItemVariant } from './ChartLegendItem'

const VARIANTS: ChartLegendItemVariant[] = ['legend', 'contribution']
const props = { title: 'Groceries', amount: 'RM 240.00' }

describe('ChartLegendItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChartLegendItem {...props} />)
    expect(container.firstChild).toHaveClass('mn-chart-legend-item')
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    const { container } = render(<ChartLegendItem {...props} variant={variant} />)
    expect(container.firstChild).toHaveClass(`mn-chart-legend-item--${variant}`)
  })

  it('renders its title and amount', () => {
    render(<ChartLegendItem {...props} />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('RM 240.00')).toBeInTheDocument()
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<ChartLegendItem {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Groceries/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ChartLegendItem {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Groceries/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ChartLegendItem {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
