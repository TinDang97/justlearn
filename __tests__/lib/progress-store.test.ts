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

// PersistStorage adapter that wraps localStorageMock with JSON serialization.
// Used in migration tests because ES module hoisting means the store captures
// JSDOM's localStorage at import time (before vi.stubGlobal runs). setOptions
// re-binds the store's storage to this adapter so migration tests work correctly.
const mockPersistStorage = {
  getItem: (name: string) => {
    const str = localStorageMock.getItem(name)
    if (str === null) return null
    try {
      return JSON.parse(str)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: unknown) => {
    localStorageMock.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string) => {
    localStorageMock.removeItem(name)
  },
}

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
    it('uses justlearn-progress as the storage key', () => {
      const persistOptions = useProgressStore.persist.getOptions()
      expect(persistOptions.name).toBe('justlearn-progress')
    })

    it('has skipHydration set to true', () => {
      const persistOptions = useProgressStore.persist.getOptions()
      expect(persistOptions.skipHydration).toBe(true)
    })

    it('has version set to 2', () => {
      const persistOptions = useProgressStore.persist.getOptions()
      expect(persistOptions.version).toBe(2)
    })
  })

  describe('course isolation', () => {
    it('markComplete for data-engineering does not affect python completedLessons', () => {
      useProgressStore.getState().markComplete('python', 'lesson-01')
      useProgressStore.getState().markComplete('data-engineering', 'lesson-01')

      const pythonLessons = useProgressStore.getState().completedLessons['python'] ?? []
      const deLessons = useProgressStore.getState().completedLessons['data-engineering'] ?? []

      // python should only have 1 entry — not duplicated by data-engineering mark
      expect(pythonLessons).toHaveLength(1)
      expect(pythonLessons).toContain('lesson-01')

      // data-engineering should only have its own entry
      expect(deLessons).toHaveLength(1)
      expect(deLessons).toContain('lesson-01')
    })

    it('getCourseProgress for data-engineering returns 0 when only python lessons are completed', () => {
      useProgressStore.getState().markComplete('python', 'lesson-01')
      useProgressStore.getState().markComplete('python', 'lesson-02')

      expect(useProgressStore.getState().getCourseProgress('data-engineering', 10)).toBe(0)
    })

    it('getCourseProgress for python is unaffected by data-engineering completions', () => {
      useProgressStore.getState().markComplete('python', 'lesson-01')
      useProgressStore.getState().markComplete('data-engineering', 'de-lesson-01')
      useProgressStore.getState().markComplete('data-engineering', 'de-lesson-02')

      expect(useProgressStore.getState().getCourseProgress('python', 10)).toBe(10)
    })
  })

  describe('migration v0 -> v2', () => {
    beforeEach(() => {
      // Re-bind the store's storage to use localStorageMock directly.
      // This is necessary because ES module imports are hoisted before vi.stubGlobal runs,
      // so the store's createJSONStorage factory captured JSDOM's localStorage at module init.
      // setOptions here re-wires the persist middleware to use our mock storage.
      useProgressStore.persist.setOptions({ storage: mockPersistStorage })
    })

    it('merges lessons from 3 old course keys into python key', async () => {
      const v0State = {
        state: {
          completedLessons: {
            '01-python-fundamentals': ['lesson-01-what-is-programming', 'lesson-02-installing-python-ide-setup'],
            '02-data-types-variables': ['lesson-01-integers-and-floats'],
            '03-control-flow-logic': [],
          },
        },
        version: 0,
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))

      await useProgressStore.persist.rehydrate()

      const state = useProgressStore.getState()
      expect(state.completedLessons['python']).toContain('lesson-01-what-is-programming')
      expect(state.completedLessons['python']).toContain('lesson-02-installing-python-ide-setup')
      expect(state.completedLessons['python']).toContain('lesson-01-integers-and-floats')
    })

    it('removes old course keys after migration', async () => {
      const v0State = {
        state: {
          completedLessons: {
            '01-python-fundamentals': ['lesson-01-what-is-programming'],
            '02-data-types-variables': ['lesson-01-integers-and-floats'],
          },
        },
        version: 0,
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))

      await useProgressStore.persist.rehydrate()

      const state = useProgressStore.getState()
      expect(state.completedLessons['01-python-fundamentals']).toBeUndefined()
      expect(state.completedLessons['02-data-types-variables']).toBeUndefined()
    })

    it('handles empty old state gracefully (no python key created)', async () => {
      const v0State = { state: { completedLessons: {} }, version: 0 }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))

      await useProgressStore.persist.rehydrate()

      const state = useProgressStore.getState()
      expect(state.completedLessons['python']).toBeUndefined()
    })

    it('deduplicates lesson slugs that appear in multiple old course keys', async () => {
      const v0State = {
        state: {
          completedLessons: {
            '01-python-fundamentals': ['lesson-01-dup'],
            '02-data-types-variables': ['lesson-01-dup'],
          },
        },
        version: 0,
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))

      await useProgressStore.persist.rehydrate()

      const pythonLessons = useProgressStore.getState().completedLessons['python'] ?? []
      expect(pythonLessons.filter((l) => l === 'lesson-01-dup')).toHaveLength(1)
    })

    it('handles a fresh student with no localStorage data without errors', async () => {
      // null simulates no localStorage entry
      localStorageMock.getItem.mockReturnValueOnce(null)

      await expect(useProgressStore.persist.rehydrate()).resolves.not.toThrow()

      const state = useProgressStore.getState()
      expect(state.completedLessons).toBeDefined()
    })
  })

  describe('migration v1 -> v2', () => {
    beforeEach(() => {
      useProgressStore.persist.setOptions({ storage: mockPersistStorage })
    })

    it('preserves existing completedLessons shape from v1 state', async () => {
      const v1State = {
        state: {
          completedLessons: {
            python: ['lesson-01-what-is-programming', 'lesson-02-installing-python-ide-setup'],
          },
        },
        version: 1,
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v1State))

      await useProgressStore.persist.rehydrate()

      const state = useProgressStore.getState()
      expect(state.completedLessons['python']).toContain('lesson-01-what-is-programming')
      expect(state.completedLessons['python']).toContain('lesson-02-installing-python-ide-setup')
    })

    it('preserves multi-course v1 state including non-python keys', async () => {
      const v1State = {
        state: {
          completedLessons: {
            python: ['lesson-01'],
            'data-engineering': ['de-lesson-01'],
          },
        },
        version: 1,
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v1State))

      await useProgressStore.persist.rehydrate()

      const state = useProgressStore.getState()
      expect(state.completedLessons['python']).toContain('lesson-01')
      expect(state.completedLessons['data-engineering']).toContain('de-lesson-01')
    })
  })
})
