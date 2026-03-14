# Domain Pitfalls

**Domain:** Python Beginner Learning Platform (Next.js 15 + MDX + Interactive Code + AI Integration)
**Researched:** 2026-03-14
**Confidence:** HIGH (v1.1 additions verified against existing codebase; patterns cross-referenced with Next.js docs and community sources)

---

## Critical Pitfalls

Mistakes that cause rewrites or major rearchitecting.

---

### Pitfall 1: Pyodide Bundle Blocking First Paint

**What goes wrong:** Pyodide's WebAssembly bundle is 8–20MB depending on packages included. If loaded eagerly on every lesson page, it blocks meaningful paint and interaction for 5–15 seconds on average connections. Beginners abandoning on first lesson is the failure mode — not a tech issue, a product-killing UX issue.

**Why it happens:** Developers treat the code runner as a page feature rather than a lazy-loaded enhancement. Pyodide is imported at the module level or included in the main JS bundle.

**Consequences:**
- Core Web Vitals fail (LCP, INP)
- Beginners experience a blank/frozen lesson on first load
- Mobile users on 4G/LTE see 15–30 second delays
- No fallback if Pyodide fails to load

**Prevention:**
- Load Pyodide only when the user clicks "Run Code" or scrolls to the interactive block
- Use dynamic `import()` inside a `useEffect` or user interaction handler — never at module level
- Run Pyodide inside a `Web Worker` to prevent UI blocking (non-negotiable for responsiveness)
- Cache the WASM assets aggressively with Service Worker or CDN headers
- Show a loading indicator with estimated time, not a spinner with no context
- Set a 30-second timeout with a graceful fallback (static expected output display)

**Warning signs:**
- Any lesson page `generateStaticParams` includes Pyodide in the component tree
- Pyodide import appears outside of a user-interaction or lazy-load boundary
- Lighthouse TTI > 5 seconds on lesson pages

**Phase to address:** Phase 1 (interactive code environment setup). Wrong architecture here requires full rewrite.

---

### Pitfall 2: NotebookLM Integration is Not Embeddable — Design Around Links, Not iFrames

**What goes wrong:** Teams plan NotebookLM as an embedded interactive panel within the lesson UI. NotebookLM consumer version does not support iframe embedding. The Enterprise API (alpha as of late 2025) requires Google Workspace Enterprise licensing, not available for a 300-student free platform. Workspace Education accounts disable public sharing. The result: the planned AI integration cannot ship as designed.

**Why it happens:** NotebookLM's polished web interface creates an expectation of embeddability. The public link sharing feature (released June 2025) only redirects users to notebooklm.google, it does not provide an embeddable widget.

**Consequences:**
- Major UI redesign when the iframe approach is blocked by browser security (`X-Frame-Options: SAMEORIGIN` on Google properties)
- Integration becomes a link-out, not a seamless experience
- If students need Google accounts to access shared notebooks, age restrictions (18+) create COPPA compliance issues for a beginner-oriented platform

**Prevention:**
- Design the NotebookLM integration as curated link-out from day one, not an embedded panel
- Each lesson gets a pre-built NotebookLM notebook link (created manually by the course author) — link opens in a new tab
- Alternatively, evaluate Gemini API directly as a backend Q&A endpoint if seamless integration is required (requires a backend, which is currently out of scope)
- Document the decision explicitly: "NotebookLM = external resource, not embedded tool"

**Warning signs:**
- Wireframes show a side panel or embedded chat widget labeled "NotebookLM"
- Any mention of `<iframe src="notebooklm.google...">` in design docs
- Plans to use the NotebookLM API without an Enterprise Workspace account

**Phase to address:** Must be resolved before Phase 1 UI design is finalized. Discovering this during implementation causes layout rework.

---

### Pitfall 3: MDX Rendering Ships the Full JS Runtime to the Client

**What goes wrong:** `next-mdx-remote` or improperly configured `@next/mdx` causes the MDX parsing and rendering JavaScript runtime to be sent to the browser. For 120+ lesson pages this means every student downloads a large unnecessary client bundle on every lesson. Additionally, `next-mdx-remote` is unmaintained as of 2025.

**Why it happens:** Developers copy tutorial code that uses client-side MDX rendering, which made sense before React Server Components. The App Router default is server components, but MDX setup is easy to misconfigure into client rendering.

**Consequences:**
- 50–200KB of unnecessary JavaScript per page
- Hydration mismatches when MDX components reference browser-only APIs
- Syntax highlighting shipped to the client instead of pre-rendered on the server

**Prevention:**
- Use `@next/mdx` with App Router server components — MDX renders on the server, zero MDX runtime ships to the client
- Use Shiki for syntax highlighting (renders to static HTML at build time, zero client JS)
- Avoid `next-mdx-remote` (unmaintained); use `next-mdx-remote-client` only if dynamic remote MDX is genuinely needed (it is not — content is local files)
- Validate with `next build --analyze` that no MDX runtime appears in client bundle

**Warning signs:**
- `next-mdx-remote` in `package.json`
- Any MDX component file with `"use client"` at the top
- Syntax highlighting library imported in a Client Component

**Phase to address:** Phase 1 content rendering foundation. Correct from the start; retrofitting costs significant refactoring.

---

### Pitfall 4: Dark Mode Flash of Unstyled Content (FOUC) on Every Page Load

**What goes wrong:** The dark/light mode toggle implemented with `localStorage` or `prefers-color-scheme` media query causes a white flash before the user's preferred theme loads. This is especially jarring on a reading-focused platform where users spend long sessions.

**Why it happens:** Next.js SSR renders the page before JavaScript executes. The theme is stored client-side. Server renders light mode. Client JS switches to dark. Users see white → dark flash on every hard navigation.

**Consequences:**
- Visible flash on every page refresh or direct URL navigation
- Particularly bad on dark mode preference (bright white flash on dark displays)
- Hydration mismatch warnings in development

**Prevention:**
- Use `next-themes` library with the `suppressHydrationWarning` attribute on `<html>`
- Inject a blocking inline `<script>` in `<head>` that reads `localStorage` and sets the class before the page renders (the only correct solution for SSR + class-based dark mode)
- Store theme preference in a cookie so the server can render the correct theme directly (eliminates FOUC entirely, requires minimal server-side reading)
- Tailwind `darkMode: 'class'` is correct; never use `darkMode: 'media'` for a toggle feature

**Warning signs:**
- Theme switching code inside `useEffect`
- No inline script in `<head>` for initial theme detection
- `localStorage.getItem('theme')` called during render (not in `useEffect`)

**Phase to address:** Phase 1 layout setup. Gets worse over time as more pages are added; fix at layout level.

---

### Pitfall 5: Course Consolidation Silently Breaks Existing Progress Data

**What goes wrong:** The existing progress store in `lib/store/progress.ts` keys progress as `completedLessons[courseSlug][lessonSlug]`. When 12 courses are consolidated into 1 unified course, the `courseSlug` changes from e.g. `01-python-fundamentals` to a new unified slug like `python-course`. All existing student progress data stored in `localStorage` under key `python-course-progress` becomes orphaned. Students lose 100% of their progress silently — no error, no warning, the progress bar just resets to 0%.

**Why it happens:** The schema `Record<courseSlug, lessonSlug[]>` encodes the old URL structure. Consolidation changes the key space. The Zustand persist middleware does not know the schema changed — it happily loads old data that no longer matches any course slugs.

**Consequences:**
- Every returning student sees 0% progress after the update ships
- Progress data is not actually deleted — it's still in `localStorage` under old keys, but the app never queries it
- No automatic recovery path without explicit migration code

**Prevention:**
- Implement Zustand persist `migrate` function with version increment before changing course slugs:
  ```typescript
  // In persist options:
  version: 2,
  migrate: (persistedState: unknown, version: number) => {
    if (version === 1) {
      // Map old courseSlug keys to new unified slug
      const old = (persistedState as OldState).completedLessons
      return { completedLessons: { 'python-course': Object.values(old).flat() } }
    }
    return persistedState
  }
  ```
- Write the migration before adding any other consolidation code
- Test migration in a browser with real populated localStorage from the old schema
- Write an automated test that populates old-format state and asserts migration produces correct new-format state

**Warning signs:**
- New unified course slug defined anywhere before a Zustand `version` increment is committed
- `getCourseProgress('01-python-fundamentals', ...)` calls still exist in code after consolidation
- Progress bar tests not run against localStorage-pre-populated test cases

**Phase to address:** Course Consolidation phase — must be the first thing done, before any route or content changes.

---

### Pitfall 6: Dynamic MDX Import Path Must Match the New Directory Structure Exactly

**What goes wrong:** The lesson page uses a dynamic import:
```typescript
const { default: LessonContent } = await import(`@/courses/${courseSlug}/${lessonSlug}.md`)
```
After consolidation, if lesson files are moved, reorganized into subdirectories (e.g., `courses/python-course/01-fundamentals/lesson-01.md`), or renamed, this import path silently fails at runtime with a webpack module-not-found error. With `dynamicParams = false` the build will fail, but only if `generateStaticParams` is also updated — if it is not updated in sync, the new paths are never generated and the build succeeds but pages 404.

**Why it happens:** Webpack cannot statically analyze fully dynamic import paths. The template literal requires the actual files to exist at the exact path expressed. Any restructuring that does not update both the content directory layout AND the import path template AND `generateStaticParams` in lockstep will break.

**Consequences:**
- 404 on all lesson pages if `generateStaticParams` generates stale params
- Build error if paths exist in `generateStaticParams` but files no longer exist at the dynamic import path
- Silent 404 (not a build error) if `dynamicParams` is changed to `true` during refactoring

**Prevention:**
- Keep lesson MD files at the same depth relative to `@/courses/` — reorganization that adds nesting levels breaks the template literal
- If directory structure must change, update `content.ts`, `generateStaticParams`, and the import template in one atomic commit
- Add a build-time smoke test that verifies every param returned by `generateStaticParams` successfully resolves a file at the expected path
- Keep `dynamicParams = false` — let the build catch missing files rather than discovering 404s at runtime

**Warning signs:**
- Course content directories restructured (new subdirectory nesting) without updating the dynamic import path
- `generateStaticParams` returning slugs that do not correspond to files at `courses/${courseSlug}/${lessonSlug}.md`
- The build completing but certain lesson URLs returning 404

**Phase to address:** Course Consolidation phase. Before moving any files, establish the new directory convention and update all consumers atomically.

---

### Pitfall 7: Lesson Chunking Creates Cross-Chunk Progress Tracking Ambiguity

**What goes wrong:** A single long lesson (e.g., `lesson-03-your-first-python-program.md`) is split into three chunks (`patch-1`, `patch-2`, `patch-3`). The progress store marks completion at the `lessonSlug` level. After chunking, the question becomes: is a lesson "complete" when the student clicks "complete" on any patch, or only after all patches? If the schema is not explicitly decided and enforced, different parts of the UI will make different assumptions — the sidebar shows "done", the course progress bar counts wrong, and LessonNav prev/next logic breaks.

**Why it happens:** Lesson chunking is treated as a content/display concern. The progress data model is not updated to understand the new patch hierarchy. The existing `isComplete(courseSlug, lessonSlug)` API has no concept of sub-lesson patches.

**Consequences:**
- `getCourseProgress` counts patches as full lessons, inflating the total lesson count
- Progress bar shows completion > 100% if old lesson slugs and new patch slugs both exist in the store
- "Mark Complete" on the first patch marks the entire lesson as done in the sidebar

**Prevention:**
- Choose and commit to one tracking model before writing any chunking code:
  - **Option A (recommended):** Track each patch independently as a full lesson. `lessonSlug` becomes `lesson-03-patch-1`. Total lesson count increases. Simple, no schema change needed.
  - **Option B:** Track at the parent lesson level. Add a concept of "required patches" to `LessonMeta`. Mark complete only when all patches of a lesson are done.
- Option A is simpler and compatible with the existing store schema — choose it
- Update `getCourseProgress` denominator to use actual patch count, not original lesson count
- Test: mark only the first patch of a chunked lesson complete — assert the sidebar shows partial progress, not full completion

**Warning signs:**
- `lessonSlug` for patches contains the parent lesson slug as a prefix (e.g. `lesson-03`) AND the old `lesson-03.md` file still exists — both will appear in progress counts
- `getCourseProgress` total divided by `course.lessonCount` uses the pre-chunk count
- "Mark Complete" triggers `markComplete(courseSlug, 'lesson-03')` regardless of which patch the student is on

**Phase to address:** Lesson Chunking phase, data model decision must precede any content splitting.

---

## Moderate Pitfalls

---

### Pitfall 8: Old Course Routes Return 404 After Consolidation — No Redirects

**What goes wrong:** After consolidating 12 courses into 1, all URLs under `/courses/01-python-fundamentals/lesson-01-...` through `/courses/12-capstone-best-practices/lesson-...` return 404. Students who bookmarked lesson URLs lose their place. Any external links (if the platform is shared) break permanently.

**Why it happens:** The consolidation replaces the old route structure with a new one. Without explicit redirects in `next.config.mjs`, old URLs simply stop existing.

**Prevention:**
- Add permanent redirects for old course/lesson slugs in `next.config.mjs` before removing old routes:
  ```javascript
  async redirects() {
    return [
      { source: '/courses/01-python-fundamentals/:lessonSlug', destination: '/courses/python-course/:lessonSlug', permanent: true },
      // ... all 12 course prefixes
    ]
  }
  ```
- Automate redirect generation from the old course slug list rather than writing 12 manually
- Test: verify each old course slug redirects to the correct new URL with HTTP 308 (permanent for POST-preserving semantics) or 301

**Warning signs:**
- New course slug routes are live but no redirects exist in `next.config.mjs`
- Manual testing only checks new URLs, not old bookmarkable URLs
- `dynamicParams = false` is already removed from the old route (stops returning 404 during the grace period)

**Phase to address:** Course Consolidation phase, before old routes are removed.

---

### Pitfall 9: Table of Contents Extracts Headings With Duplicate IDs

**What goes wrong:** A ToC implementation using `rehype-slug` (already in the pipeline) generates heading anchor IDs from heading text. If two sections in a lesson share the same heading text (e.g. two `## Summary` sections, or two `## Example` headings in chunked patches), `rehype-slug` deduplicates by appending `-1`, `-2`. The ToC component, if built from the raw heading text rather than the rendered heading IDs, generates links that point to wrong anchors.

**Why it happens:** `rehype-slug` is already in `next.config.mjs`. Developers building the ToC extract `## Heading Text` and slugify it independently (e.g. with a custom `slugify()` function) rather than reading the actual `id` attribute from the rendered output. The two slugify implementations diverge on edge cases: special characters, accented letters, duplicate headings.

**Consequences:**
- ToC links scroll to the wrong section when duplicate headings exist
- On mobile where the sticky ToC is the primary navigation, this is a significant UX failure

**Prevention:**
- Extract the ToC from the rehype AST at build time, not from raw markdown text — read the `id` property that `rehype-slug` assigns, not the raw heading text
- Use the `@stefanprobst/rehype-extract-toc` plugin to extract headings after `rehype-slug` runs (order matters: slug first, then extract)
- Alternatively, pass the headings array from the server component to the client ToC component via props; never let the client re-derive IDs from text

**Warning signs:**
- ToC component calls a custom `slugify(heading.text)` function
- Any lesson file with two headings at the same level with identical text
- ToC link click scrolls to wrong position in the article

**Phase to address:** Lesson Chunking / ToC phase.

---

### Pitfall 10: rehype-pretty-code Incompatibility With Turbopack

**What goes wrong:** `rehype-pretty-code` (already in the pipeline) does not work with Turbopack in Next.js 15. The project currently uses the default Webpack bundler. If `--turbo` is added to the dev or build script (a common performance optimization), all code blocks will fail to render with syntax highlighting and the build may fail silently or with cryptic webpack/Turbopack interop errors.

**Why it happens:** Turbopack is written in Rust and does not support arbitrary Node.js-based Webpack loaders. MDX plugins that use JavaScript functions in `next.config.mjs` (like the custom `extractRawCode` visitor in this project) cannot run in Turbopack's pipeline.

**Consequences:**
- All code blocks render as unstyled plain text
- The `raw` prop forwarded to the `<pre>` element for the copy button is undefined
- Build times may appear to improve (Turbopack is faster) but the output is broken

**Prevention:**
- Do not add `--turbo` to any npm/pnpm scripts until Turbopack has official MDX + rehype-plugin support (not available as of March 2026)
- Keep Webpack as the bundler for this project
- If Turbopack is needed for dev speed, move custom rehype visitors to a separate Webpack loader and test compatibility carefully

**Warning signs:**
- `pnpm dev --turbo` or `next dev --turbo` in package.json scripts
- Code blocks rendering without syntax colors in development
- `node.raw` is undefined in the `forwardRawCode` visitor

**Phase to address:** Any phase that modifies `next.config.mjs` or adds build tooling changes.

---

### Pitfall 11: Code Block Horizontal Overflow Breaks Mobile Reading Experience

**What goes wrong:** Python code examples with long lines (common in string formatting, list comprehensions, chained method calls) overflow their container on mobile. The result is either the code is cut off, or it creates unwanted horizontal scroll that breaks the page layout.

**Why it happens:** Developers test on desktop. Code blocks use `overflow-x: auto` on the block itself but the parent container has `overflow-x: hidden`, clipping the scroll. Or the page-level layout uses `100vw` width which includes the scrollbar, causing 1px overflow that triggers global horizontal scroll.

**Prevention:**
- Never use `width: 100vw` on any container — use `width: 100%` or `max-width: 100%`
- Code blocks must use `overflow-x: auto` with explicit `max-width: 100%` constraint
- Test on real mobile viewport (375px, 390px) using Chrome DevTools — not just responsive mode
- Ensure the `<pre>` element has `overflow-x: auto` and is not a child of an `overflow: hidden` container

**Warning signs:**
- Any container with `overflow-x: hidden` wrapping content sections
- Code blocks inside a flex column where the parent has `min-width: 0` missing
- Horizontal scrollbar appearing on any mobile viewport width

**Phase to address:** UI/UX Overhaul phase. Catch in design review before lesson pages are built.

---

### Pitfall 12: Animated Mindmap SVG Causes Layout Jank on Low-End Devices

**What goes wrong:** D3.js SVG mindmaps with CSS or JS animations cause layout thrashing on mobile and mid-range devices. Each animated node triggers reflow if properties that affect layout (width, height, top, left) are animated instead of transform/opacity.

**Why it happens:** D3.js directly mutates the DOM during animations (`.transition().attr('cx', x)`). This pattern bypasses React's virtual DOM and conflicts with React's rendering cycle, causing double-render scenarios and jank.

**Consequences:**
- Mindmap animations run at <30fps on mobile
- React and D3 fighting for DOM control causes visual glitches
- Large mindmaps with 30+ nodes create significant SVG DOM overhead

**Prevention:**
- Animate only `transform` and `opacity` — never animate `x`, `y`, `width`, `height` directly in SVG (use `transform: translate()` instead of `cx`/`cy` attributes)
- Use React-managed SVG (render SVG via JSX, use Framer Motion for animations) instead of D3 direct DOM manipulation for the mindmap layout
- For layout calculation only, use D3 as a math library (compute positions, pass to React state) — D3 owns no DOM nodes
- Test on a throttled CPU (Chrome DevTools 4x slowdown) before shipping

**Warning signs:**
- `d3.select(svgRef.current)` inside a `useEffect` that also triggers React state updates
- Animating SVG `cx`/`cy`/`x`/`y` attributes instead of CSS transforms
- Mindmap re-renders on every lesson page navigation instead of mounting fresh

**Phase to address:** Mindmap feature. High effort to rewrite animation architecture after the fact.

---

### Pitfall 13: Progress Tracking Lost on Browser Clear or Different Device

**What goes wrong:** Student progress stored only in `localStorage` is silently lost when students clear browser data, use a different device/browser, or use private browsing mode. For a 12-course, 120-lesson curriculum, losing progress is a significant frustration that kills course completion rates.

**Why it happens:** The project is intentionally backend-free (static/SSG). localStorage is the obvious zero-infrastructure solution. The problem only becomes visible weeks after launch when students report progress loss.

**Consequences:**
- Students re-do completed lessons without knowing which ones they've done
- Progress bar shows 0% after any browser cache clear
- No cross-device sync (common for students who use phone + laptop)

**Prevention:**
- Explicitly document the localStorage limitation in lesson UI ("Progress is saved in this browser only")
- Design progress UI to be re-checkable without embarrassment (checkboxes, not auto-tracked)
- Use `zustand` with `persist` middleware (abstracts localStorage, handles quota errors gracefully)
- Store progress as a compact JSON array with lesson IDs — keep under 50KB total to avoid localStorage quota issues

**Warning signs:**
- Progress stored in React component state without persistence
- `localStorage.setItem` called without error handling (quota exceeded throws)
- No UI indication that progress is browser-local

**Phase to address:** Existing behavior — maintain in all phases. The v1.1 migration (Pitfall 5) is the active risk.

---

### Pitfall 14: Next.js Hydration Mismatches From Client-Only Logic in Lesson Pages

**What goes wrong:** Lesson pages use `localStorage`, `window`, or browser APIs during the initial render (outside `useEffect`). The server renders one HTML output; the client renders different output (with localStorage values). React throws hydration errors and may render content incorrectly.

**Why it happens:** Developers read theme preference, progress state, or user preferences during component initialization (`useState(() => localStorage.getItem(...))`) which runs on the server where `localStorage` is undefined.

**Consequences:**
- Console error spam in production
- Content flicker on initial render
- In React 19 / Next.js 15, hydration errors can cause full page re-render, visibly re-mounting components

**Prevention:**
- Never read `localStorage`, `window`, or `document` outside of `useEffect` or event handlers
- Initialize all client-only state as `null` or a safe default, then hydrate in `useEffect`
- Use `dynamic(() => import('./Component'), { ssr: false })` for components that are fundamentally client-only (code editor, interactive exercises)
- Test in production build (`next build && next start`) — hydration errors often only surface in production

**Warning signs:**
- `useState(localStorage.getItem('...'))` in any component
- `typeof window !== 'undefined'` guards inside render functions (symptom of the underlying problem)
- Hydration warning in browser console during development

**Phase to address:** All phases. Enforce as a code review rule from day one.

---

## Minor Pitfalls

---

### Pitfall 15: Homepage Redesign Breaks the Shared Layout and Global Nav

**What goes wrong:** The homepage (`app/page.tsx`) currently lives under the same `app/layout.tsx` that wraps every other page. Redesigning the homepage with a full-bleed hero, distinct nav style, or no sidebar requires applying layout exceptions. Developers add `overflow: hidden` or a negative-margin trick to the homepage that leaks into the layout and breaks the course catalog or lesson pages.

**Prevention:**
- Use Next.js App Router route groups to give the homepage its own layout segment: `app/(marketing)/page.tsx` with its own `layout.tsx`, isolated from `app/(app)/courses/...` layout
- Alternatively, use a conditional render in the root layout that detects the pathname — but route groups are cleaner and more maintainable
- Test: navigate from the homepage to a lesson page and back; verify no layout artifacts carry over

**Warning signs:**
- CSS rules added to `globals.css` specifically for homepage that use element selectors (e.g. `body { overflow: hidden }`)
- `app/layout.tsx` checking `usePathname()` to apply homepage-specific styles
- Lesson sidebar appearing on the homepage

**Phase to address:** Homepage Redesign phase.

---

### Pitfall 16: Syntax Highlighter Theme Switch (Light/Dark) Out of Sync With App Theme

**What goes wrong:** `rehype-pretty-code` is configured with dual themes (`github-light` / `github-dark-dimmed`) using CSS custom properties. The code blocks respond to the `dark` class on `<html>`. If the app's dark mode implementation uses a different class name (e.g. `theme-dark`), or if `next-themes` is configured with `attribute="data-theme"` instead of `attribute="class"`, all code blocks will permanently show only the light theme regardless of the user's selection.

**Prevention:**
- Verify `next-themes` is configured with `attribute="class"` and `defaultTheme="system"` to match the CSS selector `.dark pre` that `rehype-pretty-code` generates
- After any change to the dark mode mechanism, test a code block in both light and dark modes
- The existing `next.config.mjs` already uses `keepBackground: false` — this is correct; do not revert it

**Warning signs:**
- Code blocks look identical in light and dark mode
- `data-theme` attribute on `<html>` instead of class-based toggle
- `rehype-pretty-code` CSS selectors targeting `[data-theme="dark"]` but the app sets `.dark` class

**Phase to address:** Enhanced Syntax Highlighting phase. Low effort to catch early, high user-visible impact if missed.

---

### Pitfall 17: Lesson Content All-Pages Rebuild After Any Markdown Edit

**What goes wrong:** The project uses `@next/mdx` with `import()` for each lesson at build time. Next.js rebuilds all pages when any file changes if incremental static regeneration is not properly scoped. With 120+ lesson files, each content edit triggers a full build (all 120+ pages re-rendered). This is slow (2–5 min builds) and makes content iteration painful.

**Prevention:**
- Use `next dev` for content editing — it rebuilds only changed pages on demand
- For production deploys, accept the full build cost (120 pages is not large enough to require ISR at this traffic level)
- Do not add ISR (`revalidate`) to lesson pages — they are static content; ISR adds complexity without benefit
- If build time becomes a problem at 500+ lessons, investigate `@next/mdx` with Turbopack when it gains official rehype plugin support

**Warning signs:**
- `export const revalidate = 60` added to lesson pages (unnecessary; adds edge function cost)
- Build times exceeding 10 minutes (symptom of an unrelated dependency problem, not lesson count)

**Phase to address:** Lesson Chunking phase (increases lesson/patch count, potentially doubles build time).

---

### Pitfall 18: Syntax Highlighter Bundle Inflating Client JavaScript

**What goes wrong:** `react-syntax-highlighter` with PrismJS ships the syntax highlighter runtime and all language definitions to the browser. For a Python-focused platform, including all 200+ Prism languages adds ~200KB of unnecessary JavaScript.

**Prevention:**
- Use Shiki with `@next/mdx` on the server — renders to static HTML, zero client-side JavaScript
- If client-side highlighting is unavoidable, use `PrismLight` (async light build) and import only `python`, `bash`, and `json` language definitions
- Validate with `next-bundle-analyzer` after setup

**Phase to address:** Enhanced Syntax Highlighting phase.

---

### Pitfall 19: Framer Motion Shared Layout Animations Broken in App Router

**What goes wrong:** Framer Motion's `<AnimatePresence>` and shared layout animations (`layoutId`) have documented compatibility issues with the Next.js App Router, particularly for page transitions. The App Router's aggressive component remounting during navigation breaks exit animations.

**Prevention:**
- Use `AnimatePresence mode="popLayout"` or `mode="sync"` rather than `mode="wait"` for page transitions (avoids blocking navigation on exit animation)
- Wrap only the `{children}` in `<AnimatePresence>` at the layout level, not individual pages
- Animate only `opacity` and `y` offset for page transitions — avoid complex shared element transitions across routes
- Only animate `transform` and `opacity` CSS properties to maintain 60fps (no layout-triggering properties)

**Phase to address:** UI/UX Overhaul phase / polish animations.

---

### Pitfall 20: MDX Table Rendering Broken Without Explicit remarkGfm Plugin

**What goes wrong:** Standard GitHub Flavored Markdown tables in `.md` lesson files do not render as `<table>` elements — they render as plain text. This silently breaks any lesson that uses tables to display Python syntax comparisons, operator tables, or data structure summaries.

**Prevention:**
- Install and configure `remark-gfm` in the MDX/markdown processing pipeline (already present in `next.config.mjs` — do not remove it)
- Add automated test that renders a lesson file containing a table and asserts `<table>` element is present
- Validate at build time that all 120+ lesson files render without errors using a build-time health check script

**Phase to address:** Maintain in all phases. Removing `remark-gfm` during pipeline changes is the risk vector.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Zustand migration function when changing course slugs | Faster to deploy | All returning students lose progress silently | Never |
| Keep old course routes without redirects | Less config | Bookmarked URLs 404; external links break | Never |
| Track lesson completion at patch level without updating `lessonCount` denominator | No schema change | Progress bar shows wrong percentage | Never |
| Use `dynamicParams = true` during content refactoring | Fewer build errors to debug | Silent 404s instead of build-time failures | Only during active refactoring, revert immediately |
| Extract ToC headings from raw markdown text (not rehype AST) | Simpler code | Wrong anchor IDs on duplicate headings | Never — use rehype-slug output |
| Add `--turbo` to dev script for faster HMR | Faster local dev | Code blocks lose syntax highlighting | Never for this project |

---

## Integration Gotchas

Common mistakes when connecting internal systems.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Zustand persist + course consolidation | Deploy new slugs before bumping persist `version` | Always increment `version` and add `migrate` function before slug changes |
| rehype-slug + ToC extraction | Build ToC from raw markdown heading text; diverges from actual IDs | Read heading `id` attributes from rehype AST after `rehype-slug` runs |
| next-themes + rehype-pretty-code | Configure next-themes with `attribute="data-theme"` instead of `"class"` | Use `attribute="class"` to match the `.dark` CSS selector rehype-pretty-code generates |
| @next/mdx dynamic import + directory restructure | Move files without updating import template path | Update `content.ts`, `generateStaticParams`, and import path in one atomic commit |
| Course consolidation + progress bar denominator | `lessonCount` still counts original 12 courses separately | Recalculate total from new unified lesson/patch list |

---

## Performance Traps

Patterns that work at small scale but fail as the lesson count grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `getAllCourses()` reads all lesson files on every request | Slow page loads as lesson count grows; excessive filesystem I/O | `getAllCourses()` is already synchronous + no caching — acceptable for SSG; do not call it client-side | >500 lessons or ISR-enabled |
| ToC generated client-side by re-parsing markdown | ToC renders after hydration; layout shift | Generate ToC at build time in RSC, pass as prop | Any usage with hydration |
| rehype-pretty-code loads all Shiki languages | Build time increases significantly with many code blocks | Keep theme config minimal; do not add additional language transformers unless needed | >300 code blocks with complex transformers |
| `generateStaticParams` returning uncached results | Build re-computes all params on every incremental build | Acceptable for current scale; cache if build >5 min | >1000 pages |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Patch/chunk navigation shows "Lesson 1 of 47" (raw patch count) | Confusing; 47 feels like too many | Show "Lesson 3, Part 2 of 3" or group patches under parent lesson in sidebar |
| Progress resets with no explanation after consolidation deploy | Students think they lost work; trust erosion | Show one-time migration notice: "Your progress has been moved to the unified Python Course" |
| ToC floating sidebar obscures content on narrow screens | Cannot read the lesson; ToC takes up 30% width | Collapse ToC to a sticky top bar or dropdown on screens < 1024px |
| Long patch with no "Mark Complete" until the end | Students who stop mid-patch have no progress saved | Add per-section completion checkpoints for patches longer than 10 minutes |
| Full-bleed homepage hero section shifts reading expectation | Students expect a link-heavy directory; hero feels mismatched | Keep hero minimal; prioritize "Continue Learning" CTA for returning students above the fold |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Course Consolidation:** Old course routes redirect to new unified course — verify `/courses/01-python-fundamentals/lesson-01-what-is-programming` returns 308 → new URL
- [ ] **Progress Migration:** Students with existing localStorage data see correct progress after consolidation deploy — verify by pre-populating old-format state in browser and reloading
- [ ] **Lesson Chunking:** Total lesson count in course header and progress bar denominator reflects patch count, not original lesson count
- [ ] **Table of Contents:** All ToC links scroll to the correct heading — especially verify any lesson with duplicate heading text (e.g. two "## Summary" sections)
- [ ] **Syntax Highlighting:** Code blocks display correct theme in both light and dark mode — check in both modes on a fresh page load
- [ ] **Syntax Highlighting:** Copy button on code blocks still receives the `raw` prop after any rehype pipeline changes
- [ ] **Homepage:** Navigating homepage → lesson page → back to homepage does not carry over lesson layout (sidebar, course nav)
- [ ] **Mobile:** All chunked lesson pages have no horizontal overflow on 375px viewport
- [ ] **Sidebar:** Completed patches show individual checkmarks; completing one patch does not mark siblings complete

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Progress data wiped (no migration) | HIGH | Ship a one-time recovery page: show old localStorage keys, let student manually restore; add the migration retroactively with a version bump |
| All lesson pages 404 after consolidation | HIGH | Re-deploy with old course route structure restored; add redirects; then re-deploy consolidation |
| ToC links point to wrong headings | LOW | Update heading text in MD files to eliminate duplicates; or switch to `rehype-extract-toc` for ID extraction |
| Code blocks unstyled (rehype-pretty-code broke) | MEDIUM | Pin `rehype-pretty-code` to last known working version; revert any Turbopack additions |
| Dark mode flash re-introduced after homepage redesign | LOW | Ensure `suppressHydrationWarning` remains on `<html>` in root layout; check inline theme script still present |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Progress data wiped on consolidation (Pitfall 5) | Course Consolidation | Automated test: pre-populate v1 localStorage, load app, assert v2 state correct |
| Dynamic import path mismatch (Pitfall 6) | Course Consolidation | Build smoke test: every `generateStaticParams` entry resolves a real file |
| Lesson chunking progress ambiguity (Pitfall 7) | Lesson Chunking — data model first | Test: mark patch 1 complete, assert patch 2/3 still incomplete in sidebar |
| Old routes 404 without redirects (Pitfall 8) | Course Consolidation | Test all 12 old course slugs return 308 redirect |
| ToC duplicate heading IDs (Pitfall 9) | Lesson Chunking / ToC | Test: lesson with two identical headings; all ToC links scroll to correct target |
| rehype-pretty-code Turbopack incompatibility (Pitfall 10) | Any build tooling change | Verify code blocks render correctly after any `next.config.mjs` change |
| Homepage layout bleeding into course layout (Pitfall 15) | Homepage Redesign | Test: homepage → lesson nav → back, no sidebar artifact |
| Syntax highlighter theme mismatch (Pitfall 16) | Enhanced Syntax Highlighting | Manual: toggle dark mode, verify code block theme switches |
| Lesson count inflation from chunking (Pitfall 17 related) | Lesson Chunking | Assert: `getCourseProgress` denominator equals actual patch count |
| Pyodide blocking first paint (Pitfall 1) | Phase 1 (existing) | Lighthouse performance audit on lesson pages |
| NotebookLM iframe not embeddable (Pitfall 2) | Phase 1 (existing) | Design review pre-implementation |

---

## Sources

- [Next.js MDX Guides — Official Docs](https://nextjs.org/docs/app/guides/mdx)
- [Next.js redirects — Official Docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
- [Next.js generateStaticParams — Official Docs](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Dynamic imports of MDX — Next.js GitHub Discussion #82837](https://github.com/vercel/next.js/discussions/82837)
- [How to migrate Zustand localStorage store — DEV Community](https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp)
- [Zustand persist migration discussion — GitHub #1717](https://github.com/pmndrs/zustand/discussions/1717)
- [rehype-pretty-code Shiki Turbopack issue — Will Sather](https://www.sather.ws/writing/shiki-code-blocks-turbopack)
- [rehype-pretty-code + shadcn/ui MDX compatibility — GitHub #244](https://github.com/shadcn-ui/taxonomy/issues/244)
- [Shiki best performance practices — Official Docs](https://shiki.style/guide/best-performance)
- [Table of Contents for MDX with Next.js — cyishere.dev](https://www.cyishere.dev/blog/toc-for-mdx-with-nextjs)
- [How to extract TOC from MDX in Next.js — Medium](https://medium.com/@amilmohd155/how-to-extract-table-of-contents-from-a-mdx-file-in-nextjs-5c7cce322c65)
- [Understanding and Fixing FOUC in Next.js App Router 2025 — DEV Community](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk)
- [Fixing Hydration Mismatch in Next.js next-themes — Medium](https://medium.com/@pavan1419/fixing-hydration-mismatch-in-next-js-next-themes-issue-8017c43dfef9)
- [next-themes GitHub — pacocoursey](https://github.com/pacocoursey/next-themes)
- [Shiki in Next.js — Official Shiki Docs](https://shiki.style/packages/next)
- [Framer Motion App Router issues — Next.js GitHub #49279](https://github.com/vercel/next.js/issues/49279)
- [Code block horizontal scroll — freeCodeCamp Issue #51750](https://github.com/freeCodeCamp/freeCodeCamp/issues/51750)
- [localStorage for React state — LogRocket](https://blog.logrocket.com/using-localstorage-react-hooks/)
- [NotebookLM Enterprise API — Google Cloud Docs](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks)

---
*Pitfalls research for: JustLearn v1.1 UX Overhaul (course consolidation, lesson chunking, homepage redesign, enhanced syntax highlighting)*
*Researched: 2026-03-14*
