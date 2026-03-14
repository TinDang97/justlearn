'use client'
import { useState, useEffect } from 'react'

export function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initialize with current scroll position
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
