import { CSSProperties } from 'react'
import { av } from './alias'
import { token, typography } from './tokens'

/**
 * Tabs — primary (pill, neutral-15 selected fill) or secondary (underline).
 * Implements the ARIA tablist pattern: role="tablist" / "tab", aria-selected,
 * roving tabindex (only the selected tab is in the tab order).
 */
export const Tabs = ({
  tabs = ['Overview', 'Usage', 'Settings'],
  value = 'Overview',
  variant = 'primary',
  label = 'Sections'
}: {
  tabs?: string[]
  value?: string
  variant?: 'primary' | 'secondary'
  label?: string
}) => {
  const isPrimary = variant === 'primary'
  return (
    <div
      role="tablist"
      aria-label={label}
      style={{
        display: 'inline-flex',
        gap: isPrimary ? token('{spacing.1}') : token('{spacing.4}'),
        borderBottom: isPrimary ? 'none' : `1px solid ${token('{colors.divider}')}`
      }}
    >
      {tabs.map((t) => {
        const selected = t === value
        const base: CSSProperties = {
          ...typography(selected ? '{typography.bold-text}' : '{typography.body}'),
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: `${token('{spacing.2}')} ${token('{spacing.3}')}`
        }
        const primaryStyle: CSSProperties = {
          ...base,
          height: av('tab', 'height'),
          borderRadius: av('tab', 'rounded'),
          border: selected ? `1px solid ${av('tab', 'selectedBorder')}` : '1px solid transparent',
          backgroundColor: selected ? av('tab', 'selectedBackground') : 'transparent',
          color: selected ? av('tab', 'selectedTextColor') : av('tab', 'unselectedTextColor')
        }
        const secondaryStyle: CSSProperties = {
          ...base,
          color: selected ? token('{colors.foreground}') : av('tab-secondary', 'unselectedTextColor'),
          borderBottom: selected ? `2px solid ${token('{colors.accent}')}` : '2px solid transparent',
          marginBottom: -1,
          borderRadius: 0
        }
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className="cds-focus"
            style={isPrimary ? primaryStyle : secondaryStyle}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}
