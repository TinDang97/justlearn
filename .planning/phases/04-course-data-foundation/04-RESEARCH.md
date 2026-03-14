# Phase 4: Course Data Foundation - Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 App Router data model refactor — virtual course consolidation + Zustand localStorage migration
**Confidence:** HIGH (direct codebase inspection of every affected file)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STRUCT-01 | 12 separate courses consolidated into a unified "Python" course with 12 sections (virtual — no file moves) | `lib/section-map.ts` (NEW) + `lib/content.ts` additions enable virtual consolidation via `getUnifiedCourse()`; physical `courses/` directory stays untouched |
| STRUCT-04 | Zustand progress store migrated from 12 course keys to unified `python` key with backward-compatible migration | Zustand `persist` `version`/`migrate` API handles localStorage migration in one atomic change; `ProgressHydration` component is the correct injection point |
</phase_requirements>

---

## Summary

Phase 4 delivers two tightly coupled changes that must land in strict order: first the Zustand migration, then the content data model. The progress store change (STRUCT-04) is a pure data/infrastructure change with no UI effect — it makes the localStorage schema forward-compatible before any route changes land. The content model change (STRUCT-01) builds `lib/section-map.ts` + additions to `lib/content.ts` that assemble a virtual unified course from the 12 physical `courses/` directories without moving any files.

The critical safety invariant: STRUCT-04 must be committed and deployed before STRUCT-01's `getUnifiedCourse()` is called from any route. If routes start calling `getUnifiedCourse()` while the store still uses old keys, `CourseSidebar` will show no completion marks and `CourseProgressBar` will show 0% for returning students — invisible data corruption.

No new npm packages are required for Phase 4. `gray-matter` is not installed and is not needed here: `lib/section-map.ts` uses a hardcoded TypeScript config map (not frontmatter parsing from README files), which is simpler and eliminates a runtime dependency.

**Primary recommendation:** Commit STRUCT-04 (progress migration) as the first commit of Phase 4. Then commit STRUCT-01 (section-map + content model). Each commit should have a passing test suite.

---

## Standard Stack

### Core (already installed — do NOT reinstall)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `zustand` | current | Progress state + localStorage persistence | Installed; modify persist options |
| `zustand/middleware` | current | `persist` + `createJSONStorage` | Already used in `lib/store/progress.ts` |
| TypeScript | current | Type safety for new `Section`, `UnifiedCourse` types | No changes needed |
| Next.js | 15.5.12 | App Router SSG + `generateStaticParams` | No changes needed |

### Not Needed for Phase 4

| Package | Why Not |
|---------|---------|
| `gray-matter` | Section metadata lives in `lib/section-map.ts` as a hardcoded TypeScript constant — no frontmatter parsing from README files |
| Any new routing library | Virtual consolidation does not change routes in Phase 4 (route changes are Phase 5) |
| `@stefanprobst/rehype-extract-toc` | Phase 6 concern |

---

## Architecture Patterns

### Recommended File Structure for Phase 4

```
lib/
├── section-map.ts          # NEW: hardcoded section metadata config
├── content.ts              # MODIFY: add Section, UnifiedCourse types;
│                           #          add getUnifiedCourse(); add sourceCourseSlug
│                           #          + sectionSlug to LessonMeta;
│                           #          getAllCourses() stays UNTOUCHED
└── store/
    └── progress.ts         # MODIFY: version bump + migrate fn (STRUCT-04)

components/
└── progress-hydration.tsx  # NO CHANGE: already calls persist.rehydrate()
                            # Migration runs automatically on rehydrate

__tests__/lib/
├── content.test.ts         # MODIFY: add getUnifiedCourse tests; keep existing
└── progress-store.test.ts  # MODIFY: add migration tests (version 1 → 2)
```

### Pattern 1: Zustand Persist Migration (STRUCT-04)

**What:** Increment persist `version` from 0 (implicit) to 1 and add a `migrate` function that maps old `completedLessons['01-python-fundamentals']` through `completedLessons['12-capstone-best-practices']` into `completedLessons['python']`.

**When to use:** Whenever the persist schema key space changes. Must land before any code reads the new key.

**Critical details from codebase inspection:**
- Current `name`: `'python-course-progress'` — keep this unchanged (it's the localStorage key name, not the course key)
- Current `skipHydration: true` — keep this; `ProgressHydration` calls `persist.rehydrate()` in `useEffect`
- Current `version`: not set (implicit 0 in Zustand persist)
- Migration target: all 12 old `courseSlug` keys merged into single `'python'` key

```typescript
// lib/store/progress.ts — full replacement
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// The 12 old course directory slugs that become sections
const OLD_COURSE_SLUGS = [
  '01-python-fundamentals',
  '02-data-types-variables',
  '03-control-flow-logic',
  '04-functions-modules',
  '05-data-structures',
  '06-oop',
  '07-file-handling-exceptions',
  '08-working-with-libraries',
  '09-web-development-basics',
  '10-data-analysis-visualization',
  '11-automation-scripting',
  '12-capstone-best-practices',
]

type ProgressState = {
  completedLessons: Record<string, string[]>
  markComplete: (courseSlug: string, lessonSlug: string) => void
  markIncomplete: (courseSlug: string, lessonSlug: string) => void
  isComplete: (courseSlug: string, lessonSlug: string) => boolean
  getCourseProgress: (courseSlug: string, totalLessons: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      markComplete: (courseSlug, lessonSlug) =>
        set((s) => {
          const existing = s.completedLessons[courseSlug] ?? []
          if (existing.includes(lessonSlug)) return s
          return {
            completedLessons: {
              ...s.completedLessons,
              [courseSlug]: [...existing, lessonSlug],
            },
          }
        }),
      markIncomplete: (courseSlug, lessonSlug) =>
        set((s) => ({
          completedLessons: {
            ...s.completedLessons,
            [courseSlug]: (s.completedLessons[courseSlug] ?? []).filter(
              (slug) => slug !== lessonSlug
            ),
          },
        })),
      isComplete: (courseSlug, lessonSlug) =>
        (get().completedLessons[courseSlug] ?? []).includes(lessonSlug),
      getCourseProgress: (courseSlug, totalLessons) => {
        if (totalLessons === 0) return 0
        const done = (get().completedLessons[courseSlug] ?? []).length
        return Math.round((done / totalLessons) * 100)
      },
    }),
    {
      name: 'python-course-progress',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // v0: completedLessons keyed by 12 course dir slugs
          // v1: completedLessons keyed by 'python' only
          const old = (persistedState as { completedLessons?: Record<string, string[]> })
            ?.completedLessons ?? {}
          const merged = OLD_COURSE_SLUGS.flatMap((slug) => old[slug] ?? [])
          // De-duplicate in case of any overlap (defensive)
          const unique = [...new Set(merged)]
          return {
            completedLessons: unique.length > 0 ? { python: unique } : {},
          }
        }
        return persistedState as ProgressState
      },
    }
  )
)
```

### Pattern 2: Virtual Course Consolidation via Config Map (STRUCT-01)

**What:** New `lib/section-map.ts` exports a static `SECTION_MAP` constant. `lib/content.ts` gains `Section`, `UnifiedCourse` types and a `getUnifiedCourse()` function that calls the existing `getAllCourses()` (unchanged) and restructures the data.

**When to use:** Phase 4 data model only. Route changes (Phase 5) consume `getUnifiedCourse()`.

**LessonMeta type change** — the only breaking type change in Phase 4:

```typescript
// BEFORE (lib/content.ts)
export type LessonMeta = {
  slug: string
  courseSlug: string        // was FS dir AND route slug simultaneously
  title: string
  lessonNumber: number
  duration: string
  level: string
  prev: string | null
  next: string | null
}

// AFTER
export type LessonMeta = {
  slug: string
  courseSlug: string        // now always 'python' (unified route slug)
  sourceCourseSlug: string  // NEW: '01-python-fundamentals' etc. for FS ops
  sectionSlug: string       // NEW: same as sourceCourseSlug (which section)
  title: string
  lessonNumber: number
  duration: string
  level: string
  prev: string | null
  next: string | null
}
```

**IMPORTANT:** `getAllCourses()` still returns `courseSlug = '01-python-fundamentals'` etc. It is unchanged. Only `getUnifiedCourse()` returns `courseSlug = 'python'`. Phase 4 does not touch any routes — routes still call `getCourse('01-python-fundamentals')` etc. until Phase 5.

```typescript
// lib/section-map.ts (NEW)
export const SECTION_MAP: Record<string, { title: string; order: number }> = {
  '01-python-fundamentals':         { title: 'Fundamentals',              order: 1  },
  '02-data-types-variables':        { title: 'Data Types & Variables',    order: 2  },
  '03-control-flow-logic':          { title: 'Control Flow & Logic',      order: 3  },
  '04-functions-modules':           { title: 'Functions & Modules',       order: 4  },
  '05-data-structures':             { title: 'Data Structures',           order: 5  },
  '06-oop':                         { title: 'Object-Oriented Python',    order: 6  },
  '07-file-handling-exceptions':    { title: 'Files & Exceptions',        order: 7  },
  '08-working-with-libraries':      { title: 'Working with Libraries',    order: 8  },
  '09-web-development-basics':      { title: 'Web Development Basics',    order: 9  },
  '10-data-analysis-visualization': { title: 'Data Analysis',             order: 10 },
  '11-automation-scripting':        { title: 'Automation & Scripting',    order: 11 },
  '12-capstone-best-practices':     { title: 'Capstone & Best Practices', order: 12 },
}
```

```typescript
// lib/content.ts additions (getAllCourses and helpers stay UNCHANGED)
import { SECTION_MAP } from './section-map'

export type Section = {
  slug: string          // e.g. '01-python-fundamentals'
  title: string         // from SECTION_MAP
  order: number
  lessons: LessonMeta[] // LessonMeta with courseSlug='python', sourceCourseSlug set
}

export type UnifiedCourse = {
  slug: 'python'
  title: string
  sections: Section[]
  allLessons: LessonMeta[]  // flattened, global prev/next across section boundaries
}

export function getUnifiedCourse(): UnifiedCourse {
  const rawCourses = getAllCourses()  // unchanged — returns 12 courses with original slugs

  const sections: Section[] = rawCourses
    .map((c) => ({
      slug: c.slug,
      title: SECTION_MAP[c.slug]?.title ?? c.title,
      order: SECTION_MAP[c.slug]?.order ?? 99,
      lessons: c.lessons.map((l) => ({
        ...l,
        courseSlug: 'python',         // override to unified slug
        sourceCourseSlug: c.slug,     // preserve original FS slug
        sectionSlug: c.slug,          // same as sourceCourseSlug
      })),
    }))
    .sort((a, b) => a.order - b.order)

  const allFlat = sections.flatMap((s) => s.lessons)

  // Recompute prev/next globally across section boundaries
  const allLessons: LessonMeta[] = allFlat.map((l, i) => ({
    ...l,
    prev: i > 0 ? allFlat[i - 1].slug : null,
    next: i < allFlat.length - 1 ? allFlat[i + 1].slug : null,
  }))

  // Sync section lessons with global prev/next
  let offset = 0
  const linkedSections = sections.map((s) => {
    const sectionLessons = allLessons.slice(offset, offset + s.lessons.length)
    offset += s.lessons.length
    return { ...s, lessons: sectionLessons }
  })

  return {
    slug: 'python',
    title: 'Python Course',
    sections: linkedSections,
    allLessons,
  }
}
```

### Pattern 3: notebook-urls.ts — Keep 12-Key Approach

**Decision confirmed by STATE.md:** `lib/notebook-urls.ts` keeps the 12-key approach (`'01-python-fundamentals'` → URL). In Phase 5, when lesson pages switch to `sourceCourseSlug`, they pass `sourceCourseSlug` to `NOTEBOOK_URLS` lookup. Phase 4 does NOT touch `notebook-urls.ts`.

**Rationale:** Only 1 of 12 real URLs exists (01-python-fundamentals). Converting to a single `python` key would require mapping it to a single notebook for all sections — which doesn't match the data. The 12-key structure maps cleanly to `sourceCourseSlug` in Phase 5.

### Anti-Patterns to Avoid

- **Modifying `getAllCourses()`:** Every existing test depends on it returning 12 courses with original slugs. It must stay entirely untouched.
- **Changing routes in Phase 4:** Routes still use old course slugs. `getUnifiedCourse()` is built but not wired to routes until Phase 5. Phase 4 is data-only.
- **Installing gray-matter:** The `SECTION_MAP` is a TypeScript constant. There is no frontmatter to parse in Phase 4.
- **Setting version to 2 on fresh migration:** The current stored data has implicit version 0 (Zustand default when no `version` was set). Set to version 1, migrate from 0 → 1.
- **Writing migration as a ProgressHydration useEffect:** Use Zustand's built-in `migrate` option in persist config. This is the correct, tested pattern — do not run migration logic in React components.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage schema migration | Custom useEffect migration logic in ProgressHydration | Zustand `persist` `version` + `migrate` option | Built-in, runs before any subscriber reads state, handles version skipping, tested by Zustand |
| Lesson slug → section mapping | Regex parsing of directory names or README metadata | `SECTION_MAP` constant in `lib/section-map.ts` | Declarative, zero runtime cost, trivially testable, no parsing ambiguity |
| Global prev/next across sections | Recursive graph traversal | Simple `.flatMap()` + index arithmetic in `getUnifiedCourse()` | 120 lessons is trivial; the flat array approach is O(n) and obvious |

---

## Common Pitfalls

### Pitfall 1: Progress Silently Lost if Migration Lands After Route Change

**What goes wrong:** If `getUnifiedCourse()` is wired to a route before `version: 1` + `migrate` is deployed, any component calling `useProgressStore((s) => s.completedLessons['python'])` will see an empty array. Old data still exists in localStorage under old keys but is never read.

**Why it happens:** The migration only runs during `persist.rehydrate()` in `ProgressHydration`. If the store reads `completedLessons['python']` before rehydration with the new version, it gets undefined.

**How to avoid:** STRUCT-04 commit must be first. Verify by deploying to a test environment with old localStorage data populated, then refreshing.

**Warning signs:** Progress bar shows 0% for returning students. `localStorage['python-course-progress']` still contains old course slug keys.

### Pitfall 2: content.test.ts Breaks Due to LessonMeta Type Change

**What goes wrong:** Existing content tests assert `lesson.courseSlug === course.slug` (e.g. `'01-python-fundamentals'`). After the type change, `LessonMeta` from `getAllCourses()` still has `courseSlug = '01-python-fundamentals'` — but LessonMeta from `getUnifiedCourse()` has `courseSlug = 'python'`. If tests mix these two sources, assertions fail.

**How to avoid:** Keep `getAllCourses()` completely unchanged. New tests for `getUnifiedCourse()` are separate. Existing tests must stay green without modification.

**Warning signs:** Existing `content.test.ts` tests fail after Phase 4 changes. This means `getAllCourses()` was accidentally modified.

### Pitfall 3: Zustand Version Already Set

**What goes wrong:** If the current store already has a `version` set (not seen in inspection — it does not), setting `version: 1` might trigger migration when it should not.

**How to avoid:** The inspected `lib/store/progress.ts` has no `version` field — the implicit default is 0. Setting `version: 1` with `migrate` for version 0 is correct.

**Confirmed:** `skipHydration: true` is set. Migration runs on `persist.rehydrate()` call in `ProgressHydration` — this is the right injection point and requires no changes to `ProgressHydration`.

### Pitfall 4: sourceCourseSlug Not Threaded to FS Operations

**What goes wrong:** Phase 5 will call `getExercises(sourceCourseSlug, lessonSlug)` and `getMindmapData(sourceCourseSlug, lessonSlug)`. If `sourceCourseSlug` is not present on `LessonMeta`, Phase 5 cannot resolve FS paths without the old `getAllCourses()` fallback.

**How to avoid:** Phase 4 MUST add `sourceCourseSlug: string` to `LessonMeta` (not optional, not nullable). Verify in `getUnifiedCourse()` that every lesson's `sourceCourseSlug` equals the original `courses/` directory name.

### Pitfall 5: De-duplication in Migration

**What goes wrong:** If a lesson slug somehow appears in two old course keys (shouldn't happen but defensive programming matters), `merged.flat()` creates duplicates that confuse `isComplete` lookups.

**How to avoid:** Use `[...new Set(merged)]` in the migration function. The code pattern above already includes this.

---

## Code Examples

### Zustand Migration Test Pattern

```typescript
// __tests__/lib/progress-store.test.ts — NEW tests to add
describe('migration v0 → v1', () => {
  it('merges all 12 old course keys into python key', async () => {
    // Simulate v0 localStorage state
    const v0State = {
      state: {
        completedLessons: {
          '01-python-fundamentals': ['lesson-01-what-is-programming', 'lesson-02-installing-python-ide-setup'],
          '02-data-types-variables': ['lesson-01-integers-and-floats'],
          '03-control-flow-logic': [],
        }
      },
      version: 0,
    }
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))

    // Trigger rehydration (simulates ProgressHydration mounting)
    await useProgressStore.persist.rehydrate()

    const state = useProgressStore.getState()
    expect(state.completedLessons['python']).toContain('lesson-01-what-is-programming')
    expect(state.completedLessons['python']).toContain('lesson-02-installing-python-ide-setup')
    expect(state.completedLessons['python']).toContain('lesson-01-integers-and-floats')
    // Old keys must not be present
    expect(state.completedLessons['01-python-fundamentals']).toBeUndefined()
  })

  it('handles empty old state gracefully', async () => {
    const v0State = { state: { completedLessons: {} }, version: 0 }
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))
    await useProgressStore.persist.rehydrate()
    const state = useProgressStore.getState()
    expect(state.completedLessons['python']).toBeUndefined()
  })

  it('deduplicates lesson slugs across old keys', async () => {
    const v0State = {
      state: {
        completedLessons: {
          '01-python-fundamentals': ['lesson-01-dup'],
          '02-data-types-variables': ['lesson-01-dup'],  // duplicate
        }
      },
      version: 0,
    }
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(v0State))
    await useProgressStore.persist.rehydrate()
    const pythonLessons = useProgressStore.getState().completedLessons['python'] ?? []
    expect(pythonLessons.filter(l => l === 'lesson-01-dup')).toHaveLength(1)
  })
})
```

### getUnifiedCourse Test Pattern

```typescript
// __tests__/lib/content.test.ts — NEW tests to add
import { getUnifiedCourse } from '@/lib/content'

describe('getUnifiedCourse', () => {
  it('returns slug python', () => {
    const course = getUnifiedCourse()
    expect(course.slug).toBe('python')
  })

  it('returns exactly 12 sections', () => {
    const course = getUnifiedCourse()
    expect(course.sections).toHaveLength(12)
  })

  it('sections are sorted by order (01 first, 12 last)', () => {
    const course = getUnifiedCourse()
    const orders = course.sections.map(s => s.order)
    expect(orders).toEqual([1,2,3,4,5,6,7,8,9,10,11,12])
  })

  it('all lessons have courseSlug = python', () => {
    const course = getUnifiedCourse()
    for (const lesson of course.allLessons) {
      expect(lesson.courseSlug).toBe('python')
    }
  })

  it('all lessons have sourceCourseSlug matching original dir', () => {
    const course = getUnifiedCourse()
    for (const lesson of course.allLessons) {
      expect(lesson.sourceCourseSlug).toMatch(/^\d{2}-/)
    }
  })

  it('global prev/next crosses section boundaries', () => {
    const course = getUnifiedCourse()
    const section1 = course.sections[0]
    const lastOfSection1 = section1.lessons[section1.lessons.length - 1]
    const section2 = course.sections[1]
    const firstOfSection2 = section2.lessons[0]
    // Last lesson of section 1 should point next to first lesson of section 2
    expect(lastOfSection1.next).toBe(firstOfSection2.slug)
    expect(firstOfSection2.prev).toBe(lastOfSection1.slug)
  })

  it('allLessons total count equals sum of all section lesson counts', () => {
    const course = getUnifiedCourse()
    const total = course.sections.reduce((sum, s) => sum + s.lessons.length, 0)
    expect(course.allLessons).toHaveLength(total)
  })

  it('getAllCourses still returns 12 courses with original slugs (untouched)', () => {
    // Regression guard: getUnifiedCourse must not modify getAllCourses output
    const { getAllCourses } = await import('@/lib/content')
    const courses = getAllCourses()
    expect(courses).toHaveLength(12)
    expect(courses[0].slug).toBe('01-python-fundamentals')
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | Impact on Phase 4 |
|--------------|------------------|-------------------|
| Zustand v4 `create` with manual version management | Zustand v5 (installed) `persist` `version`/`migrate` API | Use built-in migrate; `useShallow` already used in `CourseProgressBar` for array selectors — keep this pattern |
| Custom migration in React components | Zustand `migrate` option runs before any subscriber reads | Migration in persist config, not in `ProgressHydration.tsx` |
| 12 separate `getCourse(slug)` calls | Single `getUnifiedCourse()` call + flat map | One function call at SSG time; 120 lessons trivially handled |

**Deprecated/outdated:**
- `getCourse(courseSlug)` and `getLesson(courseSlug, lessonSlug)` — still needed in Phase 4 for existing routes; deprecated for Phase 5 route layer which will use `getUnifiedCourse()`

---

## Open Questions

1. **notebook-urls.ts key strategy for Phase 5**
   - What we know: STATE.md says "keep 12-key approach resolved by sourceCourseSlug" and "verify at Phase 4 start"
   - What's clear: Only `01-python-fundamentals` has a real URL; 11 have PLACEHOLDER. Phase 4 does not touch this file.
   - Recommendation: Do not modify `notebook-urls.ts` in Phase 4. Confirm with Phase 5 plan that `sourceCourseSlug` is passed to `NOTEBOOK_URLS` lookup.

2. **getUnifiedCourse() call site caching**
   - What we know: `getAllCourses()` calls `fs.readdirSync` for each of 12 dirs at build time. `getUnifiedCourse()` calls `getAllCourses()` — same I/O cost.
   - What's unclear: Next.js `unstable_cache` is not used for `getAllCourses()` today; at 120 pages this is fine.
   - Recommendation: Do not add caching in Phase 4. The SSG build calls each function once per page — 120 × (12 dir reads) is acceptable.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (from `package.json` `"test": "vitest --run"`) |
| Config file | `vitest.config.ts` (assumed — check if exists) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STRUCT-04 | v0 localStorage → python key migration preserves all completed lessons | unit | `pnpm test -- __tests__/lib/progress-store.test.ts` | Partial (file exists, migration tests are new) |
| STRUCT-04 | Empty v0 state migrates to empty python key (no crash) | unit | `pnpm test -- __tests__/lib/progress-store.test.ts` | Partial |
| STRUCT-04 | Duplicate lesson slugs across old keys are de-duplicated | unit | `pnpm test -- __tests__/lib/progress-store.test.ts` | Partial |
| STRUCT-04 | persist version is 1, skipHydration is true, name is unchanged | unit | `pnpm test -- __tests__/lib/progress-store.test.ts` | Partial |
| STRUCT-01 | getUnifiedCourse returns slug 'python' with 12 sections | unit | `pnpm test -- __tests__/lib/content.test.ts` | Partial (file exists, getUnifiedCourse tests are new) |
| STRUCT-01 | All lessons in unified course have courseSlug = 'python' | unit | `pnpm test -- __tests__/lib/content.test.ts` | Partial |
| STRUCT-01 | All lessons have sourceCourseSlug matching original dir | unit | `pnpm test -- __tests__/lib/content.test.ts` | Partial |
| STRUCT-01 | Global prev/next crosses section boundaries correctly | unit | `pnpm test -- __tests__/lib/content.test.ts` | Partial |
| STRUCT-01 | getAllCourses() still returns 12 courses with original slugs (regression) | unit | `pnpm test -- __tests__/lib/content.test.ts` | Yes (existing tests) |

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] New `describe('migration v0 → v1', ...)` block in `__tests__/lib/progress-store.test.ts`
- [ ] New `describe('getUnifiedCourse', ...)` block in `__tests__/lib/content.test.ts`
- [ ] `lib/section-map.ts` needs a test verifying all 12 slugs are present and orders are 1–12

*(Existing test infrastructure in place — Vitest, localStorage mock, `@/` path alias — no setup changes needed)*

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection:
  - `/lib/store/progress.ts` — exact persist config, version not set, skipHydration: true confirmed
  - `/lib/content.ts` — `getAllCourses()` implementation, `LessonMeta` type, no gray-matter
  - `/components/progress-hydration.tsx` — only calls `persist.rehydrate()`, no migration logic
  - `/next.config.mjs` — plugin order confirmed, no ToC plugin present yet
  - `/lib/notebook-urls.ts` — 12-key structure confirmed, 11 PLACEHOLDERs confirmed
  - `/__tests__/lib/progress-store.test.ts` — existing test structure (no migration tests)
  - `/__tests__/lib/content.test.ts` — existing test assertions (validates getAllCourses untouched requirement)
  - `/courses/` — 12 directories confirmed, no gray-matter frontmatter in README.md
- `.planning/research/ARCHITECTURE.md` — section-map pattern, UnifiedCourse type, LessonMeta change spec (HIGH confidence — built from codebase inspection)
- `.planning/research/PITFALLS.md` — Pitfall 5 (progress migration), Pitfall 6 (dynamic import path)
- `.planning/STATE.md` — v1.1-roadmap decisions (notebook-urls 12-key, Zustand migration first commit)

### Secondary (MEDIUM confidence)
- [Zustand persist migration API](https://github.com/pmndrs/zustand/discussions/1717) — `version`/`migrate` option behavior verified

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — direct package.json + node_modules inspection
- Architecture: HIGH — every affected file read directly from codebase
- Pitfalls: HIGH — derived from actual code analysis, not hypothetical scenarios
- Test patterns: HIGH — Vitest + localStorage mock setup already established in repo

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack — Zustand/Next.js APIs unlikely to change in 30 days)
