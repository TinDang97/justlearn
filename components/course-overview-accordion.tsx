'use client'

import Link from 'next/link'
import { Accordion } from 'radix-ui'
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Section } from '@/lib/content'
import { useProgressStore } from '@/lib/store/progress'

type CourseOverviewAccordionProps = {
  sections: Section[]
  courseSlug: string
}

export function CourseOverviewAccordion({
  sections,
  courseSlug,
}: CourseOverviewAccordionProps) {
  const isComplete = useProgressStore((s) => s.isComplete)

  // Determine first incomplete section (default open)
  const firstIncompleteSection = sections.find((section) =>
    section.lessons.some((l) => !isComplete(courseSlug, l.slug))
  )
  const defaultValue = firstIncompleteSection?.slug ?? sections[0]?.slug

  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue={defaultValue}
      className="space-y-2"
    >
      {sections.map((section, idx) => {
        const completedCount = section.lessons.filter((l) =>
          isComplete(courseSlug, l.slug)
        ).length
        const totalCount = section.lessons.length
        const sectionComplete = completedCount === totalCount && totalCount > 0

        return (
          <Accordion.Item
            key={section.slug}
            value={section.slug}
            className="border rounded-lg overflow-hidden"
          >
            <Accordion.Trigger className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors group">
              <span className="shrink-0 text-sm font-mono text-muted-foreground w-8">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 font-medium text-sm">{section.title}</span>
              {sectionComplete ? (
                <CheckCircle2
                  className="shrink-0 text-green-500 dark:text-green-400"
                  size={16}
                  aria-label="Section complete"
                />
              ) : null}
              <span className="shrink-0 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {totalCount === 1 ? '1 lesson' : `${totalCount} lessons`}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground font-mono">
                {completedCount}/{totalCount}
              </span>
              <ChevronDown
                size={16}
                className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
              />
            </Accordion.Trigger>
            <Accordion.Content className="data-[state=open]:animate-none border-t">
              <ol className="p-3 space-y-1">
                {section.lessons.map((lesson) => {
                  const completed = isComplete(courseSlug, lesson.slug)
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/courses/${courseSlug}/${lesson.slug}`}
                        className={cn(
                          'flex items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                          'text-muted-foreground'
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
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {lesson.duration}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}
