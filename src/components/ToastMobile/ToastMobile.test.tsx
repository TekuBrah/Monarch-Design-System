import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ToastMobile } from './ToastMobile'
import type { ToastAppearance } from '../Toast'

const APPEARANCES: ToastAppearance[] = [
  'information', 'success', 'warning', 'error', 'discovery', 'ai',
]

// Same deviation as Toast: no visibility prop and no auto-dismiss timer exist,
// so there is no open/closed pair to assert. Flagged for deeper testing later.
describe('ToastMobile', () => {
  it('renders without crashing, as a polite live region', () => {
    render(<ToastMobile title="Saved" />)
    const toast = screen.getByRole('status')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveAttribute('aria-live', 'polite')
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<ToastMobile title="Saved" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-toast-mobile--${appearance}`)
  })

  it('switches to an assertive alert when role="alert" is requested', () => {
    render(<ToastMobile title="Failed" role="alert" />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders the dismiss affordance only when onDismiss is given', () => {
    const { unmount } = render(<ToastMobile title="Saved" />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
    unmount()

    render(<ToastMobile title="Saved" onDismiss={() => {}} />)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ToastMobile title="Saved" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
