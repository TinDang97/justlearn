'use client'

import { useRef, useState, useCallback } from 'react'

export type AIEngineStatus =
  | 'idle'
  | 'awaiting-consent'
  | 'loading'
  | 'ready'
  | 'error'
  | 'unsupported'
  | 'no-wifi'
export type DownloadProgress = { progress: number; text: string }

// Module-level singleton — shared across all hook instances on the page.
// Prevents multiple 2.2GB WebLLM model downloads when several components exist.
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

/**
 * Checks if the user is on a WiFi or wired connection.
 * Returns true if Network Information API is unavailable (assume WiFi on desktop).
 */
export function isOnWifi(): boolean {
  if (typeof navigator === 'undefined') return true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (navigator as any).connection
  if (!conn) return true // API unavailable — assume WiFi (desktop browsers)
  const type = conn.type ?? conn.effectiveType
  // Allow: wifi, ethernet, unknown. Block: cellular, bluetooth, etc.
  return !type || type === 'wifi' || type === 'ethernet' || type === 'unknown'
}

/**
 * Checks if the model is already cached in the browser's Cache API.
 * WebLLM stores model shards in Cache Storage under "webllm/model" keys.
 */
export async function isModelCached(modelId: string): Promise<boolean> {
  try {
    if (typeof caches === 'undefined') return false
    const cacheNames = await caches.keys()
    // WebLLM uses cache names containing the model ID
    return cacheNames.some((name) => name.includes(modelId) || name.includes('webllm'))
  } catch {
    return false
  }
}

/** localStorage key for persisting the user's download consent */
const CONSENT_KEY = 'justlearn-ai-consent'

export function hasUserConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true'
  } catch {
    return false
  }
}

export function setUserConsent(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(CONSENT_KEY, 'true')
    } else {
      localStorage.removeItem(CONSENT_KEY)
    }
  } catch {
    // localStorage unavailable — consent not persisted
  }
}

export function useAIEngine(modelId: string): {
  getEngine: () => Promise<unknown>
  requestDownload: () => void
  status: AIEngineStatus
  downloadProgress: DownloadProgress | null
} {
  const [status, setStatus] = useState<AIEngineStatus>(
    isWebGPUSupported() ? 'idle' : 'unsupported'
  )
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

  // Ref avoids stale closures in initProgressCallback
  const statusRef = useRef(setStatus)
  statusRef.current = setStatus

  const startEngine = useCallback((): Promise<unknown> => {
    statusRef.current('loading')

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
        enginePromise = null
        statusRef.current('error')
        throw err
      })

    return enginePromise
  }, [modelId])

  const getEngine = useCallback((): Promise<unknown> => {
    if (!isWebGPUSupported()) {
      return Promise.reject(new Error('WebGPU not supported'))
    }

    // Return already-initialized engine immediately
    if (engineInstance !== null) {
      return Promise.resolve(engineInstance)
    }

    // Dedup concurrent callers
    if (enginePromise !== null) {
      return enginePromise
    }

    // If user already consented or model is cached, start directly
    if (hasUserConsented()) {
      if (!isOnWifi()) {
        statusRef.current('no-wifi')
        return Promise.reject(new Error('Not on WiFi'))
      }
      return startEngine()
    }

    // Otherwise, show consent prompt
    statusRef.current('awaiting-consent')
    return Promise.reject(new Error('Awaiting user consent'))
  }, [modelId, startEngine])

  /** Called when user clicks "Download" in the consent dialog */
  const requestDownload = useCallback(() => {
    if (!isOnWifi()) {
      statusRef.current('no-wifi')
      return
    }
    setUserConsent(true)
    startEngine().catch(() => {
      // Error state handled by startEngine
    })
  }, [startEngine])

  return { getEngine, requestDownload, status, downloadProgress }
}
