import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { StatusBar } from './StatusBar'
import type { StatusBarMode } from './StatusBar'

const MODES: StatusBarMode[] = ['Light', 'Dark']

// Per Step 0.3, StatusBar deliberately uses non-flipping --alias-* tokens (it is
// fake OS chrome, not app surface). That is intentional and documented, so no
// dark-mode colour assertions are made here — `mode` is asserted structurally.
describe('StatusBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatusBar />)
    expect(container.firstChild).toHaveClass('mn-status-bar')
  })

  it.each(MODES)('renders %s mode with its lowercased modifier class', mode => {
    const { container } = render(<StatusBar mode={mode} />)
    expect(container.firstChild).toHaveClass(`mn-status-bar--${mode.toLowerCase()}`)
  })

  it('renders its time', () => {
    render(<StatusBar time="10:30" />)
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<StatusBar />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
