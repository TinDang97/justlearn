'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Circle, ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { Section } from '@/lib/content'
import { useProgressStore } from '@/lib/store/progress'

type CourseSidebarProps = {
  courseSlug: string
  sections: Section[]
}

export function CourseSidebar({ courseSlug, sections }: CourseSidebarProps) {
  const pathname = usePathname()
  const isComplete = useProgressStore((s) => s.isComplete)

  // Determine which section contains the active lesson
  const activeSectionSlug = sections.find((section) =>
    section.lessons.some(
      (lesson) => pathname === `/courses/${courseSlug}/${lesson.slug}`
    )
  )?.slug ?? null

  // Track open/closed state for each section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach((section) => {
      initial[section.slug] = section.slug === activeSectionSlug
    })
    return initial
  })

  const toggleSection = (slug: string) => {
    setOpenSections((prev) => ({ ...prev, [slug]: !prev[slug] }))
  }

  return (
    <aside className="hidden lg:block w-72 border-r sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0">
      <nav className="p-4">
        <div className="space-y-2">
          {sections.map((section) => {
            const isOpen = openSections[section.slug] ?? false

            return (
              <Collapsible.Root
                key={section.slug}
                open={isOpen}
                onOpenChange={() => toggleSection(section.slug)}
              >
                <Collapsible.Trigger className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-accent/50 rounded-md transition-colors group">
                  <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn(
                      'shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <ul className="space-y-0.5 mt-1">
                    {section.lessons.map((lesson) => {
                      const href = `/courses/${courseSlug}/${lesson.slug}`
                      const isActive = pathname === href
                      const completed = isComplete(courseSlug, lesson.slug)
                      return (
                        <li key={lesson.slug}>
                          <Link
                            href={href}
                            className={cn(
                              'flex items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                              isActive
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'text-muted-foreground'
                            )}
                          >
                            {completed ? (
                              <CheckCircle2
                                className="shrink-0 mt-0.5 text-green-500 dark:text-green-400"
                                size={14}
                                aria-label="Completed"
                              />
                            ) : (
                              <Circle
                                className="shrink-0 mt-0.5 text-muted-foreground"
                                size={14}
                                aria-label="Not started"
                              />
                            )}
                            <span className="shrink-0 w-5 text-xs text-muted-foreground mt-0.5">
                              {lesson.lessonNumber}
                            </span>
                            <span className="leading-snug">{lesson.title}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </Collapsible.Content>
              </Collapsible.Root>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
