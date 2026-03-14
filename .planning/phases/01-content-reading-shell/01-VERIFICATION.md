---
phase: 01-content-reading-shell
verified: 2026-03-14T09:51:00Z
status: passed
score: 12/12 must-haves verified
human_verification:
  - test: "Visual reading layout at desktop viewport"
    expected: "Medium-inspired 65-75 char line width with 1.75 line-height is comfortable to read"
    why_human: "Typography quality requires subjective visual judgment; cannot verify aesthetics programmatically"
  - test: "Dark mode FOUC on page refresh"
    expected: "No white flash when refreshing any page in dark mode"
    why_human: "FOUC prevention requires real browser render; the blocking script exists and is wired but actual flash suppression cannot be verified via static analysis"
  - test: "Mobile layout at 375px viewport"
    expected: "No horizontal overflow/scrollbar; sidebar hidden; hamburger opens Sheet drawer; code blocks scroll horizontally within their container"
    why_human: "Responsive layout correctness requires browser viewport testing; CSS class presence is verifiable but visual behavior is not"
  - test: "Copy-to-clipboard on code blocks"
    expected: "Hover over a code block and a copy button appears; clicking it copies code to clipboard"
    why_human: "navigator.clipboard.writeText behavior requires a real browser with clipboard API"
  - test: "Active lesson highlight in sidebar"
    expected: "Current lesson link shows bg-accent and font-medium; other lessons show muted foreground"
    why_human: "usePathname-driven active state requires a running app; static analysis confirms the logic is correct but not the visual result"
---

# Phase 1: Content + Reading Shell Verification Report

**Phase Goal:** Students can read any of the 120+ lessons with syntax-highlighted code, navigate the full course structure, and toggle dark/light mode — all served statically with no backend
**Verified:** 2026-03-14T09:51:00Z
**Status:** passed (with human verification items)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Success Criteria from ROADMAP.md

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | Student can browse course catalog and see all 12 courses with lesson counts and descriptions | VERIFIED | `app/courses/page.tsx` calls `getAllCourses()`, renders 12 Cards with `course.lessonCount` badge and `course.description` |
| 2 | Student can open any lesson and read Python code blocks with syntax highlighting and copy them to clipboard | VERIFIED | Lesson page dynamically imports `.md` via Shiki pipeline; `mdx-components.tsx` wraps `pre` with `CopyButton`; `copy-button.tsx` uses `navigator.clipboard.writeText` |
| 3 | Student can navigate between lessons using course sidebar and previous/next controls, with breadcrumb showing location | VERIFIED | `CourseSidebar` renders all lessons; `LessonNav` renders prev/next from `LessonMeta`; `LessonBreadcrumb` renders 3-level path |
| 4 | Student can switch between dark and light mode with no white flash (FOUC-free) on any device | VERIFIED (automated) / HUMAN (visual) | Blocking `<script>` in `<head>` reads `localStorage` before React hydrates; `suppressHydrationWarning` on `<html>` |
| 5 | Layout is readable and correct at 375px viewport width with no horizontal overflow | VERIFIED (automated) / HUMAN (visual) | `flex-1 min-w-0` on main content; `overflow-x: auto` on `.prose pre`; `lg:hidden` sidebar |

**Score:** 5/5 success criteria structurally verified

---

### Observable Truths (from Plan must_haves)

#### Plan 01-01 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `lib/content.ts` parses all 12 course directories and extracts metadata from inline bold text | VERIFIED | `COURSES_DIR` reads 12 dirs; `TITLE_REGEX` + `META_REGEX` parse inline bold; 20 passing tests confirm 12 courses / 122 lessons parsed correctly |
| 2 | MDX pipeline compiles `.md` files with Shiki syntax highlighting at build time | VERIFIED | `next.config.mjs` uses `createMDX` with `extension: /\.(md|mdx)$/`, `rehypePrettyCode` with dual Shiki themes |
| 3 | Copy button component renders on code blocks with clipboard API | VERIFIED | `copy-button.tsx` is `use client`, uses `navigator.clipboard.writeText`, imported and conditionally rendered in `mdx-components.tsx` |
| 4 | Dark mode toggle works without FOUC via blocking script in head | VERIFIED (automated) | `app/layout.tsx` line 25-37: inline `<script>` reads `localStorage` and applies theme class before React hydrates |
| 5 | Test suite runs and passes for content parsing logic | VERIFIED | `pnpm test` result: 32 passed (3 test files) |

#### Plan 01-02 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Course catalog page displays all 12 courses as cards with title, description, lesson count, and level | VERIFIED | `app/courses/page.tsx` maps `getAllCourses()` result into `Card` components with `CardTitle`, `CardDescription`, lesson count `Badge`, level `Badge` |
| 2 | Each course page lists all its lessons with titles and descriptions | VERIFIED | `app/courses/[courseSlug]/page.tsx` maps `course.lessons` into ordered list with title, duration, level badge |
| 3 | Each lesson page renders the full MDX content with syntax-highlighted Python code | VERIFIED | `app/courses/[courseSlug]/[lessonSlug]/page.tsx` dynamic imports `@/courses/${courseSlug}/${lessonSlug}.md`, renders in `prose prose-neutral dark:prose-invert` article |
| 4 | All routes are statically generated via `generateStaticParams` | VERIFIED | Both `[courseSlug]/page.tsx` and `[courseSlug]/[lessonSlug]/page.tsx` export `generateStaticParams` + `dynamicParams = false` |

#### Plan 01-03 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Reading layout has Medium-inspired typography with 65-75 char line width and 1.75 line-height | VERIFIED | `app/globals.css` sets `.prose { line-height: 1.75 }`; lesson page uses `max-w-[65ch]` container |
| 2 | Course sidebar shows all lessons with active lesson highlighted | VERIFIED | `course-sidebar.tsx` maps `lessons.map()` with `usePathname()` active check applying `bg-accent font-medium` |
| 3 | Sidebar collapses to a slide-in Sheet drawer on mobile | VERIFIED | `mobile-sidebar-trigger.tsx` is `use client`, uses shadcn `Sheet` with `side="left"`, `onClick={() => setOpen(false)}` on each link |
| 4 | Previous/next navigation appears at bottom of each lesson | VERIFIED | `lesson-nav.tsx` renders prev/next `Button` components; null-safe (`prevLesson &&`, `nextLesson &&`) |
| 5 | Breadcrumb shows Home > Course > Lesson path | VERIFIED | `lesson-breadcrumb.tsx` renders 3-level shadcn `Breadcrumb` with links to `/courses` and `/courses/${courseSlug}` |
| 6 | Dark/light mode toggle works with no white flash on page load | VERIFIED (automated) / HUMAN (visual) | `ThemeToggle` in `SiteHeader` wired to `next-themes`; blocking script in root layout |
| 7 | Layout has no horizontal overflow at 375px viewport width | VERIFIED (automated) / HUMAN (visual) | `flex-1 min-w-0` on main area; `overflow-x: auto` on `.prose pre`; sidebar `hidden lg:block` |

**Score:** 12/12 truths structurally verified

---

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/content.ts` | VERIFIED | 119 lines; exports `getAllCourses`, `getCourse`, `getLesson`, `Course`, `LessonMeta`; uses `COURSES_DIR` + regex parsing |
| `next.config.mjs` | VERIFIED | `createMDX` with `extension: /\.(md|mdx)$/`; Shiki dual-theme `rehypePrettyCode`; `extractRawCode`/`forwardRawCode` visitors |
| `mdx-components.tsx` | VERIFIED | `useMDXComponents` export; `pre` override imports and renders `CopyButton`; `code` passthrough |
| `components/copy-button.tsx` | VERIFIED | `use client`; `navigator.clipboard.writeText`; Copy/Check icons with 2s timeout |
| `vitest.config.ts` | VERIFIED | `@vitejs/plugin-react`; `environment: 'jsdom'`; `@ -> .` alias; `setupFiles` wired |
| `__tests__/lib/content.test.ts` | VERIFIED | 20 tests covering all parsing behaviors; passes against real `courses/` directory |
| `app/courses/page.tsx` | VERIFIED | `getAllCourses()` call; responsive grid; shadcn Cards with level/lesson-count badges |
| `app/courses/[courseSlug]/page.tsx` | VERIFIED | `generateStaticParams` + `dynamicParams = false`; `getCourse()` + `notFound()`; lesson list |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | VERIFIED | `generateStaticParams` flatMap; dynamic `.md` import; `LessonBreadcrumb` + `LessonNav` |
| `app/courses/[courseSlug]/layout.tsx` | VERIFIED | Server Component; `getCourse()`; renders `CourseSidebar` + `MobileSidebarTrigger` |
| `components/course-sidebar.tsx` | VERIFIED | `use client`; `lessons.map()`; `usePathname()` active highlight; `hidden lg:block` |
| `components/mobile-sidebar-trigger.tsx` | VERIFIED | `use client`; shadcn `Sheet`; `setOpen(false)` on link click; `usePathname()` active state |
| `components/lesson-nav.tsx` | VERIFIED | `prev`/`next` from `LessonMeta`; null-safe rendering; `ChevronLeft`/`ChevronRight` icons |
| `components/lesson-breadcrumb.tsx` | VERIFIED | `BreadcrumbList` with 3 levels; correct hrefs; `BreadcrumbPage` for current lesson |
| `components/site-header.tsx` | VERIFIED | `ThemeToggle` import and render; sticky `h-16` header; logo links to `/courses` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `next.config.mjs` | `mdx-components.tsx` | `extension: /\.(md|mdx)$/` | WIRED | Line 43: `extension: /\.(md|mdx)$/` in `createMDX` config |
| `mdx-components.tsx` | `components/copy-button.tsx` | `CopyButton` import + render | WIRED | Line 2: import; line 15: `{raw && <CopyButton code={raw} />}` |
| `lib/content.ts` | `courses/` | `fs.readFileSync` via `COURSES_DIR` | WIRED | Line 4: `COURSES_DIR = path.join(process.cwd(), 'courses')`; used in `readdirSync` + `readFileSync` |
| `app/courses/page.tsx` | `lib/content.ts` | `getAllCourses()` call | WIRED | Line 3: import; line 14: `const courses = getAllCourses()` |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | `courses/` | dynamic `.md` import | WIRED | Line 44-46: `await import('@/courses/${courseSlug}/${lessonSlug}.md')` |
| `app/courses/[courseSlug]/layout.tsx` | `components/course-sidebar.tsx` | `CourseSidebar` with lesson data | WIRED | Line 3: import; line 21: `<CourseSidebar courseSlug={courseSlug} lessons={course.lessons} />` |
| `components/mobile-sidebar-trigger.tsx` | `components/ui/sheet.tsx` | shadcn `Sheet` | WIRED | Lines 9-14: imports `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetTrigger` |
| `components/lesson-nav.tsx` | `lib/content.ts` | `prev`/`next` from `LessonMeta` | WIRED | Lines 13-18: `lesson.prev` and `lesson.next` used to find adjacent lessons |

All 8 key links: WIRED

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CONT-01 | 01-01 | Lesson pages render .md files with Shiki syntax highlighting | SATISFIED | MDX pipeline + `rehypePrettyCode` + lesson page dynamic import |
| CONT-02 | 01-02 | Course catalog displays all 12 courses with lesson count and description | SATISFIED | `app/courses/page.tsx` maps `getAllCourses()` with `lessonCount` + `description` |
| CONT-03 | 01-02 | Each course page lists all its lessons with titles and descriptions | SATISFIED | `app/courses/[courseSlug]/page.tsx` maps `course.lessons` with title, duration, level |
| CONT-04 | 01-01 | Code blocks have copy-to-clipboard button | SATISFIED | `copy-button.tsx` wired through `mdx-components.tsx` `pre` override |
| LAYO-01 | 01-03 | Medium-inspired reading layout (65-75 char line width, 1.75 line-height) | SATISFIED | `max-w-[65ch]` on lesson container; `.prose { line-height: 1.75 }` in globals.css |
| LAYO-02 | 01-03 | Course sidebar navigation showing all lessons in current course | SATISFIED | `CourseSidebar` renders `lessons.map()` with active highlight |
| LAYO-03 | 01-03 | Previous/next lesson navigation at bottom of each lesson page | SATISFIED | `LessonNav` renders prev/next with lesson titles |
| LAYO-04 | 01-03 | Breadcrumb navigation (Home > Course > Lesson) | SATISFIED | `LessonBreadcrumb` renders 3-level shadcn Breadcrumb |
| LAYO-05 | 01-03 | Mobile-responsive layout tested at 375px breakpoint | SATISFIED (needs human) | `hidden lg:block` sidebar; `lg:hidden` mobile trigger; `flex-1 min-w-0` main; `overflow-x: auto` pre |
| LAYO-06 | 01-03 | Dark/light mode toggle with no FOUC (blocking script in head) | SATISFIED (needs human) | Blocking `<script>` in `app/layout.tsx` reads localStorage; `suppressHydrationWarning` on `<html>` |

All 10 requirements: SATISFIED

No orphaned requirements — all 10 IDs (CONT-01 through CONT-04, LAYO-01 through LAYO-06) are claimed by plans and implemented.

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `app/courses/[courseSlug]/page.tsx:21` | `return {}` | Info | In `generateMetadata` — correct 404 handling, not a stub |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx:28` | `return {}` | Info | In `generateMetadata` — correct 404 handling, not a stub |

No blockers. No warnings. The two `return {}` instances are appropriate metadata fallbacks for 404 cases.

---

### Human Verification Required

#### 1. Visual Reading Typography

**Test:** Open a lesson page (e.g., `http://localhost:3000/courses/01-python-fundamentals/lesson-01-what-is-programming`) and read a paragraph.
**Expected:** Text spans approximately 65-75 characters per line; line spacing feels comfortable and readable (Medium-quality).
**Why human:** Typography quality is subjective; CSS class presence is verified but visual rendering quality is not.

#### 2. Dark Mode FOUC

**Test:** Open any page in dark mode; hard-refresh the browser (Cmd+Shift+R).
**Expected:** Page loads directly in dark mode with no white flash before theme applies.
**Why human:** FOUC prevention depends on browser timing; the blocking script is present and correct, but actual flash behavior requires a real browser.

#### 3. Mobile Layout at 375px

**Test:** Open Chrome DevTools, set viewport to 375px width, navigate to a lesson page.
**Expected:** No horizontal scrollbar on the page; sidebar is hidden; hamburger icon opens Sheet drawer; code blocks scroll horizontally within their container (not the page).
**Why human:** Responsive CSS correctness requires visual inspection at the actual viewport.

#### 4. Copy-to-Clipboard on Code Blocks

**Test:** Hover over a Python code block on any lesson page; click the copy button.
**Expected:** Copy icon appears on hover; after clicking, a check icon briefly shows; the code is available in clipboard.
**Why human:** `navigator.clipboard` behavior requires a real browser with clipboard API permissions.

#### 5. Active Lesson Sidebar Highlight

**Test:** Navigate to any lesson while observing the left sidebar on desktop.
**Expected:** Current lesson link has distinct background and font-medium weight; all other lessons appear in muted foreground.
**Why human:** usePathname-driven active state requires navigation in a running app to observe.

---

### Overall Assessment

Phase 1 goal is achieved. All structural requirements are in place and working:

- 12 courses and 122 lessons are parsed correctly (32 tests pass)
- All routes statically generated (course catalog + 12 course pages + 122 lesson pages)
- Complete reading shell: header, sidebar, breadcrumbs, prev/next navigation
- MDX pipeline with Shiki dual-theme highlighting active
- FOUC prevention via blocking script
- Mobile responsive layout via CSS classes
- All 10 requirements (CONT-01..04, LAYO-01..06) implemented and traceable

Five items require human visual verification to fully confirm quality, but none represent missing functionality — all supporting code is present, substantive, and wired.

---

_Verified: 2026-03-14T09:51:00Z_
_Verifier: Claude (gsd-verifier)_
