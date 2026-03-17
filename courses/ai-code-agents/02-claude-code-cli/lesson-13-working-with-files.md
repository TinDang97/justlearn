# Lesson 13: Working with Files

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Direct Claude Code to read, write, and edit files effectively
- Use search and glob patterns to find relevant files in large codebases
- Execute multi-file operations safely with appropriate review steps
- Understand how Claude Code's file tools work under the hood

---

## Prerequisites

- Lessons 9-12 of this section

---

## Part 1: Reading Files

Claude Code reads files using its built-in `read_file` tool. When you ask Claude to look at a file, it calls this tool, gets the contents, and adds them to context.

You can direct this explicitly:

```
Read src/api/users.py and explain what the UserService class does.
```

Or implicitly, as part of a task:

```
Fix the bug in src/api/users.py where the email uniqueness check is case-sensitive.
```

In the implicit case, Claude will read the file as part of figuring out how to fix the bug.

**Partial file reading:** For large files, you can ask Claude to read a specific range:

```
Read lines 100-200 of src/api/users.py — I am interested in the authentication methods.
```

**Reading multiple files at once:**

```
Read these three files and describe how they work together:
- src/models/user.py
- src/api/users.py
- src/services/email.py
```

Claude will read all three and synthesize an explanation of their relationships.

---

## Part 2: Writing and Editing Files

Claude Code can write new files or edit existing ones. Understanding the difference between these operations is important:

**Writing a new file:**

```
Create a new file at src/utils/validators.py with a function validate_email(email: str) -> bool that uses a regex to check email format.
```

Claude creates the file with the specified content.

**Editing an existing file (targeted):**

```
In src/api/users.py, modify the create_user function to call validate_email before inserting. Raise ValueError if the email is invalid. Do not change anything else in the file.
```

The "do not change anything else" constraint is important — it keeps Claude focused and prevents scope creep where the agent starts improving adjacent code that was not requested.

**Editing an existing file (broader):**

```
Refactor src/api/users.py to use the new UserRepository class instead of the old direct database calls. The UserRepository is defined in src/repositories/user_repository.py. Read that file first, then make the changes.
```

For broader edits, Claude reads the relevant files, plans the changes, and applies them. The narration will tell you what it is doing at each step.

**Reviewing before applying:** For any significant file change, ask Claude to show you what it plans to do before executing:

```
Before editing src/api/users.py, show me a summary of what changes you plan to make. I will confirm before you write.
```

This is the plan-and-confirm pattern from Lesson 7 applied to file operations.

---

## Part 3: Searching Files

Searching is often more efficient than reading when you need to find something specific in a large codebase. Claude Code has access to grep-style search:

**Find all uses of a function:**

```
Find all places in the codebase where get_user_by_email is called.
```

**Find files matching a pattern:**

```
Find all Python files in the src/ directory that import from src.models.
```

**Find TODO comments:**

```
Search for all TODO and FIXME comments in the src/ directory. Group them by file.
```

**Semantic search (describe what you are looking for):**

```
Find the part of the codebase that handles password hashing. I do not know the exact function name — look for bcrypt, hashlib, or similar patterns.
```

Combining search with targeted reads is the most efficient way to navigate large codebases:

```
Step 1: Find all files that implement API routes (look for @router.get, @app.route, or similar patterns).
Step 2: For each of those files, check if they have corresponding test files.
Step 3: Report which route files are missing tests.
```

---

## Part 4: Multi-File Operations

Many real tasks require coordinated changes across multiple files. Examples:
- Renaming a function used in 10 different files
- Adding a new required parameter to a class used throughout the codebase
- Implementing a feature that requires a model, a service, an API endpoint, and a test

For multi-file operations, structure your requests to include explicit sequencing:

**Example — rename a function across the codebase:**

```
Rename the function get_user_by_email to find_user_by_email across the entire codebase.

Steps:
1. First, find every file that contains get_user_by_email (both the definition and all call sites)
2. Update the definition in src/models/user.py
3. Update each call site
4. Run the tests to verify nothing broke
5. Report a summary of all files changed
```

**Example — implement a feature across the stack:**

```
Implement a "deactivate account" feature. This requires:
1. Add a is_active boolean field to the User model in src/models/user.py (default True)
2. Add a migration file (the project uses alembic — check the migrations/ directory for the correct format)
3. Add a deactivate_user(user_id) function to UserRepository in src/repositories/user_repository.py
4. Add a DELETE /users/{user_id} endpoint to src/api/users.py that calls deactivate_user
5. Add tests in tests/api/test_users.py for the new endpoint

Work through these in order. After each step, confirm the change looks correct before proceeding to the next.
```

The explicit sequencing and step-by-step confirmation keeps multi-file operations controllable.

---

## Part 5: File Operation Safety

Several patterns make file operations safer:

**Read before write.** Always have Claude read a file before modifying it, even if you think you know the current contents. File contents can change between sessions, and assumptions about current state are a common source of errors.

**Scope constraints.** When modifying a file for a specific purpose, add the constraint "do not change anything else." This prevents beneficial-looking scope creep.

**Git as safety net.** Run `git add` and `git diff` (or ask Claude to do so) before any significant edit to ensure you have a clean baseline. Use git to review changes after each multi-file operation.

**Verify after changes.** For any edit that changes code behavior, run the tests immediately after. Do not wait until after making changes to five files to discover that the first file edit broke the tests.

---

## Key Takeaways

- Claude Code reads files on request (explicit or implicit as part of a task) and adds contents to context
- For edits, the "do not change anything else" constraint prevents scope creep
- Search is more efficient than reading for navigating large codebases — use it to find, then read selectively
- Multi-file operations benefit from explicit sequencing and step-by-step confirmation
- Read before write, scope constraints, git as safety net, and post-change verification are the safety patterns

---

## Common Mistakes to Avoid

**Asking for broad rewrites without constraints.** "Improve this file" without constraints leads to unpredictable, large changes. Be specific about what to change and what to leave alone.

**Not using git before multi-file operations.** Always commit or at least stage your current state before starting a large multi-file operation. If something goes wrong, you need a clean rollback point.

**Forgetting to run tests after changes.** Claude can make a change that looks correct but breaks something subtle. Running tests is the verification step that catches these cases.

---

Next Lesson: In **Lesson 14: Git Integration**, we learn how to use Claude Code to commit changes, create branches, review diffs, and create pull requests — integrating the agent into the full development lifecycle.

---

[Back to Section Overview](./README.md) | [Next Lesson: Git Integration →](./lesson-14-git-integration.md)
