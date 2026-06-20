import './styles/globals.css'
import { brand, alias } from './tokens'

// ── Types ─────────────────────────────────────────────────────────────────────

type HexMap    = Record<string, string>
type VarMap    = Record<string, string>

// ── Helpers ───────────────────────────────────────────────────────────────────

const SECTION: React.CSSProperties = { marginBottom: '2.5rem' }
const LABEL: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const,
  letterSpacing: '0.08em', color: '#888', marginBottom: '0.5rem',
}
const SWATCH_GRID: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }
const CARD: React.CSSProperties = {
  width: '7.5rem', borderRadius: '0.5rem', overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const CARD_BODY: React.CSSProperties = { padding: '0.4rem 0.5rem', background: '#fff' }
const NAME_TEXT: React.CSSProperties = { fontSize: '0.68rem', fontWeight: 600, color: '#333' }
const VAR_TEXT: React.CSSProperties  = { fontSize: '0.6rem', color: '#888', fontFamily: 'monospace', marginTop: '0.1rem' }
const HEX_TEXT: React.CSSProperties  = { fontSize: '0.6rem', color: '#aaa', fontFamily: 'monospace' }

// ── Brand swatch ──────────────────────────────────────────────────────────────

function BrandSwatch({ scaleName, step, hex }: { scaleName: string; step: string; hex: string }) {
  const isFoundation = scaleName === 'foundations'
  const varName = isFoundation ? `--brand-${step}` : `--brand-${scaleName.toLowerCase()}-${step}`
  return (
    <div style={CARD}>
      <div style={{ background: hex, height: '3.5rem' }} />
      <div style={CARD_BODY}>
        <div style={NAME_TEXT}>{isFoundation ? step : `${scaleName} ${step}`}</div>
        <div style={VAR_TEXT}>{varName}</div>
        <div style={HEX_TEXT}>{hex}</div>
      </div>
    </div>
  )
}

function BrandScaleRow({ name, steps }: { name: string; steps: HexMap }) {
  return (
    <section style={SECTION}>
      <h2 style={LABEL}>{name}</h2>
      <div style={SWATCH_GRID}>
        {Object.entries(steps).map(([step, hex]) => (
          <BrandSwatch key={step} scaleName={name} step={step} hex={hex} />
        ))}
      </div>
    </section>
  )
}

// ── Alias swatch ──────────────────────────────────────────────────────────────

function AliasSwatch({ groupName, step, brandVar }: { groupName: string; step: string; brandVar: string }) {
  const aliasVar = `--alias-${groupName.toLowerCase()}-${step}`
  // Strip leading '--' for the readable label
  const brandLabel = brandVar.replace(/^--/, '')
  return (
    <div style={CARD}>
      {/* Background via alias CSS var — resolves through the cascade at runtime */}
      <div style={{ background: `var(${aliasVar})`, height: '3.5rem' }} />
      <div style={CARD_BODY}>
        <div style={NAME_TEXT}>{groupName.toLowerCase()}-{step}</div>
        <div style={VAR_TEXT}>{aliasVar}</div>
        <div style={{ ...HEX_TEXT, color: '#b07e00' }}>→ {brandLabel}</div>
      </div>
    </div>
  )
}

function AliasGroupRow({ name, steps }: { name: string; steps: VarMap }) {
  return (
    <section style={SECTION}>
      <h2 style={LABEL}>{name}</h2>
      <div style={SWATCH_GRID}>
        {Object.entries(steps).map(([step, brandVar]) => (
          <AliasSwatch key={step} groupName={name} step={step} brandVar={brandVar} />
        ))}
      </div>
    </section>
  )
}

// ── Data assembly ─────────────────────────────────────────────────────────────

const brandScales: [string, HexMap][] = []
let brandFoundations: HexMap = {}

for (const [name, group] of Object.entries(brand) as [string, HexMap][]) {
  if (name === 'foundations') brandFoundations = group
  else brandScales.push([name, group])
}

const aliasGroups = Object.entries(alias) as [string, VarMap][]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#f9f9f9', minHeight: '100vh' }}>

      {/* ── Brand primitives ── */}
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
        Brand Primitives
      </h1>
      <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
        Brand/Value.json — {brandScales.length} color scales + foundations
      </p>

      {brandScales.map(([name, steps]) => (
        <BrandScaleRow key={name} name={name} steps={steps} />
      ))}
      <BrandScaleRow name="foundations" steps={brandFoundations} />

      {/* ── Divider ── */}
      <hr style={{ border: 'none', borderTop: '2px solid #e5e5e5', margin: '2rem 0 2.5rem' }} />

      {/* ── Alias / Semantic ── */}
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>
        Alias / Semantic
      </h1>
      <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
        Alias/Alias.json — {aliasGroups.length} groups — chain shown as alias → brand token
      </p>

      {aliasGroups.map(([name, steps]) => (
        <AliasGroupRow key={name} name={name} steps={steps} />
      ))}

    </div>
  )
}
