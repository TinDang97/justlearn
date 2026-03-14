import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCourseData, getAllRegisteredCourses, extractHeadings } from '@/lib/content'
import { getMindmapData } from '@/lib/mindmap-data'
import { getExercises } from '@/lib/exercises'
import { LessonBreadcrumb } from '@/components/lesson-breadcrumb'
import { LessonNav } from '@/components/lesson-nav'
import { LessonCompleteButton } from '@/components/lesson-complete-button'
import { CodeRunner } from '@/components/code-runner'
import { MindmapSection } from '@/components/mindmap'
import { LessonToc } from '@/components/lesson-toc'
import { ScrollProgress } from '@/components/scroll-progress'
import { Badge } from '@/components/ui/badge'
import { CourseRecommendationBanner } from '@/components/course-recommendation-banner'

export const dynamicParams = false

export async function generateStaticParams() {
  const courses = getAllRegisteredCourses()
  return courses.flatMap((courseEntry) => {
    const course = getCourseData(courseEntry.slug)
    return course.allLessons.map((lesson) => ({
      courseSlug: courseEntry.slug,
      lessonSlug: lesson.slug,
    }))
  })
}

type Props = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params
  try {
    const course = getCourseData(courseSlug)
    const lesson = course.allLessons.find((l) => l.slug === lessonSlug)
    if (!lesson) return {}
    return {
      title: `${lesson.title} — JustLearn`,
      description: `Lesson ${lesson.lessonNumber}: ${lesson.title}. Duration: ${lesson.duration}. Level: ${lesson.level}.`,
    }
  } catch {
    return {}
  }
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonSlug } = await params

  let course
  try {
    course = getCourseData(courseSlug)
  } catch {
    notFound()
  }

  const lesson = course.allLessons.find((l) => l.slug === lessonSlug)

  if (!lesson) {
    notFound()
  }

  const { default: LessonContent } = await import(
    `@/courses/${lesson.sourceCourseSlug}/${lessonSlug}.md`
  )

  const rawMdPath = path.join(process.cwd(), 'courses', lesson.sourceCourseSlug, `${lessonSlug}.md`)
  const rawMd = fs.existsSync(rawMdPath) ? fs.readFileSync(rawMdPath, 'utf-8') : ''
  const headings = extractHeadings(rawMd)

  const mindmapData = getMindmapData(lesson.sourceCourseSlug, lessonSlug)
  const exerciseData = getExercises(lesson.sourceCourseSlug, lessonSlug)

  // Resolve the section for this lesson from the unified course
  const section = course.sections.find((s) =>
    s.lessons.some((l) => l.slug === lessonSlug)
  )

  // Resolve global prev/next for cross-section navigation
  const lessonIndex = course.allLessons.findIndex((l) => l.slug === lessonSlug)
  const globalLesson = {
    ...lesson,
    prev: lessonIndex > 0 ? course.allLessons[lessonIndex - 1].slug : null,
    next: lessonIndex < course.allLessons.length - 1 ? course.allLessons[lessonIndex + 1].slug : null,
  }

  return (
    <div className="px-4 py-8 xl:max-w-[calc(65ch+240px+2rem)] xl:mx-auto">
      <ScrollProgress />

      {/* Mobile ToC — compact bar above article */}
      {headings.length > 0 && (
        <div className="xl:hidden mb-4">
          <LessonToc headings={headings} />
        </div>
      )}

      <div className="xl:grid xl:grid-cols-[65ch_240px] xl:gap-8">
        {/* Main content column */}
        <div className="min-w-0">
          <LessonBreadcrumb
            courseSlug={courseSlug}
            courseTitle={course.title}
            lessonTitle={lesson.title}
            sectionSlug={section?.slug ?? ''}
            sectionTitle={section?.title ?? ''}
          />

          <div className="flex items-center gap-2 mt-4 mb-6">
            <Badge variant="secondary">{lesson.level}</Badge>
            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
          </div>

          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <LessonContent />
          </article>

          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Concept Map</h2>
            <MindmapSection data={mindmapData} />
          </section>

          <section className="mt-10 mb-8">
            <h2 className="text-xl font-semibold mb-3">
              {exerciseData ? 'Practice Exercises' : 'Try it yourself'}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {exerciseData
                ? 'Complete these exercises to practice what you learned. Run your code and check if the output matches.'
                : 'Write Python code below and click Run to execute it in your browser.'
              }
            </p>
            <CodeRunner
              initialCode={'# Write your Python code here\nprint("Hello, Python!")\n'}
              exercises={exerciseData?.exercises}
            />
          </section>

          <div className="mt-8 mb-4">
            <LessonCompleteButton courseSlug={courseSlug} lessonSlug={lessonSlug} />
          </div>

          <LessonNav courseSlug={courseSlug} lesson={globalLesson} lessons={course.allLessons} />

          {courseSlug === 'python' && globalLesson.next === null && (
            <div className="mt-6">
              <CourseRecommendationBanner />
            </div>
          )}
        </div>

        {/* Desktop ToC sidebar */}
        {headings.length > 0 && (
          <aside className="hidden xl:block">
            <div className="sticky top-20">
              <LessonToc headings={headings} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
