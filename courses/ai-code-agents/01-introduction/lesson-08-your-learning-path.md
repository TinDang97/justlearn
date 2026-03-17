# Lesson 8: Your Learning Path

**Course:** AI Code Agents | **Duration:** 25 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Describe what you will build in each section of this course
- Identify your current level relative to the course prerequisites
- Understand how the five sections connect and build on each other
- Set concrete learning goals for each section

---

## Prerequisites

- Lessons 1-7 of this section
- This is the final lesson of Section 1

---

## Part 1: What You Have Already Learned

By completing Section 1, you have built the mental model that everything else in this course depends on.

You know what AI code agents are: systems that combine an LLM's reasoning capability with a tool set, executing the observe-think-act loop to complete multi-step tasks autonomously. You know how they differ from simpler AI tools, where they fit in the landscape alongside Copilot and Cursor, and what specific risks they carry.

You understand the underlying mechanics: that LLMs are token predictors trained on massive corpora, that tool use provides the bridge between text generation and real-world action, and that grounding (basing actions on observed results rather than assumed knowledge) is the key property that makes agents reliable.

You have a safety mindset: minimal authority, appropriate sandboxing, human-in-the-loop at high-risk points, and awareness of the key failure modes.

This conceptual foundation is not just introductory context — it will inform every practical decision you make in the remaining sections. When you choose how much autonomy to give Claude Code, you will be applying the agent-vs-assistant framework. When you write tool definitions, you will be applying what you learned about tool schemas and grounding. When you deploy an agent, you will be applying the safety patterns.

---

## Part 2: Section 2 — Claude Code CLI

Section 2 is where you start doing. Claude Code CLI is Anthropic's official agentic coding tool, and it is the most direct way to experience AI code agents without writing any agent code yourself.

In Section 2, you will:

- Install Claude Code and authenticate with the Anthropic API
- Have your first productive conversation with Claude Code on a real codebase
- Learn how Claude Code manages context across a conversation session
- Master slash commands and workflow automation with CLAUDE.md
- Work effectively with files, git, and the project structure
- Develop effective prompting patterns specific to agentic coding tasks

By the end of Section 2, you will be using Claude Code productively on real development work. The skills from this section apply immediately — you can start using what you learn in your actual work before completing the course.

**What you will build in Section 2:** A workflow for using Claude Code on an existing open-source Python project — adding tests, fixing bugs, and implementing a small feature. You will have CLAUDE.md files that encode project context and custom workflows.

---

## Part 3: Section 3 — Agent API and SDK

Section 3 takes you behind the curtain. If Section 2 is using an agent, Section 3 is building one.

The Anthropic Messages API is the programmatic interface to Claude. Everything Claude Code does, it does through this API. In Section 3, you will learn the API directly: how to structure messages, how to define and use tools, how to build the agent loop in code, how to handle streaming, and how to deal with real production concerns like rate limits and error handling.

In Section 3, you will:

- Understand the Messages API request/response structure
- Define tools using JSON Schema and handle tool use in Python
- Build a complete agent loop from scratch
- Implement streaming for progressive response display
- Handle errors, retries, and rate limits correctly
- Manage multi-turn conversation state

**What you will build in Section 3:** A simple code review agent in Python. The agent accepts a file path as input, reads the file, identifies issues (style, potential bugs, missing error handling), and writes a structured review to a markdown file. Pure Python, no frameworks.

---

## Part 4: Section 4 — MCP and Tool Use

Section 4 is about the ecosystem. The Model Context Protocol (MCP) is Anthropic's open standard for connecting AI models to external tools and data sources. Understanding MCP allows you to plug Claude into any tool that has an MCP server — and to build your own custom MCP servers for tools that do not.

In Section 4, you will:

- Understand what MCP is and the problem it solves compared to raw function calling
- Learn the MCP architecture: clients, servers, and transports
- Use the built-in tools that Claude Code provides
- Build a custom MCP server using the TypeScript SDK
- Work with MCP resources (read-only data) and prompt templates
- Test MCP servers using the MCP Inspector
- Understand production deployment and monitoring concerns for MCP servers

**What you will build in Section 4:** A custom MCP server that exposes your internal project tooling — running specific test suites, checking code metrics, or querying project-specific data — to Claude. Any Claude Code session in your project will have access to these tools automatically.

---

## Part 5: Section 5 — Real-World Projects

Section 5 is the integration. You take everything from Sections 2-4 and build five complete, production-quality projects that demonstrate the full range of what AI code agents can do.

The projects are:

**Project 1: Code Review Agent** — An agent that reviews pull requests. Given a git diff or file list, the agent checks for style issues, potential bugs, missing error handling, security concerns, and documentation gaps. Outputs a structured review in the format your team uses.

**Project 2: Test Generation Agent** — An agent that reads source code and generates a comprehensive test suite. It identifies public interfaces, edge cases, error conditions, and integration points, then writes tests using your project's testing framework.

**Project 3: Documentation Agent** — An agent that reads code and generates or updates documentation: docstrings, README files, API documentation, architecture diagrams (as Mermaid markdown).

**Project 4: Refactoring Agent** — An agent that identifies code smells and performs targeted refactoring: extracting functions, simplifying complex conditionals, removing duplication, improving naming.

**Project 5: Multi-Agent Pipeline** — An orchestration of the previous four agents in a CI/CD pipeline. When a PR is opened, the review agent runs. If approved, the test generation and documentation agents run. The result is a fully AI-augmented code review and documentation workflow.

Lesson 38 covers deploying and monitoring these agents in production. Lesson 39 is the capstone: a review of everything you have built, advanced resources, and a roadmap for continuing your AI agent journey.

---

## Key Takeaways

- Section 1 (this section) built the conceptual foundation — the mental model, mechanics, and safety framework
- Section 2 applies that foundation through Claude Code CLI — practical agentic development without writing agent code
- Section 3 goes behind the curtain — building agents from scratch using the Messages API
- Section 4 extends to the ecosystem — MCP for standardized tool integration and custom server development
- Section 5 integrates everything into five real-world projects and a production-ready pipeline

---

## Prerequisites Check

Before proceeding to Section 2, verify you have:

- Python 3.9+ installed and working (`python --version`)
- Node.js 18+ installed (`node --version`) — required for Claude Code CLI
- A code editor (VS Code recommended, but any works)
- An Anthropic API account (go to console.anthropic.com to create one if needed)
- Basic git workflow familiarity (commit, branch, push)
- A project to work on — either an existing codebase or the sample project provided in Section 2

If any of these are missing, set them up before continuing. Section 2 starts with installation, but having these in place before the first lesson will let you focus on the concepts rather than setup.

---

Next Lesson: In **Lesson 9: Installing Claude Code**, you will install Claude Code CLI, authenticate with the Anthropic API, and run your first agentic coding session.

---

[Back to Section Overview](./README.md) | [Next Section: Claude Code CLI →](../02-claude-code-cli/README.md)
