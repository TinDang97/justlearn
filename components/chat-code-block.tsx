'use client'

import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePyodideWorker } from '@/hooks/use-pyodide-worker'
import type { RunResult } from '@/hooks/use-pyodide-worker'

interface ChatCodeBlockProps {
  code: string
  language?: string
}

export function ChatCodeBlock({ code, language = 'python' }: ChatCodeBlockProps) {
  const { run, status } = usePyodideWorker()
  const [output, setOutput] = useState<RunResult['output'] | null>(null)
  const [error, setError] = useState<string | null | undefined>(undefined)

  const handleRun = async () => {
    const result = await run(code)
    setOutput(result.output)
    setError(result.error)
  }

  const isLoading = status === 'loading' || status === 'installing'
  const isRunning = status === 'running'
  const hasRun = output !== null || error !== undefined

  return (
    <div className="rounded-md border border-border bg-muted/30 overflow-hidden text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <span className="font-mono text-xs uppercase text-muted-foreground opacity-70">
          {language}
        </span>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading Python...
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={handleRun}
            disabled={isRunning || isLoading}
            aria-label="Run code"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code display */}
      <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed m-0">
        <code>{code}</code>
      </pre>

      {/* Output area — only visible after first run */}
      {hasRun && (
        <div
          data-testid="chat-code-output"
          className="border-t border-border bg-background/50 p-3 font-mono text-xs"
        >
          {output && output.length === 0 && !error && (
            <span className="text-muted-foreground italic">(no output)</span>
          )}
          {output &&
            output.map((item, index) => (
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
          {error != null && (
            <pre className="text-red-500 dark:text-red-400 whitespace-pre-wrap break-all m-0 mt-1">
              {error}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
