---
name: cds-drift-check
description: >-
  Check codebase for drift between its design tokens/docs/code and CDS (Cerebras
  Design System). Use this to ask whether the interface or tokens still match
  the design system, wants to verify token→CSS is in sync, is about to ship or
  merge a design/token change, is setting up a CI gate for design consistency,
  suspects hardcoded colors/spacing that should be tokens, or asks to "check for
  drift", "audit design tokens", "do the docs match the tokens", or "make sure
  this still matches CDS". Trigger it even when they don't say the word "drift"
  — any request to confirm a codebase conforms to CDS token values, resolves its
  token references, or keeps generated CSS current belongs here.
---

# CDS drift check

A design system stores the same fact in several editable places — the **token
JSON source** (DTCG format), the **generated CSS** built from it, the **prose
docs** that describe values, and the **app code** that consumes tokens. These
drift apart silently: someone hand-edits the generated CSS, a doc keeps an old
hex, a reference points at a token that was renamed, or a component hardcodes a
color. This skill makes that divergence **fail loudly** instead of being found
by luck.

## When to use it

Reach for this any time the question is "does this codebase still agree with
CDS?" — before merging a token/design change, wiring a CI gate, or auditing a
repo you inherited. It's read-only and safe to run anytime.

## How to run it

The work is done by a bundled, dependency-free Node script. Run it from the
target repo (or pass the repo path). Prefer this over hand-checking — it's
exhaustive, deterministic, and reusable in CI.

```bash
node <skill-dir>/scripts/check-drift.mjs [repoRoot]      # defaults to cwd
node <skill-dir>/scripts/check-drift.mjs . --strict      # also fail on hardcoded-value warnings
```

`<skill-dir>` is the directory this SKILL.md lives in. Exit code `0` = in sync,
`1` = drift found, `2` = couldn't locate a token source. That exit code is the
point — drop the command into CI or a pre-commit hook and drift stops merges.

After running, **read the output and explain it in plain terms**: what drifted,
which file/line, and the one-line fix. Then offer to apply the fix (regenerate
CSS, correct a doc value, repoint a reference, tokenize a hardcoded value).

## What it checks, and why

1. **Values in sync** — regenerates the token CSS using the repo's *own* build
   command and confirms it's byte-identical to what's committed. Catches
   hand-edited or stale generated CSS. (Uses the repo's build, so it doesn't
   care what naming convention the CSS uses.)
2. **References resolve** — every `{group.token}` reference in the token JSON
   must land on a real token in the merged tree. Catches renamed/removed tokens
   that leave dangling references (which render as nothing at runtime).
3. **Docs match tokens** — any hex/oklch a guideline doc inlines next to a token
   name must equal that token's real value, and the token must still exist.
   Catches the classic "doc says `brand-50` is `#F1592A` but the token is
   `#FF985C`" rot.
4. **Hardcoded values** — scans app source for raw hex/oklch that should be a
   token reference. Reported as **warnings** by default (heuristic); `--strict`
   makes them fail the run.

## Zero-config, with an escape hatch

Paths are auto-detected: DTCG token JSON (files containing `"$value"`), the
generated CSS (a `:root` sheet with a "generated" header), the build command (a
`package.json` script named `tokens` / `build-tokens`), docs (`DESIGN.md`,
`guidelines/`, `docs/`), and source (`src/`, `app/`, `components/`).

When a repo's layout differs, the script degrades gracefully — it skips a check
it can't wire up and says so in the `detected:` block rather than failing. To be
explicit, add `cds-drift.config.json` at the repo root:

```json
{
  "tokens": ["tokens/primitive.json", "tokens/semantic.json"],
  "generatedCss": ["src/tokens.css"],
  "buildCommand": "npm run tokens",
  "docs": ["DESIGN.md", "guidelines"],
  "src": ["src"],
  "ignore": ["node_modules", "dist"]
}
```

If the script reports it skipped the values check (no build command found) or
found no token source, tell the user what to set in the config — don't silently
report a clean pass that only ran half the checks.

## Interpreting and fixing findings

- `[values] … out of sync` → run the repo's token build (e.g. `npm run tokens`)
  and commit the result. Never hand-edit generated CSS.
- `[refs] … no such token` → the reference is stale. Either the token was
  removed (repoint the reference to the nearest existing token) or it should
  exist (add it to the source). This is a design decision — surface it, don't
  guess silently.
- `[docs] … token = X` → the doc is stale; update it to the token's real value,
  or, if the doc is right and the token is wrong, fix the token (a deliberate
  promotion, then regenerate).
- `[hardcoded] … raw value` → replace the literal with the matching token
  reference / `var(--…)`.

## Reporting

Lead with the verdict (PASS/FAIL and counts), then list findings grouped by
check, each with file:line and the fix. If everything passes, say so and note
which checks actually ran (so a skipped check isn't mistaken for a clean one).
