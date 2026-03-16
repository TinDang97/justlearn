'use client'

export function WebGPUFallback({ notebookLmUrl }: { notebookLmUrl: string }) {
  return (
    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">In-browser AI not available</p>
      <p className="mt-1">
        Your browser does not support WebGPU. Use{' '}
        <a
          href={notebookLmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          NotebookLM
        </a>{' '}
        for AI assistance with this course.
      </p>
    </div>
  )
}
