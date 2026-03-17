---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - hooks/use-shiki-highlighter.ts
  - components/chat-code-block.tsx
  - components/ai-message.tsx
  - lib/ai-sdk/webllm-provider.ts
  - lib/ai-sdk/webllm-language-model.ts
  - lib/store/chat.ts
  - __tests__/hooks/use-shiki-highlighter.test.ts
  - __tests__/lib/webllm-language-model.test.ts
  - __tests__/components/ai-message.test.tsx
  - package.json
autonomous: true
requirements: [QUICK-7]

must_haves:
  truths:
    - "Code blocks in AI assistant responses display syntax-highlighted Python code"
    - "Syntax highlighting uses the same themes as lesson code blocks (github-light / github-dark-dimmed)"
    - "Chat streaming uses Vercel AI SDK streamText with a custom WebLLM LanguageModelV1 provider"
    - "Existing WebLLM engine singleton is preserved — no duplicate engine initialization"
    - "ChatCodeBlock shows syntax-highlighted code in its editable textarea"
  artifacts:
    - path: "hooks/use-shiki-highlighter.ts"
      provides: "React hook wrapping shiki codeToHtml with lazy-loaded highlighter singleton"
      exports: ["useShikiHighlighter"]
    - path: "lib/ai-sdk/webllm-provider.ts"
      provides: "Factory function creating the custom WebLLM AI SDK provider"
      exports: ["createWebLLMProvider"]
    - path: "lib/ai-sdk/webllm-language-model.ts"
      provides: "LanguageModelV1 implementation wrapping WebLLM engine"
      exports: ["WebLLMLanguageModel"]
    - path: "components/chat-code-block.tsx"
      provides: "ChatCodeBlock with syntax-highlighted code display"
    - path: "components/ai-message.tsx"
      provides: "AI message rendering with highlighted code blocks"
    - path: "lib/store/chat.ts"
      provides: "Chat store using AI SDK streamText for streaming"
  key_links:
    - from: "lib/ai-sdk/webllm-language-model.ts"
      to: "hooks/use-ai-engine.ts"
      via: "Accepts WebLLM engine instance in constructor, delegates chat.completions.create"
      pattern: "engine\\.chat\\.completions\\.create"
    - from: "lib/store/chat.ts"
      to: "lib/ai-sdk/webllm-provider.ts"
      via: "streamCompletion calls streamText with createWebLLMProvider model"
      pattern: "streamText.*createWebLLMProvider"
    - from: "components/chat-code-block.tsx"
      to: "hooks/use-shiki-highlighter.ts"
      via: "useShikiHighlighter hook for highlighting code"
      pattern: "useShikiHighlighter"
    - from: "components/ai-message.tsx"
      to: "hooks/use-shiki-highlighter.ts"
      via: "useShikiHighlighter hook for post-stream code highlighting"
      pattern: "useShikiHighlighter"
---

<objective>
Add syntax highlighting for code blocks in AI chat responses and integrate Vercel AI SDK to wrap the existing WebLLM engine for improved streaming UX.

Purpose: Code blocks in AI responses are currently plain text (no highlighting), making them hard to read. The streaming implementation uses raw WebLLM API calls — wrapping with Vercel AI SDK provides standardized streaming primitives, abort support, and usage tracking.

Output: Highlighted code blocks in chat + AI SDK-powered streaming via custom WebLLM provider.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@hooks/use-ai-engine.ts
@lib/store/chat.ts
@components/ai-message.tsx
@components/chat-code-block.tsx
@next.config.mjs (themes: github-light, github-dark-dimmed)
@package.json

<interfaces>
<!-- Key types and contracts the executor needs. -->

From lib/store/chat.ts:
```typescript
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  streaming: boolean
  citations: RetrievedChunk[]
}

// streamCompletion is the internal function to refactor
async function streamCompletion(
  get: () => ChatState,
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  userText: string,
  getEngine: () => Promise<unknown>,
  retrieveContext: (query: string, k?: number) => Promise<RetrievedChunk[]>,
  persona: AIPersona,
  maxTokens: number,
): Promise<void>
```

From hooks/use-ai-engine.ts:
```typescript
export type AIEngineStatus = 'idle' | 'awaiting-consent' | 'loading' | 'ready' | 'error' | 'unsupported' | 'no-wifi'
export function useAIEngine(modelId: string): {
  getEngine: () => Promise<unknown>  // Returns WebLLM engine with engine.chat.completions.create()
  requestDownload: () => void
  status: AIEngineStatus
  downloadProgress: DownloadProgress | null
}
```

WebLLM engine API (from @mlc-ai/web-llm):
```typescript
// engine.chat.completions.create() is OpenAI-compatible:
interface ChatCompletionCreateParams {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  stream?: boolean
  temperature?: number
  max_tokens?: number
}
// When stream: true, returns AsyncIterable of chunks:
// chunk.choices[0].delta.content — string delta
// chunk.choices[0].finish_reason — 'stop' | null
// chunk.usage — { prompt_tokens, completion_tokens, total_tokens } (on last chunk)
```

From next.config.mjs (theme config to match):
```javascript
const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add syntax highlighting with shiki and create useShikiHighlighter hook</name>
  <files>
    hooks/use-shiki-highlighter.ts,
    components/chat-code-block.tsx,
    components/ai-message.tsx,
    __tests__/hooks/use-shiki-highlighter.test.ts,
    __tests__/components/ai-message.test.tsx
  </files>
  <behavior>
    - useShikiHighlighter returns { highlightCode(code, lang) => Promise<string> } where string is HTML
    - highlightCode lazy-loads shiki highlighter singleton on first call (not on mount)
    - Uses dual themes: github-light for light mode, github-dark-dimmed for dark mode (matching next.config.mjs)
    - Subsequent calls reuse the cached highlighter instance (no re-initialization)
    - Returns empty string while highlighter is loading (graceful degradation)
    - ChatCodeBlock displays syntax-highlighted code above the editable textarea (highlighted view for reading, textarea for editing)
    - AIMessage post-stream code blocks render with syntax highlighting via useShikiHighlighter
    - During streaming, code blocks still render via Streamdown (no highlighting during stream — only after stream completes)
  </behavior>
  <action>
    1. Create `hooks/use-shiki-highlighter.ts`:
       - Module-level singleton: `let highlighterPromise: Promise<Highlighter> | null = null`
       - Function `getOrCreateHighlighter()` that lazy-creates via `createHighlighter({ themes: ['github-light', 'github-dark-dimmed'], langs: ['python', 'javascript', 'typescript', 'bash', 'json', 'text'] })` from `shiki`
       - Export a `useShikiHighlighter` hook that returns `{ highlightCode }` where `highlightCode(code: string, lang: string): Promise<string>` calls `codeToHtml` with `themes: { light: 'github-light', dark: 'github-dark-dimmed' }` and `defaultColor: false` for CSS-based theme switching
       - The hook itself has no state — it just provides the highlightCode function that consumers can call in their own effects

    2. Update `components/chat-code-block.tsx`:
       - Import `useShikiHighlighter`
       - Add state: `const [highlightedHtml, setHighlightedHtml] = useState<string>('')`
       - Add useEffect that calls `highlightCode(code, language)` and sets the HTML whenever `code` changes
       - Render: Show the highlighted HTML (via `dangerouslySetInnerHTML`) as a read-only display layer ABOVE the existing editable textarea
       - When user focuses the textarea, they edit plain text; the highlighted view updates on code change
       - Apply class `.shiki` styles to match the lesson code block appearance: `font-mono text-[15px] leading-relaxed`
       - If highlightedHtml is empty (still loading), fall back to showing plain `<code>` text

    3. Update `components/ai-message.tsx`:
       - Import `useShikiHighlighter`
       - In the post-stream code rendering path (where `parseSegments` splits content), replace the plain `ChatCodeBlock` rendering for non-Python code with a new `HighlightedCodeBlock` internal component
       - `HighlightedCodeBlock` uses `useShikiHighlighter` to highlight code and renders via `dangerouslySetInnerHTML`
       - For Python code blocks, continue using `ChatCodeBlock` (which now has its own highlighting)
       - During streaming, no change — Streamdown handles rendering

    4. Create `__tests__/hooks/use-shiki-highlighter.test.ts`:
       - Mock `shiki` module: `createHighlighter` returns a mock with `codeToHtml` returning `<pre class="shiki"><code>highlighted</code></pre>`
       - Test: `highlightCode` returns highlighted HTML string
       - Test: Multiple calls reuse the same highlighter (createHighlighter called once)

    5. Update `__tests__/components/ai-message.test.tsx`:
       - Add mock for `hooks/use-shiki-highlighter` returning a mock `highlightCode`
       - Add test: assistant message with code fence renders `ChatCodeBlock` for Python code after streaming completes
       - Add test: assistant message with non-Python code fence renders highlighted HTML after streaming completes
  </action>
  <verify>
    <automated>pnpm vitest --run __tests__/hooks/use-shiki-highlighter.test.ts __tests__/components/ai-message.test.tsx</automated>
  </verify>
  <done>
    - useShikiHighlighter hook exists, lazy-loads shiki, caches singleton, returns highlightCode function
    - ChatCodeBlock displays syntax-highlighted code with github-light/github-dark-dimmed themes
    - AIMessage renders highlighted code blocks for completed (non-streaming) assistant messages
    - All new and updated tests pass
    - pnpm lint and pnpm tsc --noEmit pass
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create Vercel AI SDK custom WebLLM provider and refactor chat store streaming</name>
  <files>
    lib/ai-sdk/webllm-provider.ts,
    lib/ai-sdk/webllm-language-model.ts,
    lib/store/chat.ts,
    __tests__/lib/webllm-language-model.test.ts,
    package.json
  </files>
  <behavior>
    - WebLLMLanguageModel implements LanguageModelV1 from @ai-sdk/provider
    - doStream delegates to engine.chat.completions.create({ stream: true }) and transforms chunks to AI SDK stream format
    - doGenerate delegates to engine.chat.completions.create({ stream: false })
    - createWebLLMProvider(engine) returns a model instance wrapping that specific engine
    - streamCompletion in chat.ts uses streamText from 'ai' package with the WebLLM provider
    - Existing sendMessage/sendHint behavior is preserved (RAG retrieval, system prompt, history capping, citation attachment)
    - AbortController support: streamCompletion creates an AbortController and passes signal to streamText
  </behavior>
  <action>
    1. Install packages: `pnpm add ai @ai-sdk/provider @ai-sdk/provider-utils`

    2. Create `lib/ai-sdk/webllm-language-model.ts`:
       - Import `LanguageModelV1` from `@ai-sdk/provider`
       - Class `WebLLMLanguageModel` implements `LanguageModelV1`:
         - `specificationVersion: 'v1'` (the spec version)
         - `provider: 'webllm'` (provider identifier string)
         - `modelId: string` (e.g. 'Phi-3.5-mini-instruct-q4f16_1-MLC')
         - `defaultObjectGenerationMode: undefined` (no structured output)
         - Constructor accepts `(modelId: string, engine: unknown)` — stores engine reference
         - `doStream(options)`:
           - Convert `options.prompt` (LanguageModelV1Prompt) to OpenAI-format messages array
           - Call `engine.chat.completions.create({ messages, stream: true, temperature: options.temperature ?? 0.7, max_tokens: options.maxOutputTokens ?? 512 })`
           - Return `{ stream: ReadableStream, rawCall: { rawPrompt, rawSettings } }`
           - The ReadableStream transforms WebLLM chunks into AI SDK stream parts:
             - `{ type: 'text-delta', textDelta: chunk.choices[0].delta.content }`
             - `{ type: 'finish', finishReason: mapFinishReason(chunk), usage: { promptTokens, completionTokens } }`
           - Handle AbortSignal from options.abortSignal (call `engine.interruptGenerate()` if available)
         - `doGenerate(options)`:
           - Same message conversion
           - Call `engine.chat.completions.create({ messages, stream: false, ... })`
           - Return `{ text, finishReason, usage, rawCall }`
       - Helper: `convertPrompt(prompt: LanguageModelV1Prompt)` converts AI SDK prompt format (system/user/assistant messages with content parts) to flat OpenAI `{ role, content }[]`

    3. Create `lib/ai-sdk/webllm-provider.ts`:
       - Export `createWebLLMProvider(engine: unknown, modelId: string): LanguageModelV1`
       - Returns `new WebLLMLanguageModel(modelId, engine)`

    4. Refactor `lib/store/chat.ts` `streamCompletion`:
       - Import `streamText` from `ai` and `createWebLLMProvider` from `@/lib/ai-sdk/webllm-provider`
       - Replace the manual `engine.chat.completions.create` + `for await` loop with:
         ```
         const model = createWebLLMProvider(engine, persona.modelId ?? 'webllm')
         const result = streamText({
           model,
           system: systemPrompt,
           messages: cappedHistory.map(m => ({ role: m.role, content: m.content })),
           // Add the new user message
           prompt is handled via messages array including newUserMessage,
           temperature: 0.7,
           maxTokens,
           abortSignal: controller.signal,
         })
         for await (const delta of result.textStream) {
           set(s => ({ messages: appendToLastMessage(s.messages, delta) }))
         }
         ```
       - Keep the same error handling (catch block updates last message with error text)
       - Keep the same finally block (mark streaming false, attach citations)
       - Note: `streamText` from `ai` may require 'use server' or special handling for client-side use. If `streamText` does not work client-side, use the `doStream` method directly on the model:
         ```
         const { stream } = await model.doStream({
           inputFormat: 'messages',
           mode: { type: 'regular' },
           prompt: apiMessages.map(m => ({
             role: m.role,
             content: [{ type: 'text', text: m.content }]
           })),
           temperature: 0.7,
           maxOutputTokens: maxTokens,
         })
         const reader = stream.getReader()
         while (true) {
           const { done, value } = await reader.read()
           if (done) break
           if (value.type === 'text-delta') {
             set(s => ({ messages: appendToLastMessage(s.messages, value.textDelta) }))
           }
         }
         ```
       - This fallback approach (calling doStream directly) is preferred since the chat runs client-side and streamText is designed for server use

    5. Create `__tests__/lib/webllm-language-model.test.ts`:
       - Create a mock WebLLM engine with `chat.completions.create` returning mock async iterable chunks
       - Test doStream: returns ReadableStream with text-delta and finish parts
       - Test doGenerate: returns text and usage from non-streaming response
       - Test prompt conversion: system + user + assistant messages converted correctly
       - Test abort: calling abort on signal triggers engine.interruptGenerate if available
  </action>
  <verify>
    <automated>pnpm vitest --run __tests__/lib/webllm-language-model.test.ts __tests__/lib/chat-store.test.ts && pnpm lint && pnpm tsc --noEmit</automated>
  </verify>
  <done>
    - ai, @ai-sdk/provider, @ai-sdk/provider-utils packages installed
    - WebLLMLanguageModel implements LanguageModelV1, wraps existing WebLLM engine
    - createWebLLMProvider factory creates model instances from engine + modelId
    - Chat store streamCompletion uses AI SDK streaming (doStream or streamText)
    - Existing behavior preserved: RAG retrieval, system prompt, history capping, citations, error handling
    - All tests pass, lint clean, types clean
  </done>
</task>

</tasks>

<verification>
1. `pnpm vitest --run` — all tests pass (including new and updated ones)
2. `pnpm lint` — no lint errors
3. `pnpm tsc --noEmit` — no type errors
4. `pnpm build` — production build succeeds
5. Manual verification: Open AI chat panel, send a message, verify:
   - Code blocks in responses show syntax highlighting with proper colors
   - Streaming still works (text appears incrementally)
   - Code blocks in ChatCodeBlock have highlighted display + editable textarea
</verification>

<success_criteria>
- Code blocks in AI chat responses display syntax-highlighted code using shiki with github-light/github-dark-dimmed themes
- Chat streaming uses Vercel AI SDK LanguageModelV1 provider wrapping the existing WebLLM engine
- Existing WebLLM engine singleton is preserved (no duplicate engine initialization)
- All tests pass, lint clean, types clean, build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/7-support-highlight-code-in-ai-chat-panel-/7-SUMMARY.md`
</output>
