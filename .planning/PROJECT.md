# Python Beginner Learning Platform

## What This Is

A Medium-inspired learning platform built with Next.js and shadcn/ui for teaching Python to beginners. The platform delivers 12 comprehensive courses (120+ lessons) with interactive practice, animated mindmaps, and AI-powered learning assistance via NotebookLM integration. Designed for 300 students with a clean, minimalist aesthetic focused on readability and engagement.

## Core Value

Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification — all in one place.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Medium-inspired responsive layout with clean typography and reading experience
- [ ] Course catalog displaying 12 Python courses with progress tracking
- [ ] Individual lesson pages rendering Markdown content with syntax-highlighted code blocks
- [ ] Interactive code practice environment embedded in each lesson
- [ ] Animated mindmaps for each lesson visualizing key concepts
- [ ] NotebookLM integration for AI-powered note-taking and Q&A
- [ ] Student progress tracking across courses and lessons
- [ ] Smooth page transitions and micro-animations
- [ ] Mobile-responsive design
- [ ] Dark/light mode toggle
- [ ] Search functionality across all lessons
- [ ] Lesson navigation (previous/next, course sidebar)

### Out of Scope

- User authentication/accounts system — focus on content delivery first
- Payment/subscription system — free platform for now
- Video content hosting — text and code focused
- Real-time collaboration — individual learning experience
- Native mobile app — web-first approach
- Backend API — static/SSG content from existing MD files

## Context

- 12 courses with 120+ lesson Markdown files already exist in `courses/` directory
- Each course has a README.md and 10-12 lesson files
- Lessons follow a 4-part, 2-hour structure: explanation, code examples, guided practice, exercises
- Target audience: 300 complete Python beginners
- Content uses real-world scenarios (shopping lists, student grades, blog platforms)
- Course 05 (Data Structures) has 12 lessons for extra depth
- Course 12 includes 3 capstone projects (Blog Platform, Analytics Pipeline, CLI Tool)

## Constraints

- **Tech Stack**: Next.js 15+ with App Router, shadcn/ui, Tailwind CSS
- **Design**: Medium-inspired, clean minimalist aesthetic
- **Content Source**: Existing Markdown files in `courses/` directory
- **AI Integration**: NotebookLM for intelligent note-taking and practice clarification
- **Performance**: Fast page loads, static generation where possible
- **Accessibility**: WCAG 2.1 AA compliant

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js with App Router | Modern React framework with SSG/SSR, ideal for content sites | — Pending |
| shadcn/ui + Tailwind | Customizable component library matching minimalist aesthetic | — Pending |
| NotebookLM integration | AI-powered learning assistance without building custom LLM infra | — Pending |
| Medium-inspired layout | Proven reading experience for long-form educational content | — Pending |
| Static generation from MD | Content already exists as MD files, SSG gives best performance | — Pending |

---
*Last updated: 2026-03-14 after initialization*
