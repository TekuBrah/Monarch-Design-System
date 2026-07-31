import type { ReactNode } from 'react'

/**
 * Showcase section wrapper.
 *
 * Extracted from 43 byte-identical inline blocks in App.tsx. This is showcase
 * chrome, not a design-system component — it is deliberately NOT exported from
 * the library barrel.
 *
 * CRITICAL: this renders exactly ONE outermost element. AppShell.css's
 * `.app-main > div` direct-child selector applies the width cap and centering
 * to every section; wrapping this in another element would silently drop
 * max-width/margin on all 43 sections with no error and no build failure.
 * Do not add a wrapper here.
 *
 * Styles are kept as inline objects rather than moved to a .css file so the
 * rendered output stays byte-identical to the blocks this replaced. The
 * "styling lives in a companion .css file" rule in CLAUDE.md governs
 * design-system components, whose CSS is audited by grep; App.tsx is
 * inline-styled throughout and the canonical wrapper is specified inline in
 * CLAUDE.md itself.
 */

export interface SectionProps {
  /** Slug, e.g. "button" — rendered as id="section-button". Must match the
   *  SIDEBAR_CATEGORIES slug: the scrollspy resolves these via getElementById. */
  id?: string
  title: string
  /** Optional — Blanket has no description.
   *  Deliberately kept as `string`, not ReactNode: the one section that needs
   *  richer intro content ("Mapped / Semantic surfaces") has TWO paragraphs
   *  with different styles, the first using a non-canonical 0.5rem margin.
   *  Widening the type would let it typecheck while still collapsing both into
   *  a single canonically-styled <p> — i.e. it would look like it fits while
   *  changing the rendering. That section passes its intro as children instead. */
  description?: string
  background?: 'page' | 'page-secondary' | 'subtle'
  /** Drops the top padding so a section reads as a continuation of the one
   *  above it ("Alias / Semantic" does this). Orthogonal to `background`. */
  noTopPadding?: boolean
  children: ReactNode
}

const BACKGROUNDS: Record<NonNullable<SectionProps['background']>, string> = {
  'page': 'var(--mapped-surface-page, #fff)',
  'page-secondary': 'var(--mapped-surface-page-secondary, #f9f9f9)',
  'subtle': 'var(--mapped-surface-subtle-default, #f2f2f2)',
}

export function Section({ id, title, description, background = 'page', noTopPadding, children }: SectionProps) {
  return (
    <div
      id={id ? `section-${id}` : undefined}
      style={{
        padding: noTopPadding ? '0 2rem 2rem' : '2rem',
        background: BACKGROUNDS[background],
        transition: 'background 0.2s',
      }}
    >
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
        {title}
      </h1>
      {description && (
        <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
