import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Worker globally before importing hook
const mockPostMessage = vi.fn()
const mockTerminate = vi.fn()
const MockWorker = vi.fn(() => ({
  postMessage: mockPostMessage,
  onmessage: null,
  terminate: mockTerminate,
}))

vi.stubGlobal('Worker', MockWorker)

// Reset module registry and singleton state before each test
beforeEach(async () => {
  vi.clearAllMocks()
  mockPostMessage.mockReset()
  mockTerminate.mockReset()
  MockWorker.mockClear()
  // Reset the module so singleton sharedWorker is null
  vi.resetModules()
})

describe('usePyodideWorker', () => {
  it('does not create Worker on mount', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    renderHook(() => usePyodideWorker())
    expect(MockWorker).not.toHaveBeenCalled()
  })

  it('status is idle initially', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    const { result } = renderHook(() => usePyodideWorker())
    expect(result.current.status).toBe('idle')
  })

  it('creates Worker on first run() call', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    const { result } = renderHook(() => usePyodideWorker())

    // Trigger run without awaiting — just check that Worker was created
    act(() => {
      result.current.run('print("hi")').catch(() => {})
    })

    expect(MockWorker).toHaveBeenCalledOnce()
    expect(MockWorker).toHaveBeenCalledWith('/workers/pyodide.worker.mjs', { type: 'module' })
  })
})
