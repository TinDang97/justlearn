import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

// ============================================================
// Mocks
// ============================================================

vi.mock('@/lib/build-system-prompt', () => ({
  buildSystemPrompt: vi.fn(() => 'mocked system prompt'),
}))

import { buildSystemPrompt } from '@/lib/build-system-prompt'
import type { RetrievedChunk } from '@/lib/build-system-prompt'

const FAKE_CHUNKS: RetrievedChunk[] = [
  { text: 'Variables store data', heading: 'Variables', lessonTitle: 'Lesson 1: Variables' },
  { text: 'Functions are reusable', heading: 'Functions', lessonTitle: 'Lesson 2: Functions' },
]

const FAKE_PERSONA = {
  name: 'Pythia',
  modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  systemPrompt: 'You are Pythia, a Python tutor.',
}

const FAKE_LESSON_CONTEXT = {
  title: 'Variables and Data Types',
  sectionTitle: 'Python Basics',
  courseSlug: 'python',
}

// Creates an async generator that yields the given delta strings
async function* makeStream(deltas: string[]) {
  for (const delta of deltas) {
    yield { choices: [{ delta: { content: delta } }] }
  }
}

function makeEngine(deltas: string[] = ['Hello', ' world', '!']) {
  return {
    chat: {
      completions: {
        create: vi.fn().mockReturnValue(makeStream(deltas)),
      },
    },
  }
}

function makeRetrieveContext(chunks = FAKE_CHUNKS) {
  return vi.fn().mockResolvedValue(chunks)
}

// ============================================================
// Tests
// ============================================================

describe('useChatStore', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset store between tests using dynamic import to get fresh reference
    const { useChatStore } = await import('@/lib/store/chat')
    useChatStore.setState({ messages: [], isOpen: false, lessonContext: null })
  })

  describe('openPanel / closePanel', () => {
    it('starts with isOpen: false', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      expect(useChatStore.getState().isOpen).toBe(false)
    })

    it('openPanel sets isOpen to true', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      act(() => {
        useChatStore.getState().openPanel()
      })
      expect(useChatStore.getState().isOpen).toBe(true)
    })

    it('closePanel sets isOpen to false', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      act(() => {
        useChatStore.getState().openPanel()
        useChatStore.getState().closePanel()
      })
      expect(useChatStore.getState().isOpen).toBe(false)
    })
  })

  describe('setLessonContext', () => {
    it('starts with lessonContext: null', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      expect(useChatStore.getState().lessonContext).toBeNull()
    })

    it('updates lessonContext', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      act(() => {
        useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      })
      expect(useChatStore.getState().lessonContext).toEqual(FAKE_LESSON_CONTEXT)
    })
  })

  describe('clearMessages', () => {
    it('resets messages to empty array', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      // Add a message first
      useChatStore.setState({
        messages: [{ role: 'user', content: 'Hello', streaming: false, citations: [] }],
      })
      act(() => {
        useChatStore.getState().clearMessages()
      })
      expect(useChatStore.getState().messages).toHaveLength(0)
    })
  })

  describe('sendMessage', () => {
    it('adds user message with streaming:false and no citations', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['answer'])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('test question', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      const messages = useChatStore.getState().messages
      const userMsg = messages.find((m) => m.role === 'user')
      expect(userMsg).toBeDefined()
      expect(userMsg!.role).toBe('user')
      expect(userMsg!.content).toBe('test question')
      expect(userMsg!.streaming).toBe(false)
      expect(userMsg!.citations).toEqual([])
    })

    it('adds assistant message that ends with streaming:false after completion', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['answer'])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('test', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg).toBeDefined()
      // After completion streaming should be false
      expect(assistantMsg!.streaming).toBe(false)
      expect(assistantMsg!.role).toBe('assistant')
    })

    it('accumulates streaming deltas into assistant message content', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['Hello', ' world', '!'])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('test', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg!.content).toBe('Hello world!')
    })

    it('sets streaming:false after stream completes', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['Done'])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('test', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg!.streaming).toBe(false)
    })

    it('attaches citations from RAG to assistant message after stream completes', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['answer'])
      const retrieveContext = makeRetrieveContext(FAKE_CHUNKS)

      await act(async () => {
        await useChatStore.getState().sendMessage('variables', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg!.citations).toEqual(FAKE_CHUNKS)
    })

    it('calls retrieveContext with query, engine, and k=3', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine([])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('variables', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      expect(retrieveContext).toHaveBeenCalledWith('variables', engine, 3)
    })

    it('calls buildSystemPrompt with persona, lessonContext, and ragChunks', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine([])
      const retrieveContext = makeRetrieveContext(FAKE_CHUNKS)

      await act(async () => {
        await useChatStore.getState().sendMessage('variables', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      expect(buildSystemPrompt).toHaveBeenCalledWith(FAKE_PERSONA, FAKE_LESSON_CONTEXT, FAKE_CHUNKS)
    })

    it('preserves conversation history across multiple sendMessage calls', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('first question', () => Promise.resolve(makeEngine(['first answer'])), retrieveContext, FAKE_PERSONA)
      })

      await act(async () => {
        await useChatStore.getState().sendMessage('second question', () => Promise.resolve(makeEngine(['second answer'])), retrieveContext, FAKE_PERSONA)
      })

      const messages = useChatStore.getState().messages
      // Should have: user1, assistant1, user2, assistant2
      expect(messages).toHaveLength(4)
      expect(messages[0].content).toBe('first question')
      expect(messages[1].content).toBe('first answer')
      expect(messages[2].content).toBe('second question')
      expect(messages[3].content).toBe('second answer')
    })

    it('caps conversation history at last 6 messages before passing to engine', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const retrieveContext = makeRetrieveContext([])

      // Pre-populate with 8 messages (4 exchanges) = more than 6 cap
      useChatStore.setState({
        messages: [
          { role: 'user', content: 'q1', streaming: false, citations: [] },
          { role: 'assistant', content: 'a1', streaming: false, citations: [] },
          { role: 'user', content: 'q2', streaming: false, citations: [] },
          { role: 'assistant', content: 'a2', streaming: false, citations: [] },
          { role: 'user', content: 'q3', streaming: false, citations: [] },
          { role: 'assistant', content: 'a3', streaming: false, citations: [] },
          { role: 'user', content: 'q4', streaming: false, citations: [] },
          { role: 'assistant', content: 'a4', streaming: false, citations: [] },
        ],
        lessonContext: FAKE_LESSON_CONTEXT,
      })

      const capturedMessages: unknown[] = []
      const engine = {
        chat: {
          completions: {
            create: vi.fn().mockImplementation(({ messages: msgs }: { messages: unknown[] }) => {
              capturedMessages.push(...msgs)
              return makeStream([])
            }),
          },
        },
      }

      await act(async () => {
        await useChatStore.getState().sendMessage('new question', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA)
      })

      // The messages passed to engine should include: system prompt + last 6 history + new user message
      // History capped at 6, plus the new user message = 7 conversation messages + 1 system = 8 total
      const conversationMsgs = capturedMessages.filter((m: unknown) => (m as { role: string }).role !== 'system')
      expect(conversationMsgs.length).toBeLessThanOrEqual(7) // 6 history + 1 new user
    })

    it('sets streaming:false in finally block even when stream throws', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)

      async function* errorStream() {
        yield { choices: [{ delta: { content: 'partial' } }] }
        throw new Error('Stream interrupted')
      }

      const engine = {
        chat: {
          completions: {
            create: vi.fn().mockReturnValue(errorStream()),
          },
        },
      }
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendMessage('test', () => Promise.resolve(engine), retrieveContext, FAKE_PERSONA).catch(() => {})
      })

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg!.streaming).toBe(false)
    })
  })

  describe('sendHint', () => {
    it('builds error-explanation prompt when error is provided', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['hint answer'])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendHint(
          'x = 1\nprint(y)',
          'NameError: name y is not defined',
          'Print a variable',
          () => Promise.resolve(engine),
          retrieveContext,
          FAKE_PERSONA,
        )
      })

      const messages = useChatStore.getState().messages
      expect(messages.length).toBeGreaterThan(0)
      // The user message content should contain the error explanation request
      const userMsg = messages.find((m) => m.role === 'user')
      expect(userMsg!.content).toContain('NameError')
      expect(userMsg!.content).toContain('Do NOT write corrected code')
    })

    it('builds Socratic hint prompt when error is null', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['hint answer'])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendHint(
          'x = 1',
          null,
          'Print a variable',
          () => Promise.resolve(engine),
          retrieveContext,
          FAKE_PERSONA,
        )
      })

      const messages = useChatStore.getState().messages
      const userMsg = messages.find((m) => m.role === 'user')
      expect(userMsg!.content).toContain('Do NOT reveal the answer')
    })

    it('uses max_tokens 256 for hints (shorter response)', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine([])
      const retrieveContext = makeRetrieveContext([])

      await act(async () => {
        await useChatStore.getState().sendHint(
          'code',
          null,
          'exercise',
          () => Promise.resolve(engine),
          retrieveContext,
          FAKE_PERSONA,
        )
      })

      expect(engine.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ max_tokens: 256 })
      )
    })

    it('attaches citations to assistant message after hint completes', async () => {
      const { useChatStore } = await import('@/lib/store/chat')
      useChatStore.getState().setLessonContext(FAKE_LESSON_CONTEXT)
      const engine = makeEngine(['hint'])
      const retrieveContext = makeRetrieveContext(FAKE_CHUNKS)

      await act(async () => {
        await useChatStore.getState().sendHint(
          'code',
          null,
          'exercise',
          () => Promise.resolve(engine),
          retrieveContext,
          FAKE_PERSONA,
        )
      })

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg!.citations).toEqual(FAKE_CHUNKS)
    })
  })
})
