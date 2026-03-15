# Architecture Research

**Domain:** In-browser AI Learning Assistant integrated with Next.js SSG
**Researched:** 2026-03-15
**Confidence:** HIGH (WebLLM API from official docs + existing codebase verified directly)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │               LESSON PAGE ('use client' components)               │   │
│  │                                                                    │   │
│  │  ┌─────────────┐  ┌────────────────────┐  ┌──────────────────┐   │   │
│  │  │LessonContent │  │   PracticeBlock     │  │  AIChatPanel     │   │   │
│  │  │ (MDX prose)  │  │  + AIHintButton     │  │ (sliding panel)  │   │   │
│  │  └─────────────┘  └─────────┬──────────┘  └────────┬─────────┘   │   │
│  └────────────────────────────│─────────────────────────│─────────────┘   │
│                                │                         │                 │
│  ┌─────────────────────────────┼─────────────────────────┼──────────────┐ │
│  │                   ZUSTAND STORES                       │              │ │
│  │  ┌──────────────┐  ┌────────┴──────────┐  ┌──────────┴───────────┐  │ │
│  │  │ProgressStore  │  │  useAIEngine hook  │  │  useChatStore        │  │ │
│  │  │  (existing)   │  │  (singleton ref)   │  │  (messages, status,  │  │ │
│  │  └──────────────┘  └────────┬──────────┘  │   lessonContext)      │  │ │
│  │                              │             └──────────────────────┘  │ │
│  └──────────────────────────────│──────────────────────────────────────┘ │
│                                 │                                         │
│  ┌──────────────────────────────┼────────────────────────────────────┐   │
│  │                    WEB WORKER LAYER                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                   llm.worker.mjs                             │   │   │
│  │  │  ┌──────────────────────┐   ┌────────────────────────────┐  │   │   │
│  │  │  │ WebWorkerMLCEngine   │   │  (embedding via engine.    │  │   │   │
│  │  │  │ Handler (WebLLM)     │   │   embeddings.create() API) │  │   │   │
│  │  │  │ WebGPU inference     │   │                            │  │   │   │
│  │  │  └──────────────────────┘   └────────────────────────────┘  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                   BROWSER STORAGE                                    │   │
│  │  ┌──────────────────┐   ┌──────────────────────────────────────┐   │   │
│  │  │    Cache API       │   │            memory (runtime)           │   │   │
│  │  │ (LLM model weights │   │  Voy index built from rag-chunks.json │   │   │
│  │  │  cached after      │   │  on first lesson visit with AI open)  │   │   │
│  │  │  first download)   │   │                                       │   │   │
│  │  └──────────────────┘   └──────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│              BUILD TIME (Node.js — pnpm prebuild)                           │
│                                                                              │
│  courses/**/*.md  →  generate-rag-index.ts  →  public/data/rag-chunks.json  │
│  (220+ MD files)     (chunks + embeds via        (Float32 vectors +          │
│                       Transformers.js Node.js)    metadata, ~2-4MB gzipped)  │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│              NEXT.JS BUILD OUTPUT (SSG — no server, static HTML)            │
│                                                                              │
│  Static HTML pages (pre-rendered at build time)                              │
│  /data/rag-chunks.json   (static asset, immutable Cache-Control)             │
│  /workers/llm.worker.mjs (static asset, 1-day Cache-Control)                 │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | New vs Existing |
|-----------|---------------|-----------------|
| `llm.worker.mjs` | Hosts `WebWorkerMLCEngineHandler`. All GPU compute isolated from UI thread. Model weights cached via Cache API after first download. | NEW |
| `useAIEngine` hook | Module-level singleton ref to `WebWorkerMLCEngine` proxy. Initialises on first use, survives component remount. Exposes `status`, `getEngine()`. | NEW |
| `useRAG` hook | Loads `rag-chunks.json` once, builds Voy in-memory index, exposes `retrieveContext(query, k)` returning top-k chunk texts. | NEW |
| `useChatStore` (Zustand) | Non-persisted message history per session, tracks engine status, stores current lesson context (title, section, excerpt). Flushes completed messages to `sessionStorage`. | NEW |
| `AIChatPanel` | Sliding side panel: message list with streaming render, input bar, engine loading state. Reads `useChatStore`. | NEW |
| `AIHintButton` | Inline button in `PracticeBlock`. On click, sends `{code, error, lessonContext}` to `useChatStore.sendHintRequest()` and opens panel. | NEW |
| `AIMessage` | Message bubble component. Renders assistant content as Markdown (remark-based). Streaming indicator on incomplete messages. | NEW |
| `generate-rag-index.ts` | Prebuild script: reads all `.md` files via glob, chunks text (800-char, 200-char overlap, sentence-boundary snap), embeds via Transformers.js Node.js, writes `public/data/rag-chunks.json`. | NEW |
| `COURSE_REGISTRY` | Extended with `aiPersona: AIPersona` field (system prompt, tone, teaching style) per course. | MODIFIED |
| `PracticeBlock` | Extended with optional `courseSlug`, `lessonSlug` props and AI hint entry point. Backward-compatible — props optional. | MODIFIED |
| `LessonPage` | Extended to render `<AIChatPanel>` and pass `lessonContext` prop. No layout restructuring — panel appended to existing JSX. | MODIFIED |
| `next.config.mjs` | Extended with COEP/COOP headers required for `SharedArrayBuffer` (WebGPU). `async headers()` already exists. | MODIFIED |
| `package.json` prebuild | `generate-rag-index.ts` appended to existing `&&` chain in `predev` and `prebuild`. | MODIFIED |
| `ProgressStore` | Unchanged. | EXISTING |
| `usePyodideWorker` | Unchanged. Serves as the singleton Worker pattern reference for `useAIEngine`. | EXISTING |
| `generate-search-index.ts` | Unchanged. RAG index is separate from Fuse.js search index. | EXISTING |

---

## Recommended Project Structure

```
/
├── scripts/
│   ├── generate-mindmap-data.ts      # existing
│   ├── generate-search-index.ts      # existing
│   └── generate-rag-index.ts         # NEW: precompute vector chunks at build time
│
├── public/
│   ├── data/
│   │   └── rag-chunks.json           # NEW: static RAG index (Float32 + metadata)
│   └── workers/
│       ├── pyodide.worker.mjs        # existing
│       └── llm.worker.mjs            # NEW: WebLLM Web Worker entry point
│
├── lib/
│   ├── store/
│   │   ├── progress.ts               # existing
│   │   └── chat.ts                   # NEW: Zustand chat store
│   └── course-registry.ts            # MODIFIED: add aiPersona to CourseConfig
│
├── hooks/
│   ├── use-pyodide-worker.ts         # existing
│   ├── use-ai-engine.ts              # NEW: WebWorkerMLCEngine singleton
│   └── use-rag.ts                    # NEW: Voy index + retrieval
│
└── components/
    ├── practice-block.tsx            # MODIFIED: add AIHintButton entry point
    ├── ai-chat-panel.tsx             # NEW: sliding chat UI
    ├── ai-hint-button.tsx            # NEW: inline hint trigger
    └── ai-message.tsx                # NEW: message bubble with markdown
```

### Structure Rationale

- **`scripts/generate-rag-index.ts`:** Follows exact prebuild pattern of `generate-mindmap-data.ts` and `generate-search-index.ts`. Runs in Node.js at build time. This eliminates the embedding model (~23MB ONNX) from the user's browser download entirely.
- **`public/data/rag-chunks.json`:** Matches existing convention (`public/search-data.json`). Already covered by `Cache-Control: public, max-age=31536000, immutable` for `/data/:path*` in `next.config.mjs`.
- **`public/workers/llm.worker.mjs`:** Follows `pyodide.worker.mjs` precedent. The `/workers/` route already has `Cache-Control: public, max-age=86400` in `next.config.mjs`.
- **`lib/store/chat.ts`:** Zustand store convention. Separate file from `progress.ts` — different domain, different persistence lifecycle (chat is session-scoped, progress is user-scoped).
- **`hooks/use-ai-engine.ts`:** Module-level singleton pattern, identical to `use-pyodide-worker.ts`. One Worker shared across all components on the page regardless of mount/unmount cycles.

---

## Architectural Patterns

### Pattern 1: Module-Level Worker Singleton (mirrors existing Pyodide pattern)

**What:** A single `Worker` instance and its proxy engine live at module scope, not inside React state. Components access it via a shared hook. The instance persists across component mount/unmount cycles.

**When to use:** Any expensive WASM/WebGPU resource that must not be re-initialised on remount. Pyodide follows this pattern in `use-pyodide-worker.ts`; WebLLM must follow the same pattern.

**Trade-offs:** Simple, prevents duplicate 2GB+ model downloads, but requires care: the module-level variable is not React state, so status updates require `useState` inside the hook. Cleanup only when page unloads, not on component unmount.

**Example:**
```typescript
// hooks/use-ai-engine.ts
import { CreateWebWorkerMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm'

type EngineStatus = 'idle' | 'loading' | 'ready' | 'error'

// Module-level singleton — survives component remount (same as sharedWorker in use-pyodide-worker.ts)
let engineInstance: MLCEngineInterface | null = null
let enginePromise: Promise<MLCEngineInterface> | null = null

export function useAIEngine(modelId: string) {
  const [status, setStatus] = useState<EngineStatus>('idle')
  const statusRef = useRef(setStatus)
  statusRef.current = setStatus

  const getEngine = useCallback(async (): Promise<MLCEngineInterface> => {
    if (engineInstance) return engineInstance
    if (enginePromise) return enginePromise

    statusRef.current('loading')
    enginePromise = CreateWebWorkerMLCEngine(
      new Worker('/workers/llm.worker.mjs', { type: 'module' }),
      modelId,
      {
        initProgressCallback: (report) => {
          if (report.progress === 1) statusRef.current('ready')
        },
      }
    ).then((engine) => {
      engineInstance = engine
      return engine
    }).catch((err) => {
      enginePromise = null
      statusRef.current('error')
      throw err
    })

    return enginePromise
  }, [modelId])

  return { getEngine, status }
}
```

### Pattern 2: Build-Time RAG Index Precomputation

**What:** A Node.js prebuild script reads all markdown files, chunks them, generates embeddings using Transformers.js in Node.js mode, and writes a static JSON file to `public/data/`. At runtime, the browser loads this JSON and builds a Voy in-memory index for cosine similarity search.

**When to use:** Any static site where content is known at build time. Eliminates the embedding model from the browser entirely. The embedding model (~23MB ONNX, ~2-5 min on 220 lessons) runs only in CI/local build.

**Trade-offs:** Build time increases ~2-5 minutes. RAG index is stale between builds — acceptable since content changes require a rebuild anyway. JSON file is ~2-4MB gzipped for 220 lessons at 5 chunks average.

**Example:**
```typescript
// scripts/generate-rag-index.ts
import { pipeline } from '@xenova/transformers'
import { glob } from 'glob'
import fs from 'fs'

interface RagChunk {
  id: string
  lessonSlug: string
  courseSlug: string
  sectionSlug: string
  text: string
  embedding: number[]    // Float32Array serialised for JSON
}

async function main() {
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' })
  const mdFiles = await glob('courses/**/*.md')
  const chunks: RagChunk[] = []

  for (const file of mdFiles) {
    const raw = fs.readFileSync(file, 'utf-8')
    const fileChunks = chunkText(raw, 800, 200)    // 800-char chunks, 200-char overlap
    for (const [i, chunk] of fileChunks.entries()) {
      const output = await extractor(chunk.text, { pooling: 'mean', normalize: true })
      chunks.push({
        id: `${file}::${i}`,
        lessonSlug: extractLessonSlug(file),
        courseSlug: extractCourseSlug(file),
        sectionSlug: extractSectionSlug(file),
        text: chunk.text,
        embedding: Array.from(output.data),
      })
    }
  }

  fs.writeFileSync(
    'public/data/rag-chunks.json',
    JSON.stringify(chunks)      // no pretty-print: smaller file
  )
  console.log(`Generated ${chunks.length} RAG chunks from ${mdFiles.length} lessons`)
}
```

### Pattern 3: Context-Injected System Prompt (Persona + Lesson + RAG)

**What:** The AI persona (teaching style, tone) lives in `COURSE_REGISTRY`. At chat time, the system prompt combines: persona config + current lesson metadata + RAG-retrieved top-k chunks. Query embedding uses the already-loaded LLM's `engine.embeddings.create()` API — no second model download.

**When to use:** All chat interactions. The persona ensures Python course AI sounds different from the Data Engineering course AI.

**Trade-offs:** System prompt size grows with context. Phi-3-mini has a 4K context window. Limit system prompt to ~800 tokens (lesson title + section + 2-3 RAG chunks) to leave room for conversation history and the user's question.

**Example:**
```typescript
// lib/course-registry.ts — additions
export type AIPersona = {
  systemPrompt: string    // base instruction: role, tone, teaching style
  modelId: string         // WebLLM model ID (allows per-course override)
}

// In COURSE_REGISTRY:
python: {
  ...existingConfig,
  aiPersona: {
    modelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    systemPrompt: `You are a friendly Python tutor for beginners. You explain concepts with simple analogies and short code examples. Never write code longer than 10 lines. When a student has an error, explain what went wrong before showing the fix.`,
  },
},

// System prompt builder:
function buildSystemPrompt(
  persona: AIPersona,
  lessonContext: { title: string; sectionTitle: string },
  ragChunks: string[]
): string {
  return `${persona.systemPrompt}

Current lesson: "${lessonContext.title}" (Section: ${lessonContext.sectionTitle})

Relevant content from the course:
${ragChunks.slice(0, 3).join('\n\n---\n\n')}

Answer questions about this specific lesson. Be concise.`
}
```

### Pattern 4: Streaming Response Accumulation in Zustand

**What:** WebLLM's `engine.chat.completions.create({ stream: true })` returns an `AsyncGenerator`. The chat store accumulates delta content into the last message on each chunk. Streaming state is in non-persisted Zustand state; only completed messages are written to `sessionStorage`.

**When to use:** All chat interactions. Streaming is critical for perceived responsiveness — Phi-3-mini first-token latency is 2-8 seconds from cold start.

**Trade-offs:** Zustand triggers a re-render on every chunk. For fast inference, this can be 10-30 re-renders/second — acceptable. Persisting on each chunk would block localStorage writes synchronously; persisting only on completion avoids this.

**Example:**
```typescript
// lib/store/chat.ts (key methods)
async sendMessage(userText: string, engine: MLCEngineInterface, systemPrompt: string) {
  // 1. Append user message
  set(s => ({ messages: [...s.messages, { role: 'user', content: userText, streaming: false }] }))
  // 2. Append empty assistant placeholder
  set(s => ({ messages: [...s.messages, { role: 'assistant', content: '', streaming: true }] }))

  // 3. Stream response
  const chunks = await engine.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...get().conversationHistory()],
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

  // 4. Mark complete (triggers sessionStorage flush)
  set(s => {
    const msgs = [...s.messages]
    msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], streaming: false }
    return { messages: msgs }
  })
}
```

---

## Data Flow

### Chat Request Flow

```
User types message in AIChatPanel
    ↓
useChatStore.sendMessage(text)
    ↓
useRAG.retrieveContext(text) → top-3 chunks from Voy in-memory index
    (Voy.search() uses cosine similarity on Float32Array vectors)
    ↓
buildSystemPrompt(coursePersona + lessonTitle + ragChunks)
    ↓
engine.chat.completions.create({ messages, stream: true })
    ↓ (postMessage to llm.worker.mjs via WebWorkerMLCEngine proxy)
WebWorkerMLCEngineHandler → MLCEngine → WebGPU shader dispatch
    ↓ (streaming token chunks back via MessageChannel)
useChatStore accumulates delta.content → Zustand re-render per chunk
    ↓
AIChatPanel renders streaming text as Markdown
```

### RAG Retrieval Flow (Query Embedding)

```
useRAG.retrieveContext(userQuery)
    ↓
engine.embeddings.create({ input: userQuery })
    (uses already-loaded Phi-3 model — no second model download)
    ↓ (postMessage to llm.worker.mjs)
MLCEngine computes query embedding → Float32Array (768 dims)
    ↓
Voy.search(queryEmbedding, k=3)
    (cosine similarity against ~1100 precomputed vectors in memory)
    ↓
Returns top-3 chunk texts → injected into system prompt
```

### RAG Index Load Flow

```
AIChatPanel mounts (first time on lesson page)
    ↓
useRAG hook: fetch('/data/rag-chunks.json')
    (served from CDN/static; immutable cache after first load)
    ↓
Parse JSON → extract id, text, embedding arrays
    ↓
new Voy({ embeddings: chunks.map(...) })
    (WASM init + k-d tree build, ~100ms for 1100 vectors)
    ↓
Voy index stored in module-level ref (same singleton pattern)
    ↓
useRAG.retrieveContext available
```

### Build-Time RAG Generation Flow

```
pnpm prebuild → tsx scripts/generate-rag-index.ts
    ↓
glob('courses/**/*.md') → 220+ markdown files
    ↓
For each file:
  Read raw text → strip frontmatter/MDX components
  chunkText(800 chars, 200 overlap, snap to sentence boundaries)
  Transformers.js: extractor(chunk) → Float32 embedding (384 dims)
    ↓
Write public/data/rag-chunks.json
  [{id, lessonSlug, courseSlug, sectionSlug, text, embedding: number[]}]
    ↓
~1100 chunks (220 lessons × ~5 avg chunks) → ~3MB JSON → ~900KB gzipped
```

### Practice Hint Flow

```
Student encounters error in CodeRunner
    ↓
AIHintButton onClick fires with { code, error, lessonContext }
    ↓
Opens AIChatPanel (if closed)
    ↓
sendMessage with prefilled prompt:
  "I got this error: {error}\n\nIn my code:\n{code}\n\nCan you explain what went wrong?"
    ↓
Same chat request flow as above
```

---

## Integration Points

### Existing Architecture Touch Points

| Boundary | Integration | Change Required |
|----------|-------------|-----------------|
| `COURSE_REGISTRY` ↔ AI persona | Add `aiPersona: AIPersona` to `CourseConfig` type | Additive — no breaking change to existing fields |
| `PracticeBlock` ↔ AI hints | Add optional `courseSlug`, `lessonSlug`, `errorContext` props | Backward-compatible — all props optional |
| `LessonPage` ↔ `AIChatPanel` | Render `<AIChatPanel>` at end of lesson page JSX | Insert after existing content — no layout restructuring |
| `next.config.mjs` ↔ COEP/COOP | Add cross-origin isolation headers for WebGPU SharedArrayBuffer | `async headers()` already exists; add one new rule |
| `package.json` prebuild ↔ RAG script | Append `tsx scripts/generate-rag-index.ts` to existing `&&` chain | One-line addition to `predev` and `prebuild` |
| `public/data/` ↔ RAG JSON | `rag-chunks.json` served as static asset by Next.js | No config — existing `Cache-Control` header for `/data/:path*` covers this |

### Required COEP/COOP Headers in next.config.mjs

WebGPU requires `SharedArrayBuffer`, which browsers restrict to cross-origin isolated contexts. Add to the existing `async headers()` in `next.config.mjs`:

```javascript
{
  source: '/(.*)',
  headers: [
    { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
    { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
  ],
},
```

Use `credentialless` (not `require-corp`) to avoid breaking third-party resources. If NotebookLM deeplinks break, narrow the scope to `source: '/courses/(.*)'` instead of all routes.

### New External Libraries Required

| Library | Purpose | Install |
|---------|---------|---------|
| `@mlc-ai/web-llm` | In-browser LLM inference via WebGPU | `pnpm add @mlc-ai/web-llm` |
| `@xenova/transformers` | Embedding model for build-time RAG index generation (Node.js only) | `pnpm add -D @xenova/transformers` |
| `voy-search` | WASM vector similarity search (browser runtime, 75KB gzipped) | `pnpm add voy-search` |

Note: `@xenova/transformers` is a `devDependency` because it runs only in the prebuild script. The browser never loads it. `voy-search` is a `dependency` because it runs in the browser at query time.

---

## Scaling Considerations

| Scale | Architecture Adjustment |
|-------|------------------------|
| 220 lessons (current) | ~1100 chunks, ~3MB JSON, ~100ms Voy init. All fits in memory. Standard pattern. |
| 500 lessons | ~2500 chunks, ~7MB JSON (~2MB gzip). Single fetch still acceptable. Voy init ~200ms. |
| 2000+ lessons | Partition index by course. `useRAG` loads only the active course's chunk file. Voy supports `serialize()`/`deserialize()` for caching in IndexedDB. |
| Multiple concurrent users | Irrelevant — all compute is client-side. Server load = CDN hit for static JSON. Zero backend scaling concern. |

**First bottleneck:** Model download size (2.2GB for Phi-3-mini). Mitigated by Cache API persistence — second visit is instant. UX requires explicit progress indicator during first load.

**Second bottleneck:** WebGPU hardware availability. Chrome 113+, Edge 113+, Safari 17.4+. Firefox behind flag. Requires graceful fallback (disable AI panel, show upgrade prompt) when WebGPU unavailable.

---

## WebLLM Lifecycle in Next.js SSG Context

### Why SSG + WebLLM Works Without Special Handling

Next.js SSG pre-renders pages to static HTML. WebLLM is entirely client-side — no conflict. The integration constraints are:

1. WebLLM imports must only appear in `'use client'` files (hooks, components). Server Components never see `@mlc-ai/web-llm`.
2. The worker file (`llm.worker.mjs`) lives in `public/workers/` — served as a static asset, not bundled by Next.js. Same approach as `pyodide.worker.mjs`.
3. `dynamic(() => import(...), { ssr: false })` is NOT needed as long as WebLLM imports live only in `'use client'` files.

### Recommended Model

**`Phi-3-mini-4k-instruct-q4f16_1-MLC`**

- Download size: ~2.2GB (first visit); 0 bytes on return visits (Cache API)
- Context window: 4K tokens
- Capability: Strong instruction following, suitable for Q&A + code explanation
- WebGPU compatibility: Chrome 113+, Edge 113+, Safari 17.4+
- First-token latency: ~2-4 seconds on modern hardware after model loads
- Model load time from cache: ~200ms

### Model Loading UX

The `initProgressCallback` from `CreateWebWorkerMLCEngine` provides a download progress `report` object with a `progress` field (0-1) and `text` description. The `AIChatPanel` must show a prominent loading state during first load. On a 50Mbps connection, 2.2GB takes approximately 5-6 minutes — surface this clearly before the user clicks the AI button for the first time.

---

## Anti-Patterns

### Anti-Pattern 1: Initialising WebLLM Inside React Component (No Singleton)

**What people do:** Call `CreateMLCEngine()` inside `useEffect` or during render inside the `AIChatPanel` component.

**Why it's wrong:** Every component unmount/remount (closing and reopening the chat panel, navigating lesson pages) triggers a new 2.2GB model download or multi-second reinitialisation. The model is never reused.

**Do this instead:** Module-level singleton in `hooks/use-ai-engine.ts`, exactly as `usePyodideWorker` stores `sharedWorker` at module scope. The singleton persists across all component mount/unmount cycles within the same page session.

### Anti-Pattern 2: Running Embedding Model in the Browser at Query Time

**What people do:** Load Transformers.js + ONNX weights (~23MB) in the browser to embed user queries before Voy search.

**Why it's wrong:** The user's browser must download and initialise two WASM/ONNX/WebGPU runtimes (LLM + embedding model). Memory pressure doubles. First-visit experience requires downloading both.

**Do this instead:** Pre-embed all document chunks at build time (Node.js, zero browser impact). At query time, use `engine.embeddings.create()` from the already-loaded Phi-3 model to embed the query. The LLM is already in VRAM — reusing it for query embedding is near-zero marginal cost and requires no second model download.

### Anti-Pattern 3: Persisting Streaming Message State to localStorage

**What people do:** Use Zustand `persist` middleware on the entire chat store including the `messages` array.

**Why it's wrong:** Streaming responses produce 30-100 intermediate Zustand state updates per response. Zustand `persist` with localStorage writes synchronously on each update — this blocks the main thread 30-100 times per response and corrupts partial messages on page reload mid-stream.

**Do this instead:** Keep `messages` in non-persisted Zustand state during streaming. After each message completes (`streaming: false`), optionally flush to `sessionStorage` for within-session recovery. Never persist to `localStorage` mid-stream.

### Anti-Pattern 4: Injecting Full Lesson Markdown Into System Prompt

**What people do:** Pass the full raw Markdown of the current lesson (5-15KB, 1500-4000 tokens) as system prompt context.

**Why it's wrong:** Phi-3-mini has a 4K context window. A 3KB lesson excerpt + 5 conversation turns + model's own response overhead exceeds the window. The model either truncates the conversation history or the lesson context.

**Do this instead:** Use RAG to retrieve only the 2-3 most relevant chunks (~500 chars each). Inject only `lessonTitle + sectionTitle + top-3 chunks`. Total system prompt budget: ~800 tokens, leaving 3200 tokens for conversation history and response.

### Anti-Pattern 5: Loading rag-chunks.json on Every Lesson Mount

**What people do:** `fetch('/data/rag-chunks.json')` inside the component that renders on every lesson page load, rebuilding the Voy index on each navigation.

**Why it's wrong:** The JSON is ~3MB. Parsing + Voy index build takes 100-300ms. This overhead repeats on every lesson navigation even though the index never changes.

**Do this instead:** Module-level singleton for the Voy index in `hooks/use-rag.ts` — same pattern as the LLM engine. Load once, reuse across all lesson navigations within the session.

---

## Build Order (Dependency-Respecting)

```
Phase 1: Foundation (no dependencies, can start immediately)
  Step 1a: public/workers/llm.worker.mjs
           WebWorkerMLCEngineHandler setup. No React deps.
           Unblocks: Step 2a.

  Step 1b: scripts/generate-rag-index.ts
           Prebuild script. Pure Node.js, no React deps.
           Install @xenova/transformers as devDep.
           Run manually to produce public/data/rag-chunks.json.
           Unblocks: Step 2b.

  Step 1c: lib/course-registry.ts — AIPersona type + aiPersona field
           Additive change. No callers break (new optional field).
           Unblocks: Step 3.

Phase 2: Core hooks (depends on Phase 1)
  Step 2a: hooks/use-ai-engine.ts
           Depends on: llm.worker.mjs (Step 1a), @mlc-ai/web-llm installed.
           Module-level singleton, mirrors use-pyodide-worker.ts pattern.
           Unblocks: Step 3.

  Step 2b: hooks/use-rag.ts
           Depends on: rag-chunks.json existing (Step 1b), voy-search installed.
           Module-level Voy index singleton.
           Unblocks: Step 3.

Phase 3: State store (depends on Phase 2)
  Step 3: lib/store/chat.ts
          Depends on: useAIEngine (Step 2a), useRAG (Step 2b), AIPersona (Step 1c).
          sendMessage() action orchestrates RAG retrieval + LLM streaming.
          Unblocks: Step 4.

Phase 4: UI components (depends on Phase 3)
  Step 4a: components/ai-message.tsx
           No store deps — pure presentational. Can parallel with 4b.
           Markdown rendering for assistant messages.

  Step 4b: components/ai-hint-button.tsx
           Depends on: useChatStore (Step 3).
           Inline button for PracticeBlock.

  Step 4c: components/ai-chat-panel.tsx
           Depends on: useChatStore (Step 3), AIMessage (Step 4a).
           Sliding panel with message list and input.

Phase 5: Integration into existing components (depends on Phase 4)
  Step 5a: components/practice-block.tsx — add AIHintButton
           Depends on: AIHintButton (Step 4b).
           Backward-compatible: new props are optional.

  Step 5b: app/courses/[courseSlug]/[lessonSlug]/page.tsx — add AIChatPanel
           Depends on: AIChatPanel (Step 4c).
           Append <AIChatPanel> to existing JSX — no layout changes.

Phase 6: Infrastructure config (no code deps, can run anytime)
  Step 6: next.config.mjs — COEP/COOP headers
          Add cross-origin isolation headers.
          Verify NotebookLM deeplinks still work.
          Add generate-rag-index.ts to predev and prebuild scripts.
```

---

## Sources

- WebLLM official docs (basic usage): https://webllm.mlc.ai/docs/user/basic_usage.html
- WebLLM advanced usage (Web Workers): https://webllm.mlc.ai/docs/user/advanced_usage.html
- WebLLM GitHub: https://github.com/mlc-ai/web-llm
- Browser-based RAG with WebGPU: https://dev.to/emanuelestrazzullo/building-a-browser-based-rag-system-with-webgpu-h2n
- Build-time embedding precomputation for static sites: https://www.allaboutken.com/posts/20260302-semantic-search-browser-embeddings/
- Voy WASM vector search: https://github.com/tantaraio/voy
- Privacy-preserving RAG in browser (Transformers.js + Voy + WebLLM stack): https://www.sitepoint.com/browser-based-rag-private-docs/
- Vercel: Fix SharedArrayBuffer / COEP in Next.js: https://vercel.com/kb/guide/fix-shared-array-buffer-not-defined-nextjs-react
- Existing codebase: `hooks/use-pyodide-worker.ts` — Worker singleton pattern reference (HIGH confidence, direct inspection)
- Existing codebase: `scripts/generate-search-index.ts` — prebuild script pattern reference (HIGH confidence, direct inspection)
- Existing codebase: `next.config.mjs` — headers config reference (HIGH confidence, direct inspection)
- Existing codebase: `lib/course-registry.ts` — CourseConfig extension point (HIGH confidence, direct inspection)

---

*Architecture research for: JustLearn v2.1 — In-browser AI Learning Assistant (WebLLM + RAG + Personas)*
*Researched: 2026-03-15*
