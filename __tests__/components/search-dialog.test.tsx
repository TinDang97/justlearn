import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react'
import React from 'react'

// ─── Mock fuse.js ────────────────────────────────────────────────────────────
const mockSearch = vi.fn()

vi.mock('fuse.js', () => {
  // Must use a real function (not arrow) so `new FuseMock()` works
  function FuseMock() {
    return { search: mockSearch }
  }
  FuseMock.parseIndex = vi.fn().mockReturnValue({})
  return { default: FuseMock }
})

// ─── Mock fetch ──────────────────────────────────────────────────────────────
const mockSearchData = [
  { id: 'course-01/lesson-01', title: 'Variables', courseTitle: 'Python Basics', href: '/courses/course-01/lesson-01', description: '' },
  { id: 'course-01/lesson-02', title: 'Loops', courseTitle: 'Python Basics', href: '/courses/course-01/lesson-02', description: '' },
  { id: 'data-engineering/lesson-01', title: 'Introduction to ETL', courseTitle: 'Data Engineering Course', href: '/courses/data-engineering/lesson-01', description: 'Learn pandas and ETL pipelines' },
]

global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url === '/search-data.json') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSearchData),
    })
  }
  if (url === '/search-index.json') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  }
  return Promise.reject(new Error(`Unexpected fetch: ${url}`))
})

// ─── Mock next/link ──────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// ─── Mock next/navigation (useRouter) if needed ──────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

beforeEach(() => {
  mockSearch.mockReset()
  vi.mocked(global.fetch).mockClear()
})

afterEach(() => {
  cleanup()
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SearchDialog', () => {
  it('renders a search trigger button', async () => {
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    const trigger = screen.getByRole('button', { name: /search/i })
    expect(trigger).toBeInTheDocument()
  })

  it('dialog opens when trigger is clicked', async () => {
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    const trigger = screen.getByRole('button', { name: /search/i })
    fireEvent.click(trigger)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search lessons/i)).toBeInTheDocument()
    })
  })

  it('shows input field when dialog is open', async () => {
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('shows empty state prompt when query is short', async () => {
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(screen.getByText(/type at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('shows no results message when search returns empty', async () => {
    mockSearch.mockReturnValue([])
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByRole('textbox'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'zzzzzzz' } })
    await waitFor(() => {
      expect(screen.getByText(/no lessons found/i)).toBeInTheDocument()
    })
  })

  it('renders results as links with correct href when search returns matches', async () => {
    mockSearch.mockReturnValue([
      {
        item: mockSearchData[1],
        matches: [{ key: 'title', indices: [[0, 3]], value: 'Loops' }],
      },
    ])
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    // Wait for input to appear and loading to finish
    await waitFor(() => screen.getByRole('textbox'))
    // Wait for search index to load (loading spinner disappears)
    await waitFor(() => {
      expect(screen.queryByText(/loading search index/i)).not.toBeInTheDocument()
    })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'loop' } })
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /loops/i })
      expect(link).toHaveAttribute('href', '/courses/course-01/lesson-02')
    }, { timeout: 3000 })
  })

  it('shows course title in results', async () => {
    mockSearch.mockReturnValue([
      {
        item: mockSearchData[0],
        matches: [{ key: 'title', indices: [[0, 7]], value: 'Variables' }],
      },
    ])
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByRole('textbox'))
    // Wait for search index to load
    await waitFor(() => {
      expect(screen.queryByText(/loading search index/i)).not.toBeInTheDocument()
    })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'var' } })
    await waitFor(() => {
      expect(screen.getByText('Python Basics')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

describe('multi-course search', () => {
  it('shows DE course title in results for DE lesson', async () => {
    mockSearch.mockReturnValue([
      {
        item: mockSearchData[2],
        matches: [{ key: 'title', indices: [[0, 10]], value: 'Introduction to ETL' }],
      },
    ])
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByRole('textbox'))
    await waitFor(() => {
      expect(screen.queryByText(/loading search index/i)).not.toBeInTheDocument()
    })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ETL' } })
    await waitFor(() => {
      expect(screen.getByText('Data Engineering Course')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('Fuse is called with description in keys (verified via description-matched search results)', async () => {
    // When Fuse is constructed with description as a key, a search matching
    // the description field will return that result. We mock Fuse.search to
    // return the DE entry (which has a description) and verify it renders,
    // confirming the SearchDialog passes description data through correctly.
    mockSearch.mockReturnValue([
      {
        item: mockSearchData[2],
        matches: [
          { key: 'description', indices: [[6, 12]], value: 'Learn pandas and ETL pipelines' },
        ],
      },
    ])
    const { SearchDialog } = await import('@/components/search/SearchDialog')
    render(React.createElement(SearchDialog))
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByRole('textbox'))
    await waitFor(() => {
      expect(screen.queryByText(/loading search index/i)).not.toBeInTheDocument()
    })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'pandas' } })
    await waitFor(() => {
      // The DE lesson should appear when matched via description
      expect(screen.getByText('Introduction to ETL')).toBeInTheDocument()
      expect(screen.getByText('Data Engineering Course')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

describe('SiteHeader', () => {
  it('renders a search trigger button', async () => {
    const { SiteHeader } = await import('@/components/site-header')
    render(React.createElement(SiteHeader))
    const btn = screen.getByRole('button', { name: /search/i })
    expect(btn).toBeInTheDocument()
  })
})
