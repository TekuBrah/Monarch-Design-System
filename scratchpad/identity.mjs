// Byte identity of every token source + generated file against v2.3.0's blob.
// Reports raw-byte identity and, where raw differs, whether the only
// difference is CRLF smudging of the working copy (core.autocrlf=true).
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const ref = process.argv[2] || 'v2.3.0'
const git = (...a) => execFileSync('git', a, { maxBuffer: 1 << 28 })
const files = git('ls-tree', '-r', '--name-only', ref, '--',
  'design-tokens', 'src/tokens', 'src/styles/globals.css', 'src/styles/typography.css')
  .toString().trim().split('\n')

let raw = 0, eolOnly = 0, content = 0
for (const f of files) {
  const blob = git('show', `${ref}:${f}`)
  const disk = readFileSync(f)
  if (blob.equals(disk)) { raw++; continue }
  const strip = b => Buffer.from(b.toString('binary').replace(/\r\n/g, '\n'), 'binary')
  if (strip(blob).equals(strip(disk))) { eolOnly++; console.log(`EOL-ONLY ${f} (blob CR=${blob.includes(13)}, disk CR=${disk.includes(13)})`) }
  else { content++; console.log(`CONTENT DIFFERS ${f}`) }
}
console.log(`${files.length} files vs ${ref}: ${raw} raw-byte identical, ${eolOnly} differ only by CRLF smudge, ${content} differ in content`)
process.exit(content ? 1 : 0)
