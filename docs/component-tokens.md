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
| hover | `--alias-primary-50` | `--mapped-border-primary-default-hover` | `--mapped-text-primary-default-hover` |
| press | `--alias-primary-100` | `--mapped-border-primary-default-pressed` | `--mapped-text-primary-default-pressed` |
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

- **Hover/press backgrounds (`alias-primary-50/100`) at alias layer**: No mapped token for subtle hover/press tint backgrounds (`--mapped-surface-primary-default-subtle-hover` resolves to `alias-surface-50`, not `alias-primary-50`). Figma source explicitly uses `color.blue.50` and `color.blue.100`. Alias fallback is intentional and confirmed against Figma; these will not dark-flip.
- **Overlay focus ring**: Uses hardcoded `white` for the focus outline — overlay context is always dark, so the token `--mapped-text-primary-on-color` (#ffffff) would resolve identically.
- **FilterChips (148:2279)**: Blocked during build — Figma desktop had wrong file open. Not built; not in this batch.

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
| `isRequired` | `boolean` | `false` | Appends `*` in error color |
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
| `isRequired` | `boolean` | `false` | Appends `*` in error color |
| `isDisabled` | `boolean` | `false` | |
| `onChange` | `() => void` | — | |
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

- **`Tab`** (67:1987) — imported from `../Tab`. Each `TabItem` maps to one `<Tab>` with `isSelected`, `ariaControls`, and `onClick` wired.

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
| `buttons` | `ButtonGroupItem[]` | — | Array of `{ label, onClick?, disabled? }` — one `Button` per item |
| `onMoreClick` | `(e) => void` | — | Click handler for the leading `IconButton` trigger |
| `moreAriaLabel` | `string` | `'More actions'` | `aria-label` on the leading `IconButton` |

`ButtonGroupItem` type: `{ label: string; onClick?: MouseEventHandler; disabled?: boolean }`

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
