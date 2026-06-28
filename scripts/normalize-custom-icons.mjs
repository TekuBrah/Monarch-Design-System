/**
 * One-time script: normalize Assets/icons-custom/*.svg for currentColor rendering.
 *
 * What it does:
 *   1. Replaces fill="black" → fill="currentColor" on all path/shape elements.
 *   2. Renames files to a consistent lowercase_underscore.svg convention so
 *      they can be used as static ES module imports without encoding issues.
 *
 * Run once from project root:
 *   node scripts/normalize-custom-icons.mjs
 */

import { readdir, readFile, writeFile, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = join(__dirname, '..', 'Assets', 'icons-custom')

function normalizeFilename(name) {
  return name
    .replace(/\.svg$/i, '')
    .toLowerCase()
    .replace(/[\s\-]+/g, '_')   // spaces and hyphens → underscore
    .replace(/[^a-z0-9_]/g, '') // strip anything else
    .concat('.svg')
}

async function main() {
  const files = (await readdir(dir)).filter(f => /\.svg$/i.test(f))
  console.log(`Found ${files.length} SVG files in Assets/icons-custom/\n`)

  for (const file of files) {
    const oldPath = join(dir, file)
    const normalized = normalizeFilename(file)
    const newPath = join(dir, normalized)

    let content = await readFile(oldPath, 'utf8')

    // Normalize fills: replace any hardcoded black fills with currentColor.
    // fill="none" on the root <svg> is intentionally left untouched.
    const before = content
    content = content
      .replace(/fill="#000000"/gi, 'fill="currentColor"')
      .replace(/fill="#000"/gi, 'fill="currentColor"')
      .replace(/fill="black"/gi, 'fill="currentColor"')

    const fillsChanged = content !== before
    const renamed = normalized !== file

    // Write to normalized path first
    await writeFile(newPath, content, 'utf8')

    // Remove original only if it's a different path on disk.
    // On Windows the filesystem is case-insensitive, so a case-only rename
    // (e.g. Icon_bank.svg → icon_bank.svg) points to the SAME file — deleting
    // oldPath would delete the file we just wrote. Skip the unlink in that case.
    if (renamed && normalized.toLowerCase() !== file.toLowerCase()) {
      await unlink(oldPath)
    }

    const tag = [fillsChanged && 'fills', renamed && `→ ${normalized}`].filter(Boolean).join(', ')
    console.log(`  ${file}${tag ? `  [${tag}]` : '  [unchanged]'}`)
  }

  console.log('\nDone.')
}

main().catch(e => { console.error(e); process.exit(1) })
