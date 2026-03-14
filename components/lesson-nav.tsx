import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LessonMeta } from '@/lib/content'

type LessonNavProps = {
  courseSlug: string
  lesson: LessonMeta
  lessons: LessonMeta[]
}

export function LessonNav({ courseSlug, lesson, lessons }: LessonNavProps) {
  const prevLesson = lesson.prev
    ? lessons.find((l) => l.slug === lesson.prev)
    : null
  const nextLesson = lesson.next
    ? lessons.find((l) => l.slug === lesson.next)
    : null

  return (
    <nav className="flex items-center justify-between mt-12 pt-6 border-t gap-4">
      <div className="flex-1">
        {prevLesson && (
          <Button variant="outline" asChild className="max-w-full">
            <Link href={`/courses/${courseSlug}/${prevLesson.slug}`}>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">{prevLesson.title}</span>
            </Link>
          </Button>
        )}
      </div>
      <div className="flex-1 flex justify-end">
        {nextLesson && (
          <Button variant="outline" asChild className="max-w-full">
            <Link href={`/courses/${courseSlug}/${nextLesson.slug}`}>
              <span className="truncate">{nextLesson.title}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
