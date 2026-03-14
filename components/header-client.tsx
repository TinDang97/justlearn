'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScrolled } from '@/lib/hooks/use-scrolled'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { SearchDialog } from '@/components/search/SearchDialog'

export function HeaderClient() {
  const pathname = usePathname()
  const scrolled = useScrolled(10)
  const isHome = pathname === '/'

  useEffect(() => {
    const header = document.querySelector('header')
    if (!header) return
    if (scrolled) {
      header.setAttribute('data-scrolled', 'true')
    } else {
      header.removeAttribute('data-scrolled')
    }
  }, [scrolled])

  return (
    <div className="flex items-center gap-2">
      {isHome && (
        <Button asChild size="sm" className="rounded-full">
          <Link href="/courses/python">Start Learning</Link>
        </Button>
      )}
      <SearchDialog />
      <ThemeToggle />
    </div>
  )
}
