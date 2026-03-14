'use client'

import React, { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { useTheme } from 'next-themes'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePyodideWorker } from '@/hooks/use-pyodide-worker'
import { OutputPanel } from './output-panel'
import type { RunResult } from '@/hooks/use-pyodide-worker'

type CodeRunnerClientProps = {
  initialCode: string
}

export function CodeRunnerClient({ initialCode }: CodeRunnerClientProps) {
  const { resolvedTheme } = useTheme()
  const { run, status } = usePyodideWorker()

  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<RunResult['output']>([])
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    const result = await run(code)
    setOutput(result.output)
    setError(result.error)
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* CodeMirror editor */}
      <div className="min-h-[200px]">
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={[python()]}
          theme={resolvedTheme === 'dark' ? githubDark : githubLight}
          className="text-sm"
        />
      </div>

      {/* Run button bar */}
      <div className="flex items-center gap-3 px-3 py-2 border-t bg-muted/40">
        <Button
          size="sm"
          onClick={handleRun}
          disabled={status === 'running'}
        >
          <Play className="w-3 h-3 mr-1" />
          Run
        </Button>

        {status === 'loading' && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading Python runtime...
          </span>
        )}
      </div>

      {/* Output panel */}
      <div className="p-3 border-t">
        <OutputPanel output={output} error={error} />
      </div>
    </div>
  )
}
