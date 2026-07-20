import { CSSProperties, Fragment, ReactNode } from 'react'
import tokens from '../components/breadcrumbs.json'
import { token } from './tokens'

export type Crumb = {
  label: string
  href?: string
}

/**
 * Breadcrumbs — horizontal navigation trail above a page title.
 * The last item is rendered as the current (non-link) location. Every crumb
 * shares one muted color; links warm to the brand accent on hover only.
 *
 * No styling values live here: every color, gap, and type value is read from
 * `components/breadcrumbs.json` and resolved to a CSS custom property.
 */
export const Breadcrumbs = ({
  items = [
    { label: 'Home', href: '#' },
    { label: 'Section', href: '#' },
    { label: 'Current page' }
  ],
  separator = '/'
}: {
  items?: Crumb[]
  separator?: ReactNode
}) => {
  const t = tokens

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: token(t.breadcrumbs.gap),
        marginBottom: token(t.breadcrumbs.bottomMargin),
        fontFamily: token(t.breadcrumbs.fontFamily),
        fontSize: token(t.breadcrumbs.fontSize),
        fontWeight: token(t.breadcrumbs.fontWeight) as CSSProperties['fontWeight'],
        lineHeight: token(t.breadcrumbs.lineHeight),
        letterSpacing: token(t.breadcrumbs.letterSpacing),
        textTransform: token(
          t.breadcrumbs.textTransform
        ) as CSSProperties['textTransform']
      }}
    >
      {items.map((crumb, i) => {
        const isCurrent = i === items.length - 1
        return (
          <Fragment key={i}>
            {i > 0 && (
              <span
                aria-hidden="true"
                style={{ color: token(t['breadcrumbs-separator'].textColor) }}
              >
                {separator}
              </span>
            )}
            {isCurrent || !crumb.href ? (
              <span
                aria-current={isCurrent ? 'page' : undefined}
                style={{ color: token(t['breadcrumbs-current'].textColor) }}
              >
                {crumb.label}
              </span>
            ) : (
              <a
                href={crumb.href}
                style={{
                  color: token(t['breadcrumbs-item'].textColor),
                  textDecoration: 'none',
                  transitionProperty: 'color',
                  transitionDuration: token(t.breadcrumbs.transition)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = token(
                    t['breadcrumbs-item'].textColorHover
                  )
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = token(
                    t['breadcrumbs-item'].textColor
                  )
                }}
              >
                {crumb.label}
              </a>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
