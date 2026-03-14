import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('NotebookLMCard', () => {
  it('renders explanation text containing "NotebookLM"', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    render(React.createElement(NotebookLMCard, { courseSlug: '01-python-fundamentals' }))
    expect(screen.getByText(/NotebookLM/i)).toBeInTheDocument()
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
    expect(screen.getByText(/Google account/i)).toBeInTheDocument()
  })

  it('returns null (renders nothing) for an unknown courseSlug', async () => {
    const NotebookLMCard = await getNotebookLMCard()
    const { container } = render(
      React.createElement(NotebookLMCard, { courseSlug: 'unknown-course-slug-xyz' })
    )
    expect(container.firstChild).toBeNull()
  })
})
