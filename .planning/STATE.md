---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: AI Learning Assistant
status: planning
stopped_at: Completed 13-02-PLAN.md (WebLLM engine singleton hook + progress bar + worker)
last_updated: "2026-03-16T09:00:00.000Z"
last_activity: 2026-03-16 — 13-02 executed
progress:
  total_phases: 9
  completed_phases: 6
  total_plans: 19
  completed_plans: 19
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Students can learn programming and data skills step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification
**Current focus:** v2.1 AI Learning Assistant — in-browser LLM via WebGPU, RAG pipeline, streaming chat panel, practice hints, per-course teacher personas

## Current Position

Phase: 14 — RAG Pipeline + Persona System (not started)
Plan: —
Status: Phase 13 complete, ready for Phase 14
Last activity: 2026-03-16 — Phase 13 complete (2 plans, 9 commits)

Progress: [███░░░░░░░] 33% (v2.1 — 1/3 phases complete)

## Performance Metrics

**Velocity (v2.0 reference):**
- Total plans completed: 17
- Phases: 6 (Phases 7-12)
- Total commits: ~49

**v2.1 Phases:**

| Phase | Requirements | Plans | Status |
|-------|-------------|-------|--------|
| 13. WebLLM Foundation + Infrastructure | INFRA-01..05 | 2/2 | Complete |
| 14. RAG Pipeline + Persona System | RAG-01..03, CHAT-05 | TBD | Not started |
| 15. AI Chat Panel + Practice Hints | CHAT-01..04, CHAT-06, PRAC-01..03 | TBD | Not started |

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

Last session: 2026-03-16T09:00:00.000Z
Stopped at: Completed 13-02-PLAN.md (WebLLM engine singleton hook + progress bar + worker)
Resume file: None
Next action: Continue Phase 13 remaining plans (if any) or plan Phase 14
