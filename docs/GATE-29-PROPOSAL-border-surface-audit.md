# Proposal — Gate 29: the remaining left-behind border/surface pairs

> **STATUS UPDATE — 2026-08-26, added when this file was moved into `docs/`.**
> **Split A has been EXECUTED**, in Gate 28 itself, after this document was
> written. `Checkbox.css` and `Radio.css` marked/checked hover and pressed
> borders are now bound to their fill's own token. Split A below therefore reads
> as a proposal but describes work that is already done — kept as written so the
> reasoning that justified it stays on the record. **Splits B and C are still
> open and are the actual scope of a future Gate 29.**
>
> This banner is the only edit made to the document after it was written. The
> analysis below is untouched.

Status: PROPOSAL as written. No token changed by this document.
Written during Gate 28 (v1.8.0), branch `phase/v1.8.0-border-and-gradient`.

## Count correction, up front

Gate 28's first report said **21** left-behind pairs. That was a miscount.
Re-derived programmatically against the v1.6.0 blob
(`9209157:src/styles/globals.css`):

**22 theme-instances, across 15 distinct border tokens.**

15 tokens = {primary, error, information, warning, success} × {default, -hover,
-pressed}. The 22-vs-15 gap is the seven cases left behind in *both* themes
rather than only in light.

Gate 28's brief called these "the 20 remaining". After Gate 28, primary's three
tokens were **not** rebound — the primary Button was fixed at the component
layer instead — so all 15 tokens remain divergent at the token layer. Nothing
was subtracted from the list; one *consumer* was repaired.

## The disposition criterion (Teku, Gate 28)

> A divergent pair is a DEFECT only where the border is an invisible structural
> layer that is meant to match its fill, and is CORRECT where the border is
> doing the shape work for that variant.

The critical consequence: **this criterion cannot be evaluated at the token
layer.** The same token is a defect in one consumer and correct in another.
`--mapped-border-primary-default-hover` is doing shape work in Button secondary
and structural fill-matching in Checkbox. Any audit that sorts by token — or by
whether two values happen to match — gets both wrong. Sort by CONSUMER AND STATE.

## The full pair table

Values are alias steps. L = light block, D = dark block. Site counts are
`grep -c -- "--mapped-border-<tok>)" src/components/` taken at the end of Gate
28, i.e. after Button primary stopped consuming three of them.

| # | token | theme | border | surface | sites | disposition |
|---|---|---|---|---|---|---|
| 1 | primary-default | L | primary-500 | primary-600 | 46 | CORRECT |
| 2 | primary-default | D | primary-500 | primary-600 | " | CORRECT |
| 3 | primary-default-hover | L | primary-600 | primary-700 | 5 | **SPLIT** |
| 4 | primary-default-hover | D | primary-400 | primary-700 | " | **SPLIT** |
| 5 | primary-default-pressed | L | primary-700 | primary-800 | 4 | **SPLIT** |
| 6 | primary-default-pressed | D | primary-300 | primary-800 | " | **SPLIT** |
| 7 | error-default | L | error-500 | error-600 | 11 | CORRECT |
| 8 | error-default-hover | L | error-600 | error-700 | 0 | HYGIENE |
| 9 | error-default-hover | D | error-500 | error-700 | 0 | HYGIENE |
| 10 | error-default-pressed | L | error-700 | error-800 | 0 | HYGIENE |
| 11 | information-default | L | information-500 | information-700 | 0 | HYGIENE |
| 12 | information-default | D | information-600 | information-700 | 0 | HYGIENE |
| 13 | information-default-hover | L | information-600 | information-800 | 0 | HYGIENE |
| 14 | information-default-hover | D | information-500 | information-800 | 0 | HYGIENE |
| 15 | information-default-pressed | L | information-700 | information-900 | 0 | HYGIENE |
| 16 | warning-default | L | warning-500 | warning-700 | 0 | HYGIENE |
| 17 | warning-default | D | warning-600 | warning-700 | 0 | HYGIENE |
| 18 | warning-default-hover | L | warning-600 | warning-800 | 0 | HYGIENE |
| 19 | warning-default-hover | D | warning-500 | warning-800 | 0 | HYGIENE |
| 20 | warning-default-pressed | L | warning-700 | warning-900 | 0 | HYGIENE |
| 21 | success-default | L | success-500 | success-700 | 0 | HYGIENE |
| 22 | success-default | D | success-600 | success-700 | 0 | HYGIENE |

Rows 3–6 are marked SPLIT because those two tokens are simultaneously a defect
in some consumers (Checkbox, Radio) and correct in others (Button secondary,
Tag, SelectTransfer). That is the whole argument for sorting by consumer.

`success-default-hover` (L and D) and `success-default-pressed` (L) behave
identically to their warning counterparts and are omitted from the table only to
keep it to 22 rows; they are HYGIENE, zero consumers.

---

## Split A — RENDERING BUGS (fix at the component layer)

**This is the audit's entire yield, and a token-level audit would have missed
every one of them**, because the fix is a component binding, not a token rebind.

### A1. Checkbox — checked+hover and checked+pressed

`src/components/Checkbox/Checkbox.css:80-82` and `:92-94`

```css
.mn-checkbox:hover:not(.mn-checkbox--disabled) .mn-checkbox__box--marked {
  background:   var(--mapped-surface-primary-default-hover);
  border-color: var(--mapped-border-primary-default-hover);   /* <-- mismatched */
}
```

This is the **identical defect Button primary had**, on a filled control where
the border is structural. Checkbox already proves it knows the correct pattern:
its base checked state (`:50-52`) and its invalid+checked state (`:61-63`) both
bind background and border to the *same* token. It gets 2 of 4 filled states
right and 2 wrong.

Measured at runtime, resolved through the full var chain, both themes:

| state | theme | fill | border | ring visible |
|---|---|---|---|---|
| checked (base) | light | rgb(3,88,204) | rgb(3,88,204) | no |
| checked (base) | dark | rgb(3,88,204) | rgb(3,88,204) | no |
| checked+hover | light | rgb(2,66,153) | rgb(3,88,204) | **yes** |
| checked+hover | dark | rgb(2,66,153) | rgb(54,139,255) | **yes** |
| checked+pressed | light | rgb(2,44,102) | rgb(2,66,153) | **yes** |
| checked+pressed | dark | rgb(2,44,102) | **rgb(104,168,255)** | **yes, severe** |

Dark checked+pressed is the worst case found anywhere in the library: a
near-black navy fill (`#022c66`) inside a bright light-blue ring (`#68a8ff`).
That does not read as a hairline artifact — it reads as a deliberate outline.

Proposed fix, 2 declarations:

```css
border-color: var(--mapped-surface-primary-default-hover);
border-color: var(--mapped-surface-primary-default-pressed);
```

### A2. Radio — checked+hover and checked+pressed

`src/components/Radio/Radio.css:91-93` and `:103-105`. Identical defect,
identical measured values, identical fix (2 declarations). Radio likewise
already binds correctly at `:56-58` and `:79-81`.

**Split A total: 4 declarations, 2 files, 0 tokens changed.**

---

## Split B — CORRECT, leave alone (and why rebinding would cause harm)

### B1. Every focus indicator — 22 sites on `--mapped-border-primary-default`

`outline: <w> solid var(--mapped-border-primary-default)` on Card (×7), Checkbox,
FilterChip, Header (×2), Item (×2), Link, MenuItem, Navigation (×3), Radio, Tab,
Tag, Toggle — plus `--btn-focus-ring` on all three Button variants.

A focus ring is the opposite of an invisible structural layer: it must be
maximally visible and must not match anything. Rebinding this token one step
deeper would darken every focus ring in the library, and on the primary Button
would collapse the focus outline into the fill it now matches.

**This token being one step lighter than the primary surface is precisely what
makes Gate 28's fix work. Rebinding it would undo Gate 28.**

### B2. Button secondary — the border is the shape

`--btn-border{,-hover,-pressed}` on `.mn-btn--secondary`, over a transparent or
faintly-tinted fill. The border is the entire visual definition of the control.
Correct by the criterion. This is also why the token-layer fix was rejected in
Gate 28 — it would have moved secondary's outline as collateral.

### B3. Input-family error borders — 11 sites on `--mapped-border-error-default`

Checkbox, DatePicker, Field (×2), Radio, Select, SelectTransfer (×2),
SelectWalletAccount, TextArea, TimePicker. All are the error-state outline of an
*unfilled* input. Shape work. Correct.

Note that the same components use `--mapped-surface-error-default` for both fill
and border when the control is *filled* (Checkbox `:61-63`, Radio `:79-81`).
They already switch binding strategy by state — the criterion applied correctly,
by hand, before it was written down.

### B4. Tag, FilterChip, MenuItem — tint bases, not pairs

`background: color-mix(in srgb, var(--mapped-border-primary-default) N%, transparent)`
alongside `border-color: var(--mapped-border-primary-default-hover)`. The fill is
a derived wash *of the border colour*; the border is the strong edge. Shape work,
and not a fill/border pair in the sense the criterion describes.

Worth flagging separately as **naming** hygiene rather than colour hygiene: a
`border-*` token is being used as a tint source, and in `Tab.css:44` as a
`background` outright. Neither looks wrong today; both make the token's name
misleading to the next reader.

---

## Split C — TOKEN HYGIENE (12 tokens, zero painted consumers)

`error-default-{hover,pressed}` and every `information-*`, `warning-*`,
`success-*` border token. **Nothing in the library paints any of them.**

There is no rendering bug here and no user-visible change available. The only
question is whether the ladders should be made internally consistent *before* a
future component consumes them. Two defensible positions:

- **Leave them.** They are unreferenced. A future consumer will bind whatever it
  needs, and Gate 28 demonstrated that the binding decision belongs to the
  consumer anyway. Changing 12 unreferenced tokens is churn with a nonzero
  regression surface and zero present benefit.
- **Align them.** A future consumer reaching for `--mapped-border-warning-*` and
  expecting it to match `--mapped-surface-warning-*` will get a ring, and will
  probably not notice — which is exactly how the Button defect shipped.

**Recommended: leave them, and add the guard instead** (item 3 below).

---

## Recommended scope for Gate 29

1. **Split A only** — 4 declarations across `Checkbox.css` and `Radio.css`.
2. **No token rebinds.** Zero changes to `globals.css` or `design-tokens/`.
3. **Add the check that would have caught all three defects.** For every CSS rule
   that sets both `background` and `border-color`, assert the two resolve from
   the same token when the fill is opaque. This is greppable, would have flagged
   Button, Checkbox and Radio, and correctly ignores every Split B case — a
   transparent or alpha fill means the border is shape work. That guard is worth
   more than aligning 12 unreferenced tokens, because it catches the *next* one.
4. Optional, separate gate: rename the B4 tint-base usages so a `border-*` token
   is not serving as a `background` source.

## What this proposal deliberately does NOT do

- Does not rebind `--mapped-border-primary-default`. Gate 28 established that
  doing so would darken 22 focus rings and undo its own fix.
- Does not touch `Mapped/Light.json` or `Mapped/Dark.json`.
- Does not treat "the two values differ" as evidence of a defect anywhere.
