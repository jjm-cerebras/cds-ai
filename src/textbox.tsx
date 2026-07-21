import { CSSProperties, ReactNode, useId, InputHTMLAttributes } from 'react'
import { alias, av } from './alias'
import { token, typography } from './tokens'

/**
 * Textbox — single-line or multiline input with a required visible Label,
 * optional leading icon, and helper/error text. States: default, focus
 * (brand ring via .cds-focus-ring), error (negative fill + border; message and
 * required asterisk in cds-danger), readonly. Placeholder is never the label.
 */
export const Textbox = ({
  label,
  placeholder,
  helper,
  error,
  required = false,
  readOnly = false,
  multiline = false,
  leadingIcon,
  defaultValue,
  ...rest
}: {
  label: string
  placeholder?: string
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  readOnly?: boolean
  multiline?: boolean
  leadingIcon?: ReactNode
  defaultValue?: string
} & InputHTMLAttributes<HTMLInputElement>) => {
  const id = useId()
  const helpId = `${id}-help`
  const hasError = Boolean(error)

  const field: CSSProperties = {
    ...typography(alias.textbox.typography.$value as string),
    width: '100%',
    boxSizing: 'border-box',
    height: multiline ? undefined : av('textbox', 'height'),
    minHeight: multiline ? '5rem' : undefined,
    paddingInline: av('textbox', 'paddingInline'),
    paddingBlock: multiline ? token('{spacing.2}') : undefined,
    paddingLeft: leadingIcon ? token('{spacing.8}') : undefined,
    borderRadius: av('textbox', 'rounded'),
    borderWidth: '1px',
    borderStyle: 'solid',
    // Only the prop-driven states set border-color inline. The default resting
    // color lives in .cds-textbox so the CSS :hover/:focus-visible rules can win.
    borderColor: hasError
      ? av('textbox-error', 'borderColor')
      : readOnly
        ? av('textbox-readonly', 'borderColor')
        : undefined,
    backgroundColor: hasError
      ? av('textbox-error', 'backgroundColor')
      : readOnly
        ? av('textbox-readonly', 'backgroundColor')
        : av('textbox', 'backgroundColor'),
    color: readOnly ? av('textbox-readonly', 'textColor') : av('textbox', 'textColor'),
    outline: 'none'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: token('{spacing.1}') }}>
      <label
        htmlFor={id}
        style={{ ...typography(alias.label.typography.$value as string), color: av('label', 'textColor') }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: token('{colors.cds-danger-8}'), marginLeft: 2 }}>
            *
          </span>
        )}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leadingIcon && (
          <span aria-hidden="true" style={{ position: 'absolute', left: token('{spacing.3}'), display: 'inline-flex', color: token('{colors.neutral-45}') }}>
            {leadingIcon}
          </span>
        )}
        {multiline ? (
          <textarea
            id={id}
            className="cds-textbox cds-focus-ring"
            placeholder={placeholder}
            readOnly={readOnly}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={helper || error ? helpId : undefined}
            defaultValue={defaultValue}
            style={field}
          />
        ) : (
          <input
            id={id}
            className="cds-textbox cds-focus-ring"
            placeholder={placeholder}
            readOnly={readOnly}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={helper || error ? helpId : undefined}
            defaultValue={defaultValue}
            style={field}
            {...rest}
          />
        )}
      </div>
      {(helper || error) && (
        <span
          id={helpId}
          style={{
            ...typography('{typography.helper-text}'),
            marginTop: token('{spacing.1}'),
            color: hasError ? token('{colors.cds-danger-8}') : token('{colors.foreground-muted}')
          }}
        >
          {error || helper}
        </span>
      )}
    </div>
  )
}
