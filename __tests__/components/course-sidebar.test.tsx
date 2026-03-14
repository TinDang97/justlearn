import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourseSidebar } from '@/components/course-sidebar'
import type { Section } from '@/lib/content'

// Mock next/navigation usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// Mock useProgressStore
vi.mock('@/lib/store/progress', () => ({
  useProgressStore: vi.fn(),
}))

import { usePathname } from 'next/navigation'
import { useProgressStore } from '@/lib/store/progress'

const mockSections: Section[] = [
  {
    slug: 'section-01',
    title: 'Python Fundamentals',
    order: 1,
    lessons: [
      {
        slug: 'lesson-01',
        courseSlug: 'python',
        sourceCourseSlug: 'section-01',
        sectionSlug: 'section-01',
        title: 'Introduction to Python',
        lessonNumber: 1,
        duration: '15 min',
        level: 'Beginner',
        prev: null,
        next: 'lesson-02',
      },
      {
        slug: 'lesson-02',
        courseSlug: 'python',
        sourceCourseSlug: 'section-01',
        sectionSlug: 'section-01',
        title: 'Variables and Data Types',
        lessonNumber: 2,
        duration: '20 min',
        level: 'Beginner',
        prev: 'lesson-01',
        next: 'lesson-03',
      },
    ],
  },
  {
    slug: 'section-02',
    title: 'Control Flow',
    order: 2,
    lessons: [
      {
        slug: 'lesson-03',
        courseSlug: 'python',
        sourceCourseSlug: 'section-02',
        sectionSlug: 'section-02',
        title: 'If Statements',
        lessonNumber: 3,
        duration: '25 min',
        level: 'Beginner',
        prev: 'lesson-02',
        next: 'lesson-04',
      },
    ],
  },
  {
    slug: 'section-03',
    title: 'Functions',
    order: 3,
    lessons: [
      {
        slug: 'lesson-04',
        courseSlug: 'python',
        sourceCourseSlug: 'section-03',
        sectionSlug: 'section-03',
        title: 'Defining Functions',
        lessonNumber: 4,
        duration: '30 min',
        level: 'Beginner',
        prev: 'lesson-03',
        next: null,
      },
    ],
  },
]

describe('CourseSidebar (section-grouped)', () => {
  beforeEach(() => {
    vi.mocked(useProgressStore).mockImplementation((selector) => {
      const mockState = {
        isComplete: vi.fn().mockReturnValue(false),
        completedLessons: {},
        markComplete: vi.fn(),
        markIncomplete: vi.fn(),
        getCourseProgress: vi.fn().mockReturnValue(0),
      }
      if (typeof selector === 'function') {
        return selector(mockState)
      }
      return mockState
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders section headers for each section', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python/lesson-01')

    render(
      <CourseSidebar courseSlug="python" sections={mockSections} />
    )

    expect(screen.getByText('Python Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Control Flow')).toBeInTheDocument()
    expect(screen.getByText('Functions')).toBeInTheDocument()
  })

  it('section containing active lesson is expanded (lesson links visible)', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python/lesson-01')

    render(
      <CourseSidebar courseSlug="python" sections={mockSections} />
    )

    // lesson-01 is in section-01 (Python Fundamentals) — its lessons should be visible
    expect(screen.getByText('Introduction to Python')).toBeVisible()
    expect(screen.getByText('Variables and Data Types')).toBeVisible()
  })

  it('sections not containing active lesson start collapsed', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python/lesson-01')

    render(
      <CourseSidebar courseSlug="python" sections={mockSections} />
    )

    // section-02 and section-03 lessons should not be visible
    const ifStatements = screen.queryByText('If Statements')
    const defFunctions = screen.queryByText('Defining Functions')

    // They exist in DOM but should be hidden (Collapsible hides content)
    if (ifStatements) {
      expect(ifStatements).not.toBeVisible()
    } else {
      // Not rendered at all is also acceptable
      expect(ifStatements).toBeNull()
    }
    if (defFunctions) {
      expect(defFunctions).not.toBeVisible()
    } else {
      expect(defFunctions).toBeNull()
    }
  })

  it('generates correct hrefs for lesson links in expanded section', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python/lesson-01')

    render(
      <CourseSidebar courseSlug="python" sections={mockSections} />
    )

    const firstLessonLink = screen.getByText('Introduction to Python').closest('a')
    expect(firstLessonLink).toHaveAttribute('href', '/courses/python/lesson-01')
  })

  it('renders CheckCircle2 (Completed) icon for completed lesson', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python/lesson-01')
    vi.mocked(useProgressStore).mockImplementation((selector) => {
      const mockState = {
        isComplete: vi.fn((courseSlug: string, lessonSlug: string) => {
          return courseSlug === 'python' && lessonSlug === 'lesson-01'
        }),
        completedLessons: {},
        markComplete: vi.fn(),
        markIncomplete: vi.fn(),
        getCourseProgress: vi.fn().mockReturnValue(0),
      }
      if (typeof selector === 'function') {
        return selector(mockState)
      }
      return mockState
    })

    render(
      <CourseSidebar courseSlug="python" sections={mockSections} />
    )

    // Only lesson-01 is complete and section-01 is open — should show 1 Completed icon
    const completedIcons = screen.getAllByLabelText('Completed')
    expect(completedIcons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders lesson numbers in expanded section', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python/lesson-01')

    render(
      <CourseSidebar courseSlug="python" sections={mockSections} />
    )

    // Lessons 1 and 2 are in the expanded section-01
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
