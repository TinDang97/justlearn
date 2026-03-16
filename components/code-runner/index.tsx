'use client'

import dynamic from 'next/dynamic'
import type { AIPersona } from '@/lib/course-registry'

// CodeMirror accesses `window` — must be imported with ssr: false
const CodeRunnerClient = dynamic(() => import('./code-runner-client').then((m) => m.CodeRunnerClient), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse bg-muted rounded-lg" />
  ),
})

const ExerciseRunnerClient = dynamic(() => import('./exercise-runner').then((m) => m.ExerciseRunner), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse bg-muted rounded-lg" />
  ),
})

type Exercise = {
  id: string
  title: string
  description: string
  starterCode: string
  expectedOutput?: string
  hints?: string[]
}

type CodeRunnerProps = {
  initialCode: string
  exercises?: Exercise[]
  courseSlug?: string
  sectionTitle?: string
  persona?: AIPersona | null
}

export function CodeRunner({ initialCode, exercises, courseSlug, sectionTitle, persona }: CodeRunnerProps) {
  if (exercises && exercises.length > 0) {
    return (
      <ExerciseRunnerClient
        exercises={exercises}
        courseSlug={courseSlug}
        sectionTitle={sectionTitle}
        persona={persona}
      />
    )
  }
  return <CodeRunnerClient initialCode={initialCode} />
}
