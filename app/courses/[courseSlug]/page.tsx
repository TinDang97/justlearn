import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUnifiedCourse } from '@/lib/content'
import { CourseProgressBar } from '@/components/course-progress-bar'
import { NotebookLMCard } from '@/components/notebook-lm/NotebookLMCard'
import { CourseOverviewAccordion } from '@/components/course-overview-accordion'

export const dynamicParams = false

export async function generateStaticParams() {
  return [{ courseSlug: 'python' }]
}

type Props = {
  params: Promise<{ courseSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params
  if (courseSlug !== 'python') return {}
  const course = getUnifiedCourse()
  return {
    title: `${course.title} — JustLearn`,
    description: 'Master Python programming from fundamentals to advanced topics.',
  }
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params

  if (courseSlug !== 'python') {
    notFound()
  }

  const course = getUnifiedCourse()
  const totalLessons = course.allLessons.length

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
      <p className="text-muted-foreground mb-4">
        Master Python programming from fundamentals to advanced topics.
      </p>
      <CourseProgressBar courseSlug="python" totalLessons={totalLessons} />

      <div className="mt-6">
        <NotebookLMCard courseSlug={courseSlug} />
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-8">Course Sections</h2>
      <CourseOverviewAccordion sections={course.sections} courseSlug="python" />
    </main>
  )
}
