import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach, vi } from 'vitest'
import React from 'react'

// Mock CodeRunner to avoid Pyodide/worker complexity in tests
vi.mock('@/components/code-runner', () => ({
  CodeRunner: ({ initialCode }: { initialCode?: string }) =>
    React.createElement('div', { 'data-testid': 'mock-code-runner', 'data-initial-code': initialCode }),
}))

afterEach(() => {
  cleanup()
})

describe('PracticeBlock', () => {
  async function renderPracticeBlock(props: Record<string, unknown> = {}) {
    const { PracticeBlock } = await import('@/components/practice-block')
    return render(
      React.createElement(PracticeBlock, {
        prompt: 'Write a function that adds two numbers',
        ...props,
      })
    )
  }

  it('renders header with "Try it yourself" text', async () => {
    await renderPracticeBlock()
    expect(screen.getByText('Try it yourself')).toBeInTheDocument()
  })

  it('renders prompt text', async () => {
    await renderPracticeBlock()
    expect(screen.getByText('Write a function that adds two numbers')).toBeInTheDocument()
  })

  it('renders CodeRunner with initialCode prop', async () => {
    await renderPracticeBlock({ initialCode: 'print("hello")' })
    const runner = screen.getByTestId('mock-code-runner')
    expect(runner).toBeInTheDocument()
    expect(runner).toHaveAttribute('data-initial-code', 'print("hello")')
  })

  it('renders CodeRunner with default initialCode when not provided', async () => {
    await renderPracticeBlock()
    const runner = screen.getByTestId('mock-code-runner')
    expect(runner).toBeInTheDocument()
    expect(runner).toHaveAttribute('data-initial-code', '# Write your code here\n')
  })

  it('does not render hint button when hint prop is omitted', async () => {
    await renderPracticeBlock()
    expect(screen.queryByRole('button', { name: /hint/i })).not.toBeInTheDocument()
  })

  it('does not render solution button when solution prop is omitted', async () => {
    await renderPracticeBlock()
    expect(screen.queryByRole('button', { name: /solution/i })).not.toBeInTheDocument()
  })

  it('renders hint button when hint prop is provided', async () => {
    await renderPracticeBlock({ hint: 'Use the + operator' })
    expect(screen.getByRole('button', { name: /show hint/i })).toBeInTheDocument()
  })

  it('toggles hint visibility on button click', async () => {
    const user = userEvent.setup()
    await renderPracticeBlock({ hint: 'Use the + operator' })

    // Hint content not visible initially
    expect(screen.queryByText('Use the + operator')).not.toBeInTheDocument()

    // Click to show hint
    await user.click(screen.getByRole('button', { name: /show hint/i }))
    expect(screen.getByText('Use the + operator')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide hint/i })).toBeInTheDocument()

    // Click to hide hint
    await user.click(screen.getByRole('button', { name: /hide hint/i }))
    expect(screen.queryByText('Use the + operator')).not.toBeInTheDocument()
  })

  it('renders solution button when solution prop is provided', async () => {
    await renderPracticeBlock({ solution: 'def add(a, b):\n    return a + b' })
    expect(screen.getByRole('button', { name: /show solution/i })).toBeInTheDocument()
  })

  it('toggles solution visibility on button click', async () => {
    const user = userEvent.setup()
    await renderPracticeBlock({ solution: 'def add(a, b):\n    return a + b' })

    // Solution content not visible initially
    expect(screen.queryByText(/def add/)).not.toBeInTheDocument()

    // Click to show solution
    await user.click(screen.getByRole('button', { name: /show solution/i }))
    expect(screen.getByText(/def add/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide solution/i })).toBeInTheDocument()

    // Click to hide solution
    await user.click(screen.getByRole('button', { name: /hide solution/i }))
    expect(screen.queryByText(/def add/)).not.toBeInTheDocument()
  })

  it('hint and solution can be open simultaneously', async () => {
    const user = userEvent.setup()
    await renderPracticeBlock({
      hint: 'Use the + operator',
      solution: 'def add(a, b):\n    return a + b',
    })

    await user.click(screen.getByRole('button', { name: /show hint/i }))
    await user.click(screen.getByRole('button', { name: /show solution/i }))

    expect(screen.getByText('Use the + operator')).toBeInTheDocument()
    expect(screen.getByText(/def add/)).toBeInTheDocument()
  })
})
