'use client'

import { useRef, useState, useCallback } from 'react'
import type { RetrievedChunk } from '@/lib/build-system-prompt'

export type RAGStatus = 'idle' | 'loading' | 'ready' | 'error'

interface RagChunk {
  id: string
  courseSlug: string
  sectionSlug: string
  lessonSlug: string
  lessonTitle: string
  heading: string
  text: string
  embedding: number[]
}

interface IndexedChunk {
  chunk: RagChunk
  embedding: Float32Array
}

// Module-level singleton — shared across all hook instances on the page.
// Prevents multiple fetches of the rag-chunks.json (up to ~40MB) when
// several components mount simultaneously.
let chunksCache: RagChunk[] | null = null
let indexPromise: Promise<void> | null = null
const courseChunksCache = new Map<string, IndexedChunk[]>()

/**
 * Reset module-level singletons. ONLY for test isolation.
 * Prefixed with underscore to signal internal / test use.
 */
export function _resetForTesting(): void {
  chunksCache = null
  indexPromise = null
  courseChunksCache.clear()
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0
  return dot / denom
}

export function useRAG(courseSlug: string): {
  buildIndex: () => Promise<void>
  retrieveContext: (
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine: any,
    k?: number
  ) => Promise<RetrievedChunk[]>
  status: RAGStatus
} {
  const [status, setStatus] = useState<RAGStatus>('idle')

  // Ref avoids stale closures — mirrors use-ai-engine.ts exactly
  const statusRef = useRef(setStatus)
  statusRef.current = setStatus

  const buildIndex = useCallback((): Promise<void> => {
    // Already built — return immediately
    if (chunksCache !== null) {
      return Promise.resolve()
    }

    // Dedup concurrent callers: return the in-flight promise
    if (indexPromise !== null) {
      return indexPromise
    }

    statusRef.current('loading')

    // Build the singleton promise synchronously before any await
    indexPromise = fetch('/data/rag-chunks.json')
      .then(async (res) => {
        const chunks: RagChunk[] = await res.json()
        chunksCache = chunks

        // Pre-filter and convert embeddings to Float32Array by course
        for (const chunk of chunks) {
          if (!courseChunksCache.has(chunk.courseSlug)) {
            courseChunksCache.set(chunk.courseSlug, [])
          }
          courseChunksCache.get(chunk.courseSlug)!.push({
            chunk,
            embedding: new Float32Array(chunk.embedding),
          })
        }

        statusRef.current('ready')
      })
      .catch((err: unknown) => {
        // Reset so caller can retry after an error
        indexPromise = null
        statusRef.current('error')
        throw err
      })

    return indexPromise
  }, [])

  const retrieveContext = useCallback(
    async (
      query: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      engine: any,
      k = 3
    ): Promise<RetrievedChunk[]> => {
      // Ensure index is loaded before searching
      await buildIndex()

      // Get query embedding from the already-loaded WebLLM engine
      const embeddingResult = await engine.embeddings.create({ input: query })
      const queryVector = new Float32Array(embeddingResult.data[0].embedding as number[])

      // Get course-filtered chunks
      const courseChunks = courseChunksCache.get(courseSlug) ?? []

      // Compute cosine similarity for all course chunks, sort descending, take top-k
      const scored = courseChunks.map(({ chunk, embedding }) => ({
        chunk,
        score: cosineSimilarity(queryVector, embedding),
      }))

      scored.sort((a, b) => b.score - a.score)

      return scored.slice(0, k).map(({ chunk }) => ({
        text: chunk.text,
        heading: chunk.heading,
        lessonTitle: chunk.lessonTitle,
      }))
    },
    [courseSlug, buildIndex]
  )

  return { buildIndex, retrieveContext, status }
}
