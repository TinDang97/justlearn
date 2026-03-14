'use client'

import { useState } from 'react'
import { Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeRunner } from '@/components/code-runner'

type PracticeBlockProps = {
  prompt: string
  initialCode?: string
  hint?: string
  solution?: string
}

export function PracticeBlock({
  prompt,
  initialCode = '# Write your code here\n',
  hint,
  solution,
}: PracticeBlockProps) {
  const [hintOpen, setHintOpen] = useState(false)
  const [solutionOpen, setSolutionOpen] = useState(false)

  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)]">
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-background-muted)] px-4"
        style={{ height: '44px' }}
      >
        <Code2
          size={18}
          style={{ color: 'var(--color-primary)' }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold">Try it yourself</span>
      </div>

      {/* Prompt */}
      <div className="px-4 py-3 text-sm">{prompt}</div>

      {/* Code Runner */}
      <div className="px-4 pb-4">
        <CodeRunner initialCode={initialCode} />
      </div>

      {/* Hint section */}
      {hint !== undefined && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHintOpen((prev) => !prev)}
          >
            {hintOpen ? 'Hide hint' : 'Show hint'}
          </Button>
          {hintOpen && (
            <div
              className="mt-2 text-sm"
              style={{ color: 'var(--color-foreground-muted)' }}
            >
              {hint}
            </div>
          )}
        </div>
      )}

      {/* Solution section */}
      {solution !== undefined && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSolutionOpen((prev) => !prev)}
          >
            {solutionOpen ? 'Hide solution' : 'Show solution'}
          </Button>
          {solutionOpen && (
            <pre
              className="mt-2 overflow-x-auto rounded-md p-3 text-sm"
              style={{ backgroundColor: 'var(--color-code-bg)' }}
            >
              <code>{solution}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
