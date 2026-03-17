# Section 3: Agent API and SDK

**Level:** Intermediate
**Duration:** 8 lessons x 40-50 minutes = ~6 hours total
**Prerequisites:** Section 1 complete; Python 3.9+; basic familiarity with HTTP/REST APIs

---

## Section Overview

This section takes you from using Claude Code to building agents programmatically. The Anthropic Messages API is the core interface for interacting with Claude — everything Claude Code does, it does through this API.

Building agents from scratch gives you full control: custom tools, custom prompts, custom error handling, and deployment in your own infrastructure. The skills in this section are foundational for Section 4 (MCP) and Section 5 (real-world projects).

---

## Lesson List

| # | Title | Key Topics | Duration |
|---|-------|------------|----------|
| 17 | What is the Agent API? | API vs CLI, programmatic access, architecture overview | 35 min |
| 18 | Authentication and Setup | API keys, Python SDK installation, environment configuration | 40 min |
| 19 | Messages API Fundamentals | Request/response structure, roles, content blocks, model selection | 45 min |
| 20 | Tool Use with the API | JSON Schema tool definitions, tool_use and tool_result blocks | 50 min |
| 21 | Building an Agent Loop | The while-loop pattern, stop_reason handling, iteration | 50 min |
| 22 | Streaming Responses | Server-sent events, streaming SDK, progressive display | 45 min |
| 23 | Error Handling and Retries | Rate limits, overloaded errors, exponential backoff | 40 min |
| 24 | Multi-Turn Conversations | State management, message history, context pruning | 45 min |

---

## What You Will Build

The capstone of this section is a simple **code review agent** in Python:

- Accepts a Python file path as input
- Reads the file using a `read_file` tool
- Reviews it for: style issues, potential bugs, missing error handling
- Writes a structured review to a markdown file using a `write_file` tool
- Runs as a standalone Python script with no frameworks

This project uses every concept from this section and produces something immediately useful for real work.

---

## What You Will Learn

By the end of this section, you will be able to:

- Make authenticated requests to the Anthropic Messages API
- Structure multi-turn conversations with the correct message format
- Define tools with JSON Schema and handle tool call/result cycles
- Implement a complete agent loop in Python
- Stream responses and display them progressively
- Handle errors, rate limits, and retries correctly

---

## After This Section

- **Section 4:** MCP — extend your agents with the standardized tool ecosystem
- **Section 5:** Real-World Projects — use the API patterns to build production-grade agents

---

[Back to Course Catalog](../README.md)
