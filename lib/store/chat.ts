import { create } from 'zustand'
import { buildSystemPrompt } from '@/lib/build-system-prompt'
import type { LessonContext, RetrievedChunk } from '@/lib/build-system-prompt'
import type { AIPersona } from '@/lib/course-registry'

export type { LessonContext, RetrievedChunk }

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  streaming: boolean
  citations: RetrievedChunk[]
}

type ChatState = {
  messages: ChatMessage[]
  isOpen: boolean
  lessonContext: LessonContext | null
  setLessonContext: (ctx: LessonContext) => void
  openPanel: () => void
  closePanel: () => void
  clearMessages: () => void
  sendMessage: (
    userText: string,
    getEngine: () => Promise<unknown>,
    retrieveContext: (query: string, k?: number) => Promise<RetrievedChunk[]>,
    persona: AIPersona,
  ) => Promise<void>
  sendHint: (
    code: string,
    error: string | null,
    exerciseDescription: string,
    getEngine: () => Promise<unknown>,
    retrieveContext: (query: string, k?: number) => Promise<RetrievedChunk[]>,
    persona: AIPersona,
  ) => Promise<void>
}

/**
 * Appends `content` to the last message in the array (immutably).
 * Used inside the streaming `for await` loop to accumulate deltas.
 */
function appendToLastMessage(messages: ChatMessage[], content: string): ChatMessage[] {
  if (messages.length === 0) return messages
  const last = messages[messages.length - 1]
  return [
    ...messages.slice(0, -1),
    { ...last, content: last.content + content },
  ]
}

/**
 * Updates the last message in the array with the given partial update (immutably).
 */
function updateLastMessage(messages: ChatMessage[], update: Partial<ChatMessage>): ChatMessage[] {
  if (messages.length === 0) return messages
  const last = messages[messages.length - 1]
  return [...messages.slice(0, -1), { ...last, ...update }]
}

/**
 * Core streaming orchestration used by both sendMessage and sendHint.
 * Handles: RAG retrieval → system prompt → history cap → streaming → citation attachment.
 */
async function streamCompletion(
  get: () => ChatState,
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  userText: string,
  getEngine: () => Promise<unknown>,
  retrieveContext: (query: string, k?: number) => Promise<RetrievedChunk[]>,
  persona: AIPersona,
  maxTokens: number,
): Promise<void> {
  // 1. Push user message
  set((s) => ({
    messages: [
      ...s.messages,
      { role: 'user', content: userText, streaming: false, citations: [] },
    ],
  }))

  // 2. Push empty assistant placeholder with streaming:true
  set((s) => ({
    messages: [
      ...s.messages,
      { role: 'assistant', content: '', streaming: true, citations: [] },
    ],
  }))

  // 3. Get engine
  const engine = await getEngine()

  // 4. Retrieve RAG context
  const ragChunks = await retrieveContext(userText, 3)

  // 5. Build system prompt
  const systemPrompt = buildSystemPrompt(persona, get().lessonContext!, ragChunks)

  // 6. Cap conversation history to last 6 messages (before the new user+assistant we just added)
  const allMessages = get().messages
  // Exclude the 2 messages we just added (user + assistant placeholder)
  const historyMessages = allMessages.slice(0, -2)
  const cappedHistory = historyMessages.slice(-6)

  // Build the new user message for the API call
  const newUserMessage = { role: 'user' as const, content: userText }

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...cappedHistory.map((m) => ({ role: m.role, content: m.content })),
    newUserMessage,
  ]

  // 7. Stream from engine
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await (engine as any).chat.completions.create({
    messages: apiMessages,
    stream: true,
    temperature: 0.7,
    max_tokens: maxTokens,
  })

  try {
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content
      if (delta) {
        set((s) => ({ messages: appendToLastMessage(s.messages, delta) }))
      }
    }
  } catch (err: unknown) {
    // Show error in the assistant message so the user sees what went wrong
    const errorText = err instanceof Error ? err.message : 'An unexpected error occurred'
    set((s) => ({
      messages: updateLastMessage(s.messages, {
        content: `Sorry, something went wrong: ${errorText}`,
      }),
    }))
  } finally {
    // 8. Mark streaming complete and attach citations
    set((s) => ({
      messages: updateLastMessage(s.messages, { streaming: false, citations: ragChunks }),
    }))
  }
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isOpen: false,
  lessonContext: null,

  setLessonContext: (ctx) => set({ lessonContext: ctx }),
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  clearMessages: () => set({ messages: [] }),

  sendMessage: async (userText, getEngine, retrieveContext, persona) => {
    await streamCompletion(get, set, userText, getEngine, retrieveContext, persona, 512)
  },

  sendHint: async (code, error, exerciseDescription, getEngine, retrieveContext, persona) => {
    let hintPrompt: string

    if (error !== null) {
      hintPrompt = `I'm working on this exercise: "${exerciseDescription}"

My code:
\`\`\`
${code}
\`\`\`

I got this error: ${error}

Explain what went wrong in plain English. Ask me ONE guiding question to help me fix it. Do NOT write corrected code.`
    } else {
      hintPrompt = `I'm working on this exercise: "${exerciseDescription}"

My code so far:
\`\`\`
${code}
\`\`\`

Give me a Socratic hint — a guiding question or partial clue to help me think through the problem. Do NOT reveal the answer.`
    }

    await streamCompletion(get, set, hintPrompt, getEngine, retrieveContext, persona, 256)
  },
}))
