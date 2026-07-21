import { CSSProperties, ReactNode } from 'react'
import tokens from '../tokens/heading.json'
import { token } from './tokens'

/**
 * Heading — page and section titles with an optional description line.
 *
 * `variant="page"` is the top-of-view title (20px, sits under the breadcrumbs);
 * `variant="section"` is a heading within the page body (16px). The page
 * description carries the same near-black title color; the section description
 * is a muted gray.
 *
 * No styling values live here: every color, spacing, and type value is read
 * from `tokens/heading.json` and resolved to a CSS custom property.
 */
export const Heading = ({
  variant = 'page',
  title = 'Page title',
  description = 'Short description of this page or section.',
  actions
}: {
  variant?: 'page' | 'section'
  title?: string
  description?: ReactNode
  actions?: ReactNode
}) => {
  const t = tokens
  const isPage = variant === 'page'
  const titleTokens = isPage
    ? t['heading-page-title']
    : t['heading-section-title']
  const descTokens = isPage
    ? t['heading-page-description']
    : t['heading-section-description']

  const typeStyle = (tk: typeof titleTokens): CSSProperties => ({
    fontFamily: token(tk.fontFamily),
    fontSize: token(tk.fontSize),
    fontWeight: token(tk.fontWeight) as CSSProperties['fontWeight'],
    lineHeight: token(tk.lineHeight),
    letterSpacing: token(tk.letterSpacing),
    color: token(tk.textColor)
  })

  const TitleTag = isPage ? 'h1' : 'h2'

  return (
    <header style={{ marginTop: isPage ? undefined : token(t.heading.sectionTopMargin) }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: token(t.heading.sectionDescriptionGap),
          marginBottom: isPage ? token(t.heading.pageTitleBottomMargin) : 0
        }}
      >
        <TitleTag style={{ margin: 0, ...typeStyle(titleTokens) }}>{title}</TitleTag>
        {actions}
      </div>
      {description && (
        <p
          style={{
            marginTop: isPage ? 0 : token(t.heading.sectionDescriptionGap),
            marginBottom: isPage ? token(t.heading.pageDescriptionBottomMargin) : 0,
            ...typeStyle(descTokens)
          }}
        >
          {description}
        </p>
      )}
    </header>
  )
}
