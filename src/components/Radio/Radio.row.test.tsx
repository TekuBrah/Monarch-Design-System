import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import type { ReactElement } from 'react'
import { Radio } from './Radio'
import { readComponentCss, declaration } from '../../test/componentCss'

/* Gate 97 (v2.13.0), G66 — `layout="row"`, `description`, `trailingLabel`
   (R97-2), the whole-row focus ring (R97-3) and no row tint (R97-4).

   Figma's Network Fee rows (`1063:13768` / `1063:13778`, 343 × 56) are
   detached frames: [label above description] … [trailing] [16px] [radio]. */

const CSS = readComponentCss('src/components/Radio/Radio.css')
const sha = (html: string) => createHash('sha256').update(html).digest('hex')

const regular = (props = {}) => (
  <Radio layout="row" name="fee" value="regular" label="Regular" description="60+ Min" trailingLabel="RM 4.60" {...props} />
)

/* sha256 of renderToStaticMarkup for every existing Radio render in
   Radio.test.tsx and showcase/App.tsx, captured from the v2.12.0 build
   (census copy of `fbc6e2f`) before the first source edit of Gate 97. */
const V2_12_0: [string, ReactElement, string][] = [
  ['test: card', <Radio label="Card" />, 'dd2daf09f0d06dc7a5e6774db38448cf78c97fadbc6fbe21134ef934b1c28ca6'],
  ['test: checked', <Radio label="Card" isChecked />, 'b110704d91874976a7190e9f0f677351a4aa0734f0167ade04eede4f05bde732'],
  ['test: disabled', <Radio label="Card" isDisabled />, '427e9131b075a7f40e3b8ca3c89b2f151b8a66a92cd4065f3adf109fd5308fdf'],
  ['test: invalid', <Radio label="Card" isInvalid />, '5ddc215aad4858c41a699ff12041aefe8c925e03a0908587019c9eeb3ad05edb'],
  ['test: required', <Radio label="Card" isRequired />, '7355fcef401a54eada463f9c56cb272a61338cfe817b00c7f62e0da08fa034f1'],
  ['showcase: unchecked', <Radio label="Unchecked" />, '84e32b6e111b9bd6965de47d97c374b92072ffb79b7e8d61593d90025e3a89ae'],
  ['showcase: checked', <Radio label="Checked" isChecked />, 'd398b9e863a344191fc94e3acddfc5d2e05192c477c8d86e63b858447c002886'],
  ['showcase: invalid', <Radio label="Invalid" isInvalid />, 'f76a0c8d03368228172086b0165bc132f10d141771075f8c7c1e208dda029289'],
  ['showcase: required', <Radio label="Required" isRequired />, 'c2b85749e48958606981ef1545035e7ed809290e16714855a34bcc1a85b9c850'],
  ['showcase: disabled', <Radio label="Disabled" isDisabled />, 'e000a0524bbe15541663c25daed8347c3a7132ef7354fec4795b34788ceb9b28'],
  ['showcase: checked disabled', <Radio label="Checked + disabled" isChecked isDisabled />, '1825102402848d55e444f510e052cee289ac84b21d07416b3ea184f949cac9db'],
  ['showcase: interactive standard', <Radio name="shipping" value="standard" label="Standard" isChecked onChange={() => {}} />, '63ea6d2cfa38e736d828d3a8d76df7d3a465b50c8e3f00817634589d3e25ebc9'],
  ['showcase: interactive express', <Radio name="shipping" value="express" label="Express" isChecked={false} onChange={() => {}} />, '10618d9d7d499a8e9958872dcedd296d26b20dd5e2ef417f0e0009ab9d5aed61'],
  ['showcase: interactive priority', <Radio name="shipping" value="priority" label="Priority" isChecked={false} onChange={() => {}} />, '48617cf2af603fbc867c3ed972916b88153a3c4eaff561f6afabf7a00f695872'],
]

describe('Radio layout="row" (Gate 97, G66)', () => {
  it('renders the control last, with the native input directly before it', () => {
    const { container } = render(regular())
    const row = container.firstElementChild as HTMLElement
    expect(row.lastElementChild).toHaveClass('mn-radio__icon-wrap')
    expect(row.lastElementChild!.previousElementSibling).toHaveClass('mn-radio__input')
    expect(row.firstElementChild).toHaveClass('mn-radio__text')
  })

  it('wraps the whole row in one label that holds the input and every text', () => {
    const { container } = render(regular())
    const labels = container.querySelectorAll('label')
    expect(labels).toHaveLength(1)
    expect(container.firstElementChild).toBe(labels[0])
    expect(labels[0]).toContainElement(screen.getByRole('radio'))
    expect(labels[0]).toHaveTextContent('Regular 60+ Min RM 4.60')
  })

  it('is named by label, description and trailing label, in order', () => {
    render(regular())
    expect(screen.getByRole('radio')).toHaveAccessibleName('Regular 60+ Min RM 4.60')
  })

  it('types each part as drawn: label caption, description and trailing body-m', () => {
    const { container } = render(regular())
    expect(container.firstElementChild).toHaveClass('mn-radio', 'mn-radio--row')
    expect(container.querySelector('.mn-radio__row-label')).toHaveClass('type-body-caption')
    expect(container.querySelector('.mn-radio__description')).toHaveClass('type-body-m')
    expect(container.querySelector('.mn-radio__trailing')).toHaveClass('type-body-m')
    expect(container.querySelector('.mn-radio__label')).toBeNull()
  })

  it('binds the row text colours: label subtle, description and trailing default', () => {
    expect(declaration(CSS, '.mn-radio__row-label', 'color')).toBe('var(--mapped-text-subtle-default)')
    expect(declaration(CSS, '.mn-radio__description', 'color')).toBe('var(--mapped-text-default-default)')
    expect(declaration(CSS, '.mn-radio__trailing', 'color')).toBe('var(--mapped-text-default-default)')
  })

  it('takes its geometry from the drawn row as ramp steps: 8px block padding, 16px gaps', () => {
    expect(declaration(CSS, '.mn-radio--row', 'padding')).toBe('var(--brand-scale-200) 0')
    expect(declaration(CSS, '.mn-radio--row', 'gap')).toBe('var(--brand-scale-400)')
    expect(declaration(CSS, '.mn-radio--row', 'align-items')).toBe('center')
  })

  it('is a native radio grouped by name, and a tap anywhere on a row selects it', () => {
    const onPriority = vi.fn()
    render(
      <div role="radiogroup" aria-label="Network Fee">
        {regular({ isChecked: true })}
        <Radio layout="row" name="fee" value="priority" label="Priority" description="30 Minutes" trailingLabel="RM 24.50" onChange={onPriority} />
      </div>,
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios.map(r => [r.type, r.name, r.value])).toEqual([['radio', 'fee', 'regular'], ['radio', 'fee', 'priority']])
    expect(radios[0]).toBeChecked()
    fireEvent.click(screen.getByText('RM 24.50'))
    expect(onPriority).toHaveBeenCalledWith(true)
  })

  it('disables the native input and greys the row text when isDisabled is set', () => {
    const { container } = render(regular({ isDisabled: true }))
    expect(screen.getByRole('radio')).toBeDisabled()
    expect(container.firstElementChild).toHaveClass('mn-radio--disabled')
    for (const part of ['.mn-radio__row-label', '.mn-radio__description', '.mn-radio__trailing']) {
      expect(declaration(CSS, `.mn-radio--disabled ${part}`, 'color')).toBe('var(--mapped-text-disabled-default)')
    }
  })

  it('sets aria-invalid and the invalid circle when isInvalid is set', () => {
    const { container } = render(regular({ isInvalid: true }))
    expect(screen.getByRole('radio')).toHaveAttribute('aria-invalid', 'true')
    expect(container.firstElementChild).toHaveClass('mn-radio--invalid')
    expect(container.querySelector('.mn-radio__circle')).toHaveClass('mn-radio__circle--invalid')
  })

  it('wires required and aria-required, with the asterisk after the label', () => {
    const { container } = render(regular({ isRequired: true }))
    const radio = screen.getByRole('radio')
    expect(radio).toBeRequired()
    expect(radio).toHaveAttribute('aria-required', 'true')
    expect(container.querySelector('.mn-radio__row-label .mn-radio__required')).toHaveTextContent('*')
  })

  it('has no axe violations as two rows inside a radiogroup', async () => {
    const { container } = render(
      <div role="radiogroup" aria-label="Network Fee">
        {regular({ isChecked: true })}
        <Radio layout="row" name="fee" value="priority" label="Priority" description="30 Minutes" trailingLabel="RM 24.50" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('rings the whole row only under :focus-visible on the input, with the DS focus token', () => {
    const ring = '.mn-radio--row:has(.mn-radio__input:focus-visible)'
    expect(declaration(CSS, ring, 'outline')).toBe('var(--brand-scale-50) solid var(--mapped-border-primary-default)')
    expect(declaration(CSS, ring, 'outline-offset')).toBe('var(--brand-scale-50)')
    // One ring only: the control's own small ring is switched off in row.
    expect(declaration(CSS, '.mn-radio--row .mn-radio__input:focus-visible + .mn-radio__icon-wrap', 'outline')).toBe('none')
    // Inline focus is unchanged.
    expect(declaration(CSS, '.mn-radio__input:focus-visible + .mn-radio__icon-wrap', 'outline')).toBe('2px solid var(--mapped-border-primary-default)')
  })

  it('draws no fill and no hover, pressed or selected tint on the row', () => {
    const rowRules = CSS.filter(r => r.selectors.some(s => s.includes('mn-radio--row')))
    for (const r of rowRules) {
      for (const p of ['background', 'background-color', 'border', 'box-shadow']) expect(r.decls.has(p)).toBe(false)
      expect(r.selectors.some(s => /:hover|:active|--selected|--checked/.test(s))).toBe(false)
    }
    expect(rowRules.length).toBeGreaterThan(0)
  })
})

describe('Radio layout="inline" (Gate 97 guards)', () => {
  it('ignores description and trailingLabel in inline', () => {
    expect(renderToStaticMarkup(<Radio label="Card" isChecked description="60+ Min" trailingLabel="RM 4.60" />))
      .toBe(renderToStaticMarkup(<Radio label="Card" isChecked />))
  })

  it("renders an explicit layout='inline' exactly as omitting it", () => {
    expect(renderToStaticMarkup(<Radio label="Card" isRequired isInvalid layout="inline" />))
      .toBe(renderToStaticMarkup(<Radio label="Card" isRequired isInvalid />))
  })

  it('renders every existing path exactly as v2.12.0 did', () => {
    for (const [name, element, hash] of V2_12_0) {
      expect(`${name}: ${sha(renderToStaticMarkup(element))}`).toBe(`${name}: ${hash}`)
    }
  })
})
