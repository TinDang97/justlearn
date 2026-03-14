import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

import { useProgressStore } from '@/lib/store/progress'

describe('useProgressStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useProgressStore.setState({ completedLessons: {} })
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('markComplete', () => {
    it('adds lessonSlug to completedLessons for the course', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      const state = useProgressStore.getState()
      expect(state.completedLessons['course-01']).toContain('lesson-01')
    })

    it('does not duplicate the entry when marking same lesson complete twice', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      const lessons = useProgressStore.getState().completedLessons['course-01']
      expect(lessons.filter((l) => l === 'lesson-01')).toHaveLength(1)
    })

    it('handles multiple lessons in the same course', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      useProgressStore.getState().markComplete('course-01', 'lesson-02')
      const lessons = useProgressStore.getState().completedLessons['course-01']
      expect(lessons).toContain('lesson-01')
      expect(lessons).toContain('lesson-02')
    })
  })

  describe('markIncomplete', () => {
    it('removes lessonSlug from completedLessons', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      useProgressStore.getState().markIncomplete('course-01', 'lesson-01')
      const lessons = useProgressStore.getState().completedLessons['course-01']
      expect(lessons).not.toContain('lesson-01')
    })

    it('is a no-op when lesson was never marked complete (no error)', () => {
      expect(() => {
        useProgressStore.getState().markIncomplete('course-01', 'non-existent-lesson')
      }).not.toThrow()
    })

    it('does not affect other lessons in the same course', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      useProgressStore.getState().markComplete('course-01', 'lesson-02')
      useProgressStore.getState().markIncomplete('course-01', 'lesson-01')
      const lessons = useProgressStore.getState().completedLessons['course-01']
      expect(lessons).not.toContain('lesson-01')
      expect(lessons).toContain('lesson-02')
    })
  })

  describe('isComplete', () => {
    it('returns true after markComplete', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      expect(useProgressStore.getState().isComplete('course-01', 'lesson-01')).toBe(true)
    })

    it('returns false after markIncomplete', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      useProgressStore.getState().markIncomplete('course-01', 'lesson-01')
      expect(useProgressStore.getState().isComplete('course-01', 'lesson-01')).toBe(false)
    })

    it('returns false for a never-marked lesson', () => {
      expect(useProgressStore.getState().isComplete('course-01', 'lesson-never-set')).toBe(false)
    })

    it('returns false for a course that has never been touched', () => {
      expect(useProgressStore.getState().isComplete('course-never-set', 'lesson-01')).toBe(false)
    })
  })

  describe('getCourseProgress', () => {
    it('returns 10 when 1 of 10 lessons is completed', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      expect(useProgressStore.getState().getCourseProgress('course-01', 10)).toBe(10)
    })

    it('returns 0 for a course with no completions', () => {
      expect(useProgressStore.getState().getCourseProgress('course-01', 10)).toBe(0)
    })

    it('returns 0 when totalLessons is 0 (division safety)', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      expect(useProgressStore.getState().getCourseProgress('course-01', 0)).toBe(0)
    })

    it('returns 100 when all lessons are completed', () => {
      useProgressStore.getState().markComplete('course-01', 'lesson-01')
      useProgressStore.getState().markComplete('course-01', 'lesson-02')
      expect(useProgressStore.getState().getCourseProgress('course-01', 2)).toBe(100)
    })

    it('returns 50 when 5 of 10 lessons are completed', () => {
      for (let i = 1; i <= 5; i++) {
        useProgressStore.getState().markComplete('course-01', `lesson-0${i}`)
      }
      expect(useProgressStore.getState().getCourseProgress('course-01', 10)).toBe(50)
    })
  })

  describe('persist configuration', () => {
    it('uses python-course-progress as the storage key', () => {
      const persistOptions = useProgressStore.persist.getOptions()
      expect(persistOptions.name).toBe('python-course-progress')
    })

    it('has skipHydration set to true', () => {
      const persistOptions = useProgressStore.persist.getOptions()
      expect(persistOptions.skipHydration).toBe(true)
    })
  })
})
