import { CSSProperties, ReactNode } from 'react'
import { av } from './alias'
import { token, typography } from './tokens'

type Role = 'gray' | 'green' | 'purple' | 'yellow' | 'red'
const BADGE_GROUND: Record<Role, string> = {
  gray: 'grayGround',
  green: 'greenGround',
  purple: 'purpleGround',
  yellow: 'yellowGround',
  red: 'redGround'
}
const ROLE_ICON_COLOR: Record<Role, string> = {
  gray: '{colors.neutral-60}',
  green: '{colors.positive-50}',
  purple: '{colors.info-50}',
  yellow: '{colors.warning-50}',
  red: '{colors.negative-50}'
}

const chipBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: token('{spacing.1}'),
  height: '1.5rem',
  paddingInline: token('{spacing.2}')
}

/** Badge — low-emphasis classification. `ground` filled tint / `floor` outlined. */
export const Badge = ({
  children = 'Label',
  role = 'gray',
  floor = false,
  icon
}: {
  children?: ReactNode
  role?: Role
  floor?: boolean
  icon?: ReactNode
}) => (
  <span
    style={{
      ...chipBase,
      ...typography('{typography.small-text}'),
      borderRadius: av('badge', 'rounded'),
      color: av('badge', 'textColor'),
      backgroundColor: floor ? 'transparent' : av('badge', BADGE_GROUND[role]),
      border: floor ? `1px solid ${av('badge', BADGE_GROUND[role])}` : 'none'
    }}
  >
    {icon && (
      <span aria-hidden="true" style={{ display: 'inline-flex', color: token(ROLE_ICON_COLOR[role]) }}>
        {icon}
      </span>
    )}
    {children}
  </span>
)

/** Count — role-colored pill number. */
export const Count = ({ children = 3, brand = false }: { children?: ReactNode; brand?: boolean }) => (
  <span
    style={{
      ...typography('{typography.small-text}'),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '1.25rem',
      height: '1.25rem',
      paddingInline: token('{spacing.1}'),
      borderRadius: av('count', 'rounded'),
      backgroundColor: brand ? av('count', 'brandBackground') : av('count', 'neutralBackground'),
      color: av('count', 'textColor')
    }}
  >
    {children}
  </span>
)

/** Stamp — bold tag with tier support (tier-1…5). */
export const Stamp = ({ children = 'TIER 1', tier = 1 }: { children?: ReactNode; tier?: 1 | 2 | 3 | 4 | 5 }) => (
  <span
    style={{
      ...chipBase,
      ...typography('{typography.small-text}'),
      fontFamily: token('{typography.family-mono.fontFamily}'),
      fontWeight: 700,
      borderRadius: av('stamp', 'rounded'),
      backgroundColor: token('{colors.neutral-10}'),
      color: token(`{colors.tier-${tier}}`)
    }}
  >
    {children}
  </span>
)

type Status = 'healthy' | 'degraded' | 'provisioning' | 'error' | 'neutral'
const STATUS_GROUND: Record<Status, string> = {
  healthy: '{colors.positive-10}',
  degraded: '{colors.warning-15}',
  provisioning: '{colors.info-15}',
  error: '{colors.negative-15}',
  neutral: '{colors.neutral-10}'
}

/**
 * StatusPill — the concrete status pattern for tables and inline state: a tinted
 * surface + a neutral text label (no icon; never tint the text). The label
 * carries the meaning, satisfying the non-color-alone rule.
 */
export const StatusPill = ({ status = 'healthy', children }: { status?: Status; children?: ReactNode }) => (
  <span
    style={{
      ...chipBase,
      ...typography('{typography.small-text}'),
      borderRadius: token('{rounded.sm}'),
      backgroundColor: token(STATUS_GROUND[status]),
      color: token('{colors.neutral-60}')
    }}
  >
    {children ?? status}
  </span>
)
