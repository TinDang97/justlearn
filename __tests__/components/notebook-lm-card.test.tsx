import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

// Mock next/link to render as a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// Import the component after mocks
async function getNotebookLMCard() {
  const mod = await import('@/components/notebook-lm/NotebookLMCard')
  return mod.NotebookLMCard
}

afterEach(() => {
  cleanup()
})

describe('NotebookLMCard', () => {
  it('renders explanation text containing "NotebookLM"', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    render(React.createElement(NotebookLMCard, { courseSlug: '01-python-fundamentals' }))
    // Use getAllByText to handle multiple matches (paragraph + link text)
    const elements = screen.getAllByText(/NotebookLM/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders an external link with correct href for a known courseSlug', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    render(React.createElement(NotebookLMCard, { courseSlug: '01-python-fundamentals' }))
    const link = screen.getByRole('link', { name: /open in notebooklm/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href')
    expect(link.getAttribute('href')).toContain('notebooklm.google.com')
  })

  it('renders "Google account" notice text', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    render(React.createElement(NotebookLMCard, { courseSlug: '01-python-fundamentals' }))
    // Use getAllByText in case text appears in multiple nodes
    const elements = screen.getAllByText(/Google account/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('returns null (renders nothing) for an unknown courseSlug', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    const { container } = render(
      React.createElement(NotebookLMCard, { courseSlug: 'unknown-course-slug-xyz' })
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null for a courseSlug with a PLACEHOLDER URL', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    const { container } = render(
      React.createElement(NotebookLMCard, { courseSlug: '02-data-types-variables' })
    )
    expect(container.firstChild).toBeNull()
  })

  it('isNotebookUrlValid rejects PLACEHOLDER and falsy URLs', async () => {
    const { isNotebookUrlValid } = await import('@/lib/notebook-urls')
    expect(isNotebookUrlValid(undefined)).toBe(false)
    expect(isNotebookUrlValid('')).toBe(false)
    expect(isNotebookUrlValid('https://notebooklm.google.com/notebook/PLACEHOLDER_foo')).toBe(false)
    expect(isNotebookUrlValid('https://notebooklm.google.com/notebook/abc-123')).toBe(true)
  })
})
