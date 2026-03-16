import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AIEngineProgress } from '@/components/ai-engine-progress'

describe('AIEngineProgress', () => {
  it('renders 4 phase labels: Downloading, Caching, Compiling, Ready', () => {
    render(<AIEngineProgress progress={null} />)
    expect(screen.getByText('Downloading')).toBeDefined()
    expect(screen.getByText('Caching')).toBeDefined()
    expect(screen.getByText('Compiling')).toBeDefined()
    expect(screen.getByText('Ready')).toBeDefined()
  })

  it('highlights "Downloading" when progressText contains "download"', () => {
    render(<AIEngineProgress progress={{ progress: 0.1, text: 'Downloading model weights...' }} />)
    const label = screen.getByText('Downloading')
    expect(label.className).toContain('font-medium')
  })

  it('highlights "Caching" when progressText contains "cache"', () => {
    render(<AIEngineProgress progress={{ progress: 0.5, text: 'Caching model data...' }} />)
    const label = screen.getByText('Caching')
    expect(label.className).toContain('font-medium')
  })

  it('highlights "Caching" when progressText contains "load"', () => {
    render(<AIEngineProgress progress={{ progress: 0.6, text: 'Loading from cache...' }} />)
    const label = screen.getByText('Caching')
    expect(label.className).toContain('font-medium')
  })

  it('highlights "Compiling" when progressText contains "compil"', () => {
    render(<AIEngineProgress progress={{ progress: 0.8, text: 'Compiling shaders...' }} />)
    const label = screen.getByText('Compiling')
    expect(label.className).toContain('font-medium')
  })

  it('highlights "Ready" when progress is 1', () => {
    render(<AIEngineProgress progress={{ progress: 1, text: 'Ready' }} />)
    const label = screen.getByText('Ready')
    expect(label.className).toContain('font-medium')
  })

  it('reflects progress bar width based on progress prop (0-1 scale as percentage)', () => {
    render(<AIEngineProgress progress={{ progress: 0.75, text: 'Downloading...' }} />)
    const bar = document.querySelector('[data-testid="progress-fill"]') as HTMLElement
    expect(bar).not.toBeNull()
    expect(bar.style.width).toBe('75%')
  })

  it('renders with 0% width and no phase highlighted when progress is null', () => {
    render(<AIEngineProgress progress={null} />)
    const bar = document.querySelector('[data-testid="progress-fill"]') as HTMLElement
    expect(bar).not.toBeNull()
    expect(bar.style.width).toBe('0%')
    // No labels should have font-medium active class
    const labels = ['Downloading', 'Caching', 'Compiling', 'Ready']
    for (const label of labels) {
      const el = screen.getByText(label)
      expect(el.className).not.toContain('font-medium')
    }
  })
})
