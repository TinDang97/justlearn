---
phase: 13-webllm-foundation
plan: "01"
subsystem: infrastructure
tags: [coep, coop, headers, webgpu, fallback, shared-array-buffer]
dependency_graph:
  requires: []
  provides: [cross-origin-isolation, webgpu-fallback-component]
  affects: [next.config.mjs, components/webgpu-fallback.tsx]
tech_stack:
  added: []
  patterns: [tdd-red-green, next-config-headers, client-component]
key_files:
  created:
    - __tests__/lib/next-config-headers.test.ts
    - __tests__/components/webgpu-fallback.test.tsx
    - components/webgpu-fallback.tsx
  modified:
    - next.config.mjs
decisions:
  - "Use credentialless (not require-corp) for COEP to preserve NotebookLM deeplink compatibility"
  - "COEP/COOP rule placed at index 0 in headers() so no path-specific rule shadows it"
metrics:
  duration: "~4 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
  tests_added: 8
---

# Phase 13 Plan 01: COEP/COOP Headers + WebGPU Fallback Summary

**One-liner:** COEP credentialless + COOP same-origin headers in next.config.mjs enabling SharedArrayBuffer for WebGPU, plus WebGPUFallback component with NotebookLM fallback link.

## What Was Built

### Task 1: COEP/COOP headers in next.config.mjs

Modified `next.config.mjs` to prepend a global header rule to the `async headers()` function:

```javascript
{
  source: '/(.*)',
  headers: [
    { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ],
},
```

This rule is placed at index 0 so path-specific cache rules (`/:path*.json`, `/workers/:path*`, `/data/:path*`) never shadow it. `credentialless` is used instead of `require-corp` per the established decision to avoid breaking existing NotebookLM deeplinks.

Four tests in `__tests__/lib/next-config-headers.test.ts` validate:
1. A rule with `source: '/(.*)'` exists
2. COEP header value is `credentialless`
3. COOP header value is `same-origin`
4. The rule is at array index 0

### Task 2: WebGPUFallback component

Created `components/webgpu-fallback.tsx` — a `'use client'` component that renders a styled notice for browsers without WebGPU support:

- Heading: "In-browser AI not available"
- Body text with an inline anchor to `notebookLmUrl` (target=`_blank`, rel=`noopener noreferrer`)
- Tailwind classes: `rounded-lg border p-4 text-sm text-muted-foreground`
- Export: `WebGPUFallback({ notebookLmUrl: string })`

Four tests in `__tests__/components/webgpu-fallback.test.tsx` validate:
1. Heading text renders
2. Anchor href matches provided `notebookLmUrl`
3. Anchor has correct `target` and `rel` attributes
4. Anchor text contains "NotebookLM"

## Commits

| Task | Hash | Message |
|------|------|---------|
| Task 1 | a015f74 | feat(13-01): add COEP/COOP headers to next.config.mjs for SharedArrayBuffer support |
| Task 2 | 8654b1d | feat(13-01): add WebGPUFallback component with NotebookLM link |

## Test Results

- Task 1 tests: 4/4 pass
- Task 2 tests: 4/4 pass
- Full suite: 295/295 pass (35 test files)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files exist:
- [x] `components/webgpu-fallback.tsx`
- [x] `__tests__/lib/next-config-headers.test.ts`
- [x] `__tests__/components/webgpu-fallback.test.tsx`

Commits exist:
- [x] a015f74
- [x] 8654b1d
