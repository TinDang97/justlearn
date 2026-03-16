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

  it('highlights active phase with font-semibold when downloading', () => {
    render(<AIEngineProgress progress={{ progress: 0.1, text: 'Downloading model weights...' }} />)
    const label = screen.getByText('Downloading')
    expect(label.className).toContain('font-semibold')
  })

  it('shows status text for downloading phase', () => {
    render(<AIEngineProgress progress={{ progress: 0.3, text: 'Downloading shard 2/10...' }} />)
    expect(screen.getByText('Downloading AI model...')).toBeDefined()
  })

  it('shows percentage in text for downloading', () => {
    render(<AIEngineProgress progress={{ progress: 0.75, text: 'Downloading...' }} />)
    expect(screen.getByText('75% complete')).toBeDefined()
  })

  it('shows compiling status text', () => {
    render(<AIEngineProgress progress={{ progress: 0.8, text: 'Compiling shaders...' }} />)
    expect(screen.getByText('Compiling for your GPU...')).toBeDefined()
  })

  it('shows ready status when progress is 1', () => {
    render(<AIEngineProgress progress={{ progress: 1, text: 'Ready' }} />)
    expect(screen.getByText('AI Ready!')).toBeDefined()
  })

  it('shows detail text from WebLLM callback', () => {
    render(<AIEngineProgress progress={{ progress: 0.3, text: 'Downloading shard 2/10...' }} />)
    expect(screen.getByText('Downloading shard 2/10...')).toBeDefined()
  })

  it('renders progress bar with data-testid', () => {
    render(<AIEngineProgress progress={{ progress: 0.5, text: 'Downloading...' }} />)
    const bar = document.querySelector('[data-testid="progress-fill"]')
    expect(bar).not.toBeNull()
  })

  it('marks completed phases with check icons', () => {
    render(<AIEngineProgress progress={{ progress: 0.8, text: 'Compiling shaders...' }} />)
    // Downloading and Caching should be complete (have font-medium)
    const downloadLabel = screen.getByText('Downloading')
    expect(downloadLabel.className).toContain('font-medium')
    const cachingLabel = screen.getByText('Caching')
    expect(cachingLabel.className).toContain('font-medium')
  })
})
