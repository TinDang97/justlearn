---
phase: 15-chat-practice
plan: "02"
subsystem: ai-chat
tags: [react, zustand, webllm, sheet-ui, rag, tdd, ssr, dynamic-import]
dependency_graph:
  requires:
    - lib/store/chat.ts (useChatStore, ChatMessage)
    - components/ai-message.tsx (AIMessage)
    - hooks/use-ai-engine.ts (useAIEngine)
    - hooks/use-rag.ts (useRAG)
    - lib/course-registry.ts (COURSE_REGISTRY, AIPersona)
    - components/ai-engine-progress.tsx (AIEngineProgress)
    - components/ui/sheet.tsx (Sheet, SheetContent, SheetHeader, SheetTitle)
  provides:
    - components/ai-chat-panel.tsx (AIChatPanel)
    - components/ai-chat-panel-wrapper.tsx (AIChatPanelWrapper)
  affects:
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx (lesson page)
    - components/code-runner/exercise-runner.tsx (persona prop fix)
    - components/code-runner/index.tsx (persona prop passthrough)
tech_stack:
  added: []
  patterns:
    - Sheet-controlled sliding panel (open prop, never conditionally mounted)
    - Server-side persona resolution to avoid client fs module bundling
    - dynamic import with ssr:false for WebGPU-dependent components
    - Zustand selector-based subscription for granular re-renders
    - useEffect with scrollIntoView guarded by typeof check for jsdom safety
key_files:
  created:
    - components/ai-chat-panel.tsx
    - components/ai-chat-panel-wrapper.tsx
    - __tests__/components/ai-chat-panel.test.tsx
  modified:
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - components/code-runner/exercise-runner.tsx
    - components/code-runner/index.tsx
    - __tests__/components/exercise-runner.test.tsx
decisions:
  - "AIPersona resolved server-side in page.tsx and passed as prop — prevents lib/course-registry.ts (uses fs/path) from entering client bundle"
  - "AIChatPanel always mounted via Sheet open prop — prevents engine re-init on panel toggle"
  - "scrollIntoView guarded with typeof check — jsdom does not implement it, guard prevents test errors"
  - "exercise-runner.tsx removed COURSE_REGISTRY import, accepts persona as prop — same server/client split pattern"
metrics:
  duration_minutes: 35
  completed_date: "2026-03-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 4
  commits: 2
---

# Phase 15 Plan 02: AIChatPanel Sliding Panel + Lesson Page Integration Summary

**One-liner:** Sheet-based chat panel with streaming persona header, engine progress, and auto-scroll integrated into every lesson page via a server-side persona prop to avoid Node.js fs module bundling.

## Tasks Completed

| # | Task | Commit | Tests |
|---|------|--------|-------|
| 1 | AIChatPanel, ChatInputBar, AIChatPanelWrapper (TDD) | 0e10903 | 12 tests |
| 2 | Integrate AIChatPanelWrapper into lesson page + fix build | db0e344 | 417 total pass |

## What Was Built

### components/ai-chat-panel.tsx

`'use client'` component with `{ courseSlug, lessonTitle, sectionTitle, persona }` props.

**Key design choices:**
- Sheet's `open` prop controls visibility — panel is always mounted to prevent engine re-initialization
- `useAIEngine(persona.modelId)` and `useRAG(courseSlug)` provide engine/retrieval
- `setLessonContext` called in `useEffect` on mount and prop changes for RAG context awareness
- Auto-scroll: `useEffect` watching `messages.length`, calls `scrollIntoView({ behavior: 'smooth' })` guarded with `typeof` check for jsdom compatibility
- `ChatInputBar` (local component): controlled input, maxLength=1000, disabled when engine not ready, send button disabled when empty or streaming, input cleared after submit

**Structure:**
```
<Sheet open={isOpen} onOpenChange={v => !v && closePanel()}>
  <SheetContent side="right" className="w-[420px] sm:w-[480px] flex flex-col p-0">
    <SheetHeader> — persona name + BotMessageSquare icon
    {status === 'loading' && <AIEngineProgress>}
    <div ref={scrollRef}> — message list with AIMessage per message
    <ChatInputBar> — form with input + Send button
  </SheetContent>
</Sheet>
```

### components/ai-chat-panel-wrapper.tsx

`'use client'` boundary with `dynamic(() => import('./ai-chat-panel'), { ssr: false })`.

- Floating "Ask AI" button: `fixed bottom-6 right-6 z-40` with `MessageCircle` icon
- Props: `{ courseSlug, lessonTitle, sectionTitle, persona }` — all passed through to AIChatPanel
- `useChatStore((s) => s.openPanel)` called on button click

### app/courses/[courseSlug]/[lessonSlug]/page.tsx (modified)

Added at end of returned JSX (after main layout):
```tsx
<AIChatPanelWrapper
  courseSlug={courseSlug}
  lessonTitle={lesson.title}
  sectionTitle={section?.title ?? ''}
  persona={aiPersona}
/>
```

`aiPersona` resolved before return statement using `COURSE_REGISTRY[courseSlug]?.aiPersona` with fallback. `dynamicParams = false` and `generateStaticParams` unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AIChatPanel originally imported COURSE_REGISTRY causing webpack fs error**
- **Found during:** Task 2 build verification
- **Issue:** `lib/course-registry.ts` uses `fs` and `path` at module level (for `buildDECourse`). When `ai-chat-panel.tsx` imported `COURSE_REGISTRY` directly, webpack attempted to bundle `fs` into the client bundle, causing `Module not found: Can't resolve 'fs'`.
- **Fix:** Removed `COURSE_REGISTRY` import from `ai-chat-panel.tsx`. Added `persona: AIPersona` as a required prop. Lesson page (Server Component) resolves persona server-side and passes it down.
- **Files modified:** `components/ai-chat-panel.tsx`, `components/ai-chat-panel-wrapper.tsx`, `app/courses/[courseSlug]/[lessonSlug]/page.tsx`
- **Commit:** db0e344

**2. [Rule 3 - Blocking] exercise-runner.tsx (Plan 03 pre-committed) had same fs issue**
- **Found during:** Task 2 build verification (same webpack error from different import chain)
- **Issue:** `components/code-runner/exercise-runner.tsx` already had `import { COURSE_REGISTRY } from '@/lib/course-registry'` (committed in Plan 03 work), causing the same webpack error.
- **Fix:** Removed `COURSE_REGISTRY` import, added `persona?: AIPersona | null` prop to `ExerciseRunnerProps`. Updated `CodeRunner` index to pass `persona` through. Updated `__tests__/components/exercise-runner.test.tsx` to pass `persona` directly instead of relying on `COURSE_REGISTRY` mock.
- **Files modified:** `components/code-runner/exercise-runner.tsx`, `components/code-runner/index.tsx`, `__tests__/components/exercise-runner.test.tsx`
- **Commit:** db0e344

**3. [Rule 2 - Missing functionality] scrollIntoView type guard added**
- **Found during:** Task 1 GREEN phase testing
- **Issue:** jsdom (test environment) does not implement `scrollIntoView`. Calling `element.scrollIntoView(...)` threw `TypeError: scrollIntoView is not a function` when messages array was non-empty.
- **Fix:** Added `typeof last.scrollIntoView === 'function'` guard before calling it. Preserves correct behavior in browser (where it exists) without crashing in tests.
- **Files modified:** `components/ai-chat-panel.tsx`
- **Commit:** 0e10903

## Verification Results

- `pnpm test -- ai-chat-panel` — 12/12 tests pass
- `pnpm test` — 417/417 tests pass (full suite)
- `npx tsc --noEmit` — no errors in new/modified source files
- `npx next build` — SSG succeeds, 211 lesson pages generated with no WebGPU/window errors
- `dynamicParams = false` and `generateStaticParams` verified unchanged in page.tsx

## Self-Check: PASSED

Files exist:
- FOUND: components/ai-chat-panel.tsx
- FOUND: components/ai-chat-panel-wrapper.tsx
- FOUND: __tests__/components/ai-chat-panel.test.tsx

Commits exist:
- FOUND: 0e10903 (Task 1 — AIChatPanel + wrapper + tests)
- FOUND: db0e344 (Task 2 — lesson page integration + build fix)
