'use client'
import Link from 'next/link'
import type { Section } from '@/lib/content'
import { useProgressStore } from '@/lib/store/progress'

type SectionCardsGridProps = {
  sections: Section[]
  courseSlug: string
}

function SectionCard({
  section,
  index,
  courseSlug,
}: {
  section: Section
  index: number
  courseSlug: string
}) {
  const isComplete = useProgressStore((s) => s.isComplete)
  const completedCount = section.lessons.filter((lesson) =>
    isComplete(courseSlug, lesson.slug)
  ).length
  const totalCount = section.lessons.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const hasProgress = completedCount > 0

  const sectionNumber = String(index + 1).padStart(2, '0')
  const href = `/courses/${courseSlug}#${section.slug}`

  return (
    <Link
      href={href}
      className="group block border rounded-xl p-6 hover:shadow-md hover:-translate-y-px transition-all duration-200"
      aria-label={section.title}
    >
      {/* Section number */}
      <div className="text-2xl font-mono text-muted-foreground mb-3">{sectionNumber}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{section.title}</h3>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-auto">
        <span className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'lesson' : 'lessons'}
        </span>
      </div>

      {/* Progress bar — only shown when user has started */}
      {hasProgress && (
        <div className="mt-4">
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1 w-full rounded-full bg-muted overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}

export function SectionCardsGrid({ sections, courseSlug }: SectionCardsGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">What you&apos;ll learn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <SectionCard
            key={section.slug}
            section={section}
            index={index}
            courseSlug={courseSlug}
          />
        ))}
      </div>
    </div>
  )
}
