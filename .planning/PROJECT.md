# JustLearn

## What This Is

A Medium-inspired learning platform built with Next.js and shadcn/ui for teaching Python to beginners. The platform delivers comprehensive Python courses (120+ lessons) with interactive practice, animated mindmaps, and AI-powered learning assistance via NotebookLM integration. Designed for 300 students with a clean, minimalist aesthetic focused on readability and engagement.

## Core Value

Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification — all in one place.

## Current Milestone: v1.1 JustLearn UX Overhaul

**Goal:** Rebrand to JustLearn, consolidate courses into a unified Python Course, chunk long lessons into digestible patches with table of contents and practice sections, overhaul UI/UX for comfortable Medium-style reading, and improve code syntax highlighting.

**Target features:**
- Improved homepage with JustLearn branding
- Consolidate 12 separate Python courses into a single unified "Python Course" with sections
- Split long lessons into smaller, focused patches with lesson-level table of contents
- Embedded practice exercises within lesson patches where appropriate
- UI/UX overhaul for comfortable, Medium-quality reading experience
- Enhanced code syntax highlighting

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

### Active

- [ ] JustLearn homepage with new branding
- [ ] Unified Python Course structure (consolidate 12 courses into sections)
- [ ] Lesson chunking — split long lessons into smaller patches
- [ ] Per-lesson table of contents navigation
- [ ] Embedded practice within lesson patches
- [ ] UI/UX overhaul — comfortable Medium-style reading
- [ ] Enhanced code syntax highlighting

### Out of Scope

- User authentication/accounts system — focus on content delivery first
- Payment/subscription system — free platform for now
- Video content hosting — text and code focused
- Real-time collaboration — individual learning experience
- Native mobile app — web-first approach
- Backend API — static/SSG content from existing MD files

## Context

- v1.0 shipped with 12 separate courses, 120+ lessons, all 32 requirements complete
- Project rebranded from "Python Beginner Learning Platform" to "JustLearn"
- Current course structure: 12 independent courses each with README.md and 10-12 lesson files
- Lessons follow a 4-part, 2-hour structure — too long for focused reading sessions
- Target audience: 300 complete Python beginners
- Content uses real-world scenarios (shopping lists, student grades, blog platforms)

## Constraints

- **Tech Stack**: Next.js 15+ with App Router, shadcn/ui, Tailwind CSS
- **Design**: Medium-inspired, clean minimalist aesthetic — UX architect input
- **Content Source**: Existing Markdown files in `courses/` directory
- **Performance**: Fast page loads, static generation where possible
- **Accessibility**: WCAG 2.1 AA compliant

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js with App Router | Modern React framework with SSG/SSR, ideal for content sites | ✓ Good |
| shadcn/ui + Tailwind | Customizable component library matching minimalist aesthetic | ✓ Good |
| NotebookLM integration | AI-powered learning assistance without building custom LLM infra | ✓ Good |
| Medium-inspired layout | Proven reading experience for long-form educational content | ✓ Good |
| Static generation from MD | Content already exists as MD files, SSG gives best performance | ✓ Good |
| Rebrand to JustLearn | Generic name allows platform to expand beyond Python in future | — Pending |
| Consolidate 12 courses into 1 | Reduces navigation complexity for beginners; progressive structure | — Pending |

---
*Last updated: 2026-03-14 after milestone v1.1 start*
