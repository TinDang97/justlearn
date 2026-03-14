'use client'

import { useShallow } from 'zustand/shallow'
import { useProgressStore } from '@/lib/store/progress'

type CourseProgressBarProps = {
  courseSlug: string
  totalLessons: number
}

export function CourseProgressBar({ courseSlug, totalLessons }: CourseProgressBarProps) {
  // useShallow prevents re-render loops when selecting the array (Pitfall 6)
  const completedCount = useProgressStore(
    useShallow((s) => (s.completedLessons[courseSlug] ?? []).length)
  )
  const progress = useProgressStore((s) => s.getCourseProgress(courseSlug, totalLessons))

  // Clean look for new students: render nothing when 0% completed
  if (completedCount === 0) return null

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {completedCount}/{totalLessons} completed
      </p>
    </div>
  )
}
