/* Registration detector — Gate 34.
 *
 * WHAT IT CATCHES
 *   A component ships a `.css` file that is NOT reachable from
 *   `src/styles/package.css`. That file is the single root of the lib build's
 *   CSS graph (src/index.ts line 1 imports it, vite.config.lib.ts follows the
 *   @imports into dist/index.css). A component missing from that graph
 *   compiles, tests green, and looks correct in the showcase — because its own
 *   .tsx imports its own CSS — and then ships to the consumer with no styles
 *   and no error anywhere. `Badge` sat in that state for four releases
 *   (v1.6.0 CHANGELOG, "Item 3 · Badge had no CSS file"), reproducing
 *   ElementWrapper's original failure mode. Registration parity has been
 *   re-derived BY HAND at every release since. This script replaces the hand
 *   derivation.
 *
 * HOW IT WORKS
 *   - The component list is derived from the filesystem, never from an array
 *     in this file. A detector you have to remember to update is the same
 *     failure class it guards against.
 *   - Reachability is computed by RESOLVING the @import graph transitively
 *     from package.css, not by pattern-matching that file's text. An @import
 *     of an index that imports the component still counts as reachable.
 *
 * WHAT IT DOES NOT CATCH
 *   - A component with no `.css` file at all — styled through inline style={{}}
 *     objects, which is invisible to every CSS audit in this repo. Reported as
 *     a NOTE, never a failure, because `Icon` legitimately has none (it
 *     delegates all styling to ElementWrapper). Read the notes.
 *   - A component whose own `.tsx` does not import its CSS. That breaks the
 *     showcase, not the package; this script only proves package reachability.
 *   - Missing registration in `src/index.ts` (the package barrel). That one
 *     fails `tsc -b` already.
 *   - Rules that are reachable but dead, duplicated, or overridden.
 *   - Anything about `dist/`. This reads source only, so it proves the graph
 *     Vite is asked to follow, not the bytes it emitted. `npm run build:lib`
 *     remains the gate on the artefact.
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, relative, sep } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const ENTRY = resolve(root, 'src/styles/package.css')
const COMPONENTS = resolve(root, 'src/components')

const rel = p => relative(root, p).split(sep).join('/')

// ── The component CSS files that exist on disk ────────────────────────────────

const onDisk = []
const noCss = []

for (const entry of readdirSync(COMPONENTS, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const dir = resolve(COMPONENTS, entry.name)
  const css = readdirSync(dir).filter(f => f.endsWith('.css'))
  if (css.length === 0) noCss.push(entry.name)
  for (const f of css) onDisk.push(resolve(dir, f))
}

onDisk.sort()

// ── The CSS files reachable from package.css, by resolving the @import graph ──

const IMPORT = /@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g

const reachable = new Set()
const brokenImports = []
const queue = [ENTRY]

while (queue.length) {
  const file = queue.shift()
  if (reachable.has(file)) continue // also breaks @import cycles
  reachable.add(file)

  if (!existsSync(file)) continue
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

  for (const m of text.matchAll(IMPORT)) {
    const spec = m[1]
    if (/^[a-z]+:\/\//i.test(spec)) continue // remote @import — not our graph
    const target = resolve(dirname(file), spec)
    if (!existsSync(target)) {
      brokenImports.push({ from: rel(file), spec })
      continue
    }
    queue.push(target)
  }
}

// ── Findings ─────────────────────────────────────────────────────────────────

const unregistered = onDisk.filter(f => !reachable.has(f))

let failed = false

if (unregistered.length) {
  failed = true
  console.error(`ERROR: ${unregistered.length} component CSS file(s) not reachable from ${rel(ENTRY)}:`)
  for (const f of unregistered) console.error(`  ${rel(f)}`)
  console.error('')
  console.error('  These compile, test green and render in the showcase, then ship with no')
  console.error(`  styles. Add an @import for each to ${rel(ENTRY)}.`)
}

if (brokenImports.length) {
  failed = true
  console.error(`ERROR: ${brokenImports.length} @import target(s) do not exist on disk:`)
  for (const b of brokenImports) console.error(`  ${b.from} -> '${b.spec}'`)
}

if (failed) process.exit(1)

// ── Success ──────────────────────────────────────────────────────────────────

console.log(`✓ ${onDisk.length}/${onDisk.length} component CSS files reachable from ${rel(ENTRY)}`)
console.log(`  ${reachable.size} file(s) in the @import graph, ${readdirSync(COMPONENTS).length} component folders scanned`)

if (noCss.length) {
  console.log('')
  console.log(`NOTE: ${noCss.length} component folder(s) carry no .css file: ${noCss.join(', ')}`)
  console.log('  Not a failure — Icon delegates all styling to ElementWrapper. But a')
  console.log('  component styled through inline style={{}} objects is invisible to every')
  console.log('  CSS audit in this repo; that is how Badge carried three defects for four')
  console.log('  releases (v1.6.0 CHANGELOG, Item 3). Check each name above is deliberate.')
}
