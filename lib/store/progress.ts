// lib/store/progress.ts
// Note: consumers selecting array slices should use useShallow from 'zustand/shallow'
// to prevent re-render loops (Zustand v5 removed custom equality from create).
// Example: const lessons = useProgressStore(useShallow(s => s.completedLessons[courseSlug]))
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// The 12 old course directory slugs that are consolidated into a single 'python' key
const OLD_COURSE_SLUGS = [
  '01-python-fundamentals',
  '02-data-types-variables',
  '03-control-flow-logic',
  '04-functions-modules',
  '05-data-structures',
  '06-oop',
  '07-file-handling-exceptions',
  '08-working-with-libraries',
  '09-web-development-basics',
  '10-data-analysis-visualization',
  '11-automation-scripting',
  '12-capstone-best-practices',
]

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
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // v0: completedLessons keyed by 12 course dir slugs
          // v1: completedLessons keyed by 'python' only
          const old = (persistedState as { completedLessons?: Record<string, string[]> })
            ?.completedLessons ?? {}
          const merged = OLD_COURSE_SLUGS.flatMap((slug) => old[slug] ?? [])
          // De-duplicate in case any slug appears in multiple old keys (defensive)
          const unique = [...new Set(merged)]
          return {
            completedLessons: unique.length > 0 ? { python: unique } : {},
          }
        }
        return persistedState as ProgressState
      },
    }
  )
)
