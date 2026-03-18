---
phase: quick-260317-vhc
plan: 01
subsystem: course
tags: [ai-agents, claude, mcp, typescript, python, course-content]

requires:
  - phase: quick-7
    provides: WebLLM AI chat panel with Nova persona support via COURSE_REGISTRY

provides:
  - AI Code Agents with Claude course registered in COURSE_REGISTRY with Nova persona
  - 39 lesson markdown files across 5 sections in courses/ai-code-agents/
  - RAG pipeline support for ai-code-agents course slug
  - Third course in JustLearn catalog (alongside Python and Data Engineering)

affects:
  - RAG pipeline (generate-rag-index.ts now indexes ai-code-agents lessons)
  - Course catalog (homepage now shows 3 courses)
  - AI chat panel (Nova persona active for ai-code-agents course sessions)

tech-stack:
  added: []
  patterns:
    - "buildAIAgentsCourse() follows buildDECourse() pattern exactly — iterate section dirs, parse lesson files, compute global prev/next"
    - "RAG extractCourseSlug() uses normalized path matching, not ternary — supports N courses cleanly"
    - "Course content: lesson-NN-slug.md format with Course/Duration/Level metadata line"

key-files:
  created:
    - courses/ai-code-agents/README.md
    - courses/ai-code-agents/01-introduction/README.md (+ 8 lessons)
    - courses/ai-code-agents/02-claude-code-cli/README.md (+ 8 lessons)
    - courses/ai-code-agents/03-agent-api-sdk/README.md (+ 8 lessons)
    - courses/ai-code-agents/04-mcp-tool-use/README.md (+ 8 lessons)
    - courses/ai-code-agents/05-real-world-projects/README.md (+ 7 lessons)
  modified:
    - lib/course-registry.ts
    - scripts/generate-rag-index.ts

key-decisions:
  - "Nova persona for AI Code Agents course — AI engineering mentor tone, precise about API request/response shapes"
  - "bg-violet-500 color for AI Code Agents (distinct from blue/Python and emerald/data-engineering)"
  - "No PracticeBlock components — course is conceptual/tutorial, not in-browser executable like Python/DE"
  - "extractCourseSlug() refactored from ternary to if-chain to support 3+ courses cleanly"
  - "chunkByHeadings() courseLabel refactored from ternary to lookup object (courseLabels Record)"

requirements-completed: [QUICK-260317-VHC]

duration: 55min
completed: 2026-03-17
---

# Quick Task 260317-vhc: AI Code Agents with Claude Course

**39-lesson course across 5 sections registered in JustLearn with Nova AI persona, violet accent, and full RAG pipeline support**

## Performance

- **Duration:** ~55 min
- **Started:** 2026-03-17T15:30:00Z
- **Completed:** 2026-03-17T16:25:00Z
- **Tasks:** 3/3 complete (Task 3 human-verify checkpoint: APPROVED)
- **Files modified:** 47 files

## Accomplishments

- Registered `ai-code-agents` course in `COURSE_REGISTRY` with `buildAIAgentsCourse()` function, Nova AI persona, and `bg-violet-500` color
- Created 39 lesson files across 5 section directories (Introduction, Claude Code CLI, Agent API/SDK, MCP, Real-World Projects)
- Updated `generate-rag-index.ts` to support ai-code-agents as a third course slug alongside python and data-engineering
- `pnpm build` completes successfully — all static params generate for 39 new lesson routes

## Task Commits

1. **Task 1: Register course in course-registry.ts and update RAG script** - `017b0fc` (feat)
2. **Task 2: Create course directory structure with all 5 sections and 39 lessons** - `6447a6a` (feat)
3. **Task 3: Verify AI Code Agents course renders correctly in the browser** - APPROVED (human-verify checkpoint)

## Files Created/Modified

- `lib/course-registry.ts` - Added `buildAIAgentsCourse()` and `'ai-code-agents'` COURSE_REGISTRY entry with Nova persona
- `scripts/generate-rag-index.ts` - Updated `extractCourseSlug()`, `extractSectionSlug()`, and `chunkByHeadings()` for ai-code-agents
- `courses/ai-code-agents/README.md` - Course overview and section index
- `courses/ai-code-agents/01-introduction/` - 8 lessons covering agentic loop, AI landscape, Claude, LLM mechanics, agent vs assistant, tool use, safety, learning path
- `courses/ai-code-agents/02-claude-code-cli/` - 8 lessons covering installation, conversation flow, context window, slash commands, file/git operations, CLAUDE.md, prompting patterns
- `courses/ai-code-agents/03-agent-api-sdk/` - 8 lessons covering API architecture, authentication, Messages API, tool use, agent loop, streaming, error handling, multi-turn
- `courses/ai-code-agents/04-mcp-tool-use/` - 8 lessons covering MCP protocol, architecture, built-in tools, custom servers, resources/prompts, testing, production, composition
- `courses/ai-code-agents/05-real-world-projects/` - 7 lessons covering code review agent, test generation agent, documentation agent, refactoring agent, multi-agent pipeline, deployment/monitoring, course capstone

## Decisions Made

- Nova persona: "AI engineering mentor, precise about request/response shapes" — distinct tone from Alex (beginner Python) and Sam (data engineering)
- `bg-violet-500` color: visually distinct from `bg-blue-500` (Python) and `bg-emerald-500` (data engineering)
- No PracticeBlock components in any lesson: AI agents course is conceptual/tutorial, not in-browser executable
- RAG refactoring: replaced ternary patterns with lookup objects and if-chains to support future course additions cleanly

## Deviations from Plan

None — plan executed exactly as written. All 39 lessons created with substantive educational prose content. Build verified successful.

## Issues Encountered

None. The `buildDECourse()` pattern was straightforward to replicate. TypeScript type-check shows only pre-existing test file errors unrelated to the modified files.

## Next Phase Readiness

- Course available at `/courses/ai-code-agents/` after `pnpm dev` or `pnpm build`
- RAG index regeneration needed (`pnpm generate:rag`) to include new lessons in AI chat search
- Browser verification passed: homepage shows 3 courses, course overview shows 5 sections/39 lessons, individual lessons render with sidebar/ToC/navigation, prev/next crosses section boundaries correctly

---
*Quick Task: 260317-vhc*
*Completed: 2026-03-17*
