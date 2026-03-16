import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import React from 'react'

// Mutable mock state for usePyodideWorker
const mockWorker = {
  run: vi.fn(),
  status: 'idle' as 'idle' | 'loading' | 'installing' | 'ready' | 'running',
}

vi.mock('@/hooks/use-pyodide-worker', () => ({
  usePyodideWorker: () => ({ run: mockWorker.run, status: mockWorker.status }),
}))

beforeEach(() => {
  mockWorker.status = 'idle'
  mockWorker.run.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('ChatCodeBlock', () => {
  it('renders code content in editable textarea', async () => {
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="print('hello')" language="python" />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe("print('hello')")
  })

  it('renders Run button', async () => {
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="x = 1" language="python" />)
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
  })

  it('Run button calls run(code) with the code prop', async () => {
    mockWorker.run.mockResolvedValue({ output: [], error: null })
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    const code = "print('hello')"
    render(<ChatCodeBlock code={code} language="python" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(mockWorker.run).toHaveBeenCalledWith(code, [])
  })

  it('displays stdout output after run completes', async () => {
    mockWorker.run.mockResolvedValue({
      output: [{ type: 'stdout', line: 'Hello, World!' }],
      error: null,
    })
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="print('Hello, World!')" language="python" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('displays error in red after run fails', async () => {
    mockWorker.run.mockResolvedValue({
      output: [],
      error: 'NameError: name x is not defined',
    })
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="print(x)" language="python" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    const errorEl = screen.getByText('NameError: name x is not defined')
    expect(errorEl).toBeInTheDocument()
    // Error should have red styling
    expect(errorEl.className).toMatch(/red/)
  })

  it('Run button disabled when status is running', async () => {
    mockWorker.status = 'running'
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="x = 1" language="python" />)

    const btn = screen.getByRole('button', { name: /run/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('shows loading text when Pyodide is loading', async () => {
    mockWorker.status = 'loading'
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="x = 1" language="python" />)

    expect(screen.getByText(/loading python/i)).toBeInTheDocument()
  })

  it('output area not visible before first run', async () => {
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="x = 1" language="python" />)

    // No output area or placeholder before any run
    expect(screen.queryByTestId('chat-code-output')).not.toBeInTheDocument()
  })

  it('runs updated code after user edits textarea', async () => {
    mockWorker.run.mockResolvedValue({ output: [], error: null })
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="x = 1" language="python" />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'x = 42' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(mockWorker.run).toHaveBeenCalledWith('x = 42', [])
  })

  it('displays stderr lines after run', async () => {
    mockWorker.run.mockResolvedValue({
      output: [{ type: 'stderr', line: 'Warning: deprecated' }],
      error: null,
    })
    const { ChatCodeBlock } = await import('@/components/chat-code-block')
    render(<ChatCodeBlock code="import warnings" language="python" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    const stderrEl = screen.getByText('Warning: deprecated')
    expect(stderrEl).toBeInTheDocument()
    expect(stderrEl.className).toMatch(/red/)
  })
})
