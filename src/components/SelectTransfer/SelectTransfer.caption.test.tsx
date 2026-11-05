import { cloneElement } from 'react'
import type { ReactElement } from 'react'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { SelectTransfer } from './SelectTransfer'
import type { SelectTransferAppearance } from './SelectTransfer'
import { FormField } from '../FormField'
import { SELECT_TRANSFER_CASES } from '../../test/formControlCases'

/* Gate 97 (v2.13.0), R97-1 / G64 — `caption`.

   Flow 5's amount (`1266:14398`) turns the Select / Transfer `Label` text layer
   on and fills it with the converted token quantity, "0.313 ETH". That is a
   description of the value, not a label, so it renders in the label slot as a
   `<span id>` and its id is APPENDED to the input's `aria-describedby`, after
   the FormField's error and helper ids. The name stays the form row's. */

const APPEARANCES: SelectTransferAppearance[] = ['standard', 'subtle', 'attention']
const TYPE_CLASS: Record<SelectTransferAppearance, string> = {
  standard: 'type-body-caption',
  subtle: 'type-body-caption',
  attention: 'type-body-caption-semibold',
}
const CAPTION = '0.313 ETH'
const ERROR = 'More than your balance'
const HELPER = 'Daily limit RM 50,000.00'

const amount = (props = {}) => (
  <SelectTransfer appearance="attention" value="5800.00" currencyLabel="ETH" isSelected {...props} />
)
const captionOf = (container: HTMLElement) => container.querySelector('.mn-select-transfer__caption') as HTMLElement | null

describe('SelectTransfer caption (Gate 97, R97-1)', () => {
  it.each(APPEARANCES)('renders the caption in the label slot inside a FormField, %s appearance', appearance => {
    const { container } = render(
      <FormField label="Transfer Amount" type="transfer">{amount({ appearance, caption: CAPTION })}</FormField>,
    )
    const caption = captionOf(container)!
    expect(caption).toHaveTextContent(CAPTION)
    expect(caption).toHaveClass('mn-select-transfer__label', TYPE_CLASS[appearance])
    // The slot: the first child of the column stack, above the amount.
    const stack = container.querySelector('.mn-select-transfer__stack')!
    expect(stack.firstElementChild).toBe(caption)
  })

  it.each(APPEARANCES)('renders the caption in the label slot outside a FormField, %s appearance', appearance => {
    const { container } = render(amount({ appearance, ariaLabel: 'Send', caption: CAPTION }))
    const caption = captionOf(container)!
    expect(caption).toHaveTextContent(CAPTION)
    expect(caption).toHaveClass('mn-select-transfer__label', TYPE_CLASS[appearance])
    expect(container.querySelector('.mn-select-transfer__stack')!.firstElementChild).toBe(caption)
  })

  it('renders the caption as a span with an id, never a label', () => {
    const { container } = render(amount({ label: 'Send', caption: CAPTION }))
    const caption = captionOf(container)!
    expect(caption.tagName).toBe('SPAN')
    expect(caption.id).not.toBe('')
    expect(container.querySelector('label')).toBeNull()
  })

  it('appends the caption id to aria-describedby, after the error and helper ids', () => {
    const { container } = render(
      <FormField label="Transfer Amount" type="transfer" error={ERROR} helper={HELPER}>
        {amount({ caption: CAPTION })}
      </FormField>,
    )
    const input = screen.getByRole('combobox')
    const ids = input.getAttribute('aria-describedby')!.split(' ')
    expect(ids).toHaveLength(3)
    expect(document.getElementById(ids[0])).toHaveTextContent(ERROR)
    expect(document.getElementById(ids[1])).toHaveTextContent(HELPER)
    expect(ids[2]).toBe(captionOf(container)!.id)
  })

  it('leaves the name to the form row and describes the input by the caption last', () => {
    render(
      <FormField label="Transfer Amount" type="transfer" error={ERROR} helper={HELPER}>
        {amount({ caption: CAPTION })}
      </FormField>,
    )
    const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
    expect(input).not.toHaveAttribute('aria-label')
    expect(input).toHaveAccessibleDescription(`${ERROR} ${HELPER} ${CAPTION}`)
  })

  it('is described by the caption alone in a FormField with no message', () => {
    render(<FormField label="Transfer Amount" type="transfer">{amount({ caption: CAPTION })}</FormField>)
    expect(screen.getByRole('combobox', { name: 'Transfer Amount' })).toHaveAccessibleDescription(CAPTION)
  })

  it('outside a FormField, with label and caption, names the input by aria-label and shows the caption in the slot', () => {
    const { container } = render(amount({ label: 'Send', caption: CAPTION }))
    const input = screen.getByRole('combobox', { name: 'Send' })
    expect(input).toHaveAttribute('aria-label', 'Send')
    expect(input).toHaveAccessibleDescription(CAPTION)
    expect(container.querySelector('.mn-select-transfer__stack')!.textContent).not.toContain('Send')
  })

  it('outside a FormField, with ariaLabel and caption, keeps the ariaLabel name', () => {
    render(amount({ ariaLabel: 'Send amount', caption: CAPTION }))
    const input = screen.getByRole('combobox', { name: 'Send amount' })
    expect(input).toHaveAccessibleDescription(CAPTION)
  })

  it('has no axe violations with a caption inside a FormField', async () => {
    const { container } = render(
      <FormField label="Transfer Amount" type="transfer" error={ERROR} helper={HELPER}>
        {amount({ caption: CAPTION })}
      </FormField>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with a caption and a label outside a FormField', async () => {
    const { container } = render(amount({ label: 'Send', caption: CAPTION }))
    expect(await axe(container)).toHaveNoViolations()
  })

  // Inside a FormField the name is the form row's (aria-labelledby), so a
  // `label` prop given alongside a `caption` must not also become an
  // `aria-label`. This pins the `formField ? undefined : …` arm of the
  // caption's aria-label expression; the outside-a-FormField arm is pinned above.
  it('inside a FormField, with label and caption, names the input by the form row and sets no aria-label', () => {
    render(
      <FormField label="Transfer Amount" type="transfer">
        {amount({ label: 'Send', caption: CAPTION })}
      </FormField>,
    )
    const input = screen.getByRole('combobox', { name: 'Transfer Amount' })
    expect(input).not.toHaveAttribute('aria-label')
    expect(input).toHaveAccessibleDescription(CAPTION)
  })

  // Guard. Render each of the 28 existing paths with `caption={undefined}` and
  // compare it with the v2.9.0 hash that SelectTransfer.formField.test.tsx pins
  // for that path. (Comparing it with the same element rendered WITHOUT the prop
  // can never fail: in JS an omitted prop and an undefined one are the same
  // value, so that comparison cannot see an implementation change.) The hashes
  // are read from that file, not copied, so there is one source of truth; the
  // file is read as text because importing a test file would register its tests.
  const v290Pins = (): Record<string, string> => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/SelectTransfer/SelectTransfer.formField.test.tsx'), 'utf8')
    const block = src.split('V2_9_0_MARKUP_SHA256')[1]?.split('\n}\n')[0] ?? ''
    const pins: Record<string, string> = {}
    for (const m of block.matchAll(/'([^']+)':\s*'([0-9a-f]{64})'/g)) pins[m[1]] = m[2]
    return pins
  }

  it('renders every v2.9.0-pinned path exactly as v2.9.0 did with caption={undefined}', () => {
    const pins = v290Pins()
    expect(Object.keys(pins)).toHaveLength(SELECT_TRANSFER_CASES.length)
    expect(SELECT_TRANSFER_CASES.length).toBeGreaterThan(0)
    for (const [name, element] of SELECT_TRANSFER_CASES) {
      const withProp = cloneElement(element as ReactElement<{ caption?: string }>, { caption: undefined })
      const hash = createHash('sha256').update(renderToStaticMarkup(withProp)).digest('hex')
      expect(hash, name).toBe(pins[name])
    }
  })
})
