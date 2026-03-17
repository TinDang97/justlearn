import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LanguageModelV3Prompt } from '@ai-sdk/provider'

// ============================================================
// Mock engine factory
// ============================================================

function makeChunks(deltas: string[]) {
  const chunks = deltas.map((delta) => ({
    choices: [{ delta: { content: delta }, finish_reason: null }],
    usage: null,
  }))
  // Last chunk has finish_reason and usage
  if (chunks.length > 0) {
    ;(chunks[chunks.length - 1].choices[0] as { delta: { content: string }; finish_reason: string | null }).finish_reason = 'stop'
    ;(chunks[chunks.length - 1] as { choices: unknown[]; usage: unknown }).usage = {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    }
  }
  return chunks
}

async function* makeAsyncIterable(chunks: unknown[]) {
  for (const chunk of chunks) {
    yield chunk
  }
}

function makeStreamEngine(deltas: string[] = ['Hello', ' world']) {
  return {
    chat: {
      completions: {
        create: vi.fn().mockReturnValue(makeAsyncIterable(makeChunks(deltas))),
      },
    },
    interruptGenerate: vi.fn(),
  }
}

function makeGenerateEngine(text: string = 'Hello world') {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: text }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      },
    },
  }
}

// ============================================================
// Tests
// ============================================================

describe('WebLLMLanguageModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('construction and metadata', () => {
    it('has specificationVersion v3', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeStreamEngine()
      const model = new WebLLMLanguageModel('test-model', engine)
      expect(model.specificationVersion).toBe('v3')
    })

    it('has provider "webllm"', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeStreamEngine()
      const model = new WebLLMLanguageModel('test-model', engine)
      expect(model.provider).toBe('webllm')
    })

    it('stores modelId', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeStreamEngine()
      const model = new WebLLMLanguageModel('Phi-3.5-mini-instruct-q4f16_1-MLC', engine)
      expect(model.modelId).toBe('Phi-3.5-mini-instruct-q4f16_1-MLC')
    })
  })

  describe('doStream', () => {
    it('returns a ReadableStream with text-delta parts', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeStreamEngine(['Hello', ' world'])
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
      ]

      const result = await model.doStream({
        prompt,
        
      })

      const parts: Array<{ type: string; delta?: string }> = []
      const reader = result.stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        parts.push(value as { type: string; delta?: string })
      }

      const textDeltas = parts.filter((p) => p.type === 'text-delta')
      expect(textDeltas.length).toBeGreaterThan(0)
      expect(textDeltas.some((p) => p.delta === 'Hello')).toBe(true)
      expect(textDeltas.some((p) => p.delta === ' world')).toBe(true)
    })

    it('includes a finish part in the stream', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeStreamEngine(['Hello'])
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
      ]

      const result = await model.doStream({
        prompt,
        
      })

      const parts: Array<{ type: string }> = []
      const reader = result.stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        parts.push(value as { type: string })
      }

      expect(parts.some((p) => p.type === 'finish')).toBe(true)
    })

    it('calls engine.chat.completions.create with stream: true', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeStreamEngine([])
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
      ]

      const result = await model.doStream({
        prompt,
        
      })

      // Drain stream
      const reader = result.stream.getReader()
      while (!(await reader.read()).done) {}

      expect(engine.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ stream: true })
      )
    })
  })

  describe('doGenerate', () => {
    it('returns text from non-streaming response', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeGenerateEngine('The answer is 42')
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'What is 6 times 7?' }] },
      ]

      const result = await model.doGenerate({
        prompt,
        
      })

      // Result has content array, find the text content
      const textContent = result.content.find((c) => c.type === 'text')
      expect(textContent).toBeDefined()
      expect((textContent as { type: 'text'; text: string }).text).toBe('The answer is 42')
    })

    it('returns usage tokens from response', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeGenerateEngine('answer')
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'test' }] },
      ]

      const result = await model.doGenerate({
        prompt,
        
      })

      expect(result.usage.inputTokens.total).toBe(10)
      expect(result.usage.outputTokens.total).toBe(5)
    })

    it('calls engine.chat.completions.create with stream: false', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeGenerateEngine('answer')
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'test' }] },
      ]

      await model.doGenerate({
        prompt,
        
      })

      expect(engine.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ stream: false })
      )
    })
  })

  describe('prompt conversion', () => {
    it('converts system + user messages correctly', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeGenerateEngine('reply')
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      ]

      await model.doGenerate({
        prompt,
        
      })

      const callArgs = (engine.chat.completions.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(callArgs.messages).toContainEqual({ role: 'system', content: 'You are a helpful assistant.' })
      expect(callArgs.messages).toContainEqual({ role: 'user', content: 'Hello' })
    })

    it('converts assistant messages correctly', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')
      const engine = makeGenerateEngine('reply')
      const model = new WebLLMLanguageModel('test-model', engine)

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'Hello there!' }] },
        { role: 'user', content: [{ type: 'text', text: 'How are you?' }] },
      ]

      await model.doGenerate({
        prompt,
        
      })

      const callArgs = (engine.chat.completions.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(callArgs.messages).toContainEqual({ role: 'assistant', content: 'Hello there!' })
    })
  })

  describe('abort support', () => {
    it('calls engine.interruptGenerate when abort signal fires', async () => {
      const { WebLLMLanguageModel } = await import('@/lib/ai-sdk/webllm-language-model')

      // Engine that yields one chunk then waits
      async function* slowStream() {
        yield makeChunks(['Hello'])[0]
        // Simulate delay — will be interrupted
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }

      const engine = {
        chat: { completions: { create: vi.fn().mockReturnValue(slowStream()) } },
        interruptGenerate: vi.fn(),
      }

      const model = new WebLLMLanguageModel('test-model', engine)
      const controller = new AbortController()

      const prompt: LanguageModelV3Prompt = [
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      ]

      const result = await model.doStream({
        prompt,
        
        abortSignal: controller.signal,
      })

      // Read first chunk then abort
      const reader = result.stream.getReader()
      await reader.read() // get first chunk
      controller.abort()

      // interruptGenerate should be called
      expect(engine.interruptGenerate).toHaveBeenCalled()
    })
  })
})

describe('createWebLLMProvider', () => {
  it('returns a LanguageModelV3 instance with correct modelId', async () => {
    const { createWebLLMProvider } = await import('@/lib/ai-sdk/webllm-provider')
    const engine = makeStreamEngine()
    const model = createWebLLMProvider(engine, 'Phi-3.5-mini-instruct-q4f16_1-MLC')
    expect(model.modelId).toBe('Phi-3.5-mini-instruct-q4f16_1-MLC')
    expect(model.provider).toBe('webllm')
  })
})
