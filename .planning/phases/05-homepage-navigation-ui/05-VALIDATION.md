---
phase: 5
slug: homepage-navigation-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.0 + @testing-library/react ^16.3.2 |
| **Config file** | `vitest.config.ts` |
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
| 05-01-01 | 01 | 1 | HOME-01 | unit | `pnpm test -- __tests__/components/hero-section.test.tsx` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | HOME-03, HOME-04 | unit | `pnpm test -- __tests__/components/site-header.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | HOME-02 | unit | `pnpm test -- __tests__/components/section-cards-grid.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | STRUCT-02 | unit | `pnpm test -- __tests__/components/course-overview-accordion.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | STRUCT-03 | unit | `pnpm test -- __tests__/components/course-sidebar.test.tsx` | ✅ update | ⬜ pending |
| 05-02-04 | 02 | 1 | STRUCT-05 | unit | `pnpm test -- __tests__/components/lesson-breadcrumb.test.tsx` | ✅ update | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/components/hero-section.test.tsx` — covers HOME-01
- [ ] `__tests__/components/section-cards-grid.test.tsx` — covers HOME-02
- [ ] `__tests__/components/site-header.test.tsx` — covers HOME-03 (conditional CTA)
- [ ] `__tests__/lib/use-scrolled.test.ts` — covers HOME-04 (hook unit test)
- [ ] `__tests__/components/course-overview-accordion.test.tsx` — covers STRUCT-02
- [ ] `__tests__/components/course-sidebar.test.tsx` — EXISTS, needs update for sections prop
- [ ] `__tests__/components/lesson-breadcrumb.test.tsx` — EXISTS, needs update for 4-level hierarchy

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Header blur appears on scroll | HOME-04 | CSS visual effect | Scroll down on any page, verify header gains backdrop blur |
| Section cards show real progress | HOME-02 | Requires localStorage state | Complete a lesson, verify section card shows progress bar |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
