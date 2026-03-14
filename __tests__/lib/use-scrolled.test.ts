import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrolled } from '@/lib/hooks/use-scrolled'

describe('useScrolled', () => {
  let scrollListeners: Array<() => void> = []
  let currentScrollY = 0

  beforeEach(() => {
    scrollListeners = []
    currentScrollY = 0

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      get: () => currentScrollY,
      configurable: true,
    })

    // Spy on addEventListener / removeEventListener to capture scroll listeners
    vi.spyOn(window, 'addEventListener').mockImplementation((type, handler, _options) => {
      if (type === 'scroll') {
        scrollListeners.push(handler as () => void)
      }
    })

    vi.spyOn(window, 'removeEventListener').mockImplementation((type, handler) => {
      if (type === 'scroll') {
        scrollListeners = scrollListeners.filter((l) => l !== handler)
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    scrollListeners = []
  })

  it('returns false when scrollY is 0 (below threshold of 10)', () => {
    currentScrollY = 0
    const { result } = renderHook(() => useScrolled(10))
    expect(result.current).toBe(false)
  })

  it('returns true when scrollY is 15 (above threshold of 10)', () => {
    currentScrollY = 15
    const { result } = renderHook(() => useScrolled(10))
    expect(result.current).toBe(true)
  })

  it('returns false when scrollY equals threshold exactly (not strictly greater)', () => {
    currentScrollY = 10
    const { result } = renderHook(() => useScrolled(10))
    expect(result.current).toBe(false)
  })

  it('updates when scroll event fires and scrollY crosses threshold', () => {
    currentScrollY = 0
    const { result } = renderHook(() => useScrolled(10))
    expect(result.current).toBe(false)

    act(() => {
      currentScrollY = 20
      scrollListeners.forEach((l) => l())
    })

    expect(result.current).toBe(true)
  })

  it('cleans up scroll listener on unmount', () => {
    const { unmount } = renderHook(() => useScrolled(10))
    expect(scrollListeners).toHaveLength(1)
    unmount()
    expect(scrollListeners).toHaveLength(0)
  })

  it('uses default threshold of 10 when none provided', () => {
    currentScrollY = 5
    const { result } = renderHook(() => useScrolled())
    expect(result.current).toBe(false)

    act(() => {
      currentScrollY = 11
      scrollListeners.forEach((l) => l())
    })

    expect(result.current).toBe(true)
  })
})
