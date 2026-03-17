# Lesson 34: Project — Test Generation Agent

**Course:** AI Code Agents | **Duration:** 60 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Build an agent that discovers a module's public interface and generates appropriate tests
- Use the run-tests feedback loop to verify generated tests actually pass
- Generate tests that cover happy paths, edge cases, and error conditions
- Integrate the test generation agent into a development workflow

---

## Prerequisites

- Lesson 33: Code Review Agent
- Project with existing Python source code and pytest set up

---

## Part 1: What Makes Test Generation Hard

Test generation sounds easy — "read the code, write tests." The hard parts:

**Interface discovery.** To generate useful tests, the agent needs to know: what are the function signatures? What types do they accept? What do they return? What errors can they raise? Simply reading the source file gives partial answers; the tests also need to know how the function is actually used.

**Framework conventions.** Each project uses pytest differently — some use `unittest.TestCase` subclasses, some use pure pytest functions, some use fixtures heavily, some use pytest-asyncio. Generated tests that do not match the project's conventions will require significant cleanup.

**Edge case coverage.** The obvious tests (valid input → expected output) are easy. The valuable tests (empty list, None input, duplicate values, Unicode edge cases, concurrent access) require understanding of what can go wrong.

**Making generated tests actually run.** Generated code that is syntactically correct but fails to import or has incorrect test setup is worse than no tests — it adds noise and creates a false sense of coverage.

Our agent addresses these with a tight feedback loop: generate tests → run them → fix failures → run again.

---

## Part 2: The Test Generation Agent

```python
#!/usr/bin/env python3
"""Test Generation Agent — generates a pytest test suite for a Python module."""

import anthropic
import subprocess
from pathlib import Path
import sys

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are an expert Python engineer specializing in test engineering.

When generating tests:
1. First, understand the full interface: all public functions, their signatures, return types, and documented exceptions
2. For each public function, generate tests covering:
   - Happy path: valid inputs, expected outputs
   - Boundary conditions: empty string, empty list, zero, negative numbers where applicable
   - Error conditions: invalid types, out-of-range values, documented exceptions
3. Use the project's existing test patterns as a template
4. Generate tests that are:
   - Specific: test one thing per test function
   - Named clearly: test_{function}_returns_{expected}_when_{condition}
   - Independent: no test depends on another test's side effects
5. Always run the generated tests to verify they pass before writing the final test file
"""

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a source or test file.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    },
    {
        "name": "find_existing_tests",
        "description": "Find existing test files in the project as pattern examples.",
        "input_schema": {
            "type": "object",
            "properties": {
                "count": {
                    "type": "integer",
                    "description": "Number of example test files to return",
                    "default": 2
                }
            },
            "required": []
        }
    },
    {
        "name": "run_tests",
        "description": "Run tests and return the output. Use to verify generated tests pass.",
        "input_schema": {
            "type": "object",
            "properties": {
                "test_path": {"type": "string", "description": "Path to test file or directory"}
            },
            "required": ["test_path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file (create or overwrite).",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["path", "content"]
        }
    }
]

def execute_tool(name: str, args: dict, project_root: Path) -> str:
    if name == "read_file":
        p = project_root / args["path"]
        return p.read_text(encoding="utf-8") if p.exists() else f"File not found: {args['path']}"

    elif name == "find_existing_tests":
        count = args.get("count", 2)
        test_files = list((project_root / "tests").glob("**/test_*.py"))[:count]
        results = []
        for tf in test_files:
            content = tf.read_text(encoding="utf-8")
            results.append(f"=== {tf.relative_to(project_root)} ===\n{content}")
        return "\n\n".join(results) if results else "No existing test files found."

    elif name == "run_tests":
        test_path = project_root / args["test_path"]
        result = subprocess.run(
            ["python", "-m", "pytest", str(test_path), "-v", "--tb=short"],
            capture_output=True, text=True, cwd=str(project_root)
        )
        return result.stdout + result.stderr

    elif name == "write_file":
        p = project_root / args["path"]
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(args["content"], encoding="utf-8")
        return f"Written: {p}"

    return f"Unknown tool: {name}"


def generate_tests(source_path: str, output_path: str, project_root: str = ".") -> str:
    root = Path(project_root).resolve()
    source_file = Path(source_path)
    module_name = source_file.stem

    task = f"""Generate a comprehensive pytest test suite for {source_path}.

Workflow:
1. Read the source file: {source_path}
2. Read 2 existing test files to understand project conventions
3. Analyze the public interface: all public functions, their signatures, return types, exceptions
4. Write a draft test file to {output_path}
5. Run the test file: `{output_path}`
6. Fix any failing tests (import errors, wrong assertions, etc.)
7. Run again to confirm all tests pass
8. Report: how many tests generated, what coverage areas were included

Test the following for each public function in {module_name}:
- At least one happy path test
- Boundary conditions (empty input, None where applicable, zero/negative numbers)
- Error conditions (invalid types, documented exceptions)
"""

    messages = [{"role": "user", "content": task}]

    for _ in range(30):
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
            return "Test generation complete."

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
    if len(sys.argv) < 3:
        print("Usage: python test_gen_agent.py <source.py> <output_tests.py> [project_root]")
        sys.exit(1)
    print(generate_tests(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "."))
```

---

## Part 3: The Feedback Loop in Action

The key differentiator of this agent is the run-test-fix loop. When the agent writes the initial tests and runs them:

**Common failures:**
- Import errors (wrong module path, missing imports)
- Wrong assertion types (asserting on string repr vs object)
- Missing fixtures or conftest.py configuration
- Incorrect exception classes

The agent reads the error output, understands what failed, and fixes the test file. This loop typically runs 2-3 times before all tests pass. The resulting test suite is verified-working, not just syntactically plausible.

---

## Part 4: Measuring Coverage Impact

After generating tests, measure the coverage delta:

```bash
# Before: run coverage on existing tests
python -m pytest tests/ --cov=src --cov-report=term-missing > coverage-before.txt

# Generate new tests for target module
python test_gen_agent.py src/validators.py tests/test_validators.py

# After: run coverage again
python -m pytest tests/ --cov=src --cov-report=term-missing > coverage-after.txt

# Compare
diff coverage-before.txt coverage-after.txt
```

A well-functioning test generation agent should increase coverage of the target module from the existing baseline to 80-95%.

---

## Key Takeaways

- Test generation requires: interface discovery, convention matching, edge case enumeration, and a run-fix feedback loop
- The run-test-fix loop produces verified-working tests, not just syntactically plausible ones
- `find_existing_tests` lets the agent match your project's conventions automatically
- Typical output: 80-95% coverage of the target module, 2-3 fix iterations before all tests pass

---

Next Lesson: In **Lesson 35: Project — Documentation Agent**, we build an agent that reads code and generates or updates documentation — docstrings, README sections, and architecture diagrams.

---

[Back to Section Overview](./README.md) | [Next Lesson: Documentation Agent →](./lesson-35-project-documentation-agent.md)
