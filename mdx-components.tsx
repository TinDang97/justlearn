import React from 'react'
import type { MDXComponents } from 'mdx/types'
import { CopyButton } from '@/components/copy-button'
import { RunInAIButton } from '@/components/run-in-ai-button'
import { Tip, Warning, Info, ErrorCallout } from '@/components/callout'
import { PracticeBlock } from '@/components/practice-block'

export function useMDXComponents(): MDXComponents {
  return {
    pre: ({
      children,
      raw,
      ...props
    }: React.ComponentProps<'pre'> & { raw?: string }) => {
      // Extract data-language from the <code> child element
      const codeChild = React.Children.toArray(children)[0] as React.ReactElement<
        React.ComponentProps<'code'> & { 'data-language'?: string }
      > | null
      const language = codeChild?.props?.['data-language'] ?? 'code'

      return (
        <div className="not-prose group overflow-hidden rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-bg)]">
          {/* Header bar with language badge and copy button */}
          <div className="flex h-9 items-center justify-between border-b border-[var(--color-code-border)] bg-[var(--color-code-header)] px-4">
            <span className="font-mono text-xs uppercase text-[var(--color-foreground-muted)] opacity-70">
              {language}
            </span>
            {raw && (
            <div className="flex items-center gap-1">
              <CopyButton code={raw} />
              {(language === 'python' || language === 'py') && (
                <RunInAIButton code={raw} />
              )}
            </div>
          )}
          </div>
          {/* Code content */}
          <pre {...props} className="overflow-x-auto p-4 text-[15px] leading-relaxed">
            {children}
          </pre>
        </div>
      )
    },
    code: ({ children, ...props }: React.ComponentProps<'code'>) => (
      <code {...props}>{children}</code>
    ),
    hr: () => (
      <div className="not-prose my-12 flex flex-col items-center gap-2">
        <div className="h-px w-20 bg-[var(--color-border)]" />
      </div>
    ),
    Tip,
    Warning,
    Info,
    Error: ErrorCallout,
    PracticeBlock,
  }
}
