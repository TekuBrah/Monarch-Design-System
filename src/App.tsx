import './styles/globals.css'
import { brand } from './tokens'

type HexMap = Record<string, string>

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function Swatch({ scaleName, step, hex }: { scaleName: string; step: string; hex: string }) {
  const isFoundation = scaleName === 'foundations'
  const varName = isFoundation
    ? `--brand-${step}`
    : `--brand-${scaleName.toLowerCase()}-${step}`
  return (
    <div style={{
      width: '7rem',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ background: hex, height: '3.5rem' }} />
      <div style={{ padding: '0.4rem 0.5rem', background: '#fff' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#333' }}>
          {isFoundation ? step : `${scaleName} ${step}`}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.1rem', fontFamily: 'monospace' }}>
          {varName}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#aaa', fontFamily: 'monospace' }}>
          {hex}
        </div>
      </div>
    </div>
  )
}

function ScaleRow({ name, steps }: { name: string; steps: HexMap }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#888', marginBottom: '0.5rem',
      }}>
        {name}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {Object.entries(steps).map(([step, hex]) => (
          <Swatch key={step} scaleName={name} step={step} hex={hex} />
        ))}
      </div>
    </section>
  )
}

// Split brand into color scales and foundations, preserving source order
const colorScales: [string, HexMap][] = []
let foundationsSteps: HexMap = {}

for (const [name, group] of Object.entries(brand) as [string, HexMap][]) {
  if (name === 'foundations') {
    foundationsSteps = group
  } else {
    colorScales.push([name, group])
  }
}

export default function App() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      background: '#f9f9f9',
      minHeight: '100vh',
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111' }}>
        Brand Primitives
      </h1>
      <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '0.875rem' }}>
        Brand/Value.json — {colorScales.length} color scales + foundations
      </p>

      {colorScales.map(([name, steps]) => (
        <ScaleRow key={name} name={name} steps={steps} />
      ))}

      <ScaleRow name="foundations" steps={foundationsSteps} />
    </div>
  )
}
