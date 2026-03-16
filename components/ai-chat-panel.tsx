'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, BotMessageSquare, Download, MonitorX, Send, Wifi, WifiOff } from 'lucide-react'
import { useChatStore } from '@/lib/store/chat'
import { useAIEngine } from '@/hooks/use-ai-engine'
import { useRAG } from '@/hooks/use-rag'
import { AIMessage } from '@/components/ai-message'
import { AIEngineProgress } from '@/components/ai-engine-progress'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AIPersona } from '@/lib/course-registry'

interface AIChatPanelProps {
  courseSlug: string
  lessonTitle: string
  sectionTitle: string
  persona: AIPersona
}

interface ChatInputBarProps {
  onSubmit: (text: string) => void
  disabled: boolean
}

function ChatInputBar({ onSubmit, disabled }: ChatInputBarProps) {
  const [value, setValue] = useState('')
  const isStreaming = useChatStore((s) => s.messages.some((m) => m.streaming))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled || isStreaming) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 border-t"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask a question..."
        maxLength={1000}
        disabled={disabled}
        className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim() || isStreaming}
        aria-label="Send"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <Send className="size-4" />
        <span className="sr-only">Send</span>
      </button>
    </form>
  )
}

export function AIChatPanel({ courseSlug, lessonTitle, sectionTitle, persona }: AIChatPanelProps) {
  const { getEngine, requestDownload, status, downloadProgress } = useAIEngine(persona.modelId)
  const { retrieveContext } = useRAG(courseSlug)
  const messages = useChatStore((s) => s.messages)
  const isOpen = useChatStore((s) => s.isOpen)
  const closePanel = useChatStore((s) => s.closePanel)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const setLessonContext = useChatStore((s) => s.setLessonContext)

  const scrollRef = useRef<HTMLDivElement>(null)

  // No auto-download — user must explicitly click "Download & Enable AI".
  // The hook starts in 'idle' status. Panel shows consent when idle + open.

  // Sync lesson context on mount and when props change
  useEffect(() => {
    setLessonContext({ title: lessonTitle, sectionTitle, courseSlug })
  }, [lessonTitle, sectionTitle, courseSlug, setLessonContext])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const last = scrollRef.current?.lastElementChild
    if (last && typeof last.scrollIntoView === 'function') {
      last.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  function handleSendMessage(text: string) {
    sendMessage(text, getEngine, retrieveContext, persona)
  }

  // Render always — controlled by Sheet's open prop, not conditional mounting.
  // This prevents engine re-initialization when the panel is toggled.
  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closePanel()}>
      <SheetContent
        side="right"
        className="w-[420px] sm:w-[480px] sm:max-w-[480px] flex flex-col p-0"
        style={{ backgroundColor: 'var(--background, var(--color-background, #FAFAF8))' }}
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <BotMessageSquare className="size-5" />
            Ask {persona.name}
          </SheetTitle>
        </SheetHeader>

        {status === 'loading' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="size-6 text-primary animate-pulse" />
              </div>
              <AIEngineProgress progress={downloadProgress} />
              <p className="text-xs text-center text-muted-foreground">
                First time only — model is cached for future visits.
              </p>
            </div>
          </div>
        )}

        {(status === 'idle' || status === 'awaiting-consent') && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-4 max-w-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Free AI Assistant</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {persona.name} runs entirely in your browser — no account, no API key, completely free and private.
                This requires a one-time download of ~2.2 GB (cached for future visits).
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Wifi className="size-3.5" />
                <span>WiFi connection recommended</span>
              </div>
              <button
                onClick={requestDownload}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Download className="size-4" />
                Download &amp; Enable AI
              </button>
              <p className="text-xs text-muted-foreground">
                Model weights are cached locally — you won&apos;t need to download again.
              </p>
            </div>
          </div>
        )}

        {status === 'no-wifi' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-4 max-w-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <WifiOff className="size-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg">WiFi Required</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI model is ~2.2 GB. Please connect to WiFi before downloading to avoid using mobile data.
              </p>
              <button
                onClick={requestDownload}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="mx-4 mt-2 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex-shrink-0"
          >
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load AI model</p>
              <p className="mt-1 text-destructive/80">
                The model could not be downloaded or initialized. Check your connection and try reopening the panel.
              </p>
            </div>
          </div>
        )}

        {status === 'unsupported' && (
          <div
            role="status"
            className="mx-4 mt-2 flex items-start gap-3 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground flex-shrink-0"
          >
            <MonitorX className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">WebGPU not supported</p>
              <p className="mt-1">
                Your browser does not support WebGPU, which is required for in-browser AI. Try Chrome 113+ or Edge 113+ on desktop.
              </p>
            </div>
          </div>
        )}

        {status !== 'idle' && status !== 'awaiting-consent' && status !== 'no-wifi' && status !== 'unsupported' && (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
            >
              {messages.map((message, index) => (
                <AIMessage
                  key={index}
                  message={message}
                  personaName={persona.name}
                />
              ))}
            </div>

            <ChatInputBar
              onSubmit={handleSendMessage}
              disabled={status === 'error'}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
