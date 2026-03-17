# Lesson 2: The AI Coding Landscape

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Categorize AI coding tools into distinct types with different capabilities
- Describe the key characteristics of GitHub Copilot, Cursor, Claude Code, and other major tools
- Explain the tradeoffs between different categories of AI coding tools
- Identify which category of tool is appropriate for a given task

---

## Prerequisites

- Lesson 1: What Are AI Code Agents?
- Basic experience using at least one code editor (VS Code, PyCharm, etc.)

---

## Part 1: The Three Categories

AI coding tools have proliferated rapidly, and they are not all the same. To make sense of the landscape, it helps to organize tools into three broad categories based on their level of autonomy and how they integrate into your workflow:

**Category 1 — Autocomplete / Copilot-style tools.** These tools work inline in your editor. They predict what you are about to type and offer completions that you can accept or reject. The AI never takes an action on your behalf — it only suggests text. You remain in complete control. Examples: GitHub Copilot, Tabnine, Codeium.

**Category 2 — AI-augmented editors.** These are full editor environments rebuilt around AI interaction. Instead of just autocomplete, you can ask the AI to edit a file, refactor a function, explain an error, or implement a feature — but the changes are proposed and require your explicit approval before being applied. Examples: Cursor, Windsurf, Zed with AI.

**Category 3 — Autonomous agents.** These tools can run multi-step tasks with minimal human intervention. They call tools, read and write files, run tests, and work toward a goal across many actions. The human sets the goal and reviews the outcome, but individual steps are automated. Examples: Claude Code, Devin, GitHub Copilot Workspace, Aider.

Understanding which category a tool belongs to tells you how to use it, what risks it carries, and what tasks it is best suited for.

---

## Part 2: GitHub Copilot

GitHub Copilot, released in 2021, was the first AI coding tool to achieve widespread adoption. It operates primarily in Category 1 — autocomplete — though newer versions have added Category 2 features.

**How it works:** Copilot sends your current file, surrounding context, and any comments you have written to a language model (originally Codex, now GPT-4). The model returns completions, which Copilot displays as ghost text in your editor. You press Tab to accept or continue typing to reject.

**Strengths:**
- Extremely low friction — it works as you type, no mode switching
- Very good at repetitive, pattern-following code (CRUD operations, boilerplate, test cases with consistent structure)
- Language support is broad — works well in Python, TypeScript, Go, Rust, and many others
- Integration with GitHub's ecosystem (pull request summaries, code explanations)

**Limitations:**
- Context is limited to the current file and nearby files — it has no understanding of your full codebase
- It cannot run your code or observe the results — it generates but does not verify
- It is optimized for token-by-token prediction, not for reasoning about multi-step architectural problems

**Best for:** Routine coding tasks where you know exactly what you want and need help with the implementation details. Boilerplate, repetitive patterns, standard library usage.

---

## Part 3: Cursor

Cursor is an IDE built on VS Code that deeply integrates AI at every level. It sits in Category 2 with significant Category 3 capabilities depending on the mode.

**How it works:** Cursor offers several modes. Autocomplete works like Copilot. The chat panel lets you ask questions about your codebase with full access to relevant files. The "Composer" mode lets you describe a change and have the AI generate a diff that you review and apply. The "Agent" mode (available in newer versions) can take multi-step actions.

**Strengths:**
- Codebase-aware — Cursor indexes your entire repository and can retrieve relevant context automatically
- The diff review workflow is excellent for understanding and controlling AI-generated changes
- Supports multiple models (GPT-4o, Claude 3.5 Sonnet, etc.) — you can choose the model best suited to the task
- Feels like a natural extension of the IDE workflow rather than a separate tool

**Limitations:**
- The IDE is the product — you cannot use Cursor in your own editor (though VS Code extensions exist for some features)
- Agent mode is less mature than dedicated agent tools
- Cost can be significant at high usage

**Best for:** Developers who want AI deeply integrated into their editing workflow, particularly for larger refactoring tasks, codebase exploration, and feature development that benefits from the diff-review model.

---

## Part 4: Claude Code

Claude Code is Anthropic's AI coding agent, designed as a full Category 3 autonomous agent. It runs as a CLI tool rather than an IDE plugin, which reflects a different philosophy: Claude Code is a collaborator that works on your codebase, not a feature that lives inside your editor.

**How it works:** You run `claude` in your terminal. Claude Code has access to a powerful set of tools: reading and writing files, running shell commands, searching the codebase, calling web resources, and managing git. You describe a task in natural language; Claude reasons about it and takes action using its tools.

**Strengths:**
- Full agentic capability — Claude Code can complete multi-step tasks with genuine autonomy
- Deep integration with the development workflow — git commits, test runs, file operations all happen natively
- Anthropic's focus on safety means Claude Code is conservative about destructive actions and transparent about what it is doing
- Works with your existing editor and toolchain rather than replacing them
- Highly customizable via CLAUDE.md project instructions and custom slash commands

**Limitations:**
- Context window consumption can be significant for complex tasks
- As a CLI tool, it does not have inline editing features like Cursor
- Requires more explicit task specification than some editor-integrated tools

**Best for:** Autonomous task completion: implementing features, running refactoring passes, writing test suites, automating repetitive engineering tasks. Anything where you want the AI to own the execution, not just suggest code.

Claude Code is the focus of Section 2 of this course, and the API that powers it is the focus of Section 3.

---

## Part 5: Other Notable Tools

**Devin (Cognition AI):** Marketed as the "first AI software engineer," Devin is a fully autonomous agent with its own development environment — a sandboxed VM with a browser, terminal, and code editor. Devin can browse documentation, debug long-running issues, and deploy code. It targets longer-horizon tasks than most tools. Primarily aimed at enterprise use cases with significant cost per task.

**Aider:** An open-source CLI agent that combines LLM capabilities with git-aware code editing. Aider is particularly strong at making targeted edits to existing code while keeping git history clean. It supports many models (Claude, GPT-4, local models) and is highly configurable. Excellent for developers who want full control over the agentic toolchain.

**GitHub Copilot Workspace:** GitHub's answer to full-task automation, integrated into the GitHub platform. You can create a "workspace" from an issue, and Copilot will reason about what code changes are needed, propose a plan, and implement it. The plan-first-then-execute model provides good visibility into what the agent intends to do.

**Cline / Continue:** Open-source VS Code extensions that bring agentic capabilities into the editor. These tools let you use your own API keys with any supported model, giving more cost control and flexibility than commercial products.

---

## Key Takeaways

- AI coding tools fall into three categories: autocomplete (Category 1), AI-augmented editors (Category 2), and autonomous agents (Category 3)
- GitHub Copilot excels at inline autocomplete for pattern-following code
- Cursor excels at codebase-aware editing with human review of proposed changes
- Claude Code excels at autonomous multi-step task completion with full tool access
- The right tool depends on the task: routine completion → Copilot; informed editing → Cursor; autonomous task completion → Claude Code or similar agents

---

## Common Mistakes to Avoid

**Using an autocomplete tool for an agent task.** If you need to implement a feature across 15 files with tests, asking Copilot for inline completions one function at a time is the wrong approach. Use an agent.

**Using an agent tool for simple inline editing.** Starting a full Claude Code session to rename a variable is overkill. Use your editor's built-in refactoring.

**Assuming all AI coding tools are equivalent.** The model quality, tool access, and context management differ dramatically between tools. A task that one tool completes correctly another may hallucinate entirely.

---

Next Lesson: In **Lesson 3: Introduction to Claude**, we take a close look at the Claude model family — what models are available, what makes Claude different from GPT-4 and other frontier models, and why it is well-suited for agentic coding tasks.

---

[Back to Section Overview](./README.md) | [Next Lesson: Introduction to Claude →](./lesson-03-introduction-to-claude.md)
