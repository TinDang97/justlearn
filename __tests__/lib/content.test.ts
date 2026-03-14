import { describe, it, expect } from 'vitest'
import { getAllCourses, getCourse, getLesson } from '@/lib/content'

describe('getAllCourses', () => {
  it('returns exactly 12 Course objects', () => {
    const courses = getAllCourses()
    expect(courses).toHaveLength(12)
  })

  it('returns courses sorted by directory name', () => {
    const courses = getAllCourses()
    const slugs = courses.map(c => c.slug)
    const sorted = [...slugs].sort()
    expect(slugs).toEqual(sorted)
  })

  it('each course has required fields', () => {
    const courses = getAllCourses()
    for (const course of courses) {
      expect(course.slug).toBeTruthy()
      expect(course.title).toBeTruthy()
      expect(course.description).toBeTruthy()
      expect(course.level).toBeTruthy()
      expect(typeof course.lessonCount).toBe('number')
      expect(course.lessonCount).toBeGreaterThan(0)
      expect(Array.isArray(course.lessons)).toBe(true)
    }
  })

  it('each course title is parsed (not just the slug)', () => {
    const courses = getAllCourses()
    for (const course of courses) {
      // Title should not equal the slug — slugs start with digits like "01-python-fundamentals"
      expect(course.title).not.toMatch(/^\d{2}-/)
      // Title should not be empty
      expect(course.title.length).toBeGreaterThan(3)
    }
  })
})

describe('course 05 (data structures) has 12 lessons', () => {
  it('course 05 has exactly 12 lessons', () => {
    const courses = getAllCourses()
    const course05 = courses.find(c => c.slug.startsWith('05-'))
    expect(course05).toBeDefined()
    expect(course05!.lessonCount).toBe(12)
    expect(course05!.lessons).toHaveLength(12)
  })
})

describe('lesson metadata parsing', () => {
  it('each lesson has required fields', () => {
    const courses = getAllCourses()
    for (const course of courses) {
      for (const lesson of course.lessons) {
        expect(lesson.slug).toBeTruthy()
        expect(lesson.courseSlug).toBe(course.slug)
        expect(lesson.title).toBeTruthy()
        expect(typeof lesson.lessonNumber).toBe('number')
        expect(lesson.lessonNumber).toBeGreaterThan(0)
        expect(lesson.duration).toBeTruthy()
        expect(lesson.level).toBeTruthy()
      }
    }
  })

  it('extracts title from "# Lesson N: Title" pattern', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const firstLesson = firstCourse.lessons[0]
    // Title should be "What is Programming?" not "lesson-01-what-is-programming"
    expect(firstLesson.title).toBe('What is Programming?')
  })

  it('extracts duration from inline bold metadata', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const firstLesson = firstCourse.lessons[0]
    expect(firstLesson.duration).toBe('2 hours')
  })

  it('extracts level from inline bold metadata', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const firstLesson = firstCourse.lessons[0]
    expect(firstLesson.level).toBe('Absolute Beginner')
  })

  it('lessons are sorted by filename (lesson-01 before lesson-02)', () => {
    const courses = getAllCourses()
    for (const course of courses) {
      const numbers = course.lessons.map(l => l.lessonNumber)
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThan(numbers[i - 1])
      }
    }
  })
})

describe('prev/next navigation links', () => {
  it('first lesson has prev=null', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const firstLesson = firstCourse.lessons[0]
    expect(firstLesson.prev).toBeNull()
  })

  it('last lesson has next=null', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const lastLesson = firstCourse.lessons[firstCourse.lessons.length - 1]
    expect(lastLesson.next).toBeNull()
  })

  it('middle lessons have both prev and next', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    // Course 01 has 10 lessons, so lesson 5 (index 4) is middle
    const middleLesson = firstCourse.lessons[4]
    expect(middleLesson.prev).not.toBeNull()
    expect(middleLesson.next).not.toBeNull()
  })

  it('prev points to the correct previous lesson slug', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const secondLesson = firstCourse.lessons[1]
    expect(secondLesson.prev).toBe(firstCourse.lessons[0].slug)
  })

  it('next points to the correct next lesson slug', () => {
    const courses = getAllCourses()
    const firstCourse = courses[0]
    const firstLesson = firstCourse.lessons[0]
    expect(firstLesson.next).toBe(firstCourse.lessons[1].slug)
  })
})

describe('getCourse', () => {
  it('returns the correct course for a valid slug', () => {
    const course = getCourse('01-python-fundamentals')
    expect(course).toBeDefined()
    expect(course!.slug).toBe('01-python-fundamentals')
  })

  it('returns undefined for a non-existent slug', () => {
    const course = getCourse('99-does-not-exist')
    expect(course).toBeUndefined()
  })
})

describe('getLesson', () => {
  it('returns the correct lesson for valid course and lesson slugs', () => {
    const lesson = getLesson('01-python-fundamentals', 'lesson-01-what-is-programming')
    expect(lesson).toBeDefined()
    expect(lesson!.slug).toBe('lesson-01-what-is-programming')
    expect(lesson!.courseSlug).toBe('01-python-fundamentals')
  })

  it('returns undefined for non-existent lesson slug', () => {
    const lesson = getLesson('01-python-fundamentals', 'lesson-99-does-not-exist')
    expect(lesson).toBeUndefined()
  })

  it('returns undefined for non-existent course slug', () => {
    const lesson = getLesson('99-does-not-exist', 'lesson-01-something')
    expect(lesson).toBeUndefined()
  })
})
