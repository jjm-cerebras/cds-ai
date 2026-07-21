import { ReactNode, ButtonHTMLAttributes } from 'react'
import { alias, av } from './alias'
import { typography } from './tokens'

/**
 * TextButton — low-emphasis inline action using the shared CDS link treatment
 * (identical to a table row-action link): Sometype Mono, UPPERCASE, weight 600,
 * `interactive-55`, with a 1.5px bottom-border underline that appears on hover
 * (color unchanged). Prefer this over inventing a "ghost" button.
 */
export const TextButton = ({
  children = 'Text action',
  ...rest
}: { children?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className="cds-focus cds-link"
    style={{
      ...typography(alias['text-button'].typography.$value as string),
      display: 'inline-flex',
      alignItems: 'center',
      // Border is owned by .cds-link (base transparent → interactive-55 on hover).
      // Not set inline, so the :hover rule can apply.
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      color: av('text-button', 'textColor')
    }}
    {...rest}
  >
    {children}
  </button>
)
