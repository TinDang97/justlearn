---
phase: quick-260317-vhc
verified: 2026-03-18T08:22:00Z
status: gaps_found
score: 4/5 must-haves verified
re_verification: false
gaps:
  - truth: "Navigating to /courses/ai-code-agents shows the course overview page with sections and lesson list"
    status: partial
    reason: "Course registry, buildAIAgentsCourse(), and page wiring are all correct. However 3 unit tests that now fail due to the new course entry being added will cause `pnpm test` quality gate to fail if run before a commit, surfacing the course as broken-pipeline even though the runtime behavior is correct."
    artifacts:
      - path: "__tests__/lib/course-registry.test.ts"
        issue: "Test at line 90 asserts getAllRegisteredCourses returns exactly 2 entries; now returns 3. Test at line 95-99 asserts sorted slugs equal ['data-engineering', 'python']; now must equal ['ai-code-agents', 'data-engineering', 'python']."
      - path: "__tests__/lib/content.test.ts"
        issue: "Test at line 267 asserts getAllRegisteredCourses via content.ts re-export returns 2 entries; now returns 3."
    missing:
      - "Update __tests__/lib/course-registry.test.ts: 'returns exactly 2 entries' → 3; sorted slugs assertion to include 'ai-code-agents'; add assertion for 'ai-code-agents' entry having correct title"
      - "Update __tests__/lib/content.test.ts: 'returns 2 entries' → 3"
  - truth: "Content quality: each lesson 400-800 lines of rich educational prose"
    status: failed
    reason: "Plan specifies 400-800 lines per lesson. All 39 lessons fall short: range is 122-332 lines. Median is approximately 200 lines. While content is substantive (not stubs — real prose, correct format, code examples), it is significantly below the specified content density target."
    artifacts:
      - path: "courses/ai-code-agents/01-introduction/lesson-01-what-are-ai-code-agents.md"
        issue: "125 lines — plan requires 400-800 lines"
      - path: "courses/ai-code-agents/03-agent-api-sdk/lesson-21-building-an-agent-loop.md"
        issue: "296 lines — plan requires 400-800 lines"
      - path: "courses/ai-code-agents/05-real-world-projects/lesson-39-course-review-and-next-steps.md"
        issue: "148 lines — plan requires 400-800 lines"
    missing:
      - "Expand all 39 lesson files to 400-800 lines each with additional Parts, sub-sections, code examples, Common Mistakes / Gotchas sections, and Key Takeaways sections as specified in the plan"
human_verification:
  - test: "Navigate to http://localhost:3000 after pnpm dev"
    expected: "Homepage shows 3 course cards: Python (blue), Data Engineering (emerald), AI Code Agents with Claude (violet)"
    why_human: "Visual catalog rendering cannot be verified programmatically — registry wiring is confirmed but card display requires browser"
  - test: "Navigate to /courses/ai-code-agents — click Lesson 8 (Your Learning Path) and press Next"
    expected: "Navigation crosses section boundary to Lesson 9 (Installing Claude Code) in Section 2"
    why_human: "Cross-section prev/next logic is in buildAIAgentsCourse() and verified structurally, but actual link rendering and click behavior requires browser"
---

# Quick Task 260317-vhc: AI Code Agents Course — Verification Report

**Task Goal:** New course of AI code agents with Claude — /agent-api in use
**Verified:** 2026-03-18T08:22:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Navigating to /courses/ai-code-agents shows course overview with sections and lesson list | PARTIAL | Page wiring correct; `generateStaticParams` calls `getAllRegisteredCourses()` which returns ai-code-agents; `buildAIAgentsCourse()` reads all 5 section dirs and 39 lessons. Blocked by 3 failing unit tests that assert old 2-course count. |
| 2 | Navigating to a lesson renders with sidebar, ToC, and navigation | VERIFIED | `app/courses/[courseSlug]/[lessonSlug]/page.tsx` uses `getAllRegisteredCourses()` for static params; lesson metadata (prev/next) is globally computed in `buildAIAgentsCourse()`. |
| 3 | Homepage course catalog displays AI Code Agents alongside Python and Data Engineering | VERIFIED | `CourseCatalog` calls `getAllRegisteredCourses()` from `lib/content` re-export; registry has all 3 entries with correct slugs, titles, colors. Human confirmation needed for visual rendering. |
| 4 | Prev/next navigation works across section boundaries | VERIFIED | `buildAIAgentsCourse()` computes `allFlat` across all sections before assigning prev/next globally — same pattern as `buildDECourse()`. Lesson 8 next = `lesson-09-installing-claude-code`. |
| 5 | AI Code Agents course has AI persona named 'Nova' configured | VERIFIED | `COURSE_REGISTRY['ai-code-agents'].aiPersona.name === 'Nova'` confirmed in `lib/course-registry.ts` line 275. `modelId` and `systemPrompt` present. |

**Score:** 4/5 truths verified (Truth 1 partial due to test failures; Truth 5 on content density failed)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/course-registry.ts` | AI Code Agents registry entry with buildAIAgentsCourse | VERIFIED | Contains `ai-code-agents` key, `buildAIAgentsCourse()`, Nova persona, `bg-violet-500`, `contentDir: 'courses/ai-code-agents'` |
| `courses/ai-code-agents/README.md` | Course-level README with description and prerequisites | VERIFIED | Contains "AI Code Agents with Claude", Level, Prerequisites, Course Description, 5-section table |
| `courses/ai-code-agents/01-introduction/README.md` | Section 1 README with lesson list | VERIFIED | Contains "Section 1: Introduction to AI Code Agents", lesson table with 8 entries |
| `courses/ai-code-agents/01-introduction/lesson-01-what-are-ai-code-agents.md` | First lesson content | VERIFIED (content thin) | Contains `# Lesson 1: What Are AI Code Agents?`, correct metadata line, 4 Parts with real prose — but only 125 lines vs 400-800 spec |
| `scripts/generate-rag-index.ts` | Updated RAG script supporting ai-code-agents | VERIFIED | `extractCourseSlug()` has `if (normalized.includes('/ai-code-agents/')) return 'ai-code-agents'`; `extractSectionSlug()` handles ai-code-agents; `chunkByHeadings()` uses `courseLabels` lookup object with `'ai-code-agents': 'AI Code Agents'` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/course-registry.ts` | `courses/ai-code-agents/` | `buildAIAgentsCourse` reads directory | WIRED | `fs.readdirSync(courseDir)` iterates section dirs, `lesson-*.md` filter confirmed |
| `app/courses/[courseSlug]/page.tsx` | `lib/course-registry.ts` | `generateStaticParams` calls `getAllRegisteredCourses` | WIRED | Line 13: `return getAllRegisteredCourses().map((c) => ({ courseSlug: c.slug }))` |
| `scripts/generate-rag-index.ts` | `courses/ai-code-agents/` | glob + `extractCourseSlug` maps to ai-code-agents | WIRED | `glob('courses/**/*.md')` + `extractCourseSlug` if-chain returns `'ai-code-agents'` for matching paths |
| `components/homepage/course-catalog.tsx` | `lib/course-registry.ts` | `getAllRegisteredCourses()` via content re-export | WIRED | Line 1: imports from `@/lib/content`; line 5: `const courses = getAllRegisteredCourses()` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| QUICK-260317-VHC | 260317-vhc-PLAN.md | New AI Code Agents course with Claude | PARTIALLY SATISFIED | Course registered, 39 lessons created, RAG updated — but tests stale and lesson content below specified density |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `__tests__/lib/course-registry.test.ts` | 90-93 | `expect(courses).toHaveLength(2)` — stale count | BLOCKER | `pnpm test` fails; quality gate broken |
| `__tests__/lib/course-registry.test.ts` | 95-99 | `expect(slugs).toEqual(['data-engineering', 'python'])` — missing ai-code-agents | BLOCKER | `pnpm test` fails |
| `__tests__/lib/content.test.ts` | 267-270 | `expect(courses).toHaveLength(2)` — stale count | BLOCKER | `pnpm test` fails |
| All 39 lesson files | — | Lesson line counts 122-332 vs 400-800 spec | WARNING | Content exists but below specified educational depth |

### Human Verification Required

#### 1. Homepage 3-course catalog display

**Test:** Run `pnpm dev`, navigate to http://localhost:3000
**Expected:** Three course cards visible — Python (blue), Data Engineering (emerald), AI Code Agents with Claude (violet accent)
**Why human:** Visual card rendering and Tailwind class application requires browser

#### 2. Cross-section prev/next navigation

**Test:** Navigate to /courses/ai-code-agents, open Lesson 8 (Your Learning Path), click Next
**Expected:** Navigates to Lesson 9 (Installing Claude Code) which is in Section 2
**Why human:** Link click behavior and actual URL routing requires browser

### Gaps Summary

Two gaps block full goal achievement:

**Gap 1 — Stale tests (3 failures):** When the `ai-code-agents` course was added to `COURSE_REGISTRY`, three unit tests that hard-code the expected count of 2 courses and the sorted slug list were not updated. These tests fail on `pnpm test`, which violates the project's quality gate requirement. The course itself works at runtime; only the test assertions are stale. Fix is straightforward: update the count from 2 to 3 and add `'ai-code-agents'` to the slug expectation array.

**Gap 2 — Lesson content density:** The plan specifies 400-800 lines per lesson with 3-5 major Parts, subsections, Common Mistakes sections, code examples, and Key Takeaways. All 39 lessons are 122-332 lines — the highest is 332 (lesson-24-multi-turn-conversations). Content is substantive and correctly formatted, but falls well short of the specified density. This matters because the course's educational value is proportional to content depth; users comparing this to the data-engineering course (which meets the density spec) will find it thin. Whether this constitutes a blocker vs. warning depends on whether the plan's line-count spec was a hard requirement or a guideline.

---

_Verified: 2026-03-18T08:22:00Z_
_Verifier: Claude (gsd-verifier)_
