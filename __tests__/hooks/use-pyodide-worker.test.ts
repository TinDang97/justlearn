import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Worker globally before importing hook
const mockPostMessage = vi.fn()
const mockTerminate = vi.fn()

type MockWorkerInstance = {
  postMessage: ReturnType<typeof vi.fn>
  onmessage: ((event: MessageEvent) => void) | null
  terminate: ReturnType<typeof vi.fn>
}

let lastWorkerInstance: MockWorkerInstance | null = null

// Use a class-based mock so `new Worker(...)` works correctly
class MockWorkerClass {
  postMessage = mockPostMessage
  onmessage: ((event: MessageEvent) => void) | null = null
  terminate = mockTerminate

  constructor(_url: string, _opts?: WorkerOptions) {
    lastWorkerInstance = this
    MockWorkerClass.callCount++
    MockWorkerClass.calls.push([_url, _opts])
  }

  static callCount = 0
  static calls: [string, WorkerOptions | undefined][] = []
  static mockClear() {
    MockWorkerClass.callCount = 0
    MockWorkerClass.calls = []
  }
}

const MockWorker = MockWorkerClass

vi.stubGlobal('Worker', MockWorker)

// Reset module registry and singleton state before each test
beforeEach(async () => {
  vi.clearAllMocks()
  mockPostMessage.mockReset()
  mockTerminate.mockReset()
  MockWorkerClass.mockClear()
  lastWorkerInstance = null
  // Reset the module so singleton sharedWorker is null
  vi.resetModules()
})

describe('usePyodideWorker', () => {
  it('does not create Worker on mount', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    renderHook(() => usePyodideWorker())
    expect(MockWorkerClass.callCount).toBe(0)
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

    expect(MockWorkerClass.callCount).toBe(1)
    expect(MockWorkerClass.calls[0]).toEqual(['/workers/pyodide.worker.mjs', { type: 'module' }])
  })

  it('transitions to installing status when worker sends { id, status: installing }', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    const { result } = renderHook(() => usePyodideWorker())

    // Start a run to create the worker
    let runPromise: Promise<unknown>
    act(() => {
      runPromise = result.current.run('import pandas as pd')
    })

    // Simulate worker sending a status:installing message
    await act(async () => {
      lastWorkerInstance!.onmessage!({
        data: { id: 1, status: 'installing' },
      } as MessageEvent)
    })

    expect(result.current.status).toBe('installing')

    // Clean up — resolve the run promise by sending final message
    await act(async () => {
      lastWorkerInstance!.onmessage!({
        data: { id: 1, output: [], error: null },
      } as MessageEvent)
    })

    await runPromise!
  })

  it('resolves promise and transitions to ready after final message following installing status', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    const { result } = renderHook(() => usePyodideWorker())

    let runResult: { output: unknown[]; error: string | null } | undefined

    act(() => {
      result.current.run('import pandas as pd').then((r) => {
        runResult = r as { output: unknown[]; error: string | null }
      })
    })

    // Send installing status — should NOT resolve promise
    await act(async () => {
      lastWorkerInstance!.onmessage!({
        data: { id: 1, status: 'installing' },
      } as MessageEvent)
    })

    expect(result.current.status).toBe('installing')
    expect(runResult).toBeUndefined()

    // Send final result message — SHOULD resolve promise
    await act(async () => {
      lastWorkerInstance!.onmessage!({
        data: { id: 1, output: [{ type: 'stdout', line: '2.0.0' }], error: null },
      } as MessageEvent)
    })

    expect(result.current.status).toBe('ready')
    expect(runResult).toBeDefined()
    expect(runResult!.output).toHaveLength(1)
  })

  it('ignores status message with unknown id gracefully', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    const { result } = renderHook(() => usePyodideWorker())

    act(() => {
      result.current.run('print("hi")').catch(() => {})
    })

    // Send installing status with wrong id — should not crash
    await act(async () => {
      lastWorkerInstance!.onmessage!({
        data: { id: 999, status: 'installing' },
      } as MessageEvent)
    })

    // Should still be running (status was set to 'running' on run() call)
    // No crash is the key assertion
    expect(result.current.status).not.toBe(undefined)
  })

  it('does not send status message for non-pandas code', async () => {
    const { usePyodideWorker } = await import('@/hooks/use-pyodide-worker')
    const { result } = renderHook(() => usePyodideWorker())

    let runResult: { output: unknown[]; error: string | null } | undefined

    act(() => {
      result.current.run('print("hello")').then((r) => {
        runResult = r as { output: unknown[]; error: string | null }
      })
    })

    // Send ONLY the final result (no status message) — simulating non-pandas path
    await act(async () => {
      lastWorkerInstance!.onmessage!({
        data: { id: 1, output: [{ type: 'stdout', line: 'hello' }], error: null },
      } as MessageEvent)
    })

    expect(result.current.status).toBe('ready')
    expect(runResult).toBeDefined()
    expect(runResult!.output[0]).toEqual({ type: 'stdout', line: 'hello' })
  })
})
