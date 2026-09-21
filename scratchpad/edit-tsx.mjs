import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/components/InlineMessage/InlineMessage.tsx'
let s = readFileSync(p, 'utf8')
const eol = s.includes('\r\n') ? '\r\n' : '\n'
s = s.replace(/\r\n/g, '\n')
const rep = (a, b) => { if (!s.includes(a)) { console.error('MISSING:', a.slice(0, 60)); process.exit(1) } s = s.replace(a, b) }
rep(`import './InlineMessage.css'\n`, `import './InlineMessage.css'\nimport { Icon } from '../Icon'\nimport type { IconName } from '../Icon/Icon'\n`)
rep(`/**
 * The tones this component offers: the two the MVP has actually needed — a
 * neutral prompt and a warning advisory. A tone colours the title with its own
 * \`--mapped-text-<tone>-default\`, at the value designed in Figma; this
 * component never substitutes a different colour for a tone.
 *
 * Adding a tone later widens the union, which is not a breaking change.
 */`, `/**
 * The tones this component offers: the two the MVP has actually needed — a
 * neutral prompt and a warning advisory.
 *
 * TONE NEVER CHANGES TEXT COLOUR (Gate 62b). Title and body take the same text
 * tokens in every tone. A tone is carried by the CONTAINER and a leading GLYPH:
 * the framed border and the icon take the tone's own \`--mapped-border-*\` /
 * \`--mapped-icon-*\` tokens. Gate 62 coloured the warning title with
 * \`--mapped-text-warning-default\` instead, which measured 2.22:1 in light — no
 * Figma design asked for orange text, and the review thread ruled it out.
 *
 * Adding a tone later widens the union, which is not a breaking change.
 */`)
rep(`export type InlineMessageTone = 'neutral' | 'warning'
`, `export type InlineMessageTone = 'neutral' | 'warning'

/* The leading glyph per tone. Neutral has none: it is the resting message and
   renders exactly as it did at Gate 62. \`warning\` is the registry glyph
   \`Toast\` already uses for its warning appearance. */
const TONE_ICON: Partial<Record<InlineMessageTone, IconName>> = {
  warning: 'warning',
}
`)
rep(`  /** Colours the title. Default \`'neutral'\`. */`, `  /** Sets the frame's border and the leading glyph — never the text colour.
   *  Default \`'neutral'\` (no glyph). */`)
rep(`  const titleId = \`\${id ?? autoId}-title\`
`, `  const titleId = \`\${id ?? autoId}-title\`
  const toneIcon = TONE_ICON[tone]
`)
rep(`    >
      <p id={titleId}`, `    >
      {/* Decorative: the glyph repeats what the title's words already say, so
          it is hidden from assistive tech (Icon marks its <svg> aria-hidden)
          and the group's name stays the title alone. Rendered in BOTH isFramed
          states — unframed, it is the only non-text tone signal there is. */}
      {toneIcon && (
        <span className="mn-inline-message__icon">
          <Icon name={toneIcon} size="m" />
        </span>
      )}
      <p id={titleId}`)
writeFileSync(p, s.replace(/\n/g, eol))
console.log('ok', eol === '\r\n' ? 'CRLF' : 'LF')
