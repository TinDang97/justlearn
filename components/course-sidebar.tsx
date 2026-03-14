'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonMeta } from '@/lib/content'
import { useProgressStore } from '@/lib/store/progress'

type CourseSidebarProps = {
  courseSlug: string
  lessons: LessonMeta[]
}

export function CourseSidebar({ courseSlug, lessons }: CourseSidebarProps) {
  const pathname = usePathname()
  const isComplete = useProgressStore((s) => s.isComplete)

  return (
    <aside className="hidden lg:block w-72 border-r sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0">
      <nav className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
          Lessons
        </p>
        <ul className="space-y-1">
          {lessons.map((lesson) => {
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
                    <CheckCircle2 className="shrink-0 mt-0.5 text-green-500 dark:text-green-400" size={14} aria-label="Completed" />
                  ) : (
                    <Circle className="shrink-0 mt-0.5 text-muted-foreground" size={14} aria-label="Not started" />
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
      </nav>
    </aside>
  )
}
