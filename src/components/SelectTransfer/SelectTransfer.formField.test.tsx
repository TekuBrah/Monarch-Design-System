import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { SelectTransfer } from './SelectTransfer'
import { FormField } from '../FormField'
import { SELECT_TRANSFER_CASES } from '../../test/formControlCases'

/* Gate 91 (v2.10.0) — SelectTransfer reads FormField's context (R91D-7), and
   nothing else about it changes (R91D-8).

   OUTSIDE a FormField every existing render path must be byte-identical to
   v2.9.0: sha256 of `renderToStaticMarkup` per case, captured from the
   UNEDITED v2.9.0 component (HEAD 4806dd7) before the first source edit of
   Gate 91. The full strings are kept outside the repo, in the hand-over. */
const V2_9_0_MARKUP_SHA256: Record<string, string> = {
  'test: ariaLabel': '2c7acaed16c7b2042834472a7cfe189262acbd4da634c0c8137e07235cdbfd23',
  'test: standard': '2c7acaed16c7b2042834472a7cfe189262acbd4da634c0c8137e07235cdbfd23',
  'test: subtle': '69ddd5396abcf168d75891f5a961abaecdc44f32dc8e794eafd6f7a2991cc32c',
  'test: attention': '11274acbd6c268d6897c56f8460e89125b4b721a05d1beec1daf0f9606c9326b',
  'test: disabled with currency': 'daf3341a575f3d3475fec880c2d8846c3a0d9338842bfc87893d3c77b59f24f3',
  'test: invalid': '30ef1be844cc5ac3697dc43e1895caa052a1982836c18d83fcf05a3bd7f290aa',
  'test: currency': 'a9372b37a0c5db0260b8dee059a63d7969679c16a0a6661287af3ad17c7352ca',
  'test: sizing fixed': '2c7acaed16c7b2042834472a7cfe189262acbd4da634c0c8137e07235cdbfd23',
  'test: sizing fill': '60fafb9b8e475a7102f237a0fb2d23056293400708e193263458174c01f47767',
  'test: attention fill': '8a44cee9c651bf7620196d325b2c017e7d3f241dd9c4090853fa2610dc772e66',
  'showcase: default': 'f92a13e821a6966247d61ccaf8750870f971f4add8ab44def60129706f26df59',
  'showcase: focus': 'b993638b5cb9e5e00282e13602a6d88809ffd7432447ea4466f5cec9724a8064',
  'showcase: filled': '7353876fb6d63764d498cfac42da1be338eecfe57d9e7f90b0d4956e901c8977',
  'showcase: invalid': '6d9702a085c426ec00a05ca2f032457595160d143368bf357287449a6176e218',
  'showcase: disabled': '34874fbe084e2cf2d16651a5b6ac89b10c7698c800499257ae52cab9055a9c9f',
  'showcase: subtle': 'd722e7c2c97d113eff3b415a7f07279b5bd7846b1b930e7ef2a39efc7d5661ce',
  'showcase: subtle focus': 'a9d16350868d58478c84b3de84352bd5caba4d967421461f1a2fa1f828c29ee5',
  'showcase: attention': '420c586ba44dfa5fd25bae5ac13f3d6e9a369dc83ddf732656cea7b6b4791d94',
  'showcase: attention empty': 'e5a79ee97b0d317cbceba05a3fa88460bb62324b764bdb426e877da0e0b3ad1e',
  'showcase: attention hover': '42d3e12781371c78236dd9f04cb59fb87ac2373a981347603d74a150b0698162',
  'showcase: attention invalid': '5bfebccbf1beeaa3bee685747203695a6136ad172bbf7e58f778747b4295fc84',
  'showcase: attention disabled': '473730c7ac0a977770014f8361cd463cda69172fc417e98b76496dd4f876cffa',
  'showcase: fill': '91f32bfdc65760df661287be0e5e7c2e1a2c76c4cf59a5cf6940cfe20fcdd857',
  'matrix: amount menu open': '0221fe7d2fd5d6cf0a4b644355e84a8227a437813c79c1acc5647969aea0e0f8',
  'matrix: currency menu open': '003b28be6385001f58ccf1938fddea0b0672c0c25ac2c68b0aa2de3955f9f91d',
  'matrix: attention selected currency open': '0ae5b01f6197d0f191e3a61cdbb5f264a03af5c733a274981602a226ac9e182a',
  'matrix: selected with id': '2456bceab0a182b15f919a949330a545433b98722c13727a6ca07a7c570bf80e',
  'matrix: no label, no ariaLabel': '60781de4afe011cf72dbf3b2fb628ec2222410f1ad919d7f05b08caa99dc5f37',
}

const sha = (html: string) => createHash('sha256').update(html).digest('hex')

const HELPER = 'Daily limit RM 50,000.00'
const ERROR = 'More than your balance'
const MESSAGES = {
  none: {},
  helper: { helper: HELPER },
  error: { error: ERROR },
  both: { error: ERROR, helper: HELPER },
} as const
const COMBOS = Object.keys(MESSAGES) as (keyof typeof MESSAGES)[]

// Flow 4's amount: Select / Transfer, Appearance=Attention, State=Selected,
// inside Input Type=Transfer, its own caption label turned off.
const amount = (props = {}) => (
  <SelectTransfer appearance="attention" value="2550.00" currencyLabel="MYR" isSelected {...props} />
)

describe('SelectTransfer and FormField (Gate 91)', () => {
  describe('outside a FormField: v2.9.0 markup, byte for byte', () => {
    it('has a recorded v2.9.0 hash for exactly the cases rendered here', () => {
      expect(SELECT_TRANSFER_CASES.map(([name]) => name)).toEqual(Object.keys(V2_9_0_MARKUP_SHA256))
    })

    it.each(SELECT_TRANSFER_CASES)('renders %s exactly as v2.9.0 did', (name, element) => {
      expect(sha(renderToStaticMarkup(element))).toBe(V2_9_0_MARKUP_SHA256[name])
    })
  })

  describe('inside a FormField', () => {
    it('names the amount combobox by the wrapper label', () => {
      render(<FormField label="Transfer Amount" type="transfer">{amount()}</FormField>)
      const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
      expect(input.getAttribute('aria-labelledby')).toBe(document.querySelector('.mn-form-field__label')!.id)
    })

    it.each(['standard', 'attention'] as const)(
      'renders no caption label of its own in the %s appearance, even when given one',
      appearance => {
        const { container } = render(
          <FormField label="Transfer Amount" type="transfer">
            {amount({ appearance, label: 'Send', ariaLabel: 'Other' })}
          </FormField>,
        )
        expect(container.querySelector('.mn-select-transfer__label')).toBeNull()
        const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
        expect(input).not.toHaveAttribute('aria-label')
      },
    )

    it('adds no aria-describedby and no aria-invalid when no message shows', () => {
      render(<FormField label="Transfer Amount" type="transfer">{amount()}</FormField>)
      const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
      expect(input).not.toHaveAttribute('aria-describedby')
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('is described by the helper line, and stays valid', () => {
      render(<FormField label="Transfer Amount" type="transfer" helper={HELPER}>{amount()}</FormField>)
      const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
      expect(input).toHaveAccessibleDescription(HELPER)
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('is described by the error line, and marked invalid (combobox supports it)', () => {
      render(<FormField label="Transfer Amount" type="transfer" error={ERROR}>{amount()}</FormField>)
      const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
      expect(input).toHaveAccessibleDescription(ERROR)
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('is described by the error line then the helper line when both show', () => {
      render(
        <FormField label="Transfer Amount" type="transfer" error={ERROR} helper={HELPER}>
          {amount()}
        </FormField>,
      )
      expect(screen.getByRole('combobox', { name: 'Transfer Amount' })).toHaveAccessibleDescription(`${ERROR} ${HELPER}`)
    })

    it('leaves the currency button named as before', () => {
      render(<FormField label="Transfer Amount" type="transfer" error={ERROR}>{amount()}</FormField>)
      const button = screen.getByRole('button', { name: 'Choose currency' })
      expect(button).not.toHaveAttribute('aria-describedby')
    })

    it.each(COMBOS)('has no axe violations with messages: %s', async combo => {
      const { container } = render(
        <FormField label="Transfer Amount" type="transfer" {...MESSAGES[combo]}>
          {amount()}
        </FormField>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
