import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock getUnifiedCourse from lib/content
vi.mock('@/lib/content', () => ({
  getUnifiedCourse: vi.fn(),
}))

// Mock useProgressStore
vi.mock('@/lib/store/progress', () => ({
  useProgressStore: vi.fn(),
}))

import { getUnifiedCourse } from '@/lib/content'
import { useProgressStore } from '@/lib/store/progress'
import type { Section, UnifiedCourse } from '@/lib/content'
import { CourseOverviewAccordion } from '@/components/course-overview-accordion'

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

describe('CourseOverviewAccordion', () => {
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

  it('renders all section titles', () => {
    render(
      <CourseOverviewAccordion sections={mockSections} courseSlug="python" />
    )

    expect(screen.getByText('Python Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Control Flow')).toBeInTheDocument()
    expect(screen.getByText('Functions')).toBeInTheDocument()
  })

  it('renders lesson count per section', () => {
    render(
      <CourseOverviewAccordion sections={mockSections} courseSlug="python" />
    )

    // Section 1 has 2 lessons, Section 2 has 1, Section 3 has 1
    expect(screen.getByText('2 lessons')).toBeInTheDocument()
    expect(screen.getAllByText('1 lesson')).toHaveLength(2)
  })

  it('expanding a section reveals lesson titles', () => {
    render(
      <CourseOverviewAccordion sections={mockSections} courseSlug="python" />
    )

    // First section should be expanded by default (first incomplete)
    expect(screen.getByText('Introduction to Python')).toBeInTheDocument()
    expect(screen.getByText('Variables and Data Types')).toBeInTheDocument()
  })

  it('lesson links have correct hrefs', () => {
    render(
      <CourseOverviewAccordion sections={mockSections} courseSlug="python" />
    )

    // First section is expanded — lesson links visible
    const firstLessonLink = screen.getByText('Introduction to Python').closest('a')
    expect(firstLessonLink).toHaveAttribute('href', '/courses/python/lesson-01')
  })

  it('shows section number in accordion trigger', () => {
    render(
      <CourseOverviewAccordion sections={mockSections} courseSlug="python" />
    )

    // Section numbers are zero-padded
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('shows progress text for each section', () => {
    render(
      <CourseOverviewAccordion sections={mockSections} courseSlug="python" />
    )

    // All incomplete: 0/2, 0/1, 0/1
    expect(screen.getByText('0/2')).toBeInTheDocument()
    expect(screen.getAllByText('0/1')).toHaveLength(2)
  })
})
