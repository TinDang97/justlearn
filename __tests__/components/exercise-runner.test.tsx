import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import React from 'react'

// Mock CodeMirror
vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) =>
    React.createElement('textarea', {
      'data-testid': 'mock-editor',
      defaultValue: value,
      readOnly: true,
    }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(function MotionDiv(
      props: React.HTMLAttributes<HTMLDivElement>,
      ref: React.Ref<HTMLDivElement>
    ) {
      const { children, ...rest } = props
      // Filter out motion-specific props
      const htmlProps: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(rest)) {
        if (!key.startsWith('while') && key !== 'transition') {
          htmlProps[key] = val
        }
      }
      return React.createElement('div', { ...htmlProps, ref }, children)
    }),
  },
}))

// Mutable mock state for usePyodideWorker
const mockWorker = {
  run: vi.fn(),
  status: 'idle' as 'idle' | 'loading' | 'ready' | 'running',
}

vi.mock('@/hooks/use-pyodide-worker', () => ({
  usePyodideWorker: () => ({ run: mockWorker.run, status: mockWorker.status }),
}))

const sampleExercises = [
  {
    id: 'ex1',
    title: 'Hello World',
    description: 'Print Hello, World!',
    starterCode: '# Your code here\n',
    expectedOutput: 'Hello, World!',
    hints: ['Use print()', 'Put text in quotes'],
  },
  {
    id: 'ex2',
    title: 'Addition',
    description: 'Print the sum of 2 + 3',
    starterCode: '# Calculate and print\n',
    expectedOutput: '5',
    hints: ['Use print(2 + 3)'],
  },
]

beforeEach(() => {
  mockWorker.status = 'idle'
  mockWorker.run.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('ExerciseRunner', () => {
  it('renders exercise tabs when multiple exercises exist', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    // Tab + description both show the title, so use getAllByText
    const helloElements = screen.getAllByText('Hello World')
    expect(helloElements.length).toBeGreaterThanOrEqual(1)
    // The second exercise title appears only in the tab
    expect(screen.getByText('Addition')).toBeInTheDocument()
  })

  it('displays exercise description', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.getByText('Print Hello, World!')).toBeInTheDocument()
  })

  it('shows expected output when defined', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('renders Run, Reset, and Hint buttons', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument()
  })

  it('shows hints when Hint button is clicked', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))

    const hintBtn = screen.getByRole('button', { name: /hint/i })
    fireEvent.click(hintBtn)

    expect(screen.getByText('Use print()')).toBeInTheDocument()
    expect(screen.getByText('Put text in quotes')).toBeInTheDocument()
  })

  it('shows "Correct!" when output matches expected', async () => {
    mockWorker.run.mockResolvedValue({
      output: [{ type: 'stdout', line: 'Hello, World!' }],
      error: null,
    })

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })

  it('shows "Not quite" when output does not match', async () => {
    mockWorker.run.mockResolvedValue({
      output: [{ type: 'stdout', line: 'Wrong output' }],
      error: null,
    })

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
  })

  it('shows progress bar with completion count', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.getByText('0/2 completed')).toBeInTheDocument()
  })

  it('updates progress when exercise is completed', async () => {
    mockWorker.run.mockResolvedValue({
      output: [{ type: 'stdout', line: 'Hello, World!' }],
      error: null,
    })

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(screen.getByText('1/2 completed')).toBeInTheDocument()
  })

  it('does not show tabs for single exercise', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, { exercises: [sampleExercises[0]] })
    )
    // Tab bar should not be rendered for single exercise
    expect(screen.queryByText('Addition')).not.toBeInTheDocument()
  })

  it('shows output placeholder initially', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.getByText(/output will appear here/i)).toBeInTheDocument()
  })

  it('shows loading indicator during Pyodide load', async () => {
    mockWorker.status = 'loading'
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.getByText(/loading python runtime/i)).toBeInTheDocument()
  })
})
