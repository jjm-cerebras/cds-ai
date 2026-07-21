import { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'
import { alias, av } from './alias'
import { token, typography } from './tokens'
import { Spinner } from './feedback'

type Variant = 'primary' | 'secondary' | 'negative' | 'secondary-negative'

/**
 * Button — the primary inline action. Variants are booleans (per CDS naming):
 * primary is the default (no `secondary`); `secondary`, `negative`, and
 * `secondary-negative` (secondary + negative) are the alternates. `small` drops
 * the height. Label is Sometype Mono, UPPERCASE (typography.button).
 *
 * No styling literals live here — every value reads from tokens/alias.json;
 * hover/focus/disabled states are in components.css.
 */
export const Button = ({
  children = 'Action',
  secondary = false,
  negative = false,
  small = false,
  loading = false,
  disabled = false,
  leadingIcon,
  type = 'button',
  ...rest
}: {
  children?: ReactNode
  secondary?: boolean
  negative?: boolean
  small?: boolean
  loading?: boolean
  disabled?: boolean
  leadingIcon?: ReactNode
  type?: 'button' | 'submit'
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variant: Variant =
    secondary && negative
      ? 'secondary-negative'
      : negative
        ? 'negative'
        : secondary
          ? 'secondary'
          : 'primary'
  const group = `button-${variant}`
  const isOutline = variant === 'secondary' || variant === 'secondary-negative'

  const style: CSSProperties = {
    ...typography(alias.button.typography.$value as string),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: token('{spacing.2}'),
    height: av('button', small ? 'heightSmall' : 'height'),
    paddingInline: av('button', 'paddingInline'),
    borderRadius: av('button', 'rounded'),
    // Disabled has no border (even the outline variants) per spec.
    border: !disabled && isOutline ? `1px solid ${av(group, 'borderColor')}` : 'none',
    backgroundColor: disabled ? av('button-disabled', 'backgroundColor') : av(group, 'backgroundColor'),
    color: disabled ? av('button-disabled', 'textColor') : av(group, 'textColor'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: av('button', 'transition')
  }

  return (
    <button
      type={type}
      className={`cds-focus cds-btn-${variant}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={style}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {!loading && leadingIcon}
      {children}
    </button>
  )
}
