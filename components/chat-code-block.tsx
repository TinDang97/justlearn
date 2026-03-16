'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'
import { usePyodideWorker } from '@/hooks/use-pyodide-worker'
import type { RunResult } from '@/hooks/use-pyodide-worker'
import { InputFields, useCodeInputs } from '@/components/code-runner/input-fields'

interface ChatCodeBlockProps {
  code: string
  language?: string
}

export function ChatCodeBlock({ code: initialCode, language = 'python' }: ChatCodeBlockProps) {
  const { run, status } = usePyodideWorker()
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<RunResult['output'] | null>(null)
  const [error, setError] = useState<string | null | undefined>(undefined)
  const { prompts, inputValues, setInputValues } = useCodeInputs(code)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isPython = language === 'python' || language === 'py'

  const handleRun = async () => {
    const result = await run(code, inputValues)
    setOutput(result.output)
    setError(result.error)
  }

  const autoResize = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
    autoResize()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab inserts spaces instead of switching focus
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newValue = code.substring(0, start) + '    ' + code.substring(end)
      setCode(newValue)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
    // Cmd/Ctrl+Enter runs code
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && isPython) {
      e.preventDefault()
      handleRun()
    }
  }

  const isLoading = status === 'loading' || status === 'installing'
  const isRunning = status === 'running'
  const hasRun = output !== null || error !== undefined

  return (
    <div className="not-prose group overflow-hidden rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-bg)]">
      {/* Header bar — synced with lesson code block (mdx-components.tsx) */}
      <div className="flex h-9 items-center justify-between border-b border-[var(--color-code-border)] bg-[var(--color-code-header)] px-4">
        <span className="font-mono text-xs uppercase text-[var(--color-foreground-muted)] opacity-70">
          {language}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <CopyButton code={code} />
          {isPython && (
            <>
              {isLoading && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading Python...
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 h-7 px-2 whitespace-nowrap"
                onClick={handleRun}
                disabled={isRunning || isLoading}
                aria-label="Run code"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span className="text-xs">Run</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Input fields for input() calls */}
      <InputFields prompts={prompts} values={inputValues} onChange={setInputValues} />

      {/* Editable code area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="block w-full resize-none overflow-x-auto bg-transparent p-4 font-mono text-[15px] leading-relaxed text-[var(--color-foreground)] outline-none border-none focus:ring-0 m-0"
        rows={code.split('\n').length}
      />

      {/* Output area — only visible after first run */}
      {hasRun && (
        <div
          data-testid="chat-code-output"
          className="border-t border-[var(--color-code-border)] bg-[var(--color-code-header)] p-3 font-mono text-xs"
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
