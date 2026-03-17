# Lesson 17: What is the Agent API?

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain the relationship between Claude Code CLI and the Messages API
- Identify when to use the API versus Claude Code CLI
- Describe the high-level architecture of a Claude-powered agent application
- List the key capabilities available through the API

---

## Prerequisites

- Section 1 and Section 2 complete
- Basic understanding of HTTP REST APIs (what a request and response are)

---

## Part 1: Claude Code CLI vs Messages API

In Section 2, you used Claude Code — Anthropic's ready-built agentic coding tool. Claude Code handles all the complexity: managing the context window, calling tools, maintaining conversation state, formatting output. You interact with it through a conversation interface.

The Anthropic Messages API is the layer beneath Claude Code. It is a REST API that gives you direct access to Claude — no built-in conversation management, no pre-built tools, no automatic loop. You send HTTP requests with a message structure; you receive responses with the model's output; you handle everything else yourself.

**When to use Claude Code (from Section 2):**
- Interactive development work in your terminal
- Tasks where you want a conversational interface
- Cases where the built-in tool set (file operations, git, bash) covers what you need
- When you want to get started immediately without writing code

**When to use the Messages API directly:**
- Building a product or service that integrates AI capabilities
- Custom agents with non-standard tools (your database, your internal APIs, proprietary data sources)
- Automated pipelines where no human is present
- Cases where you need fine-grained control over context, prompting, and tool behavior
- Integrating Claude into your existing application architecture

The Messages API is not more powerful than Claude Code in terms of model capabilities — they use the same Claude models. The API gives you programmatic control: you can call it from a script, embed it in a service, control every parameter, and deploy it anywhere.

---

## Part 2: The Messages API Architecture

The Messages API is a single endpoint:

```
POST https://api.anthropic.com/v1/messages
```

Every interaction with Claude goes through this endpoint. The request body contains:
- The model to use (e.g., `claude-sonnet-4-5`)
- The maximum number of tokens to generate
- The conversation history as an array of messages
- Optional: a system prompt, tool definitions, and other parameters

The response contains:
- The model's response content (text, tool use requests, or both)
- The stop reason (why generation stopped)
- Token usage statistics

That is the complete interface. There is no session management, no automatic state — you provide the full conversation history with every request, and you get back the model's next response.

**Why no server-side sessions?** This is a deliberate design choice. Stateless APIs are simpler, more scalable, and more predictable. Your application is responsible for maintaining state. This gives you complete control over what context the model receives.

---

## Part 3: What You Can Do with the API

The Messages API supports:

**Text generation.** Send a message, receive a text response. This is the basic chat interface.

**Tool use.** Define tools with JSON Schema; the model will request tool calls when it needs real-world information or actions. You execute the tools and return the results.

**System prompts.** Provide a system prompt that configures the model's behavior, persona, constraints, and context for the entire conversation.

**Multi-turn conversations.** Maintain a conversation history and continue the conversation across multiple requests.

**Streaming.** Instead of waiting for the complete response, receive the response token by token as it is generated.

**Vision.** Send images as part of messages; the model can analyze and reason about visual content.

**Extended thinking.** On supported models, enable the model to reason step-by-step before generating a response, improving quality on complex problems.

The combination of tool use + multi-turn conversations + system prompts is sufficient to build a complete agent. The other capabilities (streaming, vision, thinking) enhance the agent experience but are not required for basic functionality.

---

## Part 4: The SDK vs Raw HTTP

You can interact with the Messages API in two ways:

**Direct HTTP:** Construct the JSON request body, set the appropriate headers, and make an HTTP POST request. Works in any language that can make HTTP requests.

```python
import requests

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={
        "x-api-key": "sk-ant-...",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    },
    json={
        "model": "claude-sonnet-4-5",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)
```

**SDK:** Anthropic provides official SDKs for Python and TypeScript/JavaScript that wrap the HTTP requests, handle authentication, manage retry logic, and provide type-safe interfaces.

```python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")
message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

For building agents, always use the SDK. It provides:
- Type-safe request construction
- Automatic retry with backoff for transient errors
- Streaming support with clean iterator interfaces
- Token counting utilities
- Consistent error types

The remaining lessons in this section use the Python SDK.

---

## Key Takeaways

- The Messages API is the programmatic layer that Claude Code CLI sits on top of — same model, full control
- Use Claude Code for interactive development; use the API for programmatic agents, custom tools, and production deployments
- The API is a single stateless endpoint: you provide the full conversation history with every request
- Tool use + multi-turn conversations + system prompts = everything needed to build a complete agent
- Always use the SDK for building agents — it handles authentication, retries, and type safety

---

## Common Mistakes to Avoid

**Thinking the API has session state.** It does not. Every request is independent. You must send the full conversation history every time. This is different from some other AI APIs.

**Using the raw HTTP interface when the SDK is available.** The SDK saves you from writing retry logic, handling authentication headers, parsing error responses, and managing streaming connections. Use it.

**Confusing the API with Claude Code.** The API is a building block; Claude Code is a complete application built on that building block. They use the same Claude models but serve different use cases.

---

Next Lesson: In **Lesson 18: Authentication and Setup**, we install the Python SDK, configure authentication securely, and make your first successful API call.

---

[Back to Section Overview](./README.md) | [Next Lesson: Authentication and Setup →](./lesson-18-authentication-and-setup.md)
