# Phase 5: Homepage + Navigation UI - Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 App Router — homepage redesign, section-grouped sidebar accordion, course overview accordion, header scroll behavior, breadcrumb hierarchy update
**Confidence:** HIGH (full codebase inspection, design spec read, all source files directly verified)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | Homepage displays hero section with JustLearn branding, tagline, and CTA to start the course | Replace `app/page.tsx` redirect with Server Component; hero layout from spec §7.2; design tokens from spec §16 |
| HOME-02 | Homepage shows section overview cards (12 sections) with lesson counts and progress | `getUnifiedCourse()` from Phase 4; `SectionCard` component pattern from spec §12.1; `CourseProgressBar` reuse |
| HOME-03 | Site header displays JustLearn wordmark with conditional "Start Learning" CTA | Modify `components/site-header.tsx`; `usePathname` for conditional rendering on `/`; pill-shape button spec §7.1 |
| HOME-04 | Header gains backdrop blur and border on scroll | `useScrolled` hook with `window.scrollY`; `backdrop-blur-sm bg-background/80 border-b` CSS classes |
| STRUCT-02 | Course overview page shows accordion-style section list with per-section progress | Modify `app/courses/[courseSlug]/page.tsx` or new `/course` route; `radix-ui` Accordion already installed; `getUnifiedCourse()` from Phase 4 |
| STRUCT-03 | Sidebar navigation grouped by sections with expand/collapse | Modify `components/course-sidebar.tsx`; `radix-ui` Collapsible already installed; `Section[]` prop from Phase 4 layout |
| STRUCT-05 | Breadcrumbs updated to reflect unified course hierarchy (Course > Section > Lesson) | Modify `components/lesson-breadcrumb.tsx`; add `sectionTitle` and `sectionSlug` props; existing shadcn/ui breadcrumb components available |
</phase_requirements>

---

## Summary

Phase 5 is a pure UI assembly phase. All the hard data work lands in Phase 4 (`lib/section-map.ts`, `getUnifiedCourse()`, `Section` type, progress migration). Phase 5 consumes those outputs to wire up seven visible changes: a real homepage, section cards, a conditional header CTA with scroll behavior, an accordion course overview, a section-grouped sidebar, and updated breadcrumbs.

Every library needed is already installed. `radix-ui` (v1.4.3) includes both `Accordion` and `Collapsible`. `lucide-react` has all needed icons. `motion` (Framer Motion v12) is present for hover animations. `next-themes` handles the dark/light mode. The shadcn/ui component set in `components/ui/` covers breadcrumbs, badges, buttons, cards, sheets, and separators.

The primary execution risk is the sidebar prop interface change. `CourseSidebar` currently accepts `lessons: LessonMeta[]`. Phase 5 changes it to accept `sections: Section[]`. Both the desktop sidebar AND `MobileSidebarTrigger` must be updated together because `CourseLayout` passes props to both. Missing one leaves the mobile sheet broken.

**Primary recommendation:** Execute in dependency order — sidebar (requires `Section[]` from layout) before course overview page (requires sidebar working), breadcrumb (standalone), homepage (standalone), header (standalone). The homepage and header can be built in parallel with the sidebar work.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^15.5.12 | Server Components for all page-level data fetching | Already in use; `getUnifiedCourse()` called at SSG time in Server Components |
| `radix-ui` | ^1.4.3 | Accordion (course overview) + Collapsible (sidebar sections) | Already installed; both primitives confirmed present via inspection |
| `lucide-react` | ^0.577.0 | Icons (ChevronDown, CheckCircle2, Circle, BookOpen, etc.) | Already in use throughout codebase |
| shadcn/ui `components/ui/` | (local) | Breadcrumb, Badge, Button, Card, Sheet | Already implemented; breadcrumb.tsx already present |
| Tailwind CSS | ^4.2.1 | All layout, spacing, typography | Already in use |
| `next-themes` | ^0.4.6 | Dark/light mode for header backdrop-blur behavior | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `motion` (Framer Motion) | ^12.36.0 | Card hover animations, scroll progress | Card `translateY(-1px)` hover effect on homepage section cards |
| `usePathname` (next/navigation) | built-in | Conditional header CTA rendering | Detect if on `/` to show "Start Learning" button |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `radix-ui` Accordion | Hand-rolled details/summary | Accordion has controlled state, ARIA, keyboard nav built-in. Hand-rolling adds 60+ lines for same result. |
| `radix-ui` Collapsible | CSS-only disclosure | Collapsible supports smooth height animation via Radix. CSS-only approach needs manual `max-height` transitions and forfeits ARIA `aria-expanded`. |
| `useScrollY` hook | scroll event listener inline | A small `useScrolled` hook keeps header clean and testable. |

**Installation:** No new packages needed. All libraries confirmed present.

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── page.tsx                          # REWRITE: real homepage (remove redirect)
└── courses/
    └── [courseSlug]/
        ├── layout.tsx                # MODIFY: pass Section[] to sidebar + mobile trigger
        └── page.tsx                  # MODIFY: accordion section list (or new /course route)

components/
├── site-header.tsx                   # MODIFY: logo → /, conditional CTA, scroll blur
├── course-sidebar.tsx                # MODIFY: section grouping with Collapsible
├── mobile-sidebar-trigger.tsx        # MODIFY: same section grouping for mobile Sheet
├── lesson-breadcrumb.tsx             # MODIFY: Course > Section > Lesson
└── homepage/                         # NEW directory
    ├── hero-section.tsx              # NEW: hero markup + CTA
    └── section-cards-grid.tsx        # NEW: 3-col grid of SectionCard

lib/
└── hooks/
    └── use-scrolled.ts               # NEW: returns boolean, true if scrollY > threshold
```

### Pattern 1: Server Component Data Fetching on Homepage

**What:** `app/page.tsx` is a Server Component. Call `getUnifiedCourse()` directly at the top of the component. The returned `Section[]` array flows into `<SectionCardsGrid>`. No `useEffect`, no loading state, no client-side fetch.

**When to use:** Any data that is static at build time (course metadata) on a page that benefits from SSG.

**Example:**
```typescript
// app/page.tsx
import { getUnifiedCourse } from '@/lib/content'
import { HeroSection } from '@/components/homepage/hero-section'
import { SectionCardsGrid } from '@/components/homepage/section-cards-grid'

// Source: .planning/research/ARCHITECTURE.md — Anti-Pattern 5
export default function HomePage() {
  const course = getUnifiedCourse()  // SSG — zero client cost
  return (
    <>
      <HeroSection courseSlug={course.slug} />
      <SectionCardsGrid sections={course.sections} />
    </>
  )
}
```

### Pattern 2: Conditional Header CTA via `usePathname`

**What:** `SiteHeader` adds a "Start Learning" pill button that only shows on the homepage `/`. Because `SiteHeader` is used across all pages, the check must be client-side. Extract the conditional logic into a thin `'use client'` sub-component; keep the server-renderable outer shell.

**When to use:** When a server component needs a small client-side behavior (scroll state, pathname check) without becoming fully client.

**Example:**
```typescript
// components/site-header.tsx
import { HeaderClient } from './header-client'  // 'use client' sub-component

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16">
      <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">JustLearn</Link>
        <HeaderClient />  {/* handles pathname check + scroll state */}
      </div>
    </header>
  )
}

// components/header-client.tsx  ('use client')
'use client'
import { usePathname } from 'next/navigation'
import { useScrolled } from '@/lib/hooks/use-scrolled'

export function HeaderClient() {
  const pathname = usePathname()
  const scrolled = useScrolled(10)  // true if scrollY > 10px
  const isHome = pathname === '/'

  return (
    <div className={cn(
      'flex items-center gap-2',
      // scroll effect applied to parent header via class on this wrapper or via CSS variable
    )}>
      {isHome && (
        <Button asChild size="sm" className="rounded-full">
          <Link href="/courses/python">Start Learning</Link>
        </Button>
      )}
      <SearchDialog />
      <ThemeToggle />
    </div>
  )
}
```

**Note on scroll border:** The `backdrop-blur` + `border-b` on scroll can be applied via `data-scrolled` attribute on the `<header>` element, or by passing `scrolled` boolean up via a wrapper. The cleanest pattern is to have `HeaderClient` set a CSS class on the `document.body` or use a context. The simplest is to render the border conditionally inside `HeaderClient` itself on the header's inner container, since the header is `sticky`.

### Pattern 3: Section-Grouped Sidebar with Collapsible

**What:** `CourseSidebar` receives `sections: Section[]` instead of `lessons: LessonMeta[]`. Each section renders as a `radix-ui` Collapsible with the section title as trigger and lesson links as content. The current section (containing the active lesson) starts expanded; others start collapsed.

**When to use:** Large flat lists that need visual grouping with show/hide behavior.

**Example:**
```typescript
// components/course-sidebar.tsx
'use client'
import * as Collapsible from 'radix-ui/Collapsible'  // direct import from radix-ui package
import type { Section } from '@/lib/content'

type CourseSidebarProps = {
  courseSlug: string
  sections: Section[]
  currentLessonSlug?: string
}

// Each section that contains the current lesson starts open
// All others start collapsed
```

**Import path:** `radix-ui` (the bundle package) exports `Collapsible` as a named export. Import pattern: `import { Collapsible } from 'radix-ui'` then use `Collapsible.Root`, `Collapsible.Trigger`, `Collapsible.Content`. Verified via `node_modules/radix-ui` inspection.

### Pattern 4: Accordion Course Overview Page

**What:** `app/courses/[courseSlug]/page.tsx` (when `courseSlug === 'python'`) renders the unified course view. Sections appear as an accordion — first incomplete section expanded, others collapsed. Each expanded section reveals its lesson list.

**When to use:** When displaying a full curriculum where the user needs to see structure without seeing all 120+ lesson links at once.

**Example:**
```typescript
// app/courses/[courseSlug]/page.tsx (for courseSlug = 'python')
import { Accordion } from 'radix-ui'

// Accordion.Root type="single" collapsible defaultValue={firstIncompleteSectionSlug}
// Accordion.Item per section
// Accordion.Trigger: section header row (number + title + lesson count + progress)
// Accordion.Content: lesson list
```

**Client boundary:** Progress data (which section is incomplete) requires `useProgressStore` which is a Zustand client store. The accordion default open state must be determined client-side, or the entire page becomes `'use client'`. Best approach: the page is a Server Component that renders the accordion structure; the default open state is managed by the `Accordion` client sub-component (Radix Accordion is always a client component).

### Pattern 5: Breadcrumb Hierarchy Update

**What:** `LessonBreadcrumb` changes from `Course > Lesson` to `Course > Section > Lesson`. This requires two new props: `sectionTitle: string` and `sectionSlug: string`. The `sectionSlug` is used to link to the section anchor on the course overview page.

**When to use:** When navigation hierarchy gains a new level.

**Example:**
```typescript
// components/lesson-breadcrumb.tsx
type LessonBreadcrumbProps = {
  courseSlug: string      // 'python'
  courseTitle: string     // 'Python Course'
  sectionTitle: string    // 'Python Fundamentals'  — NEW
  sectionSlug: string     // '01-python-fundamentals' — NEW (for anchor link)
  lessonTitle: string
}

// Breadcrumb: Python Course > Python Fundamentals > What is Programming?
// Links:      /courses/python  >  /courses/python#01-python-fundamentals  >  (current)
```

**Call site:** `app/courses/[courseSlug]/[lessonSlug]/page.tsx` already resolves `sourceCourseSlug` (Phase 4). The `sectionTitle` and `sectionSlug` come from the `Section` object matched by `sourceCourseSlug`.

### Anti-Patterns to Avoid

- **Fetching homepage data client-side:** `getUnifiedCourse()` is a Server-Component-only function. Never call it inside `'use client'` components. Pass data as props down to client components.
- **Making `CourseSidebar` + `MobileSidebarTrigger` out of sync:** Both receive the same lesson/section data from `CourseLayout`. Updating one prop interface without the other breaks mobile nav.
- **Inline scroll listener in `SiteHeader`:** `SiteHeader` is a Server Component. Scroll behavior must live in a `'use client'` sub-component. A separate `use-scrolled.ts` hook is the correct pattern.
- **Using `Accordion` for sidebar instead of `Collapsible`:** The sidebar only needs to expand/collapse one section at a time (the active one). `Collapsible` per section (all independently controllable) is more appropriate than a single `Accordion` (which ties sections together).
- **Adding Collapsible/Accordion as new shadcn/ui components:** They are already available as `radix-ui` primitives. Do not add shadcn wrapper components unless specifically needed for the shadcn token system.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion with ARIA | Custom details/summary wrangling | `radix-ui` Accordion | Built-in `aria-expanded`, keyboard navigation, controlled/uncontrolled state |
| Collapsible sidebar sections | CSS `max-height: 0` toggle | `radix-ui` Collapsible | Smooth height animation, focus management, `aria-expanded` |
| Scroll detection | Inline `addEventListener` in component | `use-scrolled` hook with cleanup | Prevents memory leaks, SSR-safe, reusable |
| Breadcrumb separators + ARIA | Manual `>` characters | shadcn/ui Breadcrumb | Already has `aria-label="breadcrumb"`, `aria-current="page"`, correct semantic roles |
| Card hover animations | Manual CSS transitions | Tailwind `transition-all duration-200 hover:-translate-y-px hover:shadow-md` | No JS needed; `motion-safe:` prefix handles reduced-motion |

---

## Common Pitfalls

### Pitfall 1: CourseSidebar prop interface partially updated

**What goes wrong:** `CourseLayout` passes `sections: Section[]` to `CourseSidebar` but still passes `lessons: LessonMeta[]` to `MobileSidebarTrigger`. Mobile nav is broken; desktop is fine.

**Why it happens:** Two separate components receive the same data with the same old interface. Developers update one, miss the other.

**How to avoid:** Update `CourseLayout`, `CourseSidebar`, and `MobileSidebarTrigger` in a single commit. The TypeScript compiler will catch mismatched props if the type change is applied to both simultaneously.

**Warning signs:** TypeScript compile error on `MobileSidebarTrigger` — it expects `lessons` but receives `sections`.

### Pitfall 2: Scroll blur applied on server-rendered header shell

**What goes wrong:** Developer wraps the entire `<header>` in `'use client'` to get scroll state. This forces the header to hydrate before rendering, causing layout shift or FOUC.

**Why it happens:** Scroll state seems like a natural concern for the `<header>` element itself.

**How to avoid:** Keep the `<header>` element server-rendered. Only the inner right cluster (CTA + search + toggle) needs to be `'use client'`. The scroll-dependent border class can be applied via a data attribute set by the client sub-component on mount.

**Warning signs:** The header flashes on initial load; CLS score increases.

### Pitfall 3: Homepage section cards missing progress because store hasn't hydrated

**What goes wrong:** Section cards show 0% progress even after the user has completed lessons. The progress bar renders empty on first paint.

**Why it happens:** `CourseProgressBar` uses `useProgressStore` which hydrates from localStorage after mount. The first render sees empty state.

**How to avoid:** This is expected behavior — it's a known hydration sequence with Zustand persist. The fix is to have `CourseProgressBar` show a skeleton or simply render 0% until hydration. The existing `ProgressHydration` component (already present) handles this. Ensure it runs before section cards render by keeping it in `app/layout.tsx`.

**Warning signs:** Progress shows 0% always, even after marking lessons complete.

### Pitfall 4: Breadcrumb section link breaks when Phase 4 hasn't landed

**What goes wrong:** The updated `LessonBreadcrumb` uses `sectionSlug` and `sectionTitle` from `LessonMeta.sectionSlug`. If Phase 4 hasn't added `sectionSlug` to `LessonMeta`, the breadcrumb call site has no data to pass.

**Why it happens:** Phase 5 consumes a type field that Phase 4 must produce.

**How to avoid:** Phase 5 must not begin until Phase 4 (`lib/section-map.ts`, updated `LessonMeta` type with `sectionSlug`, `getUnifiedCourse()`) is merged. The TypeScript compiler enforces this: if `LessonMeta` lacks `sectionSlug`, the call site fails to compile.

**Warning signs:** TypeScript error on `sectionSlug` property access in the lesson page.

### Pitfall 5: Course overview accordion page route confusion

**What goes wrong:** The course overview for `courseSlug = 'python'` shows the Phase 4 data correctly, but the existing 12 individual `courseSlug` routes (e.g., `/courses/01-python-fundamentals`) also still render — now with outdated sidebar UI.

**Why it happens:** The existing `generateStaticParams` in Phase 4 emits only `python` as the slug. But the old routes may still be accessible if `dynamicParams` is not set to `false`.

**How to avoid:** Ensure `export const dynamicParams = false` in `app/courses/[courseSlug]/page.tsx`. The 12 old course slugs will return 404 after Phase 4 changes `generateStaticParams` to emit only `python`. This is intentional — the old catalog page (`/courses`) becomes the redirect or the unified overview.

---

## Code Examples

### `use-scrolled.ts` hook
```typescript
// lib/hooks/use-scrolled.ts
// Source: standard React pattern — no library needed
'use client'
import { useState, useEffect } from 'react'

export function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()  // initialize
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
```

### `radix-ui` Collapsible import pattern
```typescript
// Source: node_modules/radix-ui inspection — Collapsible confirmed as named export
import { Collapsible } from 'radix-ui'

// Usage in sidebar:
<Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
  <Collapsible.Trigger className="flex items-center justify-between w-full px-2 py-2 text-sm">
    <span>{section.title}</span>
    <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
  </Collapsible.Trigger>
  <Collapsible.Content>
    {/* lesson links */}
  </Collapsible.Content>
</Collapsible.Root>
```

### `radix-ui` Accordion import pattern
```typescript
// Source: node_modules/radix-ui inspection — Accordion confirmed as named export
import { Accordion } from 'radix-ui'

// Usage in course overview:
<Accordion.Root type="single" collapsible defaultValue={defaultSectionSlug}>
  {sections.map((section) => (
    <Accordion.Item key={section.slug} value={section.slug}>
      <Accordion.Trigger>{section.title}</Accordion.Trigger>
      <Accordion.Content>
        {/* lesson list */}
      </Accordion.Content>
    </Accordion.Item>
  ))}
</Accordion.Root>
```

### Updated `LessonBreadcrumb` call site (lesson page)
```typescript
// app/courses/[courseSlug]/[lessonSlug]/page.tsx (post-Phase 4)
// Source: ARCHITECTURE.md data flow section
const course = getUnifiedCourse()
const lesson = course.allLessons.find(l => l.slug === lessonSlug)
const section = course.sections.find(s => s.slug === lesson?.sectionSlug)

// ...
<LessonBreadcrumb
  courseSlug="python"
  courseTitle="Python Course"
  sectionSlug={section!.slug}
  sectionTitle={section!.title}
  lessonTitle={lesson!.title}
/>
```

### Homepage hero section structure
```typescript
// components/homepage/hero-section.tsx
// Source: specs/v1.1-design-spec.md §7.2
export function HeroSection({ courseSlug }: { courseSlug: string }) {
  return (
    <section className="py-24 pb-16 text-center">
      {/* Overline badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-medium mb-6">
        Free · 120+ lessons · Complete beginner friendly
      </div>
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-[14ch] mx-auto mb-4">
        Learn Python from Zero to Confident
      </h1>
      {/* Subheading */}
      <p className="text-lg text-muted-foreground max-w-[50ch] mx-auto mb-8">
        A free, structured course that takes you from 'what is code?' to building
        real programs. No prerequisites. No overwhelm. Just learn.
      </p>
      {/* CTA group */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="h-12 px-8 rounded-lg">
          <Link href={`/courses/${courseSlug}`}>Start the Course</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-lg">
          <Link href={`/courses/${courseSlug}`}>Browse Lessons</Link>
        </Button>
      </div>
    </section>
  )
}
```

---

## Current State vs. Target State

| Artifact | Current | Target |
|----------|---------|--------|
| `app/page.tsx` | `redirect('/courses')` — 4 lines | Real homepage with hero + section cards |
| `components/site-header.tsx` | Logo links to `/courses`; no CTA; no scroll behavior | Logo links to `/`; conditional CTA on `/`; backdrop blur + border on scroll |
| `components/course-sidebar.tsx` | Accepts `lessons: LessonMeta[]`; flat list | Accepts `sections: Section[]`; collapsible section groups |
| `components/mobile-sidebar-trigger.tsx` | Same flat list | Same section grouping |
| `app/courses/[courseSlug]/page.tsx` | Flat ordered lesson list | Accordion section list with per-section progress |
| `components/lesson-breadcrumb.tsx` | `Courses > CourseTitle > LessonTitle` | `Python Course > SectionTitle > LessonTitle` |

---

## Upstream Dependencies from Phase 4

Phase 5 MUST have these from Phase 4 before implementation:

| Phase 4 Artifact | What Phase 5 Consumes |
|------------------|-----------------------|
| `lib/section-map.ts` | `SECTION_MAP` constants (section titles for sidebar/cards) |
| `lib/content.ts` — `Section` type | Prop type for sidebar, course overview, homepage cards |
| `lib/content.ts` — `getUnifiedCourse()` | Data source for homepage, course overview, sidebar |
| `LessonMeta.sectionSlug` field | Used by lesson page to pass section to breadcrumb |
| `LessonMeta.sourceCourseSlug` field | Used by lesson page for existing exercise/mindmap getters |
| `lib/store/progress.ts` migration | Progress reads `python` key — sidebar and progress bars must use correct key |
| Route `courseSlug = 'python'` working | Course overview and sidebar work at `/courses/python` |

---

## Open Questions

1. **URL for "Browse Lessons" CTA on homepage**
   - What we know: The CTA should link to the course. The course lives at `/courses/python` (post-Phase 4).
   - What's unclear: Whether both hero CTAs ("Start the Course" + "Browse Lessons") point to `/courses/python` or if "Browse Lessons" scrolls to the section cards on the homepage itself.
   - Recommendation: Both CTAs link to `/courses/python`. The homepage section cards are already visible below the hero — no anchor needed.

2. **Course overview page route: `/courses/python` vs new `/course`**
   - What we know: Design spec §8 shows both options. Architecture research recommends keeping `/courses/[courseSlug]` stable.
   - What's unclear: Whether the old `/courses` catalog page (showing 12 course cards) should be replaced or kept.
   - Recommendation: Reuse `/courses/[courseSlug]/page.tsx` with `courseSlug = 'python'`. The old `/courses` page (`app/courses/page.tsx`) can redirect to `/courses/python` or be updated to show a single "Python Course" entry. This minimizes route changes and preserves URL stability.

3. **Sidebar behavior: show all sections collapsed vs. auto-expand active section**
   - What we know: Design spec §12.5 describes "show lesson list only for current section."
   - What's unclear: Whether non-active sections show all their lessons when clicked (like an accordion) or stay collapsed.
   - Recommendation: Use `Collapsible.Root` per section (independently controllable), not a single `Accordion.Root`. The active section containing the current lesson auto-expands on mount. Users can manually expand/collapse others.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 + @testing-library/react ^16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `pnpm test -- --run` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOME-01 | Hero section renders heading, subheading, and CTA links | unit | `pnpm test -- __tests__/components/hero-section.test.tsx --run` | ❌ Wave 0 |
| HOME-02 | `SectionCardsGrid` renders 12 cards with correct titles and lesson counts | unit | `pnpm test -- __tests__/components/section-cards-grid.test.tsx --run` | ❌ Wave 0 |
| HOME-03 | Header shows "Start Learning" button only on `/` | unit | `pnpm test -- __tests__/components/site-header.test.tsx --run` | ❌ Wave 0 |
| HOME-04 | `useScrolled` returns `true` when `scrollY > threshold` | unit | `pnpm test -- __tests__/lib/use-scrolled.test.ts --run` | ❌ Wave 0 |
| STRUCT-02 | Course overview accordion renders section titles and expands on click | unit | `pnpm test -- __tests__/components/course-overview-accordion.test.tsx --run` | ❌ Wave 0 |
| STRUCT-03 | Sidebar renders section headers and collapsible lesson lists | unit | `pnpm test -- __tests__/components/course-sidebar.test.tsx --run` | ✅ exists (needs update) |
| STRUCT-05 | Breadcrumb renders 4 levels: Course > Section > Lesson; correct hrefs | unit | `pnpm test -- __tests__/components/lesson-breadcrumb.test.tsx --run` | ✅ exists (needs update) |

### Sampling Rate
- **Per task commit:** `pnpm test -- --run` (full suite, ~15s)
- **Per wave merge:** `pnpm test -- --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/components/hero-section.test.tsx` — covers HOME-01
- [ ] `__tests__/components/section-cards-grid.test.tsx` — covers HOME-02
- [ ] `__tests__/components/site-header.test.tsx` — covers HOME-03 (conditional CTA)
- [ ] `__tests__/lib/use-scrolled.test.ts` — covers HOME-04 (hook unit test)
- [ ] `__tests__/components/course-overview-accordion.test.tsx` — covers STRUCT-02
- [ ] `__tests__/components/course-sidebar.test.tsx` — EXISTS but must be updated: current tests use `lessons: LessonMeta[]` prop; new tests must use `sections: Section[]` prop
- [ ] `__tests__/components/lesson-breadcrumb.test.tsx` — EXISTS but must be updated: current tests check 3 breadcrumb levels; new tests must check 4 levels (Course > Section > Lesson) and new hrefs

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection (all source files read):
  - `app/page.tsx` — confirmed 4-line redirect
  - `app/courses/page.tsx` — confirmed `getAllCourses()` flat grid
  - `app/courses/[courseSlug]/layout.tsx` — confirmed `getCourse()` + `CourseSidebar` + `MobileSidebarTrigger` prop interfaces
  - `app/courses/[courseSlug]/page.tsx` — confirmed flat lesson list structure
  - `components/course-sidebar.tsx` — confirmed `lessons: LessonMeta[]` prop interface
  - `components/mobile-sidebar-trigger.tsx` — confirmed same `lessons: LessonMeta[]` prop interface
  - `components/site-header.tsx` — confirmed logo links to `/courses`, no CTA, no scroll behavior
  - `components/lesson-breadcrumb.tsx` — confirmed 3-level hierarchy, shadcn/ui Breadcrumb components
  - `components/ui/` — confirmed: badge, breadcrumb, button, card, dialog, separator, sheet
  - `lib/content.ts` — confirmed current `LessonMeta` and `Course` types; `getUnifiedCourse()` does NOT exist yet (Phase 4 deliverable)
  - `package.json` — confirmed: `radix-ui` ^1.4.3, `lucide-react` ^0.577.0, `motion` ^12.36.0, `next-themes` ^0.4.6
  - `node_modules/radix-ui` — confirmed `Accordion` and `Collapsible` exported as named exports
  - `__tests__/components/course-sidebar.test.tsx` — confirmed Vitest + RTL test structure and current prop interface
  - `__tests__/components/lesson-breadcrumb.test.tsx` — confirmed 3-level breadcrumb tests
- `specs/v1.1-design-spec.md` §7 (Homepage), §8 (Course Structure), §12 (Component Patterns) — HIGH confidence (project-authored spec)
- `.planning/research/ARCHITECTURE.md` — HIGH confidence (prior research phase, codebase-verified)
- `.planning/research/FEATURES.md` — HIGH confidence (prior research phase)

### Secondary (MEDIUM confidence)
- radix-ui Collapsible/Accordion API — verified via `node_modules` inspection; npm docs would confirm prop names

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed present via `package.json` and `node_modules` inspection
- Architecture: HIGH — all source files read directly; prop interfaces confirmed
- Pitfalls: HIGH — derived from direct code inspection of existing component interfaces; Phase 4 dependency risk is factual

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack; no fast-moving dependencies in scope)
