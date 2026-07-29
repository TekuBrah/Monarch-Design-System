import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Logo } from './Logo'
import type { LogoName, LogoSize } from './Logo'

const SIZES: LogoSize[] = ['xs', 's', 'm', 'l']

// Deviation, flagged: LogoName is an exported union, but it is an asset CATALOG
// (30+ brand/company/crypto marks), not a variant axis. Iterating all of them
// would be an asset-inventory test, not a smoke test, so one representative
// name is used and LogoSize is iterated in full instead.
const NAME: LogoName = 'monarch_logo_style_thick'

describe('Logo', () => {
  it('renders without crashing', () => {
    const { container } = render(<Logo name={NAME} />)
    expect(container.firstChild).toHaveClass('mn-logo')
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<Logo name={NAME} size={size} />)
    expect(container.firstChild).toHaveClass(`mn-logo--${size}`)
  })

  it('renders nothing for an unknown logo name', () => {
    // Cast is deliberate: exercising the runtime guard for a name outside the union.
    const { container } = render(<Logo name={'not_a_real_logo' as LogoName} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Logo name={NAME} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
