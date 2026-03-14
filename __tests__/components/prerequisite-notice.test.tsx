import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

// ─── Mock next/link ──────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

afterEach(() => {
  cleanup()
})

describe('PrerequisiteNotice', () => {
  it('renders the prerequisite heading', async () => {
    const { PrerequisiteNotice } = await import('@/components/prerequisite-notice')
    render(React.createElement(PrerequisiteNotice))
    expect(screen.getByText('Prerequisite: Python Course')).toBeInTheDocument()
  })

  it('renders the recommended body text', async () => {
    const { PrerequisiteNotice } = await import('@/components/prerequisite-notice')
    render(React.createElement(PrerequisiteNotice))
    expect(
      screen.getByText(/recommend completing the python course first/i)
    ).toBeInTheDocument()
  })

  it('renders a link with href /courses/python', async () => {
    const { PrerequisiteNotice } = await import('@/components/prerequisite-notice')
    render(React.createElement(PrerequisiteNotice))
    const link = screen.getByRole('link', { name: /start python course/i })
    expect(link).toHaveAttribute('href', '/courses/python')
  })
})
