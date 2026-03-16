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

// Mocks for AI integration
const mockSendHint = vi.fn()
const mockOpenPanel = vi.fn()

vi.mock('@/lib/store/chat', () => ({
  useChatStore: () => ({
    sendHint: mockSendHint,
    openPanel: mockOpenPanel,
  }),
}))

const mockGetEngine = vi.fn()
const mockEngineStatus = { value: 'ready' as string }

vi.mock('@/hooks/use-ai-engine', () => ({
  useAIEngine: () => ({
    getEngine: mockGetEngine,
    status: mockEngineStatus.value,
    downloadProgress: null,
  }),
}))

const mockRetrieveContext = vi.fn()

vi.mock('@/hooks/use-rag', () => ({
  useRAG: () => ({
    retrieveContext: mockRetrieveContext,
    buildIndex: vi.fn(),
    status: 'ready',
  }),
}))

vi.mock('@/lib/course-registry', () => ({
  COURSE_REGISTRY: {
    'test-course': {
      slug: 'test-course',
      aiPersona: {
        name: 'TestBot',
        modelId: 'test-model',
        systemPrompt: 'You are a test bot.',
      },
    },
  },
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
  mockSendHint.mockReset()
  mockOpenPanel.mockReset()
  mockGetEngine.mockReset()
  mockRetrieveContext.mockReset()
  mockEngineStatus.value = 'ready'
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

    const hintBtn = screen.getByRole('button', { name: /^hint$/i })
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

describe('ExerciseRunner AI hint integration', () => {
  it('renders AIHintButton when courseSlug is provided', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, {
        exercises: sampleExercises,
        courseSlug: 'test-course',
        sectionTitle: 'Basics',
      })
    )
    expect(screen.getByRole('button', { name: /ai hint/i })).toBeInTheDocument()
  })

  it('does NOT render AIHintButton when courseSlug is not provided', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))
    expect(screen.queryByRole('button', { name: /ai hint/i })).not.toBeInTheDocument()
  })

  it('clicking AIHintButton calls openPanel and sendHint with null error (Socratic)', async () => {
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, {
        exercises: sampleExercises,
        courseSlug: 'test-course',
        sectionTitle: 'Basics',
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /ai hint/i }))

    expect(mockOpenPanel).toHaveBeenCalledOnce()
    expect(mockSendHint).toHaveBeenCalledOnce()
    // Second arg is error — should be null for Socratic hint
    const [, error] = mockSendHint.mock.calls[0]
    expect(error).toBeNull()
  })

  it('AIHintButton is disabled when engine status is not ready', async () => {
    mockEngineStatus.value = 'loading'
    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, {
        exercises: sampleExercises,
        courseSlug: 'test-course',
      })
    )
    expect(screen.getByRole('button', { name: /ai hint/i })).toBeDisabled()
  })

  it('auto-triggers error explanation when run fails and engine is ready', async () => {
    mockWorker.run.mockResolvedValue({
      output: [],
      error: 'NameError: name x is not defined',
    })
    mockEngineStatus.value = 'ready'

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, {
        exercises: sampleExercises,
        courseSlug: 'test-course',
        sectionTitle: 'Basics',
      })
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(mockOpenPanel).toHaveBeenCalled()
    expect(mockSendHint).toHaveBeenCalled()
    // Second arg is error — should be the error message
    const [, error] = mockSendHint.mock.calls[0]
    expect(error).toBe('NameError: name x is not defined')
  })

  it('does NOT auto-trigger AI when run fails and engine is NOT ready', async () => {
    mockWorker.run.mockResolvedValue({
      output: [],
      error: 'SyntaxError: invalid syntax',
    })
    mockEngineStatus.value = 'loading'

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, {
        exercises: sampleExercises,
        courseSlug: 'test-course',
        sectionTitle: 'Basics',
      })
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(mockOpenPanel).not.toHaveBeenCalled()
    expect(mockSendHint).not.toHaveBeenCalled()
  })

  it('does NOT auto-trigger AI when run succeeds (no error)', async () => {
    mockWorker.run.mockResolvedValue({
      output: [{ type: 'stdout', line: 'Hello, World!' }],
      error: null,
    })
    mockEngineStatus.value = 'ready'

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(
      React.createElement(ExerciseRunner, {
        exercises: sampleExercises,
        courseSlug: 'test-course',
        sectionTitle: 'Basics',
      })
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(mockOpenPanel).not.toHaveBeenCalled()
    expect(mockSendHint).not.toHaveBeenCalled()
  })

  it('does NOT auto-trigger AI when courseSlug is absent even with error', async () => {
    mockWorker.run.mockResolvedValue({
      output: [],
      error: 'SyntaxError: invalid syntax',
    })
    mockEngineStatus.value = 'ready'

    const { ExerciseRunner } = await import('@/components/code-runner/exercise-runner')
    render(React.createElement(ExerciseRunner, { exercises: sampleExercises }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /run/i }))
    })

    expect(mockOpenPanel).not.toHaveBeenCalled()
    expect(mockSendHint).not.toHaveBeenCalled()
  })
})
