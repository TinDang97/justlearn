import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

// ─── Mock next/link ──────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

afterEach(() => {
  cleanup()
})

describe('CourseRecommendationBanner', () => {
  it('renders the heading text', async () => {
    const { CourseRecommendationBanner } = await import('@/components/course-recommendation-banner')
    render(React.createElement(CourseRecommendationBanner))
    expect(screen.getByText('Ready for the next step?')).toBeInTheDocument()
  })

  it('renders a link with href /courses/data-engineering', async () => {
    const { CourseRecommendationBanner } = await import('@/components/course-recommendation-banner')
    render(React.createElement(CourseRecommendationBanner))
    const link = screen.getByRole('link', { name: /explore data engineering/i })
    expect(link).toHaveAttribute('href', '/courses/data-engineering')
  })

  it('renders the body text describing the journey', async () => {
    const { CourseRecommendationBanner } = await import('@/components/course-recommendation-banner')
    render(React.createElement(CourseRecommendationBanner))
    expect(
      screen.getByText(/you've completed the python course/i)
    ).toBeInTheDocument()
  })

  it('dismiss button removes the banner from the DOM', async () => {
    const { CourseRecommendationBanner } = await import('@/components/course-recommendation-banner')
    render(React.createElement(CourseRecommendationBanner))
    const dismissButton = screen.getByRole('button', { name: /dismiss recommendation/i })
    fireEvent.click(dismissButton)
    expect(screen.queryByText('Ready for the next step?')).not.toBeInTheDocument()
  })

  it('does not render banner content when dismissed', async () => {
    const { CourseRecommendationBanner } = await import('@/components/course-recommendation-banner')
    render(React.createElement(CourseRecommendationBanner))
    const dismissButton = screen.getByRole('button', { name: /dismiss recommendation/i })
    fireEvent.click(dismissButton)
    expect(screen.queryByRole('link', { name: /explore data engineering/i })).not.toBeInTheDocument()
  })
})
