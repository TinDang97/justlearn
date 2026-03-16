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
  const percent = progress ? Math.round(progress.progress * 100) : 0
  const activePhase =
    progress?.progress === 1 ? 'ready' : inferPhase(progress?.text)

  return (
    <div className="w-full space-y-3">
      {/* Status text + percentage */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {activePhase === 'ready'
            ? 'AI Ready'
            : activePhase === 'compiling'
              ? 'Compiling model...'
              : activePhase === 'caching'
                ? 'Caching model...'
                : 'Downloading AI model...'}
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">{percent}%</span>
      </div>

      {/* Progress track */}
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          data-testid="progress-fill"
          className="h-3 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.max(percent, 2)}%` }}
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
                  ? 'text-xs font-semibold text-primary'
                  : 'text-xs text-muted-foreground'
              }
            >
              {label}
            </span>
          )
        })}
      </div>

      {/* Progress detail text */}
      {progress?.text && activePhase !== 'ready' && (
        <p className="text-xs text-muted-foreground truncate">{progress.text}</p>
      )}
    </div>
  )
}
