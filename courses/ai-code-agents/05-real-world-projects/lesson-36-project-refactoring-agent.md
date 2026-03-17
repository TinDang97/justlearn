# Lesson 36: Project — Refactoring Agent

**Course:** AI Code Agents | **Duration:** 55 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Build an agent that identifies and prioritizes code smells
- Implement a test-driven refactoring loop: identify → refactor → verify tests pass
- Apply scope constraints to prevent refactoring from expanding uncontrollably
- Distinguish between safe and risky refactoring operations

---

## Prerequisites

- Lessons 33-35 of this section

---

## Part 1: Safe vs Risky Refactoring

Not all refactoring is equal in terms of risk. A refactoring agent should be aggressive about safe refactoring and conservative about risky refactoring.

**Safe refactoring** (do automatically, verify with tests):
- Extract a repeated expression into a named variable
- Rename a local variable within a function
- Replace a magic number with a named constant
- Simplify a complex boolean expression (De Morgan's law, remove double negation)
- Extract a function from duplicated code within one module
- Replace `if x == True:` with `if x:`

**Risky refactoring** (propose and wait for confirmation):
- Changing a public function's signature
- Extracting code into a new module (changes import paths)
- Merging two similar classes
- Changing exception types raised by a function

The distinction: safe refactoring preserves the exact external behavior with mathematical certainty. Risky refactoring requires judgment about what behavior is truly equivalent and what the impact of the change is on callers.

---

## Part 2: Code Smell Detection

The agent first identifies code smells, then prioritizes them:

```python
#!/usr/bin/env python3
"""Refactoring Agent — identifies code smells and performs safe, test-backed refactoring."""

import anthropic
import subprocess
from pathlib import Path
import sys

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a Python refactoring expert who performs safe, incremental improvements.

Code smell priorities (in order):
1. CRITICAL: Functions > 50 lines, duplicate code blocks > 10 lines
2. HIGH: Magic numbers, repeated string literals, boolean blindness
3. MEDIUM: Complex conditionals (> 3 AND/OR), deeply nested code (> 3 levels)
4. LOW: Variable naming, redundant comments, missing type hints

Refactoring rules:
- NEVER change a function's public interface without explicit permission
- ALWAYS run tests after each refactoring
- If tests fail after refactoring, REVERT the change immediately
- Refactor one thing at a time — do not batch multiple refactorings into one edit
- After each successful refactoring, report what was changed and why
"""

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a source file.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    },
    {
        "name": "run_tests",
        "description": "Run the test suite to verify refactoring did not break anything.",
        "input_schema": {
            "type": "object",
            "properties": {"pattern": {"type": "string", "default": "tests/"}},
            "required": []
        }
    },
    {
        "name": "edit_file",
        "description": "Make a targeted string replacement in a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "old_text": {"type": "string", "description": "Exact text to replace"},
                "new_text": {"type": "string", "description": "Replacement text"}
            },
            "required": ["path", "old_text", "new_text"]
        }
    },
    {
        "name": "run_linter",
        "description": "Run ruff to check for style and complexity issues.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    },
    {
        "name": "revert_file",
        "description": "Revert a file to its last committed version (git checkout).",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    }
]

def execute_tool(name: str, args: dict, project_root: Path) -> str:
    if name == "read_file":
        p = project_root / args["path"]
        return p.read_text(encoding="utf-8") if p.exists() else f"Not found: {args['path']}"

    elif name == "run_tests":
        pattern = args.get("pattern", "tests/")
        result = subprocess.run(
            ["python", "-m", "pytest", pattern, "-q", "--tb=short"],
            capture_output=True, text=True, cwd=str(project_root)
        )
        return result.stdout + result.stderr

    elif name == "edit_file":
        p = project_root / args["path"]
        content = p.read_text(encoding="utf-8")
        if args["old_text"] not in content:
            return f"Error: text not found in {args['path']}"
        new_content = content.replace(args["old_text"], args["new_text"], 1)
        p.write_text(new_content, encoding="utf-8")
        return f"Applied edit to {args['path']}"

    elif name == "run_linter":
        p = project_root / args["path"]
        result = subprocess.run(
            ["ruff", "check", str(p), "--select", "C,PLR", "--output-format", "text"],
            capture_output=True, text=True
        )
        return result.stdout or "No complexity issues found."

    elif name == "revert_file":
        result = subprocess.run(
            ["git", "checkout", args["path"]],
            capture_output=True, text=True, cwd=str(project_root)
        )
        return f"Reverted {args['path']}" if result.returncode == 0 else f"Revert failed: {result.stderr}"

    return f"Unknown tool: {name}"


def refactor_file(source_path: str, project_root: str = ".") -> str:
    root = Path(project_root).resolve()
    task = f"""Refactor {source_path} to improve code quality.

Constraints:
- Only modify {source_path} — do not change other files
- Do not change any public function signatures
- After each change, run the tests and revert if they fail
- Focus on safe refactoring: extracting variables, simplifying expressions, removing duplication
- Stop after 5 successful refactorings (do not try to fix everything in one pass)

Workflow for each refactoring:
1. Read the file and identify the highest-priority code smell
2. Apply one targeted edit
3. Run tests
4. If tests fail: revert the change and try a different, safer approach
5. If tests pass: report what was changed
6. Move to the next highest-priority smell"""

    messages = [{"role": "user", "content": task}]

    for _ in range(40):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=8192,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Refactoring complete."

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

    return "Error: agent did not complete within iteration limit"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python refactor_agent.py <source.py> [project_root]")
        sys.exit(1)
    print(refactor_file(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "."))
```

---

## Part 3: The Refactor-Test-Revert Pattern

The key safety mechanism in the refactoring agent is the `revert_file` tool. After every edit, the agent runs the tests. If they fail, it immediately reverts the file:

```
1. Read source file — understand current state
2. Identify: "Function get_users() has 3 duplicated SQL patterns"
3. Edit: extract duplicated SQL into _build_user_query() helper
4. Run tests → FAIL (the helper function has wrong return type)
5. Revert file → back to original
6. Reconsider: try a less aggressive extraction
7. Edit: extract just the WHERE clause into a variable
8. Run tests → PASS
9. Report: "Extracted repeated WHERE clause into user_filter variable at line 45"
10. Move to next smell
```

This pattern means the agent can be aggressive about attempting refactoring — the worst case is the revert, not broken code.

---

## Part 4: Scope Constraints

Without scope constraints, a refactoring agent will try to fix everything it sees. Add constraints to keep sessions focused and reviewable:

- "Only modify the file I specify" — prevents cascade edits
- "Stop after N successful refactorings" — keeps the diff reviewable
- "Do not rename public functions" — preserves API compatibility
- "Do not add new dependencies" — prevents package sprawl

---

## Key Takeaways

- Safe refactoring (automatic): extract variables, simplify expressions, remove duplication within functions
- Risky refactoring (propose first): changing public interfaces, extracting modules, merging classes
- The refactor-test-revert loop makes the agent safe to run automatically — failed refactorings are automatically undone
- Scope constraints (one file, N changes maximum) keep the diff reviewable

---

Next Lesson: In **Lesson 37: Project — Multi-Agent Pipeline**, we orchestrate the code review, test generation, documentation, and refactoring agents into a CI/CD pipeline that runs automatically on pull requests.

---

[Back to Section Overview](./README.md) | [Next Lesson: Multi-Agent Pipeline →](./lesson-37-project-multi-agent-pipeline.md)
