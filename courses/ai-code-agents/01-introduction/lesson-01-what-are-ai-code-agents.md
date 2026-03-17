# Lesson 1: What Are AI Code Agents?

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Define AI code agents in precise technical terms
- Explain the agentic loop and why it matters
- Describe how agents differ from traditional chat-based AI tools
- Identify the key components that make up an AI code agent

---

## Prerequisites

- Familiarity with software development concepts (functions, APIs, files)
- Basic understanding of what large language models (LLMs) are at a conceptual level

---

## Part 1: The Difference Between Asking and Acting

There is a fundamental difference between asking an AI a question and having an AI take action on your behalf.

When you type a question into an AI chatbot and receive an answer, the AI has done exactly one thing: it has generated a sequence of tokens that constitutes a response. The response is text. What you do with that text — whether you copy it, ignore it, run it as code, or adapt it — is entirely up to you. The AI had no knowledge of what happened after it wrote its last token.

This is the assistant model: the AI is an extremely sophisticated answering machine. It is powerful, but it is passive. The human remains the executor of every action.

An AI code agent operates on a completely different model. The agent is not just generating answers — it is making decisions, calling tools, observing results, and iterating. It can read a file, write code, run tests, check if the tests passed, fix the failures, commit the changes, and report completion — all without a human doing any of those individual steps.

The shift from AI assistant to AI agent is the shift from passive text generation to active action-taking. This changes what the AI can do, how you interact with it, and what risks you need to manage.

---

## Part 2: The Agentic Loop

The core pattern that makes AI agents work is called the **agentic loop** (sometimes called the observe-think-act loop or the ReAct pattern). Understanding this loop is essential because every AI agent — regardless of the framework, the model, or the task — runs some version of it.

The loop has three phases that repeat until the task is complete:

**Observe:** The agent gathers information about the current state of the world. This might mean reading the contents of a file, checking the output of a test run, looking at the result of the last tool call, or examining the current state of a codebase. The agent has a perception mechanism — some way of taking in the current state and adding it to its working context.

**Think:** The agent reasons about what it has observed and decides what to do next. This reasoning happens inside the language model. The model reads the task description, the accumulated history of observations and actions, and the current state, then generates a decision. That decision might be to call a specific tool, to ask for clarification, or to declare the task complete. The model's ability to reason about complex multi-step problems is what makes this useful.

**Act:** The agent executes the decision. If the decision was to call a tool (like "run the test suite" or "write this content to a file"), the agent calls that tool, waits for the result, and feeds the result back into the observation phase. The loop then repeats.

Here is a simple concrete example. You give an agent this task: "Add input validation to the user registration function in auth.py."

- **Observe:** The agent reads auth.py and discovers the current `register_user` function accepts name and email without any validation.
- **Think:** The agent reasons that it needs to add type checking, email format validation, and length constraints. It decides to write the validation logic first.
- **Act:** The agent calls the "write to file" tool with the updated function.
- **Observe:** The agent reads the updated file back to confirm the edit was correct.
- **Think:** The agent decides it should run the existing tests to make sure nothing broke.
- **Act:** The agent calls the "run tests" tool.
- **Observe:** The tests pass.
- **Think:** The task is complete. The agent generates a summary message.

This is a simple loop with five iterations. Production agents routinely run loops with dozens of iterations, branching based on what they discover along the way.

---

## Part 3: What Makes Something a "Code Agent" Specifically

Not every AI agent is a code agent. A general-purpose agent might browse the web, send emails, or fill out forms. A code agent is specifically designed to operate on codebases and software development tasks.

Code agents have a characteristic toolset that reflects the nature of their domain:

**File system tools:** Reading files, writing files, creating directories, searching for patterns in files. Code agents work with codebases, so file access is fundamental.

**Execution tools:** Running shell commands, executing scripts, running test suites, invoking build systems. The ability to execute code and observe the results is what makes code agents genuinely useful — the agent can write code, run it, observe that it fails, read the error, fix the code, and run it again.

**Version control tools:** Creating commits, creating branches, reading git history, viewing diffs. Working with version control is part of the professional software development workflow.

**Search tools:** Grep-style search across files, searching for symbol definitions, finding usages. Large codebases cannot be loaded entirely into context — the agent needs to navigate and search.

**Code intelligence tools:** In more sophisticated setups, agents may have access to language servers, AST parsers, or code analysis tools that provide structured information about the codebase.

The combination of LLM reasoning with these domain-specific tools is what makes a code agent capable of tasks that pure code generation cannot accomplish. The agent can write code, execute it, observe the real behavior, and use that feedback to improve its output. This feedback loop is the key.

---

## Part 4: Brief History and Why Now

The idea of having software automate software development is as old as computing itself. Macros, code generators, template systems, refactoring tools — these have existed for decades. What changed to enable AI code agents?

Three developments converged around 2022-2023:

**Sufficiently capable language models.** Models like GPT-4, Claude 2, and their successors are capable of understanding complex code, reasoning about multi-step problems, and generating syntactically and semantically correct code across dozens of languages and frameworks. Earlier models were not reliably capable enough for autonomous code tasks.

**Function calling / tool use.** The ability to reliably have a language model call structured functions (rather than just generating freeform text) was added to major models in 2023. Without reliable tool use, the agent loop cannot be implemented — the model needs to output structured decisions that the agent runtime can parse and execute.

**Large context windows.** Modern models can handle context windows of 100K-200K tokens, meaning an agent can hold the contents of entire files, the full history of a multi-step task, and detailed tool descriptions in its active context simultaneously. Earlier models with 4K or 8K token limits were too constrained for useful agentic work on real codebases.

These three developments together made AI code agents practically useful rather than theoretically interesting.

---

## Key Takeaways

- AI code agents differ from AI chat assistants by taking action: reading files, running code, calling tools, and iterating based on results
- The agentic loop (observe-think-act) is the core pattern: the agent gathers information, reasons about it, takes an action, and repeats
- Code agents specifically have tools for file access, code execution, version control, and search — not just text generation
- Three developments enabled practical code agents: sufficiently capable LLMs, reliable tool use / function calling, and large context windows

---

## Common Mistakes to Avoid

**Thinking agents are just fancy autocomplete.** Copilot-style autocomplete predicts the next token as you type. Agents complete multi-step tasks autonomously, maintaining state across many actions. The mental model is completely different.

**Underestimating the importance of the feedback loop.** The reason agents are useful is not just that they can write code — it is that they can write code, test it, observe failures, and fix them. The execution-and-observation loop is what elevates agents above pure code generation.

**Conflating the model with the agent.** The language model is one component of an agent. The agent also includes the tool set, the runtime that calls the model and dispatches tool calls, the context management system, and the task specification. Building a good agent requires getting all of these right.

---

Next Lesson: In **Lesson 2: The AI Coding Landscape**, we survey the major AI coding tools available today — from autocomplete tools like GitHub Copilot and Cursor to full agents like Claude Code and Devin — and build a map of what each tool is good for.

---

[Back to Section Overview](./README.md) | [Next Lesson: The AI Coding Landscape →](./lesson-02-the-ai-coding-landscape.md)
