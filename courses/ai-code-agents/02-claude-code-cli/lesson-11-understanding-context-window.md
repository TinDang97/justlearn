# Lesson 11: Understanding the Context Window

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain what the context window is and how tokens relate to text
- Estimate how much content fits in Claude's context window
- Use `/cost` and context indicators to monitor context consumption
- Apply strategies for managing large codebases within context constraints

---

## Prerequisites

- Lessons 9-10 of this section

---

## Part 1: What Is the Context Window?

The context window is the maximum amount of text a model can process in a single inference call. Everything the model "knows" during a session must fit within this window: the system prompt, the full conversation history, the content of every file it has read, the output of every command it has run, and the tool definitions themselves.

Claude supports a context window of up to 200,000 tokens. To put this in perspective:

- 1 token ≈ 4 characters of English prose
- 200,000 tokens ≈ 150,000 words ≈ 500 pages of text
- A typical 500-line Python file ≈ 3,000-5,000 tokens
- A 100-line TypeScript file with types ≈ 1,500-2,500 tokens
- A detailed conversation turn (question + full response) ≈ 500-2,000 tokens

For context on what 200K tokens can hold simultaneously:
- 50-100 medium-sized source files
- Hundreds of conversation turns
- Entire small-to-medium codebases (< 50 KLOC)

For very large codebases (> 50 KLOC), you cannot fit the entire codebase in context — you need to be strategic about what you load.

---

## Part 2: What Consumes Context in a Claude Code Session

Context consumption in a Claude Code session comes from multiple sources:

**The system prompt.** Claude Code uses a detailed system prompt that describes the tools, the expected behavior, and the safety constraints. This is typically several thousand tokens and is present from the start of every session.

**Tool definitions.** Every tool that Claude Code can use is described with a JSON Schema definition. With 10-15 tools, this adds several thousand tokens.

**Conversation history.** Every message you send, every response Claude generates, and every tool call result is added to the context. Long sessions with many tool calls accumulate context quickly.

**File contents.** Every time Claude reads a file, the file contents are added to the context as a tool result. Reading a 1,000-line file adds roughly 7,000-10,000 tokens to the context.

**Command output.** Running tests, linting, or other commands adds the output to the context. Verbose test output from a large test suite can be significant.

The consumption is cumulative and irreversible within a session. Once something is added to the context, it stays there (unless you use `/compact`).

---

## Part 3: Monitoring Context Consumption

Claude Code provides built-in tools for monitoring context consumption:

**The `/cost` command:**

```
/cost
```

This shows the current session's token consumption and estimated cost. It shows:
- Input tokens consumed so far
- Output tokens generated so far
- Total estimated cost based on the current model's pricing

Run `/cost` periodically during long sessions to track where you are relative to the limit.

**Context usage indicator:** Claude Code displays a token usage indicator in the session. When you approach the limit (typically at 90%+ of the context window), Claude Code will warn you and suggest using `/compact`.

**Estimating file sizes before reading:**

If you are about to read a large file, you can estimate the token cost first:

```
How large (in lines) is the file src/large_module.py?
```

A 500-line file costs roughly 3,000-5,000 tokens. A 2,000-line file costs 15,000-20,000 tokens. Factor this into your decisions about what to read.

---

## Part 4: Strategies for Large Codebases

When working with a codebase that is too large to load entirely into context, use these strategies:

**Target-specific file reading.** Instead of reading all files, read only the files relevant to the current task. Use search to find what you need rather than reading broadly.

```
Search for all places where user authentication is performed — specifically where the JWT token is validated. I do not need you to read every file, just find the relevant ones.
```

**Progressive context loading.** Start with high-level files (README, main entry points) to orient, then drill into specific modules as needed. Do not read everything upfront.

**Session scoping.** Scope each session to a specific part of the codebase. A session working on authentication does not need to read the billing module. Start a new session when shifting to a different area.

**Use `/compact` strategically:**

The `/compact` command asks Claude to summarize the conversation history, replacing the full history with a compressed summary. This reclaims significant context space while preserving the key information.

```
/compact
```

Use `/compact` when:
- You have completed one sub-task and are starting another
- The context is > 70% full and you have more work to do
- The early conversation history is no longer directly relevant

Be aware that `/compact` loses detail. If you need to revisit an early decision or specific output, do it before compacting.

**Use `/clear` for a fresh start:**

```
/clear
```

This completely resets the conversation history. Unlike `/compact`, it does not try to preserve a summary — it is a complete reset. Use this when you are done with one task and starting something entirely new.

---

## Part 5: Practical Context Budget Management

Here is a practical approach to managing context in a real work session:

**Budget your reads.** Before a task, identify the 3-5 files that are most relevant. Read those first. Only read additional files if the task requires it.

**Prefer search over read for orientation.** Use grep-style search to find where a function is defined, what files import a specific module, or where a specific pattern appears. Search results are much smaller than reading entire files.

**Do not re-read files unnecessarily.** If you read a file in this session and nothing has changed, you do not need to read it again. The content is already in context.

**Compact before long second-phase work.** If the first phase of your task is complete (e.g., you have analyzed the codebase and decided on an approach), compact before starting the implementation phase.

**Recognize degradation.** As the context fills, model response quality can degrade — responses become less specific, the model loses track of earlier constraints, or it repeats itself. If you notice this, it is time to compact or start fresh.

---

## Key Takeaways

- The context window (200K tokens for Claude) holds everything the model can reason about: system prompt, conversation history, file reads, command output
- Typical consumption: 3,000-5,000 tokens per 500-line file; 500-2,000 tokens per conversation turn
- Monitor with `/cost` and the context usage indicator
- For large codebases: target-specific reads, search before reading broadly, scope sessions to specific areas
- `/compact` summarizes history to reclaim context; `/clear` resets completely

---

## Common Mistakes to Avoid

**Reading entire large files when only part is needed.** For a 3,000-line module, you may only need the 50 lines defining the class interface. Use search first to find the relevant section, then read a targeted range.

**Not compacting before a long second phase.** Running `/compact` after finishing analysis and before starting implementation saves you from hitting the context limit in the middle of the most important work.

**Ignoring context warnings.** When Claude Code warns that the context is almost full, act immediately. Trying to squeeze in one more file read often ends the session with an error rather than a graceful completion.

---

Next Lesson: In **Lesson 12: Slash Commands and Workflows**, we explore the full set of slash commands available in Claude Code and learn how to build custom slash commands that encode recurring workflows for your specific project.

---

[Back to Section Overview](./README.md) | [Next Lesson: Slash Commands and Workflows →](./lesson-12-slash-commands-and-workflows.md)
