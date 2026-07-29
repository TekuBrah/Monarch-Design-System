import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardAction } from './CardAction'

const props = { icon: <span />, title: 'Transfer', description: 'Move money' }

describe('CardAction', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardAction {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-action')
  })

  it('renders as a plain div when no onClick is given', () => {
    render(<CardAction {...props} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<CardAction {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Transfer/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CardAction {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Transfer/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardAction {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
