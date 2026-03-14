import Link from 'next/link'
import { Button } from '@/components/ui/button'

type HeroSectionProps = {
  courseSlug: string
}

export function HeroSection({ courseSlug }: HeroSectionProps) {
  return (
    <section className="py-24 pb-16 text-center">
      {/* Overline badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-medium mb-6">
        Free · 120+ lessons · Complete beginner friendly
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-[14ch] mx-auto mb-4">
        Learn Python from Zero to Confident
      </h1>

      {/* Subheading */}
      <p className="text-lg text-muted-foreground max-w-[50ch] mx-auto mb-8">
        A free, structured course that takes you from &ldquo;what is code?&rdquo; to building
        real programs. No prerequisites. No overwhelm. Just learn.
      </p>

      {/* CTA group */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="h-12 px-8 rounded-lg">
          <Link href={`/courses/${courseSlug}`}>Start the Course</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-lg">
          <Link href={`/courses/${courseSlug}`}>Browse Lessons</Link>
        </Button>
      </div>
    </section>
  )
}
