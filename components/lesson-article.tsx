'use client'

import { useRef } from 'react'
import { TextSelectionAskAI } from '@/components/text-selection-ask-ai'

interface LessonArticleProps {
  children: React.ReactNode
}

export function LessonArticle({ children }: LessonArticleProps) {
  const articleRef = useRef<HTMLElement>(null)

  return (
    <>
      <article ref={articleRef} className="prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </article>
      <TextSelectionAskAI containerRef={articleRef} />
    </>
  )
}
