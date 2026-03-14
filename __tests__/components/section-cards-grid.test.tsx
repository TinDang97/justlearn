import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Section } from '@/lib/content'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock useProgressStore
vi.mock('@/lib/store/progress', () => ({
  useProgressStore: vi.fn(),
}))

import { useProgressStore } from '@/lib/store/progress'
import { SectionCardsGrid } from '@/components/homepage/section-cards-grid'

const mockSections: Section[] = [
  {
    slug: '01-python-fundamentals',
    title: 'Python Fundamentals',
    order: 1,
    lessons: [
      { slug: 'lesson-01', courseSlug: 'python', sourceCourseSlug: '01-python-fundamentals', sectionSlug: '01-python-fundamentals', title: 'What is Python?', lessonNumber: 1, duration: '10 min', level: 'Beginner', prev: null, next: 'lesson-02' },
      { slug: 'lesson-02', courseSlug: 'python', sourceCourseSlug: '01-python-fundamentals', sectionSlug: '01-python-fundamentals', title: 'Installing Python', lessonNumber: 2, duration: '15 min', level: 'Beginner', prev: 'lesson-01', next: null },
    ],
  },
  {
    slug: '02-data-types-variables',
    title: 'Data Types & Variables',
    order: 2,
    lessons: [
      { slug: 'lesson-03', courseSlug: 'python', sourceCourseSlug: '02-data-types-variables', sectionSlug: '02-data-types-variables', title: 'Variables', lessonNumber: 1, duration: '12 min', level: 'Beginner', prev: null, next: 'lesson-04' },
    ],
  },
  {
    slug: '03-control-flow-logic',
    title: 'Control Flow & Logic',
    order: 3,
    lessons: [
      { slug: 'lesson-05', courseSlug: 'python', sourceCourseSlug: '03-control-flow-logic', sectionSlug: '03-control-flow-logic', title: 'If Statements', lessonNumber: 1, duration: '14 min', level: 'Beginner', prev: null, next: null },
    ],
  },
]

describe('SectionCardsGrid', () => {
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
    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    expect(screen.getByText('Python Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Data Types & Variables')).toBeInTheDocument()
    expect(screen.getByText('Control Flow & Logic')).toBeInTheDocument()
  })

  it('renders correct number of section cards', () => {
    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    // Each section has a card link - find by section-slug hrefs
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(mockSections.length)
  })

  it('renders section card links with correct hrefs containing section slugs', () => {
    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    expect(screen.getByRole('link', { name: /Python Fundamentals/i })).toHaveAttribute('href', '/courses/python#01-python-fundamentals')
    expect(screen.getByRole('link', { name: /Data Types/i })).toHaveAttribute('href', '/courses/python#02-data-types-variables')
  })

  it('renders lesson count for each section', () => {
    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    // Section 1 has 2 lessons
    expect(screen.getByText(/2 lessons/i)).toBeInTheDocument()
    // Section 2 and 3 have 1 lesson each
    const singleLessonTexts = screen.getAllByText(/1 lesson/i)
    expect(singleLessonTexts.length).toBeGreaterThanOrEqual(2)
  })

  it('renders zero-padded section numbers', () => {
    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('does not show progress bar when no lessons are completed', () => {
    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    const progressBars = screen.queryAllByRole('progressbar')
    expect(progressBars).toHaveLength(0)
  })

  it('shows progress bar when user has completed lessons in a section', () => {
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

    render(<SectionCardsGrid sections={mockSections} courseSlug="python" />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(1)
  })
})
