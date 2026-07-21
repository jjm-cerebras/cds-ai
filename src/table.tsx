import { CSSProperties, ReactNode, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import tokens from '../tokens/table.json'
import { token } from './tokens'

export type Column<T> = {
  /** Column header label. */
  label: string
  /** Key on the row object this column reads. */
  field: keyof T & string
  /** Render values in the mono family (ids, hashes, numbers to align). */
  mono?: boolean
  /**
   * Numeric magnitude column: right-aligns the cell and its header and applies
   * `tabular-nums` (per the CDS data-type formatting rule). Use for counts,
   * quantities, amounts, currency.
   */
  numeric?: boolean
  /** Explicit alignment override (defaults to right for `numeric`, else left). */
  align?: Align
  /** Opt this column out of sorting. */
  noSort?: boolean
  /** Custom cell renderer; receives the raw value and the whole row. */
  renderData?: (value: unknown, row: T) => ReactNode
}

type Align = 'left' | 'center' | 'right'
const justify: Record<Align, CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
}

/**
 * Table — sortable data table with a header rule, hairline row separators,
 * optional mono columns, and an empty state.
 *
 * No styling values live here: every color, spacing, border, and type value is
 * read from `tokens/table.json` and resolved to a CSS custom property.
 */
export function Table<T>({
  columns,
  data,
  emptyText = 'No results found',
  lastHeaderAlign = 'center'
}: {
  columns: Column<T>[]
  data: T[]
  emptyText?: string
  lastHeaderAlign?: Align
}) {
  const t = tokens
  const [sort, setSort] = useState<{ field: string; asc: boolean }>(() => ({
    field: columns[0]?.field ?? '',
    asc: true
  }))

  const rows = useMemo(() => {
    if (!sort.field) return data
    const sorted = [...data].sort((a, b) => {
      const av = a[sort.field as keyof T]
      const bv = b[sort.field as keyof T]
      if (av === bv) return 0
      return (av > bv ? 1 : -1) * (sort.asc ? 1 : -1)
    })
    return sorted
  }, [data, sort])

  const onSort = (field: string) =>
    setSort((s) =>
      s.field === field ? { field, asc: !s.asc } : { field, asc: true }
    )

  const cellBase: CSSProperties = {
    paddingBlock: token(t.table.cellPaddingBlock),
    paddingInline: token(t.table.cellPaddingInline),
    verticalAlign: 'middle'
  }
  // Data-type formatting: numeric magnitudes right-align + tabular-nums.
  const colAlign = (c: Column<T>): Align => c.align ?? (c.numeric ? 'right' : 'left')
  const edge = (i: number): CSSProperties => ({
    paddingLeft: i === 0 ? token(t.table.cellEdgeInline) : undefined,
    paddingRight:
      i === columns.length - 1 ? token(t.table.cellEdgeInline) : undefined
  })

  return (
    <table
      style={{
        minWidth: token(t.table.minWidth),
        borderCollapse: 'collapse',
        backgroundColor: token(t.table.backgroundColor),
        boxShadow: token(t.table.shadow),
        borderRadius: token(t.table.rounded),
        color: token(t.table.textColor)
      }}
    >
      <thead>
        <tr
          style={{
            height: token(t.table.rowHeight),
            borderBottom: `${token(t.table.headerBorderWidth)} solid ${token(
              t.table.rowBorderColor
            )}`
          }}
        >
          {columns.map((c, i) => {
            const sortable = !c.noSort
            const isLast = i === columns.length - 1
            const isActive = sortable && sort.field === c.field
            // Both active and (hover-preview) inactive arrows point in the
            // current active sort direction — down for asc, up for desc.
            const SortArrow = sort.asc ? ArrowDown : ArrowUp
            return (
              <th
                key={i}
                scope="col"
                className={sortable ? 'cds-th-sortable' : undefined}
                aria-sort={isActive ? (sort.asc ? 'ascending' : 'descending') : undefined}
                onClick={sortable ? () => onSort(c.field) : undefined}
                style={{
                  ...cellBase,
                  ...edge(i),
                  cursor: sortable ? 'pointer' : 'default',
                  fontFamily: token(t['table-header'].fontFamily),
                  fontSize: token(t['table-header'].fontSize),
                  fontWeight: token(
                    t['table-header'].fontWeight
                  ) as CSSProperties['fontWeight'],
                  lineHeight: token(t['table-header'].lineHeight),
                  letterSpacing: token(t['table-header'].letterSpacing),
                  textTransform: token(
                    t['table-header'].textTransform
                  ) as CSSProperties['textTransform']
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: token(t.table.headerGap),
                    justifyContent:
                      justify[c.align ?? (c.numeric ? 'right' : isLast ? lastHeaderAlign : 'left')]
                  }}
                >
                  {c.label}
                  {sortable && (
                    <SortArrow
                      size={16}
                      aria-hidden="true"
                      className={`cds-sort-icon ${isActive ? 'cds-sort-icon--active' : 'cds-sort-icon--inactive'}`}
                    />
                  )}
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>
              <div
                style={{
                  height: token(t['table-empty'].height),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: token(t['table-empty'].fontSize),
                  color: token(t['table-empty'].textColor)
                }}
              >
                {emptyText}
              </div>
            </td>
          </tr>
        ) : (
          rows.map((row, r) => {
            const isLastRow = r === rows.length - 1
            return (
              <tr
                key={r}
                style={{
                  height: token(t.table.rowHeight),
                  borderBottom: isLastRow
                    ? undefined
                    : `${token(t.table.rowBorderWidth)} solid ${token(
                        t.table.rowBorderColor
                      )}`
                }}
              >
                {columns.map((c, i) => {
                  const value = row[c.field]
                  return (
                    <td
                      key={i}
                      style={{
                        ...cellBase,
                        ...edge(i),
                        textAlign: colAlign(c),
                        fontVariantNumeric: c.numeric ? 'tabular-nums' : undefined,
                        fontFamily: c.mono
                          ? token(t.table.monoFontFamily)
                          : token(t.table.cellFontFamily),
                        fontSize: token(t.table.cellFontSize),
                        lineHeight: token(t.table.cellLineHeight),
                        fontWeight: (i === 0
                          ? token(t.table.emphasisFontWeight)
                          : token(
                              t.table.cellFontWeight
                            )) as CSSProperties['fontWeight']
                      }}
                    >
                      {c.renderData ? c.renderData(value, row) : (value as ReactNode)}
                    </td>
                  )
                })}
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}

