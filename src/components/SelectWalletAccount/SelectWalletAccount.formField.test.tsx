import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { SelectWalletAccount } from './SelectWalletAccount'
import { FormField } from '../FormField'
import { Avatar } from '../Avatar'
import { SELECT_WALLET_ACCOUNT_CASES } from '../../test/formControlCases'
import { readComponentCss, declaration } from '../../test/componentCss'

/* Gate 91 (v2.10.0) — SelectWalletAccount gains `leadingSlot` (G54) and reads
   FormField's context (R91D-7), and nothing else about it changes (R91D-8).

   OUTSIDE a FormField and WITHOUT `leadingSlot`, every existing render path
   must be byte-identical to v2.9.0: sha256 of `renderToStaticMarkup` per
   case, captured from the UNEDITED v2.9.0 component (HEAD 4806dd7) before the
   first source edit of Gate 91. The full strings are kept outside the repo,
   in the hand-over. */
const V2_9_0_MARKUP_SHA256: Record<string, string> = {
  'test: ariaLabel': 'd5428e75430ffbc1da7f5682d4e44cd6628903e5041e02af3005febbeee1eb19',
  'test: standard': 'd5428e75430ffbc1da7f5682d4e44cd6628903e5041e02af3005febbeee1eb19',
  'test: subtle': '382f3f4b5cf9b4f825c34c719e6438230978b240bf01e971c842f687a4303ad8',
  'test: filled': '7ae65b831e09c19f630fd7e4c43bfe5c54bbe142df42997523a4a17e0d86a767',
  'test: selected': 'eb3fb9570021862385be30fbdc2223d1cb66864af6e8efcadb9b0d5c2a8e83f7',
  'test: composed name': 'a3b00da7cd8d0b176753344c47ddefed53942a64888f36debb759b9001d79ceb',
  'test: disabled': '944e1bd190fe2df499e0102aa8c1c98f07c417680cd3f8ef05c0793a53983656',
  'test: invalid': '35e6afa5bb6ca74131432473fa82cdad5958e15554955e3b4cec08d85306bf8d',
  'test: sizing fixed': 'd5428e75430ffbc1da7f5682d4e44cd6628903e5041e02af3005febbeee1eb19',
  'test: sizing fill': '5c1f1d1261d891d6f496d564f9c66959169f41eb846788a35ff4f85640c3b9d3',
  'test: subtle fill': 'c1b93a8338f3ece7605613f44836c2b32f8225fb90a4ad2973097588589dec49',
  'showcase: default': '946be62abc424441aeab103f337ab3775a06a52f8fcc941a4836be798dfa4b87',
  'showcase: hover': '6a251c771feac85bd89a9d767582e1a8a940d79065805226e5d9165e7eaa0aab',
  'showcase: filled': '1fd59c28c998207eb19176552887ba81f2511199b18bb2fb4b8a2374052f1075',
  'showcase: selected': '7523e86e6cc9b535b359184d2e18e1bddf93a3e45108a1f8d4d40b818aeb99b9',
  'showcase: open, no menu': 'd6d671bbe991cfefb0e4b8b4145ccfb607eb381628711f270772bfe21f671836',
  'showcase: invalid': '65cf6493f709805947764e629b1fa41255972f2135e71bf7cfdd1b556153e330',
  'showcase: disabled': '3f21bf6fa811814195a28b14dfdceccb9e3cec5176873dec6c61d5d3d101d9e2',
  'showcase: fill': '48198627b7c0bc3f0e754bf778866aef91cb068dc6b8e812d43a7f0ee06bdb9b',
  'showcase: subtle default': 'c97815778d2efdbbf3f17ec92d3cb53505fa4d93a15a073e204ad919e35d954e',
  'showcase: subtle selected': 'fe7ea8eb92ceb16af278c1f9985d1f8e7958e03e32d6e626c0b1690fae43cc32',
  'showcase: subtle invalid': '26faec99ecfa2bd8c170b2d1903e5923be4fc8d7ae3e4f2b0bafb86926029af2',
  'showcase: subtle disabled': 'c20e212df51cd875bf003106e35cea8658a3777879f833bdfd615cb00a3b1f3f',
  'showcase: interactive demo at rest': 'db34814c2495da1414981bc170f78e213e62536219283dc47cdcbc012c6cb95a',
  'matrix: open with menu': 'ea7becb1eaab940f9ef6c2e88da8185c9f8451cc30946c8ab05742ece38f6edb',
  'matrix: no chevron, explicit id': '4d656791fa7b7f8d79ab1b034bb2c59f119d995fd2cd74d9a0157cf2f3ff83e8',
  'matrix: no labels': '9deaf6c02f39dc65246f456c6d4bd92a223cbade891f168761c96bda1183c247',
}

const sha = (html: string) => createHash('sha256').update(html).digest('hex')

const HELPER = 'Available RM 27,978.59'
const ERROR = 'This account cannot send money'
const MESSAGES = {
  none: {},
  helper: { helper: HELPER },
  error: { error: ERROR },
  both: { error: ERROR, helper: HELPER },
} as const
const COMBOS = Object.keys(MESSAGES) as (keyof typeof MESSAGES)[]

// Flow 4's From picker (1266:14392): Standard, Filled, `icon left` on.
const OWN_NAME = 'Main Account — 6235474597 • MN'
const AVATAR = <Avatar size="l" name="Margaret Tan" />
const from = (props = {}) => (
  <SelectWalletAccount
    labelCrypto="Main Account"
    labelWallet="6235474597 • MN"
    labelAmount="RM 27,978.59"
    state="filled"
    {...props}
  />
)
const RULES = readComponentCss('src/components/SelectWalletAccount/SelectWalletAccount.css')

describe('SelectWalletAccount and FormField (Gate 91)', () => {
  describe('outside a FormField, without leadingSlot: v2.9.0 markup, byte for byte', () => {
    it('has a recorded v2.9.0 hash for exactly the cases rendered here', () => {
      expect(SELECT_WALLET_ACCOUNT_CASES.map(([name]) => name)).toEqual(Object.keys(V2_9_0_MARKUP_SHA256))
    })

    it.each(SELECT_WALLET_ACCOUNT_CASES)('renders %s exactly as v2.9.0 did', (name, element) => {
      expect(sha(renderToStaticMarkup(element))).toBe(V2_9_0_MARKUP_SHA256[name])
    })
  })

  describe('leadingSlot (G54)', () => {
    it('renders the slot inside the trigger, before the name stack', () => {
      const { container } = render(from({ leadingSlot: AVATAR }))
      const main = container.querySelector('button > .mn-select-wallet-account__main')!
      expect([...main.children].map(c => c.className)).toEqual([
        'mn-select-wallet-account__leading',
        'mn-select-wallet-account__stack',
      ])
    })

    it('passes the slot content through unchanged', () => {
      const { container } = render(from({ leadingSlot: AVATAR }))
      expect(container.querySelector('.mn-select-wallet-account__leading')!.innerHTML).toBe(renderToStaticMarkup(AVATAR))
    })

    it('hides the slot from assistive technology', () => {
      const { container } = render(from({ leadingSlot: AVATAR }))
      expect(container.querySelector('.mn-select-wallet-account__leading')).toHaveAttribute('aria-hidden', 'true')
    })

    it('never reads the accessible name from the slot', () => {
      render(from({ leadingSlot: <span>Slot text</span> }))
      expect(screen.getByRole('button', { name: OWN_NAME })).toBeInTheDocument()
    })

    it('changes nothing but the slot element when given one', () => {
      const withSlot = renderToStaticMarkup(from({ leadingSlot: AVATAR }))
      const slot = `<span class="mn-select-wallet-account__leading" aria-hidden="true">${renderToStaticMarkup(AVATAR)}</span>`
      expect(withSlot.includes(slot)).toBe(true)
      expect(withSlot.replace(slot, '')).toBe(renderToStaticMarkup(from()))
    })

    it.each(['fixed', 'fill'] as const)('composes with sizing %s', sizing => {
      const { container } = render(from({ leadingSlot: AVATAR, sizing }))
      expect(container.firstChild).toHaveClass('mn-select-wallet-account')
      expect((container.firstChild as HTMLElement).classList.contains('mn-select-wallet-account--fill')).toBe(sizing === 'fill')
      expect(container.querySelector('.mn-select-wallet-account__leading')).not.toBeNull()
    })

    it('is a 40px flex box, centred (Figma <element> Size=XXL 40)', () => {
      const sel = '.mn-select-wallet-account__leading'
      expect(declaration(RULES, sel, 'display')).toBe('flex')
      expect(declaration(RULES, sel, 'align-items')).toBe('center')
      expect(declaration(RULES, sel, 'width')).toBe('var(--brand-scale-1000)')
      expect(declaration(RULES, sel, 'height')).toBe('var(--brand-scale-1000)')
      expect(declaration(RULES, sel, 'flex-shrink')).toBe('0')
    })

    it('has no axe violations with a leading avatar', async () => {
      const { container } = render(from({ leadingSlot: AVATAR }))
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('inside a FormField', () => {
    it('is named by the wrapper label followed by its own name', () => {
      const { container } = render(<FormField label="From" type="default">{from()}</FormField>)
      const button = screen.getByRole('button', { name: `From ${OWN_NAME}` })
      const labelId = container.querySelector('.mn-form-field__label')!.id
      expect(button.getAttribute('aria-labelledby')).toBe(`${labelId} ${button.id}`)
    })

    it('keeps a consumer ariaLabel as its own name, after the wrapper label', () => {
      render(<FormField label="From" type="default">{from({ ariaLabel: 'Choose account' })}</FormField>)
      expect(screen.getByRole('button', { name: 'From Choose account' })).toBeInTheDocument()
    })

    it('adds no aria-describedby when no message shows', () => {
      render(<FormField label="From" type="default">{from()}</FormField>)
      expect(screen.getByRole('button', { name: `From ${OWN_NAME}` })).not.toHaveAttribute('aria-describedby')
    })

    it('is described by the helper line', () => {
      render(<FormField label="From" type="default" helper={HELPER}>{from()}</FormField>)
      expect(screen.getByRole('button', { name: `From ${OWN_NAME}` })).toHaveAccessibleDescription(HELPER)
    })

    it('is described by the error line, without aria-invalid (unsupported on button)', () => {
      render(<FormField label="From" type="default" error={ERROR}>{from()}</FormField>)
      const button = screen.getByRole('button', { name: `From ${OWN_NAME}` })
      expect(button).toHaveAccessibleDescription(ERROR)
      expect(button).not.toHaveAttribute('aria-invalid')
    })

    it('is described by the error line then the helper line when both show', () => {
      render(<FormField label="From" type="default" error={ERROR} helper={HELPER}>{from()}</FormField>)
      expect(screen.getByRole('button', { name: `From ${OWN_NAME}` })).toHaveAccessibleDescription(`${ERROR} ${HELPER}`)
    })

    it.each(COMBOS)('has no axe violations with messages: %s', async combo => {
      const { container } = render(
        <FormField label="From" type="default" {...MESSAGES[combo]}>
          {from({ leadingSlot: AVATAR })}
        </FormField>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
