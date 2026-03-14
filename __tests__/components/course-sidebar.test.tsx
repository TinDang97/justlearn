import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourseSidebar } from '@/components/course-sidebar'
import type { LessonMeta } from '@/lib/content'

// Mock next/navigation usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

import { usePathname } from 'next/navigation'

const mockLessons: LessonMeta[] = [
  {
    slug: 'lesson-01',
    courseSlug: 'course-01',
    title: 'Introduction to Python',
    lessonNumber: 1,
    duration: '15 min',
    level: 'Beginner',
    prev: null,
    next: 'lesson-02',
  },
  {
    slug: 'lesson-02',
    courseSlug: 'course-01',
    title: 'Variables and Data Types',
    lessonNumber: 2,
    duration: '20 min',
    level: 'Beginner',
    prev: 'lesson-01',
    next: 'lesson-03',
  },
  {
    slug: 'lesson-03',
    courseSlug: 'course-01',
    title: 'Control Flow',
    lessonNumber: 3,
    duration: '25 min',
    level: 'Beginner',
    prev: 'lesson-02',
    next: null,
  },
]

describe('CourseSidebar', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/courses/course-01/lesson-01')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders correct number of lesson links', () => {
    render(
      <CourseSidebar courseSlug="course-01" lessons={mockLessons} />
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(mockLessons.length)
  })

  it('renders all lesson titles', () => {
    render(
      <CourseSidebar courseSlug="course-01" lessons={mockLessons} />
    )

    expect(screen.getByText('Introduction to Python')).toBeInTheDocument()
    expect(screen.getByText('Variables and Data Types')).toBeInTheDocument()
    expect(screen.getByText('Control Flow')).toBeInTheDocument()
  })

  it('highlights current lesson with font-medium class', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/course-01/lesson-02')

    render(
      <CourseSidebar courseSlug="course-01" lessons={mockLessons} />
    )

    const activeLink = screen.getByText('Variables and Data Types').closest('a')
    expect(activeLink).toHaveClass('font-medium')
  })

  it('does not highlight non-active lessons', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/course-01/lesson-02')

    render(
      <CourseSidebar courseSlug="course-01" lessons={mockLessons} />
    )

    const inactiveLink = screen.getByText('Introduction to Python').closest('a')
    expect(inactiveLink).not.toHaveClass('font-medium')
  })

  it('renders lesson numbers', () => {
    render(
      <CourseSidebar courseSlug="course-01" lessons={mockLessons} />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('generates correct hrefs for lesson links', () => {
    render(
      <CourseSidebar courseSlug="course-01" lessons={mockLessons} />
    )

    const firstLink = screen.getByText('Introduction to Python').closest('a')
    expect(firstLink).toHaveAttribute('href', '/courses/course-01/lesson-01')
  })
})
