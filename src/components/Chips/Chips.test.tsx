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

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Chips label="In progress" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
