---
phase: quick-5
verified: 2026-03-16T00:00:00Z
status: passed
score: 4/4 must-haves verified
---

# Quick Task 5: Add Context Menu for Fast Ask/QA with AI — Verification Report

**Task Goal:** Add a floating "Ask AI" button that appears when users select text within the lesson article, clicks open the AI chat panel, and automatically sends the selected text as a question.
**Verified:** 2026-03-16
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                    | Status     | Evidence                                                                                                                                |
|----|--------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| 1  | User selects text in the lesson article and sees a floating "Ask AI" button | VERIFIED | `text-selection-ask-ai.tsx` listens to `mouseup` + `selectionchange`, renders a portal button with "Ask AI" text + Sparkles icon       |
| 2  | Clicking "Ask AI" opens the chat panel with the selected text as a question | VERIFIED | `handleClick` calls `useChatStore.getState().openPanelWithQuestion("Explain this: " + selectedText)`; store sets `isOpen: true`        |
| 3  | The floating button disappears when selection is cleared                 | VERIFIED | `detectSelection` clears `selectedText` and `buttonPosition` when `selection.toString().trim()` is empty; `return null` when both falsy |
| 4  | The question is automatically sent to the AI (not just pre-filled)       | VERIFIED | `ai-chat-panel.tsx` line 114-121: `useEffect` watches `isOpen && pendingQuestion && status === 'ready'`, consumes and calls `sendMessage` |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact                                                  | Expected                            | Lines  | Status   | Details                                                                     |
|-----------------------------------------------------------|-------------------------------------|--------|----------|-----------------------------------------------------------------------------|
| `components/text-selection-ask-ai.tsx`                    | Floating selection toolbar component | 105 (min 40) | VERIFIED | Substantive: full portal button, event listeners, selection detection, cleanup |
| `lib/store/chat.ts`                                       | openPanelWithQuestion + pendingQuestion | 198 lines | VERIFIED | Contains `pendingQuestion: string | null`, `openPanelWithQuestion`, `consumePendingQuestion` at lines 152-164 |
| `__tests__/components/text-selection-ask-ai.test.tsx`     | Unit tests for selection toolbar    | 117 (min 30) | VERIFIED | 4 tests: store actions (2) + component render/interaction (2)              |
| `components/lesson-article.tsx`                           | Thin client wrapper for article ref  | 22 lines | VERIFIED | Wires `articleRef` to `<article>` and renders `<TextSelectionAskAI containerRef={articleRef}>` |

### Key Link Verification

| From                                     | To                    | Via                              | Status   | Details                                                                                       |
|------------------------------------------|-----------------------|----------------------------------|----------|-----------------------------------------------------------------------------------------------|
| `components/text-selection-ask-ai.tsx`   | `lib/store/chat.ts`   | `useChatStore openPanelWithQuestion` | WIRED | Line 77: `useChatStore.getState().openPanelWithQuestion(\`Explain this: ${selectedText}\`)`  |
| `components/ai-chat-panel.tsx`           | `lib/store/chat.ts`   | `pendingQuestion consumed and auto-sent` | WIRED | Lines 77-78 (subscription), lines 115-119 (useEffect consumes + calls `sendMessage`)        |
| `components/lesson-article.tsx`          | `components/text-selection-ask-ai.tsx` | import + containerRef prop | WIRED | Line 4 imports `TextSelectionAskAI`, line 18 renders with `containerRef={articleRef}`       |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | `components/lesson-article.tsx` | `<LessonArticle>` wrapping article | WIRED | Line 18 imports `LessonArticle`, lines 127-129 wrap lesson content                          |

### Requirements Coverage

| Requirement | Description                                              | Status     | Evidence                                                              |
|-------------|----------------------------------------------------------|------------|-----------------------------------------------------------------------|
| QUICK-5     | Context menu / floating button for fast text-based Q&A  | SATISFIED  | All four observable truths verified; full implementation confirmed    |

### Anti-Patterns Found

None. The `return null` at `text-selection-ask-ai.tsx:84` is a legitimate conditional guard, not a stub.

### Human Verification Required

#### 1. Floating Button Visual Position

**Test:** Open a lesson page in browser, select a word or sentence in the article body.
**Expected:** A small pill-shaped "Ask AI" button with a sparkles icon appears just below the selection.
**Why human:** `getBoundingClientRect` portal positioning cannot be verified in jsdom; visual placement requires a real browser.

#### 2. Selection Cleared on Panel Open

**Test:** Select text, click "Ask AI", observe that the floating button disappears.
**Expected:** Button disappears immediately after click; selection highlight is removed.
**Why human:** `window.getSelection().removeAllRanges()` in `handleClick` interacts with real browser selection state.

#### 3. Auto-Send When Engine Already Cached

**Test:** With model already downloaded, select text, click "Ask AI".
**Expected:** Chat panel opens and the "Explain this: ..." question is sent automatically without any user action.
**Why human:** Requires real WebGPU engine state; `status === 'ready'` path cannot be fully simulated.

#### 4. Auto-Send When Engine Requires Download

**Test:** On a fresh browser (no cached model), select text, click "Ask AI".
**Expected:** Chat panel opens showing the download prompt; after downloading, the question auto-sends.
**Why human:** Requires the first-time download flow with real network and model initialization.

### Gaps Summary

No gaps. All artifacts exist with substantive implementations (well above minimum line counts), all key links are wired through the full call chain, and the single requirement QUICK-5 is satisfied. Four items are flagged for human verification — these relate to visual appearance and real browser/engine behavior that cannot be confirmed programmatically.

---

_Verified: 2026-03-16_
_Verifier: Claude (gsd-verifier)_
