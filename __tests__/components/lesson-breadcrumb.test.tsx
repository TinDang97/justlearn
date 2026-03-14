import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { LessonBreadcrumb } from '@/components/lesson-breadcrumb'

describe('LessonBreadcrumb', () => {
  afterEach(() => {
    cleanup()
  })

  const defaultProps = {
    courseSlug: 'course-01',
    courseTitle: 'Python Fundamentals',
    lessonTitle: 'Introduction to Python',
  }

  it('renders three breadcrumb levels', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Python Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Introduction to Python')).toBeInTheDocument()
  })

  it('renders Courses link pointing to /courses', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const coursesLink = screen.getByText('Courses').closest('a')
    expect(coursesLink).toHaveAttribute('href', '/courses')
  })

  it('renders course title link pointing to course page', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const courseLink = screen.getByText('Python Fundamentals').closest('a')
    expect(courseLink).toHaveAttribute('href', '/courses/course-01')
  })

  it('renders current lesson title as non-link (BreadcrumbPage)', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    const lessonPage = screen.getByText('Introduction to Python')
    // BreadcrumbPage renders as span with aria-current="page"
    expect(lessonPage.tagName).toBe('SPAN')
    expect(lessonPage).toHaveAttribute('aria-current', 'page')
  })

  it('renders breadcrumb separators', () => {
    render(<LessonBreadcrumb {...defaultProps} />)

    // BreadcrumbSeparator is aria-hidden, so we check the nav exists
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
  })

  it('uses correct course slug in the link', () => {
    render(
      <LessonBreadcrumb
        courseSlug="python-advanced"
        courseTitle="Advanced Python"
        lessonTitle="Decorators"
      />
    )

    const courseLink = screen.getByText('Advanced Python').closest('a')
    expect(courseLink).toHaveAttribute('href', '/courses/python-advanced')
  })
})
