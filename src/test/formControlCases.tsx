import type { ReactElement } from 'react'
import { Field } from '../components/Field'
import { SelectTransfer } from '../components/SelectTransfer'
import { SelectWalletAccount } from '../components/SelectWalletAccount'
import { ElementWrapper } from '../components/ElementWrapper'
import { Icon } from '../components/Icon'

/* Gate 91 (v2.10.0) — the existing render paths of the three controls that
   learn to read FormField's context: Field, SelectTransfer, SelectWalletAccount.

   Each case is rendered OUTSIDE a FormField and WITHOUT the new
   `leadingSlot` prop. The sha256 of its `renderToStaticMarkup` was captured
   from the UNEDITED v2.9.0 tree (HEAD 4806dd7) before the first source edit
   of Gate 91, and is pinned in `<Control>.formField.test.tsx`. R91D-8: every
   one must stay byte-identical.

   The list covers every render in the control's own test file, every render
   in showcase/App.tsx, and a matrix over the props that reach the markup.
   Callbacks are included where they exist; they never reach static markup,
   so including them proves only that wiring them changes nothing. */

const noop = () => {}

const SHOWCASE_FLAG = (
  <ElementWrapper size="m">
    <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--mapped-surface-primary-default-subtle-hover)', border: '1px solid var(--mapped-border-subtlest-default)', display: 'block' }} />
  </ElementWrapper>
)
const ICON = <Icon name="add" size="m" />
const MENU = <div data-testid="menu">menu</div>

export const FIELD_CASES: [string, ReactElement][] = [
  // Field.test.tsx
  ['test: ariaLabel', <Field ariaLabel="Search" />],
  ['test: standard', <Field ariaLabel="Search" appearance="standard" />],
  ['test: subtle', <Field ariaLabel="Search" appearance="subtle" />],
  ['test: visible label', <Field label="Amount" />],
  ['test: compact', <Field isCompact ariaLabel="Search" />],
  ['test: disabled', <Field ariaLabel="Search" isDisabled />],
  ['test: invalid', <Field ariaLabel="Search" isInvalid />],
  ['test: required', <Field ariaLabel="Search" isRequired />],
  ['test: sizing fixed', <Field ariaLabel="Search" sizing="fixed" />],
  ['test: sizing fill', <Field ariaLabel="Search" sizing="fill" />],
  ['test: compact fill', <Field isCompact ariaLabel="Search" sizing="fill" />],
  // showcase/App.tsx
  ['showcase: sheet note', <Field label="Note" placeholder="What was this for?" />],
  ['showcase: sidebar search', <Field placeholder="Search components…" value="" onChange={noop} leadingIcon={<Icon name="search" size="s" />} ariaLabel="Search components" />],
  ['showcase: default', <Field placeholder="Placeholder" ariaLabel="Default" leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: hover', <Field placeholder="Placeholder" ariaLabel="Hover" previewState="hover" leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: focus', <Field placeholder="Placeholder" ariaLabel="Focus" previewState="focus" leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: filled', <Field defaultValue="Filled value" ariaLabel="Filled" leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: labelled', <Field label="Label" placeholder="Placeholder" leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: labelled invalid', <Field label="Label" placeholder="Placeholder" isInvalid leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: labelled disabled', <Field label="Label" placeholder="Placeholder" isDisabled leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: subtle', <Field appearance="subtle" placeholder="Placeholder" ariaLabel="Subtle" leadingIcon={ICON} trailingIcon={ICON} />],
  ['showcase: compact add', <Field isCompact ariaLabel="Compact add" leadingIcon={ICON} />],
  ['showcase: compact focus', <Field isCompact previewState="focus" ariaLabel="Compact focus" leadingIcon={ICON} />],
  // matrix
  ['matrix: label required invalid', <Field label="Amount" isRequired isInvalid />],
  ['matrix: label with ariaLabel', <Field label="Amount" ariaLabel="Ignored" />],
  ['matrix: every other prop', <Field appearance="subtle" label="Amount" placeholder="0.00" value="12" onChange={noop} leadingIcon={ICON} trailingIcon={ICON} isRequired isInvalid id="amount" name="amount" type="number" previewState="focus" sizing="fill" />],
  ['matrix: explicit id, no label', <Field id="search" ariaLabel="Search" />],
]

export const SELECT_TRANSFER_CASES: [string, ReactElement][] = [
  // SelectTransfer.test.tsx
  ['test: ariaLabel', <SelectTransfer ariaLabel="Amount" />],
  ['test: standard', <SelectTransfer ariaLabel="Amount" appearance="standard" />],
  ['test: subtle', <SelectTransfer ariaLabel="Amount" appearance="subtle" />],
  ['test: attention', <SelectTransfer ariaLabel="Amount" appearance="attention" />],
  ['test: disabled with currency', <SelectTransfer ariaLabel="Amount" currencyLabel="MYR" isDisabled />],
  ['test: invalid', <SelectTransfer ariaLabel="Amount" isInvalid />],
  ['test: currency', <SelectTransfer ariaLabel="Amount" currencyLabel="MYR" />],
  ['test: sizing fixed', <SelectTransfer ariaLabel="Amount" sizing="fixed" />],
  ['test: sizing fill', <SelectTransfer ariaLabel="Amount" sizing="fill" />],
  ['test: attention fill', <SelectTransfer ariaLabel="Amount" appearance="attention" sizing="fill" />],
  // showcase/App.tsx
  ['showcase: default', <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} ariaLabel="Default" />],
  ['showcase: focus', <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} previewState="focus" ariaLabel="Focus" />],
  ['showcase: filled', <SelectTransfer label="Amount" value="1,250.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} ariaLabel="Filled" />],
  ['showcase: invalid', <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} isInvalid ariaLabel="Invalid" />],
  ['showcase: disabled', <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} isDisabled ariaLabel="Disabled" />],
  ['showcase: subtle', <SelectTransfer appearance="subtle" label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} ariaLabel="Subtle" />],
  ['showcase: subtle focus', <SelectTransfer appearance="subtle" label="Amount" value="1,250.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} previewState="focus" ariaLabel="Subtle focus" />],
  ['showcase: attention', <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} ariaLabel="Attention" />],
  ['showcase: attention empty', <SelectTransfer appearance="attention" label="Send" placeholder="0" currencyLabel="ETH" currencyFlag={SHOWCASE_FLAG} ariaLabel="Attention empty" />],
  ['showcase: attention hover', <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} previewState="hover" ariaLabel="Attention hover" />],
  ['showcase: attention invalid', <SelectTransfer appearance="attention" label="Send" placeholder="0" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} isInvalid ariaLabel="Attention invalid" />],
  ['showcase: attention disabled', <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} isDisabled ariaLabel="Attention disabled" />],
  ['showcase: fill', <SelectTransfer sizing="fill" label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} ariaLabel="Fill" />],
  // matrix
  ['matrix: amount menu open', <SelectTransfer label="Recipient" ariaLabel="Recipient" isOpen menuSlot={MENU} onOpenChange={noop} onAmountChange={noop} value="Ali" />],
  ['matrix: currency menu open', <SelectTransfer label="Amount" currencyLabel="MYR" isCurrencyOpen currencyMenuSlot={MENU} onCurrencyClick={noop} />],
  ['matrix: attention selected currency open', <SelectTransfer appearance="attention" label="Send" value="2550.00" currencyLabel="MYR" currencyFlag={SHOWCASE_FLAG} isSelected isCurrencyOpen currencyMenuSlot={MENU} />],
  ['matrix: selected with id', <SelectTransfer id="amount" label="Amount" value="10" isSelected />],
  ['matrix: no label, no ariaLabel', <SelectTransfer placeholder="0.00" />],
]

export const SELECT_WALLET_ACCOUNT_CASES: [string, ReactElement][] = [
  // SelectWalletAccount.test.tsx
  ['test: ariaLabel', <SelectWalletAccount ariaLabel="Wallet" />],
  ['test: standard', <SelectWalletAccount ariaLabel="Wallet" appearance="standard" />],
  ['test: subtle', <SelectWalletAccount ariaLabel="Wallet" appearance="subtle" />],
  ['test: filled', <SelectWalletAccount ariaLabel="Wallet" state="filled" />],
  ['test: selected', <SelectWalletAccount ariaLabel="Wallet" state="selected" />],
  ['test: composed name', <SelectWalletAccount labelCrypto="Ethereum" labelWallet="Main" />],
  ['test: disabled', <SelectWalletAccount ariaLabel="Wallet" isDisabled />],
  ['test: invalid', <SelectWalletAccount ariaLabel="Wallet" isInvalid />],
  ['test: sizing fixed', <SelectWalletAccount ariaLabel="Wallet" sizing="fixed" />],
  ['test: sizing fill', <SelectWalletAccount ariaLabel="Wallet" sizing="fill" />],
  ['test: subtle fill', <SelectWalletAccount ariaLabel="Wallet" appearance="subtle" sizing="fill" />],
  // showcase/App.tsx
  ['showcase: default', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" ariaLabel="Default" />],
  ['showcase: hover', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" previewState="hover" ariaLabel="Hover" />],
  ['showcase: filled', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" state="filled" ariaLabel="Filled" />],
  ['showcase: selected', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" state="selected" ariaLabel="Selected" />],
  ['showcase: open, no menu', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isOpen ariaLabel="Typing (open)" />],
  ['showcase: invalid', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isInvalid ariaLabel="Invalid" />],
  ['showcase: disabled', <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isDisabled ariaLabel="Disabled" />],
  ['showcase: fill', <SelectWalletAccount sizing="fill" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" ariaLabel="Fill" />],
  ['showcase: subtle default', <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" ariaLabel="Subtle default" />],
  ['showcase: subtle selected', <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" state="selected" ariaLabel="Subtle selected" />],
  ['showcase: subtle invalid', <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isInvalid ariaLabel="Subtle invalid" />],
  ['showcase: subtle disabled', <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isDisabled ariaLabel="Subtle disabled" />],
  ['showcase: interactive demo at rest', <SelectWalletAccount labelCrypto="Bitcoin" labelWallet="Main Wallet" labelAmount="$12,450.00" labelAmtCrypto="0.42 BTC" state="selected" isOpen={false} onOpenChange={noop} ariaLabel="Choose account" menuSlot={MENU} />],
  // matrix
  ['matrix: open with menu', <SelectWalletAccount labelCrypto="Main Account" labelWallet="6235474597 • MN" labelAmount="RM 27,978.59" isOpen menuSlot={MENU} onOpenChange={noop} />],
  ['matrix: no chevron, explicit id', <SelectWalletAccount id="from" labelCrypto="Main Account" showChevron={false} state="filled" />],
  ['matrix: no labels', <SelectWalletAccount />],
]
