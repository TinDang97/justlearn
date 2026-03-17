# Lesson 25: What is MCP?

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain the problem MCP solves that raw function calling does not
- Describe the key components of the MCP ecosystem
- Identify when to use MCP versus raw function calling
- List the major MCP server categories in the public ecosystem

---

## Prerequisites

- Section 3 complete (especially Lessons 19-20 on tool use)

---

## Part 1: The Tool Integration Problem

In Section 3, you built agents with custom tools by defining JSON Schema and wiring up Python functions. This works, but it has a scaling problem.

Consider the tools a comprehensive coding agent might need:
- Filesystem operations (read, write, search files)
- Git operations (commit, branch, diff, log)
- Package management (install, check versions)
- Database access (run queries, check schema)
- Documentation lookup (search docs, get API references)
- Code intelligence (go to definition, find references)
- Web access (fetch pages, search the web)
- External services (GitHub PRs, Jira tickets, Slack messages)

If each agent hardcodes its own implementations of these tools, you have:
- **Duplication:** Every agent reimplements file reading, git operations, etc.
- **Inconsistency:** Different agents implement the same tools differently
- **Maintenance burden:** Fix a bug in the file reading tool, fix it in 10 places
- **No reuse:** The tool implementation for Agent A cannot be used by Agent B without copying

This is the same problem that led to REST APIs, package managers, and microservices in software engineering: when many systems need the same functionality, you abstract it into a shared service.

**MCP is that shared service layer for AI tool integrations.**

---

## Part 2: What MCP Is

The Model Context Protocol (MCP) is an open protocol that standardizes how AI applications connect to external tools and data sources.

MCP defines:
- A standard wire format for tool descriptions, invocations, and results
- Standard transport mechanisms (stdio, HTTP with Server-Sent Events)
- Standard categories of capabilities: tools (actions), resources (read-only data), and prompts (reusable templates)
- A client-server architecture that separates the AI application from the tool implementations

The analogy that Anthropic uses: MCP is like USB-C for AI integrations. Just as USB-C provides a standard interface so you can plug any device into any port, MCP provides a standard interface so any AI application can use any MCP-compatible tool.

**Key components:**
- **MCP Server:** A program that exposes tools, resources, and prompts via the MCP protocol
- **MCP Client:** An AI application (Claude Code, Claude.ai, your custom agent) that connects to MCP servers and uses their capabilities
- **MCP Transport:** The communication mechanism (stdio or HTTP SSE) that carries the protocol messages between client and server

---

## Part 3: MCP vs Raw Function Calling

Both approaches let an AI agent call tools. The difference is in where the tool logic lives and how it is shared.

| Aspect | Raw Function Calling | MCP |
|--------|---------------------|-----|
| Tool definition | Inside the agent code | In a separate server |
| Reuse across agents | Copy-paste | Connect to the same server |
| Language | Same language as agent | Any language (the protocol is language-agnostic) |
| Sharing | Not shareable (internal) | Shareable (public/private servers) |
| Versioning | Ad hoc | Protocol-defined |
| Discovery | Manual | Can be discovered at runtime |

**Use raw function calling when:**
- The tool is specific to this agent and will not be reused
- You are prototyping and want minimal setup
- The agent and the tool must share process memory (e.g., tool modifies in-memory state)

**Use MCP when:**
- The tool should be usable by multiple different agents or AI applications
- You want to build a library of reusable tools
- You want to use existing public MCP servers (file system, web, databases)
- The tool implementation needs to be maintained independently from the agent

---

## Part 4: The Public MCP Ecosystem

One of MCP's most valuable properties is the growing ecosystem of publicly available servers. Because the protocol is standardized, servers built by one team can be used by any MCP-compatible client.

Major categories of public MCP servers:

**Development tools:**
- `filesystem` — Read, write, search local files (official Anthropic)
- `git` — Git operations: log, diff, branch, commit
- `github` — GitHub API: issues, PRs, repositories, gists
- `gitlab` — GitLab API equivalent
- Editors: `neovim`, VS Code integration servers

**Data sources:**
- Database servers: `postgres`, `sqlite`, `mysql`
- `brave-search` — Web search via Brave Search API
- `fetch` — Fetch and transform web content
- Cloud storage: `s3`, Google Cloud Storage

**Communication:**
- `slack` — Read/post Slack messages
- `gmail` — Read/compose Gmail

**Productivity:**
- `notion` — Read/write Notion pages
- `linear` — Linear issue tracking
- `jira` — Jira issue tracking

When you configure Claude Code to use these public servers, you get all these capabilities for free — no custom code required.

---

## Key Takeaways

- MCP solves the tool integration duplication problem: instead of each agent reimplementing common tools, tools are built once as shared MCP servers
- MCP defines a standard protocol for tool invocation, resource access, and prompt templates
- Raw function calling: tool logic lives inside the agent (good for prototyping, agent-specific tools); MCP: tool logic lives in a separate server (good for reuse and sharing)
- A growing ecosystem of public MCP servers covers development tools, databases, communication, and productivity

---

## Common Mistakes to Avoid

**Using MCP for everything.** MCP adds setup overhead. For a quick script with one or two tools, raw function calling is simpler. Use MCP when reuse and sharing are genuine requirements.

**Thinking MCP requires rewriting existing agents.** MCP is additive. Your existing agents continue to work. You adopt MCP for new tools that you want to share, while keeping existing agent-specific tools as they are.

---

Next Lesson: In **Lesson 26: MCP Architecture**, we look at the technical architecture of MCP in detail — how clients and servers communicate, what the protocol lifecycle looks like, and how the two transport mechanisms (stdio and HTTP SSE) work.

---

[Back to Section Overview](./README.md) | [Next Lesson: MCP Architecture →](./lesson-26-mcp-architecture.md)
