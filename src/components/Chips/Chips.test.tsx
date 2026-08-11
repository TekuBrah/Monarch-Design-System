import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Chips } from './Chips'
import type { ChipsAppearance } from './Chips'

const APPEARANCES: ChipsAppearance[] = [
  'default', 'inprogress', 'moved', 'new', 'removed', 'success',
]

// Deviation, flagged: Chips is a presentational status pill with no ARIA role
// and no interaction, so queries go through its text rather than getByRole.
describe('Chips', () => {
  it('renders without crashing', () => {
    render(<Chips label="In progress" />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<Chips label="Status" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-chips--${appearance}`)
  })

  // isBold and its absence are mutually exclusive modifier classes, not a
  // present/absent toggle — both branches are asserted.
  it('switches between the bold and subtle weight modifiers', () => {
    const { container: bold } = render(<Chips label="Status" isBold />)
    expect(bold.firstChild).toHaveClass('mn-chips--bold')

    const { container: subtle } = render(<Chips label="Status" />)
    expect(subtle.firstChild).toHaveClass('mn-chips--subtle')
  })

  // C1. The `done` checkmark used to be unconditional, so a `removed` chip
  // still showed a tick. Omitted must keep it; null must remove it entirely.
  it('renders the done checkmark when icon is omitted', () => {
    const { container } = render(<Chips label="Linked" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders no glyph when icon is null', () => {
    const { container } = render(<Chips label="Removed" appearance="removed" icon={null} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    expect(screen.getByText('Removed')).toBeInTheDocument()
  })

  it('renders a caller-supplied glyph', () => {
    render(<Chips label="Removed" appearance="removed" icon={<span data-testid="custom" />} />)
    expect(screen.getByTestId('custom')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Chips label="In progress" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
