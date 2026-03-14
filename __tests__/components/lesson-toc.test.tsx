import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import type { Heading } from '@/lib/content'

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
  constructor(_cb: IntersectionObserverCallback) {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

const sampleHeadings: Heading[] = [
  { id: 'intro', text: 'Introduction', level: 2 },
  { id: 'basics', text: 'Basics', level: 3 },
  { id: 'summary', text: 'Summary', level: 2 },
]

describe('LessonToc', () => {
  it('renders a nav with aria-label "Table of contents"', async () => {
    const { LessonToc } = await import('@/components/lesson-toc')
    render(<LessonToc headings={sampleHeadings} />)
    const nav = screen.getByRole('navigation', { name: /table of contents/i })
    expect(nav).toBeInTheDocument()
  })

  it('renders heading links with correct href', async () => {
    const { LessonToc } = await import('@/components/lesson-toc')
    render(<LessonToc headings={sampleHeadings} />)
    expect(screen.getAllByRole('link', { name: 'Introduction' })[0]).toHaveAttribute('href', '#intro')
    expect(screen.getAllByRole('link', { name: 'Basics' })[0]).toHaveAttribute('href', '#basics')
    expect(screen.getAllByRole('link', { name: 'Summary' })[0]).toHaveAttribute('href', '#summary')
  })

  it('renders "Table of contents" text for mobile bar', async () => {
    const { LessonToc } = await import('@/components/lesson-toc')
    render(<LessonToc headings={sampleHeadings} />)
    // The summary element in mobile details shows this text
    expect(screen.getByText('Table of contents')).toBeInTheDocument()
  })

  it('renders empty without crashing when headings array is empty', async () => {
    const { LessonToc } = await import('@/components/lesson-toc')
    render(<LessonToc headings={[]} />)
    const nav = screen.getByRole('navigation', { name: /table of contents/i })
    expect(nav).toBeInTheDocument()
  })
})
