# Lesson 26: MCP Architecture

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Describe the client-server architecture of MCP
- Explain the two transport mechanisms: stdio and HTTP SSE
- Trace the protocol lifecycle from connection to tool call
- Configure Claude Code to connect to an MCP server

---

## Prerequisites

- Lesson 25: What is MCP?

---

## Part 1: The Client-Server Architecture

MCP uses a client-server architecture. The separation of concerns is clear:

**MCP Server:**
- Implements the actual tool logic (e.g., reads files, queries a database)
- Exposes a list of tools, resources, and prompts
- Executes tool calls when requested and returns results
- Is a standalone process (or service) that runs independently of the AI application

**MCP Client:**
- The AI application or framework (Claude Code, Claude.ai, your custom agent)
- Connects to one or more MCP servers at startup
- Discovers what tools, resources, and prompts each server provides
- Routes tool requests from the AI model to the appropriate server
- Returns tool results to the AI model

**The Protocol:**
- JSON-RPC 2.0 — the standard request/response format used in MCP messages
- Both client and server speak the same protocol; the transport layer carries the messages

A single Claude Code session can connect to multiple MCP servers simultaneously. You might have:
- The built-in filesystem server
- A custom project-specific server with your internal tools
- A public GitHub server for repository operations

The AI model sees all tools from all connected servers in its unified tool set.

---

## Part 2: stdio Transport

The stdio (standard input/output) transport is the simplest and most common MCP transport for local development. The MCP server runs as a child process, and the client communicates with it by writing JSON-RPC messages to the process's stdin and reading responses from stdout.

Schematically:
```
MCP Client → [JSON-RPC message] → Server's stdin
MCP Client ← [JSON-RPC response] ← Server's stdout
```

**Advantages of stdio:**
- Simple setup: just launch a process
- No networking required: secure by default
- Works on any OS without firewall configuration
- The server lifecycle is tied to the client: when the client exits, the server exits

**Disadvantages of stdio:**
- Single-client only: one client per server process
- No remote deployment: client and server must run on the same machine
- Process management: the client is responsible for launching the server

For Claude Code, stdio servers are configured in the Claude Code settings file (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "my-project-tools": {
      "command": "node",
      "args": ["/path/to/my-project/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/myproject"
      }
    }
  }
}
```

When Claude Code starts, it launches the configured server processes and establishes stdio connections.

---

## Part 3: HTTP SSE Transport

The HTTP SSE (Server-Sent Events) transport uses HTTP for communication. The client connects to the server over HTTP; the server sends events using the SSE protocol.

```
MCP Client → POST /message → Server (tool calls, queries)
MCP Client ← GET /sse ← Server (streaming events, results)
```

**Advantages of HTTP SSE:**
- Multiple clients can connect to one server
- Remote deployment: server can run on a different machine or cloud
- Standard web infrastructure: load balancers, firewalls, TLS all work normally
- Language-agnostic: any server that speaks HTTP can implement MCP

**Disadvantages of HTTP SSE:**
- More complex setup than stdio
- Network security considerations
- The server runs as a long-lived service (not tied to client lifecycle)

SSE servers are configured with a URL instead of a command:

```json
{
  "mcpServers": {
    "remote-tools": {
      "url": "http://tools.internal.company.com:8080/sse"
    }
  }
}
```

---

## Part 4: The Protocol Lifecycle

From connection to tool call, the MCP protocol goes through these phases:

**1. Initialization:**
Client sends `initialize` with its capabilities and protocol version. Server responds with its capabilities and protocol version. They negotiate the feature set.

```json
// Client → Server
{"jsonrpc": "2.0", "id": 1, "method": "initialize",
 "params": {"protocolVersion": "0.1.0", "capabilities": {}}}

// Server → Client
{"jsonrpc": "2.0", "id": 1, "result":
 {"protocolVersion": "0.1.0", "capabilities": {"tools": {}}, "serverInfo": {"name": "my-tools"}}}
```

**2. Discovery:**
Client sends `tools/list` (and optionally `resources/list`, `prompts/list`) to discover what the server provides.

```json
// Client → Server
{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}

// Server → Client
{"jsonrpc": "2.0", "id": 2, "result":
 {"tools": [{"name": "run_tests", "description": "...", "inputSchema": {...}}]}}
```

**3. Tool Call:**
When the AI model requests a tool, the client sends `tools/call` to the server.

```json
// Client → Server
{"jsonrpc": "2.0", "id": 3, "method": "tools/call",
 "params": {"name": "run_tests", "arguments": {"pattern": "tests/test_auth.py"}}}

// Server → Client
{"jsonrpc": "2.0", "id": 3, "result":
 {"content": [{"type": "text", "text": "3 tests passed, 0 failed"}]}}
```

**4. Shutdown:**
Client sends a termination signal (stdio: closes stdin; SSE: closes connection). Server cleans up and exits.

---

## Part 5: Configuring Claude Code to Use MCP Servers

Claude Code's MCP configuration lives in `~/.claude/settings.json` (global) or `.claude/settings.json` (project-local). Project-local configuration overrides global for servers with the same name.

**Adding a public server (filesystem):**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
```

**Adding multiple servers:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."}
    },
    "project-tools": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"]
    }
  }
}
```

After adding servers, restart Claude Code to pick up the new configuration. In a session, you can verify tools are available by asking: "What tools do you have available?"

---

## Key Takeaways

- MCP is client-server: the server implements tools; the client (Claude Code, your agent) connects and uses them
- Two transports: stdio (local, simple, single-client) and HTTP SSE (remote, multi-client, network-accessible)
- Protocol lifecycle: initialize → discover (tools/list) → use (tools/call) → shutdown
- Claude Code MCP config lives in `~/.claude/settings.json` or project-local `.claude/settings.json`
- JSON-RPC 2.0 is the message format; the protocol is language-agnostic

---

## Common Mistakes to Avoid

**Confusing stdio with HTTP.** stdio is for local development (server runs as a subprocess). HTTP SSE is for remote or multi-client scenarios. Most initial development uses stdio.

**Not restarting Claude Code after adding MCP servers.** The server list is loaded at startup. Adding a server to settings.json takes effect on the next Claude Code session.

---

Next Lesson: In **Lesson 27: Built-in Tools**, we explore the tools that Claude Code provides out of the box — the file system, bash, and text editor tools — and understand how they are implemented as MCP tools under the hood.

---

[Back to Section Overview](./README.md) | [Next Lesson: Built-in Tools →](./lesson-27-built-in-tools.md)
