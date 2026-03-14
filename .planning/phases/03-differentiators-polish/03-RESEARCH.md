# Phase 3: Differentiators + Polish - Research

**Researched:** 2026-03-14
**Domain:** ReactFlow mindmaps, Fuse.js fuzzy search, Motion animations, NotebookLM integration
**Confidence:** HIGH (all major claims verified via official docs or official packages)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MIND-01 | Animated concept mindmap per lesson using ReactFlow | @xyflow/react v12 with dagre layout; `'use client'` component loaded via `next/dynamic ssr:false` |
| MIND-02 | Mindmap data defined in JSON alongside lesson content | Per-lesson JSON files in `courses/{courseSlug}/mindmaps/{lessonSlug}.json`; auto-generated from h2 headings at build time |
| MIND-03 | Zoom/pan interaction on mindmap nodes | Built into ReactFlow by default; `fitView`, `zoomOnScroll`, `panOnDrag` props |
| MIND-04 | Smooth entrance animations on mindmap nodes (Framer Motion) | `motion` package `staggerChildren` variant on node container; `motion/react` import path |
| SRCH-01 | Client-side fuzzy search across lesson titles and content (Fuse.js) | Fuse.js v7.1.0 with `includeMatches:true`; pre-built index via `Fuse.createIndex` + `Fuse.parseIndex` |
| SRCH-02 | Search results with highlighted matches and links to lessons | `includeMatches` indices used with recursive highlight utility; `<mark>` wrapping |
| SRCH-03 | Search accessible from global header/navigation | Search input in `SiteHeader` with a `SearchDialog` (shadcn Dialog or Popover) as 'use client' |
| NBLM-01 | NotebookLM link per course page for AI-powered Q&A | Static `href` links to pre-shared NotebookLM public notebooks; one URL per course |
| NBLM-02 | Clear UX explaining what NotebookLM is and how to use it | Callout/info card component on course page with explanation text |
| NBLM-03 | Pre-seeded NotebookLM notebooks created from course MD files | Manual: create 12 notebooks in NotebookLM UI, upload MD files, enable public sharing, record URLs |
| ANIM-01 | Smooth page transitions between lessons and courses | `motion` package with `template.tsx` pattern in App Router; `AnimatePresence` + `motion.div` |
| ANIM-02 | Micro-animations on interactive elements | `whileHover`, `whileTap` on buttons/cards via `motion` package; wrapped in 'use client' |
| ANIM-03 | Skeleton loading states for dynamic content | Tailwind CSS `animate-pulse` skeleton divs shown before client-side hydration completes |
</phase_requirements>

---

## Summary

Phase 3 delivers three independent feature tracks plus a polish track. Each track is well-supported by the current ecosystem with no major missing dependencies.

**ReactFlow mindmaps (MIND-01 to MIND-04):** The library has been renamed from `reactflow` to `@xyflow/react` at v12. It requires a `'use client'` component and must be loaded with `next/dynamic` and `ssr:false` because it relies on DOM measurement. Dagre (`@dagrejs/dagre`) remains the recommended layout engine for tree/mindmap structures. Mindmap JSON files can be auto-generated at build time from lesson heading structure to avoid authoring 120 files by hand.

**Fuse.js search (SRCH-01 to SRCH-03):** Fuse.js is at v7.1.0. The standard Next.js pattern is: generate a search index JSON at build time via a script (using `Fuse.createIndex`), then load it with `Fuse.parseIndex` on the client to avoid rebuild cost. The `includeMatches: true` option provides character indices for highlighting with a lightweight recursive utility.

**NotebookLM (NBLM-01 to NBLM-03):** Public sharing is now available for personal (consumer) Google accounts. Viewers must have a Google account to interact. The embedded iframe approach is out of scope (confirmed in REQUIREMENTS.md). The implementation is mostly non-code: create 12 notebooks, upload MD files, enable public sharing, record 12 URLs into a config file. Under-18 age restriction concern resolved: NotebookLM is now available to all Workspace for Education users since August 2025.

**Animations/polish (ANIM-01 to ANIM-03):** `framer-motion` has been rebranded to the `motion` npm package (v12.x). The import path is now `motion/react` instead of `framer-motion`. For page transitions in Next.js App Router, the `template.tsx` file is the correct mechanism — it re-renders on every navigation while `layout.tsx` preserves state. Skeleton loading uses Tailwind's `animate-pulse` pattern without Motion.

**Primary recommendation:** Install `@xyflow/react`, `@dagrejs/dagre`, and `motion`. Generate search data at build time. Implement NotebookLM as static link-outs with zero runtime dependencies.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@xyflow/react` | 12.10.1 | Interactive node-based mindmap diagrams | Official React Flow v12 package; replaces `reactflow` |
| `@dagrejs/dagre` | latest | Automatic tree/DAG layout for mindmap nodes | Officially recommended by React Flow docs for tree layouts |
| `motion` | 12.x | Page transitions, entrance animations, micro-animations | Rebranded framer-motion; same API at `motion/react` |
| `fuse.js` | 7.1.0 | Client-side fuzzy search with match highlighting | Zero-dependency, well-maintained, proven in Next.js SSG context |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@xyflow/react/dist/style.css` | (bundled) | Required CSS for ReactFlow rendering | Must import in the ReactFlow client component |
| shadcn Dialog / Popover | (existing) | Search UI overlay in SiteHeader | Already in project via shadcn/ui |
| Tailwind `animate-pulse` | (built-in) | Skeleton loading states | ANIM-03 — no extra library needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `motion` (new) | `framer-motion` (legacy) | `framer-motion` still works but `motion` is the maintained package; import path changes from `framer-motion` to `motion/react` |
| `@dagrejs/dagre` | `elkjs` | elkjs is more powerful but significantly more complex; dagre is explicitly recommended for trees/mindmaps |
| Fuse.js | FlexSearch, minisearch | Fuse.js `includeMatches` highlighting is uniquely ergonomic; minisearch is faster on large corpora but 120 lessons is small |
| Tailwind `animate-pulse` | Motion skeleton | Tailwind is sufficient and avoids Motion overhead for a simple CSS pulse |

**Installation:**
```bash
pnpm add @xyflow/react @dagrejs/dagre motion fuse.js
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── courses/
│   └── [courseSlug]/
│       ├── page.tsx               # Add NotebookLM card here (Server Component)
│       └── [lessonSlug]/
│           └── page.tsx           # Add MindmapSection here
├── search/
│   └── page.tsx                   # Search results page
└── template.tsx                   # NEW: page transition wrapper (App Router)

components/
├── mindmap/
│   ├── LessonMindmap.tsx          # Client Component ('use client'); wraps ReactFlow
│   └── MindmapNode.tsx            # Custom node type with motion entrance
├── search/
│   ├── SearchDialog.tsx           # Client Component; Fuse.js search UI in header
│   └── SearchHighlight.tsx        # Highlight utility component
└── notebook-lm/
    └── NotebookLMCard.tsx         # Server Component; static link-out card

courses/
└── {courseSlug}/
    └── mindmaps/
        └── {lessonSlug}.json      # Per-lesson mindmap node/edge data

lib/
├── content.ts                     # Existing — extend with getLessonContent()
├── search-index.ts                # Build-time search index generator
└── mindmap-data.ts                # getMindmapData(courseSlug, lessonSlug) loader

public/
└── search-index.json              # Generated at build time by prebuild script

scripts/
└── generate-search-index.ts       # Build-time: reads all lessons, emits JSON
└── generate-mindmap-data.ts       # Build-time: generates mindmap JSON from headings
```

### Pattern 1: ReactFlow Client Component with SSR Bypass

**What:** ReactFlow requires DOM APIs. Use `next/dynamic` with `ssr:false`, same pattern used for CodeRunner in Phase 2.
**When to use:** Any ReactFlow component — it cannot render server-side.

```typescript
// components/mindmap/LessonMindmap.tsx
'use client'
import { ReactFlow, useNodesState, useEdgesState, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { MindmapData } from '@/lib/mindmap-data'

export function LessonMindmap({ data }: { data: MindmapData }) {
  const [nodes, , onNodesChange] = useNodesState(data.nodes)
  const [edges, , onEdgesChange] = useEdgesState(data.edges)

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        zoomOnScroll
        panOnDrag
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

// app/courses/[courseSlug]/[lessonSlug]/page.tsx
import dynamic from 'next/dynamic'

const LessonMindmap = dynamic(
  () => import('@/components/mindmap/LessonMindmap').then(m => m.LessonMindmap),
  { ssr: false, loading: () => <MindmapSkeleton /> }
)
```

### Pattern 2: Dagre Auto-Layout for Mindmap Nodes

**What:** `@dagrejs/dagre` computes x/y positions for nodes automatically from a parent-child structure. Run once at JSON generation time or at component mount.
**When to use:** When mindmap JSON contains only `{ id, label, parent? }` and you need coordinates.

```typescript
// lib/mindmap-data.ts
import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 150
const NODE_HEIGHT = 40

export function layoutMindmapData(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach(e => g.setEdge(e.source, e.target))
  dagre.layout(g)

  const layoutedNodes = nodes.map(n => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } }
  })

  return { nodes: layoutedNodes, edges }
}
```

### Pattern 3: Fuse.js Build-Time Index + Client Search

**What:** Pre-generate search index at build time; load and query on client. Avoids re-indexing on every page load.
**When to use:** All client-side search.

```typescript
// scripts/generate-search-index.ts  (runs as prebuild npm script)
import Fuse from 'fuse.js'
import fs from 'fs'
import { getAllCourses } from '../lib/content'

const lessons = getAllCourses().flatMap(course =>
  course.lessons.map(lesson => ({
    id: `${lesson.courseSlug}/${lesson.slug}`,
    title: lesson.title,
    courseTitle: course.title,
    href: `/courses/${lesson.courseSlug}/${lesson.slug}`,
    // Optionally: read first 200 chars of lesson file for excerpt
  }))
)

const keys = ['title', 'courseTitle']
const index = Fuse.createIndex(keys, lessons)

fs.writeFileSync('public/search-data.json', JSON.stringify(lessons))
fs.writeFileSync('public/search-index.json', JSON.stringify(index.toJSON()))
```

```typescript
// components/search/SearchDialog.tsx
'use client'
import Fuse from 'fuse.js'
import { useState, useEffect, useDeferredValue } from 'react'
import searchData from '@/public/search-data.json'
import searchIndexData from '@/public/search-index.json'

const fuseIndex = Fuse.parseIndex(searchIndexData)
const fuse = new Fuse(searchData, {
  keys: ['title', 'courseTitle'],
  includeMatches: true,
  threshold: 0.3,
}, fuseIndex)

export function SearchDialog() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const results = deferredQuery.length >= 2 ? fuse.search(deferredQuery) : []
  // ...
}
```

### Pattern 4: Motion Page Transitions via template.tsx

**What:** `template.tsx` in App Router re-renders on every navigation (unlike `layout.tsx` which preserves state). Wrap children in `motion.div` with `AnimatePresence`.
**When to use:** ANIM-01 — page-level transitions between lesson and course routes.

```typescript
// app/template.tsx  (NEW FILE)
'use client'
import { motion } from 'motion/react'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
```

> Note: `AnimatePresence` wrapping is NOT needed at the template level — the template itself unmounts/remounts per navigation, so `initial`/`animate` fire naturally. `AnimatePresence` is only needed for exit animations of dynamically rendered children (e.g., search results).

### Pattern 5: Motion Micro-Animations

**What:** `whileHover` and `whileTap` on interactive elements for tactile feedback.
**When to use:** ANIM-02 — buttons, cards, toggles.

```typescript
// Source: motion.dev docs — gesture animations
'use client'
import { motion } from 'motion/react'

// Wrap or replace a button
<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Run Code
</motion.button>
```

### Pattern 6: Tailwind Skeleton Loading

**What:** `animate-pulse` with shaped placeholder divs shown while dynamic components hydrate.
**When to use:** ANIM-03 — CodeRunner skeleton, MindmapSkeleton, progress bar skeleton.

```typescript
// components/mindmap/MindmapSkeleton.tsx
export function MindmapSkeleton() {
  return (
    <div className="w-full h-[400px] rounded-lg bg-muted animate-pulse" />
  )
}
```

### Pattern 7: NotebookLM Static Link-Out Card

**What:** A Server Component with hardcoded notebook URLs per course. No runtime dependencies.
**When to use:** NBLM-01, NBLM-02 — rendered on each course page.

```typescript
// lib/notebook-urls.ts (static config)
export const NOTEBOOK_URLS: Record<string, string> = {
  '01-python-fundamentals': 'https://notebooklm.google.com/notebook/...',
  '02-data-types-variables': 'https://notebooklm.google.com/notebook/...',
  // ... 12 entries
}

// components/notebook-lm/NotebookLMCard.tsx (Server Component)
import { NOTEBOOK_URLS } from '@/lib/notebook-urls'

export function NotebookLMCard({ courseSlug }: { courseSlug: string }) {
  const url = NOTEBOOK_URLS[courseSlug]
  if (!url) return null
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">AI Study Assistant</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Ask questions about this course in plain language. NotebookLM is a Google AI tool
        that answers based on the actual course materials — not the wider internet.
        You'll need a Google account to access it.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="...">
        Open in NotebookLM
      </a>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Importing ReactFlow directly in a Server Component:** Crashes at build time. Always use `next/dynamic ssr:false`.
- **Using `layout.tsx` for page transitions instead of `template.tsx`:** `layout.tsx` does NOT remount on navigation — animations never fire.
- **Importing from `framer-motion`:** Still works but is the legacy package. Use `motion` and import from `motion/react`.
- **Running Fuse.js indexing at request time:** 120 lessons is manageable but the correct pattern for SSG is build-time; keeps the client bundle clean.
- **Using `useSearchParams` outside Suspense:** In Next.js 15, `useSearchParams` must be wrapped in `<Suspense>`. Use a URL-param approach OR keep search state entirely client-side in a Dialog.
- **Generating mindmap JSON manually for 120 lessons:** Use a build script that reads h2 headings from each lesson MD file to seed the JSON automatically.
- **Embedding NotebookLM in an iframe:** Blocked by Google CSP. Confirmed out of scope in REQUIREMENTS.md.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph layout positioning | Custom x/y calculation for mindmap nodes | `@dagrejs/dagre` | Dagre handles edge crossing reduction, rank assignment, and spacing — these are NP-hard layout problems |
| Fuzzy string matching | Levenshtein distance implementation | `fuse.js` | Fuse handles multi-key weighted search, tokenization, and match indices |
| Node drag/zoom/pan | Custom canvas or SVG pointer event handling | `@xyflow/react` built-in | ReactFlow's interaction model handles touch, wheel, and mouse uniformly across browsers |
| Animation spring physics | CSS transitions for micro-animations | `motion` `whileHover`/`whileTap` | Spring parameters (stiffness/damping) are calibrated; CSS transitions don't replicate spring feel |
| Search result highlighting | String.indexOf replacement loop | Fuse.js `includeMatches` + recursive highlight utility | Match indices handle overlapping/adjacent matches correctly; naive indexOf misses edge cases |

**Key insight:** Every item in this list exists because the "obvious" custom solution has been tried and abandoned by the ecosystem. The libraries encode that collective learning.

---

## Common Pitfalls

### Pitfall 1: ReactFlow "No width/height on parent" Error
**What goes wrong:** `<ReactFlow>` renders invisibly or with zero dimensions.
**Why it happens:** ReactFlow measures its parent container. If the parent has no explicit width/height (e.g., uses `height: auto`), nodes won't render.
**How to avoid:** Always wrap in a div with explicit dimensions: `style={{ width: '100%', height: 400 }}`.
**Warning signs:** Empty white box; browser console warning about container dimensions.

### Pitfall 2: Missing ReactFlow CSS Import
**What goes wrong:** Nodes render without handles, edges don't display, controls are unstyled.
**Why it happens:** ReactFlow ships its own CSS that must be imported.
**How to avoid:** Add `import '@xyflow/react/dist/style.css'` in the `LessonMindmap.tsx` client component.
**Warning signs:** Nodes appear as raw divs with no styling; edges invisible.

### Pitfall 3: framer-motion vs motion Import Confusion
**What goes wrong:** TypeScript errors or missing exports if mixing `framer-motion` and `motion/react` imports.
**Why it happens:** `framer-motion` (legacy) and `motion` (current) are different packages. Both can be installed simultaneously causing duplication.
**How to avoid:** Install only `motion`; import from `motion/react`. Do NOT install `framer-motion`.
**Warning signs:** Bundle size doubled; TypeScript cannot resolve types.

### Pitfall 4: Fuse.js `threshold` Too Permissive
**What goes wrong:** Search returns unrelated results (e.g., searching "loop" returns "module").
**Why it happens:** Default threshold is 0.6 (very fuzzy). For lesson titles this is too loose.
**How to avoid:** Set `threshold: 0.3` for lesson title search. For 120 short titles, tighter matching is better UX.
**Warning signs:** Every query returns the full result list.

### Pitfall 5: `template.tsx` and `layout.tsx` Conflict
**What goes wrong:** Page transition animations fire twice, or layout state (sidebar) resets on navigation.
**Why it happens:** Both `template.tsx` and `layout.tsx` exist in the same route segment. Layout preserves state; template re-renders. If motion is applied to the wrong one, behavior is unpredictable.
**How to avoid:** Apply `motion.div` ONLY in `template.tsx`. Keep `layout.tsx` as a plain React component (no motion wrappers).
**Warning signs:** Sidebar scroll position resets on every lesson navigation.

### Pitfall 6: NotebookLM Public Sharing Disabled for Workspace Accounts
**What goes wrong:** The "Share publicly" option doesn't appear in the NotebookLM UI.
**Why it happens:** As of August 1, 2025, public sharing is only enabled for personal (consumer) Google accounts. Workspace accounts have it disabled by default.
**How to avoid:** Create the 12 notebooks using a personal Google account. If using a Workspace account, the admin must enable public sharing.
**Warning signs:** No "Public" toggle in the Share dialog.

### Pitfall 7: Search Index Import at Top Level Causes Build Error
**What goes wrong:** Next.js build fails with "Cannot find module" or JSON import errors.
**Why it happens:** `public/search-index.json` doesn't exist before the prebuild script runs.
**How to avoid:** Add the generator script to `package.json` as a `prebuild` script: `"prebuild": "tsx scripts/generate-search-index.ts"`. Also run it locally before `next dev`.
**Warning signs:** CI build passes locally but fails on first deploy.

---

## Code Examples

### Motion Staggered Node Entrance

```typescript
// Source: motion.dev stagger docs + ReactFlow custom node pattern
'use client'
import { motion } from 'motion/react'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

// Custom ReactFlow node
export function MindmapNode({ data }: { data: { label: string } }) {
  return (
    <motion.div variants={nodeVariants} className="rounded border px-3 py-1 text-sm bg-card">
      {data.label}
    </motion.div>
  )
}

// Wrap the ReactFlow component container
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView />
</motion.div>
```

### Fuse.js Match Highlighting Utility

```typescript
// Source: dev.to/noclat — Fuse.js highlighting pattern
import type { RangeTuple } from 'fuse.js'

export function highlight(value: string, indices: readonly RangeTuple[] = [], i = 1): React.ReactNode {
  const pair = indices[indices.length - i]
  if (!pair) return value
  return (
    <>
      {highlight(value.substring(0, pair[0]), indices, i + 1)}
      <mark className="bg-yellow-200 dark:bg-yellow-800">{value.substring(pair[0], pair[1] + 1)}</mark>
      {value.substring(pair[1] + 1)}
    </>
  )
}
```

### Search Index Build Script (package.json hook)

```json
// package.json additions
{
  "scripts": {
    "prebuild": "tsx scripts/generate-search-index.ts",
    "predev": "tsx scripts/generate-search-index.ts"
  },
  "devDependencies": {
    "tsx": "^4.x"
  }
}
```

### Motion Template.tsx for App Router

```typescript
// app/template.tsx
'use client'
import { motion } from 'motion/react'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { motion } from 'framer-motion'` | `import { motion } from 'motion/react'` | ~2024 rebranding | Must install `motion` package, not `framer-motion` |
| `import ReactFlow from 'reactflow'` | `import { ReactFlow } from '@xyflow/react'` | v12, 2024 | Package renamed; default export removed, use named exports |
| Manual mindmap authoring | Script-generated from MD heading structure | Phase 3 decision | Avoids 120 hand-authored JSON files |

**Deprecated/outdated:**
- `reactflow` npm package: Still installable but superseded by `@xyflow/react` at v12
- `dagre` (bare): Use `@dagrejs/dagre` (scoped package is the maintained fork)
- `framer-motion` npm package: Still installable, still works. Superseded by `motion` package

---

## Open Questions

1. **Mindmap JSON generation strategy**
   - What we know: 120 lessons exist; h2 headings are consistent across lesson files
   - What's unclear: Whether lesson h2 headings capture enough concept structure for a meaningful mindmap vs just being a table of contents
   - Recommendation: Run the generator script on a sample of 5 lessons, manually review output, decide whether to enrich the JSON schema before automating all 120

2. **NotebookLM notebook creation (manual task)**
   - What we know: 12 notebooks must be created manually via the NotebookLM UI; each takes ~5 minutes
   - What's unclear: Whether the instructor/developer has a personal Google account (required for public sharing)
   - Recommendation: Plan for ~1 hour of manual notebook creation time before Plan 03-03 can be verified

3. **Motion `template.tsx` exit animation support**
   - What we know: `template.tsx` remounts on navigation, so `initial`/`animate` work. Exit animations require `AnimatePresence` wrapping the template from the parent — which is `layout.tsx`, a Server Component.
   - What's unclear: Whether wrapping a Client Component (`template.tsx`) with a Server Component (`layout.tsx`) allows `AnimatePresence` to detect unmounting
   - Recommendation: Implement entry-only transitions (opacity/y fade in) for v1; skip exit animations. The FrozenRouter workaround relies on Next.js internals that can break on version updates.

4. **Search page vs dialog**
   - What we know: SRCH-03 says "accessible from global header"; SRCH-02 says "search results page with highlighted matches"
   - What's unclear: Whether results should appear in a floating dropdown/dialog or navigate to a `/search?q=...` page
   - Recommendation: Use a Dialog in the header for instant results (no page reload per SRCH-02), with an optional full `/search` page for accessibility. Plan 03-02 should decide.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x with jsdom + @testing-library/react |
| Config file | `vitest.config.ts` (existing) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIND-01 | LessonMindmap renders without crashing | unit | `pnpm test -- --reporter=verbose __tests__/components/mindmap.test.tsx` | Wave 0 |
| MIND-02 | getMindmapData returns correct node/edge structure for a lesson | unit | `pnpm test -- --reporter=verbose __tests__/lib/mindmap-data.test.ts` | Wave 0 |
| MIND-03 | ReactFlow renders with fitView and zoom/pan props | unit (render check) | same as MIND-01 | Wave 0 |
| MIND-04 | Motion variants are applied to node container | unit | same as MIND-01 | Wave 0 |
| SRCH-01 | Fuse.js returns results for a known query | unit | `pnpm test -- --reporter=verbose __tests__/lib/search.test.ts` | Wave 0 |
| SRCH-02 | highlight() utility wraps correct characters in `<mark>` | unit | same as SRCH-01 | Wave 0 |
| SRCH-03 | SearchDialog renders an input and shows results | unit | `pnpm test -- --reporter=verbose __tests__/components/search-dialog.test.tsx` | Wave 0 |
| NBLM-01 | NotebookLMCard renders a link with correct href for a course | unit | `pnpm test -- --reporter=verbose __tests__/components/notebook-lm-card.test.tsx` | Wave 0 |
| NBLM-02 | NotebookLMCard renders explanation text | unit | same as NBLM-01 | Wave 0 |
| NBLM-03 | Manual task — 12 notebooks created | manual-only | N/A | N/A |
| ANIM-01 | template.tsx renders children wrapped in motion.div | unit | `pnpm test -- --reporter=verbose __tests__/components/template.test.tsx` | Wave 0 |
| ANIM-02 | Motion button renders with whileHover/whileTap attrs | unit | smoke-tested via component tests | Wave 0 |
| ANIM-03 | MindmapSkeleton renders animate-pulse class | unit | same as MIND-01 | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/components/mindmap.test.tsx` — covers MIND-01, MIND-03, MIND-04, ANIM-03
- [ ] `__tests__/lib/mindmap-data.test.ts` — covers MIND-02 (layout + JSON loading)
- [ ] `__tests__/lib/search.test.ts` — covers SRCH-01, SRCH-02 (Fuse search + highlight utility)
- [ ] `__tests__/components/search-dialog.test.tsx` — covers SRCH-03
- [ ] `__tests__/components/notebook-lm-card.test.tsx` — covers NBLM-01, NBLM-02
- [ ] `__tests__/components/template.test.tsx` — covers ANIM-01
- [ ] `public/search-data.json` + `public/search-index.json` — generated by prebuild script; must exist before tests run
- [ ] Framework install: `pnpm add @xyflow/react @dagrejs/dagre motion fuse.js` — run before Wave 1

> Note: ReactFlow components cannot be tested in jsdom with full rendering (canvas/DOM measurement fails). Tests should verify the component renders without error and passes correct props, not the visual layout.

---

## Sources

### Primary (HIGH confidence)

- [reactflow.dev/learn/getting-started/installation-and-requirements](https://reactflow.dev/learn/getting-started/installation-and-requirements) — package name, version 12.10.1, CSS requirement, parent dimensions
- [reactflow.dev/learn/layouting/layouting](https://reactflow.dev/learn/layouting/layouting) — dagre recommended for trees; @dagrejs/dagre package name
- [reactflow.dev/examples/layout/dagre](https://reactflow.dev/examples/layout/dagre) — dagre layout function pattern
- [fusejs.io/getting-started/installation.html](https://www.fusejs.io/getting-started/installation.html) — Fuse.js v7.1.0 confirmed
- [fusejs.io/api/indexing.html](https://www.fusejs.io/api/indexing.html) — Fuse.createIndex / Fuse.parseIndex build-time pattern
- [fusejs.io/api/options.html](https://www.fusejs.io/api/options.html) — includeMatches, threshold options
- [npmjs.com/package/framer-motion](https://www.npmjs.com/package/framer-motion) — rebranding to `motion`, v12.x confirmed
- [motion.dev](https://motion.dev) — `motion/react` import path confirmed

### Secondary (MEDIUM confidence)

- [imcorfitz.com — Framer Motion App Router pattern](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) — FrozenRouter + template.tsx pattern; multiple community sources agree
- [dev.to/noclat — Fuse.js highlight utility](https://dev.to/noclat/using-fuse-js-with-react-to-build-an-advanced-search-with-highlighting-4b93) — recursive highlight function; pattern verified against Fuse.js `includeMatches` docs
- [support.google.com — NotebookLM public sharing](https://support.google.com/notebooklm/answer/16322204) — public sharing confirmed; personal account requirement verified via multiple sources

### Tertiary (LOW confidence)

- WebSearch results on Motion stagger animations — patterns match official docs but specific stagger values are community-sourced; validate against motion.dev examples during implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official package pages and docs verified for all four libraries
- Architecture: HIGH — patterns derived directly from official ReactFlow, Fuse.js, and motion docs
- Pitfalls: HIGH — most pitfalls documented in official GitHub issues or migration guides
- NotebookLM manual process: MEDIUM — public sharing feature confirmed but exact Workspace admin settings may vary

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days — `motion` and `@xyflow/react` are moderately fast-moving; check release notes before implementation if delayed)
