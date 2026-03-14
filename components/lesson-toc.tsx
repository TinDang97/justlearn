'use client'

import { useEffect, useRef, useState } from 'react'
import type { Heading } from '@/lib/content'

function useActiveHeading(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (ids.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )

    const observer = observerRef.current
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [ids])

  return activeId
}

type Props = {
  headings: Heading[]
}

export function LessonToc({ headings }: Props) {
  const ids = headings.map((h) => h.id)
  const activeId = useActiveHeading(ids)

  const linkList = (
    <ul className="space-y-1">
      {headings.map((heading) => {
        const isActive = heading.id === activeId
        return (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? '0.75rem' : undefined }}
          >
            <a
              href={`#${heading.id}`}
              aria-current={isActive ? 'true' : undefined}
              className={[
                'block text-sm leading-snug transition-colors',
                isActive
                  ? 'font-medium text-[var(--color-foreground)]'
                  : 'text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]',
              ].join(' ')}
            >
              {heading.text}
            </a>
          </li>
        )
      })}
    </ul>
  )

  const currentHeadingText =
    headings.find((h) => h.id === activeId)?.text ?? 'Table of contents'

  return (
    <nav role="navigation" aria-label="Table of contents">
      {/* Desktop: visible at xl+ via parent aside */}
      <div className="hidden xl:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-subtle)]">
          On this page
        </p>
        {linkList}
      </div>

      {/* Mobile: collapsible details/summary */}
      <details className="xl:hidden border border-[var(--color-border)] rounded-md">
        <summary className="flex h-11 cursor-pointer items-center px-3 text-sm font-medium text-[var(--color-foreground)]">
          {currentHeadingText}
        </summary>
        <div className="border-t border-[var(--color-border)] px-3 py-3">
          {linkList}
        </div>
      </details>
    </nav>
  )
}
