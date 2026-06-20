import './styles/globals.css'
import { brand } from './tokens'

type ColorScale = Record<string | number, string>

const COLOR_SCALES: [string, ColorScale][] = [
  ['Slate',  brand.Slate  as unknown as ColorScale],
  ['Blue',   brand.Blue   as unknown as ColorScale],
  ['Grey',   brand.Grey   as unknown as ColorScale],
  ['Red',    brand.Red    as unknown as ColorScale],
  ['Orange', brand.Orange as unknown as ColorScale],
  ['Green',  brand.Green  as unknown as ColorScale],
  ['Cyan',   brand.Cyan   as unknown as ColorScale],
]

const FOUNDATIONS: [string, string][] = [
  ['white', brand.foundations.white],
  ['black', brand.foundations.black],
]

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111' }}>
        Brand Primitives
      </h1>
      <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '0.875rem' }}>
        Brand.json — color scales
      </p>

      {COLOR_SCALES.map(([name, scale]) => (
        <section key={name} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '0.5rem' }}>
            {name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(scale).map(([step, hex]) => {
              const varName = `--brand-${name.toLowerCase()}-${step}`
              const dark = isDark(hex)
              return (
                <div
                  key={step}
                  style={{
                    width: '7rem',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ background: hex, height: '3.5rem' }} />
                  <div style={{ padding: '0.4rem 0.5rem', background: '#fff' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#333' }}>
                      {name} {step}
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
            })}
          </div>
        </section>
      ))}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '0.5rem' }}>
          Foundations
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {FOUNDATIONS.map(([name, hex]) => (
            <div
              key={name}
              style={{
                width: '7rem',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ background: hex, height: '3.5rem' }} />
              <div style={{ padding: '0.4rem 0.5rem', background: '#fff' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#333' }}>
                  {name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.1rem', fontFamily: 'monospace' }}>
                  --brand-{name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#aaa', fontFamily: 'monospace' }}>
                  {hex}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
