# Architecture Research

**Domain:** Next.js 15 App Router content platform — lesson chunking, course consolidation, homepage redesign, enhanced syntax highlighting (v1.1 integration focus)
**Researched:** 2026-03-14
**Confidence:** HIGH (direct codebase inspection — all existing source files read)

---

## Standard Architecture

### System Overview (Current v1.0)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Build Time (SSG)                            │
│                                                                     │
│  courses/{courseSlug}/lesson-*.md (120 files, 340–500 lines each)  │
│       ↓                                                             │
│  lib/content.ts  → getAllCourses() → Course[] + LessonMeta[]       │
│       ↓                                                             │
│  generateStaticParams → 120 routes (12 courses × ~10 lessons each) │
│       ↓                                                             │
│  @next/mdx pipeline: remark-gfm → rehype-pretty-code → rehypeSlug  │
│       ↓                                                             │
│  Static HTML: /courses/[courseSlug]/[lessonSlug]                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Deploy static assets
┌──────────────────────────────▼──────────────────────────────────────┐
│                      Runtime (Browser)                              │
│                                                                     │
│  ┌────────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ Zustand Progress   │  │ Pyodide Runner   │  │ ReactFlow      │  │
│  │ (localStorage      │  │ (WASM Web Worker)│  │ Mindmap        │  │
│  │  persist)          │  │                  │  │                │  │
│  └────────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  NotebookLM — deep link (no iframe; blocked by CSP)          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities (Current)

| Component | Responsibility | Type |
|-----------|---------------|------|
| `app/page.tsx` | Redirect `/` to `/courses` | Server |
| `app/courses/page.tsx` | Course catalog grid (12 cards) | Server |
| `app/courses/[courseSlug]/layout.tsx` | Sidebar shell + mobile trigger | Server |
| `app/courses/[courseSlug]/page.tsx` | Course overview + flat lesson list | Server |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | Lesson render + exercises + mindmap | Server |
| `lib/content.ts` | FS scan → Course/LessonMeta | Server utility |
| `lib/exercises.ts` | Load JSON per `(courseSlug, lessonSlug)` | Server utility |
| `lib/mindmap-data.ts` | Load JSON per `(courseSlug, lessonSlug)` | Server utility |
| `lib/notebook-urls.ts` | Static map: courseSlug → NotebookLM URL | Config |
| `lib/store/progress.ts` | Zustand + localStorage per courseSlug key | Client |
| `components/course-sidebar.tsx` | Sticky lesson list with completion marks | Client |
| `components/lesson-nav.tsx` | Prev/Next buttons (uses LessonMeta.prev/next) | Server |
| `components/lesson-complete-button.tsx` | Mark lesson done (Zustand) | Client |
| `components/code-runner/` | Pyodide REPL + exercise runner | Client |
| `components/mindmap/` | ReactFlow concept map | Client |
| `components/search/SearchDialog.tsx` | Fuse.js search dialog | Client |
| `components/notebook-lm/NotebookLMCard.tsx` | NotebookLM link card with URL guard | Client |
| `mdx-components.tsx` | Custom `pre`/`code` MDX overrides (CopyButton) | Server-compatible |

---

## Recommended Project Structure (Post-v1.1)

```
app/
├── page.tsx                          # REWRITE: real homepage (remove redirect)
├── layout.tsx                        # UNCHANGED: root shell
├── template.tsx                      # UNCHANGED: Framer Motion page transition
├── globals.css                       # MODIFY: add syntax highlight CSS
└── courses/
    └── [courseSlug]/
        ├── layout.tsx                # MODIFY: pass Section[] to sidebar
        ├── page.tsx                  # MODIFY: section-grouped lesson list
        └── [lessonSlug]/
            └── page.tsx              # MODIFY: 3-col layout + ToC

lib/
├── content.ts                        # MODIFY: Section type, getUnifiedCourse(),
│                                     #         extractHeadings(), sourceCourseSlug
│                                     #         on LessonMeta
├── section-map.ts                    # NEW: maps 12 courseSlug dirs → section metadata
├── exercises.ts                      # UNCHANGED (keyed by sourceCourseSlug)
├── mindmap-data.ts                   # UNCHANGED (keyed by sourceCourseSlug)
├── notebook-urls.ts                  # MODIFY: single 'python' key
├── search.ts                         # UNCHANGED
├── utils.ts                          # UNCHANGED
└── store/
    └── progress.ts                   # MODIFY: migration + unified 'python' key

components/
├── course-sidebar.tsx                # MODIFY: section grouping UI
├── lesson-toc.tsx                    # NEW: sticky in-page ToC (Client)
├── lesson-nav.tsx                    # UNCHANGED (prev/next on LessonMeta)
├── lesson-breadcrumb.tsx             # MODIFY: shows Section > Lesson
├── site-header.tsx                   # MODIFY: logo links to / not /courses
├── hero-section.tsx                  # NEW (or inline in app/page.tsx)
└── ... (all others UNCHANGED)

courses/                              # UNCHANGED directory structure
├── 01-python-fundamentals/           # becomes Section 1 via section-map.ts
├── 02-data-types-variables/
├── ...
└── 12-capstone-best-practices/       # becomes Section 12
```

### Structure Rationale

- **`lib/section-map.ts`:** Single config file decoupling section metadata from the FS layout. Keeps `lib/content.ts` free of hardcoded strings.
- **`lib/content.ts` additions:** All data-model changes land here; routes, components, and stores only consume typed return values — no FS logic escapes this module.
- **`courses/` stays untouched:** 120 lesson files, 120 exercise JSONs, 120 mindmap JSONs. Physical restructuring would require bulk-updating every path reference in exercises.ts, mindmap-data.ts, and the dynamic MDX import.

---

## Architectural Patterns

### Pattern 1: Virtual Course Consolidation via Config Map

**What:** Keep 12 physical course directories unchanged. `lib/section-map.ts` maps each `courseSlug` dir to a section title and display order. `getUnifiedCourse()` in `lib/content.ts` assembles the unified logical course at SSG time by calling the existing `getAllCourses()` and applying the section map.

**When to use:** When FS restructuring would cascade into breaking 120+ file references across exercises, mindmaps, and dynamic MDX imports.

**Trade-offs:** Adds `sourceCourseSlug` to `LessonMeta` (the original 01-... dir needed for FS operations), but avoids bulk migration of content files. All existing tests for `getAllCourses()` remain valid.

**Example:**
```typescript
// lib/section-map.ts (NEW)
export const SECTION_MAP: Record<string, { title: string; order: number }> = {
  '01-python-fundamentals':      { title: 'Fundamentals',             order: 1  },
  '02-data-types-variables':     { title: 'Data Types & Variables',   order: 2  },
  '03-control-flow-logic':       { title: 'Control Flow & Logic',     order: 3  },
  '04-functions-modules':        { title: 'Functions & Modules',      order: 4  },
  '05-data-structures':          { title: 'Data Structures',          order: 5  },
  '06-oop':                      { title: 'Object-Oriented Python',   order: 6  },
  '07-file-handling-exceptions': { title: 'Files & Exceptions',       order: 7  },
  '08-working-with-libraries':   { title: 'Working with Libraries',   order: 8  },
  '09-web-development-basics':   { title: 'Web Development Basics',   order: 9  },
  '10-data-analysis-visualization': { title: 'Data Analysis',        order: 10 },
  '11-automation-scripting':     { title: 'Automation & Scripting',   order: 11 },
  '12-capstone-best-practices':  { title: 'Capstone & Best Practices',order: 12 },
}

// lib/content.ts additions
export type Section = {
  slug: string        // e.g. '01-python-fundamentals'
  title: string       // from SECTION_MAP
  order: number
  lessons: LessonMeta[]
}

export type UnifiedCourse = {
  slug: 'python'
  title: string
  sections: Section[]
  allLessons: LessonMeta[]  // flattened, with global prev/next across section boundaries
}

export function getUnifiedCourse(): UnifiedCourse {
  const rawCourses = getAllCourses()   // reuse existing function unchanged
  const sections: Section[] = rawCourses
    .map((c) => ({
      slug: c.slug,
      title: SECTION_MAP[c.slug]?.title ?? c.title,
      order: SECTION_MAP[c.slug]?.order ?? 99,
      lessons: c.lessons,
    }))
    .sort((a, b) => a.order - b.order)

  const allLessons = sections.flatMap((s) => s.lessons)
  // Recompute prev/next globally across section boundaries
  const linked: LessonMeta[] = allLessons.map((l, i) => ({
    ...l,
    prev: i > 0 ? allLessons[i - 1].slug : null,
    next: i < allLessons.length - 1 ? allLessons[i + 1].slug : null,
  }))

  return { slug: 'python', title: 'Python Course', sections, allLessons: linked }
}
```

### Pattern 2: Server-Side Heading Extraction for In-Page ToC

**What:** The lesson Server Component reads the raw MD file and extracts headings using a regex + `github-slugger` (same algorithm as `rehype-slug`). The heading list is passed as a prop to the client `LessonToc` component. No rehype plugin modification required.

**When to use:** When you need anchor IDs at SSG time that match exactly what `rehype-slug` produces, without adding complexity to the MDX pipeline.

**Trade-offs:** One synchronous FS read per lesson page at build time (negligible for 120 pages at SSG). Requires `github-slugger` as a dependency (already transitively present via rehype-slug, but should be added explicitly).

**Example:**
```typescript
// lib/content.ts — add
import GithubSlugger from 'github-slugger'

export type Heading = { id: string; text: string; level: 2 | 3 }

export function extractHeadings(mdContent: string): Heading[] {
  const slugger = new GithubSlugger()
  const regex = /^(#{2,3})\s+(.+)$/gm
  const headings: Heading[] = []
  let match
  while ((match = regex.exec(mdContent)) !== null) {
    const level = match[1].length as 2 | 3
    const text = match[2].trim()
    headings.push({ id: slugger.slug(text), text, level })
  }
  return headings
}

// app/courses/[courseSlug]/[lessonSlug]/page.tsx — additional read
import fs from 'fs'
import path from 'path'

// Inside the Server Component:
const rawMd = fs.readFileSync(
  path.join(process.cwd(), 'courses', sourceCourseSlug, `${lessonSlug}.md`),
  'utf-8'
)
const headings = extractHeadings(rawMd)
// Pass to: <LessonToc headings={headings} />
```

### Pattern 3: MDX pre Override as Enhancement Surface

**What:** All code block UI lives in the `pre` MDX override in `mdx-components.tsx`. The rehype pipeline handles tokenization; the React component handles layout, copy button, and language badge. `rehype-pretty-code` forwards `data-language` on the wrapper element and `raw` is forwarded via the existing `forwardRawCode` visitor.

**When to use:** Any presentational code block enhancement — language labels, copy button, line highlighting CSS, theme switching. Avoids adding complexity to the rehype pipeline.

**Trade-offs:** The `pre` React component only receives props that the rehype visitors explicitly forward. Adding `data-language` to the `pre` element requires either reading it from the parent div's `data-language` (not directly accessible) or reading `data-language` set on `<pre>` itself — `rehype-pretty-code` does set `data-language` on `<code>` inside the `<pre>`, accessible via child inspection or a small visitor.

**Example:**
```typescript
// mdx-components.tsx — updated pre override
pre: ({
  children,
  raw,
  'data-language': language,
  ...props
}: React.ComponentProps<'pre'> & { raw?: string; 'data-language'?: string }) => (
  <div className="relative group not-prose">
    {language && (
      <span className="absolute top-2 right-10 text-xs text-muted-foreground font-mono opacity-60">
        {language}
      </span>
    )}
    <pre {...props} className="overflow-x-auto rounded-lg p-4 text-sm">
      {children}
    </pre>
    {raw && <CopyButton code={raw} />}
  </div>
)
```

---

## Data Flow

### Request Flow (Lesson Page — SSG, Post-v1.1)

```
Build time — generateStaticParams():
  getUnifiedCourse()
      ↓
  Emits { courseSlug: 'python', lessonSlug: 'lesson-01-...' } for all 120 lessons

For each static path — LessonPage({ params }) [Server Component]:
  getUnifiedCourse()
      ↓
  Resolve: sourceCourseSlug (original '01-python-fundamentals' dir)
         + LessonMeta (with global prev/next)
         + section title (for breadcrumb)
      ↓
  fs.readFileSync('courses/{sourceCourseSlug}/{lessonSlug}.md')
      ↓
  extractHeadings(rawMd)  →  Heading[]  →  <LessonToc headings={...} />
      ↓
  import('@/courses/{sourceCourseSlug}/{lessonSlug}.md')  →  <LessonContent />
      ↓
  getExercises(sourceCourseSlug, lessonSlug)  →  exerciseData
  getMindmapData(sourceCourseSlug, lessonSlug)  →  mindmapData
      ↓
  Renders 3-column layout:
  [CourseSidebar 288px] | [Article + LessonContent 65ch] | [LessonToc 240px xl+]
```

### State Management (Progress — Post-v1.1)

```
First load after upgrade:
  ProgressHydration mounts
      ↓
  Reads localStorage['python-course-progress']
  Detects old keys (completedLessons['01-python-fundamentals'] etc.)
      ↓
  Merges all old lesson slugs under completedLessons['python']
  Clears old keys
      ↓
  Hydrates Zustand store with migrated state

Ongoing:
  LessonCompleteButton → useProgressStore.markComplete('python', lessonSlug)
      ↓
  Zustand persist → localStorage['python-course-progress']
      ↓
  CourseSidebar re-renders (isComplete selector)
  CourseProgressBar re-renders (getCourseProgress selector)
```

### Key Data Flows

1. **Unified course assembly:** `getUnifiedCourse()` calls `getAllCourses()` (untouched), applies `SECTION_MAP`, computes global prev/next. Single call site; cached by Next.js build.

2. **Lesson resolution:** Lesson page receives `lessonSlug` from URL params, resolves `sourceCourseSlug` from `LessonMeta.sourceCourseSlug`. All downstream FS operations (MDX import, exercises JSON, mindmap JSON) use `sourceCourseSlug`.

3. **In-page navigation:** `LessonToc` (Client) uses `IntersectionObserver` on heading elements by `id`. IDs are generated by `rehype-slug` during MDX compilation; `extractHeadings` reproduces them with `github-slugger` for the prop list. They must match exactly.

4. **Code syntax path:** `.md` file → `@next/mdx` → `extractRawCode` visitor (before Shiki) → `rehype-pretty-code` (Shiki tokenization) → `forwardRawCode` visitor (raw prop forwarded to `pre`) → `rehypeSlug` → `mdx-components.tsx` pre override renders with CopyButton + language badge.

---

## Integration Points for v1.1 Features

### New vs. Modified — Master Table

| Artifact | Status | Change Description |
|----------|--------|--------------------|
| `lib/section-map.ts` | NEW | Section order and title config for 12 course dirs |
| `lib/content.ts` | MODIFY | Add `Section`, `UnifiedCourse`, `Heading` types; add `getUnifiedCourse()`, `extractHeadings()`; add `sourceCourseSlug` to `LessonMeta` |
| `components/lesson-toc.tsx` | NEW | Client: sticky in-page ToC with IntersectionObserver active tracking |
| `app/page.tsx` | REWRITE | Real homepage replacing redirect stub |
| `app/courses/[courseSlug]/layout.tsx` | MODIFY | Receives `Section[]` from `getUnifiedCourse()`, passes to sidebar |
| `app/courses/[courseSlug]/page.tsx` | MODIFY | Section-grouped lesson list instead of flat list |
| `app/courses/[courseSlug]/[lessonSlug]/page.tsx` | MODIFY | 3-col layout; reads raw MD for headings; passes `sourceCourseSlug` to exercises/mindmap getters |
| `components/course-sidebar.tsx` | MODIFY | Renders section header groups above lesson links |
| `components/lesson-breadcrumb.tsx` | MODIFY | Shows Section > Lesson (not just Course > Lesson) |
| `components/site-header.tsx` | MODIFY | Logo links to `/` not `/courses` |
| `lib/store/progress.ts` | MODIFY | Migration from 12 courseSlug keys to single `python` key; storage key update |
| `lib/notebook-urls.ts` | MODIFY | Single `python` key (or keep 12 keys and resolve by `sourceCourseSlug`) |
| `next.config.mjs` | MODIFY | `rehypePrettyCodeOptions`: line number support, highlighted line CSS class |
| `mdx-components.tsx` | MODIFY | Language badge on `pre`; new CSS classes for highlighting |
| `app/globals.css` | MODIFY | CSS for `.line--highlighted`, line number counters, language badge |
| `lib/exercises.ts` | UNCHANGED | Signature stays `getExercises(courseSlug, lessonSlug)` — caller passes sourceCourseSlug |
| `lib/mindmap-data.ts` | UNCHANGED | Same — caller passes sourceCourseSlug |
| `courses/` directory | UNCHANGED | No files moved or renamed |
| `components/code-runner/` | UNCHANGED | |
| `components/mindmap/` | UNCHANGED | |
| `components/search/` | UNCHANGED | |
| `components/notebook-lm/` | UNCHANGED | |
| `lib/search.ts` | UNCHANGED | |

### LessonMeta Type Change

`lib/content.ts` must add `sourceCourseSlug` to `LessonMeta`. This is the only breaking type change and affects every call site that passes `LessonMeta` to `getExercises()` or `getMindmapData()`.

```typescript
// Before
export type LessonMeta = {
  slug: string
  courseSlug: string        // was the FS dir slug AND the route slug
  title: string
  lessonNumber: number
  duration: string
  level: string
  prev: string | null
  next: string | null
}

// After
export type LessonMeta = {
  slug: string
  courseSlug: string        // now always 'python' (the unified route slug)
  sourceCourseSlug: string  // NEW: '01-python-fundamentals' etc. — for FS ops
  title: string
  lessonNumber: number
  sectionSlug: string       // NEW: which section this lesson belongs to
  duration: string
  level: string
  prev: string | null
  next: string | null
}
```

---

## Build Order (Dependency-Respecting)

```
Step 1: lib/section-map.ts (NEW)
        No dependencies. Defines the config everything else references.
        Unblocks: Step 2.

Step 2: lib/content.ts (MODIFY)
        Depends on: section-map.ts (Step 1).
        Add Section, UnifiedCourse, Heading types.
        Add getUnifiedCourse(), extractHeadings().
        Add sourceCourseSlug + sectionSlug to LessonMeta.
        getAllCourses() stays untouched — existing tests pass.
        Unblocks: Steps 3, 4, 5, 6.

Step 3: lib/store/progress.ts (MODIFY)
        Depends on: nothing new.
        Add localStorage migration from 12 old keys to 'python' key.
        Must land before any route renders the sidebar with new key.
        Unblocks: Step 4.

Step 4: app/courses/[courseSlug]/layout.tsx + course-sidebar.tsx (MODIFY)
        Depends on: getUnifiedCourse() (Step 2), progress migration (Step 3).
        Layout calls getUnifiedCourse(), sidebar renders section groups.
        Route still accepts courseSlug = 'python'.
        Unblocks: Step 5.

Step 5: app/courses/[courseSlug]/page.tsx (MODIFY)
        Depends on: getUnifiedCourse() (Step 2), sidebar working (Step 4).
        Section-grouped lesson list replacing flat ol.
        Unblocks: Step 6.

Step 6: components/lesson-toc.tsx (NEW) — parallel with Step 7
        Depends on: Heading type from Step 2 (type only, no runtime dep).
        Client component. IntersectionObserver for active heading tracking.
        No FS dependency — safe to build in parallel.

Step 7: app/courses/[courseSlug]/[lessonSlug]/page.tsx (MODIFY)
        Depends on: extractHeadings() (Step 2), LessonToc (Step 6).
        3-column layout. Reads raw MD server-side for headings.
        Passes sourceCourseSlug to getExercises() and getMindmapData().
        Unblocks: nothing (leaf step for content pipeline).

Step 8: app/page.tsx (REWRITE)
        Depends on: none (redirect removal has no deps).
        Real homepage with JustLearn branding.
        Can be done in parallel with Steps 3–7.

Step 9: Enhanced syntax highlighting
        Depends on: nothing from Steps 1–8. Fully parallel.
        next.config.mjs → mdx-components.tsx → globals.css.
        Order within Step 9: config first (enables features),
        then component (uses new CSS classes), then CSS (defines them).

Step 10: Cleanup + integration validation
        Verify generateStaticParams emits 120 slugs under courseSlug='python'.
        Verify exercises + mindmaps resolve via sourceCourseSlug.
        Verify ToC anchor IDs match rehype-slug output (github-slugger).
        Verify localStorage migration runs cleanly on existing progress data.
        Verify lib/notebook-urls.ts resolution works for all 12 sections.
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 300 students (target) | SSG + localStorage is correct. No backend needed. |
| 3,000 students | Same. Add CDN edge caching if not on Vercel already. |
| 30,000 students | localStorage progress → server-side if auth is ever added. SSG pages scale freely. |

**Build time with v1.1:** Still 120 static pages. Lesson chunking is in-page (anchors, not separate routes), so no page count increase. One additional synchronous FS read per lesson page (heading extraction) adds negligible build time at this scale.

---

## Anti-Patterns

### Anti-Pattern 1: Splitting Lessons into Separate Files Per Chunk

**What people do:** Create `lesson-01-part-1.md`, `lesson-01-part-2.md` etc. for lesson chunking.

**Why it's wrong:** Multiplies routes (120 → 480+), breaks prev/next cross-part navigation, fragments MDX compilation, requires updating every lesson slug reference in exercises.json, mindmaps.json, and the progress store.

**Do this instead:** Keep one file per lesson. The `## Part N:` headings already define logical chunks. Render the full lesson on one page with an in-page ToC that jumps between parts via anchor links.

### Anti-Pattern 2: Restructuring the courses/ Directory

**What people do:** Move all 120 lesson files into `courses/python/{sectionSlug}/lesson-*.md`.

**Why it's wrong:** Breaks the dynamic `import()` path in the lesson page (`@/courses/${courseSlug}/${lessonSlug}.md`), breaks all JSON paths in `exercises.ts` and `mindmap-data.ts`, and requires bulk-renaming or copying 120+ files.

**Do this instead:** Keep 12 physical directories. Map them to sections via `lib/section-map.ts`. Only the logical data model changes, not the filesystem.

### Anti-Pattern 3: Heading Extraction via rehype Plugin Side Effects

**What people do:** Write a custom rehype plugin to emit a headings array to a module-level variable or file during MDX compilation.

**Why it's wrong:** `@next/mdx` compiles in a build worker context. Module-level state does not survive worker boundaries. Plugin side effects are unreliable for cross-boundary data passing.

**Do this instead:** Read the raw MD file in the Server Component and extract headings with `extractHeadings()` using `github-slugger`. Deterministic, testable, and stays in the normal data layer.

### Anti-Pattern 4: Split Progress Store Keys After Consolidation

**What people do:** Keep writing progress to old course-specific keys (`01-python-fundamentals`, etc.) for backward compatibility alongside the new unified key.

**Why it's wrong:** Sidebar, progress bar, and completion button must agree on a single key. Split state causes sidebar to show completion marks that the progress bar does not count.

**Do this instead:** Migrate once in `ProgressHydration` on first load. Exclusively use the `python` key going forward.

### Anti-Pattern 5: Generating Homepage Data Client-Side

**What people do:** Fetch course metadata in a `useEffect` on the homepage to avoid static data concerns.

**Why it's wrong:** The homepage is a Server Component in App Router. `getAllCourses()` or `getUnifiedCourse()` runs at build time and has zero client cost. Fetching client-side adds a loading state, a waterfall, and eliminates SEO benefits.

**Do this instead:** Call `getUnifiedCourse()` directly in `app/page.tsx` (Server Component). Data is embedded in the static HTML.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| NotebookLM | Static deep link per section (not per course anymore) | After consolidation, single `python` key in `notebook-urls.ts` OR keep 12 keys resolved by `sourceCourseSlug` — 12-key approach requires less re-setup |
| Pyodide (WASM) | Web Worker lazy-load on first Run click | Unchanged from v1.0 |

### Internal Boundaries (Changed by v1.1)

| Boundary | Before | After |
|----------|--------|-------|
| `lib/content.ts` → lesson page | `getCourse(courseSlug)` + `getLesson(courseSlug, lessonSlug)` | `getUnifiedCourse()` + resolve by lessonSlug; `sourceCourseSlug` on LessonMeta |
| Layout → `CourseSidebar` | `lessons: LessonMeta[]` flat array | `sections: Section[]` with nested lessons |
| Lesson page → `getExercises` | `getExercises(courseSlug, lessonSlug)` where courseSlug = FS dir | `getExercises(sourceCourseSlug, lessonSlug)` — same FS path, different variable name |
| Lesson page → `LessonToc` | Does not exist | New: `headings: Heading[]` extracted server-side |
| Progress store key | `completedLessons['01-python-fundamentals']` etc. | `completedLessons['python']` with one-time migration |

---

## Sources

- Direct codebase inspection (HIGH confidence):
  - `lib/content.ts`, `lib/exercises.ts`, `lib/mindmap-data.ts`, `lib/store/progress.ts`
  - `app/layout.tsx`, `app/page.tsx`, `app/courses/page.tsx`
  - `app/courses/[courseSlug]/layout.tsx`, `app/courses/[courseSlug]/page.tsx`
  - `app/courses/[courseSlug]/[lessonSlug]/page.tsx`
  - `components/course-sidebar.tsx`, `components/lesson-nav.tsx`
  - `mdx-components.tsx`, `next.config.mjs`
  - `courses/01-python-fundamentals/` — file names, line counts, heading structure
- Next.js App Router nested layouts: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
- `rehype-pretty-code` line numbers + highlighted lines: https://rehype-pretty-code.netlify.app
- `github-slugger` (same algorithm as `rehype-slug`): https://github.com/Flet/github-slugger

---

*Architecture research for: JustLearn v1.1 — lesson chunking, course consolidation (12→1), homepage redesign, enhanced syntax highlighting*
*Researched: 2026-03-14*
