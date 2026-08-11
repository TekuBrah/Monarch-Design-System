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

  // B3 / G12. Same prop name and shape as Sheet's, positioned inside the
  // centred cell so icon+title centre as one unit (Figma header 1321:12708).
  it('renders a leading header icon beside the title', () => {
    const { baseElement } = render(
      <Modal isOpen onClose={() => {}} title="Smart insights" headerIconLeft={<span>lead</span>}>
        Body
      </Modal>,
    )
    const group = baseElement.querySelector('.mn-modal__title-group')!
    expect(group).toBeInTheDocument()
    expect(group.textContent).toBe('leadSmart insights')
    // The title still names the dialog — the wrapper must not break labelling.
    expect(screen.getByRole('dialog', { name: 'Smart insights' })).toBeInTheDocument()
  })

  // NO-CHANGE PROOF: the wrapper is new DOM for every existing call site, so
  // the no-icon render must keep the same title element, id and accessible name.
  it('keeps the title element and labelling unchanged when no icon is given', () => {
    const { baseElement } = render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    const group = baseElement.querySelector('.mn-modal__title-group')!
    const title = baseElement.querySelector('h2.mn-modal__title')!
    expect(group.children).toHaveLength(1)
    expect(group.firstElementChild).toBe(title)
    expect(title).toHaveClass('type-body-m-semibold')
    expect(screen.getByRole('dialog', { name: 'Confirm' })).toHaveAttribute(
      'aria-labelledby',
      title.getAttribute('id'),
    )
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
