import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardGoals } from './CardGoals'

const props = { title: 'New laptop', percentage: 60, current: 'RM 600', total: 'RM 1,000' }

describe('CardGoals', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardGoals {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-goals')
  })

  it('renders its title and nested ProgressBar', () => {
    render(<CardGoals {...props} />)
    expect(screen.getByText('New laptop')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<CardGoals {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /New laptop/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CardGoals {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /New laptop/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardGoals {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
