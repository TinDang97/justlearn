'use client'

import dynamic from 'next/dynamic'
import { MessageCircle } from 'lucide-react'
import { useChatStore } from '@/lib/store/chat'

const AIChatPanel = dynamic(() => import('./ai-chat-panel').then((m) => m.AIChatPanel), {
  ssr: false,
})

interface AIChatPanelWrapperProps {
  courseSlug: string
  lessonTitle: string
  sectionTitle: string
}

export function AIChatPanelWrapper({ courseSlug, lessonTitle, sectionTitle }: AIChatPanelWrapperProps) {
  const openPanel = useChatStore((s) => s.openPanel)

  return (
    <>
      <button
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-md ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Ask AI"
      >
        <MessageCircle className="size-4" />
        Ask AI
      </button>

      <AIChatPanel
        courseSlug={courseSlug}
        lessonTitle={lessonTitle}
        sectionTitle={sectionTitle}
      />
    </>
  )
}
