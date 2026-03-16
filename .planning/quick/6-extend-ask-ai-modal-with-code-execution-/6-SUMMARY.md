---
phase: quick-6
plan: "01"
subsystem: ai-chat, code-execution
tags: [pyodide, chat, code-block, mdx, run-in-ai]
dependency_graph:
  requires: [hooks/use-pyodide-worker.ts, lib/store/chat.ts]
  provides: [components/chat-code-block.tsx, components/run-in-ai-button.tsx]
  affects: [components/ai-message.tsx, mdx-components.tsx]
tech_stack:
  added: []
  patterns: [usePyodideWorker singleton reuse, useChatStore.getState() non-reactive call, code-fence segment parsing, TDD red-green]
key_files:
  created:
    - components/chat-code-block.tsx
    - components/run-in-ai-button.tsx
    - __tests__/components/chat-code-block.test.tsx
    - __tests__/components/run-in-ai-button.test.tsx
  modified:
    - components/ai-message.tsx
    - mdx-components.tsx
decisions:
  - "Use useChatStore.getState() (non-reactive) in RunInAIButton to avoid re-renders on every code block on the page"
  - "After streaming completes, split assistant message content on code fence regex rather than DOM manipulation"
  - "During streaming, render Streamdown unchanged so the streaming animation works correctly"
  - "Output area in ChatCodeBlock hidden until first run (hasRun state tracks null vs set output)"
metrics:
  duration_seconds: 291
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  commits: 4
---

# Quick Task 6: Extend Ask AI Modal with Code Execution — Summary

**One-liner:** Interactive Python code blocks in AI chat with inline Pyodide execution, plus "Run in AI" button on lesson code blocks that opens the chat panel with the code.

## Tasks Completed

| Task | Description | Commits |
|------|-------------|---------|
| 1 (TDD) | ChatCodeBlock component + AIMessage code fence rendering | be9d5e6 (test RED), e4abee7 (impl GREEN) |
| 2 (TDD) | RunInAIButton component + MDX code block integration | 4157e97 (test RED), 0ec038c (impl GREEN) |

## What Was Built

### ChatCodeBlock (`components/chat-code-block.tsx`)

Compact runnable code block designed for the 420-480px chat panel:
- Header bar: language badge (left), Run button (right)
- Button states: idle (Play + "Run"), running (Loader2 spinner), loading ("Loading Python...")
- Run button disabled while running or loading
- Output panel visible only after first run (hidden by default)
- stdout lines render normally; stderr and error lines in red — same pattern as exercise-runner.tsx
- Reuses the shared `usePyodideWorker` singleton (single WASM download across all code runners)

### AIMessage update (`components/ai-message.tsx`)

After streaming ends, if content contains code fences:
- Splits content on ` ```lang\ncode\n``` ` regex into text/code segments
- Renders text segments via Streamdown, code segments via ChatCodeBlock
- During streaming: renders normally via Streamdown (animation preserved)
- Messages with no code fences: renders entirely via Streamdown (no overhead)

### RunInAIButton (`components/run-in-ai-button.tsx`)

Ghost button with BotMessageSquare icon matching CopyButton style:
- Calls `useChatStore.getState().openPanelWithQuestion(prompt)` on click
- Prompt: `"Run this code and explain what it does:\n\`\`\`python\n{code}\n\`\`\`"`
- Uses `.getState()` (non-reactive) — no subscription, no re-renders on state changes

### MDX code blocks update (`mdx-components.tsx`)

- Right side of header bar now wraps CopyButton + RunInAIButton in `flex gap-1`
- RunInAIButton rendered only when `language === 'python' || language === 'py'` and `raw` is truthy
- Non-Python code blocks unchanged

## Verification

- 13 tests passing: 9 for ChatCodeBlock, 4 for RunInAIButton
- Existing ai-message tests (13) and mdx-pre-override tests (6) pass unchanged
- `pnpm build` succeeds
- TypeScript errors in new files: none from production code; pre-existing project-wide `toBeInTheDocument` typing issue affects test files (144 errors pre-existing, not introduced)

## Deviations from Plan

None — plan executed exactly as written. The simpler content-splitting approach (preferred by the plan) was chosen over DOM manipulation.
