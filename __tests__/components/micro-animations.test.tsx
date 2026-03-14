import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

// Filter out motion-specific props that cause DOM warnings
function filterMotionProps<T extends Record<string, unknown>>(props: T): Partial<T> {
  const motionOnlyKeys = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'whileHover', 'whileTap', 'whileFocus', 'whileInView', 'whileDrag',
    'layout', 'layoutId', 'drag', 'dragConstraints', 'dragElastic',
    'dragMomentum', 'onHoverStart', 'onHoverEnd', 'onTap', 'onTapStart',
    'onTapCancel', 'onAnimationStart', 'onAnimationComplete',
  ])
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !motionOnlyKeys.has(key))
  ) as Partial<T>
}

// Mock motion/react: forward whileHover/whileTap as data attributes for test assertions
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
        React.createElement('div', {
          'data-whilehover': props.whileHover ? JSON.stringify(props.whileHover) : undefined,
          'data-whiletap': props.whileTap ? JSON.stringify(props.whileTap) : undefined,
          ref,
          ...filterMotionProps(props),
        })
    ),
    button: React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<HTMLButtonElement>) =>
        React.createElement('button', {
          'data-whilehover': props.whileHover ? JSON.stringify(props.whileHover) : undefined,
          'data-whiletap': props.whileTap ? JSON.stringify(props.whileTap) : undefined,
          ref,
          ...filterMotionProps(props),
        })
    ),
  },
}))

// Mock CodeMirror for CodeRunnerClient
vi.mock('@uiw/react-codemirror', () => ({
  default: () => React.createElement('textarea', { 'data-testid': 'mock-editor', readOnly: true }),
}))

// Mock next-themes for CodeRunnerClient
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

// Mock usePyodideWorker for CodeRunnerClient
vi.mock('@/hooks/use-pyodide-worker', () => ({
  usePyodideWorker: () => ({
    run: vi.fn(),
    status: 'idle',
  }),
}))

// Mock Zustand progress store for LessonCompleteButton
vi.mock('@/lib/store/progress', () => ({
  useProgressStore: (selector: (s: { isComplete: () => boolean; markComplete: () => void; markIncomplete: () => void }) => unknown) =>
    selector({
      isComplete: () => false,
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
    }),
}))

afterEach(() => {
  cleanup()
})

describe('LessonCompleteButton micro-animations', () => {
  it('renders a parent element with data-whilehover attribute (motion.div wrapper)', async () => {
    const { LessonCompleteButton } = await import('@/components/lesson-complete-button')
    const { container } = render(
      React.createElement(LessonCompleteButton, {
        courseSlug: '01-python-fundamentals',
        lessonSlug: 'lesson-01',
      })
    )
    // Find any element with data-whilehover in the rendered tree
    const motionEl = container.querySelector('[data-whilehover]')
    expect(motionEl).not.toBeNull()
  })

  it('motion wrapper has whileTap attribute', async () => {
    const { LessonCompleteButton } = await import('@/components/lesson-complete-button')
    const { container } = render(
      React.createElement(LessonCompleteButton, {
        courseSlug: '01-python-fundamentals',
        lessonSlug: 'lesson-01',
      })
    )
    const motionEl = container.querySelector('[data-whiletap]')
    expect(motionEl).not.toBeNull()
  })
})

describe('CodeRunnerClient Run button micro-animations', () => {
  it('renders Run button parent with data-whiletap attribute (motion.div wrapper)', async () => {
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    const { container } = render(
      React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' })
    )
    const motionEl = container.querySelector('[data-whiletap]')
    expect(motionEl).not.toBeNull()
  })

  it('renders Run button parent with data-whilehover attribute', async () => {
    const { CodeRunnerClient } = await import('@/components/code-runner/code-runner-client')
    const { container } = render(
      React.createElement(CodeRunnerClient, { initialCode: 'print("hi")' })
    )
    const motionEl = container.querySelector('[data-whilehover]')
    expect(motionEl).not.toBeNull()
  })
})
