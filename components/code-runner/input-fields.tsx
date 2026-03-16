'use client'

import { useState, useEffect } from 'react'
import { Terminal } from 'lucide-react'

/**
 * Extract input() prompts from Python code.
 * Matches: input(), input("prompt"), input('prompt'), input(prompt_var)
 * Returns the prompt strings (or generic labels for variable prompts).
 */
export function extractInputPrompts(code: string): string[] {
  const prompts: string[] = []
  // Match input() calls — capture the argument if it's a string literal
  const regex = /\binput\s*\(\s*(?:(?:f?["']([^"']*?)["'])|(?:[^)]*))?\s*\)/g
  let match
  while ((match = regex.exec(code)) !== null) {
    prompts.push(match[1] ?? `Input ${prompts.length + 1}`)
  }
  return prompts
}

type InputFieldsProps = {
  prompts: string[]
  values: string[]
  onChange: (values: string[]) => void
}

export function InputFields({ prompts, values, onChange }: InputFieldsProps) {
  if (prompts.length === 0) return null

  return (
    <div className="px-3 py-2 border-t bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
        <Terminal className="w-3 h-3" />
        Input values (for input() calls)
      </div>
      {prompts.map((prompt, i) => (
        <div key={i} className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground min-w-0 shrink-0 max-w-[200px] truncate">
            {prompt}
          </label>
          <input
            type="text"
            value={values[i] ?? ''}
            onChange={(e) => {
              const next = [...values]
              next[i] = e.target.value
              onChange(next)
            }}
            placeholder="Enter value..."
            className="flex-1 h-7 px-2 text-sm border rounded bg-background font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  )
}

/** Hook that manages input state based on code content */
export function useCodeInputs(code: string) {
  const [inputValues, setInputValues] = useState<string[]>([])
  const [prompts, setPrompts] = useState<string[]>([])

  useEffect(() => {
    const newPrompts = extractInputPrompts(code)
    setPrompts(newPrompts)
    // Preserve existing values, extend or trim to match prompt count
    setInputValues((prev) => {
      const next = [...prev]
      while (next.length < newPrompts.length) next.push('')
      return next.slice(0, newPrompts.length)
    })
  }, [code])

  return { prompts, inputValues, setInputValues }
}
