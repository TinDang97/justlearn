---
phase: quick-260317-vhc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/course-registry.ts
  - scripts/generate-rag-index.ts
  - courses/ai-code-agents/README.md
  - courses/ai-code-agents/01-introduction/README.md
  - courses/ai-code-agents/01-introduction/lesson-01-what-are-ai-code-agents.md
  - courses/ai-code-agents/01-introduction/lesson-02-the-ai-coding-landscape.md
  - courses/ai-code-agents/01-introduction/lesson-03-introduction-to-claude.md
  - courses/ai-code-agents/01-introduction/lesson-04-how-llms-write-code.md
  - courses/ai-code-agents/01-introduction/lesson-05-agent-vs-assistant.md
  - courses/ai-code-agents/01-introduction/lesson-06-the-tool-use-paradigm.md
  - courses/ai-code-agents/01-introduction/lesson-07-safety-and-responsible-use.md
  - courses/ai-code-agents/01-introduction/lesson-08-your-learning-path.md
  - courses/ai-code-agents/02-claude-code-cli/README.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-09-installing-claude-code.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-10-your-first-conversation.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-11-understanding-context-window.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-12-slash-commands-and-workflows.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-13-working-with-files.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-14-git-integration.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-15-project-instructions-claude-md.md
  - courses/ai-code-agents/02-claude-code-cli/lesson-16-effective-prompting-patterns.md
  - courses/ai-code-agents/03-agent-api-sdk/README.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-17-what-is-the-agent-api.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-18-authentication-and-setup.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-19-messages-api-fundamentals.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-20-tool-use-with-the-api.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-21-building-an-agent-loop.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-22-streaming-responses.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-23-error-handling-and-retries.md
  - courses/ai-code-agents/03-agent-api-sdk/lesson-24-multi-turn-conversations.md
  - courses/ai-code-agents/04-mcp-tool-use/README.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-25-what-is-mcp.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-26-mcp-architecture.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-27-built-in-tools.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-28-building-custom-mcp-servers.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-29-resources-and-prompts.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-30-testing-mcp-servers.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-31-mcp-in-production.md
  - courses/ai-code-agents/04-mcp-tool-use/lesson-32-composing-tools.md
  - courses/ai-code-agents/05-real-world-projects/README.md
  - courses/ai-code-agents/05-real-world-projects/lesson-33-project-code-review-agent.md
  - courses/ai-code-agents/05-real-world-projects/lesson-34-project-test-generation-agent.md
  - courses/ai-code-agents/05-real-world-projects/lesson-35-project-documentation-agent.md
  - courses/ai-code-agents/05-real-world-projects/lesson-36-project-refactoring-agent.md
  - courses/ai-code-agents/05-real-world-projects/lesson-37-project-multi-agent-pipeline.md
  - courses/ai-code-agents/05-real-world-projects/lesson-38-deployment-and-monitoring.md
  - courses/ai-code-agents/05-real-world-projects/lesson-39-course-review-and-next-steps.md
autonomous: false
requirements: [QUICK-260317-VHC]

must_haves:
  truths:
    - "Navigating to /courses/ai-code-agents shows the course overview page with sections and lesson list"
    - "Navigating to /courses/ai-code-agents/lesson-01-what-are-ai-code-agents renders the lesson content with sidebar, ToC, and navigation"
    - "The homepage course catalog displays the AI Code Agents course alongside Python and Data Engineering"
    - "Prev/next navigation works across section boundaries within the AI Code Agents course"
    - "The AI Code Agents course has an AI persona named 'Nova' configured in the course registry"
  artifacts:
    - path: "lib/course-registry.ts"
      provides: "AI Code Agents course registry entry with buildAIAgentsCourse function"
      contains: "ai-code-agents"
    - path: "courses/ai-code-agents/README.md"
      provides: "Course-level README with description and prerequisites"
      contains: "AI Code Agents"
    - path: "courses/ai-code-agents/01-introduction/README.md"
      provides: "Section 1 README with lesson list"
      contains: "Introduction"
    - path: "courses/ai-code-agents/01-introduction/lesson-01-what-are-ai-code-agents.md"
      provides: "First lesson content"
      contains: "Lesson 1"
    - path: "scripts/generate-rag-index.ts"
      provides: "Updated RAG script supporting ai-code-agents course slug"
      contains: "ai-code-agents"
  key_links:
    - from: "lib/course-registry.ts"
      to: "courses/ai-code-agents/"
      via: "buildAIAgentsCourse reads directory structure"
      pattern: "ai-code-agents"
    - from: "app/courses/[courseSlug]/page.tsx"
      to: "lib/course-registry.ts"
      via: "generateStaticParams iterates getAllRegisteredCourses"
      pattern: "getAllRegisteredCourses"
    - from: "scripts/generate-rag-index.ts"
      to: "courses/ai-code-agents/"
      via: "glob finds lesson-*.md files and extractCourseSlug maps to ai-code-agents"
      pattern: "ai-code-agents"
---

<objective>
Create a new "AI Code Agents with Claude" course covering Claude Code CLI, the Agent/Messages API, MCP (Model Context Protocol), and real-world agent projects. The course follows the existing multi-section directory pattern (like data-engineering) and is registered in the course registry so it appears in the catalog, sidebar, search, and RAG pipeline automatically.

Purpose: Expand JustLearn with a third course targeting developers who want to build AI-powered coding agents using Claude's ecosystem.

Output: A fully registered 39-lesson course across 5 sections, navigable at /courses/ai-code-agents/.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@lib/course-registry.ts
@lib/content.ts
@lib/section-map.ts
@scripts/generate-rag-index.ts
@courses/data-engineering/README.md
@courses/data-engineering/01-intro-data-engineering/README.md
@courses/data-engineering/01-intro-data-engineering/lesson-01-what-is-data-engineering.md

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From lib/course-registry.ts:
```typescript
export type AIPersona = {
  name: string
  modelId: string
  systemPrompt: string
}

export type CourseRegistryEntry = {
  slug: string
  title: string
  description: string
  color: string        // Tailwind bg class
  contentDir: string   // Relative to project root
  aiPersona: AIPersona
}

export type CourseConfig = CourseRegistryEntry & {
  buildCourse: () => UnifiedCourse
}

export const COURSE_REGISTRY: Record<string, CourseConfig>
```

From lib/content.ts:
```typescript
export type LessonMeta = {
  slug: string
  courseSlug: string
  sourceCourseSlug: string
  sectionSlug: string
  title: string
  lessonNumber: number
  duration: string
  level: string
  prev: string | null
  next: string | null
}

export type Section = {
  slug: string
  title: string
  order: number
  lessons: LessonMeta[]
}

export type UnifiedCourse = {
  slug: string
  title: string
  sections: Section[]
  allLessons: LessonMeta[]
}
```

Lesson markdown format (from data-engineering pattern):
```markdown
# Lesson N: Title

**Course:** AI Code Agents | **Duration:** XX minutes | **Level:** Intermediate

---

## Learning Objectives
...

## Part 1: ...
...
```

Section README format:
```markdown
# Course N: Section Title

**Level:** Intermediate
**Duration:** N lessons x XX-XX minutes = ~X hours total
**Prerequisites:** ...

---

## Course Overview
...

## Lesson List
| # | Title | Key Topics | Duration |
...
```

Course README format:
```markdown
# Course Title

**Level:** Intermediate
**Prerequisites:** ...

## Course Description
...
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Register course in course-registry.ts and update RAG script</name>
  <files>lib/course-registry.ts, scripts/generate-rag-index.ts</files>
  <action>
1. In `lib/course-registry.ts`, add a `buildAIAgentsCourse()` function following the exact pattern of `buildDECourse()`:
   - Read from `courses/ai-code-agents/` directory
   - Iterate section subdirectories (01-introduction, 02-claude-code-cli, 03-agent-api-sdk, 04-mcp-tool-use, 05-real-world-projects)
   - Parse lesson files matching `lesson-*.md` pattern
   - Build sections with README.md titles, compute prev/next globally across sections
   - Return UnifiedCourse with slug `'ai-code-agents'` and title `'AI Code Agents with Claude'`

2. Add the course to `COURSE_REGISTRY` with key `'ai-code-agents'`:
   ```
   slug: 'ai-code-agents'
   title: 'AI Code Agents with Claude'
   description: 'Build AI-powered coding agents using Claude Code CLI, Agent API, and MCP. 39 lessons, 5 sections.'
   color: 'bg-violet-500'
   contentDir: 'courses/ai-code-agents'
   buildCourse: buildAIAgentsCourse
   aiPersona: {
     name: 'Nova',
     modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
     systemPrompt: `You are Nova, an AI engineering mentor who specializes in building AI code agents. You explain concepts using practical examples from real developer workflows. Assume the student knows Python and basic API concepts. When discussing Claude APIs, be precise about request/response shapes and tool schemas. Scope: only answer questions covered in the provided lesson excerpts. If a question falls outside this scope, say so clearly.`
   }
   ```

3. In `scripts/generate-rag-index.ts`, update `extractCourseSlug()` to detect `ai-code-agents`:
   - Change from binary check to handle three courses:
     ```typescript
     export function extractCourseSlug(filePath: string): string {
       const normalized = filePath.replace(/\\/g, '/')
       if (normalized.includes('/data-engineering/')) return 'data-engineering'
       if (normalized.includes('/ai-code-agents/')) return 'ai-code-agents'
       return 'python'
     }
     ```

4. Update `extractSectionSlug()` to handle the new course:
   - Add an `ai-code-agents` branch matching `ai-code-agents/([^/]+)/lesson-` (same pattern as data-engineering)

5. Update `chunkByHeadings()` courseLabel mapping:
   - Add `'ai-code-agents'` case and refactor the ternary to a lookup object:
     ```typescript
     const courseLabels: Record<string, string> = {
       'python': 'Python Course',
       'data-engineering': 'Data Engineering',
       'ai-code-agents': 'AI Code Agents',
     }
     const courseLabel = courseLabels[courseSlug] ?? courseSlug
     ```
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && npx tsc --noEmit lib/course-registry.ts 2>&1 | head -20</automated>
  </verify>
  <done>
    - COURSE_REGISTRY has 'ai-code-agents' entry with slug, title, description, color, contentDir, buildCourse, aiPersona
    - buildAIAgentsCourse() follows buildDECourse() pattern exactly
    - extractCourseSlug() returns 'ai-code-agents' for paths containing '/ai-code-agents/'
    - extractSectionSlug() handles ai-code-agents paths
    - chunkByHeadings() labels ai-code-agents chunks correctly
    - TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Create course directory structure with all 5 sections and 39 lessons</name>
  <files>
    courses/ai-code-agents/README.md,
    courses/ai-code-agents/01-introduction/README.md,
    courses/ai-code-agents/01-introduction/lesson-01-what-are-ai-code-agents.md,
    courses/ai-code-agents/01-introduction/lesson-02-the-ai-coding-landscape.md,
    courses/ai-code-agents/01-introduction/lesson-03-introduction-to-claude.md,
    courses/ai-code-agents/01-introduction/lesson-04-how-llms-write-code.md,
    courses/ai-code-agents/01-introduction/lesson-05-agent-vs-assistant.md,
    courses/ai-code-agents/01-introduction/lesson-06-the-tool-use-paradigm.md,
    courses/ai-code-agents/01-introduction/lesson-07-safety-and-responsible-use.md,
    courses/ai-code-agents/01-introduction/lesson-08-your-learning-path.md,
    courses/ai-code-agents/02-claude-code-cli/README.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-09-installing-claude-code.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-10-your-first-conversation.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-11-understanding-context-window.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-12-slash-commands-and-workflows.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-13-working-with-files.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-14-git-integration.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-15-project-instructions-claude-md.md,
    courses/ai-code-agents/02-claude-code-cli/lesson-16-effective-prompting-patterns.md,
    courses/ai-code-agents/03-agent-api-sdk/README.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-17-what-is-the-agent-api.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-18-authentication-and-setup.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-19-messages-api-fundamentals.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-20-tool-use-with-the-api.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-21-building-an-agent-loop.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-22-streaming-responses.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-23-error-handling-and-retries.md,
    courses/ai-code-agents/03-agent-api-sdk/lesson-24-multi-turn-conversations.md,
    courses/ai-code-agents/04-mcp-tool-use/README.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-25-what-is-mcp.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-26-mcp-architecture.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-27-built-in-tools.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-28-building-custom-mcp-servers.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-29-resources-and-prompts.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-30-testing-mcp-servers.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-31-mcp-in-production.md,
    courses/ai-code-agents/04-mcp-tool-use/lesson-32-composing-tools.md,
    courses/ai-code-agents/05-real-world-projects/README.md,
    courses/ai-code-agents/05-real-world-projects/lesson-33-project-code-review-agent.md,
    courses/ai-code-agents/05-real-world-projects/lesson-34-project-test-generation-agent.md,
    courses/ai-code-agents/05-real-world-projects/lesson-35-project-documentation-agent.md,
    courses/ai-code-agents/05-real-world-projects/lesson-36-project-refactoring-agent.md,
    courses/ai-code-agents/05-real-world-projects/lesson-37-project-multi-agent-pipeline.md,
    courses/ai-code-agents/05-real-world-projects/lesson-38-deployment-and-monitoring.md,
    courses/ai-code-agents/05-real-world-projects/lesson-39-course-review-and-next-steps.md
  </files>
  <action>
Create the full directory structure and all content files following the exact patterns established by the data-engineering course. Every lesson file must follow the established format:

```markdown
# Lesson N: Title

**Course:** AI Code Agents | **Duration:** XX minutes | **Level:** Intermediate

---

## Learning Objectives
...

## Prerequisites
...

## Part 1: ...
(rich prose, 300-600 words per part, 3-5 parts per lesson)
```

**Course README** (`courses/ai-code-agents/README.md`):
- Title: "AI Code Agents with Claude"
- Level: Intermediate
- Prerequisites: Python fundamentals, basic API knowledge
- Description: Build AI-powered coding agents using Claude Code CLI, the Messages/Agent API, and Model Context Protocol (MCP). Learn to automate code review, testing, documentation, and refactoring with AI agents.

**Section 1: Introduction to AI Code Agents** (8 lessons, conceptual/prose-only):
- Lesson 01: What Are AI Code Agents? — Definition, history, how agents differ from chat, the agentic loop concept
- Lesson 02: The AI Coding Landscape — GitHub Copilot, Cursor, Claude Code, Codex, Devin; categories of AI coding tools
- Lesson 03: Introduction to Claude — Claude model family, capabilities, context windows, Anthropic's approach to safety
- Lesson 04: How LLMs Write Code — Tokenization, next-token prediction, why LLMs can code, limitations and hallucinations
- Lesson 05: Agent vs Assistant — Key differences between copilot-style autocomplete and autonomous agents, when to use each
- Lesson 06: The Tool Use Paradigm — Function calling, tool schemas, the observe-think-act loop, grounding LLM output in real actions
- Lesson 07: Safety and Responsible Use — Permission systems, sandboxing, human-in-the-loop, avoiding unsafe code generation
- Lesson 08: Your Learning Path — Course structure overview, prerequisites check, what you will build

**Section 2: Claude Code CLI** (8 lessons, practical/tutorial):
- Lesson 09: Installing Claude Code — System requirements, installation via npm, authentication, first run verification
- Lesson 10: Your First Conversation — Starting a session, asking questions, understanding responses, the conversation flow
- Lesson 11: Understanding the Context Window — What context is, how tokens work, why context matters, managing context budget
- Lesson 12: Slash Commands and Workflows — /init, /compact, /clear, /cost, custom slash commands, CLAUDE.md workflows
- Lesson 13: Working with Files — Reading files, writing files, editing files, glob patterns, multi-file operations
- Lesson 14: Git Integration — Committing, branching, PR creation, diff review, git workflows with Claude Code
- Lesson 15: Project Instructions (CLAUDE.md) — Writing effective project instructions, memory files, conventions, rules
- Lesson 16: Effective Prompting Patterns — Task decomposition, specificity, constraints, iterative refinement, common anti-patterns

**Section 3: Agent API and SDK** (8 lessons, code-heavy/conceptual):
- Lesson 17: What is the Agent API? — API vs CLI, when to use programmatic access, architecture overview
- Lesson 18: Authentication and Setup — API keys, Python/TypeScript SDK installation, environment configuration
- Lesson 19: Messages API Fundamentals — Request/response structure, roles (user/assistant), content blocks, model selection
- Lesson 20: Tool Use with the API — Defining tools as JSON Schema, tool_use and tool_result content blocks, the tool call cycle
- Lesson 21: Building an Agent Loop — The while-loop pattern: send message, check stop_reason, execute tools, feed results back
- Lesson 22: Streaming Responses — Server-sent events, streaming with the SDK, progressive UI updates, partial JSON handling
- Lesson 23: Error Handling and Retries — Rate limits, overloaded errors, exponential backoff, idempotency, circuit breakers
- Lesson 24: Multi-Turn Conversations — Conversation state management, message history, context pruning, system prompts

**Section 4: MCP and Tool Use** (8 lessons):
- Lesson 25: What is MCP? — Model Context Protocol overview, the problem it solves, comparison with raw function calling
- Lesson 26: MCP Architecture — Clients, servers, transports (stdio, HTTP SSE), the protocol lifecycle
- Lesson 27: Built-in Tools — Filesystem, bash, text editor tools in Claude Code, how they are implemented
- Lesson 28: Building Custom MCP Servers — TypeScript MCP SDK, creating a server, defining tools, handling requests
- Lesson 29: Resources and Prompts — MCP resources (read-only data), prompt templates, dynamic context injection
- Lesson 30: Testing MCP Servers — MCP Inspector, unit testing tool handlers, integration testing with mock clients
- Lesson 31: MCP in Production — Deployment patterns, security considerations, versioning, monitoring
- Lesson 32: Composing Tools — Multi-tool workflows, tool chaining, orchestrating complex operations with multiple MCP servers

**Section 5: Real-World Projects** (7 lessons):
- Lesson 33: Project: Code Review Agent — Build an agent that reviews PRs, checks style, finds bugs, suggests improvements
- Lesson 34: Project: Test Generation Agent — Build an agent that reads source code and generates comprehensive test suites
- Lesson 35: Project: Documentation Agent — Build an agent that generates and updates documentation from code
- Lesson 36: Project: Refactoring Agent — Build an agent that identifies code smells and performs safe refactoring
- Lesson 37: Project: Multi-Agent Pipeline — Orchestrate multiple agents (review + test + docs) in a CI/CD pipeline
- Lesson 38: Deployment and Monitoring — Running agents in production, cost tracking, observability, scaling
- Lesson 39: Course Review and Next Steps — Recap all concepts, advanced resources, community, continuing your AI agent journey

**Content quality requirements:**
- Each lesson: 400-800 lines of rich educational prose (matching data-engineering quality)
- Each lesson has 3-5 major Parts (## headings) with subsections (### headings)
- Use concrete examples: real API request/response JSON, real CLI commands, real code snippets
- Include "Common Mistakes" or "Gotchas" sections where appropriate
- Include a "Key Takeaways" or "Summary" section at the end of each lesson
- Use markdown code blocks with language identifiers (```python, ```typescript, ```bash, ```json)
- NO PracticeBlock components (this course is conceptual/tutorial, not in-browser executable like Python/DE courses)
- Each lesson ends with `---` followed by a brief "Next Lesson" preview teaser
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && ls courses/ai-code-agents/*/lesson-*.md | wc -l | tr -d ' ' && echo "expected: 39" && ls courses/ai-code-agents/*/README.md | wc -l | tr -d ' ' && echo "expected: 5" && test -f courses/ai-code-agents/README.md && echo "course README exists"</automated>
  </verify>
  <done>
    - 39 lesson markdown files exist across 5 section directories
    - 5 section README.md files exist (one per section)
    - 1 course-level README.md exists
    - Every lesson file follows the format: "# Lesson N: Title" + "**Course:** AI Code Agents | **Duration:** ... | **Level:** ..."
    - Each lesson has substantive prose content (not stubs or placeholders)
    - Lesson numbering is globally sequential (1-39) across all sections
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify AI Code Agents course renders correctly in the browser</name>
  <files>none</files>
  <action>
Human verifies the complete course renders correctly in the browser by following the steps below. No automated action needed — this is a visual/functional verification checkpoint.
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tind-repo/lessons/python-beginer && pnpm build 2>&1 | tail -5</automated>
  </verify>
  <done>
    - Homepage shows 3 courses including AI Code Agents with violet accent
    - Course overview at /courses/ai-code-agents shows 5 sections with 39 lessons
    - Individual lessons render with sidebar, breadcrumbs, ToC, and navigation
    - Prev/next navigation crosses section boundaries correctly
    - Content quality is substantive (not stubs)
  </done>
  <what-built>Complete AI Code Agents course (39 lessons, 5 sections) registered in JustLearn platform. The course appears in the homepage catalog and is navigable at /courses/ai-code-agents/.</what-built>
  <how-to-verify>
    1. Run `pnpm dev` and navigate to http://localhost:3000
    2. Verify the homepage shows 3 courses: Python, Data Engineering, and AI Code Agents with Claude (violet accent)
    3. Click into AI Code Agents course — verify course overview shows 5 sections with all 39 lessons listed
    4. Click Lesson 1 — verify it renders with sidebar, breadcrumbs, ToC, and full content
    5. Navigate to Lesson 8 (last in Section 1) and click Next — verify it crosses into Section 2 (Lesson 9)
    6. Navigate to Lesson 39 (last lesson) — verify no Next button, content renders fully
    7. Spot-check 2-3 lessons from different sections for content quality (not stubs)
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `pnpm build` completes without errors (validates all static params generate correctly)
- All 39 lessons render at `/courses/ai-code-agents/{lessonSlug}`
- Course overview page at `/courses/ai-code-agents` shows all 5 sections
- Homepage catalog shows 3 courses
- TypeScript type-checks pass: `npx tsc --noEmit`
</verification>

<success_criteria>
- AI Code Agents course is fully registered and navigable in JustLearn
- 39 lessons across 5 sections with substantive educational content
- RAG pipeline correctly identifies ai-code-agents lessons
- Course appears in homepage catalog with violet accent color
- Sidebar, breadcrumbs, prev/next navigation all work correctly
- No TypeScript or build errors introduced
</success_criteria>

<output>
After completion, create `.planning/quick/260317-vhc-new-course-of-ai-code-agent-with-claude-/260317-vhc-SUMMARY.md`
</output>
