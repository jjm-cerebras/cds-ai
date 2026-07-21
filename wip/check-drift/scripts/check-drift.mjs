#!/usr/bin/env node
/**
 * check-drift — detect design-system drift against the Cerebras Design
 * System (CDS) in any codebase that consumes it. No external dependencies.
 *
 * Run:  node check-drift.mjs [repoRoot]     (defaults to cwd)
 * Exit 0 = in sync, exit 1 = drift found. Safe for CI.
 *
 * Why this exists: a design system has several editable representations of the
 * same fact (token JSON source → generated CSS → prose docs → app code). They
 * drift silently. This makes divergence fail loudly instead of being found by
 * luck. Four checks:
 *   1. VALUES IN SYNC   — the generated token CSS is byte-identical to a fresh
 *                         build from the token source (catches hand-edited or
 *                         stale generated CSS). Uses the repo's OWN build so it
 *                         is agnostic to naming conventions.
 *   2. REFS RESOLVE     — every {group.token} reference in the token JSON lands
 *                         on a real token in the merged tree.
 *   3. DOCS MATCH       — any hex/oklch a doc inlines next to a token name
 *                         matches that token's value, and the token still exists.
 *   4. HARDCODED VALUES — app source using raw hex/oklch that should be a token
 *                         (reported as warnings by default; --strict makes them
 *                         fail the run).
 *
 * Zero-config: paths are auto-detected. Override any of them with a
 * `cds-drift.config.json` at the repo root:
 *   {
 *     "tokens": ["tokens/primitive.json", "tokens/semantic.json"],
 *     "generatedCss": ["src/tokens.css"],
 *     "buildCommand": "npm run tokens",
 *     "docs": ["DESIGN.md", "guidelines"],
 *     "src": ["src"],
 *     "ignore": ["node_modules", "dist"]
 *   }
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execSync } from 'node:child_process'

const REPO = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || process.cwd()
const STRICT = process.argv.includes('--strict')
const cfg = readJSON(join(REPO, 'cds-drift.config.json')) || {}

const problems = [] // hard failures → exit 1
const warnings = [] // soft findings → reported, don't fail unless --strict
const notes = [] // informational (skipped checks, detection results)
const fail = (check, msg) => problems.push(`  [${check}] ${msg}`)
const warn = (check, msg) => warnings.push(`  [${check}] ${msg}`)

// ---------- helpers ----------
function readJSON(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null }
}
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isToken = (v) => isObj(v) && '$value' in v
function deepMerge(a, b) {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    out[k] = isObj(v) && isObj(out[k]) && !isToken(v) && !isToken(out[k]) ? deepMerge(out[k], v) : v
  }
  return out
}
function walkFiles(dir, exts, ignore, acc = []) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return acc }
  for (const e of entries) {
    const p = join(dir, e.name)
    if (ignore.some((ig) => p.includes(ig))) continue
    if (e.isDirectory()) walkFiles(p, exts, ignore, acc)
    else if (exts.some((x) => e.name.endsWith(x))) acc.push(p)
  }
  return acc
}
const rel = (p) => relative(REPO, p) || p

// ---------- locate the token JSON source (DTCG) ----------
const IGNORE = ['node_modules', '.git', 'dist', 'build', ...(cfg.ignore || [])]
function findTokenJson() {
  if (cfg.tokens) return cfg.tokens.map((p) => join(REPO, p)).filter(existsSync)
  const dirs = ['tokens', 'src/tokens', 'design-tokens', 'styles/tokens', '.']
  for (const d of dirs) {
    const abs = join(REPO, d)
    if (!existsSync(abs) || !statSync(abs).isDirectory()) continue
    const hits = readdirSync(abs)
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(abs, f))
      .filter((p) => (readFileSync(p, 'utf8')).includes('"$value"'))
    if (hits.length) return hits
  }
  return []
}
const tokenFiles = findTokenJson()
if (!tokenFiles.length) {
  console.error('check-drift: no DTCG token JSON found (looked for files containing "$value").')
  console.error('Point at them with cds-drift.config.json { "tokens": [...] }.')
  process.exit(2)
}
notes.push(`token source: ${tokenFiles.map(rel).join(', ')}`)

// merged token tree
let tree = {}
for (const f of tokenFiles) tree = deepMerge(tree, readJSON(f))

// resolve a dotted ref to its token node (a trailing segment may index a composite $value)
function lookup(dotted) {
  let node = tree
  const segs = dotted.split('.')
  for (let i = 0; i < segs.length; i++) {
    if (node == null || typeof node !== 'object') return undefined
    if ('$value' in node) {
      const v = node.$value
      return isObj(v) && i === segs.length - 1 && segs[i] in v ? { $value: v[segs[i]] } : undefined
    }
    node = node[segs[i]]
  }
  return node
}
const refResolves = (ref) => lookup(ref) != null
// follow ref chains to a literal value (for docs comparison)
function literal(dotted, seen = new Set()) {
  if (seen.has(dotted)) return undefined
  seen.add(dotted)
  const node = lookup(dotted)
  if (!node || !('$value' in node)) return node === undefined ? null : undefined
  const v = node.$value
  const m = typeof v === 'string' && v.match(/^\{([^}]+)\}$/)
  if (m) return literal(m[1], seen)
  return typeof v === 'string' ? v : undefined
}

// ---------- Check 2: every reference resolves ----------
function collectRefs(node, acc) {
  if (typeof node === 'string') for (const m of node.matchAll(/\{([^}]+)\}/g)) acc.push(m[1])
  else if (node && typeof node === 'object') for (const v of Object.values(node)) collectRefs(v, acc)
}
for (const f of tokenFiles.concat(
  // component token files that also reference the core tokens
  walkFiles(join(REPO, 'tokens'), ['.json'], IGNORE).filter((p) => !tokenFiles.includes(p))
)) {
  const refs = []
  collectRefs(readJSON(f), refs)
  for (const ref of [...new Set(refs)]) {
    if (!refResolves(ref)) fail('refs', `${rel(f)} references {${ref}} — no such token`)
  }
}

// ---------- Check 1: generated CSS in sync ----------
function findBuildCommand() {
  if (cfg.buildCommand) return cfg.buildCommand
  const pkg = readJSON(join(REPO, 'package.json'))
  if (!pkg || !pkg.scripts) return null
  const key = Object.keys(pkg.scripts).find((k) => /^(tokens|build[:-]tokens|tokens[:-]build)$/.test(k))
  return key ? `npm run ${key}` : null
}
function findGeneratedCss() {
  if (cfg.generatedCss) return cfg.generatedCss.map((p) => join(REPO, p)).filter(existsSync)
  return walkFiles(REPO, ['.css'], IGNORE).filter((p) => {
    const head = readFileSync(p, 'utf8').slice(0, 300).toLowerCase()
    return head.includes('generated') && head.includes(':root')
  })
}
const buildCmd = findBuildCommand()
const genCss = findGeneratedCss()
if (!buildCmd) {
  notes.push('values-in-sync: SKIPPED (no token build command detected; set config.buildCommand)')
} else if (!genCss.length) {
  notes.push('values-in-sync: SKIPPED (no generated CSS detected; set config.generatedCss)')
} else {
  notes.push(`build: \`${buildCmd}\` → ${genCss.map(rel).join(', ')}`)
  const before = genCss.map((p) => [p, readFileSync(p, 'utf8')])
  try {
    execSync(buildCmd, { cwd: REPO, stdio: 'ignore' })
    for (const [p, prev] of before) {
      if (readFileSync(p, 'utf8') !== prev) {
        fail('values', `${rel(p)} is out of sync with the token source — regenerate it (\`${buildCmd}\`)`)
      }
    }
  } catch (e) {
    warn('values', `could not run build (\`${buildCmd}\`): ${String(e.message).split('\n')[0]}`)
  } finally {
    for (const [p, prev] of before) writeFileSync(p, prev) // restore exactly
  }
}

// ---------- Check 3: docs inline values that match the tokens ----------
// leaf name → resolved literal, for color-ish groups (color/colors), so a doc
// that writes `brand-50 (#FF985C)` can be verified.
const colorGroupKey = Object.keys(tree).find((k) => /^colou?rs?$/i.test(k))
const NAME_RE = /\b([a-z]+(?:-[a-z]+)*-[0-9]+|accent(?:-hover)?(?:-subtle)?|foreground(?:-muted)?|surface|divider)\b/g
const VALUE_RE = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)/
const norm = (s) => s.toLowerCase().replace(/\s+/g, '')
function docFiles() {
  const set = new Set()
  const targets = cfg.docs || ['DESIGN.md', 'guidelines', 'docs', 'README.md']
  for (const t of targets) {
    const abs = join(REPO, t)
    if (!existsSync(abs)) continue
    if (statSync(abs).isDirectory()) walkFiles(abs, ['.md'], IGNORE).forEach((p) => set.add(p))
    else set.add(abs)
  }
  return [...set]
}
if (colorGroupKey) {
  const lineAt = (text, idx) => text.slice(0, idx).split('\n').length
  for (const f of docFiles()) {
    const text = readFileSync(f, 'utf8')
    // Scan the whole text (not per line) so a name and its value still match
    // when the doc wraps them onto separate lines. A blank line between them is
    // a paragraph break — too far to be "this token equals this value".
    for (const m of text.matchAll(NAME_RE)) {
      const name = m[1]
      const after = text.slice(m.index + name.length, m.index + name.length + 40)
      const vm = after.match(VALUE_RE)
      if (!vm || /\n\s*\n/.test(after.slice(0, vm.index))) continue
      const lit = literal(`${colorGroupKey}.${name}`)
      const ln = lineAt(text, m.index)
      if (lit === null) fail('docs', `${rel(f)}:${ln} cites \`${name}\` (${vm[0]}) — no such token`)
      else if (lit && norm(lit) !== norm(vm[0]))
        fail('docs', `${rel(f)}:${ln} says \`${name}\` = ${vm[0]} but token = ${lit}`)
    }
  }
}

// ---------- Check 4: hardcoded values in app source ----------
const srcDirs = (cfg.src || ['src', 'app', 'components']).map((d) => join(REPO, d)).filter(existsSync)
const genSet = new Set(genCss.map((p) => p))
const HARD_RE = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)/g
for (const d of srcDirs) {
  for (const p of walkFiles(d, ['.css', '.scss', '.ts', '.tsx', '.js', '.jsx', '.html'], IGNORE)) {
    if (genSet.has(p)) continue // skip generated CSS
    readFileSync(p, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('var(--')) return // already tokenized on this line
        for (const m of line.matchAll(HARD_RE)) {
          // ignore obvious non-token contexts (urls, comments-only lines are still worth flagging lightly)
          warn('hardcoded', `${rel(p)}:${i + 1} raw value ${m[0]} — should reference a token`)
        }
      })
  }
}

// ---------- Report ----------
if (notes.length) console.log('detected:\n' + notes.map((n) => '  · ' + n).join('\n') + '\n')
if (warnings.length) {
  const shown = warnings.slice(0, 40)
  console.log(`warnings (${warnings.length}):`)
  console.log(shown.join('\n'))
  if (warnings.length > shown.length) console.log(`  … and ${warnings.length - shown.length} more`)
  console.log('')
}
const hardFail = problems.length > 0 || (STRICT && warnings.length > 0)
if (!hardFail) {
  console.log(`check-drift: PASS — no drift${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`)
  process.exit(0)
} else {
  if (problems.length) {
    console.error(`check-drift: FAIL — ${problems.length} drift issue(s):`)
    console.error(problems.join('\n'))
  }
  if (STRICT && warnings.length) console.error(`(--strict) ${warnings.length} warning(s) treated as failures.`)
  process.exit(1)
}
