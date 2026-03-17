# Lesson 10: Your First Conversation

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Distinguish between question, task, and exploration request types and use each appropriately
- Read Claude Code's output to understand what it did and why
- Build an effective iterative conversation on a coding problem
- Recognize when to start a new session versus continuing the current one

---

## Prerequisites

- Lesson 9: Installing Claude Code (Claude Code installed and authenticated)
- A project directory to work in

---

## Part 1: The Three Modes of Conversation

Claude Code sessions can involve three fundamentally different types of interactions, and treating them the same leads to poor results:

**Information requests:** You want Claude to tell you something — how a piece of code works, what a library does, what the error means, what approach to take. The expected output is text explanation, not code changes. Use these freely for learning and exploration.

Example:
```
How does the authentication flow work in this codebase? Walk me through the code path from login request to session creation.
```

**Task requests:** You want Claude to take action — implement a feature, fix a bug, add tests, refactor code. The expected output is code changes, not just explanations. Task requests require clear success criteria.

Example:
```
Add input validation to the register_user function in src/auth.py. Validate that email is a valid email format and name is between 2 and 100 characters. Raise ValueError with a descriptive message for each violation.
```

**Exploration requests:** You want Claude to investigate something and report findings — look for potential issues, understand an unfamiliar codebase, assess what tests are missing. The expected output is analysis and recommendations, not code changes (unless you explicitly request them).

Example:
```
Review the error handling in the data ingestion pipeline. Report any places where exceptions might be swallowed silently, where errors could leave the system in an inconsistent state, or where the error messages are too vague to diagnose problems.
```

Mixing these up creates confusion. If you make a task request but the specification is vague, Claude will often do something — but the something may not be what you meant. When you need analysis before action, use an exploration request first, then follow up with a targeted task request.

---

## Part 2: Reading Claude's Output

Claude Code's output during a session combines its narration with tool call output. Reading this output effectively lets you understand what the agent actually did — not just what it produced.

When Claude reads a file, you will see something like:

```
I'll read the auth module to understand the current implementation.

[Reading src/auth.py...]
```

When it runs a command:

```
Let me run the tests to see the current state.

[Running: python -m pytest tests/test_auth.py -v...]

Output:
FAILED tests/test_auth.py::test_register_duplicate_email - AssertionError
```

When it writes to a file:

```
I'll add the validation logic. Here's what I'm implementing:
- Email format check using re.match with RFC 5322 pattern
- Name length check: 2-100 characters
- Raising ValueError with the field name and constraint

[Writing src/auth.py...]
```

This narration is meaningful — it tells you what Claude is doing and why. Pay attention to:

- **What files it reads before editing.** It should read a file before modifying it (grounding, from Lesson 6).
- **Whether it runs tests after changes.** A good agent verifies its changes work.
- **Whether its stated reasoning matches its actions.** If Claude says "I'll add validation" and then the file diff shows something different, there is a discrepancy worth investigating.

---

## Part 3: Iterative Conversation on a Coding Problem

The most productive way to use Claude Code is not "one big request with perfect specification" — it is iterative: start with a reasonable task, review the result, and refine.

Here is a realistic example of an effective iterative conversation:

**Turn 1 — Broad task:**
```
The user registration in src/auth.py has no input validation. Add basic validation.
```

Claude adds some validation. You review the diff. It added email format checking but not the name length constraint you were expecting.

**Turn 2 — Targeted refinement:**
```
Good start. Add name validation too: minimum 2 characters, maximum 100 characters. Also, the email regex is too permissive — it accepts "user@" without a domain. Use a more complete email pattern.
```

Claude updates the validation. You notice the tests for this function are now out of date.

**Turn 3 — Extend the work:**
```
Now update the tests in tests/test_auth.py to cover the new validation. Add test cases for: empty name, name too long, invalid email format (no domain, no @), and valid edge cases (minimum length name, complex valid email).
```

This iterative pattern — task, review, refine, extend — consistently produces better results than trying to specify everything in one large prompt. Each turn gives you a checkpoint to redirect if needed.

---

## Part 4: Session Management

A Claude Code session maintains conversation history. The agent remembers what it read, what it did, and what decisions it made earlier in the session. This is valuable — it means Claude does not need to re-read files it already read, and it can refer to previous findings.

But sessions also have limits. As a session grows longer (more tool calls, more file reads, more back-and-forth), the context window fills up. When the context is nearly full, Claude Code will warn you and suggest compacting or starting a new session.

**When to continue the session:**
- The current task is unfinished
- Earlier context is directly relevant to what you are about to ask
- You are in the middle of an iterative refinement

**When to start a new session:**
- The task is complete and you are starting something new
- You want to reset to a clean context (e.g., after exploring many tangents)
- The session has grown very long and responses are becoming less coherent
- You are switching to a different part of the codebase with different relevant context

Start a new session with `exit` followed by `claude` again, or open a new terminal. The CLAUDE.md file (Lesson 15) persists context between sessions — project conventions and instructions do not need to be repeated.

---

## Key Takeaways

- Three conversation modes: information requests (tell me), task requests (do this), exploration requests (investigate and report)
- Read Claude's narration to understand what it actually did, not just what it produced
- Iterative conversations — task, review, refine, extend — consistently outperform single large prompts
- Sessions maintain history which is valuable but fills up context; know when to start fresh

---

## Common Mistakes to Avoid

**Ambiguous task requests.** "Fix the authentication" is not a task — it is a direction. What specifically is wrong? What would "fixed" look like? Vague tasks lead to unpredictable results.

**Not reviewing what Claude did.** It is tempting to accept the output immediately, especially when it looks right. Always read the diff or run the tests. The narration says what Claude intended; the actual output is what matters.

**Continuing a session when you should start fresh.** A session with 50 turns and dozens of file reads may have important context for continuing a specific task — but it is not better for starting a new, unrelated task. Start fresh when the task is new.

---

Next Lesson: In **Lesson 11: Understanding the Context Window**, we look at the context window constraint in detail — how to estimate what is in context, how to stay within the budget, and how to handle large codebases that do not fit in a single context.

---

[Back to Section Overview](./README.md) | [Next Lesson: Understanding the Context Window →](./lesson-11-understanding-context-window.md)
