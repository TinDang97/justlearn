# Lesson 12: Slash Commands and Workflows

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Use the built-in Claude Code slash commands effectively
- Create custom slash commands for your project's recurring tasks
- Configure slash commands in CLAUDE.md to share across a team
- Build reusable workflow automation using Claude Code commands

---

## Prerequisites

- Lessons 9-11 of this section

---

## Part 1: Built-in Slash Commands

Claude Code provides several built-in slash commands. Type `/` in a session to see the full list. The most important ones:

**`/help`** — Displays all available commands and a brief description of each. Run this in any new session to see what is available.

**`/cost`** — Shows the current session's token consumption and estimated cost. Use this to monitor your spending during long sessions.

**`/compact`** — Summarizes the conversation history to reduce context consumption. Claude generates a summary of what has happened so far, and the detailed history is replaced with that summary.

**`/clear`** — Completely resets the conversation context. All history is discarded. Useful when starting an entirely new task.

**`/init`** — Initializes a CLAUDE.md file for the current project. Claude Code analyzes the project structure and generates a starter CLAUDE.md with detected conventions, dependencies, and suggested instructions.

**`/model`** — Displays or changes the current model. Use this to switch between Haiku, Sonnet, and Opus mid-session if a task requires a different capability level.

```
/model claude-haiku-4-5
# Switches to Haiku for the rest of this session
```

**`/pr_comments`** — Fetches the comments from a GitHub pull request and adds them to your context. Useful for working through PR review feedback.

---

## Part 2: Custom Slash Commands

Beyond the built-in commands, Claude Code supports custom slash commands defined in your CLAUDE.md file. These are essentially named prompts that you can invoke with `/command-name`.

Custom slash commands are defined in CLAUDE.md under a `commands:` section or in a `.claude/commands/` directory. Here is the CLAUDE.md approach:

```markdown
## Custom Commands

### /review
Review the staged git changes for correctness, potential issues, and style violations.
For each issue found, report: file, line number, severity (error/warning/info), and
a one-sentence description. End with a summary count by severity.

### /test-coverage
Check the test coverage for the files most recently modified (git diff HEAD~1 --name-only).
For each file without tests or with obviously missing coverage, suggest specific test cases
that should be added.

### /clean
Check for and report (without fixing): unused imports, commented-out code blocks > 3 lines,
TODO comments, and functions longer than 50 lines. Output as a checklist grouped by file.
```

Custom commands can be as simple or as complex as you need. They are particularly useful for:

- Code review checklists specific to your team's standards
- Project-specific quality checks (naming conventions, file structure rules)
- Recurring analysis tasks (coverage gaps, documentation gaps, dependency checks)
- Onboarding workflows (project orientation for new contributors)

---

## Part 3: The `.claude/commands/` Directory

For more complex custom commands, you can use the `.claude/commands/` directory approach. Each command is a separate markdown file:

```
.claude/
  commands/
    review.md
    deploy-check.md
    onboard.md
```

The file name (without `.md`) becomes the slash command name. The file content is the prompt that Claude executes when the command is invoked.

Example `.claude/commands/deploy-check.md`:

```markdown
Perform a pre-deployment checklist for this project:

1. **Tests:** Run the full test suite. Report any failures. If tests pass, note the count.
2. **Environment variables:** Check that all environment variables referenced in the code
   have corresponding entries in .env.example. Report any that are missing.
3. **Dependencies:** Check package.json / pyproject.toml for any packages marked as
   deprecated in the past 6 months (use your training knowledge). Report any found.
4. **TODO blockers:** Search for TODO comments that contain "before deploy", "FIXME", or
   "HACK". Report any found with file and line number.
5. **Config files:** Verify that no .env or secrets files are tracked by git (check .gitignore).

Output a final status: READY TO DEPLOY / NEEDS ATTENTION with a brief summary.
```

With this file in place, running `/deploy-check` in any Claude Code session in this project runs the entire checklist.

---

## Part 4: Workflow Automation Patterns

Beyond individual commands, you can build multi-step workflow patterns using Claude Code's capabilities:

**The review-fix-verify cycle:**

Create a command that automates the common development quality loop:

```markdown
## /quality-cycle
Run this workflow:
1. Run lint (ruff check . or eslint . as appropriate for this project)
2. Run type check (pyright or tsc --noEmit)
3. Run tests
4. Report the results: how many lint issues, type errors, test failures
5. If there are issues, ask me which category to fix first
```

**The new-feature scaffold:**

For projects with consistent structure, automate the scaffolding:

```markdown
## /new-feature
Create the standard scaffolding for a new feature. I will tell you the feature name.
Based on the name, create:
1. The feature module in src/features/{name}/
2. An __init__.py that exports the main class
3. A test file in tests/features/test_{name}.py with the standard test class skeleton
4. Update the features __init__.py to include the new module
Use the existing feature modules as templates for the correct structure and import patterns.
```

**The session-start orientation:**

```markdown
## /orient
I am starting a new session. Without reading every file, give me a quick orientation:
1. What are the most recently modified files (git log --oneline -10)?
2. Are there any failing tests currently?
3. Are there any uncommitted changes?
4. What TODO or FIXME comments exist in the most recently modified files?
This gives me a quick status snapshot to orient the session.
```

---

## Key Takeaways

- Built-in commands: `/help`, `/cost`, `/compact`, `/clear`, `/init`, `/model`, `/pr_comments`
- Custom slash commands are defined in CLAUDE.md or in `.claude/commands/` markdown files
- Custom commands encode recurring workflows specific to your project and team
- The `.claude/commands/` directory approach is better for complex, multi-step commands
- Workflow patterns like review-fix-verify cycles can be fully automated through custom commands

---

## Common Mistakes to Avoid

**Not using `/compact` before starting a new sub-task.** If you have just finished a long analysis phase, compact before implementing. Your context will last longer and responses will stay sharp.

**Writing custom commands that are too vague.** "Review the code" produces inconsistent results. "Check for these 5 specific things and report in this format" produces consistent, actionable output.

**Not sharing custom commands with the team.** Custom commands in `.claude/commands/` (committed to the repository) are available to everyone who works on the project. These are a team asset, not just personal shortcuts.

---

Next Lesson: In **Lesson 13: Working with Files**, we cover Claude Code's file operations in depth — reading, writing, editing, searching — and develop patterns for effective multi-file operations.

---

[Back to Section Overview](./README.md) | [Next Lesson: Working with Files →](./lesson-13-working-with-files.md)
