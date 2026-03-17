# Lesson 28: Building Custom MCP Servers

**Course:** AI Code Agents | **Duration:** 50 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Set up a TypeScript MCP server project using the official SDK
- Define and implement tools with typed handlers
- Connect the server to Claude Code via stdio
- Handle tool request validation and error responses correctly

---

## Prerequisites

- Lessons 25-27 of this section
- Node.js 18+; basic TypeScript familiarity

---

## Part 1: Project Setup

Create a new Node.js project for your MCP server:

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
npx tsc --init
```

Update `tsconfig.json` for the MCP server use case:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Add build and start scripts to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  }
}
```

---

## Part 2: The Minimal MCP Server

Create `src/index.ts`:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create the server
const server = new Server(
  {
    name: "my-project-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define what tools are available
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hello_world",
        description: "A simple test tool that returns a greeting.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "hello_world") {
    const greeting = `Hello, ${args?.name ?? "world"}! This is your custom MCP server.`;
    return {
      content: [{ type: "text", text: greeting }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

Build and test:

```bash
npm run build
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"0.1.0","capabilities":{}}}' | node dist/index.js
```

---

## Part 3: Adding Useful Project Tools

Replace the placeholder tool with tools useful for a real project. Here is a server with three practical tools:

```typescript
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "run_tests",
        description:
          "Run the test suite for this project. Optionally target specific test files or patterns.",
        inputSchema: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
              description:
                "Optional test pattern or file path. Defaults to full suite.",
              default: "",
            },
            verbose: {
              type: "boolean",
              description: "Show verbose output",
              default: false,
            },
          },
          required: [],
        },
      },
      {
        name: "check_coverage",
        description: "Run tests with coverage and report which files have low coverage.",
        inputSchema: {
          type: "object",
          properties: {
            threshold: {
              type: "number",
              description: "Coverage percentage threshold to report below (0-100)",
              default: 80,
            },
          },
          required: [],
        },
      },
      {
        name: "get_project_structure",
        description: "Return the project directory structure (for orientation).",
        inputSchema: {
          type: "object",
          properties: {
            depth: {
              type: "number",
              description: "Directory depth to show",
              default: 3,
            },
          },
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "run_tests") {
    const pattern = (args?.pattern as string) || "";
    const verbose = (args?.verbose as boolean) ? "-v" : "-q";
    const cmd = `cd ${PROJECT_ROOT} && python -m pytest ${pattern} ${verbose} --tb=short 2>&1`;

    try {
      const output = execSync(cmd, { timeout: 120_000 }).toString();
      return { content: [{ type: "text", text: output }] };
    } catch (error: any) {
      // pytest exits with non-zero when tests fail — that is normal, not an error
      return {
        content: [{ type: "text", text: error.stdout?.toString() || error.message }],
      };
    }
  }

  if (name === "check_coverage") {
    const threshold = (args?.threshold as number) ?? 80;
    const cmd = `cd ${PROJECT_ROOT} && python -m pytest --cov=src --cov-report=term-missing --cov-fail-under=0 2>&1`;
    try {
      const output = execSync(cmd, { timeout: 180_000 }).toString();
      // Parse and filter to files below threshold
      const lines = output.split("\n");
      const belowThreshold = lines.filter((line) => {
        const match = line.match(/(\d+)%$/);
        return match && parseInt(match[1]) < threshold;
      });
      const result =
        belowThreshold.length > 0
          ? `Files below ${threshold}% coverage:\n${belowThreshold.join("\n")}`
          : `All files meet ${threshold}% coverage threshold.`;
      return { content: [{ type: "text", text: result }] };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Coverage check failed: ${error.message}` }],
      };
    }
  }

  if (name === "get_project_structure") {
    const depth = (args?.depth as number) ?? 3;
    const cmd = `find ${PROJECT_ROOT} -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/__pycache__/*" -not -path "*/.venv/*" -maxdepth ${depth} | sort`;
    const output = execSync(cmd).toString();
    return { content: [{ type: "text", text: output }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

---

## Part 4: Connecting to Claude Code

After building the server, register it in Claude Code's settings:

```json
// ~/.claude/settings.json (global) or .claude/settings.json (project-local)
{
  "mcpServers": {
    "my-project-tools": {
      "command": "node",
      "args": ["/absolute/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "/absolute/path/to/my-project"
      }
    }
  }
}
```

Restart Claude Code and verify the tools are available:

```
What tools do you have available? List them with brief descriptions.
```

Claude Code will list all tools including your custom ones.

---

## Key Takeaways

- MCP server structure: create `Server`, register `ListToolsRequestSchema` handler (tool discovery), register `CallToolRequestSchema` handler (tool execution)
- Tool results must return `{ content: [{ type: "text", text: string }] }`
- Errors from tool calls should be caught and returned as text content, not thrown as unhandled exceptions
- Register in Claude Code settings with the path to the compiled `dist/index.js`
- Use absolute paths in both the args and the `PROJECT_ROOT` env var — relative paths cause hard-to-debug issues

---

## Common Mistakes to Avoid

**Logging to stdout.** In stdio mode, stdout is the protocol channel. Any `console.log` to stdout corrupts the JSON-RPC stream. Use `console.error` for debugging output — stderr is not part of the protocol.

**Not building before testing.** TypeScript needs to be compiled. If you edit `src/index.ts` and test without running `npm run build`, you are testing the old compiled JavaScript.

**Using relative paths.** MCP servers can be started from any directory. Always use absolute paths or `process.env.PROJECT_ROOT` for file operations.

---

Next Lesson: In **Lesson 29: Resources and Prompts**, we learn about the other two MCP capability types — resources for read-only data and prompts for reusable templates — and how to expose them from your server.

---

[Back to Section Overview](./README.md) | [Next Lesson: Resources and Prompts →](./lesson-29-resources-and-prompts.md)
