import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function PrerequisiteNotice() {
  return (
    <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3 mb-6">
      <BookOpen size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
          Prerequisite: Python Course
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
          This course assumes Python knowledge. We recommend completing the Python course first.
        </p>
        <Link
          href="/courses/python"
          className="text-sm font-medium underline underline-offset-4 text-amber-700 dark:text-amber-400 hover:text-amber-900"
        >
          Start Python Course →
        </Link>
      </div>
    </aside>
  )
}
