# Lesson 31: MCP in Production

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Choose between stdio and HTTP SSE deployment patterns for production
- Implement authentication for an HTTP SSE MCP server
- Apply rate limiting and monitoring to MCP server deployments
- Plan a versioning strategy for MCP server APIs

---

## Prerequisites

- Lessons 28-30 of this section

---

## Part 1: Deployment Patterns

The two transport mechanisms (stdio and HTTP SSE) imply different deployment patterns:

**stdio deployment** is appropriate when:
- The server is used by a single developer (or single Claude Code session)
- The server needs access to local development resources (local files, local database)
- You want zero network attack surface
- The server lifecycle should match the client lifecycle

In this pattern, the MCP server is a binary on the developer's machine, configured in their Claude Code settings. Each session starts the server as a subprocess.

**HTTP SSE deployment** is appropriate when:
- Multiple users or agents need to share the same server
- The server provides access to shared resources (shared database, internal API, company knowledge base)
- The server needs to run on specialized infrastructure (GPU, VPC, specific security zone)
- You want centralized monitoring and logging

In this pattern, the MCP server is a long-running service — like a microservice — deployed to your infrastructure.

---

## Part 2: HTTP SSE Server Structure

The MCP TypeScript SDK supports HTTP SSE transport:

```typescript
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();
app.use(express.json());

// Store active transports keyed by session ID
const transports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
  // Authenticate the request
  const authHeader = req.headers.authorization;
  if (!authHeader || !isValidToken(authHeader)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const transport = new SSEServerTransport("/message", res);
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);

  const server = createMCPServer(); // Create a new server per session
  await server.connect(transport);

  // Clean up on disconnect
  res.on("close", () => {
    transports.delete(sessionId);
  });
});

app.post("/message", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string;
  const transport = transports.get(sessionId);

  if (!transport) {
    return res.status(404).json({ error: "Session not found" });
  }

  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});

function isValidToken(authHeader: string): boolean {
  const token = authHeader.replace("Bearer ", "");
  return token === process.env.MCP_API_KEY;
}
```

---

## Part 3: Security Considerations

MCP servers that expose sensitive operations need careful security design:

**Authentication:** Every HTTP request to the SSE server should be authenticated. The simplest approach is a pre-shared API key via the `Authorization: Bearer <key>` header. For multi-user scenarios, use proper OAuth or API key management with per-user keys.

**Authorization:** Not all users should have access to all tools. Implement tool-level authorization:

```typescript
function getUserPermissions(token: string): Set<string> {
  // Look up what tools this user/token is allowed to call
  const permissions = TOKEN_PERMISSIONS[token] ?? new Set<string>();
  return permissions;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const permissions = getUserPermissions(currentSessionToken);

  if (!permissions.has(name)) {
    return {
      content: [{ type: "text", text: `Permission denied: tool ${name} not authorized` }],
      isError: true,
    };
  }

  // ... tool execution
});
```

**Input validation:** Validate tool arguments before passing them to handlers. JSON Schema validation catches type errors, but you also need semantic validation:

```typescript
function validateFilePath(path: string, projectRoot: string): string {
  const resolved = require("path").resolve(projectRoot, path);
  if (!resolved.startsWith(projectRoot)) {
    throw new Error(`Path traversal detected: ${path}`);
  }
  return resolved;
}
```

**Rate limiting:** Implement per-client rate limiting to prevent abuse:

```typescript
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string, limit: number = 60): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(clientId) ?? { count: 0, resetAt: now + 60_000 };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }

  entry.count++;
  rateLimiter.set(clientId, entry);
  return entry.count <= limit;
}
```

---

## Part 4: Versioning

MCP servers evolve over time. Tools get added, changed, or removed. Plan for this from the start:

**Semantic versioning for the server:** Use semver in your server's `version` field. Major version changes indicate breaking changes to existing tools.

**Backwards compatibility:** When modifying a tool, prefer additive changes (new optional arguments) over breaking changes (removing arguments, changing argument types). Breaking changes require a new tool name or major version bump.

**Deprecation notices in descriptions:** When phasing out a tool, update its description to indicate deprecation:

```typescript
{
  name: "run_tests_v1",
  description: "[DEPRECATED: Use run_tests_v2] Run tests...",
  // ...
}
```

**Version in tool names (when necessary):** For tools with breaking changes, use versioned names:
- `run_tests` → stable, backwards-compatible
- `run_tests_v2` → new version with different interface
- `run_tests` (deprecated) → eventually removed

---

## Part 5: Monitoring and Observability

For production MCP servers, implement structured logging and metrics:

```typescript
import { createLogger } from "./logger.js";

const logger = createLogger("mcp-server");

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  logger.info("tool_call_start", {
    tool: name,
    argsKeys: Object.keys(args ?? {}),
  });

  try {
    const result = await dispatchTool(name, args);
    const durationMs = Date.now() - startTime;

    logger.info("tool_call_success", {
      tool: name,
      durationMs,
      resultSize: JSON.stringify(result).length,
    });

    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.error("tool_call_error", {
      tool: name,
      durationMs,
      error: error.message,
    });

    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});
```

Key metrics to track:
- Tool call latency (p50, p95, p99)
- Tool call error rate per tool
- Rate limit violations
- Active session count (for SSE servers)
- Request count per client

---

## Key Takeaways

- stdio: single-user local deployment; HTTP SSE: multi-user shared service deployment
- Every HTTP SSE server needs authentication (Bearer token at minimum)
- Implement authorization at tool level, not just at connection level
- Validate inputs beyond JSON Schema: check for path traversal, command injection, range violations
- Use semver, prefer additive changes, use deprecation notices for backwards compatibility
- Log every tool call with timing and result size; track error rates per tool

---

## Common Mistakes to Avoid

**No authentication on HTTP SSE servers.** An unauthenticated MCP server that can run shell commands is a backdoor. Always authenticate.

**Not validating file paths.** A tool that reads arbitrary file paths without validation is vulnerable to path traversal attacks (`../../etc/passwd`). Always resolve and check against the project root.

**Changing tool interfaces without versioning.** Changing argument types or removing required arguments breaks existing Claude Code sessions that have cached the tool list. Use versioned names for breaking changes.

---

Next Lesson: In **Lesson 32: Composing Tools**, we learn how to orchestrate multiple tools in complex workflows, chain tool outputs into tool inputs, and work with multiple MCP servers simultaneously.

---

[Back to Section Overview](./README.md) | [Next Lesson: Composing Tools →](./lesson-32-composing-tools.md)
