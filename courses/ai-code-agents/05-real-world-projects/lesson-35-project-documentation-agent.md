# Lesson 35: Project — Documentation Agent

**Course:** AI Code Agents | **Duration:** 55 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Build an agent that generates and updates docstrings for Python functions
- Generate Mermaid architecture diagrams from code structure
- Update README files to reflect code changes
- Implement incremental documentation (only update what changed)

---

## Prerequisites

- Lessons 33-34 of this section

---

## Part 1: Documentation Agent Design

Documentation has a reputation as tedious. That makes it an excellent target for automation.

The documentation agent has three distinct tasks, each with different requirements:

**Docstring generation:** Read a function's signature, body, and usage context. Generate a Google-style or NumPy-style docstring that describes: what the function does, its parameters (types and meanings), return value, and exceptions raised. The hard part: inferring intent from code, not just describing what the code does.

**Architecture diagram generation:** Read the codebase structure (directory layout, import dependencies, class hierarchies). Generate a Mermaid diagram that visually represents the architecture at an appropriate level of abstraction. The hard part: choosing the right level of abstraction (not too detailed, not too abstract).

**README updating:** Read the existing README and the recent code changes. Update the README to reflect what changed: new functions, changed APIs, new dependencies, new usage examples. The hard part: maintaining the existing style and structure of the README while adding new content accurately.

---

## Part 2: The Documentation Agent Implementation

```python
#!/usr/bin/env python3
"""Documentation Agent — generates and updates documentation for Python projects."""

import anthropic
import subprocess
from pathlib import Path
import ast
import sys

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a technical writer and Python expert who writes clear, accurate documentation.

Documentation standards:
- Docstrings: Google style format
- All public functions must have docstrings
- Include types in Args and Returns sections
- Include Raises section only when functions explicitly raise exceptions
- Architecture diagrams: Mermaid flowchart or class diagram format
- README: maintain existing structure and style; add new sections at appropriate locations

Never invent capabilities that are not evident in the code.
If a function's purpose is unclear, describe what it does, not what it might intend.
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
        "name": "find_undocumented_functions",
        "description": "Find functions in a file that have no docstring.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string", "description": "Python file path"}},
            "required": ["path"]
        }
    },
    {
        "name": "get_import_graph",
        "description": "Analyze import dependencies between Python files in a directory.",
        "input_schema": {
            "type": "object",
            "properties": {
                "directory": {"type": "string", "description": "Directory to analyze"}
            },
            "required": ["directory"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "edit_file",
        "description": "Replace a specific string in a file with new content.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "old_text": {"type": "string", "description": "Exact text to replace"},
                "new_text": {"type": "string", "description": "Replacement text"}
            },
            "required": ["path", "old_text", "new_text"]
        }
    }
]

def find_undocumented(path: Path) -> list[dict]:
    """Parse a Python file and find functions/methods without docstrings."""
    source = path.read_text(encoding="utf-8")
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        return [{"error": str(e)}]

    undocumented = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if node.name.startswith("_"):
                continue  # Skip private
            has_docstring = (
                isinstance(node.body[0], ast.Expr)
                and isinstance(node.body[0].value, ast.Constant)
                and isinstance(node.body[0].value.value, str)
            )
            if not has_docstring:
                undocumented.append({
                    "name": node.name,
                    "line": node.lineno,
                    "args": [a.arg for a in node.args.args]
                })
    return undocumented

def get_import_graph(directory: Path) -> dict[str, list[str]]:
    """Build a module import graph for the given directory."""
    graph = {}
    for py_file in directory.rglob("*.py"):
        source = py_file.read_text(encoding="utf-8")
        try:
            tree = ast.parse(source)
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append(node.module)
            graph[str(py_file.relative_to(directory))] = imports
        except SyntaxError:
            continue
    return graph

def execute_tool(name: str, args: dict, project_root: Path) -> str:
    if name == "read_file":
        p = project_root / args["path"]
        return p.read_text(encoding="utf-8") if p.exists() else f"File not found: {args['path']}"

    elif name == "find_undocumented_functions":
        p = project_root / args["path"]
        if not p.exists():
            return f"File not found: {args['path']}"
        results = find_undocumented(p)
        if not results:
            return "All public functions have docstrings."
        return str(results)

    elif name == "get_import_graph":
        d = project_root / args["directory"]
        graph = get_import_graph(d)
        lines = [f"{module}: imports {', '.join(deps) or 'nothing'}"
                 for module, deps in graph.items()]
        return "\n".join(lines)

    elif name == "write_file":
        p = project_root / args["path"]
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(args["content"], encoding="utf-8")
        return f"Written: {p}"

    elif name == "edit_file":
        p = project_root / args["path"]
        content = p.read_text(encoding="utf-8")
        if args["old_text"] not in content:
            return f"Error: old_text not found in {args['path']}"
        new_content = content.replace(args["old_text"], args["new_text"], 1)
        p.write_text(new_content, encoding="utf-8")
        return f"Edited: {p}"

    return f"Unknown tool: {name}"


def document_module(source_path: str, project_root: str = ".") -> str:
    root = Path(project_root).resolve()
    task = f"""Add missing docstrings to {source_path}.

Steps:
1. Find all undocumented functions in {source_path}
2. Read the file to understand the full context of each function
3. For each undocumented function, add a Google-style docstring that describes:
   - What the function does (one-line summary)
   - Args: each parameter with its type and meaning
   - Returns: the return value type and meaning
   - Raises: any exceptions the function explicitly raises
4. Edit the file to add the docstrings (use edit_file, not write_file — preserve existing content)
5. Report: how many docstrings were added"""

    messages = [{"role": "user", "content": task}]

    for _ in range(20):
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
            return "Documentation complete."

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

    return "Error: agent did not complete"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python doc_agent.py <source.py> [project_root]")
        sys.exit(1)
    print(document_module(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "."))
```

---

## Part 3: Architecture Diagram Generation

For architecture diagram generation, extend the agent with a separate task:

```python
def generate_architecture_diagram(src_dir: str, output_path: str, project_root: str = ".") -> str:
    root = Path(project_root).resolve()
    task = f"""Generate a Mermaid architecture diagram for the project.

Steps:
1. Get the import graph for {src_dir}
2. Read the main module files to understand what each module does
3. Generate a Mermaid flowchart diagram that shows:
   - The main modules/layers as nodes
   - Import dependencies as edges
   - Group related modules with subgraphs if there are clear layers (api, services, repositories, models)
4. Write the Mermaid diagram to {output_path}

Format: Mermaid flowchart LR or TD (choose the one that looks better for this structure)
Keep it readable: do not show every file, show logical modules/layers"""

    messages = [{"role": "user", "content": task}]
    # ... same loop pattern as above
```

---

## Key Takeaways

- Documentation agent has three distinct tasks: docstring generation, architecture diagrams, README updates
- Use AST parsing (`find_undocumented_functions`) to reliably identify missing docstrings — more precise than regex
- Prefer `edit_file` over `write_file` for docstring insertion to avoid accidentally overwriting existing content
- Architecture diagrams are generated from import graph data + module descriptions — not from free-form description

---

Next Lesson: In **Lesson 36: Project — Refactoring Agent**, we build an agent that identifies code smells and performs targeted, safe refactoring using the test suite as a safety net.

---

[Back to Section Overview](./README.md) | [Next Lesson: Refactoring Agent →](./lesson-36-project-refactoring-agent.md)
