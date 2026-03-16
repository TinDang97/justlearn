import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

// Mock streamdown module
vi.mock('streamdown', () => ({
  Streamdown: ({ children, isAnimating }: { children: string; isAnimating: boolean }) =>
    React.createElement('div', { 'data-testid': 'streamdown', 'data-animating': isAnimating }, children),
}))

// Mock streamdown/styles.css (no styles in test)
vi.mock('streamdown/styles.css', () => ({}))

import type { ChatMessage } from '@/lib/store/chat'

const USER_MESSAGE: ChatMessage = {
  role: 'user',
  content: 'What is a variable?',
  streaming: false,
  citations: [],
}

const ASSISTANT_STREAMING: ChatMessage = {
  role: 'assistant',
  content: 'A variable is...',
  streaming: true,
  citations: [],
}

const ASSISTANT_DONE: ChatMessage = {
  role: 'assistant',
  content: 'A variable stores data.',
  streaming: false,
  citations: [
    { text: 'Variables store data', heading: 'Variables', lessonTitle: 'Lesson 1: Variables' },
    { text: 'Types include int, str', heading: 'Data Types', lessonTitle: 'Lesson 2: Types' },
  ],
}

const ASSISTANT_DONE_NO_CITATIONS: ChatMessage = {
  role: 'assistant',
  content: 'A variable stores data.',
  streaming: false,
  citations: [],
}

describe('AIMessage', () => {
  beforeEach(() => {
    cleanup()
  })

  describe('user messages', () => {
    it('renders user message content as text', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={USER_MESSAGE} personaName="Pythia" />)
      expect(screen.getByText('What is a variable?')).toBeTruthy()
    })

    it('user message is right-aligned (has text-right or self-end or justify-end)', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      const { container } = render(<AIMessage message={USER_MESSAGE} personaName="Pythia" />)
      const wrapper = container.firstChild as HTMLElement
      // Should have right-alignment class
      const html = wrapper.outerHTML
      expect(html).toMatch(/items-end|justify-end|text-right|ml-auto|self-end/)
    })

    it('does not render Streamdown for user messages', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={USER_MESSAGE} personaName="Pythia" />)
      expect(screen.queryByTestId('streamdown')).toBeNull()
    })

    it('does not render citations for user messages', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={USER_MESSAGE} personaName="Pythia" />)
      expect(screen.queryByText(/Sources/)).toBeNull()
    })
  })

  describe('assistant messages', () => {
    it('renders Streamdown component for assistant messages', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_STREAMING} personaName="Pythia" />)
      expect(screen.getByTestId('streamdown')).toBeTruthy()
    })

    it('passes isAnimating=true to Streamdown when streaming', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_STREAMING} personaName="Pythia" />)
      const streamdown = screen.getByTestId('streamdown')
      expect(streamdown.getAttribute('data-animating')).toBe('true')
    })

    it('passes isAnimating=false to Streamdown when not streaming', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_DONE} personaName="Pythia" />)
      const streamdown = screen.getByTestId('streamdown')
      expect(streamdown.getAttribute('data-animating')).toBe('false')
    })

    it('renders message content inside Streamdown', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_DONE} personaName="Pythia" />)
      expect(screen.getByText('A variable stores data.')).toBeTruthy()
    })

    it('renders persona name label above assistant message', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_DONE} personaName="Pythia" />)
      expect(screen.getByText('Pythia')).toBeTruthy()
    })
  })

  describe('citations', () => {
    it('renders citations when streaming:false and citations.length > 0', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_DONE} personaName="Pythia" />)
      expect(screen.getByText(/Sources/)).toBeTruthy()
    })

    it('shows each citation as "lessonTitle > heading"', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_DONE} personaName="Pythia" />)
      expect(screen.getByText(/Lesson 1: Variables.*Variables|Variables.*Lesson 1: Variables/)).toBeTruthy()
    })

    it('does NOT render citations when streaming:true even if citations present', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      const streamingWithCitations: ChatMessage = {
        ...ASSISTANT_DONE,
        streaming: true,
      }
      render(<AIMessage message={streamingWithCitations} personaName="Pythia" />)
      expect(screen.queryByText(/Sources/)).toBeNull()
    })

    it('does NOT render citations when citations array is empty', async () => {
      const { AIMessage } = await import('@/components/ai-message')
      render(<AIMessage message={ASSISTANT_DONE_NO_CITATIONS} personaName="Pythia" />)
      expect(screen.queryByText(/Sources/)).toBeNull()
    })
  })
})
