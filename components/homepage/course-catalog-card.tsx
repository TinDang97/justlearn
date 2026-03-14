'use client'
import Link from 'next/link'
import { useProgressStore } from '@/lib/store/progress'

type CourseCatalogCardProps = {
  slug: string
  title: string
  description: string
  color: string // Tailwind bg class e.g. 'bg-blue-500'
  totalLessons: number
}

export function CourseCatalogCard({
  slug,
  title,
  description,
  color,
  totalLessons,
}: CourseCatalogCardProps) {
  const getCourseProgress = useProgressStore((s) => s.getCourseProgress)
  const progressPercent = getCourseProgress(slug, totalLessons)
  const hasProgress = progressPercent > 0

  // Compute completed count from progress percentage
  const completedCount = hasProgress ? Math.round((progressPercent / 100) * totalLessons) : 0

  return (
    <Link
      href={`/courses/${slug}`}
      className="group block border rounded-xl p-6 hover:shadow-md hover:-translate-y-px transition-all duration-200 relative overflow-hidden"
      aria-label={title}
    >
      {/* Color accent top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${color} rounded-t-xl`} />

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 mt-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

      {/* Meta row */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{totalLessons} lessons</span>
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
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount}/{totalLessons} completed
          </p>
        </div>
      )}
    </Link>
  )
}
