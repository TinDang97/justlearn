'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Download, HardDrive, Cpu, Sparkles, Check } from 'lucide-react'
import type { DownloadProgress } from '@/hooks/use-ai-engine'

type Phase = 'downloading' | 'caching' | 'compiling' | 'ready' | null

function inferPhase(text: string | undefined): Phase {
  if (!text) return null
  if (/download/i.test(text)) return 'downloading'
  if (/cach|load/i.test(text)) return 'caching'
  if (/compil/i.test(text)) return 'compiling'
  return 'ready'
}

const PHASES = [
  { id: 'downloading' as Phase, label: 'Downloading', icon: Download, description: 'Fetching model weights' },
  { id: 'caching' as Phase, label: 'Caching', icon: HardDrive, description: 'Saving to browser' },
  { id: 'compiling' as Phase, label: 'Compiling', icon: Cpu, description: 'Optimizing for GPU' },
  { id: 'ready' as Phase, label: 'Ready', icon: Sparkles, description: 'AI is ready' },
]

function phaseIndex(phase: Phase): number {
  return PHASES.findIndex((p) => p.id === phase)
}

export function AIEngineProgress({ progress }: { progress: DownloadProgress | null }) {
  const percent = progress ? Math.round(progress.progress * 100) : 0
  const activePhase = progress?.progress === 1 ? 'ready' : inferPhase(progress?.text)
  const activeIdx = phaseIndex(activePhase)

  return (
    <div className="w-full space-y-6">
      {/* Animated icon */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase ?? 'idle'}
            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            {activePhase === 'ready' ? (
              <Sparkles className="size-8 text-primary" />
            ) : activePhase === 'compiling' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Cpu className="size-8 text-primary" />
              </motion.div>
            ) : activePhase === 'caching' ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <HardDrive className="size-8 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Download className="size-8 text-primary" />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase ?? 'idle'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-center"
        >
          <p className="text-sm font-medium">
            {activePhase === 'ready'
              ? 'AI Ready!'
              : activePhase === 'compiling'
                ? 'Compiling for your GPU...'
                : activePhase === 'caching'
                  ? 'Caching model locally...'
                  : 'Downloading AI model...'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {activePhase === 'ready'
              ? 'You can start chatting'
              : activePhase === 'compiling'
                ? 'Optimizing shaders for fast inference'
                : activePhase === 'caching'
                  ? 'Saving so you won\'t download again'
                  : `${percent}% complete`}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          data-testid="progress-fill"
          className="h-2 rounded-full bg-primary"
          initial={{ width: '2%' }}
          animate={{ width: `${Math.max(percent, 2)}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Phase stepper */}
      <div className="flex items-center justify-between gap-1">
        {PHASES.map(({ id, label, icon: Icon }, idx) => {
          const isComplete = activeIdx > idx
          const isActive = activeIdx === idx
          const isPending = activeIdx < idx

          return (
            <div key={id} className="flex flex-col items-center gap-1.5 flex-1">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                  isComplete
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-primary/20 text-primary ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                }`}
                animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              >
                {isComplete ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className={`size-4 ${isPending ? 'opacity-40' : ''}`} />
                )}
              </motion.div>
              <span
                className={`text-[10px] leading-tight text-center ${
                  isActive
                    ? 'font-semibold text-primary'
                    : isComplete
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Detail text from WebLLM */}
      {progress?.text && activePhase !== 'ready' && (
        <motion.p
          key={progress.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-muted-foreground text-center truncate"
        >
          {progress.text}
        </motion.p>
      )}
    </div>
  )
}
