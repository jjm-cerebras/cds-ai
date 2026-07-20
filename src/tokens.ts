import { CSSProperties } from 'react'

/**
 * Token bridge. Components hold no literal style values — they read token
 * references (e.g. `"{colors.neutral-95}"`, `"{typography.page-title}"`) from a
 * component `*.json` file and this helper resolves each reference to a CSS
 * custom property. The matching `--colors-*`, `--typography-*`, `--spacing-*`,
 * and `--motion-*` variables are emitted by the design system's global token
 * stylesheet (generated from tokens/primitive.json + tokens/semantic.json), so
 * a single central re-map flows through every consuming component.
 */

const isRef = (v: string) => /^\{.+\}$/.test(v)
const path = (ref: string) => ref.slice(1, -1) // strip { }

/** `"{colors.neutral-95}"` → `"var(--colors-neutral-95)"` */
export const token = (ref: string): string =>
  isRef(ref) ? `var(--${path(ref).replace(/\./g, '-')})` : ref

/**
 * Expand a composite typography reference into its CSS declarations.
 * `"{typography.page-title}"` →
 *   { fontFamily: var(--typography-page-title-fontFamily), fontSize: …, … }
 */
export const typography = (ref: string): CSSProperties => {
  const base = `--${path(ref).replace(/\./g, '-')}`
  return {
    fontFamily: `var(${base}-fontFamily)`,
    fontSize: `var(${base}-fontSize)`,
    fontWeight: `var(${base}-fontWeight)` as CSSProperties['fontWeight'],
    lineHeight: `var(${base}-lineHeight)`,
    letterSpacing: `var(${base}-letterSpacing)`,
    textTransform: `var(${base}-textTransform, none)` as CSSProperties['textTransform']
  }
}
