import { createContext, useContext } from 'react'

/* What FormField hands the ONE control inside it (R91D-7). Internal to the
   DS: the three controls that read it (Field, SelectTransfer,
   SelectWalletAccount) import it directly, and it is not part of the
   package barrel.

   Outside a FormField the value is `null`, and every control that reads it
   renders exactly what it rendered at v2.9.0 (R91D-8, hash-pinned). */
export interface FormFieldContextValue {
  /** id of the wrapper's visible label, for `aria-labelledby`. */
  labelId: string
  /** The ids of the messages present, error first (visual order), joined by
   *  a space. `undefined` when no message is shown. */
  describedBy: string | undefined
  /** `true` while the error line is present. */
  hasError: boolean
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null)

export function useFormFieldContext(): FormFieldContextValue | null {
  return useContext(FormFieldContext)
}
