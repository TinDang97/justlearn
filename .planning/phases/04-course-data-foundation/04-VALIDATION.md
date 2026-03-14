---
phase: 4
slug: course-data-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STRUCT-04 | unit | `pnpm test -- __tests__/lib/progress-store.test.ts` | Partial | ⬜ pending |
| 04-01-02 | 01 | 1 | STRUCT-04 | unit | `pnpm test -- __tests__/lib/progress-store.test.ts` | Partial | ⬜ pending |
| 04-02-01 | 02 | 1 | STRUCT-01 | unit | `pnpm test -- __tests__/lib/content.test.ts` | Partial | ⬜ pending |
| 04-02-02 | 02 | 1 | STRUCT-01 | unit | `pnpm test -- __tests__/lib/content.test.ts` | Partial | ⬜ pending |
| 04-02-03 | 02 | 1 | STRUCT-01 | unit | `pnpm test -- __tests__/lib/content.test.ts` | Yes | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] New `describe('migration v0 → v1', ...)` block in `__tests__/lib/progress-store.test.ts`
- [ ] New `describe('getUnifiedCourse', ...)` block in `__tests__/lib/content.test.ts`
- [ ] `lib/section-map.ts` needs a test verifying all 12 slugs are present and orders are 1–12

*Existing infrastructure covers test framework setup — Vitest, localStorage mock, `@/` path alias all in place.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| localStorage migration preserves real browser data | STRUCT-04 | Requires real browser with existing progress | Open app in browser with existing progress, verify lessons still show as completed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
