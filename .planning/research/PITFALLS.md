# Domain Pitfalls

**Domain:** Python Beginner Learning Platform (Next.js 15 + MDX + Interactive Code + AI Integration)
**Researched:** 2026-03-14
**Overall Confidence:** MEDIUM-HIGH (verified via multiple sources; NotebookLM API status is evolving)

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

**Phase:** Must be addressed in Phase 1 (interactive code environment setup). Wrong architecture here requires full rewrite.

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

**Phase:** Must be resolved before Phase 1 UI design is finalized. Discovering this during implementation causes layout rework.

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

**Phase:** Phase 1 content rendering foundation. Correct from the start; retrofitting costs significant refactoring.

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

**Phase:** Phase 1 layout setup. Gets worse over time as more pages are added; fix at layout level.

---

## Moderate Pitfalls

---

### Pitfall 5: Code Block Horizontal Overflow Breaks Mobile Reading Experience

**What goes wrong:** Python code examples with long lines (common in string formatting, list comprehensions, chained method calls) overflow their container on mobile. The result is either the code is cut off, or it creates unwanted horizontal scroll that breaks the page layout. freeCodeCamp documented this as a known user complaint.

**Why it happens:** Developers test on desktop. Code blocks use `overflow-x: auto` on the block itself but the parent container has `overflow-x: hidden`, clipping the scroll. Or the page-level layout uses `100vw` width which includes the scrollbar, causing 1px overflow that triggers global horizontal scroll.

**Prevention:**
- Never use `width: 100vw` on any container — use `width: 100%` or `max-width: 100%`
- Code blocks must use `overflow-x: auto` with explicit `max-width: 100%` constraint
- Test on real mobile viewport (375px, 390px) using Chrome DevTools — not just responsive mode
- Consider a "word wrap" toggle for code blocks on mobile screens under 480px
- Prism/Shiki output: ensure the `<pre>` element has `overflow-x: auto` and is not a child of an `overflow: hidden` container

**Warning signs:**
- Any container with `overflow-x: hidden` wrapping content sections
- Code blocks inside a flex column where the parent has `min-width: 0` missing
- Horizontal scrollbar appearing on any mobile viewport width

**Phase:** Phase 1 layout + Phase 2 content rendering. Catch in design review before lesson pages are built.

---

### Pitfall 6: Animated Mindmap SVG Causes Layout Jank on Low-End Devices

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
- If node count exceeds 20, consider rendering as Canvas instead of SVG

**Warning signs:**
- `d3.select(svgRef.current)` inside a `useEffect` that also triggers React state updates
- Animating SVG `cx`/`cy`/`x`/`y` attributes instead of CSS transforms
- Mindmap re-renders on every lesson page navigation instead of mounting fresh

**Phase:** Phase 2 mindmap feature. High effort to rewrite animation architecture after the fact.

---

### Pitfall 7: Progress Tracking Lost on Browser Clear or Different Device

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
- Store progress as a compact bitmask or JSON array with lesson IDs — keep under 50KB total to avoid localStorage quota issues
- If cross-device sync becomes critical, a serverless function + free-tier database (PlanetScale free tier, Supabase free tier) can be added without a full backend

**Warning signs:**
- Progress stored in React component state without persistence
- `localStorage.setItem` called without error handling (quota exceeded throws)
- No UI indication that progress is browser-local

**Phase:** Phase 3 progress tracking feature. Architecture decision must be made before implementation.

---

### Pitfall 8: Next.js Hydration Mismatches From Client-Only Logic in Lesson Pages

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

**Phase:** Phase 1 through all phases. Enforce as a code review rule from day one.

---

## Minor Pitfalls

---

### Pitfall 9: Syntax Highlighter Bundle Inflating Client JavaScript

**What goes wrong:** `react-syntax-highlighter` with PrismJS ships the syntax highlighter runtime and all language definitions to the browser. For a Python-focused platform, including all 200+ Prism languages adds ~200KB of unnecessary JavaScript.

**Prevention:**
- Use Shiki with `@next/mdx` on the server — renders to static HTML, zero client-side JavaScript
- If client-side highlighting is unavoidable, use `PrismLight` (async light build) and import only `python`, `bash`, and `json` language definitions
- Validate with `next-bundle-analyzer` after setup

**Phase:** Phase 1 content rendering.

---

### Pitfall 10: Framer Motion Shared Layout Animations Broken in App Router

**What goes wrong:** Framer Motion's `<AnimatePresence>` and shared layout animations (`layoutId`) have documented compatibility issues with the Next.js App Router, particularly for page transitions. The App Router's aggressive component remounting during navigation breaks exit animations.

**Prevention:**
- Use `AnimatePresence mode="popLayout"` or `mode="sync"` rather than `mode="wait"` for page transitions (avoids blocking navigation on exit animation)
- Wrap only the `{children}` in `<AnimatePresence>` at the layout level, not individual pages
- Animate only `opacity` and `y` offset for page transitions — avoid complex shared element transitions across routes
- Only animate `transform` and `opacity` CSS properties to maintain 60fps (no layout-triggering properties)

**Phase:** Phase 1 layout / Phase 4 polish animations.

---

### Pitfall 11: MDX Table Rendering Broken Without Explicit remarkGfm Plugin

**What goes wrong:** Standard GitHub Flavored Markdown tables in `.md` lesson files do not render as `<table>` elements — they render as plain text. This silently breaks any lesson that uses tables to display Python syntax comparisons, operator tables, or data structure summaries.

**Prevention:**
- Install and configure `remark-gfm` in the MDX/markdown processing pipeline
- Add automated test that renders a lesson file containing a table and asserts `<table>` element is present
- Validate at build time that all 120+ lesson files render without errors using a build-time health check script

**Phase:** Phase 1 content rendering setup.

---

### Pitfall 12: Long Lesson Text Walls Without Visual Anchors Cause Abandonment

**What goes wrong:** Python beginner lessons are text-heavy by nature. Without visual hierarchy, callout blocks, and whitespace, lessons feel like documentation rather than guided learning. Beginners disengage at paragraph-dense sections (particularly the explanation sections before code examples).

**Why it happens:** Markdown renders flat — all paragraphs have equal visual weight. Developers faithfully render the markdown without layering UI enhancements.

**Prevention:**
- Map custom MDX components to Markdown elements: `<Callout>`, `<Tip>`, `<Warning>`, `<KeyConcept>` render visually distinct from plain paragraphs
- Use a prose container with `max-width: 65ch` and `line-height: 1.7` — these are the Medium reading defaults, tested for comprehension
- Minimum font size 16px for body text; 14px is too small for sustained reading on mobile
- The 4-part lesson structure (explanation, code examples, guided practice, exercises) should be visually delineated with section headings and horizontal dividers, not just `##` headings

**Phase:** Phase 1 typography + Phase 2 MDX component library.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Core layout & MDX setup | MDX runtime shipped to client; FOUC on dark mode; table rendering broken | Use `@next/mdx` server components + Shiki + `next-themes` with inline script |
| Interactive code runner | Pyodide blocking first paint; UI freeze on code execution | Lazy load + Web Worker; show load indicator |
| NotebookLM integration | No iframe embed possible; Workspace Education disables public sharing | Design as curated link-out from the start |
| Animated mindmaps | D3 DOM conflicts with React; SVG jank on mobile | D3 as math-only, React-managed SVG, Framer Motion for animation |
| Progress tracking | localStorage loss on clear/device switch | Explicit UI disclosure; `zustand` persist; plan serverless upgrade path |
| Mobile polish pass | Code block horizontal overflow; font size too small for code | Real device testing; `overflow-x: auto` on `<pre>`; 16px minimum body |
| Page transitions | Framer Motion App Router compatibility; CLS from animation | Animate opacity+y only; `mode="popLayout"` |

---

## Sources

- [Next.js MDX Guides — Official Docs](https://nextjs.org/docs/app/guides/mdx)
- [next-mdx-remote maintenance concerns — DEV Community](https://dev.to/ptpaterson/getting-started-with-nextjs-15-and-mdx-305k)
- [MDX Table Rendering Bug — Next.js GitHub Discussion #77266](https://github.com/vercel/next.js/discussions/77266)
- [Pyodide performance limitations](https://pyodide.com/is-pyodide-slower-than-native-python/)
- [Pyodide GitHub](https://github.com/pyodide/pyodide)
- [Browser Python sandboxing security notes](https://gist.github.com/mavdol/2c68acb408686f1e038bf89e5705b28c)
- [NotebookLM Enterprise API (alpha) — Google Cloud Docs](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks)
- [NotebookLM public link sharing (June 2025)](https://blog.google/technology/google-labs/notebooklm-public-notebooks/)
- [NotebookLM Education account restrictions](https://workspaceupdates.googleblog.com/2025/08/notebooklm-is-now-available-to-all.html)
- [NotebookLM limitations overview](https://www.atlasworkspace.ai/blog/notebooklm-limitations)
- [Public NotebookLM API missing — Medium](https://medium.com/@kombib/public-notebooklm-api-why-we-need-it-now-7244a5371f57)
- [D3.js + React performance — Medium](https://medium.com/@tibotiber/react-d3-js-balancing-performance-developer-experience-4da35f912484)
- [Fixing dark mode FOUC in Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering)
- [Next.js hydration mismatch errors — LogRocket](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/)
- [Next.js hydration errors 2026 — Medium](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)
- [Shiki in Next.js — Nikolai Lehbrink](https://www.nikolailehbr.ink/blog/syntax-highlighting-shiki-next-js/)
- [react-shiki GitHub](https://github.com/AVGVSTVS96/react-shiki)
- [Framer Motion App Router issues — Next.js GitHub #49279](https://github.com/vercel/next.js/issues/49279)
- [Code block horizontal scroll — freeCodeCamp Issue #51750](https://github.com/freeCodeCamp/freeCodeCamp/issues/51750)
- [CSS overflow issues — Smashing Magazine](https://www.smashingmagazine.com/2021/04/css-overflow-issues/)
- [localStorage for React state — LogRocket](https://blog.logrocket.com/using-localstorage-react-hooks/)
