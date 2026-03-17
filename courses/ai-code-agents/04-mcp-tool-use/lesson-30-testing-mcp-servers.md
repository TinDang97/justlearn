# Lesson 30: Testing MCP Servers

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Use the MCP Inspector to interactively test a server
- Write unit tests for individual tool handlers
- Write integration tests using a mock MCP client
- Set up a test harness that runs before deployment

---

## Prerequisites

- Lessons 28-29 of this section

---

## Part 1: The MCP Inspector

The MCP Inspector is an official Anthropic tool for interactively testing MCP servers. It provides a web UI where you can connect to a server, browse its tools/resources/prompts, and call them manually.

Install and run:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This starts a local web server (typically on port 5173) and opens the Inspector UI in your browser. The Inspector shows:

- **Connection status:** Whether the server started successfully and the initialization handshake completed
- **Tools tab:** All tools with their descriptions and input schemas — click any tool to invoke it with custom arguments
- **Resources tab:** All resources — click to read them
- **Prompts tab:** All prompts — click to preview the generated messages

The Inspector is invaluable during development:
- Verify your tool definitions look correct before connecting to Claude Code
- Test tool execution interactively without writing test code
- Debug input schema issues (try invoking with various argument combinations)
- Verify error handling (invoke with invalid inputs, check the error response)

If your server crashes on startup, the Inspector shows the error output immediately rather than the cryptic "MCP server failed to start" message you would get from Claude Code.

---

## Part 2: Unit Testing Tool Handlers

Extract tool handler logic into pure functions that can be unit tested independently of the MCP server framework:

```typescript
// src/tools/run-tests.ts
import { execSync } from "child_process";

export interface RunTestsArgs {
  pattern?: string;
  verbose?: boolean;
}

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export function runTestsTool(args: RunTestsArgs, projectRoot: string): ToolResult {
  const pattern = args.pattern ?? "";
  const verboseFlag = args.verbose ? "-v" : "-q";
  const cmd = `cd ${projectRoot} && python -m pytest ${pattern} ${verboseFlag} --tb=short 2>&1`;

  try {
    const output = execSync(cmd, { timeout: 120_000 }).toString();
    return { content: [{ type: "text", text: output }] };
  } catch (error: any) {
    // Non-zero exit from pytest means test failures — still a valid result
    const output = error.stdout?.toString() || error.message;
    return { content: [{ type: "text", text: output }] };
  }
}
```

```typescript
// src/index.ts — use the extracted function
import { runTestsTool } from "./tools/run-tests.js";

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "run_tests") {
    return runTestsTool(args as RunTestsArgs, PROJECT_ROOT);
  }
  throw new Error(`Unknown tool: ${name}`);
});
```

Now write unit tests using Jest or Vitest:

```typescript
// tests/tools/run-tests.test.ts
import { runTestsTool } from "../../src/tools/run-tests";
import { execSync } from "child_process";

jest.mock("child_process");
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe("runTestsTool", () => {
  const PROJECT_ROOT = "/fake/project";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns test output on success", () => {
    mockExecSync.mockReturnValue("3 passed in 0.5s" as any);

    const result = runTestsTool({}, PROJECT_ROOT);

    expect(result.content[0].text).toContain("3 passed");
    expect(result.isError).toBeUndefined();
  });

  it("returns test failures as text content, not error", () => {
    const error: any = new Error("Process exited with code 1");
    error.stdout = Buffer.from("2 passed, 1 failed in 0.5s");
    mockExecSync.mockImplementation(() => { throw error; });

    const result = runTestsTool({}, PROJECT_ROOT);

    expect(result.content[0].text).toContain("1 failed");
    expect(result.isError).toBeUndefined(); // Still a valid result
  });

  it("passes the pattern argument to pytest", () => {
    mockExecSync.mockReturnValue("1 passed" as any);

    runTestsTool({ pattern: "tests/test_auth.py" }, PROJECT_ROOT);

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("tests/test_auth.py"),
      expect.any(Object)
    );
  });

  it("uses verbose flag when requested", () => {
    mockExecSync.mockReturnValue("verbose output" as any);

    runTestsTool({ verbose: true }, PROJECT_ROOT);

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("-v"),
      expect.any(Object)
    );
  });
});
```

---

## Part 3: Integration Testing with a Mock Client

For integration tests, use the MCP SDK's in-process client to test the full server without needing stdio:

```typescript
// tests/integration/server.test.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  InMemoryTransport,
} from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js"; // Export your server creation

describe("MCP Server Integration", () => {
  let server: Server;
  let client: Client;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    server = createServer();
    client = new Client({ name: "test-client", version: "1.0.0" }, {});

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it("lists expected tools", async () => {
    const { tools } = await client.listTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain("run_tests");
    expect(toolNames).toContain("check_coverage");
    expect(toolNames).toContain("get_project_structure");
  });

  it("run_tests tool returns text content", async () => {
    const result = await client.callTool({
      name: "run_tests",
      arguments: { pattern: "" },
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(typeof (result.content[0] as any).text).toBe("string");
  });

  it("calling unknown tool throws an error", async () => {
    await expect(
      client.callTool({ name: "nonexistent_tool", arguments: {} })
    ).rejects.toThrow();
  });
});
```

---

## Part 4: Pre-Deployment Test Checklist

Before deploying or sharing an MCP server, run this checklist:

```bash
#!/bin/bash
# test-mcp-server.sh

echo "=== MCP Server Pre-Deployment Tests ==="

echo "1. Building TypeScript..."
npm run build || { echo "FAIL: Build failed"; exit 1; }
echo "OK"

echo "2. Running unit tests..."
npm test -- --testPathPattern="tests/tools" || { echo "FAIL: Unit tests failed"; exit 1; }
echo "OK"

echo "3. Running integration tests..."
npm test -- --testPathPattern="tests/integration" || { echo "FAIL: Integration tests failed"; exit 1; }
echo "OK"

echo "4. Checking server starts without error..."
timeout 3 node dist/index.js 2>&1 | head -5
# Should show "MCP server running on stdio" in stderr within 3 seconds
echo "OK"

echo "5. Verifying tool list via Inspector (manual step)..."
echo "   Run: npx @modelcontextprotocol/inspector node dist/index.js"
echo "   Verify all expected tools appear in the Tools tab"

echo "=== All automated tests passed ==="
```

---

## Key Takeaways

- MCP Inspector: interactive web UI for testing servers; reveals startup errors, wrong schemas, and unexpected behavior quickly
- Extract tool logic into pure functions for unit testing; mock `execSync` and file system calls
- Integration tests use `InMemoryTransport.createLinkedPair()` for in-process client-server testing
- Pre-deployment checklist: build, unit tests, integration tests, start verification, manual Inspector check

---

## Common Mistakes to Avoid

**Testing only the happy path.** Tool handlers need to handle invalid inputs, missing files, command failures, and timeout errors. Test all of these.

**Not extracting testable functions.** If all your tool logic is inline in the request handler, you cannot unit test it without a full MCP server. Extract logic into functions first.

**Skipping the Inspector.** The Inspector reveals schema errors and description quality issues that unit tests do not catch. Always run it before connecting to Claude Code.

---

Next Lesson: In **Lesson 31: MCP in Production**, we cover deploying MCP servers in production environments — security, versioning, monitoring, and the architectural decisions that matter at scale.

---

[Back to Section Overview](./README.md) | [Next Lesson: MCP in Production →](./lesson-31-mcp-in-production.md)
