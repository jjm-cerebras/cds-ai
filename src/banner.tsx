import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { av, araw } from './alias'
import { token, typography } from './tokens'

/**
 * Banner — full-width promo/system bar with a warm orange gradient, a dark pill
 * link, and a circular dismiss. Reserve for global announcements (per-page
 * status is the Notification). Sticky, h-10.
 */
export const Banner = ({
  children = 'Announcement message.',
  linkLabel = 'View details',
  href = '/announcements',
  onDismiss
}: {
  children?: ReactNode
  linkLabel?: string
  href?: string
  onDismiss?: () => void
}) => (
  <div
    role="region"
    aria-label="Announcement"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: token('{spacing.3}'),
      height: av('banner', 'height'),
      paddingInline: token('{spacing.4}'),
      background: araw('banner', 'background').replace(/\{([^}]+)\}/g, (_, r: string) => `var(--${r.replace(/\./g, '-')})`),
      position: 'relative'
    }}
  >
    <span style={{ ...typography('{typography.small-text}'), color: token('{colors.foreground}') }}>{children}</span>
    <a
      href={href}
      className="cds-focus"
      style={{
        ...typography('{typography.small-text}'),
        display: 'inline-flex',
        alignItems: 'center',
        paddingInline: token('{spacing.3}'),
        height: '1.5rem',
        borderRadius: token('{rounded.full}'),
        backgroundColor: av('banner', 'linkPillBackground'),
        color: av('banner', 'linkPillTextColor'),
        textDecoration: 'none'
      }}
    >
      {linkLabel}
    </a>
    {onDismiss && (
      <button
        type="button"
        className="cds-focus"
        aria-label="Dismiss announcement"
        onClick={onDismiss}
        style={{
          position: 'absolute',
          right: token('{spacing.4}'),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.5rem',
          height: '1.5rem',
          border: 'none',
          borderRadius: token('{rounded.full}'),
          background: 'none',
          cursor: 'pointer',
          color: token('{colors.foreground}')
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    )}
  </div>
)
