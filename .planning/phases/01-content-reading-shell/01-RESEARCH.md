# Phase 1: Content + Reading Shell - Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 App Router + @next/mdx + Shiki + shadcn/ui + next-themes
**Confidence:** HIGH (core pipeline verified against official docs; metadata parsing pattern MEDIUM)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use `@next/mdx` with App Router for build-time MDX compilation (NOT `next-mdx-remote` — unmaintained, ships client runtime)
- Shiki for syntax highlighting at compile time (zero runtime JS for code blocks)
- `gray-matter` for frontmatter extraction from existing lesson MD files
- `generateStaticParams` for all lesson and course routes — 100% static generation
- Medium-inspired typography: 65-75 character line width, 1.75 line-height
- Font stack: Inter for UI, system monospace for code blocks
- Clean, minimalist aesthetic — generous whitespace, no visual clutter
- shadcn/ui components for consistent design language
- `next-themes` with blocking inline script in `<head>` to prevent FOUC
- shadcn/ui dark mode variants (built-in support)
- System preference detection with manual override toggle
- Tailwind responsive classes, test at 375px breakpoint
- Collapsible sidebar on mobile (hamburger menu or slide-in drawer)
- Code blocks horizontally scrollable on small screens
- Single copy button on all code blocks — appears on hover (desktop) or always visible (mobile)
- Visual feedback on copy (checkmark icon replaces copy icon briefly)
- Route structure: `/courses/[courseSlug]/[lessonSlug]` for lessons, `/courses/[courseSlug]` for course pages, `/` for catalog
- Lesson files have inline bold metadata (NOT YAML frontmatter) — must be regex-parsed

### Claude's Discretion
- Exact color palette and spacing values within shadcn/ui theme
- Loading skeleton design for page transitions
- Footer content and layout
- 404 page design
- Exact sidebar width and breakpoint for collapse

### Deferred Ideas (OUT OF SCOPE)
- Interactive code runner (Pyodide) — Phase 2
- Progress tracking (localStorage) — Phase 2
- Animated mindmaps — Phase 3
- Search functionality — Phase 3
- NotebookLM integration — Phase 3
- Page transition animations — Phase 3
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Lesson pages render existing Markdown files with syntax-highlighted Python code blocks (Shiki, compile-time) | `@next/mdx` + `rehype-pretty-code` + Shiki dual-theme pattern verified against official docs |
| CONT-02 | Course catalog page displays all 12 courses with lesson count and description | `lib/content.ts` reads `courses/*/README.md` at build time via Node.js `fs`; parsed with regex for course name and lesson count |
| CONT-03 | Each course page lists all its lessons with titles and brief descriptions | `lib/content.ts` lists `courses/[slug]/*.md` files; title/duration/level extracted via inline bold metadata regex |
| CONT-04 | Code blocks have copy-to-clipboard button | Custom `pre` MDX component (Server) wrapping a `CopyButton` client component; raw code extracted via rehype visitor before highlighting |
| LAYO-01 | Medium-inspired reading layout with optimal typography (65-75 char line width, 1.75 line-height) | `@tailwindcss/typography` `prose` class + `max-w-[65ch]` constraint in lesson layout |
| LAYO-02 | Course sidebar navigation showing all lessons in current course | Server Component in `[courseSlug]/layout.tsx` receives sorted lesson list; mobile: Sheet drawer from shadcn/ui |
| LAYO-03 | Previous/next lesson navigation at bottom of each lesson page | Computed in `lib/content.ts` from sorted lesson array; rendered as Client Component for keyboard nav |
| LAYO-04 | Breadcrumb navigation (Home > Course > Lesson) | shadcn/ui Breadcrumb component; data from URL params resolved to titles in Server Component |
| LAYO-05 | Mobile-responsive layout tested at 375px breakpoint | Tailwind responsive classes; sidebar hidden on mobile behind Sheet; `overflow-x: auto` on `pre` |
| LAYO-06 | Dark/light mode toggle with no FOUC (blocking script in head) | `next-themes` with `suppressHydrationWarning` on `<html>` + inline `<script>` in `app/layout.tsx` `<head>` |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield Next.js 15 project initialization that builds a static reading experience on top of 122 existing Markdown lesson files. The core technical challenge is the content pipeline: lesson files use a non-standard inline bold metadata format (not YAML frontmatter), requiring a custom regex parser in `lib/content.ts` rather than gray-matter's frontmatter extraction. This is the single most important discovery — the CONTEXT.md states "gray-matter for frontmatter extraction" but the actual lesson files have NO YAML frontmatter at all.

The MDX compilation approach (`@next/mdx` with dynamic imports via `generateStaticParams`) is confirmed correct by official Next.js docs. The copy-to-clipboard pattern requires a two-pass rehype visitor to extract raw code before Shiki processes it, then forward the raw string as a prop to a client-side `CopyButton` component. The FOUC prevention pattern with `next-themes` requires a specific ordering: `suppressHydrationWarning` on `<html>` plus an inline blocking script in `<head>` before any stylesheets.

The Tailwind v4 + shadcn/ui combination is fully supported but uses the new `@theme inline` CSS-first configuration approach — there is no `tailwind.config.js` needed. The `@tailwindcss/typography` plugin provides the Medium-inspired prose styles with minimal configuration.

**Primary recommendation:** Build `lib/content.ts` (metadata parsing from bold text) as the first task before any route or layout work, since all other components depend on the typed `Course` and `LessonMeta` data shapes.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (App Router) | Framework | SSG via `generateStaticParams`; RSC eliminates MDX runtime from client bundle |
| React | 18.x | UI runtime | 18 (not 19) for stability with current shadcn/ui component set |
| TypeScript | 5.x | Type safety | Course/Lesson data shapes enforced across RSC/client boundary |
| `@next/mdx` | latest | MDX compilation | Official solution for local `.md` files; compiles at build time, zero runtime JS |
| `@mdx-js/loader` | latest | webpack MDX loader | Required peer dep for `@next/mdx` |
| `@mdx-js/react` | latest | React MDX context | Required peer dep for `@next/mdx` |
| `@types/mdx` | latest | TypeScript types | Enables typed MDX imports |

### Content Pipeline
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `rehype-pretty-code` | ^0.14 | Syntax highlighting via Shiki | Wraps Shiki as a rehype plugin; dual light/dark themes via CSS variables; zero client JS |
| `shiki` | ^1.x | Syntax highlighter engine | VS Code-quality; 200+ languages including Python; baked into HTML at build time |
| `remark-gfm` | ^4.0 | GitHub Flavored Markdown | Tables in lesson files require this; omitting breaks table rendering silently |
| `rehype-slug` | ^6.0 | Heading anchor IDs | Enables deep-linking to lesson sections |
| `unist-util-visit` | ^5.0 | AST visitor for copy-to-clipboard | Extracts raw code string from pre nodes before Shiki transforms them |

> **Note:** `gray-matter` is listed in CONTEXT.md decisions but lesson files have NO YAML frontmatter. `gray-matter` is NOT needed for the metadata extraction step. Metadata is parsed via regex from inline bold text (see Architecture Patterns below). `gray-matter` can still be installed as a dependency in case it's useful elsewhere, but the actual metadata parsing uses a custom `parseInlineMetadata()` function.

### UI
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | v4 (CLI) | Component primitives | Tailwind v4 + React 19 compatible; copy-owned components; Radix UI accessibility |
| Tailwind CSS | v4.x | Utility-first styling | CSS-first config; pairs natively with shadcn/ui; no config file needed |
| `@tailwindcss/typography` | latest | Prose markdown styling | `prose` class renders MDX content as Medium-quality long-form typography |
| `next-themes` | ^0.4 | Dark/light mode | FOUC-free via `suppressHydrationWarning` + inline blocking script |
| `@fontsource/inter` | latest | Body typeface | Self-hosted Inter; avoids Google Fonts latency; Medium-style sans-serif |
| `lucide-react` | latest | Icons | Ships with shadcn/ui; Copy, Check, ChevronLeft, ChevronRight, Menu icons needed |

### Installation
```bash
# Init project (pnpm as required by project conventions)
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --eslint

# shadcn/ui (Tailwind v4 mode)
pnpm dlx shadcn@latest init

# Content pipeline
pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
pnpm add rehype-pretty-code shiki remark-gfm rehype-slug unist-util-visit
pnpm add @tailwindcss/typography

# UI & theme
pnpm add next-themes @fontsource/inter

# Add shadcn components needed for Phase 1
pnpm dlx shadcn@latest add button badge card breadcrumb sheet separator
```

---

## Architecture Patterns

### Recommended Project Structure
```
.                                  # project root
├── courses/                       # existing content (DO NOT MOVE)
│   └── 01-python-fundamentals/
│       ├── README.md
│       └── lesson-01-*.md
├── app/
│   ├── layout.tsx                 # Root: font import, ThemeProvider, blocking script
│   ├── page.tsx                   # Course catalog (redirect or inline)
│   ├── courses/
│   │   ├── page.tsx               # Course catalog: all 12 courses as cards
│   │   └── [courseSlug]/
│   │       ├── layout.tsx         # Course layout: sidebar + content area
│   │       ├── page.tsx           # Course overview: lesson list
│   │       └── [lessonSlug]/
│   │           └── page.tsx       # Lesson content: MDX render
├── lib/
│   └── content.ts                 # Server-only: reads courses/ dir, returns Course/Lesson types
├── components/
│   ├── ui/                        # shadcn/ui generated components
│   ├── copy-button.tsx            # Client component: copy-to-clipboard
│   ├── course-sidebar.tsx         # Server component: lesson list nav
│   ├── lesson-nav.tsx             # Client component: prev/next + keyboard nav
│   ├── site-header.tsx            # Client component: logo + theme toggle
│   ├── theme-provider.tsx         # Client component: next-themes wrapper
│   └── theme-toggle.tsx           # Client component: dark/light button
├── mdx-components.tsx             # REQUIRED by @next/mdx: global MDX overrides
├── next.config.mjs                # MDX + rehype-pretty-code config
└── globals.css                    # Tailwind v4 @theme, prose overrides, Shiki CSS vars
```

### Pattern 1: Inline Bold Metadata Parsing (CRITICAL — non-standard)

**What:** Lesson files use inline bold text for metadata, not YAML frontmatter. Line 1 is always `# Lesson N: Title`. Line 3 is always `**Course:** X | **Duration:** Y | **Level:** Z`.

**When to use:** In `lib/content.ts` when building the lesson index from filesystem reads.

**Example:**
```typescript
// lib/content.ts - server-only (uses Node.js fs)
import fs from 'fs'
import path from 'path'

const COURSES_DIR = path.join(process.cwd(), 'courses')

type LessonMeta = {
  slug: string          // "lesson-01-what-is-programming"
  courseSlug: string    // "01-python-fundamentals"
  title: string         // "What is Programming?"
  lessonNumber: number  // 1
  duration: string      // "2 hours"
  level: string         // "Absolute Beginner"
  prev: string | null
  next: string | null
}

type Course = {
  slug: string          // "01-python-fundamentals"
  title: string         // "Python Fundamentals"
  description: string
  level: string
  lessonCount: number
  lessons: LessonMeta[]
}

// Regex patterns for inline bold metadata
const TITLE_REGEX = /^#\s+Lesson\s+\d+:\s+(.+)$/m
const META_REGEX = /\*\*Course:\*\*\s+([^|]+)\s*\|\s*\*\*Duration:\*\*\s+([^|]+)\s*\|\s*\*\*Level:\*\*\s+(.+)$/m
const COURSE_TITLE_REGEX = /^#\s+Course\s+\d+:\s+(.+?)\s+-/m
const COURSE_LEVEL_REGEX = /\*\*Level:\*\*\s+(.+)/m

function parseLessonMeta(content: string, slug: string, courseSlug: string): Omit<LessonMeta, 'prev' | 'next'> {
  const titleMatch = content.match(TITLE_REGEX)
  const metaMatch = content.match(META_REGEX)
  const lessonNumber = parseInt(slug.match(/lesson-(\d+)/)?.[1] ?? '0', 10)

  return {
    slug,
    courseSlug,
    title: titleMatch?.[1]?.trim() ?? slug,
    lessonNumber,
    duration: metaMatch?.[2]?.trim() ?? 'Unknown',
    level: metaMatch?.[3]?.trim() ?? 'Unknown',
  }
}

export function getAllCourses(): Course[] {
  const courseDirs = fs.readdirSync(COURSES_DIR)
    .filter(name => fs.statSync(path.join(COURSES_DIR, name)).isDirectory())
    .sort()

  return courseDirs.map(courseSlug => {
    const courseDir = path.join(COURSES_DIR, courseSlug)
    const readmeContent = fs.readFileSync(path.join(courseDir, 'README.md'), 'utf-8')

    const lessonFiles = fs.readdirSync(courseDir)
      .filter(f => f.startsWith('lesson-') && f.endsWith('.md'))
      .sort()

    const lessons = lessonFiles.map((file, i) => {
      const slug = file.replace('.md', '')
      const content = fs.readFileSync(path.join(courseDir, file), 'utf-8')
      const meta = parseLessonMeta(content, slug, courseSlug)
      return meta
    })

    // Add prev/next links
    const lessonsWithNav: LessonMeta[] = lessons.map((lesson, i) => ({
      ...lesson,
      prev: i > 0 ? lessons[i - 1].slug : null,
      next: i < lessons.length - 1 ? lessons[i + 1].slug : null,
    }))

    const titleMatch = readmeContent.match(COURSE_TITLE_REGEX)
    const levelMatch = readmeContent.match(COURSE_LEVEL_REGEX)
    // Extract description: first paragraph after "## Course Description"
    const descMatch = readmeContent.match(/##\s+Course Description\s*\n+([^\n#]+)/)

    return {
      slug: courseSlug,
      title: titleMatch?.[1]?.trim() ?? courseSlug,
      description: descMatch?.[1]?.trim() ?? '',
      level: levelMatch?.[1]?.trim() ?? 'All Levels',
      lessonCount: lessons.length,
      lessons: lessonsWithNav,
    }
  })
}

export function getCourse(courseSlug: string): Course | undefined {
  return getAllCourses().find(c => c.slug === courseSlug)
}

export function getLesson(courseSlug: string, lessonSlug: string): LessonMeta | undefined {
  return getCourse(courseSlug)?.lessons.find(l => l.slug === lessonSlug)
}
```

### Pattern 2: MDX Dynamic Import for Lesson Pages

**What:** Lesson `.md` files are outside the `app/` directory. They must be dynamically imported in `[lessonSlug]/page.tsx`. The `extension: /\.(md|mdx)$/` option in `next.config.mjs` enables `.md` file processing.

**When to use:** In `app/courses/[courseSlug]/[lessonSlug]/page.tsx`.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/mdx (verified 2026-02-27)

// app/courses/[courseSlug]/[lessonSlug]/page.tsx
import { getAllCourses, getLesson } from '@/lib/content'

export async function generateStaticParams() {
  const courses = getAllCourses()
  return courses.flatMap(course =>
    course.lessons.map(lesson => ({
      courseSlug: course.slug,
      lessonSlug: lesson.slug,
    }))
  )
}

export const dynamicParams = false

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
  const { courseSlug, lessonSlug } = await params
  // Dynamic import resolves to the compiled MDX Server Component
  const { default: LessonContent } = await import(
    `@/../courses/${courseSlug}/${lessonSlug}.md`
  )
  const lesson = getLesson(courseSlug, lessonSlug)

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-[65ch] mx-auto">
      <LessonContent />
    </article>
  )
}
```

> **Important:** The `@/../courses/` import path uses the TypeScript alias `@` (maps to project root/src) then `..` to go up to the repo root where `courses/` lives. Adjust the path alias in `tsconfig.json` paths if needed. Alternatively, set `COURSES_DIR` as an absolute path in `next.config.mjs`'s webpack config.

### Pattern 3: next.config.mjs with rehype-pretty-code Dual Themes

**What:** Configure `@next/mdx` to process `.md` files with GitHub light/dark syntax highlighting via Shiki.

**Example:**
```typescript
// next.config.mjs
// Source: https://rehype-pretty.pages.dev/ + https://nextjs.org/docs/app/guides/mdx

import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
  keepBackground: false, // Let Tailwind handle backgrounds
}

// Visitor 1: extract raw code BEFORE Shiki transforms it
const extractRawCode = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === 'element' && node?.tagName === 'pre') {
      const [codeEl] = node.children
      if (codeEl?.tagName === 'code') {
        node.raw = codeEl.children?.[0]?.value ?? ''
      }
    }
  })
}

// Visitor 2: forward raw string AFTER Shiki processes
const forwardRawCode = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === 'element' && node?.tagName === 'div') {
      if (!('data-rehype-pretty-code-fragment' in (node.properties ?? {}))) return
      for (const child of node.children) {
        if (child.tagName === 'pre') {
          child.properties['raw'] = node.raw
        }
      }
    }
  })
}

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      extractRawCode,                            // BEFORE pretty code
      [rehypePrettyCode, rehypePrettyCodeOptions],
      forwardRawCode,                            // AFTER pretty code
      rehypeSlug,
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

export default withMDX(nextConfig)
```

> **Turbopack note:** When using Turbopack (`next dev --turbopack`), plugins with non-serializable options (functions like visitors) cannot be used. Disable Turbopack for development or use string-based plugin references where possible.

### Pattern 4: FOUC-Free Dark Mode with next-themes

**What:** Block theme flicker by injecting an inline script in `<head>` that reads localStorage before React hydrates.

**Example:**
```typescript
// app/layout.tsx
// Source: https://github.com/pacocoursey/next-themes + verified patterns

import { ThemeProvider } from '@/components/theme-provider'
import '@fontsource/inter/variable.css'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: reads localStorage BEFORE React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var resolved = theme === 'system' || !theme ? system : theme;
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

> **Known issue (MEDIUM confidence):** Next.js 15 has reported issues with `suppressHydrationWarning` not fully suppressing hydration mismatches when using Turbopack. If hydration warnings appear in development, run without `--turbopack` flag.

### Pattern 5: Copy-to-Clipboard Code Block Component

**What:** Custom `pre` MDX component that wraps Shiki-highlighted code with a client-side copy button.

**Example:**
```typescript
// components/copy-button.tsx
'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 opacity-100"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

// mdx-components.tsx — global MDX overrides
// Source: https://nextjs.org/docs/app/guides/mdx#using-custom-styles-and-components
import type { MDXComponents } from 'mdx/types'
import { CopyButton } from '@/components/copy-button'

export function useMDXComponents(): MDXComponents {
  return {
    pre: ({ children, raw, ...props }: React.ComponentProps<'pre'> & { raw?: string }) => (
      <div className="relative group not-prose">
        <pre {...props} className="overflow-x-auto rounded-lg p-4 text-sm">
          {children}
        </pre>
        {raw && <CopyButton code={raw} />}
      </div>
    ),
    // Override code to not add extra styling inside pre (Shiki handles it)
    code: ({ children, ...props }) => <code {...props}>{children}</code>,
  }
}
```

### Pattern 6: Shiki Dual-Theme CSS Variables

**What:** Add CSS to `globals.css` to switch between light and dark Shiki themes using the `.dark` class.

**Example:**
```css
/* globals.css */
/* Shiki dual theme: light mode default, dark mode via .dark class */
.shiki,
.shiki span {
  color: var(--shiki-light);
  background-color: var(--shiki-light-bg);
}

.dark .shiki,
.dark .shiki span {
  color: var(--shiki-dark);
  background-color: var(--shiki-dark-bg);
}

/* Medium-inspired reading typography */
.prose {
  --tw-prose-body: theme(colors.neutral.700);
  line-height: 1.75;
}

.dark .prose {
  --tw-prose-body: theme(colors.neutral.300);
}

/* Code blocks: horizontal scroll, no overflow breaking */
.prose pre {
  overflow-x: auto;
  max-width: 100%;
}
```

### Pattern 7: Course Sidebar with Mobile Sheet

**What:** Desktop sidebar shows all lessons; mobile collapses to a Sheet drawer.

**Example:**
```typescript
// components/course-sidebar.tsx
// Server component (reads data) wrapping a client trigger for mobile

import { LessonMeta } from '@/lib/content'
import { MobileSidebarTrigger } from './mobile-sidebar-trigger' // 'use client'

export function CourseSidebar({
  lessons,
  currentSlug,
  courseTitle,
}: {
  lessons: LessonMeta[]
  currentSlug: string
  courseTitle: string
}) {
  return (
    <>
      {/* Mobile: trigger button (always visible on mobile) */}
      <MobileSidebarTrigger lessons={lessons} currentSlug={currentSlug} courseTitle={courseTitle} />
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
        <nav>
          {lessons.map(lesson => (
            <a
              key={lesson.slug}
              href={`/courses/${lesson.courseSlug}/${lesson.slug}`}
              className={`block px-4 py-2 text-sm hover:bg-accent ${
                lesson.slug === currentSlug ? 'bg-accent font-medium' : ''
              }`}
            >
              {lesson.lessonNumber}. {lesson.title}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
```

### Anti-Patterns to Avoid

- **Using `gray-matter` to parse lesson metadata**: Lesson files have NO YAML frontmatter — `gray-matter` will return empty metadata and the raw content unchanged. Use the regex-based `parseInlineMetadata()` approach instead.
- **Importing lesson `.md` files statically**: `@next/mdx` must be configured with `extension: /\.(md|mdx)$/`. Without this, `.md` files are not processed and the dynamic import throws.
- **Adding `'use client'` to `mdx-components.tsx`**: This file must be a Server Component. Move client-only logic (copy button) into separate `'use client'` leaf components that `mdx-components.tsx` imports.
- **Calling `getAllCourses()` at runtime**: This uses `fs.readFileSync` — it only works in Server Components and at build time. Never call from a Client Component.
- **Using `100vw` for any container width**: Causes 1px horizontal overflow from scrollbar width. Use `100%` or `max-w-screen-*` instead.
- **Animating sidebar with `width: 0` to `width: 280px`**: This triggers layout reflow. Use Tailwind `translate-x` transforms or shadcn/ui Sheet which handles this correctly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode FOUC | Custom localStorage theme script | `next-themes` + blocking script pattern | next-themes handles SSR, cookie-based variants, system preference sync |
| Code syntax highlighting | Custom PrismJS or highlight.js setup | `rehype-pretty-code` + Shiki | Build-time, zero client JS, VS Code themes, dual theme via CSS vars |
| Accessible sidebar drawer on mobile | Custom CSS + JS slide panel | shadcn/ui `Sheet` (Radix UI) | Focus trap, escape key, accessibility attributes all handled |
| Breadcrumb with accessible markup | Hand-coded `<nav>` with `aria-*` | shadcn/ui `Breadcrumb` | aria-current, aria-label, structured data all included |
| Prev/next keyboard navigation | Custom keydown event handlers | Standard `<a>` links with keyboard-accessible focus | Native anchor navigation is sufficient; no custom key handlers needed in Phase 1 |
| Prose typography for MDX | Custom CSS for headings/paragraphs | `@tailwindcss/typography` + `prose` class | Designed for long-form markdown content; handles all elements correctly |
| Copy-to-clipboard fallback | Custom `execCommand` fallback | `navigator.clipboard.writeText` with no fallback | Target browsers all support Clipboard API; HTTPS is assumed for Vercel/Netlify deploy |

**Key insight:** The entire Phase 1 UI should have no custom CSS that duplicates what Tailwind `prose` already handles. Only add CSS overrides for the Shiki dual-theme variables and the one mobile code block overflow fix.

---

## Common Pitfalls

### Pitfall 1: Lesson Metadata Not Extracted (gray-matter Misuse)
**What goes wrong:** Developer installs `gray-matter` and calls `matter(content)` on lesson files. Returns `{ data: {}, content: '# Lesson 1...' }` because there is no `---` YAML block. All metadata (title, level, duration) comes back empty.
**Why it happens:** CONTEXT.md mentions gray-matter; developer assumes YAML frontmatter exists without inspecting actual files.
**How to avoid:** Read actual lesson files first. Build a regex-based `parseInlineMetadata(content: string)` function. Verify with a console log on 3-4 lesson files before building the full catalog.
**Warning signs:** Course catalog shows slug strings instead of titles; lesson duration shows "Unknown".

### Pitfall 2: `.md` Files Not Processed by @next/mdx
**What goes wrong:** Dynamic import `await import('../courses/01-python-fundamentals/lesson-01.md')` throws a webpack module resolution error.
**Why it happens:** `@next/mdx` default config only processes `.mdx` files. The `extension` option must be explicitly set to `/\.(md|mdx)$/`.
**How to avoid:** Add `extension: /\.(md|mdx)$/` in the `createMDX()` call. Test with a single known-good lesson file before wiring `generateStaticParams`.
**Warning signs:** `Cannot find module` error at build time or dev mode; webpack compilation error referencing `.md` files.

### Pitfall 3: FOUC on First Load (Theme Flash)
**What goes wrong:** Page loads in light mode for 100-200ms before switching to user's saved dark mode preference. Visible as white flash on every page load.
**Why it happens:** ThemeProvider hydrates AFTER the page HTML is rendered. No blocking mechanism to set theme class before paint.
**How to avoid:** Add the inline `<script>` block in `<html><head>` BEFORE stylesheets. Confirm `suppressHydrationWarning` is on `<html>` tag, not `<body>`.
**Warning signs:** Flicker visible on hard refresh in dark mode; React hydration warnings about class mismatch.

### Pitfall 4: Code Block Horizontal Scroll Breaks Page Layout
**What goes wrong:** Long Python lines (e.g., 80+ char strings, chained methods) cause horizontal overflow on the entire page, not just the code block.
**Why it happens:** `overflow-x: auto` on `<pre>` is blocked by a parent with `overflow: hidden` or `min-width: 0` is missing on a flex child.
**How to avoid:** Test at 375px immediately. Ensure `<pre>` has `overflow-x: auto` AND `max-width: 100%`. Add `min-w-0` to any flex child containing the content area.
**Warning signs:** Horizontal scrollbar appears at page level (not just code block level) on mobile.

### Pitfall 5: Turbopack Breaks Plugin Functions
**What goes wrong:** `next dev --turbopack` errors with: "remark/rehype plugins with non-serializable options cannot be used with Turbopack."
**Why it happens:** The `extractRawCode` and `forwardRawCode` visitor functions are not serializable for Turbopack's Rust-based compilation.
**How to avoid:** Use `next dev` (without `--turbopack`) during Phase 1 development. Document this in a project-level note. Turbopack support can be added in a future phase if visitors are refactored to named exports in separate files.
**Warning signs:** Any `SyntaxError` or "cannot be used with Turbopack" error during `next dev --turbopack`.

### Pitfall 6: generateStaticParams Misses Course 05's 12 Lessons
**What goes wrong:** Hardcoded lesson counts or assumptions of 10 lessons per course miss course 05 (data structures: 12 lessons). Some lesson routes 404 at build.
**Why it happens:** Developer reads one course directory and extrapolates.
**How to avoid:** `generateStaticParams` must iterate ALL courses dynamically via `getAllCourses()`. Never hardcode lesson counts.
**Warning signs:** `/courses/05-data-structures/lesson-11-*` and `lesson-12-*` return 404.

### Pitfall 7: MDX Import Path Alias Resolving Incorrectly
**What goes wrong:** `await import('@/../courses/${slug}/${lesson}.md')` resolves to wrong path depending on how `@` alias is configured.
**Why it happens:** `create-next-app` sets `@` to point to the project root (`.`) or `./src`. The `courses/` directory is at the same level as `app/`, so the relative path depends on alias configuration.
**How to avoid:** Check `tsconfig.json` `paths` config after project init. If `@` points to `.`, use `@/courses/...`. If `@` points to `./src`, use `@/../courses/...`. Test with one import before wiring all routes.

---

## Code Examples

### Content Catalog Data Flow

```typescript
// app/courses/page.tsx — Course catalog (Server Component)
import { getAllCourses } from '@/lib/content'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function CourseCatalogPage() {
  const courses = getAllCourses()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {courses.map(course => (
        <Link key={course.slug} href={`/courses/${course.slug}`}>
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge variant="outline">{course.lessonCount} lessons</Badge>
              </div>
              <CardDescription className="line-clamp-3">{course.description}</CardDescription>
              <Badge variant="secondary" className="w-fit">{course.level}</Badge>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
```

### Lesson Layout with Sidebar

```typescript
// app/courses/[courseSlug]/layout.tsx — Course layout (Server Component)
import { getCourse } from '@/lib/content'
import { CourseSidebar } from '@/components/course-sidebar'
import { notFound } from 'next/navigation'

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ courseSlug: string; lessonSlug?: string }>
}) {
  const { courseSlug } = await params
  const course = getCourse(courseSlug)
  if (!course) notFound()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <CourseSidebar
        lessons={course.lessons}
        courseTitle={course.title}
        currentSlug=""  // passed from page via searchParams or segment
      />
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
```

### Breadcrumb

```typescript
// components/lesson-breadcrumb.tsx (Server Component)
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export function LessonBreadcrumb({
  courseSlug, courseTitle, lessonTitle
}: { courseSlug: string; courseTitle: string; lessonTitle: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/courses/${courseSlug}`}>{courseTitle}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{lessonTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-mdx-remote` for local MD files | `@next/mdx` with App Router | Next.js 13+ App Router | Zero MDX runtime in client bundle |
| Prism.js client-side highlighting | Shiki build-time via rehype-pretty-code | 2023-2024 | Zero syntax highlighter JS in client bundle |
| `tailwind.config.js` for theme | `@theme` block in `globals.css` | Tailwind v4 (2025) | No config file needed; CSS-first |
| HSL color tokens in shadcn/ui | OKLCH color tokens | shadcn/ui v4 (2025) | Better color perception, wider gamut |
| `React.forwardRef` in shadcn components | Direct component functions | shadcn/ui v4 (2025) | Simpler types, no forwardRef wrapper |
| `toast` component in shadcn/ui | `sonner` | 2025 | toast deprecated; not needed in Phase 1 |
| `framer-motion` package name | `motion` package name | 2024 | Same API, same import; not needed in Phase 1 |

**Deprecated/outdated:**
- `next-mdx-remote`: No longer maintained; community warns against use for local files
- Prism.js in MDX: Ships client-side JS; replaced by Shiki at build time
- `tailwind.config.js` with `darkMode: 'class'`: Still works in v4 for compat but not idiomatic

---

## Open Questions

1. **Sidebar current lesson highlighting across Server/Client boundary**
   - What we know: `CourseSidebar` is a Server Component that receives `lessons`. It needs to know the current `lessonSlug` to apply `bg-accent` highlight.
   - What's unclear: In `[courseSlug]/layout.tsx`, the `lessonSlug` param is only available if the layout receives `params` from a nested dynamic segment. Layout params behavior for nested dynamic segments changed in Next.js 15.
   - Recommendation: Pass current slug as a searchParam, or use a thin Client Component wrapper around the sidebar that reads `usePathname()` to derive the current lesson. This is the cleanest approach.

2. **Import path for `courses/` from dynamic import**
   - What we know: `await import('@/../courses/...')` or `await import(`../../courses/${slug}/${lesson}.md`)` — exact path depends on alias config set by `create-next-app`.
   - What's unclear: Whether the webpack dynamic import supports template literals with variables pointing outside the Next.js project root (which may trigger security warnings).
   - Recommendation: Test the import path in isolation on lesson-01 before wiring `generateStaticParams`. If template literal imports are blocked, create a build-time script that copies/symlinks `courses/` into `app/content/` instead.

3. **Turbopack compatibility during development**
   - What we know: The `extractRawCode` rehype visitor is a plain function and cannot be used with Turbopack.
   - What's unclear: Whether disabling Turbopack significantly slows development for this project size.
   - Recommendation: Use `next dev` (no `--turbopack`) in Phase 1. Document in `package.json` scripts. Revisit in Phase 3 if build times become painful.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library (to be installed — Wave 0) |
| Config file | `vitest.config.ts` — Wave 0 |
| Quick run command | `pnpm test --run` |
| Full suite command | `pnpm test --run --coverage` |

> Note: No test infrastructure exists in the project yet. Wave 0 must install and configure it.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Lesson pages render MDX with syntax-highlighted code | smoke | `pnpm build` (build fails if MDX import broken) | ❌ Wave 0 |
| CONT-02 | Course catalog shows all 12 courses | unit | `pnpm test --run tests/lib/content.test.ts` | ❌ Wave 0 |
| CONT-03 | Each course page lists all lessons with titles | unit | `pnpm test --run tests/lib/content.test.ts` | ❌ Wave 0 |
| CONT-04 | Code blocks have copy-to-clipboard button | unit | `pnpm test --run tests/components/copy-button.test.tsx` | ❌ Wave 0 |
| LAYO-01 | Typography: 65-75ch line width, 1.75 line-height | manual | Visual check at 1440px viewport | N/A (manual) |
| LAYO-02 | Sidebar shows all lessons; active lesson highlighted | unit | `pnpm test --run tests/components/course-sidebar.test.tsx` | ❌ Wave 0 |
| LAYO-03 | Prev/next shows correct adjacent lesson | unit | `pnpm test --run tests/lib/content.test.ts` (prev/next links) | ❌ Wave 0 |
| LAYO-04 | Breadcrumb shows Home > Course > Lesson | unit | `pnpm test --run tests/components/lesson-breadcrumb.test.tsx` | ❌ Wave 0 |
| LAYO-05 | 375px layout: no horizontal overflow | manual | Chrome DevTools 375px device; horizontal scrollbar absent | N/A (manual) |
| LAYO-06 | No FOUC on dark mode page load | manual | Hard refresh in dark mode; no white flash visible | N/A (manual) |

### Sampling Rate
- **Per task commit:** `pnpm build` (ensures no broken MDX imports) + `pnpm test --run`
- **Per wave merge:** `pnpm test --run --coverage`
- **Phase gate:** Full suite green + manual LAYO-01, LAYO-05, LAYO-06 sign-off before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — test framework config
- [ ] `tests/lib/content.test.ts` — covers CONT-02, CONT-03, LAYO-03 (metadata parsing, lesson counts, prev/next)
- [ ] `tests/components/copy-button.test.tsx` — covers CONT-04
- [ ] `tests/components/course-sidebar.test.tsx` — covers LAYO-02
- [ ] `tests/components/lesson-breadcrumb.test.tsx` — covers LAYO-04
- [ ] Framework install: `pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom`

---

## Sources

### Primary (HIGH confidence)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — official, verified 2026-02-27; `@next/mdx` config, frontmatter options, `generateStaticParams` pattern, `mdx-components.tsx` requirement
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — official; `dynamicParams = false` behavior
- [rehype-pretty-code docs](https://rehype-pretty.pages.dev/) — official; dual theme config, `keepBackground` option
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) — official; `@theme inline` pattern, OKLCH colors, CLI init command
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) — official; `suppressHydrationWarning`, `attribute="class"` setup

### Secondary (MEDIUM confidence)
- [Fixing FOUC in React/Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering) — verified: blocking inline script pattern matches next-themes recommendations
- [Copy-to-clipboard with rehype-pretty-code](https://claritydev.net/blog/copy-to-clipboard-button-nextjs-mdx-rehype) — verified: two-pass visitor pattern for extracting raw code string
- [Next.js 15 + shadcn/ui + Tailwind v4 setup](https://dev.to/darshan_bajgain/setting-up-2025-nextjs-15-with-shadcn-tailwind-css-v4-no-config-needed-dark-mode-5kl) — MEDIUM; community post, multiple steps match official docs
- [Shiki dual themes](https://shiki.matsu.io/guide/dual-themes) — official Shiki docs; CSS variable output format confirmed

### Tertiary (LOW confidence — flag for validation)
- [suppressHydrationWarning Turbopack issue](https://github.com/vercel/next.js/discussions/75890) — GitHub discussion; reports Turbopack + next-themes hydration warnings; verify at implementation
- Dynamic import path for `courses/` outside Next.js root — not officially documented; test empirically in first implementation task

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official docs; versions current as of March 2026
- Architecture: HIGH — route structure follows official Next.js App Router patterns; content pipeline is standard SSG pattern
- Metadata parsing: MEDIUM — inline bold text regex pattern is project-specific; not a documented library approach; verify regex against all 12 course formats
- Pitfalls: HIGH — all 7 pitfalls verified from either official docs (FOUC, `.md` extension) or multiple community sources (horizontal overflow, gray-matter misuse)

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable libraries; shadcn/ui and Next.js release frequently but App Router API is stable)
