# Lesson 3: Introduction to Claude

**Course:** AI Code Agents | **Duration:** 30 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Describe the Claude model family and the differences between model tiers
- Explain what context windows are and why they matter for agentic tasks
- Describe Anthropic's approach to AI safety and how it manifests in Claude's behavior
- Identify which Claude model to use for different types of coding tasks

---

## Prerequisites

- Lesson 2: The AI Coding Landscape
- No technical prerequisites beyond general software development familiarity

---

## Part 1: The Claude Model Family

Anthropic releases Claude models in a tiered system. Each tier represents a different tradeoff between capability, speed, and cost. As of 2025, the three tiers are named Haiku, Sonnet, and Opus (from fastest/cheapest to most capable/expensive), though specific version numbers and names update with each release.

**Haiku (fast tier):** The smallest and fastest models. Designed for tasks that require quick responses at high volume — classification, short answers, simple code completions, chatbot responses. Haiku models process tokens quickly and cost significantly less per token than larger models. For agent tasks with many iterations, Haiku can be a cost-effective choice when the task does not require deep reasoning.

**Sonnet (balanced tier):** The middle tier. Sonnet models offer strong capability with reasonable speed and cost. In practice, Claude Sonnet models are the workhorse of most Claude deployments — capable enough for complex reasoning and code generation, fast and affordable enough for production use. Claude Code defaults to a Sonnet-tier model for most interactions.

**Opus (capability tier):** The largest and most capable models. Opus models are used when you need the highest-quality reasoning — complex multi-step problems, long-document analysis, nuanced judgment calls. They are slower and more expensive, so they are reserved for tasks where the extra capability is worth the cost.

For coding agent tasks: most day-to-day work is well-served by Sonnet. Use Haiku for high-volume, simple tasks where cost is a concern. Use Opus when you encounter a problem where Sonnet is making repeated reasoning errors or struggling with architectural complexity.

---

## Part 2: Context Windows and Why They Matter

A context window is the maximum amount of text (measured in tokens) that a model can consider at once. Everything the model knows about your task — the system prompt, the conversation history, the files it has read, the tool call results it has received — must fit within this window.

Claude's context window has grown substantially with each generation. Current Claude models support 200,000 tokens (roughly 150,000 words, or about 500 pages of text). This is enough to hold:
- Entire small-to-medium codebases in a single context
- Long conversation histories from multi-step tasks
- Detailed tool descriptions plus accumulated results
- System prompts with extensive instructions

For AI code agents, large context windows are not just a nice-to-have — they are essential. Consider what needs to be in context during a non-trivial refactoring task:

1. The task description
2. The files being edited (potentially dozens)
3. The full history of tool calls and results from previous steps
4. Test output from multiple test runs
5. System prompt with project-specific instructions
6. Tool definitions for all available tools

In practice, context management is one of the most important engineering challenges in building agents. You need to be selective about what goes into context (because more context means slower responses and higher cost) while ensuring the model has enough information to reason correctly.

Claude has a feature called "extended thinking" on some models, where the model reasons through a problem before generating a final response. For complex agent tasks, this can significantly improve the quality of the model's decisions.

---

## Part 3: Anthropic's Approach to Safety

Anthropic was founded specifically around the mission of AI safety research. This is not a marketing position — it shapes how Claude is trained and what behavior emerges.

Claude is trained with a technique Anthropic calls Constitutional AI (CAI). Instead of only relying on human feedback for alignment, Claude is trained with a set of principles (a "constitution") that guides its reasoning about what responses are helpful, harmless, and honest. The model learns to critique its own outputs according to these principles during training.

For code agents specifically, this approach has practical consequences:

**Transparency about actions.** Claude describes what it is about to do before doing it. If you ask Claude Code to "clean up the test suite," it will tell you which files it plans to modify before making changes, not surprise you with a 50-file diff.

**Caution with destructive operations.** Claude is trained to be conservative about operations that are hard to reverse. It will ask for confirmation before deleting files, force-pushing branches, or making changes that could not be easily undone.

**Honesty about uncertainty.** When Claude does not know something — the behavior of an unfamiliar library, the intent behind an ambiguous specification — it says so rather than fabricating an answer. For agentic tasks, this is critical: a hallucinated answer that gets executed as code causes real damage.

**Refusing genuinely harmful requests.** Claude will decline to write malware, exploit vulnerabilities for malicious purposes, or help with requests that have high potential for serious harm. This refusal is not arbitrary — it is a consistent application of trained values.

These properties make Claude well-suited for agentic use cases where the consequences of wrong or dishonest behavior are compounded by automation. A hallucination that gets executed 50 times in an agent loop is much more damaging than a hallucination in a chat response that a human reads once.

---

## Part 4: Using Claude Effectively

Claude is designed to be direct and capable, but there are patterns that get better results:

**Be specific about constraints.** "Write a function to process users" produces less useful output than "Write a Python function that takes a list of User objects, filters out inactive users, and returns a sorted list by registration date. Raise ValueError if the input is not a list."

**Provide context about your codebase.** Claude does not inherently know your project's conventions, dependencies, or architectural decisions. The more context you provide (through CLAUDE.md files, explicit description, or showing relevant existing code), the more aligned the output will be.

**Use the model tier that matches the task complexity.** Simple, repetitive tasks do not need Opus. Complex architectural reasoning does not need to be done on Haiku. Match the model to the task.

**Iterate rather than perfect in one shot.** Claude Code is designed for iterative collaboration. A rough first pass followed by targeted refinements often produces better results than trying to specify everything perfectly upfront.

**Trust the refusals.** If Claude declines to do something, it typically has a principled reason. Understanding that reason often leads to a better way to accomplish your actual goal.

---

## Key Takeaways

- Claude models come in three tiers: Haiku (fast/cheap), Sonnet (balanced), Opus (most capable) — Sonnet is the right default for most coding tasks
- Context windows of 200K tokens allow Claude to hold entire codebases, full conversation histories, and detailed tool results in active context
- Anthropic's Constitutional AI approach produces a model that is transparent, cautious about destructive actions, honest about uncertainty, and consistent about refusing harmful requests
- These safety-oriented properties are features for agentic use cases where wrong behavior gets automated and amplified

---

## Common Mistakes to Avoid

**Using Opus for everything.** Opus is expensive and slower. For 90% of coding tasks, Sonnet produces equivalent quality at significantly lower cost and latency.

**Not providing project context.** Claude generates much better code when it understands your project's conventions, dependencies, and architectural decisions. Take the time to set up a CLAUDE.md file (covered in Section 2).

**Treating refusals as bugs.** When Claude refuses a request, trying to jailbreak or work around the refusal usually means trying to do something that deserves the refusal. Understand why and find a better approach.

---

Next Lesson: In **Lesson 4: How LLMs Write Code**, we look inside the mechanics of how language models actually work — not at a mathematical detail level, but at the level that matters for understanding what LLMs are good at and where they fail.

---

[Back to Section Overview](./README.md) | [Next Lesson: How LLMs Write Code →](./lesson-04-how-llms-write-code.md)
