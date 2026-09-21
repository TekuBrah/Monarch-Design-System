import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const TEST = 'src/components/InlineMessage/InlineMessage.test.tsx'
const TSX = 'src/components/InlineMessage/InlineMessage.tsx'
const CSS = 'src/components/InlineMessage/InlineMessage.css'
const VITEST = 'node_modules/vitest/vitest.mjs'
const sha = b => createHash('sha256').update(b).digest('hex')
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const PROOFS = [
  { name: 'P1 warning title recoloured', file: CSS,
    find: '.mn-inline-message__title {\n  color: var(--mapped-text-default-default);\n}\n',
    replace: '.mn-inline-message__title {\n  color: var(--mapped-text-default-default);\n}\n.mn-inline-message--warning .mn-inline-message__title {\n  color: var(--mapped-text-warning-default);\n}\n',
    title: 'binds the warning title and body to the same text colour as neutral, framed and unframed' },
  { name: 'P2 warning body recoloured (framed only)', file: CSS,
    find: '.mn-inline-message__actions {',
    replace: '.mn-inline-message--warning.mn-inline-message--framed .mn-inline-message__body {\n  color: var(--mapped-text-warning-default);\n}\n\n.mn-inline-message__actions {',
    title: 'binds the warning title and body to the same text colour as neutral, framed and unframed' },
  { name: 'P3 warning border reverted to subtlest', file: CSS,
    find: '  border-color: var(--mapped-border-warning-default);',
    replace: '  border-color: var(--mapped-border-subtlest-default);',
    title: 'frames the warning tone with the warning border token, and neutral with its own' },
  { name: 'P4 glyph removed (isFramed true)', file: TSX,
    find: "  warning: 'warning',\n}", replace: '}',
    title: 'renders the leading warning glyph at size m when isFramed is true' },
  { name: 'P5 glyph removed (isFramed false)', file: TSX,
    find: "  warning: 'warning',\n}", replace: '}',
    title: 'renders the leading warning glyph at size m when isFramed is false' },
  { name: 'P6 wrong glyph (error) (isFramed false)', file: TSX,
    find: "  warning: 'warning',\n}", replace: "  warning: 'error',\n}",
    title: 'renders the leading warning glyph at size m when isFramed is false' },
  { name: 'P7 wrong glyph size l (isFramed true)', file: TSX,
    find: '<Icon name={toneIcon} size="m" />', replace: '<Icon name={toneIcon} size="l" />',
    title: 'renders the leading warning glyph at size m when isFramed is true' },
  { name: 'P8 neutral gains a glyph', file: TSX,
    find: "  warning: 'warning',\n}", replace: "  neutral: 'info',\n  warning: 'warning',\n}",
    title: 'renders no tone glyph in the neutral tone' },
  // Gate 62's three InlineMessage proofs, re-run because InlineMessage.tsx changed.
  { name: 'G62-focus: title grabs focus on mount', file: TSX,
    find: '<p id={titleId} className', replace: '<p tabIndex={-1} ref={el => el?.focus()} id={titleId} className',
    title: 'does not move focus when it renders' },
  { name: 'G62-dialog: aria-hidden outside the glyph (actions)', file: TSX,
    find: '<div className="mn-inline-message__actions">', replace: '<div aria-hidden="true" className="mn-inline-message__actions">',
    title: 'carries no dialog semantics and hides nothing around it' },
  { name: 'G62-dialog: role=dialog', file: TSX,
    find: '      role="group"\n', replace: '      role="dialog"\n',
    title: 'carries no dialog semantics and hides nothing around it' },
  { name: 'G62-siblings: swallow clicks outside the message', file: TSX,
    find: "import React, { useId } from 'react'",
    replace: "import React, { useId, useEffect } from 'react'\nconst __swallow = (e: Event) => { if (!(e.target as Element).closest('.mn-inline-message')) e.stopPropagation() }",
    find2: '  const toneIcon = TONE_ICON[tone]\n',
    replace2: "  const toneIcon = TONE_ICON[tone]\n  useEffect(() => { window.addEventListener('click', __swallow, true); return () => window.removeEventListener('click', __swallow, true) }, [])\n",
    title: 'leaves the surrounding controls operable' },
]

function run(title) {
  // Argument array, no shell: the title reaches vitest as ONE argv entry.
  const r = spawnSync(process.execPath, [VITEST, 'run', TEST, '-t', esc(title)], { encoding: 'utf8' })
  const out = (r.stdout + r.stderr).replace(/\x1b\[[0-9;]*m/g, '')
  const line = (out.match(/^\s*Tests\s+.*$/m) || ['<no count line>'])[0].trim()
  const fail = (out.match(/AssertionError[^\n]*|Error: [^\n]*/) || [''])[0].slice(0, 180)
  return { code: r.status, line, fail }
}

const only = process.argv[2]
const results = []
for (const p of PROOFS) {
  if (only && !p.name.startsWith(only)) continue
  const raw = readFileSync(p.file)
  const before = sha(raw)
  const text = raw.toString('utf8')
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  let lf = text.replace(/\r\n/g, '\n')
  for (const [f, r] of [[p.find, p.replace], [p.find2, p.replace2]]) {
    if (f === undefined) continue
    if (lf.split(f).length !== 2) { console.error(`${p.name}: find not unique/absent`); process.exit(2) }
    lf = lf.replace(f, () => r)
  }
  writeFileSync(p.file, lf.replace(/\n/g, eol))
  let mutated
  try { mutated = run(p.title) } finally { writeFileSync(p.file, raw) }
  const after = sha(readFileSync(p.file))
  const restored = run(p.title)
  const row = { proof: p.name, mutated: `exit ${mutated.code} | ${mutated.line}`, why: mutated.fail,
    hashIdentical: before === after, restored: `exit ${restored.code} | ${restored.line}` }
  results.push(row)
  console.log(JSON.stringify(row))
}
const ok = results.every(r => /^exit 1 \| Tests\s+1 failed \| \d+ skipped/.test(r.mutated) && r.hashIdentical && /^exit 0 \| Tests\s+1 passed \| \d+ skipped/.test(r.restored))
console.log(ok ? `ALL ${results.length} PROOFS VALID` : 'SOME PROOF INVALID')
