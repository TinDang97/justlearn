---
phase: 14-rag-persona
plan: "01"
subsystem: rag-pipeline
tags: [rag, persona, embeddings, build-time, ai-chat]
dependency_graph:
  requires: []
  provides:
    - AIPersona type in lib/course-registry.ts
    - buildSystemPrompt() in lib/build-system-prompt.ts
    - public/data/rag-chunks.json (3766 chunks, 220 lessons, 384-dim embeddings)
  affects:
    - Phase 15 chat panel (consumes buildSystemPrompt + rag-chunks.json)
tech_stack:
  added:
    - "@huggingface/transformers@^3.8.1 (devDependency — build-time embedding generation)"
    - "mememo@^0.1.0 (runtime — HNSW vector search, Phase 15)"
    - "glob@^13.0.6 (devDependency — lesson file globbing in build script)"
  patterns:
    - "Heading-boundary chunking with [CourseLabel > Section > Lesson: Heading] metadata prefix embedded in chunk text"
    - "Build-time pre-computation pattern (mirrors generate-search-index.ts)"
    - "H1 sections use lessonTitle as heading (intro content attribution)"
    - "vitest environmentMatchGlobs for Node environment in script tests"
key_files:
  created:
    - lib/build-system-prompt.ts
    - scripts/generate-rag-index.ts
    - __tests__/lib/course-registry-persona.test.ts
    - __tests__/lib/build-system-prompt.test.ts
    - __tests__/scripts/generate-rag-index.test.ts
  modified:
    - lib/course-registry.ts (AIPersona type + aiPersona field in COURSE_REGISTRY)
    - package.json (generate:rag script + predev/prebuild integration)
    - vitest.config.ts (environmentMatchGlobs for scripts tests)
    - .gitignore (exclude public/data/rag-chunks.json)
decisions:
  - "Used environmentMatchGlobs in vitest.config.ts to run __tests__/scripts/** in Node env — glob and @huggingface/transformers are Node-only, cannot resolve in jsdom"
  - "H1-level sections use lessonTitle as chunk heading, not the raw H1 text — matches the test spec behavior for intro content"
  - "glob added as devDependency (not in project before); search-index.ts uses fs.readdirSync directly"
  - "Minimum chunk body: 80 chars (per plan spec)"
metrics:
  duration: "~5 minutes (embedding generation ~3 min for 220 lessons)"
  completed: "2026-03-16T02:10:58Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 4
  tests_added: 26
  total_test_count: 341
  rag_chunks_generated: 3766
  lessons_processed: 220
  python_chunks: 1992
  de_chunks: 1774
  embedding_dims: 384
---

# Phase 14 Plan 01: Build-time RAG Pipeline + AIPersona + buildSystemPrompt Summary

**One-liner:** Build-time embedding pipeline using all-MiniLM-L6-v2 (q8) produces 3766 heading-boundary chunks from 220 lessons; AIPersona type adds Alex/Sam course-specific tutors; buildSystemPrompt() assembles safety-prefixed prompts within 800-token budget.

## Tasks Completed

| Task | Name | Commit | Tests Added |
|------|------|--------|-------------|
| 1 | AIPersona type + course registry extension + buildSystemPrompt + tests | 04b2e92 | 12 (5 persona + 7 prompt) |
| 2 | Build-time RAG chunking script + package.json integration + tests | cc32c5e | 14 (helper functions) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `glob` not installed in project**

- **Found during:** Task 2 — import resolution failure in vitest
- **Issue:** `generate-rag-index.ts` imports `glob` which was not a project dependency; `generate-search-index.ts` uses `fs.readdirSync` instead
- **Fix:** `pnpm add -D glob@^13.0.6`
- **Files modified:** package.json
- **Commit:** cc32c5e

**2. [Rule 3 - Blocking] vitest jsdom environment cannot resolve Node-only modules**

- **Found during:** Task 2 — test file import failure for `generate-rag-index.ts` (imports `glob`, `@huggingface/transformers`, `fs`)
- **Issue:** Vitest runs all tests in jsdom by default; Node-only imports fail in jsdom during Vite's import analysis step
- **Fix:** Added `environmentMatchGlobs: [['__tests__/scripts/**', 'node']]` to `vitest.config.ts`
- **Files modified:** vitest.config.ts
- **Commit:** cc32c5e

**3. [Rule 1 - Bug] H1 sections incorrectly attributed heading text instead of lessonTitle**

- **Found during:** Task 2 TDD — test "uses lessonTitle as heading for content before first heading" failed
- **Issue:** `/^(?=#{1,3} )/m` split regex matches H1 too; heading extracted from H1 was `Lesson 1: My Lesson Title` not `My Lesson Title` (the lessonTitle)
- **Fix:** Added `headingLevel === '#'` special-case in `chunkByHeadings` to use `lessonTitle` for H1 sections — semantically correct for intro content attribution
- **Files modified:** scripts/generate-rag-index.ts
- **Commit:** cc32c5e

## Verification

- Full test suite: 341 tests passed (0 failures)
- `pnpm generate:rag` produces `public/data/rag-chunks.json`:
  - 3766 total chunks
  - 1992 Python chunks, 1774 Data Engineering chunks
  - All chunks have: id, courseSlug, sectionSlug, lessonSlug, lessonTitle, heading, text, embedding
  - Embeddings: 384-dimensional Float32 arrays (Xenova/all-MiniLM-L6-v2, dtype: q8)
- predev and prebuild scripts now include `tsx scripts/generate-rag-index.ts`
- public/data/rag-chunks.json excluded from git via .gitignore

## Self-Check: PASSED

Files exist:
- [x] lib/build-system-prompt.ts
- [x] scripts/generate-rag-index.ts
- [x] __tests__/lib/course-registry-persona.test.ts
- [x] __tests__/lib/build-system-prompt.test.ts
- [x] __tests__/scripts/generate-rag-index.test.ts

Commits exist:
- [x] 04b2e92 — feat(14-01): add AIPersona type + course registry extension + buildSystemPrompt
- [x] cc32c5e — feat(14-01): build-time RAG chunking pipeline + package.json integration + tests
