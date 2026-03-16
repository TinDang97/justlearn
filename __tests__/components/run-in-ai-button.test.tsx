import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'

const mockOpenPanelWithQuestion = vi.fn()

vi.mock('@/lib/store/chat', () => ({
  useChatStore: {
    getState: () => ({
      openPanelWithQuestion: mockOpenPanelWithQuestion,
    }),
  },
}))

beforeEach(() => {
  mockOpenPanelWithQuestion.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('RunInAIButton', () => {
  it('renders button with accessible label', async () => {
    const { RunInAIButton } = await import('@/components/run-in-ai-button')
    render(<RunInAIButton code="print('hello')" />)
    // Button should be findable by role
    const btn = screen.getByRole('button')
    expect(btn).toBeInTheDocument()
    // Should have "Run in AI" text or accessible label
    expect(btn.textContent?.toLowerCase() ?? btn.getAttribute('aria-label')?.toLowerCase()).toMatch(
      /run in ai/i
    )
  })

  it('clicking button calls openPanelWithQuestion with formatted prompt', async () => {
    const { RunInAIButton } = await import('@/components/run-in-ai-button')
    const code = 'print("hello")'
    render(<RunInAIButton code={code} />)

    fireEvent.click(screen.getByRole('button'))

    expect(mockOpenPanelWithQuestion).toHaveBeenCalledOnce()
  })

  it('prompt includes the code wrapped in python code fence', async () => {
    const { RunInAIButton } = await import('@/components/run-in-ai-button')
    const code = 'x = 42\nprint(x)'
    render(<RunInAIButton code={code} />)

    fireEvent.click(screen.getByRole('button'))

    const [prompt] = mockOpenPanelWithQuestion.mock.calls[0]
    expect(prompt).toContain('```python')
    expect(prompt).toContain(code)
    expect(prompt).toContain('```')
  })

  it('prompt asks to run the code', async () => {
    const { RunInAIButton } = await import('@/components/run-in-ai-button')
    render(<RunInAIButton code="x = 1" />)

    fireEvent.click(screen.getByRole('button'))

    const [prompt] = mockOpenPanelWithQuestion.mock.calls[0]
    expect(prompt.toLowerCase()).toMatch(/run|explain/)
  })
})
