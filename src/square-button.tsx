import { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'
import { av } from './alias'
import { token } from './tokens'

/**
 * SquareButton — square single-purpose control for toolbars and row actions.
 * Carries the button variant model (secondary is the neutral default here) plus
 * a `selected` state, and the brand-orange focus outline. Icon-only, so `label`
 * (→ aria-label) is required.
 */
export const SquareButton = ({
  icon,
  label,
  selected = false,
  disabled = false,
  ...rest
}: {
  icon: ReactNode
  label: string
  selected?: boolean
  disabled?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: av('square-button', 'width'),
    height: av('square-button', 'height'),
    borderRadius: av('square-button', 'rounded'),
    border: `1px solid ${av('square-button', 'borderColor')}`,
    // Resting background comes from .cds-square-btn so the CSS :hover can win;
    // selected overrides it inline (a selected control shouldn't hover-wash).
    backgroundColor: selected ? av('square-button', 'selectedBackground') : undefined,
    color: av('square-button', 'textColor'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: token('{motion.duration.fast}')
  }
  return (
    <button type="button" className="cds-focus cds-square-btn" aria-label={label} aria-pressed={selected} disabled={disabled} style={style} {...rest}>
      {icon}
    </button>
  )
}

/**
 * IconButton — the lowest-emphasis icon control: neutral-60 glyph, neutral-10
 * hover wash, no border. `label` (→ aria-label) is required.
 */
export const IconButton = ({
  icon,
  label,
  ...rest
}: {
  icon: ReactNode
  label: string
} & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className="cds-focus cds-icon-btn"
    aria-label={label}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: av('icon-button', 'width'),
      height: av('icon-button', 'height'),
      borderRadius: av('icon-button', 'rounded'),
      border: 'none',
      // Resting background + color live in .cds-icon-btn so the CSS :hover
      // (neutral-10 wash + foreground glyph) isn't overridden by inline styles.
      cursor: 'pointer',
      transitionProperty: 'background-color, color',
      transitionDuration: token('{motion.duration.fast}')
    }}
    {...rest}
  >
    {icon}
  </button>
)
