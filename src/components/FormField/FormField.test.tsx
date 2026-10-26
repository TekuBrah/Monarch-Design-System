import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { FormField } from './FormField'
import type { FormFieldType } from './FormField'
import { useFormFieldContext } from './FormFieldContext'
import { Label } from '../Label'
import { FieldMessage } from '../FieldMessage'
import { Field } from '../Field'
import { readComponentCss, declaration } from '../../test/componentCss'

/* Gate 91 (v2.10.0) — FormField mirrors Figma `Input` (191:11583):
   Type=Default (58:2198) and Type=Transfer (191:11584). Layout tokens are
   read from FormField.css (jsdom applies no stylesheet). */

const TYPES: FormFieldType[] = ['default', 'transfer']
const LABEL_SIZE = { default: 's', transfer: 'm' } as const
const ROOT_GAP = { default: 'var(--brand-scale-250)', transfer: 'var(--brand-scale-300)' } as const
const RULES = readComponentCss('src/components/FormField/FormField.css')

/** Renders what the context says, so the wiring is visible as markup. */
function Probe() {
  const ctx = useFormFieldContext()
  return <output data-testid="probe">{JSON.stringify(ctx)}</output>
}

const probe = (container: HTMLElement) =>
  JSON.parse(container.querySelector('[data-testid="probe"]')!.textContent!) as {
    labelId: string
    describedBy?: string
    hasError: boolean
  }

describe('FormField', () => {
  it.each(TYPES)('renders the %s type modifier on the root', type => {
    const { container } = render(<FormField label="Amount" type={type}><Field /></FormField>)
    expect(container.firstElementChild!.className).toBe(`mn-form-field mn-form-field--${type}`)
  })

  it.each(TYPES)('renders the real Label for the %s type, at its Figma size, in subtle tone', type => {
    const { container } = render(<FormField label="Amount" type={type}><Field /></FormField>)
    expect(container.querySelector('.mn-form-field__label')!.innerHTML).toBe(
      renderToStaticMarkup(<Label label="Amount" size={LABEL_SIZE[type]} tone="subtle" />),
    )
  })

  it('renders the label, then a body holding the control, the error and the helper, in that order', () => {
    const { container } = render(
      <FormField label="Amount" type="default" error="Enter an amount" helper="Up to RM 100">
        <Field />
      </FormField>,
    )
    const root = container.firstElementChild!
    expect([...root.children].map(c => c.className)).toEqual(['mn-form-field__label', 'mn-form-field__body'])
    const body = root.querySelector('.mn-form-field__body')!
    expect([...body.children].map(c => c.className.split(' ')[0])).toEqual([
      'mn-field',
      'mn-field-message',
      'mn-field-message',
    ])
    expect(body.children[1]).toHaveClass('mn-field-message--error')
    expect(body.children[2]).toHaveClass('mn-field-message--helper')
  })

  it('renders each message as the real FieldMessage, with its own id', () => {
    const { container } = render(
      <FormField label="Amount" type="default" error="Enter an amount" helper="Up to RM 100">
        <Probe />
      </FormField>,
    )
    const [errorId, helperId] = probe(container).describedBy!.split(' ')
    const body = container.querySelector('.mn-form-field__body')!
    expect(body.children[1].outerHTML).toBe(
      renderToStaticMarkup(<FieldMessage tone="error" id={errorId}>Enter an amount</FieldMessage>),
    )
    expect(body.children[2].outerHTML).toBe(
      renderToStaticMarkup(<FieldMessage tone="helper" id={helperId}>Up to RM 100</FieldMessage>),
    )
  })

  it('renders no message and describes nothing when neither is given', () => {
    const { container } = render(<FormField label="Amount" type="default"><Probe /></FormField>)
    expect(container.querySelector('.mn-field-message')).toBeNull()
    expect(probe(container)).toEqual({ labelId: container.querySelector('.mn-form-field__label')!.id, hasError: false })
  })

  it.each([[''], [null], [false]])('treats an error of %j as absent', error => {
    const { container } = render(<FormField label="Amount" type="default" error={error}><Probe /></FormField>)
    expect(container.querySelector('.mn-field-message')).toBeNull()
    expect(probe(container).hasError).toBe(false)
  })

  it('hands the control the label id, which is the label wrapper id', () => {
    const { container } = render(<FormField label="Amount" type="default"><Probe /></FormField>)
    const labelId = container.querySelector('.mn-form-field__label')!.id
    expect(labelId).not.toBe('')
    expect(probe(container).labelId).toBe(labelId)
  })

  it('hands the control the helper id only, and no error, with a helper line', () => {
    const { container } = render(<FormField label="Amount" type="default" helper="Up to RM 100"><Probe /></FormField>)
    const ctx = probe(container)
    expect(ctx.describedBy).toBe(container.querySelector('.mn-field-message--helper')!.id)
    expect(ctx.hasError).toBe(false)
  })

  it('hands the control the error id and the error flag with an error line', () => {
    const { container } = render(<FormField label="Amount" type="default" error="Enter an amount"><Probe /></FormField>)
    const ctx = probe(container)
    expect(ctx.describedBy).toBe(container.querySelector('.mn-field-message--error')!.id)
    expect(ctx.hasError).toBe(true)
  })

  it('lists the error id before the helper id when both show', () => {
    const { container } = render(
      <FormField label="Amount" type="default" error="Enter an amount" helper="Up to RM 100"><Probe /></FormField>,
    )
    const errorId = container.querySelector('.mn-field-message--error')!.id
    const helperId = container.querySelector('.mn-field-message--helper')!.id
    expect(probe(container).describedBy).toBe(`${errorId} ${helperId}`)
  })

  it('gives two FormFields distinct ids', () => {
    const { container } = render(
      <>
        <FormField label="From" type="default" error="x"><Field /></FormField>
        <FormField label="To" type="default" error="y"><Field /></FormField>
      </>,
    )
    const ids = [...container.querySelectorAll('[id]')].map(el => el.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives the error line and the helper line distinct ids within one FormField', () => {
    const { container } = render(
      <FormField label="Amount" type="default" error="Enter an amount" helper="Up to RM 100">
        <Field />
      </FormField>,
    )
    const errorId = container.querySelector('.mn-field-message--error')!.id
    const helperId = container.querySelector('.mn-field-message--helper')!.id
    expect(errorId).not.toBe('')
    expect(helperId).not.toBe('')
    expect(errorId).not.toBe(helperId)
    expect(container.querySelector('input')!.getAttribute('aria-describedby')!.split(' ')).toEqual([errorId, helperId])
  })

  it('provides no context outside a FormField', () => {
    const { container } = render(<Probe />)
    expect(container.textContent).toBe('null')
  })

  it.each(TYPES)('uses the %s root gap from Figma', type => {
    const selector = type === 'default' ? '.mn-form-field' : '.mn-form-field--transfer'
    expect(declaration(RULES, selector, 'gap')).toBe(ROOT_GAP[type])
    expect(declaration(RULES, '.mn-form-field', 'flex-direction')).toBe('column')
  })

  it('spaces the control and its messages by Scale/100', () => {
    expect(declaration(RULES, '.mn-form-field__body', 'flex-direction')).toBe('column')
    expect(declaration(RULES, '.mn-form-field__body', 'gap')).toBe('var(--brand-scale-100)')
  })

  it('centres the label in the transfer type only', () => {
    expect(declaration(RULES, '.mn-form-field--transfer .mn-form-field__label', 'justify-content')).toBe('center')
    expect(declaration(RULES, '.mn-form-field__label', 'justify-content')).toBeUndefined()
  })

  it.each(TYPES)('has no axe violations in the %s type with both messages', async type => {
    const { container } = render(
      <FormField label="Amount" type={type} error="Enter an amount" helper="Up to RM 100">
        <Field />
      </FormField>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
