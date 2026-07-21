import aliasJson from '../tokens/alias.json'
import { token } from './tokens'

/**
 * Component-alias accessor. tokens/alias.json holds the per-component recipe
 * (each leaf is `{ "$value": "{group.token}" }`). `av()` resolves one leaf to a
 * CSS custom property; `araw()` returns the raw `$value` string for the handful
 * of descriptive values (focus outlines, rings) that aren't a single clean ref
 * and are rebuilt by hand in the component.
 */
export const alias = aliasJson as Record<
  string,
  Record<string, { $value: string | number }>
>

export const av = (group: string, key: string): string =>
  token(String(alias[group][key].$value))

export const araw = (group: string, key: string): string =>
  String(alias[group][key].$value)
