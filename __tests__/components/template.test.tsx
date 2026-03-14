import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

// Mock motion/react so motion.div renders as a regular div with a testid
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(
      (
        { children, ...props }: { children?: React.ReactNode; [key: string]: unknown },
        ref: React.Ref<HTMLDivElement>
      ) =>
        React.createElement(
          'div',
          { 'data-testid': 'motion-div', ref, ...props },
          children
        )
    ),
  },
}))

afterEach(() => {
  cleanup()
})

describe('Template (page transition wrapper)', () => {
  it('renders children inside a motion.div wrapper', async () => {
    const mod = await import('@/app/template')
    const Template = mod.default
    render(
      React.createElement(Template, null, React.createElement('span', { 'data-testid': 'child-content' }, 'Hello'))
    )
    // Use getAllByTestId in case of accumulated renders
    const motionDivs = screen.getAllByTestId('motion-div')
    expect(motionDivs.length).toBeGreaterThan(0)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('motion.div wrapper contains the children text', async () => {
    const mod = await import('@/app/template')
    const Template = mod.default
    const { container } = render(React.createElement(Template, null, 'Page content'))
    // The container's first div is the motion.div wrapper
    expect(container.querySelector('[data-testid="motion-div"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent).toBe('Page content')
  })
})
