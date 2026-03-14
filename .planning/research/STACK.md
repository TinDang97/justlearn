# Technology Stack

**Project:** Python Beginner Learning Platform
**Researched:** 2026-03-14
**Overall Confidence:** MEDIUM-HIGH (core stack HIGH, integrations MEDIUM)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (App Router) | Full-stack React framework | SSG for 120+ markdown lessons gives sub-100ms TTFB; App Router enables React Server Components so heavy content (MDX parsing, syntax highlighting) runs at build time, zero client JS cost |
| React | 18.x | UI runtime | Stable concurrent features (Suspense, transitions) required by App Router; v19 still too new for production |
| TypeScript | 5.x | Type safety | Required to safely model course/lesson/progress data structures across RSC/client boundary |

### Content Rendering Pipeline

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@next/mdx` | latest | MDX compilation | Official solution for local `.md` files on the filesystem; files compile at build time, no runtime MDX parser shipped to client; correct choice when content is local not remote CMS |
| `gray-matter` | ^4.0 | Frontmatter parsing | De-facto standard; parses YAML frontmatter from lesson `.md` files for title, order, slug metadata |
| `shiki` + `@shikijs/rehype` | ^1.x | Syntax highlighting | VS Code-quality highlighting at build time; supports 200+ languages; theme tokens baked into HTML, no client-side highlight.js payload; dual light/dark themes via CSS variables |
| `rehype-slug` | ^6.0 | Heading anchors | Auto-generates IDs for h2/h3 headings enabling lesson section deep-linking |
| `remark-gfm` | ^4.0 | GitHub Flavored Markdown | Tables, strikethrough, task lists used in lesson exercises |

**Decision: `@next/mdx` over `next-mdx-remote`**

Content lives in local `courses/` directory checked into the repo — not a remote CMS. `@next/mdx` compiles files at build time as true Server Components, producing zero MDX runtime in the client bundle. `next-mdx-remote` is designed for CMS/API-fetched content and adds ~30KB client runtime. `next-mdx-remote-client` (a community fork) is better maintained than the original but still unnecessary for local files. Use `@next/mdx`.

### UI Component System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui | v4 (cli) | Component primitives | Copy-owned components (not a package dep) means full style control; built on Radix UI primitives for accessibility; ships with Card, Badge, Button, Separator needed for lesson layout |
| Tailwind CSS | v4.x | Utility-first styling | Zero-config scan in v4 (no tailwind.config.js needed); CSS-first configuration; pairs natively with shadcn/ui; Typography plugin handles Medium-like prose styles |
| `@tailwindcss/typography` | latest | Prose markdown styling | The `prose` class renders rendered MDX content as beautiful long-form reading typography matching Medium aesthetic |
| `next-themes` | ^0.4 | Dark/light mode | Production standard for Next.js App Router theming; zero-flash hydration via `suppressHydrationWarning`; `attribute="class"` works with Tailwind `dark:` prefix |

### Interactive Code Execution

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Pyodide | 0.29.3 | Python interpreter in browser | CPython compiled to WASM; runs real Python (not a subset); includes stdlib + micropip for packages; no server required = no backend infra; correct choice for a static platform |
| `@codemirror/lang-python` | ^6.x | Python syntax in editor | CodeMirror 6 is modular (only pull in Python lang + theme, ~300KB total vs Monaco's 5-10MB); excellent mobile support; production-used by Replit, Sourcegraph |
| `@uiw/react-codemirror` | ^4.x | React wrapper for CodeMirror | Maintained React integration for CodeMirror 6; event-driven, controlled input for exercise validation |

**Pyodide Architecture: Run in Web Worker**

Pyodide WASM execution must run in a Web Worker — not the main thread — to avoid blocking UI. The `use-pyodide` hook pattern (holdenmatt/use-pyodide) or a manual worker setup via Next.js custom webpack config is the correct approach. The WASM bundle (~8MB) is large; cache it with `next/headers` Cache-Control or service worker on first load.

**Decision: CodeMirror 6 over Monaco Editor**

Monaco Editor ships 5-10MB uncompressed — unacceptable for a static learning site targeting beginners on potentially slow connections. CodeMirror 6's modular architecture yields ~300KB for Python editing. Sourcegraph migrated FROM Monaco TO CodeMirror for these exact reasons. For a learning platform (not a full IDE), CodeMirror provides everything needed.

### Animated Mindmaps

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@xyflow/react` | ^12.10 | Graph/mindmap rendering | Purpose-built for node graphs; official mindmap tutorial from xyflow team; SSR support added in v12; dark mode built in; powers production apps like Heuristica |
| `motion` (was framer-motion) | ^11.x | Node/edge animations | Native WAAPI for 120fps; `motion` package is the rebranded framer-motion — same API, same import paths; use `motion` package name going forward |
| `d3-hierarchy` | ^3.x | Tree layout algorithm | Provides Reingold-Tilford tree layout for positioning mindmap nodes mathematically; used alongside ReactFlow for layout computation |

**Decision: ReactFlow over D3 direct**

Building a mindmap renderer directly in D3 requires managing React reconciliation manually. ReactFlow handles node rendering, zoom/pan, and edge routing natively — D3 is only needed for the layout algorithm (`d3-hierarchy`), not rendering. This separation is the recommended pattern from the ReactFlow docs.

**Important: Client Component Boundary**

ReactFlow and motion components require `"use client"`. The pattern is: Server Component fetches lesson concept data → passes to a `<MindmapClient>` wrapper with `"use client"` that renders the animated graph.

### NotebookLM Integration

| Technology | Approach | Why |
|------------|----------|-----|
| Google NotebookLM | iframe embed or external link | NotebookLM has NO public API or embeddable SDK as of March 2026. The integration must be link-based: each lesson links to a pre-configured NotebookLM notebook with the lesson content uploaded. Embedding is not technically feasible via iframe (CSP headers block cross-origin embeds from notebooklm.google.com). |

**Confidence: LOW — verify at implementation time**

NotebookLM's embed/API story changes frequently. The Gemini app integration (Dec 2025) added notebook-as-data-source for Gemini conversations, but this is not embeddable in third-party sites. The safe implementation: provide a prominent "Open in NotebookLM" button per lesson linking to a pre-uploaded notebook. Do NOT plan deep technical embedding; plan for a link handoff.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | ^5.x | Client state | Progress tracking (completed lessons, current position) needs to persist across navigation; Zustand's simple store API is sufficient; avoids Redux boilerplate for a 300-user platform |
| `localStorage` + Zustand `persist` middleware | — | Progress persistence | No auth/backend = localStorage is the only persistence layer; Zustand persist middleware handles serialization cleanly |

**Explicitly NOT using:** Redux Toolkit (overkill for this scope), React Context alone (re-render issues with frequent progress updates), TanStack Query (no API server to query against).

### Search

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Fuse.js | ^7.x | Client-side fuzzy search | 120 lessons is a small corpus; Fuse.js (5M weekly downloads, simpler API than FlexSearch) is correct for this scale; search index built at build time from lesson frontmatter and content summaries |

**Decision: Fuse.js over FlexSearch**

FlexSearch is faster at scale (1M+ documents) but has a more complex API and larger bundle. For 120 lessons, Fuse.js simplicity wins. Index built at build time in a Server Component, serialized to JSON, fetched client-side on search page mount.

### Typography & Design Tokens

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@fontsource/inter` | latest | Body typeface | Medium uses a similar sans-serif; Inter is the standard 2025 choice for reading interfaces; self-hosted via fontsource avoids Google Fonts privacy concerns and network latency |

---

## Alternatives Considered and Rejected

| Category | Recommended | Alternative | Why Rejected |
|----------|-------------|-------------|--------------|
| Code editor | CodeMirror 6 | Monaco Editor | 5-10MB bundle; poor mobile; overkill for beginner exercises |
| MDX loading | `@next/mdx` | `next-mdx-remote` | Client runtime overhead; designed for remote CMS, not local files |
| MDX loading | `@next/mdx` | `next-mdx-remote-client` | Same; community fork of `next-mdx-remote`, still carries client JS cost |
| Syntax highlighting | Shiki | highlight.js | Shiki runs at build time (0 client JS); highlight.js runs client-side |
| Syntax highlighting | Shiki | Prism.js | Same; client-side runtime; worse theme ecosystem |
| Mindmap rendering | ReactFlow | D3 direct | D3 requires manual React reconciliation; ReactFlow handles this |
| State management | Zustand | Redux Toolkit | Excessive boilerplate for a 1-model progress store |
| State management | Zustand | React Query | No server API to query; adds complexity without benefit |
| Search | Fuse.js | Algolia | External service cost and dependency for 120 static documents |
| Search | Fuse.js | FlexSearch | Complex API; no benefit at 120-document scale |
| AI integration | NotebookLM link | Custom LLM | Building LLM infra is explicitly out-of-scope; NotebookLM already exists |

---

## Installation

```bash
# Initialize project
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir

# shadcn/ui
pnpm dlx shadcn@latest init

# Content pipeline
pnpm add @next/mdx @mdx-js/loader @mdx-js/react gray-matter shiki @shikijs/rehype rehype-slug remark-gfm @tailwindcss/typography

# Code execution
pnpm add pyodide @uiw/react-codemirror @codemirror/lang-python @codemirror/theme-one-dark

# Mindmap
pnpm add @xyflow/react motion d3-hierarchy

# State + search
pnpm add zustand fuse.js next-themes

# Fonts
pnpm add @fontsource/inter

# Dev dependencies
pnpm add -D @types/mdx @types/d3-hierarchy
```

---

## Key Configuration Notes

**next.config.ts — enable MDX:**
```ts
import createMDX from '@next/mdx'
const withMDX = createMDX({ options: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: 'github-dark' }]] } })
export default withMDX({ pageExtensions: ['ts', 'tsx', 'md', 'mdx'] })
```

**Pyodide Web Worker pattern:**
Pyodide MUST load in a dedicated `public/pyodide-worker.js` file. Next.js webpack config needs `new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url))` pattern. The WASM payload (~8MB) loads once and is reused across lesson navigation via the worker's persistent scope.

**Tailwind v4 — no config file:**
In v4, all theme customizations go in `globals.css` using `@theme` blocks. The `tailwind.config.js` file is optional and only needed for legacy compat.

---

## Sources

- [Next.js 15 App Router Docs](https://nextjs.org/docs/app/guides) — HIGH confidence
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — HIGH confidence
- [Pyodide 0.29.3 Documentation](https://pyodide.org/en/stable/) — HIGH confidence (official)
- [Pyodide 0.29 Release Notes](https://blog.pyodide.org/posts/0.29-release/) — HIGH confidence
- [ReactFlow v12 Release](https://xyflow.com/blog/react-flow-12-release) — HIGH confidence
- [@xyflow/react npm](https://www.npmjs.com/package/@xyflow/react) — HIGH confidence (v12.10.1 confirmed)
- [ReactFlow Mindmap Tutorial](https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow) — HIGH confidence
- [Animated Mindmaps in Next.js](https://www.inksh.in/blog/next-tutorial/mind-maps) — MEDIUM confidence
- [Motion (Framer Motion) for React](https://motion.dev/docs/react) — HIGH confidence
- [Shiki Rehype Plugin](https://rehype-pretty.pages.dev/) — HIGH confidence
- [shadcn/ui Changelog 2025](https://ui.shadcn.com/docs/changelog) — HIGH confidence
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) — HIGH confidence
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) — HIGH confidence
- [Sourcegraph Monaco → CodeMirror Migration](https://sourcegraph.com/blog/migrating-monaco-codemirror) — MEDIUM confidence
- [Pyodide in Next.js Discussion](https://github.com/pyodide/pyodide/discussions/4373) — MEDIUM confidence
- [use-pyodide hook](https://github.com/holdenmatt/use-pyodide) — MEDIUM confidence
- [Fuse.js vs FlexSearch npm trends](https://npmtrends.com/flexsearch-vs-fuse.js-vs-lunr) — MEDIUM confidence
- [NotebookLM Gemini Integration](https://9to5google.com/2025/12/17/gemini-app-notebooklm/) — MEDIUM confidence
- [Zustand vs Jotai 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) — MEDIUM confidence
- [next-mdx-remote-client (community fork)](https://github.com/ipikuka/next-mdx-remote-client) — MEDIUM confidence
