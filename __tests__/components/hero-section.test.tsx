import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}))

import { HeroSection } from '@/components/homepage/hero-section'

describe('HeroSection', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders h1 "Learn Python from Zero to Confident"', () => {
    render(<HeroSection courseSlug="python" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn Python from Zero to Confident')
  })

  it('renders overline badge with "Free" text', () => {
    render(<HeroSection courseSlug="python" />)
    expect(screen.getByText(/Free/)).toBeInTheDocument()
  })

  it('renders primary CTA "Start the Course" linking to /courses/python', () => {
    render(<HeroSection courseSlug="python" />)
    const link = screen.getByText('Start the Course').closest('a')
    expect(link).toHaveAttribute('href', '/courses/python')
  })

  it('renders secondary outline CTA "Browse Lessons" linking to /courses/python', () => {
    render(<HeroSection courseSlug="python" />)
    const link = screen.getByText('Browse Lessons').closest('a')
    expect(link).toHaveAttribute('href', '/courses/python')
  })

  it('uses the provided courseSlug in CTA links', () => {
    render(<HeroSection courseSlug="javascript" />)
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/courses/javascript')
    })
  })
})
