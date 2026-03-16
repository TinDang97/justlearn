---
phase: 15-chat-practice
plan: 03
subsystem: ui
tags: [react, zustand, webllm, rag, ai-hint, exercise-runner, tdd]

# Dependency graph
requires:
  - phase: 15-01
    provides: "useChatStore with sendHint/openPanel, AIMessage component"
  - phase: 14-rag-persona
    provides: "useRAG hook, useAIEngine hook, COURSE_REGISTRY with aiPersona"

provides:
  - AIHintButton component (components/ai-hint-button.tsx)
  - ExerciseRunner with optional AI hint integration via courseSlug prop
  - CodeRunner passing courseSlug/sectionTitle to ExerciseRunner
  - LessonPage wiring courseSlug and sectionTitle into CodeRunner

affects:
  - Any future feature touching ExerciseRunner or CodeRunner
  - Chat panel integration (15-02)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Backward-compatible prop extension: optional courseSlug gates all AI behavior"
    - "Always call hooks unconditionally even when AI is disabled (Rules of Hooks compliance)"
    - "Engine status guard: only auto-trigger AI on error when engineStatus === 'ready'"
    - "Socratic hint vs error explanation distinguished by null vs non-null error arg to sendHint"

key-files:
  created:
    - components/ai-hint-button.tsx
    - __tests__/components/ai-hint-button.test.tsx
  modified:
    - components/code-runner/exercise-runner.tsx
    - components/code-runner/index.tsx
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - __tests__/components/exercise-runner.test.tsx

key-decisions:
  - "AIHintButton is intentionally simple — no useChatStore/useAIEngine imports; orchestration is ExerciseRunner's responsibility"
  - "All AI hooks called unconditionally in ExerciseRunner (Rules of Hooks); persona=null gates AI behavior"
  - "Auto error-explanation guarded by engineStatus === 'ready' to prevent blank spinner when engine is loading"
  - "Socratic hint passes null as error arg; error explanation passes the actual error string"

patterns-established:
  - "Prop threading: courseSlug flows LessonPage -> CodeRunner -> ExerciseRunner"
  - "TDD: RED (failing tests) -> GREEN (minimal impl) for both components"

requirements-completed: [PRAC-01, PRAC-02, PRAC-03]

# Metrics
duration: 12min
completed: 2026-03-16
---

# Phase 15 Plan 03: AIHintButton + ExerciseRunner AI Hint Integration Summary

**AIHintButton component and ExerciseRunner AI hint wiring: Socratic guidance on demand and automatic error explanation when WebLLM engine is ready**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-16T09:38:00Z
- **Completed:** 2026-03-16T09:44:51Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created AIHintButton (Sparkles icon, ghost/sm variant) with clean props interface: `{ onHint, disabled? }`
- Extended ExerciseRunner with optional AI hint integration: AIHintButton renders in action bar when courseSlug is provided
- Auto error-explanation triggers sendHint only when engineStatus === 'ready' (prevents blank spinner UX per RESEARCH pitfall)
- CodeRunner passes courseSlug/sectionTitle to ExerciseRunner; LessonPage wires params to CodeRunner
- Added 6 AIHintButton unit tests + 7 ExerciseRunner AI integration tests; all 417 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AIHintButton component** - `a56a7e9` (feat)
2. **Task 2: Extend ExerciseRunner and CodeRunner with AI hint integration** - `aa688be` (feat)

## Files Created/Modified

- `components/ai-hint-button.tsx` - Simple button with Sparkles icon; onHint callback and disabled prop
- `__tests__/components/ai-hint-button.test.tsx` - 6 tests: render, click, disabled state, icon presence
- `components/code-runner/exercise-runner.tsx` - Extended with courseSlug/sectionTitle props, AI hooks, AIHintButton, auto error-explanation
- `components/code-runner/index.tsx` - Added courseSlug/sectionTitle props; passes through to ExerciseRunnerClient
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` - Passes courseSlug and sectionTitle to CodeRunner
- `__tests__/components/exercise-runner.test.tsx` - Added mocks for chat/AI/RAG/registry, 7 new AI integration tests, kept all 10 existing tests

## Decisions Made

- AIHintButton is intentionally stateless: no store/hook imports. Orchestration logic (sendHint calls) lives in ExerciseRunner which passes the onHint callback. This keeps the button reusable and testable.
- All AI hooks (useChatStore, useAIEngine, useRAG) are called unconditionally in ExerciseRunner to comply with React Rules of Hooks. Persona resolution (`COURSE_REGISTRY[courseSlug]?.aiPersona`) gates whether AI features are active.
- Auto error-explanation is guarded by `engineStatus === 'ready'`. If engine is loading, no panel opens — avoids the blank spinner UX identified in RESEARCH.md Pitfall 4.
- Socratic hint (AIHintButton click) passes `null` as the error argument to sendHint. Error explanation passes the actual error string. The `sendHint` function in chat store handles both cases differently.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- AIHintButton + ExerciseRunner AI integration complete
- Chat panel (15-02) provides the panel that openPanel() reveals
- Full AI learning support chain is now wired: student runs code -> error -> AI explains -> student learns
- No blockers for remaining Phase 15 work

## Self-Check: PASSED

All created files verified on disk. Both task commits (a56a7e9, aa688be) confirmed in git log. Full test suite: 417 tests passing.

---
*Phase: 15-chat-practice*
*Completed: 2026-03-16*
