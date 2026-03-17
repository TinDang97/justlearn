import type { LanguageModelV3 } from '@ai-sdk/provider'
import { WebLLMLanguageModel } from '@/lib/ai-sdk/webllm-language-model'

/**
 * Factory function that creates a custom WebLLM AI SDK provider.
 *
 * Wraps the existing WebLLM engine (from useAIEngine hook) in a LanguageModelV3
 * interface, providing standardized streaming primitives, abort support, and
 * usage tracking.
 *
 * The engine singleton from useAIEngine.ts is preserved — this factory only
 * wraps an already-initialized engine, it does not create a new one.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createWebLLMProvider(engine: any, modelId: string): LanguageModelV3 {
  return new WebLLMLanguageModel(modelId, engine)
}
