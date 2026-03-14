import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCourses, getCourse, getLesson } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export const dynamicParams = false

export async function generateStaticParams() {
  const courses = getAllCourses()
  return courses.flatMap((course) =>
    course.lessons.map((lesson) => ({
      courseSlug: course.slug,
      lessonSlug: lesson.slug,
    }))
  )
}

type Props = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params
  const lesson = getLesson(courseSlug, lessonSlug)
  const course = getCourse(courseSlug)
  if (!lesson || !course) return {}
  return {
    title: `${lesson.title} — ${course.title}`,
    description: `Lesson ${lesson.lessonNumber} of ${course.title}: ${lesson.title}. Duration: ${lesson.duration}. Level: ${lesson.level}.`,
  }
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonSlug } = await params
  const lesson = getLesson(courseSlug, lessonSlug)
  const course = getCourse(courseSlug)

  if (!lesson || !course) {
    notFound()
  }

  const { default: LessonContent } = await import(
    `@/courses/${courseSlug}/${lessonSlug}.md`
  )

  return (
    <main className="max-w-[65ch] mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/courses/${courseSlug}`} className="hover:underline">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">Lesson {lesson.lessonNumber}</span>
      </nav>

      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">{lesson.level}</Badge>
        <span className="text-sm text-muted-foreground">{lesson.duration}</span>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-[65ch]">
        <LessonContent />
      </article>

      <nav className="flex items-center justify-between mt-12 pt-6 border-t">
        <div>
          {lesson.prev && (
            <Link
              href={`/courses/${courseSlug}/${lesson.prev}`}
              className="text-sm hover:underline text-muted-foreground"
            >
              ← Previous lesson
            </Link>
          )}
        </div>
        <div>
          {lesson.next && (
            <Link
              href={`/courses/${courseSlug}/${lesson.next}`}
              className="text-sm hover:underline text-muted-foreground"
            >
              Next lesson →
            </Link>
          )}
        </div>
      </nav>
    </main>
  )
}
