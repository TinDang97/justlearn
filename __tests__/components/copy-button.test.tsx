import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { CopyButton } from '@/components/copy-button'

const mockWriteText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  mockWriteText.mockReset()
  mockWriteText.mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  cleanup()
})

describe('CopyButton', () => {
  it('renders copy icon initially', () => {
    render(<CopyButton code="hello world" />)
    const button = screen.getByRole('button', { name: /copy/i })
    expect(button).toBeInTheDocument()
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
  })

  it('shows "Copied!" text after clicking', async () => {
    const user = userEvent.setup({ delay: null })
    render(<CopyButton code="console.log('hi')" />)

    const button = screen.getByRole('button', { name: /copy/i })
    await user.click(button)

    expect(screen.getByText('Copied!')).toBeInTheDocument()
    expect(mockWriteText).toHaveBeenCalledWith("console.log('hi')")
  })

  it('calls clipboard writeText with the provided code', async () => {
    const user = userEvent.setup({ delay: null })
    const code = 'print("hello")'
    render(<CopyButton code={code} />)

    await user.click(screen.getByRole('button'))

    expect(mockWriteText).toHaveBeenCalledWith(code)
    expect(mockWriteText).toHaveBeenCalledTimes(1)
  })

  it('"Copied!" text disappears after 2 seconds', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ delay: null })
    render(<CopyButton code="test" />)

    const button = screen.getByRole('button', { name: /copy/i })
    await user.click(button)

    expect(screen.getByText('Copied!')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(2100)
    })

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('button is visible on mobile (opacity-100 on small screens)', () => {
    const { container } = render(<CopyButton code="test" />)
    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.className).toMatch(/opacity-100/)
  })

  it('has aria-label for accessibility', () => {
    render(<CopyButton code="test" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })
})
