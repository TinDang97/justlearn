import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock getAllRegisteredCourses and getCourseData from lib/content
vi.mock('@/lib/content', () => ({
  getAllRegisteredCourses: vi.fn(() => [
    {
      slug: 'python',
      title: 'Python Course',
      description: 'Master Python programming from fundamentals to advanced topics.',
      color: 'bg-blue-500',
      contentDir: 'courses',
    },
    {
      slug: 'data-engineering',
      title: 'Data Engineering',
      description: 'Learn pandas, ETL pipelines, SQL, and real-world data workflows.',
      color: 'bg-emerald-500',
      contentDir: 'courses/data-engineering',
    },
  ]),
  getCourseData: vi.fn((slug: string) => ({
    slug,
    title: slug === 'python' ? 'Python Course' : 'Data Engineering',
    sections: [],
    allLessons: slug === 'python' ? Array(42).fill({ slug: 'lesson-01' }) : Array(10).fill({ slug: 'lesson-01' }),
  })),
}))

// Mock useProgressStore — default to 0 progress
const mockGetCourseProgress = vi.fn().mockReturnValue(0)

vi.mock('@/lib/store/progress', () => ({
  useProgressStore: vi.fn((selector: (s: { getCourseProgress: typeof mockGetCourseProgress }) => unknown) =>
    selector({ getCourseProgress: mockGetCourseProgress })
  ),
}))

import { CourseCatalog } from '@/components/homepage/course-catalog'
import { CourseCatalogCard } from '@/components/homepage/course-catalog-card'

describe('CourseCatalogCard', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  beforeEach(() => {
    mockGetCourseProgress.mockReturnValue(0)
  })

  it('renders the course title', () => {
    render(
      <CourseCatalogCard
        slug="python"
        title="Python Course"
        description="Master Python programming."
        color="bg-blue-500"
        totalLessons={42}
      />
    )
    expect(screen.getByText('Python Course')).toBeInTheDocument()
  })

  it('renders the course description', () => {
    render(
      <CourseCatalogCard
        slug="python"
        title="Python Course"
        description="Master Python programming."
        color="bg-blue-500"
        totalLessons={42}
      />
    )
    expect(screen.getByText('Master Python programming.')).toBeInTheDocument()
  })

  it('renders lesson count string', () => {
    render(
      <CourseCatalogCard
        slug="python"
        title="Python Course"
        description="Master Python programming."
        color="bg-blue-500"
        totalLessons={42}
      />
    )
    expect(screen.getByText('42 lessons')).toBeInTheDocument()
  })

  it('links to /courses/[slug]', () => {
    render(
      <CourseCatalogCard
        slug="python"
        title="Python Course"
        description="Master Python programming."
        color="bg-blue-500"
        totalLessons={42}
      />
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/courses/python')
  })

  it('does not show progress bar when completedCount is 0', () => {
    mockGetCourseProgress.mockReturnValue(0)
    render(
      <CourseCatalogCard
        slug="python"
        title="Python Course"
        description="Master Python programming."
        color="bg-blue-500"
        totalLessons={42}
      />
    )
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows progress bar when completedCount > 0', () => {
    mockGetCourseProgress.mockReturnValue(50)
    render(
      <CourseCatalogCard
        slug="python"
        title="Python Course"
        description="Master Python programming."
        color="bg-blue-500"
        totalLessons={42}
      />
    )
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})

describe('CourseCatalog', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  beforeEach(() => {
    mockGetCourseProgress.mockReturnValue(0)
  })

  it('renders one card per registered course', () => {
    render(<CourseCatalog />)
    // Both course titles should be present
    expect(screen.getByText('Python Course')).toBeInTheDocument()
    expect(screen.getByText('Data Engineering')).toBeInTheDocument()
  })

  it('renders cards that link to /courses/[slug] for each course', () => {
    render(<CourseCatalog />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/courses/python')
    expect(hrefs).toContain('/courses/data-engineering')
  })

  it('renders course descriptions', () => {
    render(<CourseCatalog />)
    expect(screen.getByText('Master Python programming from fundamentals to advanced topics.')).toBeInTheDocument()
    expect(screen.getByText('Learn pandas, ETL pipelines, SQL, and real-world data workflows.')).toBeInTheDocument()
  })

  it('renders "Available Courses" heading', () => {
    render(<CourseCatalog />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Available Courses')
  })
})
