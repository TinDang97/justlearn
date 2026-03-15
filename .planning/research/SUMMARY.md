# Project Research Summary

**Project:** JustLearn v2.1 — In-Browser AI Learning Assistant
**Domain:** WebGPU-accelerated in-browser LLM inference, RAG over lesson corpus, AI chat panel, per-course teacher personas, AI practice hints
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

JustLearn v2.1 adds a fully in-browser AI learning assistant to an existing Next.js 15 SSG platform serving 300 students across two courses (~218 lessons total). The architecture is constrained by a hard requirement: zero backend, zero API cost, zero data leaving the device. This forces a browser-native AI stack — WebGPU inference via `@mlc-ai/web-llm`, RAG via pre-built embeddings (Transformers.js at build time) with in-browser vector search (`mememo`), and streaming rendering via `streamdown`. This approach is well-documented and production-feasible as of early 2026, with WebGPU available on ~70-80% of desktop browsers. The recommended model is `Phi-3.5-mini-instruct-q4f16_1-MLC` (~2.2GB, strong instruction following, fits mid-range GPU VRAM).

The recommended implementation follows four strictly ordered layers: (1) WebLLM engine foundation with singleton pattern and COEP/COOP headers, (2) RAG pipeline with build-time pre-computed embeddings to avoid browser-side embedding model download, (3) AI chat panel with streaming and persona system, and (4) AI practice hints extending the existing PracticeBlock. Every layer has clear precedents in the codebase — `use-pyodide-worker.ts` provides the singleton Worker pattern, `generate-search-index.ts` provides the prebuild script pattern, and existing `next.config.mjs` headers infrastructure provides the COEP/COOP insertion point. No architectural novelty is required.

The primary risks are infrastructure-level: missing COEP/COOP headers silently break WebLLM in production (passes dev, fails deploy); loading the WebLLM engine inside React component lifecycle causes 30-second reload penalties per lesson navigation; and combining Pyodide (already active) with WebLLM risks tab crashes on devices with under 8GB RAM. All three risks have known prevention strategies that must be addressed in Phase 1, before any chat UI is built. The secondary risk is RAG quality — naive chunking (fixed 512-token splits without metadata) causes cross-course context confusion that requires full re-embedding to fix. Chunking strategy must be decided once, correctly, before embeddings are generated.

## Key Findings

### Recommended Stack

The new stack adds exactly four npm packages to the existing project: `@mlc-ai/web-llm` (WebGPU inference), `@huggingface/transformers` (build-time embedding generation), `mememo` (browser HNSW vector search), and `streamdown` (streaming-safe Markdown renderer). All other capabilities — chunking via `unist-util-visit`, persona state via Zustand, chat panel layout via shadcn Resizable, build-time scripting via `tsx` — reuse existing dependencies. The existing stack (Next.js 15.5.12, React 18.3.1, Zustand 5, Pyodide, shadcn/ui, Tailwind v4) is stable and unchanged.

**Core technologies:**
- `@mlc-ai/web-llm@^0.2.82`: In-browser LLM inference via WebGPU — only production-grade WebGPU inference engine with OpenAI-compatible streaming API; model caching via Cache API eliminates repeat downloads
- `@huggingface/transformers@^3.0.0`: Sentence embeddings at build time (Node.js) — runs `all-MiniLM-L6-v2` (384-dim, ~25MB) in CI; browser never downloads the embedding model because chunks are pre-embedded
- `mememo@^0.1.0`: Browser-native HNSW vector search — IndexedDB persistence, cosine distance, Web Worker compatible; suitable for the ~1,100-chunk corpus at current scale
- `streamdown@^2.1.0`: Streaming-safe Markdown renderer — handles unterminated syntax mid-stream, Shiki integration matched to existing Shiki 4.x, Tailwind v4 compatible
- **Model:** `Phi-3.5-mini-instruct-q4f16_1-MLC` (~2.2GB, 4K context, strong instruction following); fallback `Qwen2-0.5B-Instruct-q4f16_1-MLC` (~500MB) for low-VRAM devices

**What NOT to add:** LangChain.js (200KB+ bundle, server-oriented), Vercel AI SDK (requires server routes), `@xenova/transformers` (deprecated, use `@huggingface/transformers` v3), `openai` npm package (redundant over WebLLM's native API), Pinecone/Weaviate (no backend), pre-built chatbot widgets (violate privacy constraint).

### Expected Features

**Must have (P1 — table stakes):**
- WebGPU capability detection with graceful fallback — gates all AI features; must be implemented first; NotebookLM (already present on platform) is the natural fallback UI
- Model download progress + warm-up indicator — UX prerequisite; without it, 2-8 minute first load appears as a broken page
- Lesson-aware context injection — minimum viable AI relevance; current lesson MD injected into system prompt at chat time
- Per-course teacher persona system — core differentiator; `aiPersona` field in `COURSE_REGISTRY`, system prompt assembled at chat init; configuration-only (no ML work)
- In-lesson AI chat panel with streaming — primary feature; sliding panel, conversation history in session, streaming token render
- AI practice hints in PracticeBlock — "Get Hint" button; Socratic mode by default; queues if model not yet loaded

**Should have (P2 — after core AI validated):**
- RAG across full lesson corpus — highest complexity; pre-build pipeline + WASM vector store; validate chat panel utility first, then add retrieval
- Socratic mode toggle — allow "just tell me" mode; add after hint baseline validated

**Defer (v2.2+):**
- Multi-course RAG scope filtering (per-course retrieval vs. cross-course)
- Voice input (Web Speech API)
- AI-generated practice problem variants (requires hallucination mitigation pipeline)
- Per-user AI personalization (requires auth, which is out of scope)

**Anti-features to reject:**
- Server-side LLM API (breaks SSG, API cost, privacy)
- Always-on AI loading (hostile UX for 1-4GB model)
- AI-generated lesson content (hallucination risk in educational context)
- AI-graded code (use Pyodide test assertions for deterministic grading instead)

### Architecture Approach

The architecture is a 6-step layered build — foundation first (worker singleton + COEP/COOP headers + persona types), then hooks (AI engine + RAG), then state store, then UI components, then integration into existing components, then infrastructure config. Every step has a direct codebase precedent: the WebLLM worker singleton mirrors `use-pyodide-worker.ts`; the build-time RAG script mirrors `generate-search-index.ts`; the `public/data/rag-chunks.json` output follows `public/search-data.json` convention; COEP/COOP headers extend the existing `async headers()` in `next.config.mjs`. Integration into existing components (`PracticeBlock`, `LessonPage`, `COURSE_REGISTRY`) is additive and backward-compatible — all new props are optional.

**Major components (all new unless marked):**
1. `public/workers/llm.worker.mjs` — WebWorkerMLCEngineHandler; all GPU compute isolated from UI thread
2. `scripts/generate-rag-index.ts` — prebuild script; reads 220+ lesson MD files, chunks by heading boundary, embeds via Transformers.js (Node.js), outputs `public/data/rag-chunks.json`
3. `hooks/use-ai-engine.ts` — module-level singleton for WebWorkerMLCEngine proxy; survives route navigation; mirrors `use-pyodide-worker.ts`
4. `hooks/use-rag.ts` — module-level mememo index singleton; built from `rag-chunks.json` on first AI panel open
5. `lib/store/chat.ts` — Zustand chat store (non-persisted during streaming; flush to sessionStorage on completion)
6. `components/ai-chat-panel.tsx` — sliding panel with streaming Markdown rendering via `streamdown`
7. `COURSE_REGISTRY` (modified) — extended with `aiPersona: AIPersona` per course
8. `PracticeBlock` (modified) — backward-compatible extension adding `AIHintButton`

**Key data flow:** User query → `useChatStore.sendMessage` → RAG retrieval (mememo cosine search) → system prompt assembly (persona + lesson title + top-3 chunks, ~800 tokens budget) → `engine.chat.completions.create({ stream: true })` → Web Worker → WebGPU shader dispatch → streaming delta accumulation → Zustand re-render per chunk → `streamdown` Markdown rendering.

**Context window budget:** Phi-3-mini has 4K tokens. System prompt capped at ~800 tokens (persona + lesson + 2-3 RAG chunks) to leave 3,200 tokens for conversation history and response. Never inject full lesson Markdown (5-15KB) into the prompt.

### Critical Pitfalls

1. **WebLLM crashes SSG build (`window is not defined`)** — Use `dynamic(() => import('@mlc-ai/web-llm'), { ssr: false })` without exception; add `pnpm build` as CI gate before any WebLLM code is merged; `"use client"` alone does not prevent server-side module evaluation
2. **Missing COOP/COEP headers break SharedArrayBuffer in production** — Add `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` to `next.config.mjs` before any WebLLM testing; verify with `curl -I` on deployed URL, not localhost; use `credentialless` not `require-corp` to avoid breaking NotebookLM deeplinks
3. **WebLLM engine re-initialized on every route navigation (30s penalty per lesson)** — Module-level singleton in `hooks/use-ai-engine.ts` (not inside `useEffect`); engine persists across component mount/unmount for the browser session lifetime
4. **Pyodide + WebLLM memory contention crashes tabs on <8GB RAM devices** — Mutual exclusion lazy loading (each initializes only on first user interaction, never eagerly on page mount); check `navigator.deviceMemory < 4` before loading WebLLM; run Web Worker for WebLLM (terminatable when panel closes)
5. **RAG quality collapse from naive chunking + missing metadata** — Chunk at heading boundaries (not fixed token size); always prepend `[Course > Lesson > Section]` metadata to chunk text; limit retrieval to current-course corpus; wrong here requires full re-embedding (HIGH recovery cost, requires full pipeline re-run)
6. **Educational hallucination damages student trust permanently** — Every response must cite retrieved lesson source; system prompt must restrict scope to lesson content; visible disclaimer on every AI response; red-team with 20+ test questions per course before launch
7. **Persona prompt injection** — Hard-code safety constraints separate from configurable persona; sanitize common injection patterns on input; cap chat input at 1,000 characters

## Implications for Roadmap

Based on the dependency graph from ARCHITECTURE.md and pitfall-to-phase mapping from PITFALLS.md, the research strongly implies a 3-phase structure for the v2.1 milestone:

### Phase 1: WebLLM Foundation + Infrastructure
**Rationale:** All AI features depend on WebLLM being correctly initialized. Three critical pitfalls (SSG build failure, missing COEP/COOP, engine singleton, WebGPU fallback, Pyodide memory contention) must be resolved here — before any UI is built. Getting infrastructure wrong invalidates all subsequent work and has HIGH recovery cost.
**Delivers:** Working WebLLM engine with correct module-level singleton pattern, COEP/COOP headers verified on deployed preview URL, WebGPU capability detection with graceful fallback (NotebookLM link), model download progress UX with phase indicators (fetch → cache → compile → ready), mutual exclusion lazy loading with Pyodide, CI gate for `pnpm build` success
**Addresses (P1 features):** WebGPU detection + fallback, model download/warm-up indicator
**Avoids:** Pitfalls 1, 2, 3, 4, 5, 10 — all Phase 1 architecture decisions with HIGH recovery cost if deferred
**Stack elements:** `@mlc-ai/web-llm@^0.2.82`, `public/workers/llm.worker.mjs`, `hooks/use-ai-engine.ts`, `next.config.mjs` COEP/COOP headers
**Research flag:** Standard patterns. WebLLM Worker singleton has direct codebase precedent in `use-pyodide-worker.ts`. No additional research needed.

### Phase 2: RAG Pipeline + Persona System
**Rationale:** RAG has the highest complexity and the highest recovery cost if done wrong — re-embedding all 220 lessons requires full pipeline re-run. Chunking strategy must be established before embeddings are generated. Persona system is pure TypeScript configuration (no ML work) and pairs here because it completes system prompt assembly, making Phase 3 chat UI testable with realistic behavior from day one.
**Delivers:** Build-time embedding pipeline (`scripts/generate-rag-index.ts`), `public/data/rag-chunks.json` static asset (~900KB gzipped), `hooks/use-rag.ts` with module-level mememo index singleton, `COURSE_REGISTRY` extended with `aiPersona: AIPersona`, `buildSystemPrompt()` function combining persona + lesson metadata + RAG chunks
**Addresses (P1/P2 features):** Per-course teacher persona system (P1), RAG full corpus retrieval (P2), pre-build embedding pipeline (P2)
**Avoids:** Pitfalls 6, 7, 9 — chunking strategy with metadata, course-scoped retrieval, build-time pre-computation to avoid browser embedding model download
**Stack elements:** `@huggingface/transformers@^3.0.0` (devDependency, Node.js build-time only), `mememo@^0.1.0`
**Research flag:** Validate MDX stripping before chunking against 10 representative lesson files from both courses. MDX import syntax and frontmatter must be excluded from embeddings. Otherwise standard patterns.

### Phase 3: AI Chat Panel + Practice Hints
**Rationale:** UI layer built last, on top of working engine (Phase 1) and complete RAG + persona system (Phase 2). All dependencies resolved. This is the largest surface area but lowest architectural risk. Persona prompt injection safety belongs here because it interacts with chat input handling and response rendering.
**Delivers:** `components/ai-chat-panel.tsx` (sliding side panel, streaming Markdown render, session message history), `lib/store/chat.ts` (Zustand chat store with streaming accumulation and sessionStorage flush on completion), `components/ai-hint-button.tsx` + `PracticeBlock` extension, Socratic hint mode (prompt-only), hallucination disclaimers + source citations per response, prompt injection input sanitization, 1,000-character input cap, mobile bottom-sheet layout
**Addresses (P1 features):** AI chat panel with streaming, AI practice hints in PracticeBlock, Socratic hint mode, streaming response rendering, lesson-aware context injection (wire-up)
**Avoids:** Pitfall 7 (disclaimer in chat UI), Pitfall 8 (prompt injection sanitization), streaming token jank (buffer at 100ms intervals; disable ToC scroll spy during streaming)
**Stack elements:** `streamdown@^2.1.0`, shadcn `Resizable` component (`npx shadcn add resizable`)
**Research flag:** Standard patterns. Streaming accumulation in Zustand and chat panel UX are well-documented. No additional research needed.

### Phase Ordering Rationale

- Phase 1 before everything: Three pitfalls have HIGH recovery cost and no UI dependency. Building UI on broken infrastructure wastes all UI work.
- RAG and persona (Phase 2) before chat UI (Phase 3): `useChatStore.sendMessage` orchestrates RAG retrieval + persona injection. The chat UI cannot be tested with realistic behavior until the full context assembly path is working.
- Chat UI last (Phase 3): `streamdown`, `AIChatPanel`, `useChatStore` all have zero unresolved dependencies after Phase 2. This phase contains the most parallelizable work (message component, hint button, and panel can be built simultaneously).
- COEP/COOP headers in Phase 1, not deferred: This is the most common sequencing mistake — passes `next dev`, breaks production. Must be verified on a deployed preview URL before model loading is tested.

### Research Flags

Needs validation during planning/Phase 2 kick-off:
- **Phase 2 (RAG chunking for MDX):** Validate heading-boundary chunking against 10 representative lesson files before committing to chunk parameters. MDX frontmatter and import syntax must be stripped before embedding. Validate chunk token counts fall within 200-400 target.
- **Phase 1 (COEP + NotebookLM compatibility):** Verify `credentialless` COEP does not break existing NotebookLM deeplinks. May need to scope headers to `/courses/(.*)` only if NotebookLM embeds fail under cross-origin isolation. Test on a preview deployment before Phase 1 is marked complete.

Standard patterns (no additional research needed):
- **Phase 1 (WebLLM singleton):** Direct codebase precedent in `use-pyodide-worker.ts`.
- **Phase 2 (persona system):** Pure TypeScript configuration — no ML work, no external dependencies.
- **Phase 3 (streaming chat UI):** Documented by WebLLM official docs, web.dev, and `streamdown` docs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against npm registry and official docs March 2026; existing codebase inspected directly; version compatibility confirmed for all four new packages |
| Features | MEDIUM-HIGH | Table stakes verified against WebLLM docs and live platforms (Khanmigo, SchoolAI); anti-feature rationale grounded in hard architectural constraints; educational AI best practices from peer-reviewed sources (MDPI 2025, arXiv 2024) |
| Architecture | HIGH | WebLLM API verified against official docs; all integration patterns have direct codebase precedents; all changes are additive and backward-compatible |
| Pitfalls | HIGH | All 10 critical pitfalls verified against official sources — GitHub issues for Pyodide memory, MDN/web.dev for COOP/COEP, mlc-ai GitHub for SSG build failure, academic sources for RAG chunking |

**Overall confidence:** HIGH

### Gaps to Address

- **MDX stripping before RAG chunking:** Lesson MD files contain MDX-specific syntax (import statements, component JSX). The chunking script must strip these before embedding. Exact stripping patterns need validation against a sample of actual lesson files — do not finalize chunk parameters without this test.
- **mememo maturity:** `mememo@^0.1.0` was last released February 2024 — stable but not actively maintained. If browser compatibility issues surface, fallback is plain cosine similarity over Float32Array (acceptable at <1,500 chunks with linear scan, no extra dependency).
- **Qwen2-0.5B quality for Socratic tutoring:** Research recommends Phi-3.5-mini as primary and Qwen2-0.5B as low-VRAM fallback. The quality gap between 3.8B and 0.5B parameters is substantial. Validate 0.5B with 20+ representative student questions from the curriculum before setting the fallback threshold and UI messaging.
- **COEP + NotebookLM compatibility:** Existing NotebookLM deeplinks may break under `Cross-Origin-Embedder-Policy: credentialless` if NotebookLM iframes load cross-origin resources without CORP headers. Must test on a preview deployment with COEP active before Phase 1 is complete.

## Sources

### Primary (HIGH confidence)
- [WebLLM official docs (0.2.82)](https://webllm.mlc.ai/docs/) — WebWorker API, model IDs, streaming completions, initProgressCallback, singleton pattern
- [mlc-ai/web-llm GitHub](https://github.com/mlc-ai/web-llm) — model sizes, WebGPU requirements
- [Transformers.js v3 announcement](https://huggingface.co/blog/transformersjs-v3) — package name `@huggingface/transformers`, ONNX model support, WebGPU backend
- [Streamdown npm + docs](https://www.npmjs.com/package/streamdown) — version 2.1.0, Tailwind v4 `@source` directive, React 18 compatibility
- [WebGPU browser support — caniuse.com](https://caniuse.com/webgpu) — Chrome/Edge/Firefox 141+/Safari macOS Tahoe 26 status March 2026
- [Making Your Website Cross-Origin Isolated — web.dev](https://web.dev/articles/coop-coep) — SharedArrayBuffer requirement, credentialless vs require-corp
- [Build a local AI chatbot with WebLLM — web.dev](https://web.dev/articles/ai-chatbot-webllm) — first-load UX patterns
- Project codebase direct inspection — `use-pyodide-worker.ts`, `generate-search-index.ts`, `next.config.mjs`, `lib/course-registry.ts` (HIGH confidence, verified March 2026)
- [RAG Chatbots for Education: A Survey — MDPI Applied Sciences 2025](https://www.mdpi.com/2076-3417/15/8/4234) — RAG for educational applications, hallucination mitigation
- [Socratic LLM Tutoring — arXiv 2024](https://arxiv.org/abs/2406.11709) — Socratic hint mode pedagogical basis

### Secondary (MEDIUM confidence)
- [Browser-Based RAG with WebGPU — DEV Community](https://dev.to/emanuelestrazzullo/building-a-browser-based-rag-system-with-webgpu-h2n) — Transformers.js + Voy + WebLLM composition pattern
- [Privacy-Preserving RAG in Browser — SitePoint](https://www.sitepoint.com/browser-based-rag-private-docs/) — IndexedDB persistence pattern; 5,000-10,000 chunk ceiling
- [Best Chunking Strategies for RAG — Firecrawl Feb 2026](https://www.firecrawl.dev/blog/best-chunking-strategies-rag) — 512-token recursive at 69% RAG accuracy benchmark
- [UX Patterns for Local AI Inference — SitePoint](https://www.sitepoint.com/ux-patterns-local-inference/) — download progress, warm-up phase UX
- [Khanmigo live platform](https://www.khanmigo.ai/) — Socratic hint approach, lesson context awareness UX
- [Pyodide memory issues — GitHub #1513, #4338, #5702, #5140](https://github.com/pyodide/pyodide) — Pyodide memory consumption confirmed
- [MeMemo GitHub](https://github.com/poloclub/mememo) — HNSW + IndexedDB + Web Worker architecture; last release Feb 2024

### Tertiary (LOW confidence — validate during implementation)
- RAG chunking accuracy benchmarks (69% recursive 512-token) — benchmark methodology unclear; validate with actual lesson content before committing to chunk parameters
- Qwen2-0.5B as Socratic tutor fallback — no benchmark found for 0.5B on educational hint quality; validate with real student questions before setting fallback threshold

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
