import React from 'react'

type OutputLine = {
  type: 'stdout' | 'stderr'
  line: string
}

type OutputPanelProps = {
  output: OutputLine[]
  error: string | null
}

export function OutputPanel({ output, error }: OutputPanelProps) {
  const hasContent = output.length > 0 || error !== null

  return (
    <div className="bg-muted rounded-md p-3 font-mono text-sm min-h-[80px]">
      {!hasContent ? (
        <p className="text-muted-foreground text-xs italic">Output will appear here...</p>
      ) : (
        <>
          {output.map((item, index) => (
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
          ))}
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
