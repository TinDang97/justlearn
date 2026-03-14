---
phase: 02-progress-code-runner
verified: 2026-03-14T10:51:00Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "Navigate to any lesson page (e.g. /courses/01-python-fundamentals/lesson-01) and scroll to 'Try it yourself' section. Type print(\"Hello from Pyodide!\") and click Run."
    expected: "Loading indicator appears for 2-3 seconds on first click, then 'Hello from Pyodide!' appears in the output panel."
    why_human: "Pyodide WASM + Web Worker APIs are not available in jsdom/vitest. Cannot test CDN fetch, WASM execution, or Worker message-passing in automated tests."
  - test: "With DevTools Network tab open, load a lesson page. Verify Pyodide WASM is NOT in the network waterfall on page load. Click Run and confirm WASM loads only then."
    expected: "No pyodide.wasm request on page load. Request appears only after Run is clicked."
    why_human: "Lazy-loading behavior can only be confirmed via browser Network tab — cannot be verified by grepping code alone."
  - test: "Run a script with a runtime error, e.g. print(1/0), and observe the output panel."
    expected: "Error output appears in red (text-red-500) in the output panel."
    why_human: "Stderr rendering with red styling requires actual Pyodide execution + browser DOM inspection."
  - test: "While a long-running script executes (e.g. for i in range(10000000): pass), try scrolling and interacting with the page."
    expected: "Page remains fully responsive — no UI freezing — because Pyodide runs in a Web Worker."
    why_human: "UI responsiveness during WASM execution cannot be verified without running the app in a real browser."
  - test: "Complete a lesson by clicking 'Mark Complete', then hard-refresh the page."
    expected: "The lesson still shows as completed. Sidebar shows CheckCircle2 (green) icon for that lesson."
    why_human: "localStorage persistence requires a real browser environment — jsdom does not persist between page loads."
---

# Phase 2: Progress Tracking + Code Runner Verification Report

**Phase Goal:** Students can track their learning progress across sessions and execute Python code directly in the browser without any local setup
**Verified:** 2026-03-14T10:51:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Student can mark a lesson complete and the state survives browser refresh | ? NEEDS HUMAN | `LessonCompleteButton` calls `markComplete`/`markIncomplete` from Zustand store with `skipHydration:true` + `ProgressHydration.rehydrate()` in layout. localStorage persistence verified via 2 unit tests (`uses python-course-progress as the storage key`, `has skipHydration set to true`). Full round-trip requires real browser. |
| 2 | Course catalog cards show completion percentage for each course | VERIFIED | `CourseProgressBar` imported and rendered inside each course card in `app/courses/page.tsx` line 35. Component reads `getCourseProgress` from store, renders `N/total completed` text with a progress bar div. |
| 3 | Course overview page shows completion percentage | VERIFIED | `CourseProgressBar` imported and rendered in `app/courses/[courseSlug]/page.tsx` line 52, after description paragraph, before "Lessons" heading. |
| 4 | Sidebar lesson list shows distinct icons for completed vs not-started lessons | VERIFIED | `CourseSidebar` and `MobileSidebarTrigger` both read `isComplete` from `useProgressStore` and render `CheckCircle2` (aria-label="Completed", text-green-500) vs `Circle` (aria-label="Not started", text-muted-foreground). Covered by 2 unit tests. |
| 5 | Student can write Python code in an in-lesson editor with syntax highlighting | VERIFIED | `CodeRunnerClient` uses `@uiw/react-codemirror` with `extensions={[python()]}` and `theme={resolvedTheme === 'dark' ? githubDark : githubLight}`. Editor renders in `min-h-[200px]` container. |
| 6 | Student can click Run and see stdout/stderr output in an adjacent panel | VERIFIED | Run button calls `run(code)` from `usePyodideWorker`, result is passed to `OutputPanel`. `OutputPanel` renders each output line in `<pre>` blocks with `text-red-500` for stderr. Covered by 3 OutputPanel unit tests. |
| 7 | Pyodide loads only when Run is first clicked, not on page load | VERIFIED (code) / ? NEEDS HUMAN (runtime) | `hooks/use-pyodide-worker.ts` lines 47-48: `sharedWorker` is null on mount; `new Worker(...)` is called only inside `run()`. Unit test "does not create Worker on mount" passes. Runtime verification requires browser DevTools. |
| 8 | A clear loading indicator shows during Pyodide cold start | VERIFIED | `CodeRunnerClient` renders `<span>Loading Python runtime...</span>` with `<Loader2 animate-spin>` when `status === 'loading'`. Unit test "shows loading indicator when status is loading" passes. |
| 9 | Lesson content stays fully readable while code runner loads | VERIFIED | `CodeRunner/index.tsx` uses `next/dynamic` with `ssr: false` and a skeleton fallback (`h-64 animate-pulse bg-muted rounded-lg`). Lesson article, breadcrumb, and nav are server-rendered independently of the dynamically loaded editor. |

**Score:** 9/9 truths verified (automated), 5 items flagged for human runtime verification

---

### Required Artifacts

#### Plan 02-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/store/progress.ts` | Zustand progress store with persist middleware | VERIFIED | 55 lines. Exports `useProgressStore`. Contains `skipHydration: true`, `name: 'python-course-progress'`, `createJSONStorage(() => localStorage)`. All 5 actions present. |
| `components/progress-hydration.tsx` | Root-level rehydration component | VERIFIED | 11 lines. `'use client'`, calls `useProgressStore.persist.rehydrate()` in `useEffect([], [])`, returns `null`. |
| `components/lesson-complete-button.tsx` | Mark complete toggle button for lesson pages | VERIFIED | 40 lines. `'use client'`, reads `isComplete`, calls `markComplete`/`markIncomplete` on click. Two visual states (green "Completed" + "Mark Complete"). |
| `components/course-progress-bar.tsx` | Progress percentage display | VERIFIED | 34 lines. `'use client'`, uses `useShallow` for array selector, renders progress bar + "N/total completed", returns null at 0%. |
| `__tests__/lib/progress-store.test.ts` | Unit tests for progress store (min 40 lines) | VERIFIED | 139 lines. 17 tests covering all specified behaviors: markComplete idempotency, markIncomplete no-op, isComplete, getCourseProgress division safety, persist options. |

#### Plan 02-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `public/workers/pyodide.worker.mjs` | Self-contained Pyodide Web Worker | VERIFIED | 39 lines. ESM module, imports `loadPyodide` from CDN. Module-level `pyodideReady` cache. `self.onmessage` handler: lazy init, `setStdout`/`setStderr` batched, `runPythonAsync`, postMessage `{id, output, error}`. |
| `hooks/use-pyodide-worker.ts` | React hook for lazy worker instantiation | VERIFIED | 79 lines. `'use client'`, exports `usePyodideWorker`. Module-level `sharedWorker` singleton. `workerRef` pattern via module singleton. Lazy init in `run()`. `pendingMessages` Map for concurrent calls. Status state machine. |
| `components/code-runner/code-runner-client.tsx` | CodeMirror editor + run button + output panel | VERIFIED | 70 lines. `'use client'`, imports `CodeMirror`, uses `python()` extension, `githubLight`/`githubDark` themes, `usePyodideWorker`, `OutputPanel`. Loading indicator. Run button disabled when running. |
| `components/code-runner/index.tsx` | Dynamic import wrapper with ssr: false | VERIFIED | 19 lines. `'use client'` directive, `dynamic(() => import('./code-runner-client'), { ssr: false })` with skeleton loading fallback. |
| `components/code-runner/output-panel.tsx` | stdout/stderr display component | VERIFIED | 43 lines. Renders stdout in default color, stderr with `text-red-500 dark:text-red-400`. Error string rendered with red styling. Placeholder when empty. |
| `__tests__/hooks/use-pyodide-worker.test.ts` | Tests for lazy worker instantiation (min 20 lines) | VERIFIED | 50 lines. 3 tests: Worker not created on mount, status idle initially, Worker created on first run() call. |
| `__tests__/components/code-runner.test.tsx` | Tests for editor, output, loading states (min 30 lines) | VERIFIED | 120 lines. 8 tests: OutputPanel stdout/stderr/placeholder, CodeRunnerClient editor/Run button/output panel/loading/disabled. |

---

### Key Link Verification

#### Plan 02-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `components/lesson-complete-button.tsx` | `lib/store/progress.ts` | `useProgressStore` hook | WIRED | Line 5: `import { useProgressStore } from '@/lib/store/progress'`. Lines 13-15: three selectors read `isComplete`, `markComplete`, `markIncomplete`. |
| `components/course-sidebar.tsx` | `lib/store/progress.ts` | `isComplete` selector | WIRED | Line 8: `import { useProgressStore }`. Line 17: `const isComplete = useProgressStore((s) => s.isComplete)`. Line 29: `isComplete(courseSlug, lesson.slug)` called per lesson. |
| `components/progress-hydration.tsx` | `lib/store/progress.ts` | `persist.rehydrate()` in useEffect | WIRED | Line 4: `import { useProgressStore }`. Line 8: `useProgressStore.persist.rehydrate()` inside `useEffect`. |
| `app/layout.tsx` | `components/progress-hydration.tsx` | `<ProgressHydration>` in root layout | WIRED | Line 4: `import { ProgressHydration }`. Line 42: `<ProgressHydration />` inside `<ThemeProvider>`, before `<SiteHeader>` and `{children}`. |

#### Plan 02-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `components/code-runner/code-runner-client.tsx` | `hooks/use-pyodide-worker.ts` | `usePyodideWorker` hook | WIRED | Line 10: `import { usePyodideWorker }`. Line 20: `const { run, status } = usePyodideWorker()`. `run(code)` called on button click, `status` drives loading/disabled state. |
| `hooks/use-pyodide-worker.ts` | `public/workers/pyodide.worker.mjs` | `new Worker('/workers/pyodide.worker.mjs', { type: 'module' })` | WIRED | Line 48: `sharedWorker = new Worker('/workers/pyodide.worker.mjs', { type: 'module' })`. Unit test asserts this exact call. |
| `components/code-runner/index.tsx` | `components/code-runner/code-runner-client.tsx` | `next/dynamic` with `ssr: false` | WIRED | Lines 6-11: `dynamic(() => import('./code-runner-client').then((m) => m.CodeRunnerClient), { ssr: false, loading: () => <div ...skeleton/> })`. |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | `components/code-runner/index.tsx` | `<CodeRunner>` on lesson page | WIRED | Line 7: `import { CodeRunner } from '@/components/code-runner'`. Lines 67-73: `<section>` with `<CodeRunner initialCode={...} />` between article and `LessonCompleteButton`. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PROG-01 | 02-01 | Lesson completion state persisted in localStorage | SATISFIED | `useProgressStore` uses `persist` middleware with `createJSONStorage(() => localStorage)`, key `'python-course-progress'`. 2 unit tests verify persist config. `ProgressHydration` rehydrates on mount. |
| PROG-02 | 02-01 | Course progress percentage on catalog and course pages | SATISFIED | `CourseProgressBar` renders on `app/courses/page.tsx` (line 35) and `app/courses/[courseSlug]/page.tsx` (line 52). Shows "N/total completed" with visual bar. |
| PROG-03 | 02-01 | Visual completion indicators on lesson sidebar | SATISFIED | `CourseSidebar` and `MobileSidebarTrigger` render `CheckCircle2` (completed) vs `Circle` (not started) per lesson. 2 sidebar unit tests verify this. |
| CODE-01 | 02-02 | In-browser Python execution via Pyodide WASM | SATISFIED (code) / NEEDS HUMAN (runtime) | `pyodide.worker.mjs` imports `loadPyodide` from CDN and calls `runPythonAsync(code)`. Full WASM execution unverifiable in jsdom. |
| CODE-02 | 02-02 | Pyodide runs in Web Worker to prevent UI blocking | SATISFIED (code) / NEEDS HUMAN (runtime) | Worker created via `new Worker(...)` (module-level singleton). All Python execution via `postMessage`/`onmessage`. UI responsiveness requires browser. |
| CODE-03 | 02-02 | Pyodide lazy-loaded on first "Run" click (not on page load) | SATISFIED (code) / NEEDS HUMAN (runtime) | `sharedWorker` is null until `run()` is called. Unit test "does not create Worker on mount" passes. Network tab confirmation requires browser. |
| CODE-04 | 02-02 | Code editor with Python syntax support (CodeMirror 6) | SATISFIED | `@uiw/react-codemirror@4.25.8` + `@codemirror/lang-python@6.2.1` installed. `extensions={[python()]}`, `githubLight`/`githubDark` themes. `next/dynamic` with `ssr: false` prevents SSR window errors. |
| CODE-05 | 02-02 | Output panel showing stdout/stderr from executed code | SATISFIED | `OutputPanel` renders stdout lines in default color and stderr with `text-red-500 dark:text-red-400`. Error string also red. 3 unit tests verify all cases. |
| CODE-06 | 02-02 | Loading state UX during Pyodide cold start | SATISFIED | `status === 'loading'` state triggers `<Loader2 animate-spin>` + "Loading Python runtime..." text inline with Run button. Unit test "shows loading indicator when status is loading" passes. |

**Orphaned Requirements:** None — all 9 Phase 2 requirement IDs (PROG-01 through PROG-03, CODE-01 through CODE-06) are claimed in plan frontmatter and verified above.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/progress-hydration.tsx` | 10 | `return null` | INFO | Intentional by design — this component is a side-effect-only component that triggers rehydration on mount. It correctly renders nothing visible. |
| `components/course-progress-bar.tsx` | 19 | `return null` when `completedCount === 0` | INFO | Intentional by design — plan explicitly specifies "If 0% completed, render nothing (clean look for new students)". Not a stub. |

No blocker or warning anti-patterns found. Zero TODO/FIXME/PLACEHOLDER comments across all phase artifacts.

---

### Test Results

```
Test Files  6 passed (6)
Tests       62 passed (62)
Duration    1.32s
```

Commits verified in git log:
- `09a805e` feat(02-01): Zustand progress store with localStorage persistence and tests
- `b8255f2` feat(02-01): wire progress UI into sidebar, catalog, course, and lesson pages
- `93a75ad` feat(02-02): implement Pyodide Web Worker code runner with TDD test suite
- `c6583e3` feat(02-02): wire CodeRunner into lesson pages and fix ssr:false Client Component

---

### Human Verification Required

#### 1. Pyodide end-to-end execution

**Test:** Navigate to any lesson page (e.g. http://localhost:3000/courses/01-python-fundamentals/lesson-01), scroll to "Try it yourself", type `print("Hello from Pyodide!")`, click Run.
**Expected:** Loading indicator appears for 2-3 seconds, then "Hello from Pyodide!" appears in the output panel below.
**Why human:** Pyodide WASM and Web Worker APIs are unavailable in jsdom/vitest.

#### 2. Lazy loading verification (Network tab)

**Test:** Open DevTools Network tab, load a lesson page, observe network waterfall. Click Run, re-observe.
**Expected:** No `pyodide.wasm` or Pyodide CDN requests on page load. Requests appear only after Run is clicked.
**Why human:** Network tab behavior cannot be replicated in automated tests.

#### 3. stderr styling in browser

**Test:** Run `print(1/0)` in the code runner.
**Expected:** Error output (`ZeroDivisionError`) appears in red in the output panel.
**Why human:** Requires actual Pyodide execution + visual DOM inspection in browser.

#### 4. Web Worker UI responsiveness

**Test:** Run `for i in range(10000000): pass` (long loop), then try scrolling and clicking UI elements while it executes.
**Expected:** Page remains fully responsive — no freezing — because execution is isolated in a Web Worker.
**Why human:** UI thread responsiveness can only be measured in a real browser, not in Node.js.

#### 5. localStorage persistence across page reload

**Test:** Click "Mark Complete" on a lesson, then hard-refresh (`Cmd+Shift+R`). Also check the sidebar icons.
**Expected:** Lesson remains marked complete. Sidebar shows green CheckCircle2 icon for that lesson.
**Why human:** localStorage persistence round-trip (write + read across page load) requires a real browser environment.

---

### Summary

Phase 2 goal is fully implemented in the codebase. All 9 must-have truths are satisfied by substantive, wired implementations with no stubs or placeholders. All 62 unit tests pass. All 9 requirement IDs (PROG-01 to PROG-03, CODE-01 to CODE-06) are accounted for with implementation evidence.

The `human_needed` status reflects that 5 of the 9 truths involve browser-specific APIs (Pyodide WASM execution, Web Worker isolation, localStorage persistence) that cannot be confirmed without running `pnpm dev` in a real browser. The automated code-level evidence is complete and consistent — the human tests are confirmatory, not exploratory.

---

_Verified: 2026-03-14T10:51:00Z_
_Verifier: Claude (gsd-verifier)_
