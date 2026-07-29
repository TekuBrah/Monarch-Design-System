import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardFeaturesAndEducation } from './CardFeaturesAndEducation'
import type { CardFeaturesVariant } from './CardFeaturesAndEducation'

const VARIANTS: CardFeaturesVariant[] = ['blue', 'orange', 'green', 'purple', 'outline']
const props = { icon: <span />, title: 'Learn investing' }

describe('CardFeaturesAndEducation', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardFeaturesAndEducation {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-features')
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    const { container } = render(<CardFeaturesAndEducation {...props} variant={variant} />)
    expect(container.firstChild).toHaveClass(`mn-card-features--${variant}`)
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<CardFeaturesAndEducation {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Learn investing/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CardFeaturesAndEducation {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Learn investing/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardFeaturesAndEducation {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
