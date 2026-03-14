'use client'

import { useRef, useState, useEffect } from 'react'

export type RunStatus = 'idle' | 'loading' | 'installing' | 'ready' | 'running'
export type RunResult = {
  output: { type: 'stdout' | 'stderr'; line: string }[]
  error: string | null
}

// Module-level singleton — shared across all hook instances on the page.
// Prevents multiple Pyodide WASM downloads when several code runners exist.
let sharedWorker: Worker | null = null
let instanceCount = 0
let messageIdCounter = 0

type PendingMessage = {
  resolve: (result: RunResult) => void
  reject: (err: Error) => void
}

const pendingMessages = new Map<number, PendingMessage>()

export function usePyodideWorker(): {
  run: (code: string) => Promise<RunResult>
  status: RunStatus
} {
  const [status, setStatus] = useState<RunStatus>('idle')
  const isActiveRef = useRef(true)

  useEffect(() => {
    instanceCount++
    return () => {
      instanceCount--
      isActiveRef.current = false
      // Terminate the shared worker only when the last instance unmounts
      if (instanceCount === 0 && sharedWorker) {
        sharedWorker.terminate()
        sharedWorker = null
        pendingMessages.clear()
      }
    }
  }, [])

  const run = async (code: string): Promise<RunResult> => {
    // Lazily create the shared worker on first run() invocation
    if (!sharedWorker) {
      sharedWorker = new Worker('/workers/pyodide.worker.mjs', { type: 'module' })
      sharedWorker.onmessage = (event: MessageEvent) => {
        const data = event.data
        // Status-only message (installing progress) — do NOT resolve the pending promise
        if ('status' in data && data.status === 'installing') {
          if (isActiveRef.current) setStatus('installing')
          return
        }
        // Final result message
        const { id, output, error } = data
        const pending = pendingMessages.get(id)
        if (pending) {
          pendingMessages.delete(id)
          pending.resolve({ output, error })
        }
      }
      if (isActiveRef.current) {
        setStatus('loading')
      }
    }

    const id = ++messageIdCounter
    if (isActiveRef.current) {
      setStatus('running')
    }

    return new Promise<RunResult>((resolve, reject) => {
      pendingMessages.set(id, { resolve, reject })
      sharedWorker!.postMessage({ id, code })
    }).then((result) => {
      if (isActiveRef.current) {
        setStatus('ready')
      }
      return result
    })
  }

  return { run, status }
}
