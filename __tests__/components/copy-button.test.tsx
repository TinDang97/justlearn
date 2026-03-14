import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { CopyButton } from '@/components/copy-button'

afterEach(() => {
  cleanup()
})

describe('CopyButton', () => {
  it('renders copy icon initially', () => {
    render(<CopyButton code="hello world" onCopy={vi.fn().mockResolvedValue(undefined)} />)
    const button = screen.getByRole('button', { name: /copy/i })
    expect(button).toBeInTheDocument()
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
  })

  it('shows "Copied!" text after clicking', async () => {
    const mockCopy = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })
    render(<CopyButton code="console.log('hi')" onCopy={mockCopy} />)

    const button = screen.getByRole('button', { name: /copy/i })
    await user.click(button)

    expect(screen.getByText('Copied!')).toBeInTheDocument()
    expect(mockCopy).toHaveBeenCalledWith("console.log('hi')")
  })

  it('calls onCopy with the provided code', async () => {
    const mockCopy = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })
    const code = 'print("hello")'
    render(<CopyButton code={code} onCopy={mockCopy} />)

    await user.click(screen.getByRole('button'))

    expect(mockCopy).toHaveBeenCalledWith(code)
    expect(mockCopy).toHaveBeenCalledTimes(1)
  })

  it('"Copied!" text disappears after 2 seconds', async () => {
    const mockCopy = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })

    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(<CopyButton code="test" onCopy={mockCopy} />)

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /copy/i }))
    })

    expect(screen.getByText('Copied!')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(2100)
    })

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    vi.useRealTimers()
  }, 10000)

  it('button is visible on mobile (opacity-100 on small screens)', () => {
    const { container } = render(<CopyButton code="test" onCopy={vi.fn()} />)
    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.className).toMatch(/opacity-100/)
  })

  it('has aria-label for accessibility', () => {
    render(<CopyButton code="test" onCopy={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })
})
