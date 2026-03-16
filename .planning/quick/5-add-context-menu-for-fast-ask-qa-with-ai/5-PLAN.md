---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/store/chat.ts
  - components/text-selection-ask-ai.tsx
  - app/courses/[courseSlug]/[lessonSlug]/page.tsx
  - __tests__/components/text-selection-ask-ai.test.tsx
autonomous: true
requirements: [QUICK-5]

must_haves:
  truths:
    - "User selects text in the lesson article and sees a floating 'Ask AI' button"
    - "Clicking 'Ask AI' opens the chat panel with the selected text as a question"
    - "The floating button disappears when selection is cleared"
    - "The question is automatically sent to the AI (not just pre-filled)"
  artifacts:
    - path: "components/text-selection-ask-ai.tsx"
      provides: "Floating selection toolbar component"
      min_lines: 40
    - path: "lib/store/chat.ts"
      provides: "openPanelWithQuestion action + pendingQuestion state"
      contains: "openPanelWithQuestion"
    - path: "__tests__/components/text-selection-ask-ai.test.tsx"
      provides: "Unit tests for selection toolbar"
      min_lines: 30
  key_links:
    - from: "components/text-selection-ask-ai.tsx"
      to: "lib/store/chat.ts"
      via: "useChatStore openPanelWithQuestion"
      pattern: "openPanelWithQuestion"
    - from: "components/ai-chat-panel.tsx"
      to: "lib/store/chat.ts"
      via: "pendingQuestion consumed and auto-sent"
      pattern: "pendingQuestion"
---

<objective>
Add a floating "Ask AI" button that appears when users select text within the lesson article.
Clicking it opens the AI chat panel and automatically sends the selected text as a question
(prefixed with "Explain this: ..."), enabling fast Q&A without manually typing.

Purpose: Reduce friction for students to ask about specific lesson content they don't understand.
Output: TextSelectionAskAI component, updated chat store, updated lesson page, tests.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@components/ai-chat-panel.tsx
@components/ai-chat-panel-wrapper.tsx
@lib/store/chat.ts
@app/courses/[courseSlug]/[lessonSlug]/page.tsx

<interfaces>
From lib/store/chat.ts:
```typescript
type ChatState = {
  messages: ChatMessage[]
  isOpen: boolean
  lessonContext: LessonContext | null
  openPanel: () => void
  closePanel: () => void
  sendMessage: (
    userText: string,
    getEngine: () => Promise<unknown>,
    retrieveContext: (query: string, k?: number) => Promise<RetrievedChunk[]>,
    persona: AIPersona,
  ) => Promise<void>
}
```

From components/ai-chat-panel-wrapper.tsx:
```typescript
interface AIChatPanelWrapperProps {
  courseSlug: string
  lessonTitle: string
  sectionTitle: string
  persona: AIPersona
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add pendingQuestion to chat store + create TextSelectionAskAI component</name>
  <files>lib/store/chat.ts, components/text-selection-ask-ai.tsx, __tests__/components/text-selection-ask-ai.test.tsx</files>
  <behavior>
    - Test 1: openPanelWithQuestion sets isOpen=true and pendingQuestion to the given string
    - Test 2: consumePendingQuestion returns the pending question and clears it
    - Test 3: TextSelectionAskAI renders nothing when no text is selected (no floating button visible)
    - Test 4: TextSelectionAskAI calls openPanelWithQuestion with "Explain this: {selected text}" on button click
  </behavior>
  <action>
    1. In `lib/store/chat.ts`:
       - Add `pendingQuestion: string | null` to ChatState (initial: null)
       - Add `openPanelWithQuestion: (question: string) => void` that sets `isOpen: true` and `pendingQuestion: question`
       - Add `consumePendingQuestion: () => string | null` that reads pendingQuestion, sets it to null, and returns the value

    2. Create `components/text-selection-ask-ai.tsx` ('use client'):
       - Accepts prop `containerRef: React.RefObject<HTMLElement | null>` — the element to watch for selections
       - Uses `mouseup` and `selectionchange` events on the container to detect text selection
       - When selection is non-empty (trimmed length > 0) and within the containerRef element:
         - Show a floating button positioned near the selection using `getRangeAt(0).getBoundingClientRect()`
         - Button text: "Ask AI" with a Sparkles icon (from lucide-react)
         - Style: small pill button (`rounded-full px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-lg`) positioned absolutely via a portal or fixed positioning
       - On click: call `useChatStore.getState().openPanelWithQuestion("Explain this: " + selectedText)`
       - On `mousedown` on the button itself, call `e.preventDefault()` to prevent the selection from being cleared before the click handler fires
       - On click outside or selection cleared: hide the button
       - Cleanup all listeners on unmount

    3. Write tests in `__tests__/components/text-selection-ask-ai.test.tsx`:
       - Test the store actions (openPanelWithQuestion, consumePendingQuestion) directly via `useChatStore.getState()`
       - Test the component renders/hides based on selection state
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && pnpm vitest --run __tests__/components/text-selection-ask-ai.test.tsx</automated>
  </verify>
  <done>
    - Chat store has openPanelWithQuestion and consumePendingQuestion actions
    - TextSelectionAskAI component shows floating button on text selection within container
    - All tests pass
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire TextSelectionAskAI into lesson page + auto-send pending question in chat panel</name>
  <files>app/courses/[courseSlug]/[lessonSlug]/page.tsx, components/ai-chat-panel-wrapper.tsx, components/ai-chat-panel.tsx</files>
  <action>
    1. In `app/courses/[courseSlug]/[lessonSlug]/page.tsx`:
       - The `<article>` element needs a ref. Since this is a Server Component, wrap the article in a thin Client Component OR move the TextSelectionAskAI into AIChatPanelWrapper.
       - Best approach: Add TextSelectionAskAI inside a new small client wrapper around the article. Create a `components/lesson-article.tsx` ('use client') that:
         - Accepts `children: React.ReactNode`
         - Creates a `useRef<HTMLElement>(null)` for the article element
         - Renders `<article ref={articleRef} className="prose prose-neutral dark:prose-invert max-w-none">{children}</article>`
         - Renders `<TextSelectionAskAI containerRef={articleRef} />`
       - In page.tsx, replace the `<article>` tag with `<LessonArticle><LessonContent /></LessonArticle>`
       - Add `components/lesson-article.tsx` to files_modified

    2. In `components/ai-chat-panel.tsx`:
       - In the `AIChatPanel` component, add a `useEffect` that watches for `pendingQuestion`:
         ```
         const pendingQuestion = useChatStore((s) => s.pendingQuestion)
         const consumePendingQuestion = useChatStore((s) => s.consumePendingQuestion)
         ```
       - When `isOpen && pendingQuestion && status === 'ready'`: consume the pending question and call `handleSendMessage(question)`
       - This ensures the question is only sent when the engine is ready (if engine needs loading, the question waits)

    3. In `components/ai-chat-panel-wrapper.tsx`: no changes needed (the wrapper already renders AIChatPanel which handles pendingQuestion).
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && pnpm vitest --run && pnpm next lint</automated>
  </verify>
  <done>
    - Selecting text in lesson article shows floating "Ask AI" button
    - Clicking the button opens AI panel and auto-sends the question when engine is ready
    - All existing tests pass, lint passes
    - No type errors (type-check passes)
  </done>
</task>

</tasks>

<verification>
1. `pnpm vitest --run` — all tests pass including new text-selection-ask-ai tests
2. `pnpm next lint` — no lint errors
3. Manual: Open a lesson page, select text in the article, see floating "Ask AI" button, click it, chat panel opens and question is sent
</verification>

<success_criteria>
- Floating "Ask AI" button appears on text selection within lesson article content
- Button disappears when selection is cleared
- Clicking sends "Explain this: {selected text}" to the AI chat panel
- Question auto-sends when engine is ready (handles both cached and first-time download states)
- All tests pass, lint clean, type-check clean
</success_criteria>

<output>
After completion, create `.planning/quick/5-add-context-menu-for-fast-ask-qa-with-ai/5-SUMMARY.md`
</output>
