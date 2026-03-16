'use client'

import { Streamdown } from 'streamdown'
import 'streamdown/styles.css'
import type { ChatMessage } from '@/lib/store/chat'
import { ChatCodeBlock } from '@/components/chat-code-block'

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

// Regex to split assistant content on code fences (```lang\ncode\n```)
// Captures: full match, language (optional), code body
const CODE_FENCE_REGEX = /```(\w*)\n([\s\S]*?)```/g

type ContentSegment =
  | { type: 'text'; content: string }
  | { type: 'code'; language: string; code: string }

/**
 * Splits a markdown string into text and code fence segments.
 * Returns them in order so we can render text via Streamdown and
 * code blocks via ChatCodeBlock.
 */
function parseSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  let lastIndex = 0

  for (const match of content.matchAll(CODE_FENCE_REGEX)) {
    const matchStart = match.index ?? 0
    // Text before this code fence
    if (matchStart > lastIndex) {
      const text = content.slice(lastIndex, matchStart).trim()
      if (text) segments.push({ type: 'text', content: text })
    }
    const lang = match[1] || 'python'
    const code = match[2].trim()
    segments.push({ type: 'code', language: lang, code })
    lastIndex = matchStart + match[0].length
  }

  // Remaining text after last code fence
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim()
    if (text) segments.push({ type: 'text', content: text })
  }

  return segments
}

export function AIMessage({ message, personaName }: AIMessageProps) {
  if (message.role === 'user') {
    // Parse user message for code fences so code blocks render properly
    const hasCode = message.content.includes('```')
    const userSegments = hasCode ? parseSegments(message.content) : null

    return (
      <div className="flex items-end justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%] text-sm">
          {userSegments ? (
            <div className="flex flex-col gap-2">
              {userSegments.map((seg, i) =>
                seg.type === 'code' ? (
                  <pre key={i} className="bg-primary-foreground/10 rounded p-2 overflow-x-auto font-mono text-xs whitespace-pre">
                    <code>{seg.code}</code>
                  </pre>
                ) : (
                  <span key={i} className="whitespace-pre-wrap">{seg.content}</span>
                )
              )}
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>
      </div>
    )
  }

  // Assistant message
  const isWaitingForResponse = message.streaming && message.content === ''

  // During streaming: render normally via Streamdown so the streaming animation works.
  // After streaming: split on code fences and render Python blocks as ChatCodeBlock.
  const renderContent = () => {
    if (message.streaming) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Streamdown isAnimating={message.streaming} animated>
            {message.content}
          </Streamdown>
        </div>
      )
    }

    // Post-streaming: check if content has any code fences
    if (!message.content.includes('```')) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Streamdown isAnimating={false} animated>
            {message.content}
          </Streamdown>
        </div>
      )
    }

    const segments = parseSegments(message.content)
    return (
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) =>
          seg.type === 'code' ? (
            <ChatCodeBlock key={i} code={seg.code} language={seg.language} />
          ) : (
            <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
              <Streamdown isAnimating={false} animated>
                {seg.content}
              </Streamdown>
            </div>
          )
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{personaName}</span>
      {isWaitingForResponse ? <TypingDots /> : renderContent()}
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
