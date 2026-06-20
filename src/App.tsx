import { useState, useEffect } from 'react'
import './styles/globals.css'
import { brand, alias, mapped } from './tokens'

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

// ── Mapped swatches ───────────────────────────────────────────────────────────

function MappedSwatch({ slug, varName }: { slug: string; varName: string }) {
  return (
    <div style={{
      width: '9rem', borderRadius: '0.5rem', overflow: 'hidden',
      border: '1px solid rgba(128,128,128,0.2)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ background: `var(${varName})`, height: '3rem' }} />
      <div style={{ padding: '0.4rem 0.5rem', background: 'var(--mapped-surface-elevation-default, #fff)' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--mapped-text-default-default, #333)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {varName}
        </div>
      </div>
    </div>
  )
}

function MappedGroupSection({ group, entries }: { group: string; entries: [string, string][] }) {
  return (
    <section style={SECTION}>
      <h2 style={{ ...GROUP_LABEL, color: 'var(--mapped-text-subtle-default, #888)' }}>{group}</h2>
      <div style={SWATCH_GRID}>
        {entries.map(([slug, varName]) => (
          <MappedSwatch key={slug} slug={slug} varName={varName} />
        ))}
      </div>
    </section>
  )
}

// ── Data assembly ─────────────────────────────────────────────────────────────

const brandScales: [string, Record<string, string>][] = []
let brandFoundations: Record<string, string> = {}
for (const [name, group] of Object.entries(brand) as [string, Record<string, string>][]) {
  if (name === 'foundations') brandFoundations = group
  else brandScales.push([name, group])
}

const aliasGroups = Object.entries(alias) as [string, Record<string, string>][]

// Group mapped tokens by first slug segment
const SHOW_MAPPED_GROUPS = ['surface', 'text', 'icon', 'border', 'blanket']
const mappedByGroup = new Map<string, [string, string][]>()
for (const [slug, varName] of Object.entries(mapped) as [string, string][]) {
  const group = slug.split('-')[0]
  if (!mappedByGroup.has(group)) mappedByGroup.set(group, [])
  mappedByGroup.get(group)!.push([slug, varName])
}
const mappedGroups = SHOW_MAPPED_GROUPS
  .filter(g => mappedByGroup.has(g))
  .map(g => [g, mappedByGroup.get(g)!] as [string, [string, string][]])

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
          Mapped/Light.json + Dark.json — {Object.keys(mapped).length} tokens — toggle above to flip modes
        </p>
        <p style={{ color: 'var(--mapped-text-subtlest-subtlest, #aaa)', fontSize: '0.75rem', marginBottom: '2rem' }}>
          Current mode: <strong style={{ color: 'var(--mapped-text-primary-default)' }}>{dark ? 'dark' : 'light'}</strong>
        </p>

        {mappedGroups.map(([group, entries]) => (
          <MappedGroupSection key={group} group={group} entries={entries} />
        ))}
      </div>

    </div>
  )
}
