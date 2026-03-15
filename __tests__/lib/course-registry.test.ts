import { describe, it, expect } from 'vitest'
import {
  getCourseData,
  getAllRegisteredCourses,
  COURSE_REGISTRY,
  type CourseRegistryEntry,
} from '@/lib/course-registry'

describe('COURSE_REGISTRY', () => {
  it('contains python entry', () => {
    expect(COURSE_REGISTRY['python']).toBeDefined()
    expect(COURSE_REGISTRY['python'].slug).toBe('python')
  })

  it('contains data-engineering entry', () => {
    expect(COURSE_REGISTRY['data-engineering']).toBeDefined()
    expect(COURSE_REGISTRY['data-engineering'].slug).toBe('data-engineering')
  })

  it('each entry has required CourseRegistryEntry fields', () => {
    for (const entry of Object.values(COURSE_REGISTRY)) {
      expect(typeof entry.slug).toBe('string')
      expect(entry.slug.length).toBeGreaterThan(0)
      expect(typeof entry.title).toBe('string')
      expect(entry.title.length).toBeGreaterThan(0)
      expect(typeof entry.description).toBe('string')
      expect(entry.description.length).toBeGreaterThan(0)
      expect(typeof entry.color).toBe('string')
      expect(entry.color.length).toBeGreaterThan(0)
      expect(typeof entry.contentDir).toBe('string')
      expect(entry.contentDir.length).toBeGreaterThan(0)
    }
  })
})

describe('getCourseData', () => {
  it("getCourseData('python') returns a UnifiedCourse with slug 'python'", () => {
    const course = getCourseData('python')
    expect(course.slug).toBe('python')
  })

  it("getCourseData('python') returns exactly 12 sections", () => {
    const course = getCourseData('python')
    expect(course.sections).toHaveLength(12)
  })

  it("getCourseData('python') returns 120+ lessons in allLessons", () => {
    const course = getCourseData('python')
    expect(course.allLessons.length).toBeGreaterThanOrEqual(120)
  })

  it("getCourseData('python') has a non-empty title", () => {
    const course = getCourseData('python')
    expect(course.title).toBeTruthy()
    expect(course.title.length).toBeGreaterThan(0)
  })

  it("getCourseData('data-engineering') returns slug 'data-engineering'", () => {
    const course = getCourseData('data-engineering')
    expect(course.slug).toBe('data-engineering')
  })

  it("getCourseData('data-engineering') does not throw", () => {
    expect(() => getCourseData('data-engineering')).not.toThrow()
  })

  it("getCourseData('data-engineering') returns a valid UnifiedCourse shape (sections and allLessons are arrays)", () => {
    const course = getCourseData('data-engineering')
    expect(Array.isArray(course.sections)).toBe(true)
    expect(Array.isArray(course.allLessons)).toBe(true)
  })

  it("getCourseData('data-engineering') returns DE course with 10 sections and 98 lessons", () => {
    const course = getCourseData('data-engineering')
    expect(course.sections).toHaveLength(10)
    expect(course.allLessons.length).toBe(98)
    expect(course.slug).toBe('data-engineering')
  })

  it("getCourseData('nonexistent') throws an error", () => {
    expect(() => getCourseData('nonexistent')).toThrow()
  })

  it("getCourseData('nonexistent') error message mentions the slug", () => {
    expect(() => getCourseData('nonexistent')).toThrow('nonexistent')
  })
})

describe('getAllRegisteredCourses', () => {
  it('returns exactly 2 entries', () => {
    const courses = getAllRegisteredCourses()
    expect(courses).toHaveLength(2)
  })

  it('returns entries sorted alphabetically by slug', () => {
    const courses = getAllRegisteredCourses()
    const slugs = courses.map((c) => c.slug)
    expect(slugs).toEqual(['data-engineering', 'python'])
  })

  it('returns CourseRegistryEntry objects (no buildCourse function)', () => {
    const courses = getAllRegisteredCourses()
    for (const entry of courses) {
      expect('buildCourse' in entry).toBe(false)
      // Type shape check
      const typed: CourseRegistryEntry = entry
      expect(typed.slug).toBeTruthy()
      expect(typed.title).toBeTruthy()
      expect(typed.description).toBeTruthy()
      expect(typed.color).toBeTruthy()
      expect(typed.contentDir).toBeTruthy()
    }
  })

  it('python entry has correct title', () => {
    const courses = getAllRegisteredCourses()
    const python = courses.find((c) => c.slug === 'python')
    expect(python).toBeDefined()
    expect(python!.title).toBe('Python Course')
  })

  it('data-engineering entry has correct title', () => {
    const courses = getAllRegisteredCourses()
    const de = courses.find((c) => c.slug === 'data-engineering')
    expect(de).toBeDefined()
    expect(de!.title).toBe('Data Engineering')
  })
})
