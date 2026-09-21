// Tree-manifest hash: every tracked + untracked-not-ignored file, excluding
// scratchpad/ (this gate's own logs), path + sha256 of raw bytes, sorted.
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { maxBuffer: 1 << 28 })
  .toString().split('\0').filter(f => f && !f.startsWith('scratchpad/') && existsSync(f)).sort()
const h = createHash('sha256')
for (const f of files) h.update(f + '\0' + createHash('sha256').update(readFileSync(f)).digest('hex') + '\n')
console.log(`${files.length} files  manifest ${h.digest('hex')}`)
