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

  it('renders h1 "Learn Programming and Data Skills"', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn Programming and Data Skills')
  })

  it('renders overline badge with "Free" text', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Free/)).toBeInTheDocument()
  })

  it('renders overline badge mentioning "2 courses"', () => {
    render(<HeroSection />)
    expect(screen.getByText(/2 courses/)).toBeInTheDocument()
  })

  it('renders primary CTA "Browse Courses" linking to /courses', () => {
    render(<HeroSection />)
    const link = screen.getByText('Browse Courses').closest('a')
    expect(link).toHaveAttribute('href', '/courses')
  })

  it('renders secondary CTA "Start Python" linking to /courses/python', () => {
    render(<HeroSection />)
    const link = screen.getByText('Start Python').closest('a')
    expect(link).toHaveAttribute('href', '/courses/python')
  })

  it('renders no courseSlug-dependent hrefs (platform-scoped)', () => {
    render(<HeroSection />)
    const links = screen.getAllByRole('link')
    // All links should point to /courses or /courses/python — not dynamic
    links.forEach((link) => {
      const href = link.getAttribute('href')
      expect(href).toMatch(/^\/courses/)
    })
  })
})
