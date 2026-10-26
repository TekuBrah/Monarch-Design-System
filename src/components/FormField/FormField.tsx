import { useId } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Label } from '../Label'
import { FieldMessage } from '../FieldMessage'
import { FormFieldContext } from './FormFieldContext'
import type { FormFieldContextValue } from './FormFieldContext'
import './FormField.css'

export type FormFieldType = 'default' | 'transfer'

export interface FormFieldProps {
  /** The visible label above the control. Figma `Label` text. */
  label: string
  /** Figma `Type`. `default`: Label size S, left-aligned, root gap Scale/250.
   *  `transfer`: Label size M, centred, root gap Scale/300. */
  type: FormFieldType
  /** The error line. Rendered below the control when present, and wired to
   *  the control's `aria-describedby` and (where ARIA permits) `aria-invalid`. */
  error?: ReactNode
  /** The helper line. Rendered below the error line when both are present,
   *  which Figma's two independent booleans allow. */
  helper?: ReactNode
  /** Exactly one control: `Field`, `SelectTransfer` or `SelectWalletAccount`.
   *  Pass it WITHOUT its own `label`: inside a FormField the control renders
   *  no visible label of its own (this wrapper's label replaces it). */
  children: ReactElement
}

const present = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

/* Figma `Input` (191:11583). A label, then a vertical frame (gap Scale/100)
   holding the control, then `<Error message>`, then `<Helper message>`.

   The label is the real `Label` component (composition rule), drawn in
   `text/subtle/default`: the Input overrides Label's own `text/default/default`
   on every instance, in the DS file and in the case study alike, so it is
   rendered with `tone="subtle"`. Every case-study instance turns Label's
   before/after elements and its required asterisk off, so none is rendered.

   WHY `aria-labelledby`, NOT `<label for>`. `Label` renders a `<div>`, and a
   `<label>` may hold phrasing content only, so wrapping it would be invalid
   HTML; changing `Label` is outside this gate. The label wrapper below carries
   the id instead, and each control points `aria-labelledby` at it. The cost is
   that clicking the label does not focus a text input; the accessible name is
   the same.

   Not built: `Frame 445` inside Type=Transfer (191:13564). It is a hidden
   frame holding a `<Transfer amount>` instance, and no case-study instance of
   the Input shows it: Flow 4 draws its "Your new balance" line as a sibling of
   the Input, not inside it. Compose `TransferAmount` beside the FormField. */
export function FormField({ label, type, error, helper, children }: FormFieldProps) {
  const base = useId()
  const labelId = `${base}-label`
  const errorId = `${base}-error`
  const helperId = `${base}-helper`
  const hasError = present(error)
  const hasHelper = present(helper)
  const ids = [hasError && errorId, hasHelper && helperId].filter(Boolean).join(' ')

  const context: FormFieldContextValue = {
    labelId,
    describedBy: ids || undefined,
    hasError,
  }

  return (
    <div className={`mn-form-field mn-form-field--${type}`}>
      <div id={labelId} className="mn-form-field__label">
        <Label label={label} size={type === 'transfer' ? 'm' : 's'} tone="subtle" />
      </div>
      <div className="mn-form-field__body">
        <FormFieldContext.Provider value={context}>{children}</FormFieldContext.Provider>
        {hasError && (
          <FieldMessage tone="error" id={errorId}>
            {error}
          </FieldMessage>
        )}
        {hasHelper && (
          <FieldMessage tone="helper" id={helperId}>
            {helper}
          </FieldMessage>
        )}
      </div>
    </div>
  )
}
