# Cerebras DESIGN.md

A portable, token-first manifest for producing anything that should look like it belongs in the Cerebras Cloud platform — product UI, dashboards, tables, forms, onboarding, or docs surfaces.

Everything needed to build UI is split across this manifest: **tokens** (every color, type recipe, spacing step, radius, shadow, and motion token, in [`tokens/`](tokens/)), **foundations** (how those tokens combine) and **components** (behavioural rules per component) — both in [`guidelines/`](guidelines/). Rules use RFC 2119: MUST, MUST NOT, SHOULD, MAY.

Colors are authored in **OKLCH** and compiled to hex; where a token has no OKLCH twin the hex is canonical. Refer to tokens by their key in prose (`accent`, `surface`, `text-primary`); emit the
resolved value in HTML/CSS. This file is extracted from the shipped Cerebras Cloud platform (`@cerebras/common` Tailwind preset + app `globals.css` + the shared component library), not a hand-authored spec — it documents what the product actually renders.

### Structure

**Tokens** — authored in **[W3C Design Tokens (DTCG)](https://tr.designtokens.org/format/) format** (`$value` / `$type`, `{group.token}` references) so they are tool agnostic and can be imported into external tools as variables.

**This exploration doesn't ship token build script, so keep `tokens.css` in sync with the JSON by hand** (edit both together).

---

## Overview

### Brand & Style

Cerebras design system expresses technical excellence through clarity, precision, and confidence. It balances the performance of frontier AI infrastructure with an interface that feels approachable, calm, and intuitive. The brand personality is intelligent, trustworthy, and forward-looking.

The visual language is Modern Technical—clean, structured, and intentionally minimal. The UI is warm-neutral dominant with a single, restrained orange accent, built on a 4px spacing grid, 2px default corner radius, and subtle elevation through warmth and soft shadows rather than heavy depth. The canvas uses a warm off-white (surface), with pure white cards layered above it to create gentle separation. Generous whitespace, disciplined typography, and restrained color reduce cognitive load and keep attention on complex workflows. Orange is reserved for the primary action, while semantic colors (green, red, blue, gray, and silica) communicate state only when meaningful. Manrope is used for headings and body copy, and Sometype Mono for call-to-actions, copyable values, code, and tabular data. The result is an interface that feels fast, reliable, and purpose-built for developers and product teams.

#### Atmosphere rules

- Default to the warm neutral canvas for the area that is not communicating meaning
- Reserve saturated color for one of: the brand accent (one primary action per view), semantic status (negative, positive, warning, info), or data visualization
- Compose layout on the 4px grid via the `spacing` scale
- Prefer hairlines (`divider`) and whitespace for grouping before reaching for shadow
- Let the canvas stay quiet so the orange accent and status color carry real signal

#### Restraint — one accent, held back

Orange (`accent`) is the only brand color. It appears on the single primary action, focus, and active/selected state — nowhere else. Its warmth and saturation grab attention fast, so it is spent sparingly. Red (`negative` / `cds-danger`) is held at a distinct, truer-red hue so "danger" never reads as "brand" — this separation is *why* orange can stay out of alarm territory.

#### Reference points

- **Aligned with:** Radix Colors (ramp scale discipline)

---

## Do's and Don'ts

Each line is a drift pattern to correct on sight. Tokens are referenced by key; values resolve from the tokens JSON.

| Do                                                                        | Don't                                                                              |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Value anchored to a token (`surface` → `oklch(97.1% 0.005 78.3)`)         | Arbitrary one-off hex with no token mapping                                        |
| Warm `surface` page canvas, white cards on top                            | A darkened/gray page background to make white cards "pop"                          |
| Elevation via white-on-warm + soft `shadow`                               | Hand-authored heavy `box-shadow`, glass, or blur                                   |
| Exactly one orange (`accent`) primary action per view                     | Two orange buttons competing in one section                                        |
| Padding / gap on the 4px `spacing` scale                                  | `padding: 13px` or any off-grid value                                              |
| `rounded-sm` (2px) as the default corner                                  | `border-radius: 10px` not aligned to a token                                       |
| Button labels in UPPERCASE Sometype Mono                                  | Sentence-case Manrope button labels (that's the drift, not the caps)               |
| Sentence case for titles, labels, menus, body                             | Title Case; ALL-CAPS eyebrows on headings or tags                                  |
| Destructive red via `negative-*`; validation red via `cds-danger`         | `negative` for field errors, or orange for a danger state                          |
| Status as a tinted surface + a clear text label (icon optional) + neutral text | Tinting body copy the status color; a status box with neither a label nor an icon |
| Body copy in `body` (14px) / `foreground`                                 | Body copy below 13px, or in `foreground-muted` "to differ from headings"           |
| 2px brand-orange focus indicator on every control                         | `outline: none` with no replacement                                                |
| lucide-react icon at 16px, `currentColor`                                 | Unicode / emoji / HTML-entity glyphs (`›` `→` `✓` `✕` `…` `⚠`) as icons            |
| Accessible name on every icon-only control                                | Bare IconButton with no `aria-label`                                               |
| `prefers-reduced-motion` respected (rise collapses to 0)                  | Auto-playing glow / gradient loops on dense product surfaces                       |
| `tier-*` (ranked) or status solids for charts, + non-color cues           | Neon/gradient decorative palettes not mapped to tokens                             |
| Imperative CTA ("Delete cluster")                                         | "Submit", "OK", "Click here"                                                       |
| Error: reason + fix                                                       | "Oops, something went wrong. Please try again."                                    |

---

## Voice and tone

Cerebras product voice is **precise, plain, and confident** — say what happened and what to do next.

- **MUST** use active voice and imperative verbs on actions ("Create key", "Delete cluster"), never "Submit", "OK", or "Click here".
- **MUST** structure errors as **reason + fix**, not "Something went wrong."
- **MUST** use descriptive link text ("View billing history"), never "Learn more".
- **MUST** keep sentence case throughout (see [Typography](guidelines/foundation.md#typography)).
- **SHOULD** keep sentences short and prefer plain words; define a technical term on first use.
- **MUST NOT** be playful in moments of friction (errors, destructive confirmations, billing).

---

## Accessibility

WCAG 2.2 AA is the floor.

- **MUST** clear **4.5:1** contrast for text. The primary-action foreground pairing is verified at **≥13px / ≥600 weight** against `accent` for every state — preserve that when restyling.
- **MUST** show a visible 2px brand-orange focus indicator (see [Shapes](guidelines/foundation.md#shapes)) on every focusable element; `focus-visible` is required. Never ship `outline: none` without replacing it.
- **MUST NOT** rely on color alone — pair status color with an icon or label.
- **MUST** give every icon-only control an accessible name; hide decorative icons.
- **MUST** keep body text ≥13px, support 200% zoom, and remain usable with all motion off.
- **MUST** keep every interaction keyboard-reachable; `Esc` dismisses overlays; tab order follows visual order.

---

## Responsive behaviour

- **MUST** size type in `rem` and spacing in `spacing` steps — never fix layout in raw `px`.
- **MUST** reflow as the viewport narrows; **MUST NOT** hide critical actions on small screens. Collapse the sidenav, stack columns, and let tables scroll horizontally rather than truncate.
- **SHOULD** test at 480px, 768px, and 1280px reference widths (the app defines a `max-width: 480px` small-screen breakpoint).

---
