# Component token mappings

Documents the exact variant → token mapping used in each component. Captured
faithfully from Figma; inconsistencies in the source design are preserved as-is.

---

## Badge

**Figma node:** 108:315  
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 108:199  
**Reference:** https://atlassian.design/components/badge/usage

A visual indicator for numeric values (tallies, counts, scores).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `BadgeAppearance` | `'default'` | See table below |
| `type` | `'default' \| 'dot'` | `'default'` | `dot` = 12px circle, no label |
| `label` | `string` | `'25'` | Only rendered when `type="default"` |

### Appearance → token mapping

| appearance | background token | text token | notes |
|---|---|---|---|
| `default` | `--mapped-surface-subtle-default` | `--mapped-text-default-default` | Light/dark aware |
| `primary` | `--mapped-surface-primary-default` | `--mapped-text-on-color-heading` | White text on blue fill |
| `inverted` | `--mapped-surface-page` | `--mapped-text-primary-default` | Blue text on page bg — inverts primary |
| `important` | `--mapped-surface-error-default` | `--mapped-text-on-color-heading` | White text on red fill |
| `added` | `--alias-success-100` | `--mapped-text-success-default-pressed` | Alias layer (not mapped) — no dark-mode flip. Label prefixed with `+` |
| `removed` | `--alias-error-100` | `--mapped-text-error-default-press` | Alias layer (not mapped) — no dark-mode flip. Label prefixed with `−` |
| `dark` | `--brand-slate-600` | `--mapped-text-on-color-heading` | Brand layer — intentionally static, no dark-mode flip |

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Border radius | `--brand-scale-200` | 8px |
| Horizontal padding | `--brand-scale-200` | 8px (Figma specifies 6px / `space.075`; no 6px token exists — nearest used) |
| Vertical padding | `0` | — |
| Dot width/height | `--brand-scale-300` | 12px |

### Typography

`.type-body-sm` — Poppins Regular 14px, line-height from `--responsive-font-copy-body-sm-line-height`

### Known Figma inconsistencies

- **`Dar` appearance in Figma**: The dot variant of `dark` is named `Dar` in Figma (typo). Normalised to `dark` in code.
- **`added` / `removed` backgrounds**: Figma maps to raw brand color (`green/100`, `red/100`). No `--mapped-surface-success-subtlest` or `--mapped-surface-error-subtlest` exists in the mapped layer, so `--alias-success-100` / `--alias-error-100` are used. These will not flip in dark mode.
- **`dark` background**: Uses `--brand-slate-600` directly (no mapped surface token for slate). Intentionally static.
- **Padding gap**: Figma `space.075` = 6px has no token equivalent. `--brand-scale-200` (8px) used instead.

---

## Button

**Figma frame:** `148:986`  
**Figma nodes read:** `12:86` (M/Primary/Default), `113:591` (S/Primary/Default), `140:6652` (Icon Button M/Primary/Default)

An action trigger. Three visual variants, two appearance modes, three sizes.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'primary'` | Figma prop: `Type`. Renamed to avoid HTML `type` collision |
| `appearance` | `ButtonAppearance` | `'default'` | `'inverse'` = for use on colored/dark backgrounds |
| `size` | `ButtonSize` | `'m'` | `'s'` \| `'m'` \| `'l'` |
| `label` | `string` | `'Button'` | Visible text label |
| `leadingIcon` | `ReactNode` | — | Optional icon before label |
| `trailingIcon` | `ReactNode` | — | Optional icon after label |
| `disabled` | `boolean` | `false` | |
| `onClick` | `MouseEventHandler` | — | |
| `previewState` | `'hover' \| 'pressed' \| 'focus'` | — | Showcase-only: forces a visual state without interaction |

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Border radius | `--brand-scale-200` | 8px (confirmed from Figma) |
| Border width | `--brand-scale-25` | 1px (Figma: `--border-width/xs`; `--brand-scale-25` is our nearest 1px token) |
| Gap (icon ↔ label) | `--brand-scale-100` | 4px (confirmed from Figma) |
| Icon size | `--brand-scale-500` | 20px (Icon Button: `--brand-scale-600` = 24px) |
| S padding | `--brand-scale-100` all sides | 4px (confirmed with both-icons; text-only not separately confirmed) |
| M padding | `--brand-scale-200` (v) `--brand-scale-300` (h) | 8px / 12px (confirmed from Figma) |
| L padding | `--brand-scale-300` (v) `--brand-scale-400` (h) | 12px / 16px (inferred — not confirmed from Figma) |
| Focus outline | `--brand-scale-50` offset + width | 2px ring, 2px offset |

### Typography

All sizes use `.type-body-sm-semibold` — Poppins 600 / 14px / 20px lh. Confirmed from Figma for S and M; L inferred to match (size differences are achieved via padding only).

### Appearance: default — surface tokens per variant × state

| variant | state | background | border | text |
|---|---|---|---|---|
| `primary` | default | `--mapped-surface-primary-default` | `--mapped-border-primary-default` | `--mapped-text-primary-on-color` |
| `primary` | hover | `--mapped-surface-primary-default-hover` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-on-color-hover` |
| `primary` | pressed | `--mapped-surface-primary-default-pressed` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-on-color-pressed` |
| `primary` | disabled | `--mapped-surface-disabled-default` | `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` |
| `secondary` | default | `--mapped-surface-primary-default-subtle` | `--mapped-border-primary-default` | `--mapped-text-primary-default` |
| `secondary` | hover | `--mapped-surface-primary-default-subtle-hover` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-default-hover` |
| `secondary` | pressed | `--mapped-surface-primary-default-subtle-pressed` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-default-pressed` |
| `secondary` | disabled | `--mapped-surface-disabled-default` | `--mapped-border-disabled-default` | `--mapped-text-disabled-default` |
| `tertiary` | default | `transparent` | `transparent` | `--mapped-text-default-default` |
| `tertiary` | hover | `--mapped-surface-subtle-hover` | `transparent` | `--mapped-text-default-hover` |
| `tertiary` | pressed | `--mapped-surface-subtle-pressed` | `transparent` | `--mapped-text-default-pressed` |
| `tertiary` | disabled | `transparent` | `transparent` | `--mapped-text-disabled-default` |

Focus ring (all default variants): `--mapped-border-primary-default` at 2px / 2px offset.

### Appearance: inverse — tokens per variant × state

Inverse buttons are for placement on colored or dark backgrounds.

| variant | state | background | border | text |
|---|---|---|---|---|
| `primary` | default | `--mapped-surface-interactive-on-color` | (same as bg) | `--mapped-text-primary-default` |
| `primary` | hover | `--mapped-surface-interactive-on-color-hover` | (same as bg) | `--mapped-text-primary-default-hover` |
| `primary` | pressed | `--mapped-surface-interactive-on-color-pressed` | (same as bg) | `--mapped-text-primary-default-pressed` |
| `primary` | disabled | `--mapped-surface-disabled-default` | `--mapped-border-disabled-default` | `--mapped-text-disabled-default` |
| `secondary` | default | `transparent` | `--mapped-border-interactive-on-color` | `--mapped-text-on-color-label` |
| `secondary` | hover | `--mapped-surface-interactive-on-color-hover` | `--mapped-border-interactive-on-color-hover` | `--mapped-text-on-color-label-hover` |
| `secondary` | pressed | `--mapped-surface-interactive-on-color-pressed` | `--mapped-border-interactive-on-color-pressed` | `--mapped-text-on-color-label-pressed` |
| `secondary` | disabled | `--mapped-surface-disabled-default` | `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` |
| `tertiary` | default | `transparent` | `transparent` | `--mapped-text-on-color-label` |
| `tertiary` | hover | `--mapped-surface-interactive-on-color-hover` | `transparent` | `--mapped-text-on-color-label-hover` |
| `tertiary` | pressed | `--mapped-surface-interactive-on-color-pressed` | `transparent` | `--mapped-text-on-color-label-pressed` |
| `tertiary` | disabled | `transparent` | `transparent` | `--mapped-text-disabled-on-color` |

Focus ring (all inverse variants): `--mapped-border-interactive-on-color` at 2px / 2px offset.

### Known Figma gaps / inferences

- **Border width**: Figma references `--border-width/xs` (1px) — no equivalent token in our system. `--brand-scale-25` (1px) used as the closest token.
- **No dedicated focus-ring token**: Figma doesn't define a focus-specific border token. `--mapped-border-primary-default` (default appearance) and `--mapped-border-interactive-on-color` (inverse appearance) used for the focus outline.
- **S text-only horizontal padding**: Figma confirmed S+both-icons has `p-4px` all sides. S text-only was not separately confirmed; same 4px used throughout S.
- **L size not confirmed**: Geometry (py=12px, px=16px) inferred from the S→M progression. Verify with Figma L-size sublayer if exact spacing matters.
- **Inverse token assignments**: No Figma call was made on an Inverse variant. Tokens were inferred from the `interactive-on-color` and `on-color-label` families in our mapped layer. Verify with Figma when finalising Inverse behaviour.
- **Secondary default bg**: `--mapped-surface-primary-default-subtle` is used as the "ghost fill" for Secondary buttons. This token exists and resolves to a very light blue in the mapped layer.
