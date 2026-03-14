import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/link to avoid router context requirement
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// Mock useScrolled hook
vi.mock('@/lib/hooks/use-scrolled', () => ({
  useScrolled: vi.fn(),
}))

// Mock SearchDialog
vi.mock('@/components/search/SearchDialog', () => ({
  SearchDialog: () => <div data-testid="search-dialog" />,
}))

// Mock ThemeToggle
vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}))

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}))

import { usePathname } from 'next/navigation'
import { useScrolled } from '@/lib/hooks/use-scrolled'
import { SiteHeader } from '@/components/site-header'
import { HeaderClient } from '@/components/header-client'

describe('SiteHeader', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/')
    vi.mocked(useScrolled).mockReturnValue(false)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders JustLearn wordmark', () => {
    render(<SiteHeader />)
    expect(screen.getByText('JustLearn')).toBeInTheDocument()
  })

  it('JustLearn links to / (homepage)', () => {
    render(<SiteHeader />)
    const link = screen.getByText('JustLearn').closest('a')
    expect(link).toHaveAttribute('href', '/')
  })
})

describe('HeaderClient', () => {
  beforeEach(() => {
    vi.mocked(useScrolled).mockReturnValue(false)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows "Start Learning" button when pathname is /', () => {
    vi.mocked(usePathname).mockReturnValue('/')
    render(<HeaderClient />)
    expect(screen.getByText('Start Learning')).toBeInTheDocument()
  })

  it('hides "Start Learning" button when pathname is /courses/python', () => {
    vi.mocked(usePathname).mockReturnValue('/courses/python')
    render(<HeaderClient />)
    expect(screen.queryByText('Start Learning')).not.toBeInTheDocument()
  })

  it('renders SearchDialog', () => {
    vi.mocked(usePathname).mockReturnValue('/')
    render(<HeaderClient />)
    expect(screen.getByTestId('search-dialog')).toBeInTheDocument()
  })

  it('renders ThemeToggle', () => {
    vi.mocked(usePathname).mockReturnValue('/')
    render(<HeaderClient />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})
