'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { LessonMeta } from '@/lib/content'

type MobileSidebarTriggerProps = {
  courseSlug: string
  lessons: LessonMeta[]
  courseTitle: string
}

export function MobileSidebarTrigger({
  courseSlug,
  lessons,
  courseTitle,
}: MobileSidebarTriggerProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open lesson menu">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left text-sm">{courseTitle}</SheetTitle>
          </SheetHeader>
          <nav className="p-4 overflow-y-auto h-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
              Lessons
            </p>
            <ul className="space-y-1">
              {lessons.map((lesson) => {
                const href = `/courses/${courseSlug}/${lesson.slug}`
                const isActive = pathname === href
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      <span className="shrink-0 w-5 text-xs text-muted-foreground mt-0.5">
                        {lesson.lessonNumber}
                      </span>
                      <span className="leading-snug">{lesson.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
