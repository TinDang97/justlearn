---
phase: 1
slug: content-reading-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | CONT-01 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | CONT-02 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | CONT-03 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | CONT-04 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | LAYO-01 | manual | visual | N/A | ⬜ pending |
| 1-02-02 | 02 | 2 | LAYO-02 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | LAYO-03 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-02-04 | 02 | 2 | LAYO-04 | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-02-05 | 02 | 2 | LAYO-05 | manual | visual (375px) | N/A | ⬜ pending |
| 1-02-06 | 02 | 2 | LAYO-06 | manual | visual | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` — test framework setup
- [ ] `__tests__/lib/content.test.ts` — content parsing tests
- [ ] `__tests__/components/` — component rendering tests

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Medium-quality typography | LAYO-01 | Visual design quality | Verify 65-75 char line width, 1.75 line-height in browser |
| Mobile responsive at 375px | LAYO-05 | Device viewport testing | Open in Chrome DevTools at 375px, verify no horizontal overflow |
| Dark mode no FOUC | LAYO-06 | Requires page reload observation | Set dark mode, refresh page, verify no white flash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
