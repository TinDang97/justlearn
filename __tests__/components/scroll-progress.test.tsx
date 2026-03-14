import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import React from 'react'

const rafSpy = vi.fn((cb: FrameRequestCallback) => {
  return 1
})
const cafSpy = vi.fn()

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', rafSpy)
  vi.stubGlobal('cancelAnimationFrame', cafSpy)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  rafSpy.mockClear()
  cafSpy.mockClear()
})

describe('ScrollProgress', () => {
  it('renders a div with aria-hidden="true"', async () => {
    const { ScrollProgress } = await import('@/components/scroll-progress')
    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('[aria-hidden="true"]')
    expect(bar).not.toBeNull()
  })

  it('renders a div with z-50 class', async () => {
    const { ScrollProgress } = await import('@/components/scroll-progress')
    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('.z-50')
    expect(bar).not.toBeNull()
  })

  it('renders a div with fixed position class', async () => {
    const { ScrollProgress } = await import('@/components/scroll-progress')
    const { container } = render(<ScrollProgress />)
    const bar = container.querySelector('.fixed')
    expect(bar).not.toBeNull()
  })

  it('calls requestAnimationFrame on mount', async () => {
    const { ScrollProgress } = await import('@/components/scroll-progress')
    render(<ScrollProgress />)
    expect(rafSpy).toHaveBeenCalled()
  })

  it('calls cancelAnimationFrame on unmount', async () => {
    const { ScrollProgress } = await import('@/components/scroll-progress')
    const { unmount } = render(<ScrollProgress />)
    unmount()
    expect(cafSpy).toHaveBeenCalled()
  })
})
