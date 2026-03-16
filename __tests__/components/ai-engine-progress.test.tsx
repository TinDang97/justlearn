import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AIEngineProgress } from '@/components/ai-engine-progress'

afterEach(() => {
  cleanup()
})

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
    expect(label.className).toContain('font-semibold')
    expect(label.className).toContain('text-primary')
  })

  it('highlights "Caching" when progressText contains "cache"', () => {
    render(<AIEngineProgress progress={{ progress: 0.5, text: 'Caching model data...' }} />)
    const label = screen.getByText('Caching')
    expect(label.className).toContain('font-semibold')
  })

  it('highlights "Caching" when progressText contains "load"', () => {
    render(<AIEngineProgress progress={{ progress: 0.6, text: 'Loading from cache...' }} />)
    const label = screen.getByText('Caching')
    expect(label.className).toContain('font-semibold')
  })

  it('highlights "Compiling" when progressText contains "compil"', () => {
    render(<AIEngineProgress progress={{ progress: 0.8, text: 'Compiling shaders...' }} />)
    const label = screen.getByText('Compiling')
    expect(label.className).toContain('font-semibold')
  })

  it('highlights "Ready" when progress is 1', () => {
    render(<AIEngineProgress progress={{ progress: 1, text: 'Ready' }} />)
    const label = screen.getByText('Ready')
    expect(label.className).toContain('font-semibold')
  })

  it('shows percentage text', () => {
    render(<AIEngineProgress progress={{ progress: 0.75, text: 'Downloading...' }} />)
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('shows status text for downloading phase', () => {
    render(<AIEngineProgress progress={{ progress: 0.3, text: 'Downloading shard 2/10...' }} />)
    expect(screen.getByText('Downloading AI model...')).toBeDefined()
  })

  it('shows detail text from WebLLM callback', () => {
    render(<AIEngineProgress progress={{ progress: 0.3, text: 'Downloading shard 2/10...' }} />)
    expect(screen.getByText('Downloading shard 2/10...')).toBeDefined()
  })

  it('reflects progress bar width based on progress prop', () => {
    render(<AIEngineProgress progress={{ progress: 0.75, text: 'Downloading...' }} />)
    const bar = document.querySelector('[data-testid="progress-fill"]') as HTMLElement
    expect(bar).not.toBeNull()
    expect(bar.style.width).toBe('75%')
  })

  it('renders with minimum 2% width when progress is null', () => {
    render(<AIEngineProgress progress={null} />)
    const bar = document.querySelector('[data-testid="progress-fill"]') as HTMLElement
    expect(bar).not.toBeNull()
    expect(bar.style.width).toBe('2%')
    // No labels should have font-semibold active class
    const labels = ['Downloading', 'Caching', 'Compiling', 'Ready']
    for (const label of labels) {
      const el = screen.getByText(label)
      expect(el.className).not.toContain('font-semibold')
    }
  })
})
