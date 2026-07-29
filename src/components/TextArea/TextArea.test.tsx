import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { TextArea } from './TextArea'
import type { TextAreaAppearance } from './TextArea'

const APPEARANCES: TextAreaAppearance[] = ['standard', 'subtle']

// TextArea has no isRequired prop — that is audit finding #24's documented
// coverage gap, not something this suite asserts around.
describe('TextArea', () => {
  it('renders without crashing', () => {
    render(<TextArea ariaLabel="Notes" />)
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<TextArea ariaLabel="Notes" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-textarea--${appearance}`)
  })

  it('associates a visible label with the textarea', () => {
    render(<TextArea label="Notes" />)
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument()
  })

  // Step 1.2: native-backed — isDisabled reaches the real <textarea disabled>.
  it('natively disables the textarea when isDisabled is set', () => {
    render(<TextArea ariaLabel="Notes" isDisabled />)
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDisabled()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<TextArea ariaLabel="Notes" isInvalid />)
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<TextArea ariaLabel="Notes" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
