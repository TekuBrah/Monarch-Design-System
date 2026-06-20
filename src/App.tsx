import { useState, useEffect } from 'react'
import './styles/globals.css'
import { brand, alias, mapped, spacing } from './tokens'

// ── Theme toggle ──────────────────────────────────────────────────────────────

function useTheme() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '')
  }, [dark])
  return { dark, toggle: () => setDark(d => !d) }
}

// ── Shared card styles ────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  width: '7.5rem', borderRadius: '0.5rem', overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const CARD_BODY: React.CSSProperties = { padding: '0.4rem 0.5rem', background: '#fff' }
const SWATCH_GRID: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }
const GROUP_LABEL: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#888', marginBottom: '0.5rem',
}
const SECTION: React.CSSProperties = { marginBottom: '2rem' }

// ── Brand swatches ────────────────────────────────────────────────────────────

function BrandSwatch({ scaleName, step, hex }: { scaleName: string; step: string; hex: string }) {
  const isFoundation = scaleName === 'foundations'
  const varName = isFoundation ? `--brand-${step}` : `--brand-${scaleName.toLowerCase()}-${step}`
  return (
    <div style={CARD}>
      <div style={{ background: hex, height: '3rem' }} />
      <div style={CARD_BODY}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>{isFoundation ? step : `${scaleName} ${step}`}</div>
        <div style={{ fontSize: '0.58rem', color: '#888', fontFamily: 'monospace', marginTop: '0.1rem' }}>{varName}</div>
        <div style={{ fontSize: '0.58rem', color: '#aaa', fontFamily: 'monospace' }}>{hex}</div>
      </div>
    </div>
  )
}

function BrandScaleRow({ name, steps }: { name: string; steps: Record<string, string> }) {
  return (
    <section style={SECTION}>
      <h2 style={GROUP_LABEL}>{name}</h2>
      <div style={SWATCH_GRID}>
        {Object.entries(steps).map(([step, hex]) => (
          <BrandSwatch key={step} scaleName={name} step={step} hex={hex} />
        ))}
      </div>
    </section>
  )
}

// ── Alias swatches ────────────────────────────────────────────────────────────

function AliasSwatch({ groupName, step, brandVar }: { groupName: string; step: string; brandVar: string }) {
  const aliasVar = `--alias-${groupName.toLowerCase()}-${step}`
  return (
    <div style={CARD}>
      <div style={{ background: `var(${aliasVar})`, height: '3rem' }} />
      <div style={CARD_BODY}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>{groupName.toLowerCase()}-{step}</div>
        <div style={{ fontSize: '0.58rem', color: '#888', fontFamily: 'monospace', marginTop: '0.1rem' }}>{aliasVar}</div>
        <div style={{ fontSize: '0.58rem', color: '#b07e00', fontFamily: 'monospace' }}>→ {brandVar.replace('--', '')}</div>
      </div>
    </div>
  )
}

function AliasGroupRow({ name, steps }: { name: string; steps: Record<string, string> }) {
  return (
    <section style={SECTION}>
      <h2 style={GROUP_LABEL}>{name}</h2>
      <div style={SWATCH_GRID}>
        {Object.entries(steps).map(([step, brandVar]) => (
          <AliasSwatch key={step} groupName={name} step={step} brandVar={brandVar} />
        ))}
      </div>
    </section>
  )
}

// ── Mapped tree — derived from flat slugs using a static structure manifest ────
// Slugs can't encode segment boundaries, so we match each (category, subgroup)
// prefix against the known structure from Mapped/Light.json. Subgroups are
// sorted by length (desc) during matching so longer names win over prefixes
// (e.g. "page-secondary" before "page", "subtlest" before "subtle").

type MEntry = { varName: string; stateLabel: string }
type MSubgroup = { name: string; entries: MEntry[] }
type MCategory = { name: string; subgroups: MSubgroup[] }

// Order mirrors Light.json; lowercase/hyphenated to match slugs.
const MAPPED_STRUCTURE: { cat: string; subs: string[] }[] = [
  { cat: 'text',    subs: ['on-color','primary','error','information','warning','success','disabled','default','subtlest','subtle','interactive'] },
  { cat: 'icon',    subs: ['primary','error','information','warning','success','disabled','default','subtlest','subtle','interactive'] },
  { cat: 'surface', subs: ['primary','page-secondary','page','subtlest','subtle','error','information','warning','success','disabled','interactive','default','elevation','overlay'] },
  { cat: 'border',  subs: ['primary','on-color','error','information','warning','success','disabled','subtlest','subtle','interactive','default'] },
  { cat: 'blanket', subs: ['on-color','default'] },
]

function buildMappedTree(): MCategory[] {
  const allEntries = Object.entries(mapped) as [string, string][]
  const claimed = new Set<string>()

  return MAPPED_STRUCTURE.map(({ cat, subs }) => {
    // Match slugs longest-subgroup-first to avoid prefix ambiguity
    const byLen = [...subs].sort((a, b) => b.length - a.length)
    const subMap = new Map<string, MEntry[]>()

    for (const sub of byLen) {
      const prefix = `${cat}-${sub}`
      const entries = allEntries
        .filter(([slug]) => !claimed.has(slug) && (slug === prefix || slug.startsWith(`${prefix}-`)))
        .map(([slug, varName]) => {
          claimed.add(slug)
          const stateLabel = slug === prefix ? sub : slug.slice(prefix.length + 1)
          return { varName: varName as string, stateLabel }
        })
      if (entries.length > 0) subMap.set(sub, entries)
    }

    // Restore display order (original Light.json order)
    const subgroups = subs
      .filter(sub => subMap.has(sub))
      .map(sub => ({ name: sub, entries: subMap.get(sub)! }))

    return { name: cat, subgroups }
  })
}

const MAPPED_TREE = buildMappedTree()
const MAPPED_TOTAL = MAPPED_TREE.reduce((n, c) => n + c.subgroups.reduce((m, s) => m + s.entries.length, 0), 0)

// ── Mapped section components ─────────────────────────────────────────────────

const SUBGROUP_LABEL: React.CSSProperties = {
  fontSize: '0.63rem', fontWeight: 600,
  color: 'var(--mapped-text-subtle-default, #888)',
  marginBottom: '0.4rem', marginTop: '1rem',
}

function MappedStateCard({ varName, stateLabel }: MEntry) {
  return (
    <div style={CARD}>
      <div style={{ background: `var(${varName})`, height: '3rem' }} />
      <div style={{ ...CARD_BODY, background: 'var(--mapped-surface-elevation-default, #fff)' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--mapped-text-default-default, #333)', wordBreak: 'break-all' }}>
          {stateLabel}
        </div>
        <div style={{ fontSize: '0.55rem', color: 'var(--mapped-text-subtle-default, #888)', fontFamily: 'monospace', marginTop: '0.15rem', wordBreak: 'break-all' }}>
          {varName}
        </div>
      </div>
    </div>
  )
}

function MappedSubgroupCluster({ name, entries }: MSubgroup) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={SUBGROUP_LABEL}>{name}</div>
      <div style={SWATCH_GRID}>
        {entries.map(e => <MappedStateCard key={e.varName} {...e} />)}
      </div>
    </div>
  )
}

function MappedCategorySection({ name, subgroups }: MCategory) {
  return (
    <section style={SECTION}>
      <h2 style={{ ...GROUP_LABEL, color: 'var(--mapped-text-subtlest-subtlest, #888)' }}>{name}</h2>
      {subgroups.map(sg => <MappedSubgroupCluster key={sg.name} {...sg} />)}
    </section>
  )
}

// ── Spacing bars ─────────────────────────────────────────────────────────────

function SpacingSection() {
  return (
    <div style={{ maxWidth: '480px' }}>
      {Object.entries(spacing).map(([step, varName]) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.63rem', fontFamily: 'monospace', color: '#888', minWidth: '10rem', textAlign: 'right' }}>
            {varName}
          </span>
          {step === 'none'
            ? <span style={{ fontSize: '0.63rem', color: '#bbb', fontFamily: 'monospace' }}>0</span>
            : <div style={{ height: '1.5rem', width: `var(${varName})`, background: 'var(--alias-primary-500, #046eff)', borderRadius: '2px', minWidth: '2px' }} />
          }
        </div>
      ))}
    </div>
  )
}

// ── Typography samples ────────────────────────────────────────────────────────

const TYPOGRAPHY_HEADERS = [
  'type-header-h1', 'type-header-h2', 'type-header-h3',
  'type-header-h4', 'type-header-h5', 'type-header-h6',
] as const

const TYPOGRAPHY_BODY = [
  'type-body-lg', 'type-body-lg-medium', 'type-body-lg-semibold', 'type-body-lg-link',
  'type-body-m', 'type-body-m-medium', 'type-body-m-semibold', 'type-body-m-link',
  'type-body-sm', 'type-body-sm-medium', 'type-body-sm-semibold', 'type-body-sm-link',
  'type-body-caption', 'type-body-caption-medium', 'type-body-caption-semibold', 'type-body-caption-link',
] as const

function TypographySection() {
  return (
    <>
      <section style={SECTION}>
        <h2 style={GROUP_LABEL}>Headings — H1–H6 (responsive, resize past 768 px)</h2>
        {TYPOGRAPHY_HEADERS.map(cls => (
          <div key={cls} style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#aaa', marginBottom: '0.1rem' }}>.{cls}</div>
            <div className={cls}>The quick brown fox</div>
          </div>
        ))}
      </section>
      <section style={SECTION}>
        <h2 style={GROUP_LABEL}>Body</h2>
        {TYPOGRAPHY_BODY.map(cls => (
          <div key={cls} style={{ marginBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#aaa', marginBottom: '0.1rem' }}>.{cls}</div>
            <div className={cls}>The quick brown fox jumps over the lazy dog.</div>
          </div>
        ))}
      </section>
    </>
  )
}

// ── Responsive type samples ───────────────────────────────────────────────────

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
const COPY_STYLES = ['body-lg', 'body', 'body-sm', 'caption'] as const

function ResponsiveTypeSection() {
  return (
    <>
      <section style={SECTION}>
        <h2 style={GROUP_LABEL}>Headings (H1–H4 scale up at 768px)</h2>
        {HEADINGS.map(h => (
          <div key={h} style={{
            fontSize: `var(--responsive-font-headings-${h}-text-size)`,
            lineHeight: `var(--responsive-font-headings-${h}-line-height)`,
            marginBottom: '0.75rem',
            fontWeight: 700,
          }}>
            {h.toUpperCase()} — The quick brown fox
          </div>
        ))}
      </section>
      <section style={SECTION}>
        <h2 style={GROUP_LABEL}>Copy</h2>
        {COPY_STYLES.map(s => (
          <div key={s} style={{
            fontSize: `var(--responsive-font-copy-${s}-text-size)`,
            lineHeight: `var(--responsive-font-copy-${s}-line-height)`,
            marginBottom: '1rem',
          }}>
            <span style={{ fontWeight: 700, color: '#aaa', fontSize: '0.6rem', fontFamily: 'monospace', marginRight: '0.5rem' }}>
              {s}
            </span>
            The quick brown fox jumps over the lazy dog.
          </div>
        ))}
      </section>
    </>
  )
}

// ── Data assembly ─────────────────────────────────────────────────────────────

const brandScales: [string, Record<string, string>][] = []
let brandFoundations: Record<string, string> = {}
for (const [name, group] of Object.entries(brand) as [string, Record<string, unknown>][]) {
  if (name === 'foundations') brandFoundations = group as Record<string, string>
  else if (name !== 'Scale') brandScales.push([name, group as Record<string, string>])
}

const aliasGroups = Object.entries(alias) as [string, Record<string, string>][]

// ── App ───────────────────────────────────────────────────────────────────────

const HR: React.CSSProperties = { border: 'none', borderTop: '2px solid rgba(128,128,128,0.2)', margin: '2rem 0 2.5rem' }

export default function App() {
  const { dark, toggle } = useTheme()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Sticky toggle bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '0.5rem 2rem',
        background: dark ? '#111' : '#f0f0f0',
        borderBottom: '1px solid rgba(128,128,128,0.2)',
      }}>
        <button
          onClick={toggle}
          style={{
            padding: '0.35rem 0.9rem', borderRadius: '999px', border: 'none',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: dark ? '#fff' : '#111', color: dark ? '#111' : '#fff',
            transition: 'all 0.15s',
          }}
        >
          {dark ? '☀ Light mode' : '☾ Dark mode'}
        </button>
      </div>

      {/* ── Brand primitives ── */}
      <div style={{ padding: '2rem', background: '#f9f9f9' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
          Brand Primitives
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
          Brand/Value.json — {brandScales.length} color scales + foundations
        </p>
        {brandScales.map(([name, steps]) => (
          <BrandScaleRow key={name} name={name} steps={steps} />
        ))}
        <BrandScaleRow name="foundations" steps={brandFoundations} />
      </div>

      <hr style={HR} />

      {/* ── Alias / Semantic ── */}
      <div style={{ padding: '0 2rem 2rem', background: '#f9f9f9' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
          Alias / Semantic
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
          Alias/Alias.json — {aliasGroups.length} groups — alias → brand token
        </p>
        {aliasGroups.map(([name, steps]) => (
          <AliasGroupRow key={name} name={name} steps={steps} />
        ))}
      </div>

      <hr style={HR} />

      {/* ── Mapped / Semantic surfaces — themed ── */}
      <div style={{
        padding: '2rem',
        background: 'var(--mapped-surface-page, #fff)',
        transition: 'background 0.2s',
      }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
          Mapped / Semantic surfaces
        </h1>
        <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          Mapped/Light.json + Dark.json — {MAPPED_TOTAL} tokens — toggle above to flip modes
        </p>
        <p style={{ color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontSize: '0.75rem', marginBottom: '2rem' }}>
          Current mode: <strong style={{ color: 'var(--mapped-text-primary-default)' }}>{dark ? 'dark' : 'light'}</strong>
        </p>

        {MAPPED_TREE.map(cat => <MappedCategorySection key={cat.name} {...cat} />)}
      </div>

      <hr style={HR} />

      {/* ── Spacing scale ── */}
      <div style={{ padding: '2rem', background: '#f9f9f9' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
          Spacing scale
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
          --spacing-* → var(--brand-scale-*) in px &nbsp;·&nbsp; {Object.keys(spacing).length} tokens
        </p>
        <SpacingSection />
      </div>

      <hr style={HR} />

      {/* ── Responsive type ── */}
      <div style={{ padding: '2rem', background: '#f9f9f9' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
          Responsive type
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
          Base values: mobile. Resize past 768px to see headings change (H1–H4 + body-sm grow).
        </p>
        <ResponsiveTypeSection />
      </div>

      <hr style={HR} />

      {/* ── Typography ── */}
      <div style={{ padding: '2rem', background: '#fff' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
          Typography
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
          22 composite styles — Poppins 400 / 500 / 600 — headings responsive at 768 px
        </p>
        <TypographySection />
      </div>

    </div>
  )
}
