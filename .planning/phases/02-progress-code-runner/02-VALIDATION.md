---
phase: 2
slug: progress-code-runner
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + @testing-library/react 16.x |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test -- --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test -- --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PROG-01 | unit | `pnpm test -- __tests__/lib/progress-store.test.ts -t "markComplete"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PROG-01 | unit | `pnpm test -- __tests__/lib/progress-store.test.ts -t "markIncomplete"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | PROG-02 | unit | `pnpm test -- __tests__/lib/progress-store.test.ts -t "getCourseProgress"` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | PROG-03 | unit | `pnpm test -- __tests__/components/course-sidebar.test.tsx -t "completed"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | CODE-01 | manual | Manual browser test — Pyodide WASM not in jsdom | N/A | ⬜ pending |
| 02-02-02 | 02 | 1 | CODE-02 | manual | Manual browser test — Worker API not in vitest | N/A | ⬜ pending |
| 02-02-03 | 02 | 1 | CODE-03 | unit | `pnpm test -- __tests__/hooks/use-pyodide-worker.test.ts -t "lazy"` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | CODE-04 | unit | `pnpm test -- __tests__/components/code-runner.test.tsx -t "renders editor"` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | CODE-05 | unit | `pnpm test -- __tests__/components/code-runner.test.tsx -t "output panel"` | ❌ W0 | ⬜ pending |
| 02-02-06 | 02 | 1 | CODE-06 | unit | `pnpm test -- __tests__/components/code-runner.test.tsx -t "loading state"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/lib/progress-store.test.ts` — stubs for PROG-01, PROG-02 (mock localStorage with `vitest.stubGlobal`)
- [ ] `__tests__/hooks/use-pyodide-worker.test.ts` — stubs for CODE-03 (mock Worker constructor)
- [ ] `__tests__/components/code-runner.test.tsx` — stubs for CODE-04, CODE-05, CODE-06 (mock worker, test UI states)
- [ ] Extend `__tests__/components/course-sidebar.test.tsx` — stubs for PROG-03 (mock useProgressStore)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Python code executes in browser and returns stdout | CODE-01 | Pyodide WASM cannot load in jsdom/vitest | 1. `pnpm dev` 2. Navigate to lesson with code block 3. Type `print("hello")` 4. Click Run 5. Verify "hello" appears in output panel |
| Worker execution doesn't block UI | CODE-02 | Requires real browser Worker API | 1. Run a long Python loop 2. Verify lesson content remains scrollable during execution |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
