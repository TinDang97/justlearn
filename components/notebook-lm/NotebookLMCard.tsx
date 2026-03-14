import { ExternalLink } from 'lucide-react'
import { NOTEBOOK_URLS, isNotebookUrlValid } from '@/lib/notebook-urls'

type NotebookLMCardProps = {
  courseSlug: string
}

export function NotebookLMCard({ courseSlug }: NotebookLMCardProps) {
  const url = NOTEBOOK_URLS[courseSlug]

  if (!isNotebookUrlValid(url)) {
    return null
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden="true">🧠</span>
        <h3 className="text-lg font-semibold">AI Study Assistant</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Ask questions about this course in plain language. NotebookLM is a free Google AI tool that
        answers based on the actual course materials — not the wider internet. It can summarize
        lessons, explain concepts, and quiz you on what you&apos;ve learned.
      </p>

      <p className="text-sm text-muted-foreground mb-4">
        You&apos;ll need a Google account to access it.
      </p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Open in NotebookLM
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  )
}
