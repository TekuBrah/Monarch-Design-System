import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Modal } from './Modal'

// SMOKE SCOPE ONLY. Modal has real lifecycle — focus trap, Escape-to-close
// (implemented, per Step 0.5) and scrim-click dismissal. None of that is tested
// here by design; it is flagged as a candidate for deeper testing later, same
// as Blanket (Batch 1) and DatePicker/TimePicker (Batch 2).
describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Confirm' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('renders its children and footer content', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Confirm" footer={<span>Footer</span>}>
        Body
      </Modal>,
    )
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('has no axe violations while open', async () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
