import React from 'react'

type OutputLine = {
  type: 'stdout' | 'stderr' | 'html'
  line: string
}

type OutputPanelProps = {
  output: OutputLine[]
  error: string | null
}

export function OutputPanel({ output, error }: OutputPanelProps) {
  const hasContent = output.length > 0 || error !== null
  const hasHtml = output.some((o) => o.type === 'html')

  return (
    <div className="bg-muted rounded-md p-3 font-mono text-sm min-h-[80px]">
      {!hasContent ? (
        <p className="text-muted-foreground text-xs italic">Output will appear here...</p>
      ) : (
        <>
          {hasHtml && (
            <style>{`
              .df-output table { border-collapse: collapse; font-size: 0.8rem; width: 100%; }
              .df-output th { background: var(--color-background-muted, #f3f4f6); font-weight: 600; text-align: left; padding: 4px 8px; border: 1px solid var(--color-border, #e5e7eb); }
              .df-output td { padding: 3px 8px; border: 1px solid var(--color-border, #e5e7eb); }
              .df-output tr:nth-child(even) { background: var(--color-background-subtle, #f9fafb); }
            `}</style>
          )}
          {output.map((item, index) =>
            item.type === 'html' ? (
              <div
                key={index}
                className="df-output overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: item.line }}
              />
            ) : (
              <pre
                key={index}
                className={
                  item.type === 'stderr'
                    ? 'text-red-500 dark:text-red-400 whitespace-pre-wrap break-all m-0'
                    : 'whitespace-pre-wrap break-all m-0'
                }
              >
                {item.line}
              </pre>
            )
          )}
          {error !== null && (
            <pre className="text-red-500 dark:text-red-400 whitespace-pre-wrap break-all m-0 mt-1">
              {error}
            </pre>
          )}
        </>
      )}
    </div>
  )
}
