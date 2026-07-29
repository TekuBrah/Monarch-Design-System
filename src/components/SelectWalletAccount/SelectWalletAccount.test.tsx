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
})
