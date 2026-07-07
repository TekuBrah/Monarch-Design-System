import { useState, useEffect } from 'react'
import './styles/globals.css'
import { brand, alias, mapped, spacing, gradients, shadows } from './tokens'
import { Badge } from './components/Badge'
import type { BadgeAppearance } from './components/Badge'
import { Button } from './components/Button'
import type { ButtonVariant, ButtonAppearance as BtnAppearance } from './components/Button'
import { ElementWrapper } from './components/ElementWrapper'
import type { ElementWrapperSize } from './components/ElementWrapper'
import { IconButton } from './components/IconButton'
import type { IconButtonSize } from './components/IconButton'
import { Icon } from './components/Icon'
import type { IconName } from './components/Icon'
import { Avatar } from './components/Avatar'
import type { AvatarSize } from './components/Avatar'
import { Logo, LOGOS_BY_CATEGORY } from './components/Logo'
import { Blanket } from './components/Blanket'
import { Divider } from './components/Divider'
import { Chips } from './components/Chips'
import type { ChipsAppearance } from './components/Chips'
import { Label } from './components/Label'
import { Toggle } from './components/Toggle'
import { ProgressStepper } from './components/ProgressStepper'
import { Tag } from './components/Tag'
import type { TagAppearance } from './components/Tag'
import { IconObject } from './components/IconObject'
import type { IconObjectColor, IconObjectSize } from './components/IconObject'
import { Checkbox } from './components/Checkbox'
import { Radio } from './components/Radio'
import { Tab } from './components/Tab'
import { Tabs } from './components/Tabs'
import { ButtonGroup } from './components/ButtonGroup'
import { FilterChip } from './components/FilterChips'
import { Link } from './components/Link'
import { Breadcrumbs } from './components/Breadcrumbs'
import { Loader } from './components/Loader'
import { Field } from './components/Field'

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

// ── Gradient swatches ────────────────────────────────────────────────────────

function GradientCard({ name, token }: { name: string; token: { var: string; value: string; description: string } }) {
  const TILE: React.CSSProperties = {
    position: 'relative', width: '10rem', height: '6rem', borderRadius: '0.4rem', overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)',
  }
  const OVERLAY: React.CSSProperties = {
    position: 'absolute', inset: 0, background: `var(${token.var})`,
  }
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#333', marginBottom: '0.2rem' }}>{name}</div>
      <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#888', marginBottom: '0.1rem' }}>{token.var}</div>
      {token.description && (
        <div style={{ fontSize: '0.6rem', color: '#aaa', marginBottom: '0.5rem' }}>{token.description}</div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: '#aaa', marginBottom: '0.2rem' }}>light bg</div>
          <div style={{ ...TILE, background: '#e5e7eb' }}>
            <div style={OVERLAY} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.55rem', color: '#aaa', marginBottom: '0.2rem' }}>dark bg</div>
          <div style={{ ...TILE, background: '#1b1e21' }}>
            <div style={OVERLAY} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shadow cards ──────────────────────────────────────────────────────────────

type ShadowToken = { var: string; value: string; description: string }

function ShadowCard({ name, token }: { name: string; token: ShadowToken }) {
  const TILE: React.CSSProperties = {
    width: '10rem', height: '5rem', borderRadius: '0.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.6rem', fontFamily: 'monospace', color: '#888',
  }
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#333', marginBottom: '0.2rem' }}>{name}</div>
      <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#888', marginBottom: '0.1rem' }}>{token.var}</div>
      {token.description && (
        <div style={{ fontSize: '0.6rem', color: '#aaa', marginBottom: '0.6rem' }}>{token.description}</div>
      )}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: '#aaa', marginBottom: '0.4rem' }}>light surface</div>
          <div style={{ ...TILE, background: '#ffffff', boxShadow: `var(${token.var})` }}>
            {token.var}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.55rem', color: '#aaa', marginBottom: '0.4rem' }}>dark surface</div>
          <div style={{ ...TILE, background: '#1b1e21', color: '#555', boxShadow: `var(${token.var})` }}>
            {token.var}
          </div>
        </div>
      </div>
    </div>
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

// ── Blanket demo (owns its own toggle state) ──────────────────────────────────

function BlanketDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '1rem' }}>
        Click to show the fixed overlay — click again or press the button to close.
      </p>
      <Button variant="secondary" size="m" label="Show Blanket" onClick={() => setOpen(true)} />
      {open && (
        <>
          <Blanket onClick={() => setOpen(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'var(--mapped-surface-elevation-default)', borderRadius: 'var(--brand-scale-200)',
            padding: '2rem', zIndex: 101, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>
            <span className="type-body-m-semibold" style={{ color: 'var(--mapped-text-default-default)' }}>
              Blanket is visible
            </span>
            <Button variant="primary" size="s" label="Close" onClick={() => setOpen(false)} />
          </div>
        </>
      )}
      <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--brand-scale-200)', background: 'var(--mapped-surface-subtle-default)' }}>
        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtle-default)' }}>
          Token: --mapped-blanket-default-default — light #091e427d · dark #10121499
        </span>
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

const HR: React.CSSProperties = { border: 'none', borderTop: '2px solid rgba(128,128,128,0.2)', margin: '2rem 0 2.5rem' }

export default function App() {
  const { dark, toggle } = useTheme()
  const [tab, setTab] = useState<'foundations' | 'components'>('components')
  const [tabsSelected, setTabsSelected] = useState('overview')
  const [filterChipsSelected, setFilterChipsSelected] = useState<Record<string, boolean>>({ chip2: true })

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '0.35rem 0.9rem', borderRadius: '999px', border: 'none',
        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
        background: tab === id ? (dark ? '#fff' : '#111') : 'transparent',
        color: tab === id ? (dark ? '#111' : '#fff') : (dark ? '#888' : '#555'),
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Sticky bar — tabs left, toggle right */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 2rem',
        background: dark ? '#111' : '#f0f0f0',
        borderBottom: '1px solid rgba(128,128,128,0.2)',
      }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {tabBtn('foundations', 'Foundations')}
          {tabBtn('components', 'Components')}
        </div>
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

      {/* ── FOUNDATIONS TAB ── */}
      {tab === 'foundations' && (
        <>
          {/* Brand primitives */}
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

          {/* Alias / Semantic */}
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

          {/* Mapped / Semantic surfaces */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
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

          {/* Spacing scale */}
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

          {/* Responsive type */}
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

          {/* Typography */}
          <div style={{ padding: '2rem', background: '#fff' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
              Typography
            </h1>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
              22 composite styles — Poppins 400 / 500 / 600 — headings responsive at 768 px
            </p>
            <TypographySection />
          </div>

          <hr style={HR} />

          {/* Gradients */}
          <div style={{ padding: '2rem', background: '#f9f9f9' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
              Gradients
            </h1>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Brand/Value.json → Gradient — {Object.keys(gradients).length} tokens — shown over light + dark backgrounds
            </p>
            {(Object.entries(gradients) as [string, { var: string; value: string; description: string }][]).map(
              ([name, token]) => <GradientCard key={name} name={name} token={token} />
            )}
          </div>

          <hr style={HR} />

          {/* Shadows / Effects */}
          <div style={{ padding: '2rem', background: '#f0f2f4' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
              Shadows / Effects
            </h1>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Brand/Value.json → Dropshadow_* — {Object.keys(shadows).length} tokens — shown over light + dark surfaces
            </p>
            {(Object.entries(shadows) as [string, ShadowToken][]).map(
              ([name, token]) => <ShadowCard key={name} name={name} token={token} />
            )}
          </div>
        </>
      )}

      {/* ── COMPONENTS TAB ── */}
      {tab === 'components' && (
        <>
          {/* Badge */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Badge
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              7 appearances × 2 types — tokens only — responds to light/dark toggle
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.4rem 1rem 0.4rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>appearance</th>
                  <th style={{ textAlign: 'left', padding: '0.4rem 1rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>type=default</th>
                  <th style={{ textAlign: 'left', padding: '0.4rem 1rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>type=dot</th>
                </tr>
              </thead>
              <tbody>
                {(['default', 'primary', 'inverted', 'important', 'added', 'removed', 'dark'] as BadgeAppearance[]).map(ap => (
                  <tr key={ap}>
                    <td style={{ padding: '0.5rem 1rem 0.5rem 0', color: 'var(--mapped-text-subtle-default, #888)' }}>{ap}</td>
                    <td style={{ padding: '0.5rem 1rem' }}><Badge appearance={ap} type="default" label="25" /></td>
                    <td style={{ padding: '0.5rem 1rem', verticalAlign: 'middle' }}><Badge appearance={ap} type="dot" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr style={HR} />

          {/* Element Wrapper */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Element Wrapper
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              7 sizes — square centering shell for Icon / Avatar / Logo — tokens only
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {(['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'] as ElementWrapperSize[]).map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <ElementWrapper size={size}>
                    {/* placeholder SVG — fills the wrapper */}
                    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="1" y="1" width="22" height="22" rx="3" stroke="var(--mapped-border-primary-default, #046eff)" strokeWidth="1.5" strokeDasharray="4 2" />
                      <circle cx="12" cy="12" r="3" fill="var(--mapped-surface-primary-default, #046eff)" />
                    </svg>
                  </ElementWrapper>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>{size}</span>
                </div>
              ))}
            </div>
          </div>

          <hr style={HR} />

          {/* Icon Button */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Icon Button
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              3 variants × 2 appearances × 3 sizes — same token matrix as Button — states forced for preview
            </p>

            {/* Default appearance — table per size */}
            {(['s', 'm', 'l'] as IconButtonSize[]).map(size => (
              <div key={size} style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                  Size {size.toUpperCase()} — appearance: default
                </p>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>state</th>
                      {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(v => (
                        <th key={v} style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{v}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      [undefined,   'default'],
                      ['hover',     'hover'],
                      ['pressed',   'pressed'],
                      ['focus',     'focus'],
                    ] as const).map(([ps, label]) => (
                      <tr key={label}>
                        <td style={{ padding: '0.4rem 1.5rem 0.4rem 0', color: 'var(--mapped-text-subtle-default, #888)' }}>{label}</td>
                        {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(variant => (
                          <td key={variant} style={{ padding: '0.4rem 1.5rem 0.4rem 0' }}>
                            <IconButton variant={variant} size={size} icon={<Icon name="add" size="l" />} ariaLabel={variant} previewState={ps} />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '0.4rem 1.5rem 0.4rem 0', color: 'var(--mapped-text-subtle-default, #888)' }}>disabled</td>
                      {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(variant => (
                        <td key={variant} style={{ padding: '0.4rem 1.5rem 0.4rem 0' }}>
                          <IconButton variant={variant} size={size} icon={<Icon name="add" size="l" />} ariaLabel={variant} disabled />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            {/* Inverse appearance */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
              Appearance: inverse (shown on colored surface)
            </p>
            <div style={{ background: 'var(--mapped-surface-primary-default)', padding: '1.5rem', borderRadius: 'var(--brand-scale-200)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(variant => (
                <IconButton key={variant} variant={variant} appearance="inverse" size="m" icon={<Icon name="add" size="l" />} ariaLabel={variant} />
              ))}
            </div>
          </div>

          <hr style={HR} />

          {/* Button */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Button
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              3 variants × 2 appearances × 3 sizes — tokens only — states forced for preview
            </p>

            {/* Default appearance — one table per size */}
            {(['s', 'm', 'l'] as const).map(size => (
              <div key={size} style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                  Size {size.toUpperCase()} — appearance: default
                </p>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>state</th>
                      {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(v => (
                        <th key={v} style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{v}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      [undefined,   'default'],
                      ['hover',     'hover'],
                      ['pressed',   'pressed'],
                      ['focus',     'focus'],
                    ] as const).map(([ps, label]) => (
                      <tr key={label}>
                        <td style={{ padding: '0.4rem 1.5rem 0.4rem 0', color: 'var(--mapped-text-subtle-default, #888)' }}>{label}</td>
                        {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(variant => (
                          <td key={variant} style={{ padding: '0.4rem 1.5rem 0.4rem 0' }}>
                            <Button variant={variant} size={size} label="Button"
                              leadingIcon={<Icon name="add" size={size} />}
                              trailingIcon={<Icon name="chevron_right" size={size} />}
                              previewState={ps}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '0.4rem 1.5rem 0.4rem 0', color: 'var(--mapped-text-subtle-default, #888)' }}>disabled</td>
                      {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(variant => (
                        <td key={variant} style={{ padding: '0.4rem 1.5rem 0.4rem 0' }}>
                          <Button variant={variant} size={size} label="Button"
                            leadingIcon={<Icon name="add" size={size} />}
                            trailingIcon={<Icon name="chevron_right" size={size} />}
                            disabled
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            {/* Inverse appearance — dark bg required */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
              Appearance: inverse (shown on colored surface)
            </p>
            <div style={{ background: 'var(--mapped-surface-primary-default)', padding: '1.5rem', borderRadius: 'var(--brand-scale-200)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map(variant => (
                <Button key={variant} variant={variant} appearance="inverse" size="m" label={variant}
                  leadingIcon={<Icon name="add" size="m" />}
                  trailingIcon={<Icon name="chevron_right" size="m" />}
                />
              ))}
            </div>
          </div>

          <hr style={HR} />

          {/* Icon */}
          {(() => {
            const GROUPS: { label: string; names: IconName[] }[] = [
              { label: 'Actions', names: ['add', 'remove', 'edit', 'delete', 'close', 'content_copy', 'refresh', 'share', 'download', 'upload', 'open_in_new', 'attach_file'] },
              { label: 'Navigation', names: ['home', 'menu', 'arrow_back', 'arrow_forward', 'arrow_upward', 'arrow_downward', 'chevron_left', 'chevron_right', 'expand_more', 'expand_less', 'unfold_more'] },
              { label: 'Search & Controls', names: ['search', 'filter_list', 'sort', 'settings', 'tune', 'more_vert', 'more_horiz'] },
              { label: 'Status & Feedback', names: ['info', 'warning', 'error', 'check_circle', 'check', 'done', 'cancel', 'help_outline', 'visibility', 'visibility_off'] },
              { label: 'People & Comms', names: ['person', 'account_circle', 'group', 'login', 'logout', 'notifications', 'mail'] },
              { label: 'App & Content', names: ['dashboard', 'calendar_today', 'schedule', 'link'] },
              { label: 'Ratings', names: ['star', 'star_border', 'favorite', 'favorite_border'] },
              { label: 'Form Controls', names: ['radio_button_unchecked', 'radio_button_checked', 'check_box', 'check_box_outline_blank'] },
            ]
            const CUSTOM_GROUPS: { label: string; names: IconName[] }[] = [
              { label: 'Finance & Accounts', names: ['icon_finance', 'icon_bank', 'icon_wallet', 'icon_stocks', 'icon_crypto', 'icon_gold', 'icon_battery_horizontal'] },
              { label: 'Transactions', names: ['icon_transfer', 'icon_receive', 'icon_buy_and_sell_crypto', 'icon_crypto_transfers'] },
              { label: 'Categories', names: ['icon_grocery', 'icon_grocery_1', 'icon_food', 'icon_car', 'icon_healthcare', 'icon_healthcare_1', 'icon_shopping', 'icon_bills'] },
              { label: 'Budgeting & Insights', names: ['icon_budget', 'icon_duration', 'icon_aiinsights', 'icon_aimage', 'icon_track_spending', 'icon_spending_alert', 'icon_scheduled_payments', 'icon_automatic_savings'] },
              { label: 'UI & Navigation', names: ['icon_home', 'icon_more', 'icon_chevron_expand_less', 'icon_chevron_expand_more', 'icon_triangle_up', 'icon_triangle_down'] },
              { label: 'Other', names: ['icon_pdf', 'icon_monarchacademy'] },
            ]
            const iconCell = (name: IconName) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <Icon name={name} size="m" />
                <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', maxWidth: '4rem', textAlign: 'center', wordBreak: 'break-all' }}>{name}</span>
              </div>
            )
            return (
              <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
                  Icon
                </h1>
                <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                  94 icons (59 Material Round + 35 Custom) — sized via --brand-scale-* — inherits currentColor
                </p>

                {GROUPS.map(({ label, names }) => (
                  <div key={label} style={{ marginBottom: '1.75rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                      {label}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
                      {names.map(iconCell)}
                    </div>
                  </div>
                ))}

                {/* Custom icons */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mapped-text-primary-default)', marginBottom: '1rem', marginTop: '0.25rem', borderTop: '1px solid var(--mapped-border-subtlest-default)', paddingTop: '1.5rem' }}>
                  Custom icons — currentColor normalized
                </p>
                {CUSTOM_GROUPS.map(({ label, names }) => (
                  <div key={label} style={{ marginBottom: '1.75rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                      {label}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
                      {names.map(iconCell)}
                    </div>
                  </div>
                ))}

                {/* currentColor test: custom icon inside a primary button */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                    currentColor test — custom inside primary button (should be white)
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="primary" size="m" label="Wallet" leadingIcon={<Icon name="icon_wallet" size="m" />} />
                    <Button variant="primary" size="m" label="Finance" leadingIcon={<Icon name="icon_finance" size="m" />} />
                    <Button variant="primary" size="m" label="Transfer" leadingIcon={<Icon name="icon_transfer" size="m" />} />
                  </div>
                </div>

                {/* Size comparison */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                  Sizes — s 16px · m 20px · l 24px
                </p>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
                  {(['s', 'm', 'l'] as const).map(sz => (
                    <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                      <Icon name="search" size={sz} />
                      <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>{sz}</span>
                    </div>
                  ))}
                </div>

                {/* Color inheritance */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                  Color inheritance
                </p>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="search" size="l" />
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>body</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--mapped-text-primary-default)' }}><Icon name="search" size="l" /></span>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>primary</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ background: 'var(--mapped-surface-primary-default)', padding: 'var(--brand-scale-200)', borderRadius: 'var(--brand-scale-200)', color: 'var(--mapped-text-primary-on-color)', display: 'inline-flex' }}>
                      <Icon name="search" size="l" />
                    </div>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>on-color</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--mapped-text-error-default-default, #c00)' }}><Icon name="error" size="l" /></span>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>error</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--mapped-text-success-default-default, #1a7a3a)' }}><Icon name="check_circle" size="l" /></span>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>success</span>
                  </div>
                </div>
              </div>
            )
          })()}

          <hr style={HR} />

          {/* Avatar */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Avatar
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              3 states (photo / initials / placeholder) × 3 sizes — tokens only
            </p>

            {(['l', 'm', 's'] as AvatarSize[]).map(size => (
              <div key={size} style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                  Size {size.toUpperCase()} — {size === 'l' ? '40px' : size === 'm' ? '32px' : '24px'}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Avatar size={size} src="https://i.pravatar.cc/80?img=47" alt="Sample photo" />
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>photo</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Avatar size={size} name="Margaret Green" />
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>initials (name)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Avatar size={size} initials="MG" />
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>initials (explicit)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Avatar size={size} />
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>placeholder</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr style={HR} />

          {/* Logo */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Logo
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              30 logos auto-registered from Assets/logo/ — full color preserved — no token coloring
            </p>

            {(['brand', 'crypto'] as const).map(category => (
              <div key={category} style={{ marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '1rem' }}>
                  {category}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                  {LOGOS_BY_CATEGORY[category].map(({ name }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0.5rem', borderRadius: 'var(--brand-scale-200)',
                        background: 'var(--mapped-surface-subtle-default, #f5f5f5)',
                        minWidth: '3rem',
                      }}>
                        <Logo name={name} size="m" />
                      </div>
                      <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', maxWidth: '4.5rem', textAlign: 'center', wordBreak: 'break-all' }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <hr style={HR} />

          {/* Blanket */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Blanket
            </h1>
            <BlanketDemo />
          </div>

          <hr style={HR} />

          {/* Divider */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Divider
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              2 weights × 2 orientations — token: --mapped-border-subtle-default
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>horizontal weight=1</span>
                <div style={{ marginTop: '0.5rem' }}><Divider weight={1} orientation="horizontal" /></div>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>horizontal weight=2</span>
                <div style={{ marginTop: '0.5rem' }}><Divider weight={2} orientation="horizontal" /></div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'stretch', height: '48px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>vertical w=1</span>
                  <Divider weight={1} orientation="vertical" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>vertical w=2</span>
                  <Divider weight={2} orientation="vertical" />
                </div>
              </div>
            </div>
          </div>

          <hr style={HR} />

          {/* Chips */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Chips
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              6 appearances × 2 bold states — lozenge / status badge — always shows done icon
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>appearance</th>
                  <th style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>subtle (isBold=false)</th>
                  <th style={{ textAlign: 'left', padding: '0.3rem 1.5rem 0.3rem 0', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>bold (isBold=true)</th>
                </tr>
              </thead>
              <tbody>
                {(['default', 'inprogress', 'moved', 'new', 'removed', 'success'] as ChipsAppearance[]).map(ap => (
                  <tr key={ap}>
                    <td style={{ padding: '0.5rem 1.5rem 0.5rem 0', color: 'var(--mapped-text-subtle-default, #888)' }}>{ap}</td>
                    <td style={{ padding: '0.5rem 1.5rem 0.5rem 0' }}><Chips appearance={ap} isBold={false} label={ap} /></td>
                    <td style={{ padding: '0.5rem 1.5rem 0.5rem 0' }}><Chips appearance={ap} isBold={true} label={ap} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr style={HR} />

          {/* Label */}
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
              Label
            </h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              2 sizes × optional required asterisk × optional leading/trailing icons
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(['M', 'S'] as const).map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>size={size}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                    <Label label="Label" size={size} />
                    <Label label="Required" size={size} isRequired />
                    <Label label="With icons" size={size}
                      iconBefore={<Icon name="help_outline" size={size === 'M' ? 'm' : 's'} />}
                      iconAfter={<Icon name="help_outline" size={size === 'M' ? 'm' : 's'} />}
                    />
                    <Label label="Required + icons" size={size} isRequired
                      iconBefore={<Icon name="help_outline" size={size === 'M' ? 'm' : 's'} />}
                      iconAfter={<Icon name="help_outline" size={size === 'M' ? 'm' : 's'} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Toggle ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Toggle</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              2 sizes × checked/unchecked × disabled — tokens: --mapped-surface-primary-default, --mapped-icon-subtlest-subtlest
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['regular', 'large'] as const).map(size => (
                <div key={size} style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '80px' }}>size={size}</span>
                  <Toggle size={size} isChecked={false} ariaLabel={`${size} unchecked`} />
                  <Toggle size={size} isChecked={true} ariaLabel={`${size} checked`} />
                  <Toggle size={size} isChecked={false} isDisabled ariaLabel={`${size} disabled unchecked`} />
                  <Toggle size={size} isChecked={true} isDisabled ariaLabel={`${size} disabled checked`} />
                </div>
              ))}
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)' }}>
                unchecked · checked · disabled unchecked · disabled checked
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── ProgressStepper ────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Progress Stepper</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              7 steps, active bar = --mapped-icon-primary-default · inactive = --mapped-surface-default-default
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 3, 5, 7].map(step => (
                <div key={step} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '80px' }}>step {step}/7</span>
                  <ProgressStepper totalSteps={7} currentStep={step} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Tag ────────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Tag</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              2 appearances × 2 sizes × states (hover/active via pseudo-classes) + selected + disabled
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['default', 'overlay'] as TagAppearance[]).map(ap => (
                <div key={ap} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', padding: ap === 'overlay' ? '0.75rem' : '0', background: ap === 'overlay' ? 'var(--mapped-text-default-default)' : 'transparent', borderRadius: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '80px', color: ap === 'overlay' ? 'white' : 'inherit' }}>{ap}</span>
                  <Tag appearance={ap} label="Tag M" size="M" iconBefore={<Icon name="filter_list" size="s" />} iconAfter={<Icon name="close" size="s" />} />
                  <Tag appearance={ap} label="Tag S" size="S" />
                  <Tag appearance={ap} label="Selected" size="M" isSelected />
                  <Tag appearance={ap} label="Disabled" size="M" isDisabled />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Icon Object ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Icon Object</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              13 colors × circle/square × 5 sizes — --brand-[color]-400 backgrounds, white icon via currentColor
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Colors (circle, xl)</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['slate', 'blue', 'gray', 'red', 'orange', 'green', 'teal', 'purple', 'cyan', 'yellow', 'lime', 'violet', 'ai'] as IconObjectColor[]).map(c => (
                    <IconObject key={c} color={c} shape="circle" size="xl"><Icon name="person" size="m" /></IconObject>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Sizes × shapes (blue)</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {(['small', 'medium', 'large', 'xl', 'xxl'] as IconObjectSize[]).map(sz => (
                    <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <IconObject color="blue" shape="circle" size={sz}><Icon name="person" size={sz === 'small' ? 's' : sz === 'medium' ? 's' : sz === 'large' ? 'm' : 'l'} /></IconObject>
                      <IconObject color="blue" shape="square" size={sz}><Icon name="person" size={sz === 'small' ? 's' : sz === 'medium' ? 's' : sz === 'large' ? 'm' : 'l'} /></IconObject>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{sz}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Checkbox ───────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Checkbox</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              medium / large × unchecked / checked / indeterminate × invalid × required × disabled
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(['medium', 'large'] as const).map(size => (
                <div key={size} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '60px' }}>{size}</span>
                  <Checkbox size={size} label="Unchecked" />
                  <Checkbox size={size} label="Checked" isChecked />
                  <Checkbox size={size} label="Indeterminate" isIndeterminate />
                  <Checkbox size={size} label="Invalid" isInvalid />
                  <Checkbox size={size} label="Required" isRequired />
                  <Checkbox size={size} label="Disabled" isDisabled />
                  <Checkbox size={size} label="Checked + disabled" isChecked isDisabled />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Radio ──────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Radio</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              unchecked / checked / invalid / required / disabled states — 14×14px radio circle inside 24px wrap
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Radio label="Unchecked" />
              <Radio label="Checked" isChecked />
              <Radio label="Invalid" isInvalid />
              <Radio label="Required" isRequired />
              <Radio label="Disabled" isDisabled />
              <Radio label="Checked + disabled" isChecked isDisabled />
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Tabs</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Controlled wrapper composing Tab instances — flex container, no tokens of its own
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem', width: 'fit-content' }}>
                <Tabs
                  tabs={[
                    { id: 'overview', label: 'Overview' },
                    { id: 'activity', label: 'Activity' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'members', label: 'Members' },
                  ]}
                  selectedId={tabsSelected}
                  onChange={setTabsSelected}
                  ariaLabel="Section navigation"
                />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)' }}>
                Selected: <strong>{tabsSelected}</strong> — click tabs above to switch
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Tab ────────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Tab</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              2 selection states × 4 interaction states — type-body-caption-semibold — tokens: --mapped-surface-primary-default-subtle, --mapped-border-primary-default
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>State matrix</div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem' }}>
                  <Tab label="Default" />
                  <Tab label="Selected" isSelected />
                  <Tab label="Hover" previewState="hover" />
                  <Tab label="Press" previewState="pressed" />
                  <Tab label="Focus" previewState="focus" />
                  <Tab label="Focus+Sel" isSelected previewState="focus" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Example group (Overview selected)</div>
                <div role="tablist" style={{ display: 'flex', gap: '0', padding: '0.25rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem', width: 'fit-content' }}>
                  <Tab label="Overview" isSelected />
                  <Tab label="Activity" />
                  <Tab label="Settings" />
                  <Tab label="Members" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Button Group ───────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Button Group</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Composite: leading IconButton (tertiary, more_horiz) + 2–N Button (primary, m) — data-driven via buttons prop
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Count = 2</div>
                <ButtonGroup ariaLabel="Example actions (2)" buttons={[{ id: 'a', label: 'Button' }, { id: 'b', label: 'Button' }]} />
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Count = 3</div>
                <ButtonGroup ariaLabel="Example actions (3)" buttons={[{ id: 'a', label: 'Button' }, { id: 'b', label: 'Button' }, { id: 'c', label: 'Button' }]} />
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Filter Chips ───────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Filter Chips</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              2 states × 4 icon combos — selected bg via color-mix() (no opacity token in source) — hover/press on unselected only (deliberate addition, see docs)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Default — icon combos</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem' }}>
                  <FilterChip label="Chip" />
                  <FilterChip label="Chip" iconLeft={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" iconRight={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" iconLeft={<Icon name="add" size="s" />} iconRight={<Icon name="close" size="s" />} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Selected — icon combos</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem' }}>
                  <FilterChip label="Chip" isSelected />
                  <FilterChip label="Chip" isSelected iconLeft={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" isSelected iconRight={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" isSelected iconLeft={<Icon name="add" size="s" />} iconRight={<Icon name="close" size="s" />} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Forced states (unselected)</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem' }}>
                  <FilterChip label="Default" />
                  <FilterChip label="Hover" previewState="hover" />
                  <FilterChip label="Pressed" previewState="pressed" />
                  <FilterChip label="Focus" previewState="focus" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Interactive example — click to toggle</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['chip1', 'chip2', 'chip3'].map(id => (
                    <FilterChip
                      key={id}
                      label={id}
                      isSelected={!!filterChipsSelected[id]}
                      onClick={() => setFilterChipsSelected(s => ({ ...s, [id]: !s[id] }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Link ───────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Link</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              3 appearances × 3 states × visited — Size=M renders smaller than Size=S (Figma source, not a bug) — leaf dependency for Breadcrumbs
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Default appearance — forced states</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem' }}>
                  <Link label="Default" />
                  <Link label="Hover" previewState="hover" />
                  <Link label="Pressed" previewState="pressed" />
                  <Link label="Focus" previewState="focus" />
                  <Link label="Visited" hasVisited />
                  <Link label="Visited hover" hasVisited previewState="hover" />
                  <Link label="Visited pressed" hasVisited previewState="pressed" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Subtle appearance</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--mapped-surface-default-default)', borderRadius: '0.5rem' }}>
                  <Link label="Default" appearance="subtle" />
                  <Link label="Hover" appearance="subtle" previewState="hover" />
                  <Link label="Pressed" appearance="subtle" previewState="pressed" />
                  <Link label="Visited" appearance="subtle" hasVisited />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Inverse appearance (on colored surface)</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem', background: 'var(--mapped-surface-primary-default)', borderRadius: '0.5rem' }}>
                  <Link label="Default" appearance="inverse" />
                  <Link label="Hover" appearance="inverse" previewState="hover" />
                  <Link label="Pressed" appearance="inverse" previewState="pressed" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Size comparison (S=14px, M=12px — Figma source naming)</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link label="Size S" size="S" />
                  <Link label="Size M" size="M" />
                  <Link label="No icons" iconBefore={null} iconAfter={null} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Breadcrumbs ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Breadcrumbs</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Composes Link (subtle) + Icon (chevron_right separator) — data-driven via items array — last item gets isCurrent (underline + aria-current)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>With leading home icon</div>
                <Breadcrumbs
                  items={[
                    { label: 'Home', href: '#', icon: <Icon name="home" size="s" /> },
                    { label: 'Settings', href: '#' },
                    { label: 'Profile', href: '#' },
                  ]}
                />
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Two items, no leading icon</div>
                <Breadcrumbs
                  items={[
                    { label: 'Dashboard', href: '#' },
                    { label: 'Reports', href: '#' },
                  ]}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Loader ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Loader</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              First CSS @keyframes animation in this codebase — 32px container + color confirmed from source; stroke width and rotation speed are estimates (see docs)
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Loader />
              <Loader ariaLabel="Loading transactions" />
            </div>
          </div>
        </>
      )}

      <hr style={HR} />

      {/* ── Field ──────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>Field</h1>
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Text input — Standard/Subtle × label × states × invalid/disabled/compact. Focus = 2px blue border + faint outer glow ring, persists until blur (:focus-within)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '540px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Field placeholder="Placeholder" ariaLabel="Default" leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                  <Field placeholder="Placeholder" ariaLabel="Hover" previewState="hover" leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                  <Field placeholder="Placeholder" ariaLabel="Focus" previewState="focus" leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                  <Field defaultValue="Filled value" ariaLabel="Filled" leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>With label · invalid · disabled</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Field label="Label" placeholder="Placeholder" leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                  <Field label="Label" placeholder="Placeholder" isInvalid leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                  <Field label="Label" placeholder="Placeholder" isDisabled leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Subtle · compact</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Field appearance="subtle" placeholder="Placeholder" ariaLabel="Subtle" leadingIcon={<Icon name="add" size="m" />} trailingIcon={<Icon name="add" size="m" />} />
                  <Field isCompact ariaLabel="Compact add" leadingIcon={<Icon name="add" size="m" />} />
                  <Field isCompact previewState="focus" ariaLabel="Compact focus" leadingIcon={<Icon name="add" size="m" />} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
