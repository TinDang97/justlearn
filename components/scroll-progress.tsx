'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number

    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const max = el.scrollHeight - el.clientHeight
      const pct = max > 0 ? scrolled / max : 0

      if (barRef.current) {
        barRef.current.style.width = `${pct * 100}%`
      }

      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed left-0 z-50 h-[3px] w-0 bg-[var(--color-primary)]"
      style={{ top: '64px' }}
    />
  )
}
