'use client'

import { Streamdown } from 'streamdown'
import 'streamdown/styles.css'
import type { ChatMessage } from '@/lib/store/chat'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2" aria-label="AI is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}

interface AIMessageProps {
  message: ChatMessage
  personaName: string
}

export function AIMessage({ message, personaName }: AIMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex items-end justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%] text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  // Assistant message
  const isWaitingForResponse = message.streaming && message.content === ''

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{personaName}</span>
      {isWaitingForResponse ? (
        <TypingDots />
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Streamdown isAnimating={message.streaming} animated>
            {message.content}
          </Streamdown>
        </div>
      )}
      {!message.streaming && message.citations.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
          <span className="font-medium">Sources: </span>
          {message.citations.map((c, i) => (
            <span key={i}>
              {i > 0 && ', '}
              {c.lessonTitle} &gt; {c.heading}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
