# Architecture Patterns

**Domain:** Python learning platform (content-heavy, SSG, interactive)
**Researched:** 2026-03-14
**Confidence:** HIGH (Next.js/MDX pipeline verified against official docs; MEDIUM for interactive code runner and mindmap choices)

---

## Recommended Architecture

This platform is a statically-generated content site with client-side interactivity layered on top. The boundary between server and client is decisive: all content is server-rendered at build time, all interactivity (code execution, progress, mindmaps) runs client-side.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Build Time (SSG)                        │
│                                                                 │
│  courses/ (MD files)                                            │
│       ↓                                                         │
│  Content Pipeline (gray-matter + @next/mdx + remark/rehype)     │
│       ↓                                                         │
│  generateStaticParams → Static HTML pages (120+ routes)         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Deploy as static assets
┌─────────────────────────▼───────────────────────────────────────┐
│                      Runtime (Browser)                          │
│                                                                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Progress     │  │ Code Runner   │  │ Mindmap Viewer       │  │
│  │ (localStorage│  │ (Pyodide/WASM │  │ (React Flow + Framer │  │
│  │  + Context)  │  │  Web Worker)  │  │  Motion)             │  │
│  └──────────────┘  └───────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  NotebookLM (external link/iframe to notebooklm.google)  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### 1. Content Pipeline (Build-Time Server)

**Responsibility:** Transform raw `.md` files in `courses/` into typed content objects and static HTML.

**Communicates with:** File system (read), Next.js build system (write static pages)

**Implementation:** `gray-matter` parses frontmatter from each lesson file. `@next/mdx` with remark/rehype plugins transforms Markdown to React components. `generateStaticParams` enumerates all `[courseSlug]/[lessonSlug]` combinations for SSG.

**Key files:**
- `next.config.mjs` — MDX configuration with remark plugins (remark-gfm, rehype-pretty-code)
- `mdx-components.tsx` — Global MDX component overrides (custom `pre`, `code`, `h1`–`h6`)
- `lib/content.ts` — Server-only module: reads `courses/` directory, parses frontmatter, returns typed `Course` and `Lesson` objects

**Data produced:**
```typescript
type Course = {
  slug: string          // "01-python-fundamentals"
  title: string
  description: string
  lessonCount: number
  lessons: LessonMeta[]
}

type LessonMeta = {
  slug: string          // "lesson-01-what-is-programming"
  courseSlug: string
  title: string
  duration: string      // "2 hours"
  level: string
  prev: string | null
  next: string | null
}
```

---

### 2. Route Structure (App Router)

**Responsibility:** Map URL paths to page components with shared layouts.

**Communicates with:** Content Pipeline (server), Layout Shell (render), Client Components (hydrate)

**Route tree:**
```
app/
├── layout.tsx                          # Root: font, theme provider, analytics
├── page.tsx                            # Homepage: hero + course catalog
├── (marketing)/
│   └── layout.tsx                      # Minimal header/footer
├── courses/
│   ├── layout.tsx                      # Course section: no sidebar
│   ├── page.tsx                        # Course catalog
│   └── [courseSlug]/
│       ├── layout.tsx                  # Course layout: title, progress bar
│       ├── page.tsx                    # Course overview + lesson list
│       └── [lessonSlug]/
│           ├── layout.tsx              # Lesson layout: sidebar + content area
│           └── page.tsx               # Lesson content + interactive widgets
└── search/
    └── page.tsx                        # Client component: search index
```

**Route group `(marketing)` purpose:** keeps homepage at `/` without affecting URL structure while sharing a different layout than the `/courses` section.

**Partial rendering benefit:** When a student navigates between lessons in the same course, only `[lessonSlug]/page.tsx` re-renders. The course sidebar (in `[courseSlug]/layout.tsx`) and root layout both persist — no sidebar flicker, no theme re-initialization.

---

### 3. Layout Shell

**Responsibility:** Medium-inspired reading frame with responsive sidebar, navigation, and theme.

**Communicates with:** Route Structure (receives children), Progress Store (reads completion state), Theme Provider

**Sub-components:**

| Component | Responsibility | Type |
|-----------|---------------|------|
| `SiteHeader` | Logo, search, dark/light toggle | Client (toggle state) |
| `CourseSidebar` | Lesson list with progress indicators | Client (reads localStorage) |
| `LessonLayout` | Max-width reading column, Tailwind prose | Server |
| `LessonNav` | Previous/Next buttons with keyboard nav | Client |
| `TableOfContents` | Scrollspy TOC from MDX headings | Client |
| `ThemeProvider` | next-themes wrapper at root | Client |

**Medium-inspired reading column:** 680px max-width content column, `@tailwindcss/typography` prose classes for consistent typographic scale, Inter/Geist for body, mono for code blocks.

---

### 4. Progress Store (Client-Only)

**Responsibility:** Track which lessons a student has completed. No backend, no auth.

**Communicates with:** CourseSidebar (display), LessonPage (mark complete button), CourseOverview (completion percentage)

**Implementation:** React Context wrapping the root layout, backed by `localStorage`. Must be a Client Component (`'use client'`). All reads/writes happen inside `useEffect` to avoid SSR mismatch.

```typescript
// shape stored in localStorage key "python-platform-progress"
type ProgressState = {
  completedLessons: Record<string, boolean>  // key: "courseSlug/lessonSlug"
  lastVisited: string | null                 // "courseSlug/lessonSlug"
}
```

**Constraint:** `localStorage` is undefined during SSR. Access must be wrapped in `useEffect` or a `typeof window !== 'undefined'` guard. The Context provider renders its children immediately with empty state, then hydrates from localStorage on mount — this avoids any SSR/client mismatch.

---

### 5. Interactive Code Runner

**Responsibility:** Run student-written Python directly in the browser without a server.

**Communicates with:** LessonPage (embedded), Pyodide worker (execution), MDX (receives initial code prop)

**Implementation:** Pyodide (CPython compiled to WebAssembly) running in a dedicated Web Worker. The lesson MDX embeds a `<CodeRunner initialCode="..." />` JSX component. The component is a Client Component that:
1. Lazily loads Pyodide on first interaction (not on page load — WASM bundle is ~10MB)
2. Sends code to Web Worker via `postMessage`
3. Captures stdout/stderr and renders in a terminal-style output panel

**Key library:** `react-py` (wraps Pyodide with React hooks) or a custom `use-pyodide` hook. `react-py` is ~700 GitHub stars and actively maintained as of 2025.

**Performance constraint:** Pyodide initial load is 3-8 seconds on first use. Must show a loading indicator. After load, subsequent executions are fast. Do NOT load Pyodide on page load — only on first "Run" button click.

**Sandboxing:** Pyodide in a Web Worker cannot access the DOM or make arbitrary network requests. This is the correct security boundary for student code execution.

---

### 6. Animated Mindmap Viewer

**Responsibility:** Visualize key concepts for each lesson as an animated, navigable mindmap.

**Communicates with:** LessonPage (embedded), static mindmap data (JSON or defined in MDX)

**Implementation:** React Flow (formerly `reactflow`) for the graph layout engine, Framer Motion for entrance animations. Each lesson has a corresponding mindmap definition — either co-located JSON or defined as a prop on a `<Mindmap>` MDX component.

**Recommended library:** React Flow (`@xyflow/react`) — purpose-built for node-edge graphs, handles zoom/pan, has built-in layout algorithms. D3-force is an alternative but requires significantly more implementation work for this use case.

**Data shape:**
```typescript
type MindmapData = {
  nodes: { id: string; label: string; type: 'root' | 'concept' | 'detail' }[]
  edges: { source: string; target: string }[]
}
```

Mindmap data lives in `content/mindmaps/[courseSlug]/[lessonSlug].json` — separated from MDX to keep lesson files clean.

---

### 7. NotebookLM Integration

**Responsibility:** Provide AI-powered Q&A and note-taking for each course/lesson.

**Communicates with:** External (Google NotebookLM service) — one-way link out

**Constraint (VERIFIED):** Google NotebookLM does not expose a public API or support iframe embedding as of March 2026. Community reports confirm iframe embedding is blocked. The integration must be a deep link pattern, not an embedded widget.

**Implementation:** A persistent "Study with AI" button in the lesson sidebar that opens NotebookLM in a new tab with the lesson context pre-loaded. Each course has a curated NotebookLM notebook URL (pre-seeded with all lesson MD files as sources). These URLs are static config in `content/notebooklm-links.json`.

```typescript
// content/notebooklm-links.json
{
  "01-python-fundamentals": "https://notebooklm.google.com/notebook/...",
  "02-data-types-variables": "https://notebooklm.google.com/notebook/..."
}
```

This is an operational setup task per course, not a technical integration. It requires manually creating 12 notebooks and uploading lesson content.

---

### 8. Search

**Responsibility:** Full-text search across all 120+ lessons without a search API.

**Communicates with:** Content Pipeline (build-time index generation), Browser (client-side search)

**Implementation:** Build-time script generates a `public/search-index.json` containing lesson titles, slugs, and content excerpts. At runtime, `fuse.js` (fuzzy search, ~4KB gzipped) queries this index client-side. The search page is a Client Component.

**Scale check:** 120 lessons × ~500 chars excerpt = ~60KB JSON index. Acceptable for client-side loading.

---

## Data Flow

### Content Rendering (Build Time → Static)

```
courses/[courseSlug]/[lessonSlug].md
    │
    ▼ gray-matter
Frontmatter (title, duration, level) + raw markdown body
    │
    ▼ @next/mdx + remark-gfm + rehype-pretty-code
React Server Component tree
    │
    ▼ generateStaticParams
Static HTML file (one per lesson = 120+ files)
    │
    ▼ CDN delivery
Browser: HTML + hydration for Client Components
```

### Student Interaction (Runtime)

```
Student visits /courses/01-python-fundamentals/lesson-01-...
    │
    ├── Server: Serves static HTML (instant)
    │
    ├── Client hydrates:
    │   ├── ProgressProvider reads localStorage → updates sidebar indicators
    │   ├── ThemeProvider applies saved theme preference
    │   └── TableOfContents attaches scrollspy
    │
    ├── Student clicks "Run Code":
    │   ├── CodeRunner lazily loads Pyodide (Web Worker)
    │   ├── Executes student code
    │   └── Renders stdout/stderr output
    │
    ├── Student clicks "View Mindmap":
    │   ├── React Flow renders mindmap from JSON
    │   └── Framer Motion plays entrance animation
    │
    ├── Student clicks "Mark Complete":
    │   ├── ProgressProvider updates localStorage
    │   └── CourseSidebar re-renders with completion indicator
    │
    └── Student clicks "Study with AI":
        └── Opens NotebookLM URL in new tab
```

---

## Suggested Build Order

Dependencies determine sequence. Each phase can only start when its dependencies are complete.

### Phase 1: Content Pipeline + Routes (Foundation)

Everything depends on this. No other component can be built without the route structure and content loading working.

- Configure `@next/mdx` in `next.config.mjs`
- Implement `lib/content.ts` (parse frontmatter from all 120 MD files)
- Define `generateStaticParams` for `[courseSlug]/[lessonSlug]`
- Verify all 120 lesson routes resolve at build time
- Implement `mdx-components.tsx` with basic overrides

**Dependency for:** all other phases

### Phase 2: Layout Shell + Navigation

The reading experience must be established before adding widgets to it.

- Root layout with ThemeProvider (`next-themes`)
- Medium-inspired lesson layout (Tailwind prose, max-width column)
- CourseSidebar (static, without progress indicators yet)
- LessonNav (prev/next)
- SiteHeader with dark/light toggle
- TableOfContents (scrollspy)

**Dependency for:** Phase 3 (widgets need a host page)

### Phase 3: Progress Tracking

Simple Client Component, no external dependencies. Adds completion state to the existing sidebar.

- `ProgressProvider` Context with localStorage persistence
- "Mark Complete" button in lesson page
- Sidebar completion indicators
- Course overview completion percentage

**Dependency for:** Phase 5 (search index benefits from knowing lesson metadata is stable)

### Phase 4: Interactive Code Runner

Isolated Client Component. Can be added to any lesson independently.

- Web Worker setup for Pyodide
- `CodeRunner` Client Component with lazy Pyodide load
- Loading/error states
- Register as MDX component so lessons can use `<CodeRunner />`

**Dependency for:** None (orthogonal to other phases)

### Phase 5: Animated Mindmaps

Isolated Client Component. Requires mindmap JSON data to be authored per lesson.

- Define mindmap JSON schema
- Author mindmap data for all 120 lessons (content work, not code)
- `Mindmap` Client Component using React Flow + Framer Motion
- Register as MDX component so lessons can use `<Mindmap />`

**Dependency for:** None (orthogonal to other phases)

### Phase 6: Search

Requires stable content pipeline (Phase 1) before building index.

- Build-time search index generator script
- `public/search-index.json` output
- Search page with `fuse.js` client-side search
- Search UI in SiteHeader

**Dependency for:** None (orthogonal to other phases after Phase 1)

### Phase 7: NotebookLM Integration

Operational task — requires manual notebook creation, minimal code.

- Create 12 NotebookLM notebooks (one per course), upload lesson MD files
- `content/notebooklm-links.json` config
- "Study with AI" button component in lesson sidebar

**Dependency for:** None

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Loading Pyodide at Page Load

**What:** Initializing Pyodide in a `useEffect` on lesson page mount.
**Why bad:** Pyodide WASM bundle is ~8-12MB. It blocks the main thread during parse, adds 3-8 seconds to initial load, and most students never use the code runner on every visit.
**Instead:** Lazy-initialize Pyodide only on first "Run" button click. Show a "Loading Python environment..." spinner during that one-time initialization.

### Anti-Pattern 2: Storing Lesson Content in a Database

**What:** Building a CMS or database to store the 120 lesson files.
**Why bad:** The content already exists as plain MD files. A database adds operational complexity, a synchronization problem, and eliminates the SSG performance advantage.
**Instead:** Treat `courses/` as the source of truth. Build-time pipeline reads files; no runtime database needed.

### Anti-Pattern 3: Server-Side Progress Tracking Without Auth

**What:** Persisting progress to a database keyed by IP or session cookie.
**Why bad:** Project scope excludes auth. IP-based tracking is unreliable and a privacy concern. Session cookies are lost on browser close.
**Instead:** `localStorage` with a stable JSON schema. If auth is ever added later, the localStorage state can be migrated to a server on first authenticated session.

### Anti-Pattern 4: Embedding NotebookLM as an iframe

**What:** Using `<iframe src="https://notebooklm.google.com/...">` to embed the AI assistant inline.
**Why bad:** NotebookLM blocks iframe embedding (X-Frame-Options / CSP). The iframe will be blank or show an error. This was confirmed as a known limitation as of March 2026.
**Instead:** Link out via `target="_blank"` with the course-specific notebook URL.

### Anti-Pattern 5: Collocating Mindmap Data in MDX Files

**What:** Defining mindmap node/edge data as large JSON literals in lesson `.md` files.
**Why bad:** Makes 120 lesson files significantly larger and harder to maintain. Mindmap data is structured data, not prose — it belongs in its own format.
**Instead:** `content/mindmaps/[courseSlug]/[lessonSlug].json` with the MDX component receiving the slug as a prop to load the right data.

---

## Scalability Considerations

This platform targets 300 students. The architecture is designed for simplicity at this scale, not for horizontal scaling.

| Concern | At 300 students | At 3,000 students | At 30,000 students |
|---------|-----------------|-------------------|--------------------|
| Page serving | Static CDN (Vercel/Netlify) — no origin load | Same — CDN scales freely | Same |
| Python execution | Client-side Pyodide — no server cost | Same | Same |
| Progress data | localStorage — no server cost | Same | Would need backend |
| Search | Client-side fuse.js — 60KB index | Same | Index may become large; consider Algolia |
| Build time | ~120 pages; under 30 seconds | N/A (content is fixed) | N/A |
| NotebookLM | 12 static links — no scaling concern | Same | May need API if Google exposes one |

The static + client-side architecture means 300 or 3,000 simultaneous users have identical infrastructure cost: CDN edge bandwidth only.

---

## Sources

- [Next.js App Router MDX Guide](https://nextjs.org/docs/app/guides/mdx) — official, verified 2026-02-27
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — official
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — official
- [react-py (Pyodide React wrapper)](https://github.com/elilambnz/react-py) — verified active
- [Pyodide project](https://github.com/pyodide/pyodide) — WebAssembly Python runtime
- [React Flow (@xyflow/react)](https://reactflow.dev) — node-edge graph library
- [NotebookLM iframe limitation (community confirmed)](https://community.instructure.com/t5/Canvas-Question-Forum/Can-t-Embed-Google-NotebookLM-into-Canvas-Pages/td-p/647259) — MEDIUM confidence (community source, not official docs)
- [Next.js localStorage patterns](https://sentry.io/answers/referenceerror-localstorage-is-not-defined-in-next-js/) — verified pattern for SSR-safe localStorage
- [Tailwind Typography plugin](https://tailwindcss.com/docs/plugins#typography) — official
