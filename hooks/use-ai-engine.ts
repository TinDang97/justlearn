'use client'

import { useRef, useState, useCallback } from 'react'

export type AIEngineStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported'
export type DownloadProgress = { progress: number; text: string }

// Module-level singleton — shared across all hook instances on the page.
// Prevents multiple 2.2GB WebLLM model downloads when several components exist.
// Mirrors the usePyodideWorker singleton pattern exactly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let engineInstance: any | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let enginePromise: Promise<any> | null = null

/**
 * Detects WebGPU availability at runtime.
 * Returns false in SSR/SSG contexts (navigator is not defined).
 */
export function isWebGPUSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'gpu' in navigator &&
    navigator.gpu !== null &&
    navigator.gpu !== undefined
  )
}

export function useAIEngine(modelId: string): {
  getEngine: () => Promise<unknown>
  status: AIEngineStatus
  downloadProgress: DownloadProgress | null
} {
  const [status, setStatus] = useState<AIEngineStatus>(
    isWebGPUSupported() ? 'idle' : 'unsupported'
  )
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

  // Ref avoids stale closures in initProgressCallback — same pattern as usePyodideWorker
  const statusRef = useRef(setStatus)
  statusRef.current = setStatus

  const getEngine = useCallback((): Promise<unknown> => {
    if (!isWebGPUSupported()) {
      return Promise.reject(new Error('WebGPU not supported'))
    }

    // Return already-initialized engine immediately
    if (engineInstance !== null) {
      return Promise.resolve(engineInstance)
    }

    // Dedup concurrent callers: return the in-flight promise
    // This guard runs synchronously before any await, so concurrent calls see it
    if (enginePromise !== null) {
      return enginePromise
    }

    statusRef.current('loading')

    // Build the singleton promise synchronously and assign before any await.
    // Dynamic import — avoids "navigator is not defined" crash during SSG build.
    enginePromise = import('@mlc-ai/web-llm')
      .then(({ CreateWebWorkerMLCEngine }) =>
        CreateWebWorkerMLCEngine(
          new Worker('/workers/llm.worker.mjs', { type: 'module' }),
          modelId,
          {
            initProgressCallback: (report: { progress: number; text: string }) => {
              setDownloadProgress({ progress: report.progress, text: report.text })
              if (report.progress === 1) {
                statusRef.current('ready')
              }
            },
          }
        )
      )
      .then((engine: unknown) => {
        engineInstance = engine
        return engine
      })
      .catch((err: unknown) => {
        // Reset so caller can retry after an error
        enginePromise = null
        statusRef.current('error')
        throw err
      })

    return enginePromise
  }, [modelId])

  return { getEngine, status, downloadProgress }
}
