# Lesson 33: Project — Code Review Agent

**Course:** AI Code Agents | **Duration:** 55 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Design a code review agent with clear output specifications
- Implement multi-file context gathering for comprehensive review
- Structure agent output for human consumption and downstream processing
- Handle the edge cases unique to code review workflows

---

## Prerequisites

- Sections 1-4 complete
- Python 3.9+; Anthropic SDK installed

---

## Part 1: What Makes a Good Code Review Agent

A code review agent is more nuanced than it first appears. The naive implementation — "read the file, ask Claude to find bugs" — works poorly in practice because:

**Context matters.** Claude finding a "missing null check" in a function is only meaningful if it knows whether null inputs are expected. The agent needs context: what does the project's error handling convention look like? What does the calling code look like?

**Specificity matters.** "This could be improved" is useless feedback. "Line 47: the `email.split('@')` operation will raise `IndexError` if the string has no '@' character. Replace with `email.partition('@')` which returns a tuple and never raises." is actionable.

**Coverage matters.** A review that misses the critical security issue while correctly noting the suboptimal variable name is worse than no review. Prioritize high-severity findings.

**Structure matters.** Reviewers need to quickly scan a review. Structure matters for usability: group by severity, use consistent format, provide line references.

The design principles for our code review agent:
1. Read the file under review
2. Read the test file for that module (if it exists) — tests reveal intent
3. Run the linter to catch style issues automatically
4. Ask Claude to focus on correctness, security, and missing error handling
5. Output a structured markdown review, grouped by severity

---

## Part 2: The Code Review Agent Implementation

```python
#!/usr/bin/env python3
"""Code Review Agent — reviews Python source files and outputs a structured review."""

import anthropic
import subprocess
from pathlib import Path
import sys
import json

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a senior Python engineer performing thorough code review.

Your review format must be:
# Code Review: {filename}

## Critical Issues
Issues that will cause bugs, security vulnerabilities, or data loss. MUST be fixed.
Format: **Line N:** [issue description] — [specific fix]

## Warnings
Code that may cause bugs in edge cases, missing error handling, performance problems.
Format: **Line N:** [issue description] — [suggestion]

## Style / Minor
PEP 8 violations, naming issues, unnecessary complexity, missing docstrings.
Format: **Line N:** [issue description]

## Summary
One paragraph: overall code quality assessment.

## Verdict
One of: APPROVE | NEEDS CHANGES | MAJOR ISSUES

Rules:
- Be specific: always include line numbers
- Be actionable: every issue must have a concrete fix suggestion
- Do NOT report issues that are pre-existing in the codebase unless they are security-critical
- If a section has no issues, write "None"
"""

TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a source file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path relative to project root"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "run_linter",
        "description": "Run ruff linter on a file and return violations with line numbers.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to lint"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "find_test_file",
        "description": "Find the test file for a given source file (if it exists). Returns the path or 'not found'.",
        "input_schema": {
            "type": "object",
            "properties": {
                "source_path": {"type": "string", "description": "Source file path"}
            },
            "required": ["source_path"]
        }
    },
    {
        "name": "write_review",
        "description": "Write the completed review to an output file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "output_path": {"type": "string", "description": "Output file path"},
                "content": {"type": "string", "description": "Review content in markdown"}
            },
            "required": ["output_path", "content"]
        }
    }
]

def execute_tool(name: str, args: dict, project_root: Path) -> str:
    if name == "read_file":
        p = project_root / args["path"]
        if not p.exists():
            return f"File not found: {args['path']}"
        return p.read_text(encoding="utf-8")

    elif name == "run_linter":
        p = project_root / args["path"]
        result = subprocess.run(
            ["ruff", "check", str(p), "--output-format", "text"],
            capture_output=True, text=True
        )
        return result.stdout or "No lint issues found."

    elif name == "find_test_file":
        source = Path(args["source_path"])
        stem = source.stem
        candidates = [
            project_root / "tests" / f"test_{stem}.py",
            project_root / "tests" / source.parent / f"test_{stem}.py",
            project_root / source.parent / f"test_{stem}.py",
        ]
        for candidate in candidates:
            if candidate.exists():
                return str(candidate.relative_to(project_root))
        return "not found"

    elif name == "write_review":
        p = project_root / args["output_path"]
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(args["content"], encoding="utf-8")
        return f"Review written to {p}"

    return f"Unknown tool: {name}"


def review_file(source_path: str, output_path: str, project_root: str = ".") -> str:
    root = Path(project_root).resolve()
    task = f"""Please perform a thorough code review of {source_path}.

Workflow:
1. Read the source file: {source_path}
2. Find and read the test file (if it exists) to understand expected behavior
3. Run the linter on the source file
4. Identify all issues: correctness problems, security issues, missing error handling, style violations
5. Write a comprehensive structured review to {output_path}

Focus especially on:
- Functions that don't validate their inputs
- Exception handling that swallows errors silently
- SQL queries or shell commands built with string concatenation
- Functions with unclear error returns (returning None vs raising exceptions inconsistently)
"""

    messages = [{"role": "user", "content": task}]

    for _ in range(25):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Review complete."

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input, root)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })
        messages.append({"role": "user", "content": tool_results})

    return "Error: agent did not complete review within iteration limit"


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python review_agent.py <source_file.py> <output_review.md> [project_root]")
        sys.exit(1)

    source = sys.argv[1]
    output = sys.argv[2]
    root = sys.argv[3] if len(sys.argv) > 3 else "."

    print(f"Reviewing {source}...")
    result = review_file(source, output, root)
    print(f"Done. Review written to {output}")
    print(result)
```

---

## Part 3: Running and Testing the Agent

```bash
# Install dependencies
uv pip install anthropic ruff

# Review a file
python review_agent.py src/auth.py reviews/auth-review.md

# Review multiple files (shell loop)
for f in src/*.py; do
    stem=$(basename $f .py)
    python review_agent.py "$f" "reviews/${stem}-review.md" && echo "Done: $f"
done
```

---

## Part 4: Edge Cases and Improvements

**Handling very long files:** Files over 500 lines can consume too much context. For these, pass the file in chunks — review a section at a time, then ask Claude to synthesize a final review.

**Diff-only review:** For CI review, you often want to review only the changed lines, not the entire file. Add a `get_diff` tool that calls `git diff HEAD~1 -- {file}` and have the agent focus review on the diff.

**Severity calibration:** Out of the box, Claude may over-report minor style issues relative to serious bugs. Add explicit guidance in the system prompt: "If in doubt between Warnings and Critical, prefer Warnings. Reserve Critical for issues that will definitely cause runtime errors or security vulnerabilities."

---

## Key Takeaways

- Good code review agents need: contextual reading (source + tests), automated linting, focused AI analysis on high-value issues, structured output with line numbers
- The system prompt shapes output format — be explicit about the exact structure you want
- Tool selection matters: `find_test_file` and `run_linter` provide grounding that pure LLM analysis lacks
- Edge cases to handle: very long files, diff-only review for CI, severity calibration

---

Next Lesson: In **Lesson 34: Project — Test Generation Agent**, we build an agent that reads source code and generates a comprehensive test suite — handling interface discovery, edge cases, and test framework conventions.

---

[Back to Section Overview](./README.md) | [Next Lesson: Test Generation Agent →](./lesson-34-project-test-generation-agent.md)
