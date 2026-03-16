'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AIHintButtonProps = {
  onHint: () => void
  disabled?: boolean
}

export function AIHintButton({ onHint, disabled }: AIHintButtonProps) {
  return (
    <Button size="sm" variant="ghost" onClick={onHint} disabled={disabled}>
      <Sparkles className="w-3 h-3 mr-1" />
      AI Hint
    </Button>
  )
}
