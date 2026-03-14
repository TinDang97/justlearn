# Stack Research

**Domain:** MDX learning platform — lesson chunking, course consolidation, ToC, homepage redesign, enhanced syntax highlighting
**Researched:** 2026-03-14
**Confidence:** HIGH (verified against installed versions and official docs)

---

> **Scope:** This document covers ONLY stack additions and changes for v1.1 features.
> The existing v1.0 stack (Next.js 15, shadcn/ui, Tailwind v4, rehype-pretty-code + Shiki, Pyodide, ReactFlow, Fuse.js, Zustand, Motion) is validated and unchanged.

---

## What Already Exists (Do NOT Re-Install)

| Package | Installed Version | Status |
|---------|------------------|--------|
| `rehype-pretty-code` | 0.14.3 | Current — no upgrade needed |
| `shiki` | 4.0.2 | Current — matches rehype-pretty-code peer dep |
| `rehype-slug` | 6.0.0 | Current — required by ToC pipeline |
| `@tailwindcss/typography` | 0.5.19 | Current |
| `remark-gfm` | 4.x | Current |
| `next` | 15.5.12 | Current |

---

## New Additions Required

### Feature 1: Table of Contents (Lesson-Level ToC)

**Decision: `@stefanprobst/rehype-extract-toc` over `rehype-toc` or `remark-toc`**

`rehype-toc` (JS-DevTools) injects a raw HTML `<nav>` into the document body — you cannot render it as a React sidebar component. `remark-toc` inserts a Markdown list inline inside the document — no sidebar support. `@stefanprobst/rehype-extract-toc` attaches the ToC tree to `vfile.data.toc` and exposes it as a named MDX export (`tableOfContents`), making it available as typed structured data to any React component. This is the only approach compatible with the existing `@next/mdx` + App Router pattern where lesson content is a Server Component.

**Known Issue: ESM sub-path exports with `@next/mdx`**

Next.js issue #73757 documents that string-based plugin resolution in `next.config.mjs` fails for packages with multiple ESM exports. The fix is to import plugins as module imports directly in `next.config.mjs` — which the project already does (it's an `.mjs` file). No workaround needed beyond the existing file format.

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@stefanprobst/rehype-extract-toc` | ^3.0.0 | Extract heading tree from MDX at build time | Attaches `toc` as a named MDX export — available to RSC without client JS; structured data (depth, id, value) drives the sidebar ToC component |

**Scroll spy (active section tracking): Native browser API — no library needed**

Use `IntersectionObserver` in a custom hook (`useActiveHeading`). The hook watches heading elements with `rootMargin: "-10% 0px -80% 0px"` to fire the active state update when a heading reaches the top reading zone. `IntersectionObserver` runs off the main thread; scroll event listeners require throttling and block paint. No library is required or justified for a 5–10 heading ToC.

**ToC sidebar layout: Tailwind CSS utility classes only**

Sticky sidebar (`sticky top-16 overflow-y-auto`) with `max-h-[calc(100vh-4rem)]` is pure Tailwind. The prose area needs a two-column layout wrapper: `grid grid-cols-[1fr_240px] gap-8` for desktop, single column on mobile. This is a layout change in `app/courses/[courseSlug]/[lessonSlug]/page.tsx` — no new library.

---

### Feature 2: Enhanced Code Syntax Highlighting

**Decision: Add `@shikijs/transformers` — do NOT replace `rehype-pretty-code`**

`rehype-pretty-code` 0.14.3 with Shiki 4.0.2 is already installed and working. The current configuration provides dual themes (`github-light` / `github-dark-dimmed`) and raw code extraction for the copy button. What's missing is: diff notation (`[!code ++]` / `[!code --]`), line focus (`[!code focus]`), and error/warning annotations (`[!code error]`). These are provided by `@shikijs/transformers` as composable transformer functions passed to `rehypePrettyCode`'s `transformers` option — no pipeline change required.

Line numbers are already supported by `rehype-pretty-code` via `data-line-numbers` attribute + CSS counters. They require only CSS additions to `globals.css`, not a new library.

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@shikijs/transformers` | ^4.0.2 | Diff, focus, error/warning notation in code blocks | Adds `[!code ++/--]`, `[!code focus]`, `[!code error/warning]` via comment annotations in lesson MD; composable with existing `rehype-pretty-code` options via `transformers: []` array; same Shiki version as installed |

**Version pinning:** `@shikijs/transformers` must match the installed `shiki` major version (4.x). The transformer `matchAlgorithm` option defaults to `v1`; leave at default — `v3` is experimental as of March 2026.

---

### Feature 3: Course Consolidation (12 → 1 Unified Course)

**Decision: No new libraries — pure data model refactor in `lib/content.ts`**

The current `lib/content.ts` reads 12 separate `courses/*/` directories. Consolidation means restructuring to a single `courses/python/` directory with `sections/` subdirectories. The data model needs a new `Section` type and updated `Course` type. This is a TypeScript data layer change, not a stack addition.

The existing `@next/mdx` dynamic import pattern (`import(\`@/courses/${courseSlug}/${lessonSlug}.md\`)`) requires the consolidated path to remain resolvable at build time via `generateStaticParams`. No new tooling.

**Gray-matter for frontmatter in section READMEs**

The current codebase parses course metadata via regex from README.md files. For the consolidated structure, frontmatter YAML (`---\ntitle: ...\n---`) is cleaner for section metadata. `gray-matter` is the standard choice.

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `gray-matter` | ^4.0.3 | YAML frontmatter parsing for section metadata | Replaces regex-based metadata extraction in `lib/content.ts`; section READMEs define `title`, `order`, `description` in frontmatter; standard across MDX ecosystems |

Check if already installed: `pnpm list gray-matter`. If not present, add it. (v1.0 STACK.md listed it as recommended but it may not have been installed — the current code uses regex, suggesting it was skipped.)

---

### Feature 4: Homepage Redesign (JustLearn Branding)

**Decision: No new libraries — shadcn/ui components already cover all needs**

The homepage redesign requires: hero section, course card grid, feature highlights. All of these compose from existing shadcn/ui primitives (`Card`, `Button`, `Badge`), Tailwind utilities, and Motion for animations. The current `app/page.tsx` is a redirect stub — replacing it with a proper landing page layout requires only component authoring.

**Do NOT add:** a landing page template library, a carousel library (overkill for a 1-course homepage), or a marketing component library (conflicts with shadcn/ui).

The `lucide-react` icon set (already installed, ^0.577.0) covers all needed icons for feature sections.

---

## Installation

```bash
# ToC extraction plugin
pnpm add @stefanprobst/rehype-extract-toc

# Shiki transformers for enhanced code annotations
pnpm add @shikijs/transformers

# Frontmatter parser (verify not already installed)
pnpm list gray-matter || pnpm add gray-matter
```

---

## Configuration Changes Required

### `next.config.mjs` — Add ToC extraction after `rehype-slug`

```js
import rehypeExtractToc from '@stefanprobst/rehype-extract-toc'
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx'
import { transformerNotationDiff, transformerNotationFocus, transformerNotationErrorLevel } from '@shikijs/transformers'

const rehypePrettyCodeOptions = {
  theme: { light: 'github-light', dark: 'github-dark-dimmed' },
  keepBackground: false,
  transformers: [
    transformerNotationDiff(),
    transformerNotationFocus(),
    transformerNotationErrorLevel(),
  ],
}

// rehypePlugins order — sequence matters:
// 1. extractRawCode (existing)
// 2. [rehypePrettyCode, rehypePrettyCodeOptions]
// 3. forwardRawCode (existing)
// 4. rehypeSlug  ← must precede rehypeExtractToc (slug adds IDs)
// 5. rehypeExtractToc
// 6. [withTocExport, { name: 'tableOfContents' }]
```

### `globals.css` — Add line numbers CSS

```css
/* Line numbers — triggered by showLineNumbers meta in code fences */
code[data-line-numbers] {
  counter-reset: line;
}
code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1rem;
  margin-right: 1.5rem;
  text-align: right;
  color: var(--muted-foreground);
}
code[data-line-numbers-max-digits="2"] > [data-line]::before { width: 2rem; }
code[data-line-numbers-max-digits="3"] > [data-line]::before { width: 3rem; }

/* Diff notation styling */
[data-highlighted-line-id="diff-add"] { background-color: oklch(0.8 0.15 145 / 0.2); }
[data-highlighted-line-id="diff-remove"] { background-color: oklch(0.7 0.2 27 / 0.2); }
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@stefanprobst/rehype-extract-toc` | `rehype-toc` (JS-DevTools) | Never for React — injects raw HTML `<nav>`, not usable as a React component |
| `@stefanprobst/rehype-extract-toc` | `remark-toc` | Never for sidebar ToC — inserts inline list into document body |
| `@stefanprobst/rehype-extract-toc` | Manual `getHeadings()` regex | Only if MDX named export approach fails; run a separate FS read and parse headings with a regex — no plugin dep but duplicates work already done at compile time |
| `@shikijs/transformers` | Custom rehype visitor | Only if needing a notation not in the transformers package; use custom visitor pattern for unique annotation types |
| Native `IntersectionObserver` hook | `react-scrollspy` library | Only if needing deep configuration for non-standard scroll containers; overkill for a standard document layout |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `rehype-toc` (JS-DevTools `@jsdevtools/rehype-toc`) | Generates static HTML nav injected into document DOM — cannot be extracted as a React sidebar component; last released 2022 | `@stefanprobst/rehype-extract-toc` |
| `remark-toc` | Inserts ToC as inline Markdown list in document body — placement is limited to a `## Table of Contents` marker location, not a sidebar | `@stefanprobst/rehype-extract-toc` |
| `tocbot` | Client-side library that scrapes rendered DOM — requires running in browser after hydration; misses SSR/RSC advantage of build-time extraction | Native `IntersectionObserver` + `@stefanprobst/rehype-extract-toc` |
| Upgrading `shiki` beyond `^4.x` | `rehype-pretty-code` 0.14.x has a peer dep on `shiki ^1.0.0` (maps to 4.x in the npm registry post-rename); bumping Shiki major would break the existing dual-theme configuration | Keep `shiki` at `^4.x`, match `@shikijs/transformers` to same major |
| `gray-matter` alternatives (`front-matter`, `toml-frontmatter`) | Ecosystem standard is `gray-matter`; remark ecosystem uses it internally; section metadata YAML is simple enough that any edge-case feature difference is irrelevant | `gray-matter` |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@shikijs/transformers@^4.0.2` | `shiki@^4.0.2` (installed) | Must match Shiki major; as of March 2026, both are at 4.0.2 |
| `@stefanprobst/rehype-extract-toc@^3.0.0` | `rehype-slug@^6.0.0` (installed) | `rehype-slug` must run before `rehype-extract-toc` in plugin order — slug generates IDs that extract-toc reads |
| `@stefanprobst/rehype-extract-toc@^3.0.0` | `@next/mdx` (installed), `next.config.mjs` (ESM) | Requires direct ESM import in `next.config.mjs`; string-based plugin resolution breaks with sub-path exports (Next.js issue #73757) — already avoided since project uses `.mjs` config |

---

## Sources

- [rehype-pretty-code official docs](https://rehype-pretty.pages.dev/) — HIGH confidence; line numbers, diff transformer options verified
- [Shiki transformers docs](https://shiki.style/packages/transformers) — HIGH confidence; `@shikijs/transformers` 4.0.2 version confirmed (published ~3 days before research date)
- [@stefanprobst/rehype-extract-toc npm](https://www.npmjs.com/package/@stefanprobst/rehype-extract-toc) — MEDIUM confidence; v3.0.0 current, MDX named export via `/mdx` sub-path confirmed
- [Next.js issue #73757](https://github.com/vercel/next.js/issues/73757) — HIGH confidence; ESM sub-path plugin resolution failure documented and workaround confirmed
- [MDX table of contents in Next.js](https://www.nikolailehbr.ink/blog/mdx-table-of-contents/) — MEDIUM confidence; practical implementation walkthrough for App Router
- [CSS-Tricks: IntersectionObserver for ToC](https://css-tricks.com/table-of-contents-with-intersectionobserver/) — HIGH confidence; canonical pattern for scroll spy without library
- Installed package.json inspection (March 2026) — HIGH confidence; exact versions verified against node_modules

---

*Stack research for: JustLearn v1.1 — lesson chunking, ToC, course consolidation, homepage redesign, enhanced syntax highlighting*
*Researched: 2026-03-14*
