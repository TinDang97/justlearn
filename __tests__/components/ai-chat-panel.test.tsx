import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import type { AIEngineStatus } from '@/hooks/use-ai-engine'
import type { ChatMessage, LessonContext, RetrievedChunk } from '@/lib/store/chat'
import type { AIPersona } from '@/lib/course-registry'

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock('streamdown', () => ({
  Streamdown: ({ children }: { children: string }) =>
    React.createElement('div', { 'data-testid': 'streamdown' }, children),
}))

vi.mock('streamdown/styles.css', () => ({}))

// Mock Sheet primitives to render children directly (no portal, no animation)
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'sheet' }, children) : null,
  SheetContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'sheet-content' }, children),
  SheetHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'sheet-header' }, children),
  SheetTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', { 'data-testid': 'sheet-title' }, children),
}))

vi.mock('@/components/ai-engine-progress', () => ({
  AIEngineProgress: ({ progress }: { progress: unknown }) =>
    React.createElement('div', {
      'data-testid': 'engine-progress',
      'data-progress': JSON.stringify(progress),
    }),
}))

vi.mock('@/components/ai-message', () => ({
  AIMessage: ({ message, personaName }: { message: ChatMessage; personaName: string }) =>
    React.createElement(
      'div',
      { 'data-testid': 'ai-message', 'data-persona': personaName },
      message.content
    ),
}))

// ─── Test persona ─────────────────────────────────────────────────────────────

const TEST_PERSONA: AIPersona = {
  name: 'Alex',
  modelId: 'test-model-id',
  systemPrompt: 'You are Alex...',
}

// ─── Mutable engine/store configs ────────────────────────────────────────────

const mockGetEngine = vi.fn().mockResolvedValue({})
const mockRetrieveContext = vi.fn<(query: string, k?: number) => Promise<RetrievedChunk[]>>()
  .mockResolvedValue([])
const mockSetLessonContext = vi.fn<(ctx: LessonContext) => void>()
const mockClosePanel = vi.fn()
const mockSendMessage = vi.fn().mockResolvedValue(undefined)

const mockRequestDownload = vi.fn()

type EngineConfig = {
  getEngine: () => Promise<unknown>
  requestDownload: () => void
  status: AIEngineStatus
  downloadProgress: { progress: number; text: string } | null
}

let aiEngineConfig: EngineConfig = {
  getEngine: mockGetEngine,
  requestDownload: mockRequestDownload,
  status: 'ready' as AIEngineStatus,
  downloadProgress: null,
}

let storeMessages: ChatMessage[] = []
let storeIsOpen = true

vi.mock('@/hooks/use-ai-engine', () => ({
  useAIEngine: vi.fn(() => aiEngineConfig),
}))

vi.mock('@/hooks/use-rag', () => ({
  useRAG: vi.fn(() => ({
    buildIndex: vi.fn(),
    retrieveContext: mockRetrieveContext,
    status: 'ready',
  })),
}))

vi.mock('@/lib/store/chat', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatStore: vi.fn((selector?: (s: any) => unknown) => {
    const state = {
      messages: storeMessages,
      isOpen: storeIsOpen,
      lessonContext: null,
      setLessonContext: mockSetLessonContext,
      openPanel: vi.fn(),
      closePanel: mockClosePanel,
      sendMessage: mockSendMessage,
      sendHint: vi.fn(),
      clearMessages: vi.fn(),
    }
    if (typeof selector === 'function') return selector(state)
    return state
  }),
}))

// ─── Import hooks for vi.mocked() ────────────────────────────────────────────

import { useAIEngine } from '@/hooks/use-ai-engine'
import { useChatStore } from '@/lib/store/chat'

// ─── Helper to rebuild store mock with current state vars ─────────────────────

function rebuildStoreMock() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useChatStore).mockImplementation((selector?: (s: any) => unknown) => {
    const state = {
      messages: storeMessages,
      isOpen: storeIsOpen,
      lessonContext: null,
      setLessonContext: mockSetLessonContext,
      openPanel: vi.fn(),
      closePanel: mockClosePanel,
      sendMessage: mockSendMessage,
      sendHint: vi.fn(),
      clearMessages: vi.fn(),
    }
    if (typeof selector === 'function') return selector(state)
    return state
  })
}

// ─── Default props helper ─────────────────────────────────────────────────────

function defaultProps() {
  return {
    courseSlug: 'python',
    lessonTitle: 'Introduction to Python',
    sectionTitle: 'Fundamentals',
    persona: TEST_PERSONA,
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AIChatPanel', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()

    // Reset to defaults
    aiEngineConfig = {
      getEngine: mockGetEngine,
      status: 'ready',
      downloadProgress: null,
    }
    storeMessages = []
    storeIsOpen = true

    vi.mocked(useAIEngine).mockImplementation(() => aiEngineConfig)
    rebuildStoreMock()
  })

  it('renders the panel when isOpen is true', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.getByTestId('sheet')).toBeTruthy()
  })

  it('does not render the sheet when isOpen is false', async () => {
    storeIsOpen = false
    rebuildStoreMock()
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.queryByTestId('sheet')).toBeNull()
  })

  it('renders persona name in the header', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.getByText('Ask Alex')).toBeTruthy()
  })

  it('shows engine progress when status is loading', async () => {
    aiEngineConfig = {
      getEngine: mockGetEngine,
      status: 'loading',
      downloadProgress: { progress: 0.5, text: 'Downloading...' },
    }
    vi.mocked(useAIEngine).mockImplementation(() => aiEngineConfig)
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.getByTestId('engine-progress')).toBeTruthy()
  })

  it('does not show engine progress when status is ready', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.queryByTestId('engine-progress')).toBeNull()
  })

  it('renders AIMessage for each message in the store', async () => {
    storeMessages = [
      { role: 'user', content: 'Hello AI', streaming: false, citations: [] },
      { role: 'assistant', content: 'Hello student', streaming: false, citations: [] },
    ]
    rebuildStoreMock()
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    const messages = screen.getAllByTestId('ai-message')
    expect(messages).toHaveLength(2)
    expect(messages[0].textContent).toBe('Hello AI')
    expect(messages[1].textContent).toBe('Hello student')
  })

  it('shows error alert when engine status is error', async () => {
    aiEngineConfig = { ...aiEngineConfig, status: 'error' }
    vi.mocked(useAIEngine).mockImplementation(() => aiEngineConfig)
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Failed to load AI model')).toBeTruthy()
  })

  it('shows unsupported message when engine status is unsupported', async () => {
    aiEngineConfig = { ...aiEngineConfig, status: 'unsupported' }
    vi.mocked(useAIEngine).mockImplementation(() => aiEngineConfig)
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByText('WebGPU not supported')).toBeTruthy()
  })

  it('hides input when engine status is unsupported', async () => {
    aiEngineConfig = { ...aiEngineConfig, status: 'unsupported' }
    vi.mocked(useAIEngine).mockImplementation(() => aiEngineConfig)
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('input is enabled when engine status is ready', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.disabled).toBe(false)
  })

  it('send button is disabled when input is empty', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    const sendButton = screen.getByRole('button', { name: /send/i }) as HTMLButtonElement
    expect(sendButton.disabled).toBe(true)
  })

  it('submitting the form calls sendMessage with correct arguments', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'What is a variable?' } })

    const form = input.closest('form')!
    fireEvent.submit(form)

    expect(mockSendMessage).toHaveBeenCalledWith(
      'What is a variable?',
      mockGetEngine,
      mockRetrieveContext,
      TEST_PERSONA
    )
  })

  it('input clears after submission', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'What is a list?' } })
    expect(input.value).toBe('What is a list?')

    const form = input.closest('form')!
    fireEvent.submit(form)

    expect(input.value).toBe('')
  })

  it('calls setLessonContext on mount with correct lesson data', async () => {
    const { AIChatPanel } = await import('@/components/ai-chat-panel')
    render(<AIChatPanel {...defaultProps()} />)
    expect(mockSetLessonContext).toHaveBeenCalledWith({
      title: 'Introduction to Python',
      sectionTitle: 'Fundamentals',
      courseSlug: 'python',
    })
  })
})
