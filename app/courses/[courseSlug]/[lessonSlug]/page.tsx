import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllCourses, getCourse, getLesson } from '@/lib/content'
import { LessonBreadcrumb } from '@/components/lesson-breadcrumb'
import { LessonNav } from '@/components/lesson-nav'
import { LessonCompleteButton } from '@/components/lesson-complete-button'
import { CodeRunner } from '@/components/code-runner'
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
    <div className="max-w-[65ch] mx-auto px-4 py-8">
      <LessonBreadcrumb
        courseSlug={courseSlug}
        courseTitle={course.title}
        lessonTitle={lesson.title}
      />

      <div className="flex items-center gap-2 mt-4 mb-6">
        <Badge variant="secondary">{lesson.level}</Badge>
        <span className="text-sm text-muted-foreground">{lesson.duration}</span>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <LessonContent />
      </article>

      <section className="mt-10 mb-8">
        <h2 className="text-xl font-semibold mb-3">Try it yourself</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Write Python code below and click Run to execute it in your browser.
        </p>
        <CodeRunner initialCode={'# Write your Python code here\nprint("Hello, Python!")\n'} />
      </section>

      <div className="mt-8 mb-4">
        <LessonCompleteButton courseSlug={courseSlug} lessonSlug={lessonSlug} />
      </div>

      <LessonNav courseSlug={courseSlug} lesson={lesson} lessons={course.lessons} />
    </div>
  )
}
