// lib/store/progress.ts
// Note: consumers selecting array slices should use useShallow from 'zustand/shallow'
// to prevent re-render loops (Zustand v5 removed custom equality from create).
// Example: const lessons = useProgressStore(useShallow(s => s.completedLessons[courseSlug]))
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ProgressState = {
  // courseSlug -> lessonSlug[]
  completedLessons: Record<string, string[]>
  markComplete: (courseSlug: string, lessonSlug: string) => void
  markIncomplete: (courseSlug: string, lessonSlug: string) => void
  isComplete: (courseSlug: string, lessonSlug: string) => boolean
  getCourseProgress: (courseSlug: string, totalLessons: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      markComplete: (courseSlug, lessonSlug) =>
        set((s) => {
          const existing = s.completedLessons[courseSlug] ?? []
          if (existing.includes(lessonSlug)) return s
          return {
            completedLessons: {
              ...s.completedLessons,
              [courseSlug]: [...existing, lessonSlug],
            },
          }
        }),
      markIncomplete: (courseSlug, lessonSlug) =>
        set((s) => ({
          completedLessons: {
            ...s.completedLessons,
            [courseSlug]: (s.completedLessons[courseSlug] ?? []).filter(
              (slug) => slug !== lessonSlug
            ),
          },
        })),
      isComplete: (courseSlug, lessonSlug) =>
        (get().completedLessons[courseSlug] ?? []).includes(lessonSlug),
      getCourseProgress: (courseSlug, totalLessons) => {
        if (totalLessons === 0) return 0
        const done = (get().completedLessons[courseSlug] ?? []).length
        return Math.round((done / totalLessons) * 100)
      },
    }),
    {
      name: 'python-course-progress',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // prevents SSR mismatch
    }
  )
)
