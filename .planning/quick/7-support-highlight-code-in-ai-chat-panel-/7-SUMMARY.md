---
phase: quick-7
plan: "01"
subsystem: ai-chat
tags: [syntax-highlighting, shiki, ai-sdk, webllm, streaming]
dependency_graph:
  requires: [hooks/use-ai-engine.ts, lib/store/chat.ts, components/chat-code-block.tsx, components/ai-message.tsx]
  provides: [hooks/use-shiki-highlighter.ts, lib/ai-sdk/webllm-language-model.ts, lib/ai-sdk/webllm-provider.ts]
  affects: [components/ai-message.tsx, components/chat-code-block.tsx, lib/store/chat.ts]
tech_stack:
  added: [shiki (runtime, already in deps), ai@6.0.116, "@ai-sdk/provider@3.0.8", "@ai-sdk/provider-utils@4.0.19"]
  patterns: [LanguageModelV3 adapter, shiki lazy-load singleton, ReadableStream transform from AsyncIterable, TDD red-green]
key_files:
  created:
    - hooks/use-shiki-highlighter.ts
    - lib/ai-sdk/webllm-language-model.ts
    - lib/ai-sdk/webllm-provider.ts
    - __tests__/hooks/use-shiki-highlighter.test.ts
    - __tests__/lib/webllm-language-model.test.ts
  modified:
    - components/chat-code-block.tsx
    - components/ai-message.tsx
    - lib/store/chat.ts
    - __tests__/components/ai-message.test.tsx
decisions:
  - Used LanguageModelV3 (not V1 from plan) — installed @ai-sdk/provider ships v3 API only
  - doStream used directly in chat.ts (not streamText) — streamText is server-side only, chat runs client-side
  - ChatCodeBlock textarea is sr-only (visually hidden) — highlighted view is the primary display; textarea handles input events
  - HighlightedCodeBlock used for non-Python code in ai-message; ChatCodeBlock (editable+runnable) for Python code
  - Error stream parts enqueued as type error in ReadableStream, re-thrown by chat store reader loop
metrics:
  duration_minutes: 10
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_changed: 8
---

# Quick Task 7: Support Code Highlighting in AI Chat Panel — Summary

**One-liner:** Shiki syntax highlighting for AI chat code blocks via module-level singleton hook, plus custom LanguageModelV3 WebLLM adapter replacing raw engine.chat.completions calls.

## What Was Built

### Task 1: useShikiHighlighter hook + ChatCodeBlock + AIMessage highlighting

**hooks/use-shiki-highlighter.ts** — lazy-loaded shiki singleton using module-level `highlighterPromise`. Loads `github-light` and `github-dark-dimmed` themes (matching `next.config.mjs` rehypePrettyCode config) plus 6 common languages. Returns `{ highlightCode(code, lang): Promise<string> }`.

**components/chat-code-block.tsx** — Added shiki highlighting: a read-only highlighted view (via `dangerouslySetInnerHTML`) is rendered above a `sr-only` textarea. The textarea handles all user input/editing; the highlighted view updates whenever code changes via `useEffect`.

**components/ai-message.tsx** — Added `HighlightedCodeBlock` internal component for non-Python code fences in completed assistant messages. Python code uses `ChatCodeBlock` (editable + runnable). During streaming, `Streamdown` handles all rendering unchanged.

### Task 2: WebLLMLanguageModel + createWebLLMProvider + chat store refactor

**lib/ai-sdk/webllm-language-model.ts** — `WebLLMLanguageModel` implements `LanguageModelV3` (v3 — see deviation below). `doStream` wraps the WebLLM async iterable into a `ReadableStream<LanguageModelV3StreamPart>` emitting `text-start`, `text-delta`, `text-end`, `finish` parts. `doGenerate` handles non-streaming. `convertPrompt` converts V3 prompt format to OpenAI-compatible messages. Abort signal triggers `engine.interruptGenerate()`.

**lib/ai-sdk/webllm-provider.ts** — `createWebLLMProvider(engine, modelId)` factory. Returns a `WebLLMLanguageModel` wrapping the existing engine singleton — no new engine initialization.

**lib/store/chat.ts** — `streamCompletion` refactored to use `model.doStream()` directly. Reader loop processes `text-delta` and `error` parts. All existing behavior preserved: RAG retrieval, system prompt building, history capping, citation attachment, error messages in assistant content.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] LanguageModelV1 not available in installed @ai-sdk/provider**
- **Found during:** Task 2 implementation
- **Issue:** Plan specified `LanguageModelV1` from `@ai-sdk/provider`, but the installed package (v3.0.8) only exports `LanguageModelV2` and `LanguageModelV3`. The `specificationVersion` is `'v3'` not `'v1'`.
- **Fix:** Implemented `WebLLMLanguageModel` against `LanguageModelV3`. Updated tests to use `LanguageModelV3Prompt` and V3 stream part types (`{ type: 'text-delta', id, delta }` not `{ type: 'text-delta', textDelta }`). `LanguageModelV3FinishReason` is `{ unified, raw }` object.
- **Files modified:** `lib/ai-sdk/webllm-language-model.ts`, `__tests__/lib/webllm-language-model.test.ts`
- **Commit:** 18afc12

**2. [Rule 1 - Bug] Error handling gap: stream errors enqueued, not thrown**
- **Found during:** Task 2 — chat store test `shows error message in assistant content when stream throws`
- **Issue:** `WebLLMLanguageModel.doStream` catches async generator errors and enqueues them as `{ type: 'error', error }` parts. The reader loop in `chat.ts` didn't handle this, resulting in the error being silently swallowed.
- **Fix:** Added `else if (value.type === 'error') { throw value.error }` in the reader loop so errors propagate to the `catch` block.
- **Files modified:** `lib/store/chat.ts`
- **Commit:** 18afc12

## Tests

All 467 tests pass (50 test files).

New tests:
- `__tests__/hooks/use-shiki-highlighter.test.ts` — 4 tests
- `__tests__/lib/webllm-language-model.test.ts` — 13 tests
- `__tests__/components/ai-message.test.tsx` — updated with 3 new code block tests (20 total)

## Self-Check: PASSED

All created files exist. All 4 commits verified:
- 114def8: test(quick-7): add failing tests for shiki highlighter hook and ai-message code blocks
- 3777427: feat(quick-7): add shiki syntax highlighting for AI chat code blocks
- dc69fe3: test(quick-7): add failing tests for WebLLMLanguageModel and createWebLLMProvider
- 18afc12: feat(quick-7): create LanguageModelV3 WebLLM provider and refactor chat streaming

Full test suite: 467 tests pass, 50 test files.
