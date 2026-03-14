---
phase: 08-data-platform-features
plan: "01"
subsystem: ui
tags: [pyodide, pandas, micropip, web-worker, react-hook, loading-state]

requires:
  - phase: 07-multi-course-infrastructure
    provides: Pyodide worker and usePyodideWorker hook foundation

provides:
  - pandas install via micropip in Pyodide web worker (singleton, installs once per worker lifetime)
  - RunStatus 'installing' state for granular loading feedback
  - "Installing pandas..." loading label in CodeRunnerClient and ExerciseRunner
  - Worker message protocol: { id, status: 'installing' } status message before final { id, output, error }

affects:
  - 08-02-data-platform-features (DataFrame renderer — will use RunStatus and same worker)
  - future lessons with `import pandas as pd` practice blocks

tech-stack:
  added: []
  patterns:
    - "pandasReady singleton: module-level Promise<void> in worker prevents double-install across concurrent messages"
    - "Two-phase worker messages: intermediate status messages (no resolve) + final result message (resolves Promise)"
    - "needsPandas() regex helper: /import\\s+pandas|from\\s+pandas\\s+import/ detects both import styles"

key-files:
  created: []
  modified:
    - public/workers/pyodide.worker.mjs
    - hooks/use-pyodide-worker.ts
    - components/code-runner/code-runner-client.tsx
    - components/code-runner/exercise-runner.tsx
    - __tests__/hooks/use-pyodide-worker.test.ts
    - __tests__/components/code-runner.test.tsx

key-decisions:
  - "Use pyodide.loadPackage('micropip') then runPythonAsync to install pandas — avoids JS/Python async event loop interop issues with direct micropip JS API"
  - "pandasReady singleton at worker module scope — concurrent pandas runs await the same promise, no double install"
  - "Status message shape { id, status: 'installing' } is distinct from final message (no output/error fields) — hook discriminates by presence of 'status' key"
  - "MockWorker refactored to class-based pattern in tests — vi.fn() cannot be used as constructor with new Worker()"

patterns-established:
  - "Worker status signalling: intermediate messages carry { id, status } only; final messages carry { id, output, error }"
  - "Hook message discrimination: check 'status' in data before destructuring output/error"

requirements-completed:
  - DATA-01

duration: 15min
completed: 2026-03-15
---

# Phase 8 Plan 01: Pandas micropip install + loading indicator Summary

**Pyodide web worker extended with one-time micropip pandas install and 'installing' RunStatus state, giving users "Installing pandas..." feedback during the 3-8s CDN install instead of a frozen loader**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-15T00:17:00Z
- **Completed:** 2026-03-15T00:19:30Z
- **Tasks:** 2 (TDD)
- **Files modified:** 6

## Accomplishments

- Extended `pyodide.worker.mjs` with `pandasReady` singleton — pandas installs exactly once per worker lifetime via `micropip.install('pandas')`; concurrent pandas runs await the same promise
- Added `needsPandas()` helper detecting both `import pandas` and `from pandas import` patterns; non-pandas code paths have zero micropip overhead
- Extended `RunStatus` to `'idle' | 'loading' | 'installing' | 'ready' | 'running'` and updated hook `onmessage` to handle intermediate status messages without resolving the pending Promise
- Updated loading labels in `CodeRunnerClient` and `ExerciseRunner` to show "Installing pandas..." vs "Loading Python runtime..." based on status
- Added 6 new tests (hook tests + component tests) covering installing transition, promise non-resolution on status message, final message resolution, unknown-id graceful ignore, and non-pandas path

## Task Commits

1. **Tasks 1 + 2: Worker micropip + RunStatus hook + UI loading labels** - `50c0992` (feat)

## Worker Message Protocol

```
Worker → Hook (intermediate, during pandas install):
{ id: number, status: 'installing' }
→ Hook sets status = 'installing', does NOT resolve run() Promise

Worker → Hook (final result):
{ id: number, output: OutputLine[], error: string | null }
→ Hook resolves run() Promise, sets status = 'ready'

Worker → Hook (non-pandas code):
{ id: number, output: OutputLine[], error: string | null }
→ Only one message, no intermediate status message
```

## RunStatus Type (for Plan 02 reference)

```typescript
export type RunStatus = 'idle' | 'loading' | 'installing' | 'ready' | 'running'
```

## Files Created/Modified

- `public/workers/pyodide.worker.mjs` - Added `pandasReady` singleton, `needsPandas()` helper, micropip install flow with status signalling
- `hooks/use-pyodide-worker.ts` - Extended `RunStatus` with 'installing', updated `onmessage` to handle status-only messages
- `components/code-runner/code-runner-client.tsx` - Updated loading indicator for 'loading' | 'installing' with two-phase label text
- `components/code-runner/exercise-runner.tsx` - Same loading indicator update as CodeRunnerClient
- `__tests__/hooks/use-pyodide-worker.test.ts` - Refactored MockWorker to class-based pattern; added 5 new tests for installing flow
- `__tests__/components/code-runner.test.tsx` - Added 'installing' to mock type; added "Installing pandas..." display test

## Decisions Made

- **micropip via runPythonAsync, not JS API**: `pyodide.loadPackage('micropip')` then `runPythonAsync("await micropip.install('pandas')")` — avoids the Python/JS async event loop interop issue where calling micropip's JS-exposed API can deadlock Pyodide's event loop
- **pandasReady singleton at module scope**: Concurrent runs both await the same Promise, second install never triggered
- **Status message discriminated by key presence**: `'status' in data` check before destructuring — cleaner than checking for absence of `output`
- **MockWorker as class**: `vi.fn()` instances are not constructors; `new Worker(...)` in production code requires a `class` mock in test

## Pyodide 0.29.3 API Notes

- `pyodide.loadPackage('micropip')` is the correct way to load micropip itself (it's bundled with Pyodide but not auto-loaded)
- After `loadPackage`, micropip must be called from Python via `runPythonAsync` to avoid async event loop issues
- `pyodide.runPythonAsync("import micropip\nawait micropip.install('pandas')")` is the canonical pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MockWorker refactored from vi.fn() to class-based pattern**
- **Found during:** Task 1 (TDD RED phase)
- **Issue:** Existing test used `vi.fn()` as `MockWorker`, but `new Worker(...)` in the hook requires a constructor function. Tests threw "is not a constructor" on instantiation.
- **Fix:** Replaced `vi.fn()` mock with a proper `class MockWorkerClass` with static call tracking fields (`callCount`, `calls`, `mockClear()`).
- **Files modified:** `__tests__/hooks/use-pyodide-worker.test.ts`
- **Verification:** All 7 tests pass; no regressions
- **Committed in:** `50c0992`

---

**Total deviations:** 1 auto-fixed (Rule 1 - test infrastructure bug)
**Impact on plan:** Necessary fix — test suite couldn't run at all without it. No scope creep.

## Issues Encountered

None beyond the MockWorker constructor issue documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- RunStatus with 'installing' is exported and ready for Plan 02 (DataFrame renderer) to consume
- Worker message protocol is established — Plan 02 can extend with new message types following the same discriminated pattern
- pandas install works end-to-end; smoke test: open any PracticeBlock, run `import pandas as pd; print(pd.__version__)`, see "Installing pandas..." then version output
- Blocker cleared: `import pandas as pd` in PracticeBlocks will no longer raise `ModuleNotFoundError`

---
*Phase: 08-data-platform-features*
*Completed: 2026-03-15*
