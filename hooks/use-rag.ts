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

// Module-level singleton — shared across all hook instances on the page.
// Prevents multiple fetches of the rag-chunks.json (up to ~40MB) when
// several components mount simultaneously.
let chunksCache: RagChunk[] | null = null
let indexPromise: Promise<void> | null = null
const courseChunksCache = new Map<string, RagChunk[]>()

/**
 * Reset module-level singletons. ONLY for test isolation.
 * Prefixed with underscore to signal internal / test use.
 */
export function _resetForTesting(): void {
  chunksCache = null
  indexPromise = null
  courseChunksCache.clear()
}

/**
 * Tokenize text into lowercase alphanumeric words.
 * Strips punctuation and splits on whitespace.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
}

/**
 * BM25-like keyword score: fraction of unique query words found in chunk text.
 * Score = (number of matching unique query words) / (total unique query words)
 */
export function keywordScore(queryTokens: string[], chunkText: string): number {
  if (queryTokens.length === 0) return 0
  const chunkLower = chunkText.toLowerCase()
  let matches = 0
  for (const token of queryTokens) {
    if (chunkLower.includes(token)) {
      matches++
    }
  }
  return matches / queryTokens.length
}

export function useRAG(courseSlug: string): {
  buildIndex: () => Promise<void>
  retrieveContext: (
    query: string,
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

        // Pre-filter chunks by course
        for (const chunk of chunks) {
          if (!courseChunksCache.has(chunk.courseSlug)) {
            courseChunksCache.set(chunk.courseSlug, [])
          }
          courseChunksCache.get(chunk.courseSlug)!.push(chunk)
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
      k = 3
    ): Promise<RetrievedChunk[]> => {
      // Ensure index is loaded before searching
      await buildIndex()

      // Tokenize query for keyword matching
      const queryTokens = [...new Set(tokenize(query))]

      // Get course-filtered chunks
      const courseChunks = courseChunksCache.get(courseSlug) ?? []

      // Score each chunk by keyword overlap, sort descending, take top-k
      const scored = courseChunks.map((chunk) => ({
        chunk,
        score: keywordScore(queryTokens, chunk.text),
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
