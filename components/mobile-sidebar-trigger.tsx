'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, CheckCircle2, Circle, ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { Section } from '@/lib/content'
import { useProgressStore } from '@/lib/store/progress'

type MobileSidebarTriggerProps = {
  courseSlug: string
  sections: Section[]
  courseTitle: string
}

export function MobileSidebarTrigger({
  courseSlug,
  sections,
  courseTitle,
}: MobileSidebarTriggerProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isComplete = useProgressStore((s) => s.isComplete)

  // Determine which section contains the active lesson
  const activeSectionSlug = sections.find((section) =>
    section.lessons.some(
      (lesson) => pathname === `/courses/${courseSlug}/${lesson.slug}`
    )
  )?.slug ?? null

  // Track open/closed state for each section in the sheet
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach((section) => {
      initial[section.slug] = section.slug === activeSectionSlug
    })
    return initial
  })

  const toggleSection = (slug: string) => {
    setOpenSections((prev) => ({ ...prev, [slug]: !prev[slug] }))
  }

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
            <div className="space-y-2">
              {sections.map((section) => {
                const isOpen = openSections[section.slug] ?? false

                return (
                  <Collapsible.Root
                    key={section.slug}
                    open={isOpen}
                    onOpenChange={() => toggleSection(section.slug)}
                  >
                    <Collapsible.Trigger className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-accent/50 rounded-md transition-colors group">
                      <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title}
                      </span>
                      <ChevronDown
                        size={12}
                        className={cn(
                          'shrink-0 text-muted-foreground transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <ul className="space-y-0.5 mt-1">
                        {section.lessons.map((lesson) => {
                          const href = `/courses/${courseSlug}/${lesson.slug}`
                          const isActive = pathname === href
                          const completed = isComplete(courseSlug, lesson.slug)
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
                                {completed ? (
                                  <CheckCircle2
                                    className="shrink-0 mt-0.5 text-green-500 dark:text-green-400"
                                    size={14}
                                    aria-label="Completed"
                                  />
                                ) : (
                                  <Circle
                                    className="shrink-0 mt-0.5 text-muted-foreground"
                                    size={14}
                                    aria-label="Not started"
                                  />
                                )}
                                <span className="shrink-0 w-5 text-xs text-muted-foreground mt-0.5">
                                  {lesson.lessonNumber}
                                </span>
                                <span className="leading-snug">{lesson.title}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </Collapsible.Content>
                  </Collapsible.Root>
                )
              })}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
