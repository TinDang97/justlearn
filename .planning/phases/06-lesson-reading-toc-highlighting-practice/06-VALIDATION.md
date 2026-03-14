---
phase: 6
slug: lesson-reading-toc-highlighting-practice
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green + `pnpm build` succeeds
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | READ-01..04 | unit+build | `pnpm test && pnpm build` | Partial | ⬜ pending |
| 06-01-02 | 01 | 1 | READ-05 | unit | `pnpm test -- __tests__/components/callout.test.tsx` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | CHUNK-01, CHUNK-02 | unit | `pnpm test -- __tests__/components/lesson-toc.test.tsx __tests__/lib/content.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 1 | CHUNK-03, CHUNK-04 | unit | `pnpm test -- __tests__/components/scroll-progress.test.tsx __tests__/components/mdx-hr-override.test.tsx` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 1 | CODE-07..10 | unit+build | `pnpm test -- __tests__/components/copy-button.test.tsx __tests__/components/mdx-pre-override.test.tsx && pnpm build` | ❌ W0 | ⬜ pending |
| 06-04-01 | 04 | 1 | PRACT-01, PRACT-02 | unit | `pnpm test -- __tests__/components/practice-block.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/components/callout.test.tsx` — covers READ-05
- [ ] `__tests__/components/lesson-toc.test.tsx` — covers CHUNK-01, CHUNK-02 (mock IntersectionObserver)
- [ ] `__tests__/components/scroll-progress.test.tsx` — covers CHUNK-03
- [ ] `__tests__/components/mdx-hr-override.test.tsx` — covers CHUNK-04
- [ ] `__tests__/components/mdx-pre-override.test.tsx` — covers CODE-07
- [ ] `__tests__/components/copy-button.test.tsx` — covers CODE-08
- [ ] `__tests__/components/practice-block.test.tsx` — covers PRACT-01, PRACT-02
- [ ] Add `extractHeadings` test cases to `__tests__/lib/content.test.ts` — covers CHUNK-01

**Note:** `IntersectionObserver` is not in jsdom — must mock with `vi.stubGlobal('IntersectionObserver', MockIO)`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Warm palette visual correctness | READ-01 | CSS visual effect | Open lesson in light+dark mode, compare against design spec |
| Body text 18px rendering | READ-02 | CSS sizing | Inspect element, verify computed font-size |
| Blockquote green border | READ-04 | CSS visual | Open a lesson with blockquotes, verify green border |
| Shiki transformers render diff/highlight | CODE-09, CODE-10 | Requires MD content with `[!code]` annotations | Add test annotations to a lesson, verify visual output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
