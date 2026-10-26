import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { Field } from './Field'
import { FormField } from '../FormField'
import { FIELD_CASES } from '../../test/formControlCases'

/* Gate 91 (v2.10.0) — Field reads FormField's context (R91D-7), and nothing
   else about it changes (R91D-8).

   OUTSIDE a FormField every existing render path must be byte-identical to
   v2.9.0. The hashes below are sha256 of `renderToStaticMarkup` for each case
   in ../../test/formControlCases, captured from the UNEDITED v2.9.0 Field
   (HEAD 4806dd7) before the first source edit of Gate 91. The full strings
   are kept outside the repo, in the gate's hand-over. */
const V2_9_0_MARKUP_SHA256: Record<string, string> = {
  'test: ariaLabel': '59984844589eac5ed61d633ec43cdd7d7ab7f0b37e162d9ba04148398e675815',
  'test: standard': '59984844589eac5ed61d633ec43cdd7d7ab7f0b37e162d9ba04148398e675815',
  'test: subtle': 'c7207a5318a5a83b2876e1f4a8fe69f0bdfcdbdd87484e57269b47c752c683b1',
  'test: visible label': '8d389e4a676e904b449d5886c0e09abea049d749a415e44ae1cb83ec1daec1c2',
  'test: compact': '37ddd90e2a5e20a141ed001d82dac4716a9361026b3a2f8a81cfa4721c6dd916',
  'test: disabled': '6160d6abe0a5edcee0d961da343ed52de23d300f0c860c131c5183da7fda6369',
  'test: invalid': '916f497bae6934dc2212beefd5ccd84dd593c9b97bb54dde000d439b871c72e5',
  'test: required': '42047ddee3e4adc16d95148cff3958b4e5dd0db30fb30cd9067211079e92d6ea',
  'test: sizing fixed': '59984844589eac5ed61d633ec43cdd7d7ab7f0b37e162d9ba04148398e675815',
  'test: sizing fill': 'fb198ec4915c313314c4a831a304a3d75700005a3c2ba01097c0188c80ed4904',
  'test: compact fill': '2cdf52812f4dd88d04e1d0ec7d0cf73ee8097c7dd0848bdfd5cc163c8b6f30d3',
  'showcase: sheet note': '44496afccb0e976e94a50c497c4a2a3ae788535b0060ec4d142a5d39cd019c83',
  'showcase: sidebar search': '97a02597ce0db6f8f61806a2fa2baee858b7a6038ea0f8d4018ccad84f9afdf7',
  'showcase: default': '48c719a00b96fb945f87d5eb194c32744809e8645ebca43707da36df7fad0e71',
  'showcase: hover': '5a8885f0814d9502c855c06c50808fbf0e06ac906c5a5bfe54df170286a15456',
  'showcase: focus': '7a0e575dfaab119573f75a21d38eefd9a6b2450407e8a8a9859b43cf7b19a033',
  'showcase: filled': '4e147a704fe92e4e61596d25881aa574d03a4b8e8da2e7ec1213e6f3021e4e58',
  'showcase: labelled': 'cad4a224d9bffdcff6f42773d63d035a1f14196e982edd3a6071e0505c76e55f',
  'showcase: labelled invalid': '3b8d25c05602b75642d127e5786d0489c00ee112f3974e162cd967d6705e06bc',
  'showcase: labelled disabled': 'a26544d84f6713cb16ccffdf0b5976445b7399f8cc63aa62d0afd7709654efdb',
  'showcase: subtle': '25e90525af8bd173189b57216361382169a426ee278f2ae9be3d6bba7b54430c',
  'showcase: compact add': '4e7b414d98370b9dcb6a472fcb7d3c3845c897226fd3a32f1c3e7a84e157a6f3',
  'showcase: compact focus': '5b01a743d7e1f233da0d6a8342a4893ca2f834b45736c20ce9f40f4893210c04',
  'matrix: label required invalid': '0de9dacf3f3b22f1887883686c0e55e621291e7c5701370b36d7b79db733aaad',
  'matrix: label with ariaLabel': '8d389e4a676e904b449d5886c0e09abea049d749a415e44ae1cb83ec1daec1c2',
  'matrix: every other prop': '7603b6216ec9e6aecfe0b648fae79c2d775f423961256c450c2c1126e6cad422',
  'matrix: explicit id, no label': '705011fe70af775ebc7b1317c584562449f669629d399779f2f5a3ce5221631b',
}

const sha = (html: string) => createHash('sha256').update(html).digest('hex')

const HELPER = 'Up to RM 27,978.59'
const ERROR = 'Enter an amount'
const MESSAGES = {
  none: {},
  helper: { helper: HELPER },
  error: { error: ERROR },
  both: { error: ERROR, helper: HELPER },
} as const
const COMBOS = Object.keys(MESSAGES) as (keyof typeof MESSAGES)[]

describe('Field and FormField (Gate 91)', () => {
  describe('outside a FormField: v2.9.0 markup, byte for byte', () => {
    it('has a recorded v2.9.0 hash for exactly the cases rendered here', () => {
      expect(FIELD_CASES.map(([name]) => name)).toEqual(Object.keys(V2_9_0_MARKUP_SHA256))
    })

    it.each(FIELD_CASES)('renders %s exactly as v2.9.0 did', (name, element) => {
      expect(sha(renderToStaticMarkup(element))).toBe(V2_9_0_MARKUP_SHA256[name])
    })
  })

  describe('inside a FormField', () => {
    it('is named by the wrapper label, which is in the name in full', () => {
      render(
        <FormField label="Amount" type="default">
          <Field placeholder="0.00" />
        </FormField>,
      )
      const input = screen.getByRole('textbox', { name: 'Amount' })
      expect(input.getAttribute('aria-labelledby')).toBe(document.querySelector('.mn-form-field__label')!.id)
    })

    it('renders no visible label of its own, even when given one', () => {
      const { container } = render(
        <FormField label="Amount" type="default">
          <Field label="Inner" placeholder="0.00" />
        </FormField>,
      )
      expect(container.querySelector('.mn-field__label')).toBeNull()
      expect(container.querySelector('.mn-field')).not.toHaveClass('mn-field--labeled')
      expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument()
    })

    it('drops its own ariaLabel in favour of the wrapper label', () => {
      render(
        <FormField label="Amount" type="default">
          <Field ariaLabel="Other" />
        </FormField>,
      )
      expect(screen.getByRole('textbox', { name: 'Amount' })).not.toHaveAttribute('aria-label')
    })

    it('adds no aria-describedby and no aria-invalid when no message shows', () => {
      render(
        <FormField label="Amount" type="default">
          <Field />
        </FormField>,
      )
      const input = screen.getByRole('textbox', { name: 'Amount' })
      expect(input).not.toHaveAttribute('aria-describedby')
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('is described by the helper line, and stays valid', () => {
      render(
        <FormField label="Amount" type="default" helper={HELPER}>
          <Field />
        </FormField>,
      )
      const input = screen.getByRole('textbox', { name: 'Amount' })
      expect(input).toHaveAccessibleDescription(HELPER)
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('is described by the error line, and marked invalid', () => {
      render(
        <FormField label="Amount" type="default" error={ERROR}>
          <Field />
        </FormField>,
      )
      const input = screen.getByRole('textbox', { name: 'Amount' })
      expect(input).toHaveAccessibleDescription(ERROR)
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('is described by the error line then the helper line when both show', () => {
      render(
        <FormField label="Amount" type="default" error={ERROR} helper={HELPER}>
          <Field />
        </FormField>,
      )
      expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAccessibleDescription(`${ERROR} ${HELPER}`)
    })

    it('keeps a consumer isInvalid with no error line', () => {
      render(
        <FormField label="Amount" type="default">
          <Field isInvalid />
        </FormField>,
      )
      expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true')
    })

    it.each(COMBOS)('has no axe violations with messages: %s', async combo => {
      const { container } = render(
        <FormField label="Amount" type="default" {...MESSAGES[combo]}>
          <Field placeholder="0.00" />
        </FormField>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
