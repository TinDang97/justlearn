# Section 4: MCP and Tool Use

**Level:** Intermediate
**Duration:** 8 lessons x 40-50 minutes = ~6 hours total
**Prerequisites:** Section 3 complete; TypeScript/Node.js familiarity helpful

---

## Section Overview

The Model Context Protocol (MCP) is an open standard from Anthropic that defines how AI models connect to external tools and data sources. Instead of hardcoding tool definitions inside your agent, MCP lets you build reusable tool servers that any MCP-compatible client (Claude Code, Claude.ai, your own agents) can connect to.

This section covers MCP from first principles to production deployment. You will build a custom MCP server that exposes project-specific tools to Claude.

---

## Lesson List

| # | Title | Key Topics | Duration |
|---|-------|------------|----------|
| 25 | What is MCP? | Problem it solves, comparison to raw function calling | 35 min |
| 26 | MCP Architecture | Clients, servers, transports (stdio, SSE), protocol lifecycle | 45 min |
| 27 | Built-in Tools | Filesystem, bash, text editor tools in Claude Code | 40 min |
| 28 | Building Custom MCP Servers | TypeScript MCP SDK, server setup, tool handlers | 50 min |
| 29 | Resources and Prompts | MCP resources (read-only data), prompt templates | 40 min |
| 30 | Testing MCP Servers | MCP Inspector, unit testing, integration testing | 45 min |
| 31 | MCP in Production | Deployment, security, versioning, monitoring | 45 min |
| 32 | Composing Tools | Multi-tool workflows, orchestration, multi-server setups | 45 min |

---

## What You Will Build

By the end of this section, you will have a working custom MCP server for a sample project — exposing tools like:
- `run_tests` — run specific test suites for the project
- `check_coverage` — check code coverage and report gaps
- `get_architecture_doc` — return the project's architecture documentation as context
- `query_database` — execute safe read-only queries against the development database

This server will be usable from Claude Code sessions automatically.

---

## After This Section

- **Section 5:** Real-World Projects — combine MCP, the API, and Claude Code into production-grade agent pipelines

---

[Back to Course Catalog](../README.md)
