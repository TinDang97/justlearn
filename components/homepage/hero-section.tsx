import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="py-24 pb-16 text-center">
      {/* Overline badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-medium mb-6">
        Free · 2 courses · Learn at your own pace
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-[14ch] mx-auto mb-4">
        Learn Programming and Data Skills
      </h1>

      {/* Subheading */}
      <p className="text-lg text-muted-foreground max-w-[50ch] mx-auto mb-8">
        Structured courses that take you from beginner to job-ready. Interactive practice, visual
        mindmaps, AI assistance. No prerequisites to start.
      </p>

      {/* CTA group */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="h-12 px-8 rounded-lg">
          <Link href="/courses">Browse Courses</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-lg">
          <Link href="/courses/python">Start Python</Link>
        </Button>
      </div>
    </section>
  )
}
