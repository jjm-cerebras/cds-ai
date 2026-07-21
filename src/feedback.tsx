import { ReactNode } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, Check, X } from 'lucide-react'
import { alias, av, araw } from './alias'
import { token, typography } from './tokens'

/* -------------------------------------------------------------------------- */
/* Spinner                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Spinner — the `ring` loading indicator: a brand-50 head on a neutral-20 track,
 * spinning at the `spinner` duration. Carries role="status" + an sr-only label.
 */
export const Spinner = ({ size = 24, label = 'Loading…' }: { size?: number; label?: string }) => (
  <span role="status" style={{ display: 'inline-flex' }}>
    <span
      className="cds-spinner"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: token('{rounded.full}'),
        border: `2px solid ${av('spinner', 'ringTrack')}`,
        borderTopColor: av('spinner', 'ringHead'),
        boxSizing: 'border-box'
      }}
    />
    <span
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  </span>
)

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                    */
/* -------------------------------------------------------------------------- */

/** Tooltip — dark inverted label. Presentational bubble; keep it short. */
export const Tooltip = ({ children = 'Tooltip label' }: { children?: ReactNode }) => (
  <span
    role="tooltip"
    style={{
      ...typography(alias.tooltip.typography.$value as string),
      display: 'inline-block',
      maxWidth: av('tooltip', 'maxWidth'),
      backgroundColor: av('tooltip', 'backgroundColor'),
      color: av('tooltip', 'textColor'),
      borderRadius: av('tooltip', 'rounded'),
      paddingInline: av('tooltip', 'paddingInline'),
      paddingBlock: av('tooltip', 'paddingBlock')
    }}
  >
    {children}
  </span>
)

/* -------------------------------------------------------------------------- */
/* Notification                                                               */
/* -------------------------------------------------------------------------- */

type NoteRole = 'success' | 'error' | 'warning' | 'info'
const NOTE_ICON = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
const NOTE_BG: Record<NoteRole, string> = {
  success: 'successBackground',
  error: 'errorBackground',
  warning: 'warningBackground',
  info: 'infoBackground'
}
const NOTE_ICON_COLOR: Record<NoteRole, string> = {
  success: '{colors.positive-50}',
  error: '{colors.negative-50}',
  warning: '{colors.warning-50}',
  info: '{colors.info-50}'
}

/**
 * Notification — inline banner with a required leading icon. success/info use
 * role="status", error/warning use role="alert" so they are announced. Copy is
 * reason + fix; the dismiss control is keyboard-reachable and labelled.
 */
export const Notification = ({
  role = 'info',
  children = 'Message. What to do next.',
  onDismiss
}: {
  role?: NoteRole
  children?: ReactNode
  onDismiss?: () => void
}) => {
  const Icon = NOTE_ICON[role]
  return (
    <div
      role={role === 'error' || role === 'warning' ? 'alert' : 'status'}
      style={{
        ...typography(alias.notification.typography.$value as string),
        display: 'flex',
        alignItems: 'flex-start',
        gap: token('{spacing.2}'),
        padding: token('{spacing.3}'),
        borderRadius: av('notification', 'rounded'),
        backgroundColor: av('notification', NOTE_BG[role]),
        color: token('{colors.foreground}')
      }}
    >
      <Icon size={16} aria-hidden="true" style={{ color: token(NOTE_ICON_COLOR[role]), flex: 'none', marginTop: 2 }} />
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss && (
        <button
          type="button"
          className="cds-focus cds-icon-btn"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{
            display: 'inline-flex',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: token('{colors.neutral-60}'),
            borderRadius: token('{rounded.sm}')
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Dropdown / Popover menu                                                    */
/* -------------------------------------------------------------------------- */

export type MenuItem = { label: string; selected?: boolean }

/**
 * DropdownMenu — the open popover surface: white, hairline border, soft shadow.
 * Selected item shows a brand-50 check (conveyed by the icon, not color alone).
 */
export const DropdownMenu = ({
  items = [{ label: 'First option', selected: true }, { label: 'Second option' }, { label: 'Third option' }],
  label = 'Options'
}: {
  items?: MenuItem[]
  label?: string
}) => (
  <div
    role="menu"
    aria-label={label}
    className="cds-overlay"
    style={{
      display: 'inline-block',
      minWidth: '12rem',
      backgroundColor: av('dropdown-menu', 'backgroundColor'),
      border: `1px solid ${av('dropdown-menu', 'borderColor')}`,
      borderRadius: av('dropdown-menu', 'rounded'),
      boxShadow: araw('dropdown-menu', 'shadow'),
      padding: token('{spacing.1}')
    }}
  >
    {items.map((it, i) => (
      <div
        key={i}
        role="menuitemradio"
        tabIndex={-1}
        aria-checked={Boolean(it.selected)}
        className="cds-focus cds-menu-item"
        style={{
          ...typography('{typography.body}'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: token('{spacing.2}'),
          padding: `${token('{spacing.2}')} ${token('{spacing.3}')}`,
          borderRadius: av('dropdown-item', 'rounded'),
          color: av('dropdown-item', 'textColor'),
          cursor: 'pointer'
        }}
      >
        {it.label}
        {it.selected && <Check size={16} aria-hidden="true" style={{ color: av('dropdown-item', 'selectedCheckColor') }} />}
      </div>
    ))}
  </div>
)
