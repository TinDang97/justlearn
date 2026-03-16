---
phase: 13-webllm-foundation
plan: "02"
subsystem: ai-engine
tags: [webllm, webgpu, singleton, hook, progress-bar, tdd]
dependency_graph:
  requires: ["13-01"]
  provides: ["hooks/use-ai-engine.ts", "components/ai-engine-progress.tsx", "public/workers/llm.worker.mjs"]
  affects: ["Phase 14 RAG pipeline", "Phase 15 AI chat panel"]
tech_stack:
  added: ["@mlc-ai/web-llm@0.2.82"]
  patterns: ["module-level singleton (mirrors usePyodideWorker)", "dynamic import for SSG safety", "synchronous promise assignment before await for dedup", "TDD red-green-refactor"]
key_files:
  created:
    - public/workers/llm.worker.mjs
    - hooks/use-ai-engine.ts
    - components/ai-engine-progress.tsx
    - __tests__/hooks/use-ai-engine.test.ts
    - __tests__/components/ai-engine-progress.test.tsx
  modified:
    - package.json
    - pnpm-lock.yaml
decisions:
  - "Non-async getEngine() with synchronous enginePromise assignment prevents concurrent callers from bypassing the singleton dedup guard before the first await"
  - "Regex uses /cach/ not /cache/ to match 'Caching' substring in progress text"
  - "afterEach(cleanup) added to AIEngineProgress tests to prevent DOM accumulation in jsdom across test cases"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 3
  files_created: 5
  files_modified: 2
---

# Phase 13 Plan 02: WebLLM Engine Singleton Hook + Progress Bar + Worker Summary

**One-liner:** Module-level singleton `useAIEngine` hook with lazy WebGPU detection, non-async synchronous promise dedup guard, `initProgressCallback` progress tracking, and 4-phase `AIEngineProgress` component.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install @mlc-ai/web-llm + create llm.worker.mjs | d925c5e | package.json, pnpm-lock.yaml, public/workers/llm.worker.mjs |
| 2 (RED) | Failing tests for useAIEngine | 45e98a6 | __tests__/hooks/use-ai-engine.test.ts |
| 2 (GREEN) | Implement useAIEngine singleton hook | 2413ef8 | hooks/use-ai-engine.ts, __tests__/hooks/use-ai-engine.test.ts |
| 3 (RED) | Failing tests for AIEngineProgress | 690dd0f | __tests__/components/ai-engine-progress.test.tsx |
| 3 (GREEN) | Implement AIEngineProgress component | 6385118 | components/ai-engine-progress.tsx, __tests__/components/ai-engine-progress.test.tsx |

## Verification Results

- `pnpm test -- use-ai-engine`: 12 tests pass (11 hook tests + isWebGPUSupported)
- `pnpm test -- ai-engine-progress`: 8 tests pass (all phase detection + progress bar)
- `pnpm test -- use-pyodide-worker`: all pass, no regression
- `pnpm test`: 37 test files, 315 tests, all pass
- `pnpm build`: SSG build succeeds — no navigator/window at build time

## Decisions Made

### Non-async getEngine() for singleton dedup correctness

The `getEngine` function is NOT declared `async`. In an `async` function, even synchronous code before an `await` executes in a microtask, so two concurrent callers could both find `enginePromise === null` and both trigger `CreateWebWorkerMLCEngine`. By making `getEngine` a regular function that returns a promise directly, `enginePromise` is assigned synchronously before any await, so the second concurrent caller always sees the in-flight promise and returns it.

### /cach/ regex instead of /cache/

The word "Caching" does not contain the substring "cache" — it contains "Cach". The regex was updated from `/cache|load/i` to `/cach|load/i` to correctly match progress text like "Caching model data...".

### afterEach(cleanup) in component tests

`@testing-library/react`'s automatic cleanup was not running between tests in the AIEngineProgress test file, causing DOM accumulation. Explicit `afterEach(cleanup)` fixes this. This is consistent with the existing component test files in the codebase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed singleton dedup race condition in getEngine()**
- **Found during:** Task 2 GREEN (test 6: singleton promise equality failed)
- **Issue:** Original `async getEngine()` implementation suspended at `await import(...)`, allowing concurrent callers to bypass the `enginePromise !== null` guard and call `CreateWebWorkerMLCEngine` twice
- **Fix:** Converted to non-async function; assigned `enginePromise = import(...).then(...)` synchronously so the guard executes before any suspension point
- **Files modified:** hooks/use-ai-engine.ts
- **Commit:** 2413ef8

**2. [Rule 1 - Bug] Fixed /cache/ regex not matching "Caching" text**
- **Found during:** Task 3 GREEN (test: highlights "Caching" when progressText contains "cache")
- **Issue:** Progress text "Caching model data..." doesn't contain "cache" as a substring — it contains "Cach"
- **Fix:** Updated regex from `/cache|load/i` to `/cach|load/i`
- **Files modified:** components/ai-engine-progress.tsx
- **Commit:** 6385118

**3. [Rule 2 - Missing] Added afterEach(cleanup) to AIEngineProgress tests**
- **Found during:** Task 3 GREEN (multiple tests failing with "Found multiple elements" error)
- **Issue:** jsdom DOM accumulated across test cases since auto-cleanup wasn't running
- **Fix:** Added `afterEach(cleanup)` to the test file
- **Files modified:** __tests__/components/ai-engine-progress.test.tsx
- **Commit:** 6385118

## Self-Check: PASSED

All 5 created files confirmed present on disk. All 5 task commits confirmed in git log:
- d925c5e: chore(infra): install @mlc-ai/web-llm and create LLM worker entry point
- 45e98a6: test(13-02): add failing tests for useAIEngine singleton hook
- 2413ef8: feat(13-02): implement useAIEngine module-level singleton hook
- 690dd0f: test(13-02): add failing tests for AIEngineProgress component
- 6385118: feat(13-02): implement AIEngineProgress component with 4-phase indicators
