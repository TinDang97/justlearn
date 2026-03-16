'use client'

import { BotMessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/lib/store/chat'

interface RunInAIButtonProps {
  code: string
}

export function RunInAIButton({ code }: RunInAIButtonProps) {
  const handleClick = () => {
    const prompt = `Run this code and explain what it does:\n\`\`\`python\n${code}\n\`\`\``
    useChatStore.getState().openPanelWithQuestion(prompt)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-1 h-7 px-2 whitespace-nowrap"
      aria-label="Run in AI"
    >
      <BotMessageSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs">Run in AI</span>
    </Button>
  )
}
