'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CourseRecommendationBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <div
      role="banner"
      className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3"
    >
      <GraduationCap className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />

      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-1">Ready for the next step?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          You&apos;ve completed the Python course. Continue your journey with Data Engineering.
        </p>
        <Button asChild size="sm">
          <Link href="/courses/data-engineering">Explore Data Engineering →</Link>
        </Button>
      </div>

      <button
        aria-label="Dismiss recommendation"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
