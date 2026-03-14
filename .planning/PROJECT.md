# JustLearn

## What This Is

A Medium-inspired learning platform built with Next.js and shadcn/ui for teaching Python to beginners. The platform delivers a unified Python Course (12 sections, 120+ lessons) with interactive in-browser practice (Pyodide), animated mindmaps, sticky table of contents with scroll spy, and AI-powered learning assistance via NotebookLM. Designed for 300 students with warm-neutral typography and a clean reading experience.

## Core Value

Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification — all in one place.

## Requirements

### Validated

- ✓ Medium-inspired responsive layout with clean typography — v1.0
- ✓ Course catalog with progress tracking — v1.0
- ✓ Lesson pages with syntax-highlighted code blocks — v1.0
- ✓ Interactive code practice (Pyodide in-browser) — v1.0
- ✓ Animated mindmaps per lesson — v1.0
- ✓ NotebookLM AI integration — v1.0
- ✓ Progress tracking (localStorage) — v1.0
- ✓ Page transitions and micro-animations — v1.0
- ✓ Mobile-responsive design — v1.0
- ✓ Dark/light mode toggle — v1.0
- ✓ Full-text search — v1.0
- ✓ Lesson navigation (sidebar, prev/next, breadcrumbs) — v1.0
- ✓ JustLearn homepage with hero, section cards, progress — v1.1
- ✓ Unified Python Course (12 sections, virtual consolidation) — v1.1
- ✓ Zustand progress migration (12 keys → python) — v1.1
- ✓ Section-grouped sidebar with expand/collapse — v1.1
- ✓ Course overview with accordion sections — v1.1
- ✓ 4-level breadcrumbs (Course > Section > Lesson) — v1.1
- ✓ Per-lesson table of contents with scroll spy — v1.1
- ✓ Scroll progress bar — v1.1
- ✓ Warm-neutral palette, 18px body, JetBrains Mono — v1.1
- ✓ Callout MDX components (Tip, Warning, Info, Error) — v1.1
- ✓ Code blocks with language badge, diff/highlight/focus — v1.1
- ✓ PracticeBlock MDX component with code runner — v1.1

### Active

(None — planning next milestone)

### Out of Scope

- User authentication/accounts system — focus on content delivery first
- Payment/subscription system — free platform for now
- Video content hosting — text and code focused
- Real-time collaboration — individual learning experience
- Native mobile app — web-first approach
- Backend API — static/SSG content from existing MD files

## Context

- v1.0 shipped 2026-03-14: 12 separate courses, 120+ lessons, 32 requirements
- v1.1 shipped 2026-03-14: Rebranded to JustLearn, unified course, UX overhaul
- Codebase: 7,035 LOC TypeScript/CSS across ~60 source files
- Tech stack: Next.js 15.5, shadcn/ui, Tailwind CSS v4, Zustand, Pyodide, ReactFlow, Fuse.js, Motion, @shikijs/transformers
- 228 tests passing (Vitest + @testing-library/react)
- 120+ lesson MD files in `courses/` directory (unchanged — virtual consolidation)
- Target audience: 300 complete Python beginners

## Constraints

- **Tech Stack**: Next.js 15+ with App Router, shadcn/ui, Tailwind CSS v4
- **Design**: Medium-inspired warm-neutral aesthetic per specs/v1.1-design-spec.md
- **Content Source**: Existing Markdown files in `courses/` directory
- **Performance**: Fast page loads, static generation (128 pages)
- **Accessibility**: WCAG 2.1 AA compliant
- **No Turbopack**: rehype-pretty-code visitors are webpack-only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js with App Router | Modern React framework with SSG/SSR, ideal for content sites | ✓ Good |
| shadcn/ui + Tailwind | Customizable component library matching minimalist aesthetic | ✓ Good |
| NotebookLM integration | AI-powered learning assistance without building custom LLM infra | ✓ Good |
| Medium-inspired layout | Proven reading experience for long-form educational content | ✓ Good |
| Static generation from MD | Content already exists as MD files, SSG gives best performance | ✓ Good |
| Rebrand to JustLearn | Generic name allows platform to expand beyond Python in future | ✓ Good |
| Virtual consolidation (section-map.ts) | No file moves, existing getAllCourses() preserved, zero migration risk | ✓ Good |
| Zustand persist version/migrate API | Atomic localStorage migration, no ProgressHydration changes needed | ✓ Good |
| Server-side extractHeadings (not rehype plugin) | Simpler, testable, no ESM sub-path risk, github-slugger matches rehype-slug | ✓ Good |
| @shikijs/transformers (not custom CSS) | Composable on existing rehype-pretty-code, version-matched with Shiki 4.x | ✓ Good |
| JetBrains Mono via next/font/google | Next.js font optimization, CSS variable injection, no @fontsource dep | ✓ Good |

---
*Last updated: 2026-03-14 after v1.1 milestone completion*
