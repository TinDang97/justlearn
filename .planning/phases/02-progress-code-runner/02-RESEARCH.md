# Phase 2: Progress + Code Runner — Research

**Researched:** 2026-03-14
**Domain:** Zustand persist middleware (localStorage), Pyodide WASM (Web Worker), CodeMirror 6 (Python editor)
**Confidence:** HIGH (Zustand), MEDIUM (Pyodide/Next.js integration), HIGH (CodeMirror 6)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROG-01 | Lesson completion state persisted in localStorage | Zustand v5 `persist` middleware with `createJSONStorage(() => localStorage)`; key shape `{ completedLessons: Record<courseSlug, lessonSlug[]> }` |
| PROG-02 | Course progress percentage on catalog and course pages | Computed selector from Zustand store: `completedLessons[courseSlug].length / totalLessons * 100`; consumed in Client Components |
| PROG-03 | Sidebar visual indicators: completed / in-progress / not-started | `CourseSidebar` already a Client Component using `usePathname`; extend to read Zustand store and render status icons |
| CODE-01 | In-browser Python execution via Pyodide WASM | Pyodide 0.29.3 loaded from CDN inside a Web Worker; no server required |
| CODE-02 | Pyodide in Web Worker to prevent UI blocking | Worker loaded as public static asset via `new Worker('/workers/pyodide.worker.js')` |
| CODE-03 | Pyodide lazy-loaded on first "Run" click | Worker instantiated inside a React ref on button click; `loadPyodide()` promise cached in worker |
| CODE-04 | Code editor with Python syntax (CodeMirror 6) | `@uiw/react-codemirror` + `@codemirror/lang-python`; dynamically imported (`next/dynamic`, `ssr: false`) |
| CODE-05 | Output panel showing stdout/stderr | Pyodide `setStdout({ batched })` / `setStderr({ batched })` callbacks; output accumulated and sent via `postMessage` |
| CODE-06 | Loading state UX during Pyodide cold start | React state `'idle' | 'loading' | 'ready' | 'running'`; spinner overlay on Run button during load |
</phase_requirements>

---

## Summary

Phase 2 splits into two independent concerns: client-side learning progress (Zustand + localStorage) and in-browser Python execution (Pyodide in a Web Worker, edited with CodeMirror 6).

For progress tracking, Zustand v5 with the built-in `persist` middleware is the standard. The one non-trivial concern is **hydration**: Next.js renders on the server with initial Zustand state, then the client re-hydrates from localStorage, producing a brief mismatch if components render state immediately. The correct solution is `skipHydration: true` in the persist config combined with a manual `rehydrate()` call in a client-side `useEffect`, or using `useStore` with a `_hasHydrated` guard in the hook layer. This is well-understood and has a clean TypeScript pattern.

For the code runner, the documented Next.js/Pyodide integration path via `@pyodide/webpack-plugin` has known unresolved compatibility issues with Next.js 14+. The **CDN + public static worker** approach is the proven alternative: write the worker as a plain `.mjs` file in `public/workers/`, load Pyodide from `cdn.jsdelivr.net` inside the worker via `import`, and instantiate it with `new Worker('/workers/pyodide.worker.mjs', { type: 'module' })` from a Client Component. This entirely bypasses webpack and the SSR environment-detection error. CodeMirror 6 (`@uiw/react-codemirror`) must be dynamically imported with `ssr: false` because it accesses `window` at load time.

**Primary recommendation:** Zustand `persist` + `skipHydration` pattern for progress; CDN-loaded Pyodide in a `public/workers/*.mjs` Web Worker for the code runner; `@uiw/react-codemirror` with `next/dynamic` for the editor.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.x (current 5.0.10+) | Progress state + persist | Minimal API, native `useSyncExternalStore`, first-class Next.js App Router support |
| pyodide | 0.29.3 (CDN) | In-browser Python WASM | Only viable WASM Python runtime with numpy/stdlib; runs in Web Worker |
| @uiw/react-codemirror | ^4.23.x | Python code editor | CodeMirror 6 wrapper with best React DX; handles EditorView lifecycle |
| @codemirror/lang-python | ^6.x | Python syntax in editor | Official CodeMirror language package |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @uiw/codemirror-theme-github | ^4.x | Match site dark/light themes | Project uses GitHub themes in Shiki; matching editor theme is consistent |
| zustand/middleware (persist) | (bundled with zustand) | localStorage persistence | Included with zustand; no separate install |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @uiw/react-codemirror | bare @codemirror/* | Raw CM6 requires 200+ lines of EditorView setup; @uiw handles React lifecycle correctly |
| CDN worker approach | @pyodide/webpack-plugin | webpack plugin has unresolved Next.js 14+ compatibility issues; CDN worker works today |
| Zustand persist | jotai-storage, valtio | Zustand persist is already the industry standard for Next.js; no reason to switch |

**Installation:**
```bash
pnpm add zustand @uiw/react-codemirror @codemirror/lang-python @uiw/codemirror-theme-github
```

Pyodide is loaded from CDN inside the worker — no `pnpm add pyodide` required.

---

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── store/
│   └── progress.ts          # Zustand store definition + types
components/
├── course-sidebar.tsx        # EXISTING — extend to read progress store
├── progress-hydration.tsx    # Client component that calls rehydrate() on mount
├── code-runner/
│   ├── index.tsx             # CodeRunner container (dynamically imported)
│   ├── editor.tsx            # CodeMirror editor (ssr: false wrapper)
│   └── output-panel.tsx      # stdout/stderr display
public/
└── workers/
    └── pyodide.worker.mjs    # Self-contained Pyodide worker (ESM, no bundler)
```

### Pattern 1: Zustand Progress Store with `skipHydration`

**What:** Persist middleware with `skipHydration: true` prevents server/client HTML mismatch. A root Client Component calls `rehydrate()` after mount.

**When to use:** Any time Zustand persisted state is read during SSR in Next.js App Router.

```typescript
// lib/store/progress.ts
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ProgressState = {
  // courseSlug -> Set<lessonSlug>
  completedLessons: Record<string, string[]>
  markComplete: (courseSlug: string, lessonSlug: string) => void
  markIncomplete: (courseSlug: string, lessonSlug: string) => void
  isComplete: (courseSlug: string, lessonSlug: string) => boolean
  getCourseProgress: (courseSlug: string, totalLessons: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      markComplete: (courseSlug, lessonSlug) =>
        set((s) => {
          const existing = s.completedLessons[courseSlug] ?? []
          if (existing.includes(lessonSlug)) return s
          return {
            completedLessons: {
              ...s.completedLessons,
              [courseSlug]: [...existing, lessonSlug],
            },
          }
        }),
      markIncomplete: (courseSlug, lessonSlug) =>
        set((s) => ({
          completedLessons: {
            ...s.completedLessons,
            [courseSlug]: (s.completedLessons[courseSlug] ?? []).filter(
              (s) => s !== lessonSlug
            ),
          },
        })),
      isComplete: (courseSlug, lessonSlug) =>
        (get().completedLessons[courseSlug] ?? []).includes(lessonSlug),
      getCourseProgress: (courseSlug, totalLessons) => {
        if (totalLessons === 0) return 0
        const done = (get().completedLessons[courseSlug] ?? []).length
        return Math.round((done / totalLessons) * 100)
      },
    }),
    {
      name: 'python-course-progress',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,  // prevents SSR mismatch
    }
  )
)
```

```typescript
// components/progress-hydration.tsx
// Must be a Client Component placed in root layout or course layout
'use client'
import { useEffect } from 'react'
import { useProgressStore } from '@/lib/store/progress'

export function ProgressHydration() {
  useEffect(() => {
    useProgressStore.persist.rehydrate()
  }, [])
  return null
}
```

### Pattern 2: Pyodide Web Worker (CDN, public/workers)

**What:** A plain ESM worker file placed in `public/workers/` loads Pyodide from CDN, caches the instance, and handles run requests via `postMessage`.

**When to use:** Required for CODE-01/02/03 — never load Pyodide on the main thread or in a server context.

```javascript
// public/workers/pyodide.worker.mjs
// Source: https://pyodide.org/en/stable/usage/webworker.html
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.mjs'

// Cache the promise — re-used across all run requests (CODE-03: lazy load)
let pyodideReady = null

self.onmessage = async (event) => {
  const { id, code } = event.data

  if (!pyodideReady) {
    pyodideReady = loadPyodide()
  }

  const pyodide = await pyodideReady

  const output = []
  pyodide.setStdout({ batched: (line) => output.push({ type: 'stdout', line }) })
  pyodide.setStderr({ batched: (line) => output.push({ type: 'stderr', line }) })

  try {
    await pyodide.runPythonAsync(code)
    self.postMessage({ id, output, error: null })
  } catch (err) {
    self.postMessage({ id, output, error: err.message })
  }
}
```

```typescript
// hooks/use-pyodide-worker.ts  (simplified)
// Instantiated lazily via ref on first Run click (CODE-03)
'use client'
import { useRef, useState, useCallback } from 'react'

type RunStatus = 'idle' | 'loading' | 'ready' | 'running'

export function usePyodideWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [status, setStatus] = useState<RunStatus>('idle')
  const reqId = useRef(0)

  const run = useCallback((code: string): Promise<{ output: { type: string; line: string }[]; error: string | null }> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        setStatus('loading')
        workerRef.current = new Worker('/workers/pyodide.worker.mjs', { type: 'module' })
        workerRef.current.onmessage = (e) => {
          setStatus('ready')
          resolve(e.data)
        }
      }
      const id = ++reqId.current
      setStatus('running')
      workerRef.current.postMessage({ id, code })
      workerRef.current.onmessage = (e) => {
        if (e.data.id !== id) return
        setStatus('ready')
        resolve(e.data)
      }
    })
  }, [])

  return { run, status }
}
```

### Pattern 3: CodeMirror 6 with `next/dynamic` (SSR disabled)

**What:** CodeMirror accesses `window` and DOM APIs at import time. Next.js dynamic import with `ssr: false` prevents server-side execution.

**When to use:** Any CodeMirror component in Next.js App Router.

```typescript
// components/code-runner/index.tsx
import dynamic from 'next/dynamic'

const CodeRunnerClient = dynamic(
  () => import('./code-runner-client'),
  { ssr: false, loading: () => <div className="h-40 animate-pulse bg-muted rounded" /> }
)

export function CodeRunner({ initialCode }: { initialCode: string }) {
  return <CodeRunnerClient initialCode={initialCode} />
}
```

```typescript
// components/code-runner/code-runner-client.tsx
'use client'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { useTheme } from 'next-themes'

export function CodeRunnerClient({ initialCode }: { initialCode: string }) {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? githubDark : githubLight

  return (
    <CodeMirror
      value={initialCode}
      extensions={[python()]}
      theme={theme}
    />
  )
}
```

### Anti-Patterns to Avoid

- **Importing Pyodide directly in a component or lib file:** Next.js will attempt server-side evaluation. The "Cannot determine runtime environment" error is the result. Pyodide MUST live in a Worker.
- **Calling `new Worker(new URL('./worker.ts', import.meta.url))`:** This is webpack-bundled workers. It conflicts with Pyodide's dynamic imports. Use the `public/workers/` CDN pattern instead.
- **Eager-loading Pyodide on page mount:** Pyodide WASM is ~30MB. The requirement explicitly demands lazy load on first Run click (CODE-03). Never `useEffect(() => loadWorker(), [])`.
- **Reading Zustand persisted state in Server Components:** Zustand is client-only. Pass course/lesson metadata as props from Server Components; read completion state in Client Components.
- **`mergeDeep` conflicts in Zustand v5:** v5 removed initial-state-in-persist. Ensure the store shape is flat enough that default `Object.assign` merge works without custom `merge` function.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage serialization/versioning | Custom `window.localStorage` reads on mount | `zustand/persist` middleware | Handles versioning, migrations, partial state, storage errors |
| Python editor with syntax highlight | `<textarea>` or contentEditable | `@uiw/react-codemirror` | Tab indentation, undo/redo, selection, bracket matching — 500+ lines of CM6 glue code |
| Worker message correlation | Custom ID mapping | Pattern shown above (reqId ref + onmessage swap) | Minimal, no extra dep; Comlink also works but adds 1KB |
| stdout/stderr capture | `sys.stdout = io.StringIO()` in Python | `pyodide.setStdout({ batched })` | JavaScript-side API; survives multiple `runPythonAsync` calls cleanly |

**Key insight:** Pyodide's stdout/stderr must be configured on the **JavaScript side** with `setStdout/setStderr`, not via Python redirects, because each `runPythonAsync` call resets internal stdout state inconsistently.

---

## Common Pitfalls

### Pitfall 1: SSR "Cannot determine runtime environment"
**What goes wrong:** `import { loadPyodide } from 'pyodide'` anywhere in the Next.js module graph (even a lib file) causes Pyodide's runtime detection to run on the server where browser globals are absent.
**Why it happens:** Next.js pre-renders/compiles all imports server-side.
**How to avoid:** Never import `pyodide` npm package. Use the CDN ESM URL exclusively inside the `.mjs` worker file in `public/workers/`.
**Warning signs:** `Cannot determine runtime environment` in build output or server logs.

### Pitfall 2: Zustand Hydration Mismatch
**What goes wrong:** Server renders "0 completed" while client localStorage shows "5 completed" — React throws hydration error or shows wrong state on first paint.
**Why it happens:** Zustand persist reads localStorage only on the client, but React compares server HTML to client HTML.
**How to avoid:** Set `skipHydration: true` in persist options; call `useProgressStore.persist.rehydrate()` in a `useEffect` inside a root-level Client Component.
**Warning signs:** React console warning "Hydration failed because the initial UI does not match what was rendered on the server."

### Pitfall 3: Worker Not Found (404) in Next.js
**What goes wrong:** `new Worker('/workers/pyodide.worker.mjs')` returns 404 in development.
**Why it happens:** Files in `public/` are served at root, but path must match exactly including subdirectory.
**How to avoid:** Place worker at `public/workers/pyodide.worker.mjs` and reference as `/workers/pyodide.worker.mjs`. Verify in browser devtools Network tab during dev.
**Warning signs:** `Failed to construct 'Worker': Script at ... cannot be accessed` in console.

### Pitfall 4: Pyodide Loads on Every Run (no caching)
**What goes wrong:** Each "Run" click re-downloads Pyodide WASM (~30MB) and re-initializes the runtime.
**Why it happens:** Worker is recreated or `loadPyodide()` is called unconditionally inside `onmessage`.
**How to avoid:** The worker initializes `let pyodideReady = null` at module scope. On first message, set `pyodideReady = loadPyodide()`. Subsequent messages `await` the same promise.
**Warning signs:** 3s+ delay on every run, visible in Network tab as repeated WASM downloads.

### Pitfall 5: CodeMirror SSR Crash
**What goes wrong:** `ReferenceError: window is not defined` during Next.js build.
**Why it happens:** `@uiw/react-codemirror` imports CodeMirror which accesses `window` immediately.
**How to avoid:** Wrap every CodeMirror usage in `next/dynamic` with `{ ssr: false }`.
**Warning signs:** Build-time error mentioning `window`, `document`, or `EditorView`.

### Pitfall 6: Zustand v5 `useShallow` requirement
**What goes wrong:** Selecting an array/object slice from the store causes infinite re-renders.
**Why it happens:** Zustand v5 removed custom equality function from `create`. Array selectors return new references on every call.
**How to avoid:** Use `useShallow` from `zustand/shallow` when selecting arrays: `const lessons = useProgressStore(useShallow(s => s.completedLessons[courseSlug]))`.
**Warning signs:** Component renders in a loop; React DevTools shows component re-rendering without state change.

---

## Code Examples

Verified patterns from official sources:

### Pyodide stdout/stderr capture
```javascript
// Source: https://pyodide.org/en/stable/usage/streams.html
pyodide.setStdout({ batched: (line) => output.push({ type: 'stdout', line }) })
pyodide.setStderr({ batched: (line) => output.push({ type: 'stderr', line }) })
// 'batched' receives complete lines (newline stripped) or flushed partial lines
```

### Zustand persist + skipHydration
```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
persist(stateCreator, {
  name: 'storage-key',
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
})
// Then in a 'use client' component:
useEffect(() => { useStore.persist.rehydrate() }, [])
```

### Worker singleton instantiation (lazy)
```typescript
// Instantiate worker only when Run is first clicked
const workerRef = useRef<Worker | null>(null)
// On click:
if (!workerRef.current) {
  workerRef.current = new Worker('/workers/pyodide.worker.mjs', { type: 'module' })
}
```

### CourseSidebar completion indicator extension
```typescript
// CourseSidebar is already 'use client' with usePathname
// Extend by reading the progress store (no additional 'use client' needed)
const isComplete = useProgressStore(s => s.isComplete)
// Per lesson item:
isComplete(courseSlug, lesson.slug) // boolean
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `use-sync-external-store` polyfill in Zustand | Native React `useSyncExternalStore` | Zustand v5 (Oct 2024) | Smaller bundle; requires React 18+ |
| `persist` stored initial state | `persist` only stores changes from initial | Zustand v5 + v4.5.5 | Store initial state must be correct defaults; no phantom initial values |
| `webworker.js` included in Pyodide dist | Removed in Pyodide 0.27.0 | Nov 2023 | Must write the worker from scratch (not a copy of shipped file) |
| `importScripts` in worker | `import` (ESM) in `.mjs` worker | Pyodide 0.21+ | `{ type: 'module' }` worker syntax; `importScripts` still works but ESM preferred |

**Deprecated/outdated:**
- `@pyodide/webpack-plugin`: Unresolved Next.js 14+ compatibility; avoid entirely.
- Zustand `create` with second argument equality function: removed in v5; use `createWithEqualityFn` if needed.

---

## Open Questions

1. **Worker CORS in production**
   - What we know: CDN (`cdn.jsdelivr.net`) is cross-origin; modern browsers allow cross-origin module workers.
   - What's unclear: Some browser security policies may block cross-origin workers in production. Not yet verified against the actual deployment target.
   - Recommendation: Test in Chrome/Firefox/Safari with the CDN URL. If blocked, self-host Pyodide via `public/pyodide/` directory (add to `.gitignore`, download in CI).

2. **Pyodide cold start on mobile**
   - What we know: ~2-3s on desktop (documented). Mobile may be 5-10s.
   - What's unclear: Target audience device profile unknown.
   - Recommendation: Show a persistent loading bar rather than a timeout-based UX. Acceptable per requirements (CODE-06 just requires "clear loading indicator").

3. **Multiple code runners on same lesson page**
   - What we know: The worker is instantiated once per hook call.
   - What's unclear: If a lesson has 3 code blocks, 3 workers would load (3x WASM download).
   - Recommendation: Move worker to a module-level singleton (outside React, shared across all hook instances). Plan 02-02 should address this.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test -- --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROG-01 | `markComplete` persists lessonSlug and survives store re-read | unit | `pnpm test -- __tests__/lib/progress-store.test.ts -t "markComplete"` | ❌ Wave 0 |
| PROG-01 | `markIncomplete` removes lessonSlug | unit | `pnpm test -- __tests__/lib/progress-store.test.ts -t "markIncomplete"` | ❌ Wave 0 |
| PROG-02 | `getCourseProgress` returns correct percentage | unit | `pnpm test -- __tests__/lib/progress-store.test.ts -t "getCourseProgress"` | ❌ Wave 0 |
| PROG-03 | CourseSidebar renders completed icon for complete lesson | unit | `pnpm test -- __tests__/components/course-sidebar.test.tsx -t "completed"` | ❌ Wave 0 (extend existing) |
| CODE-01 | Worker runs Python and returns stdout | smoke (manual) | Manual browser test — Pyodide WASM not available in jsdom | manual-only |
| CODE-02 | Worker postMessage does not block main thread | smoke (manual) | Requires browser Worker API not available in vitest/jsdom | manual-only |
| CODE-03 | Worker is not created until Run is clicked | unit | `pnpm test -- __tests__/hooks/use-pyodide-worker.test.ts -t "lazy"` | ❌ Wave 0 |
| CODE-04 | CodeMirror renders with Python language extension | unit | `pnpm test -- __tests__/components/code-runner.test.tsx -t "renders editor"` | ❌ Wave 0 |
| CODE-05 | Output panel displays stdout/stderr from mock worker | unit | `pnpm test -- __tests__/components/code-runner.test.tsx -t "output panel"` | ❌ Wave 0 |
| CODE-06 | Loading indicator shown while status is 'loading' | unit | `pnpm test -- __tests__/components/code-runner.test.tsx -t "loading state"` | ❌ Wave 0 |

**Manual-only justification (CODE-01, CODE-02):** Pyodide loads WASM from CDN inside a Web Worker. Neither jsdom nor vitest supports `Worker` or `WebAssembly`. These must be verified by running `pnpm dev` and executing Python code in the browser.

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test -- --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/lib/progress-store.test.ts` — covers PROG-01, PROG-02 (mock `localStorage` with `vitest.stubGlobal`)
- [ ] `__tests__/hooks/use-pyodide-worker.test.ts` — covers CODE-03 (mock `Worker` constructor, assert not called before Run click)
- [ ] `__tests__/components/code-runner.test.tsx` — covers CODE-04, CODE-05, CODE-06 (mock worker, test UI states)
- [ ] Extend `__tests__/components/course-sidebar.test.tsx` — covers PROG-03 (mock `useProgressStore`, assert completion icons)
- [ ] `localStorage` mock: use `vitest.stubGlobal('localStorage', { getItem, setItem, ... })` in test setup or per-test

---

## Sources

### Primary (HIGH confidence)
- [Pyodide 0.29.3 Web Worker docs](https://pyodide.org/en/stable/usage/webworker.html) — worker architecture, ESM pattern, loadPyodide caching
- [Pyodide 0.29.3 Streams docs](https://pyodide.org/en/stable/usage/streams.html) — `setStdout`/`setStderr` batched handler API
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) — `createJSONStorage`, `skipHydration`, `rehydrate()`
- [Zustand v5 announcement](https://pmnd.rs/blog/announcing-zustand-v5) — breaking changes, React 18 requirement, `useSyncExternalStore`
- [Zustand discussion #2476](https://github.com/pmndrs/zustand/discussions/2476) — Next.js persist pattern with `createJSONStorage`

### Secondary (MEDIUM confidence)
- [GitHub: holdenmatt/use-pyodide](https://github.com/holdenmatt/use-pyodide) — Comlink-based singleton pattern, `setOutput` API
- [Pyodide webpack plugin issue #27](https://github.com/pyodide/pyodide-webpack-plugin/issues/27) — documents webpack plugin limitations with Next.js
- [Pyodide GitHub issue #3893](https://github.com/pyodide/pyodide/issues/3893) — "Cannot determine runtime environment" in Next.js; solution is `'use client'` + worker isolation
- [Next.js web workers 2025 blog](https://medium.com/@sureshdotariya/using-web-workers-in-next-js-2025-without-breaking-rsc-c7b51ef83648) — RSC-safe worker patterns (verified with webpack 5 docs)

### Tertiary (LOW confidence)
- Zustand v5.0.9 `unstable_ssrSafe` middleware — mentioned in WebSearch but not verified with official docs; `skipHydration` is the verified alternative
- Pyodide mobile cold-start timing estimates — community reports, not Pyodide official benchmarks

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Zustand 5/persist and CodeMirror 6 verified via official docs; Pyodide 0.29.3 verified via official docs
- Architecture: HIGH (Zustand), MEDIUM (Pyodide/Next.js) — CDN worker pattern verified by multiple sources; webpack plugin path explicitly broken
- Pitfalls: HIGH — hydration mismatch and SSR environment error both have GitHub issue trails with confirmed solutions

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable libraries; Pyodide releases frequently but 0.29.3 API is stable)
