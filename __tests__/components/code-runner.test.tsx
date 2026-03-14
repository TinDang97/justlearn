import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

// Mock CodeMirror — it needs real DOM APIs not available in jsdom
vi.mock('@uiw/react-codemirror', () => ({
  default: () => React.createElement('textarea', { 'data-testid': 'mock-editor', readOnly: true }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

// Mutable mock state for usePyodideWorker
const mockWorker = {
  run: vi.fn(),
  status: 'idle' as 'idle' | 'loading' | 'installing' | 'ready' | 'running',
}

vi.mock('@/hooks/use-pyodide-worker', () => ({
  usePyodideWorker: () => ({ run: mockWorker.run, status: mockWorker.status }),
}))

// Mock next/dynamic — renders child synchronously
vi.mock('next/dynamic', () => ({
  default: (factory: () => Promise<{ default: React.ComponentType<unknown> }>, _opts?: unknown) => {
    // Return a lazy component that loads synchronously in test via useEffect
    return function DynamicComponent(props: Record<string, unknown>) {
      const [Comp, setComp] = React.useState<React.ComponentType<unknown> | null>(null)
      React.useEffect(() => {
        factory().then((mod) => setComp(() => mod.default))
      }, [])
      return Comp
        ? React.createElement(Comp, props)
        : React.createElement('div', { 'data-testid': 'code-runner-skeleton' })
    }
  },
}))

beforeEach(() => {
  mockWorker.status = 'idle'
  mockWorker.run.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('OutputPanel', () => {
  it('displays stdout lines', async () => {
    const { OutputPanel } = await import('@/components/code-runner/output-panel')
    render(
      React.createElement(OutputPanel, {
        output: [{ type: 'stdout', line: 'Hello, World!' }],
        error: null,
      })
    )
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('displays stderr lines with red text styling', async () => {
    const { OutputPanel } = await import('@/components/code-runner/output-panel')
    const { container } = render(
      React.createElement(OutputPanel, {
        output: [{ type: 'stderr', line: 'Error: something went wrong' }],
        error: null,
      })
    )
    expect(screen.getByText('Error: something went wrong')).toBeInTheDocument()
    // The stderr line should have a red class
    const stderrEl = container.querySelector('.text-red-500, .text-red-400')
    expect(stderrEl).not.toBeNull()
  })

  it('shows placeholder when output is empty and no error', async () => {
    const { OutputPanel } = await import('@/components/code-runner/output-panel')
    render(React.createElement(OutputPanel, { output: [], error: null }))
    expect(screen.getByText(/output will appear here/i)).toBeInTheDocument()
  })
})

describe('CodeRunnerClient', () => {
  it('renders editor', async () => {
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    render(React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' }))
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
  })

  it('renders Run button', async () => {
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    render(React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' }))
    // Use getAllByRole to handle multiple renders, pick the first
    const buttons = screen.getAllByRole('button', { name: /run/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders output panel area', async () => {
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    render(React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' }))
    const placeholders = screen.getAllByText(/output will appear here/i)
    expect(placeholders.length).toBeGreaterThan(0)
  })

  it('shows loading indicator when status is loading', async () => {
    mockWorker.status = 'loading'
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    render(React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' }))
    expect(screen.getByText(/loading python runtime/i)).toBeInTheDocument()
  })

  it('Run button is disabled when status is running', async () => {
    mockWorker.status = 'running'
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    render(React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' }))
    const buttons = screen.getAllByRole('button', { name: /run/i })
    // All Run buttons should be disabled
    expect(buttons[0]).toBeDisabled()
  })

  it('shows "Installing pandas..." when status is installing', async () => {
    mockWorker.status = 'installing'
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    render(React.createElement(CodeRunnerClient, { initialCode: 'import pandas as pd' }))
    expect(screen.getByText(/installing pandas/i)).toBeInTheDocument()
  })
})
