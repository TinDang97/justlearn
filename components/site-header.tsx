import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
        <Link
          href="/courses"
          className="font-semibold text-lg hover:text-muted-foreground transition-colors"
        >
          Python Lessons
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
