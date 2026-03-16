import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { WebGPUFallback } from '@/components/webgpu-fallback'

const TEST_URL = 'https://notebooklm.google.com/test'

afterEach(() => {
  cleanup()
})

describe('WebGPUFallback', () => {
  it('renders "In-browser AI not available" heading text', () => {
    render(React.createElement(WebGPUFallback, { notebookLmUrl: TEST_URL }))
    expect(screen.getByText('In-browser AI not available')).toBeInTheDocument()
  })

  it('renders an anchor linking to the provided notebookLmUrl', () => {
    render(React.createElement(WebGPUFallback, { notebookLmUrl: TEST_URL }))
    const link = screen.getByRole('link', { name: /NotebookLM/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', TEST_URL)
  })

  it('anchor has target="_blank" and rel="noopener noreferrer"', () => {
    render(React.createElement(WebGPUFallback, { notebookLmUrl: TEST_URL }))
    const link = screen.getByRole('link', { name: /NotebookLM/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('anchor text contains "NotebookLM"', () => {
    render(React.createElement(WebGPUFallback, { notebookLmUrl: TEST_URL }))
    const link = screen.getByRole('link', { name: /NotebookLM/i })
    expect(link.textContent).toContain('NotebookLM')
  })
})
