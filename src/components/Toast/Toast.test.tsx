import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Toast } from './Toast'
import type { ToastAppearance } from './Toast'

const APPEARANCES: ToastAppearance[] = [
  'information', 'success', 'warning', 'error', 'discovery', 'ai',
]

// Deviation, flagged: the brief anticipated a visibility prop and auto-dismiss
// timing, but Toast has NEITHER — it always renders, and `onDismiss` is only a
// callback for the ✕ affordance (no timer exists in the component). So there is
// no open/closed pair to assert. Presentation/dismissal lifecycle is owned by
// the caller; flagged as a candidate for deeper testing later.
describe('Toast', () => {
  it('renders without crashing, as a polite live region', () => {
    render(<Toast title="Saved" />)
    const toast = screen.getByRole('status')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveAttribute('aria-live', 'polite')
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<Toast title="Saved" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-toast--${appearance}`)
  })

  it('switches to an assertive alert when role="alert" is requested', () => {
    render(<Toast title="Failed" role="alert" />)
    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders the dismiss affordance only when onDismiss is given', () => {
    const { unmount } = render(<Toast title="Saved" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    unmount()

    render(<Toast title="Saved" onDismiss={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Toast title="Saved" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
