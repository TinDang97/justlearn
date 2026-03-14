# Phase 6: Lesson Reading, ToC, Highlighting, and Practice — Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 App Router — reading typography, in-page ToC, @shikijs/transformers, MDX callout components, embedded practice blocks
**Confidence:** HIGH (direct codebase inspection + prior architecture/stack/pitfalls research)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| READ-01 | Warm-neutral color palette applied (off-white backgrounds, growth-green primary) | Color tokens defined in design spec §4; applies to `globals.css` CSS custom properties |
| READ-02 | Body text increased to 18px with 1.75 line-height for reading comfort | Typography spec §5; prose override in `globals.css`; `.prose` font-size: 1.125rem |
| READ-03 | JetBrains Mono loaded for code blocks (replacing browser default monospace) | Google Fonts via `next/font/google`; apply to `--font-mono` CSS variable in `layout.tsx` |
| READ-04 | Blockquotes styled as key-concept callouts with green left border | `.prose blockquote` override in `globals.css`; spec §10 defines exact colors and radius |
| READ-05 | Callout MDX components (Tip, Warning, Info) with distinct color treatments | New `components/callout.tsx`; registered in `mdx-components.tsx`; spec §12.6 has full design |
| CHUNK-01 | Per-lesson ToC extracted from headings, displayed as sticky sidebar (desktop) / collapsible bar (mobile) | New `components/lesson-toc.tsx`; `extractHeadings()` in `lib/content.ts` using `github-slugger`; Architecture Pattern 2 |
| CHUNK-02 | Active heading highlighted in ToC via Intersection Observer scroll spy | `useActiveHeading` custom hook inside `lesson-toc.tsx`; native `IntersectionObserver`; `rootMargin: "-10% 0px -80% 0px"` |
| CHUNK-03 | Lesson scroll progress indicator (thin bar at top of viewport) | New `components/scroll-progress.tsx`; `position: fixed; top: header-height`; `requestAnimationFrame` scroll listener |
| CHUNK-04 | Patch dividers between lesson sections with "Part X of Y" labels | CSS + MDX layout in lesson page; `hr` styled as dividers; overline label above h2 (requires custom MDX `hr` override or wrapper) |
| CODE-07 | Code blocks display language badge in header bar | `mdx-components.tsx` `pre` override; read `data-language` from `code` child; add header `<div>` with language badge |
| CODE-08 | Copy button always visible on mobile (not hover-only) | `copy-button.tsx` already partially correct: `opacity-100 md:opacity-0 md:group-hover:opacity-100`; needs "Copied!" text feedback |
| CODE-09 | Line highlighting support via `@shikijs/transformers` | `transformerNotationHighlight()` from `@shikijs/transformers`; added to `rehypePrettyCodeOptions.transformers`; CSS for `.highlighted` class |
| CODE-10 | Diff notation support (`[!code ++]`, `[!code --]`) for showing code changes | `transformerNotationDiff()` from `@shikijs/transformers`; CSS variables for add/remove line backgrounds |
| PRACT-01 | Inline "Try it yourself" practice blocks within lessons with embedded code runner | New `components/practice-block.tsx`; uses existing `CodeRunner`; MDX component registration; spec §12.7 design |
| PRACT-02 | Expandable hint and solution sections in practice blocks | Controlled expand/collapse state in `PracticeBlock`; `details`/`summary` or Radix `Collapsible`; slide animation |
</phase_requirements>

---

## Summary

Phase 6 delivers the reading-quality surface that makes lesson content feel polished and comfortable. It consists of four parallel workstreams: (1) reading typography — warm palette, font loading, prose overrides, blockquote styling, callout MDX components; (2) in-page table of contents — heading extraction at SSG time, client-side scroll spy, responsive layout for desktop sticky sidebar and mobile compact bar; (3) enhanced syntax highlighting — `@shikijs/transformers` integration into the existing `rehype-pretty-code` pipeline for diff and highlight notation plus a code block header bar with language badge; and (4) embedded practice blocks — a new `PracticeBlock` MDX component that wraps the existing `CodeRunner` with prompt text, expandable hints, and expandable solutions.

All four workstreams are independent and can be planned and implemented in parallel. The only ordering constraint is that 06-01 (typography) should land first because it establishes the CSS custom properties that the code block header and callout components depend on for their color values. The existing v1.0 pipeline — Webpack, `@next/mdx`, `rehype-pretty-code`, `rehype-slug`, the `pre` MDX override, and the `CodeRunner` component — is unchanged structurally; each workstream adds to it rather than replacing it.

**Primary recommendation:** Implement in sub-plan order (06-01 → 06-02 → 06-03 → 06-04) because typography tokens are the shared dependency, but treat 06-02 through 06-04 as independent once 06-01 CSS variables are committed.

---

## Standard Stack

### Core (Existing — Do NOT Re-Install)

| Library | Installed Version | Purpose | Phase 6 Use |
|---------|------------------|---------|-------------|
| `rehype-pretty-code` | 0.14.3 | Shiki-based syntax highlighting | Receives new `transformers` option |
| `shiki` | 4.0.2 | Token engine for code highlighting | Peer dep; matched by `@shikijs/transformers` |
| `rehype-slug` | 6.0.0 | Generates heading anchor IDs | ToC IDs must match these |
| `@tailwindcss/typography` | 0.5.19 | Prose base styles | Override with warm palette tokens |
| `next` | 15.5.12 | Framework; App Router SSG | All Server Components pattern |
| `github-slugger` | 2.0.0 (transitive via rehype-slug) | Slug algorithm matching rehype-slug | `extractHeadings()` in `lib/content.ts` |

**Note on `github-slugger`:** Installed transitively at `node_modules/.pnpm/github-slugger@2.0.0`. Must be added as an explicit direct dependency to guarantee the same version is available for `lib/content.ts`. Run `pnpm add github-slugger`.

### New Additions Required

| Library | Version | Purpose | Install Command |
|---------|---------|---------|----------------|
| `@shikijs/transformers` | ^4.0.2 | Diff/highlight/focus notation in code blocks | `pnpm add @shikijs/transformers` |
| `github-slugger` | ^2.0.0 | ToC heading ID extraction (match rehype-slug) | `pnpm add github-slugger` |

**Do NOT install:**
- `@stefanprobst/rehype-extract-toc` — the architecture research recommends it, but the fallback approach (server-side `extractHeadings()` with `github-slugger`) is simpler, equally correct, and avoids the MEDIUM-confidence sub-path ESM export risk. The fallback is the primary approach for Phase 6.
- Any font package for JetBrains Mono beyond `next/font/google` — the built-in `next/font/google` covers it.
- `react-scrollspy` or any ToC library — native `IntersectionObserver` is sufficient for 11 headings per lesson.

### Font Loading

JetBrains Mono is loaded via `next/font/google` in `app/layout.tsx`:

```typescript
// Source: Next.js docs — https://nextjs.org/docs/app/building-your-application/optimizing/fonts
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Applied to <html> element: className={jetbrainsMono.variable}
```

Source Serif 4 is optional for display headings. The design spec notes it as a "trade-off: if bundle size is a concern, use Inter for everything." Phase 6 should load JetBrains Mono first (required by READ-03). Source Serif 4 is at the planner's discretion — include it only if the heading aesthetic is clearly improved in review.

---

## Architecture Patterns

### Recommended File Changes

```
app/
└── layout.tsx              # ADD: JetBrains Mono font variable
└── globals.css             # MODIFY: warm palette tokens, prose overrides,
                            #         code block CSS, scroll progress CSS,
                            #         .highlighted/.diff-add/.diff-remove classes

components/
├── lesson-toc.tsx          # NEW: sticky desktop + collapsible mobile ToC
├── scroll-progress.tsx     # NEW: thin fixed progress bar at viewport top
├── callout.tsx             # NEW: Tip/Warning/Info/Error MDX components
├── practice-block.tsx      # NEW: inline practice with hint + solution expand
└── copy-button.tsx         # MODIFY: add "Copied!" text feedback (small)

lib/
└── content.ts              # ADD: extractHeadings(), Heading type

mdx-components.tsx          # MODIFY: language badge on pre; register Callout,
                            #         PracticeBlock as MDX components; hr override

next.config.mjs             # MODIFY: add @shikijs/transformers to
                            #         rehypePrettyCodeOptions.transformers
```

### Pattern 1: Server-Side Heading Extraction (CHUNK-01 / CHUNK-02)

**What:** The lesson Server Component reads the raw MD file once and extracts h2/h3 headings using `extractHeadings()` which uses `github-slugger` to generate IDs identical to what `rehype-slug` produces. The `Heading[]` array is passed as props to the Client Component `LessonToc`. No plugin changes to the MDX pipeline.

**Why this approach over `@stefanprobst/rehype-extract-toc`:** Simpler, zero additional plugins, no ESM sub-path risk, testable with plain TypeScript unit tests.

**Key constraint:** `github-slugger` must be used — not a custom `slugify`. `rehype-slug` uses `github-slugger@^2.0.0` internally. Using a different algorithm produces mismatched IDs for headings with punctuation (e.g., `"Part 1: What is a Computer Program? (30 minutes)"` → `part-1-what-is-a-computer-program-30-minutes`).

```typescript
// lib/content.ts — add after existing code
// Source: Architecture Pattern 2 from .planning/research/ARCHITECTURE.md
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
```

**Lesson page integration:** The lesson page Server Component reads the raw MD via `fs.readFileSync`, calls `extractHeadings()`, and passes `headings` to `<LessonToc>`. This is one extra `readFileSync` per SSG page — negligible at 120 pages.

```typescript
// app/courses/[courseSlug]/[lessonSlug]/page.tsx — additional logic
import fs from 'fs'
import path from 'path'
import { extractHeadings } from '@/lib/content'

// Inside LessonPage Server Component:
const rawMd = fs.readFileSync(
  path.join(process.cwd(), 'courses', courseSlug, `${lessonSlug}.md`),
  'utf-8'
)
const headings = extractHeadings(rawMd)
// Render: <LessonToc headings={headings} />
```

**Note on Phase 4 impact:** When Phase 4 (Course Data Foundation) lands `sourceCourseSlug` on `LessonMeta`, the `readFileSync` path must use `sourceCourseSlug` not `courseSlug`. If Phase 6 lands before Phase 4, use `courseSlug` (current behavior). Add a comment flagging the future migration.

### Pattern 2: Lesson ToC Component (CHUNK-01 / CHUNK-02)

**Desktop layout:** `position: sticky; top: 5rem` within the right-margin column of the lesson page layout. Width 200–240px. Requires the lesson page to switch from single-column `max-w-[65ch] mx-auto` to a two-column layout:

```
┌─────────────────────────────────────────────────────────┐
│  [Prose area: max-w-[65ch]]      │  [ToC: 240px sticky] │
│                                   │                       │
│  <article class="prose ...">      │  <LessonToc />        │
│    <LessonContent />              │                       │
└───────────────────────────────────┴───────────────────────┘
```

Tailwind layout: `xl:grid xl:grid-cols-[65ch_240px] xl:gap-8` on the outer wrapper. Below `xl`: single column, ToC collapses to top bar.

**Mobile layout:** A `<details>`/`<summary>` or controlled `<div>` showing current heading as a compact 44px bar below the lesson header. Tap to expand the full list. This replaces the sticky sidebar on screens below `lg`.

**Scroll spy hook:**

```typescript
// Inside components/lesson-toc.tsx (Client Component)
'use client'
import { useEffect, useState } from 'react'

function useActiveHeading(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const callback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      }
    }
    const observer = new IntersectionObserver(callback, {
      rootMargin: '-10% 0px -80% 0px',
    })
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
```

**ARIA:** `<nav role="navigation" aria-label="Table of contents">` wrapping the ToC. Active item gets `aria-current="true"`.

### Pattern 3: Scroll Progress Bar (CHUNK-03)

**What:** A fixed `<div>` at `position: fixed; top: 64px; left: 0; width: {percent}%; height: 3px; background: var(--color-primary); z-index: 50`. Updates via `requestAnimationFrame` in a scroll listener.

**Why RAF not CSS transition:** The design spec explicitly says "Width update via RAF (no CSS transition, direct style)" for `scroll` animation to ensure 60fps without jank. CSS `transition` on width adds a visual lag that makes the bar feel disconnected from scroll.

```typescript
// components/scroll-progress.tsx
'use client'
import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const progress = scrollTop / (scrollHeight - clientHeight)
      if (barRef.current) {
        barRef.current.style.width = `${Math.min(progress * 100, 100)}%`
      }
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div
      ref={barRef}
      className="fixed left-0 z-50 h-[3px] bg-[var(--color-primary)] transition-none"
      style={{ top: '64px', width: '0%' }}
      aria-hidden="true"
    />
  )
}
```

**Placement:** Add `<ScrollProgress />` to the lesson page layout (or lesson page wrapper), not the root layout — it should only appear on lesson pages.

### Pattern 4: Enhanced Code Block with Language Badge (CODE-07 / CODE-08)

**What:** The `pre` override in `mdx-components.tsx` is expanded to read `data-language` from the nested `<code>` element and render a header bar.

**How `data-language` is available:** `rehype-pretty-code` sets `data-language` on the `<code>` element inside `<pre>`. The `pre` React component receives `children` which is the `<code>` element. Accessing it requires reading `props` from `children`:

```typescript
// mdx-components.tsx — updated pre override
pre: ({
  children,
  raw,
  ...props
}: React.ComponentProps<'pre'> & { raw?: string }) => {
  // rehype-pretty-code sets data-language on the <code> child
  const codeChild = React.Children.toArray(children)[0] as React.ReactElement<{ 'data-language'?: string }>
  const language = codeChild?.props?.['data-language']

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-bg)]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-code-border)] bg-[var(--color-code-header)] px-4 h-9">
        <span className="font-mono text-xs uppercase text-[var(--color-foreground-muted)] opacity-70">
          {language ?? 'code'}
        </span>
        {raw && <CopyButton code={raw} />}
      </div>
      {/* Code content */}
      <pre {...props} className="overflow-x-auto p-4 text-[15px] leading-relaxed">
        {children}
      </pre>
    </div>
  )
}
```

**Copy button change for CODE-08:** The current `copy-button.tsx` has `opacity-100 md:opacity-0 md:group-hover:opacity-100` — this means it is already always visible on mobile. The missing piece per the design spec is "Copied!" text feedback next to the icon. Update `CopyButton` to show a small "Copied!" text label in the copied state (fades in/out over 2 seconds).

### Pattern 5: @shikijs/transformers Integration (CODE-09 / CODE-10)

**What:** Add transformer functions to `rehypePrettyCodeOptions.transformers` array in `next.config.mjs`.

```javascript
// next.config.mjs — modified options
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationFocus } from '@shikijs/transformers'

const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
  keepBackground: false,
  transformers: [
    transformerNotationDiff(),      // [!code ++] / [!code --]
    transformerNotationHighlight(), // [!code highlight]
    transformerNotationFocus(),     // [!code focus]
  ],
}
```

**Version pinning:** `@shikijs/transformers` MUST match the installed `shiki` major version (4.x). Install `@shikijs/transformers@^4.0.2`.

**CSS required** in `globals.css` for the transformer-produced HTML classes:

```css
/* @shikijs/transformers — diff notation */
.line.diff.add {
  background-color: oklch(0.85 0.12 145 / 0.25);
}
.line.diff.remove {
  background-color: oklch(0.7 0.18 27 / 0.2);
  opacity: 0.7;
}

/* @shikijs/transformers — highlighted lines */
.line.highlighted {
  background-color: var(--color-primary-subtle);
  border-left: 2px solid var(--color-primary);
  margin-left: -1rem;
  padding-left: calc(1rem - 2px);
}

/* @shikijs/transformers — focus notation */
.line:not(.focused) {
  opacity: 0.4;
  transition: opacity 200ms;
}
.has-focused:hover .line:not(.focused) {
  opacity: 1;
}
```

**Turbopack:** Do NOT add `--turbo` to any npm scripts. `rehype-pretty-code` is Turbopack-incompatible (see Pitfall 10 in PITFALLS.md). This is a firm constraint.

### Pattern 6: Callout MDX Components (READ-05)

**What:** New `components/callout.tsx` exports `Tip`, `Warning`, `Info`, `Error` components. Registered in `mdx-components.tsx` so lesson authors can write `<Tip>...</Tip>` in `.md` files via MDX.

**Design spec (§12.6):** Left border 3px, colored background, icon + title + body layout.

```typescript
// components/callout.tsx
import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

type CalloutVariant = 'tip' | 'warning' | 'info' | 'error'

const VARIANT_CONFIG = {
  tip:     { icon: Lightbulb,     border: 'border-l-[var(--color-primary)]',  bg: 'bg-green-50 dark:bg-green-950/10',  title: 'Tip'     },
  warning: { icon: AlertTriangle, border: 'border-l-[var(--color-warning)]',  bg: 'bg-amber-50 dark:bg-amber-950/10',  title: 'Warning' },
  info:    { icon: Info,          border: 'border-l-[var(--color-info)]',      bg: 'bg-blue-50  dark:bg-blue-950/10',   title: 'Info'    },
  error:   { icon: AlertCircle,   border: 'border-l-[var(--color-error)]',     bg: 'bg-red-50   dark:bg-red-950/10',    title: 'Error'   },
} as const

export function Callout({ variant, title, children }: { variant: CalloutVariant; title?: string; children: ReactNode }) {
  const { icon: Icon, border, bg, title: defaultTitle } = VARIANT_CONFIG[variant]
  return (
    <div className={`not-prose my-6 flex gap-3 rounded-lg border-l-[3px] p-4 ${border} ${bg}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="mb-1 text-sm font-semibold">{title ?? defaultTitle}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}

export const Tip     = (props: { title?: string; children: ReactNode }) => <Callout variant="tip"     {...props} />
export const Warning = (props: { title?: string; children: ReactNode }) => <Callout variant="warning" {...props} />
export const Info    = (props: { title?: string; children: ReactNode }) => <Callout variant="info"    {...props} />
export const Error   = (props: { title?: string; children: ReactNode }) => <Callout variant="error"   {...props} />
```

**MDX registration:**

```typescript
// mdx-components.tsx — add imports and entries
import { Tip, Warning, Info, Error as ErrorCallout } from '@/components/callout'
import { PracticeBlock } from '@/components/practice-block'

export function useMDXComponents(): MDXComponents {
  return {
    // ... existing pre, code overrides ...
    Tip,
    Warning,
    Info,
    Error: ErrorCallout,
    PracticeBlock,
  }
}
```

### Pattern 7: Patch Divider (CHUNK-04)

**What:** Lesson content uses `---` horizontal rules between parts. The `hr` MDX override renders each horizontal rule as the styled patch divider from design spec §9.

The lesson markdown already contains `---` between major sections. An `hr` override in `mdx-components.tsx` turns these into dividers automatically — no lesson file edits needed.

```typescript
// mdx-components.tsx — add hr override
hr: () => (
  <div className="not-prose my-12 flex flex-col items-center gap-2">
    <div className="h-px w-20 bg-[var(--color-border)]" />
  </div>
)
```

**"Part X of Y" labels:** The design spec shows a "Part 2 of 5" overline above each patch heading. This requires knowing total patch count and current part index. Since lessons are single MD files rendered in one pass, tracking "Part X of Y" dynamically is complex. The pragmatic Phase 6 approach: style the divider cleanly (the thin line + spacing), and let the ToC sidebar provide the "Part X of Y" context via active heading highlighting. Full "Part X of Y" label injection can be added in a future enhancement if needed. The planner should not block CHUNK-04 on this — the divider styling and ToC active state cover the functional requirement.

### Pattern 8: Inline Practice Block (PRACT-01 / PRACT-02)

**What:** A new MDX component `PracticeBlock` that embeds the existing `CodeRunner` with a prompt, expandable hint, and expandable solution.

**Design spec (§12.7):** Border, header bar with "Try it yourself" label, prompt text, code runner, expandable hint, expandable solution.

```typescript
// components/practice-block.tsx
'use client'
import { useState } from 'react'
import { Code2 } from 'lucide-react'
import { CodeRunner } from '@/components/code-runner'
import { Button } from '@/components/ui/button'

type PracticeBlockProps = {
  prompt: string
  initialCode?: string
  hint?: string
  solution?: string
}

export function PracticeBlock({ prompt, initialCode = '# Write your code here\n', hint, solution }: PracticeBlockProps) {
  const [hintOpen, setHintOpen] = useState(false)
  const [solutionOpen, setSolutionOpen] = useState(false)

  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)]">
      {/* Header */}
      <div className="flex h-11 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-background-muted)] px-4">
        <Code2 className="h-[18px] w-[18px] text-[var(--color-primary)]" />
        <span className="text-sm font-semibold">Try it yourself</span>
      </div>

      {/* Prompt */}
      <p className="px-4 py-3 text-sm">{prompt}</p>

      {/* Code Runner */}
      <div className="px-4 pb-4">
        <CodeRunner initialCode={initialCode} />
      </div>

      {/* Hint */}
      {hint && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setHintOpen(!hintOpen)}>
            {hintOpen ? 'Hide hint' : 'Show hint'}
          </Button>
          {hintOpen && <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{hint}</p>}
        </div>
      )}

      {/* Solution */}
      {solution && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setSolutionOpen(!solutionOpen)}>
            {solutionOpen ? 'Hide solution' : 'Show solution'}
          </Button>
          {solutionOpen && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-[var(--color-code-bg)] p-3 text-sm">
              <code>{solution}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
```

**Usage in lesson MDX:**
```mdx
<PracticeBlock
  prompt="Write a Python program that prints your name three times."
  initialCode="# Your code here\n"
  hint="Use print() three times, or use a for loop."
  solution="for i in range(3):\n    print('Your Name')"
/>
```

**Important:** `PracticeBlock` is a Client Component (`'use client'`). The existing `CodeRunner` is already dynamically loaded with `ssr: false`. No additional dynamic import is needed in `PracticeBlock` — the `CodeRunner` handles its own SSR boundary.

### Anti-Patterns to Avoid

- **Re-implementing `slugify` for ToC IDs:** Always use `github-slugger` — identical to what `rehype-slug` uses. Custom implementations diverge on parentheses, colons, and special characters (confirmed: lesson headings contain `(30 minutes)` and `?`).
- **Adding `--turbo` to any npm script:** Breaks `rehype-pretty-code`. Firm no.
- **Putting `ScrollProgress` in `app/layout.tsx`:** It should appear on lesson pages only — put it in the lesson page component or lesson layout.
- **`transformerNotationHighlight` vs CSS `.highlighted` class:** The class name from `@shikijs/transformers` is `.highlighted`, not `.line--highlighted`. CSS must target `.line.highlighted` (NOT `.line--highlighted` which is the older rehype-pretty-code syntax).
- **Registering `Error` as `Error` in MDX components:** Conflicts with the global `Error` constructor. Export it as `ErrorCallout` from `callout.tsx` and register as `Error: ErrorCallout` in `mdx-components.tsx`, or rename the variant to `Danger`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Heading slug generation for ToC | Custom `kebabCase()` or `slugify()` function | `github-slugger` | Edge cases: parentheses, question marks, colons, accents — all tested in `rehype-slug` suite |
| Diff notation in code blocks | Custom CSS class injection via rehype visitor | `@shikijs/transformers` `transformerNotationDiff()` | Already handles `[!code ++]` and `[!code --]` annotation parsing, multi-line diffs, and removes annotation from rendered output |
| Focus notation in code blocks | Custom opacity classes | `@shikijs/transformers` `transformerNotationFocus()` | Handles the `has-focused` class on `<code>` and per-`.line.focused` |
| Google Fonts loading | `<link>` tags in `<head>` | `next/font/google` | Automatic font-display swap, zero layout shift, self-hosted subsets, no third-party requests |
| Scroll-activated progress bar | `scroll` event listener with `setState` | `requestAnimationFrame` + `ref.current.style.width` | `setState` on every scroll event triggers React re-renders at 60fps — causes jank on mid-range devices |

---

## Common Pitfalls

### Pitfall 1: ToC Anchor IDs Diverge From Rendered Heading IDs

**What goes wrong:** If `extractHeadings()` uses any slugify function other than `github-slugger`, heading IDs in the ToC links will not match the `id` attributes set by `rehype-slug`. The divergence is invisible for simple headings but breaks on:
- `### Part 1: What is a Computer Program? (30 minutes)` → becomes `part-1-what-is-a-computer-program-30-minutes` via github-slugger
- A custom `toLower().replace(/[^a-z0-9]/g, '-')` produces `part-1--what-is-a-computer-program--30-minutes-` (double dashes, trailing dash)

**No duplicate heading IDs exist** in current lessons (verified by scanning all 120 lesson files — 0 files have duplicate h2/h3 heading text). This is low risk now but must be re-checked if lesson content is modified.

**Prevention:** Import `GithubSlugger` from `github-slugger` package. Instantiate a new slugger per call to `extractHeadings()` (the slugger maintains internal state for deduplication).

### Pitfall 2: @shikijs/transformers CSS Class Names

**What goes wrong:** The older `rehype-pretty-code` documentation and many blog posts reference `.highlighted-line` or `.line--highlighted` as the CSS class. `@shikijs/transformers@^4.x` uses different class names:
- `transformerNotationHighlight()` → `.line.highlighted`
- `transformerNotationDiff()` → `.line.diff.add` / `.line.diff.remove`
- `transformerNotationFocus()` → `.line.focused` (and `.has-focused` on `<code>`)

**Prevention:** After installing `@shikijs/transformers`, inspect the rendered HTML in development with browser DevTools before writing CSS. Write CSS last.

### Pitfall 3: Copy Button "Copied!" Text vs Icon-Only

**What goes wrong:** Current `CopyButton` shows only icon state change (Copy → Check). The design spec requires "Copied!" text feedback that "fades in/out." Adding text inside a fixed `h-7 w-7` icon button breaks the layout.

**Prevention:** When adding "Copied!" text, either: (a) expand the button width when in copied state using `min-w-fit`, or (b) show the text as an absolutely-positioned tooltip/label next to the button. Option (b) is cleaner and doesn't affect the header bar layout.

### Pitfall 4: PracticeBlock `solution` Prop Contains Code — Escaping Issues

**What goes wrong:** When lesson authors write `solution="for i in range(3):\n    print('Name')"` as a JSX prop, backslash `\n` and quotes require careful escaping in MDX. Double quotes inside a double-quoted prop break parsing.

**Prevention:** For the solution prop, prefer template strings or raw string alternatives. Alternatively, accept `solution` as a `children`-style slot (separate `<Solution>` child component) so markdown code fences can be used naturally. The planner should decide which API is more author-friendly. The slot approach is more flexible for multi-line solutions.

### Pitfall 5: ScrollProgress Polling Loop Leaks After Route Navigation

**What goes wrong:** The `requestAnimationFrame` loop in `ScrollProgress` does not stop when the component unmounts. In Next.js App Router, Client Components mount/unmount on navigation. A leaked RAF loop accumulates on each lesson page visit.

**Prevention:** The cleanup function in `useEffect` must call `cancelAnimationFrame(rafId)`. The code pattern above is correct — verify the cleanup is present in the implementation. Test by navigating between 3 lesson pages and verifying no console errors or performance degradation.

### Pitfall 6: Warm Palette Tokens Clash With Existing shadcn/ui Variables

**What goes wrong:** The design spec defines new CSS custom properties like `--color-background`, `--color-foreground`, `--color-primary` in `:root`. The current `globals.css` uses Tailwind v4 `@theme inline` which maps `--color-background` to `--background` and `--color-foreground` to `--foreground`. Redefining these tokens will affect all shadcn/ui components (cards, buttons, inputs) that consume `--background`, `--foreground`, `--primary`.

**Prevention:**
1. Understand the shadcn/ui token naming before adding new tokens: `--background`, `--foreground`, `--primary`, `--muted` are used everywhere.
2. The design spec's `--color-*` tokens are the new palette system. Map them correctly: `--color-primary: #16A34A` must coexist with shadcn's `--primary: oklch(...)`. For Phase 6, either:
   - **Option A (recommended):** Replace shadcn's oklch values in `:root` and `.dark` with the warm palette values, converted to oklch. The warm off-white `#FAFAF8` ≈ `oklch(0.984 0.003 75)`.
   - **Option B:** Add separate `--color-*` properties for the Phase 6 components only and leave shadcn tokens intact.

   Option A produces consistent results everywhere. Option B risks two competing palettes. Planner should pick Option A.

---

## Code Examples

### Verified Pattern: extractHeadings

```typescript
// lib/content.ts
// Source: Architecture research + github-slugger README
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
```

### Verified Pattern: @shikijs/transformers in next.config.mjs

```javascript
// next.config.mjs
// Source: Shiki transformers docs — https://shiki.style/packages/transformers
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationFocus } from '@shikijs/transformers'

const rehypePrettyCodeOptions = {
  theme: { light: 'github-light', dark: 'github-dark-dimmed' },
  keepBackground: false,
  transformers: [
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationFocus(),
  ],
}
```

**Usage in lesson markdown:**
```python
# This line is added [!code ++]
# This line is removed [!code --]
x = 5  # [!code highlight]
```

### Verified Pattern: Lesson Page Layout for 2-Column ToC

```tsx
// app/courses/[courseSlug]/[lessonSlug]/page.tsx
// Outer wrapper switches from max-w-[65ch] to a 2-col grid on xl+
<div className="mx-auto px-4 py-8 xl:grid xl:grid-cols-[65ch_240px] xl:gap-8 xl:max-w-[calc(65ch+240px+2rem)]">
  <div>
    {/* All existing lesson content */}
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <LessonContent />
    </article>
    {/* mindmap, exercises, nav */}
  </div>
  <aside className="hidden xl:block">
    <LessonToc headings={headings} />
  </aside>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact for Phase 6 |
|--------------|------------------|--------------|-------------------|
| Hover-only copy button | Mobile-always-visible copy button | v1.0 (already done partially) | Already at `opacity-100` on mobile — just needs "Copied!" text |
| No transformer annotations | `@shikijs/transformers` composable annotations | Shiki v2+ / @shikijs/transformers 4.x | Native annotation syntax `[!code ++]` in MD comments |
| `rehype-toc` (HTML injection) | Server-side extraction + React component | App Router era | ToC is typed data, not raw HTML injection |
| System monospace for code | JetBrains Mono loaded via next/font | Phase 6 | Requires font variable on `<html>` element |

**Deprecated/avoid:**
- `react-scrollspy` — scrapes rendered DOM, misses SSR advantage
- `tocbot` — same problem, requires browser runtime
- `rehype-toc` (JS-DevTools) — injects HTML `<nav>`, not a React component
- `@stefanprobst/rehype-extract-toc` — more complex than needed; server-side regex approach is sufficient

---

## Open Questions

1. **Source Serif 4 for headings**
   - What we know: Design spec lists it as optional display font for an "editorial feel."
   - What's unclear: Whether the visual improvement justifies loading a second font family (~12KB).
   - Recommendation: Load JetBrains Mono first (required by READ-03). Defer Source Serif 4 to a polish pass — or decide after seeing JetBrains Mono + Inter together in the browser.

2. **"Part X of Y" labels on patch dividers (CHUNK-04)**
   - What we know: Design spec shows "Part 2 of 5" above each h2 divider. Lessons use `---` hr rules.
   - What's unclear: Counting total parts within a lesson at render time is not straightforward with the current single-pass MDX compilation.
   - Recommendation: Style the `hr` divider cleanly (thin centered line + spacing). The ToC sidebar provides part navigation context. Full "Part X of Y" labels require either: (a) parsing MDX in the Server Component to count h2 headings, or (b) adding explicit MDX `<PartDivider part={2} total={5} />` components to lesson files. Option (a) is achievable with `extractHeadings()` — the planner can enumerate h2 headings and number them. The planner should implement option (a) and pass the numbered headings to both the ToC and the lesson content wrapper.

3. **`@stefanprobst/rehype-extract-toc` vs. server-side extraction**
   - What we know: STACK.md rated this MEDIUM confidence. STATE.md flags it as a blocker concern: "validate early in 06-02, fallback path is fully specified."
   - Recommendation: Use the server-side `extractHeadings()` approach (the fallback) as the primary approach. It is HIGH confidence, fully testable, and requires no MDX pipeline changes. Do not attempt the plugin approach.

---

## Validation Architecture

nyquist_validation is enabled (config.json).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- --reporter=verbose` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| READ-01 | CSS custom properties defined in globals.css | manual/visual | `pnpm build` (build must succeed) | N/A — CSS-only |
| READ-02 | prose font-size 1.125rem applied | manual/visual | Visual inspection | N/A — CSS-only |
| READ-03 | JetBrains Mono variable on html element | unit | `pnpm test -- __tests__/lib/content.test.ts` | ✅ existing suite passes |
| READ-04 | blockquote has green left border | manual/visual | Visual inspection on lesson page | N/A — CSS-only |
| READ-05 | Callout components render correct variant styles | unit | `pnpm test -- __tests__/components/callout.test.tsx` | ❌ Wave 0 |
| CHUNK-01 | extractHeadings returns correct Heading[] | unit | `pnpm test -- __tests__/lib/content.test.ts` | ✅ (add test cases) |
| CHUNK-01 | LessonToc renders heading links | unit | `pnpm test -- __tests__/components/lesson-toc.test.tsx` | ❌ Wave 0 |
| CHUNK-02 | Active heading changes on scroll (IntersectionObserver) | unit (mocked IO) | `pnpm test -- __tests__/components/lesson-toc.test.tsx` | ❌ Wave 0 |
| CHUNK-03 | ScrollProgress updates width on scroll | unit | `pnpm test -- __tests__/components/scroll-progress.test.tsx` | ❌ Wave 0 |
| CHUNK-04 | hr override renders divider div | unit | `pnpm test -- __tests__/components/mdx-overrides.test.tsx` | ❌ Wave 0 |
| CODE-07 | language badge present in pre override | unit | `pnpm test -- __tests__/components/mdx-overrides.test.tsx` | ❌ Wave 0 |
| CODE-08 | CopyButton visible on mobile (opacity class) | unit | `pnpm test -- __tests__/components/copy-button.test.tsx` | ❌ (existing component, new test) |
| CODE-09 | transformerNotationHighlight in config (build check) | smoke | `pnpm build` | N/A — build config |
| CODE-10 | transformerNotationDiff in config (build check) | smoke | `pnpm build` | N/A — build config |
| PRACT-01 | PracticeBlock renders prompt and CodeRunner | unit | `pnpm test -- __tests__/components/practice-block.test.tsx` | ❌ Wave 0 |
| PRACT-02 | Hint and solution expand/collapse on button click | unit | `pnpm test -- __tests__/components/practice-block.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test -- --reporter=verbose` (full suite, ~10 seconds)
- **Per wave merge:** `pnpm test` (full suite)
- **Phase gate:** Full suite green + `pnpm build` succeeds before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/components/callout.test.tsx` — covers READ-05 (Tip/Warning/Info/Error variants render)
- [ ] `__tests__/components/lesson-toc.test.tsx` — covers CHUNK-01 (heading links), CHUNK-02 (active heading with mocked IntersectionObserver)
- [ ] `__tests__/components/scroll-progress.test.tsx` — covers CHUNK-03 (scroll listener, cleanup)
- [ ] `__tests__/components/practice-block.test.tsx` — covers PRACT-01 (renders CodeRunner), PRACT-02 (hint/solution toggle)
- [ ] Add `extractHeadings` test cases to `__tests__/lib/content.test.ts` — covers CHUNK-01 (slug correctness for headings with special chars)
- [ ] `__tests__/components/mdx-overrides.test.tsx` — covers CODE-07 (language badge), CHUNK-04 (hr divider)
- [ ] `__tests__/components/copy-button.test.tsx` — covers CODE-08 (mobile visibility, Copied! state) — file does not exist yet

**Existing test infrastructure:** Vitest 4.x + jsdom + `@testing-library/react` — all required tooling is installed. `IntersectionObserver` is not in jsdom — must be mocked in test files using `vi.stubGlobal('IntersectionObserver', MockIO)`.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `next.config.mjs`, `mdx-components.tsx`, `app/globals.css`, `components/copy-button.tsx`, `app/courses/[courseSlug]/[lessonSlug]/page.tsx`, `__tests__/` directory structure, `vitest.config.ts`
- `.planning/research/ARCHITECTURE.md` — Pattern 2 (server-side heading extraction), Pattern 3 (pre override)
- `.planning/research/STACK.md` — `@shikijs/transformers` 4.0.2 config, `@stefanprobst/rehype-extract-toc` risk assessment
- `.planning/research/PITFALLS.md` — Pitfall 9 (duplicate heading IDs), Pitfall 10 (Turbopack), Pitfall 16 (theme sync)
- `specs/v1.1-design-spec.md` §§4, 5, 9, 10, 11, 12.6, 12.7 — color tokens, typography, ToC layout, callout design, practice block design
- `node_modules/.pnpm/github-slugger@2.0.0` — confirmed installed transitively
- `node_modules/.pnpm/rehype-slug@6.0.0/node_modules/rehype-slug/package.json` — confirms `github-slugger ^2.0.0` dependency

### Secondary (MEDIUM confidence)

- [Shiki transformers docs](https://shiki.style/packages/transformers) — transformer function names and class name output verified
- [rehype-pretty-code docs](https://rehype-pretty.pages.dev/) — `transformers` option confirmed
- [Next.js font optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) — `next/font/google` pattern

### Tertiary (LOW confidence — flag for validation)

- `@shikijs/transformers` exact CSS class names (`.line.diff.add` etc.) — verify by inspecting rendered HTML in development after installing

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in node_modules or official docs
- Architecture: HIGH — based on direct codebase inspection and prior architecture research
- Pitfalls: HIGH — duplicates verified (0 lessons affected), class name risk flagged for validation

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack; `@shikijs/transformers` could publish minor updates)
