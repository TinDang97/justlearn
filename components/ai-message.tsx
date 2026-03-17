'use client'

import { Streamdown } from 'streamdown'
import 'streamdown/styles.css'
import { useState, useEffect } from 'react'
import type { ChatMessage } from '@/lib/store/chat'
import { ChatCodeBlock } from '@/components/chat-code-block'
import { useShikiHighlighter } from '@/hooks/use-shiki-highlighter'

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

interface HighlightedCodeBlockProps {
  code: string
  language: string
}

/**
 * Renders a read-only syntax-highlighted code block for non-Python code in AI responses.
 * Uses shiki with dual themes matching the lesson code blocks.
 */
function HighlightedCodeBlock({ code, language }: HighlightedCodeBlockProps) {
  const { highlightCode } = useShikiHighlighter()
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    highlightCode(code, language).then((result) => {
      if (!cancelled) setHtml(result)
    })
    return () => { cancelled = true }
  }, [code, language, highlightCode])

  if (!html) {
    return (
      <pre className="not-prose font-mono text-[15px] leading-relaxed p-4 rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-bg)] overflow-x-auto m-0">
        <code className="text-[var(--color-foreground)]">{code}</code>
      </pre>
    )
  }

  return (
    <div
      className="not-prose shiki font-mono text-[15px] leading-relaxed [&_.shiki]:rounded-lg [&_.shiki]:border [&_.shiki]:border-[var(--color-code-border)] [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:m-0"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
  // After streaming: split on code fences and render code blocks with syntax highlighting.
  // Python code uses ChatCodeBlock (editable + runnable), other languages use HighlightedCodeBlock.
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
        {segments.map((seg, i) => {
          if (seg.type === 'code') {
            const isPython = seg.language === 'python' || seg.language === 'py' || seg.language === ''
            return isPython ? (
              <ChatCodeBlock key={i} code={seg.code} language={seg.language || 'python'} />
            ) : (
              <HighlightedCodeBlock key={i} code={seg.code} language={seg.language} />
            )
          }
          return (
            <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
              <Streamdown isAnimating={false} animated>
                {seg.content}
              </Streamdown>
            </div>
          )
        })}
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
