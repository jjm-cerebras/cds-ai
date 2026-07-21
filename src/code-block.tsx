import { token, typography } from './tokens'

/**
 * CodeBlock — a tokenized container around read-only code. The shipped CDS
 * wraps a CodeMirror instance that carries no CDS tokens of its own, so the
 * container supplies them: white card fill, divider hairline, rounded-sm, mono.
 */
export const CodeBlock = ({
  code = 'curl https://api.cerebras.ai/v1/models \\\n  -H "Authorization: Bearer $CEREBRAS_API_KEY"'
}: {
  code?: string
}) => (
  <pre
    style={{
      margin: 0,
      padding: token('{spacing.4}'),
      backgroundColor: token('{colors.cds-neutral-0}'),
      border: `1px solid ${token('{colors.divider}')}`,
      borderRadius: token('{rounded.sm}'),
      overflowX: 'auto'
    }}
  >
    <code style={{ ...typography('{typography.code}'), color: token('{colors.foreground}'), whiteSpace: 'pre' }}>{code}</code>
  </pre>
)
