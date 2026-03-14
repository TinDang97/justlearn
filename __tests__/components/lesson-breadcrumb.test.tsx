import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { LessonBreadcrumb } from '@/components/lesson-breadcrumb'

describe('LessonBreadcrumb', () => {
  afterEach(() => {
    cleanup()
  })

  const defaultProps = {
    courseSlug: 'python',
    courseTitle: 'Python Course',
    lessonTitle: 'Introduction to Python',
    sectionSlug: 'section-01',
    sectionTitle: 'Python Fundamentals',
  }

  it('renders three breadcrumb items (Python Course, Section, Lesson)', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    expect(screen.getByText('Python Course')).toBeInTheDocument()
    expect(screen.getByText('Python Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Introduction to Python')).toBeInTheDocument()
  })

  it('renders Python Course link pointing to /courses/python', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const courseLink = screen.getByText('Python Course').closest('a')
    expect(courseLink).toHaveAttribute('href', '/courses/python')
  })

  it('renders section link pointing to /courses/python#section-01', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const sectionLink = screen.getByText('Python Fundamentals').closest('a')
    expect(sectionLink).toHaveAttribute('href', '/courses/python#section-01')
  })

  it('renders current lesson title as non-link (BreadcrumbPage)', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const lessonPage = screen.getByText('Introduction to Python')
    // BreadcrumbPage renders as span with aria-current="page"
    expect(lessonPage.tagName).toBe('SPAN')
    expect(lessonPage).toHaveAttribute('aria-current', 'page')
  })

  it('renders breadcrumb navigation', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
  })

  it('uses correct section slug in the anchor link', () => {
    render(
      <LessonBreadcrumb
        courseSlug="python"
        courseTitle="Python Course"
        lessonTitle="Decorators"
        sectionSlug="advanced-python"
        sectionTitle="Advanced Python"
      />
    )

    const sectionLink = screen.getByText('Advanced Python').closest('a')
    expect(sectionLink).toHaveAttribute('href', '/courses/python#advanced-python')
  })
})
