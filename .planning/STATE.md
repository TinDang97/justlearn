---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: AI Learning Assistant
status: completed
stopped_at: Completed 15-02-PLAN.md (AIChatPanel sliding panel + lesson page integration)
last_updated: "2026-03-16T02:55:08.535Z"
last_activity: 2026-03-16 — Phase 14 complete (2 plans, 4 commits)
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 24
  completed_plans: 24
  percent: 66
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Students can learn programming and data skills step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification
**Current focus:** v2.1 AI Learning Assistant — in-browser LLM via WebGPU, RAG pipeline, streaming chat panel, practice hints, per-course teacher personas

## Current Position

Phase: 15 — AI Chat Panel + Practice Hints (not started)
Plan: —
Status: Phase 14 complete, ready for Phase 15
Last activity: 2026-03-16 — Phase 14 complete (2 plans, 4 commits)

Progress: [██████░░░░] 66% (v2.1 — 2/3 phases complete)

## Performance Metrics

**Velocity (v2.0 reference):**
- Total plans completed: 17
- Phases: 6 (Phases 7-12)
- Total commits: ~49

**v2.1 Phases:**

| Phase | Requirements | Plans | Status |
|-------|-------------|-------|--------|
| 13. WebLLM Foundation + Infrastructure | INFRA-01..05 | 2/2 | Complete |
| 14. RAG Pipeline + Persona System | RAG-01..03, CHAT-05 | 2/2 | Complete |
| 15. AI Chat Panel + Practice Hints | CHAT-01..04, CHAT-06, PRAC-01..03 | TBD | Not started |
| Phase 15-chat-practice P01 | 25 | 2 tasks | 4 files |
| Phase 15-chat-practice P02 | 35 | 2 tasks | 7 files |

## Accumulated Context

### Decisions

**v2.1 stack additions (4 new npm packages):**
- `@mlc-ai/web-llm@^0.2.82` — WebGPU inference engine
- `@huggingface/transformers@^3.0.0` — build-time embedding generation (devDependency)
- `mememo@^0.1.0` — browser-native HNSW vector search
- `streamdown@^2.1.0` — streaming-safe Markdown renderer

**Model:** `Phi-3.5-mini-instruct-q4f16_1-MLC` (~2.2GB primary), `Qwen2-0.5B-Instruct-q4f16_1-MLC` (~500MB low-VRAM fallback)

**Architecture patterns (all have codebase precedents):**
- WebLLM worker singleton mirrors `use-pyodide-worker.ts`
- RAG build script mirrors `generate-search-index.ts`
- `public/data/rag-chunks.json` follows `public/search-data.json` convention
- COEP/COOP headers extend existing `async headers()` in `next.config.mjs`

**Critical constraint:** COEP must use `credentialless` (not `require-corp`) to avoid breaking NotebookLM deeplinks. Must verify on deployed preview URL before Phase 13 is marked complete.

**RAG chunking strategy:** Chunk at heading boundaries (not fixed token size); prepend `[Course > Lesson > Section]` metadata to each chunk; target 200-400 tokens per chunk. Wrong here requires full pipeline re-run (HIGH recovery cost).

**Context window budget:** Phi-3-mini has 4K tokens. System prompt capped at ~800 tokens (persona + lesson title + 2-3 RAG chunks). Never inject full lesson Markdown.
- [Phase 13]: Use COEP credentialless (not require-corp) to preserve NotebookLM deeplink compatibility
- [Phase 13]: COEP/COOP rule placed at index 0 in next.config.mjs headers() to prevent path-specific rules from shadowing it
- [Phase 13-02]: getEngine() is non-async to guarantee synchronous enginePromise assignment before any await — prevents concurrent callers from bypassing the singleton dedup guard
- [Phase 13-02]: Regex uses /cach/ not /cache/ to match "Caching" substring in WebLLM progress text
- [Phase 14]: Used environmentMatchGlobs in vitest.config.ts to run __tests__/scripts/** in Node env
- [Phase 14]: H1-level sections use lessonTitle as chunk heading for intro content attribution
- [Phase 14]: Minimum chunk body length: 80 chars; H1 sections attributed to lessonTitle not raw H1 text
- [Phase 14-rag-persona]: Plain cosine similarity O(n) scan chosen over mememo HNSW — 3766 chunks is within acceptable range, eliminates mememo API uncertainty
- [Phase 14-rag-persona]: Excluded vitest.config.ts from tsconfig.json — environmentMatchGlobs is vitest-specific, not typed in Next.js TypeScript plugin stubs
- [Phase 15-01]: Streamdown is a named export - use import { Streamdown } from 'streamdown'
- [Phase 15-01]: streamCompletion() extracted as shared internal function for sendMessage/sendHint deduplication
- [Phase 15-chat-practice]: AIHintButton is intentionally stateless — no store/hook imports; orchestration lives in ExerciseRunner via onHint callback
- [Phase 15-chat-practice]: Auto error-explanation guarded by engineStatus === 'ready' to prevent blank spinner when engine is loading (RESEARCH Pitfall 4)
- [Phase 15-chat-practice]: AIPersona resolved server-side in page.tsx and passed as prop to prevent lib/course-registry.ts (uses fs/path) from entering client bundle
- [Phase 15-chat-practice]: AIChatPanel always mounted via Sheet open prop — prevents engine re-init on panel toggle
- [Phase 15-chat-practice]: exercise-runner.tsx and AIChatPanel both accept persona as prop instead of resolving from COURSE_REGISTRY — consistent client/server boundary pattern

### Pending Todos

- Validate MDX stripping against 10 representative lesson files before finalizing chunk parameters (Phase 14 planning)
- Verify `credentialless` COEP does not break existing NotebookLM deeplinks on preview deployment (Phase 13)
- Validate Qwen2-0.5B quality with 20+ representative student questions before setting fallback threshold (Phase 15)
- Red-team AI responses with 20+ test questions per course before Phase 15 is marked complete

### Blockers/Concerns

None at roadmap stage.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 4 | Research to deploy unsloth model (Qwen 3.5 4B) in Chrome via WebGPU | 2026-03-15 | 6c5beab | [4-research-to-deploy-unsloth-model-like-qw](./quick/4-research-to-deploy-unsloth-model-like-qw/) |

## Session Continuity

Last session: 2026-03-16T02:55:08.533Z
Stopped at: Completed 15-02-PLAN.md (AIChatPanel sliding panel + lesson page integration)
Resume file: None
Next action: Continue Phase 13 remaining plans (if any) or plan Phase 14
