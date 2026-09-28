import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { SelectWalletAccount } from './SelectWalletAccount'
import type {
  SelectWalletAccountAppearance,
  SelectWalletAccountState,
} from './SelectWalletAccount'

const APPEARANCES: SelectWalletAccountAppearance[] = ['standard', 'subtle']
const STATES: SelectWalletAccountState[] = ['default', 'filled', 'selected']

// Its accessible name is composed from labelCrypto/labelWallet unless ariaLabel
// is given (per SelectWalletAccount.tsx), so an explicit ariaLabel is used here.
describe('SelectWalletAccount', () => {
  it('renders without crashing', () => {
    render(<SelectWalletAccount ariaLabel="Wallet" />)
    expect(screen.getByRole('button', { name: 'Wallet' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<SelectWalletAccount ariaLabel="Wallet" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-select-wallet-account--${appearance}`)
  })

  // `default` intentionally produces no state modifier class (see the component's
  // className construction), so only the two non-default states are asserted.
  it.each(STATES.filter(s => s !== 'default'))('renders the %s state', state => {
    const { container } = render(<SelectWalletAccount ariaLabel="Wallet" state={state} />)
    expect(container.firstChild).toHaveClass(`mn-select-wallet-account--${state}`)
  })

  it('composes its accessible name from the crypto and wallet labels', () => {
    render(<SelectWalletAccount labelCrypto="Ethereum" labelWallet="Main" />)
    expect(screen.getByRole('button', { name: 'Ethereum — Main' })).toBeInTheDocument()
  })

  // Step 1.2: native-backed — its root interactive element IS a <button>, so
  // isDisabled reaches a real disabled attribute (no outer JS guard involved).
  it('natively disables the trigger button when isDisabled is set', () => {
    render(<SelectWalletAccount ariaLabel="Wallet" isDisabled />)
    expect(screen.getByRole('button', { name: 'Wallet' })).toBeDisabled()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<SelectWalletAccount ariaLabel="Wallet" isInvalid />)
    expect(screen.getByRole('button', { name: 'Wallet' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<SelectWalletAccount ariaLabel="Wallet" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // G19 (Gate 73). Same shape as Select.sizing (G15). Asserted by class, never
  // by pixels: jsdom applies no stylesheet, and any container at or under 320px
  // renders both modes identically anyway.
  describe('sizing', () => {
    it('omits the wallet fill modifier by default', () => {
      const { container } = render(<SelectWalletAccount ariaLabel="Wallet" />)
      expect(container.firstChild).toHaveClass('mn-select-wallet-account')
      expect(container.firstChild).not.toHaveClass('mn-select-wallet-account--fill')
    })

    it('applies the wallet fill modifier when sizing is fill', () => {
      const { container } = render(<SelectWalletAccount ariaLabel="Wallet" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-select-wallet-account--fill')
    })

    it("treats an explicit wallet 'fixed' as identical to omitting the prop", () => {
      const a = render(<SelectWalletAccount ariaLabel="Wallet" sizing="fixed" />)
      const explicit = (a.container.firstChild as HTMLElement).className
      a.unmount()
      const b = render(<SelectWalletAccount ariaLabel="Wallet" />)
      expect(explicit).toBe((b.container.firstChild as HTMLElement).className)
    })

    it.each(APPEARANCES)('composes wallet fill alongside the %s appearance', appearance => {
      const { container } = render(
        <SelectWalletAccount ariaLabel="Wallet" appearance={appearance} sizing="fill" />,
      )
      expect(container.firstChild).toHaveClass(`mn-select-wallet-account--${appearance}`)
      expect(container.firstChild).toHaveClass('mn-select-wallet-account--fill')
    })
  })
})
