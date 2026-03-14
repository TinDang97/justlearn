---
phase: 3
slug: differentiators-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x with jsdom + @testing-library/react |
| **Config file** | `vitest.config.ts` (existing) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | MIND-01 | unit | `pnpm test -- --reporter=verbose __tests__/components/mindmap.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | MIND-02 | unit | `pnpm test -- --reporter=verbose __tests__/lib/mindmap-data.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | MIND-03 | unit | `pnpm test -- --reporter=verbose __tests__/components/mindmap.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | MIND-04 | unit | `pnpm test -- --reporter=verbose __tests__/components/mindmap.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | SRCH-01 | unit | `pnpm test -- --reporter=verbose __tests__/lib/search.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | SRCH-02 | unit | `pnpm test -- --reporter=verbose __tests__/lib/search.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | SRCH-03 | unit | `pnpm test -- --reporter=verbose __tests__/components/search-dialog.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 1 | NBLM-01 | unit | `pnpm test -- --reporter=verbose __tests__/components/notebook-lm-card.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 1 | NBLM-02 | unit | `pnpm test -- --reporter=verbose __tests__/components/notebook-lm-card.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 1 | NBLM-03 | manual | N/A | N/A | ⬜ pending |
| 03-03-04 | 03 | 1 | ANIM-01 | unit | `pnpm test -- --reporter=verbose __tests__/components/template.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-05 | 03 | 1 | ANIM-02 | unit | component render tests | ❌ W0 | ⬜ pending |
| 03-03-06 | 03 | 1 | ANIM-03 | unit | `pnpm test -- --reporter=verbose __tests__/components/mindmap.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/components/mindmap.test.tsx` — stubs for MIND-01, MIND-03, MIND-04, ANIM-03
- [ ] `__tests__/lib/mindmap-data.test.ts` — stubs for MIND-02
- [ ] `__tests__/lib/search.test.ts` — stubs for SRCH-01, SRCH-02
- [ ] `__tests__/components/search-dialog.test.tsx` — stubs for SRCH-03
- [ ] `__tests__/components/notebook-lm-card.test.tsx` — stubs for NBLM-01, NBLM-02
- [ ] `__tests__/components/template.test.tsx` — stubs for ANIM-01
- [ ] `pnpm add @xyflow/react @dagrejs/dagre motion fuse.js` — dependencies installed before Wave 1

*Existing infrastructure covers test framework (Vitest + jsdom already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 12 NotebookLM notebooks created and shared publicly | NBLM-03 | Requires manual Google account interaction | 1. Create notebooks in NotebookLM UI 2. Upload course MD files 3. Enable public sharing 4. Record URLs in `lib/notebook-urls.ts` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
