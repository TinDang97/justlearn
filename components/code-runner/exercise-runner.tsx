'use client'

import React, { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { useTheme } from 'next-themes'
import { Play, Loader2, RotateCcw, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { usePyodideWorker } from '@/hooks/use-pyodide-worker'
import type { RunResult } from '@/hooks/use-pyodide-worker'

type Exercise = {
  id: string
  title: string
  description: string
  starterCode: string
  expectedOutput?: string
  hints?: string[]
}

type ExerciseRunnerProps = {
  exercises: Exercise[]
}

type ValidationState = 'idle' | 'correct' | 'incorrect'

export function ExerciseRunner({ exercises }: ExerciseRunnerProps) {
  const { resolvedTheme } = useTheme()
  const { run, status } = usePyodideWorker()

  const [activeIndex, setActiveIndex] = useState(0)
  const [codes, setCodes] = useState<Record<number, string>>(
    () => Object.fromEntries(exercises.map((ex, i) => [i, ex.starterCode]))
  )
  const [output, setOutput] = useState<RunResult['output']>([])
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationState>('idle')
  const [showHint, setShowHint] = useState(false)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())

  const activeExercise = exercises[activeIndex]
  const code = codes[activeIndex] ?? activeExercise.starterCode

  const handleCodeChange = (value: string) => {
    setCodes((prev) => ({ ...prev, [activeIndex]: value }))
  }

  const handleRun = async () => {
    setValidation('idle')
    const result = await run(code)
    setOutput(result.output)
    setError(result.error)

    if (activeExercise.expectedOutput && !result.error) {
      const actual = result.output
        .filter((o) => o.type === 'stdout')
        .map((o) => o.line)
        .join('\n')
        .trim()
      const expected = activeExercise.expectedOutput.trim()
      if (actual === expected) {
        setValidation('correct')
        setCompletedExercises((prev) => new Set(prev).add(activeIndex))
      } else {
        setValidation('incorrect')
      }
    }
  }

  const handleReset = () => {
    setCodes((prev) => ({ ...prev, [activeIndex]: activeExercise.starterCode }))
    setOutput([])
    setError(null)
    setValidation('idle')
    setShowHint(false)
  }

  const handleTabChange = (index: number) => {
    setActiveIndex(index)
    setOutput([])
    setError(null)
    setValidation('idle')
    setShowHint(false)
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Exercise tabs */}
      {exercises.length > 1 && (
        <div className="flex border-b overflow-x-auto">
          {exercises.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => handleTabChange(i)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${activeIndex === i
                  ? 'border-primary text-foreground bg-muted/40'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }
              `}
            >
              {completedExercises.has(i) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              )}
              {ex.title}
            </button>
          ))}
        </div>
      )}

      {/* Exercise description */}
      <div className="px-4 py-3 bg-muted/20 border-b">
        <p className="text-sm font-medium">{activeExercise.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{activeExercise.description}</p>
        {activeExercise.expectedOutput && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Expected output: </span>
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
              {activeExercise.expectedOutput.trim()}
            </code>
          </div>
        )}
      </div>

      {/* CodeMirror editor */}
      <div className="min-h-[160px]">
        <CodeMirror
          value={code}
          onChange={handleCodeChange}
          extensions={[python()]}
          theme={resolvedTheme === 'dark' ? githubDark : githubLight}
          className="text-sm"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-t bg-muted/40">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          className="inline-flex"
        >
          <Button size="sm" onClick={handleRun} disabled={status === 'running'}>
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
        </motion.div>

        <Button size="sm" variant="ghost" onClick={handleReset}>
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>

        {activeExercise.hints && activeExercise.hints.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setShowHint(!showHint)}>
            <Lightbulb className="w-3 h-3 mr-1" />
            Hint
          </Button>
        )}

        {status === 'loading' && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading Python runtime...
          </span>
        )}

        {validation === 'correct' && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 ml-auto font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Correct!
          </span>
        )}

        {validation === 'incorrect' && (
          <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 ml-auto font-medium">
            <XCircle className="w-4 h-4" />
            Not quite — check the expected output
          </span>
        )}
      </div>

      {/* Hint panel */}
      {showHint && activeExercise.hints && (
        <div className="px-4 py-2 border-t bg-amber-50 dark:bg-amber-950/30 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Hint:</p>
          <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 space-y-0.5">
            {activeExercise.hints.map((hint, i) => (
              <li key={i}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Output panel */}
      <div className="p-3 border-t">
        <div className={`
          bg-muted rounded-md p-3 font-mono text-sm min-h-[60px]
          ${validation === 'correct' ? 'ring-2 ring-green-500/30' : ''}
          ${validation === 'incorrect' ? 'ring-2 ring-amber-500/30' : ''}
        `}>
          {output.length === 0 && error === null ? (
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
      </div>

      {/* Progress bar */}
      {exercises.length > 1 && (
        <div className="px-4 py-2 border-t bg-muted/20 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completedExercises.size}/{exercises.length} completed
          </span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(completedExercises.size / exercises.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
