import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'

beforeEach(() => {
  cleanup()
})

describe('AIHintButton', () => {
  it('renders button with "AI Hint" text', async () => {
    const { AIHintButton } = await import('@/components/ai-hint-button')
    const onHint = vi.fn()
    render(<AIHintButton onHint={onHint} />)
    expect(screen.getByRole('button', { name: /ai hint/i })).toBeInTheDocument()
  })

  it('calls onHint when clicked', async () => {
    const { AIHintButton } = await import('@/components/ai-hint-button')
    const onHint = vi.fn()
    render(<AIHintButton onHint={onHint} />)
    fireEvent.click(screen.getByRole('button', { name: /ai hint/i }))
    expect(onHint).toHaveBeenCalledOnce()
  })

  it('button is disabled when disabled=true', async () => {
    const { AIHintButton } = await import('@/components/ai-hint-button')
    const onHint = vi.fn()
    render(<AIHintButton onHint={onHint} disabled={true} />)
    expect(screen.getByRole('button', { name: /ai hint/i })).toBeDisabled()
  })

  it('button is enabled when disabled is not provided', async () => {
    const { AIHintButton } = await import('@/components/ai-hint-button')
    const onHint = vi.fn()
    render(<AIHintButton onHint={onHint} />)
    expect(screen.getByRole('button', { name: /ai hint/i })).not.toBeDisabled()
  })

  it('renders Sparkles icon inside button', async () => {
    const { AIHintButton } = await import('@/components/ai-hint-button')
    const onHint = vi.fn()
    const { container } = render(<AIHintButton onHint={onHint} />)
    // Lucide renders SVG elements with stroke-width attribute
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('does not call onHint when button is disabled and clicked', async () => {
    const { AIHintButton } = await import('@/components/ai-hint-button')
    const onHint = vi.fn()
    render(<AIHintButton onHint={onHint} disabled={true} />)
    fireEvent.click(screen.getByRole('button', { name: /ai hint/i }))
    expect(onHint).not.toHaveBeenCalled()
  })
})
