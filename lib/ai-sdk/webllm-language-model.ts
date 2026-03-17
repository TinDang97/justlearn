import type {
  LanguageModelV3,
  LanguageModelV3CallOptions,
  LanguageModelV3GenerateResult,
  LanguageModelV3StreamResult,
  LanguageModelV3Prompt,
  LanguageModelV3StreamPart,
  LanguageModelV3Usage,
  LanguageModelV3FinishReason,
} from '@ai-sdk/provider'

// OpenAI-compatible message format that WebLLM accepts
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Converts an AI SDK V3 prompt to OpenAI-compatible messages array.
 * Handles: system, user (text parts), assistant (text parts).
 */
function convertPrompt(prompt: LanguageModelV3Prompt): OpenAIMessage[] {
  const messages: OpenAIMessage[] = []
  for (const message of prompt) {
    if (message.role === 'system') {
      messages.push({ role: 'system', content: message.content })
    } else if (message.role === 'user') {
      // Concatenate all text parts
      const text = message.content
        .filter((part) => part.type === 'text')
        .map((part) => (part as { type: 'text'; text: string }).text)
        .join('')
      messages.push({ role: 'user', content: text })
    } else if (message.role === 'assistant') {
      const text = message.content
        .filter((part) => part.type === 'text')
        .map((part) => (part as { type: 'text'; text: string }).text)
        .join('')
      messages.push({ role: 'assistant', content: text })
    }
    // tool role messages are unsupported — skip
  }
  return messages
}

function makeUsage(usage: { prompt_tokens?: number; completion_tokens?: number } | null): LanguageModelV3Usage {
  return {
    inputTokens: {
      total: usage?.prompt_tokens ?? undefined,
      noCache: undefined,
      cacheRead: undefined,
      cacheWrite: undefined,
    },
    outputTokens: {
      total: usage?.completion_tokens ?? undefined,
      text: undefined,
      reasoning: undefined,
    },
  }
}

function makeFinishReason(reason: string | null | undefined): LanguageModelV3FinishReason {
  return {
    unified: reason === 'stop' ? 'stop' : 'other',
    raw: reason ?? undefined,
  }
}

/**
 * Implements LanguageModelV3 wrapping the existing WebLLM engine.
 * The engine follows OpenAI's API: engine.chat.completions.create()
 *
 * Preserves the existing WebLLM engine singleton — no duplicate initialization.
 */
export class WebLLMLanguageModel implements LanguageModelV3 {
  readonly specificationVersion = 'v3' as const
  readonly provider = 'webllm'
  readonly modelId: string
  readonly supportedUrls = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly engine: any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(modelId: string, engine: any) {
    this.modelId = modelId
    this.engine = engine
  }

  async doStream(options: LanguageModelV3CallOptions): Promise<LanguageModelV3StreamResult> {
    const messages = convertPrompt(options.prompt)

    // Set up abort handling
    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        if (typeof this.engine.interruptGenerate === 'function') {
          this.engine.interruptGenerate()
        }
      })
    }

    const webllmStream: AsyncIterable<{
      choices: Array<{ delta: { content?: string | null }; finish_reason: string | null }>
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null
    }> = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxOutputTokens ?? 512,
    })

    const textId = '0'
    let textStarted = false
    let lastUsage: { prompt_tokens?: number; completion_tokens?: number } | null = null
    let lastFinishReason: string | null = null

    const stream = new ReadableStream<LanguageModelV3StreamPart>({
      async start(controller) {
        try {
          for await (const chunk of webllmStream) {
            const delta = chunk?.choices?.[0]?.delta?.content
            const finishReason = chunk?.choices?.[0]?.finish_reason

            if (delta) {
              if (!textStarted) {
                textStarted = true
                controller.enqueue({ type: 'text-start', id: textId })
              }
              controller.enqueue({ type: 'text-delta', id: textId, delta })
            }

            if (finishReason) {
              lastFinishReason = finishReason
            }

            if (chunk?.usage) {
              lastUsage = chunk.usage
            }
          }

          if (textStarted) {
            controller.enqueue({ type: 'text-end', id: textId })
          }

          controller.enqueue({
            type: 'finish',
            finishReason: makeFinishReason(lastFinishReason),
            usage: makeUsage(lastUsage),
          })
        } catch (err) {
          controller.enqueue({ type: 'error', error: err })
        } finally {
          controller.close()
        }
      },
    })

    return { stream }
  }

  async doGenerate(options: LanguageModelV3CallOptions): Promise<LanguageModelV3GenerateResult> {
    const messages = convertPrompt(options.prompt)

    const response: {
      choices: Array<{ message: { content: string | null }; finish_reason: string }>
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    } = await this.engine.chat.completions.create({
      messages,
      stream: false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxOutputTokens ?? 512,
    })

    const text = response.choices[0]?.message?.content ?? ''
    const finishReason = response.choices[0]?.finish_reason

    return {
      content: [{ type: 'text', text }],
      finishReason: makeFinishReason(finishReason),
      usage: makeUsage(response.usage ?? null),
      warnings: [],
    }
  }
}
