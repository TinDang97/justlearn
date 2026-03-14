---
phase: 06-lesson-reading-toc-highlighting-practice
verified: 2026-03-14T18:30:00Z
status: gaps_found
score: 15/16 must-haves verified
re_verification: false
gaps:
  - truth: "Horizontal rule dividers visually separate lesson sections with Part X of Y labels"
    status: partial
    reason: "The hr MDX override renders a centered thin-line divider but does NOT render 'Part X of Y' label text. CHUNK-04 in REQUIREMENTS.md explicitly requires these labels. Plan 02 scoped them out, delivering only the visual divider."
    artifacts:
      - path: "mdx-components.tsx"
        issue: "hr override produces a plain centered line (h-px w-20) with no label text"
    missing:
      - "Implement 'Part X of Y' section label above or within the hr divider — requires lesson metadata (section count, current section index) to be available at render time, or lesson authors must pass the label as a prop to a custom HrDivider MDX component"
human_verification:
  - test: "Open a lesson page with multiple h2 headings and scroll through it"
    expected: "ToC sidebar highlights the active heading as you scroll; mobile compact bar shows current heading text"
    why_human: "IntersectionObserver scroll spy behavior depends on viewport and scroll position — cannot verify programmatically"
  - test: "Open a lesson page on a mobile viewport and check the ToC compact bar"
    expected: "A collapsible details/summary element appears above the article; tapping expands the full heading list"
    why_human: "Responsive CSS breakpoint behavior requires a real browser"
  - test: "Scroll to the bottom of a lesson page"
    expected: "The 3px green progress bar at the top of the viewport fills completely"
    why_human: "RAF-driven animation requires a real browser scroll event"
  - test: "View a code block in a lesson that has [!code highlight], [!code ++], [!code --] annotations"
    expected: "Highlighted lines show green left-border background; diff lines show green/red backgrounds"
    why_human: "Shiki transformer CSS classes are applied at build time and require visual inspection"
  - test: "Click the copy button on a code block"
    expected: "Button shows 'Copied!' text for 2 seconds then reverts to copy icon; button is visible without hover on mobile"
    why_human: "Clipboard API and visual timing behavior require a real browser"
  - test: "Use <PracticeBlock prompt='...' hint='...' solution='...' /> in a lesson MDX file"
    expected: "Embedded code runner appears with 'Try it yourself' header; hint and solution sections toggle independently on button click"
    why_human: "MDX authoring integration requires a real rendered lesson"
---

# Phase 6: Lesson Reading, ToC, Highlighting, Practice — Verification Report

**Phase Goal:** Students read lessons in a comfortable Medium-quality experience with warm typography, an in-page table of contents that tracks their scroll position, enhanced code blocks with diff and line highlighting, and embedded practice blocks within lesson content.

**Verified:** 2026-03-14T18:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Lesson body text renders at 18px with 1.75 line-height on a warm off-white background | VERIFIED | `.prose { font-size: 1.125rem; line-height: 1.75 }` + `--color-background: #FAFAF8` in globals.css |
| 2 | All code blocks and inline code use JetBrains Mono font | VERIFIED | `JetBrains_Mono` imported in layout.tsx, `variable: '--font-mono'` applied to `<html>` element; `.prose code:not(pre code) { font-family: var(--font-mono) }` in globals.css |
| 3 | Blockquotes display with a green left border and green-tinted background, not italic | VERIFIED | `.prose blockquote { border-left: 3px solid var(--color-primary); background: var(--color-primary-subtle); font-style: normal }` in globals.css |
| 4 | Tip, Warning, Info, and Error callout MDX components render with correct icon, color, and border | VERIFIED | `components/callout.tsx` exports Tip/Warning/Info/ErrorCallout; registered in `mdx-components.tsx` as Tip/Warning/Info/Error; 23 passing tests |
| 5 | A sticky table of contents panel appears on desktop showing all lesson headings | VERIFIED | `LessonToc` renders `<nav aria-label="Table of contents">`; lesson page places it in `<aside className="hidden xl:block"><div className="sticky top-20">` |
| 6 | The active heading is highlighted in the ToC as the student scrolls | VERIFIED | `useActiveHeading` hook uses `IntersectionObserver` with `rootMargin: '-10% 0px -80% 0px'`; active item gets `aria-current="true"` and `font-medium text-[var(--color-foreground)]` styling |
| 7 | On mobile, the ToC collapses to a compact bar below the lesson header | VERIFIED | `<details className="xl:hidden ...">` pattern with `<summary>` showing current heading text |
| 8 | A thin progress bar at the top of the viewport fills as the student scrolls | VERIFIED | `ScrollProgress` renders `fixed left-0 z-50 h-[3px]` div at `top: 64px`; RAF loop writes `style.width` directly; cancelAnimationFrame cleanup on unmount |
| 9 | Horizontal rule dividers visually separate lesson sections | VERIFIED | `hr` override in `mdx-components.tsx` produces centered `h-px w-20` thin line with `not-prose` spacing |
| 10 | Horizontal rule dividers include "Part X of Y" section labels | FAILED | hr override is a plain thin line only — no label text rendered; CHUNK-04 requires "Part X of Y" labels |
| 11 | Code blocks display a language badge in a header bar above the code | VERIFIED | `pre` override reads `data-language` from code child; renders header bar with language badge span |
| 12 | Copy button is always visible on mobile, not hover-only | VERIFIED | `CopyButton` has `opacity-100 md:opacity-0 md:group-hover:opacity-100` — visible on mobile, hover-only on desktop |
| 13 | Copy button shows 'Copied!' text feedback after copying | VERIFIED | `copied` state renders `<Check /> <span>Copied!</span>` for 2 seconds; `aria-live="polite"` for screen readers |
| 14 | Lines annotated with `[!code highlight]` render with highlighted background | VERIFIED | `transformerNotationHighlight()` in `next.config.mjs`; `.line.highlighted { background-color: var(--color-primary-subtle); border-left: 2px solid var(--color-primary) }` in globals.css |
| 15 | Lines annotated with `[!code ++]` and `[!code --]` render with green/red diff backgrounds | VERIFIED | `transformerNotationDiff()` in `next.config.mjs`; `.line.diff.add` and `.line.diff.remove` CSS in globals.css |
| 16 | Inline 'Try it yourself' practice blocks appear within lesson content with an embedded code runner | VERIFIED | `PracticeBlock` renders `CodeRunner` with `initialCode` prop; registered in `mdx-components.tsx` as `PracticeBlock` |
| 17 | Practice blocks have expandable hints that toggle on button click | VERIFIED | `hintOpen` useState; "Show hint" / "Hide hint" Button toggles; conditional on `hint !== undefined` |
| 18 | Practice blocks have expandable solutions that toggle on button click | VERIFIED | `solutionOpen` useState; "Show solution" / "Hide solution" Button toggles; conditional on `solution !== undefined` |

**Score:** 17/18 truths verified (CHUNK-04 "Part X of Y" label is partial — visual divider exists, label text missing)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/globals.css` | Warm palette CSS custom properties, prose overrides | VERIFIED | Full light + dark `--color-*` tokens; `.prose` overrides; blockquote, code, headings, links |
| `app/layout.tsx` | JetBrains Mono font variable on html element | VERIFIED | `JetBrains_Mono({ variable: '--font-mono' })`; `className={jetbrainsMono.variable}` on `<html>` |
| `components/callout.tsx` | Tip, Warning, Info, Error callout components | VERIFIED | 84 lines; exports Tip/Warning/Info/ErrorCallout; variant config with lucide-react icons |
| `mdx-components.tsx` | Callout + PracticeBlock + hr + pre overrides registered | VERIFIED | All 4 callouts, PracticeBlock, hr, pre registered in `useMDXComponents()` |
| `__tests__/components/callout.test.tsx` | Unit tests for callout variants | VERIFIED | File exists; 23 tests passing |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/content.ts` | `extractHeadings()` function and `Heading` type | VERIFIED | `Heading` type exported at line 44; `extractHeadings()` at line 46 using `github-slugger` |
| `components/lesson-toc.tsx` | Sticky desktop and collapsible mobile ToC with scroll spy | VERIFIED | 97 lines; `useActiveHeading` hook with IntersectionObserver; desktop div + mobile details/summary |
| `components/scroll-progress.tsx` | Fixed progress bar at top of viewport | VERIFIED | 39 lines; RAF loop; `cancelAnimationFrame` cleanup; `aria-hidden="true"` |
| `__tests__/lib/extractHeadings.test.ts` | Unit tests for extractHeadings | VERIFIED | File exists; 9 tests passing |
| `__tests__/components/lesson-toc.test.tsx` | Unit tests for LessonToc | VERIFIED | File exists; tests passing |
| `__tests__/components/scroll-progress.test.tsx` | Unit tests for ScrollProgress RAF loop | VERIFIED | File exists; 5 tests passing |
| `__tests__/components/mdx-hr-override.test.tsx` | Unit tests for hr divider | VERIFIED | File exists; 3 tests passing |

### Plan 03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `next.config.mjs` | `@shikijs/transformers` integration | VERIFIED | `transformerNotationDiff`, `transformerNotationHighlight`, `transformerNotationFocus` imported and configured |
| `app/globals.css` | CSS for `.line.diff.add`, `.line.diff.remove`, `.line.highlighted`, `.has-focused` | VERIFIED | All four selector blocks present at lines 195-220 |
| `mdx-components.tsx` | pre override with language badge header | VERIFIED | `data-language` extraction from code child; header bar div with badge span and `CopyButton` |
| `components/copy-button.tsx` | CopyButton with Copied! text feedback | VERIFIED | `copied` state toggles `<Check /><span>Copied!</span>`; `onCopy` injectable prop for testability |
| `__tests__/components/copy-button.test.tsx` | Tests for copy button | VERIFIED | File exists; 6 tests passing |
| `__tests__/components/mdx-pre-override.test.tsx` | Tests for language badge | VERIFIED | File exists; 6 tests passing |

### Plan 04 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/practice-block.tsx` | PracticeBlock with prompt, CodeRunner, hint, solution | VERIFIED | 90 lines; Code2 icon header; `CodeRunner` import; `hintOpen`/`solutionOpen` states |
| `mdx-components.tsx` | PracticeBlock registered for MDX usage | VERIFIED | `import { PracticeBlock } from '@/components/practice-block'`; `PracticeBlock` in return object |
| `__tests__/components/practice-block.test.tsx` | Tests for PracticeBlock | VERIFIED | File exists; 11 tests passing |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `components/callout.tsx` | `mdx-components.tsx` | import and registration | WIRED | `import { Tip, Warning, Info, ErrorCallout } from '@/components/callout'`; all 4 registered |
| `app/globals.css` | `components/callout.tsx` | CSS custom properties consumed by Tailwind classes | WIRED | `--color-*` tokens available globally; callout uses Tailwind color classes backed by warm tokens |
| `lib/content.ts` | `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | `extractHeadings` called in Server Component | WIRED | `import { extractHeadings } from '@/lib/content'`; called at line 60 with `rawMd` |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | `components/lesson-toc.tsx` | `headings` prop passed to LessonToc | WIRED | `<LessonToc headings={headings} />` used in both mobile and desktop positions |
| `components/lesson-toc.tsx` | rendered heading IDs | IntersectionObserver observing heading elements by ID | WIRED | `document.getElementById(id)` inside `useActiveHeading` useEffect |
| `next.config.mjs` | `app/globals.css` | transformers produce CSS classes styled by globals.css | WIRED | `transformerNotationDiff()` → `.line.diff.add/.remove` CSS; `transformerNotationHighlight()` → `.line.highlighted` CSS |
| `mdx-components.tsx` | `components/copy-button.tsx` | CopyButton rendered inside pre override header bar | WIRED | `import { CopyButton } from '@/components/copy-button'`; `{raw && <CopyButton code={raw} />}` in header |
| `components/practice-block.tsx` | `components/code-runner.tsx` | import and embed existing CodeRunner | WIRED | `import { CodeRunner } from '@/components/code-runner'`; `<CodeRunner initialCode={initialCode} />` |
| `components/practice-block.tsx` | `mdx-components.tsx` | registered as MDX component | WIRED | `import { PracticeBlock } from '@/components/practice-block'`; `PracticeBlock` in `useMDXComponents()` return |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| READ-01 | 06-01 | Warm-neutral color palette applied | SATISFIED | `--color-background: #FAFAF8`, `--color-primary: #16A34A` in globals.css |
| READ-02 | 06-01 | Body text at 18px with 1.75 line-height | SATISFIED | `.prose { font-size: 1.125rem; line-height: 1.75 }` in globals.css |
| READ-03 | 06-01 | JetBrains Mono for code blocks | SATISFIED | `JetBrains_Mono` loaded in layout.tsx as `--font-mono`; used in `.prose code` |
| READ-04 | 06-01 | Blockquotes with green left border | SATISFIED | `.prose blockquote { border-left: 3px solid var(--color-primary); font-style: normal }` |
| READ-05 | 06-01 | Callout MDX components (Tip, Warning, Info) | SATISFIED | Four callout variants with distinct icons, borders, and backgrounds; registered in MDX |
| CHUNK-01 | 06-02 | ToC from headings, sticky desktop / collapsible mobile | SATISFIED | `extractHeadings()` + `LessonToc` with `sticky top-20` aside on xl+, `details/summary` on mobile |
| CHUNK-02 | 06-02 | Active heading highlighted in ToC via IntersectionObserver | SATISFIED | `useActiveHeading` with `rootMargin: '-10% 0px -80% 0px'`; active link gets `aria-current` and styling |
| CHUNK-03 | 06-02 | Scroll progress indicator | SATISFIED | `ScrollProgress` fixed 3px bar at `top: 64px`, RAF-driven, cleans up on unmount |
| CHUNK-04 | 06-02 | Patch dividers with "Part X of Y" labels | BLOCKED | hr override exists as plain centered thin line; "Part X of Y" label text is NOT implemented |
| CODE-07 | 06-03 | Language badge in code block header bar | SATISFIED | `data-language` extracted from code child; badge span renders language name in header |
| CODE-08 | 06-03 | Copy button always visible on mobile | SATISFIED | `opacity-100 md:opacity-0 md:group-hover:opacity-100` on CopyButton |
| CODE-09 | 06-03 | Line highlighting via `[!code highlight]` | SATISFIED | `transformerNotationHighlight()` + `.line.highlighted` CSS with primary left-border |
| CODE-10 | 06-03 | Diff notation `[!code ++]`/`[!code --]` | SATISFIED | `transformerNotationDiff()` + `.line.diff.add/.remove` CSS |
| PRACT-01 | 06-04 | Inline practice blocks with embedded code runner | SATISFIED | `PracticeBlock` renders `CodeRunner`; registered as MDX component |
| PRACT-02 | 06-04 | Expandable hint and solution in practice blocks | SATISFIED | `hintOpen`/`solutionOpen` states; Show/Hide button toggles; conditional on prop presence |

**Orphaned requirements:** None — all 15 requirement IDs from REQUIREMENTS.md for Phase 6 are claimed by exactly one plan.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | 57 | `// TODO: When Phase 4 lands sourceCourseSlug on LessonMeta, use sourceCourseSlug for readFileSync path` | Info | Pre-planned deferred concern — current implementation uses `courseSlug` directly and has a `fs.existsSync` guard; functional but will need update when Phase 4 lands. Not a blocker. |

---

## Test Suite Results

All 228 tests pass across 29 test files (including all 8 Phase 6 test files):

- `__tests__/components/callout.test.tsx` — 23 tests, all pass
- `__tests__/lib/extractHeadings.test.ts` — 9 tests, all pass
- `__tests__/components/lesson-toc.test.tsx` — 4 tests, all pass
- `__tests__/components/scroll-progress.test.tsx` — 5 tests, all pass
- `__tests__/components/mdx-hr-override.test.tsx` — 3 tests, all pass
- `__tests__/components/copy-button.test.tsx` — 6 tests, all pass
- `__tests__/components/mdx-pre-override.test.tsx` — 6 tests, all pass
- `__tests__/components/practice-block.test.tsx` — 11 tests, all pass

---

## Human Verification Required

### 1. ToC Scroll Spy

**Test:** Open a lesson page with multiple h2 headings and scroll slowly through the content.
**Expected:** The corresponding heading in the ToC sidebar becomes bold/dark as it enters the viewport; previously active heading reverts to muted color.
**Why human:** IntersectionObserver scroll behavior requires a real browser and viewport scroll events.

### 2. Mobile ToC Compact Bar

**Test:** Open a lesson page on a viewport narrower than 1280px (xl breakpoint).
**Expected:** A collapsible `<details>` bar appears above the article showing "Table of contents" or the current heading text; tapping it expands the full heading list.
**Why human:** Responsive CSS breakpoint visibility requires a real browser.

### 3. Scroll Progress Bar

**Test:** Open a lesson page and scroll to the bottom.
**Expected:** The 3px green bar pinned below the site header fills from 0% to 100% as you scroll.
**Why human:** RAF animation and scroll events require a real browser.

### 4. Shiki Transformer Annotations

**Test:** View a lesson code block that uses `[!code highlight]`, `[!code ++]`, or `[!code --]` annotations.
**Expected:** Highlighted lines show a green left-border background; `[!code ++]` lines show a green-tinted background; `[!code --]` lines show a red-tinted background.
**Why human:** Shiki transformer CSS classes are applied at build time and require visual inspection of rendered output.

### 5. Copy Button Behavior

**Test:** Click the copy button on a code block on mobile; click it on desktop.
**Expected:** Mobile: button is always visible. Desktop: button appears only on hover. After click on either: "Copied!" text appears for 2 seconds.
**Why human:** Clipboard API and hover visibility require a real browser.

### 6. PracticeBlock MDX Integration

**Test:** Add `<PracticeBlock prompt="What does print() do?" hint="It outputs to console" solution="print('hello')" />` to a lesson MDX file and view the lesson.
**Expected:** "Try it yourself" block with Code2 icon header; embedded code runner; "Show hint" and "Show solution" toggle buttons.
**Why human:** MDX rendering requires a real browser; CodeRunner uses Pyodide which requires a real environment.

---

## Gaps Summary

**1 gap found (CHUNK-04 partially satisfied):**

REQUIREMENTS.md specifies CHUNK-04 as "Patch dividers between lesson sections with 'Part X of Y' labels." The implementation delivers only the visual divider (a centered thin `h-px` line via the `hr` MDX override) — the "Part X of Y" label text was not implemented. Plan 02 scoped this down to just the visual divider and called it CHUNK-04-complete.

This is a partial implementation of the requirement as written. Implementing "Part X of Y" labels would require either:
(a) Lesson authors to use a custom MDX component (e.g., `<SectionDivider label="Part 1 of 3" />`) rather than `---` horizontal rules, or
(b) The server component to count and inject section numbers alongside the `---` markers.

The visual divider is fully functional and tested. The label text is the missing element.

---

_Verified: 2026-03-14T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
