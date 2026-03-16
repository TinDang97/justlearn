import Image from 'next/image'
import Link from 'next/link'
import { HeaderClient } from '@/components/header-client'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 [&[data-scrolled]]:backdrop-blur-sm [&[data-scrolled]]:bg-background/80 [&[data-scrolled]]:border-b [&[data-scrolled]]:border-border">
      <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg hover:text-muted-foreground transition-colors"
        >
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md"
            aria-hidden="true"
          />
          JustLearn
        </Link>
        <HeaderClient />
      </div>
    </header>
  )
}
