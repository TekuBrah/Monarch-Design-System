import type { FC, SVGProps } from 'react'

type SvgComponent = FC<SVGProps<SVGSVGElement> & { title?: string }>

export type LogoCategory = 'brand' | 'company' | 'crypto'

// Autocomplete type — maintained alongside the SVG files in Assets/logo/<category>/.
// When adding a new SVG, append its normalized name (lowercase, non-alphanumeric → _).
export type LogoName =
  // brand
  | 'monarch_logo_style_thick'
  | 'monarch_logo_style_thin'
  // company
  | 'aeon'
  | 'aia'
  | 'anytimefitness'
  | 'bili_bili_inc'
  | 'bio_lab_laboratories'
  | 'caring'
  | 'celcom'
  | 'flag'
  | 'giant'
  | 'ikea'
  | 'jayagrocer'
  | 'kfc'
  | 'lotus_s'
  | 'maybank'
  | 'netflix'
  | 'tonyroma'
  | 'touchngo'
  | 'umobile'
  // crypto
  | 'binance_coin'
  | 'bitcoin'
  | 'ethereum'
  | 'general'
  | 'litecoin'
  | 'polygon'
  | 'solana'
  | 'stellar'
  | 'tether'
  | 'uniswap'

export interface LogoEntry {
  name: LogoName
  category: LogoCategory
  Component: SvgComponent
}

function toName(path: string): LogoName {
  const file = path.split('/').pop() ?? ''
  return file
    .replace(/\.svg$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') as LogoName
}

const brandRaw = import.meta.glob('../../../Assets/logo/brand/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
}) as Record<string, SvgComponent>

const companyRaw = import.meta.glob('../../../Assets/logo/company/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
}) as Record<string, SvgComponent>

const cryptoRaw = import.meta.glob('../../../Assets/logo/crypto/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
}) as Record<string, SvgComponent>

function toEntries(raw: Record<string, SvgComponent>, category: LogoCategory): LogoEntry[] {
  return Object.entries(raw).map(([path, Component]) => ({
    name: toName(path),
    category,
    Component,
  }))
}

export const LOGOS: LogoEntry[] = [
  ...toEntries(brandRaw, 'brand'),
  ...toEntries(companyRaw, 'company'),
  ...toEntries(cryptoRaw, 'crypto'),
]

export const LOGO_MAP = Object.fromEntries(
  LOGOS.map(l => [l.name, l]),
) as Record<LogoName, LogoEntry>

export const LOGOS_BY_CATEGORY: Record<LogoCategory, LogoEntry[]> = {
  brand:   LOGOS.filter(l => l.category === 'brand'),
  company: LOGOS.filter(l => l.category === 'company'),
  crypto:  LOGOS.filter(l => l.category === 'crypto'),
}
