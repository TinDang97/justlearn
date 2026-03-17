# Lesson 32: Composing Tools

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Design multi-tool workflows where tool outputs feed into tool inputs
- Configure agents to work with multiple MCP servers simultaneously
- Implement orchestration patterns for complex multi-step operations
- Identify when to compose tools in the AI agent versus in a dedicated tool

---

## Prerequisites

- Lessons 25-31 of this section (all of Section 4)

---

## Part 1: Tool Composition Patterns

Individual tools are building blocks. Complex workflows emerge from composing them. There are three composition patterns:

**Pattern 1 — Sequential composition.** The output of one tool is used as input to the next. The AI model drives the sequence: it calls Tool A, uses the result to decide how to call Tool B, uses that result for Tool C.

Example: Code quality pipeline
1. `run_linter` → get list of violations
2. For each violation: `read_file` → understand context → `edit_file` → apply fix
3. `run_tests` → verify fixes did not break anything
4. `write_report` → summarize what was fixed

The AI model is the orchestrator. It understands the output of each step and decides what to do next. This works well when the composition logic requires reasoning (interpreting linter output, understanding what to fix).

**Pattern 2 — Tool-in-tool composition.** A higher-level tool internally calls other tools to achieve its goal. The AI model calls the high-level tool; the implementation composes lower-level tools internally.

Example: A `full_quality_check` tool that internally:
1. Runs linting via `execSync`
2. Runs type checking via `execSync`
3. Runs tests via `execSync`
4. Combines all results into a structured report

The AI model calls one tool; the tool handles the composition. This works well when the composition logic is always the same and does not require AI reasoning (a fixed pipeline).

**Pattern 3 — Parallel composition.** Multiple independent tools are called simultaneously. The AI can request multiple tool calls in one turn.

Example: Analyzing multiple files simultaneously — the model generates tool_use blocks for `read_file(src/auth.py)` and `read_file(src/users.py)` in the same response. Both reads happen before the model continues reasoning.

---

## Part 2: Multi-Server Composition

When working with multiple MCP servers, all tools from all servers appear in the unified tool list. The AI model can call any tool from any server in any order.

A Claude Code session might connect to:
- Built-in tools (file system, bash, git)
- Your project-specific server (run tests, check coverage)
- A database server (run read-only SQL queries)
- A GitHub server (read PR comments, check CI status)

A complex workflow naturally uses tools from all four servers:

```
Task: "Review the failing CI build for PR #42 and suggest fixes"

1. [GitHub server] get_pr_details(42) → PR description, changed files
2. [GitHub server] get_ci_failures(42) → list of failing test names
3. [Built-in] read_file for each failing test
4. [Built-in] read_file for the source files the tests cover
5. [Project server] run_tests(specific failing tests) → local reproduction
6. [Database server] query_schema() → check if schema changes caused test failures
7. [Built-in] edit_file to fix issues
8. [Project server] run_tests() → verify local fix
9. [Built-in] bash("git diff") → review changes
```

This workflow would be tedious to build without composable tools. With properly configured MCP servers, the AI orchestrates it naturally.

---

## Part 3: Designing Composable Tools

Tools that compose well share these properties:

**Clear input/output contracts.** A tool that returns structured, parseable output composes better than one that returns unstructured prose. Return structured data when possible:

Instead of:
```
"The tests passed: 12 tests ran in 0.5 seconds"
```

Return:
```json
{"status": "passed", "count": 12, "duration_seconds": 0.5, "failures": []}
```

The AI can reason about structured data more reliably than prose.

**Idempotent reads.** Read tools should be idempotent — calling them multiple times returns the same result. This makes them safe to call speculatively without side effects.

**Atomic writes.** Write tools should either fully succeed or fully fail, without leaving state in an inconsistent intermediate state. Wrap multi-step writes in transactions where possible.

**Granular enough to be reusable.** A `fix_all_lint_errors` tool is not composable — you cannot call it on just one file. A `fix_lint_errors_in_file(path)` tool is composable — you can call it on any file, multiple times.

---

## Part 4: Orchestration in the Agent vs in the Tool

A recurring design decision: should complex multi-step logic live in the AI agent (as natural language instructions that drive tool calls) or in a dedicated tool (as code that executes the steps programmatically)?

**Put logic in the agent when:**
- The steps require reasoning or interpretation (e.g., "fix the lint errors" — which ones to fix and how requires judgment)
- The workflow may branch based on results (e.g., "if tests fail, investigate; if they pass, commit")
- You want visibility into each step (the agent narrates what it is doing)
- The workflow is not repeated often enough to justify coding it

**Put logic in a dedicated tool when:**
- The steps are always the same (a fixed pipeline)
- Speed matters (eliminating round-trips to the model for each step)
- The steps do not require AI reasoning (just execute commands and collect output)
- The workflow is run frequently and you want consistent behavior

In practice: start with the agent driving the workflow. When you notice the same sequence of tool calls being executed repeatedly in exactly the same way, extract that sequence into a higher-level tool.

---

## Part 5: Example — A Multi-Tool CI/CD Check

A practical example of a composable multi-tool workflow using a dedicated orchestration tool:

```typescript
// A high-level tool that orchestrates the CI/CD pre-merge checklist
{
  name: "pre_merge_check",
  description: "Run the complete pre-merge checklist: lint + type-check + tests + coverage. Returns a summary report.",
  inputSchema: {
    type: "object",
    properties: {
      branch: {
        type: "string",
        description: "Branch name to check (defaults to current branch)"
      }
    },
    required: []
  }
}

// Implementation
async function preMergeCheck(args: { branch?: string }, projectRoot: string): Promise<ToolResult> {
  const results: Record<string, string> = {};

  // 1. Lint
  try {
    results.lint = execSync(`cd ${projectRoot} && ruff check src/`, { timeout: 30_000 }).toString();
    results.lint = "PASS: " + (results.lint || "No issues");
  } catch (e: any) {
    results.lint = "FAIL: " + (e.stdout?.toString() || e.message);
  }

  // 2. Type check
  try {
    execSync(`cd ${projectRoot} && pyright src/`, { timeout: 60_000 });
    results.types = "PASS";
  } catch (e: any) {
    results.types = "FAIL: " + (e.stdout?.toString() || e.message);
  }

  // 3. Tests
  try {
    const testOut = execSync(
      `cd ${projectRoot} && python -m pytest tests/ -q --tb=short 2>&1`,
      { timeout: 120_000 }
    ).toString();
    results.tests = testOut.includes("passed") ? "PASS: " + testOut.split("\n").pop() : "FAIL: " + testOut;
  } catch (e: any) {
    results.tests = "FAIL: " + (e.stdout?.toString() || "test run error");
  }

  const report = Object.entries(results)
    .map(([check, result]) => `${check.padEnd(10)}: ${result}`)
    .join("\n");

  const allPassed = Object.values(results).every((r) => r.startsWith("PASS"));
  const summary = allPassed ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED";

  return {
    content: [{ type: "text", text: `${summary}\n\n${report}` }],
  };
}
```

---

## Key Takeaways

- Three composition patterns: sequential (AI drives the sequence), tool-in-tool (implementation composes internally), parallel (multiple tool calls in one turn)
- Multi-server composition: all tools from all connected servers appear in one unified tool list
- Tools compose well when they have clear input/output contracts, are idempotent for reads, atomic for writes, and granular enough to be reusable
- Logic in agent: when reasoning or branching is needed; logic in tool: when the sequence is always the same

---

## Section 4 Complete

You have covered MCP end to end: the protocol, the architecture, built-in tools, building custom servers, resources and prompts, testing, production deployment, and tool composition. Section 5 puts it all together in five real-world projects.

---

## Common Mistakes to Avoid

**Building tools that are too coarse-grained.** A `fix_everything` tool is hard to use correctly and impossible to compose. Build tools that do one thing well.

**Not returning structured output.** Tool results that return prose are harder for the model to reason about than structured data. Return JSON for data, prose only for human-readable summaries.

---

Next Section: In **Section 5: Real-World Projects**, we apply everything from Sections 2-4 to build five complete, production-quality projects — starting with a code review agent.

---

[Back to Section Overview](./README.md) | [Next Section: Real-World Projects →](../05-real-world-projects/README.md)
