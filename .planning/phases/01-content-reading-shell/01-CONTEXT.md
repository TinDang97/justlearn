# Phase 1: Content + Reading Shell - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Statically generate all 122 lesson pages and 12 course index pages from existing Markdown files. Deliver a Medium-quality reading experience with course navigation, dark/light mode, and mobile responsiveness. No backend, no interactivity beyond navigation and theme toggle.

</domain>

<decisions>
## Implementation Decisions

### Content Pipeline
- Use `@next/mdx` with App Router for build-time MDX compilation (NOT `next-mdx-remote` — unmaintained, ships client runtime)
- Shiki for syntax highlighting at compile time (zero runtime JS for code blocks)
- `gray-matter` for frontmatter extraction from existing lesson MD files
- `generateStaticParams` for all lesson and course routes — 100% static generation
- Lesson files already have consistent frontmatter: title, course, duration, level, learning objectives, prerequisites

### Reading Layout
- Medium-inspired typography: 65-75 character line width, 1.75 line-height
- Font stack: Inter for UI, system monospace for code blocks
- Clean, minimalist aesthetic — generous whitespace, no visual clutter
- shadcn/ui components for consistent design language

### Navigation
- Course sidebar showing all lessons in current course with active lesson highlighted
- Previous/next lesson controls at bottom of each lesson page
- Breadcrumb: Home > Course Name > Lesson Title
- Course catalog as landing page showing all 12 courses as cards with lesson count and level

### Dark Mode
- `next-themes` with blocking inline script in `<head>` to prevent FOUC
- shadcn/ui dark mode variants (built-in support)
- System preference detection with manual override toggle

### Mobile Responsiveness
- Tailwind responsive classes, test at 375px breakpoint
- Collapsible sidebar on mobile (hamburger menu or slide-in drawer)
- Code blocks horizontally scrollable on small screens
- Typography adjusts for mobile reading comfort

### Copy-to-Clipboard
- Single button on all code blocks — appears on hover (desktop) or always visible (mobile)
- Visual feedback on copy (checkmark icon replaces copy icon briefly)

### Claude's Discretion
- Exact color palette and spacing values within shadcn/ui theme
- Loading skeleton design for page transitions
- Footer content and layout
- 404 page design
- Exact sidebar width and breakpoint for collapse

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- 122 lesson Markdown files in `courses/XX-name/lesson-NN-slug.md` format
- 12 course README.md files with course description and lesson links
- 1 master README.md with curriculum overview table
- Lesson files have consistent structure: H1 title, metadata block (Course, Duration, Level), Learning Objectives, Prerequisites, Lesson Outline with Parts 1-4

### Established Patterns
- Lesson naming: `lesson-NN-slug-name.md` (zero-padded two digits)
- Course naming: `NN-slug-name/` directories (zero-padded two digits)
- Each lesson has 4 parts (30 min each): explanation, code examples, guided practice, exercises
- Frontmatter-like metadata in markdown format (not YAML frontmatter — formatted as bold text after H1)

### Integration Points
- Route structure: `/courses/[courseSlug]/[lessonSlug]` for lessons, `/courses/[courseSlug]` for course pages, `/` or `/courses` for catalog
- Content directory: `courses/` at project root
- No existing Next.js setup — greenfield project initialization needed

</code_context>

<specifics>
## Specific Ideas

- Inspired by Medium's reading experience — clean, focused, distraction-free
- Cards for course catalog should feel modern and inviting
- Real-world scenario framing already embedded in content (shopping lists, student grades, blog platforms) — surface these as tags if possible
- The platform serves 300 students — performance matters but extreme optimization is not needed
- Course 05 (Data Structures) has 12 lessons vs 10 for others — handle variable lesson counts gracefully

</specifics>

<deferred>
## Deferred Ideas

- Interactive code runner (Pyodide) — Phase 2
- Progress tracking (localStorage) — Phase 2
- Animated mindmaps — Phase 3
- Search functionality — Phase 3
- NotebookLM integration — Phase 3
- Page transition animations — Phase 3

</deferred>

---

*Phase: 01-content-reading-shell*
*Context gathered: 2026-03-14*
