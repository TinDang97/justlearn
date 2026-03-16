# Phase 15: AI Chat Panel + Practice Hints — Research

**Researched:** 2026-03-16
**Domain:** React streaming UI, Zustand chat store, WebLLM inference wiring, PracticeBlock extension
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | Inline sliding chat panel on any lesson page | `Sheet` component already installed (`components/ui/sheet.tsx`); use `SheetContent` with `side="right"`. Mounts via `LessonPage` Server Component with a `'use client'` wrapper. |
| CHAT-02 | Streaming token-by-token markdown rendering | `streamdown` npm package (`import { Streamdown } from "streamdown"`); accepts `children: string`, `isAnimating: boolean`, `animated` prop; handles unterminated mid-stream syntax. |
| CHAT-03 | Lesson-aware context for lesson-specific answers | `buildSystemPrompt()` in `lib/build-system-prompt.ts` accepts `LessonContext { title, sectionTitle, courseSlug }` — pass current lesson metadata from `LessonPage` props down into chat store. |
| CHAT-04 | RAG search across all 218 lessons with source citations | `useRAG(courseSlug)` hook in `hooks/use-rag.ts` — call `retrieveContext(query, engine, k=3)` to get `RetrievedChunk[]` with `.lessonTitle` and `.heading` fields for citations. |
| CHAT-06 | Per-session conversation history for multi-turn context | Non-persisted Zustand store (`lib/store/chat.ts`) — accumulate `messages` array in memory; flush completed messages to `sessionStorage` on `streaming: false`; pass full history to `engine.chat.completions.create`. |
| PRAC-01 | "Get Hint" in PracticeBlock — Socratic guidance | Extend `ExerciseRunner` in `components/code-runner/exercise-runner.tsx` with optional `courseSlug`/`lessonSlug`/`sectionTitle` props; add `AIHintButton` that sends a Socratic prompt via chat store. |
| PRAC-02 | AI explains Python/pandas errors on code failure | After `run()` resolves with `error !== null`, auto-send an error explanation prompt to chat store using the `error` string and current `code`. |
| PRAC-03 | AI responses cite source lesson section | `RetrievedChunk.heading` + `RetrievedChunk.lessonTitle` are returned by `retrieveContext()`; render citations below each assistant message in `AIMessage`. |
</phase_requirements>

---

## Summary

Phase 15 is the UI delivery layer — all infrastructure (engine singleton, RAG index, vector search hook, system prompt assembler, persona config) was completed in Phases 13-14. This phase wires those hooks into two user-facing surfaces: a sliding `AIChatPanel` on every lesson page, and AI hint integration into the existing `ExerciseRunner`.

The most important constraint is what Phase 15 must NOT build from scratch: the WebLLM engine, RAG pipeline, vector search, chunking, embeddings, and system prompt assembly are all production-ready. Phase 15 only needs a Zustand chat store, a `streamdown`-backed message component, a `Sheet`-based panel, and a backward-compatible extension of `ExerciseRunner`.

**Primary recommendation:** Build `lib/store/chat.ts` first (orchestrates everything), then `components/ai-message.tsx` (pure rendering), then `components/ai-chat-panel.tsx` (composes both), then extend `ExerciseRunner`. This respects the dependency graph and gives the fastest path to an end-to-end smoke test.

The sliding panel uses the already-installed `Sheet` component (`components/ui/sheet.tsx`). No new shadcn installs are needed. `streamdown` must be installed — it is not yet in `package.json`. The lesson page (`app/courses/[courseSlug]/[lessonSlug]/page.tsx`) is a Server Component; the chat panel must be a separate `'use client'` component inserted at the bottom of the page JSX.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `streamdown` | latest (1.x) | Streaming-safe Markdown renderer | Drop-in for react-markdown; handles unterminated blocks mid-stream; Vercel-maintained |
| `zustand` | ^5.0.11 (existing) | Chat store — message history, streaming state | Already in project; proven pattern in `lib/store/progress.ts` |
| `@mlc-ai/web-llm` | ^0.2.82 (existing) | LLM inference via `useAIEngine` hook | Phase 13 complete — `getEngine()` returns ready engine |
| Sheet (shadcn/ui) | already installed | Sliding panel container | `components/ui/sheet.tsx` uses `radix-ui` Dialog; right-side slide-in built-in |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useRAG` hook | existing (Phase 14) | RAG retrieval | Called in `useChatStore.sendMessage` to fetch context chunks before prompt assembly |
| `buildSystemPrompt()` | existing (Phase 14) | Assembles system prompt | Called once per send; accepts `AIPersona + LessonContext + RetrievedChunk[]` |
| `COURSE_REGISTRY` | existing | AI persona lookup by `courseSlug` | Access `aiPersona.name`, `aiPersona.modelId` for chat header and engine init |
| `lucide-react` | existing | Icons (Send, Sparkles, X, BotMessageSquare) | Already in project; consistent with existing icon usage |
| `motion/react` | existing | Micro-animations (message fade-in) | Already used in `ExerciseRunner` and `CodeRunnerClient` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `streamdown` | `react-markdown` | react-markdown renders final markdown only — it mangles partial syntax mid-stream; streamdown is purpose-built for streaming |
| `streamdown` | Manual innerHTML with marked.js | No React integration; XSS risk; unterminated syntax causes parse errors |
| Zustand store | `useReducer` + Context | Zustand's devtools and non-persisted state model are exactly right here; Context causes full subtree re-render per streaming token |
| `Sheet` (radix Dialog) | Custom CSS panel | Sheet is already installed and tested; custom CSS panels are unnecessary complexity |

**Installation:**
```bash
pnpm add streamdown
```

---

## Architecture Patterns

### Recommended Project Structure

```
lib/store/
  chat.ts                          # NEW: Zustand chat store (all orchestration here)

components/
  ai-message.tsx                   # NEW: Single message bubble (streaming Markdown via streamdown)
  ai-chat-panel.tsx                # NEW: Sheet-based sliding panel with message list + input
  ai-hint-button.tsx               # NEW: "Get Hint" / "Explain Error" button for PracticeBlock
  code-runner/
    exercise-runner.tsx            # MODIFIED: add optional AI hint props + wire AIHintButton

app/courses/[courseSlug]/[lessonSlug]/
  page.tsx                         # MODIFIED: append <AIChatPanel> + "Open Chat" trigger button
```

### Pattern 1: Zustand Chat Store as Orchestrator

**What:** All AI coordination logic (RAG retrieval, prompt assembly, streaming accumulation, session history) lives in `lib/store/chat.ts`. Components call `useChatStore()` and dispatch named actions. Components never call `getEngine()` or `retrieveContext()` directly.

**When to use:** Centralize state so `AIChatPanel` and `AIHintButton` share the same message history and engine reference without prop drilling.

**Example:**
```typescript
// lib/store/chat.ts
'use client'
import { create } from 'zustand'
import type { RetrievedChunk } from '@/lib/build-system-prompt'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  streaming: boolean
  citations: RetrievedChunk[]  // empty for user messages
}

type ChatStore = {
  messages: ChatMessage[]
  isOpen: boolean
  lessonContext: { title: string; sectionTitle: string; courseSlug: string } | null

  setLessonContext: (ctx: ChatStore['lessonContext']) => void
  openPanel: () => void
  closePanel: () => void
  sendMessage: (
    userText: string,
    getEngine: () => Promise<unknown>,
    retrieveContext: (q: string, engine: unknown, k?: number) => Promise<RetrievedChunk[]>,
    persona: import('@/lib/course-registry').AIPersona,
  ) => Promise<void>
  sendHint: (
    code: string,
    error: string | null,
    getEngine: () => Promise<unknown>,
    retrieveContext: (q: string, engine: unknown, k?: number) => Promise<RetrievedChunk[]>,
    persona: import('@/lib/course-registry').AIPersona,
  ) => Promise<void>
}
```

**Key invariants:**
- `messages` is never persisted to localStorage during streaming
- Each assistant message carries its own `citations: RetrievedChunk[]` from the retrieval that produced it
- `streaming: true` on the last message is the signal for `streamdown`'s `isAnimating` prop

### Pattern 2: Streaming Accumulation (Token Delta Loop)

**What:** WebLLM's `engine.chat.completions.create({ stream: true })` returns an `AsyncGenerator`. Accumulate `delta.content` into the last message on each iteration. Mark `streaming: false` on completion.

**When to use:** Every `sendMessage` and `sendHint` call.

**Example:**
```typescript
// Inside useChatStore.sendMessage (Zustand action)
const chunks = await (engine as any).chat.completions.create({
  messages: [
    { role: 'system', content: systemPrompt },
    ...get().messages.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ],
  stream: true,
})

for await (const chunk of chunks) {
  const delta = chunk.choices[0]?.delta?.content ?? ''
  if (!delta) continue
  set(s => {
    const msgs = [...s.messages]
    const last = msgs[msgs.length - 1]
    msgs[msgs.length - 1] = { ...last, content: last.content + delta }
    return { messages: msgs }
  })
}

// Mark complete — triggers sessionStorage flush
set(s => {
  const msgs = [...s.messages]
  msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], streaming: false }
  return { messages: msgs }
})
```

### Pattern 3: AIChatPanel — Sheet with Message List

**What:** `Sheet` component from `components/ui/sheet.tsx` with `side="right"`. Inside: scrollable message list, `AIEngineProgress` during model load, input bar at bottom.

**When to use:** Any lesson page. The panel is always mounted but closed by default. `isOpen` from `useChatStore` controls the `open` prop on `Sheet`.

**Example:**
```typescript
// components/ai-chat-panel.tsx
'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useChatStore } from '@/lib/store/chat'
import { useAIEngine } from '@/hooks/use-ai-engine'
import { useRAG } from '@/hooks/use-rag'
import { COURSE_REGISTRY } from '@/lib/course-registry'
import { AIMessage } from './ai-message'
import { AIEngineProgress } from './ai-engine-progress'

type Props = {
  courseSlug: string
  lessonTitle: string
  sectionTitle: string
}

export function AIChatPanel({ courseSlug, lessonTitle, sectionTitle }: Props) {
  const persona = COURSE_REGISTRY[courseSlug]?.aiPersona
  const { getEngine, status, downloadProgress } = useAIEngine(persona.modelId)
  const { retrieveContext } = useRAG(courseSlug)
  const { messages, isOpen, closePanel, sendMessage, setLessonContext } = useChatStore()

  // Set lesson context when panel opens or lesson changes
  useEffect(() => {
    setLessonContext({ title: lessonTitle, sectionTitle, courseSlug })
  }, [lessonTitle, sectionTitle, courseSlug])

  return (
    <Sheet open={isOpen} onOpenChange={v => !v && closePanel()}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4" />
            Ask {persona.name}
          </SheetTitle>
        </SheetHeader>

        {/* Engine loading state */}
        {(status === 'loading') && downloadProgress && (
          <div className="px-4 py-3">
            <AIEngineProgress status={status} downloadProgress={downloadProgress} />
          </div>
        )}

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.map((msg, i) => (
            <AIMessage key={i} message={msg} personaName={persona.name} />
          ))}
        </div>

        {/* Input bar */}
        <ChatInputBar
          disabled={status !== 'ready'}
          onSend={text => sendMessage(text, getEngine, retrieveContext, persona)}
        />
      </SheetContent>
    </Sheet>
  )
}
```

### Pattern 4: AIMessage with streamdown

**What:** Each message bubble uses `streamdown`'s `<Streamdown>` component for the content. The `isAnimating` prop is `message.streaming` — true while tokens are arriving.

**When to use:** All assistant messages. User messages are plain text (no Markdown).

**Example:**
```typescript
// components/ai-message.tsx
'use client'
import { Streamdown } from 'streamdown'
import type { ChatMessage } from '@/lib/store/chat'
import type { RetrievedChunk } from '@/lib/build-system-prompt'

type Props = {
  message: ChatMessage
  personaName: string
}

export function AIMessage({ message, personaName }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%] text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{personaName}</span>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <Streamdown isAnimating={message.streaming} animated>
          {message.content}
        </Streamdown>
      </div>
      {/* Source citations — only shown when streaming is complete */}
      {!message.streaming && message.citations.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
          <span className="font-medium">Sources: </span>
          {message.citations.map((c, i) => (
            <span key={i} className="mr-2">
              {c.lessonTitle} › {c.heading}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Pattern 5: ExerciseRunner AI Extension (backward-compatible)

**What:** Add three optional props to `ExerciseRunner`: `courseSlug`, `lessonSlug`, `sectionTitle`. When provided, render `AIHintButton` in the action bar. On error after `run()`, auto-trigger `sendHint`. All existing behavior is unchanged when props are absent.

**When to use:** Only when `courseSlug` prop is passed — allows MDX PracticeBlock to opt-in.

**Example:**
```typescript
// In ExerciseRunner, after handleRun resolves:
if (error !== null && courseSlug && lessonSlug) {
  // Auto-explain the error without requiring user to click
  openPanel()
  sendHint(code, error, getEngine, retrieveContext, persona)
}

// AIHintButton — separate component used in action bar:
<AIHintButton
  code={code}
  onHint={() => {
    openPanel()
    // Socratic prompt — no direct answer
    sendHint(code, null, getEngine, retrieveContext, persona)
  }}
/>
```

**Socratic hint prompt (hardcoded in sendHint):**
```
The student is working on this exercise:

[exercise description]

Their current code:
[code]

Guide them with a Socratic question or a partial clue that points them in the right direction. Do NOT reveal the answer or write complete working code. Help them discover the solution themselves.
```

### Anti-Patterns to Avoid

- **Calling `getEngine()` from component render or useEffect without dedup guard:** `getEngine()` is already deduplicated in `useAIEngine`. Do NOT cache the engine in component state — the module-level singleton handles this.
- **Persisting `messages` to localStorage:** Use `sessionStorage` only, and only after `streaming: false`. Zustand `persist` middleware must NOT wrap the `messages` array.
- **Triggering RAG retrieval outside the chat store:** `retrieveContext()` must be called inside `sendMessage`/`sendHint` so the system prompt is assembled atomically with the message history snapshot.
- **Rendering `streamdown` for user messages:** User messages are plain text. Only assistant messages need `Streamdown`. Applying it to user messages adds unnecessary parse overhead.
- **Passing full lesson markdown into system prompt:** `buildSystemPrompt()` already enforces the 800-token budget with RAG chunks. Never pass `rawMd` from `page.tsx` into the chat context.
- **Rendering `AIChatPanel` inside the Server Component body directly:** `AIChatPanel` uses `useAIEngine` (browser API). It must be a `'use client'` component with `dynamic(() => import(...), { ssr: false })` as the import guard, OR wrapped in a thin client boundary that is imported into the Server Component page.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming markdown with partial syntax | Custom tokenizer | `streamdown` | Unterminated bold/code/link mid-stream requires parser state machine; streamdown is tested against all cases |
| Sliding panel with overlay + dismiss | Custom CSS/JS panel | `Sheet` (already installed) | Focus management, keyboard escape, ARIA modal, backdrop — all in radix Dialog |
| Engine singleton / dedup | `useState` engine ref | `useAIEngine` (Phase 13) | Module-level dedup prevents duplicate 2.2GB downloads; React state ref is remounted on panel open |
| Vector search | Manual cosine loop | `useRAG` (Phase 14) | Course-filtered Float32Array scan already built and tested; 3766 chunks under 30ms on first call |
| System prompt assembly | String template in component | `buildSystemPrompt()` (Phase 14) | Safety prefix + persona + lesson context + RAG chunk budget all handled; don't duplicate |
| Session history storage | localStorage | `sessionStorage` (manual flush on completion) | localStorage blocks sync writes on every streaming token; session scope is correct for chat history |
| Source citations | AI hallucinated citations | `RetrievedChunk.lessonTitle + .heading` from RAG | Citations come from retrieved chunks, not generated text — factually grounded |

---

## Common Pitfalls

### Pitfall 1: `AIChatPanel` triggers engine re-init on panel open/close

**What goes wrong:** If `useAIEngine` is called inside a component that unmounts when the panel closes (or if the component key changes), `engineInstance` may be lost and the 2.2GB model re-downloaded.

**Why it happens:** The module-level singleton in `hooks/use-ai-engine.ts` persists across remounts, BUT if the component tree containing the hook is fully destroyed (e.g., navigating away), the singleton persists. The risk is calling `new Worker(...)` twice if `getEngine()` is triggered before `enginePromise` is set.

**How to avoid:** Mount `AIChatPanel` once at the lesson page level (not inside a conditional render). Use `Sheet`'s `open` prop to show/hide — this keeps the component mounted but hidden. Never conditionally render the panel with `{isOpen && <AIChatPanel>}`.

**Warning signs:** Download progress bar appears twice; console logs `CreateWebWorkerMLCEngine` called twice.

### Pitfall 2: `isAnimating` prop causes `streamdown` to stop animation prematurely

**What goes wrong:** If `message.streaming` is set to `false` before all tokens are flushed into `message.content`, `streamdown` freezes mid-render.

**Why it happens:** The `streaming: false` set in Zustand triggers a re-render that passes `isAnimating={false}` to `<Streamdown>`. If the delta accumulation loop is still running, this races.

**How to avoid:** Only set `streaming: false` inside the `for await` loop's post-completion block — after the generator is exhausted. Use `try/finally` to guarantee it runs even on error.

### Pitfall 3: `sessionStorage` flush on incomplete messages (mid-stream page refresh)

**What goes wrong:** If the page is refreshed during streaming, `sessionStorage` may contain a message with `streaming: true`, causing the restored state to show a spinner that never resolves.

**How to avoid:** On store hydration (in the `zustand` store's `onRehydrateStorage` or a `useEffect`), filter out any messages with `streaming: true` before restoring. Alternatively, don't persist to `sessionStorage` at all and accept that chat history is lost on refresh.

**Recommendation:** Don't restore chat from `sessionStorage` on init — session history within a single page visit is the intended scope. Flush to `sessionStorage` only as a debugging aid.

### Pitfall 4: ExerciseRunner auto-error-explain fires before engine is ready

**What goes wrong:** `run()` produces an error during first exercise attempt. `sendHint(code, error, ...)` is called, which internally calls `getEngine()`. If the engine isn't loaded, this queues correctly (the promise resolves when ready), BUT the panel opens immediately showing a blank spinner — confusing UX.

**How to avoid:** Only auto-trigger error explanation when `engineStatus === 'ready'`. If the engine is not ready, show a subtle "AI explanation available" badge instead of auto-opening the panel. Let the student opt in to the explanation.

### Pitfall 5: Conversation history exceeds Phi-3.5-mini 4K context window

**What goes wrong:** After 5-10 exchanges, the concatenated `messages` array plus system prompt exceeds 4096 tokens. The model either truncates silently or returns an error.

**How to avoid:** Cap conversation history at the last 6 messages (3 exchanges) before passing to `engine.chat.completions.create`. Preserve the system prompt always. Warn the user with "Chat history cleared to stay within model context" if truncation occurs.

**Calculation:** System prompt ~800 tokens + 6 messages × ~150 tokens avg = ~1700 tokens, leaving ~2300 for the response. Safe.

### Pitfall 6: `streamdown` CSS not loaded — plain text output

**What goes wrong:** `streamdown` requires its stylesheet loaded for proper rendering. Without it, markdown renders as unstyled plain text or broken layout.

**How to avoid:** Add `import 'streamdown/styles.css'` to the `ai-message.tsx` component or `app/globals.css`. Also add `@source "../node_modules/streamdown/dist/*.js"` to the Tailwind v4 config if using Tailwind classes inside streamdown templates.

---

## Code Examples

Verified patterns from official sources and direct codebase inspection:

### Engine status check before enabling input

```typescript
// Source: hooks/use-ai-engine.ts (Phase 13 — directly inspected)
const { getEngine, status, downloadProgress } = useAIEngine(persona.modelId)
// status: 'idle' | 'loading' | 'ready' | 'error' | 'unsupported'
// Input bar should be disabled when status !== 'ready'
// AIEngineProgress component already built — reuse in chat panel header
```

### RAG retrieval + system prompt assembly

```typescript
// Source: hooks/use-rag.ts + lib/build-system-prompt.ts (Phase 14 — directly inspected)
const { retrieveContext } = useRAG(courseSlug)

// Inside sendMessage action:
const ragChunks = await retrieveContext(userText, engine, 3)  // returns RetrievedChunk[]
const systemPrompt = buildSystemPrompt(persona, lessonContext, ragChunks)
// RetrievedChunk = { text: string; heading: string; lessonTitle: string }
// buildSystemPrompt() caps at 3 chunks, applies safety prefix — no modification needed
```

### Streaming completions call

```typescript
// Source: WebLLM official docs (0.2.82) — engine is MLCEngineInterface
const stream = await engine.chat.completions.create({
  messages: [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,   // array of { role, content } — last 6 messages max
    { role: 'user', content: userText },
  ],
  stream: true,
  temperature: 0.7,
  max_tokens: 512,  // cap response length for chat; hints can use 256
})

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? ''
  // accumulate delta into last message in Zustand store
}
```

### Chat panel trigger button in LessonPage

```typescript
// app/courses/[courseSlug]/[lessonSlug]/page.tsx
// LessonPage is a Server Component — import the panel via dynamic import with ssr: false
import dynamic from 'next/dynamic'
const AIChatPanel = dynamic(() => import('@/components/ai-chat-panel').then(m => m.AIChatPanel), { ssr: false })

// At bottom of page JSX (after LessonNav):
<AIChatPanel
  courseSlug={courseSlug}
  lessonTitle={lesson.title}
  sectionTitle={section?.title ?? ''}
/>
```

### Socratic hint prompt template

```typescript
// lib/store/chat.ts — sendHint action
function buildHintPrompt(code: string, error: string | null, exerciseDescription: string): string {
  if (error) {
    return `The student ran this Python code and got an error.

Code:
\`\`\`python
${code}
\`\`\`

Error:
${error}

Explain what went wrong in plain English. Then give ONE guiding question to help them fix it themselves. Do NOT write corrected code.`
  }

  return `The student is working on this exercise: "${exerciseDescription}"

Their current code:
\`\`\`python
${code}
\`\`\`

Give a Socratic hint: one guiding question or partial clue that helps them discover the solution. Do NOT reveal the answer or write complete working code.`
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-markdown` for AI output | `streamdown` | 2025+ | Handles mid-stream unterminated syntax correctly |
| `@xenova/transformers` | `@huggingface/transformers` v3 | Late 2024 | Official package rename — `@xenova/` deprecated |
| `mememo` HNSW index | Plain `Float32Array` cosine scan | Phase 14 decision | Eliminated uncertain dep; O(n) acceptable at 3766 chunks |
| Voy vector search | `useRAG` with pure JS cosine | Phase 14 decision | No WASM dep; zero browser compatibility concerns |

**What's already done (do not rebuild in Phase 15):**
- `hooks/use-ai-engine.ts` — module-level singleton, non-async dedup guard, `initProgressCallback`
- `components/ai-engine-progress.tsx` — 4-phase progress bar (idle/loading/ready/error)
- `hooks/use-rag.ts` — `buildIndex()`, `retrieveContext()`, `courseChunksCache`, `RAGStatus`
- `lib/build-system-prompt.ts` — `buildSystemPrompt()`, `LessonContext`, `RetrievedChunk`
- `lib/course-registry.ts` — `AIPersona` type, `aiPersona` in `COURSE_REGISTRY` for both courses

---

## Open Questions

1. **`streamdown` CSS with Tailwind v4**
   - What we know: `streamdown` requires `@source "../node_modules/streamdown/dist/*.js"` for Tailwind class detection; the project uses Tailwind v4 with `@tailwindcss/postcss`.
   - What's unclear: Whether the Tailwind v4 `@source` directive syntax is identical, or whether the import path differs in the installed version.
   - Recommendation: After `pnpm add streamdown`, inspect `node_modules/streamdown/dist/` for the actual file name pattern. Add `import 'streamdown/styles.css'` to globals.css and verify prose styling applies correctly before building the full panel.

2. **`engine.chat.completions.create` max conversation history token count**
   - What we know: Phi-3.5-mini has 4K context window; system prompt consumes ~800 tokens.
   - What's unclear: Whether WebLLM 0.2.82 enforces a hard `max_tokens` cap or silently truncates conversation history when context is exceeded.
   - Recommendation: Hard-cap history slice at 6 messages in `sendMessage`. Log context length in dev mode using WebLLM's `engine.runtimeStatsText()` to verify token counts during testing.

3. **`AIChatPanel` layout on mobile**
   - What we know: `SheetContent` with `side="right"` sets `w-3/4 sm:max-w-sm` on mobile, which may overlap content significantly.
   - What's unclear: Whether full-width bottom sheet (`side="bottom"`) is preferable on mobile breakpoints.
   - Recommendation: Use `side="right"` for desktop (`sm:` and up), `side="bottom"` for mobile via responsive detection or a CSS breakpoint override on `SheetContent className`. This is a UX decision — start with `side="right"` (existing Sheet default) and adjust based on testing.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `vitest.config.ts` — jsdom environment for components/hooks, node environment for `__tests__/scripts/**` |
| Quick run command | `pnpm test -- chat` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | Panel opens when `isOpen` is true | unit | `pnpm test -- ai-chat-panel` | Wave 0 |
| CHAT-02 | `AIMessage` passes `isAnimating={true}` to Streamdown when `streaming: true` | unit | `pnpm test -- ai-message` | Wave 0 |
| CHAT-03 | `sendMessage` calls `buildSystemPrompt` with lesson context | unit | `pnpm test -- chat-store` | Wave 0 |
| CHAT-04 | `sendMessage` calls `retrieveContext` and attaches citations to message | unit | `pnpm test -- chat-store` | Wave 0 |
| CHAT-06 | After two messages, history contains both user and assistant messages | unit | `pnpm test -- chat-store` | Wave 0 |
| PRAC-01 | `ExerciseRunner` renders `AIHintButton` when `courseSlug` prop provided | unit | `pnpm test -- exercise-runner` | Wave 0 |
| PRAC-02 | After `run()` returns `error`, `sendHint` is called automatically | unit | `pnpm test -- exercise-runner` | Wave 0 |
| PRAC-03 | `AIMessage` renders citation section when `citations.length > 0` and `streaming: false` | unit | `pnpm test -- ai-message` | Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test -- <test-file-pattern>` (focused on changed file)
- **Per wave merge:** `pnpm test` (full 358+ test suite)
- **Phase gate:** Full suite green + `pnpm build` succeeds before marking phase complete

### Wave 0 Gaps

- [ ] `__tests__/lib/chat-store.test.ts` — covers CHAT-02, CHAT-03, CHAT-04, CHAT-06; mock `getEngine` and `retrieveContext`
- [ ] `__tests__/components/ai-message.test.tsx` — covers CHAT-02, PRAC-03; mock `streamdown` module
- [ ] `__tests__/components/ai-chat-panel.test.tsx` — covers CHAT-01; mock `useAIEngine`, `useRAG`, `useChatStore`
- [ ] `__tests__/components/ai-hint-button.test.tsx` — covers PRAC-01 button render and click
- [ ] `__tests__/components/exercise-runner-ai.test.tsx` — covers PRAC-01, PRAC-02; extend existing exercise-runner test file OR create new file

---

## Concrete Integration Steps for LessonPage

The lesson page (`app/courses/[courseSlug]/[lessonSlug]/page.tsx`) is a Server Component. The chat panel needs to be injected without converting the page to `'use client'`.

**Approach:** Thin client boundary file.

```typescript
// components/ai-chat-panel-wrapper.tsx  ('use client' boundary)
'use client'
import dynamic from 'next/dynamic'
import { useChatStore } from '@/lib/store/chat'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AIChatPanel = dynamic(
  () => import('./ai-chat-panel').then(m => m.AIChatPanel),
  { ssr: false }
)

type Props = { courseSlug: string; lessonTitle: string; sectionTitle: string }

export function AIChatPanelWrapper(props: Props) {
  const { openPanel } = useChatStore()
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-40 gap-2 shadow-md"
      >
        <MessageCircle className="w-4 h-4" />
        Ask AI
      </Button>
      <AIChatPanel {...props} />
    </>
  )
}
```

Then in `page.tsx` (Server Component), add at the very end of the JSX:
```typescript
import { AIChatPanelWrapper } from '@/components/ai-chat-panel-wrapper'
// ...
<AIChatPanelWrapper
  courseSlug={courseSlug}
  lessonTitle={lesson.title}
  sectionTitle={section?.title ?? ''}
/>
```

This keeps `page.tsx` as a Server Component and avoids unnecessary client bundle cost.

---

## Sources

### Primary (HIGH confidence)

- `/hooks/use-ai-engine.ts` — Phase 13 implementation, directly inspected. Exact API: `useAIEngine(modelId)` returns `{ getEngine, status: AIEngineStatus, downloadProgress: DownloadProgress | null }`
- `/hooks/use-rag.ts` — Phase 14 implementation, directly inspected. Exact API: `useRAG(courseSlug)` returns `{ buildIndex, retrieveContext(query, engine, k?) => Promise<RetrievedChunk[]>, status: RAGStatus }`
- `/lib/build-system-prompt.ts` — Phase 14 implementation, directly inspected. Exports: `buildSystemPrompt(persona, lessonContext, ragChunks): string`, `LessonContext`, `RetrievedChunk`
- `/lib/course-registry.ts` — Directly inspected. `AIPersona` type: `{ name, modelId, systemPrompt }`. Both courses have `aiPersona` populated.
- `/components/ui/sheet.tsx` — Directly inspected. Already installed; exports: `Sheet, SheetContent (side="right"|"left"|"top"|"bottom"), SheetHeader, SheetTitle, SheetFooter`.
- `/components/code-runner/exercise-runner.tsx` — Directly inspected. `ExerciseRunner` props: `{ exercises: Exercise[] }`. Extension point: action bar after Reset button, `handleRun` result handler.
- `/app/courses/[courseSlug]/[lessonSlug]/page.tsx` — Directly inspected. Server Component; `lesson.title`, `section?.title`, `courseSlug` all available as variables.
- WebLLM official docs 0.2.82 — `engine.chat.completions.create({ stream: true })` AsyncGenerator API, confirmed by Phase 13 implementation.
- [github.com/vercel/streamdown](https://github.com/vercel/streamdown) — `import { Streamdown } from "streamdown"`, props: `children: string`, `isAnimating: boolean`, `animated: boolean`

### Secondary (MEDIUM confidence)

- [streamdown.ai/docs](https://streamdown.ai/docs) — CSS setup (`streamdown/styles.css` import, `@source` directive for Tailwind); verified consistent with GitHub README
- WebSearch results for `streamdown` npm API — confirmed Vercel authorship, streaming-first design, plugin system (code/mermaid/math/cjk optional)

### Tertiary (LOW confidence — validate during implementation)

- `streamdown` Tailwind v4 `@source` directive compatibility — not independently verified against Tailwind v4 specifically; verify after `pnpm add streamdown`
- Mobile bottom-sheet layout for `AIChatPanel` — UX decision; no authoritative source; based on general responsive design patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing hooks/components directly inspected; only `streamdown` is new and its API is verified via GitHub
- Architecture: HIGH — patterns mirror existing Phase 13/14 code exactly; no new architectural decisions required
- Pitfalls: HIGH — derived from Phase 13/14 implementation decisions and known WebLLM behavior
- Integration steps: HIGH — `page.tsx` structure and Server Component constraints directly inspected

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack; `streamdown` moves fast but API is simple)
