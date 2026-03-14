import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCourses, getCourse } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export const dynamicParams = false

export async function generateStaticParams() {
  const courses = getAllCourses()
  return courses.map((course) => ({ courseSlug: course.slug }))
}

type Props = {
  params: Promise<{ courseSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params
  const course = getCourse(courseSlug)
  if (!course) return {}
  return {
    title: `${course.title} — Python Beginner Courses`,
    description: course.description,
  }
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params
  const course = getCourse(courseSlug)

  if (!course) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-2">
        <Link href="/courses" className="text-sm text-muted-foreground hover:underline">
          ← All Courses
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge variant="secondary">{course.level}</Badge>
        <span className="text-sm text-muted-foreground">{course.lessonCount} lessons</span>
      </div>

      <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
      <p className="text-muted-foreground mb-8">{course.description}</p>

      <h2 className="text-xl font-semibold mb-4">Lessons</h2>
      <ol className="space-y-3">
        {course.lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={`/courses/${courseSlug}/${lesson.slug}`}
              className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <span className="text-sm font-mono text-muted-foreground w-6 shrink-0 pt-0.5">
                {lesson.lessonNumber.toString().padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium group-hover:underline">{lesson.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  <Badge variant="outline" className="text-xs">
                    {lesson.level}
                  </Badge>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  )
}
