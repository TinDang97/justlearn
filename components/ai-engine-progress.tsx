'use client'

import type { DownloadProgress } from '@/hooks/use-ai-engine'

type Phase = 'downloading' | 'caching' | 'compiling' | 'ready' | null

/**
 * Infers the current download phase from the progress text reported by
 * WebLLM's initProgressCallback. Returns null when no text is provided.
 */
function inferPhase(text: string | undefined): Phase {
  if (!text) return null
  if (/download/i.test(text)) return 'downloading'
  if (/cach|load/i.test(text)) return 'caching'
  if (/compil/i.test(text)) return 'compiling'
  return 'ready'
}

const PHASES: { id: Phase; label: string }[] = [
  { id: 'downloading', label: 'Downloading' },
  { id: 'caching', label: 'Caching' },
  { id: 'compiling', label: 'Compiling' },
  { id: 'ready', label: 'Ready' },
]

export function AIEngineProgress({ progress }: { progress: DownloadProgress | null }) {
  const percent = progress ? progress.progress * 100 : 0
  const activePhase =
    progress?.progress === 1 ? 'ready' : inferPhase(progress?.text)

  return (
    <div className="w-full space-y-2">
      {/* Progress track */}
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          data-testid="progress-fill"
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Phase labels */}
      <div className="flex justify-between">
        {PHASES.map(({ id, label }) => {
          const isActive = activePhase === id
          return (
            <span
              key={id}
              className={
                isActive
                  ? 'text-xs font-medium text-foreground'
                  : 'text-xs text-muted-foreground'
              }
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
