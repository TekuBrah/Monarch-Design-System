import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { OptionList } from './OptionList'
import { readGlobals, environment, resolveToken } from '../../test/tokenCss'

const OPTIONS = [
  { id: 'a', label: 'Merchant A' },
  { id: 'b', label: 'Merchant B' },
  { id: 'c', label: 'Merchant C' },
]

/* Same approach, and same reason, as OverlayHeader.test.tsx: jsdom applies no
   stylesheet, so every rect is zero and a geometric read would pass against
   anything. The widths below are computed from the real CSS instead. */
const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

const LIST_CSS = read('src/components/OptionList/OptionList.css')
const ITEM_CSS = read('src/components/MenuItem/MenuItem.css')
const ENV = environment(readGlobals(), 'light')

const ruleIn = (css: string, selector: string) => {
  const out = new Map<string, string>()
  let from = 0
  for (;;) {
    const open = css.indexOf('{', from)
    if (open === -1) break
    const close = css.indexOf('}', open)
    const selectors = css.slice(from, open).trim().split(',').map(s => s.trim())
    if (selectors.includes(selector)) {
      for (const part of css.slice(open + 1, close).split(';')) {
        const i = part.indexOf(':')
        if (i < 0) continue
        out.set(part.slice(0, i).trim(), part.slice(i + 1).trim())
      }
    }
    from = close + 1
  }
  return out
}
const px = (value: string) => {
  const token = value.match(/var\((--[a-z0-9-]+)\)/i)
  return parseFloat(token ? resolveToken(token[1], ENV) : value)
}

/** casestudy_02 1484:19409 — the picker's content frame. */
const CONTENT_WIDTH = 343
/** casestudy_02 1484:19296 — the `<Menu>` the DEFECT nests at x=16. */
const DEFECT_ROW_WIDTH = 311

const list = ruleIn(LIST_CSS, '.mn-option-list')

/* Activate the ROW, which is what OptionList wires and what carries
   `role="option"`. Not the label text: jsdom does not implement `inert`, so a
   click on the nested Checkbox/Radio label synthesizes a second click on the
   associated input, which bubbles to the row and fires the handler TWICE. In a
   browser the `inert` wrapper makes that subtree non-interactive and the click
   lands on the row once — verified in the showcase, recorded in CLAUDE.md. */
const row = (name: string) => screen.getByRole('option', { name })

describe('OptionList', () => {
  describe('full bleed (R5)', () => {
    // "Assert the computed width, not a class name." Computed here means
    // computed FROM THE CSS — list padding plus the row's own width rule —
    // rather than read off a layout engine that is not running. Add any
    // padding to .mn-option-list and this arithmetic moves and the test fails.
    it('gives rows the container width, with no inset on either side', () => {
      const padLeft = px(list.get('padding-left') ?? list.get('padding') ?? '0')
      const padRight = px(list.get('padding-right') ?? list.get('padding') ?? '0')
      expect(padLeft).toBe(0)
      expect(padRight).toBe(0)

      // The row only fills what it is given if it is told to.
      expect(ruleIn(ITEM_CSS, '.mn-menu-item').get('width')).toBe('100%')

      const rowWidth = CONTENT_WIDTH - padLeft - padRight
      expect(rowWidth).toBe(CONTENT_WIDTH)
      // Figma's own contrast: the defect's rows are 311 in the same 343 frame.
      expect(rowWidth).not.toBe(DEFECT_ROW_WIDTH)
      expect(rowWidth - DEFECT_ROW_WIDTH).toBe(32)
    })

    it('declares none of the four things that would make it a panel again', () => {
      // `Menu` has all four; nesting one inside an overlay is the defect.
      for (const property of ['background', 'border-radius', 'padding', 'box-shadow']) {
        expect(list.has(property)).toBe(false)
      }
    })

    it('separates rows by the 2px Figma draws, not by a border or a divider', () => {
      // Rows sit at y = 0, 50, 100, ... and are 48 tall, so the gap is 2.
      expect(px(list.get('gap')!)).toBe(2)
      expect(list.has('border-bottom')).toBe(false)
    })

    it('keeps the control inset Figma measures, through MenuItem', () => {
      // 1484:19479: the Checkbox instance sits at x=16 inside a 343 row.
      const checkbox = ruleIn(ITEM_CSS, '.mn-menu-item--checkbox')
      const padding = (checkbox.get('padding') ?? '').split(/\s+(?![^(]*\))/)
      expect(px(padding[3])).toBe(16)
      // 12 + 24 (the control) + 12 = the 48px row height Figma draws.
      expect(px(padding[0]) + 24 + px(padding[0])).toBe(48)
    })
  })

  describe("selectionMode='multiple'", () => {
    it('adds to the selection and does NOT request a dismiss', () => {
      const onChange = vi.fn()
      const onDismiss = vi.fn()
      render(
        <OptionList
          options={OPTIONS}
          selectionMode="multiple"
          value={['a']}
          onChange={onChange}
          onDismiss={onDismiss}
          ariaLabel="Merchants"
        />,
      )
      fireEvent.click(row('Merchant B'))
      expect(onChange).toHaveBeenCalledWith(['a', 'b'])
      // The view stays open — this is the half that distinguishes the modes.
      expect(onDismiss).not.toHaveBeenCalled()
    })

    it('removes an already-selected option instead of re-adding it', () => {
      const onChange = vi.fn()
      render(
        <OptionList options={OPTIONS} value={['a', 'b']} onChange={onChange} ariaLabel="Merchants" />,
      )
      fireEvent.click(row('Merchant A'))
      expect(onChange).toHaveBeenCalledWith(['b'])
    })

    it('renders a checkbox row per option and marks the listbox multi-selectable', () => {
      const { container } = render(
        <OptionList options={OPTIONS} value={['b']} onChange={() => {}} ariaLabel="Merchants" />,
      )
      expect(container.querySelectorAll('.mn-menu-item--checkbox')).toHaveLength(3)
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
      expect(screen.getAllByRole('option', { selected: true })).toHaveLength(1)
    })
  })

  describe("selectionMode='single'", () => {
    it('fires the change and the dismiss request in one action', () => {
      const calls: string[] = []
      const onChange = vi.fn(() => calls.push('change'))
      const onDismiss = vi.fn(() => calls.push('dismiss'))
      render(
        <OptionList
          options={OPTIONS}
          selectionMode="single"
          value={['a']}
          onChange={onChange}
          onDismiss={onDismiss}
          ariaLabel="Merchants"
        />,
      )
      fireEvent.click(row('Merchant C'))
      // Replaces rather than accumulates — at most one id in single mode.
      expect(onChange).toHaveBeenCalledWith(['c'])
      expect(onDismiss).toHaveBeenCalledTimes(1)
      // One tap, one round trip back to the form: the change is reported
      // before the dismiss is requested.
      expect(calls).toEqual(['change', 'dismiss'])
    })

    it('renders radio rows and does not advertise multi-selection', () => {
      const { container } = render(
        <OptionList
          options={OPTIONS}
          selectionMode="single"
          value={['a']}
          onChange={() => {}}
          ariaLabel="Merchants"
        />,
      )
      expect(container.querySelectorAll('.mn-menu-item--radio')).toHaveLength(3)
      expect(container.querySelectorAll('.mn-menu-item--checkbox')).toHaveLength(0)
      expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-multiselectable')
    })
  })

  describe('listbox semantics', () => {
    it('establishes one roving tabindex target, on the selected row', () => {
      render(<OptionList options={OPTIONS} value={['b']} onChange={() => {}} ariaLabel="Merchants" />)
      const rows = screen.getAllByRole('option')
      expect(rows.map(r => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
    })

    it('moves focus with the arrow keys and wraps', () => {
      render(<OptionList options={OPTIONS} value={[]} onChange={() => {}} ariaLabel="Merchants" />)
      const listbox = screen.getByRole('listbox')
      const rows = screen.getAllByRole('option')
      rows[0].focus()
      fireEvent.keyDown(listbox, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(rows[1])
      fireEvent.keyDown(listbox, { key: 'End' })
      expect(document.activeElement).toBe(rows[2])
      fireEvent.keyDown(listbox, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(rows[0])
    })

    it('has no axe violations in either mode', async () => {
      const multiple = render(
        <OptionList options={OPTIONS} value={['a']} onChange={() => {}} ariaLabel="Merchants" />,
      )
      expect(await axe(multiple.container)).toHaveNoViolations()
      const single = render(
        <OptionList
          options={OPTIONS}
          selectionMode="single"
          value={['a']}
          onChange={() => {}}
          ariaLabel="Merchants"
        />,
      )
      expect(await axe(single.container)).toHaveNoViolations()
    })
  })
})
