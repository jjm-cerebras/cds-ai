---
version: 0.1.4
type: reference
title: generation workflow
timestamp: 2026-07-17T00:00:00Z
---

# Generation workflow

How an AI (or a person) produces Cerebras UI from two sources of truth. The model is **layered**: approved components are the truth at *generation* time; [`DESIGN.md`](DESIGN.md) is the truth at *spec, composition, and bootstrap* time. They operate at different moments, not in competition.

---

## The two layers

### Layer 1 — Components: generation-time truth

A component in the **approved reusable folder** is correct by admission. It already owns its spacing, states, colors, radius, and responsiveness. When you build with it:

- **MUST** use it as-is at its intended API. Membership in the approved folder *is* the correctness guarantee — do not re-verify, re-derive, or restyle it.
- **MUST NOT** rebuild from tokens what an approved component already covers. Re-deriving is how drift starts.

At generation time, for anything a component covers, `DESIGN.md` is **out of the loop**. Trust the folder.

### Layer 2 — DESIGN.md: spec / composition / bootstrap truth

The manifest is not a per-page input. It does three jobs a finished component cannot:

- **Spec** — the definition of "correct" that a component is *admitted against* (the gate) and *re-audited against* when the system changes. A component cannot verify itself; the approved folder is a **cache of a passed check**, and this is the rubric that check runs.
- **Composition** — the rules that live *between* components and cannot sit inside any one of them: arrangement and rhythm on the page, visual hierarchy, **one accent (primary action) per view**, status-color discipline, and the intent→component mapping (e.g. **delete → destructive**).
- **Bootstrap** — the generative rules for what has **no component yet**: the first version of a new pattern, and every net-new component, built correct *before* it can be componentized.

---

## When each layer is in the loop

| Moment                              | Layer          | Why                                                     |
| ----------------------------------- | -------------- | ------------------------------------------------------ |
| Use an approved component as-is     | Component      | Correct by admission; trust the folder                 |
| Arrange components on a page        | DESIGN.md      | Composition lives between parts, in no component        |
| Enforce one accent / hierarchy      | DESIGN.md      | A component can't see its siblings                      |
| Build a surface with no component   | DESIGN.md      | Nothing to reuse — generate from the manifest           |
| Admit a new component to the folder | DESIGN.md      | The rubric the gate checks against                      |
| Re-audit the folder after a change  | DESIGN.md      | Membership was true at approval time, not forever       |
| Copy (labels, errors, empty states) | *(human)*      | Handled by copywriters, out of this loop                |

---

## How to build a page

Composing a screen from existing parts. Components carry the parts; the manifest carries the wiring.

1. **List the surfaces the page needs** — header, table, form, chart, banners, empty/loading/error.
2. **Map each to an approved component.** For every match: use it as-is. Do not restyle. If you are naming variants in the prompt ("table variant A, primary button B"), you are invoking Layer 1 by name — correct, and the fastest path.
3. **For any surface with no component** → drop to Layer 2. Build it to the manifest (tokens + foundations + the closest component spec). Flag it as a bootstrap candidate (see below).
4. **Wire the page with DESIGN.md composition rules** — the part no component owns:
   - arrangement, spacing, and rhythm *between* components (the 4px `spacing` scale),
   - visual hierarchy,
   - **exactly one accent/primary action for the whole view** — if two approved primaries collide, the manifest decides which one demotes,
   - status-color discipline and the intent→component mapping (delete is destructive, etc.).
5. **Leave copy to the copywriters.** Ship placeholders that state intent; do not invent final copy.
6. **Check the result against the manifest, not against itself** — hierarchy, one-accent, a11y floor, responsive reflow at 480 / 768 / 1280. (This is what `design-qa` / `design-consistency` run.)

**Rule of thumb:** if a component covers it, the component is the truth. Everything the components
*don't* touch — the space between them and the rules across them — is DESIGN.md's job.

---

## How to build the next component

Creating a net-new reusable component. This is where the manifest is load-bearing and components are silent — there is nothing yet to reuse.

1. **Confirm it doesn't already exist.** Search the approved folder first. If a variant of an existing component covers it, extend that instead of authoring new.
2. **Author against the spec, not by eye.** Pull from the manifest:
   - tokens for every color / spacing / radius / shadow (no hardcoded values),
   - the relevant [`foundations/`](foundations/) rules,
   - the closest existing [`components/`](components/) spec for API and naming conventions.
3. **Build all required states and responsiveness in** — default, hover, focus, active, disabled, loading, empty, error — so the finished component becomes generation-time truth (Layer 1) and never needs the manifest at *use* time.
4. **Bake the invariants the component *can* own** — required `aria-label` on icon-only controls, `focus-visible` indicator, contrast-verified pairings. Enforce them in the API (required props) so they can't be omitted downstream. naming, state coverage. (`token-guardian` / `a11y` / `system-designer` cover this.)
6. **Admit it to the approved folder.** Membership records that the check passed. From here the component is correct-by-admission and drops into Layer 1.
7. **When the manifest changes, re-audit the folder against it.** A spec change (new accent, AAA contrast, new default radius) can make an approved component stale. The folder can't self-audit — run the spec over it and re-admit or fix.

**Rule of thumb:** a component is an *answer*; the manifest is the *question + rubric*. You need the rubric to write the next answer and to confirm an old one still passes — never to use one that already did.

---

## Two things that never live in a component

No matter how airtight a component is, these are properties of the *system* or the *composition*, so they stay in DESIGN.md permanently:

- **Invariants across components** — one accent per view, hierarchy, intent→component mapping. A component cannot see its siblings, so it cannot enforce a rule that spans them.
- **The definition of "correct"** — the rubric the gate admits against and the folder is re-audited against. An answer cannot grade itself; correctness needs an oracle outside the component, and for an AI-run system that oracle must be written, not in a designer's head.
