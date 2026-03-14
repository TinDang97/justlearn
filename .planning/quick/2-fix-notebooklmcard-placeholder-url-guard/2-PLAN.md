---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/notebook-urls.ts
  - components/notebook-lm/NotebookLMCard.tsx
  - __tests__/components/notebook-lm-card.test.tsx
autonomous: true
must_haves:
  truths:
    - "Courses with PLACEHOLDER URLs do not render the NotebookLMCard (returns null)"
    - "Course 01-python-fundamentals (real URL) still renders the card with a working link"
    - "Unknown course slugs still return null (existing behavior preserved)"
  artifacts:
    - path: "lib/notebook-urls.ts"
      provides: "isNotebookUrlValid helper function"
      exports: ["NOTEBOOK_URLS", "isNotebookUrlValid"]
    - path: "components/notebook-lm/NotebookLMCard.tsx"
      provides: "Guard using isNotebookUrlValid instead of bare truthiness check"
    - path: "__tests__/components/notebook-lm-card.test.tsx"
      provides: "Test covering PLACEHOLDER URL returns null"
  key_links:
    - from: "components/notebook-lm/NotebookLMCard.tsx"
      to: "lib/notebook-urls.ts"
      via: "import { isNotebookUrlValid }"
      pattern: "isNotebookUrlValid"
---

<objective>
Fix NotebookLMCard so PLACEHOLDER URLs in lib/notebook-urls.ts do not render as broken "Open in NotebookLM" links.

Purpose: 11 of 12 courses have PLACEHOLDER URLs that are truthy strings, so the current `if (!url) return null` guard passes and renders a broken link. The guard must also reject PLACEHOLDER URLs.

Output: Updated guard logic, helper function, and tests proving PLACEHOLDER courses render nothing.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@lib/notebook-urls.ts
@components/notebook-lm/NotebookLMCard.tsx
@__tests__/components/notebook-lm-card.test.tsx

<interfaces>
From lib/notebook-urls.ts:
```typescript
export const NOTEBOOK_URLS: Record<string, string> = {
  '01-python-fundamentals': 'https://notebooklm.google.com/notebook/332c3702-ee74-4545-a021-2cb5bb3080c7',
  '02-data-types-variables': 'https://notebooklm.google.com/notebook/PLACEHOLDER_02-data-types-variables',
  // ... 10 more PLACEHOLDER entries
}
```

From components/notebook-lm/NotebookLMCard.tsx:
```typescript
export function NotebookLMCard({ courseSlug }: { courseSlug: string }): JSX.Element | null
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add isNotebookUrlValid helper and fix NotebookLMCard guard</name>
  <files>lib/notebook-urls.ts, components/notebook-lm/NotebookLMCard.tsx, __tests__/components/notebook-lm-card.test.tsx</files>
  <behavior>
    - Test: courseSlug with PLACEHOLDER URL ('02-data-types-variables') renders nothing (container.firstChild is null)
    - Test: courseSlug with real URL ('01-python-fundamentals') still renders the card with link
    - Test: unknown courseSlug still renders nothing (existing test, should still pass)
    - Test: isNotebookUrlValid returns false for undefined, empty string, and PLACEHOLDER URLs
    - Test: isNotebookUrlValid returns true for a real NotebookLM URL
  </behavior>
  <action>
1. In `lib/notebook-urls.ts`, add and export an `isNotebookUrlValid` function:
   ```typescript
   export function isNotebookUrlValid(url: string | undefined): boolean {
     return !!url && !url.includes('PLACEHOLDER')
   }
   ```
   This checks both falsiness and the PLACEHOLDER substring. The PLACEHOLDER pattern is already established in the file's own comments (line 1: "Replace PLACEHOLDER URLs"), so matching on the substring is stable and self-documenting.

2. In `components/notebook-lm/NotebookLMCard.tsx`:
   - Import `isNotebookUrlValid` from `@/lib/notebook-urls`
   - Change the guard from `if (!url) return null` to `if (!isNotebookUrlValid(url)) return null`

3. In `__tests__/components/notebook-lm-card.test.tsx`, add two new tests:
   - `'returns null for a courseSlug with a PLACEHOLDER URL'` — render with `'02-data-types-variables'`, assert `container.firstChild` is null
   - `'isNotebookUrlValid rejects PLACEHOLDER and falsy URLs'` — import `isNotebookUrlValid` from `@/lib/notebook-urls` and assert: `isNotebookUrlValid(undefined)` is false, `isNotebookUrlValid('')` is false, `isNotebookUrlValid('https://notebooklm.google.com/notebook/PLACEHOLDER_foo')` is false, `isNotebookUrlValid('https://notebooklm.google.com/notebook/abc-123')` is true.
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && pnpm vitest run __tests__/components/notebook-lm-card.test.tsx</automated>
  </verify>
  <done>All 6 tests pass (4 existing + 2 new). PLACEHOLDER courses render nothing. Course 01 still renders the card.</done>
</task>

</tasks>

<verification>
- `pnpm vitest run __tests__/components/notebook-lm-card.test.tsx` — all tests pass
- `pnpm tsc --noEmit` — no type errors
- `pnpm lint` — no lint errors
</verification>

<success_criteria>
- Courses with PLACEHOLDER URLs no longer render the NotebookLMCard
- Course 01-python-fundamentals (real URL) still renders the card with a working link
- All existing and new tests pass
- Type check and lint pass cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/2-fix-notebooklmcard-placeholder-url-guard/2-SUMMARY.md`
</output>
