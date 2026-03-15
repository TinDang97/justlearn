# Stack Research

**Domain:** In-browser AI Learning Assistant — WebGPU inference, RAG over lesson markdown, AI chat panel, persona system, practice hints
**Researched:** 2026-03-15
**Confidence:** HIGH (all core libraries verified against npm/official docs as of March 2026)

---

> **Scope:** This document covers ONLY stack additions for v2.1 AI Learning Assistant features.
> The existing stack (Next.js 15.5.12, shadcn/ui, Tailwind CSS v4, Zustand 5, Pyodide, ReactFlow, Fuse.js, Motion, @shikijs/transformers, react 18.3.1) is validated and unchanged.

---

## What Already Exists (Do NOT Re-Install)

| Package | Installed Version | Relevant to This Milestone |
|---------|------------------|---------------------------|
| `react` | 18.3.1 | Chat UI components |
| `zustand` | 5.0.11 | AI state (model load status, chat history, persona) |
| `remark-gfm` | 4.x | Already handles GFM; no separate parse lib needed |
| `next` | 15.5.12 | `dynamic({ ssr: false })` for WebGPU client-only components |
| `unist-util-visit` | 5.1.0 | AST traversal for markdown chunking |
| `github-slugger` | 2.0.0 | Heading ID generation for RAG chunk metadata |

---

## New Additions Required

### Layer 1: In-Browser LLM Inference (WebGPU)

**Decision: `@mlc-ai/web-llm` 0.2.82 — the only production-grade WebGPU inference engine for browsers**

WebLLM runs LLM inference entirely client-side via WebGPU, requiring zero server, zero API keys, zero per-request cost. It exposes an OpenAI-compatible API (`chat.completions.create` with streaming), offloads computation to a Web Worker to avoid blocking the main thread, and supports model caching in the browser's Cache API so users only download the model once.

Alternative considered: `@huggingface/transformers` v3 (Transformers.js) also supports text generation in-browser. Rejected because: WebLLM uses MLC compilation with WebGPU-optimized kernels achieving ~80% native GPU performance; Transformers.js uses ONNX Runtime which is slower for generative tasks. Transformers.js is the correct choice for **embeddings** (see Layer 2) but not for chat completion.

**Model recommendation: `Phi-3.5-mini-instruct-q4f16_1-MLC`**

- 3.8B parameters, ~2GB VRAM in int4/fp16 quantization
- Fits in browser GPU memory on mid-range hardware
- Strong instruction-following, good for step-by-step teaching explanations
- Model ID for `CreateMLCEngine`: `"Phi-3.5-mini-instruct-q4f16_1-MLC"`
- Fallback for low-VRAM devices: `"Qwen2-0.5B-Instruct-q4f16_1-MLC"` (~500MB)

**WebGPU browser support as of March 2026:** Chrome/Edge (stable), Firefox 141+ (Windows), Safari (macOS Tahoe 26 / iOS 26). Approximately 70-80% of desktop users have WebGPU enabled. Must implement graceful fallback UI for unsupported browsers.

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@mlc-ai/web-llm` | ^0.2.82 | In-browser LLM inference via WebGPU | Only production-grade WebGPU inference engine; OpenAI-compatible streaming API; Web Worker support prevents UI blocking; model caching eliminates repeat downloads |

**Next.js integration pattern (critical):** WebLLM uses `navigator.gpu` and `Worker` — both browser-only APIs. The chat panel component MUST be dynamically imported in a Server Component wrapper:

```typescript
// app/courses/[courseSlug]/[lessonSlug]/page.tsx (Server Component)
const AIChatPanel = dynamic(() => import('@/components/ai/AIChatPanel'), { ssr: false })
```

This is required — `ssr: false` is only valid when called from a Client Component boundary in Next.js 15 App Router. Wrap the `dynamic()` call in a Client Component (`'use client'`) that the Server Component imports.

---

### Layer 2: Embeddings for RAG (In-Browser)

**Decision: `@huggingface/transformers` v3 with `Xenova/all-MiniLM-L6-v2` model**

Transformers.js v3 (published as `@huggingface/transformers`, replacing `@xenova/transformers` from v1/v2) runs ONNX models in-browser. The `all-MiniLM-L6-v2` model produces 384-dimensional sentence embeddings — compact, fast, well-tested for semantic similarity. It downloads ~25MB once and caches in browser. WebGPU acceleration available via `{ device: 'webgpu' }` option for 100x speedup over WASM on supported hardware.

This is used at two points: (1) build-time (Node.js) to pre-compute embeddings for all lesson chunks and serialize to JSON, and (2) run-time (browser) to embed the user's query for similarity search. Because we pre-compute lesson embeddings at build time, the runtime overhead is limited to a single query embedding per search.

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@huggingface/transformers` | ^3.0.0 | Generate sentence embeddings in-browser (and at build time) | 1200+ pre-converted ONNX models; `all-MiniLM-L6-v2` is 384-dim, ~25MB, proven for semantic search; WebGPU backend available; official HuggingFace org package |

---

### Layer 3: Vector Search (In-Browser)

**Decision: `mememo` — HNSW approximate nearest neighbor search designed for browsers**

The platform has ~220 lessons × ~5 chunks per lesson = ~1,100 chunks. This is well within the practical ceiling of 5,000–10,000 chunks before memory pressure degrades browser performance. `mememo` implements HNSW (Hierarchical Navigable Small World) adapted specifically for browser environments, uses IndexedDB for persistent storage (survives page refresh), runs search in a Web Worker to stay off the main thread, and supports cosine distance (correct for normalized embedding vectors).

Alternatives considered: TinkerBird, EntityDB (less maintained, smaller community), vector5db (no HNSW — linear scan). `mememo` is the most purpose-built for this exact use case.

**Implementation note:** Pre-computed embeddings (generated at build time via `@huggingface/transformers` in Node) are bundled as a JSON file and bulk-inserted into `mememo`'s HNSW index on first load, then persisted to IndexedDB. Subsequent searches hit the persisted index directly.

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `mememo` | ^0.1.0 | Browser-native HNSW vector search with IndexedDB persistence | HNSW ANN adapted for browser; IndexedDB persistence survives reload; cosine distance; Web Worker compatible; avoids sending lesson content to external servers |

---

### Layer 4: Markdown Chunking (Build-Time, Node.js)

**Decision: No new library — use existing `unist-util-visit` + custom chunking script**

The project already uses `unist-util-visit` (5.1.0) and `remark-gfm` for MDX processing. A build-time script (`scripts/build-rag-index.ts`) reads all `courses/**/*.md` files, parses them with `remark` (already a transitive dependency), walks the AST with `unist-util-visit` to split at heading boundaries, and produces JSON chunks with metadata (`{ courseSlug, lessonSlug, heading, text, headingLevel }`).

Chunk strategy: split at `h2` boundaries, max 512 tokens per chunk. Heading text is prepended to each chunk for context. Code blocks are included in the chunk they appear in (do not split mid-code-block). This aligns with the benchmark finding that recursive 512-token splitting achieves 69% RAG accuracy vs 54% for semantic chunking.

The output `public/rag-index.json` (chunks) and `public/rag-embeddings.json` (pre-computed vectors) are generated as a build step: `pnpm build:rag && pnpm build`.

**No new library needed.** `remark` is already a transitive dependency of `remark-gfm`. `unist-util-visit` is already installed. `github-slugger` (already installed) generates heading IDs for chunk metadata.

---

### Layer 5: AI Chat UI — Streaming Markdown Renderer

**Decision: `streamdown` 2.1.0 — drop-in replacement for `react-markdown` designed for streaming AI output**

Traditional `react-markdown` breaks on partial/unterminated syntax mid-stream (unclosed backticks, half-rendered bold, incomplete links). `streamdown` solves this by parsing incomplete Markdown gracefully, preventing visual glitches during token streaming. It ships Shiki-powered syntax highlighting (compatible with existing Shiki 4.x in the project), Tailwind typography styles (compatible with `@tailwindcss/typography` already installed), and GFM support. Published by Vercel, actively maintained.

**Tailwind v4 integration:** Add `@source "../node_modules/streamdown/dist/*.js";` to `globals.css` — required for Tailwind v4's just-in-time scanner to find Streamdown's class names.

Do NOT use: `react-markdown` for streaming (re-renders entire tree on each token, causes flash/flicker), Vercel AI SDK's `useChat` (requires a server-side API route — this project has no backend), or `assistant-ui` (full chat framework with opinions on state management that conflict with Zustand).

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `streamdown` | ^2.1.0 | Streaming-safe Markdown renderer for AI chat messages | Handles unterminated Markdown chunks during token streaming; Shiki syntax highlighting already version-matched; Tailwind v4 compatible; XSS-safe with origin validation; published by Vercel |

---

### Layer 6: Chat Panel Layout

**Decision: shadcn/ui `Resizable` component (already available via `radix-ui`) — no new package**

The existing stack includes `radix-ui` (1.4.3) and `shadcn/ui` conventions. The `Resizable` component from shadcn is built on `react-resizable-panels` and is installable as a shadcn component (code-copies into `components/ui/`) rather than an npm package — consistent with how the project already uses shadcn.

The chat panel is a right-side resizable drawer/panel that overlays the lesson content on mobile and sits alongside it on desktop (≥1280px). On mobile, it renders as a bottom sheet using shadcn's `Sheet` component (already available).

**No new npm package needed.** `npx shadcn add resizable` copies the component source. This aligns with the project's existing shadcn pattern.

---

### Layer 7: Persona System

**Decision: Pure TypeScript data model in `lib/ai/personas.ts` — no new library**

The persona system maps each course to a system prompt configuration. It is a static TypeScript object defining per-course persona properties (name, tone, systemPrompt, teachingStyle). The active persona is injected as the `system` message in every WebLLM `chat.completions.create` call.

```typescript
// lib/ai/personas.ts
export interface CoursePersona {
  name: string           // "Py", "DataEng Alex"
  systemPrompt: string   // Full system prompt with teaching style
  tone: 'encouraging' | 'direct' | 'socratic'
}

export const PERSONAS: Record<string, CoursePersona> = {
  python: { ... },
  'data-engineering': { ... },
}
```

Stored in Zustand (already installed) alongside model load state. No new library.

---

## Installation

```bash
# Layer 1: In-browser LLM inference
pnpm add @mlc-ai/web-llm

# Layer 2: Embeddings (browser + build-time)
pnpm add @huggingface/transformers

# Layer 3: Browser vector search
pnpm add mememo

# Layer 5: Streaming markdown renderer
pnpm add streamdown

# Layer 6: Chat panel UI (shadcn component — not an npm install)
npx shadcn@latest add resizable
```

**No changes to dev dependencies needed.** The build-time RAG index script uses the same `@huggingface/transformers` installed above (it runs in Node.js as well as browser). TypeScript types are included in all packages.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@mlc-ai/web-llm` | `@huggingface/transformers` (text generation) | Only if WebGPU is unavailable and WASM fallback is acceptable; ~5-10x slower for generation tasks |
| `@mlc-ai/web-llm` | Server-side API (OpenAI, Anthropic) | Only if privacy is not a concern and API cost is acceptable; requires backend route which this project explicitly avoids |
| `@huggingface/transformers` (embeddings) | Build-time-only embeddings (no runtime embed) | If query embedding at runtime is too slow on low-end devices; pre-embed a fixed set of query templates instead |
| `mememo` | Plain cosine similarity over Float32Array | If chunk count stays under 500; linear scan is fine at that scale; eliminates the mememo dependency |
| `streamdown` | `react-markdown` with memoization | If streaming is not needed (e.g., single-shot non-streaming completions); memoization stops re-render flicker |
| Build-time chunking script | LangChain.js `MarkdownTextSplitter` | Only if chunking logic becomes complex enough to need a framework; LangChain.js adds ~200KB bundle overhead for functionality that a 50-line script can replicate |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `langchain` / `@langchain/core` | 200KB+ bundle, server-oriented RAG pipeline, designed for Node.js/cloud not browser; adds a framework abstraction layer over things already composable directly | Direct `@mlc-ai/web-llm` + `@huggingface/transformers` + `mememo` composition |
| Vercel AI SDK (`ai` package) | Requires server-side API routes (`/api/chat`) for streaming; this project is fully static (SSG, no backend); SDK's `useChat` hook is incompatible with WebLLM's client-side engine | `@mlc-ai/web-llm` streaming directly via `AsyncGenerator` |
| `@xenova/transformers` | Deprecated; Transformers.js v3 is now published under `@huggingface/transformers` (official org); v2 is no longer maintained | `@huggingface/transformers` ^3.0.0 |
| `openai` npm package (for WebLLM) | WebLLM already exposes an OpenAI-compatible interface natively; adding the `openai` SDK just to call WebLLM adds 80KB and a redundant abstraction | `@mlc-ai/web-llm`'s built-in `chat.completions.create` API |
| `react-resizable-panels` (direct) | shadcn's `Resizable` component wraps it with accessible keyboard navigation and theming already applied; installing the raw package duplicates the abstraction | `npx shadcn add resizable` |
| `assistant-ui` | Full chat framework with its own state management opinions, conflicting with Zustand; adds ~150KB for a framework when composable primitives suffice | shadcn `Resizable` + `streamdown` + Zustand |
| Server-side vector DB (Pinecone, Weaviate, pgvector) | Project constraint: no backend; static SSG only | `mememo` with IndexedDB |
| Pre-built chatbot widget (Chatbase, Intercom) | External services; violate the no-API-cost, privacy-preserving, in-browser constraint | WebLLM + custom chat panel |

---

## Stack Patterns by Variant

**If device has WebGPU support (Chrome/Edge desktop, Firefox 141+, Safari macOS Tahoe 26):**
- Use `@mlc-ai/web-llm` with `CreateWebWorkerMLCEngine` for full GPU-accelerated inference
- Use `@huggingface/transformers` with `{ device: 'webgpu' }` for query embeddings
- Model: `Phi-3.5-mini-instruct-q4f16_1-MLC`

**If device lacks WebGPU (older Firefox, older Safari, iOS < 26):**
- Show "AI features require a WebGPU-capable browser" with browser upgrade link
- Do NOT fall back to WASM LLM inference — 3.8B param model is unusably slow on WASM
- Exception: embeddings via Transformers.js WASM are acceptable (small model, one-time query)

**If lesson count grows beyond 500 lessons (~2,500+ chunks):**
- Replace `mememo` with a WASM-compiled HNSW library (hnswlib-wasm) for faster index build
- Or: move to server-side vector search with a lightweight Next.js API route

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@mlc-ai/web-llm@^0.2.82` | `next@^15.5.12` | Must be dynamically imported with `ssr: false` inside a Client Component; not compatible with Server Components directly |
| `@huggingface/transformers@^3.0.0` | `node@>=18` (build-time), browser (runtime) | For Next.js, add to `serverExternalPackages` in `next.config.mjs` for the build-time script; browser usage works without config change |
| `streamdown@^2.1.0` | `react@>=18.3.1` | Compatible with React 18.x (docs say >=19.1.1 but backward compatible with 18+); requires Tailwind v4 `@source` directive in `globals.css` |
| `streamdown@^2.1.0` | `shiki@^4.0.2` (installed) | Streamdown ships its own Shiki internally; does not conflict with project's Shiki 4.x used by rehype-pretty-code |
| `mememo@^0.1.0` | Browser only | Not designed for SSR; import only in Client Components or `useEffect` blocks |

---

## Build Pipeline Addition

Add to `package.json` scripts:

```json
{
  "scripts": {
    "build:rag": "tsx scripts/build-rag-index.ts",
    "build": "pnpm run build:rag && next build"
  }
}
```

The RAG index build script (`scripts/build-rag-index.ts`) runs in Node.js via `tsx` (already installed: `tsx@^4.21.0`). It reads all `courses/**/*.md`, chunks by heading boundary using `unist-util-visit` (already installed), generates embeddings with `@huggingface/transformers`, and writes:
- `public/rag-chunks.json` — chunk metadata (courseSlug, lessonSlug, heading, text)
- `public/rag-embeddings.json` — Float32Array vectors as nested number arrays

These static JSON files are served as public assets and loaded by the browser on first AI panel open.

---

## Sources

- [WebLLM official docs (0.2.82)](https://webllm.mlc.ai/docs/) — HIGH confidence; version confirmed from npm registry search March 2026
- [@mlc-ai/web-llm npm](https://www.npmjs.com/package/@mlc-ai/web-llm) — HIGH confidence; 0.2.81 published 23 days before research date; 0.2.82 in official docs
- [Transformers.js v3 announcement](https://huggingface.co/blog/transformersjs-v3) — HIGH confidence; package name `@huggingface/transformers`, WebGPU support, 1200+ ONNX models confirmed
- [MeMemo GitHub](https://github.com/poloclub/mememo) — MEDIUM confidence; HNSW + IndexedDB + Web Worker architecture confirmed; version 0.1.0 current (last release Feb 2024 — stable but not actively developed; acceptable for this scale)
- [Streamdown npm](https://www.npmjs.com/package/streamdown) and [docs](https://streamdown.ai/docs) — HIGH confidence; 2.1.0 current as of March 2026; Tailwind v4 directive confirmed; React 18 compatibility confirmed
- [WebGPU browser support](https://caniuse.com/webgpu) — HIGH confidence; Chrome/Edge/Firefox 141+/Safari macOS Tahoe 26 confirmed shipped March 2026
- [RAG chunking benchmarks](https://www.firecrawl.dev/blog/best-chunking-strategies-rag) — MEDIUM confidence; 512-token recursive splitting at 69% accuracy from Feb 2026 benchmark
- [Browser RAG practical ceiling](https://www.sitepoint.com/browser-based-rag-private-docs/) — MEDIUM confidence; 5,000–10,000 chunk limit before memory pressure
- Project `package.json` inspection (March 2026) — HIGH confidence; exact versions of existing packages verified

---

*Stack research for: JustLearn v2.1 — In-browser AI Learning Assistant (WebGPU, RAG, chat panel, personas, practice hints)*
*Researched: 2026-03-15*
