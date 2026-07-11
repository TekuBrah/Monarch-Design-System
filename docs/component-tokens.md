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

---

## Element Wrapper

**Figma node:** 46:920  
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 46:920  

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 148:986 (Buttons frame)

An icon-only action trigger. Shares the full token matrix with Button — same `variant × appearance × state` mapping. Differs only in geometry (square padding, no label) and contains a single icon slot wrapped in `ElementWrapper size="l"`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'primary'` | `'primary'` \| `'secondary'` \| `'tertiary'` |
| `appearance` | `ButtonAppearance` | `'default'` | `'default'` \| `'inverse'` |
| `size` | `IconButtonSize` | `'m'` | `'s'` \| `'m'` \| `'l'` |
| `icon` | `ReactNode` | — | The icon content; wrapped in `ElementWrapper size="l"` (24px) |
| `ariaLabel` | `string` | — | Accessible name — required in production for icon-only buttons |
| `disabled` | `boolean` | `false` | |
| `onClick` | `MouseEventHandler` | — | |
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

See the Button section above for the full token table. The Icon Button uses the same `TOKENS` record (`variant × appearance → { bg, bgHover, bgPressed, bgDisabled, border, borderHover, borderPressed, borderDisabled, text, textHover, textPressed, textDisabled, focusRing }`).

### Shared styling system

Both Button and Icon Button:
- Use the `.btn` CSS class for base styles + all interaction state rules (`:hover`, `:active`, `:disabled`, `:focus-visible`)
- Pass tokens via inline CSS custom properties (`--btn-bg`, `--btn-border`, `--btn-text`, etc.)
- Add a size modifier class for padding: `.btn--{s/m/l}` (Button, h/v split) vs `.btn--icon-{s/m/l}` (Icon Button, square)

### Known Figma gaps / inferences

- **Inverse token assignments**: Inferred from the `interactive-on-color` and `on-color-label` token families — same inference as Button. No direct Figma read on Inverse Icon Button states.
- **L size not confirmed from Figma**: The L icon button size (12px padding) is observed in the XML but not verified in a Figma Dev Mode inspection.

---

## Icon

**Source:** `@material-design-icons/svg` npm package — Round style  
**Not exported from Figma.** The Figma file uses Material Icons (453 icons, 5 styles, all 24×24px in the Action category). Round was chosen to match the button corner language.

A sized, colour-inheriting wrapper around a single Material Round SVG. Renders `<ElementWrapper>` + SVG; the SVG's `fill` is always `currentColor`, so the icon colour is driven entirely by the nearest CSS `color` value.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `IconName` | — | Required. Key of the bundled icon registry |
| `size` | `IconSize` | `'m'` | `'s'` \| `'m'` \| `'l'` |

### Size → token mapping

| size | px | ElementWrapper size | `--brand-scale-*` token |
|---|---|---|---|
| `s` | 16px | `s` | `--brand-scale-400` |
| `m` | 20px | `m` | `--brand-scale-500` |
| `l` | 24px | `l` | `--brand-scale-600` |

### Bundled set

**96 icons total** — 59 Material Round + 37 Custom. All keys are in `IconName` (derived from `keyof typeof ICONS`).

**Material Round (59):** `add`, `remove`, `close`, `check`, `edit`, `delete`, `content_copy`, `search`, `filter_list`, `sort`, `refresh`, `more_vert`, `more_horiz`, `settings`, `tune`, `download`, `upload`, `share`, `arrow_back`, `arrow_forward`, `arrow_upward`, `arrow_downward`, `chevron_left`, `chevron_right`, `expand_more`, `expand_less`, `unfold_more`, `open_in_new`, `info`, `warning`, `error`, `check_circle`, `cancel`, `help_outline`, `visibility`, `visibility_off`, `done`, `person`, `account_circle`, `group`, `logout`, `login`, `notifications`, `mail`, `home`, `menu`, `dashboard`, `calendar_today`, `schedule`, `attach_file`, `link`, `star`, `star_border`, `favorite`, `favorite_border`, `radio_button_unchecked`, `radio_button_checked`, `check_box`, `check_box_outline_blank`

**Custom (37):** `icon_finance`, `icon_bank`, `icon_wallet`, `icon_stocks`, `icon_crypto`, `icon_gold`, `icon_battery_horizontal`, `icon_transfer`, `icon_receive`, `icon_spend`, `icon_buy_and_sell_crypto`, `icon_crypto_transfers`, `icon_grocery`, `icon_grocery_1`, `icon_food`, `icon_car`, `icon_healthcare`, `icon_healthcare_1`, `icon_shopping`, `icon_bills`, `icon_budget`, `icon_duration`, `icon_aiinsights`, `icon_aimage`, `icon_track_spending`, `icon_spending_alert`, `icon_scheduled_payments`, `icon_automatic_savings`, `icon_home`, `icon_more`, `icon_filter01`, `icon_chevron_expand_less`, `icon_chevron_expand_more`, `icon_triangle_up`, `icon_triangle_down`, `icon_pdf`, `icon_monarchacademy`

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
| `size` | `LogoSize` | `'m'` | `'s'` \| `'m'` \| `'l'` — controls height only |

### Size → token mapping

Height is constrained via token; width is `auto` to preserve each logo's natural aspect ratio.

| size | height | `--brand-scale-*` token |
|---|---|---|
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
| `onClick` | `MouseEventHandler<HTMLDivElement>` | — | Close handler for clicking outside the modal |

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

Status lozenge (Atlassian Lozenge pattern). Always shows a `done` checkmark icon; icon inherits `currentColor` from the container.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `appearance` | `ChipsAppearance` | `'default'` | See table below |
| `isBold` | `boolean` | `false` | `false` = subtle tinted fill; `true` = solid saturated fill with white text |
| `label` | `string` | `'LABEL'` | Visible text |

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

- **Subtle background tokens at alias layer only**: `--alias-surface-100`, `--alias-neutral-800`, `--alias-primary-100`, `--alias-warning-100`, `--alias-interactive-100`, `--alias-error-100`, `--alias-success-100` are alias-layer tokens with no mapped equivalent and **no dark-mode flip**. These will render the same color in both themes. (Confirmed from Figma source — only light-mode values specified.)
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
| `size` | `'M' \| 'S'` | `'S'` | M = 16px / S = 14px body |
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
| M | `type-body-m-semibold` (16px) | `type-body-m-semibold` (same size) |
| S | `type-body-sm-semibold` (14px) | `type-body-caption-semibold` (12px — smaller) |

### Geometry tokens

| Property | Token | Value |
|---|---|---|
| Gap between elements | `--brand-scale-100` | 4px |

### Known Figma inconsistencies

- **Required `*` size differs by size**: In size S, the asterisk is caption (12px) while label text is body-sm (14px). In size M, both share the same body/m font. Preserved as-is from Figma.
- Figma shows `help_outline` as the default icon; in code the icon slots are ReactNode for flexibility.

---

## Toggle

**Figma node:** 59:2721  
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 59:2721

A binary on/off control rendered as a sliding pill track. Uses a hidden native `<input type="checkbox" role="switch">` for semantics; all visual state is driven via CSS sibling combinators.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `ToggleSize` | `'regular'` | `'regular'` \| `'large'` |
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
| **Regular** track width | `--brand-scale-800` | 32px |
| **Regular** track height | `--brand-scale-400` | 16px |
| **Regular** dot size | `--brand-scale-300` | 12px |
| **Regular** dot checked left | `calc(--brand-scale-800 - --brand-scale-300 - --brand-scale-50)` | 18px |
| **Large** track width | `calc(--brand-scale-1100 - --brand-scale-50)` | 46px (no 46px token — pure scale math) |
| **Large** track height | `--brand-scale-600` | 24px |
| **Large** dot size | `--brand-scale-500` | 20px |
| **Large** dot checked left | `--brand-scale-600` | 24px |

### Known Figma inconsistencies

- **Large track width = 46px**: No `--brand-scale-*` token resolves to 46px. Used `calc(var(--brand-scale-1100) - var(--brand-scale-50))` = 48−2 = 46px.
- **Figma dot is an image asset**: The Figma file shows the dot as a raster image asset. Replaced with pure CSS (`border-radius: 50%`, `--shadow-subtle`).
- **No `checked-hover` mapped surface token prior to investigation**: Initial build used `--alias-primary-600` directly. Corrected to `--mapped-surface-primary-default-hover` after confirming the mapped token exists and resolves to `alias-primary-500` in dark mode (vs 600 in light mode) — dark-mode behaviour was wrong before the fix.

---

## Progress Stepper

**Figma node:** 275:4076 (Parts), 275:3988 (component)  
**Source frame:** `xhA5ARVgSeD3gA41lYDqST`

A horizontal series of fixed-width pill bars showing progress through a numbered sequence. Active bars (steps completed + current) render in primary blue; future bars render in neutral gray.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `totalSteps` | `number` | `7` | Number of bars to render |
| `currentStep` | `number` | `1` | Steps 1 through `currentStep` render as active |

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST`

A filter/selection pill rendered as a `<button>`. Two appearances (default on white; overlay on dark surfaces) × two sizes. The "selected" state maps to Figma's "Focus" visual (blue fill).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Tag'` | Visible text |
| `appearance` | `TagAppearance` | `'default'` | `'default'` \| `'overlay'` |
| `size` | `TagSize` | `'M'` | `'M'` \| `'S'` |
| `isSelected` | `boolean` | `false` | Blue fill — maps to Figma "Focus" state |
| `isDisabled` | `boolean` | `false` | |
| `iconBefore` | `ReactNode` | — | Leading icon slot |
| `iconAfter` | `ReactNode` | — | Trailing icon slot |
| `onClick` | `MouseEventHandler` | — | |

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
| Size M padding | `--brand-scale-100` (v) `--brand-scale-50` (h) | 4px / 2px |
| Size S padding | `--brand-scale-50` (all) | 2px |
| Icon/label gap | `--brand-scale-100` | 4px |

### Typography

| size | class | px |
|---|---|---|
| M | `type-body-sm` | 14px regular |
| S | `type-body-caption` | 12px regular |

### Known Figma inconsistencies

- **Hover/press tint backgrounds — no mapped subtle-primary-tint token exists**: `--mapped-surface-primary-default-subtle-hover` resolves to `alias-surface-50` (neutral gray), not a blue tint. Figma source uses `color.blue.50` (#e6f1ff ≈ 10% primary over white) for hover and `color.blue.100` (#cde2ff ≈ 20%) for press. **Superseding the earlier alias fallback**: now derived via `color-mix(in srgb, var(--mapped-border-primary-default) N%, transparent)` (10% hover / 20% press), matching the FilterChip precedent — this dark-flips correctly, whereas the previous `--alias-primary-50/100` were frozen across themes. Flag for a future Figma Variables addition of proper subtle-primary-tint tokens.
- **Overlay focus ring**: Now uses `--mapped-text-primary-on-color` (was hardcoded `white`). Overlay context is always dark, so it resolves to #ffffff either way; the token form keeps Tag free of raw color literals.

---

## Icon Object

**Figma node:** 221:20  
**Source frame:** `xhA5ARVgSeD3gA41lYDqST`

A container that pairs a colored background (circle or square) with an icon child. All 12 solid colors use their brand-400 level; the AI color uses a three-stop gradient.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `color` | `IconObjectColor` | `'gray'` | 12 solid + `'ai'` gradient — see table |
| `shape` | `IconObjectShape` | `'circle'` | `'circle'` \| `'square'` |
| `size` | `IconObjectSize` | `'xl'` | `'small'` \| `'medium'` \| `'large'` \| `'xl'` \| `'xxl'` |
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
| `small` | `--brand-scale-500` | 20px |
| `medium` | `--brand-scale-600` | 24px |
| `large` | `--brand-scale-800` | 32px |
| `xl` | `--brand-scale-1000` | 40px |
| `xxl` | `--brand-scale-1200` | 56px |

### Shape → border-radius

| shape | token | value |
|---|---|---|
| `circle` | `--brand-scale-1800` | 512px → always circular |
| `square` | `--brand-scale-200` | 8px |

### Icon color inheritance

Container sets `color: var(--mapped-text-primary-on-color)` (resolves to `#ffffff` in both light and dark). Child `<Icon>` SVGs use `fill="currentColor"` and inherit white.

### Known Figma inconsistencies

- **No mapped token for brand-400 backgrounds**: The 12 solid colors use brand-layer tokens directly. No `--mapped-surface-[color]-default` equivalents exist in the mapped layer for these specific colors/levels.
- **AI gradient**: Extracted from Figma as `linear-gradient(132.61deg, blue-400 → blue-500 → violet-500)`. Uses brand tokens, not alias or mapped.
- **`color: white` remaining hardcode**: The container still uses `color: white` to drive icon `currentColor` inheritance. Step 2 fixes were scoped to Toggle/Checkbox/Radio only. This should be replaced with `var(--mapped-text-primary-on-color)` (confirmed #ffffff in both modes) in a follow-up pass.

---

## Checkbox

**Figma node:** 148:2139 (component set), 148:2110 (Parts)  
**Source frame:** `xhA5ARVgSeD3gA41lYDqST`

A form control with three selection states (unchecked/checked/indeterminate) and error/required/disabled modifiers. Indeterminate state is set via `inputRef.current.indeterminate` in a `useEffect` — HTML does not support a declarative `indeterminate` attribute.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Label'` | |
| `size` | `CheckboxSize` | `'medium'` | `'medium'` \| `'large'` |
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
| Box-wrap (medium) | `24×24px` — `--brand-scale-600` would be 24px but expressed as literal in CSS |
| Box-wrap (large) | `32×32px` — `--brand-scale-800` |
| Visual box | `inset: 25%` inside box-wrap — medium: 12×12px; large: 16×16px |
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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST`

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 149:9246 (Parts documentation frame)

A single interactive tab unit. Intended to be composed inside a `Tabs` container with `role="tablist"`. Draws its label text directly — does not compose the Label component. No Icon or Badge instances.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Tab'` | Visible text |
| `isSelected` | `boolean` | `false` | Controlled by parent Tabs |
| `onClick` | `MouseEventHandler` | — | |
| `previewState` | `'hover' \| 'press' \| 'focus'` | — | Showcase-only: forces a visual state |
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

Focus ring: `--mapped-border-primary-default`, 2px outline, 0 offset, `border-radius: --brand-scale-300` (10px = Figma `border-radius/lg`)

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 149:9124 (Components documentation frame)

A controlled wrapper that composes multiple `Tab` instances inside a `role="tablist"` container. All visual tokens live in the child `Tab` component — `Tabs` itself has no surface, border, shadow, or typography tokens of its own.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tabs` | `TabItem[]` | — | Array of `{ id: string; label: string }` |
| `selectedId` | `string` | — | Controlled selected tab ID |
| `onChange` | `(id: string) => void` | — | Called on tab click |
| `ariaLabel` | `string` | — | `aria-label` on the `role="tablist"` div |

`TabItem` type: `{ id: string; label: string }`

### Nested components

- **`Tab`** (67:1987) — imported from `../Tab`. Each `TabItem` maps to one `<Tab>` with `isSelected`, `tabIndex` (roving), and `onClick` wired.

### Keyboard & ARIA

- **Roving tabindex**: exactly one tab is in the tab order (`tabIndex=0`) — the selected tab, or the first tab if selection is absent/unmatched; all others are `tabIndex=-1`, per the WAI-ARIA tablist pattern.
- **Arrow keys**: `ArrowRight`/`ArrowLeft` move selection (automatic activation) to the next/previous tab, wrapping at the ends, and move focus to that tab.
- **`aria-controls` removed**: the earlier build wired `aria-controls="panel-<id>"` to tabpanels that don't exist (Tabs renders no panels). The dangling reference was removed rather than pointing at absent elements. `Tab` retains an optional `ariaControls` prop for callers who *do* render real panels.

### Token mapping

No tokens consumed at the Tabs level. Container CSS:

```css
.tabs { display: flex; align-items: center; }
```

All token usage is delegated to `Tab`.

### Known Figma inconsistencies

- **Figma node 149:9124 is a Components documentation frame** containing a section header, label, and a single `Tabs` instance (70:1995) — the actual composable component. All annotation scaffolding (purple header, "Tab" label chip) is irrelevant to the code output.
- **Figma renders 4 hardcoded `Tab` children** in the Parts frame. In code, Tabs is data-driven via the `tabs` prop array.

---

## Button Group

**Figma node:** 70:2317 (`Button group`)
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 148:1570 (Components documentation frame)

A composite that pairs a leading "more actions" trigger with a row of primary action buttons. Figma models this as a `count` variant (`"2"` | `"3"`) with a fixed number of hardcoded `Button` children; the code version is data-driven via a `buttons` array so it supports any count ≥ 2, matching the pattern used for `Tabs`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `buttons` | `ButtonGroupItem[]` | — | Array of `{ label, id?, onClick?, disabled? }` — one `Button` per item |
| `onMoreClick` | `(e) => void` | — | Click handler for the leading `IconButton` trigger |
| `moreAriaLabel` | `string` | `'More actions'` | `aria-label` on the leading `IconButton` |
| `ariaLabel` | `string` | `'Button group'` | Accessible name for the wrapping `role="group"` |

`ButtonGroupItem` type: `{ label: string; id?: string; onClick?: MouseEventHandler; disabled?: boolean }`

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

## Filter Chips

**Figma node:** 12:137 (`filter/chips/toggle`, labeled "Toggle chip")
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 148:2290 (Components documentation frame)

A single-selection toggle chip — button-like pill that flips between an unselected outline state and a selected primary-tinted state. Component: `FilterChip` (singular), folder `src/components/FilterChips/`.

**Out of scope, not built:** the same documentation frame (148:2290) also contains a second, unrelated component — `Field` (228:1296), labeled "Chip" — a removable tag with an "×" affordance. It is not nested inside `filter/chips/toggle`, does not match our existing `Chips` component (a status/appearance tag, different purpose), and was explicitly excluded from this build. Noted for future consideration.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Chip'` | |
| `isSelected` | `boolean` | `false` | |
| `iconLeft` | `ReactNode` | — | Swappable icon slot |
| `iconRight` | `ReactNode` | — | Swappable icon slot |
| `onClick` | `(e) => void` | — | |
| `previewState` | `'hover' \| 'pressed' \| 'focus'` | — | Showcase only, forces a visual state |

### Variant × state → token mapping

| Figma variant | Border | Background | Label text |
|---|---|---|---|
| `default`, any icon combo | `--mapped-border-subtle-default` | transparent | `--mapped-text-default-default` |
| `Selected`, any icon combo | `--mapped-border-primary-default` | `color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)` | `--mapped-text-primary-default` |

Icons are caller-supplied `ReactNode` slots (e.g. `<Icon name="..." />`), coloring via `currentColor` inheritance — no dedicated icon-color token needed.

### Geometry

| Property | Token | Px |
|---|---|---|
| Border width | `--brand-scale-25` | 1px |
| Border radius | `--brand-scale-200` | 8px |
| Vertical padding (all variants) | `--brand-scale-300` | 12px |
| Horizontal padding, no icons | `--brand-scale-400` both sides | 16px / 16px |
| Horizontal padding, one icon | `--brand-scale-300` (icon side) / `--brand-scale-400` (opposite side) | 12px / 16px |
| Horizontal padding, both icons | literal `10px` both sides (see inconsistency note) | 10px / 10px |
| Icon↔label gap (icon present) | `--brand-scale-200` | 8px |
| Icon size | `--brand-scale-400` | 16px |
| Focus outline width/offset | `--brand-scale-50` | 2px |

### Deliberate UX addition: hover/press states

Figma's source (12:137) defines only 2 states — `default` and `Selected` — with **no hover or press variant at all**, for either selection state. This differs from the Tab gap (where Figma defines hover/press but omits only the `hover+selected`/`press+selected` combo): here the omission is total.

**Decision:** added hover/press feedback for the **unselected** state only (`--mapped-surface-subtle-hover`/`-pressed` background, `--mapped-text-default-hover`/`-pressed` text). No selected+hover/press combo was added, consistent with Tab's precedent of respecting Figma's omitted combos rather than inventing new ones.

This is a **case-by-case UX call, not a CLAUDE.md mandate and not an automatic extension of the Tag precedent** — CLAUDE.md's "map interaction states to tokens" rule governs which token layer to use once a state is needed, it does not mandate inventing states absent from Figma. Future components with similarly sparse interaction-state source should be evaluated individually, not assumed to get the same treatment automatically.

### Known Figma inconsistencies

- **Figma node 148:2290 is a Components documentation frame** containing two unrelated components ("Toggle chip" / `filter/chips/toggle` and "Chip" / `Field`) plus section-header/label scaffolding. Only `filter/chips/toggle` (12:137) is in scope here.
- **Property value typos in the component set itself**: `iconLeft`/`iconRight` Figma variant values are inconsistently named `"True"` / `"False"` / `"Fals"` (typo) across different variant combinations — a source-side naming defect, not a code issue. Normalized to booleans in the React API.
- **Both-icons horizontal padding is a literal `10px`** in the Figma-generated code, not a value on our `--brand-scale` ramp (nearest: `--brand-scale-200`=8px, `--brand-scale-300`=12px). No token matches. Recorded as a literal per design source rather than a derived `calc()` — a prior draft used `calc((--brand-scale-200 + --brand-scale-300) / 2)` to reverse-engineer 10px, which was rejected as dishonest curve-fitting (implies a token relationship that doesn't exist). Flag for a future Figma Variables fix to align this value to the scale.
- **Selected-state background has no matching opacity/tint token**: Figma uses `rgba(4,110,255,0.1)` (10%-opacity primary blue), and no rgba/opacity token exists anywhere in the token source. Resolved with `color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)` — derived from a real mapped token (dark-mode safe) rather than a hardcoded rgba(). **First use of `color-mix()` in this codebase** — accepted as the standard pattern for future missing-opacity-token cases. Flag for a future Figma Variables addition of a proper tint/overlay token.

---

## Link

**Figma node:** 73:128 (`❖ Link`)
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 73:123 (Components documentation frame)

A leaf hyperlink component — renders a real `<a>` tag. Built as a dependency for Breadcrumbs. No nested component instances (icons come through the `iconBefore`/`iconAfter` slots below, and a hidden non-visual Figma artifact is excluded from the build — see inconsistencies below).

**Revised for Breadcrumbs (post-initial-build):** `iconBefore`/`iconAfter` were originally booleans hardcoding an `open_in_new` icon internally — this violated the composition rule that swappable content must be exposed as `ReactNode` slots, not hardcoded behind a flag. Discovered when Breadcrumbs turned out to reuse the same `❖ Link` part with different icons per instance (`home`, `chevron_right`, none). Fixed to `React.ReactNode`, defaulting to `open_in_new` (preserves original standalone-Link behavior); pass `null` to render no icon. Also added `isCurrent?: boolean` for Breadcrumbs' terminal item (see its own entry).

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Link'` | |
| `href` | `string` | `'#'` | |
| `appearance` | `'default' \| 'subtle' \| 'inverse'` | `'default'` | |
| `size` | `'S' \| 'M'` | `'S'` | See size-inversion note below |
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
| Icon size (both S and M link sizes) | `Icon size="s"` → `--brand-scale-400` | 16px |
| Focus outline width/offset | `--brand-scale-50` | 2px |
| Typography, Size=S | `.type-body-sm` | 14px / 20px, regular |
| Typography, Size=M | `.type-body-caption` | 12px / 16px, regular |

### Known Figma inconsistencies

- **`Size=M` renders smaller than `Size=S`** (12px vs 14px) — backwards from the usual S<M convention. Preserved literally in the `size: 'S' | 'M'` prop rather than silently relabeling; naming is confirmed from source, not a code defect.
- **Hover+visited reuses the plain `--mapped-text-interactive-default` token** instead of the existing `--mapped-text-interactive-default-hover` — confirmed via the actual Figma instance (73:171), not a code shortcut. Replicated exactly rather than "fixed."
- **`inverse` appearance never demonstrates `hasVisited=true`** in source — always renders `--mapped-text-primary-on-color` regardless of the `hasVisited` prop. If a caller passes `hasVisited` with `appearance="inverse"`, the prop is accepted but has no visual effect (matches source, not a bug).
- **Hidden `URL (Hidden)` element excluded from the build**: every Figma instance contains a non-visual paragraph (`opacity-0`, `size-[0.01px]`) carrying Atlassian tokens (`color.link`, `color.link.pressed`, `color.link.visited`, `color.text.subtle`, `color.text.inverse`) that don't exist in our token source. Confirmed via screenshot and design-context inspection that it renders nothing visible — treated as a Figma-internal artifact, not a missing-token gap requiring a fallback.

---

## Breadcrumbs

**Figma node:** 102:2959 (`Breadcrumbs`)
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 88:243 (Components documentation frame)

A composite that renders a sequence of `Link` instances (`appearance="subtle"`) separated by `chevron_right` icons, with an optional leading icon (e.g. `home`) on any item. No variants in source — a single fixed 3-item example instance.

### Nested components

- **`Link`** (from `../Link`) — one per breadcrumb item, `appearance="subtle"` `size="S"`.
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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 107:2970 (Components documentation frame)

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 149:2515 (Components documentation frame)

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 149:4539 (Components documentation frame)

The base of the input/select family — a **searchable combobox** trigger. Same
box as `Field` plus a built-in trailing chevron (`icon_chevron_expand_more`).
Rendered as `<div>` wrapping a real `<input role="combobox">`; the dropdown
`<Menu>` is an **app-provided slot** (Figma marks its own menu as a replaceable
example). First of three sets read from this frame; `Select / Transfer` and
`Select / Wallet Account` extend it via slots (built separately).

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
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 149:4539 (Components documentation frame)

Amount input + currency picker, used for currency/crypto transfers. Extends
`Select`'s combobox model: two independent slot-driven dropdowns (amount
menu, currency menu), both app-provided per Figma's own annotation.

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
  twice on a wrong premise (once inside the box, once beside it).

## Text area

**Figma node:** 53:2473 (`Text area` component set)
**Source frame:** `xhA5ARVgSeD3gA41lYDqST` node 149:7117 (Components documentation frame)

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
> this component. A real `Calendar`/date-grid component is deferred, same as
> `Menu`/`Option` was for `Select`.

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
| `placeholder` | `string` | `'mm/dd/yyyy'` | |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled |
| `onChange` | `(value: string) => void` | — | Passes the new string |
| `onClear` | `() => void` | — | Wired to the clear icon; falls back to clearing internal state if uncontrolled |
| `calendarSlot` | `React.ReactNode` | — | App-provided calendar, rendered below when open |
| `isOpen` / `onOpenChange` | `boolean` / fn | — | Controlled open state |
| `isDisabled` / `isInvalid` | `boolean` | `false` | |
| `id` | `string` | — | Forwarded to `<input>`; auto-generated via `useId()` if omitted |
| `name` | `string` | — | Forwarded to `<input>` |
| `ariaLabel` | `string` | — | This component has no visible label |
| `previewState` | `'hover' \| 'focus'` | — | Showcase only |

No `isRequired`, no `iconLeft` slot — neither exists in Figma's source. The
left icon toggle (`iconLeft`) is `false` in every one of the 14 variants,
mirroring the dormant `iconLeft` finding on `SelectWalletAccount`.

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
| `onSelect` | `() => void` | — | Fires on click, Enter, or Space |
| `iconSlot` | `React.ReactNode` | — | Leading badge for `default`/`crypto` — app-provided, not a fixed component (Figma names these `<element>`, a generic swappable slot; the raster demo images inside — a flag photo, a crypto coin logo — are placeholder content, not real component instances) |
| `showIcon` | `boolean` | `true` | Maps to Figma's `icon` toggle |
| `avatarSrc` / `avatarName` / `avatarInitials` | `string` | — | `type="account"` — forwarded to `Avatar` (`size="m"`, 32px, matches Figma exactly) |
| `trailingLabel` | `string` | `'Label'` | `type="account"` — text beside the trailing selection dot |
| `labelCrypto` / `labelWallet` / `labelAmount` / `labelAmountCrypto` | `string` | `'Crypto'` / `'Wallet'` / `'$0,000.00'` / `'0.00 ETH'` | `type="crypto"` |
| `id` | `string` | — | Forwarded to the row |
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
| `slotContent` | `React.ReactNode` | — | App-provided option list — typically a stack of `MenuItem` rows, each composited with others of the same `type` |
| `id` | `string` | — | |

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
| Card background | `--mapped-surface-elevation-default` (dark-flips) |
| Card radius | `--brand-scale-200` (8px) |
| Card padding | `--brand-scale-300` (12px) top/bottom, 0 sides |
| Card gap | `--brand-scale-200` (8px) |
| Search bar wrapper padding | `--brand-scale-200` (8px) horizontal |
| Search field | `Field` (unmodified) |

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
