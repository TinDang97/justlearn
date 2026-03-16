import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Worker globally before importing hook
let lastWorkerInstance: MockWorkerInstance | null = null

type MockWorkerInstance = {
  postMessage: ReturnType<typeof vi.fn>
  onmessage: ((event: MessageEvent) => void) | null
  terminate: ReturnType<typeof vi.fn>
}

class MockWorkerClass {
  postMessage = vi.fn()
  onmessage: ((event: MessageEvent) => void) | null = null
  terminate = vi.fn()

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

vi.stubGlobal('Worker', MockWorkerClass)

// Capture the initProgressCallback from CreateWebWorkerMLCEngine options
let capturedProgressCallback: ((report: { progress: number; text: string }) => void) | null = null
let mockEngineResolve: ((engine: object) => void) | null = null
let mockEngineReject: ((err: Error) => void) | null = null

const mockCreateWebWorkerMLCEngine = vi.fn(
  (_worker: unknown, _modelId: string, opts: { initProgressCallback?: (report: { progress: number; text: string }) => void }) => {
    capturedProgressCallback = opts?.initProgressCallback ?? null
    return new Promise<object>((resolve, reject) => {
      mockEngineResolve = resolve
      mockEngineReject = reject
    })
  }
)

vi.mock('@mlc-ai/web-llm', () => ({
  CreateWebWorkerMLCEngine: mockCreateWebWorkerMLCEngine,
}))

// Reset module registry and singleton state before each test
beforeEach(async () => {
  vi.clearAllMocks()
  MockWorkerClass.mockClear()
  lastWorkerInstance = null
  capturedProgressCallback = null
  mockEngineResolve = null
  mockEngineReject = null
  // Reset singleton state by resetting the module
  vi.resetModules()
})

describe('isWebGPUSupported', () => {
  it('returns false when navigator.gpu is undefined', async () => {
    vi.stubGlobal('navigator', { gpu: undefined })
    const { isWebGPUSupported } = await import('@/hooks/use-ai-engine')
    expect(isWebGPUSupported()).toBe(false)
  })

  it('returns true when navigator.gpu is present', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { isWebGPUSupported } = await import('@/hooks/use-ai-engine')
    expect(isWebGPUSupported()).toBe(true)
  })
})

describe('useAIEngine', () => {
  it('returns status "unsupported" when navigator.gpu is absent', async () => {
    vi.stubGlobal('navigator', { gpu: undefined })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))
    expect(result.current.status).toBe('unsupported')
  })

  it('does NOT call CreateWebWorkerMLCEngine on mount (lazy)', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))
    expect(mockCreateWebWorkerMLCEngine).not.toHaveBeenCalled()
  })

  it('does NOT create Worker constructor on mount (lazy)', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))
    expect(MockWorkerClass.callCount).toBe(0)
  })

  it('calling getEngine() triggers dynamic import and CreateWebWorkerMLCEngine', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    act(() => {
      result.current.getEngine().catch(() => {})
    })

    // Allow microtasks to flush
    await act(async () => { await Promise.resolve() })

    expect(mockCreateWebWorkerMLCEngine).toHaveBeenCalledOnce()
    expect(MockWorkerClass.callCount).toBe(1)
    expect(MockWorkerClass.calls[0]).toEqual(['/workers/llm.worker.mjs', { type: 'module' }])
  })

  it('calling getEngine() from two hook instances returns the same promise (singleton)', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')

    const { result: result1 } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))
    const { result: result2 } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    let promise1: Promise<unknown> | undefined
    let promise2: Promise<unknown> | undefined

    act(() => {
      // Store raw getEngine() promises (no .catch wrapper) to test referential equality
      promise1 = result1.current.getEngine()
      promise2 = result2.current.getEngine()
      // Suppress unhandled rejection warnings
      promise1.catch(() => {})
      promise2.catch(() => {})
    })

    await act(async () => { await Promise.resolve() })

    // CreateWebWorkerMLCEngine should only be called ONCE (singleton)
    expect(mockCreateWebWorkerMLCEngine).toHaveBeenCalledOnce()
    expect(promise1).toBe(promise2)
  })

  it('transitions status from "idle" to "loading" when getEngine() is called', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    expect(result.current.status).toBe('idle')

    await act(async () => {
      result.current.getEngine().catch(() => {})
      await Promise.resolve()
    })

    expect(result.current.status).toBe('loading')
  })

  it('initProgressCallback updates downloadProgress with progress and text fields', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    await act(async () => {
      result.current.getEngine().catch(() => {})
      await Promise.resolve()
    })

    expect(capturedProgressCallback).not.toBeNull()

    await act(async () => {
      capturedProgressCallback!({ progress: 0.5, text: 'Downloading model...' })
    })

    expect(result.current.downloadProgress).toEqual({ progress: 0.5, text: 'Downloading model...' })
  })

  it('transitions status to "ready" when initProgressCallback reports progress=1', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    await act(async () => {
      result.current.getEngine().catch(() => {})
      await Promise.resolve()
    })

    await act(async () => {
      capturedProgressCallback!({ progress: 1, text: 'Ready' })
    })

    expect(result.current.status).toBe('ready')
  })

  it('transitions status to "error" and resets enginePromise when CreateWebWorkerMLCEngine rejects', async () => {
    vi.stubGlobal('navigator', { gpu: {} })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    await act(async () => {
      result.current.getEngine().catch(() => {})
      await Promise.resolve()
    })

    // Reject the engine promise
    await act(async () => {
      mockEngineReject!(new Error('GPU initialization failed'))
      await Promise.resolve()
    })

    expect(result.current.status).toBe('error')

    // Verify singleton resets: second call should trigger CreateWebWorkerMLCEngine again
    vi.clearAllMocks()
    await act(async () => {
      result.current.getEngine().catch(() => {})
      await Promise.resolve()
    })
    expect(mockCreateWebWorkerMLCEngine).toHaveBeenCalledOnce()
  })

  it('getEngine() throws Error("WebGPU not supported") when navigator.gpu is absent', async () => {
    vi.stubGlobal('navigator', { gpu: undefined })
    const { useAIEngine } = await import('@/hooks/use-ai-engine')
    const { result } = renderHook(() => useAIEngine('Phi-3.5-mini-instruct-q4f16_1-MLC'))

    await expect(result.current.getEngine()).rejects.toThrow('WebGPU not supported')
  })
})
