import { useState, useEffect } from 'react'
import './AppShell.css'
import { Section } from './Section'
import { brand, alias, mapped, spacing, gradients, shadows } from '@monarch/design-system'
import { Badge } from '@monarch/design-system'
import type { BadgeAppearance } from '@monarch/design-system'
import { Button } from '@monarch/design-system'
import type { ButtonVariant } from '@monarch/design-system'
import { ElementWrapper } from '@monarch/design-system'
import type { ElementWrapperSize } from '@monarch/design-system'
import { IconButton } from '@monarch/design-system'
import type { IconButtonSize } from '@monarch/design-system'
import { Icon } from '@monarch/design-system'
import type { IconName } from '@monarch/design-system'
import { Avatar } from '@monarch/design-system'
import type { AvatarSize } from '@monarch/design-system'
import { Logo, LOGOS_BY_CATEGORY } from '@monarch/design-system'
import { Blanket } from '@monarch/design-system'
import { Divider } from '@monarch/design-system'
import { Chips } from '@monarch/design-system'
import type { ChipsAppearance } from '@monarch/design-system'
import { Label } from '@monarch/design-system'
import { Toggle } from '@monarch/design-system'
import { ProgressStepper } from '@monarch/design-system'
import { Tag } from '@monarch/design-system'
import { IconObject } from '@monarch/design-system'
import type { IconObjectColor, IconObjectSize } from '@monarch/design-system'
import { Checkbox } from '@monarch/design-system'
import { Radio } from '@monarch/design-system'
import { Tab } from '@monarch/design-system'
import { Tabs } from '@monarch/design-system'
import { ButtonGroup } from '@monarch/design-system'
import { FilterChip } from '@monarch/design-system'
import { Link } from '@monarch/design-system'
import { Breadcrumbs } from '@monarch/design-system'
import { Loader } from '@monarch/design-system'
import { Field } from '@monarch/design-system'
import { Select } from '@monarch/design-system'
import { SelectTransfer } from '@monarch/design-system'
import type { SelectTransferAppearance } from '@monarch/design-system'
import { SelectWalletAccount } from '@monarch/design-system'
import { TextArea } from '@monarch/design-system'
import { DatePicker } from '@monarch/design-system'
import { TimePicker } from '@monarch/design-system'
import { MenuItem } from '@monarch/design-system'
import { Menu } from '@monarch/design-system'
import { Modal } from '@monarch/design-system'
import { Sheet } from '@monarch/design-system'
import { ProgressBar } from '@monarch/design-system'
import { ProgressRing } from '@monarch/design-system'
import { Slider } from '@monarch/design-system'
import { RangeSlider } from '@monarch/design-system'
import { Toast } from '@monarch/design-system'
import type { ToastAppearance } from '@monarch/design-system'
import { ToastMobile } from '@monarch/design-system'
import { BottomNavigation, SideNavigation } from '@monarch/design-system'
import type { SideNavItem } from '@monarch/design-system'
import { HeaderBg, HeaderDefault } from '@monarch/design-system'
import { StatusBar } from '@monarch/design-system'
import { ListItem, SummaryItem, ChartLegendItem } from '@monarch/design-system'
import { TrendIndicator } from '@monarch/design-system'
import { DonutChart, LineChart } from '@monarch/design-system'
import type { DonutSegment } from '@monarch/design-system'
import {
  CardSmartInsights,
  CardAction,
  CardBalance,
  CardDataDisplay,
  CardMonthlyBudget,
  CardGoals,
  CardFeaturesAndEducation,
} from '@monarch/design-system'

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
  letterSpacing: '0.08em', color: 'var(--mapped-text-subtle-default, #888)', marginBottom: '0.5rem',
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
          <span style={{ fontSize: '0.63rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtle-default, #888)', minWidth: '10rem', textAlign: 'right' }}>
            {varName}
          </span>
          {step === 'none'
            ? <span style={{ fontSize: '0.63rem', color: 'var(--mapped-text-subtlest-subtlest, #bbb)', fontFamily: 'monospace' }}>0</span>
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
            <span style={{ fontWeight: 700, color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontSize: '0.6rem', fontFamily: 'monospace', marginRight: '0.5rem' }}>
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

// The two gradient KINDS expose different shapes, and the field names differ on
// purpose so this union discriminates without a `kind` check:
//   scrim — a complete gradient, angle included, in `var`.
//   brand — the two endpoint COLOURS, in `fromVar` / `toVar`; the angle and both
//           stop positions are the consumer's (v1.9.0 — v1.8.0's combined
//           `stopsVar` carried the positions and is gone).
type GradientToken =
  | { var: string; value: string; mappedVar: string; mappedValue: string; description: string }
  | { fromVar: string; fromValue: string; toVar: string; toValue: string; description: string }

function GradientCard({ name, token }: { name: string; token: GradientToken }) {
  const TILE: React.CSSProperties = {
    position: 'relative', width: '10rem', height: '6rem', borderRadius: '0.4rem', overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)',
  }
  // A brand entry ships two endpoint colours and nothing else, so the consumer
  // composes the angle AND both stop positions — these lines ARE the documented
  // consumption pattern. 0deg / 0% / 100% reproduces the band the token used to
  // hardcode; any other angle or placement is equally available now.
  const isBrand = 'fromVar' in token
  const shownVar = isBrand ? `${token.fromVar} → ${token.toVar}` : token.var
  const background = isBrand
    ? `linear-gradient(0deg, var(${token.fromVar}) 0%, var(${token.toVar}) 100%)`
    : `var(${token.var})`
  const OVERLAY: React.CSSProperties = {
    position: 'absolute', inset: 0, background,
  }
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #333)', marginBottom: '0.2rem' }}>{name}</div>
      <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtle-default, #888)', marginBottom: '0.1rem' }}>{shownVar}</div>
      {token.description && (
        <div style={{ fontSize: '0.6rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.5rem' }}>{token.description}</div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.2rem' }}>light bg</div>
          <div style={{ ...TILE, background: '#e5e7eb' }}>
            <div style={OVERLAY} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.2rem' }}>dark bg</div>
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
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #333)', marginBottom: '0.2rem' }}>{name}</div>
      <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtle-default, #888)', marginBottom: '0.1rem' }}>{token.var}</div>
      {token.description && (
        <div style={{ fontSize: '0.6rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.6rem' }}>{token.description}</div>
      )}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.4rem' }}>light surface</div>
          <div style={{ ...TILE, background: '#ffffff', boxShadow: `var(${token.var})` }}>
            {token.var}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.4rem' }}>dark surface</div>
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

// ── Select interactive demo (owns query / open / selection state) ─────────────

const SELECT_OPTIONS = ['Eurorack', 'Ethereum', 'Bitcoin', 'Solana', 'Polygon']

function SelectDemo() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const filtered = SELECT_OPTIONS.filter(o => o.toLowerCase().includes(query.toLowerCase()))
  return (
    <Select
      label="Token"
      placeholder="Search…"
      ariaLabel="Token"
      value={open ? query : selected ?? ''}
      onSearchChange={setQuery}
      isOpen={open}
      onOpenChange={setOpen}
      isSelected={!!selected && !open}
      menuSlot={
        <Menu
          searchBar={false}
          listAriaLabel="Tokens"
          slotContent={
            filtered.length === 0 ? (
              <div style={{ padding: '0.5rem 0.75rem', color: 'var(--mapped-text-subtle-default)', fontSize: '0.85rem' }}>No matches</div>
            ) : (
              filtered.map(o => (
                <MenuItem
                  key={o}
                  type="default"
                  label={o}
                  isSelected={selected === o}
                  onSelect={() => { setSelected(o); setQuery(''); setOpen(false) }}
                />
              ))
            )
          }
        />
      }
    />
  )
}

// ── Select/Transfer interactive demo (search + currency picker, one per appearance) ──

const TRANSFER_RECIPIENTS = ['Ali Rahman', 'Bella Tan', 'Chandra Kumar', 'Dewi Putri', 'Ethan Wong']
const TRANSFER_CURRENCIES = [
  { code: 'MYR', color: '#fff0e6' },
  { code: 'ETH', color: '#e6ecff' },
  { code: 'BTC', color: '#fff3d6' },
  { code: 'USD', color: '#e6ffe9' },
]

function SelectTransferDemo({ appearance }: { appearance: SelectTransferAppearance }) {
  const [query, setQuery] = useState('')
  const [amountOpen, setAmountOpen] = useState(false)
  const [recipient, setRecipient] = useState<string | null>(null)
  const [currencyIndex, setCurrencyIndex] = useState(0)
  const [currencyOpen, setCurrencyOpen] = useState(false)

  // Option A: the component always renders the menu when isOpen — "only show a
  // dropdown if there's a search result" is app-level state, done here by
  // folding the result count into the isOpen value we pass down, not by
  // adding a prop to the component.
  const filtered = TRANSFER_RECIPIENTS.filter(o => o.toLowerCase().includes(query.toLowerCase()))
  const showAmountMenu = amountOpen && filtered.length > 0

  const currency = TRANSFER_CURRENCIES[currencyIndex]
  const flag = (
    <ElementWrapper size="m">
      <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: currency.color, border: '1px solid var(--mapped-border-subtlest-default)', display: 'block' }} />
    </ElementWrapper>
  )

  return (
    <SelectTransfer
      appearance={appearance}
      label={appearance === 'attention' ? 'Send' : 'Recipient'}
      placeholder="Search…"
      ariaLabel="Recipient"
      value={amountOpen ? query : recipient ?? ''}
      onAmountChange={setQuery}
      isOpen={showAmountMenu}
      onOpenChange={setAmountOpen}
      isSelected={!!recipient && !amountOpen}
      currencyLabel={currency.code}
      currencyFlag={flag}
      isCurrencyOpen={currencyOpen}
      onCurrencyClick={() => setCurrencyOpen(o => !o)}
      menuSlot={
        filtered.length > 0 ? (
          <Menu
            searchBar={false}
            listAriaLabel="Recipients"
            slotContent={filtered.map(name => (
              <MenuItem
                key={name}
                type="default"
                label={name}
                isSelected={recipient === name}
                onSelect={() => { setRecipient(name); setQuery(''); setAmountOpen(false) }}
              />
            ))}
          />
        ) : null
      }
      currencyMenuSlot={
        <Menu
          searchBar={false}
          listAriaLabel="Currencies"
          slotContent={TRANSFER_CURRENCIES.map((c, i) => (
            <MenuItem
              key={c.code}
              type="default"
              label={c.code}
              iconSlot={
                <ElementWrapper size="m">
                  <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: c.color, border: '1px solid var(--mapped-border-subtlest-default)', display: 'block' }} />
                </ElementWrapper>
              }
              isSelected={currencyIndex === i}
              onSelect={() => { setCurrencyIndex(i); setCurrencyOpen(false) }}
            />
          ))}
        />
      }
    />
  )
}

// ── Select / Wallet Account interactive demo (button trigger + Field-composed menu) ──

const WALLET_ACCOUNTS = [
  { crypto: 'Bitcoin', wallet: 'Main Wallet', amount: '$12,450.00', amtCrypto: '0.42 BTC', color: '#fff3d6' },
  { crypto: 'Ethereum', wallet: 'Savings', amount: '$3,200.00', amtCrypto: '1.85 ETH', color: '#e6ecff' },
  { crypto: 'USDC', wallet: 'Trading', amount: '$8,000.00', amtCrypto: '8,000.00 USDC', color: '#e6ffe9' },
]

function WalletLogo({ color }: { color: string }) {
  return (
    <ElementWrapper size="xxl">
      <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: color, border: '1px solid var(--mapped-border-subtlest-default)', display: 'block' }} />
    </ElementWrapper>
  )
}

function SelectWalletAccountDemo() {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [query, setQuery] = useState('')
  const selected = WALLET_ACCOUNTS[selectedIndex]
  const filtered = WALLET_ACCOUNTS.filter(
    a => a.crypto.toLowerCase().includes(query.toLowerCase()) || a.wallet.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <SelectWalletAccount
      labelCrypto={selected.crypto}
      labelWallet={selected.wallet}
      labelAmount={selected.amount}
      labelAmtCrypto={selected.amtCrypto}
      state="selected"
      isOpen={open}
      onOpenChange={setOpen}
      ariaLabel="Choose account"
      menuSlot={
        <Menu
          searchPlaceholder="Search accounts…"
          searchAriaLabel="Search accounts"
          listAriaLabel="Accounts"
          searchValue={query}
          onSearchChange={setQuery}
          slotContent={filtered.map(a => {
            const idx = WALLET_ACCOUNTS.indexOf(a)
            return (
              <MenuItem
                key={a.crypto}
                type="crypto"
                iconSlot={<WalletLogo color={a.color} />}
                labelCrypto={a.crypto}
                labelWallet={a.wallet}
                labelAmount={a.amount}
                labelAmountCrypto={a.amtCrypto}
                isSelected={idx === selectedIndex}
                onSelect={() => { setSelectedIndex(idx); setQuery(''); setOpen(false) }}
              />
            )
          })}
        />
      }
    />
  )
}

// ── Date Picker interactive demo (calendarSlot = app-composed calendar) ──

function DatePickerCalendar({
  monthDate,
  selectedDate,
  onNavigate,
  onSelectDay,
}: {
  monthDate: Date
  selectedDate: Date | null
  onNavigate: (delta: number) => void
  onSelectDay: (d: Date) => void
}) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--brand-scale-200) var(--brand-scale-200)' }}>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onNavigate(-1)} aria-label="Previous month" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--mapped-icon-subtle-default)' }}>
          <Icon name="chevron_left" size="m" />
        </button>
        <span className="type-body-sm-semibold" style={{ color: 'var(--mapped-text-default-default)' }}>{monthLabel}</span>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onNavigate(1)} aria-label="Next month" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--mapped-icon-subtle-default)' }}>
          <Icon name="chevron_right" size="m" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 var(--brand-scale-200)' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
          <div key={w} className="type-body-caption-semibold" style={{ textAlign: 'center', color: 'var(--mapped-text-subtle-default)', padding: '0.3rem 0' }}>{w}</div>
        ))}
        {cells.map((d, i) => {
          const isSelected = !!(d && selectedDate && d.toDateString() === selectedDate.toDateString())
          return (
            <div
              key={i}
              role={d ? 'button' : undefined}
              onMouseDown={d ? e => e.preventDefault() : undefined}
              onClick={d ? () => onSelectDay(d) : undefined}
              className="type-body-sm"
              style={{
                textAlign: 'center',
                padding: '0.4rem 0',
                cursor: d ? 'pointer' : 'default',
                color: isSelected ? 'var(--mapped-text-primary-on-color)' : 'var(--mapped-text-default-default)',
                background: isSelected ? 'var(--mapped-surface-primary-default)' : 'transparent',
                borderRadius: 'var(--brand-scale-100)',
              }}
            >
              {d ? d.getDate() : ''}
            </div>
          )
        })}
      </div>
    </>
  )
}

function DatePickerDemo() {
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(new Date(2022, 11, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [text, setText] = useState('')

  const formatDate = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`

  return (
    <DatePicker
      ariaLabel="Interactive date picker"
      value={text}
      onChange={setText}
      isOpen={open}
      onOpenChange={setOpen}
      onClear={() => { setText(''); setSelectedDate(null) }}
      calendarSlot={
        <div style={{ '--menu-width': '240px' } as React.CSSProperties}>
          <Menu
            searchBar={false}
            isOptionList={false}
            slotContent={
              <DatePickerCalendar
                monthDate={visibleMonth}
                selectedDate={selectedDate}
                onNavigate={delta => setVisibleMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1))}
                onSelectDay={d => {
                  setSelectedDate(d)
                  setText(formatDate(d))
                  setOpen(false)
                }}
              />
            }
          />
        </div>
      }
    />
  )
}

// ── Time Picker interactive demo (timesSlot = app-composed option list) ──

const TIME_OPTIONS = (() => {
  const times: string[] = []
  for (let h = 9; h <= 12; h++) {
    for (const m of [0, 30]) {
      if (h === 12 && m === 30) break
      const hour12 = h > 12 ? h - 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      times.push(`${hour12}:${String(m).padStart(2, '0')} ${ampm}`)
    }
  }
  return times
})()

function TimePickerDemo() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  return (
    <TimePicker
      ariaLabel="Interactive time picker"
      value={text}
      onChange={setText}
      isOpen={open}
      onOpenChange={setOpen}
      onClear={() => setText('')}
      timesSlot={
        <Menu
          searchBar={false}
          listAriaLabel="Times"
          slotContent={TIME_OPTIONS.map(t => (
            <MenuItem
              key={t}
              type="default"
              label={t}
              isSelected={text === t}
              onSelect={() => { setText(t); setOpen(false) }}
            />
          ))}
        />
      }
    />
  )
}

// ── Menu Item interactive demo (default-type option list with real selection) ──

const MENU_ITEM_OPTIONS = ['Alpha', 'Bravo', 'Charlie', 'Delta']

function MenuItemDemo() {
  const [selected, setSelected] = useState('Bravo')

  return (
    <div
      role="listbox"
      style={{
        background: 'var(--mapped-surface-elevation-default)',
        borderRadius: 'var(--brand-scale-200)',
        boxShadow: 'var(--shadow-medium)',
        overflow: 'hidden',
        padding: 'var(--brand-scale-100) 0',
        maxWidth: '320px',
      }}
    >
      {MENU_ITEM_OPTIONS.map(opt => (
        <MenuItem
          key={opt}
          label={opt}
          isSelected={selected === opt}
          onSelect={() => setSelected(opt)}
          iconSlot={<IconObject color="blue" size="s"><Icon name="person" size="s" /></IconObject>}
        />
      ))}
    </div>
  )
}

// ── Menu interactive demo (real search filtering + real selection) ──

function MenuDemo() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('Bravo')
  const filtered = MENU_ITEM_OPTIONS.filter(opt => opt.toLowerCase().includes(query.toLowerCase()))

  return (
    <Menu
      searchValue={query}
      onSearchChange={setQuery}
      listAriaLabel="Interactive menu options"
      slotContent={
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 var(--brand-scale-200)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '0.75rem', color: 'var(--mapped-text-subtle-default)', fontSize: '0.85rem' }}>No results</div>
          ) : (
            filtered.map(opt => (
              <MenuItem
                key={opt}
                label={opt}
                isSelected={selected === opt}
                onSelect={() => setSelected(opt)}
              />
            ))
          )}
        </div>
      }
    />
  )
}

// ── Progress Bar interactive demos (controllers drive the value) ──

const CTRL_LABEL: React.CSSProperties = { fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)', display: 'flex', alignItems: 'center', gap: '0.5rem' }
const NUM_INPUT: React.CSSProperties = { width: '4rem', padding: '0.25rem 0.4rem', borderRadius: '6px', border: '1px solid var(--mapped-border-subtlest-default)', background: 'var(--mapped-surface-primary-default-subtle)', color: 'var(--mapped-text-default-default)', font: 'inherit', fontSize: '0.8rem' }

// Percentage-only progress bar (no current/total readout)
function ProgressBarPercentDemo() {
  const [pct, setPct] = useState(45)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '360px' }}>
      <label style={CTRL_LABEL}>
        progress
        <input type="range" min={0} max={100} value={pct} onChange={e => setPct(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ width: '2.5rem', textAlign: 'right' }}>{pct}%</span>
      </label>
      <ProgressBar size="s" value={pct} ariaLabel={`Progress ${pct}%`} />
      <ProgressBar size="m" value={pct} ariaLabel={`Progress ${pct}%`} />
    </div>
  )
}

// Stepper progress bar (shows the current/total "1/4" readout)
function ProgressBarStepperDemo() {
  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(4)
  const safeTotal = Math.max(1, total)
  const value = (Math.max(0, Math.min(current, safeTotal)) / safeTotal) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '360px' }}>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <label style={CTRL_LABEL}>step
          <input type="number" min={0} max={safeTotal} value={current} onChange={e => setCurrent(Number(e.target.value))} style={NUM_INPUT} />
        </label>
        <label style={CTRL_LABEL}>of
          <input type="number" min={1} value={total} onChange={e => setTotal(Number(e.target.value))} style={NUM_INPUT} />
        </label>
      </div>
      <ProgressBar size="s" value={value} current={String(Math.min(current, safeTotal))} total={String(safeTotal)} ariaLabel={`Step ${current} of ${safeTotal}`} />
      <ProgressBar size="m" value={value} current={String(Math.min(current, safeTotal))} total={String(safeTotal)} ariaLabel={`Step ${current} of ${safeTotal}`} />
    </div>
  )
}

// ── Progress Ring interactive demo (max / used amount → left-to-spend gauge) ──

function ProgressRingDemo() {
  const [max, setMax] = useState(100)
  const [used, setUsed] = useState(55)
  const safeMax = Math.max(0, max)
  const safeUsed = Math.max(0, Math.min(used, safeMax))
  const left = safeMax - safeUsed
  // The gauge fills toward the red end as spending grows (a "danger" gauge,
  // matching the reference app screen — Monthly Budget at 82% spent shows a
  // LARGE colored arc, Entertainment at 65% spent shows a smaller one) — the
  // arc is driven by % SPENT, not % left. The caption/pill still read % left
  // (the friendlier, positive framing), decoupled via `percentageLabel`.
  const spentPct = safeMax > 0 ? (safeUsed / safeMax) * 100 : 0
  const leftPct = safeMax > 0 ? (left / safeMax) * 100 : 0
  const fmt = (v: number) => `RM ${v.toFixed(2)}`
  const shared = { value: spentPct, percentageLabel: `${Math.round(leftPct)}%`, amount: fmt(left), total: fmt(safeMax) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <label style={CTRL_LABEL}>max (budget)
          <input type="number" min={0} value={max} onChange={e => setMax(Number(e.target.value))} style={NUM_INPUT} />
        </label>
        <label style={CTRL_LABEL}>used (spent)
          <input type="number" min={0} value={used} onChange={e => setUsed(Number(e.target.value))} style={NUM_INPUT} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <ProgressRing size="m" {...shared} />
        <ProgressRing size="l" {...shared} />
      </div>
    </div>
  )
}

// ── Modal interactive demo (open/close toggle; footer composes real Buttons) ──

function ModalDemo() {
  const [open, setOpen] = useState(false)
  const [insightOpen, setInsightOpen] = useState(false)
  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary" size="m" label="Open modal" onClick={() => setOpen(true)} />
        <Button
          variant="secondary"
          size="m"
          label="Open modal with header icon"
          onClick={() => setInsightOpen(true)}
        />
      </div>

      {/* v1.3.0 / G12 — headerIconLeft sits INSIDE the centred cell, so the
          icon and title centre as one unit, matching Figma header 1321:12708. */}
      <Modal
        isOpen={insightOpen}
        onClose={() => setInsightOpen(false)}
        title="Smart insights"
        headerIconLeft={<Icon name="icon_aiinsights" size="l" />}
        footer={
          <>
            <Button variant="primary" size="l" label="View promotion" onClick={() => setInsightOpen(false)} />
            <Button variant="secondary" size="l" label="Remind me later" onClick={() => setInsightOpen(false)} />
          </>
        }
      >
        <p className="type-body-m" style={{ margin: 0, color: 'var(--mapped-text-default-default)' }}>
          The leading icon shares the centred grid cell with the title, so the pair centres
          together rather than the icon pinning to the left edge.
        </p>
      </Modal>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Confirm transfer"
        footer={
          <>
            <Button variant="primary" size="l" label="Confirm" onClick={() => setOpen(false)} />
            <Button variant="secondary" size="l" label="Cancel" onClick={() => setOpen(false)} />
          </>
        }
      >
        <p className="type-body-m" style={{ margin: 0, color: 'var(--mapped-text-default-default)' }}>
          The middle region is a flexible content slot — anything a feature needs goes here. Sending
          <strong> 0.42 BTC</strong> to Main Wallet.
        </p>
        <p className="type-body-sm" style={{ margin: 0, color: 'var(--mapped-text-subtle-default)' }}>
          This action can't be undone.
        </p>
      </Modal>
    </>
  )
}

// ── Sheet interactive demos ──

type SheetVariant = 'full' | 'headerless' | 'no-actions' | 'tall' | 'back-chevron'

const SHEET_VARIANTS: { key: SheetVariant; label: string; note: string }[] = [
  { key: 'full', label: 'Full', note: 'header + content + actions + home indicator' },
  { key: 'headerless', label: 'Headerless', note: 'no header region at all — what G2’s action sheet composes over' },
  { key: 'no-actions', label: 'No actions', note: 'field lives inside the scrolling content instead' },
  { key: 'tall', label: 'Tall / scrolling', note: 'capped at the viewport; content scrolls, no visible scrollbar' },
  { key: 'back-chevron', label: 'Back chevron', note: 'showCloseButton={false} — one dismissal affordance, not two' },
]

function SheetDemo() {
  const [open, setOpen] = useState<SheetVariant | null>(null)
  const close = () => setOpen(null)

  const body = (
    <p className="type-body-m" style={{ margin: 0, color: 'var(--mapped-text-default-default)' }}>
      The content region is the only part that scrolls — header, actions and the home indicator stay
      fixed.
    </p>
  )

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {SHEET_VARIANTS.map(v => (
          <Button key={v.key} variant="secondary" size="m" label={v.label} onClick={() => setOpen(v.key)} />
        ))}
      </div>

      <Sheet
        isOpen={open === 'full'}
        onClose={close}
        title="Filter transactions"
        headerAction={<Link label="Reset" appearance="default" size="m" iconBefore={null} iconAfter={null} onClick={e => e.preventDefault()} />}
        actions={
          <>
            <Button variant="primary" size="l" label="Apply" onClick={close} />
            <Button variant="secondary" size="l" label="Cancel" onClick={close} />
          </>
        }
      >
        {body}
      </Sheet>

      <Sheet isOpen={open === 'headerless'} onClose={close} ariaLabel="Choose a source"
        actions={<Button variant="secondary" size="l" label="Cancel" onClick={close} />}>
        <p className="type-body-m" style={{ margin: 0, color: 'var(--mapped-text-default-default)' }}>
          No header region is rendered — not an empty one. The content region supplies its own top
          inset so nothing sits flush under the rounded corner.
        </p>
      </Sheet>

      <Sheet isOpen={open === 'no-actions'} onClose={close} title="Add a note">
        <Field label="Note" placeholder="What was this for?" />
        {body}
      </Sheet>

      <Sheet
        isOpen={open === 'back-chevron'}
        onClose={close}
        title="Receipt options"
        headerIconLeft={
          <IconButton variant="tertiary" size="s" ariaLabel="Back" icon={<Icon name="arrow_back" size="l" />} onClick={close} />
        }
        showCloseButton={false}
      >
        <p className="type-body-m" style={{ margin: 0, color: 'var(--mapped-text-default-default)' }}>
          The ✕ is suppressed explicitly — it is never auto-hidden just because a leading slot was
          filled.
        </p>
      </Sheet>

      <Sheet isOpen={open === 'tall'} onClose={close} title="Transaction detail">
        {Array.from({ length: 24 }, (_, i) => (
          <ListItem
            key={`sheet-row-${i}`}
            title={`Merchant ${i + 1}`}
            titleInfo="12 Aug 2026"
            amount={`−RM ${(i + 1) * 12}.40`}
          />
        ))}
      </Sheet>
    </>
  )
}

// ── Slider interactive demo (single thumb) ──

function SliderDemo() {
  const [value, setValue] = useState(40)
  return (
    <div style={{ maxWidth: '246px' }}>
      <Slider value={value} onChange={setValue} ariaLabel="Single value" ariaValueText={`${value}`} />
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--mapped-text-subtle-default)' }}>value: {value}</div>
    </div>
  )
}

// ── Range slider interactive demo (dual thumb + synced Field inputs) ──

function RangeSliderDemo() {
  const [range, setRange] = useState<{ min: number; max: number }>({ min: 20, max: 70 })
  const fmt = (v: number) => `RM ${v}`
  return (
    <div style={{ maxWidth: '246px' }}>
      <RangeSlider
        minValue={range.min}
        maxValue={range.max}
        onChange={(min, max) => setRange({ min, max })}
        formatValue={fmt}
        ariaLabelMin="Minimum amount"
        ariaLabelMax="Maximum amount"
      />
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--mapped-text-subtle-default)' }}>
        range: {fmt(range.min)} – {fmt(range.max)}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

const HR: React.CSSProperties = { border: 'none', borderTop: '2px solid rgba(128,128,128,0.2)', margin: '2rem auto 2.5rem', maxWidth: '1200px' }

// Chart demo data. The budget segments carry Figma's own category→hue
// assignment, read from the legend rows beneath the budget pie (`0:379`):
// Bills red · Groceries purple · Dining blue · Healthcare cyan · Transport lime
// · Shopping yellow · Others orange. Values sum to RM 7,500 and the component
// derives the shares — Figma's own printed percentages sum to 100.01%.
const BUDGET_SEGMENTS: DonutSegment[] = [
  { id: 'bills', label: 'Bills & Utilities', value: 2500, color: 'red' },
  { id: 'groceries', label: 'Groceries', value: 1800, color: 'purple' },
  { id: 'dining', label: 'Dining & Leisure', value: 1200, color: 'blue' },
  { id: 'healthcare', label: 'Healthcare', value: 800, color: 'cyan' },
  { id: 'transport', label: 'Transport', value: 500, color: 'lime' },
  { id: 'shopping', label: 'Shopping', value: 350, color: 'yellow' },
  { id: 'others', label: 'Others / Misc', value: 350, color: 'orange' },
]

// 15 points on a 31-slot domain — Flow 7's month-to-date shape, where the data
// deliberately stops at the 15th while the axis spans the month. Values are
// demo data: the Figma source is two flattened vectors with no series in them.
const NETWORTH_SERIES = [
  442190, 442800, 441950, 443600, 444100, 443200, 445300,
  446100, 445700, 447200, 448050, 447600, 449100, 450200, 450958,
]

const SPARK_SERIES = [12, 15, 13, 18, 17, 22, 20, 26, 31]

// Sidebar nav metadata — slugs must match the `id="section-<slug>"` on each
// section wrapper below. Grouping/order approved 2026-07-24 (showcase redesign).
type SidebarSection = { slug: string; label: string }
// Tab/Tabs and Toast/ToastMobile are deliberately combined into a single entry
// each, rather than listed as separate rows. This matches the existing family
// convention already used for Card (×7), Header (×2), Item (×3) and
// Navigation (×2) — one sidebar entry per Figma component set, not per exported
// symbol. 48 component folders therefore map to 46 sidebar entries by design.
const SIDEBAR_CATEGORIES: { name: string; items: SidebarSection[] }[] = [
  { name: 'Actions', items: [
    { slug: 'button', label: 'Button' },
    { slug: 'icon-button', label: 'Icon Button' },
    { slug: 'button-group', label: 'Button Group' },
    { slug: 'link', label: 'Link' },
  ] },
  { name: 'Selection & Input', items: [
    { slug: 'checkbox', label: 'Checkbox' },
    { slug: 'radio', label: 'Radio' },
    { slug: 'toggle', label: 'Toggle' },
    { slug: 'field', label: 'Field' },
    { slug: 'select', label: 'Select' },
    { slug: 'select-transfer', label: 'Select / Transfer' },
    { slug: 'select-wallet-account', label: 'Select / Wallet Account' },
    { slug: 'date-picker', label: 'Date Picker' },
    { slug: 'time-picker', label: 'Time Picker' },
    { slug: 'text-area', label: 'Text Area' },
    { slug: 'filter-chip', label: 'Filter Chip' },
  ] },
  { name: 'Sliders', items: [
    { slug: 'slider', label: 'Slider' },
    { slug: 'range-slider', label: 'Range Slider' },
  ] },
  { name: 'Status & Feedback', items: [
    { slug: 'badge', label: 'Badge' },
    { slug: 'chips', label: 'Chips' },
    { slug: 'tag', label: 'Tag' },
    { slug: 'loader', label: 'Loader' },
    { slug: 'toast', label: 'Toast' },
    { slug: 'progress-bar', label: 'Progress Bar' },
    { slug: 'progress-ring', label: 'Progress Ring' },
    { slug: 'progress-stepper', label: 'Progress Stepper' },
    { slug: 'trend-indicator', label: 'Trend Indicator' },
  ] },
  { name: 'Navigation', items: [
    { slug: 'tabs', label: 'Tabs & Tab' },
    { slug: 'breadcrumbs', label: 'Breadcrumbs' },
    { slug: 'menu', label: 'Menu' },
    { slug: 'menu-item', label: 'Menu Item' },
    { slug: 'navigation', label: 'Navigation' },
  ] },
  { name: 'Data Display', items: [
    { slug: 'avatar', label: 'Avatar' },
    { slug: 'card', label: 'Card' },
    { slug: 'label', label: 'Label' },
    { slug: 'icon-object', label: 'Icon Object' },
    { slug: 'divider', label: 'Divider' },
    { slug: 'donut-chart', label: 'Donut Chart' },
    { slug: 'line-chart', label: 'Line Chart' },
    { slug: 'item', label: 'Item' },
    { slug: 'element-wrapper', label: 'Element Wrapper' },
  ] },
  { name: 'Overlays', items: [
    { slug: 'modal', label: 'Modal' },
    { slug: 'sheet', label: 'Sheet' },
    { slug: 'blanket', label: 'Blanket' },
  ] },
  { name: 'Media & Branding', items: [
    { slug: 'icon', label: 'Icon' },
    { slug: 'logo', label: 'Logo' },
    { slug: 'header', label: 'Header' },
    { slug: 'status-bar', label: 'Status Bar' },
  ] },
]

export default function App() {
  const { dark, toggle } = useTheme()
  const [tab, setTab] = useState<'foundations' | 'components'>('components')
  const [tabsSelected, setTabsSelected] = useState('overview')
  const [scrollableTabsSelected, setScrollableTabsSelected] = useState('overview')
  const [balanceClicks, setBalanceClicks] = useState(0)
  const [filterChipsSelected, setFilterChipsSelected] = useState<Record<string, boolean>>({ chip2: true })
  const [bottomNavSelected, setBottomNavSelected] = useState('home')
  const [sideNavSelected, setSideNavSelected] = useState('home')
  const [sideNavCompact, setSideNavCompact] = useState(false)
  const [lastItemClicked, setLastItemClicked] = useState<string | null>(null)
  const [toggleOn, setToggleOn] = useState(true)
  const [toggleLargeOn, setToggleLargeOn] = useState(false)
  const [cbChecked, setCbChecked] = useState(false)
  const [cbNotify, setCbNotify] = useState(true)
  const [radioValue, setRadioValue] = useState('standard')
  const [tagSelected, setTagSelected] = useState<Record<string, boolean>>({ groceries: true })
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [navH, setNavH] = useState(48)

  const scrollToSection = (slug: string) => {
    document.getElementById(`section-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSidebarOpen(false)
  }

  // Measure the real top-nav height and publish it as --app-topnav-h.
  // The nav is not a fixed height — it grows below the sidebar breakpoint when
  // the hamburger appears (48px → 54px) — so anything positioned beneath it
  // (sidebar sticky offset, scrollspy trigger band) has to follow the measured
  // value rather than a hardcoded guess.
  useEffect(() => {
    const nav = document.querySelector('.app-topnav')
    if (!nav) return
    const apply = () => {
      const h = Math.round(nav.getBoundingClientRect().height)
      if (h > 0) {
        setNavH(h)
        document.documentElement.style.setProperty('--app-topnav-h', `${h}px`)
      }
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(nav)
    return () => ro.disconnect()
  }, [tab])

  // Lock page scroll while the off-canvas drawer is open, so the content
  // behind the scrim doesn't scroll with it. Restores the previous value on
  // close rather than assuming '' , in case anything else set it.
  useEffect(() => {
    if (!sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [sidebarOpen])

  // Scrollspy — highlight whichever section is currently under the "trigger
  // zone" (just below the sticky top nav). rootMargin shrinks the observed
  // viewport to a thin band near the top, so the active item follows scroll
  // position instead of just reacting to click.
  useEffect(() => {
    if (tab !== 'components') return
    const sections = SIDEBAR_CATEGORIES.flatMap(c => c.items)
    const els = sections
      .map(s => ({ slug: s.slug, el: document.getElementById(`section-${s.slug}`) }))
      .filter((s): s is { slug: string; el: HTMLElement } => !!s.el)
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length === 0) return
        // topmost currently-intersecting section wins
        const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
        const match = els.find(s => s.el === top.target)
        if (match) setActiveSlug(match.slug)
      },
      // Same measured nav height as the sidebar offset — this used to repeat
      // the stale 49px literal independently.
      { rootMargin: `-${navH}px 0px -70% 0px`, threshold: 0 }
    )
    els.forEach(s => observer.observe(s.el))
    return () => observer.disconnect()
  }, [tab, navH])

  const query = sidebarSearch.trim().toLowerCase()
  const filteredCategories = SIDEBAR_CATEGORIES
    // Match the slug as well as the label: the slug is how a component is named
    // on disk, in docs, and in the section anchor, so "status-bar" is a natural
    // thing to type — it previously returned nothing because only "Status Bar"
    // (the label) was searched.
    .map(cat => ({ ...cat, items: cat.items.filter(i => i.label.toLowerCase().includes(query) || i.slug.toLowerCase().includes(query)) }))
    .filter(cat => cat.items.length > 0)
  const hasResults = filteredCategories.length > 0

  return (
    // font-family intentionally not set here — it now cascades from body via
    // --font-family-primary (AppShell.css), so the showcase renders in the
    // design system's own typeface instead of hardcoded system-ui.
    <div style={{ minHeight: '100vh' }}>

      {/* Top nav — logo left, Foundations/Components tabs center, theme toggle right */}
      <div className="app-topnav" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--mapped-surface-page, #fff)' }}>
        <div className="app-topnav__left">
          <Logo name="monarch_logo_style_thick" size="s" />
        </div>

        {tab === 'components' && (
          <div className="app-topnav__menu-btn">
            <IconButton
              variant="tertiary"
              size="m"
              icon={<Icon name="menu" size="m" />}
              ariaLabel={sidebarOpen ? 'Close component list' : 'Open component list'}
              onClick={() => setSidebarOpen(o => !o)}
            />
          </div>
        )}

        <div className="app-topnav__center">
          <Tabs
            tabs={[
              { id: 'foundations', label: 'Foundations' },
              { id: 'components', label: 'Components' },
            ]}
            selectedId={tab}
            onChange={id => setTab(id as typeof tab)}
            ariaLabel="Documentation section"
          />
        </div>

        <div className="app-topnav__right">
          <span style={{ fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)' }}>{dark ? 'Dark' : 'Light'}</span>
          <Toggle size="m" isChecked={dark} onChange={toggle} ariaLabel="Toggle dark mode" />
        </div>
      </div>

      <div className="app-body">
        {/* Drawer scrim — reuses the real Blanket component rather than a
            bespoke overlay. Only rendered while the off-canvas drawer is open;
            CSS hides it above the sidebar breakpoint, where the sidebar is
            inline and needs no scrim. */}
        {tab === 'components' && sidebarOpen && (
          <div className="app-sidebar-scrim">
            <Blanket onClick={() => setSidebarOpen(false)} />
          </div>
        )}
        {tab === 'components' && (
          <aside className={`app-sidebar${sidebarOpen ? ' app-sidebar--open' : ''}`}>
            <div className="app-sidebar__search">
              <Field
                placeholder="Search components…"
                value={sidebarSearch}
                onChange={setSidebarSearch}
                leadingIcon={<Icon name="search" size="s" />}
                ariaLabel="Search components"
              />
            </div>
            <div className="app-sidebar__scroll">
              <nav aria-label="Component sections">
                {hasResults ? filteredCategories.map(cat => (
                  <div key={cat.name} className="app-sidebar__group">
                    <div className="app-sidebar__group-label">{cat.name}</div>
                    {cat.items.map(item => (
                      <button
                        key={item.slug}
                        type="button"
                        className={`app-sidebar__item${activeSlug === item.slug ? ' app-sidebar__item--active' : ''}`}
                        // "location", not "page": these are sections within one
                        // page, not a set of pages. Undefined (not false) on
                        // inactive items so the attribute is absent entirely.
                        aria-current={activeSlug === item.slug ? 'location' : undefined}
                        onClick={() => scrollToSection(item.slug)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )) : (
                  <div className="app-sidebar__empty">No components found</div>
                )}
              </nav>
            </div>
          </aside>
        )}

        <main className="app-main">

      {/* ── FOUNDATIONS TAB ── */}
      {tab === 'foundations' && (
        <>
          {/* Brand primitives */}
          <Section
            title="Brand Primitives"
            description={`Brand/Value.json — ${brandScales.length} color scales + foundations`}
           
          >
            {brandScales.map(([name, steps]) => (
              <BrandScaleRow key={name} name={name} steps={steps} />
            ))}
            <BrandScaleRow name="foundations" steps={brandFoundations} />
          </Section>

          <hr style={HR} />

          {/* Alias / Semantic */}
          <Section
            title="Alias / Semantic"
            description={`Alias/Alias.json — ${aliasGroups.length} groups — alias → brand token`}
           
            noTopPadding
          >
            {aliasGroups.map(([name, steps]) => (
              <AliasGroupRow key={name} name={name} steps={steps} />
            ))}
          </Section>

          <hr style={HR} />

          {/* Mapped / Semantic surfaces — intro passed as children, not via the
              `description` prop: two paragraphs with different styles, the first
              on a non-canonical 0.5rem margin. See SectionProps.description. */}
          <Section title="Mapped / Semantic surfaces">
            <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              Mapped/Light.json + Dark.json — {MAPPED_TOTAL} tokens — toggle above to flip modes
            </p>
            <p style={{ color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontSize: '0.75rem', marginBottom: '2rem' }}>
              Current mode: <strong style={{ color: 'var(--mapped-text-primary-default)' }}>{dark ? 'dark' : 'light'}</strong>
            </p>
            {MAPPED_TREE.map(cat => <MappedCategorySection key={cat.name} {...cat} />)}
          </Section>

          <hr style={HR} />

          {/* Spacing scale — description built as a template string so the
              non-breaking spaces survive; they were `&nbsp;` entities in JSX
              text, which a string prop would render literally. */}
          <Section
            title="Spacing scale"
            description={`--spacing-* → var(--brand-scale-*) in px \u00a0·\u00a0 ${Object.keys(spacing).length} tokens`}
           
          >
            <SpacingSection />
          </Section>

          <hr style={HR} />

          {/* Responsive type */}
          <Section
            title="Responsive type"
            description="Base values: mobile. Resize past 768px to see headings change (H1–H4 + body-sm grow)."
           
          >
            <ResponsiveTypeSection />
          </Section>

          <hr style={HR} />

          {/* Typography */}
          <Section
            title="Typography"
            description="22 composite styles — Poppins 400 / 500 / 600 — headings responsive at 768 px"
           
          >
            <TypographySection />
          </Section>

          <hr style={HR} />

          {/* Gradients */}
          <Section
            title="Gradients"
            description={`Brand/Value.json → Gradient — ${Object.keys(gradients).length} tokens — shown over light + dark backgrounds`}
           
          >
            {(Object.entries(gradients) as [string, GradientToken][]).map(
              ([name, token]) => <GradientCard key={name} name={name} token={token} />
            )}
          </Section>

          <hr style={HR} />

          {/* Shadows / Effects */}
          <Section
            title="Shadows / Effects"
            description={`Brand/Value.json → Dropshadow_* — ${Object.keys(shadows).length} tokens — shown over light + dark surfaces`}
           
          >
            {(Object.entries(shadows) as [string, ShadowToken][]).map(
              ([name, token]) => <ShadowCard key={name} name={name} token={token} />
            )}
          </Section>
        </>
      )}

      {/* ── COMPONENTS TAB ── */}
      {tab === 'components' && (
        <>
          {/* Button */}
          <Section id="button" title="Button" description="3 variants × 3 sizes — tokens only — light + dark — states forced for preview">

            {/* Default appearance — one table per size */}
            {(['s', 'm', 'l'] as const).map(size => (
              <div key={size} style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                  Size {size.toUpperCase()} — light mode
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
                            isDisabled
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Icon Button */}
          <Section id="icon-button" title="Icon Button" description="3 variants × 3 sizes — same token matrix as Button — light + dark — states forced for preview">

            {/* Default appearance — table per size */}
            {(['s', 'm', 'l'] as IconButtonSize[]).map(size => (
              <div key={size} style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                  Size {size.toUpperCase()} — light mode
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
                          <IconButton variant={variant} size={size} icon={<Icon name="add" size="l" />} ariaLabel={variant} isDisabled />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Button Group ───────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="button-group" title="Button Group" description="Composite: leading IconButton (tertiary, more_horiz) + 2–N Button (primary, m) — data-driven via buttons prop">
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Link ───────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="link" title="Link" description="3 appearances × 3 states × visited × 2 weights — Size=M renders smaller than Size=S (Figma source, a naming inversion over a correct mapping, not a bug) — leaf dependency for Breadcrumbs">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>
                  weight (v1.4.0) — semibold only differs at size=s; size=m is weight-invariant by Figma source
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link label="s / regular" size="s" iconBefore={null} iconAfter={null} />
                  <Link label="s / semibold" size="s" weight="semibold" iconBefore={null} iconAfter={null} />
                  <Link label="m / regular" size="m" iconBefore={null} iconAfter={null} />
                  <Link label="m / semibold" size="m" weight="semibold" iconBefore={null} iconAfter={null} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Default appearance — forced states</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                  <Link label="Size S" size="s" />
                  <Link label="Size M" size="m" />
                  <Link label="No icons" iconBefore={null} iconAfter={null} />
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Checkbox ───────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="checkbox" title="Checkbox" description="m / l × unchecked / checked / indeterminate × invalid × required × disabled">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(['m', 'l'] as const).map(size => (
                <div key={size} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '60px', color: 'var(--mapped-text-subtle-default)' }}>{size}</span>
                  <Checkbox size={size} label="Unchecked" />
                  <Checkbox size={size} label="Checked" isChecked />
                  <Checkbox size={size} label="Indeterminate" isIndeterminate />
                  <Checkbox size={size} label="Invalid" isInvalid />
                  <Checkbox size={size} label="Required" isRequired />
                  <Checkbox size={size} label="Disabled" isDisabled />
                  <Checkbox size={size} label="Checked + disabled" isChecked isDisabled />
                </div>
              ))}
              <div className="showcase-interactive" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span className="showcase-interactive__label" style={{ marginBottom: 0 }}>interactive</span>
                <Checkbox size="m" label="I agree to the terms" isChecked={cbChecked} onChange={setCbChecked} />
                <Checkbox size="m" label="Email notifications" isChecked={cbNotify} onChange={setCbNotify} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)' }}>
                  terms: <strong>{cbChecked ? 'yes' : 'no'}</strong> · notify: <strong>{cbNotify ? 'on' : 'off'}</strong>
                </span>
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Radio ──────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="radio" title="Radio" description="unchecked / checked / invalid / required / disabled states — 14×14px radio circle inside 24px wrap">
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Radio label="Unchecked" />
              <Radio label="Checked" isChecked />
              <Radio label="Invalid" isInvalid />
              <Radio label="Required" isRequired />
              <Radio label="Disabled" isDisabled />
              <Radio label="Checked + disabled" isChecked isDisabled />
            </div>
            <div className="showcase-interactive" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span className="showcase-interactive__label" style={{ marginBottom: 0 }}>interactive</span>
              {([['standard', 'Standard'], ['express', 'Express'], ['priority', 'Priority']] as const).map(([val, label]) => (
                <Radio key={val} name="shipping" value={val} label={label} isChecked={radioValue === val} onChange={() => setRadioValue(val)} />
              ))}
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)' }}>
                selected: <strong>{radioValue}</strong>
              </span>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Toggle ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="toggle" title="Toggle" description="2 sizes × checked/unchecked × disabled — tokens: --mapped-surface-primary-default, --mapped-icon-subtlest-subtlest">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['m', 'l'] as const).map(size => (
                <div key={size} style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '80px', color: 'var(--mapped-text-subtle-default)' }}>size={size}</span>
                  <Toggle size={size} isChecked={false} ariaLabel={`${size} unchecked`} />
                  <Toggle size={size} isChecked={true} ariaLabel={`${size} checked`} />
                  <Toggle size={size} isChecked={false} isDisabled ariaLabel={`${size} disabled unchecked`} />
                  <Toggle size={size} isChecked={true} isDisabled ariaLabel={`${size} disabled checked`} />
                </div>
              ))}
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)' }}>
                unchecked · checked · disabled unchecked · disabled checked
              </div>
              <div className="showcase-interactive" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <span className="showcase-interactive__label" style={{ marginBottom: 0 }}>interactive</span>
                <Toggle size="m" isChecked={toggleOn} onChange={setToggleOn} ariaLabel="Interactive regular toggle" />
                <Toggle size="l" isChecked={toggleLargeOn} onChange={setToggleLargeOn} ariaLabel="Interactive large toggle" />
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)' }}>
                  regular: <strong>{toggleOn ? 'on' : 'off'}</strong> · large: <strong>{toggleLargeOn ? 'on' : 'off'}</strong>
                </span>
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Field ──────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="field" title="Field" description="Text input — Standard/Subtle × label × states × invalid/disabled/compact. Focus = 2px blue border + faint outer glow ring, persists until blur (:focus-within)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Select ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="select" title="Select" description="Searchable combobox trigger — Standard/Subtle × Default/Hover/Focus/Typing/Filled/Selected/Invalid/Disabled. Chevron built-in; the dropdown menu is an app-provided slot.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Select label="Label" placeholder="Placeholder" ariaLabel="Default" />
                  <Select label="Label" placeholder="Placeholder" ariaLabel="Hover" previewState="hover" />
                  <Select label="Label" placeholder="Placeholder" ariaLabel="Focus" previewState="focus" />
                  <Select label="Label" value="Selected value" ariaLabel="Filled" />
                  <Select label="Label" value="Selected value" isSelected ariaLabel="Selected" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Invalid · disabled · subtle</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Select label="Label" placeholder="Placeholder" isInvalid ariaLabel="Invalid" />
                  <Select label="Label" placeholder="Placeholder" isDisabled ariaLabel="Disabled" />
                  <Select appearance="subtle" label="Label" placeholder="Placeholder" ariaLabel="Subtle" />
                </div>
              </div>
              <div className="showcase-interactive">
                <div className="showcase-interactive__label">Interactive — click to open, type to filter (menu = example slot)</div>
                <SelectDemo />
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Select / Transfer ──────────────────────────────────────── */}
      {tab === 'components' && (() => {
        const flag = (
          <ElementWrapper size="m">
            <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--mapped-surface-primary-default-subtle-hover)', border: '1px solid var(--mapped-border-subtlest-default)', display: 'block' }} />
          </ElementWrapper>
        )
        return (
          <Section id="select-transfer" title="Select / Transfer" description="Amount input + currency picker (flag = ElementWrapper slot). Standard/Subtle bordered box + Attention underline style. Dual dropdowns are app slots.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={flag} ariaLabel="Default" />
                  <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={flag} previewState="focus" ariaLabel="Focus" />
                  <SelectTransfer label="Amount" value="1,250.00" currencyLabel="MYR" currencyFlag={flag} ariaLabel="Filled" />
                  <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={flag} isInvalid ariaLabel="Invalid" />
                  <SelectTransfer label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={flag} isDisabled ariaLabel="Disabled" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Subtle</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <SelectTransfer appearance="subtle" label="Amount" placeholder="0.00" currencyLabel="MYR" currencyFlag={flag} ariaLabel="Subtle" />
                  <SelectTransfer appearance="subtle" label="Amount" value="1,250.00" currencyLabel="MYR" currencyFlag={flag} previewState="focus" ariaLabel="Subtle focus" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Attention — underline style (h5 amount + divider)</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={flag} ariaLabel="Attention" />
                  <SelectTransfer appearance="attention" label="Send" placeholder="0" currencyLabel="ETH" currencyFlag={flag} ariaLabel="Attention empty" />
                  <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={flag} previewState="hover" ariaLabel="Attention hover" />
                  <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={flag} previewState="focus" ariaLabel="Attention focus (border unchanged)" />
                  <SelectTransfer appearance="attention" label="Send" placeholder="0" currencyLabel="MYR" currencyFlag={flag} isInvalid ariaLabel="Attention invalid (shape changes to full box)" />
                  <SelectTransfer appearance="attention" label="Send" value="1,250" currencyLabel="MYR" currencyFlag={flag} isDisabled ariaLabel="Attention disabled" />
                </div>
              </div>
              <div className="showcase-interactive">
                <div className="showcase-interactive__label">
                  Interactive — one per appearance. Type to search (dropdown only appears if there's a match — Option A: decided by the app via isOpen, not a component prop); click the chevron to change currency.
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <SelectTransferDemo appearance="standard" />
                  <SelectTransferDemo appearance="subtle" />
                  <SelectTransferDemo appearance="attention" />
                </div>
              </div>
            </div>
          </Section>
        )
      })()}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Select / Wallet Account ────────────────────────────────── */}
      {tab === 'components' && (
        <Section
          id="select-wallet-account"
          title="Select / Wallet Account"
          description="Button trigger for a wallet/account picker — the trigger itself never shows a logo (confirmed absent from all 14 variants); logos only appear per-row in the dropdown. Unlike Select/Select Transfer, the trigger never becomes an editable input — the dropdown's search field is an app-composed slot."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" ariaLabel="Default" />
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" previewState="hover" ariaLabel="Hover" />
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" state="filled" ariaLabel="Filled" />
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" state="selected" ariaLabel="Selected" />
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isOpen ariaLabel="Typing (open)" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Invalid · disabled</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isInvalid ariaLabel="Invalid" />
                <SelectWalletAccount labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isDisabled ariaLabel="Disabled" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Subtle — states (transparent at rest; disabled drops the border entirely)</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" ariaLabel="Subtle default" />
                <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" state="selected" ariaLabel="Subtle selected" />
                <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isInvalid ariaLabel="Subtle invalid" />
                <SelectWalletAccount appearance="subtle" labelCrypto="Crypto" labelWallet="Wallet" labelAmount="$0,000.00" labelAmtCrypto="0.00 ETH" isDisabled ariaLabel="Subtle disabled" />
              </div>
            </div>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — click to open; menu composes a real Field for search plus the option list (menu = example slot)
              </div>
              <SelectWalletAccountDemo />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Date Picker ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="date-picker" title="Date Picker" description="Optional visible label (v1.3.0), mirroring Field's convention. Trailing icon swaps calendar_month ↔ cancel (clear) — has a value AND unfocused only. The calendar is an app-provided slot.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                Labelled vs unlabelled (v1.3.0)
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <DatePicker label="Date (From)" />
                <DatePicker label="Date (To)" defaultValue="12/25/2022" />
                <DatePicker ariaLabel="Start date, no visible label" />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                <code>label</code> names the input via <code>htmlFor</code> and suppresses <code>aria-label</code>; <code>ariaLabel</code> is the fallback when there's no visible label. Same rule as <code>Field</code>.
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <DatePicker ariaLabel="Default" />
                <DatePicker ariaLabel="Hover" previewState="hover" />
                <DatePicker ariaLabel="Focus" previewState="focus" />
                <DatePicker defaultValue="12/25/2022" ariaLabel="Filled" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Invalid · disabled · subtle</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <DatePicker isInvalid ariaLabel="Invalid" />
                <DatePicker isDisabled ariaLabel="Disabled" />
                <DatePicker defaultValue="12/25/2022" isDisabled ariaLabel="Disabled filled" />
                <DatePicker appearance="subtle" ariaLabel="Subtle" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Subtle — focus · invalid · disabled (disabled drops the border entirely)</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <DatePicker appearance="subtle" ariaLabel="Subtle focus" previewState="focus" />
                <DatePicker appearance="subtle" isInvalid ariaLabel="Subtle invalid" />
                <DatePicker appearance="subtle" isDisabled ariaLabel="Subtle disabled" />
              </div>
            </div>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — click to open; calendarSlot composes a real month grid with prev/next navigation
              </div>
              <DatePickerDemo />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Time Picker ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="time-picker" title="Time Picker" description="No label slot. Single clear icon fades in only when filled AND unfocused (Hydrate keeps it hidden). Time list is an app-provided slot.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <TimePicker ariaLabel="Default" />
                <TimePicker ariaLabel="Hover" previewState="hover" />
                <TimePicker ariaLabel="Focus" previewState="focus" />
                <TimePicker defaultValue="1:00 PM" ariaLabel="Filled" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Invalid · disabled · subtle</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <TimePicker isInvalid ariaLabel="Invalid" />
                <TimePicker isDisabled ariaLabel="Disabled" />
                <TimePicker defaultValue="1:00 PM" isDisabled ariaLabel="Disabled filled" />
                <TimePicker appearance="subtle" ariaLabel="Subtle" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Subtle — hover (gains a background tint) · focus · invalid · disabled</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <TimePicker appearance="subtle" ariaLabel="Subtle hover" previewState="hover" />
                <TimePicker appearance="subtle" ariaLabel="Subtle focus" previewState="focus" />
                <TimePicker appearance="subtle" isInvalid ariaLabel="Subtle invalid" />
                <TimePicker appearance="subtle" isDisabled ariaLabel="Subtle disabled" />
              </div>
            </div>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — click to open; timesSlot composes a real scrollable option list
              </div>
              <TimePickerDemo />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Text area ──────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="text-area" title="Text area" description="Multi-line sibling of Field — same box tokens/states, no icon slots, real &lt;textarea&gt;.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Standard — states</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <TextArea label="Label" placeholder="Text" ariaLabel="Default" />
                <TextArea label="Label" placeholder="Text" ariaLabel="Hover" previewState="hover" />
                <TextArea label="Label" placeholder="Text" ariaLabel="Focus" previewState="focus" />
                <TextArea label="Label" defaultValue="Typed value that can wrap across multiple lines" ariaLabel="Filled" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Invalid · disabled · subtle</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <TextArea label="Label" placeholder="Text" isInvalid ariaLabel="Invalid" />
                <TextArea label="Label" placeholder="Text" isDisabled ariaLabel="Disabled" />
                <TextArea appearance="subtle" label="Label" placeholder="Text" ariaLabel="Subtle" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Subtle — focus · invalid · disabled (disabled drops the border entirely)</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <TextArea appearance="subtle" label="Label" placeholder="Text" ariaLabel="Subtle focus" previewState="focus" />
                <TextArea appearance="subtle" label="Label" placeholder="Text" isInvalid ariaLabel="Subtle invalid" />
                <TextArea appearance="subtle" label="Label" placeholder="Text" isDisabled ariaLabel="Subtle disabled" />
              </div>
            </div>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">Interactive — type directly (real textarea, native focus/typing behavior)</div>
              <TextArea label="Message" placeholder="Type something…" ariaLabel="Interactive" />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Filter Chip ───────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="filter-chip" title="Filter Chip" description="2 states × 4 icon combos — selected bg via color-mix() (no opacity token in source) — hover/press on unselected only (deliberate addition, see docs)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Default — icon combos</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <FilterChip label="Chip" />
                  <FilterChip label="Chip" iconLeft={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" iconRight={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" iconLeft={<Icon name="add" size="s" />} iconRight={<Icon name="close" size="s" />} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Selected — icon combos</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <FilterChip label="Chip" isSelected />
                  <FilterChip label="Chip" isSelected iconLeft={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" isSelected iconRight={<Icon name="add" size="s" />} />
                  <FilterChip label="Chip" isSelected iconLeft={<Icon name="add" size="s" />} iconRight={<Icon name="close" size="s" />} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Forced states (unselected)</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <FilterChip label="Default" />
                  <FilterChip label="Hover" previewState="hover" />
                  <FilterChip label="Pressed" previewState="pressed" />
                  <FilterChip label="Focus" previewState="focus" />
                </div>
              </div>
              <div className="showcase-interactive">
                <div className="showcase-interactive__label">Interactive example — click to toggle</div>
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Slider ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="slider" title="Slider" description="Single-thumb value slider — track + fill + white/blue thumb (0.25 halo on focus/drag). Drag, click, or arrow keys / Home / End.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">Interactive</div>
              <SliderDemo />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>disabled</div>
              <div style={{ maxWidth: '246px' }}>
                <Slider value={60} isDisabled ariaLabel="Disabled slider" />
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Range Slider ───────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="range-slider" title="Range Slider" description="Two-thumb min/max range with a tooltip on the active thumb and two synced Field inputs (drag ↔ type). Thumbs can't cross.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">Interactive — drag a thumb (tooltip appears) or type in a field</div>
              <RangeSliderDemo />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>showInputs=false — bare range track</div>
              <div style={{ maxWidth: '246px' }}>
                <RangeSlider minValue={30} maxValue={80} onChange={() => {}} showInputs={false} formatValue={v => `${v}%`} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Badge */}
          <Section id="badge" title="Badge" description="7 appearances × 2 types — tokens only — responds to light/dark toggle">
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Chips */}
          <Section id="chips" title="Chips" description="6 appearances × 2 bold states — lozenge / status badge. The leading glyph is a swappable slot as of v1.3.0 (was an unconditional done checkmark).">
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
            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', margin: '1.5rem 0 0.75rem' }}>
              icon slot (v1.3.0)
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Chips appearance="success" label="Linked" />
              <Chips appearance="removed" label="Removed" icon={<Icon name="close" size="s" />} />
              <Chips appearance="removed" label="No glyph" icon={null} />
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
              Omitted → the <code>done</code> checkmark, unchanged. A node → that glyph. <code>icon={null}</code> → no glyph at all, which is what a <code>removed</code> chip needs (it used to show a tick).
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Tag ────────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="tag" title="Tag" description="2 sizes × states (hover/active via pseudo-classes) + selected + disabled + interactive">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '80px', color: 'var(--mapped-text-subtle-default)' }}>static</span>
                <Tag label="Tag M" size="m" iconBefore={<Icon name="filter_list" size="s" />} iconAfter={<Icon name="close" size="s" />} />
                <Tag label="Tag S" size="s" />
                <Tag label="Selected" size="m" isSelected />
                <Tag label="Disabled" size="m" isDisabled />
              </div>
              <div className="showcase-interactive" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="showcase-interactive__label" style={{ marginBottom: 0 }}>interactive</span>
                {([['groceries', 'Groceries'], ['bills', 'Bills'], ['travel', 'Travel']] as const).map(([id, label]) => (
                  <Tag
                    key={id}
                    label={label}
                    size="m"
                    isSelected={!!tagSelected[id]}
                    iconBefore={<Icon name="filter_list" size="s" />}
                    onClick={() => setTagSelected(s => ({ ...s, [id]: !s[id] }))}
                  />
                ))}
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)' }}>
                  selected: <strong>{Object.entries(tagSelected).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}</strong>
                </span>
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Loader ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="loader" title="Loader" description="First CSS @keyframes animation in this codebase — 32px container + color confirmed from source; stroke width and rotation speed are estimates (see docs)">
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Loader />
              <Loader ariaLabel="Loading transactions" />
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Toast (desktop + mobile) ───────────────────────────────── */}
      {tab === 'components' && (
        <Section id="toast" title="Toast" description="System message in 6 appearances (ai = gradient), auto icon per appearance, description + actions slots, role=status/alert live region. Two layouts: desktop (Link actions + dismiss) and mobile (compact, inverse-tertiary Button).">
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Toast — desktop</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '624px', maxWidth: '100%' }}>
                {(['information', 'success', 'warning', 'error', 'discovery', 'ai'] as ToastAppearance[]).map(a => (
                  <Toast
                    key={a}
                    appearance={a}
                    title="Title"
                    role={a === 'error' || a === 'warning' ? 'alert' : 'status'}
                    onDismiss={() => {}}
                    actions={
                      <>
                        <Link appearance="inverse" size="s" label="Action" href="#" />
                        <Link appearance="inverse" size="s" label="Action" href="#" />
                      </>
                    }
                  >
                    Short and brief
                  </Toast>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>ToastMobile — compact</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '312px', maxWidth: '100%' }}>
                {(['information', 'success', 'warning', 'error', 'discovery', 'ai'] as ToastAppearance[]).map(a => (
                  <ToastMobile
                    key={a}
                    appearance={a}
                    title="Title"
                    role={a === 'error' || a === 'warning' ? 'alert' : 'status'}
                    actions={<Button variant="tertiary" size="m" label="Button" onClick={() => {}} />}
                  >
                    Short and brief
                  </ToastMobile>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Progress Bar ───────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="progress-bar" title="Progress Bar" description="Horizontal track, fill = success surface. Two versions: percentage-only, and a stepper with the current/total readout. Sizes S (caption) / M (body). Drag the controls to drive it.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '400px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Percentage only — sizes S &amp; M</div>
              <ProgressBarPercentDemo />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Stepper (current / total) — sizes S &amp; M</div>
              <ProgressBarStepperDemo />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Progress Ring ──────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="progress-ring" title="Progress Ring" description={"270° gauge with a conic blue→purple→red fill over a gray track; centre caption + amount + Badge (dark) pill. Sizes medium (h5) / large (h4). Enter a budget and amount spent to drive the \"left to spend\" gauge."}>
          <ProgressRingDemo />
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── ProgressStepper ────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="progress-stepper" title="Progress Stepper" description="7 steps, active bar = --mapped-icon-primary-default · inactive = --mapped-surface-default-default">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 3, 5, 7].map(step => (
                <div key={step} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', width: '80px', color: 'var(--mapped-text-subtle-default)' }}>step {step}/7</span>
                  <ProgressStepper totalSteps={7} currentStep={step} />
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Trend Indicator ────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="trend-indicator" title="Trend Indicator" description="Directional change indicator — up / down / flat. Direction reaches assistive tech as a word, never as colour or glyph alone.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Directions</div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <TrendIndicator direction="up" label="+10.2%" />
                <TrendIndicator direction="down" label="-2.49%" />
                <TrendIndicator direction="flat" label="0.00%" />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Not only percentages — the label is any pre-formatted string</div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <TrendIndicator direction="up" label="+RM 3,609.78" />
                <TrendIndicator direction="down" label="-RM 250.75" />
                <TrendIndicator direction="flat" label="RM 0.00" />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Announced strings — the sign is stripped so it is not stated twice</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>label "-2.49%" → aria-label "Decrease, 2.49%"</span>
                <span>label "+10.2%" → aria-label "Increase, 10.2%"</span>
                <span>label "0.00%" → aria-label "No change, 0.00%"</span>
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Tabs & Tab ─────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="tabs" title="Tabs" description="Controlled Tabs wrapper composing Tab instances, plus the Tab state matrix — no container background">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="showcase-interactive">
                <div className="showcase-interactive__label">Interactive — click to switch</div>
                <div style={{ width: 'fit-content' }}>
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
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                  Selected: <strong>{tabsSelected}</strong>
                </div>
              </div>
              <div className="showcase-interactive">
                <div className="showcase-interactive__label">isScrollable — 5 tabs in a 343px mobile frame; drag, wheel or arrow-key past the edge</div>
                <div style={{ width: '343px', maxWidth: '100%' }}>
                  <Tabs
                    tabs={[
                      { id: 'overview', label: 'Overview' },
                      { id: 'transactions', label: 'Transactions' },
                      { id: 'budget', label: 'Budget' },
                      { id: 'plans', label: 'Plans' },
                      { id: 'receipts', label: 'Receipts' },
                    ]}
                    selectedId={scrollableTabsSelected}
                    onChange={setScrollableTabsSelected}
                    ariaLabel="Account sections"
                    isScrollable
                  />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                  Selected: <strong>{scrollableTabsSelected}</strong>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--mapped-text-subtle-default)' }}>Tab — state matrix</div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', width: 'fit-content' }}>
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
                <div role="tablist" style={{ display: 'flex', gap: '0', width: 'fit-content' }}>
                  <Tab label="Overview" isSelected />
                  <Tab label="Activity" />
                  <Tab label="Settings" />
                  <Tab label="Members" />
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Breadcrumbs ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="breadcrumbs" title="Breadcrumbs" description="Composes Link (subtle) + Icon (chevron_right separator) — data-driven via items array — last item gets isCurrent (underline + aria-current)">
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Menu ───────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="menu" title="Menu" description="Floating dropdown chrome that wraps MenuItem rows. searchBar can be hidden for a plain option-list menu; slotContent is an app-provided option list.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>With search bar (default)</div>
              <Menu
                listAriaLabel="Menu with search bar example"
                slotContent={
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 var(--brand-scale-200)' }}>
                    {MENU_ITEM_OPTIONS.map((opt, i) => (
                      <MenuItem key={opt} label={opt} isSelected={i === 1} />
                    ))}
                  </div>
                }
              />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>searchBar=false — plain option-list dropdown (e.g. a nested currency picker with no search)</div>
              <Menu
                searchBar={false}
                listAriaLabel="Menu without search bar example"
                slotContent={
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 var(--brand-scale-200)' }}>
                    {MENU_ITEM_OPTIONS.map((opt, i) => (
                      <MenuItem key={opt} label={opt} isSelected={i === 2} />
                    ))}
                  </div>
                }
              />
            </div>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — real search filtering + real click selection
              </div>
              <MenuDemo />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Menu Item ──────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="menu-item" title="Menu Item" description="Shared row atom for Select-family dropdowns — composes into optionsSlot/timesSlot content. Menu chrome itself remains an app-provided slot.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>type="default" — states</div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '412px', border: '1px solid var(--mapped-border-subtlest-default)', borderRadius: 'var(--brand-scale-200)', overflow: 'hidden' }}>
                <MenuItem label="Default" iconSlot={<IconObject color="orange" size="s"><Icon name="person" size="s" /></IconObject>} />
                <MenuItem label="Hover" previewState="hover" iconSlot={<IconObject color="orange" size="s"><Icon name="person" size="s" /></IconObject>} />
                <MenuItem label="Press" previewState="pressed" iconSlot={<IconObject color="orange" size="s"><Icon name="person" size="s" /></IconObject>} />
                <MenuItem label="Selected" isSelected iconSlot={<IconObject color="orange" size="s"><Icon name="person" size="s" /></IconObject>} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>type="crypto" — states</div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '412px', border: '1px solid var(--mapped-border-subtlest-default)', borderRadius: 'var(--brand-scale-200)', overflow: 'hidden' }}>
                <MenuItem type="crypto" iconSlot={<IconObject color="teal" size="xl"><Icon name="icon_crypto" size="m" /></IconObject>} />
                <MenuItem type="crypto" previewState="hover" iconSlot={<IconObject color="teal" size="xl"><Icon name="icon_crypto" size="m" /></IconObject>} />
                <MenuItem type="crypto" previewState="pressed" iconSlot={<IconObject color="teal" size="xl"><Icon name="icon_crypto" size="m" /></IconObject>} />
                <MenuItem type="crypto" isSelected iconSlot={<IconObject color="teal" size="xl"><Icon name="icon_crypto" size="m" /></IconObject>} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>type="account" — states</div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '412px', border: '1px solid var(--mapped-border-subtlest-default)', borderRadius: 'var(--brand-scale-200)', overflow: 'hidden' }}>
                <MenuItem type="account" label="Margaret" avatarInitials="MG" />
                <MenuItem type="account" label="Margaret" avatarInitials="MG" previewState="hover" />
                <MenuItem type="account" label="Margaret" avatarInitials="MG" previewState="pressed" />
                <MenuItem type="account" label="Margaret" avatarInitials="MG" isSelected />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>type="checkbox" — states (incl. selected + press)</div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '412px', border: '1px solid var(--mapped-border-subtlest-default)', borderRadius: 'var(--brand-scale-200)', overflow: 'hidden' }}>
                <MenuItem type="checkbox" label="Label" />
                <MenuItem type="checkbox" label="Label" previewState="hover" />
                <MenuItem type="checkbox" label="Label" previewState="pressed" />
                <MenuItem type="checkbox" label="Label" isSelected />
                <MenuItem type="checkbox" label="Label" isSelected previewState="pressed" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>type="radio" — states (incl. selected + press)</div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '412px', border: '1px solid var(--mapped-border-subtlest-default)', borderRadius: 'var(--brand-scale-200)', overflow: 'hidden' }}>
                <MenuItem type="radio" label="Label" />
                <MenuItem type="radio" label="Label" previewState="hover" />
                <MenuItem type="radio" label="Label" previewState="pressed" />
                <MenuItem type="radio" label="Label" isSelected />
                <MenuItem type="radio" label="Label" isSelected previewState="pressed" />
              </div>
            </div>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — real click/keyboard selection (role="listbox" of type="default" rows)
              </div>
              <MenuItemDemo />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Navigation ─────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="navigation" title="Navigation" description="BottomNavigation (mobile tab bar) and SideNavigation (desktop sidebar, default + compact)">
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>BottomNavigation</div>
              <div style={{ width: '375px', maxWidth: '100%' }}>
                <BottomNavigation
                  items={[
                    { id: 'home', icon: 'icon_home', label: 'Home', isSelected: bottomNavSelected === 'home' },
                    { id: 'transfer', icon: 'icon_transfer', label: 'Transfer', isSelected: bottomNavSelected === 'transfer' },
                    { id: 'finance', icon: 'icon_finance', label: 'Finance', isSelected: bottomNavSelected === 'finance' },
                    { id: 'more', icon: 'icon_more', label: 'More', isSelected: bottomNavSelected === 'more' },
                  ]}
                  onSelect={setBottomNavSelected}
                />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>BottomNavigation — barWidth</div>
              <p style={{ color: 'var(--mapped-text-subtle-default)', fontSize: '0.75rem', margin: '0 0 0.75rem', maxWidth: '480px' }}>
                Both at <strong>480px</strong>. At 375px the two differ by only 7px (343 vs 336) and the
                prop looks inert, so a wider container is what makes it legible. In <code>fill</code> the
                extra width goes to the items (100px each here — 480 − 32 padding − 48 gaps, ÷ 4 — up
                from 64px) while the 16px gaps hold.
              </p>
              <div style={{ width: '480px', maxWidth: '100%', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>barWidth="hug" (default)</div>
                <BottomNavigation
                  items={[
                    { id: 'home', icon: 'icon_home', label: 'Home', isSelected: bottomNavSelected === 'home' },
                    { id: 'transfer', icon: 'icon_transfer', label: 'Transfer', isSelected: bottomNavSelected === 'transfer' },
                    { id: 'finance', icon: 'icon_finance', label: 'Finance', isSelected: bottomNavSelected === 'finance' },
                    { id: 'more', icon: 'icon_more', label: 'More', isSelected: bottomNavSelected === 'more' },
                  ]}
                  onSelect={setBottomNavSelected}
                />
              </div>
              <div style={{ width: '480px', maxWidth: '100%' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>barWidth="fill"</div>
                <BottomNavigation
                  barWidth="fill"
                  items={[
                    { id: 'home', icon: 'icon_home', label: 'Home', isSelected: bottomNavSelected === 'home' },
                    { id: 'transfer', icon: 'icon_transfer', label: 'Transfer', isSelected: bottomNavSelected === 'transfer' },
                    { id: 'finance', icon: 'icon_finance', label: 'Finance', isSelected: bottomNavSelected === 'finance' },
                    { id: 'more', icon: 'icon_more', label: 'More', isSelected: bottomNavSelected === 'more' },
                  ]}
                  onSelect={setBottomNavSelected}
                />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)' }}>SideNavigation</div>
                <label style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sideNavCompact} onChange={e => setSideNavCompact(e.target.checked)} />
                  isCompact
                </label>
              </div>
              <div style={{ height: '600px' }}>
                <SideNavigation
                  isCompact={sideNavCompact}
                  items={([
                    { id: 'home', icon: 'icon_home', label: 'Home' },
                    { id: 'transfer', icon: 'icon_transfer', label: 'Transfer' },
                    { id: 'finance', icon: 'icon_finance', label: 'Finance' },
                    { id: 'more', icon: 'icon_more', label: 'More' },
                  ] as SideNavItem[]).map(item => ({ ...item, isSelected: sideNavSelected === item.id }))}
                  utilityItems={[
                    { id: 'settings', icon: 'settings', label: 'Settings', isSelected: sideNavSelected === 'settings' },
                    { id: 'help', icon: 'help_outline', label: 'Help Center', isSelected: sideNavSelected === 'help' },
                  ]}
                  onSelect={setSideNavSelected}
                  onToggleCompact={() => setSideNavCompact(v => !v)}
                  profileName="Hi, Margaret👋"
                  profileEmail="Marge@gmail.com"
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Avatar */}
          <Section id="avatar" title="Avatar" description="3 states (photo / initials / placeholder) × 3 sizes — tokens only">

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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Card ───────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="card" title="Card" description="7 card types — SmartInsights, Action, Balance, DataDisplay, MonthlyBudget (default / addNew), Goals, FeaturesAndEducation">
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardSmartInsights</div>
              <CardSmartInsights
                icon={<Icon name="icon_grocery" size="l" />}
                title="Save 30%"
                titleColor="var(--brand-cyan-500)"
                description="Grocery promotions available nearby"
                linkLabel="View"
              />
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardAction</div>
              <CardAction
                icon={<Icon name="send" size="l" />}
                title="Send"
                description="Transfer money or crypto to others quickly and securely."
                onClick={() => {}}
              />
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardBalance</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <CardBalance
                  icon={<Icon name="question_mark" size="m" />}
                  type="Wallet"
                  name="Main Account"
                  amount="RM 1,204.50"
                />
                <CardBalance
                  icon={<Icon name="question_mark" size="m" />}
                  type="Wallet"
                  name="Tappable"
                  amount="RM 1,204.50"
                  onClick={() => setBalanceClicks(c => c + 1)}
                />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                Left: no <code>onClick</code> — plain div, not focusable. Right: <code>onClick</code> — real button, tab to it and press Enter. Clicks: <strong>{balanceClicks}</strong>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', margin: '1.5rem 0 0.75rem' }}>
                CardBalance — per-category iconColor (v1.3.0, closes G3)
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <CardBalance
                  icon={<Icon name="icon_grocery" size="m" />}
                  iconColor="teal"
                  iconAriaLabel="Groceries category"
                  type="Budget"
                  name="Groceries"
                  amount="RM 320.00"
                />
                <CardBalance
                  icon={<Icon name="icon_car" size="m" />}
                  iconColor="orange"
                  shape="square"
                  iconAriaLabel="Transport category"
                  type="Budget"
                  name="Transport"
                  amount="RM 180.00"
                />
                <CardBalance
                  icon={<Icon name="icon_healthcare" size="s" />}
                  iconColor="green"
                  iconSize="xs"
                  iconAriaLabel="Healthcare category"
                  type="Budget"
                  name="Healthcare"
                  amount="RM 95.00"
                />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                Badge was hard-coded <code>color="slate" size="l"</code>. Now <code>iconColor</code> / <code>iconSize</code> / <code>shape</code> / <code>iconAriaLabel</code>; omit them all and the render is unchanged (first two cards above).
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardDataDisplay</div>
              <CardDataDisplay info="Category" content="Groceries" content2="12 transactions" />
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardMonthlyBudget</div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <CardMonthlyBudget
                  period="1 Jul - 31 Jul"
                  percentage={62}
                  amountLeft="RM 620.00"
                  totalAmount="RM 1,000.00"
                  availableAmount="RM 620.00"
                  spentAmount="RM 380.00"
                />
                <CardMonthlyBudget state="addNew" />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardGoals</div>
              <CardGoals
                image={<div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #2a4dbd 0%, #60c680 100%)' }} />}
                title="New Laptop"
                percentage={40}
                current="RM400"
                total="RM1000"
              />
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardFeaturesAndEducation</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <CardFeaturesAndEducation variant="blue" icon={<Icon name="icon_transfer" size="l" />} title="Transfer" />
                <CardFeaturesAndEducation variant="orange" icon={<Icon name="icon_bills" size="l" />} title="Bills" />
                <CardFeaturesAndEducation variant="green" icon={<Icon name="icon_budget" size="l" />} title="Budget" />
                <CardFeaturesAndEducation variant="purple" icon={<Icon name="icon_aiinsights" size="l" />} title="Insights" />
                <CardFeaturesAndEducation variant="outline" icon={<Icon name="icon_transfer" size="l" />} title="Transfer" />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>CardFeaturesAndEducation — sizing</div>
              <p style={{ color: 'var(--mapped-text-subtle-default)', fontSize: '0.75rem', margin: '0 0 0.75rem', maxWidth: '480px' }}>
                Both rows are <strong>480px</strong> wide. This width is deliberate: at 375px three tiles
                fill exactly by coincidence (3 × 109 + 2 × 8 = 343 = 375 − 32), so <code>fill</code> and
                <code>fixed</code> would render identically and demonstrate nothing.
              </p>
              <div style={{ width: '480px', maxWidth: '100%' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.35rem' }}>sizing="fixed" (default) — 109px cap, leaves a gap</div>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <CardFeaturesAndEducation variant="blue" icon={<Icon name="icon_transfer" size="l" />} title="Transfer" />
                  <CardFeaturesAndEducation variant="orange" icon={<Icon name="icon_bills" size="l" />} title="Bills" />
                  <CardFeaturesAndEducation variant="green" icon={<Icon name="icon_budget" size="l" />} title="Budget" />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.35rem' }}>sizing="fill" — divides the row, min-width 90px still applies</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <CardFeaturesAndEducation sizing="fill" variant="blue" icon={<Icon name="icon_transfer" size="l" />} title="Transfer" />
                  <CardFeaturesAndEducation sizing="fill" variant="orange" icon={<Icon name="icon_bills" size="l" />} title="Bills" />
                  <CardFeaturesAndEducation sizing="fill" variant="green" icon={<Icon name="icon_budget" size="l" />} title="Budget" />
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Label */}
          <Section id="label" title="Label" description="2 sizes × 2 tones × optional required asterisk × optional leading/trailing icons. tone governs BOTH text and icon — Figma binds text/subtle/default and icon/subtle/default together (v1.4.0).">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(['default', 'subtle'] as const).map(tone => (
                <div key={tone} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>tone={tone}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                    <Label label="Text only" tone={tone} />
                    <Label label="With icon" tone={tone} iconBefore={<Icon name="help_outline" size="s" />} />
                    <Label label="Required" tone={tone} isRequired iconBefore={<Icon name="help_outline" size="s" />} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
              {(['m', 's'] as const).map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>size={size}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                    <Label label="Label" size={size} />
                    <Label label="Required" size={size} isRequired />
                    <Label label="With icons" size={size}
                      iconBefore={<Icon name="help_outline" size={size === 'm' ? 'm' : 's'} />}
                      iconAfter={<Icon name="help_outline" size={size === 'm' ? 'm' : 's'} />}
                    />
                    <Label label="Required + icons" size={size} isRequired
                      iconBefore={<Icon name="help_outline" size={size === 'm' ? 'm' : 's'} />}
                      iconAfter={<Icon name="help_outline" size={size === 'm' ? 'm' : 's'} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Icon Object ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <>
          <Section id="icon-object" title="Icon Object" description="13 colors × circle/square × 6 sizes — --brand-[color]-400 backgrounds, white icon via currentColor. xs (16px) added in v1.3.0 using the existing --brand-scale-400.">
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
                  {(['xs', 's', 'm', 'l', 'xl', 'xxl'] as IconObjectSize[]).map(sz => (
                    <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <IconObject color="blue" shape="circle" size={sz}><Icon name="person" size={sz === 'xs' || sz === 's' || sz === 'm' ? 's' : sz === 'l' ? 'm' : 'l'} /></IconObject>
                      <IconObject color="blue" shape="square" size={sz}><Icon name="person" size={sz === 'xs' || sz === 's' || sz === 'm' ? 's' : sz === 'l' ? 'm' : 'l'} /></IconObject>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{sz}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Divider */}
          <Section id="divider" title="Divider" description="2 weights × 2 orientations — token: --mapped-border-subtle-default">
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Donut Chart ────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="donut-chart" title="Donut Chart" description="Segmented donut / pie. Shares are DERIVED from raw values — the component never accepts a percentage. No default palette: every segment states its own hue.">
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Budget — 7 categories, Figma&apos;s hue assignment</div>
              <div style={{ width: '200px' }}>
                <DonutChart segments={BUDGET_SEGMENTS} centreLabel="RM 7,500" centreCaption="Total budget" />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>innerRadius=0 → pie</div>
              <div style={{ width: '200px' }}>
                <DonutChart segments={BUDGET_SEGMENTS} innerRadius={0} />
              </div>
            </div>

            <div style={{ minWidth: '260px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Paired legend — ChartLegendItem, iconColor per series</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {BUDGET_SEGMENTS.map(s => (
                  <ChartLegendItem
                    key={s.id}
                    variant="legend"
                    iconColor={s.color}
                    title={s.label}
                    subtitle={`${((s.value / 7500) * 100).toFixed(2)}%`}
                    amount={`RM ${s.value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
                    hasChevron={false}
                  />
                ))}
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.75rem' }}>
                The chart is aria-hidden; this legend is the accessible artifact.
              </p>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Line Chart ─────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="line-chart" title="Line Chart" description="Line / area, and — with chrome off — the sparkline. Area is the same hue at -100, never the line colour at reduced opacity (no opacity token exists).">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>chromeTone=&quot;default&quot; — gridlines, axis, marker</div>
              <div style={{ width: '343px', height: '157px' }}>
                <LineChart
                  points={NETWORTH_SERIES}
                  domain={31}
                  color="blue"
                  showArea
                  showGridlines
                  showAxis
                  xLabels={['01', '15', '31']}
                  marker={{ index: NETWORTH_SERIES.length - 1, label: '+ RM 8,768.35' }}
                  summary="Net worth, Sep 01 to Sep 31, up RM 8,768.35"
                />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>chromeTone=&quot;onColor&quot; — on a coloured host card, as Flow 7 draws it</div>
              <div style={{ width: '375px', padding: '1rem', borderRadius: '8px', background: 'var(--brand-blue-500)' }}>
                <div style={{ color: 'var(--mapped-text-on-color-heading)', fontWeight: 600, marginBottom: '0.5rem' }}>RM 450,958.84</div>
                <div style={{ height: '157px' }}>
                  <LineChart
                    points={NETWORTH_SERIES}
                    domain={31}
                    color="onColor"
                    chromeTone="onColor"
                    showArea
                    showGridlines
                    showAxis
                    xLabels={['01', '15', '31']}
                    marker={{ index: NETWORTH_SERIES.length - 1, label: '+ RM 8,768.35' }}
                    summary="Net worth, Sep 01 to Sep 31, up RM 8,768.35"
                  />
                </div>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                No area fill on this series — see E-4. No token can tint white.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Bare sparkline — all chrome off, 80×40, aria-hidden</div>
              <div style={{ width: '80px', height: '40px' }}>
                <LineChart points={SPARK_SERIES} color="green" showArea />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>Inside ListItem&apos;s miniChart slot</div>
              <div style={{ width: '320px' }}>
                <ListItem
                  type="crypto"
                  leading={<Logo name="solana" size="s" />}
                  title="Solana"
                  titleInfo="SOL"
                  amount="RM 4,465.00"
                  amountInfo="+250.68%"
                  trendDirection="up"
                  miniChart={<LineChart points={SPARK_SERIES} color="green" showArea />}
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Item ───────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="item" title="Item" description="ListItem (default / profile / crypto), SummaryItem, and ChartLegendItem (legend / contribution)">
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>ListItem</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
                <ListItem
                  type="default"
                  leading={<Avatar size="l" name="Aeon Bank" />}
                  title="Aeon Bank"
                  titleInfo="Transfer"
                  amount="$120.00"
                  amountInfo="Today"
                  onClick={() => setLastItemClicked('default')}
                />
                <ListItem
                  type="profile"
                  leading={<Avatar size="l" src="https://i.pravatar.cc/80?img=5" name="Rachel Um" />}
                  title="Rachel Um"
                  titleInfo="rachel@gmail.com"
                  onClick={() => setLastItemClicked('profile')}
                />
                <ListItem
                  type="crypto"
                  leading={<Logo name="bitcoin" size="s" />}
                  title="Bitcoin"
                  titleInfo="BTC"
                  amount="$0.00"
                  amountInfo="0%"
                  // 0% is exactly what `flat` exists for — a green up-arrow on
                  // no movement is the defect TrendIndicator was built to fix.
                  trendDirection="flat"
                  miniChart={
                    <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0 30 L15 22 L30 26 L45 12 L60 18 L80 4 L80 40 L0 40 Z"
                        fill="var(--mapped-icon-success-default)"
                        opacity="0.15"
                      />
                      <path
                        d="M0 30 L15 22 L30 26 L45 12 L60 18 L80 4"
                        stroke="var(--mapped-icon-success-default)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  onClick={() => setLastItemClicked('crypto')}
                />
                {/* Phase 5.4 — the wiring, made visible. Before TrendIndicator
                    existed this row drew a green up-triangle unconditionally,
                    so a decline rendered as a rise. */}
                <ListItem
                  type="crypto"
                  leading={<Logo name="ethereum" size="s" />}
                  title="Ethereum"
                  titleInfo="ETH"
                  amount="RM 25,588.51"
                  amountInfo="-2.49%"
                  trendDirection="down"
                  onClick={() => setLastItemClicked('crypto (down)')}
                />
                {/* amountInfo omitted — renders no indicator at all, rather
                    than a lone arrow with no number. */}
                <ListItem
                  type="crypto"
                  leading={<Logo name="tether" size="s" />}
                  title="Tether"
                  titleInfo="USDT"
                  amount="RM 15,353.10"
                  onClick={() => setLastItemClicked('crypto (no trend)')}
                />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.75rem' }}>
                Last clicked: <strong>{lastItemClicked ?? '—'}</strong>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', margin: '1.5rem 0 0.75rem' }}>SummaryItem</div>
              <SummaryItem amount="RM 0,00" type="Income" />

              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', margin: '1.5rem 0 0.75rem' }}>
                SummaryItem — per-category iconColor (v1.3.0, closes G4)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <SummaryItem
                  icon={<Icon name="icon_wallet" size="m" />}
                  iconColor="teal"
                  iconAriaLabel="Available balance"
                  amount="RM 1,240.00"
                  type="Available"
                />
                <SummaryItem
                  icon={<Icon name="icon_spending_alert" size="m" />}
                  iconColor="yellow"
                  shape="square"
                  iconAriaLabel="Amount spent"
                  amount="RM 860.00"
                  type="Spent"
                />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.5rem' }}>
                Same hard-coded badge as CardBalance, character-identical — G4 to its G3. Top row omits every new prop and renders unchanged.
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>ChartLegendItem</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
                <ChartLegendItem variant="legend" title="Groceries" subtitle="32%" amount="RM320.00" />
                <ChartLegendItem variant="contribution" title="Transfer" subtitle="Subtitle" amount="0" />
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Element Wrapper */}
          <Section id="element-wrapper" title="Element Wrapper" description="7 sizes — square centering shell for Icon / Avatar / Logo — tokens only">
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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="modal" title="Modal" description="Generic dialog container over a Blanket scrim: optional leading header icon + title + close, a flexible content slot, and a footer that composes real Buttons. Portaled to body; dialog a11y (aria-modal, focus trap, Escape).">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — opens a real overlay; ✕ / Escape / scrim click all close
              </div>
              <ModalDemo />
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--mapped-text-subtle-default)', marginTop: '0.75rem' }}>
                Left: no <code>headerIconLeft</code> — the title renders exactly as it always has (verified sub-pixel identical). Right: <code>headerIconLeft</code> shares the centred cell, so icon+title centre as one unit.
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Sheet ──────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="sheet" title="Sheet" description="Bottom-anchored, full-width dialog over a Blanket scrim. Every region except the content is optional; the content is the only thing that scrolls, capped at the viewport with no visible scrollbar.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
            <div className="showcase-interactive">
              <div className="showcase-interactive__label">
                Interactive — opens a real overlay; ✕ / Escape / scrim click all close
              </div>
              <SheetDemo />
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--mapped-text-subtle-default)', fontSize: '0.8rem', lineHeight: 1.7 }}>
              {SHEET_VARIANTS.map(v => (
                <li key={v.key}>
                  <strong style={{ color: 'var(--mapped-text-default-default)' }}>{v.label}</strong> — {v.note}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Blanket */}
          <Section id="blanket" title="Blanket">
            <BlanketDemo />
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
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
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', color: 'var(--mapped-icon-default-default)' }}>
                <Icon name={name} size="m" />
                <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', maxWidth: '4rem', textAlign: 'center', wordBreak: 'break-all' }}>{name}</span>
              </div>
            )
            return (
              <Section id="icon" title="Icon" description="102 icons (66 Material Round + 36 Custom) — sized via --brand-scale-* (xs/s/m/l/xl) — inherits currentColor">

                {/* v1.4.0: the brand mark + the 32px size step it needs */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>
                    v1.4.0 — logo_monarch · size xl (32px)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
                    {(['xs', 's', 'm', 'l', 'xl'] as const).map(size => (
                      <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--mapped-icon-default-default)' }}>
                        <Icon name="logo_monarch" size={size} />
                        <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>{size}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <IconObject color="ai" shape="circle" size="xxl" ariaLabel="Monarch AI">
                        <Icon name="logo_monarch" size="xl" />
                      </IconObject>
                      <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--mapped-text-subtlest-subtlest)' }}>AI FAB</span>
                    </div>
                  </div>
                </div>

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
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginBottom: '1.75rem', color: 'var(--mapped-icon-default-default)' }}>
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
              </Section>
            )
          })()}
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {tab === 'components' && (
        <>
          {/* Logo */}
          <Section id="logo" title="Logo" description="30 logos auto-registered from Assets/logo/ — full color preserved — no token coloring">

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
          </Section>
        </>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── Header ─────────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="header" title="Header" description="HeaderBg (mobile screen header, swappable background slot) and HeaderDefault (function-flow header, 6 variants)">
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>HeaderBg — default</div>
              <div style={{ width: '375px', maxWidth: '100%' }}>
                <HeaderBg
                  variant="default"
                  background={<div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1a1f6e 0%, #2a4dbd 40%, #4f7fe0 70%, #cfa64a 100%)' }} />}
                />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>HeaderBg — noSearchBar</div>
              <div style={{ width: '375px', maxWidth: '100%' }}>
                <HeaderBg
                  variant="noSearchBar"
                  background={<div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1a1f6e 0%, #2a4dbd 40%, #4f7fe0 70%, #cfa64a 100%)' }} />}
                />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>HeaderBg — compact</div>
              <div style={{ width: '375px', maxWidth: '100%' }}>
                <HeaderBg
                  variant="compact"
                  title="Finance"
                  background={<div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1a1f6e 0%, #2a4dbd 40%, #4f7fe0 70%, #cfa64a 100%)' }} />}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mapped-text-subtlest-subtlest, #aaa)', marginBottom: '0.75rem' }}>HeaderDefault — 6 variants</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '500px', border: '1px solid var(--mapped-border-subtlest-default, #ccc)', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <HeaderDefault title="Title" subtitle="Subtitle" hasSubtitle actionLabel="Action" />
              <HeaderDefault title="Title" subtitle="Subtitle" hasSubtitle />
              <HeaderDefault subtitle="Subtitle" hasSubtitle isProgressStepper currentStep={1} totalSteps={7} />
              <HeaderDefault title="Title" hasSubtitle={false} />
              <HeaderDefault hasSubtitle={false} isProgressStepper currentStep={3} totalSteps={7} />
              <HeaderDefault title="Title" hasSubtitle={false} actionLabel="Action" />
            </div>
          </div>
        </Section>
      )}

      {tab === 'components' && <hr style={HR} />}

      {/* ── StatusBar ──────────────────────────────────────────────── */}
      {tab === 'components' && (
        <Section id="status-bar" title="StatusBar" description="Fake OS-chrome status bar — Light/Dark modes are fixed per surface, not tied to the app theme">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '375px' }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--mapped-border-subtlest-default, #ccc)' }}>
              <StatusBar mode="Light" />
            </div>
            <div style={{ background: '#262626' }}>
              <StatusBar mode="Dark" />
            </div>
          </div>
        </Section>
      )}

        </main>
      </div>
    </div>
  )
}
