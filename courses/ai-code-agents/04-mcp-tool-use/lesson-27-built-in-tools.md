# Lesson 27: Built-in Tools

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- List and describe Claude Code's built-in tool set
- Understand how each tool maps to MCP tool definitions
- Explain Claude Code's permission model for sensitive operations
- Use built-in tools effectively through targeted prompting

---

## Prerequisites

- Lessons 25-26 of this section

---

## Part 1: Claude Code's Tool Set

Claude Code ships with a comprehensive set of built-in tools that cover the core software development workflow. These tools are implemented as MCP tools internally, which means they follow the same patterns you will use when building custom MCP servers.

The built-in tools are organized into categories:

**File System Tools:**
- `Read` — Read the contents of a file
- `Write` — Write (create or overwrite) a file
- `Edit` — Make targeted string replacements in a file without rewriting it entirely
- `MultiEdit` — Apply multiple edits to a file in one operation
- `Glob` — Find files matching a glob pattern
- `LS` — List files and directories

**Code Search Tools:**
- `Grep` — Search file contents for a pattern (regex-capable)
- `Task` — Launch a subagent for complex search tasks

**Execution Tools:**
- `Bash` — Execute shell commands, run tests, invoke scripts

**Network Tools:**
- `WebFetch` — Fetch and process web content (documentation, APIs)
- `WebSearch` — Search the web for information

**Agent Management:**
- `TodoWrite` / `TodoRead` — Manage a persistent task list across the session

---

## Part 2: Read, Write, and Edit in Depth

The file system tools are the most-used built-in tools. Understanding their behavior helps you prompt for them effectively.

**Read** loads a file's complete contents into context. It accepts an optional `limit` and `offset` to read a range of lines:

```
Read src/auth.py lines 50-100
```

This is useful for large files where you only need a specific section. Reading partial files conserves context budget.

**Write** creates or replaces a file. It requires the complete new file content:

```
Create a new file at tests/test_validators.py with a comprehensive test suite for the email validation function.
```

Write is appropriate for creating new files. For editing existing files, prefer Edit to avoid accidentally removing content that was not shown to Claude.

**Edit** makes targeted replacements in an existing file. It replaces a specific string with a new string. This is safer than Write for modifications because it only changes what you specify:

```
In src/auth.py, replace the current email validation regex with one that handles international domain names.
```

Internally, Claude Code's Edit tool uses exact string matching — it finds the exact text to replace and substitutes the new text. This means:
1. The file must be read before editing (so Claude knows the exact current text)
2. The old string must be unique in the file (otherwise Edit fails)
3. Only the specified text changes; everything else remains intact

---

## Part 3: Bash — The Most Powerful Tool

The `Bash` tool executes shell commands. It is the most powerful built-in tool and the most important to understand in terms of safety.

**What Bash can do:**
- Run tests: `python -m pytest tests/`
- Lint code: `ruff check src/`
- Install packages: `uv pip install requests`
- Check git status: `git status`, `git log`
- Build the project: `make build`
- Query a local database: `sqlite3 dev.db "SELECT count(*) FROM users"`
- Anything a shell command can do

**The permission model:**

Claude Code has a tiered permission system for Bash operations. Some operations require explicit confirmation:

- **Safe by default:** Reading files, running tests, lint checks, git read operations
- **Requires confirmation:** Deleting files, force-pushing, installing packages, running database mutations
- **Always asks:** Operations that look destructive or irreversible

You can see this in action: ask Claude to delete a file, and it will describe what it intends to do and ask for confirmation before executing `rm`.

**Effective Bash prompting:**

The most effective Bash prompts are specific about what command to run:

```
Run the test suite for the auth module only: python -m pytest tests/test_auth.py -v
```

Less specific prompts like "run the tests" work but may use different flags than you expect. For consistent results, specify the exact command.

**Output handling:**

Bash output is captured and added to context. Very verbose output (e.g., a test suite with hundreds of tests and verbose output) consumes significant context. For long-running commands, consider asking Claude to pipe output through `head` or `tail`:

```
Run the full test suite but show only failures: python -m pytest tests/ --tb=short -q 2>&1 | grep -E "FAILED|ERROR|passed|failed"
```

---

## Part 4: Grep and Glob for Navigation

`Grep` and `Glob` are the navigation tools that let Claude Code work with large codebases without reading everything.

**Grep searches file contents:**

```
Find all places where validate_email is called (not just where it is defined). Include the file path and line number.
```

Grep supports regex patterns, case-insensitive search, and filtering by file type. Use it whenever you are looking for something specific rather than reading files broadly.

**Glob finds files by name pattern:**

```
Find all Python files in the src/ directory that start with "test_"
```

Glob is useful for:
- Discovering the structure of an unfamiliar codebase
- Finding all files of a specific type
- Identifying files matching a naming convention

The combination of Grep + Glob for navigation, then Read for specific files, is the most context-efficient way to work with large codebases.

---

## Key Takeaways

- Built-in tools: Read/Write/Edit/MultiEdit/Glob/LS (file system), Grep/Task (search), Bash (execution), WebFetch/WebSearch (network), TodoWrite/TodoRead (task tracking)
- Edit is preferred over Write for modifying existing files — it makes targeted changes without risking accidentally removing content
- Bash is the most powerful tool and has a tiered permission model: Claude confirms before destructive operations
- Grep + Glob for navigation, then Read for specific files = context-efficient large codebase handling

---

## Common Mistakes to Avoid

**Using Write to modify existing files.** Write replaces the entire file. If you did not read the complete file first (or if Claude generated incomplete content), you may lose parts of the file. Use Edit for modifications to existing files.

**Not filtering verbose Bash output.** Test suites, build logs, and linting tools can produce thousands of lines. Capture only what is relevant to keep context manageable.

**Asking to search without context about what to search for.** "Search the codebase" without a specific pattern is not actionable. Be specific: "Search for all SQL queries that use string concatenation (look for ' + ' adjacent to SQL keywords)."

---

Next Lesson: In **Lesson 28: Building Custom MCP Servers**, we build a complete custom MCP server using the TypeScript MCP SDK — from scaffold to deployed server with working tools.

---

[Back to Section Overview](./README.md) | [Next Lesson: Building Custom MCP Servers →](./lesson-28-building-custom-mcp-servers.md)
