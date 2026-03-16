---
phase: quick-5
plan: 01
subsystem: ai-chat
tags: [text-selection, context-menu, chat-store, lesson-page, ux]
dependency_graph:
  requires: [lib/store/chat.ts, components/ai-chat-panel.tsx, app/courses/[courseSlug]/[lessonSlug]/page.tsx]
  provides: [components/text-selection-ask-ai.tsx, components/lesson-article.tsx]
  affects: [ai-chat-panel, lesson-page]
tech_stack:
  added: []
  patterns: [floating portal button, zustand pending state, useEffect auto-trigger]
key_files:
  created:
    - components/text-selection-ask-ai.tsx
    - components/lesson-article.tsx
    - __tests__/components/text-selection-ask-ai.test.tsx
  modified:
    - lib/store/chat.ts
    - components/ai-chat-panel.tsx
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
decisions:
  - "LessonArticle thin client wrapper wraps the Server Component article to attach a useRef without converting the entire page to a client component"
  - "pendingQuestion consumed in ai-chat-panel useEffect guarded by status === 'ready' to handle both cached and first-time download cases"
  - "getBoundingClientRect guarded with typeof check to prevent unhandled errors in jsdom test environment"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-16T10:02:47Z"
  tasks_completed: 2
  files_changed: 6
---

# Quick Task 5: Add Context Menu for Fast Ask Q&A with AI — Summary

**One-liner:** Floating "Ask AI" button on text selection using portal + Zustand pendingQuestion pattern for engine-ready auto-send.

## What Was Built

Students can now select any text in a lesson article and see a floating "Ask AI" button. Clicking it opens the AI chat panel and automatically sends "Explain this: {selected text}" when the engine is ready.

### Components

**`components/text-selection-ask-ai.tsx`**
- Accepts `containerRef: React.RefObject<HTMLElement | null>` to scope selection detection
- Listens to `mouseup` + `selectionchange` events on the container element
- Verifies selection is within the container via `range.commonAncestorContainer`
- Renders a fixed-position portal button near the selection bounding rect
- Calls `useChatStore.getState().openPanelWithQuestion("Explain this: {text}")` on click
- Prevents selection clearing via `onMouseDown e.preventDefault()`
- Guards `getBoundingClientRect` for non-browser environments

**`components/lesson-article.tsx`**
- Thin `'use client'` wrapper that creates `articleRef` and renders `TextSelectionAskAI`
- Allows the lesson page (Server Component) to stay server-rendered while enabling DOM selection tracking

### Store Updates (`lib/store/chat.ts`)

Added to `ChatState`:
- `pendingQuestion: string | null` — initial `null`
- `openPanelWithQuestion(question)` — sets `isOpen: true` and `pendingQuestion: question`
- `consumePendingQuestion()` — returns current pendingQuestion, clears to null

### Chat Panel Updates (`components/ai-chat-panel.tsx`)

Added `useEffect` that watches `isOpen && pendingQuestion && status === 'ready'`:
- Consumes the pending question via `consumePendingQuestion()`
- Calls `sendMessage()` to auto-send to the AI
- Works with both cached (immediate ready) and first-time download (waits until ready) flows

### Tests (`__tests__/components/text-selection-ask-ai.test.tsx`)

4 tests covering:
1. `openPanelWithQuestion` sets `isOpen=true` and `pendingQuestion`
2. `consumePendingQuestion` returns value and clears it to null
3. `TextSelectionAskAI` renders nothing when no text selected
4. `TextSelectionAskAI` calls `openPanelWithQuestion` with correct prefix on button click

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Guard getBoundingClientRect unavailability in jsdom**
- **Found during:** Task 1 tests
- **Issue:** jsdom does not implement `range.getBoundingClientRect()`, causing unhandled exception in test environment
- **Fix:** Added `typeof range.getBoundingClientRect !== 'function'` guard to return early
- **Files modified:** `components/text-selection-ask-ai.tsx`
- **Commit:** 0c4aa86

## Self-Check: PASSED

- FOUND: components/text-selection-ask-ai.tsx
- FOUND: components/lesson-article.tsx
- FOUND: __tests__/components/text-selection-ask-ai.test.tsx
- FOUND commit: 0c4aa86 (Task 1)
- FOUND commit: e7e4b4d (Task 2)
- All 433 tests pass
- No new type errors in changed files
