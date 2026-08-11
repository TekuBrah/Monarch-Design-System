# Component token mappings

Documents the exact variant → token mapping used in each component. Captured
faithfully from Figma; inconsistencies in the source design are preserved as-is.

---

## Badge

**Figma node:** 108:315  
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `108:199`  
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

An action trigger. Three visual variants, three sizes.

**Dark mode is not a separate `appearance`.** Figma's "Inverse" appearance *is*
the dark-mode look — so the component carries no `appearance` prop. It defines
its `--btn-*` vars from the light (default) token families, and re-maps them
under `[data-theme="dark"]` to the on-color / alpha-wash treatment. A plain
`<Button variant="secondary" />` renders correctly in both modes; to show the
"inverse" look, place it inside a `[data-theme="dark"]` context (e.g. the
showcase's dark panel, or `ToastMobile`'s action slot on its colored surface).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'primary'` | Figma prop: `Type`. Renamed to avoid HTML `type` collision |
| `size` | `ButtonSize` | `'m'` | `'s'` \| `'m'` \| `'l'` |
| `label` | `string` | `'Button'` | Visible text label |
| `leadingIcon` | `ReactNode` | — | Optional icon before label |
| `trailingIcon` | `ReactNode` | — | Optional icon after label |
| `isDisabled` | `boolean` | `false` | |
| `onClick` | `() => void` | — | |
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

### Light mode (`:root`) — surface tokens per variant × state

| variant | state | background | border | text |
|---|---|---|---|---|
| `primary` | default | `--mapped-surface-primary-default` | `--mapped-border-primary-default` | `--mapped-text-primary-on-color` |
| `primary` | hover | `--mapped-surface-primary-default-hover` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-on-color-hover` |
| `primary` | pressed | `--mapped-surface-primary-default-pressed` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-on-color-pressed` |
| `primary` | disabled | `--mapped-surface-disabled-default` | `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` |
| `secondary` | default | `transparent` | `--mapped-border-primary-default` | `--mapped-text-primary-default` |
| `secondary` | hover | `--brand-blue-50` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-default-hover` |
| `secondary` | pressed | `--brand-blue-100` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-default-pressed` |
| `secondary` | disabled | `transparent` | `--mapped-border-disabled-default` | `--mapped-text-disabled-default` |
| `tertiary` | default | `transparent` | `transparent` | `--mapped-text-primary-default` |
| `tertiary` | hover | `--brand-blue-50` | `transparent` | `--mapped-text-primary-default-hover` |
| `tertiary` | pressed | `--brand-blue-100` | `transparent` | `--mapped-text-primary-default-pressed` |
| `tertiary` | disabled | `transparent` | `transparent` | `--mapped-text-disabled-default` |

Focus ring (all variants, light): `--mapped-border-primary-default` at 2px / 2px offset.

Tertiary is a **blue** ghost button (`--mapped-text-primary-default`), matching
Figma — not the neutral/gray it was before.

**Secondary/tertiary hover/press fill uses the brand blue ramp directly**
(`--brand-blue-50` / `--brand-blue-100`), *not* the shared
`--mapped-surface-primary-default-subtle-hover/-pressed` token. That shared
token is deliberately kept on the neutral `{Surface.50}` / `{Surface.200}` gray
(so it doesn't tint inputs, selects, and the ~10 other consumers), while the
buttons want the blue tint — so the buttons reference the blue directly. This
is a user-directed, buttons-only exception to the "consume mapped tokens" rule;
it's safe because dark mode overrides these to the alpha wash, so the
non-flipping brand value never reaches dark mode. **Secondary `disabled` has no
fill** (`transparent`) — it's an outlined button; only the disabled border + text show.

### Dark mode (`[data-theme="dark"]`) — token overrides per variant × state

Overrides only the vars that differ from light; everything else inherits the
light variant rule (e.g. secondary/tertiary keep transparent base fill).

| variant | state | background | border | text |
|---|---|---|---|---|
| `primary` | default | `--mapped-surface-interactive-on-color` (white) | (same as bg) | `--mapped-text-primary-default` |
| `primary` | hover | `--mapped-surface-interactive-on-color-hover` | (same as bg) | `--mapped-text-primary-default-hover` |
| `primary` | pressed | `--mapped-surface-interactive-on-color-pressed` | (same as bg) | `--mapped-text-primary-default-pressed` |
| `secondary` | default | `transparent` | `--mapped-border-interactive-on-color` (white) | `--mapped-text-primary-on-color` |
| `secondary` | hover | `--mapped-surface-alpha-hover` (white wash) | `--mapped-border-interactive-on-color-hover` | `--mapped-text-primary-on-color-hover` |
| `secondary` | pressed | `--mapped-surface-alpha-pressed` | `--mapped-border-interactive-on-color-pressed` | `--mapped-text-primary-on-color-pressed` |
| `tertiary` | default | `transparent` | `transparent` | `--mapped-text-primary-on-color` |
| `tertiary` | hover | `--mapped-surface-alpha-hover` | `transparent` | `--mapped-text-primary-on-color-hover` |
| `tertiary` | pressed | `--mapped-surface-alpha-pressed` | `transparent` | `--mapped-text-primary-on-color-pressed` |

Focus ring (dark): `--mapped-surface-interactive-on-color` (white) for all variants.
Disabled inherits the light variant's disabled tokens (they dark-flip on their own),
except `secondary`, which overrides disabled text to `--mapped-text-disabled-on-color`.
The alpha wash tokens are `--mapped-surface-alpha-hover` = `Alpha */100` and
`-pressed` = `Alpha */200` (light-based in dark, dark-based in light).

### Known Figma gaps / inferences

- **Border width**: Figma references `--border-width/xs` (1px) — no equivalent token in our system. `--brand-scale-25` (1px) used as the closest token.
- **No dedicated focus-ring token**: Figma doesn't define a focus-specific border token. `--mapped-border-primary-default` (light) and `--mapped-surface-interactive-on-color` (dark, white ring) are used for the focus outline.
- **S text-only horizontal padding**: Figma confirmed S+both-icons has `p-4px` all sides. S text-only was not separately confirmed; same 4px used throughout S.
- **L size not confirmed**: Geometry (py=12px, px=16px) inferred from the S→M progression. Verify with Figma L-size sublayer if exact spacing matters.
- **Dark-mode primary fill routed through `interactive-on-color`, not `surface-primary-default`.**
  Figma sources the dark primary's white fill from `surface/primary/default`
  (which is white in its Dark mode). We do **not** flip that shared token —
  it's consumed by 35 components, and flipping it white would repaint primary
  surfaces system-wide in dark mode. Instead the button's dark fill/border
  route through the `interactive-on-color` family, which **only** Button /
  IconButton consume (verified). Same rendered pixels (white → `#e7eaed` →
  `#cfd5dc`), zero blast radius. Approved deliberate deviation from Figma's
  literal binding.
- **RESOLVED (token layer) — the `on-color`/`interactive-on-color` dark bug that broke the old `inverse` appearance.**
  `design-tokens/Mapped/Dark.json` bound `surface.Interactive.on-color*` and
  `border.Interactive.on-color*` to `Foundations.black`, making the old inverse
  buttons render black-on-blue. Fixed those six bindings to
  `{Foundations.white}` / `{Neutral.100}` / `{Neutral.200}` (surface) and
  `{Foundations.white}` / `{Surface.100}` / `{Surface.200}` (border), matching
  Figma's Inverse-variant dark values. Zero blast radius (buttons-only family).
  Note: the broader `text.on-color.heading/body` dark bindings are still
  `Foundations.black` — not consumed by buttons, left for a separate pass.
- **Light secondary/tertiary hover/press = blue, but via the brand ramp, not the shared token.**
  The shared `surface/primary/default-subtle-hover/-pressed` stays neutral gray
  (`{Surface.50}`/`{Surface.200}`) so it doesn't tint the ~12 other consumers
  (inputs, selects, etc.). The buttons instead reference `--brand-blue-50` /
  `--brand-blue-100` directly for their light hover/press fill (user-directed,
  buttons-only). See the light-mode table note above.
- **Secondary disabled has no fill.** Figma's secondary disabled binds only
  `border/disabled/default` + `text/Disabled/*` — no surface. `--btn-bg-disabled`
  is `transparent` for secondary (was incorrectly `--mapped-surface-disabled-default`).

---

## Element Wrapper

**Figma node:** 46:920  
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `46:920`  

A square flex container that standardises size and alignment for swappable content (Icon, Avatar, Logo). Has no background, border, or border-radius — it is purely a sizing and centering shell.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `ElementWrapperSize` | `'l'` | Controls both width and height |
| `children` | `ReactNode` | — | The swappable content (icon, avatar, logo) |

### Size → token mapping

| size prop | Figma label | px | `--brand-scale-*` token |
|---|---|---|---|
| `xs` | `Xs 12` | 12px | `--brand-scale-300` |
| `s` | `S 16` | 16px | `--brand-scale-400` |
| `m` | `M 20` | 20px | `--brand-scale-500` |
| `l` | `L 24` | 24px | `--brand-scale-600` |
| `xl` | `XL 32` | 32px | `--brand-scale-800` |
| `xxl` | `XXL 40` | 40px | `--brand-scale-1000` |
| `xxxl` | `XXXL 56` | 56px | `--brand-scale-1200` |

All 7 sizes map exactly to `--brand-scale-*` tokens — no gaps.

### Geometry

| Property | Token | Value |
|---|---|---|
| Width = Height | `--brand-scale-{N}` (varies by size) | 12–56px |
| Border radius | — | none (always square) |
| Padding | — | none (container IS the bounds) |

Content is centred via `display:inline-flex; align-items:center; justify-content:center`.

### Nested instances

None. `children` is a free slot — no sub-component dependency required before building.

---

## Icon Button

**Figma node:** 140:6651 (component set), 140:6652 (M/Primary/Default instance)  
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `148:986` (Buttons frame)

An icon-only action trigger. Shares the full variant classes with Button — same `variant × state` mapping, and the same `[data-theme="dark"]` re-mapping (no `appearance` prop). Differs only in geometry (square padding, no label) and contains a single icon slot wrapped in `ElementWrapper size="l"`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'primary'` | `'primary'` \| `'secondary'` \| `'tertiary'` |
| `size` | `IconButtonSize` | `'m'` | `'s'` \| `'m'` \| `'l'` |
| `icon` | `ReactNode` | — | The icon content; wrapped in `ElementWrapper size="l"` (24px) |
| `ariaLabel` | `string` | — | Accessible name — required in production for icon-only buttons |
| `isDisabled` | `boolean` | `false` | |
| `onClick` | `() => void` | — | |
| `previewState` | `'hover' \| 'pressed' \| 'focus'` | — | Showcase-only |

### Geometry tokens

| Property | Token | Value | Notes |
|---|---|---|---|
| Border radius | `--brand-scale-200` | 8px | Same as Button |
| Border width | `--brand-scale-25` | 1px | Same as Button |
| S padding (all sides) | `--brand-scale-100` | 4px | Square — total 32px with 24px icon |
| M padding (all sides) | `--brand-scale-200` | 8px | Square — total 40px with 24px icon |
| L padding (all sides) | `--brand-scale-300` | 12px | Square — total 48px with 24px icon |
| Icon slot size | `ElementWrapper size="l"` | 24px | `--brand-scale-600` |
| Focus outline width | `--brand-scale-50` | 2px | Same as Button |
| Focus outline offset | `--brand-scale-50` | 2px | Same as Button |

### Surface / border / text tokens — identical to Button

See the Button section above for the full light + dark token tables. Icon Button
applies the same `.btn--{variant}` classes (defined in `Button.css`), so it
inherits the exact same `--btn-*` definitions and `[data-theme="dark"]` overrides.

### Shared styling system

Both Button and Icon Button:
- Use the `.btn` CSS class for base styles + all interaction state rules (`:hover`, `:active`, `:disabled`, `:focus-visible`)
- Define `--btn-*` vars via `.btn--{variant}` classes in `Button.css` (light), re-mapped under `[data-theme="dark"] .btn--{variant}` — no inline style objects
- Add a size modifier class for padding: `.btn--{s/m/l}` (Button, h/v split) vs `.btn--icon-{s/m/l}` (Icon Button, square)

### Known Figma gaps / inferences

- **L size not confirmed from Figma**: The L icon button size (12px padding) is observed in the XML but not verified in a Figma Dev Mode inspection.
- **Dark mode**: shares Button's exact variant classes, so the resolved dark bug fix and the `interactive-on-color` routing (see Button's entry) apply identically — no Icon-Button-specific token work.

---

## Icon

**Source:** `@material-design-icons/svg` npm package — Round style  
**Not exported from Figma.** The Figma file uses Material Icons (453 icons, 5 styles, all 24×24px in the Action category). Round was chosen to match the button corner language.

A sized, colour-inheriting wrapper around a single Material Round SVG. Renders `<ElementWrapper>` + SVG; the SVG's `fill` is always `currentColor`, so the icon colour is driven entirely by the nearest CSS `color` value.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `IconName` | — | Required. Key of the bundled icon registry |
| `size` | `IconSize` | `'m'` | `'xs'` \| `'s'` \| `'m'` \| `'l'` |

### Size → token mapping

| size | px | ElementWrapper size | `--brand-scale-*` token |
|---|---|---|---|
| `xs` | 12px | `xs` | `--brand-scale-300` |
| `s` | 16px | `s` | `--brand-scale-400` |
| `m` | 20px | `m` | `--brand-scale-500` |
| `l` | 24px | `l` | `--brand-scale-600` |

### Bundled set

**101 icons total** — 66 Material Round + 35 Custom. All keys are in `IconName` (derived from `keyof typeof ICONS`). (Icons are added on-demand as components need them, not front-loaded — this list grows across sessions; verify against `icons.ts` directly rather than trusting a stale count here if it's been a while.)

**Material Round (66):** `add`, `remove`, `close`, `check`, `edit`, `delete`, `content_copy`, `refresh`, `share`, `send`, `download`, `upload`, `open_in_new`, `attach_file`, `home`, `menu`, `arrow_back`, `arrow_forward`, `arrow_upward`, `arrow_downward`, `chevron_left`, `chevron_right`, `expand_more`, `expand_less`, `unfold_more`, `search`, `filter_list`, `sort`, `settings`, `tune`, `more_vert`, `more_horiz`, `info`, `warning`, `error`, `check_circle`, `done`, `cancel`, `remove_circle`, `help_outline`, `visibility`, `visibility_off`, `person`, `account_circle`, `group`, `login`, `logout`, `notifications`, `mail`, `dashboard`, `calendar_today`, `calendar_month`, `schedule`, `link`, `star`, `star_border`, `favorite`, `favorite_border`, `radio_button_unchecked`, `radio_button_checked`, `check_box`, `check_box_outline_blank`, `signal_cellular_alt`, `wifi`, `receipt_long`, `question_mark`

**Custom (35):** `icon_finance`, `icon_bank`, `icon_wallet`, `icon_stocks`, `icon_crypto`, `icon_gold`, `icon_battery_horizontal`, `icon_transfer`, `icon_receive`, `icon_buy_and_sell_crypto`, `icon_crypto_transfers`, `icon_grocery`, `icon_grocery_1`, `icon_food`, `icon_car`, `icon_healthcare`, `icon_healthcare_1`, `icon_shopping`, `icon_bills`, `icon_budget`, `icon_duration`, `icon_aiinsights`, `icon_aimage`, `icon_track_spending`, `icon_spending_alert`, `icon_scheduled_payments`, `icon_automatic_savings`, `icon_home`, `icon_more`, `icon_chevron_expand_less`, `icon_chevron_expand_more`, `icon_triangle_up`, `icon_triangle_down`, `icon_pdf`, `icon_monarchacademy`

Add new icons by importing in `src/components/Icon/icons.ts` and adding an entry to the `ICONS` const.

### Custom icon normalization

Source SVGs in `Assets/icons-custom/` had hardcoded `fill="black"` on their path elements, which would override `currentColor` and prevent token-driven recolouring. They were normalized in a one-time rewrite via `scripts/normalize-custom-icons.mjs`:

- `fill="black"` → `fill="currentColor"` on all path/shape elements
- Files renamed to `lowercase_underscore.svg` convention (spaces and hyphens → `_`) so they can be used as static ES module imports

The `fill="none"` on each SVG's root element is intentionally left untouched. Logo SVGs in `Assets/logo/` were **not touched** — they keep their original fills because logos are full-colour brand assets, not recolourable icons.

### Color inheritance

`Icon` sets no colour of its own — `fill="currentColor"` on the SVG root means the icon always matches the nearest CSS `color`. Usage patterns:

- **Default body text**: wrap in nothing — inherits `--mapped-text-default-default`
- **On coloured surface**: set `color: var(--mapped-text-primary-on-color)` on the parent element — icon renders white
- **Semantic colours**: set `color: var(--mapped-text-error-default-default)` / `--mapped-text-success-default-default` on the wrapper

### Composition with Button / IconButton

Button and IconButton render their icon props directly (no extra wrapper). Pass `<Icon name="..." size={buttonSize} />` as `leadingIcon` / `trailingIcon`. The Icon's own `ElementWrapper` provides the sizing and alignment.

For IconButton: the icon slot always expects `size="l"` (24px) since IconButton padding is designed around a 24px glyph.

### SVGR setup

`vite-plugin-svgr` transforms `*.svg?react` imports into React components. Configured in `vite.config.ts`. Type declarations come from `/// <reference types="vite-plugin-svgr/client" />` in `src/vite-env.d.ts`.

---

## Avatar

**Figma node:** 102:2756 (Parts frame — Default + Label subsections)

A circular identity element with a three-state fallback chain: photo → initials → placeholder icon.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `AvatarSize` | `'m'` | `'s'` \| `'m'` \| `'l'` |
| `src` | `string` | — | Image URL. When present, renders full-bleed photo (highest priority) |
| `name` | `string` | — | Full name. Derives initials if `initials` not provided (`"Margaret Green"` → `"MG"`) |
| `initials` | `string` | — | Explicit abbreviation, overrides `name`-derived initials |
| `alt` | `string` | — | Alt text for the photo `<img>`. Falls back to `name` |

### Fallback chain

`src` → photo state · `initials` or `name` → initials state · neither → placeholder state

### Size → token mapping

| size | px | `--brand-scale-*` token |
|---|---|---|
| `s` | 24px | `--brand-scale-600` |
| `m` | 32px | `--brand-scale-800` |
| `l` | 40px | `--brand-scale-1000` |

### Shape

`border-radius: 50%` + `overflow: hidden`. Figma uses `--border-radius/round = 512px`; no equivalent exists in our token system. `50%` is used as a CSS geometric primitive (always circular regardless of dimension — not a hardcoded px value).

### State tokens

| State | Surface | Border | Text |
|---|---|---|---|
| photo | — (image fills circle) | none | — |
| initials | `--mapped-surface-primary-default-subtle` | `--brand-scale-25` (1px) solid `--mapped-border-subtlest-default` | `--mapped-text-subtle-default` |
| placeholder | `--mapped-surface-default-default` | none | — (icon inherits `currentColor`) |

### Typography (initials state)

| size | class | px | weight |
|---|---|---|---|
| `s` | `.type-body-caption-semibold` | 12px | 600 |
| `m` | `.type-body-sm-semibold` | 14px | 600 |
| `l` | `.type-body-m-semibold` | 16px | 600 |

### Nested instances

- **photo**: raw `<img>` with `object-fit: cover` — no sub-component dependency
- **initials**: no sub-components
- **placeholder**: `<Icon name="person" size={size} />` — depends on Icon component

### Known Figma gaps / inferences

- **Border radius**: Figma `--border-radius/round = 512px` has no token equivalent. `border-radius: 50%` used.
- **Border width**: Figma shows `0.5px` hairline on the initials variant. No `0.5px` token; `--brand-scale-25` (1px) used — same precedent as Button's `border-width/xs` gap.
- **`--surface/default/default`**: Figma token for placeholder background. Confirmed as `--mapped-surface-default-default` in our mapped layer (resolves to a neutral gray in light mode).
- **Figma size label inconsistency**: Initials variant labels small size "S 24"; placeholder labels it "S 20" — both render at 24px. Normalised to `s = 24px` in code.

---

## Logo

**Source:** `Assets/logo/brand/`, `Assets/logo/company/`, `Assets/logo/crypto/`  
**Not from Figma tokens.** Logos are full-colour brand assets — they must never have colour tokens applied.

### Critical rule: no colour tokens

Logo SVGs preserve their original fills exactly. Do **not** pass `fill`, `color`, or `currentColor` to a Logo component or its container. The `<Logo>` component intentionally omits all colour props.

### Registration

Logos are auto-registered via `import.meta.glob` in `src/components/Logo/logos.ts`. Every `.svg` dropped into `Assets/logo/<category>/` is picked up at the next build without any code change. The `LogoName` union type must be updated manually to keep TS autocomplete in sync.

### Categories (folder-driven)

| Category | Folder | Count |
|---|---|---|
| `brand` | `Assets/logo/brand/` | 2 |
| `company` | `Assets/logo/company/` | 18 |
| `crypto` | `Assets/logo/crypto/` | 10 |

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `LogoName` | — | Required. Normalized filename (lowercase, non-alphanumeric → `_`) |
| `size` | `LogoSize` | `'m'` | `'xs'` \| `'s'` \| `'m'` \| `'l'` — controls height only |

### Size → token mapping

Height is constrained via token; width is `auto` to preserve each logo's natural aspect ratio.

| size | height | token |
|---|---|---|
| `xs` | 14px | `14px` literal — off the `--brand-scale` ramp (12/16), but derived directly from the Monarch mark's fixed 24:14 SVG aspect ratio to reproduce a 24px-wide mark (compact contexts, e.g. `SideNavigation`'s brand row) — not a guess |
| `s` | 32px | `--brand-scale-800` |
| `m` | 40px | `--brand-scale-1000` |
| `l` | 56px | `--brand-scale-1200` |

### Name normalization

Filename → `LogoName`: lowercase, replace runs of non-alphanumeric characters with `_`, strip leading/trailing `_`.

Examples: `"Monarch logo, Style = Thick.svg"` → `monarch_logo_style_thick` · `"Bili bili Inc.svg"` → `bili_bili_inc` · `"Lotus's.svg"` → `lotus_s`

### Adding a new logo

1. Drop the `.svg` into the correct `Assets/logo/<category>/` folder.
2. Add its normalized name to the `LogoName` union in `src/components/Logo/logos.ts`.

---

## Blanket

**Figma node:** 158:3308  
**Source frame:** node 155:250

Full-screen fixed overlay used to visually separate modal/drawer content from the page behind it. Clicking the blanket typically closes the overlaying element.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onClick` | `() => void` | — | Close handler for clicking outside the modal |

### Token mapping

| Property | Token | Notes |
|---|---|---|
| Background | `--mapped-blanket-default-default` | Semi-transparent dark fill — light: `#091e427d`, dark: `#10121499` |
| z-index | `100` (hardcoded) | Above page content, below modal content |

### Geometry

| Property | Value |
|---|---|
| Position | `fixed; inset: 0` |

### Known Figma inconsistencies

- Figma shows fixed pixel dimensions (409×428) — these are artboard demo sizes; real Blanket is always full-screen.

---

## Divider

**Figma node:** 191:13048 (2px), 191:13653 (1px)  
**Source frame:** node 191:12980 (Parts frame)

A visual separator line. Figma specifies a vertical orientation only; horizontal is added as a standard extension.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `weight` | `1 \| 2` | `1` | Line thickness in px |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Figma only specifies vertical; horizontal added for standard use |

### Token mapping

| Property | Token |
|---|---|
| Color | `--mapped-border-subtle-default` |
| Weight 1 | `--brand-scale-25` (1px) |
| Weight 2 | `--brand-scale-50` (2px) |

### Known Figma inconsistencies

- Figma Parts frame shows only vertical dividers (width × height: 5×47px, 6×47px). Horizontal orientation is a standard extension not in Figma source — marked as inferred.
- Figma wrapper has 2px horizontal padding (`--scale/50`) around the line; omitted in code since it's demo scaffolding.

---

## Chips

**Figma node:** 105:321–105:347  
**Source frame:** node 105:101

Status lozenge (Atlassian Lozenge pattern). The leading glyph inherits
`currentColor` from the container.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `ChipsAppearance` | `'default'` | See table below |
| `isBold` | `boolean` | `false` | `false` = subtle tinted fill; `true` = solid saturated fill with white text |
| `label` | `string` | `'LABEL'` | Visible text |
| `icon` | `ReactNode` | `<Icon name="done" size="s" />` | Leading glyph. **Omitting it renders the same checkmark as before**, so no existing call site changes |

**`icon` (added v1.3.0).** The `done` checkmark was previously rendered
**unconditionally**, so a `removed` or `moved` chip still displayed a tick —
harmless for the demand met so far, wrong in general. Exposed as a real
`ReactNode` slot rather than a boolean or an icon-name string, per the rule
the `Link` regression established: a slot hard-coded to one icon behind a flag
is not swappable. In-repo precedent is `SummaryItem`'s `icon` default.

Because a React default applies only to `undefined`, **`icon={null}` renders no
glyph at all** — the escape hatch a `removed` chip needs, at no extra API cost.
Verified: omitted → checkmark present; `null` → no `svg`, label intact.

### Appearance × Bold → token mapping

| appearance | isBold | Background token | Text/icon token |
|---|---|---|---|
| `default` | false | `--alias-surface-100` | `--mapped-text-subtle-default` |
| `default` | true | `--alias-neutral-800` | `--mapped-text-primary-on-color` |
| `inprogress` | false | `--alias-primary-100` | `--mapped-text-primary-default-hover` |
| `inprogress` | true | `--mapped-surface-primary-default` | `--mapped-text-primary-on-color` |
| `moved` | false | `--alias-warning-100` | `--mapped-text-warning-default-hover` |
| `moved` | true | `--mapped-surface-warning-default` | `--mapped-text-warning-on-color` |
| `new` | false | `--alias-interactive-100` | `--mapped-text-interactive-default-hover` |
| `new` | true | `--mapped-surface-interactive-default` | `--mapped-text-interactive-on-color` |
| `removed` | false | `--alias-error-100` | `--mapped-text-error-default-hover` |
| `removed` | true | `--mapped-surface-error-default` | `--mapped-text-error-on-color` |
| `success` | false | `--alias-success-100` | `--mapped-text-success-default-hover` |
| `success` | true | `--alias-success-400` | `--mapped-text-success-on-color` |

### Geometry tokens

| Property | Token | Value |
|---|---|---|
| Gap (icon→text) | `--brand-scale-50` | 2px |
| Padding (horizontal) | `--brand-scale-100` | 4px |
| Border radius | `--brand-scale-200` | 8px |

### Typography

`.type-body-caption-semibold` — Poppins SemiBold 12px

### Known Figma inconsistencies

- **Subtle background tokens at alias layer only**: `--alias-surface-100`, `--alias-neutral-800`, `--alias-primary-100`, `--alias-warning-100`, `--alias-interactive-100`, `--alias-error-100`, `--alias-success-100` are alias-layer tokens with no mapped equivalent and **no dark-mode flip**. These will render the same color in both themes. (Confirmed from Figma source — only light-mode values specified.) **Measured live 2026-08-11**, all six appearances: byte-identical in both themes (`default` `rgb(242,242,242)`, `inprogress` `rgb(205,226,255)`, `moved` `rgb(255,232,218)`, `new` `rgb(223,219,240)`, `removed` `rgb(251,220,220)`, `success` `rgb(215,241,223)`) — pale tints that stay pale on a black page. Note these are **static appearance backgrounds, not interactive states**: `Chips.css` contains no `:hover`/`:active`/`:focus`/`--selected`/`--pressed` selector at all, so this is not the alias-in-interactive-state bug `CLAUDE.md` bans. Still open as a token-layer question; deliberately not changed in the v1.3.0 prop batch, since it would be a visual change.
- **success bold uses green/400**: Figma maps success bold background to `--green/400` (`--alias-success-400`), not green/500. Only level in the system that uses a 400 shade for a bold background. Preserved as-is.
- Figma component description says `🧬 <Lozenge appearance="default">Label</Lozenge>` — named "Chips" in our system to match the Figma frame name.

---

## Label

**Figma node:** 39:145–39:163  
**Source frame:** node 73:2778

Form field label with optional required indicator and leading/trailing icon slots.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Label'` | Visible text |
| `size` | `'m' \| 's'` | `'s'` | m = 16px / s = 14px body |
| `isRequired` | `boolean` | `false` | Shows `*` in error color after label text |
| `iconBefore` | `ReactNode` | — | Leading icon slot (Figma uses `help_outline`) |
| `iconAfter` | `ReactNode` | — | Trailing icon slot (Figma uses `help_outline`) |

### Token mapping

| Element | Token |
|---|---|
| Label text | `--mapped-text-default-default` |
| Required `*` | `--mapped-text-error-default` |
| Icon color | `--mapped-icon-default-default` |

### Typography

| Size | Label class | Required `*` class |
|---|---|---|
| m | `type-body-m-semibold` (16px) | `type-body-m-semibold` (same size) |
| s | `type-body-sm-semibold` (14px) | `type-body-caption-semibold` (12px — smaller) |

### Geometry tokens

| Property | Token | Value |
|---|---|---|
| Gap between elements | `--brand-scale-100` | 4px |

### Known Figma inconsistencies

- **Required `*` size differs by size**: In size s, the asterisk is caption (12px) while label text is body-sm (14px). In size m, both share the same body/m font. Preserved as-is from Figma.
- Figma shows `help_outline` as the default icon; in code the icon slots are ReactNode for flexibility.

---

## Toggle

**Figma node:** 59:2721  
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `59:2721`

A binary on/off control rendered as a sliding pill track. Uses a hidden native `<input type="checkbox" role="switch">` for semantics; all visual state is driven via CSS sibling combinators.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `ToggleSize` | `'m'` | `'m'` \| `'l'` |
| `isChecked` | `boolean` | `false` | Controlled; triggers `onChange` |
| `isDisabled` | `boolean` | `false` | |
| `onChange` | `(checked: boolean) => void` | — | |
| `ariaLabel` | `string` | — | Required for icon-only / standalone usage |

### Track × state → token mapping

| state | track background token |
|---|---|
| unchecked default | `--mapped-icon-subtlest-subtlest` |
| unchecked hover | `--mapped-icon-subtlest-subtlest-hover` |
| checked default | `--mapped-surface-primary-default` |
| checked hover | `--mapped-surface-primary-default-hover` |
| disabled (any) | `--mapped-icon-disabled-default` |
| focus ring | `--mapped-border-primary-default` (2px outline, 2px offset) |

### Dot tokens

| Property | Token | Notes |
|---|---|---|
| Background | `--mapped-text-primary-on-color` | Resolves to `#ffffff` in both light and dark |
| Shadow | `--shadow-subtle` | Depth cue — same as card shadow |

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Track border-radius | `--brand-scale-1800` | 512px → always pill |
| Dot offset (top/left unchecked) | `--brand-scale-50` | 2px |
| **m** track width | `--brand-scale-800` | 32px |
| **m** track height | `--brand-scale-400` | 16px |
| **m** dot size | `--brand-scale-300` | 12px |
| **m** dot checked left | `calc(--brand-scale-800 - --brand-scale-300 - --brand-scale-50)` | 18px |
| **l** track width | `46px` (literal) | 46px — off the ramp (1000=40px/1100=48px); see note below |
| **l** track height | `--brand-scale-600` | 24px |
| **l** dot size | `--brand-scale-500` | 20px |
| **l** dot checked left | `--brand-scale-600` | 24px |

### Known Figma inconsistencies

- **l track width = 46px**: no `--brand-scale-*` token resolves to 46px (nearest ramp steps: 1000=40px, 1100=48px). Previously implemented as `calc(var(--brand-scale-1100) - var(--brand-scale-50))` (48−2=46) — an **audit-flagged HIGH finding**, since this is exactly CLAUDE.md's banned pattern (a calc() curve-fit between unrelated scale tokens fabricating a relationship that doesn't exist in the source). Fixed: now a plain `46px` literal with a FAIL-LOUD comment in `Toggle.css`, pending a Figma Variables fix.
- **Figma dot is an image asset**: The Figma file shows the dot as a raster image asset. Replaced with pure CSS (`border-radius: 50%`, `--shadow-subtle`).
- **No `checked-hover` mapped surface token prior to investigation**: Initial build used `--alias-primary-600` directly. Corrected to `--mapped-surface-primary-default-hover` after confirming the mapped token exists and resolves to `alias-primary-500` in dark mode (vs 600 in light mode) — dark-mode behaviour was wrong before the fix.

---

## Progress Stepper

**Figma node:** 275:4076 (Parts), 275:3988 (component)  
**Source file:** `xhA5ARVgSeD3gA41lYDqST`

A horizontal series of fixed-width pill bars showing progress through a numbered sequence. Active bars (steps completed + current) render in primary blue; future bars render in neutral gray.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `totalSteps` | `number` | `7` | Number of bars to render |
| `currentStep` | `number` | `1` | Steps 1 through `currentStep` render as active |
| `ariaLabel` | `string` | `` `Step {currentStep} of {totalSteps}` `` | Accessible name for the `role="progressbar"`. The dots are anonymous, so without this the bar would have **no** accessible name — the generated fallback prevents that (audit F3). |

### State → token mapping

| state | token |
|---|---|
| Active (completed/current) | `--mapped-icon-primary-default` |
| Inactive (future) | `--mapped-surface-default-default` |

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Bar width | `--brand-scale-600` | 24px |
| Bar height | `--brand-scale-100` | 4px |
| Bar border-radius | `--brand-scale-1800` | 512px → pill |
| Gap between bars | `--brand-scale-100` | 4px |

### Accessibility

`role="progressbar"` on container with `aria-valuenow`, `aria-valuemin=1`, `aria-valuemax` wired to props.

### Known Figma inconsistencies

None recorded.

---

## Tag

**Figma node:** 105:690  
**Source file:** `xhA5ARVgSeD3gA41lYDqST`

A filter/selection pill rendered as a `<button>`. Two appearances (default on white; overlay on dark surfaces) × two sizes. The "selected" state maps to Figma's "Focus" visual (blue fill).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Tag'` | Visible text |
| `appearance` | `TagAppearance` | `'default'` | `'default'` \| `'overlay'` |
| `size` | `TagSize` | `'m'` | `'m'` \| `'s'` |
| `isSelected` | `boolean` | `false` | Blue fill — maps to Figma "Focus" state |
| `isDisabled` | `boolean` | `false` | |
| `iconBefore` | `ReactNode` | — | Leading icon slot |
| `iconAfter` | `ReactNode` | — | Trailing icon slot |
| `onClick` | `() => void` | — | |

### Default appearance — state × token mapping

| state | background | border | text/icon |
|---|---|---|---|
| default | `transparent` | `transparent` | `--mapped-text-subtle-default` |
| hover | `color-mix(--mapped-border-primary-default 10%, transparent)` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-default-hover` |
| press | `color-mix(--mapped-border-primary-default 20%, transparent)` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-default-pressed` |
| selected | `--mapped-surface-primary-default` | `--mapped-surface-primary-default` | `--mapped-text-primary-on-color` |
| disabled | `transparent` | `--mapped-border-disabled-default` | `--mapped-text-disabled-default` |
| focus ring | — | `--mapped-border-primary-default` (2px / 2px offset) | — |

### Overlay appearance — state × token mapping

| state | background | text/icon |
|---|---|---|
| default | `--mapped-surface-overlay-default` | `--mapped-text-primary-on-color` |
| hover | `--mapped-surface-overlay-hover` | `--mapped-text-primary-on-color` |
| press | `--mapped-surface-overlay-label-pressed` | `--mapped-text-primary-on-color` |
| disabled | `--mapped-surface-overlay-default` (opacity 0.5) | `--mapped-text-primary-on-color` |
| focus ring | — | `white` (hardcoded — overlay is always on dark surface) |

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Border radius | `--brand-scale-100` | 4px |
| Size m padding | `--brand-scale-100` (v) `--brand-scale-50` (h) | 4px / 2px |
| Size s padding | `--brand-scale-50` (all) | 2px |
| Icon/label gap | `--brand-scale-100` | 4px |

### Typography

| size | class | px |
|---|---|---|
| m | `type-body-sm` | 14px regular |
| s | `type-body-caption` | 12px regular |

### Known Figma inconsistencies

- **Hover/press tint backgrounds — no mapped subtle-primary-tint token exists**: `--mapped-surface-primary-default-subtle-hover` resolves to `alias-surface-50` (neutral gray), not a blue tint. Figma source uses `color.blue.50` (#e6f1ff ≈ 10% primary over white) for hover and `color.blue.100` (#cde2ff ≈ 20%) for press. **Superseding the earlier alias fallback**: now derived via `color-mix(in srgb, var(--mapped-border-primary-default) N%, transparent)` (10% hover / 20% press), matching the FilterChip precedent — this dark-flips correctly, whereas the previous `--alias-primary-50/100` were frozen across themes. Flag for a future Figma Variables addition of proper subtle-primary-tint tokens.
- **Overlay focus ring**: Now uses `--mapped-text-primary-on-color` (was hardcoded `white`). Overlay context is always dark, so it resolves to #ffffff either way; the token form keeps Tag free of raw color literals.

---

## Icon Object

**Figma node:** 221:20  
**Source file:** `xhA5ARVgSeD3gA41lYDqST`

A container that pairs a colored background (circle or square) with an icon child. All 12 solid colors use their brand-400 level; the AI color uses a three-stop gradient.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `color` | `IconObjectColor` | `'gray'` | 12 solid + `'ai'` gradient — see table |
| `shape` | `IconObjectShape` | `'circle'` | `'circle'` \| `'square'` |
| `size` | `IconObjectSize` | `'xl'` | `'xs'` \| `'s'` \| `'m'` \| `'l'` \| `'xl'` \| `'xxl'` |
| `children` | `ReactNode` | — | Icon slot; container sets `color: var(--mapped-text-primary-on-color)` so icons inherit white via `currentColor` |
| `ariaLabel` | `string` | — | When provided, renders `role="img"` |

### Color → token mapping

| color | background token |
|---|---|
| `slate` | `--brand-slate-400` |
| `blue` | `--brand-blue-400` |
| `gray` | `--brand-gray-400` |
| `red` | `--brand-red-400` |
| `orange` | `--brand-orange-400` |
| `green` | `--brand-green-400` |
| `teal` | `--brand-teal-400` |
| `purple` | `--brand-purple-400` |
| `cyan` | `--brand-cyan-400` |
| `yellow` | `--brand-yellow-400` |
| `lime` | `--brand-lime-400` |
| `violet` | `--brand-violet-400` |
| `ai` | `linear-gradient(132.61deg, --brand-blue-400 7.662%, --brand-blue-500 27.411%, --brand-violet-500 78.849%)` |

### Size → token mapping

| size | token | resolved px |
|---|---|---|
| `xs` | `--brand-scale-400` | 16px |
| `s` | `--brand-scale-500` | 20px |
| `m` | `--brand-scale-600` | 24px |
| `l` | `--brand-scale-800` | 32px |
| `xl` | `--brand-scale-1000` | 40px |
| `xxl` | `--brand-scale-1200` | 56px |

**`xs` (added v1.3.0)** extends the existing ratio scale downward using
`--brand-scale-400`, a token that **already existed** — no new token was
introduced and the ramp's shape is unchanged. Demand: Flow 11's `education`
checklist renders the badge at 16×16 six times. The default (`xl`) is
untouched, so no existing call site changes. Verified 16px in both themes.

### Shape → border-radius

| shape | token | value |
|---|---|---|
| `circle` | `--brand-scale-1800` | 512px → always circular |
| `square` | `--brand-scale-200` | 8px |

### Icon color inheritance

Container sets `color: var(--mapped-text-primary-on-color)` (resolves to `#ffffff` in both light and dark). Child `<Icon>` SVGs use `fill="currentColor"` and inherit white.

### Known Figma inconsistencies

- **No mapped token for brand-400 backgrounds**: The 12 solid colors use brand-layer tokens directly. No `--mapped-surface-[color]-default` equivalents exist in the mapped layer for these specific colors/levels.
- **AI gradient**: Extracted from Figma as `linear-gradient(132.61deg, blue-400 → blue-500 → violet-500)`. Uses brand tokens, not alias or mapped. Its `blue-400` first stop **stays at `-400` by decision** (Phase 5.4) — decorative, no text sits on it, and Figma specifies `Blue/400` there.
- **⚠️ `IconObject` no longer shares a palette level with `CardFeaturesAndEducation`.** As of Phase 5.4 the card moved to `-500` while `IconObject` stays on `-400`, so **blue, orange, green and purple resolve to different values in the two components**. This is deliberate, not drift: a card title is text (4.5:1) while an `IconObject` glyph is non-text (3:1), so the two were resolved separately. `IconObject`'s own level is **undecided and deliberately unchanged** — see the "Deliberate divergence" note under `Card`.
- **⚠️ White glyphs on the `-400` swatches fail WCAG AA, in both themes.** Measured across all twelve hues: only `purple` (4.18) approaches 4.5:1, and **8 of 12 fall below even 3:1** for a non-text glyph (`yellow` 1.41, `lime` 1.50, `gray` 1.64, `orange` 1.99, `cyan` 2.03, `green` 2.12, `teal` 2.19, `slate` 2.36). The ratios are identical in light and dark because `--brand-*` never dark-flips — confirmed empirically, not assumed. **Open, not decided** — unlike the card, `IconObject` has had no ramp decision made. Grouped with the `Card` and `TrendIndicator` contrast findings as one token-layer item.

---

## Checkbox

**Figma node:** 148:2139 (component set), 148:2110 (Parts)  
**Source file:** `xhA5ARVgSeD3gA41lYDqST`

A form control with three selection states (unchecked/checked/indeterminate) and error/required/disabled modifiers. Indeterminate state is set via `inputRef.current.indeterminate` in a `useEffect` — HTML does not support a declarative `indeterminate` attribute.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Label'` | |
| `size` | `CheckboxSize` | `'m'` | `'m'` \| `'l'` |
| `isChecked` | `boolean` | `false` | |
| `isIndeterminate` | `boolean` | `false` | Sets `input.indeterminate`; renders dash icon; `aria-checked="mixed"` |
| `isInvalid` | `boolean` | `false` | Red border + red fill when marked |
| `isRequired` | `boolean` | `false` | Appends `*` in error color **and** sets `required` + `aria-required` on the input |
| `isDisabled` | `boolean` | `false` | |
| `onChange` | `(checked: boolean) => void` | — | |
| `id` | `string` | — | Forwarded to `<input>` |

### Box × state → token mapping

| state | background | border | icon color |
|---|---|---|---|
| unchecked default | `--mapped-surface-page` | `--mapped-border-default-default` | — |
| unchecked hover | `--mapped-surface-primary-default-subtle-hover` | `--mapped-border-disabled-default` | — |
| unchecked press | `--mapped-surface-primary-default-subtle-pressed` | `--mapped-border-subtlest-default` | — |
| checked/indeterminate default | `--mapped-surface-primary-default` | `--mapped-surface-primary-default` | `--mapped-text-primary-on-color` |
| checked/indeterminate hover | `--mapped-surface-primary-default-hover` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-on-color` |
| checked/indeterminate press | `--mapped-surface-primary-default-pressed` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-on-color` |
| invalid unchecked | `--mapped-surface-page` | `--mapped-border-error-default` | — |
| invalid checked | `--mapped-surface-error-default` | `--mapped-surface-error-default` | `--mapped-text-primary-on-color` |
| disabled | `--mapped-surface-page` (opacity 0.5) | `--mapped-border-disabled-default` | — |
| disabled checked | `--mapped-icon-disabled-default` | `--mapped-icon-disabled-default` | — |
| focus ring | — | `--mapped-border-primary-default` (2px / 2px offset) | — |

### Required asterisk

`color: --mapped-text-error-default`

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Box-wrap (m) | `24×24px` — `--brand-scale-600` would be 24px but expressed as literal in CSS |
| Box-wrap (l) | `32×32px` — `--brand-scale-800` |
| Visual box | `inset: 25%` inside box-wrap — m: 12×12px; l: 16×16px |
| Box border-radius | `--brand-scale-50` | 2px |
| Label gap | `--brand-scale-100` | 4px |

### Typography

Label: `type-body-sm` (14px regular). Required asterisk: `type-body-caption-semibold` (12px 600).

### Known Figma inconsistencies

- **Figma shows checkmarks/states as image assets**: Pure CSS + inline SVG used instead. SVG paths: checkmark `M1 4L3.5 6.5L9 1` (10×8 viewBox), dash `x1=1 y1=1 x2=9 y2=1` (10×2 viewBox).
- **Required `*` uses `color.text.danger` (#ae2e24) in Figma**: No matching token in our system. Mapped to `--mapped-text-error-default` as closest semantic equivalent. Confirmed inconsistency.
- **Initial build used alias fallbacks for hover/press-checked**: `--alias-primary-600/700` used directly, bypassing `--mapped-surface-primary-default-hover/pressed`. Fixed after token investigation confirmed mapped tokens exist and resolve correctly in both light and dark mode.

---

## Radio

**Figma node:** 149:9752 (component set), 149:9736 (Parts)  
**Source file:** `xhA5ARVgSeD3gA41lYDqST`

A single radio button. Intended to be used in groups via shared `name` attribute on the native `<input>`. Visual structure: hidden native input → 24px icon-wrap → 14×14px circle → 6px inner dot (when checked).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Label'` | |
| `isChecked` | `boolean` | `false` | Controlled |
| `isInvalid` | `boolean` | `false` | Red border |
| `isRequired` | `boolean` | `false` | Appends `*` in error color **and** sets `required` + `aria-required` on the input |
| `isDisabled` | `boolean` | `false` | |
| `onChange` | `(checked: boolean) => void` | — | Matches Toggle/Checkbox signature |
| `name` | `string` | — | Groups radios for mutual exclusion |
| `value` | `string` | — | Form value |
| `id` | `string` | — | |

### Circle × state → token mapping

| state | background | border | dot |
|---|---|---|---|
| unchecked default | `--mapped-surface-page` | `--mapped-border-subtlest-default` | — |
| unchecked hover | `--mapped-surface-primary-default-subtle-hover` | `--mapped-border-subtlest-default` | — |
| unchecked press | `--mapped-surface-primary-default-subtle-pressed` | `--mapped-border-subtlest-default` | — |
| checked default | `--mapped-surface-primary-default` | `--mapped-surface-primary-default` | `--mapped-text-primary-on-color` |
| checked hover | `--mapped-surface-primary-default-hover` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-on-color` |
| checked press | `--mapped-surface-primary-default-pressed` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-on-color` |
| invalid unchecked | `--mapped-surface-page` | `--mapped-border-error-default` | — |
| invalid checked | `--mapped-surface-error-default` | `--mapped-surface-error-default` | `--mapped-text-primary-on-color` |
| disabled | `--mapped-surface-disabled-default` | `--mapped-border-disabled-default` | — |
| disabled checked | `--mapped-icon-disabled-default` | `--mapped-icon-disabled-default` | — |
| focus ring | — | `--mapped-border-primary-default` (2px / 2px offset, radius: `--brand-scale-1800`) | — |

### Required asterisk

`color: --mapped-text-error-default`

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Icon-wrap size | `24×24px` (explicit) | — |
| Circle size | `14×14px` (explicit) | — |
| Circle border-radius | `--brand-scale-1800` | 512px → always round |
| Inner dot size | `6×6px` (explicit) | — |
| Label gap | `--brand-scale-100` | 4px |

### Typography

Label: `type-body-sm` (14px regular). Required asterisk: `type-body-caption-semibold` (12px 600).

### Known Figma inconsistencies

- **Circle and dot sizes (14px, 6px) have no exact token**: `--brand-scale-300 = 12px`, `--brand-scale-400 = 16px` — 14px falls between them. Similarly 6px has no token. Sizes set as explicit pixel values.
- **Required `*` color**: Same as Checkbox — Figma `color.text.danger` (#ae2e24) has no token match; `--mapped-text-error-default` used.
- **Initial build used alias fallbacks for hover/press-checked**: `--alias-primary-600/700` used directly, same class of bug as Checkbox. Fixed after token investigation.

---

## Tab

**Figma node:** 67:1987 (`Code parts / <Tab>`)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `149:9246` (Parts documentation frame)

A single interactive tab unit. Intended to be composed inside a `Tabs` container with `role="tablist"`. Draws its label text directly — does not compose the Label component. No Icon or Badge instances.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Tab'` | Visible text |
| `isSelected` | `boolean` | `false` | Controlled by parent Tabs |
| `onClick` | `() => void` | — | |
| `previewState` | `'hover' \| 'pressed' \| 'focus'` | — | Showcase-only: forces a visual state |
| `ariaControls` | `string` | — | ID of the controlled tab panel |
| `id` | `string` | — | Forwarded to `<button>` |

### State × token mapping

| state | isSelected | background | text token | underline | shadow |
|---|---|---|---|---|---|
| default | false | `transparent` | `--mapped-text-subtlest-subtlest` | — | — |
| default | true | `--mapped-surface-primary-default-subtle` | `--mapped-text-default-default` | `--mapped-border-primary-default` ⚠️ | `--shadow-subtlest` |
| hover | false | `--mapped-surface-primary-default-subtle-hover` | `--mapped-text-subtle-hover` | — | `--shadow-subtlest` |
| press | false | `transparent` | `--mapped-text-subtle-subtle-pressed` | — | — |
| focus | false | `--mapped-surface-primary-default-subtle` | `--mapped-text-subtle-subtle-pressed` | — | focus ring |
| focus | true | `--mapped-surface-primary-default-subtle` | `--mapped-text-default-default` | `--mapped-border-primary-default` | focus ring |

Focus ring: `--mapped-border-primary-default`, 2px outline, 2px offset (per a later
Figma update — was 0 offset originally; the ring now renders at ~10px via the
tab's own 8px corners + the 2px offset, concentric, no separate radius override needed)

### Geometry tokens

| Property | Token | Resolved value |
|---|---|---|
| Padding H | `--brand-scale-400` | 16px |
| Padding V | `--brand-scale-200` | 8px |
| Container border-radius | `--brand-scale-200` | 8px |
| Underline height | `--brand-scale-50` | 2px |
| Underline inset (left/right) | `--brand-scale-200` | 8px |
| Underline bottom offset | `--brand-scale-100` | 4px |
| Underline border-radius | `--brand-scale-50` | 2px |

### Typography

`.type-body-caption-semibold` — Poppins 600 / 12px

### Known Figma inconsistencies

- **`color.border.selected` (#0c66e4) missing from token source** ⚠️: Figma uses this Atlassian token for the underline on `default + isSelected`. No equivalent exists in our mapped layer (nearest blues: `--brand-blue-500 = #046eff`, `--brand-blue-600 = #0358cc`). `--mapped-border-primary-default` (#046eff) used as fallback. Fix requires adding `color.border.selected` to Figma Variables → Token Studio sync.
- **`Snackbar / Text (Paragraph)` in Parts frame (110:4145)**: An annotation/example element with Figma description "This should be replaced by your own slot component, this is just an example." Not a component dependency — not built.
- **Node 149:9246 is the Parts documentation frame**, not the Tab component itself. The actual component is node 67:1987.
- **Only 6 of 8 `state × isSelected` combinations exist in Figma** (67:1987): `default/false`, `default/true`, `hover/false`, `press/false`, `focus/false`, `focus/true`. There is no `hover+isSelected` or `press+isSelected` variant in the source. Code intentionally mirrors this gap — `.tab:hover:not(.tab--selected)` and `.tab:active:not(.tab--selected)` only apply hover/press styling when the tab is unselected, so a selected tab shows no extra hover/press feedback beyond its selected appearance. Inferred, not explicitly specified.

---

## Tabs

**Figma node:** 70:1995 (`Tabs`)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `149:9124` (Components documentation frame)

A controlled wrapper that composes multiple `Tab` instances inside a `role="tablist"` container. All visual tokens live in the child `Tab` component — `Tabs` itself has no surface, border, shadow, or typography tokens of its own.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tabs` | `TabItem[]` | — | Array of `{ id: string; label: string }` |
| `selectedId` | `string` | — | Controlled selected tab ID |
| `onChange` | `(id: string) => void` | — | Called on tab click |
| `ariaLabel` | `string` | — | `aria-label` on the `role="tablist"` div |
| `isScrollable` | `boolean` | `false` | Overflow horizontally instead of shrinking. Scrollbar indicator hidden, scrolling preserved. |

`TabItem` type: `{ id: string; label: string }`

### Nested components

- **`Tab`** (67:1987) — imported from `../Tab`. Each `TabItem` maps to one `<Tab>` with `isSelected`, `tabIndex` (roving), and `onClick` wired.

### Keyboard & ARIA

- **Roving tabindex**: exactly one tab is in the tab order (`tabIndex=0`) — the selected tab, or the first tab if selection is absent/unmatched; all others are `tabIndex=-1`, per the WAI-ARIA tablist pattern.
- **Arrow keys**: `ArrowRight`/`ArrowLeft` move selection (automatic activation) to the next/previous tab, wrapping at the ends, and move focus to that tab.
- **Scroll-into-view (`isScrollable` only)**: arrow-key navigation past the visible edge calls `scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })` on the newly selected tab. This lives in `Tabs` rather than a consumer wrapper because only `Tabs` knows which tab selection moved to. Called optionally (`?.`) — jsdom does not implement `scrollIntoView`.
- **`aria-controls` removed**: the earlier build wired `aria-controls="panel-<id>"` to tabpanels that don't exist (Tabs renders no panels). The dangling reference was removed rather than pointing at absent elements. `Tab` retains an optional `ariaControls` prop for callers who *do* render real panels.

### Token mapping

No colour, typography or shadow tokens at the Tabs level — all delegated to `Tab`. Container CSS:

```css
.mn-tabs { display: flex; align-items: center; }
```

The scrollable variant consumes one spacing token:

| Element | Token |
|---|---|
| `.mn-tabs--is-scrollable` padding / negative margin | `--brand-scale-100` (4px) |

**Why the padding exists.** `overflow-x: auto` promotes `overflow-y` from `visible` to `auto` (CSS Overflow §3 — a non-`visible` value on one axis forces the other), which turns the bar into a scrollport that clips on *all four* edges. That would cut off `Tab`'s focus ring (`--brand-scale-50` outline + `--brand-scale-50` offset = 4px of outset) and the selected tab's `--shadow-subtlest`. The variant pads by exactly that 4px and pulls the same amount back off the margin, so the outer footprint and left edge are identical to the non-scrollable bar. Verified in-browser: ring clearance `0px` in both themes — the padding matches the ring outset exactly, with nothing to spare. **If `Tab`'s focus outline or offset ever grows, this padding must grow with it** or the ring starts clipping again.

Scrollbar indicator suppression is `scrollbar-width: none` / `-ms-overflow-style: none` / `::-webkit-scrollbar { display: none }`. `overflow-x: auto` is retained — only the indicator is hidden, never the scroll behavior (verified: `scrollLeft` reaches `scrollWidth - clientWidth`, indicator height `0`).

### Known Figma inconsistencies

- **Figma node 149:9124 is a Components documentation frame** containing a section header, label, and a single `Tabs` instance (70:1995) — the actual composable component. All annotation scaffolding (purple header, "Tab" label chip) is irrelevant to the code output.
- **Figma renders 4 hardcoded `Tab` children** in the Parts frame. In code, Tabs is data-driven via the `tabs` prop array.

---

## Button Group

**Figma node:** 70:2317 (`Button group`)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `148:1570` (Components documentation frame)

A composite that pairs a leading "more actions" trigger with a row of primary action buttons. Figma models this as a `count` variant (`"2"` | `"3"`) with a fixed number of hardcoded `Button` children; the code version is data-driven via a `buttons` array so it supports any count ≥ 2, matching the pattern used for `Tabs`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `buttons` | `ButtonGroupItem[]` | — | Array of `{ label, id?, onClick?, isDisabled? }` — one `Button` per item |
| `onMoreClick` | `() => void` | — | Click handler for the leading `IconButton` trigger |
| `moreAriaLabel` | `string` | `'More actions'` | `aria-label` on the leading `IconButton` |
| `ariaLabel` | `string` | `'Button group'` | Accessible name for the wrapping `role="group"` |

`ButtonGroupItem` type: `{ label: string; id?: string; onClick?: () => void; isDisabled?: boolean }`

The wrapper is a `role="group"` with `aria-label`. React keys use `item.id` when provided, falling back to `` `${label}-${index}` `` (labels alone aren't unique — the showcase intentionally repeats "Button"), so pass `id` for stable identity when items can reorder.

### Nested components

- **`IconButton`** (from `../IconButton`) — leading trigger, `variant="tertiary"` `size="m"`, icon = `more_horiz` (`Icon name="more_horiz" size="l"`). Figma's "icon / button" element has no background/border in any screenshot, matching `tertiary`'s transparent default state.
- **`Button`** (from `../Button`) — one per `buttons` entry, `variant="primary"` `size="m"`, `appearance="default"` (Figma: `type="Primary"`, `state="Default"`).

### Token mapping

No new tokens introduced — `ButtonGroup` only lays out its children:

```css
.button-group { display: inline-flex; align-items: center; gap: var(--brand-scale-100); /* 4px, Figma Scale/100 */ }
```

All surface/border/text/focus tokens are inherited unchanged from `IconButton` and `Button`'s existing token tables (see their respective entries above).

### Known Figma inconsistencies

- **Figma node 148:1570 is a Components documentation frame** containing a section header, a "Button groups" label chip, and the `Button group` instance (70:2317) plus a hidden description box. Only 70:2317 is the real component.
- **Figma models count as a fixed variant** (`Count=2` / `Count=3`, each with hardcoded `Button` children). Code uses a data-driven `buttons` array instead, so any length ≥ 2 works without adding new variants — consistent with the `Tabs` composite pattern.
- **No unique tokens**: every visual property (icon color, button surface/border/text, radius, gap) already exists in the `IconButton`/`Button` token tables; `ButtonGroup` itself only needs `Scale/100` for the inter-item gap.

---

## Filter Chip

**Figma node:** 12:137 (`filter/chips/toggle`, labeled "Toggle chip")
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `148:2290` (Components documentation frame)

A single-selection toggle chip — button-like pill that flips between an unselected outline state and a selected primary-tinted state. Component: `FilterChip` (singular), folder `src/components/FilterChip/`.

**Out of scope, not built:** the same documentation frame (148:2290) also contains a second, unrelated component — `Field` (228:1296), labeled "Chip" — a removable tag with an "×" affordance. It is not nested inside `filter/chips/toggle`, does not match our existing `Chips` component (a status/appearance tag, different purpose), and was explicitly excluded from this build. Noted for future consideration.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Chip'` | |
| `isSelected` | `boolean` | `false` | |
| `iconLeft` | `ReactNode` | — | Swappable icon slot |
| `iconRight` | `ReactNode` | — | Swappable icon slot |
| `onClick` | `() => void` | — | |
| `previewState` | `'hover' \| 'pressed' \| 'focus'` | — | Showcase only, forces a visual state |

### Variant × state → token mapping

| Figma variant | Border | Background | Label text |
|---|---|---|---|
| `default`, any icon combo | `--mapped-border-subtle-default` | transparent | `--mapped-text-default-default` |
| `Selected`, any icon combo | `--mapped-border-primary-default` | `color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)` | `--mapped-text-primary-default` |

Icons are caller-supplied `ReactNode` slots (e.g. `<Icon name="..." />`), coloring via `currentColor` inheritance — **the color is set once on the root `.filter-chip`** (`color: var(--mapped-text-default-default)`, overridden to `--mapped-text-primary-default` when `.filter-chip--selected`), and `.filter-chip__label`/`.filter-chip__icon` both inherit it via `color: inherit`. This guarantees the icon always matches the label/border in every state without a second token. **Fixed** — icons previously had no color set at all (defaulted to black), so a selected chip's icon didn't follow its blue label/border.

### Geometry

| Property | Token | Px |
|---|---|---|
| Border width | `--brand-scale-25` | 1px |
| Border radius | `--brand-scale-200` | 8px |
| Vertical padding (all variants) | `--brand-scale-300` | 12px |
| Horizontal padding, no icons | `--brand-scale-400` both sides | 16px / 16px |
| Horizontal padding, one icon | `--brand-scale-300` (icon side) / `--brand-scale-400` (opposite side) | 12px / 16px |
| Horizontal padding, both icons | `--brand-scale-250` both sides | 10px / 10px |
| Icon↔label gap (icon present) | `--brand-scale-200` | 8px |
| Icon size | `--brand-scale-400` | 16px |
| Focus outline width/offset | `--brand-scale-50` | 2px |

### Deliberate UX addition: hover/press states

Figma's source (12:137) defines only 2 states — `default` and `Selected` — with **no hover or press variant at all**, for either selection state. This differs from the Tab gap (where Figma defines hover/press but omits only the `hover+selected`/`press+selected` combo): here the omission is total.

**Decision:** added hover/press feedback for the **unselected** state (`--mapped-surface-subtle-hover`/`-pressed` background, `--mapped-text-default-hover`/`-pressed` text, inherited by the icon).

This is a **case-by-case UX call, not a CLAUDE.md mandate and not an automatic extension of the Tag precedent** — CLAUDE.md's "map interaction states to tokens" rule governs which token layer to use once a state is needed, it does not mandate inventing states absent from Figma. Future components with similarly sparse interaction-state source should be evaluated individually, not assumed to get the same treatment automatically.

**REVISED — selected+hover/press added.** Originally the selected state was excluded from hover/press entirely (`:not(.filter-chip--selected)` on both rules), matching Tab's precedent of respecting Figma's omitted combos. User feedback: a selected filter chip is still clickable (to deselect) and needs the same interaction feedback as unselected — the omission read as a bug, not a deliberate omission, once live. Fixed by deepening the same border-derived tint on hover/press:

| Selected state | Background |
|---|---|
| default | `color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)` |
| hover | `color-mix(in srgb, var(--mapped-border-primary-default) 16%, transparent)` |
| pressed | `color-mix(in srgb, var(--mapped-border-primary-default) 24%, transparent)` |

The 16%/24% steps are not Figma-sourced (Figma has no selected-hover/press variant at all, per above) — chosen to read as a visible brighten/darken of the existing 10% tint, consistent in direction with how the unselected state darkens on press. Border/text color unchanged across selected states.

### Known Figma inconsistencies

- **Figma node 148:2290 is a Components documentation frame** containing two unrelated components ("Toggle chip" / `filter/chips/toggle` and "Chip" / `Field`) plus section-header/label scaffolding. Only `filter/chips/toggle` (12:137) is in scope here.
- **Property value typos in the component set itself**: `iconLeft`/`iconRight` Figma variant values are inconsistently named `"True"` / `"False"` / `"Fals"` (typo) across different variant combinations — a source-side naming defect, not a code issue. Normalized to booleans in the React API.
- **RESOLVED v1.3.0 — the both-icons `10px` was never off-ramp.** This entry previously read: *"not a value on our `--brand-scale` ramp (nearest: `--brand-scale-200`=8px, `--brand-scale-300`=12px). No token matches."* **That claim was wrong when written, not merely stale.** `--brand-scale-250` sits between 200 and 300 and is exactly `10px` — present in `globals.css` and in `design-tokens/Brand/Value.json` (`Scale.250 = 10`), and already consumed for 10px in ten places across the DS at the time, **including `Field.css:12` for padding**. The FAIL-LOUD literal and its comment have been replaced with `var(--brand-scale-250)`. **Pure substitution — computed padding measured `10px` in both themes before and after, unchanged.** No Figma Variables fix is needed; there was never a gap. (The rejection of the `calc()` curve-fit still stands on its own merits — averaging two unrelated steps to manufacture a number remains banned.)
- **Selected-state background has no matching opacity/tint token**: Figma uses `rgba(4,110,255,0.1)` (10%-opacity primary blue), and no rgba/opacity token exists anywhere in the token source. Resolved with `color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)` — derived from a real mapped token (dark-mode safe) rather than a hardcoded rgba(). **First use of `color-mix()` in this codebase** — accepted as the standard pattern for future missing-opacity-token cases. Flag for a future Figma Variables addition of a proper tint/overlay token.

---

## Link

**Figma node:** 73:128 (`❖ Link`)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `73:123` (Components documentation frame)

A leaf hyperlink component — renders a real `<a>` tag. Built as a dependency for Breadcrumbs. No nested component instances (icons come through the `iconBefore`/`iconAfter` slots below, and a hidden non-visual Figma artifact is excluded from the build — see inconsistencies below).

**Revised for Breadcrumbs (post-initial-build):** `iconBefore`/`iconAfter` were originally booleans hardcoding an `open_in_new` icon internally — this violated the composition rule that swappable content must be exposed as `ReactNode` slots, not hardcoded behind a flag. Discovered when Breadcrumbs turned out to reuse the same `❖ Link` part with different icons per instance (`home`, `chevron_right`, none). Fixed to `React.ReactNode`, defaulting to `open_in_new` (preserves original standalone-Link behavior); pass `null` to render no icon. Also added `isCurrent?: boolean` for Breadcrumbs' terminal item (see its own entry).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Link'` | |
| `href` | `string` | `'#'` | |
| `appearance` | `'default' \| 'subtle' \| 'inverse'` | `'default'` | |
| `size` | `'s' \| 'm'` | `'s'` | See size-inversion note below |
| `hasVisited` | `boolean` | `false` | Only meaningful for `default`/`subtle`; `inverse` has no visited variants in source |
| `isCurrent` | `boolean` | `false` | Forces underline without a color/interaction change — sets `aria-current="page"`. Added for Breadcrumbs' terminal item. |
| `iconBefore` / `iconAfter` | `React.ReactNode` | `<Icon name="open_in_new" size="s" />` for both | Pass `null` to render no icon |
| `target` | `'_blank' \| '_self'` | `'_blank'` | `rel="noopener noreferrer"` auto-applied when `_blank` |
| `onClick` | `(e) => void` | — | |
| `previewState` | `'hover' \| 'pressed' \| 'focus'` | — | Showcase only |

### Variant → token mapping (as implemented)

| Appearance | State | Visited | Text token | Underline |
|---|---|---|---|---|
| default | default | false | `--mapped-text-primary-default` | no |
| default | hover | false | `--mapped-text-primary-default-hover` | yes |
| default | press | false | `--mapped-text-primary-default-pressed` | yes |
| default | default | true | `--mapped-text-interactive-default` | yes |
| default | hover | true | `--mapped-text-interactive-default` (same as default+visited) | yes |
| default | press | true | `--mapped-text-interactive-default-pressed` | yes |
| subtle | default | false | `--mapped-text-subtle-default` | no |
| subtle | hover | false | `--mapped-text-subtle-default` (unchanged) | yes |
| subtle | press | false | `--mapped-text-subtle-subtle-pressed` | yes |
| subtle | default/hover | true | `--mapped-text-interactive-default` | yes |
| subtle | press | true | `--mapped-text-interactive-default-pressed` | yes |
| inverse | default | false only | `--mapped-text-primary-on-color` (white) | no |
| inverse | hover/press | false only | `--mapped-text-primary-on-color` (unchanged) | yes |

Icons inherit color via `currentColor` from the label — no separate icon-color token.

### Geometry

| Property | Token | Px |
|---|---|---|
| Icon↔label gap | `--brand-scale-100` | 4px |
| Icon size (both s and m link sizes) | `Icon size="s"` → `--brand-scale-400` | 16px |
| Focus outline width/offset | `--brand-scale-50` | 2px |
| Typography, Size=S | `.type-body-sm` | 14px / 20px, regular |
| Typography, Size=M | `.type-body-caption` | 12px / 16px, regular |

### Known Figma inconsistencies

- **`Size=M` renders smaller than `Size=S`** (12px vs 14px) — backwards from the usual S<M convention. Preserved literally in the `size: 's' | 'm'` prop rather than silently relabeling; naming is confirmed from source, not a code defect.
- **Hover+visited reuses the plain `--mapped-text-interactive-default` token** instead of the existing `--mapped-text-interactive-default-hover` — confirmed via the actual Figma instance (73:171), not a code shortcut. Replicated exactly rather than "fixed."
- **`inverse` appearance never demonstrates `hasVisited=true`** in source — always renders `--mapped-text-primary-on-color` regardless of the `hasVisited` prop. If a caller passes `hasVisited` with `appearance="inverse"`, the prop is accepted but has no visual effect (matches source, not a bug).
- **Hidden `URL (Hidden)` element excluded from the build**: every Figma instance contains a non-visual paragraph (`opacity-0`, `size-[0.01px]`) carrying Atlassian tokens (`color.link`, `color.link.pressed`, `color.link.visited`, `color.text.subtle`, `color.text.inverse`) that don't exist in our token source. Confirmed via screenshot and design-context inspection that it renders nothing visible — treated as a Figma-internal artifact, not a missing-token gap requiring a fallback.

---

## Breadcrumbs

**Figma node:** 102:2959 (`Breadcrumbs`)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `88:243` (Components documentation frame)

A composite that renders a sequence of `Link` instances (`appearance="subtle"`) separated by `chevron_right` icons, with an optional leading icon (e.g. `home`) on any item. No variants in source — a single fixed 3-item example instance.

### Nested components

- **`Link`** (from `../Link`) — one per breadcrumb item, `appearance="subtle"` `size="s"`.
- **`Icon`** (from `../Icon`) — `chevron_right` as the separator (passed into each non-last item's `iconAfter` slot), plus any caller-supplied leading icon (e.g. `home`) passed into `iconBefore`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | — | `{ label, href?, icon? }` — `icon` is a leading `ReactNode`, typically only used on the first item |
| `ariaLabel` | `string` | `'Breadcrumb'` | `aria-label` on the wrapping `<nav>` |

### Token mapping

No tokens of its own — everything is delegated to `Link` (`appearance="subtle"` token table) and `Icon`. Layout:

```css
.breadcrumbs { display: flex; align-items: flex-start; gap: 0; }
```

`gap: 0` because the trailing chevron on each non-last item abuts the next item directly, per Figma (confirmed — no spacing between the separator and the next label).

### Terminal item — `isCurrent`

The last breadcrumb in the Figma source (102:2959) renders with underline present by default, visually identical to `Link`'s `subtle` **hover** state, despite not being hovered in the snapshot. This surfaced a real gap in `Link`'s original API (no way to force underline outside the showcase-only `previewState`), resolved by adding `Link`'s new `isCurrent` prop (see Link's own entry) rather than misusing `previewState` for production behavior. `Breadcrumbs` sets `isCurrent` on its last item automatically, which also sets `aria-current="page"`.

### Known Figma inconsistencies

- **Figma node 88:243 is a Components documentation frame** — the actual component is the single `Breadcrumbs` instance (102:2959), not the frame itself.
- **Only a single fixed 3-item example exists in source** — no variant axis for item count. Code is data-driven via the `items` array, consistent with the `Tabs`/`ButtonGroup` pattern of generalizing beyond Figma's fixed example count.
- **Discovered Link's icon-slot API defect during this build**: `Link`'s `iconBefore`/`iconAfter` were originally hardcoded to `open_in_new` behind a boolean, but Breadcrumbs' nested `❖ Link` instances use different icons per position (`home`, `chevron_right`, none) — proof the slots needed to be swappable `ReactNode` content. Fixed retroactively in `Link` (see Link's own entry); not a Breadcrumbs-specific inconsistency, but recorded here since this build is what surfaced it.
- **Terminal item's forced underline** (see `isCurrent` above) — Figma shows this as the resting state of that instance, not an explicit "current page" variant; there's no component description confirming design intent versus a frozen-hover artifact. Treated as intentional (current-page indicator) per the recommended fix, not verified against explicit Figma documentation.

---

## Loader

**Figma node:** 108:131 (`.animation`, internally labeled "Progress bar")
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `107:2970` (Components documentation frame)

A rotating spinner. No nested component instances.

**First CSS `@keyframes` animation in this codebase** — flagged and confirmed with the user before building, same governance as `color-mix()` for Filter Chips.

### Why this couldn't be read from source like other components

Every other component in this batch had clean vector data or literal pixel/color values to read directly from Figma's generated code. Loader's source (`Step=1`/`Step=2`/`Step=3`, static snapshots of a Prototype-mode rotation) is a **rasterized PNG background** with an SVG dot **stamped on top 5 times at the identical position** — an apparent flattening artifact in the Figma file, not clean vector geometry. There is no path data to read a stroke-width or arc-angle from, and no motion data (duration/easing) exists in static frames at all.

**What was confirmed from source:**
- Container size: 32×32px (all three Step frames and the standalone instance agree)
- Color: `surface/primary/default` = `#046eff`, confirmed via `get_variable_defs` — maps to `--mapped-surface-primary-default`

**What was visually estimated, not sourced** (flagged to the user before building, approved as "build with reasonable estimates"):
- Stroke width: `3px` — no vector data to measure exactly
- Rotation speed: `0.8s linear infinite` — a conventional spinner speed, not derived from the static frames, which can't encode timing

### Implementation

```css
.loader {
  width: var(--brand-scale-800); /* 32px, matches source container exactly */
  height: var(--brand-scale-800);
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--mapped-surface-primary-default);
  animation: loader-spin 0.8s linear infinite;
}
@keyframes loader-spin { to { transform: rotate(360deg); } }
```

Standard border-trick spinner: a transparent circle with one edge colored, rotated continuously — reproduces "a colored arc sweeping around a fixed ring" without needing the unrecoverable exact arc geometry from source.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `ariaLabel` | `string` | `'Loading'` | Sets `role="status"` + `aria-label` on the spinner element |

### Known Figma inconsistencies

- **Source uses a rasterized PNG + duplicated flattened SVG elements**, not clean vector paths — first component in this batch where exact geometry couldn't be extracted rather than merely being off the token ramp (contrast with Filter Chips' literal-10px case, where the *value* was knowable but token-less; here the *value itself* isn't reliably knowable from source).
- **Stroke width (`3px`) and rotation speed (`0.8s linear`) are estimates**, not sourced values — recorded here explicitly so they aren't mistaken for confirmed design decisions in the future. If exact values become available (e.g. a cleaner Figma export or designer input), update this component and this note together.
- **Container size and color ARE real, confirmed source values** (32px, `surface/primary/default`) — only the stroke/motion values are estimated.

---

## Field

**Figma node:** 39:1367 (`Field` component set)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `149:2515` (Components documentation frame)

A text input. Bordered box → leading icon · [optional floating label + input] ·
trailing icon. Re-read per-variant via `get_design_context` (all values below
are confirmed from source, not inferred — an earlier draft that inferred from
screenshots got padding, the focus ring, invalid width, disabled text, and the
Subtle appearance wrong).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle'` | `'standard'` | Subtle = transparent until focus |
| `label` | `string` | — | Floating label (Figma `Label=True`); real `<label htmlFor>` |
| `placeholder` | `string` | — | |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled |
| `onChange` | `(value: string) => void` | — | Passes the new string |
| `leadingIcon` / `trailingIcon` | `React.ReactNode` | — | Icon slots (`<Icon>`, 20px) |
| `isCompact` | `boolean` | `false` | Square, icon-only field |
| `isDisabled` | `boolean` | `false` | |
| `isInvalid` | `boolean` | `false` | Sets `aria-invalid`; 2px error border |
| `isRequired` | `boolean` | `false` | `required` + `aria-required`; visual `*` |
| `id` | `string` | — | Forwarded to `<input>`; auto-generated via `useId()` if omitted |
| `name` | `string` | — | Forwarded to `<input>` |
| `type` | `string` | `'text'` | Forwarded to `<input type>` |
| `ariaLabel` | `string` | — | Accessible name when no visible `label` |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

### Variant axes

`Appearance` (Standard/Subtle) × `Label` (T/F) × `Is compact` (T/F) ×
`State` (Default/Hover/Focus/Typing/Filled) × `Is disabled` × `Is Invalid`.
In code, State is interaction-driven — `:hover`, `:focus-within` (persists until
blur), and placeholder-vs-value colour are native; the rest are props.

### State → token mapping (Standard, confirmed)

| State | Background | Border | Value/placeholder text |
|---|---|---|---|
| Default | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | placeholder `--mapped-text-subtle-default` |
| Hover | `--mapped-surface-primary-default-subtle-hover` | 1px `--mapped-border-primary-default-subtle-hover` | `--mapped-text-subtle-default` |
| Focus | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-primary-default` + glow ring | placeholder `--mapped-text-subtle-default` |
| Typing | same + glow ring | 2px `--mapped-border-primary-default` | value `--mapped-text-default-default` |
| Filled | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | value `--mapped-text-default-default` |
| Invalid | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-error-default` | `--mapped-text-default-default` |
| Disabled | `--mapped-surface-disabled-default` | 1px `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` (icons `--mapped-icon-disabled-on-color`) |

**Subtle appearance:** transparent background and border at rest *and* on hover;
only Focus adds the 2px blue border + glow ring. Invalid/disabled apply the same
error/disabled tokens as Standard.

**Focus glow ring** (`::after`): `inset -4px` (`--brand-scale-100`), `2px`
(`--brand-scale-50` = Border Width/sm) solid `--mapped-surface-primary-default`,
`border-radius --brand-scale-250` (10px = border-radius/lg), `opacity 0.25`. It
persists via `:focus-within` until the input blurs — the "stays blue until you
click away" behaviour.

Icons colour via `--mapped-icon-subtle-default` (currentColor through `<Icon>`).

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Horizontal padding | `--brand-scale-300` | 12px |
| Vertical padding (no label / labeled) | `--brand-scale-250` / `--brand-scale-200` | 10px / 8px |
| Radius | `--brand-scale-200` | 8px (border-radius/md) |
| Border width (default / focus·invalid) | `--brand-scale-25` / `--brand-scale-50` | 1px / 2px |
| Icon↔stack gap | `--brand-scale-200` | 8px |
| Label→input gap | `--brand-scale-50` | 2px |
| Icon size | via `<Icon size="m">` | 20px |
| Compact | `--brand-scale-300` padding, square | 44×44 |
| Demo width | — | 240px (caller-controlled in practice) |

`box-sizing: border-box` keeps the box stable as the border grows 1→2px on focus.

### Typography

Label: `.type-body-caption` (12px). Input/placeholder: `.type-body-m` (16px).

### Known Figma inconsistencies

- **Caret** in the Focus/Typing variants uses Atlassian `color.text` (#172b4d),
  a token with no equivalent in our system — irrelevant in code because a real
  `<input>` renders its own caret (`caret-color: --mapped-text-default-default`).
- **`border/default` (#e5e5e5)** appears in the set's aggregate `get_variable_defs`
  but was not used by any variant actually read (Standard all states, Subtle
  default/hover/focus, labeled, compact) — likely a leftover/unused token in the
  Figma set. Not applied.
- **`get_design_context` reliability**: the tool times out (~300s) when called on
  the whole component set or with `forceCode`, but returns fine on individual
  variant nodes — that per-variant approach is how this entry was sourced.

---

## Select

**Figma node:** 42:949 (`Select` component set)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `149:4539` (Components documentation frame)

The base of the input/select family — a **searchable combobox** trigger. Same
box as `Field` plus a built-in trailing chevron (`icon_chevron_expand_more`).
Rendered as `<div>` wrapping a real `<input role="combobox">`; the dropdown
`<Menu>` is an **app-provided slot** (Figma marks its own menu as a replaceable
example). First of three sets read from this frame; `Select / Transfer` and
`Select / Wallet Account` extend it via slots (built separately).

**Showcase composition**: `menuSlot` is populated with a real `<Menu
searchBar={false}>` wrapping `<MenuItem type="default">` rows (one per
option). `searchBar` is `false` because filtering already happens through
this component's own input — a second search field inside the menu would
duplicate it.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle'` | `'standard'` | Subtle = transparent until focus |
| `label` | `string` | — | Floating caption; real `<label htmlFor>` |
| `placeholder` | `string` | — | |
| `value` | `string` | — | Search query while typing, or the chosen value's label |
| `onSearchChange` | `(value: string) => void` | — | Fires as the user types; app filters its menu |
| `searchable` | `boolean` | `true` | `false` → read-only input (plain select) |
| `isOpen` / `onOpenChange` | `boolean` / `(o) => void` | — | Controlled open state (uncontrolled if omitted) |
| `menuSlot` | `React.ReactNode` | — | Dropdown content, rendered below when open |
| `leadingSlot` | `React.ReactNode` | — | Leading decoration (wrap in `ElementWrapper`) |
| `isSelected` | `boolean` | `false` | Figma `Selected` — persistent blue border + ring |
| `isDisabled` / `isInvalid` | `boolean` | `false` | |
| `id` | `string` | — | Forwarded to `<input>`; auto-generated via `useId()` if omitted |
| `name` | `string` | — | Forwarded to `<input>` |
| `ariaLabel` | `string` | — | Accessible name when no visible `label` |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

### State → token mapping

| State | Background | Border | Text |
|---|---|---|---|
| Default | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | placeholder `--mapped-text-subtle-default` |
| Hover | `--mapped-surface-primary-default-subtle-hover` | 1px `--mapped-border-primary-default-subtle-hover` | subtle |
| Focus / Typing | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-primary-default` + glow ring | value `--mapped-text-default-default` (typing), caret native |
| Filled | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | value `--mapped-text-default-default` |
| Selected | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-primary-default` + glow ring | value `--mapped-text-default-default` |
| Invalid | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-error-default` | value default |
| Disabled | `--mapped-surface-disabled-default` | 1px `--mapped-border-disabled-default` | `--mapped-text-disabled-default` (chevron `--mapped-icon-disabled-default`) |

Placeholder-vs-value colour is native (`input` colour = `--mapped-text-default-default`,
`::placeholder` = `--mapped-text-subtle-default`). Chevron: `--mapped-icon-subtle-default`.

**Focus/Selected glow ring** (`::after`): `inset -4px` (`--brand-scale-100`), 2px
(`--brand-scale-50`) solid `--mapped-surface-primary-default`, `border-radius
--brand-scale-250` (10px), `opacity 0.25` — identical to Field.

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Padding | `--brand-scale-200` / `--brand-scale-300` | 8px / 12px |
| Radius | `--brand-scale-200` | 8px |
| Border (default / focus·invalid) | `--brand-scale-25` / `--brand-scale-50` | 1px / 2px |
| Gap (row / label→input) | `--brand-scale-200` / `--brand-scale-50` | 8px / 2px |
| Chevron | `<Icon size="m">` | 20px |
| Demo width | — | 320px (caller-controllable) |

Typography: label `.type-body-caption` (12px), value/input `.type-body-m` (16px).

### Accessibility

Real `<input role="combobox">` with `aria-expanded` and `aria-controls` set
**only while the menu is open** (no dangling reference). `aria-autocomplete="list"`
is conditional on `searchable` (default `true`) — when `searchable={false}`
(read-only, plain-select mode) it's omitted, not set to `"list"`.
Chevron is a `tabIndex={-1}` toggle button with an `aria-label`. Keyboard menu
navigation belongs to the app-provided menu.

### Known Figma inconsistencies / decisions

- **Disabled uses `text/icon-disabled-default` (#cfd5dc), not the `on-color`
  variant** — differs from Field's disabled choice; confirmed per-variant from
  source, so Select is not a blind copy of Field.
- **`Typing` state = searchable/open** — real editable input + caret + an open
  menu. The menu is an app slot (Figma: *"we suggest creating your own slot
  component"*); Select owns only the query/open state and exposes `menuSlot`.
  Select does not own option data or filtering.
- **`get_design_context` reliability**: times out on the whole set / parallel
  calls; reliable one variant at a time — how this was sourced.

---

## Select / Transfer

**Figma node:** 189:2229 (`Select / Transfer`)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `149:4539` (Components documentation frame)

Amount input + currency picker, used for currency/crypto transfers. Extends
`Select`'s combobox model: two independent slot-driven dropdowns (amount
menu, currency menu), both app-provided per Figma's own annotation.

**Showcase composition**: both `menuSlot` (recipient search) and
`currencyMenuSlot` are populated with a real `<Menu searchBar={false}>`
wrapping `<MenuItem type="default">` rows — `searchBar` is `false` on both
for the same reason as `Select` (the amount input is its own search field)
and because the currency list is short and fixed (no search needed). The
currency rows additionally pass a flag swatch via `iconSlot`.

> **Provenance note**: initially built with several appearance/state
> combinations extrapolated rather than individually read (disclosed at the
> time). This entry reflects a full confirmation pass — every state listed
> below with "CONFIRMED" was read directly from its own Figma variant node,
> not inferred. Three of those confirmations **overturned** the original
> extrapolation (Hover, Invalid, and the disabled text token) — see "Known
> Figma inconsistencies" for what changed and why it wasn't guessable.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle' \| 'attention'` | `'standard'` | Attention = underline style |
| `label` | `string` | — | Caption label above the amount |
| `placeholder` / `value` | `string` | — | Amount field |
| `onAmountChange` | `(value: string) => void` | — | |
| `currencyLabel` | `string` | — | Currency code, e.g. `"MYR"` |
| `currencyFlag` | `React.ReactNode` | — | Wrap in `<ElementWrapper size="m">` (20px) — the Malaysian flag asset isn't in the codebase yet, so the showcase uses a placeholder |
| `onCurrencyClick` | `() => void` | — | Opens the currency picker |
| `currencyMenuSlot` / `menuSlot` | `React.ReactNode` | — | App-provided dropdowns (currency / amount) |
| `isCurrencyOpen` / `isOpen` + `onOpenChange` | `boolean` | — | Controlled open state for each menu |
| `isSelected` / `isDisabled` / `isInvalid` | `boolean` | `false` | |
| `id` | `string` | — | Forwarded to the amount `<input>`; auto-generated via `useId()` if omitted |
| `ariaLabel` | `string` | — | |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

### State → token mapping — Standard / Subtle

Same box tokens as `Select` (shared box: default/hover/focus/invalid/disabled
all match). `justify-content: space-between` (amount left, currency picker
right). Amount typography: `.type-body-lg` (20px, regular). See `Select`'s
entry for the full box token table; not repeated here.

### State → token mapping — Attention (all CONFIRMED, read per-variant)

| State | Border | Text (label/amount/currency) | Shape |
|---|---|---|---|
| Default | bottom-only 2px `--mapped-border-primary-default` | `--mapped-text-subtle-default` (label/currency), placeholder subtle / value `--mapped-text-default-default` | underline, top-rounded (`8px/8px/0/0`) |
| Hover | bottom-only 2px `--mapped-border-primary-default-hover` | **all text** → `--mapped-text-subtle-hover` (label, amount, divider, currency) | underline (unchanged shape) |
| Focus | **unchanged from Default** — no color/width/ring change | unchanged from Default | underline (unchanged) |
| Typing | same as Focus + value/caret shown | value → `--mapped-text-default-default` (same convention as Default's filled value) | underline (unchanged) |
| Filled | same as Default, value present | value → `--mapped-text-default-default` | underline (unchanged) |
| Selected | identical to Filled | identical to Filled | underline (unchanged) |
| Currency Focus | unchanged from Default | **only** the currency label/code → `--mapped-text-subtle-hover`; amount side untouched | underline (unchanged) |
| Currency Typing | same as Currency Focus (typing happens in the nested menu's own search field, not this control) | same as Currency Focus | underline (unchanged) |
| **Invalid** | **full box** — 2px `--mapped-border-error-default` on **all 4 sides** | unchanged from Default | **shape changes** to a full 8px-radius box (not underline) |
| Disabled | bottom-only 2px `--mapped-border-disabled-default` | **all text** → `--mapped-text-disabled-on-color` (not `-default`); flag `opacity: 0.5` | underline (unchanged) |

Divider: `--mapped-text-default-default` at rest, `--mapped-text-subtle-hover`
on hover, `--mapped-text-disabled-on-color` when disabled. Chevron mirrors the
currency label's color logic (`--mapped-icon-subtle-hover` on currency-focus).

### Geometry (confirmed)

Same box padding/radius/gaps as `Select`. Attention-specific: amount uses
`.type-header-h5` (24px), label uses `.type-body-caption-semibold`, and the
divider is 2px (`--brand-scale-50`) wide with `--brand-scale-50` margin on
each side.

### Accessibility

Amount input: `role="combobox"`, `aria-expanded`, `aria-controls` (only when
open), `aria-autocomplete="list"`. Currency chevron: `aria-haspopup="listbox"`,
`aria-expanded={isCurrencyOpen}`, `aria-controls` (only when open). Both
dropdowns are app slots — keyboard navigation within them is the app's
responsibility.

### Known Figma inconsistencies

- **Hover is a full text+border repaint, not just a border-color change** —
  confirmed via 189:9675; every text node (label, amount, divider, currency)
  moves to `text/subtle/hover`. This was NOT the original implementation
  (which had no Attention-specific hover rule at all) and would not have
  been guessable from Default alone.
- **Invalid changes shape entirely** — confirmed via 189:9666: switches from
  the underline style to a full bordered box (2px error, all 4 sides, full
  8px radius), unlike every other Attention state which keeps the underline
  unchanged. The original implementation only recolored the bottom border —
  wrong. This is the most surprising finding in this component; there was no
  way to predict it from adjacent states.
- **Focus/Selected/Filled/Typing/Currency-Focus/Currency-Typing all leave the
  border completely unchanged** (`#046eff`, same as Default) — confirmed
  across 189:9693, 189:9746, 189:9657, 189:9707. Attention never gets the
  glow ring that Standard/Subtle get on focus. This makes sense in hindsight
  (Attention's Default already looks "active"/emphasized) but was flagged
  and verified rather than assumed.
- **Attention's disabled text token differs from Standard/Subtle's** —
  `text/disabled/on-color` (#b6bfca) vs `text/disabled/default`. Standard/
  Subtle's disabled token for *this* component was not individually
  re-confirmed (it reuses `Select`'s confirmed choice for the shared box) —
  flagged as a lower-confidence assumption than the Attention finding, which
  was read directly.
- **`get_design_context` reliability**: whole-set and parallel calls time
  out at ~300s; single-variant sequential calls succeed reliably. All ten
  Attention state variants plus the Standard/Subtle base were read this way.

## Select / Wallet Account

**Figma node:** 189:5871 (`Select / Wallet Account`)

A button-style trigger displaying a chosen wallet/account (name/wallet on the
left, amount/amtCrypto on the right, chevron — no logo). All 14 variants (2
appearances × 7 states) were read individually from Figma — no extrapolation.

> **Architectural note**: unlike `Select`/`Select / Transfer`, the trigger is
> never an editable text input. In the "Typing" state the trigger's own
> content stays completely unchanged from Default (still all
> `text/subtle/default`) — only the border upgrades to 2px primary and a menu
> opens below. The actual search UI lives entirely inside the app-provided
> `menuSlot`; Figma's own example menu composes a real `Field` instance (with
> a search icon) above a scrollable option list, confirming `Field` composes
> correctly as a nested child here. The root element is a real `<button>`,
> not an `<input>`.

> **Showcase composition**: `menuSlot` is populated with a real `<Menu
> searchBar={true}>` (matching Figma's own search+list example) wrapping
> `<MenuItem type="crypto">` rows — `crypto` type's four fields
> (`labelCrypto`/`labelWallet`/`labelAmount`/`labelAmountCrypto`) are an exact
> match to this trigger's own row shape and to the wallet-account data used
> here. `type="account"` (single `trailingLabel` + radio dot) does not fit
> this data and was not used.

> **Corrected finding — the trigger never shows a logo.** The raw
> `get_design_context` dump exposed an `iconLeft` boolean toggle on the
> trigger, which an earlier pass of this build mistakenly treated as a real,
> usable variant and exposed as a `logoSlot` prop (first nested inside the
> box, then moved beside it after initial pushback). A direct screenshot of
> all 14 variants (`get_screenshot` on 189:5871) shows `iconLeft` is `false`
> in every actual named variant — no real trigger instance in the file ever
> shows a logo. The `iconLeft` toggle exists in the generated code only
> because this component's prop shape is shared with the dropdown's `<item>`
> row, where the logo genuinely is always shown. `logoSlot` has been removed
> from this component entirely; the logo belongs to the (not yet built)
> Menu/Option item rows.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle'` | `'standard'` | |
| `state` | `'default' \| 'filled' \| 'selected'` | `'default'` | Ignored while `isOpen` is true (Typing takes over) |
| `labelCrypto` / `labelWallet` | `string` | — | Left column: name (semibold) / wallet (regular) |
| `labelAmount` / `labelAmtCrypto` | `string` | — | Right column: both semibold |
| `showChevron` | `boolean` | `true` | Chevron is always the same literal icon — not a slot |
| `menuSlot` | `React.ReactNode` | — | App-provided dropdown; Figma's example composes `Field` + option list |
| `isOpen` / `onOpenChange` | `boolean` / fn | — | Controlled open state — drives Typing visuals |
| `isDisabled` / `isInvalid` | `boolean` | `false` | |
| `id` | `string` | — | Forwarded to the trigger `<button>`; auto-generated via `useId()` if omitted |
| `ariaLabel` | `string` | — | Falls back to `"{labelCrypto} — {labelWallet}"` |
| `previewState` | `'hover'` | — | Showcase only |

### State → token mapping (all 14 variants confirmed individually)

| Appearance | State | Background | Border | Name/Amount text | Wallet/AmtCrypto text |
|---|---|---|---|---|---|
| Standard | Default | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | `--mapped-text-subtle-default` | `--mapped-text-subtle-default` |
| Standard | Filled | unchanged | unchanged | `--mapped-text-default-default` | `--mapped-text-subtle-default` |
| Standard | Invalid | unchanged | 2px `--mapped-border-error-default` | `--mapped-text-default-default` | `--mapped-text-subtle-default` |
| Standard | Hover | `--mapped-surface-primary-default-subtle-hover` | 1px `--mapped-border-primary-default-subtle-hover` | `--mapped-text-subtle-hover` | `--mapped-text-subtle-hover` |
| Standard | Disabled | `--mapped-surface-disabled-default` | 1px `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` | `--mapped-text-disabled-on-color` |
| Standard | Typing (open) | unchanged | 2px `--mapped-border-primary-default` | unchanged | unchanged |
| Standard | Selected | unchanged | 2px `--mapped-border-primary-default` | `--mapped-text-default-default` | `--mapped-text-subtle-default` |
| Subtle | Default | transparent | none | `--mapped-text-subtle-default` | `--mapped-text-subtle-default` |
| Subtle | Filled | transparent | none | `--mapped-text-default-default` | `--mapped-text-subtle-default` |
| Subtle | Invalid | transparent | 2px `--mapped-border-error-default` | `--mapped-text-default-default` | `--mapped-text-subtle-default` |
| Subtle | Hover | transparent (unchanged) | none (unchanged) | `--mapped-text-subtle-hover` | `--mapped-text-subtle-hover` |
| Subtle | Disabled | transparent | **none** | `--mapped-text-disabled-default` | `--mapped-text-disabled-default` |
| Subtle | Typing (open) | transparent | 2px `--mapped-border-primary-default` | unchanged | unchanged |
| Subtle | Selected | transparent | 2px `--mapped-border-primary-default` | `--mapped-text-default-default` | `--mapped-text-subtle-default` |

No glow ring on Typing/Selected — confirmed absent from every relevant Figma
read (unlike `Select`/`Select / Transfer`'s shared `::after` ring).

Chevron color was not given an explicit token in any of the 14 raw Figma
reads (exported as a flat image asset). By your approval, it tracks the
adjacent text tone per state: `--mapped-icon-subtle-default` (Default),
`--mapped-icon-subtle-hover` (Hover), `--mapped-icon-disabled-on-color`
(Standard Disabled), `--mapped-icon-disabled-default` (Subtle Disabled) — an
inferred choice, not directly confirmed, flagged here for visibility.

### Geometry (confirmed)

320px demo width (caller-controllable), `--brand-scale-200` (8px) gap,
`--brand-scale-200 --brand-scale-300` (8px/12px) padding, `--brand-scale-200`
(8px) radius — same box geometry as `Select`. Name/Amount: `.type-body-m-semibold`
(16px). Wallet: `.type-body-sm` (14px, regular — the only regular-weight line,
a confirmed asymmetry against amtCrypto). AmtCrypto: `.type-body-sm-semibold`
(14px). Chevron: 20px via `Icon size="m"`.

### Accessibility

Root is a real `<button>` (not `role="combobox"` on an `<input>`, since there's
no editable text in the trigger): `aria-haspopup="listbox"`, `aria-expanded`,
`aria-controls` (only when open), `aria-invalid`, `aria-label` (explicit prop
or a composed fallback from `labelCrypto`/`labelWallet`). `disabled` attribute
handles both the visual and interactive disabled state natively.

### Known Figma inconsistencies

- **Trigger never becomes an editable input** — "Typing" only upgrades the
  border and opens a menu; the crypto/wallet/amount text is pixel-identical
  to Default. This is a structural difference from `Select`/`Select /
  Transfer` (both of which turn their trigger into a live text input on
  Typing) and drove the `<button>`-not-`<input>` root element choice.
- **Subtle-Disabled diverges from Standard-Disabled** — drops the border
  entirely (Standard keeps a 1px disabled border) and uses
  `text/disabled/default` instead of `-on-color`, since Subtle never has a
  colored surface for "on-color" to sit against. Confirmed via 189:6216,
  not assumed from Standard's pattern.
- **No glow ring on this trigger's Typing/Selected states** — every other
  Select-family component gets a `::after` glow ring on focus-equivalent
  states; this component's 14 reads showed none. The ring seen in Figma's
  Typing-state screenshot belongs to the *nested* `Field` component inside
  the menu, not this component's own box.
- **Chevron color is inferred, not confirmed** — see mapping table above.
- **No trigger variant ever shows a logo** — see the corrected finding above.
  The raw code-gen exposes an `iconLeft` toggle (shared with the dropdown's
  `<item>` row prop shape), but every real named variant in the file has it
  `false`; confirmed by screenshotting the full 14-variant set, not just the
  code dump. `logoSlot` was removed from the component after being added
  twice on a wrong premise (once inside the box, once beside it). The "logo
  belongs to the Menu/Option item rows" prediction has since been confirmed —
  see the crypto-type `MenuItem` composition noted above.

## Text area

**Figma node:** 53:2473 (`Text area` component set)
**Source file:** `xhA5ARVgSeD3gA41lYDqST` · **frame:** `149:7117` (Components documentation frame)

A multi-line sibling of `Field` — same box tokens and state behavior, no icon
slots, real `<textarea>` instead of `<input>`. All 14 variants (2 appearances
× 7 states) read individually from Figma — no extrapolation.

> **Screenshot correction**: the raw `get_design_context` dump toggles
> `justify-content: center` on/off per state (centered for Default/Hover/Focus,
> top-aligned for Filled/Invalid/Disabled/Typing), which read like a real
> layout difference. A screenshot of the full 14-variant set (and of Default
> alone) shows text is **always top-aligned** — the class difference has no
> visible effect (the inner stack's height is intrinsic to one line, so
> centering it is a no-op). No centering logic was implemented; this is a
> case of the raw code-gen output not matching the actual rendered design.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle'` | `'standard'` | Subtle = transparent until focus |
| `label` | `string` | — | Floating label (Figma `Label=True`); real `<label htmlFor>` |
| `placeholder` | `string` | — | |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled |
| `onChange` | `(value: string) => void` | — | Passes the new string |
| `isDisabled` | `boolean` | `false` | |
| `isInvalid` | `boolean` | `false` | Sets `aria-invalid`; 2px error border |
| `id` | `string` | — | Forwarded to `<textarea>`; auto-generated via `useId()` if omitted |
| `name` | `string` | — | Forwarded to `<textarea>` |
| `ariaLabel` | `string` | — | Accessible name when no visible `label` |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

No `isRequired` — Figma's source has no required indicator for this
component (unlike `Field`), so none was added.

### State → token mapping (Standard, confirmed)

| State | Background | Border | Value/placeholder text |
|---|---|---|---|
| Default | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | placeholder `--mapped-text-subtle-default` |
| Hover | `--mapped-surface-primary-default-subtle-hover` | 1px `--mapped-border-primary-default-subtle-hover` | `--mapped-text-subtle-default` |
| Focus | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-primary-default` + glow ring | placeholder `--mapped-text-subtle-default` |
| Typing | same + glow ring | 2px `--mapped-border-primary-default` | value `--mapped-text-default-default` |
| Filled | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | value `--mapped-text-default-default` |
| Invalid | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-error-default` | `--mapped-text-default-default` |
| Disabled | `--mapped-surface-disabled-default` | 1px `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` |

**Subtle appearance:** transparent background and border at rest *and* on
hover — identical to `Field`'s Subtle behavior. Focus/Typing still gain the
2px border + glow ring; Invalid still gains the 2px error border (bg stays
transparent). **Subtle-Disabled diverges from Standard-Disabled**: no border
at all (fully transparent) and `--mapped-text-disabled-default` instead of
`-on-color` — the same divergence already confirmed on
`SelectWalletAccount`'s Subtle-Disabled, recurring here.

**Focus/Typing glow ring** (`::after`): identical to Field/Select — `inset
-4px` (`--brand-scale-100`), 2px (`--brand-scale-50`) solid
`--mapped-surface-primary-default`, `border-radius --brand-scale-250` (10px),
`opacity 0.25`. Focus vs Typing is native placeholder-vs-value coloring, not
a separate CSS state.

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Padding | `--brand-scale-200` / `--brand-scale-300` | 8px / 12px |
| Radius | `--brand-scale-200` | 8px (border-radius/md) |
| Border width (default / focus·invalid) | `--brand-scale-25` / `--brand-scale-50` | 1px / 2px |
| Label→textarea gap | `--brand-scale-50` | 2px |
| Demo width / height | — | 400px / 160px (caller-controllable); `min-height: 56px` floor |

`box-sizing: border-box` keeps the box stable as the border grows 1→2px.
`resize: none` — Figma's box shows no resize handle, so none was added.

### Typography

Label: `.type-body-caption` (12px). Value/placeholder: `.type-body-m` (16px).

### Known Figma inconsistencies

- **`justify-content` toggle has no visible effect** — see the screenshot
  correction above. Not implemented.
- **No `isRequired`** — absent from this component's Figma source, unlike
  `Field`.
- **No icon slots** — Figma's Text area has no leading/trailing icon, unlike
  `Field`.
- **`get_design_context` reliability**: whole-set/parallel calls time out at
  ~300s; single-variant sequential calls succeed reliably — all 14 variants
  were read this way.

## Date Picker

**Figma node:** 54:1550 (`Date Picker` component set)

A single-line date input, no label slot (confirmed absent from all 14
variants — unlike `Field`/`Select`). Same box tokens as `Select`. The trailing
icon swaps between `calendar_month` (browse) and `cancel` (clear) depending on
state; the calendar dropdown is an app-provided slot, matching the Select
family's pattern.

> **Architecture decision**: Figma's Focus state renders a complete
> interactive calendar (month header with prev/next navigation, weekday row,
> full day grid) — not a placeholder example like Select's menu. By your
> direction, this was built as a slot (`calendarSlot`), consistent with the
> rest of the family, rather than implementing a full calendar widget inside
> this component. A real `Calendar`/date-grid component is still deferred
> (unlike `Menu`/`MenuItem`, which are now built).

> **Showcase composition**: `calendarSlot` wraps the custom day-grid content
> in a real `<Menu searchBar={false} isOptionList={false}>` for chrome only
> (elevation surface + shadow), not for its option-list behavior — a calendar
> grid isn't a list of `MenuItem` rows, so no `MenuItem`s are used here.
> `isOptionList={false}` matters as of `Menu`'s listbox/keyboard-nav fix — it
> defaults to `true`, which would otherwise wrap the calendar grid in
> `role="listbox"` semantics it doesn't have. `Menu`'s default width (426px,
> sized for option lists) doesn't fit a 240px calendar, so the wrapping
> element sets a `--menu-width: 240px` custom property, which `Menu.css`
> reads via `width: var(--menu-width, 426px)` — the intended caller-override
> mechanism already documented in that file.

> **Keyboard-accessible popup (audit-flagged MEDIUM finding, fixed)**: the
> calendar previously had no keyboard trigger — only a mouse click on
> `.datepicker__control` could open it, despite the input claiming
> `aria-haspopup="dialog"`. Fixed: `ArrowDown`/`Enter` on the input opens the
> calendar, `Escape` closes it while open. The popup container also gained
> `role="dialog"` (it previously had none, despite being the target the input's
> `aria-haspopup="dialog"` referred to via `aria-controls`).

> **Icon-swap logic (non-obvious, confirmed per-variant)**: the trailing icon
> is `cancel` (clear button) *only* in **Filled** and **Invalid**. Every other
> state — including **Hydrate**, which has a real value — shows
> `calendar_month`. A value being present does not by itself trigger the
> clear icon; being focused overrides it back to the calendar icon. Rule
> implemented in code: `showClearIcon = (hasValue && !isFocused) || isInvalid`.

> **"Hydrate" state**: a new state name not seen elsewhere in this family.
> Visually: 2px primary border + glow ring (like Focus), a real value in
> `text/default/default`, no caret rendered, calendar closed. Implemented
> as *not* a separate CSS state — it's just `:focus-within` (same mechanism
> as Focus) combined with native input value coloring, identical to how
> `Field`/`Select` handle their own Typing state. No dedicated `--hydrate`
> class exists in the CSS.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle'` | `'standard'` | |
| `label` | `string` | — | Visible label inside the control, above the date. **Omitting it renders exactly what it did before** — no label element, no `--labeled` class |
| `placeholder` | `string` | `'mm/dd/yyyy'` | |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled |
| `onChange` | `(value: string) => void` | — | Passes the new string |
| `onClear` | `() => void` | — | Wired to the clear icon; falls back to clearing internal state if uncontrolled |
| `calendarSlot` | `React.ReactNode` | — | App-provided calendar, rendered below when open |
| `isOpen` / `onOpenChange` | `boolean` / fn | — | Controlled open state |
| `isDisabled` / `isInvalid` | `boolean` | `false` | |
| `id` | `string` | — | Forwarded to `<input>`; auto-generated via `useId()` if omitted |
| `name` | `string` | — | Forwarded to `<input>` |
| `ariaLabel` | `string` | — | Accessible name **when there is no visible `label`** |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

No `isRequired`, no `iconLeft` slot — neither exists in Figma's source. The
left icon toggle (`iconLeft`) is `false` in every one of the 14 variants,
mirroring the dormant `iconLeft` finding on `SelectWalletAccount`.

### `label` (added v1.3.0) — and the correction it carries

⚠️ **This entry previously stated "this component has no visible label."** That
was true of the component and read as if it were true of the demand. It was
not. Four instances across Flows 10–12 (`1321:8566`, `1321:8583`,
`1321:11429`, `1321:15497`) all render a **titled** date field — `{Title}` (16
tall) above `mm/dd/yyyy` (24 tall) plus a trailing icon, 56 tall, **and no
calendar surface on any of them**.

Read carefully, that demand is *not* a `Field` usage, despite the shapes being
near-identical: Flow 12's DOB field renders the **filled state with the clear
✕**, which is this component's `showClearIcon = (hasValue && !isFocused) ||
isInvalid` rule — behaviour `Field`'s static `trailingIcon` cannot express —
and `1321:8583` carries a caret and a focus ring, so it is a real text-entry
control. Hence a `label` prop here rather than a swap to `Field`.

**Implementation mirrors `Field` exactly** — same markup shape
(`<label htmlFor>` above the input inside the stack), same tokens
(`--mapped-text-subtle-default`, `.type-body-caption`, 2px stack gap), same
association. One labelling convention in the DS, not two.

**Accessible-name rule** (identical to `Field.tsx`):
`aria-label={label ? undefined : ariaLabel}`. Verified as a *computed* name,
all three cases:

| Supplied | Computed accessible name | `aria-label` emitted |
|---|---|---|
| `label` only | the label | no |
| `ariaLabel` only | the ariaLabel | yes |
| **both** | **the label wins** | no |

### DELIBERATE DIVERGENCE — 60px against Figma's 56

**Measured, not estimated:** a labelled `DatePicker` renders **60px**, exactly
matching a labelled `Field` (measured: both 60, label colour and 2px stack gap
identical in both themes). Figma's `Date range picker` is **56**.

Figma reaches 56 with **6px vertical padding and a 4px label→value gap**. 6px
is off the `--brand-scale` ramp (4/8), and a 4px gap would fork the DS's
labelling convention away from `Field`'s 2px. **Mirroring `Field` was chosen
over matching the height** — one convention, every value on-ramp, no literal.

**2px of the 4px gap is inherited, not introduced:** `Field` itself renders 60
against its own Figma node's 58. Recorded so the delta isn't later
misattributed to this change.

### State → token mapping (Standard, confirmed)

| State | Background | Border | Text | Icon |
|---|---|---|---|---|
| Default | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | placeholder `--mapped-text-subtle-default` | `calendar_month` |
| Hover | `--mapped-surface-primary-default-subtle-hover` | 1px `--mapped-border-primary-default-subtle-hover` | unchanged | `calendar_month` |
| Focus | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-primary-default` + glow ring | placeholder unchanged | `calendar_month` |
| Hydrate | unchanged | 2px `--mapped-border-primary-default` + glow ring | value `--mapped-text-default-default`, no caret | `calendar_month` |
| Filled | unchanged | 1px `--mapped-border-subtlest-default` | value `--mapped-text-default-default` | `cancel` |
| Invalid | unchanged | 2px `--mapped-border-error-default` | value `--mapped-text-default-default` | `cancel` |
| Disabled | `--mapped-surface-disabled-default` | 1px `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` | `calendar_month`, `--mapped-icon-disabled-on-color` |

**Subtle appearance:** transparent background and border at rest *and* on
hover — identical to `Field`/`Select`. Focus/Invalid still gain the border
treatment; **Subtle-Disabled diverges from Standard-Disabled** — no border at
all, `--mapped-text-disabled-default`/`--mapped-icon-disabled-default`
instead of `-on-color` — the same divergence already confirmed on
`SelectWalletAccount` and `TextArea`.

Icon color tracks the adjacent text tone per state (established convention
from `SelectWalletAccount`'s chevron).

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Padding | `--brand-scale-200` / `--brand-scale-300` | 8px / 12px |
| Radius | `--brand-scale-200` | 8px |
| Border (default / focus·invalid) | `--brand-scale-25` / `--brand-scale-50` | 1px / 2px |
| Gap | `--brand-scale-200` | 8px |
| Icon | `<Icon size="m">` | 20px |
| Demo width | — | 240px (caller-controllable) — this component is shorter than `Field`/`Select`'s 320px demo |

Typography: value/placeholder `.type-body-m` (16px). No label typography (no label slot).

### Accessibility

Real `<input>`. `aria-haspopup="dialog"` (not `aria-autocomplete="list"` like
`Select` — the popup here is a calendar grid, not an autocomplete list, so
the ARIA popup type was adapted rather than copied). `aria-expanded`,
`aria-controls` (only when the calendar is open), `aria-invalid`. Clear icon
is a real `<button>` with `aria-label="Clear date"`, `tabIndex={-1}`.

### Known Figma inconsistencies

- **Focus renders a full built calendar in Figma, built as a slot in code**
  — see the architecture decision above. Deliberate scope decision, not a
  fidelity gap.
- **Icon-swap rule is non-obvious** — see above; confirmed per-variant, not
  guessable from adjacent states (Hydrate does *not* show the clear icon
  despite having a value).
- **`calendar_month` icon added this session** — didn't exist in the Icon
  set; added from the already-installed `@material-design-icons/svg`
  package (same source as every existing icon), no new dependency.
- **No `Invalid` + `Focus`/`Hydrate` combination was read** — Invalid was
  only confirmed on top of Default. The clear-icon rule
  (`isInvalid` always shows `cancel`) is the safest interpretation
  consistent with every confirmed data point, not a directly-read
  combination.
- **`get_design_context` reliability**: whole-set/parallel calls time out;
  single-variant sequential calls succeed — all 14 variants read this way.
  Two reads (Focus, Subtle-Focus) returned large payloads due to the nested
  calendar grid and required paging through the persisted tool output.

## Time Picker

**Figma node:** 54:10462 (`Time Picker` component set)

A single-line time input, sibling of `DatePicker` — same box tokens, no
label slot. All 14 variants (2 appearances × 7 states, including the same
`Hydrate` state name) read individually — **not** assumed from `DatePicker`,
and several confirmed rules genuinely diverge from it.

**Showcase composition**: `timesSlot` is populated with a real `<Menu
searchBar={false}>` wrapping `<MenuItem type="default">` rows (one per time
option) — no search bar, since the option list here is static (unlike
`Select`, this trigger's own input doesn't filter the list).

> **Confirmed divergences from `DatePicker`** (read independently, not
> copied): (1) single `remove_circle` icon that fades via opacity, not a
> two-icon swap like calendar_month/cancel; (2) the icon-visibility rule is
> simpler — `hasValue && !isFocused`, no `isInvalid` override needed;
> (3) **Hydrate hides the icon** here, the opposite of `DatePicker` where
> Hydrate showed the calendar icon; (4) **Subtle-Hover gains a background
> tint** (no border), unlike `DatePicker`/`Field`/`TextArea`'s fully inert
> Subtle-Hover.

> **Corrected token — Disabled background.** Figma's Standard-Disabled
> background uses `--border/on-color` (resolves to white), not
> `--surface/disabled/default` (#f9f9f9) — every sibling in this family
> (`Field`, `Select`, `DatePicker`) uses the latter for Disabled. A
> border-family token applied to a background property, breaking an
> otherwise-universal pattern, was flagged as a likely Figma authoring slip.
> By explicit approval, normalized to `--mapped-surface-disabled-default` to
> match the established pattern. Border itself was normal
> (`--border/disabled/default`) and is used as-is.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `'standard' \| 'subtle'` | `'standard'` | |
| `placeholder` | `string` | `'1:00 PM'` | |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled |
| `onChange` | `(value: string) => void` | — | Passes the new string |
| `onClear` | `() => void` | — | Wired to the clear icon; falls back to clearing internal state if uncontrolled |
| `timesSlot` | `React.ReactNode` | — | App-provided time-option list, rendered below when open |
| `isOpen` / `onOpenChange` | `boolean` / fn | — | Controlled open state |
| `isDisabled` / `isInvalid` | `boolean` | `false` | |
| `id` | `string` | — | Forwarded to `<input>`; auto-generated via `useId()` if omitted |
| `name` | `string` | — | Forwarded to `<input>` |
| `ariaLabel` | `string` | — | This component has no visible label |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

No `isRequired`, no `iconLeft` slot — neither exists in Figma's source
(`iconLeft` is `false` in every one of the 14 variants).

### State → token mapping (Standard, confirmed)

| State | Background | Border | Text | Clear icon |
|---|---|---|---|---|
| Default | `--mapped-surface-primary-default-subtle` | 1px `--mapped-border-subtlest-default` | placeholder `--mapped-text-subtle-default` | hidden |
| Hover | `--mapped-surface-primary-default-subtle-hover` | 1px `--mapped-border-primary-default-subtle-hover` | unchanged | hidden |
| Focus | `--mapped-surface-primary-default-subtle` | 2px `--mapped-border-primary-default` + glow ring | placeholder unchanged | hidden |
| Hydrate | unchanged | 2px `--mapped-border-primary-default` + glow ring | value `--mapped-text-default-default`, no caret | **hidden** |
| Filled | unchanged | 1px `--mapped-border-subtlest-default` | value `--mapped-text-default-default` | visible |
| Invalid | unchanged | 2px `--mapped-border-error-default` | value `--mapped-text-default-default` | visible |
| Disabled | `--mapped-surface-disabled-default` (corrected, see above) | 1px `--mapped-border-disabled-default` | `--mapped-text-disabled-on-color` | hidden |

**Subtle appearance:** transparent border at rest; **Subtle-Hover gains a
background tint** (`surface-primary-default-subtle-hover`, no border) — a
confirmed divergence from `DatePicker`. Focus/Invalid still gain the border
treatment; Subtle-Disabled drops the border entirely and uses
`--mapped-text-disabled-default`/`--mapped-icon-disabled-default` instead of
`-on-color`, same divergence already confirmed across this family.

Clear icon color tracks the adjacent text tone per state (established
convention).

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Padding | `--brand-scale-200` / `--brand-scale-300` | 8px / 12px |
| Radius | `--brand-scale-200` | 8px |
| Border (default / focus·invalid) | `--brand-scale-25` / `--brand-scale-50` | 1px / 2px |
| Gap | `--brand-scale-200` | 8px |
| Icon | `<Icon size="m">` | 20px |
| Demo width | — | 240px (caller-controllable) |

Typography: value/placeholder `.type-body-m` (16px). No label typography.

### Accessibility

Real `<input>`. `aria-haspopup="listbox"` (the popup here is a plain option
list, unlike `DatePicker`'s `dialog`-type calendar). `aria-expanded`,
`aria-controls` (only when the list is open), `aria-invalid`. Clear icon is
a real `<button>` with `aria-label="Clear time"`, `tabIndex={-1}`, and is
both `disabled` and `aria-hidden` when not showing (so it's never focusable
or clickable while invisible).

### Known Figma inconsistencies

- **Disabled background token corrected** — see above; flagged and approved,
  not silently changed.
- **Icon-visibility and Subtle-Hover rules diverge from `DatePicker`** — see
  the divergences note above. Confirmed independently, not inherited.
- **`remove_circle` icon added this session** — didn't exist in the Icon
  set; added from the already-installed `@material-design-icons/svg`
  package, no new dependency.
- **Menu confirmed as an app-provided slot** via Figma's own annotation
  ("🎰 Example Slot for Select `<Menu>`..."), same as `Select` — unlike
  `DatePicker`'s calendar, which had no such annotation and required an
  explicit architecture decision.
- **`get_design_context` reliability**: whole-set/parallel calls time out;
  single-variant sequential calls succeed — all 14 variants read this way.

## Menu Item

**Figma node:** 43:1222 (`<item>` component set, inside the "Parts" annotation
frame at 149:8609) — the shared row atom every Select-family dropdown
(`Select`, `SelectTransfer`, `SelectWalletAccount`, `TimePicker`'s
`timesSlot`) composes its `optionsSlot`/`timesSlot` content from. The wider
`Menu` dropdown chrome that wraps these rows is now built too — see `## Menu`
below.

22 variants read individually across 3 axes (not fully crossed):

| `type` | `state` × `isSelected` combos |
|---|---|
| `default` | default/false, hover/false, press/false, default/true |
| `crypto` | default/false, hover/false, press/false, default/true |
| `account` | default/false, hover/false, press/false, default/true |
| `checkbox` | default/false, hover/false, press/false, default/true, **press/true** |
| `radio` | default/false, hover/false, press/false, default/true, **press/true** |

Only `checkbox`/`radio` have a press+selected combo in Figma's source.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'default' \| 'crypto' \| 'account' \| 'checkbox' \| 'radio'` | `'default'` | |
| `label` | `string` | `'Label'` | default/checkbox/radio row text; account's primary name |
| `isSelected` | `boolean` | `false` | |
| `onSelect` | `(id?: string) => void` | — | Fires on click, Enter, or Space, passing the row's `id` (if provided) — matches the `(id) => void` convention used elsewhere (`Navigation`'s `onSelect`); `id` is optional since MenuItem rows don't always carry a caller-assigned identifier |
| `iconSlot` | `React.ReactNode` | — | Leading badge for `default`/`crypto` — app-provided, not a fixed component (Figma names these `<element>`, a generic swappable slot; the raster demo images inside — a flag photo, a crypto coin logo — are placeholder content, not real component instances) |
| `showIcon` | `boolean` | `true` | Maps to Figma's `icon` toggle |
| `avatarSrc` / `avatarName` / `avatarInitials` | `string` | — | `type="account"` — forwarded to `Avatar` (`size="m"`, 32px, matches Figma exactly) |
| `trailingLabel` | `string` | `'Label'` | `type="account"` — text beside the trailing selection dot |
| `labelCrypto` / `labelWallet` / `labelAmount` / `labelAmountCrypto` | `string` | `'Crypto'` / `'Wallet'` / `'$0,000.00'` / `'0.00 ETH'` | `type="crypto"` |
| `id` | `string` | — | Forwarded to the row |
| `tabIndex` | `number` | `0` | Roving-tabindex target — managed by `Menu` when `MenuItem` rows are nested inside one (only the active row gets `0`, the rest `-1`); defaults to `0` so `MenuItem` stays independently tabbable when used standalone, outside `Menu` |
| `previewState` | `'hover' \| 'pressed'` | — | Showcase only |

No `isDisabled` — Figma's source defines no disabled state for `<item>`, so
none was added (per the inferred-states rule).

### Nested components (reused, not reimplemented)

- **`Avatar`** (`size="m"`) — `account` type's leading photo
- **`Radio`** — the `radio` type itself, and again for `account`'s trailing
  selection dot (Figma instances the same `<RadioIcon>` part in both places)
- **`Checkbox`** — the `checkbox` type's leading control

All three are wrapped with the `inert` HTML attribute (+ `aria-hidden`) when
nested — the row (`role="option"`) owns click/keyboard/selection semantics
alone, so the nested control never becomes a second focusable/interactive
target. Neither `Checkbox` nor `Radio` needed any code changes to reuse this
way.

> **Disclosed trade-off:** because the nested `Checkbox`/`Radio` are `inert`,
> they never receive a real `:active`, so their own internal glyph can't show
> Figma's darker pressed-blue fill in the one checkbox/radio press+selected
> variant — only the row's background gets the correct pressed tint (10% →
> 20% color-mix). Fixing this fully would require adding a forced-visual
> "pressed" prop to `Checkbox`/`Radio` themselves; not done here since it
> wasn't asked for. Flagged, not silent.

### State → token mapping (confirmed)

| State | Background | Label text |
|---|---|---|
| Default | `--mapped-surface-primary-default-subtle` | `--mapped-text-default-default` |
| Hover | `--mapped-surface-primary-default-subtle-hover` | `--mapped-text-default-default` |
| Press | `--mapped-surface-primary-default-subtle-pressed` | `--mapped-text-default-default` |
| Selected | `color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)` | `--mapped-text-primary-default` |
| Selected + press (checkbox/radio only) | `color-mix(in srgb, var(--mapped-border-primary-default) 20%, transparent)` | `--mapped-text-primary-default` |

Same derivation already used by `Tag`/`FilterChip`'s selected state — chosen
over a raw literal or a new mapped token so it dark-flips automatically. The
math lines up exactly: 20% of `--mapped-border-primary-default` (#046eff)
over transparent = `rgb(205,226,255)` = `#cde2ff`, the literal `Blue/100`
value Figma used for the press+selected combo; 10% ≈ `#e6f0ff` vs Figma's
`#e6f1ff` (1-unit rounding, imperceptible).

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Padding (default/crypto/account) | `--brand-scale-300` all sides | 12px |
| Padding (checkbox/radio) | `--brand-scale-400` left, `--brand-scale-300` right/top/bottom | 16px / 12px |
| Gap (default/crypto/account) | `--brand-scale-200` | 8px |
| Gap (checkbox/radio) | `--spacing-none` | 0 |
| Radius | `--brand-scale-50` | 2px |
| Leading icon (`default`) | — | 20px (`--brand-scale-500`) |
| Leading icon (`crypto`) | — | 40px (`--brand-scale-1000`) |
| Leading avatar (`account`) | `Avatar size="m"` | 32px |

Typography: `default`/`checkbox`/`radio` label `.type-body-sm` (14px);
`crypto`/`account` primary text `.type-body-m-semibold` (16px); `crypto`'s
secondary lines `.type-body-caption` (12px).

### Accessibility

Row is `role="option"`, `aria-selected={isSelected}`, `tabIndex={0}`. Click,
Enter, and Space all fire `onSelect`. Nested `Checkbox`/`Radio` are `inert` +
`aria-hidden` (see trade-off note above) so their native `<input>` never
becomes a duplicate tab stop or announces redundant checked state — the
row's own `aria-selected` is the single source of truth for assistive tech.

### Known Figma inconsistencies

- **Selected-state background bypasses the token layers.** Figma's own
  variable set contains a correctly-named `surface/primary/default-subtle-selected`
  variable (`#f2f2f2`) that matches our `--mapped-surface-primary-default-subtle-selected`
  token exactly by name — but the `<item>` fill isn't bound to it. It's bound
  directly to a raw `Blue/50`/`Blue/100` swatch instead. Resolved via the
  color-mix derivation above, by explicit approval — not a silent fix.
- **"default" type dimmed its label text on hover/press in Figma**
  (`text/subtle/default` instead of `text/default/default`) — but `crypto`'s
  hover state (read independently) leaves text untouched, and `Checkbox`'s
  own press state *darkens* text, the opposite direction. Confirmed as a
  Figma binding slip isolated to the `default` type and normalized so all
  types keep constant text color across default/hover/press, by explicit
  approval.
- **Minor token-family mixing, not corrected (values matched, so no
  functional change):** `crypto`'s selected-state text color is bound to
  `--icon/primary/default` rather than a text-family token; `radio`'s
  press+selected trailing label is bound to `--icon/primary/default-pressed`.
  Both resolve to the same hex as their text-family equivalents
  (`--text/primary/default` / `--text/primary/default-pressed`), so mapped to
  `--mapped-text-primary-default` uniformly rather than reproducing the
  inconsistency.
- **`get_design_context` reliability**: whole-set calls on `43:1222` returned
  a collapsed 2-variant merge rather than the requested single variant (a
  new failure mode, distinct from the previously-documented timeout-on-parallel-calls
  quirk); every variant was still confirmed via individual sequential reads
  regardless of what the merge returned.

## Menu

**Figma node:** 48:1701 (`<Menu>`, inside the "Components" annotation frame
at 149:2535) — the floating dropdown chrome that wraps `MenuItem` rows for
every Select-family component. A single Figma component, not a variant set
(no separate open/closed or hover states in source — it's only ever rendered
while the dropdown is open).

Two parts: an optional search bar (a real `Field` instance) and a content
area that receives app-provided `slotContent`. Figma's own fallback demo
inside the content area (`Slot content / Options / Select (Scrollable)`) is
explicitly annotated *"🎰 Example Slot for Select `<Menu>` — you are welcome
to use this component but we suggest creating your own slot component"* —
same app-provided-slot pattern as `Select`/`SelectTransfer`/`TimePicker`/
`DatePicker`. No default option list is baked into `Menu` itself, matching
every other slot prop in this codebase.

Some Select-family components don't have search inside their own menu at
all, and some have two independent dropdowns within one select (a main
list plus, e.g., a secondary currency picker that needs its own search) —
`searchBar` and `slotContent` cover both: hide the search bar for a plain
option-list menu, or use two separate `Menu` instances (each with its own
`slotContent`) for the two-dropdown case.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `searchBar` | `boolean` | `true` | Hide to use `Menu` as a plain option-list dropdown with no search field — e.g. a secondary currency picker nested inside another select, or any select that has no in-menu search |
| `searchPlaceholder` | `string` | `'Placeholder'` | Figma default value |
| `searchValue` / `onSearchChange` | `string` / `(value: string) => void` | — | Controlled search input |
| `searchAriaLabel` | `string` | `'Search'` | Forwarded to `Field`'s `ariaLabel` (no visible label on this field) |
| `listAriaLabel` | `string` | — | Accessible name for the `role="listbox"` (rendered only when `isOptionList`). **Required in practice** — deliberately has *no* generated default, because a generic one would be a regression whenever several menus share a page. Omitting it leaves the listbox unnamed (audit F4). |
| `slotContent` | `React.ReactNode` | — | App-provided option list — typically a stack of `MenuItem` rows, each composited with others of the same `type` |
| `isOptionList` | `boolean` | `true` | Adds `role="listbox"` + arrow-key/roving-tabindex navigation across any `[role="option"]` descendants of `slotContent`. Set `false` when wrapping non-option content — e.g. `DatePicker`'s calendar grid, which also composes via `Menu` for its floating-panel chrome |
| `id` | `string` | — | |

### Keyboard navigation (added — audit-flagged HIGH finding)

`Menu` previously rendered `slotContent` with no listbox semantics and no
keyboard support at all — a real WAI-ARIA listbox gap for what's functionally
a selectable option list in every real consumer (`Select`, `SelectTransfer`,
`SelectWalletAccount`, `TimePicker`). Fixed: when `isOptionList` (default),
`slotContent` renders inside a `role="listbox"` container that implements
real roving-tabindex — `ArrowDown`/`ArrowUp` move focus between
`[role="option"]` descendants (wrapping at either end), `Home`/`End` jump to
first/last, and exactly one option carries `tabIndex={0}` at a time (the
selected option initially, if any, else the first). Implemented via direct
DOM querying/attribute writes (not `React.cloneElement`) because real
consumers structure `slotContent` inconsistently — some pass an array of
`MenuItem` elements directly, others wrap them in their own layout `<div>` —
and the DOM-level approach works regardless of that nesting.

### Nested components (reused, not reimplemented)

- **`Field`** — the search bar, used exactly as built: leading icon slot,
  placeholder, real `:focus-within` (2px border + 25%-opacity glow ring),
  real hover/typing states. Figma's export happens to show it in its focused
  look, but nothing in the source implies the field should be permanently
  frozen in that appearance — `Menu` lets `Field`'s own interaction states
  drive it rather than hardcoding a fake-focused look.
- **`Icon`** (`name="search"`) — the field's leading glyph. Hardcoded inside
  `Menu`, not exposed as a swappable prop, since this field's purpose (a
  search bar) is fixed by the component itself, unlike `MenuItem`'s generic
  `<element>` slots.

`MenuItem` and the raw scrollbar seen in Figma's fallback demo are not part
of `Menu` itself — they only appear inside the *example* content, which
isn't built in here (same scope call as `MenuItem`'s build: Scrollbar stays
deferred).

### Token mapping (confirmed)

| Element | Token |
|---|---|
| Card width | `var(--menu-width, 426px)` — Figma demo width; callers override via the `--menu-width` custom property (same convention as `Field`'s 240px default), e.g. `DatePicker`'s calendar wraps `Menu` at a narrower `240px` |
| Card background | `--mapped-surface-elevation-default` (dark-flips) |
| Card radius | `--brand-scale-200` (8px) |
| Card padding | `--brand-scale-300` (12px) top/bottom, 0 sides |
| Card gap (search bar ↔ list) | `--brand-scale-200` (8px), via `.menu`'s own `gap` |
| List row gap (`.menu__list`) | `var(--spacing-none)` — **0**, rows sit flush | 
| Search bar wrapper padding | `--brand-scale-200` (8px) horizontal |
| Search field | `Field` (unmodified) |

**REVISED — inter-item gap removed.** `.menu__list` originally reused the
card's own `--brand-scale-200` (8px) gap between `MenuItem` rows. User
feedback: dropdown menu items should sit with no gap between them at all —
each row's own padding/hover background is what should separate them
visually, not a track gap. Fixed to `var(--spacing-none)`. The `.menu`
card-level gap (search bar to list) is untouched — this only affects spacing
*between* rows inside `.menu__list`.

### Known Figma inconsistencies

- **Card shadow has no matching token.** Figma specifies a two-layer
  elevation shadow with navy-tinted alpha colors —
  `0px 0px 1px rgba(9,30,66,.31), 0px 8px 12px rgba(9,30,66,.15)` — but the
  three existing `--shadow-*` tokens (`medium`/`subtle`/`subtlest`) are all
  flat black-alpha, single-layer, and none match. Doesn't fit either
  pre-approved gap pattern cleanly (color-mix doesn't apply to a shadow
  recipe; it's not an off-ramp spacing value). By explicit approval,
  recorded as a literal with a FAIL-LOUD comment rather than approximated
  with an existing token or silently given a new one. Revisit if another
  floating-panel component (tooltip, popover) needs the same recipe — that
  would be the trigger to formalize a `--shadow-elevation` token.
- **Inset ring shadow omitted.** Figma's export also includes a 1px inset
  shadow (`shadow/overlay/third`) at `rgba(188,214,240,0)` — fully
  transparent in the only captured state, so it has no visible effect.
  Omitted rather than encoding a shadow that does nothing; revisit if a
  future variant activates it.
- **`get_design_context` read cleanly** on this node (single component, no
  variant-set merge quirk like `MenuItem`'s).

## Modal

**Figma node:** 207:3898 (`Modal`)

A generic dialog container over a `Blanket` scrim — **not a variant set**, a
single composition. Three stacked full-width regions inside a centered card:
a **header** (title + close), a **flexible content slot** (`children` — the
Modal is a generic container for whatever a feature needs), and a **footer**
slot the app fills with real `Button`s. Rendered via `createPortal` to
`document.body` (the correct overlay pattern, and required because `Blanket`
is `position: fixed`).

Figma names the card layer "Bottom Sheet", but it is vertically **centered**
(`translateY(-50%)`), i.e. a centered modal — the layer name is a Figma
artifact, not a bottom-sheet behavior.

### Nested components (all reused as real instances — none re-implemented)

| Instance | Role | Notes |
|---|---|---|
| `Blanket` | Scrim | `onClick` → `onClose` when `closeOnScrimClick` (default true) |
| `IconButton` (tertiary, size `s`) + `Icon name="close"` size `l` | Close ✕ | Tertiary text token is `--mapped-text-default-default`, an exact match to Figma's `icon/default/default` |
| `Button` ×N | Footer actions | App-composed via the `footer` slot; showcase uses primary "Confirm" + secondary "Cancel" |

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controlled open state |
| `onClose` | `() => void` | — | Fired by ✕, Escape, or scrim click |
| `title` | `string` | — | Header title (Figma `{Header}` text prop); wired to `aria-labelledby` |
| `headerIconLeft` | `React.ReactNode` | — | Leading node inside the **centred** header group, before the title. Omitting it renders byte-identically to before — verified |
| `children` | `React.ReactNode` | — | Flexible content slot (the generic-container middle region) |
| `footer` | `React.ReactNode` | — | Full-width vertical button stack; app composes real `Button`s |
| `closeOnScrimClick` | `boolean` | `true` | Scrim click calls `onClose` |
| `ariaLabel` | `string` | — | Accessible name when there's no visible `title` |
| `id` | `string` | — | Forwarded to the dialog element; auto-generated via `useId()` if omitted |
| `className` | `string` | — | Added to the overlay root (e.g. to override card `max-width`) |

No `previewState` — a Modal has no forced visual sub-states to preview; its
"state" is open/closed, driven by `isOpen`.

### State → token mapping

| Element | Property | Token | Px |
|---|---|---|---|
| Card | background | `--mapped-surface-elevation-default` | — |
| Card | radius | `--brand-scale-200` | 8 |
| Header | padding (T/sides/B) | `--brand-scale-600` / `--brand-scale-400` / `--brand-scale-400` | 24 / 16 / 16 |
| Title | color | `--mapped-text-default-default` | — |
| Title | type | `.type-body-m-semibold` | 16/24 |
| Content | side padding | `--brand-scale-400` | 16 |
| Content | gap | `--brand-scale-400` | 16 |
| Footer | padding (T/sides/B) | `--brand-scale-400` / `--brand-scale-400` / `--brand-scale-600` | 16 / 16 / 24 |
| Footer | gap | `--brand-scale-400` | 16 |
| Close ✕ | — | `IconButton` (tertiary) owns its tokens | — |
| Scrim | — | `Blanket` (`--mapped-blanket-default-default`) owns its token | — |

The title is **centered** via a 3-column grid (`1fr auto 1fr`) — the empty
left cell mirrors the close control on the right, matching Figma's own
spacer-based centering.

### `headerIconLeft` (added v1.3.0, filed as G12)

**Demand:** Flow 11's smart-insight modal (`1266:14341`, Modal `1321:12705`,
header `1321:12708`) carries a 24×24 icon beside the title (`1321:12721`).
`Modal` had no leading slot, so the sparkle could not be expressed.

**Same prop name and same `ReactNode` shape as `Sheet`'s** — two sibling
overlays must not carry two names for one slot.

⚠️ **DELIBERATE DIVERGENCE from `Sheet`: position.** `Sheet` left-aligns its
header, so its slot sits in a left-aligned lead group. `Modal` centres, so the
icon goes **inside grid-column 2 with the title**, in a
`.mn-modal__title-group` flex row (gap `--brand-scale-100` = 4px — Figma has
the icon at local x=0, 24 wide, title at x=28).

This is a read, not a preference: **Figma centres icon+title as one unit.** In
header `1321:12708` (343 wide) the group measures 147 wide at x=98 — 98 left,
343 − (98+147) = **98 right**. Placing the icon in the empty left track would
have left-aligned it and mismatched the source. Centring is structurally
preserved because both side tracks remain `1fr`, so they stay equal width
regardless of the icon.

**Blast radius, measured.** The wrapper is new DOM for *every existing call
site*. The no-icon render was compared against a faithful reconstruction of
the pre-change DOM (h2 as a direct grid child with the old `grid-column: 2`),
in both themes: title left `120.11`, right `120.12`, width `134.76`, height
`24`, top `28.8`, header height `73.6`, plus colour, font-size, weight,
line-height, text-align and margin — **every value identical, sub-pixel. The
title did not move.**

### Geometry (confirmed)

| Property | Token | Px |
|---|---|---|
| Card max-width | — | 375 (Figma frame width; caller-controllable via `className`/style) |
| Overlay padding | `--brand-scale-400` | 16 (keeps the card off the viewport edge on small screens) |
| Card radius | `--brand-scale-200` | 8 |

Card is `overflow: clip`, `box-sizing: border-box`, `width: 100%` capped at
`max-width`. **No drop shadow** — Figma's Modal card has none; the `Blanket`
scrim provides the depth (unlike `Menu`, which does carry a shadow).

### Accessibility

`role="dialog"` + `aria-modal="true"`. `aria-labelledby` points at the title
when present, else `aria-label` is used. Escape closes; focus moves into the
dialog on open and is **restored to the previously-focused element** on close;
Tab is **trapped** within the dialog (Shift+Tab wraps at the first focusable,
Tab wraps at the last). Close button carries `aria-label="Close"`.

### Known Figma inconsistencies / decisions

- **Card background bound to a raw primitive, normalized.** Figma binds the
  card fill to `Neutral01` (#ffffff, a brand primitive) rather than a semantic
  surface token — a raw primitive would not dark-flip, leaving the card white
  in dark mode. By explicit approval, normalized to
  `--mapped-surface-elevation-default` (the same token `Menu` uses; dark-flips
  to #262626). Same class of finding as `TimePicker`'s disabled-background
  normalization.
- **Close control upgraded from a bare icon to `IconButton`.** Figma's close
  is a bare 24px `close` icon flush at the 16px header padding edge. By
  explicit choice it's built with our `IconButton` (tertiary, size `s`) to
  gain hover/pressed/focus affordances. Consequence: the size-`s` IconButton
  adds `--brand-scale-100` (4px) of padding, so the ✕ sits ~4px further from
  the card edge than Figma's flush icon. Cosmetic, disclosed.
- **Footer forces full-width children** (`.modal__footer > * { width: 100% }`)
  to match Figma's stacked full-width button layout. An app wanting inline/
  right-aligned actions would wrap them; the default matches the source.
- **Interaction behaviors are the WAI-ARIA dialog baseline, not inferred
  visual states.** Figma defines no hover/pressed/focus states for the Modal
  itself; Escape-to-close, focus trap, focus restore, and scrim-click-close
  are accessibility-pattern requirements, not decorative additions.
- **`get_design_context` timed out repeatedly** on this node (~300s each) —
  the heaviest read this session, because the card embeds two full nested
  `Button` variant-set instances. The server was confirmed healthy on sibling
  nodes throughout; the full read eventually succeeded on a warm retry and
  supplied exact geometry. Screenshots + `get_variable_defs` covered the gap
  in between.

## Progress Bar

**Figma node:** 260:506 (`Progress bar indicator`) · atom `107:2882` (`❖ Progress bar`)

A horizontal track with a label row above it: a `%` on the left and a
`current / total` readout on the right. Two sizes (**S** caption / **M** body).
The Figma "indicator" fixes the fill to the success/green look — the raw
`<ProgressBar>` atom's three appearances (default `#44546f` / inverse white /
success green) are **not** exposed here (see inconsistencies).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | — | 0–100; drives fill width and the default `%` label |
| `size` | `'s' \| 'm'` | `'s'` | S = 12px caption labels; M = 16px body labels |
| `showLabels` | `boolean` | `true` | `false` → bare track+fill (covers the raw-atom use) |
| `percentageLabel` | `string` | `` `${round(value)}%` `` | Overrides the left label |
| `current` / `total` | `string` | — | Right-side readout; hidden if both omitted |
| `id` / `className` | `string` | — | |
| `ariaLabel` | `string` | percentage, plus `current`/`total` when present | Accessible name for the bar. Falls back to e.g. `"60%"`, or `"60%, 600 of 1,000"` when a readout is shown — the visual labels are not wired as the name, so without a fallback the bar had none (audit F3). Mirrors `ProgressRing`'s existing pattern. |

### State → token mapping

| Element | Token | Px |
|---|---|---|
| Track | `--mapped-surface-subtle-default`, radius `--brand-scale-1800` | round (512) |
| Fill | `--mapped-surface-success-default`, radius `--brand-scale-200` | 8 |
| Track height | `--brand-scale-200` | 8 |
| Label→bar gap | `--brand-scale-100` | 4 |
| `%` label | `--mapped-text-success-default` | — |
| Readout current / slash / total | `--mapped-text-default-default` / `--mapped-icon-default-default` / `--mapped-text-subtle-default` | — |
| Type (S / M) | `.type-body-caption` / `.type-body-m` (+ `.type-body-m-medium` for `%`) | 12 / 16 |

### Accessibility

Track carries `role="progressbar"` with `aria-valuenow` (rounded `value`),
`aria-valuemin=0`, `aria-valuemax=100`, and `aria-label` (the visible labels
aren't wired as the name).

### Known Figma inconsistencies / decisions

- **Fill token normalized to dark-flip.** Figma binds the fill to `Green/400`
  (#60c680), which has **no matching mapped token** (`--mapped-surface-success-default`
  is Green/500 #38b860). By explicit approval, uses the semantic success surface
  so it dark-flips — visibly a touch darker than the raw swatch, and equal to
  the `%` label colour.
- **Appearance variants deferred.** The raw `<ProgressBar>` atom has
  default/inverse/success appearances; the **default** appearance is `#44546f`
  (`color/background/neutral/bold/default`), which has **no token at all** in
  our system. The indicator only needs success/green, so appearance is not
  exposed — the multi-appearance primitive is deferred until that navy token
  exists.
- **Redundant inner track layer ignored.** Figma's atom nests a second
  `h-6px` "container" over the `h-8px` track in the same `surface/subtle`
  colour — no visible effect, so it's collapsed to a single track.

## Progress Ring

**Figma node:** 235:5711 (`Progress ring indicator`)

A ~270° gauge (90° gap centred at the bottom, 8px stroke) with a gray track
and a **conic gradient fill** (Figma's exact 6-stop recipe — see below), plus
centre content: a caption row (`{%} • {caption}`), a large amount, and a
**custom pill** (not the shared `Badge`). Two sizes (**m** / **l**).

> **Fill semantics — `value` is "% spent", not "% left".** Confirmed against
> a real app screen (Finance → Budget tab): a budget at 82% spent (18% left)
> shows a **large** colored arc reaching well into the red end; a budget at
> 65% spent (35% left) shows a **visibly smaller** one. The arc is a "danger"
> gauge that fills *toward red as spending grows* — the opposite of what an
> earlier build of the showcase demo did (it drove the arc off `left%`,
> producing a *small* arc for an *almost-exhausted* budget — backwards). The
> caption/pill still read the friendlier **left** amount/percentage via
> `percentageLabel` — callers must pass `value={spentPercent}` and
> `percentageLabel={leftPercent + '%'}` separately; the component does not
> infer one from the other. Verified against the reference screen's exact
> numbers: `RM 350 of RM 1,000` (65% spent) → 65.0% arc fill, "35%" caption.

### Nested components

None — the centre pill was previously built by reusing `Badge` (dark), but
Figma's spec has different vertical padding, and both words in the row share
one weight (a shape `Badge`'s API doesn't model) — see "Known Figma
inconsistencies" below. It's now bespoke markup local to this component.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | — | 0–100; drives **only the arc fill** (+ the default `%` caption if `percentageLabel` is omitted) |
| `size` | `'m' \| 'l'` | `'m'` | m 162×140 (h5 amount) / l 220×190 (h4) |
| `percentageLabel` | `string` | `` `${round(value)}%` `` | Caption number — pass this explicitly whenever it should read differently from `value` (see below) |
| `caption` | `string` | `'Left to Spend'` | Caption text after the bullet |
| `amount` | `string` | `'RM 0.00'` | Big centre amount |
| `total` | `string` | `'RM 0.00'` | Pill total (rendered `of {total}` in the custom pill) |
| `id` / `className` | `string` | — | |
| `ariaLabel` | `string` | — | Defaults to `` `${%} ${caption}` `` |

### State → token mapping

| Element | Token |
|---|---|
| Track arc | `--mapped-surface-default-default`, 8px stroke (per-size, see below), round caps |
| Gradient fill | conic `--brand-blue-500 → --brand-purple-500 → --brand-red-500` — see "Geometry / arc technique" |
| Caption | `--mapped-text-default-default`; **m** `.type-body-caption` / **l** `.type-body-m` (the `%`/`•` use the matching `-semibold`) |
| Amount | `--mapped-text-default-default`; m `.type-header-h5` / l `.type-header-h4` |
| Pill text | **m** `.type-body-caption-semibold` (12px semibold) / **l** `.type-body-m` (16px regular) |
| Pill box | `--brand-slate-600` bg + `--mapped-text-on-color-heading` |
| Caption gap / content gap | `--brand-scale-50` (2) / `--brand-scale-100` (4) |
| Pill padding / gap / radius | `--brand-scale-100` (4) vertical / `--brand-scale-200` (8) horizontal / `--brand-scale-100` (4) gap / `--brand-scale-200` (8) radius |

**Per-size type scale (confirmed from Figma 235:5710 / 235:5712).** Everything
in the centre steps up from `m` to `l`: caption `caption`→`body`,
amount `h5`→`h4`, and the pill both grows (`caption`→`body`) **and** changes
weight (semibold→regular). (`.type-header-h4` is 28px on mobile / 32px at
≥768px per the responsive type layer — Figma's 32px is the desktop value.)

**Centre content position.** The content block is centred on the **arc's circle
centre** (`0.5 × svg width`, passed inline as `--ring-center-y`), not the
container's geometric centre — the SVG is a `w×w` square top-aligned in a
shorter `w×h` box, so centring on the box would sit the content ~11px (m) /
~15px (l) too high in the open gauge.

### Geometry / arc technique

Inline SVG, `viewBox 0 0 100 100`, `r=45`. Stroke width is computed **per size**
(`800 / renderWidth` viewBox units → a constant 8px rendered) — *not*
`vector-effect: non-scaling-stroke`, which renders inconsistently inside a
`<mask>` (see the bug note below). The gauge is drawn with **explicit
arc-path commands** (`M … A r r 0 largeArc 1 …`), not dashed circles: angles φ
are measured clockwise from 12 o'clock; the arc runs from **φ=225° (7:30,
bottom-left)** clockwise **270°** to **φ=135° (4:30, bottom-right)**, leaving a
90° gap centred at the bottom. Track path spans the full 270°; the fill path
spans `270° · value/100` from the same start. The fill `<foreignObject>` is
**omitted at `value === 0`** so the round line-cap doesn't render a stray dot.

> **Two bugs fixed here (both were wrong in earlier builds):**
> 1. The arc rendered as **two disconnected segments** (blue on the left, red
>    on the right, gray in the middle) with the gap at the wrong clock
>    position. Cause: `vector-effect: non-scaling-stroke` on the mask's stroked
>    circle behaves inconsistently in the mask pass, and `<circle>` +
>    `stroke-dasharray` has ambiguous draw direction/rotation. Fixed by
>    switching to explicit `<path>` arc commands (exact start/end angles, no
>    dash wrapping) and per-size stroke widths (no non-scaling-stroke).
> 2. Earlier still, the dasharray was `L C` (period `L + C` doesn't divide the
>    circle → the dash wrapped and repeated). Moot now that paths are used.

**Gradient recipe.** A CSS `conic-gradient` painted into the masked
`<foreignObject>`, all stops on real brand tokens:
`from -15deg, purple 5°, red 65°, red 135°, blue 225°, blue 315°, purple 355°`.
Colours are placed by φ so that, along the visible arc, **blue** sits at the
start (bottom-left → left), **purple** crowns the top, and **red** forms a wide
plateau down the end side (right → bottom-right) — matching Figma's
distribution (blue concentrated near the start, wide red plateau). The
`from -15deg` origin is an **empirical rotation compensation**: the conic, as
rendered inside the masked foreignObject, sits ~15° clockwise of its nominal
stop angles (measured, not guessed). Verified by rasterising the *exact*
masked config and colour-sampling clock positions: 7:30/9:00/10:30 = blue,
12:00 = purple, 1:30/3:00/4:30 = red, 6:00 = empty (gap) — a single continuous
arc. Restructuring the stops around φ also **removed the `#8c5b99` literal** the
previous build needed for the gradient's cyclic seam — every stop is now a
brand token.

### Accessibility

Root carries `role="progressbar"` with `aria-valuenow`/`min`/`max` and an
`aria-label` (defaults to `"{%} {caption}"`). The SVG is `aria-hidden`.

### Known Figma inconsistencies / decisions

- **Gradient uses brand primitives directly.** `Red/500`, `Purple/500` and
  `Blue/500` have no semantic/mapped gradient token. By explicit approval,
  referenced as `--brand-*` in a `conic-gradient` — a fixed data-viz gauge
  (like chart/logo colours), so it **does not dark-flip** (intentional). Every
  stop is now a real brand token (the earlier build's `#8c5b99` seam literal is
  gone — see the gradient-recipe note above).
- **Fill is % SPENT, not % left.** Confirmed against a real app screen — the
  arc fills toward the red end as spending grows (an 82%-spent budget shows a
  *large* colored arc, a 65%-spent one a smaller one). Callers pass
  `value={spentPercent}` and `percentageLabel={leftPercent + '%'}` separately;
  the caption/pill read the friendlier *left* amount while the arc reads spend.
- **Pill is now bespoke, not a `Badge` reuse.** Figma's spec has explicit
  vertical padding (`--brand-scale-100` top/bottom) where `Badge`'s API only
  supports `paddingBlock: 0`, and both words in the row ("of" and the amount)
  share one `.type-body-caption-semibold` weight — `Badge`'s `label` prop
  models a single string, not this two-part shape. Built as local markup in
  `ProgressRing.tsx`/`.css` instead. In **dark mode** the pill still shows
  **black text** on the slate background (`--mapped-text-on-color-heading`
  flips to black) — the same cross-cutting token-layer issue as `Badge` dark
  and `Toast` icons (see the session handoff), not specific to this pill.
- **Arc exported as flat SVG images in Figma.** The source arcs are baked
  images (`imgBase`/`imgBar`); recreated as live inline SVG so `value` and
  theme are dynamic rather than a static asset.
- **Two components from one frame.** `Progress bar indicator` and `Progress
  ring indicator` are separate Figma component sets under one doc frame; built
  as two components (`ProgressBar`, `ProgressRing`).

## Slider

**Figma node:** 280:5056 (`Slider`) · atoms `Slider handle` (234:5243) 

A single-thumb value slider: a rounded track, a fill from the start to the
value, and a thumb (white ring + blue core) that gains a 0.25 halo on
focus/drag. Sibling of `RangeSlider` (shares the thumb/track look).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | — | Current value |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | Scale + increment |
| `onChange` | `(value: number) => void` | — | Fires on drag, track-click, and keyboard |
| `isDisabled` | `boolean` | `false` | |
| `id` / `className` | `string` | — | |
| `ariaLabel` | `string` | — | Accessible name |
| `ariaValueText` | `string` | — | Human-readable value for AT |

### State → token mapping

| Element | Token | Px |
|---|---|---|
| Track | `--mapped-surface-subtle-default`, radius `--brand-scale-1800` | height 8 |
| Fill | `--mapped-surface-primary-default` | — |
| Thumb ring | `--mapped-surface-elevation-default` | 20 |
| Thumb core | `--mapped-surface-primary-default` | 12 |
| Halo (focus/drag) | `--mapped-surface-primary-default` @ `opacity: 0.25` | 28 |
| Disabled fill / core | `--mapped-surface-disabled-default` | — |

### Accessibility

Thumb is `role="slider"`, `tabIndex={0}`, with `aria-valuenow`/`min`/`max`,
`aria-valuetext`, and `aria-label`. Keyboard: ←/↓ decrement, →/↑ increment,
Home/End jump to bounds. Pointer drag on the thumb or click on the track.
`:focus-visible` shows the halo.

### Known Figma inconsistencies / decisions

- **Track height rounded 6px → 8px** (`--brand-scale-200`). Figma's 6px has no
  token (ramp jumps 4→8); by approval, rounded up to the 8px step (also matches
  `ProgressBar`).
- **Thumb reproduced from exported ellipse SVGs.** Figma bakes the thumb as
  layered `<circle>` images — white r10 (ring), blue r6 (core), blue r14 @0.25
  (halo). Rebuilt as live CSS so it tracks `value` and theme.
- **Thumb ring uses `--mapped-surface-elevation-default`, not Figma's token.**
  Figma binds the ring to `surface/primary/default-subtle` (white), which in
  our system dark-flips to **black** and hides the ring in dark mode. By
  approval, switched to `--mapped-surface-elevation-default` (white → #262626)
  so the knob stays visible as a raised surface in both themes — a deliberate
  deviation from the source token for dark-mode UX.

## Range Slider

**Figma node:** 234:5319 (`Range slider`)

A two-thumb min/max range: rounded track, a fill **between** the thumbs, a
tooltip on the active thumb, and two `Field` inputs below that are two-way
synced with the thumbs. Thumbs cannot cross.

### Nested components

| Instance | Role |
|---|---|
| `Field` ×2 | Min / max entry — reused; two-way synced (drag ↔ type) |

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `minValue` / `maxValue` | `number` | — | Current lower / upper values |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | Scale + increment |
| `onChange` | `(minValue, maxValue) => void` | — | Fires on any thumb/field change |
| `formatValue` | `(value) => string` | `String` | Formats tooltip + Field text (e.g. `` v => `RM ${v}` ``) |
| `showTooltip` | `boolean` | `true` | Tooltip on the active thumb |
| `showInputs` | `boolean` | `true` | The Field row |
| `isDisabled` | `boolean` | `false` | |
| `id` / `className` | `string` | — | |
| `ariaLabelMin` / `ariaLabelMax` | `string` | `'Minimum'` / `'Maximum'` | Per-thumb names |

### State → token mapping

Track / fill / thumb / halo tokens are identical to `Slider`. Extras:

| Element | Token |
|---|---|
| Tooltip bg / pointer | `--mapped-surface-primary-default` |
| Tooltip text | `--mapped-text-on-color-heading` + `.type-body-sm-semibold` |
| Tooltip radius | `--brand-scale-200` (8) |
| Inputs | `Field` (unmodified); width via `.range-slider__input .field { width: 100% }` |

### Accessibility

Each thumb is `role="slider"` with `aria-valuenow`/`valuetext`/`label` and
**constrained** `aria-valuemin`/`max` (the min thumb's max is the current max
value and vice-versa, communicating the no-cross rule). Keyboard as `Slider`;
track-click moves the nearest thumb. Tooltip is `role="status"`.

### Known Figma inconsistencies / decisions

- **Same track-height (6→8px) and thumb-ring dark-flip notes as `Slider`.**
- **Tooltip pointer** recreated as a CSS triangle (Figma bakes it as a rect
  image); sized from `--brand-scale-100`.
- **Field inputs are real two-way controls** (per decision): typing parses the
  numeric part (`RM 50` → 50), clamps against the other thumb, and moves the
  thumb; dragging updates the field. Verified live (type `RM 90` on the min
  field with max at 70 → clamps to 70).
- **Two components, not one** (per decision): `Slider` (single) and
  `RangeSlider` (dual + inputs) are separate, matching Figma's two symbols.

## Toast

**Figma node:** 110:4032 (`❖ System message`, desktop) — Figma also calls it
Snackbar / System message; named `Toast` here per request.

A full-width coloured banner alerting the user, in **6 appearances**
(information / success / warning / error / discovery / ai). Desktop layout:
leading icon · [title + description-slot + action row] · dismiss ✕. The
description and actions are app-provided slots (Figma marks the paragraph
"replace with your own slot component"). `ToastMobile` is the compact sibling.

### Nested components

| Instance | Role |
|---|---|
| `Icon` | Leading (auto per appearance) + close ✕ |
| `Link` (`appearance="inverse"`) | Action row — app-composed via the `actions` slot |

### Props (shared with `ToastMobile`)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | 6 values | `'information'` | Drives background + auto icon |
| `title` | `string` | — | `.type-body-m-semibold` |
| `children` | `React.ReactNode` | — | Description slot (`.type-body-sm`) |
| `actions` | `React.ReactNode` | — | Action row (app composes inverse `Link`s) |
| `onDismiss` | `() => void` | — | Shows the close ✕; fires on click |
| `icon` | `React.ReactNode` | — | Overrides the auto leading icon |
| `showIcon` | `boolean` | `true` | |
| `role` | `'status' \| 'alert'` | `'status'` | Sets `aria-live` polite / assertive |
| `id` / `className` | `string` | — | |

### Appearance → background token

| Appearance | Background |
|---|---|
| information | `--mapped-surface-primary-default` |
| success | `--mapped-surface-success-default` |
| warning | `--mapped-surface-warning-default` |
| error | `--mapped-surface-error-default` |
| discovery | `--mapped-surface-interactive-default` |
| **ai** | `linear-gradient(90deg, --brand-blue-500, --brand-violet-500)` |

Auto icons: `info` / `check_circle` / `warning` / `error` / `help_outline` /
`icon_aiinsights`. The filled-circle glyphs in white produce the "badge" look
with no separate component.

### Foreground / geometry

| Element | Token |
|---|---|
| Title / description | `--mapped-text-primary-on-color` (white, both themes) |
| Icons (leading + close) | `--mapped-icon-primary-on-color` |
| Radius | `--brand-scale-200` (8) |
| Padding / row gap | `--brand-scale-400` (16) |
| Body gap / actions gap | `--brand-scale-200` (8) / `--brand-scale-300` (12) |
| Icon size | `l` (24px) |

Container `color` is set to the on-color **text** token so the title/description
inherit white; icon spans override with the on-color **icon** token.

### Accessibility

`role="status"` (polite) by default, `role="alert"` (assertive) for
error/warning severities. Close is a real `<button aria-label="Dismiss">` with
a `:focus-visible` outline in the on-color text colour.

### Known Figma inconsistencies / decisions

- **`ai` gradient uses brand primitives** (`--brand-blue-500 → --brand-violet-500`),
  no mapped gradient token — the same approved treatment as `ProgressRing`;
  fixed, does not dark-flip.
- **RESOLVED — icons no longer go black in dark mode.** `--mapped-icon-primary-on-color`
  was bound to `Foundations.black` in `Mapped/Dark.json` (Figma's own dark
  export), while the paired **text** on-color token correctly stayed white —
  so in dark mode the title was white but icons were black on the coloured
  banner. Fixed at the token layer (dark-mode repair, see CLAUDE.md's known
  items): **most of** the `on-color` family (`text.*.on-color`,
  `icon.*.on-color`, `border.on-color`, `Blanket.on-color`) now uses each
  token's own light value in dark, since this content sits on a *fixed* colored
  surface that doesn't invert with the app theme. No component change needed —
  `Toast` already referenced the correct token names.
  **⚠️ CORRECTION (2026-08-07): that repair was PARTIAL.** This entry
  previously said "the whole `on-color` family". Three members still flip to
  near-black in dark — `--mapped-text-on-color-caption`, `-label` and
  `-placeholder` (`neutral-100` `#e7eaed` → `neutral-950` `#0d0f11`). The
  tokens `Toast` itself uses are among the correct ones, so `Toast` is
  unaffected; `LineChart`'s `onColor` chrome is not. Logged as **E-3**.
- **Two components** (per decision): `Toast` (desktop) + `ToastMobile`
  (compact), matching Figma's two symbols, rather than one component with a
  `layout` prop.
- **Actions/description are slots**, not built-in instances — Figma bakes in
  `Link`/`Button` instances, but the paragraph is explicitly a replaceable
  slot, so both are exposed as app-composed `ReactNode`s (reusing the real
  `Link`/`Button` components).
- **`#0caaff` — DECIDED: no new token. Figma changes, the design system does
  not.** Building the MVP's Homepage (Flow 1) found a detached copy of
  `❖ System message` painted with a two-stop gradient whose second stop is
  `#0caaff`. That value has **no backing token anywhere in the ramp**; the
  nearest step is `--brand-teal-500` (`#00ace5`).
  **Decision (Teku): teal 500 stays and Figma gets updated to match** — the
  library does not gain a token for a one-off value.
  ⚠️ **The Figma edit is Teku's and has NOT happened yet.** Until it does,
  Figma and the code disagree by design. Recorded here so that divergence is
  not later mistaken for an oversight and "corrected" back into a literal.

## Toast Mobile

**Figma node:** 110:4631 (`❖ System message`, mobile)

The compact sibling of `Toast`: same 6 appearances and the same
appearance/background/icon maps (imported from `Toast`), in a single-row
layout. Leading icon · [title + description-slot] · trailing action · optional
close.

### Nested components

| Instance | Role |
|---|---|
| `Icon` | Leading (auto per appearance, 20px) + close ✕ |
| `Button` (`appearance="inverse"` `variant="tertiary"`) | Trailing action — app-composed via `actions` |

### Props

Identical to `Toast` (`ToastMobileProps`). The `actions` slot takes an
inverse-tertiary `Button` rather than `Link`s.

### Differences from `Toast`

| | `Toast` | `ToastMobile` |
|---|---|---|
| Padding | `--brand-scale-400` (16) | `--brand-scale-200` (8) |
| Icon size | `l` (24) | `m` (20) |
| Layout | icon · column(title/desc/actions) · close | row: [icon · title/desc] · action · close |
| Main gap | `--brand-scale-400` | `--brand-scale-100` (icon↔text 4) / `--brand-scale-400` (text↔action) |

Foreground tokens, appearance backgrounds, auto icons, a11y (`role`/`aria-live`,
dismiss button), and the dark-mode icon caveat are all identical to `Toast`.

---

## Navigation

**Figma frame:** `80:184` (Components) — `Bottom navigation / mobile / section` (`80:3356`), `Side navigation / desktop` (`84:2568`)
**Parts reference frame:** `80:2879` — `nav/button/mobile`, `Navbar/mobile`, `Navbar/home indicator`,
`navigation/sidebar/tab`, `nav/<section header>`, profile row. These are not standalone Monarch
components (per source instruction) — built as internal markup inside `Navigation/`, not as
separate `src/components/` entries.

Two components: `BottomNavigation` (mobile tab bar) and `SideNavigation` (desktop sidebar).

### Nested components

| Instance | Role |
|---|---|
| `Icon` | All nav item icons (home/transfer/finance/more/settings/help/search), 24px (`l`) or 20px (`m`, search); `chevron_left`/`chevron_right` (`s`, 16px) on the expand/collapse trigger |
| `Logo` | Brand mark in `SideNavigation`, new `xs` size added to support this compact use |
| `Field` | Search box in `SideNavigation` (`isCompact` collapses to icon-only), stretched to `width: 100%` via a scoped override (Field's own default is a fixed 240px demo width) |
| `Divider` | Horizontal rule above the profile row in `SideNavigation` |
| `Avatar` | Profile photo in `SideNavigation` (`size="l"`) |

### Expand/collapse trigger — deliberate addition beyond source

Figma's `Sidebar` component has no toggle affordance — `isCompact` is purely a
parent-controlled variant. Per explicit direction, a trigger button was added:
a 32px circular `IconButton`-style control (`side-nav__toggle`), half-overlapping
the panel's right border (`right: calc(--brand-scale-800 / -2)`) so it stays
reachable in both expanded and compact states, showing `chevron_left` (collapse)
/ `chevron_right` (expand). Controlled via a new `onToggleCompact?: () => void`
prop — `isCompact` itself stays parent-controlled (same pattern as `Tabs`'
`selectedId`/`onChange`). Hover/pressed/focus states were designed for it
(`--mapped-surface-subtle-hover/-pressed`, standard focus ring) since it's a
new control, not an inferred state on an existing one.

### BottomNavigation props

| Prop | Type | Notes |
|---|---|---|
| `items` | `BottomNavItem[]` | `{ id, icon, label, isSelected? }` |
| `onSelect` | `(id: string) => void` | |
| `className` | `string` | |

### BottomNavigation — variant → token mapping

| Element / state | Token |
|---|---|
| Bar background | `--mapped-surface-page` |
| Bar shadow | `--shadow-medium` (Figma `Dropshadow_medium`) |
| Bar radius | `--brand-scale-800` (32px) |
| Item tap target | `--brand-scale-1300` (64px) — Figma specifies 62px, off the ramp (56/64); rounded to nearest |
| Item icon/label, default | `--mapped-icon-subtle-default` / `--mapped-text-subtle-default`, `.type-body-caption` |
| Item icon/label, selected | `--mapped-icon-primary-default` / `--mapped-text-primary-default`, `.type-body-caption-semibold` |
| Focus ring | `--mapped-border-primary-default` outline, `--brand-scale-50` width/offset (Tab.css pattern) |
| Home indicator | `--mapped-border-subtlest-default`, radius `--brand-scale-1800` (full pill); 134×5px kept literal (fixed decorative bar) |
| Overlay behind the pill | None — Figma's page-color gradient fade is omitted for this showcase; the wrapper has no background, page bg shows through |

### SideNavigation props

| Prop | Type | Notes |
|---|---|---|
| `isCompact` | `boolean` | Default `false` |
| `items` | `SideNavItem[]` | `{ id, icon, label, isSelected?, sectionTitle? }` — top nav group |
| `utilityItems` | `SideNavItem[]` | Bottom nav group (Settings, Help Center) |
| `profileName` / `profileEmail` / `profileAvatarSrc` | `string` | Profile row; row omitted entirely if `profileName` unset |
| `searchValue` / `onSearchChange` | `string` / `(value: string) => void` | Passed through to `Field` |
| `onSelect` | `(id: string) => void` | |
| `onToggleCompact` | `() => void` | Renders the expand/collapse trigger when provided; omitted → no trigger rendered. Not in the Figma source — see below |
| `className` | `string` | |

### SideNavigation — variant → token mapping

| Element / state | Token |
|---|---|
| Container | `--mapped-surface-page`, `--shadow-subtle` (Figma `Dropshadow_subtle`), padding `--brand-scale-800`/`--brand-scale-400`; width 255px / compact 76px kept literal (fixed container dimension, same precedent as `Toast`'s 624px) |
| Wordmark "Monarch" | `.type-body-lg-medium` (Poppins, standing in for Figma's Satoshi), color `--mapped-icon-primary-default` (matches source, an icon token on text — preserved faithfully) |
| Tab icon/label, default | `--mapped-icon-subtlest-subtlest` / `--mapped-text-subtlest-subtlest`, `.type-body-m` |
| Tab icon/label, selected | `--mapped-icon-primary-default` / `--mapped-text-primary-default` |
| Focus ring | Same pattern as `BottomNavigation` |
| `sectionTitle` header | Border-top `--mapped-border-subtlest-default`, `.type-body-caption-semibold`; bottom padding literal `6px` (Figma `space.075`, off-ramp 4/8 — needs a Figma Variables fix). Not exercised in the source instance; available for future use |
| Profile greeting / email | `.type-header-h6` / `.type-body-caption`, `--mapped-text-default-default` / `--mapped-text-subtle-default` |

### Known Figma inconsistencies

- **62px bottom-nav tap target**: off the `--brand-scale` ramp (56/64). Rounded to `--brand-scale-1300` (64px).
- **`space.075` (6px) section-header padding**: no matching token; kept as a literal with a FAIL-LOUD comment in `SideNavigation.css`.
- **Selected-state icon asset swap**: Figma's codegen exports a distinct SVG asset URL per selected/default icon state (e.g. bottom-nav Home). Treated as a per-instance baked fill-color export rather than a true shape change — implemented as one `Icon`, recolored via `--mapped-icon-*`, consistent with every other selected-state component in this system.
- **Redundant `label1` variant axis**: Figma's `navigation/sidebar/tab` component exposes `isCompact` and `label1` as separate variant properties, but only two combinations exist in the source (`Compact=False,Label=False` and `Compact=True,Label=True`) — the two always move together. Collapsed to a single `isCompact` prop.
- **Divider rendered as an image in Figma**: the horizontal rule above the profile row is exported as a raster/vector image asset rather than a stroke. Implemented with the existing `Divider` component instead.
- **Fixed demo-frame dimensions**: Figma's `Sidebar` frame is 900px tall and the bottom-nav section is 375px wide — both are mockup-viewport artifacts. Built to fill the parent (`height`/`width: 100%`) instead.
- **Logo mark aspect ratio**: the brand mark's native SVG is 24×14 (wide, not square), but `Logo` sizes by height. The `xs` tier is `14px` (off-ramp — 12/16 — but derived directly from the SVG's fixed 24:14 ratio to reproduce Figma's 24px-wide mark, not a guess).
- **Gradient overlay omitted**: Figma's `navbar/mobile/section` wraps the pill in a page-color-to-transparent gradient fade (`from foundations/white` in source). By explicit direction this is left out of `BottomNavigation` for now — no background on `.bottom-nav`, just the pill and home indicator.
- **`Field`'s fixed demo width**: `Field` defaults to `width: 240px` for standalone use. Overridden to `100%` inside the sidebar via a scoped selector (`.side-nav__brand .field:not(.field--compact)`), the same pattern already used in `RangeSlider.css`, so the search box sits flush with the panel edges as Figma shows.

---

## Header

**Figma frame:** `128:17` (Components) — `Header/bg` (`219:2813`), `Header/default` (`178:6142`)
**Parts reference frame:** `128:3341` — confirms `Background` (the swappable image) and `Message` (the light/dark greeting text block) as the two parts making up `Header/bg`. Not standalone Monarch components — built as internal markup inside `Header/`.

Two components: `HeaderBg` (mobile screen header, background-image slot) and `HeaderDefault`
(header used across function-flow screens).

### Nested components

| Instance | Role |
|---|---|
| `Icon` | `notifications` (24px, `l`) in `HeaderBg`; `search` (20px, `m`) in `HeaderBg`'s search field; `arrow_back` (20px, `m`) in `HeaderDefault` |
| `StatusBar` | Rendered at the top of every `HeaderBg` variant (`mode="Dark"`) — see its own entry below |
| `Avatar` | Profile photo in `HeaderBg` (`size="m"`, 32px) |
| `Field` | Search box in `HeaderBg` (`default` variant only), stretched to `width: 100%` via the same scoped override used in `Navigation`/`SideNavigation` |
| `Badge` | Notification dot (`type="dot" appearance="important"`) in `HeaderBg` |
| `ProgressStepper` | Reused directly for `HeaderDefault`'s stepper variants — Figma's 7-segment bar is a byte-for-byte match to the already-built component (same sizing, gap, and active/inactive tokens); not reimplemented |
| `Link` | "Action" trailing link in `HeaderDefault` (`appearance="default" size="m"`) |

### HeaderBg props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'default' \| 'noSearchBar' \| 'compact'` | Default `'default'` |
| `background` | `ReactNode` | **Required** — swappable slot (image, gradient, video, etc.), per source direction |
| `greeting` | `string` | Shown in `default`/`noSearchBar` |
| `title` | `string` | Shown in `compact` |
| `avatarSrc` / `avatarName` | `string` | Passed through to `Avatar` |
| `statusBarTime` | `string` | Default `'09:30'` — passed through to `StatusBar` |
| `searchValue` / `onSearchChange` | `string` / `(value: string) => void` | `default` variant only |
| `hasNotification` | `boolean` | Default `true` — shows the badge dot |
| `onNotificationsClick` | `() => void` | |
| `className` | `string` | |

### HeaderBg — variant → token mapping

| Element | Token |
|---|---|
| Status bar | Reused `StatusBar` (`mode="Dark"`) — own padding (`--brand-scale-200`/`--brand-scale-400`), not double-padded by `HeaderBg` |
| Background | `ReactNode` slot, `object-fit: cover`, absolutely positioned behind content |
| Compact scrim | `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))` at 0.8 opacity — a fixed-black legibility scrim over an arbitrary photo, not a design token |
| Greeting / title / notify icon | `--alias-foundations-white` — deliberately static (see inconsistency note below), `.type-header-h6` (greeting) / `.type-body-m-semibold` (compact title) |
| Notification badge | Reused `Badge` |
| Search field | Reused `Field` |
| Content row padding | `0 var(--brand-scale-400)` per row (greeting/title row, search row) — each row owns its own horizontal inset, matching Figma's per-row model (only `StatusBar` has its own vertical padding) |
| Content bottom padding | `--brand-scale-250` (10px) on `.header-bg__content` — see inconsistency note below |
| Focus ring | `--mapped-border-primary-default` outline, `--brand-scale-50` (Tab.css pattern) |

### HeaderDefault props

| Prop | Type | Notes |
|---|---|---|
| `title` / `subtitle` | `string` | |
| `hasSubtitle` | `boolean` | Default `true` |
| `isProgressStepper` | `boolean` | Default `false`. Figma never combines this with `actionLabel` |
| `currentStep` / `totalSteps` | `number` | Passed through to `ProgressStepper` |
| `stepperAriaLabel` | `string` | Also passed through to `ProgressStepper` (as its `ariaLabel`), alongside `currentStep`/`totalSteps`. Omit to use its `Step X of Y` fallback (audit F3). |
| `actionLabel` | `string` | Renders the trailing `Link` when set |
| `onAction` | `() => void` | |
| `onBack` | `() => void` | |
| `className` | `string` | |

### HeaderDefault — variant → token mapping

| Element / state | Token |
|---|---|
| Back icon | `--mapped-icon-default-default` |
| Title | `--mapped-text-default-default` (Accent02 gap — see below), `.type-body-m-semibold` |
| Subtitle, no stepper | `--mapped-text-subtlest-subtlest`, `.type-body-caption` (regular) |
| Subtitle, with stepper | Same color, `.type-body-caption-semibold` — Figma genuinely weights this case differently from the no-stepper subtitle; preserved faithfully |
| Stepper | Reused `ProgressStepper` |
| Action | Reused `Link` |
| Focus ring | Same pattern as `HeaderBg` |

### Known Figma inconsistencies

- **`--alias-foundations-white` on `HeaderBg` content**: this is the one deliberate non-`--mapped-*` color in the component. The header's foreground sits on an arbitrary user-supplied photo, not an app surface — `--mapped-*-on-color` tokens flip white↔black with the *app's own* theme (confirmed via `--mapped-text-on-color-heading` and `--mapped-icon-primary-on-color`, both of which invert in dark mode), which would make the text/icon vanish against a photo in dark mode. The static primitive is correct here, same reasoning as `Badge`'s `dark` appearance.
- **`Accent02` (`#2d3436`) token-source gap**: `HeaderDefault`'s title color is a raw, unnamed Figma variable with no equivalent anywhere in brand/alias/mapped (nearest is `--mapped-text-default-default` at `#363c43` — a different, if very close, color). Mapped to `--mapped-text-default-default` per approval.
- **`Link` weight mismatch**: Figma's "Action" link renders SemiBold; the built `Link` component's caption class is Regular-only (no weight variant exposed). Used `Link` as-is rather than extending it for one caller.
- **Badge dot radius**: Figma's notification dot in this component uses an 8px corner radius (`border-radius/md`) on a 12px box, not a true circle. Kept the existing `Badge` component's circular dot (`border-radius: 50%`) rather than deviate from its already-established, documented shape.
- **Bottom padding not in the raw codegen**: Figma's `Header/bg` frame has a fixed total height (173px `default`, 112px `noSearchBar`/`compact`) that's taller than its content's natural hug height, leaving real breathing room below the last row — but that margin isn't expressed as an explicit padding class anywhere in the component's own generated code (no `pb-*` on the outer container). Confirmed by back-solving frame height minus `StatusBar` + row heights across all 3 variants, which resolves cleanly to 10px in two of three (the third, `default`, is consistent within rounding of the search field's own box-model). Added as explicit `padding-bottom: --brand-scale-250` on `.header-bg__content`.

---

## StatusBar

**Figma node:** `125:294`

A standalone, reusable fake-OS-chrome status bar (time + signal/wifi/battery icons). Composed into
`HeaderBg` (always `mode="Dark"`, since that header always sits on an image), and usable standalone
wherever a plain-surface header needs one (`mode="Light"`).

### Props

| Prop | Type | Notes |
|---|---|---|
| `mode` | `'Light' \| 'Dark'` | Default `'Light'`. Fixed per-mode OS-chrome styling — **not** tied to the app's own light/dark theme (see below) |
| `time` | `string` | Default `'9:41'` |
| `className` | `string` | |

### Variant → token mapping

| Element | Token |
|---|---|
| Padding | `--brand-scale-200` / `--brand-scale-400` (8px/16px) |
| Icon gap | `--brand-scale-100` (4px) — Figma specifies 5px, off the ramp (4/8); rounded to the nearer step per approval |
| `mode="Light"` color | `--alias-neutral-800` (static) |
| `mode="Dark"` color | `--alias-foundations-white` (static) |
| Icons | `signal_cellular_alt`, `wifi` (both newly added to `Icon`'s registry, from the same `@material-design-icons/svg/round` package as every other icon), `icon_battery_horizontal` (existing custom icon — already correctly horizontal; Figma's own asset needed a 90°-rotate hack because its source SVG was portrait-oriented, ours doesn't) |

### Known Figma inconsistencies

- **Both modes use static, non-flipping colors** (`--alias-*`, not `--mapped-*`). This mirrors a real OS status-bar API (e.g. iOS's light-content/dark-content style) — the mode is chosen per the surface behind it, not per the app's semantic theme. Flagged per the alias/mapped dark-flip rule, but this is a deliberate exception: unlike an interactive-state color, there is no "theme" for fake OS chrome to track.
- **5px icon gap**: off the `--brand-scale` ramp (4/8px). Rounded to `--brand-scale-100` (4px) per approval.

---

## Item

**Figma frame:** `136:2764` (Parts) — `Item/list` (`153:1841`), `item/summary` (`237:665`), `list/chart legend` (`242:363` and `261:413`)

Three components covering list rows that appear across the UI in different contexts — `ListItem`,
`SummaryItem`, `ChartLegendItem`. `ChartLegendItem` merges what Figma documents as two separate
instances ("Chart legend item" and "Recent contributions item") of the **same underlying component**
(identical Figma layer name and description: "Use for donut chart legend, drop down function
available") into one component with a `variant` prop, rather than building it twice.

### Nested components

| Instance | Role |
|---|---|
| `Icon` | `receipt_long` (new), `icon_chevron_expand_more`, `question_mark` (new) — all reused, none reimplemented |
| `TrendIndicator` | `ListItem`'s `crypto` trend group, from Phase 5.4. **`ListItem` no longer renders `icon_triangle_up` itself** — `TrendIndicator` owns the glyph, its direction and its colour |
| `IconObject` | Leading badge in `SummaryItem` (`color="slate" size="l"`) and `ChartLegendItem` (`color={iconColor}`, default `"gray"`, `size="xl"`) |

`ListItem`'s leading visual (company logo / `Avatar` photo / crypto mark, depending on `type`) is a
`ReactNode` slot — Figma's specific demo assets (`logo/aeon`, `logo/bitcoin`, a named avatar photo)
are placeholder content per instance, not fixed requirements.

### ListItem — 3 variants via `type`

| Prop | Type | Notes |
|---|---|---|
| `type` | `'default' \| 'profile' \| 'crypto'` | Default `'default'` |
| `leading` | `ReactNode` | Slot — logo/Avatar/crypto mark |
| `title` | `string` | Required |
| `titleInfo` | `string` | Subtitle text |
| `hasTitleInfo` | `boolean` | `profile` only — toggles the subtitle line |
| `amount` | `string` | `default`/`crypto` only |
| `amountInfo` | `string` | `default`: caption under amount. `crypto`: trend caption |
| `hasReceiptIcon` | `boolean` | `default` only |
| `hasChevron` | `boolean` | `profile` only |
| `trendDirection` | `'up' \| 'down' \| 'flat'` | `crypto` only — default `'up'`. Added Phase 5.4; see `TrendIndicator` |
| `miniChart` | `ReactNode` | `crypto` only — sparkline slot |
| `onClick` | `() => void` | Renders as `<button>` when set, else a plain `<div>` |
| `className` | `string` | |

### ListItem — variant → token mapping

| Element | Token |
|---|---|
| Leading | 40px circle, `overflow: hidden` (slot content) |
| Title | `--mapped-text-default-default`, `.type-body-m-semibold` (all types) |
| Subtitle | `--mapped-text-subtle-default`, `.type-body-caption` (default/crypto) or `.type-body-sm` (profile) |
| Amount | `--mapped-text-default-default`, `.type-body-m-semibold` |
| Amount info | `--mapped-text-subtle-default`, `.type-body-caption` |
| Receipt icon | `--mapped-icon-default-default` |
| Trend group (`crypto`) | Composes the real `TrendIndicator` — see its own entry. Rendered **only when `amountInfo` is present**. |
| Chevron (profile) | `--mapped-icon-subtle-default` |
| Focus ring | `--mapped-border-primary-default` outline, `--brand-scale-50` (Tab.css pattern) |

### SummaryItem

| Prop | Type | Notes |
|---|---|---|
| `icon` | `ReactNode` | Default `<Icon name="question_mark" size="m" />` |
| `iconColor` | `IconObjectColor` | Default `'slate'`. **Added v1.3.0** — see the reference-defect note below |
| `iconSize` | `IconObjectSize` | Default `'l'`. **Added v1.3.0** |
| `shape` | `IconObjectShape` | Default `'circle'`. **Added v1.3.0** — was `IconObject`'s implicit default, never exposed |
| `iconAriaLabel` | `string` | Default `undefined`. **Added v1.3.0** — badge stays decorative and unnamed when omitted |
| `amount` | `string` | Required |
| `type` | `string` | Required — label under the amount |
| `className` | `string` | |

Types are imported from `IconObject`'s own barrel, not redeclared locally, so
the ramps cannot drift apart.

**The reference defect, second copy.** `SummaryItem.tsx:22` hard-coded
`<IconObject color="slate" size="l">`, character-identical to
`CardBalance.tsx:19` — logged as **G4** to that component's **G3**, and the
same class as `ChartLegendItem`'s hardcoded `color="gray"` fixed in Phase 5.4.
Demand: Flow 10's `card/monthly budget` needs per-category tints on its
`item/summary` rows.

**No-change proof.** With all four omitted the badge renders
`mn-icon-object--slate mn-icon-object--circle mn-icon-object--l`, background
`rgb(158,170,185)`, **no `role`, no `aria-label`** — exactly the pre-change
output. Note `iconAriaLabel` closes a *usability* gap, not an axe violation:
the badge is a `<div>` with no role, so it was correctly decorative by default
and jest-axe passed both before and after.

| Element | Token |
|---|---|
| Icon badge | Reused `IconObject` (defaults `color="slate" size="l" shape="circle"`, all now overridable) |
| Amount | `--mapped-text-default-default` (Accent02 gap — see below), `.type-body-m-semibold` |
| Type label | `--mapped-text-subtle-default`, `.type-body-caption` |

### ChartLegendItem — both Figma flavors via `variant`

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'legend' \| 'contribution'` | Default `'legend'` |
| `icon` | `ReactNode` | Default `<Icon name="question_mark" size="m" />` |
| `iconColor` | `IconObjectColor` | Default `'gray'`. **Added Phase 5.4** — the badge was hardcoded `color="gray"`, which is why this component could never actually be a chart legend despite its name: it had no way to show which series a row belonged to. Non-breaking |
| `hasIcon` | `boolean` | `contribution` only — `legend` always shows the icon |
| `title` | `string` | Required |
| `subtitle` | `string` | |
| `hasSubtitle` | `boolean` | Default `true` |
| `amount` | `string` | Required |
| `hasChevron` | `boolean` | `legend` only |
| `onClick` | `() => void` | Renders as `<button>` when set |
| `className` | `string` | |

| Element / variant | Token |
|---|---|
| Icon badge | Reused `IconObject` (`color={iconColor}` — default `"gray"`, `size="xl"`) |
| Title, `legend` | `--mapped-text-default-default`, `.type-body-m-semibold` |
| Title, `contribution` | `--mapped-text-subtle-default`, `.type-body-m-medium` |
| Subtitle | `--mapped-text-subtle-default`, `.type-body-sm` |
| Amount, `legend` | `--mapped-text-default-default`, `.type-body-m-semibold` |
| Amount, `contribution` | `--mapped-text-default-default`, `.type-body-m-medium` |
| Chevron (`legend` only) | `--mapped-icon-subtle-default` |
| Focus ring | Same pattern as `ListItem` |

### Known Figma inconsistencies

- **Same component, two documented instances**: `list/chart legend` (`242:363`, `261:413`) is one Figma component with identical name/description, shown twice with different property combinations. Modeled as one `ChartLegendItem` with a `variant` prop rather than two separate components.
- **`Accent02` (`#2d3436`) token-source gap** (`SummaryItem` amount): same raw, unmapped Figma variable already flagged on `HeaderDefault`. Mapped to `--mapped-text-default-default` per the same approval, not re-asked.
- **Crypto sparkline positioning**: Figma absolutely-positions the mini chart at `left: calc(50%+6px)`, tied to the item's fixed 300px width. Since `ListItem` is fluid-width, `miniChart` is a normal in-flow flex slot between the text and amount instead — same visual result, doesn't break at other widths.
- **Crypto leading-mark radius**: Figma specifies `rounded-[32px]` (not full round) on a 40px box — visually indistinguishable from a true circle since 32px > half the box size. Unified to `--brand-scale-1800` (full round) for consistency with the `default`/`profile` leading marks, same token, cleaner intent.
- **New icons added**: `receipt_long`, `question_mark` — same mechanical addition (already available in `@material-design-icons/svg/round`) as `wifi`/`signal_cellular_alt` earlier. `Icon` also gained an `xs` (12px) size, mapping to `ElementWrapper`'s existing `xs` token — needed for the crypto trend triangle, which Figma specifies at 12px (below the previous smallest `s`=16px).
- **Phase 5.4 — the crypto trend was direction-blind.** `ListItem` hardcoded `<Icon name="icon_triangle_up">` inside a `.mn-list-item__trend` wrapper pinned to `--mapped-icon-success-default`, so a decline rendered as a green rise. Verified in the MVP's live DOM: Bitcoin (+10.2%) and Ethereum (−2.49%) both computed `rgb(56,184,96)`, up. Figma's own `Homepage_Crypto` draws `icon_triangle down` for Ethereum, so the design used a state the component could not express. Replaced by the real `TrendIndicator`; `.mn-list-item__trend` deleted.
- **The label is now status-coloured, which diverges from the base Figma component.** `Item/list` Type=Crypto gives its `Amount info` text `text/subtle/default` (gray), while `Homepage_Crypto` overrides that same node (`…;708:3624;153:1851`) to `text/error/default` for the decline and `text/success/default` for every rise. Adopted the screen's treatment, by decision — the base component's gray default is what the screen is correcting, and a trend whose number is gray is the weaker design.

---

## Card

**Figma frame:** `146:1244` (Components) — `card/Smart insights` (`147:1300`), `card/Action` (`159:1244`), `card/Balance` (`222:219`), `card/data display` (`224:340`), `card/monthly budget` (`237:736`, 2 states), `card/goals` (`253:184`), `card/features and education` (`324:336`, 5 variants)
**Parts reference frame:** `235:845` — confirms the `Img` background slot (`img/goal01`/`img/goal02`) used by `CardGoals` is swappable, not fixed content.
**Reference:** `146:1275` ("Ready-made examples") — showed `CardSmartInsights`' title color, icon, and link label all vary per instance (cyan/black/red across the 3 examples shown), which is why `titleColor` is an open prop rather than a fixed token.

Seven card components. Three of them compose already-built components directly rather than
reimplementing their markup: `CardMonthlyBudget` uses `ProgressRing` (the Figma source for
`ProgressRing`'s own build cites the exact same node, `235:5710`) and `SummaryItem` (×2); `CardGoals`
uses `ProgressBar`; `CardBalance` uses `IconObject`.

### CardSmartInsights

| Prop | Type | Notes |
|---|---|---|
| `icon` | `ReactNode` | Leading icon slot |
| `title` | `string` | Required |
| `titleColor` | `string` | CSS color override — varies per instance in Figma's own examples (default `--mapped-text-default-default`) |
| `description` | `string` | Required |
| `linkLabel` | `string` | Default `'View'` |
| `onLinkClick` | `() => void` | |
| `className` | `string` | |

| Element | Token |
|---|---|
| Container | `--mapped-surface-elevation-default`, `--shadow-subtlest`, radius `--brand-scale-200` |
| Padding | `--brand-scale-200` (8px) — Figma specifies 10px, off-ramp (8/12), rounded per approval |
| Title | `.type-body-m-semibold`, color = `titleColor` prop or `--mapped-text-default-default` |
| Description | `--mapped-text-subtle-default`, `.type-body-caption` |
| Link | `--mapped-text-subtle-default`, `.type-body-sm`, `chevron_right` icon |

### CardAction

| Prop | Type | Notes |
|---|---|---|
| `icon` | `ReactNode` | Required — inside the leading badge |
| `title` / `description` | `string` | Required |
| `onClick` | `() => void` | Renders as `<button>` when set |
| `className` | `string` | |

| Element | Token |
|---|---|
| Container | Border `--mapped-border-subtlest-default`, radius `--brand-scale-200`, padding `--brand-scale-400` (16px, on-ramp) |
| Icon badge | `--mapped-icon-primary-default` bg, `--mapped-text-primary-on-color` icon — built inline (doesn't match any `IconObject` color option; Figma models it as bespoke markup, not a component instance) |
| Title | `--mapped-text-default-default`, `.type-body-m-semibold` |
| Description | `--mapped-text-subtle-default`, `.type-body-caption` |

### CardBalance

| Prop | Type | Notes |
|---|---|---|
| `icon` | `ReactNode` | Inside the reused `IconObject` |
| `iconColor` | `IconObjectColor` | Default `'slate'`. **Added v1.3.0** — closes G3, the Flow 7 STOP-class finding |
| `iconSize` | `IconObjectSize` | Default `'l'`. **Added v1.3.0** |
| `shape` | `IconObjectShape` | Default `'circle'`. **Added v1.3.0** — was `IconObject`'s implicit default, never exposed |
| `iconAriaLabel` | `string` | Default `undefined`. **Added v1.3.0** — badge stays decorative and unnamed when omitted |
| `type` / `name` / `amount` | `string` | Required |
| `onClick` | `() => void` | Renders as `<button>` when set — same precedent as `CardAction` / `CardGoals` / `CardFeaturesAndEducation` |
| `className` | `string` | |

**`onClick` is additive.** Omitted, the card renders exactly as before: a non-interactive `<div>`, no button semantics, nothing in the tab order, no focus ring. Keyboard activation (`Enter`/`Space`) comes from the native `<button>` element, not a key handler.

The base class carries UA button resets (`border: none`, `margin: 0`, `cursor: default`, `font-family: inherit`, `text-align: left`) that the original `<div>`-only version did not need. Without them the `<button>` render would pick up the UA border and centred text. All five are inert on the `<div>` path — they restate inherited defaults — which is what keeps the omitted-`onClick` render byte-identical. Verified in-browser: the `<button>` and `<div>` renders are computed-style identical across 14 box/type/surface properties in both themes, differing only in `cursor`.

| Element | Token |
|---|---|
| Container | `--mapped-surface-elevation-default`, `--shadow-subtlest`, width 161px (min 128 / max 172) |
| Focus ring (`button.mn-card-balance:focus-visible`) | `--brand-scale-50` outline + offset, `--mapped-border-primary-default` |
| Padding | `--brand-scale-250` (10px) — **corrected v1.3.0, see below** |
| Icon | Reused `IconObject` (defaults `color="slate" size="l" shape="circle"`, all now overridable) |
| Type label | `--mapped-text-subtle-default`, `.type-body-caption` |
| Name | `--mapped-text-primary-default` (blue), `.type-body-caption-semibold` |
| Amount | `--mapped-text-default-default`, `.type-body-m-semibold` |

### Padding corrected 8px → 10px (v1.3.0) — a bug fix, not a redesign

⚠️ **The previous comment claiming no token matched 10px was WRONG WHEN
WRITTEN, not merely stale.** It read *"Figma specifies 10px, off the
brand-scale ramp (8/12) — rounded to the nearer step per approval"*, and the
8px existed **only** because of that claim.

`--brand-scale-250` **is** 10px. It was in `globals.css` and in
`design-tokens/Brand/Value.json` (`Scale.250 = 10`) the whole time; **line 40
of this same file already used it** for the header gap, and `Field.css:12`
uses it for padding. The file contradicted itself four lines apart. The
justification is disproved, so the value was a bug — corrected to Figma's
10px rather than preserved as a design decision.

**This is the one v1.3.0 change that deliberately alters rendered output**, so
it carries a before/after rather than a no-change proof. Measured on the real
component in both themes:

| | before | after | delta |
|---|---|---|---|
| padding | `8px` | **`10px`** | +2 |
| card height | 80 | **84** | +4 (2 top + 2 bottom) |
| card width | 161 | 161 | **0** — fixed width, `border-box` |
| badge offset | 8, 8 | 10, 10 | +2, +2 |
| text offset x | 50 | 52 | +2 |
| amount offset | 8, 48 | 10, 50 | +2, +2 |
| badge size · header gap · radius | 32×32 · 10px · 512px | unchanged | — |

**Every movement equals the padding delta exactly; nothing shifted beyond the
padding box**, and both themes are identical.

⚠️ **A third instance exists, verified but deliberately NOT changed here.**
This entry previously cited *"the same 10px→8px rounding as
`CardSmartInsights`"*. Checked: `CardSmartInsights.css:8-10` carries the
**identical** comment (*"Figma specifies 10px, off the brand-scale ramp
(8/12)"*) and the identical `padding: var(--brand-scale-200)`. Same disproved
reasoning, same bug. Out of scope for the v1.3.0 prop batch because correcting
it is a visual change on a component that batch never opened — **it needs its
own approval, exactly as this one did.** Logged here so it is fixed
deliberately rather than inherited silently.

### CardDataDisplay

| Prop | Type | Notes |
|---|---|---|
| `info` | `string` | Required |
| `content` / `content2` | `string` | `content2` optional — second value line |
| `className` | `string` | |

| Element | Token |
|---|---|
| Container | `--mapped-surface-subtlest-default`, padding `--brand-scale-400` (16px, on-ramp), width 164px (min 128 / max 300) |
| Info | `--mapped-text-subtle-default`, `.type-body-caption-semibold` (Figma's outer wrapper applies semibold to every line, including the label — preserved faithfully rather than "correcting" it to regular) |
| Content | `--mapped-text-default-default`, `.type-body-m-semibold` |

### CardMonthlyBudget

| Prop | Type | Notes |
|---|---|---|
| `state` | `'default' \| 'addNew'` | Default `'default'` |
| `period` | `string` | `default` only |
| `onDetailsClick` | `() => void` | |
| `percentage` | `number` | Drives `ProgressRing` |
| `amountLeft` / `totalAmount` / `availableAmount` / `spentAmount` | `string` | `default` only |
| `onAddNew` | `() => void` | `addNew` only |
| `className` | `string` | |

| Element | Token |
|---|---|
| Container (`default`) | `--mapped-surface-elevation-default`, `--shadow-subtlest`; padding `16px` top/sides, `20px` bottom (real Figma value, asymmetric — not a typo); width `343px` (fixed Figma component width, same precedent as `Toast`'s `624px`) |
| Container (`addNew`) | Dashed border `--mapped-border-subtle-default`, no fill |
| Ring | Reused `ProgressRing` (`size="m"`) — zero new markup |
| Available / Spent rows | Reused `SummaryItem` ×2 — icons `icon_wallet` / `icon_track_spending` (substituted for Figma's `icon_Spend`, which doesn't exist in our registry or any obvious Material equivalent) |
| Header title / dot / period | `--mapped-text-default-default` / `--mapped-text-subtle-default` / `--mapped-text-subtle-default` |
| Details link | `--mapped-text-primary-default` |
| Add-new icon button | `--mapped-icon-subtle-default` bg, `--mapped-text-primary-on-color` icon |

### CardGoals

| Prop | Type | Notes |
|---|---|---|
| `image` | `ReactNode` | Full-bleed banner slot — swappable per the Parts frame |
| `title` | `string` | Required |
| `percentage` / `current` / `total` | `number` / `string` | Drives the reused `ProgressBar` |
| `onClick` | `() => void` | Renders as `<button>` when set |
| `className` | `string` | |

| Element | Token |
|---|---|
| Container | `--mapped-surface-elevation-default`, `--shadow-subtlest`, radius `--brand-scale-200`, `overflow: hidden` (clips the image to the card's rounded corners); width `200px` (fixed Figma component width) |
| Image banner | Height `68px` (fixed Figma value, spans the container's full width) |
| Title | `--mapped-text-default-default`, `.type-body-m-medium` |
| Progress | Reused `ProgressBar` |

### CardFeaturesAndEducation

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'blue' \| 'orange' \| 'green' \| 'purple' \| 'outline'` | Default `'blue'` — collapses Figma's `appearance`×`color` properties, which only ever appear in these 5 valid combos |
| `icon` | `ReactNode` | Required |
| `title` | `string` | Required |
| `onClick` | `() => void` | Renders as `<button>` when set |
| `className` | `string` | |

| Element / variant | Token |
|---|---|
| Container (all variants) | Width `109px` (min `90px`, max `109px` — fixed Figma component sizing) |
| `blue`/`orange`/`green`/`purple` bg | `--brand-blue-500` / `--brand-orange-500` / `--brand-green-500` / `--brand-purple-500` (Phase 5.4). **NOT the same level as `IconObject`, which stays on `-400`** — see "Deliberate divergence" below |
| Fill icon/title | `--mapped-icon-primary-on-color` / `--mapped-text-on-color-heading` |
| `outline` | Border `--mapped-border-default`, explicit `120px` height (taller than fill variants — real Figma value) |
| Outline icon/title | `--mapped-icon-default-default` / `--mapped-text-default-default` |

### Known Figma inconsistencies

- **`CardSmartInsights.titleColor` is an open prop, not a fixed token**: confirmed via the `146:1275` reference frame, where the same component shows cyan, default(black), and error(red) titles across 3 different instances. No single token captures this — it's a per-instance category color the caller supplies.
- **10px padding** (`CardSmartInsights`, `CardBalance`): off the `--brand-scale` ramp (8/12). Rounded to `--brand-scale-200` (8px) per approval.
- **`icon_Spend` substitution**: Figma's `card/monthly budget` "Spent" row uses an icon (`icon_Spend`) not present in our registry and with no obvious Material equivalent. Substituted `icon_track_spending` per approval.
- **Asymmetric card padding** (`CardMonthlyBudget`, `default` state): `16px` top/sides, `20px` bottom. Confirmed real (not a copy-paste error) from Figma's own generated code.
- **`card/action`'s icon badge doesn't match any `IconObject` color**: Figma models it as bespoke inline markup (`--mapped-icon-primary-default` bg), not an `IconObject` instance — built inline rather than force-fitting the existing component's swatch palette.
- **`CardFeaturesAndEducation`'s `outline` variant is 120px tall**, taller than the ~108-120px fill variants (which size to content). Both are real, independently-specified Figma heights. <!-- charts-anchor -->
- **`CardFeaturesAndEducation` moved `-400` → `-500` (Phase 5.4).** Synced to Figma, which now binds `Blue/500` `#046eff`, `Orange/500` `#ff8a47`, `Green/500` `#38b860`, `Purple/500` `#5e4db2` — read per-variant from `324:335` / `324:344` / `324:351` / `324:358`. The `outline` variant (`324:372`) carries no brand colour and is unchanged. Backgrounds only; the icon and title tokens did not change.
- **Icon slot corrected to the icon tier.** Was `--mapped-text-primary-on-color`, now `--mapped-icon-primary-on-color`, matching Figma's `icon/primary/on-color` binding. Both resolve `#ffffff` in both themes — verified before and after, computed value unchanged. A tier correction, not a visual one.

### ⚠️ RECORDED ACCESSIBILITY GAP — decided, not open

**White titles on the filled variants do not meet WCAG AA at `-500`.** Measured
from rendered token values, identical in both themes (`--brand-*` never
dark-flips):

| Variant | White title on `-500` | vs 4.5:1 (text) | vs 3:1 (non-text) |
|---|---|---|---|
| `blue` | **4.49** | ✗ (by 0.01) | ✅ |
| `orange` | **2.34** | ✗ | ✗ |
| `green` | **2.56** | ✗ | ✗ |
| `purple` | **6.60** | ✅ | ✅ |

The title is `.type-body-caption-medium` (12px), so 4.5:1 applies — not the
large-text allowance. Orange and green fall below even the non-text bar.

**DECISION (Teku, Phase 5.4): ship `-500` regardless.** The full ramp was walked
first — `400`/`500`/`600`/`700`/`800` for all twelve hues — and per-hue darker
steps (blue 600, orange 700, green 700, purple 500) were costed and **declined**,
on the grounds that darkening further costs the hues their brand identity. Dark
text on orange and green was offered and also declined. Figma is the source and
Figma specifies `-500`.

**This is therefore a known, accepted gap, not an oversight.** No substitute
token, no `token-exempt` marker, and no CSS workaround was introduced — the
component uses exactly what Figma binds.

**Associated with the status-token contrast finding** recorded under
`TrendIndicator` (`--mapped-text-success-default` 2.56:1 light,
`--mapped-text-error-default` 3.64:1 light / 3.93:1 dark). Same class of finding
— a semantic colour that cannot carry white or coloured text at AA — and the
same shape of decision. Both are token-layer items awaiting a Figma-side change,
and neither is fixable in component CSS.

### Deliberate divergence — `CardFeaturesAndEducation` vs `IconObject`

**These two components hold DIFFERENT values for the same colour name. That is
intended.**

| Colour | `CardFeaturesAndEducation` | `IconObject` |
|---|---|---|
| blue | `--brand-blue-500` `#046eff` | `--brand-blue-400` `#368bff` |
| orange | `--brand-orange-500` `#ff8a47` | `--brand-orange-400` `#ffa16c` |
| green | `--brand-green-500` `#38b860` | `--brand-green-400` `#60c680` |
| purple | `--brand-purple-500` `#5e4db2` | `--brand-purple-400` `#7e71c1` |

They diverge because **they carry different accessibility bars**: a card title is
**text** (4.5:1), an `IconObject` glyph is **non-text** (3:1). The two were
therefore resolved separately rather than kept in lockstep — the card synced to
Figma's `-500`, `IconObject` deliberately left on `-400` pending its own decision.

Before Phase 5.4 they did match, and the previous wording of this entry said so.
Anyone reading either entry alone would reasonably assume they still do. **They do
not.** Verified after the change: card blue `rgb(4,110,255)`, `IconObject` blue
`rgb(54,139,255)`, in both themes.

---

## Charts — Donut Chart · Line Chart

**Figma source: NONE for either. See the callout.**

> ### ⚠️ DESIGNED ADDITIONS, not faithful builds
>
> **Every Figma source for these three shapes is FLATTENED OUTPUT.** The
> rendering below is authored, not transcribed.
>
> | Gap | Node | What Figma actually contains |
> |---|---|---|
> | **G1** budget pie | `0:379` in `1266:14337` | 1 `ellipse` + 6 `boolean-operation` subtracts + a `vector` hole. In the code export **every segment is an `<img>`** — no fills recoverable |
> | **G1** Assistant03 donut | `0:206`, 100×100 | 7 segments, visually confirmed. No inner radius recoverable |
> | **G3** trend chart | `Frame 296` (`0:242`) | `Vector 1` (area) + `Vector 2` (line), **both flattened `<img>`**; gridlines and marker are divs |
> | **C1** sparkline | `153:1943` | ONE `<vector>` named "Rectangle 5", 80×38, **shared byte-identically by all three crypto rows** |
>
> **What WAS sourced:** the donut's inner radius (`129.695` hole on a 200 outer
> → `0.648`), the per-category hue assignment (read from the *legend* rows, not
> the chart), the extent behaviour, and the chrome colours. **Everything else —
> curve, point count, series values, segment order, stroke width — is authored.**

### Why two components and not one or three

A donut and a line chart share no math, no data shape and no accessibility
model; merging them would be a god-component. G3 and C1 *do* share all three —
a sparkline is the trend chart with chrome switched off — so they are one
component, not two copies of one implementation.

They share **internal** helpers only. No shared public API and no shared data
shape, deliberately.

### DonutChart

| Prop | Type | Default | Notes |
|---|---|---|---|
| `segments` | `DonutSegment[]` | — | `{ id, label, value, color }` |
| `innerRadius` | `number` | `0.648` | Fraction of outer radius. `0` renders a pie |
| `centreLabel` / `centreCaption` | `string` | — | |
| `summary` | `string` | — | **Omitted → the chart is `aria-hidden`** |

**`value` is the RAW amount, never a percentage.** Shares are derived from
`sum(values)` inside the component — Figma's own budget percentages sum to
100.01%, and a component that accepted percentages would reproduce that.

**No default palette.** Every segment states its own hue, typed `ChartHue =
Exclude<IconObjectColor, 'ai'>`. Shipping a default sequence would mean
inventing a categorical scale the design system does not have. `'ai'` is
excluded by type rather than by documentation, so passing it is a compile error
instead of a segment that renders unpainted.

### LineChart

| Prop | Type | Default | Notes |
|---|---|---|---|
| `points` | `number[]` | — | Ordered values |
| `color` | `ChartHue \| 'onColor'` | `'blue'` | Line `-400`, area `-100` |
| `domain` | `number` | `points.length` | Total x slots — see extent below |
| `xLabels` | `string[]` | — | With `showAxis` |
| `marker` | `{ index, label? }` | — | |
| `showArea` / `showGridlines` / `showAxis` | `boolean` | `true` / `false` / `false` | **All chrome off = the sparkline** |
| `chromeTone` | `'default' \| 'onColor'` | `'default'` | See below |
| `summary` | `string` | — | Omitted → `aria-hidden` |

**`chromeTone` is an API decision, not a Figma variant.** The only source that
exists draws this chart on a coloured card, but the component also serves a
sparkline in a list row on the page surface. Hardcoding either host assumption
into a primitive is the thing to avoid, so the host declares it.

| | `default` | `onColor` |
|---|---|---|
| Axis labels | `--mapped-text-subtle-default` | `--mapped-text-on-color-caption` |
| Gridlines / marker rule | `--mapped-border-subtle-default` | `--mapped-border-on-color` |
| Callout | `--mapped-text-default-default` | `--mapped-text-on-color-heading` |
| Marker fill | `--mapped-surface-page` | `--mapped-text-on-color-heading` |

### Data vs chrome — two colour systems, deliberately

**Series colours are brand primitives and are byte-identical in both themes.**
Verified, not assumed: all twelve segment fills, line strokes and area fills
measured identical across light and dark. A category's identity must not change
with the theme, or the chart and its legend would disagree about which colour
means "Groceries".

**Chrome is interface and uses the mapped tier**, so it dark-flips.

**The area fill is the same hue at `-100`, not the line colour at reduced
opacity.** That is the whole point: opacity has no backing token, so the
conventional translucent-area recipe would have needed a `color-mix` approval. A
real step on the same ramp reaches the same place with a token that exists.

### Extent — the data may stop before the axis does

`domain` defaults to `points.length` ("data fills the width"). Flow 7 needs
otherwise, and the source is unambiguous:

| Node | Position |
|---|---|
| Gridlines | `left-0 … w-[343px]` — **full width** |
| Area + line | `left-0 w-[176px]` |
| Marker | centre **x=176** · vertical rule `left-[177px]` · callout `left-[182px]` |
| Axis labels | `01` at 16 · **`15` at 170** (centre 176) · `31` at 314 |

The data ends exactly at the `15` tick while the axis spans the month — month-to-
date, deliberate. A truncated export would not place the marker and callout at
the cut.

> **CORRECTION to the flow inventory (F7 A10).** The inventory flagged `Line 7` /
> `Line 8` as suspicious at *"x=343 with width 343"*. Design context shows
> `left-0 w-[343px]` — **correct full-width gridlines**. That was a
> metadata-reading artifact, not a defect. **Flow 7 must not inherit it as a
> known problem.**

### Sizing

Both are **size-agnostic**: the SVG fills its parent and the parent owns the box.
Every size the sources use (201×200, 100×100, 343×157, 80×40) is off the
`--brand-scale` ramp, so a `size` prop would need tokens the library does not
have. This deliberately differs from `ProgressRing`, which hardcodes per-size px.

`LineChart` renders **only the series as SVG; all chrome is positioned HTML**.
The plot stretches with `preserveAspectRatio="none"`, which would distort a
stroked gridline or a circular marker. Verified at 600×200, 100×200 and 343×157:
`vector-effect: non-scaling-stroke` holds and the marker stays exactly square
(13.2 × 13.2 at every box). This also mirrors the source, where Figma's own
gridlines and marker are divs.

### Accessibility

Both default to **`aria-hidden`** and become `role="img"` only when given a
`summary`.

- **Donut:** the paired `ChartLegendItem` rows already state every label, share
  and amount as real text. The legend is the accessible artifact; a composed
  seven-segment label would announce the same data again, worse.
- **Sparkline in `ListItem`:** passes no summary on purpose — the row already
  announces the move via `TrendIndicator`. Labelling it would state the same
  fact twice, the same redundancy stripped out of `TrendIndicator`'s own
  announcement.

### `ListItem`'s `miniChart` slot

Fits with no API change. `.mn-list-item__chart` gained a floor —
`min-width: var(--brand-scale-1400)` (72px) + `aspect-ratio: 2` — because a
size-agnostic chart has no intrinsic width and the previous `min-width: 0` would
have squeezed it to nothing with no error. Verified at host widths 320 / 240 /
180: the slot clamps to 72×36 and never reaches zero.

### Known issues / decisions

- **`polar()` is duplicated between `ProgressRing` and `DonutChart`,
  deliberately.** `ProgressRing` is a 270° single-value gauge that strokes a
  masked path; `DonutChart` fills multi-segment wedges. Extracting twelve shared
  lines would mean editing a shipped component that `CardMonthlyBudget` consumes
  for no behavioural gain. **If you change the angle convention in one, check
  the other.**
- **⚠️ Adjacent segments are not reliably distinguishable.** Measured across
  Figma's own seven-category budget sequence, identical in both themes:

  | Adjacent pair | Contrast | RGB distance |
  |---|---|---|
  | red \| purple | 1.46 | 136 |
  | purple \| blue | 1.25 | 99 |
  | blue \| cyan | 1.64 | 95 |
  | cyan \| lime | 1.35 | 172 |
  | **lime \| yellow** | **1.07** | **66** |
  | yellow \| orange | 1.41 | 78 |
  | orange \| red (wrap) | 1.44 | 50 |

  **Every pair is below 3:1**, and `lime | yellow` at 1.07 is essentially
  indistinguishable by luminance. This is not a component defect — the component
  paints what it is given — but it confirms that `IconObject`'s twelve hues are
  an **icon-badge palette, not an adjacent-distinguishable categorical scale**.
  A real chart palette would be a token decision. Recorded, not fixed.
- **⚠️ The `onColor` series has NO area fill (E-4).** Tinting white needs an
  opacity and no mapped alpha token can do it: the mapped alpha surfaces resolve
  fully transparent in both themes, and the only other alpha family is alias
  tier, unusable in a component. The `-100` ramp step that solves this for the
  twelve hues has no white equivalent. **Flow 7's card has an area fill, so this
  is a real shortfall against the design.**
- **⚠️ `onColor` chrome is broken in dark mode (E-3).**
  `--mapped-text-on-color-caption` resolves `rgb(231,234,237)` in light —
  correct — and **`rgb(13,15,17)` in dark**, i.e. near-black on a card that does
  not itself flip. Measured live. The component uses the semantically correct
  token and does **not** work around the defect. See `CLAUDE.md`'s corrected
  on-color audit entry.
- **Opacity substitution, measured.** Figma composites `blue-50` at 70% over the
  card blue → `rgb(162, 202, 255)`. The token used instead resolves
  `rgb(231, 234, 237)` in light — an **RGB distance of 78**, visibly less blue.
  Contrast against the card: Figma's recipe **2.66**, the token **3.72**. So the
  token is *more legible* but *less tinted*. Recorded as a knowing divergence.
- **A green test suite does not prove a consumable package.** `ChartHue` was
  added to `DonutChart.tsx` but not to its `index.ts`; vitest resolves the module
  directly and passed all 421 tests, while `tsc -b` — which follows the barrel —
  failed the build. **`npm run build` is the gate that catches barrel omissions;
  the suite structurally cannot.**

---

## Trend Indicator

**Figma source:** none — see below. Geometry derived from `Frame 440` (`153:1850`) inside `Item/list` Type=Crypto (`153:1842`).

> ### ⚠️ DESIGNED ADDITION, not a faithful build
>
> **There is no trend component in Figma.** `Item/list` (`153:1841`) ships exactly
> three symbols — `Type=Default`, `Type=Profile`, `Type=Crypto` — with **no
> direction axis**, and the Item Parts frame (`136:2764`) contains only List item,
> Summary item, Chart legend item and Recent contributions item.
>
> Direction is expressed in Figma by **swapping an icon instance**: the trend glyph
> inside `Type=Crypto` is a 12px `<element>` instance (`153:1891`), and
> `Homepage_Crypto` swaps it to `icon_triangle down` for Ethereum while overriding
> that instance's label colour to `text/error/default`. Real design intent, with no
> component to carry it — which is the gap this component closes.
>
> **`flat` goes further and exists in no Figma source at all.** It is an approved
> addition (a stablecoin at 0.00% must not render a green up-arrow, and forcing the
> caller to pick a lying direction is the defect being fixed). It is being added to
> Figma so the two do not diverge. Recorded here as a deliberate addition beyond
> source, per CLAUDE.md's inferred-states rule — **not** as something read from the
> file.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `direction` | `'up' \| 'down' \| 'flat'` | — | **Required, deliberately.** A defaulted direction is the exact defect this component fixes |
| `label` | `string` | — | Already-formatted value. This component never formats — see below |
| `ariaLabel` | `string` | composed | Overrides the announcement |
| `className` | `string` | — | |

**No `previewState`, and no hover/pressed/focus.** Figma defines no interaction
states for this and it is not interactive; none were invented.

**It takes a formatted string rather than a number**, matching every other amount
in the library (`ListItem.amount`, `CardBalance.amount`, `SummaryItem.amount`,
`ChartLegendItem.amount`). The library has no locale layer, and a trend is not
always a percentage — `+RM 3,609.78` is a real case from the MVP's wallet card.

### Direction → token mapping

The glyph and the label are coloured from **different tiers**, named separately.
Both resolve identically today, but they are distinct tokens.

| Direction | Glyph | Glyph token (root, via `currentColor`) | Label token |
|---|---|---|---|
| `up` | `icon_triangle_up` | `--mapped-icon-success-default` | `--mapped-text-success-default` |
| `down` | `icon_triangle_down` | `--mapped-icon-error-default` | `--mapped-text-error-default` |
| `flat` | `remove` | `--mapped-icon-subtle-default` | `--mapped-text-subtle-default` |

Mapped tier only; zero alias-tier references (audit grep returns 0).

### Geometry — measured, not declared

Verified in the browser against `Frame 440` (`153:1850`, 90×16):

| Property | Figma | Measured | |
|---|---|---|---|
| Glyph box | 12×12 | 12×12 | ✅ |
| Glyph offset from left | 0 | 0 | ✅ |
| Label offset from left | 16 | 16 | ✅ |
| Gap | 4 (`--brand-scale-100`) | 4 | ✅ |
| Row height | 16 | 16 | ✅ |
| Glyph vertical centring | centred | offset 0.00 | ✅ |

Label typography: `.type-body-caption` (12/16).

### Accessibility

`role="img"` + a composed `aria-label` on the root — the `IconObject` / `Field`
precedent. **Direction reaches assistive technology as a word**, never as colour
or glyph shape alone. The subtree is children-presentational, so the visible
label is not announced a second time; the `<Icon>` carries `aria-hidden="true"`
and there is no second name source inside (verified: 0 descendants with
`aria-label`, `role="img"`, or `alt`).

**A leading sign is stripped when composing the announcement**, because a signed
label would otherwise be stated twice — `-2.49%` is voiced "minus two point four
nine percent", making "Decrease, -2.49%" redundant. The **visible label always
keeps its sign**. Verified live:

| `label` | announced |
|---|---|
| `+10.2%` | `Increase, 10.2%` |
| `-2.49%` | `Decrease, 2.49%` |
| `0.00%` | `No change, 0.00%` |
| `+RM 3,609.78` | `Increase, RM 3,609.78` |
| `-RM 250.75` | `Decrease, RM 250.75` |

The announcement words — "Increase" / "Decrease" / "No change" — are **new
user-facing copy, not from Figma**. Precedent: `ProgressStepper`'s `Step X of Y`
fallback.

### Known Figma inconsistencies / decisions

- **No Figma source for the component itself.** See the callout above. The down
  state is an ad-hoc per-instance override on one screen; `flat` is an approved
  addition being backfilled into Figma.
- **`inline-flex`, not `flex` — a real behavioural difference from the rule it
  replaced.** `.mn-list-item__trend` was `display: flex` (always block-level).
  `.mn-trend` is `inline-flex`, which **only blockifies when its parent is a flex
  or grid container**. Measured: both current consumers (`.mn-list-item__trailing`,
  `display:flex column`, and the showcase row) do blockify it to `flex`, and
  geometry is byte-identical to the table above. In a **non-flex** parent it stays
  inline-level and sits on the text baseline (measured: `display: inline-flex`,
  `vertical-align: baseline`, 3.6px offset within the line box) — internal
  geometry unaffected. This is the better default for a small inline indicator,
  but it is a difference, and it is recorded rather than assumed away.
- **⚠️ The status tokens fail WCAG AA as text, in both themes.** The label is 12px
  (`.type-body-caption`), so 4.5:1 applies. Measured against the page surface:
  `--mapped-text-success-default` = **2.56:1** light / 5.39:1 dark;
  `--mapped-text-error-default` = **3.64:1** light / **3.93:1** dark. Three of four
  combinations fail. **Pre-existing and not specific to this component** — it
  affects every success/error text consumer, and dark mode maps these to the
  *darker* `-600` step, which is the wrong direction on a black page. Tracked as a
  token-layer item; the component uses the correct semantic tokens and no
  substitute or exemption was introduced.
- **Figma's Success value has drifted from the pipeline.** Figma reports
  `icon/Success/default` and `text/Success/default` as `#4ecd76`; the pipeline
  resolves both to `#38b860` (`Success.500` → `brand-green-500`). Error matches
  exactly on both sides (`#eb4f52`). Note the direction: `#4ecd76` is **lighter**,
  so a straight Token Studio re-export would make light-mode contrast *worse* — it
  is not a fix for the item above, and the two may pull against each other.

---

## Sheet

**Figma node:** `159:1856` (`Bottom Sheet`, `Monarch-design-system`
`xhA5ARVgSeD3gA41lYDqST`)

A **bottom-anchored, full-width** dialog over a `Blanket` scrim — a separate
primitive from `Modal`, not a variant of it. `Modal.css` is hard-centred
(`align-items: center; justify-content: center`), so a `position` prop would
have invalidated its header props half the time. Rendered via `createPortal`
to `document.body` (the correct overlay pattern, and required because
`Blanket` is `position: fixed`).

`159:1856` is a **standalone component (symbol), not a variant set** — the
name is `Bottom Sheet`, not `Type=…`. **One variant, zero states.** No hover,
pressed, focus or disabled is authored anywhere in the tree, and none was
added.

Four stacked regions, of which **only `content` is always present**:

```
Blanket  (scrim)
panel
├── header             optional — title / iconLeft / action, any combination
├── content            ALWAYS present, and the ONLY scrolling region
├── actions            optional — app composes real Buttons
└── home indicator     optional (showHomeIndicator, default true)
```

### Nested components (all reused as real instances — none re-implemented)

| Instance | Role | Notes |
|---|---|---|
| `Blanket` | Scrim | `onClick` → `onClose` when `closeOnScrimClick` (default true) |
| `IconButton` (tertiary, `s`) + `Icon name="close"` `l` | Close ✕ | Figma draws a bare `<element>`; upgraded to a real `IconButton` for a11y, exactly as `Modal` did |
| `Button` ×N | Action region | App-composed via the `actions` slot, like `Modal`'s `footer` |

Figma's `Slot` ×3 (`159:1852`/`1995`/`2001`) are 🎰 placeholder markers, not a
component — they are `children`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controlled open state |
| `onClose` | `() => void` | — | Fired by ✕, Escape, or scrim click |
| `title` | `string` | — | Figma's `{Header}` text prop, **left-aligned**; wired to `aria-labelledby` |
| `headerIconLeft` | `ReactNode` | — | Slot before the title |
| `headerAction` | `ReactNode` | — | Slot on the right, **before** the ✕ |
| `children` | `ReactNode` | — | The content region — the only thing that scrolls |
| `actions` | `ReactNode` | — | Pinned full-width vertical stack |
| `showHomeIndicator` | `boolean` | `true` | iOS system chrome |
| `showCloseButton` | `boolean` | `true` | The header ✕ |
| `closeOnScrimClick` | `boolean` | `true` | |
| `ariaLabel` | `string` | — | Accessible name when there is no visible `title` — see below |
| `id`, `className` | `string` | — | |

**The dialog must have an accessible name**, measured not assumed — without
one it fails axe's `aria-dialog-name`. This is enforced by a **dev-only
fail-loud on the COMPUTED name** (`title?.trim()` non-empty **or** `ariaLabel`
present), stripped from the library build.

A discriminated union (`{title: string} | {ariaLabel: string}`) was built for
this and **removed**. It guarantees a *prop*, not a *name*: `title=""` is a
valid string, satisfies the union, and was verified to still fail
`aria-dialog-name` — in fact it renders no header at all, since `""` is falsy.
The runtime check catches that case and whitespace-only values, so it is
strictly more capable than the type was. Two further reasons: a union breaks
narrowing for composition wrappers spreading `{...props}` where `title` is
`string | undefined` (the MVP's rule-4 pattern), and it would have been the
only union in a 40-component API whose sibling overlay, `Modal`, does not use
one.

Note a header built from only `headerIconLeft`/`headerAction` renders no
`<h2>` and therefore still needs `ariaLabel`.

**Region presence is derived from the region's own slots, never from one
child.** The header renders iff `title || headerIconLeft || headerAction`.
Coupling it to `title` alone would have made `headerIconLeft` a silent no-op
and reproduced `Modal`'s G8 defect inverted.

No `previewState` — a Sheet has no forced visual sub-states; its state is
open/closed, driven by `isOpen`.

### State → token mapping

| Element | Property | Token | Px |
|---|---|---|---|
| Root | anchor | `position: fixed`, `justify-content: flex-end` | — |
| Panel | max-height | `calc(100dvh - var(--brand-scale-1100))` | 100dvh−48 |
| Panel | background | `--mapped-surface-elevation-default` | — |
| Panel | radius (top only) | `--brand-scale-200` / `0` | 8 / 0 |
| Panel | width | `100%` (no max-width) | — |
| Header | padding T/X/B | `--brand-scale-600` / `-400` / `-400` | 24/16/16 |
| Header | lead + trail gap | `--brand-scale-100` | 4 |
| Title | colour | `--mapped-text-default-default` | — |
| Title | type | `.type-body-m-semibold` | 16/24 |
| Content | padding X | `--brand-scale-400` | 16 |
| Content | padding-bottom (affordance) | `--brand-scale-400` | 16 |
| Content | padding-top when `:first-child` | `--brand-scale-400` | 16 |
| Content | gap | `--brand-scale-400` | 16 |
| Actions | padding T/X/B | `--brand-scale-400` / `-400` / `0` | 16/16/0 |
| Actions | gap | `--brand-scale-400` | 16 |
| Home-ind. frame | padding T/X/B | `--brand-scale-600` / `-400` / `0` | 24/16/0 |
| Home indicator | margin | `--brand-scale-250` | 10 |
| Home indicator | radius | `--brand-scale-1800` | 512 |
| Home indicator | fill | `--mapped-border-subtlest-default` | — |
| Bottom-most region | padding-bottom | `--brand-scale-600` | 24 |
| Scrim | — | `Blanket` (`--mapped-blanket-default-default`) owns its token | — |

Zero `--alias-*` references (grep-confirmed). Interactive states use
`--mapped-*` only.

### Geometry

| Property | Token | Px |
|---|---|---|
| Panel max-height | `calc(100dvh - var(--brand-scale-1100))` | viewport − 48 |
| Panel width | — | 100% (full-bleed; **no** `max-width`) |
| Panel radius | `--brand-scale-200`, top corners only | 8 |
| Home indicator bar | — | 134 × 5 (literals — see divergences) |

The panel is **hug-height and grows with its content**, capping at the
max-height. It does *not* open at the cap regardless of content: measured at
**201px** for short content and **764px** capped (with `100dvh` = 812).
`overflow: clip` on the panel; **no drop shadow** — Figma's sheet has none and
the `Blanket` provides the depth, same as `Modal`.

### Region combination matrix (all 8 measured)

`content` always present; header / actions / home indicator vary. **Every
edge-to-edge inter-region gap measures 0** — all spacing lives inside each
region's own padding, with no margins, so an absent region leaves no residual
space.

| Case | Bottom-most region | Its `padding-bottom` |
|---|---|---|
| `HAI` · `H-I` · `-AI` · `--I` | home indicator | 0 (+10px indicator margin = Figma exact) |
| `HA-` · `-A-` | actions | 24 |
| `H--` · `---` | content | 24 |

When the **content region is bottom-most and scrolling**, the 16px affordance
padding and the 24px `:last-child` padding are both `padding-bottom` on the
same element. **They do not sum — `:last-child` wins on specificity**
(0,2,0 vs 0,1,0, so file order cannot flip it) and the computed value is
**24px**. The affordance still holds because 24 > 16. Measured `scrollHeight`
of 2024 (= 2000 + 24) confirms the padding sits *inside* the scroll area and
is reachable at the end of the scroll rather than being clipped.

### Scrolling

`overflow-y: auto` with the bar hidden three ways (`scrollbar-width: none`,
`-ms-overflow-style: none`, `::-webkit-scrollbar { display: none }`) —
**hide the bar, never the scrolling**. Measured after hiding: scrollbar gutter
**0px**, `scrollHeight` 2024 vs `clientHeight` 764, `scrollTop` moves.

`.mn-sheet__content > * { flex-shrink: 0 }` is **load-bearing, not cosmetic**.
Flex items default to `flex-shrink: 1`, so in a column flex scroll region they
silently *compress* to the available height instead of overflowing it: the
container then reports `scrollHeight === clientHeight` and nothing ever
scrolls. Measured — a 2000px child collapsed to 614px before this rule
existed, while all tests still passed.

Overflow is detected in a `useLayoutEffect` keyed on `isOpen`/`children`,
**not** a `ResizeObserver`. Both were built; RO was removed. Not because RO is
broken — it is correct in any real browser, and nothing here should be read as
a caution against RO in the DS generally — but because its callbacks are
delivered with the frame-rendering steps, which the preview pane suspends
(`document.hidden: true`; a bare control probe fired **zero** callbacks, not
even the guaranteed initial one). `useLayoutEffect` runs synchronously after
DOM mutation and before paint, so it fires and is measurable here, keeping the
behaviour inside this project's verification standard.

**Accepted limitation, stated rather than hidden:** keyed on
`isOpen`/`children`, the check does **not** re-run when already-mounted
content changes size without the `children` reference changing — an image
loading in, a collapsible expanding, a font swapping, or a viewport resize.
In those cases a region that has become scrollable keeps its pre-change
attributes until the next open or `children` change, so the keyboard route
can be briefly absent. This is the cost of not using a `ResizeObserver`; if it
ever bites in practice, the fix is RO plus a way to verify it, not a wider
dependency array.

### Accessibility

`role="dialog"` + `aria-modal="true"`. `aria-labelledby` points at the title
**only when a title was actually rendered** — a header built from just the
icon/action slots renders no `<h2>`, and pointing at a missing id is a
dangling reference. Escape closes; focus moves into the dialog on open and is
restored to the previously-focused element on close; Tab is trapped
(Shift+Tab wraps at the first focusable, Tab at the last). Close button
carries `aria-label="Close"`.

The scrolling content region takes `tabIndex={0}`, `role="group"` and an
accessible name **only while it actually overflows** — hiding the scrollbar
removes the only pointer affordance, and a keyboard user must still reach it
(axe `scrollable-region-focusable`; the `.mvp-home__carousel` cautionary
case). A short sheet gets no spurious tab stop and announces no group.
Initial focus explicitly **skips** this container so it does not steal focus
from the first real control, matching `Modal`.

### DELIBERATE DIVERGENCES from Figma

Each is a departure from what `159:1856` draws, recorded as such.

1. **`headerAction` slot, and its 4px trail gap.** Figma authors no
   right-side header action, so it specifies no gap for one. The slot was
   added so header presence derives from the region rather than from `title`
   alone. The gap **mirrors the lead group's `--brand-scale-100`** rather than
   inventing a value. `gap` emits nothing at 0 or 1 children, so an empty slot
   leaves no residual space — measured: with only an action, the lead group is
   **0px wide** and the ✕ still ends exactly 16px from the edge.
2. **`tabIndex` / `role="group"` on the scrolling content region.** An
   accessibility addition, not an inferred Figma state. Required because the
   scrollbar is hidden by a standing rule; see Accessibility above.
3. **Headerless top inset — `--brand-scale-400` (16px) via
   `.mn-sheet__content--headerless`.** Figma draws **no headerless bottom
   sheet**, so there is no source value. With the header absent its 24px
   `padding-top` disappears with it and content would sit flush under the 8px
   rounded corner. 16px is the smallest on-ramp value that clears it and is
   symmetric with the affordance padding at the other end. Zero when a header
   renders (measured in all four headerless combinations and the header
   control).
   Driven by the component's `hasHeader` boolean, **not** a `:first-child`
   selector. Position-dependent selectors describe where an element sits, not
   what state it is in — a `:first-child` rule would silently lose this inset
   the moment anything were inserted above the content region (a drag handle,
   the parked scroll shadow), with no error and no failing test. The
   `:last-child` rule that supplies the bottom padding is deliberately *not*
   converted: there "whichever region renders last owns the bottom space" is
   genuinely what the rule means, so position is the correct trigger.
8. **`showCloseButton` (default `true`).** Figma always draws the ✕, so
   suppressing it is beyond source. Added because a back chevron in
   `headerIconLeft` would otherwise render alongside the ✕, giving two
   dismissal affordances. Explicit, mirroring `showHomeIndicator` — the ✕ is
   **never auto-suppressed** when `headerIconLeft` is set, since keying one
   control's presence off an unrelated prop is silent behaviour. With nothing
   left for it to hold, the trail group is not rendered at all rather than
   rendered empty.
4. **`align-items: stretch`, not Figma's `items-start`.** Figma sets
   `items-start` on the content region but marks **every child `w-full`**, so
   stretch is what actually renders. Also matches `Modal`'s content region.
5. **Home indicator `134px` / `5px` literals.** Fixed decorative pull-bar
   dimensions, not scale-derived. **5px is genuinely off-ramp**: the
   `--brand-scale` ramp steps **4 → 8** (verified in `globals.css` *and* in
   `design-tokens/Brand/Value.json`, whose `Scale` group has no `125` or
   `150` key), and no token resolves to 5px. This is the **second** location
   carrying these literals — `BottomNavigation.css` has the same pair, because
   Figma's `Navbar/home indicator` (`158:468`) is one component instanced in
   both places while code has it twice, privately. Duplicated per approval;
   keep the two copies in step until a shared `HomeIndicator` absorbs them.
6. **Max-height and top inset are not authored in Figma at all.** `159:1856`
   draws a hug-height sheet with no cap. The capped behaviour is an instructed
   addition. The 48px inset clears the status bar: `StatusBar` (`125:294`)
   measures **44px**, which is off the ramp (`-1000` = 40, `-1100` = 48), and
   was rounded **up** to `--brand-scale-1100` per approval — a 4px overshoot —
   matching the `BottomNavigation` 62→64 and `StatusBar` 5→4 precedents,
   rather than adding a third permanent literal for a value that will never be
   tokenised. `Sheet` is the **first component in the codebase to use a
   viewport unit or a `max-height`**. `dvh` over `vh` because mobile browser
   chrome collapses and `vh` would let the sheet run under the URL bar.
7. **Unconditional 16px content affordance padding.** Content must never end
   flush with the clip boundary — a row sliced mid-element is what signals
   there is more below, and a cap landing cleanly between rows would look
   finished. Accepted cost: on a sheet short enough not to scroll this stacks
   with the actions region's 16px `padding-top`, widening Figma's 16px
   content→actions gap to **32px**. See Scrolling for why the conditional
   version was removed.

### Known Figma inconsistencies

- **Panel fill bound to a raw primitive, normalized.** Figma binds the sheet
  fill to `Neutral01` (#ffffff), a brand primitive that would not dark-flip,
  leaving the sheet white on a dark page. Normalized to
  `--mapped-surface-elevation-default` per approval — the identical finding
  already approved and documented for `Modal`'s card. This is a **seventh
  member of the foreign-variable family** recorded in the MVP gap register
  §4a: `figma-defect`, zero DS action beyond the normalization.
- **No drag handle is drawn.** The only pill in the tree is the iOS home
  indicator at the bottom. Dismissal is the header ✕ plus the scrim; **no
  swipe-down is authored**, and none was added.
- **The header is a separate Figma component** (`158:3301`, `Type=Default`)
  that does not exist in code. Built as internal markup per approval, matching
  the `Modal` precedent — `Modal` faced the same header (same `{Header}` text
  prop, same 24/16/16 padding, same 24px close glyph) and also built it
  inline. It differs only in alignment: `Modal` centres the title via a
  spacer, the Sheet left-aligns it with `justify-between`.

### Logged for a later session (not built here)

- **`getFocusable` is duplicated from `Modal.tsx`** — an identical 6-line
  helper. Extracting a shared overlay focus utility means editing a shipped
  component. Keep the copies in step.
- **`HomeIndicator` extraction** — would close divergence 5 and the
  `BottomNavigation` duplication together.
- **A scroll-position shadow under the header** (a subtle divider appearing
  once content has scrolled). Real UX value on a tall sheet, but Figma
  authors no such state and inferred states are never added silently. A design
  question, not a defect.
