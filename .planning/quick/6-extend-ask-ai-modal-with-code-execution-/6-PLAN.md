---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/chat-code-block.tsx
  - components/ai-message.tsx
  - components/run-in-ai-button.tsx
  - mdx-components.tsx
  - __tests__/components/chat-code-block.test.tsx
  - __tests__/components/run-in-ai-button.test.tsx
autonomous: true
requirements: [QUICK-6]

must_haves:
  truths:
    - "Python code blocks in AI chat responses have a Run button that executes the code via Pyodide"
    - "Code execution output (stdout, stderr, errors) displays inline below the code block in the chat"
    - "Lesson page code blocks (Python) show a 'Run in AI' button that opens the AI panel with the code and executes it"
  artifacts:
    - path: "components/chat-code-block.tsx"
      provides: "Runnable code block for AI chat messages"
      exports: ["ChatCodeBlock"]
    - path: "components/run-in-ai-button.tsx"
      provides: "Button to send lesson code to AI chat and run it"
      exports: ["RunInAIButton"]
    - path: "components/ai-message.tsx"
      provides: "Updated AI message renderer that uses ChatCodeBlock for Python code fences"
    - path: "mdx-components.tsx"
      provides: "Updated MDX pre component with Run in AI button for Python blocks"
  key_links:
    - from: "components/ai-message.tsx"
      to: "components/chat-code-block.tsx"
      via: "Streamdown custom code renderer or post-render code block replacement"
      pattern: "ChatCodeBlock"
    - from: "components/chat-code-block.tsx"
      to: "hooks/use-pyodide-worker.ts"
      via: "usePyodideWorker hook for code execution"
      pattern: "usePyodideWorker"
    - from: "components/run-in-ai-button.tsx"
      to: "lib/store/chat.ts"
      via: "openPanelWithQuestion to send code to AI chat"
      pattern: "openPanelWithQuestion|openPanel"
    - from: "mdx-components.tsx"
      to: "components/run-in-ai-button.tsx"
      via: "RunInAIButton rendered in code block header for Python"
      pattern: "RunInAIButton"
---

<objective>
Add code execution capabilities to the AI chat panel and lesson code blocks.

Purpose: Let students run Python code directly inside AI chat responses (same Pyodide worker as exercises), and add a "Run in AI" button on lesson code blocks that opens the AI panel, sends the code, and executes it there.

Output: ChatCodeBlock component, RunInAIButton component, updated AI message renderer, updated MDX code block header.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@components/ai-chat-panel.tsx
@components/ai-message.tsx
@components/exercise-runner.tsx (reference for Pyodide usage pattern)
@hooks/use-pyodide-worker.ts (shared Pyodide worker singleton)
@lib/store/chat.ts (chat store with openPanelWithQuestion, sendMessage)
@mdx-components.tsx (MDX code block rendering with CopyButton)
@components/copy-button.tsx (pattern reference for header bar buttons)

<interfaces>
From hooks/use-pyodide-worker.ts:
```typescript
export type RunStatus = 'idle' | 'loading' | 'installing' | 'ready' | 'running'
export type OutputLine = { type: 'stdout' | 'stderr' | 'html'; line: string }
export type RunResult = { output: OutputLine[]; error: string | null }
export function usePyodideWorker(): { run: (code: string) => Promise<RunResult>; status: RunStatus }
```

From lib/store/chat.ts:
```typescript
export interface ChatMessage { role: 'user' | 'assistant'; content: string; streaming: boolean; citations: RetrievedChunk[] }
openPanelWithQuestion: (question: string) => void
openPanel: () => void
sendMessage: (userText, getEngine, retrieveContext, persona) => Promise<void>
```

From mdx-components.tsx - current pre component:
```typescript
pre: ({ children, raw, ...props }: React.ComponentProps<'pre'> & { raw?: string }) => {
  // Extracts data-language from <code> child, renders header bar with language badge + CopyButton
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create ChatCodeBlock component with Pyodide execution</name>
  <files>components/chat-code-block.tsx, __tests__/components/chat-code-block.test.tsx, components/ai-message.tsx</files>
  <behavior>
    - ChatCodeBlock renders a code block with syntax highlighting and a "Run" button
    - Clicking Run executes the code via usePyodideWorker and displays output inline below the code
    - Output shows stdout lines, stderr lines (red), and errors (red) — same pattern as exercise-runner.tsx output panel
    - Run button is disabled while code is running (status === 'running')
    - Shows loading indicator when Pyodide is loading/installing
    - AI message component uses ChatCodeBlock for Python code fences in assistant messages instead of default Streamdown rendering
  </behavior>
  <action>
    1. Create `components/chat-code-block.tsx`:
       - Props: `{ code: string; language: string }` — language defaults to 'python'
       - Uses `usePyodideWorker()` hook for code execution (same singleton pattern as exercise-runner)
       - Layout: compact card with code display (use `<pre><code>` with `text-xs font-mono` — do NOT use CodeMirror, too heavy for chat), a small "Run" button (Play icon from lucide-react), and a collapsible output area below
       - The code area should have a header bar similar to the MDX code blocks: language badge on left, Run button on right
       - Output area: only visible after first run. Renders OutputLine[] with stdout in normal text, stderr/error in red — reuse the exact rendering pattern from exercise-runner.tsx lines 238-259
       - Button states: idle shows Play icon + "Run", running shows Loader2 spinner, loading shows "Loading Python..."
       - Keep the component compact — it lives inside a 420-480px wide chat panel

    2. Create `__tests__/components/chat-code-block.test.tsx`:
       - Mock `usePyodideWorker` to return controlled status and run function
       - Test: renders code content and Run button
       - Test: Run button calls `run(code)` with the code prop
       - Test: displays stdout output after run completes
       - Test: displays error in red after run fails
       - Test: Run button disabled when status is 'running'

    3. Update `components/ai-message.tsx`:
       - The assistant message currently renders via `<Streamdown>` which outputs standard HTML including `<pre><code>` blocks
       - After Streamdown renders (when `!message.streaming`), post-process the rendered HTML to replace Python code blocks with interactive ChatCodeBlock components
       - Implementation approach: Use a custom component that wraps Streamdown's output. After streaming completes (`!message.streaming`), parse the rendered content to find `<pre><code>` blocks. For Python code blocks (or unspecified language blocks since this is a Python learning app), render ChatCodeBlock instead.
       - Practical approach: Use `useRef` on the prose div. After streaming ends, use `querySelectorAll('pre code')` to find code blocks, extract their textContent, and use React portals or state-based replacement to swap them with ChatCodeBlock.
       - SIMPLER alternative (PREFER THIS): Instead of DOM manipulation, split the assistant message content on code fence regex (```python or ``` blocks). Render text segments with Streamdown and code segments with ChatCodeBlock. Only do this split when `!message.streaming` — during streaming, render normally with Streamdown so the streaming animation works.
       - Import ChatCodeBlock at the top of ai-message.tsx
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && npx vitest run __tests__/components/chat-code-block.test.tsx --reporter=verbose</automated>
  </verify>
  <done>
    - ChatCodeBlock component renders Python code with Run button and inline output
    - AI assistant messages show runnable code blocks for Python code fences (after streaming completes)
    - During streaming, messages render normally via Streamdown
    - Tests pass for ChatCodeBlock rendering, execution, and output display
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add "Run in AI" button on lesson MDX code blocks</name>
  <files>components/run-in-ai-button.tsx, __tests__/components/run-in-ai-button.test.tsx, mdx-components.tsx</files>
  <behavior>
    - Python code blocks in lesson content show a "Run in AI" button in the header bar (next to CopyButton)
    - Clicking the button opens the AI chat panel and sends a message containing the code with a request to explain and run it
    - Non-Python code blocks do not show the button
    - The button uses the chat store's openPanelWithQuestion to queue the message
  </behavior>
  <action>
    1. Create `components/run-in-ai-button.tsx`:
       - Props: `{ code: string }` — the raw code string from the code block
       - Client component ('use client')
       - Renders a small button with a Play icon (or BotMessageSquare icon) and "Run in AI" text
       - Style: match the CopyButton pattern — ghost variant, same size classes (`h-7 px-2`), opacity transition on group hover
       - On click: call `useChatStore.getState().openPanelWithQuestion(prompt)` where prompt is:
         ```
         Run this code and explain what it does:\n\`\`\`python\n${code}\n\`\`\`
         ```
       - Use `useChatStore` directly via `.getState()` (non-reactive) since we only need to fire an action, not subscribe to state. This avoids unnecessary re-renders of every code block on the page.

    2. Create `__tests__/components/run-in-ai-button.test.tsx`:
       - Mock `useChatStore` (zustand store)
       - Test: renders button with "Run in AI" accessible label
       - Test: clicking button calls openPanelWithQuestion with formatted prompt containing the code
       - Test: prompt includes the code wrapped in python code fence

    3. Update `mdx-components.tsx`:
       - Import `RunInAIButton` from `@/components/run-in-ai-button`
       - In the `pre` component's header bar div (the flex container with language badge and CopyButton):
         - After CopyButton, conditionally render `<RunInAIButton code={raw} />` when `language === 'python'` or `language === 'py'` AND `raw` is truthy
         - The header bar is already `flex items-center justify-between` — wrap CopyButton and RunInAIButton in a `<div className="flex items-center gap-1">` on the right side so both buttons fit
       - Keep the existing CopyButton behavior unchanged

    4. Run lint and type-check to verify no issues:
       ```
       pnpm lint && pnpm tsc --noEmit
       ```
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && npx vitest run __tests__/components/run-in-ai-button.test.tsx --reporter=verbose && pnpm lint && pnpm tsc --noEmit</automated>
  </verify>
  <done>
    - Python lesson code blocks show "Run in AI" button in header bar next to Copy button
    - Non-Python code blocks do not show the button
    - Clicking the button opens the AI chat panel with the code as a pending question
    - All tests pass, lint clean, type-check clean
  </done>
</task>

</tasks>

<verification>
1. `npx vitest run __tests__/components/chat-code-block.test.tsx __tests__/components/run-in-ai-button.test.tsx --reporter=verbose` — all tests pass
2. `pnpm lint` — no lint errors
3. `pnpm tsc --noEmit` — no type errors
4. `pnpm build` — builds successfully
</verification>

<success_criteria>
- AI chat assistant messages with Python code fences render as interactive runnable code blocks with Run button and inline output
- Lesson page Python code blocks have a "Run in AI" button that opens the chat panel with the code
- Pyodide worker is reused (same singleton) across exercise runner and chat code blocks
- All new components have unit tests
- Build, lint, and type-check pass
</success_criteria>

<output>
After completion, create `.planning/quick/6-extend-ask-ai-modal-with-code-execution-/6-SUMMARY.md`
</output>
