---
phase: 08-data-platform-features
plan: "02"
subsystem: ui
tags: [pyodide, pandas, dataframe, html-renderer, csv-datasets, output-panel, web-worker]

requires:
  - phase: 08-data-platform-features
    plan: "01"
    provides: pandas micropip install, pandasReady singleton, RunStatus with 'installing'

provides:
  - DataFrame last-expression renders as styled HTML table in OutputPanel
  - Series/Index last-expression renders as readable str() text
  - Scalar last-expression renders as repr() text
  - public/data/students.csv bundled and mounted into Pyodide FS as /data/students.csv
  - OutputLine type extended with 'html' union member
  - OutputPanel renders 'html' OutputLines via dangerouslySetInnerHTML with .df-output scoped CSS

affects:
  - 08-03-data-platform-features (Phase 9 content — can use pd.read_csv('data/students.csv'))
  - All PracticeBlock components that run pandas code

tech-stack:
  added: []
  patterns:
    - "pyodide.globals.set('_user_src', code) before harness — eliminates all string escaping issues vs template literal interpolation"
    - "AST-based last-expression detection: parse with mode='exec', check if last node is Expr, split into statements + expression, compile separately"
    - "ensureDatasetsMounted singleton: pyodide._datasetsMounted flag prevents re-mounting on every run"
    - "pandasReady !== null guard: skips DataFrame/Series type checks for non-pandas code paths — zero overhead"
    - "dangerouslySetInnerHTML scoped via .df-output wrapper: CSS custom properties for theme-aware table styles"

key-files:
  created:
    - public/data/students.csv
  modified:
    - public/workers/pyodide.worker.mjs
    - hooks/use-pyodide-worker.ts
    - components/code-runner/output-panel.tsx
    - __tests__/components/code-runner.test.tsx

key-decisions:
  - "Use pyodide.globals.set() to pass user code — avoids backslash/triple-quote escaping in harness string interpolation"
  - "pandas type check gated on pandasReady !== null — non-pandas code never imports pandas just to check types"
  - "dangerouslySetInnerHTML is safe here: HTML is exclusively from pandas.DataFrame.to_html() inside Pyodide sandbox, not user-controlled HTML"
  - "scoped CSS via <style> tag in OutputPanel rather than global Tailwind — avoids dynamic className complexity on pandas-generated HTML"

requirements-completed:
  - DATA-02
  - DATA-03
  - DATA-04
  - DATA-05

duration: 10min
completed: 2026-03-15
---

# Phase 8 Plan 02: DataFrame HTML renderer + OutputPanel html type + bundled CSV datasets Summary

**Pyodide worker extended with AST-based output detection that serializes DataFrame last-expressions as HTML tables, mounts bundled CSV datasets (students.csv) into the Pyodide filesystem, and OutputPanel upgraded to render 'html' OutputLines as scoped styled tables**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-14T17:13:00Z
- **Completed:** 2026-03-14T17:23:45Z
- **Tasks:** 2 (TDD)
- **Files modified:** 4
- **Files created:** 1

## Accomplishments

- Extended `pyodide.worker.mjs` with `ensureDatasetsMounted()` — fetches CSV files from the worker origin and writes them to the Pyodide FS (`/data/students.csv`); uses a `_datasetsMounted` flag to run only once per worker lifetime
- Replaced bare `runPythonAsync(code)` with an AST-based harness that detects the last expression, executes it separately, and returns it as `_result` in `pyodide.globals`
- Worker inspects `_result`: DataFrame → `to_html()` → `{ type: 'html' }` output; Series/Index → `str()` → `{ type: 'stdout' }`; scalar → `repr()` → `{ type: 'stdout' }`; None → no extra output line
- Created `public/data/students.csv` with 20 rows, columns `name,age,score,grade`, realistic values (age 19-25, score 55.0-98.5, grades A/B/C/D)
- Extended `OutputLine` type in `use-pyodide-worker.ts` to `'stdout' | 'stderr' | 'html'` and exported it as a named type
- Updated `OutputPanel` to render `html` OutputLines via `dangerouslySetInnerHTML` with `.df-output` wrapper; scoped CSS via `<style>` tag using CSS custom properties for theme-aware table styling
- Added 5 new tests covering: HTML table rendering via `dangerouslySetInnerHTML`, no-escape verification, `.df-output` wrapper presence, stdout regression, stderr regression

## Task Commits

1. **Tasks 1 + 2: Worker harness + CSV dataset + OutputPanel html type + tests** - `81a26a6` (feat)

## Final OutputLine Type Definition

```typescript
// hooks/use-pyodide-worker.ts
export type OutputLine = { type: 'stdout' | 'stderr' | 'html'; line: string }
export type RunResult = {
  output: OutputLine[]
  error: string | null
}
```

## Pyodide FS Mount Pattern

The worker calls `ensureDatasetsMounted(pyodide)` before executing user code. This pattern:

1. Checks `pyodide._datasetsMounted` — skips if already mounted (singleton across runs)
2. Calls `pyodide.FS.mkdir('/data')` — safe if directory already exists (try/catch)
3. Fetches each dataset from the worker origin via `fetch('/data/<filename>')`
4. Writes to Pyodide FS via `pyodide.FS.writeFile('/data/<filename>', text)`

Files mounted as `/data/students.csv` are accessible in Python as:
```python
pd.read_csv('data/students.csv')   # CWD is / in Pyodide
```

## Adding a New Bundled Dataset

1. Add the CSV file to `public/data/` (e.g., `public/data/sales.csv`)
2. Add the filename to the `datasets` array in `ensureDatasetsMounted()` in `public/workers/pyodide.worker.mjs`:
   ```js
   const datasets = ['students.csv', 'sales.csv']
   ```
3. Students can then use `pd.read_csv('data/sales.csv')` in any PracticeBlock

No other changes required — the mount logic iterates over the array automatically.

## Worker Output Detection Flow

```
User code → pyodide.globals.set('_user_src', code)
         → AST harness: parse → split statements vs last-expression → execute
         → _result = eval(last_expression) | None

_result == None       → no extra output line
_result is DataFrame  → to_html(classes='df-table', border=0, max_rows=50)
                      → output.push({ type: 'html', line: html_string })
_result is Series/Index → str(_result)
                        → output.push({ type: 'stdout', line: str_repr })
_result is other value → repr(_result)
                       → output.push({ type: 'stdout', line: repr_str })

pandasReady === null (non-pandas code):
  _result is any value → repr(_result) → output.push({ type: 'stdout' })
```

## Files Created/Modified

- `public/workers/pyodide.worker.mjs` - Added `ensureDatasetsMounted()`, AST-based output detection harness, DataFrame/Series/scalar serialization with pandas type checks
- `hooks/use-pyodide-worker.ts` - Extended `OutputLine` type to include `'html'`; exported as named type `OutputLine`
- `components/code-runner/output-panel.tsx` - Added `html` OutputLine branch rendering via `dangerouslySetInnerHTML`; scoped CSS via `<style>` tag with `.df-output` wrapper
- `public/data/students.csv` - Bundled CSV dataset: 20 rows, columns name/age/score/grade, used in Phase 9 pandas exercises
- `__tests__/components/code-runner.test.tsx` - Added 5 new OutputPanel HTML rendering tests

## Test Results

- **Before:** 228 tests (9 in code-runner.test.tsx)
- **After:** 277 tests (14 in code-runner.test.tsx), 0 failures
- **New tests added:** 5 (OutputPanel HTML rendering suite)

## Decisions Made

- **pyodide.globals.set() over string interpolation**: Setting `_user_src` as a globals variable before the harness eliminates all backslash and triple-quote escaping edge cases — cleaner and safer for arbitrary user code
- **pandasReady guard for type checks**: Type checking for DataFrame/Series only happens when `pandasReady !== null` (pandas was already installed) — non-pandas code never triggers a pandas import just to check types
- **dangerouslySetInnerHTML is safe**: HTML comes exclusively from `pandas.DataFrame.to_html()` running inside the Pyodide WebAssembly sandbox — users write Python not HTML, so this is equivalent to rendering sanitized content
- **Scoped CSS via style tag**: Using a `<style>` tag with `.df-output` wrapper instead of Tailwind classes — pandas generates standard HTML table structure without Tailwind classes, so dynamic class injection would not work

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None beyond the scope of this plan.

## User Setup Required

None - no external service configuration required. CSV datasets are fetched from the app's own origin.

## Next Phase Readiness

- `pd.read_csv('data/students.csv')` works in any PracticeBlock — Phase 9 content can use it immediately
- Bare DataFrame variable in a code block renders as a styled HTML table — the core pandas workflow works end-to-end
- Pattern for adding more datasets documented above — content authors can extend without touching hook or component code
- OutputLine type is exported from `use-pyodide-worker.ts` for consumer use if needed

---
*Phase: 08-data-platform-features*
*Completed: 2026-03-15*
