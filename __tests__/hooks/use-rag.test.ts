import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ============================================================
// Fake data fixtures
// ============================================================

function makeEmbedding(values: number[]): number[] {
  return values
}

const FAKE_CHUNKS = [
  {
    id: 'python::lesson-1::0',
    courseSlug: 'python',
    sectionSlug: 'basics',
    lessonSlug: 'lesson-1',
    lessonTitle: 'Lesson 1: Variables',
    heading: 'Variables',
    text: '[Python > Basics > Lesson 1: Variables] Variables are containers for storing data.',
    embedding: makeEmbedding([1, 0, 0]),
  },
  {
    id: 'python::lesson-2::0',
    courseSlug: 'python',
    sectionSlug: 'basics',
    lessonSlug: 'lesson-2',
    lessonTitle: 'Lesson 2: Functions',
    heading: 'Functions',
    text: '[Python > Basics > Lesson 2: Functions] Functions are reusable blocks of code.',
    embedding: makeEmbedding([0, 1, 0]),
  },
  {
    id: 'data-engineering::lesson-1::0',
    courseSlug: 'data-engineering',
    sectionSlug: 'pipelines',
    lessonSlug: 'lesson-1',
    lessonTitle: 'Lesson 1: Pipelines',
    heading: 'Pipelines',
    text: '[DataEng > Pipelines > Lesson 1: Pipelines] Pipelines move data between systems.',
    embedding: makeEmbedding([0, 0, 1]),
  },
]

// ============================================================
// Mock global fetch before each test (reset via vi.resetModules)
// ============================================================

function mockFetchWithChunks(chunks = FAKE_CHUNKS) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => chunks,
    })
  )
}

function mockFetchWithError() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error('Network error'))
  )
}

// Mock engine with embeddings.create()
function makeEngine(queryVector: number[]) {
  return {
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: queryVector }],
      }),
    },
  }
}

// Reset module singletons between tests
beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
})

// ============================================================
// RAGStatus type
// ============================================================

describe('RAGStatus', () => {
  it('exports RAGStatus as a union type usable as values via string literals', async () => {
    // Import to verify it doesn't crash — type-only test
    await import('@/hooks/use-rag')
  })
})

// ============================================================
// useRAG — initial status
// ============================================================

describe('useRAG — initial state', () => {
  it('starts with status "idle"', async () => {
    mockFetchWithChunks()
    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))
    expect(result.current.status).toBe('idle')
  })

  it('exposes buildIndex and retrieveContext functions', async () => {
    mockFetchWithChunks()
    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))
    expect(typeof result.current.buildIndex).toBe('function')
    expect(typeof result.current.retrieveContext).toBe('function')
  })
})

// ============================================================
// useRAG — buildIndex status transitions
// ============================================================

describe('useRAG — buildIndex status transitions', () => {
  it('transitions status to "ready" after buildIndex() resolves', async () => {
    mockFetchWithChunks()
    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
    })

    expect(result.current.status).toBe('ready')
  })

  it('transitions status to "loading" during buildIndex()', async () => {
    // Use a slow fetch to capture the 'loading' state
    let resolveFetch!: (value: unknown) => void
    const fetchPromise = new Promise<unknown>((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        fetchPromise.then(() => ({
          ok: true,
          json: async () => FAKE_CHUNKS,
        }))
      )
    )

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    expect(result.current.status).toBe('idle')

    // Start buildIndex without awaiting — check intermediate state
    let buildDone = false
    act(() => {
      result.current.buildIndex().then(() => {
        buildDone = true
      })
    })

    // At this point fetch hasn't resolved yet, status should be 'loading'
    expect(result.current.status).toBe('loading')

    // Now resolve the fetch
    await act(async () => {
      resolveFetch(undefined)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(buildDone).toBe(true)
    expect(result.current.status).toBe('ready')
  })

  it('transitions status to "error" when fetch fails', async () => {
    mockFetchWithError()
    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex().catch(() => {})
    })

    expect(result.current.status).toBe('error')
  })
})

// ============================================================
// useRAG — singleton / dedup
// ============================================================

describe('useRAG — singleton behavior', () => {
  it('fetch is called exactly once across multiple buildIndex() calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => FAKE_CHUNKS,
    })
    vi.stubGlobal('fetch', mockFetch)

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await Promise.all([
        result.current.buildIndex(),
        result.current.buildIndex(),
        result.current.buildIndex(),
      ])
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('/data/rag-chunks.json')
  })

  it('second buildIndex() call returns the same in-flight promise (concurrent dedup)', async () => {
    mockFetchWithChunks()
    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    let p1!: Promise<void>
    let p2!: Promise<void>

    act(() => {
      p1 = result.current.buildIndex()
      p2 = result.current.buildIndex()
    })

    expect(p1).toBe(p2)

    await act(async () => {
      await p1
    })
  })

  it('after error, a second buildIndex() call retries (indexPromise is reset)', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => FAKE_CHUNKS,
      })
    vi.stubGlobal('fetch', mockFetch)

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    // First call fails
    await act(async () => {
      await result.current.buildIndex().catch(() => {})
    })
    expect(result.current.status).toBe('error')

    // Second call retries
    await act(async () => {
      await result.current.buildIndex()
    })
    expect(result.current.status).toBe('ready')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

// ============================================================
// useRAG — retrieveContext
// ============================================================

describe('useRAG — retrieveContext', () => {
  it('returns RetrievedChunk[] with text, heading, lessonTitle fields', async () => {
    mockFetchWithChunks()
    // Query vector matches python chunk 0 (Variables) exactly: [1, 0, 0]
    const engine = makeEngine([1, 0, 0])

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
    })

    let chunks: unknown[] = []
    await act(async () => {
      chunks = await result.current.retrieveContext('variables', engine, 3)
    })

    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0]).toHaveProperty('text')
    expect(chunks[0]).toHaveProperty('heading')
    expect(chunks[0]).toHaveProperty('lessonTitle')
  })

  it('returns at most k results', async () => {
    mockFetchWithChunks()
    const engine = makeEngine([1, 0, 0])

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
    })

    let chunks: unknown[] = []
    await act(async () => {
      chunks = await result.current.retrieveContext('test', engine, 1)
    })

    expect(chunks.length).toBeLessThanOrEqual(1)
  })

  it('filters results to the current courseSlug only', async () => {
    mockFetchWithChunks()
    // Query vector that matches data-engineering chunk: [0, 0, 1]
    const engine = makeEngine([0, 0, 1])

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
    })

    let chunks: Array<{ text: string; heading: string; lessonTitle: string }> = []
    await act(async () => {
      chunks = await result.current.retrieveContext('pipelines', engine, 5)
    })

    // Even though the query vector matches data-engineering, results must be python-only
    // because the hook was initialized with courseSlug='python'
    expect(chunks.length).toBeGreaterThan(0)
    for (const chunk of chunks) {
      expect(chunk.text).not.toContain('Pipelines move data')
    }
  })

  it('returns results sorted by cosine similarity descending', async () => {
    mockFetchWithChunks()
    // Query vector: [1, 0, 0] — should rank Variables chunk highest
    const engine = makeEngine([1, 0, 0])

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
    })

    let chunks: Array<{ text: string; heading: string; lessonTitle: string }> = []
    await act(async () => {
      chunks = await result.current.retrieveContext('variables', engine, 5)
    })

    // First result should be the Variables chunk (cosine similarity = 1.0)
    expect(chunks[0].heading).toBe('Variables')
    expect(chunks[0].lessonTitle).toBe('Lesson 1: Variables')
  })

  it('calls engine.embeddings.create() with the query string', async () => {
    mockFetchWithChunks()
    const engine = makeEngine([1, 0, 0])

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
      await result.current.retrieveContext('what is a variable?', engine, 3)
    })

    expect(engine.embeddings.create).toHaveBeenCalledWith({
      input: 'what is a variable?',
    })
  })

  it('calls buildIndex() internally if not yet built (lazy retrieval)', async () => {
    mockFetchWithChunks()
    const engine = makeEngine([1, 0, 0])

    const { useRAG } = await import('@/hooks/use-rag')
    const { result } = renderHook(() => useRAG('python'))

    // Skip explicit buildIndex() — retrieveContext should trigger it
    let chunks: unknown[] = []
    await act(async () => {
      chunks = await result.current.retrieveContext('variables', engine, 3)
    })

    expect(result.current.status).toBe('ready')
    expect(chunks.length).toBeGreaterThan(0)
  })
})

// ============================================================
// _resetForTesting — internal escape hatch
// ============================================================

describe('_resetForTesting', () => {
  it('exports _resetForTesting function', async () => {
    mockFetchWithChunks()
    const mod = await import('@/hooks/use-rag')
    expect(typeof mod._resetForTesting).toBe('function')
  })

  it('resets singleton so fetch is called again after reset', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => FAKE_CHUNKS,
    })
    vi.stubGlobal('fetch', mockFetch)

    const mod = await import('@/hooks/use-rag')
    const { result } = renderHook(() => mod.useRAG('python'))

    await act(async () => {
      await result.current.buildIndex()
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Reset singletons
    act(() => {
      mod._resetForTesting()
    })

    // Re-render hook after reset
    const { result: result2 } = renderHook(() => mod.useRAG('python'))
    await act(async () => {
      await result2.current.buildIndex()
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
