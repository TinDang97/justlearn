---
phase: 06-lesson-reading-toc-highlighting-practice
plan: 03
subsystem: ui
tags: [shikijs, rehype-pretty-code, code-blocks, syntax-highlighting, mdx, react]

# Dependency graph
requires:
  - phase: 06-01-lesson-reading-toc-highlighting-practice
    provides: CSS custom properties (--color-code-bg, --color-code-border, --color-code-header, --color-primary, --color-primary-subtle, --color-foreground-muted) consumed by code block header bar
provides:
  - "@shikijs/transformers integrated into rehypePrettyCode for diff/highlight/focus notation"
  - "Code block header bar with language badge and CopyButton"
  - "CopyButton shows Copied! text feedback with injectable onCopy prop"
  - "CSS classes for .line.diff.add, .line.diff.remove, .line.highlighted, .has-focused notation"
affects:
  - lesson-reading
  - code-block-styling
  - mdx-components

# Tech tracking
tech-stack:
  added:
    - "@shikijs/transformers@4.0.2 — diff, highlight, and focus notation transformers"
  patterns:
    - "Injectable onCopy prop for CopyButton testability in jsdom (navigator.clipboard unavailable)"
    - "data-language attribute on <code> child used to populate language badge in pre override"
    - "has-focused scoping for focus CSS to avoid dimming all code lines"

key-files:
  created:
    - __tests__/components/copy-button.test.tsx
    - __tests__/components/mdx-pre-override.test.tsx
  modified:
    - next.config.mjs
    - app/globals.css
    - components/copy-button.tsx
    - mdx-components.tsx

key-decisions:
  - "CopyButton accepts optional onCopy injectable prop (defaults to navigator.clipboard.writeText) — jsdom 28 doesn't expose navigator.clipboard, Object.defineProperty workaround doesn't propagate to React component vm context"
  - "Focus CSS scoped as .has-focused .line:not(.focused) (not bare .line:not(.focused)) to prevent dimming all code lines when no focus notation is present"
  - "CopyButton changed from absolute-positioned icon to flex row in header bar — removed absolute top-2 right-2, uses flex gap-1 layout"

patterns-established:
  - "Language badge: read data-language from React.Children.toArray(children)[0].props['data-language'] in pre override"
  - "Injectable test doubles: use prop injection for browser APIs unavailable in jsdom rather than Object.defineProperty"
  - "Fake timers with shouldAdvanceTime: true for testing Promise-based state resets"

requirements-completed:
  - CODE-07
  - CODE-08
  - CODE-09
  - CODE-10

# Metrics
duration: 35min
completed: 2026-03-14
---

# Phase 06 Plan 03: Syntax Highlighting Enhancements Summary

**@shikijs/transformers with diff/highlight/focus notation, language badge header bar in code blocks, and CopyButton with Copied! text feedback**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-14T18:10:00Z
- **Completed:** 2026-03-14T18:22:00Z
- **Tasks:** 2 (+ TDD RED commit)
- **Files modified:** 6

## Accomplishments

- Installed @shikijs/transformers@4.0.2 and wired transformerNotationDiff, transformerNotationHighlight, transformerNotationFocus into rehypePrettyCode options in next.config.mjs
- Added CSS classes in globals.css for .line.diff.add (green), .line.diff.remove (red/dim), .line.highlighted (primary left-border), .has-focused .line:not(.focused) (focus notation)
- Updated mdx-components.tsx pre override with language badge header bar (reads data-language from code child, defaults to "code") and repositioned CopyButton into header
- Enhanced CopyButton to show Copied! text + Check icon after successful copy, with injectable onCopy prop for testability

## Task Commits

1. **Task 1: Install @shikijs/transformers and configure with CSS** - `2fbcada` (feat)
2. **Task 2: RED — Failing tests for CopyButton and pre override** - `496a640` (test)
3. **Task 2: GREEN — Language badge + CopyButton Copied! feedback** - `a12c0f3` (feat)

## Files Created/Modified

- `next.config.mjs` - Added @shikijs/transformers imports and transformers array to rehypePrettyCodeOptions
- `app/globals.css` - Added .line.diff.add, .line.diff.remove, .line.highlighted, .has-focused focus notation CSS
- `components/copy-button.tsx` - Added Copied! text feedback, injectable onCopy prop, aria-live="polite"
- `mdx-components.tsx` - Language badge header bar with data-language extraction from code child
- `__tests__/components/copy-button.test.tsx` - 6 tests: copy icon, Copied! feedback, mock call, timeout, mobile visibility, aria-label
- `__tests__/components/mdx-pre-override.test.tsx` - 6 tests: language badge, default "code", CopyButton presence, code passthrough

## Decisions Made

- **Injectable onCopy prop**: jsdom 28 doesn't have `navigator.clipboard`. `Object.defineProperty(global.navigator, 'clipboard', ...)` succeeds in plain ts test files but doesn't propagate to React component runtime in vitest worker context. Solution: injectable `onCopy` prop defaulting to `navigator.clipboard.writeText` — correct SOLID design and avoids env-specific mock plumbing.
- **Focus scoping**: `.has-focused .line:not(.focused)` instead of bare `.line:not(.focused)` — the latter would dim ALL code lines on any page that renders code, even when no focus notation is used.
- **CopyButton layout**: Moved from absolute-positioned (top-2 right-2) to flex item in header bar. The old absolute positioning conflicted with the new header bar layout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CopyButton position changed from absolute to flex header item**
- **Found during:** Task 2 (language badge header bar)
- **Issue:** The old CopyButton used `absolute top-2 right-2` positioning which assumed it was inside a relative container wrapping the `<pre>`. The new design puts CopyButton inside the header bar div, requiring flex layout not absolute.
- **Fix:** Changed CopyButton className from `absolute top-2 right-2 h-7 w-7` to `flex items-center gap-1 h-7 px-2` to work as a flex child in the header
- **Files modified:** components/copy-button.tsx
- **Verification:** Build passes, tests pass, visual alignment correct
- **Committed in:** a12c0f3 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added injectable onCopy prop for testability**
- **Found during:** Task 2 testing
- **Issue:** navigator.clipboard.writeText cannot be mocked reliably in vitest jsdom worker context
- **Fix:** Added optional `onCopy?: (text: string) => Promise<void>` prop that defaults to the real clipboard API, enabling clean test injection without environment hacks
- **Files modified:** components/copy-button.tsx, __tests__/components/copy-button.test.tsx
- **Verification:** All 6 copy-button tests pass, production default behavior unchanged
- **Committed in:** a12c0f3 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 missing critical for testability)
**Impact on plan:** Both auto-fixes necessary for correct layout and testable code. No scope creep.

## Issues Encountered

- `vi.useFakeTimers()` + `userEvent.setup({ advanceTimers })` + async Promise caused 5s timeout. Resolved by using `vi.useFakeTimers({ shouldAdvanceTime: true })` with `act()` wrapper for timer advancement.
- jsdom 28 doesn't implement `navigator.clipboard`. Multiple approaches tried (Object.defineProperty, vi.stubGlobal) before determining that React component runtime in vitest worker doesn't see test-file global mutations for browser APIs. Injectable prop pattern resolves this cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Code blocks now have language badge, accessible copy, and notation support — ready for lesson content to use [!code highlight], [!code ++], [!code --] annotations
- 06-04 (PracticeBlock) is already complete
- Phase 06 is now complete pending 06-02 summary updates

---
*Phase: 06-lesson-reading-toc-highlighting-practice*
*Completed: 2026-03-14*

## Self-Check: PASSED

- next.config.mjs: FOUND
- app/globals.css: FOUND
- components/copy-button.tsx: FOUND
- __tests__/components/copy-button.test.tsx: FOUND
- __tests__/components/mdx-pre-override.test.tsx: FOUND
- Commit 2fbcada: FOUND
- Commit 496a640: FOUND
- Commit a12c0f3: FOUND
