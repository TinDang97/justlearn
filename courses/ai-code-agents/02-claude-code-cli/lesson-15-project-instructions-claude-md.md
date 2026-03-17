# Lesson 15: Project Instructions (CLAUDE.md)

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain what CLAUDE.md is and how Claude Code uses it
- Write effective project-level instructions that improve every session
- Structure CLAUDE.md to cover the most impactful information categories
- Use the `/init` command to generate a starter CLAUDE.md and refine it

---

## Prerequisites

- Lessons 9-14 of this section

---

## Part 1: What CLAUDE.md Is

CLAUDE.md is a project-level configuration file that Claude Code reads at the start of every session. It is your opportunity to tell Claude Code everything it needs to know about your specific project: the tech stack, the conventions, the constraints, the preferred tools, and the recurring workflows.

Without CLAUDE.md, every session starts cold — Claude has to rediscover your conventions, your testing approach, your git commit message format, and your deployment procedure by reading files and asking questions. With a good CLAUDE.md, every session starts warm — Claude already knows these things and can apply them immediately.

CLAUDE.md is not just documentation. It is executable context. When you write "Use pytest for all tests, never unittest," Claude applies that rule throughout the session. When you write "Never use string concatenation for SQL queries — always use parameterized queries," Claude enforces that whenever it writes database code.

CLAUDE.md files can exist at multiple levels:
- `~/.claude/CLAUDE.md` — global instructions that apply to every project
- `CLAUDE.md` (in the project root) — project-level instructions
- Subdirectory CLAUDE.md files — instructions specific to that subdirectory

Claude Code reads all applicable CLAUDE.md files and layers them.

---

## Part 2: Generating a Starter CLAUDE.md with `/init`

The `/init` command is the fastest way to create a starting CLAUDE.md:

```
/init
```

Claude Code analyzes your project structure:
- Reads README, package.json, pyproject.toml, setup.cfg, or equivalent
- Detects the test framework (pytest, Jest, vitest, etc.)
- Identifies the linting and formatting tools
- Notes the directory structure and key modules
- Identifies git configuration and common workflows

It generates a CLAUDE.md that captures these detected facts. This starter is useful, but it is just a foundation. The most important content in CLAUDE.md comes from your team's knowledge and preferences — things that are not detectable from the file structure.

---

## Part 3: The Most Impactful CLAUDE.md Sections

A good CLAUDE.md covers these categories, roughly in order of impact:

**Project overview:** 2-3 sentences about what this project is. This helps Claude give contextually appropriate answers.

```markdown
## Project Overview
This is a FastAPI-based REST API for a B2B SaaS product. The core domain is workflow automation.
The API serves both a React frontend and external customer integrations.
```

**Tech stack and versions:** Exact versions matter. A CLAUDE.md that specifies "SQLAlchemy 2.x" prevents Claude from generating SQLAlchemy 1.x patterns.

```markdown
## Tech Stack
- Python 3.12
- FastAPI 0.111
- SQLAlchemy 2.x (use the new session API, not the legacy Query API)
- PostgreSQL 16
- Alembic for migrations
- pytest + pytest-asyncio for tests
- Ruff for linting and formatting
```

**Conventions and rules:** This is the highest-impact section. These are the constraints that prevent Claude from writing technically correct but project-inappropriate code.

```markdown
## Conventions

### Code Style
- Line length: 100 characters maximum
- Type hints required on all function signatures
- Use Pydantic v2 models for all request/response schemas
- Prefer composition over inheritance for services

### Testing
- All tests go in tests/ mirroring the src/ structure
- Tests must be async (use pytest.mark.anyio)
- Never mock internal services — only mock external dependencies (HTTP, database)
- Test file naming: test_{module_name}.py

### Database
- All queries via repositories in src/repositories/ — never raw SQL in endpoints
- Use parameterized queries always — never string concatenation
- Migrations required for all schema changes — never alter tables directly

### Git
- Commit format: type(scope): description (conventional commits)
- Never commit .env files, secrets, or generated files
- Always run ruff and pytest before committing
```

**Sensitive files and directories:** Tell Claude what to leave alone.

```markdown
## Off-limits
- Never modify migrations/ directly — create new migration files only
- Never modify .github/workflows/ without explicit instruction
- Never delete files — use git rm if a file needs to be removed
```

**Custom commands:** Define slash commands relevant to this project (from Lesson 12).

---

## Part 4: Maintaining CLAUDE.md Over Time

CLAUDE.md is a living document. Update it when:

- You discover Claude making a consistent mistake that could be prevented by an instruction
- A new convention is established by the team
- The tech stack changes (version updates, new dependencies)
- A gotcha is discovered that future sessions should avoid

A useful practice: at the end of a productive Claude Code session, ask:

```
What should I add to CLAUDE.md based on what we learned in this session? What conventions or decisions should future sessions know about?
```

Claude will identify decisions it had to make that could be pre-specified, patterns it discovered in the codebase, and gotchas it encountered. These are exactly the things CLAUDE.md should capture.

---

## Part 5: Global CLAUDE.md for Personal Conventions

Your `~/.claude/CLAUDE.md` file (the global one) should capture your personal conventions that apply across all projects:

```markdown
## Global Preferences

### Code Style
- I prefer explicit over implicit — no magic
- Error messages should include context: what was attempted, what failed, what to try

### Communication
- Show me what you are planning before making significant changes
- If you are unsure about intent, ask rather than guessing
- When making a change that affects multiple files, list the files first

### Safety
- Always ask before force-pushing any branch
- Always ask before running any command that deletes files or modifies production data
- Never commit .env files or files containing secrets
```

These preferences carry into every project without needing to specify them in each CLAUDE.md.

---

## Key Takeaways

- CLAUDE.md is read at the start of every session and provides persistent project context
- `/init` generates a starter from the detected project structure — always refine it with human-authored conventions
- The highest-impact sections: tech stack versions, code conventions, testing rules, database rules, off-limits files
- CLAUDE.md is living documentation — update it when conventions change or when Claude makes preventable mistakes
- Global `~/.claude/CLAUDE.md` captures personal cross-project preferences

---

## Common Mistakes to Avoid

**Writing CLAUDE.md only once and forgetting it.** The file becomes outdated and starts producing incorrect guidance. Review and update it quarterly, or after any significant project change.

**Using CLAUDE.md to specify what Claude should build, not how it should work.** CLAUDE.md is for persistent conventions, not for task specifications. Task specifications belong in your prompts.

**Being too brief.** "Use good testing practices" is not actionable. "All tests use pytest-asyncio, mocking only external HTTP clients, with test isolation via SQLAlchemy transaction rollback" is actionable.

---

Next Lesson: In **Lesson 16: Effective Prompting Patterns**, we synthesize the prompting knowledge from this section into a set of patterns you can apply immediately to get consistently better results from Claude Code.

---

[Back to Section Overview](./README.md) | [Next Lesson: Effective Prompting Patterns →](./lesson-16-effective-prompting-patterns.md)
