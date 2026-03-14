import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCourseData, getAllRegisteredCourses } from '@/lib/content'
import { COURSE_REGISTRY } from '@/lib/course-registry'
import { CourseProgressBar } from '@/components/course-progress-bar'
import { NotebookLMCard } from '@/components/notebook-lm/NotebookLMCard'
import { CourseOverviewAccordion } from '@/components/course-overview-accordion'
import { PrerequisiteNotice } from '@/components/prerequisite-notice'

export const dynamicParams = false

export async function generateStaticParams() {
  return getAllRegisteredCourses().map((c) => ({ courseSlug: c.slug }))
}

type Props = {
  params: Promise<{ courseSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params
  try {
    const course = getCourseData(courseSlug)
    const entry = COURSE_REGISTRY[courseSlug]
    return {
      title: `${course.title} — JustLearn`,
      description: entry?.description ?? course.title,
    }
  } catch {
    return {}
  }
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params

  let course
  try {
    course = getCourseData(courseSlug)
  } catch {
    notFound()
  }

  const totalLessons = course.allLessons.length
  const entry = COURSE_REGISTRY[courseSlug]
  const description = entry?.description ?? course.title

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
      <p className="text-muted-foreground mb-4">
        {description}
      </p>
      {courseSlug === 'data-engineering' && <PrerequisiteNotice />}
      <CourseProgressBar courseSlug={courseSlug} totalLessons={totalLessons} />

      <div className="mt-6">
        <NotebookLMCard courseSlug={courseSlug} />
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-8">Course Sections</h2>
      <CourseOverviewAccordion sections={course.sections} courseSlug={courseSlug} />
    </main>
  )
}
