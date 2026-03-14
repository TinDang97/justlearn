'use client'

import dynamic from 'next/dynamic'

// CodeMirror accesses `window` — must be imported with ssr: false
const CodeRunnerClient = dynamic(() => import('./code-runner-client').then((m) => m.CodeRunnerClient), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse bg-muted rounded-lg" />
  ),
})

type CodeRunnerProps = {
  initialCode: string
}

export function CodeRunner({ initialCode }: CodeRunnerProps) {
  return <CodeRunnerClient initialCode={initialCode} />
}
