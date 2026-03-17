# Lesson 29: Resources and Prompts

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain the difference between MCP tools, resources, and prompts
- Implement resources in a custom MCP server to expose read-only data
- Implement prompt templates for reusable AI workflows
- Choose between resources and tools for a given use case

---

## Prerequisites

- Lesson 28: Building Custom MCP Servers

---

## Part 1: The Three MCP Capability Types

MCP defines three categories of capabilities:

**Tools** (covered in Lessons 27-28): Actions the AI can take. Tools have side effects — they run commands, write files, call APIs, modify state. The model calls a tool when it needs to do something.

**Resources**: Read-only data sources. Resources expose structured data that the AI can retrieve and use as context. They do not modify state. Resources are like the "GET" endpoints in a REST API — you can read them, but not change them through the resource interface.

**Prompts**: Reusable prompt templates that can be invoked by the user or the AI. Prompts are parameterized message sequences that encode recurring workflows. They are like macro templates — fill in the parameters and get back a set of messages ready to send to the model.

---

## Part 2: Implementing Resources

Resources expose data identified by a URI. The client reads resources by requesting specific URIs from the server.

A resource has:
- `uri` — A unique identifier (typically `scheme://path/to/resource`)
- `name` — Human-readable name
- `description` — What the resource contains
- `mimeType` — The content type of the resource (usually `text/plain` or `application/json`)

Add resource capability to your MCP server:

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Update server capabilities to include resources
const server = new Server(
  { name: "my-project-tools", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "project://architecture",
        name: "Architecture Documentation",
        description: "High-level architecture overview of this project",
        mimeType: "text/plain",
      },
      {
        uri: "project://api-schema",
        name: "API Schema",
        description: "OpenAPI specification for the project's REST API",
        mimeType: "application/json",
      },
      {
        uri: "project://test-results/latest",
        name: "Latest Test Results",
        description: "Results from the most recent test run",
        mimeType: "text/plain",
      },
    ],
  };
});

// Read a specific resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "project://architecture") {
    const archDoc = fs.readFileSync(
      path.join(PROJECT_ROOT, "docs/architecture.md"),
      "utf-8"
    );
    return {
      contents: [{ uri, mimeType: "text/plain", text: archDoc }],
    };
  }

  if (uri === "project://api-schema") {
    const schema = fs.readFileSync(
      path.join(PROJECT_ROOT, "openapi.json"),
      "utf-8"
    );
    return {
      contents: [{ uri, mimeType: "application/json", text: schema }],
    };
  }

  if (uri === "project://test-results/latest") {
    const resultsFile = path.join(PROJECT_ROOT, ".test-results/latest.txt");
    if (fs.existsSync(resultsFile)) {
      const results = fs.readFileSync(resultsFile, "utf-8");
      return { contents: [{ uri, mimeType: "text/plain", text: results }] };
    }
    return {
      contents: [{ uri, mimeType: "text/plain", text: "No test results found." }],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

**When to use resources vs tools:**

| Use Case | Resource | Tool |
|----------|----------|------|
| Read documentation | Yes | No |
| Read configuration | Yes | No |
| Read cached test results | Yes | No |
| Run tests and get fresh results | No | Yes |
| Read a database (live query) | Either | Either |
| Write to a database | No | Yes |

Resources are semantically "this data exists and you can read it." Tools are semantically "do this action and tell me the result."

---

## Part 3: Implementing Prompt Templates

Prompts are reusable message sequences. They are useful when you have a recurring AI workflow that you want to invoke consistently.

```typescript
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Update capabilities
const server = new Server(
  { name: "my-project-tools", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "code_review",
        description: "Start a code review session for a specific file",
        arguments: [
          {
            name: "file_path",
            description: "Path to the file to review",
            required: true,
          },
          {
            name: "review_type",
            description: "Type of review: security, performance, or general",
            required: false,
          },
        ],
      },
      {
        name: "implement_feature",
        description: "Start a feature implementation session with standard workflow",
        arguments: [
          {
            name: "feature_description",
            description: "Description of the feature to implement",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "code_review") {
    const filePath = args?.file_path ?? "the specified file";
    const reviewType = args?.review_type ?? "general";

    return {
      description: `Code review session for ${filePath}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please perform a ${reviewType} code review of ${filePath}.

For this review:
1. Read the file carefully
2. Run the linter if applicable
3. Check for:
   - ${reviewType === "security" ? "Input validation, injection vulnerabilities, authentication issues, secrets in code" : ""}
   - ${reviewType === "performance" ? "N+1 queries, unnecessary computation, blocking I/O, memory leaks" : ""}
   - ${reviewType === "general" ? "Correctness, error handling, readability, test coverage" : ""}
4. Write a structured review with specific line references

Begin when ready.`,
          },
        },
      ],
    };
  }

  if (name === "implement_feature") {
    const description = args?.feature_description ?? "the described feature";
    return {
      description: `Feature implementation: ${description}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Implement the following feature: ${description}

Follow this workflow:
1. Explore the relevant parts of the codebase
2. Propose an implementation plan (list files to create/modify)
3. Wait for confirmation before coding
4. Implement step by step, running tests after each major change
5. Ensure all tests pass before declaring done`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});
```

---

## Key Takeaways

- Three MCP capability types: tools (actions with side effects), resources (read-only data sources), prompts (reusable message templates)
- Resources have URIs; clients read them via `ReadResource`; use them for documentation, config, cached data
- Prompts return pre-built message sequences that can be invoked with parameters
- Resources for "data that exists"; tools for "action that produces a result" — when the line is blurry, either works

---

## Common Mistakes to Avoid

**Making resources mutable.** Resources should be read-only. If a resource URI needs to support writes, it should be a tool, not a resource. The semantic clarity matters for how clients present these capabilities to users.

**Overloading prompts with too much logic.** Prompts are templates, not programs. If your prompt needs conditional logic, branching, or computation, implement a tool instead.

---

Next Lesson: In **Lesson 30: Testing MCP Servers**, we learn how to test custom MCP servers using the MCP Inspector and how to write unit tests for tool handlers.

---

[Back to Section Overview](./README.md) | [Next Lesson: Testing MCP Servers →](./lesson-30-testing-mcp-servers.md)
