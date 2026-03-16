# Phase 13: WebLLM Foundation + Infrastructure - Research

**Researched:** 2026-03-16
**Domain:** WebGPU in-browser LLM inference, SharedArrayBuffer isolation headers, module-level singleton patterns, Pyodide mutual exclusion on Next.js 15 SSG
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | WebGPU detection + graceful NotebookLM fallback | `navigator.gpu` check pattern; NotebookLM already on platform as natural fallback target |
| INFRA-02 | Model download progress bar with phase indicators (Downloading → Caching → Compiling → Ready) | WebLLM `initProgressCallback` report object; `report.text` contains phase description; `report.progress` is 0-1 |
| INFRA-03 | COEP/COOP headers in next.config.mjs | Existing `async headers()` in next.config.mjs is the insertion point; use `credentialless` not `require-corp` |
| INFRA-04 | WebLLM engine module-level singleton | Direct codebase precedent in `hooks/use-pyodide-worker.ts` — module-level `sharedWorker` pattern to mirror exactly |
| INFRA-05 | Pyodide + WebLLM mutual-exclusion lazy loading | Pyodide already lazy (loads on first `run()` call); WebLLM must match — lazy on first AI interaction, not on page mount |
</phase_requirements>

---

## Summary

Phase 13 establishes the foundational infrastructure that all subsequent AI features (Phases 14-15) depend on. The goal is a correctly initialized in-browser WebGPU engine with production-safe headers, graceful degradation for unsupported browsers, and safe coexistence with the existing Pyodide code runner.

The codebase already contains the exact patterns needed. `hooks/use-pyodide-worker.ts` implements a module-level singleton Worker that is lazy (created on first `run()` call, not on mount), shared across all hook instances, and reference-counted for cleanup. `next.config.mjs` already has an `async headers()` block with cache rules for `/workers/:path*` and `/data/:path*` — adding COEP/COOP is a one-rule addition to this existing block. `public/workers/pyodide.worker.mjs` provides the exact worker file structure to follow for `llm.worker.mjs`. No architectural novelty is required.

The three critical infrastructure risks for this phase are: (1) COEP/COOP headers silently absent in production because `next dev` behaves differently than deployed standalone output — must verify with `curl -I` on a preview deployment, not localhost; (2) WebLLM engine initialized inside a React component causing 30-second re-initialization on every lesson navigation — must use module-level singleton identical to `usePyodideWorker`; (3) Pyodide and WebLLM loaded simultaneously on <8GB RAM devices causing tab crashes — prevented by keeping both strictly lazy and never loading both until user explicitly triggers each.

**Primary recommendation:** Copy the `usePyodideWorker` singleton pattern verbatim for `useAIEngine`. Add COEP/COOP as a new rule in the existing `headers()` array. Implement WebGPU detection before any engine instantiation. Keep WebLLM loading lazy — triggered only when the user clicks the AI button for the first time.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@mlc-ai/web-llm` | `^0.2.82` | In-browser LLM inference via WebGPU | Only production-grade WebGPU inference engine; OpenAI-compatible streaming API; built-in Cache API for model weight persistence; `WebWorkerMLCEngineHandler` isolates GPU compute from UI thread |

### Supporting (Phase 13 only — no new deps needed for other Phase 13 requirements)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | — | INFRA-01 through INFRA-05 require only `@mlc-ai/web-llm` | All other needs are native browser APIs (`navigator.gpu`, `SharedArrayBuffer`) or existing Next.js config |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@mlc-ai/web-llm` | `transformers.js` WebGPU backend | Transformers.js lacks the Worker proxy architecture and OpenAI-compatible streaming API; WebLLM is the correct choice for Phase 13 |
| `credentialless` COEP | `require-corp` COEP | `require-corp` breaks third-party resources (fonts, NotebookLM deeplinks) that don't set CORP headers; `credentialless` is the correct choice per web.dev guidance |
| Module-level singleton | Zustand store for engine ref | Zustand ref survives re-renders but does NOT survive module hot-reload in dev; module-level variable is simpler and directly mirrors the proven `usePyodideWorker` pattern |

**Installation:**
```bash
pnpm add @mlc-ai/web-llm
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 13 deliverables only)

```
/
├── public/
│   └── workers/
│       ├── pyodide.worker.mjs   # existing
│       └── llm.worker.mjs       # NEW: WebWorkerMLCEngineHandler entry point
│
├── hooks/
│   ├── use-pyodide-worker.ts    # existing — reference implementation
│   └── use-ai-engine.ts         # NEW: WebWorkerMLCEngine module-level singleton
│
├── components/
│   └── webgpu-fallback.tsx      # NEW: renders NotebookLM fallback when WebGPU unavailable
│
└── next.config.mjs              # MODIFIED: add COEP/COOP headers rule
```

### Pattern 1: Module-Level Worker Singleton (mirrors existing Pyodide pattern)

**What:** Engine instance and its initialization promise live at module scope, outside React. Multiple hook invocations share the same instance. Worker is created lazily on first user interaction.

**When to use:** Every component that needs the AI engine calls `useAIEngine()`. All share the same module-level instance — no duplicate model downloads, no re-initialization on route navigation.

**Key differences from Pyodide pattern:**
- Pyodide uses `sharedWorker: Worker | null` — WebLLM uses `engineInstance: MLCEngineInterface | null` + `enginePromise: Promise<MLCEngineInterface> | null`
- The promise guard (`enginePromise`) is critical: prevents double-initialization if two components call `getEngine()` concurrently before the first resolves
- Progress reporting is via `initProgressCallback` on `CreateWebWorkerMLCEngine`, not via `onmessage` status events

**Example:**
```typescript
// hooks/use-ai-engine.ts
// Source: mirrors hooks/use-pyodide-worker.ts module-level singleton pattern
'use client'

import { useState, useCallback, useRef } from 'react'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'

export type AIEngineStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported'

export type DownloadProgress = {
  progress: number   // 0-1
  text: string       // e.g. "Downloading model [1/3]..."
}

// Module-level singleton — survives component remount across route navigation
// Same pattern as: let sharedWorker: Worker | null = null in use-pyodide-worker.ts
let engineInstance: MLCEngineInterface | null = null
let enginePromise: Promise<MLCEngineInterface> | null = null

function isWebGPUSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'gpu' in navigator &&
    navigator.gpu !== null
  )
}

export function useAIEngine(modelId: string) {
  const [status, setStatus] = useState<AIEngineStatus>(
    isWebGPUSupported() ? 'idle' : 'unsupported'
  )
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  // statusRef pattern from use-pyodide-worker.ts: avoids stale closure in callbacks
  const statusRef = useRef(setStatus)
  statusRef.current = setStatus

  const getEngine = useCallback(async (): Promise<MLCEngineInterface> => {
    if (!isWebGPUSupported()) {
      throw new Error('WebGPU not supported')
    }
    if (engineInstance) return engineInstance
    if (enginePromise) return enginePromise

    statusRef.current('loading')

    // Dynamic import prevents SSG build failure — @mlc-ai/web-llm accesses navigator.gpu at import time
    const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm')

    enginePromise = CreateWebWorkerMLCEngine(
      new Worker('/workers/llm.worker.mjs', { type: 'module' }),
      modelId,
      {
        initProgressCallback: (report) => {
          setDownloadProgress({ progress: report.progress, text: report.text })
          if (report.progress === 1) {
            statusRef.current('ready')
          }
        },
      }
    ).then((engine) => {
      engineInstance = engine
      return engine
    }).catch((err) => {
      enginePromise = null  // allow retry
      statusRef.current('error')
      throw err
    })

    return enginePromise
  }, [modelId])

  return { getEngine, status, downloadProgress }
}
```

### Pattern 2: WebLLM Web Worker Entry Point

**What:** A minimal `.mjs` file in `public/workers/` that instantiates `WebWorkerMLCEngineHandler`. All GPU compute runs in this worker, isolated from the UI thread.

**When to use:** Required — WebLLM's Web Worker architecture keeps WebGPU shader compilation off the main thread.

**Example:**
```javascript
// public/workers/llm.worker.mjs
// Source: WebLLM official docs — WebWorker setup
// Mirrors: public/workers/pyodide.worker.mjs structure
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm'

// Handler receives postMessage from CreateWebWorkerMLCEngine proxy
// and dispatches to the MLC engine running on the GPU
const handler = new WebWorkerMLCEngineHandler()
self.onmessage = (msg) => { handler.onmessage(msg) }
```

### Pattern 3: COEP/COOP Headers in next.config.mjs

**What:** Add one new rule to the existing `async headers()` array. `SharedArrayBuffer` (required by WebGPU) is only available in cross-origin isolated contexts.

**When to use:** Must be in place before any WebLLM testing. Missing headers cause silent runtime failure in production even though `next dev` works (dev server does not enforce cross-origin isolation).

**Critical choice — `credentialless` vs `require-corp`:**
- `require-corp`: Every cross-origin resource must set `Cross-Origin-Resource-Policy` header. This breaks NotebookLM deeplinks (iframes/embeds that don't set CORP headers) and third-party fonts.
- `credentialless`: Cross-origin requests are made without credentials (cookies). Compatible with third-party resources that don't set CORP. **Use this.** Confirmed by web.dev/articles/coop-coep.

**Example:**
```javascript
// next.config.mjs — inside the existing async headers() return array
// Source: web.dev/articles/coop-coep; Vercel KB: fix-shared-array-buffer-not-defined-nextjs
{
  source: '/(.*)',
  headers: [
    { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
    { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
  ],
},
```

**Full context in next.config.mjs `headers()` — insertion order matters:**
The new rule should come FIRST in the returned array. Next.js applies headers in order; more specific path rules later in the array take precedence. Global `/(.*)`  must be declared before the specific `/workers/:path*` and `/data/:path*` cache rules so caching rules are not shadowed.

### Pattern 4: WebGPU Detection and Graceful Fallback

**What:** Check `navigator.gpu` before any model loading. If unsupported, render a `WebGPUFallback` component pointing to the existing NotebookLM integration.

**When to use:** In the AI entry-point component, before rendering any loading state or engine initialization.

**Example:**
```typescript
// components/webgpu-fallback.tsx
// Source: PITFALLS.md Pitfall 4; MDN WebGPU API
'use client'

export function WebGPUFallback({ notebookLmUrl }: { notebookLmUrl: string }) {
  return (
    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground mb-1">In-browser AI not available</p>
      <p>Your browser does not support WebGPU. Use{' '}
        <a href={notebookLmUrl} className="underline" target="_blank" rel="noopener noreferrer">
          NotebookLM
        </a>{' '}for AI assistance with this course.
      </p>
    </div>
  )
}
```

### Pattern 5: Progress Bar Phase Indicators (INFRA-02)

**What:** The `initProgressCallback` `report.text` string from WebLLM describes the current phase. Map it to a 4-phase labeled indicator: Downloading → Caching → Compiling → Ready.

**`initProgressCallback` report structure (verified from WebLLM 0.2.x docs):**
```typescript
type InitProgressReport = {
  progress: number   // 0 to 1 (monotonically increasing)
  text: string       // e.g. "Downloading model weights [1/3]...", "Loading model from cache", "Compiling shaders"
  timeElapsed: number
}
```

**Phase detection from `report.text`:**
```typescript
function inferPhase(text: string): 'downloading' | 'caching' | 'compiling' | 'ready' {
  if (/download/i.test(text)) return 'downloading'
  if (/cache|load/i.test(text)) return 'caching'
  if (/compil/i.test(text)) return 'compiling'
  return 'ready'
}
```

### Anti-Patterns to Avoid

- **Initializing WebLLM inside `useEffect`:** Destroys the engine on every route navigation. 30-second GPU pipeline recompilation per lesson page. Use module-level singleton.
- **`require-corp` COEP header:** Breaks NotebookLM deeplinks (existing platform feature). Use `credentialless`.
- **`import { CreateWebWorkerMLCEngine } from '@mlc-ai/web-llm'` at module scope:** Triggers `navigator.gpu` access at SSG build time; crashes `next build` with `ReferenceError: navigator is not defined`. Use dynamic import inside `getEngine()`.
- **Loading WebLLM eagerly on lesson page mount:** First-time model download is 2.2GB. Never trigger without explicit user interaction.
- **`"use client"` alone to guard WebLLM imports:** Does not prevent server-side module evaluation during static generation. Dynamic import with `ssr: false` (or dynamic import inside a function) is required.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GPU shader compilation + model inference | Custom WebGPU inference engine | `@mlc-ai/web-llm` | WebGPU compute shaders, quantization, KV-cache, WASM fallback all handled; thousands of engineering hours |
| Worker-to-main-thread message proxy for streaming | Custom `postMessage` protocol for delta streaming | `WebWorkerMLCEngineHandler` + `CreateWebWorkerMLCEngine` | WebLLM provides a complete bidirectional proxy that makes the Worker engine behave exactly like an in-thread engine; streaming `AsyncGenerator` works transparently |
| Cross-origin isolation for SharedArrayBuffer on static hosting | Custom Service Worker COOP/COEP shim | COEP/COOP headers in `next.config.mjs` | Project uses `output: 'standalone'` (not static export), so Next.js serves headers natively; `coi-serviceworker` shim is only needed for GitHub Pages / pure static export |
| Model weight caching and resumable download | Custom IndexedDB storage for weights | WebLLM's built-in Cache API management | WebLLM uses the browser Cache API automatically; model weights persist across sessions; resumable via HTTP Range requests internally |

**Key insight:** WebLLM's Worker proxy architecture means the hook code is nearly identical to `usePyodideWorker` — both create a Worker, both use a module-level singleton, both expose a status + action interface. The GPU complexity is fully encapsulated in the library.

---

## Common Pitfalls

### Pitfall 1: `next build` Fails — `navigator is not defined`
**What goes wrong:** `@mlc-ai/web-llm` accesses `navigator.gpu` during module initialization. If imported at the top level of any file that Next.js evaluates server-side during static generation, the build crashes. `"use client"` does not prevent this — the module is still imported and evaluated on the server to analyze exports.
**Why it happens:** SSG evaluates `"use client"` files to extract export signatures. Module-level side effects (like WebLLM's `navigator.gpu` check) run during this evaluation.
**How to avoid:** Dynamic import inside `getEngine()` function body: `const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm')`. This defers evaluation to runtime, after hydration, in the browser.
**Warning signs:** Build passes with `next dev`, fails with `next build`. Error mentions `navigator` or `window`.

### Pitfall 2: COEP/COOP Missing in Production — WebLLM Silently Fails
**What goes wrong:** `SharedArrayBuffer` is undefined in the browser. WebLLM initializes but crashes during inference with a cryptic error. `next dev` works because the dev server behavior differs from the standalone production server.
**Why it happens:** Static hosting and custom Next.js standalone deployments do not set these headers unless explicitly configured. The error from WebLLM does not clearly state "missing COEP/COOP" as the root cause.
**How to avoid:** Add headers to `next.config.mjs` before any WebLLM testing. Verify on a deployed preview URL with `curl -I https://preview.example.com | grep -i cross-origin` — NOT on localhost.
**Warning signs:** `SharedArrayBuffer is not defined` in browser console. WebLLM works locally, crashes on deployed preview.

### Pitfall 3: Engine Re-initialized on Every Route Navigation (30s Penalty)
**What goes wrong:** Student opens AI on lesson 1, navigates to lesson 2, opens AI again — waits 30 seconds while GPU pipeline recompiles from IndexedDB cache. Each navigation triggers re-initialization.
**Why it happens:** Engine created inside React component lifecycle (e.g., `useEffect`). Component unmounts on route change, engine is garbage collected.
**How to avoid:** Module-level `let engineInstance` and `let enginePromise` in `hooks/use-ai-engine.ts`. The module is loaded once per browser session and never re-evaluated on route change.
**Warning signs:** Chrome task manager shows GPU memory cleared between lesson navigations. 5-30 second delay on second AI interaction after any navigation.

### Pitfall 4: Pyodide + WebLLM Simultaneous Load — Tab Crash on <8GB RAM
**What goes wrong:** Student runs Python code (Pyodide: 50-200MB RAM) then opens AI chat (WebLLM: 1.5-4GB VRAM + 300-600MB RAM overhead). Total exceeds available memory. Browser kills the tab with no error.
**Why it happens:** Pyodide is already active from the code runner. WebLLM loads when AI panel opens. Both are in memory simultaneously.
**How to avoid:** Both Pyodide and WebLLM must be strictly lazy-loaded. Pyodide already is (loads on first `run()` call). WebLLM must follow the same discipline — load only when `getEngine()` is first called (triggered by explicit AI button click). Add `navigator.deviceMemory < 4` check before WebLLM initialization and show a warning instead of loading.
**Warning signs:** Any eager initialization of WebLLM on page mount. No device memory check before model load.

### Pitfall 5: NotebookLM Deeplinks Break After COEP Header
**What goes wrong:** Existing NotebookLM integration links stop working after `credentialless` COEP is applied. NotebookLM iframes that load cross-origin subresources without CORP headers are blocked.
**Why it happens:** `require-corp` COEP is stricter than `credentialless`. Even `credentialless` can affect some cross-origin iframe scenarios depending on how NotebookLM embeds load resources.
**How to avoid:** Use `credentialless` (not `require-corp`). If NotebookLM deeplinks still break after applying `credentialless`, narrow the header scope from `source: '/(.*)'` to `source: '/courses/(.*)'` — AI is only needed on course lesson pages, not marketing/landing pages where NotebookLM embeds may live.
**Warning signs:** NotebookLM links/embeds fail to load after COEP is added to headers. Check browser console for COEP-related blocked resource messages.

---

## Code Examples

Verified patterns from official sources and direct codebase inspection:

### WebGPU Detection (INFRA-01)
```typescript
// Source: MDN WebGPU API; PITFALLS.md Pitfall 4
// Use this check before any engine initialization
function isWebGPUSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'gpu' in navigator &&
    navigator.gpu !== null
  )
}
```

### COEP/COOP Header Rule (INFRA-03)
```javascript
// Source: web.dev/articles/coop-coep; direct inspection of next.config.mjs
// Add as FIRST element of the returned array in async headers()
{
  source: '/(.*)',
  headers: [
    { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
    { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
  ],
},
```

### Verifying Headers on Deployed Preview
```bash
# Run against deployed preview URL — NOT localhost
curl -I https://your-preview-url.vercel.app | grep -i "cross-origin"
# Expected output:
# Cross-Origin-Embedder-Policy: credentialless
# Cross-Origin-Opener-Policy: same-origin
```

### SharedArrayBuffer Availability Check
```typescript
// Source: PITFALLS.md "Looks Done But Isn't" checklist
// Run this in browser console on deployed URL to confirm COEP/COOP active
typeof SharedArrayBuffer !== 'undefined'  // must return true
```

### Existing `usePyodideWorker` Singleton (reference for INFRA-04)
```typescript
// Source: direct inspection of hooks/use-pyodide-worker.ts
// The exact module-level singleton pattern to mirror in use-ai-engine.ts:
let sharedWorker: Worker | null = null     // → engineInstance: MLCEngineInterface | null
let instanceCount = 0                       // → not needed (WebLLM never terminates)
let messageIdCounter = 0                    // → not needed (WebLLM handles internally)
// Worker lazily created on first run() call → engine lazily created on first getEngine() call
```

### Pyodide Lazy Load — Existing Mutual Exclusion Pattern (INFRA-05)
```typescript
// Source: direct inspection of hooks/use-pyodide-worker.ts lines 46-67
// Pyodide already lazy: Worker created on first run() invocation, not on mount
const run = async (code: string): Promise<RunResult> => {
  if (!sharedWorker) {  // ← this guard IS the lazy loading; WebLLM needs identical guard
    sharedWorker = new Worker('/workers/pyodide.worker.mjs', { type: 'module' })
    // ...
  }
  // ...
}
// WebLLM equivalent: if (!engineInstance && !enginePromise) { /* initialize */ }
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@xenova/transformers` package name | `@huggingface/transformers` v3 | Transformers.js v3 (Sept 2024) | Phase 13 only uses WebLLM; relevant for Phase 14 RAG pipeline |
| `require-corp` COEP (strict) | `credentialless` COEP (recommended) | web.dev guidance updated 2023-2024 | Prevents breaking third-party resources; use `credentialless` |
| `MLCEngine` (main-thread) | `CreateWebWorkerMLCEngine` (Worker-based) | WebLLM 0.2.x | GPU compute isolated from UI thread; prevents jank during inference |
| `Qwen2-0.5B` as primary | `Phi-3.5-mini-instruct-q4f16_1-MLC` as primary (~2.2GB) | 2024-2025 model releases | Phi-3.5-mini has substantially better instruction following; 0.5B relegated to low-VRAM fallback |

**Deprecated/outdated:**
- `MLCEngine` (direct main-thread instantiation): Works but blocks UI during inference. Use `CreateWebWorkerMLCEngine` instead.
- `@xenova/transformers`: Deprecated package name; use `@huggingface/transformers@^3.0.0` for Phase 14 RAG work.

---

## Open Questions

1. **NotebookLM + `credentialless` COEP compatibility**
   - What we know: `credentialless` is less strict than `require-corp` and should not block most cross-origin resources
   - What's unclear: Whether existing NotebookLM deeplinks (the platform already has these) use iframes that load cross-origin subresources that would be blocked by `credentialless`
   - Recommendation: Add headers to a preview deployment and manually click all existing NotebookLM links before Phase 13 is marked complete. If any break, narrow COEP scope to `source: '/courses/(.*)'`.

2. **`output: 'standalone'` vs headers behavior**
   - What we know: `next.config.mjs` already uses `output: 'standalone'`; the existing `async headers()` block works for cache headers
   - What's unclear: Whether standalone output serves COEP/COOP headers from `next.config.mjs` correctly without additional Vercel/hosting config
   - Recommendation: Verify with `curl -I` on first preview deployment. The existing cache headers (`Cache-Control` for `/workers/:path*`) use the same mechanism, so this is likely fine.

3. **WebLLM 0.2.82 API surface for `initProgressCallback` phase text strings**
   - What we know: `report.progress` (0-1) and `report.text` (string) are documented; text is human-readable
   - What's unclear: Exact text strings for each phase (Downloading/Caching/Compiling) — may vary between model types and versions
   - Recommendation: Use regex matching on `report.text` (case-insensitive: `/download/i`, `/cache|load/i`, `/compil/i`) rather than exact string matching. Fallback to progress percentage alone if text matching fails.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `pnpm test --reporter=verbose --run` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | `isWebGPUSupported()` returns false when `navigator.gpu` is undefined | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |
| INFRA-01 | `useAIEngine` returns status `'unsupported'` when WebGPU unavailable | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |
| INFRA-01 | `WebGPUFallback` renders with NotebookLM link | unit | `pnpm test -- webgpu-fallback` | ❌ Wave 0 |
| INFRA-02 | `useAIEngine` exposes `downloadProgress` with `progress` and `text` fields during loading | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |
| INFRA-02 | Progress bar component renders 4 phase labels and updates phase indicator from `progress` prop | unit | `pnpm test -- ai-engine-progress` | ❌ Wave 0 |
| INFRA-03 | `next.config.mjs` headers array includes COEP `credentialless` and COOP `same-origin` | unit | `pnpm test -- next-config` | ❌ Wave 0 |
| INFRA-04 | `useAIEngine` does NOT create Worker on mount (lazy) | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |
| INFRA-04 | `useAIEngine` does NOT re-initialize engine when called from a second hook instance | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |
| INFRA-04 | `useAIEngine` starts status as `'idle'` and transitions to `'loading'` on first `getEngine()` | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |
| INFRA-05 | `usePyodideWorker` does not call Worker constructor on mount (existing test) | unit | `pnpm test -- use-pyodide-worker` | ✅ exists |
| INFRA-05 | `useAIEngine` does not call `CreateWebWorkerMLCEngine` on mount | unit | `pnpm test -- use-ai-engine` | ❌ Wave 0 |

**Manual validation only (not automatable in jsdom):**
- COEP/COOP headers present on deployed preview URL (`curl -I` check)
- `SharedArrayBuffer` available in production browser
- Model download progress bar visible during first load
- Pyodide code runner + AI chat do not crash tab on 8GB RAM device

### Sampling Rate
- **Per task commit:** `pnpm test -- use-ai-engine`
- **Per wave merge:** `pnpm test` (full 228+ test suite)
- **Phase gate:** Full suite green before marking Phase 13 complete

### Wave 0 Gaps

- [ ] `__tests__/hooks/use-ai-engine.test.ts` — covers INFRA-01, INFRA-02, INFRA-04, INFRA-05
- [ ] `__tests__/components/webgpu-fallback.test.tsx` — covers INFRA-01 fallback UI
- [ ] `__tests__/components/ai-engine-progress.test.tsx` — covers INFRA-02 progress bar
- [ ] `__tests__/lib/next-config-headers.test.ts` — covers INFRA-03 header values

Test pattern for `use-ai-engine.test.ts` follows `__tests__/hooks/use-pyodide-worker.test.ts` exactly:
- `vi.stubGlobal('Worker', MockWorkerClass)` to mock Worker constructor
- Mock `@mlc-ai/web-llm` module: `vi.mock('@mlc-ai/web-llm', () => ({ CreateWebWorkerMLCEngine: mockFn }))`
- `vi.resetModules()` in `beforeEach` to reset module-level `engineInstance` and `enginePromise` singleton state between tests

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `hooks/use-pyodide-worker.ts` (module-level singleton pattern, lazy Worker init, status transitions) — 2026-03-16
- Direct codebase inspection — `next.config.mjs` (existing `async headers()` structure, `output: 'standalone'`, `/workers/:path*` cache rule) — 2026-03-16
- Direct codebase inspection — `public/workers/pyodide.worker.mjs` (Worker file structure for `llm.worker.mjs` reference) — 2026-03-16
- Direct codebase inspection — `lib/course-registry.ts` (CourseConfig shape, extension point for `aiPersona` in Phase 14) — 2026-03-16
- Direct codebase inspection — `__tests__/hooks/use-pyodide-worker.test.ts` (testing pattern to mirror for `use-ai-engine.test.ts`) — 2026-03-16
- [WebLLM official docs — basic usage](https://webllm.mlc.ai/docs/user/basic_usage.html) — CreateWebWorkerMLCEngine API, initProgressCallback shape
- [WebLLM official docs — advanced usage (Web Workers)](https://webllm.mlc.ai/docs/user/advanced_usage.html) — WebWorkerMLCEngineHandler, Worker file setup
- [Making Your Website Cross-Origin Isolated — web.dev](https://web.dev/articles/coop-coep) — `credentialless` vs `require-corp` guidance, SharedArrayBuffer requirement
- [Vercel KB: Fix SharedArrayBuffer in Next.js](https://vercel.com/kb/guide/fix-shared-array-buffer-not-defined-nextjs-react) — `next.config.mjs` headers config for COEP/COOP
- `.planning/research/SUMMARY.md` — stack decisions, model selection (Phi-3.5-mini-instruct-q4f16_1-MLC), pitfall mapping — researched 2026-03-15
- `.planning/research/ARCHITECTURE.md` — singleton pattern code examples, component responsibilities, build order — researched 2026-03-15
- `.planning/research/PITFALLS.md` — all 10 critical pitfalls with prevention and recovery strategies — researched 2026-03-15

### Secondary (MEDIUM confidence)
- [mlc-ai/web-llm GitHub — model list](https://github.com/mlc-ai/web-llm) — model IDs, quantization sizes (Phi-3.5-mini ~2.2GB Q4F16)
- [Build a local AI chatbot with WebLLM — web.dev](https://web.dev/articles/ai-chatbot-webllm) — first-load UX patterns, progress bar approach

### Tertiary (LOW confidence — validate during implementation)
- `initProgressCallback` phase text strings (exact strings for Downloading/Caching/Compiling phases) — documented as human-readable but exact strings not confirmed in official docs; use regex matching

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@mlc-ai/web-llm@^0.2.82` verified from official docs and SUMMARY.md research; no competing options for WebGPU inference
- Architecture: HIGH — all patterns have direct codebase precedents; `usePyodideWorker` is a confirmed working implementation of the exact singleton pattern required
- Pitfalls: HIGH — all 5 pitfalls verified against official sources in PITFALLS.md (researched 2026-03-15); COEP/COOP behavior confirmed against web.dev and Vercel KB
- Test patterns: HIGH — existing `use-pyodide-worker.test.ts` provides exact template for `use-ai-engine.test.ts`; Vitest + jsdom infrastructure confirmed working (228 tests passing)

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (WebLLM 0.2.x API is stable; COEP/COOP behavior is a browser standard; singleton pattern is timeless)
