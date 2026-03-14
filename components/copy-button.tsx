'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  code: string
  /** Injectable copy function — defaults to navigator.clipboard.writeText */
  onCopy?: (text: string) => Promise<void>
}

export function CopyButton({ code, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const copyFn = onCopy ?? ((text: string) => navigator.clipboard.writeText(text))
    await copyFn(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="flex items-center gap-1 h-7 px-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      aria-label="Copy code"
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs text-[var(--color-primary)] transition-opacity">
            Copied!
          </span>
        </>
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
