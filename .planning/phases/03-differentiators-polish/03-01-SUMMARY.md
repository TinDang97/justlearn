---
phase: 03-differentiators-polish
plan: "01"
subsystem: ui
tags: [reactflow, dagre, motion, mindmap, animation, xyflow]

# Dependency graph
requires:
  - phase: 01-content-reading-shell
    provides: lib/content.ts getAllCourses, lesson MD files in courses/
  - phase: 02-progress-code-runner
    provides: lesson page structure, ssr:false dynamic import pattern
provides:
  - ReactFlow animated concept mindmap on every lesson page (139 pages)
  - Per-lesson mindmap JSON auto-generated from h2 headings (122 lessons)
  - Build-time generator script (scripts/generate-mindmap-data.ts)
  - dagre TB layout utility (lib/mindmap-layout.ts, client-safe)
  - getMindmapData server-only loader (lib/mindmap-data.ts)
  - Motion staggered entrance animations on mindmap nodes
  - MindmapSkeleton animate-pulse loading state
affects: [03-differentiators-polish]

# Tech tracking
tech-stack:
  added:
    - "@xyflow/react@12.10.1 — ReactFlow graph renderer"
    - "@dagrejs/dagre@2.0.4 — automatic graph layout engine"
    - "motion@12.36.0 — spring entrance animations"
    - "fuse.js@7.1.0 — fuzzy search (installed for plan 02 use)"
  patterns:
    - "Client/server split: getMindmapData (fs) in lib/mindmap-data.ts, layoutMindmapData (client-safe) in lib/mindmap-layout.ts"
    - "next/dynamic ssr:false with loading skeleton for ReactFlow hydration"
    - "Server Component passes MindmapData to Client Component via props"
    - "dagre graphlib for automatic TB (top-to-bottom) node positioning"
    - "Motion Variants with staggerChildren for sequential node entrance"

key-files:
  created:
    - lib/mindmap-data.ts — getMindmapData (fs reader) + re-exports layoutMindmapData
    - lib/mindmap-layout.ts — client-safe dagre layout function
    - scripts/generate-mindmap-data.ts — build-time h2 heading extractor
    - components/mindmap/MindmapSkeleton.tsx — animate-pulse loading state
    - components/mindmap/MindmapNode.tsx — motion.div with spring entrance
    - components/mindmap/LessonMindmap.tsx — ReactFlow with zoom/pan
    - components/mindmap/index.tsx — next/dynamic ssr:false wrapper
    - __tests__/lib/mindmap-data.test.ts — 5 unit tests for data layer
    - __tests__/components/mindmap.test.tsx — 4 component tests
  modified:
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx — getMindmapData + MindmapSection render
    - package.json — generate:mindmaps script, predev/prebuild hooks
    - .gitignore — exclude courses/*/mindmaps/*.json generated files

key-decisions:
  - "Split layoutMindmapData into lib/mindmap-layout.ts (client-safe) to prevent webpack 'Can't resolve fs' error when bundled into client components"
  - "MindmapData type uses generic Node[] from @xyflow/react — avoids type gymnastics at JSON parse boundary"
  - "nodeTypes cast as NodeTypes to satisfy ReactFlow prop constraint without widening MindmapNode generic"
  - "spring transition type requires `as const` to satisfy motion/react Variants discriminated union"
  - "predev/prebuild hooks in package.json auto-run generator before dev/build — zero manual step needed"

patterns-established:
  - "Server-only modules (fs): lib/*-data.ts pattern; client-safe utilities: lib/*-layout.ts or lib/*-client.ts"
  - "Build-time data generation: scripts/*.ts + predev/prebuild hooks in package.json"
  - "ReactFlow integration: always ssr:false in next/dynamic, always pass MindmapSkeleton as loading fallback"

requirements-completed: [MIND-01, MIND-02, MIND-03, MIND-04, ANIM-03]

# Metrics
duration: 7min
completed: 2026-03-14
---

# Phase 03 Plan 01: Animated Concept Mindmap Summary

**ReactFlow interactive mindmaps on 139 lesson pages with dagre auto-layout, Motion staggered spring entrance, and build-time JSON generation from h2 headings across 122 lessons**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-14T04:43:24Z
- **Completed:** 2026-03-14T04:50:45Z
- **Tasks:** 2 (TDD: 4 commits — 2x RED + 2x GREEN)
- **Files modified:** 11

## Accomplishments
- Auto-generated mindmap JSON for all 122 lessons (12 courses) from h2 headings via build script
- ReactFlow mindmap section on every lesson page with fitView, zoomOnScroll, panOnDrag
- MindmapNode with spring entrance animation (stiffness:300, damping:24) via Motion variants
- MindmapSkeleton animate-pulse shown during client-side hydration
- 139 static pages build successfully (zero regressions)
- 9 new tests pass (5 data layer + 4 component)

## Task Commits

Each task committed atomically (TDD):

1. **Task 1 RED: mindmap data layer tests** - `c6bbc5a` (test)
2. **Task 1 GREEN: mindmap data layer + generator** - `0669df6` (feat)
3. **Task 2 RED: mindmap component tests** - `d3e71d0` (test)
4. **Task 2 GREEN: mindmap components + lesson page wiring** - `2372b65` (feat)

## Files Created/Modified
- `lib/mindmap-data.ts` — getMindmapData (fs, server-only) + re-exports layoutMindmapData
- `lib/mindmap-layout.ts` — client-safe dagre TB layout (no fs dependency)
- `scripts/generate-mindmap-data.ts` — build-time script: extracts h2s, writes per-lesson JSON
- `components/mindmap/MindmapSkeleton.tsx` — animate-pulse loading placeholder
- `components/mindmap/MindmapNode.tsx` — motion.div with spring Variants, ReactFlow Handles
- `components/mindmap/LessonMindmap.tsx` — ReactFlow with dagre layout, stagger container
- `components/mindmap/index.tsx` — next/dynamic ssr:false + MindmapSection props passthrough
- `__tests__/lib/mindmap-data.test.ts` — 5 tests for getMindmapData and layoutMindmapData
- `__tests__/components/mindmap.test.tsx` — 4 component tests with @xyflow/react and motion mocks
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` — mindmapData fetch + MindmapSection render
- `package.json` — generate:mindmaps script, predev/prebuild auto-generation hooks
- `.gitignore` — exclude generated courses/*/mindmaps/*.json

## Decisions Made
- Separated `layoutMindmapData` into `lib/mindmap-layout.ts` (no fs) to keep client components free of Node.js built-ins
- Used generic `Node[]` type from @xyflow/react at the MindmapData boundary (avoids JSON parse type casting complexity)
- Cast nodeTypes with `as NodeTypes[string]` to satisfy ReactFlow's strict ComponentType constraint
- `spring` animation type requires `as const` in motion/react Variants to match discriminated union

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Separated server-only fs reads from client-safe dagre layout**
- **Found during:** Task 2 GREEN (build attempt)
- **Issue:** `LessonMindmap.tsx` imported `layoutMindmapData` from `lib/mindmap-data.ts` which also imports `fs`. Next.js webpack bundled `fs` into the client chunk, failing with "Can't resolve 'fs'"
- **Fix:** Extracted `layoutMindmapData` into `lib/mindmap-layout.ts` (no fs). `LessonMindmap.tsx` imports from mindmap-layout. `lib/mindmap-data.ts` re-exports from mindmap-layout for test/server compatibility.
- **Files modified:** lib/mindmap-layout.ts (new), lib/mindmap-data.ts (refactored), components/mindmap/LessonMindmap.tsx
- **Verification:** `pnpm build` compiled successfully, 139 pages generated
- **Committed in:** `2372b65` (Task 2 GREEN commit)

**2. [Rule 1 - Bug] Fixed motion Variants type error for spring transition**
- **Found during:** Task 2 GREEN (build type-check)
- **Issue:** `type: 'spring'` inferred as `string` instead of literal type; motion/react Variants `Transition` requires `AnimationGeneratorType` not `string`
- **Fix:** Changed to `type: 'spring' as const` in nodeVariants in MindmapNode.tsx
- **Files modified:** components/mindmap/MindmapNode.tsx
- **Verification:** Type-check passes in production build
- **Committed in:** `2372b65` (Task 2 GREEN commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes required for correct client/server build. No scope creep. Final architecture matches plan intent exactly.

## Issues Encountered
- TypeScript's NodeTypes index signature required a cast for custom node components — standard pattern for ReactFlow custom nodes with typed data

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All mindmap requirements complete (MIND-01 through MIND-04, ANIM-03)
- Mindmaps auto-regenerate on every `pnpm dev` and `pnpm build` via predev/prebuild hooks
- Ready for Phase 03 Plan 02 (search) and Plan 03 (NotebookLM card)

---
*Phase: 03-differentiators-polish*
*Completed: 2026-03-14*
