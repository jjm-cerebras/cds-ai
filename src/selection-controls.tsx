import { CSSProperties, useId } from 'react'
import { av } from './alias'
import { token, typography } from './tokens'

/**
 * Checkbox — 16px. Checked state fills with `interactive-55` and shows a **white**
 * check glyph (the Radix-style variant). Custom-rendered (not a native
 * `accent-color` input) because that API can't control the checkmark color; the
 * visual state is driven by CSS `:checked` in components.css, so it works without
 * JS. The native input stays in the DOM for keyboard, focus, and toggling.
 */
export const Checkbox = ({
  label,
  defaultChecked,
  disabled
}: {
  label: string
  defaultChecked?: boolean
  disabled?: boolean
}) => {
  const id = useId()
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: token('{spacing.2}'), cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input id={id} type="checkbox" defaultChecked={defaultChecked} disabled={disabled} className="cds-checkbox-input" />
      <span className="cds-checkbox-box" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.2 4.8 8.6 9.5 3.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ ...typography('{typography.body}'), color: av('checkbox', 'labelColor') }}>{label}</span>
    </label>
  )
}

/**
 * RadioButton — 16px circle: `neutral-25` border unchecked, `interactive-55`
 * border + dot when selected. Custom-rendered (like Checkbox) so it honors the
 * border-state tokens and the `shadow-focus` glow — the one control the spec
 * reserves that glow for. CSS `:checked` drives the state (works without JS).
 */
export const RadioButton = ({
  label,
  name,
  defaultChecked,
  disabled
}: {
  label: string
  name: string
  defaultChecked?: boolean
  disabled?: boolean
}) => {
  const id = useId()
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: token('{spacing.2}'), cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input id={id} type="radio" name={name} defaultChecked={defaultChecked} disabled={disabled} className="cds-radio-input" />
      <span className="cds-radio-box" aria-hidden="true">
        <span className="cds-radio-dot" />
      </span>
      <span style={{ ...typography('{typography.body}'), color: token('{colors.foreground}') }}>{label}</span>
    </label>
  )
}

/**
 * Switch — 42×24 track; neutral-15 off → accent (orange) on. White thumb travels
 * 19px. role="switch" + aria-checked carry state; the thumb position is the
 * non-color cue.
 */
export const Switch = ({
  label,
  checked = false,
  disabled = false
}: {
  label?: string
  checked?: boolean
  disabled?: boolean
}) => {
  const track: CSSProperties = {
    position: 'relative',
    width: av('switch', 'width'),
    height: av('switch', 'height'),
    borderRadius: av('switch', 'rounded'),
    backgroundColor:
      disabled && checked
        ? av('switch', 'trackBackgroundDisabledChecked')
        : checked
          ? av('switch', 'trackBackgroundChecked')
          : av('switch', 'trackBackground'),
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    transitionProperty: 'background-color',
    transitionDuration: token('{motion.duration.normal}'),
    flex: 'none'
  }
  const thumb: CSSProperties = {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    borderRadius: token('{rounded.full}'),
    backgroundColor: av('switch', 'thumbColor'),
    transform: checked ? `translateX(${av('switch', 'thumbTravel')})` : 'translateX(0)',
    transitionProperty: 'transform',
    transitionDuration: token('{motion.duration.normal}')
  }
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: token('{spacing.2}') }}>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className="cds-focus" style={track}>
        <span style={thumb} />
      </button>
      {label && <span style={{ ...typography('{typography.body}'), color: token('{colors.foreground}') }}>{label}</span>}
    </label>
  )
}

/** SegmentedControl — selected item on a raised white highlight (soft shadow);
 *  no underline — the raised highlight is the selection cue. */
export const SegmentedControl = ({
  options = ['Day', 'Week', 'Month'],
  value = 'Day'
}: {
  options?: string[]
  value?: string
}) => (
  <div
    role="radiogroup"
    style={{
      display: 'inline-flex',
      gap: token('{spacing.1}'),
      padding: token('{spacing.1}'),
      backgroundColor: token('{colors.neutral-15}'),
      borderRadius: av('segmented-control', 'rounded')
    }}
  >
    {options.map((opt) => {
      const selected = opt === value
      return (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={selected}
          className="cds-focus"
          style={{
            ...typography('{typography.small-text}'),
            border: 'none',
            cursor: 'pointer',
            padding: `${token('{spacing.1}')} ${token('{spacing.3}')}`,
            borderRadius: av('segmented-control', 'rounded'),
            backgroundColor: selected ? av('segmented-control', 'highlightBackground') : 'transparent',
            color: selected ? av('segmented-control', 'selectedTextColor') : av('segmented-control', 'unselectedTextColor'),
            boxShadow: selected ? av('segmented-control', 'selectedShadow') : undefined
          }}
        >
          {opt}
        </button>
      )
    })}
  </div>
)
