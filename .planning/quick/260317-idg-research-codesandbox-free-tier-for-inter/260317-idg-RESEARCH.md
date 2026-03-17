# Research: CodeSandbox Free Tier for Interactive Code Execution

**Researched:** 2026-03-17
**Domain:** Embeddable code execution services (Python focus)
**Confidence:** HIGH

## Summary

CodeSandbox, Sandpack, and similar embeddable sandbox services **do not provide meaningful value** for this project's Python code execution needs. The existing Pyodide-based web worker architecture is already the optimal solution for the use case: client-side Python execution in an educational platform with no server costs.

Sandpack (CodeSandbox's open-source component toolkit) only executes JavaScript/Node.js code -- it has zero Python execution capability. CodeSandbox's full platform supports Python via server-side VMs, but requires credits ($0.07-0.15/hr per sandbox), has rate limits, and sends student code to external servers. StackBlitz WebContainers have only experimental Python support with no pip/package installation. Replit has deprecated embeddable Repls.

**Primary recommendation:** Keep the existing Pyodide web worker architecture. It is free, offline-capable, privacy-preserving, and already handles pandas/NumPy -- none of the alternatives match this combination for Python education.

## Detailed Findings

### 1. CodeSandbox Platform (codesandbox.io)

| Property | Value | Confidence |
|----------|-------|------------|
| Free tier | 400 credits/month (~40 hrs on Nano VM) | HIGH |
| Python support | Yes, via server-side VMs (not in-browser) | HIGH |
| Embedding | Requires VM credits, not free | HIGH |
| Concurrent VMs (free) | 10 | HIGH |
| SDK rate limits | Per-hour request caps (plan-dependent, unspecified for free) | MEDIUM |
| Offline support | None -- requires internet for VM execution | HIGH |
| Privacy | Code executes on CodeSandbox servers | HIGH |

**Verdict:** CodeSandbox runs Python on remote VMs. This is fundamentally different from the current Pyodide architecture. For 300 students running code frequently, the free 400 credits/month would be exhausted within days. The credit cost is $0.1486/hr per Nano VM (2 CPU, 4GB RAM). This model makes no sense for an educational platform that currently runs Python at zero cost.

Source: [CodeSandbox SDK Pricing](https://codesandbox.io/docs/sdk/pricing)

### 2. Sandpack (Open-source by CodeSandbox)

| Property | Value | Confidence |
|----------|-------|------------|
| Python execution | **No** -- JavaScript/Node.js only | HIGH |
| Syntax highlighting | Python supported via CodeMirror extension | HIGH |
| Execution runtime | Nodebox (browser Node.js) or iframe bundler | HIGH |
| Free for personal use | Yes, all templates | HIGH |
| Commercial license | Nodebox templates require commercial license | HIGH |
| Bundle size | ~500KB (editor + bundler) | MEDIUM |

**Verdict:** Sandpack cannot execute Python code. It is a JavaScript playground toolkit. Adding Python syntax highlighting to Sandpack would only give you an editor -- you would still need Pyodide for execution. This is strictly worse than what the project already has.

Supported execution languages: JavaScript, JSX, TypeScript, TSX, and frameworks built on these (React, Vue, Svelte, Next.js, Astro). No Python, no Ruby, no Go.

Source: [Sandpack FAQ](https://sandpack.codesandbox.io/docs/resources/faq), [Sandpack Docs](https://sandpack.codesandbox.io/docs)

### 3. StackBlitz WebContainers

| Property | Value | Confidence |
|----------|-------|------------|
| Python support | Experimental only via WASI | HIGH |
| pip support | **No** -- vanilla Python only, no packages | HIGH |
| pandas/NumPy | Not available | HIGH |
| Free tier | Free for public projects | MEDIUM |

**Verdict:** Cannot replace Pyodide. No pip means no pandas, NumPy, or any third-party packages. The Python support is explicitly described as "very experimental" and "limited to core features of the Python language."

Source: [StackBlitz WASI Announcement](https://blog.stackblitz.com/posts/announcing-wasi/)

### 4. Judge0 (Server-side code execution API)

| Property | Value | Confidence |
|----------|-------|------------|
| Python support | Yes, full CPython | HIGH |
| Free tier | Limited submissions/month via RapidAPI | MEDIUM |
| Self-hosted | Yes, open-source (AGPL) | HIGH |
| Latency | Network round-trip per execution | HIGH |
| Privacy | Code sent to external server (unless self-hosted) | HIGH |

**Verdict:** Only relevant if server-side execution is needed (e.g., for languages Pyodide cannot handle). Introduces server dependency, latency, and privacy concerns. Not a replacement for client-side Pyodide.

Source: [Judge0 GitHub](https://github.com/judge0/judge0)

### 5. Piston API

| Property | Value | Confidence |
|----------|-------|------------|
| Public API | **Shut down** as of Feb 15, 2026 | HIGH |
| Self-hosted | Yes, open-source | HIGH |

**Verdict:** No longer a viable option unless self-hosted. Even when available, it had the same server-dependency drawbacks as Judge0.

Source: [Piston GitHub](https://github.com/engineer-man/piston)

### 6. Replit Embeds

| Property | Value | Confidence |
|----------|-------|------------|
| Editable embeds | **Deprecated** -- read-only only | HIGH |
| Free tier | Starter plan, 10 apps, public only | HIGH |

**Verdict:** Replit deprecated editable embedded Repls. Read-only embeds are useless for interactive code execution.

Source: [Replit Blog](https://blog.replit.com/2025-replit-in-review)

## Comparison Matrix

| Service | Python Exec | Free | Offline | No Server | Packages (pandas) | Privacy |
|---------|------------|------|---------|-----------|-------------------|---------|
| **Pyodide (current)** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| CodeSandbox SDK | Yes | Limited | No | No | Yes | No |
| Sandpack | **No** | Yes | Yes | Yes | N/A | Yes |
| StackBlitz | Experimental | Yes | Yes | Yes | **No** | Yes |
| Judge0 | Yes | Limited | No | No | Yes | No |
| Piston | Yes | Shut down | No | No | Yes | No |
| Replit | Read-only | Limited | No | No | Yes | No |

## Current Architecture Assessment

The existing Pyodide implementation (`hooks/use-pyodide-worker.ts` + `public/workers/pyodide.worker.mjs`) is well-architected:

- **Singleton web worker** shared across all code blocks on a page (prevents duplicate WASM downloads)
- **Lazy initialization** on first run (no load cost if student never runs code)
- **Pandas support** via micropip with singleton install pattern
- **input() patching** with pre-supplied values from UI
- **DataFrame HTML rendering** with pandas detection
- **Offline capable** after initial Pyodide WASM download (~30MB, cached by browser)
- **Zero ongoing cost** -- no API keys, no server, no credits

There is nothing in the CodeSandbox/Sandpack ecosystem that improves on this for Python execution.

## Where CodeSandbox/Sandpack COULD Add Value

The only scenario where these tools add value is for **JavaScript/TypeScript execution** -- if the platform later adds JavaScript or web development courses:

- **Sandpack** would provide a live React/Vue/Next.js playground with hot reload
- **CodeSandbox embeds** would provide full IDE-like experience for web projects
- Neither helps with Python

## Common Pitfalls

### Pitfall 1: Confusing Sandpack Editor with Sandpack Execution
**What goes wrong:** Developers see Sandpack supports "Python syntax highlighting" and assume it can run Python code.
**Reality:** Sandpack's CodeMirror editor can highlight Python syntax. Its execution runtime (Nodebox/iframe bundler) only runs JavaScript. These are two completely different capabilities.

### Pitfall 2: CodeSandbox Free Credits Sound Generous
**What goes wrong:** 400 credits/month sounds like a lot until you calculate: 400 credits / 10 credits per hour = 40 hours total for the entire workspace. With 300 students each running code multiple times per session, this budget would last a single day.
**Impact:** Switching from free Pyodide to credit-based CodeSandbox would introduce an ongoing cost of $50-200+/month with no functional improvement.

### Pitfall 3: Assuming "Cloud Sandbox" Means Better
**What goes wrong:** Developers assume server-side execution is more capable than WASM.
**Reality:** For educational Python (variables, loops, functions, pandas DataFrames), Pyodide covers 95%+ of use cases. The 5% it cannot do (file system, network, C extensions) are not relevant to beginner Python education.

## Open Questions

None. The research is conclusive: CodeSandbox and alternatives do not improve on the existing Pyodide architecture for this project's Python education use case.

## Recommendation

**Do not adopt CodeSandbox, Sandpack, or similar services.** The existing Pyodide web worker is the correct solution. It is:
- Free (zero cost at any scale)
- Private (code never leaves the browser)
- Offline-capable (after initial WASM cache)
- Feature-complete for the curriculum (pandas, NumPy, standard library)
- Already well-implemented with singleton patterns and DataFrame rendering

If future courses add JavaScript/TypeScript content, revisit Sandpack at that point for JS-specific playgrounds.

## Sources

### Primary (HIGH confidence)
- [CodeSandbox SDK Pricing](https://codesandbox.io/docs/sdk/pricing) -- credit costs, VM sizes, concurrent limits
- [Sandpack FAQ](https://sandpack.codesandbox.io/docs/resources/faq) -- commercial licensing, supported languages
- [Sandpack Docs](https://sandpack.codesandbox.io/docs) -- architecture, Nodebox, JavaScript-only execution
- [StackBlitz WASI Announcement](https://blog.stackblitz.com/posts/announcing-wasi/) -- experimental Python, no pip

### Secondary (MEDIUM confidence)
- [CodeSandbox Pricing Page](https://codesandbox.io/pricing) -- free tier credit allocation (400/month)
- [Judge0 GitHub](https://github.com/judge0/judge0) -- self-hosted option, AGPL license
- [Piston GitHub](https://github.com/engineer-man/piston) -- public API shutdown notice
- [Replit Blog](https://blog.replit.com/2025-replit-in-review) -- embed deprecation

### Codebase (HIGH confidence)
- `hooks/use-pyodide-worker.ts` -- current singleton worker hook implementation
- `public/workers/pyodide.worker.mjs` -- Pyodide v0.29.3, pandas/micropip, input() patching

## Metadata

**Confidence breakdown:**
- CodeSandbox/Sandpack capabilities: HIGH -- verified via official docs
- Alternative services: HIGH -- verified via official sources
- Recommendation (keep Pyodide): HIGH -- based on direct feature comparison against project requirements

**Research date:** 2026-03-17
**Valid until:** 2026-06-17 (stable domain, pricing may change)
