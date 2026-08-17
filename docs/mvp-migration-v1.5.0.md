# Downstream migration note — v1.5.0

Guidance for the consumer re-pinning from `v1.4.0` to `v1.5.0`. Written from the
DS side; nothing here was verified against the MVP working tree, which this gate
did not open.

See [`CHANGELOG.md`](../CHANGELOG.md) for the full release entry and
[`component-tokens.md`](component-tokens.md) for per-token tables.

---

## 1 · Dark-theme baselines must be re-minted

40 mapped colour tokens changed. Every dark-theme visual baseline will diff. This
is the intended content of the release. 38 of the 40 are dark-only; the two
light-theme changes are `--mapped-surface-default-pressed` and
`--mapped-border-subtlest-hover`, both moving `#cacaca → #bdbdbd`.

Do not treat these diffs as regressions to be suppressed. The two clusters most
likely to show up widely are the 18 `-pressed` accent tokens (previously invisible
on black — one measured CR 1.77) and the 12 Primary/Interactive `default`/`hover`
tokens.

## 2 · `.mn-card-features--fill` now sets `flex: 1 1 0` itself

The MVP already sets the same three values on `.mvp-home__feature-row > *`.

**There is no conflict.** The values are identical, and the MVP's selector wins on
specificity regardless. But once `sizing='fill'` is in use the MVP declaration is
**redundant** and can be removed — the DS carries it.

Worth knowing why the DS sets it at all: dropping `width`/`max-width` alone leaves
the default `flex: 0 1 auto`, which sizes the tile to content and then floors it at
`min-width: 90px` — measurably **narrower** than `sizing='fixed'`, i.e. the
opposite of filling. The `flex` declaration is what makes the prop do its job.

`min-width: 90px` applies in **both** modes. If the MVP relies on tiles going
below 90px, that will not happen.

⚠️ **Do not verify this prop at a 375px viewport.** Three tiles fill a 343px
container exactly (`3 × 109 + 2 × 8 = 343 = 375 − 32`), so `fill` and `fixed`
render byte-identically there and the prop looks inert. Verify at 390 or wider.

## 3 · `barWidth='fill'` puts the bar flush to its container edge

`--shadow-medium` is `0 0 24px 0` — 24px blur, **no offset, no spread** — so the
ink box extends 24px beyond the element box on every side. A consumer owning a
16px gutter will have **8px of shadow bleeding off-viewport**.

**This is already true of the `hug` bar today**, which sits 3.5px inside a 343px
container and already bleeds past it. So it is not a regression and needs no fix —
but it should not come as a surprise during the re-mint. If a clean edge is wanted,
the container needs ≥24px of gutter.

Also note `fill` changes item geometry: items are no longer 64px wide. They divide
the bar (`flex: 1 1 0`) while the 16px gaps hold — 65.8px at a 343px container,
288.3px at 1233px. Item **height** stays 64px. This is a deliberate divergence from
Figma, which models a fixed 62px item and has no fill variant at all.

## 4 · `--mapped-gradient-*` is no longer ancestor-overridable

If the MVP overrides `--mapped-gradient-subtle` or `--mapped-gradient-default` on
a container and expects descendants to inherit it, **that stops working** — the
pair is now declared on `*`, so every element recomputes its own.

Override `--gradient-surface` instead, which is the supported seam:

```css
.mvp-screen { --gradient-surface: var(--mapped-surface-subtlest-default); }
```

With no override the two gradients resolve character-identically to v1.4.0, so a
consumer not overriding them needs no change.

This is what closes the scrim seam over a non-page surface — previously Δ6/channel
in light and Δ19/channel in dark.

## 5 · Two things that are NOT in this release

- **The frame max-width / content-column token.** Deliberately deferred to the MVP
  side: the linter that governs raw px is the MVP's `check-tokens.mjs` with its
  `token-exempt:` marker, so solving it here would solve it in the wrong repo.
  `--brand-scale` runs to 512px (step 1800), which is worth knowing before
  proposing an extension — the ~430px frame width is between steps 1700 (256px)
  and 1800 (512px), not above the ramp's ceiling.
- **`--mapped-text-error-default` reaching AA.** It measures 3.93 in dark, below
  4.5. It improved from 3.64 in light but does not pass. Logged, not fixed.
