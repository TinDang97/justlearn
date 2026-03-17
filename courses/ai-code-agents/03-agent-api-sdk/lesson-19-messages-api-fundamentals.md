# Lesson 19: Messages API Fundamentals

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Construct correct multi-turn conversation messages with the right role structure
- Use system prompts to configure model behavior
- Understand all content block types (text, image, tool_use, tool_result)
- Choose the appropriate model for a given task

---

## Prerequisites

- Lesson 18: Authentication and Setup
- Python SDK installed and working

---

## Part 1: The Message Structure

Every Messages API request requires a `messages` array. This array contains the conversation history. Each message is an object with two required fields:

```python
{
    "role": "user" | "assistant",
    "content": str | list[ContentBlock]
}
```

**Role:** Either `"user"` (human input) or `"assistant"` (model output). Messages must strictly alternate: user, assistant, user, assistant... The first message must always be from the user.

**Content:** Either a plain string (for simple text) or a list of content blocks (for complex content including images, tool calls, and tool results).

A basic two-turn conversation:

```python
messages = [
    {"role": "user", "content": "What is a generator in Python?"},
    {"role": "assistant", "content": "A generator is a function that..."},  # Previous response
    {"role": "user", "content": "Can you show me an example?"},
]

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=500,
    messages=messages
)
```

**The critical rule:** When building multi-turn conversations, you append the model's response to the messages array and then add the next user message. This gives the model the full conversation history.

---

## Part 2: System Prompts

The system prompt is a special field at the top level of the request (not in the messages array). It configures the model's behavior for the entire conversation.

```python
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1000,
    system="""You are a senior Python engineer doing code review.

When reviewing code, always:
1. Check for correctness first
2. Identify performance issues
3. Note style and convention violations
4. Suggest specific improvements (not vague "clean up the code")

Be direct and specific. Use line numbers when referencing code.""",
    messages=[
        {"role": "user", "content": "Review this code: [code here]"}
    ]
)
```

System prompts are powerful because they:
- Configure the model's persona and tone
- Set task-specific constraints that apply throughout the conversation
- Provide context that should not be repeated in every message
- Define the output format expected

For agent applications, the system prompt typically contains:
- Role/persona definition
- Available tools description (complementing the JSON Schema definitions)
- Behavioral constraints (what the agent should and should not do)
- Project context (relevant conventions, architecture, constraints)

---

## Part 3: Content Blocks

For complex messages, content is a list of content blocks rather than a plain string. Each block has a `type` field and type-specific fields:

**TextBlock:**
```python
{"type": "text", "text": "Here is the analysis..."}
```

**ImageBlock (for vision-capable models):**
```python
{
    "type": "image",
    "source": {
        "type": "base64",
        "media_type": "image/png",
        "data": "<base64-encoded-image-data>"
    }
}
```

**ToolUseBlock (model requesting a tool call):**
```python
{
    "type": "tool_use",
    "id": "toolu_01abc...",
    "name": "read_file",
    "input": {"path": "src/auth.py"}
}
```

**ToolResultBlock (your response to a tool call):**
```python
{
    "type": "tool_result",
    "tool_use_id": "toolu_01abc...",  # Must match the ToolUseBlock id
    "content": "def register_user(email, name):\n    ..."
}
```

Tool use and tool results are the key content types for building agents. The cycle works like this:

1. Model response contains a `ToolUseBlock` requesting a tool call
2. You execute the tool and get a result
3. You add a new user message containing a `ToolResultBlock` with the result
4. You send the updated conversation to the API
5. The model continues from there

---

## Part 4: Key Request Parameters

Beyond `messages` and `system`, the Messages API supports several important parameters:

**`model`:** Which Claude model to use. Current options:
- `claude-haiku-4-5` — Fast, cost-effective
- `claude-sonnet-4-5` — Balanced (recommended default)
- `claude-opus-4-5` — Most capable

**`max_tokens`:** Maximum tokens to generate. Required. The response will be cut off if it hits this limit (stop_reason becomes `"max_tokens"`). Set this based on expected response length:
- Simple answers: 256-512
- Detailed explanations: 1,024-2,048
- Long code generation: 4,096-8,192

**`temperature`:** Controls randomness (0.0 to 1.0). Default: 1.0 for most use cases.
- 0.0 = deterministic (same input → same output, approximately)
- 1.0 = default sampling behavior
- For code generation where correctness matters more than creativity, 0.0-0.3 is common

**`stop_sequences`:** List of strings that stop generation when encountered:
```python
stop_sequences=["```"]  # Stop after generating one code block
```

**`tools`:** List of tool definitions (covered in depth in Lesson 20).

**`tool_choice`:** Control whether the model must use a tool or can choose:
```python
tool_choice={"type": "auto"}    # Model decides (default)
tool_choice={"type": "any"}     # Must use at least one tool
tool_choice={"type": "tool", "name": "read_file"}  # Must use this specific tool
```

---

## Part 5: Building a Simple Conversation Manager

Here is a minimal conversation manager class that handles the message history correctly:

```python
import anthropic
from typing import Optional

class ConversationManager:
    def __init__(self, system: str, model: str = "claude-sonnet-4-5"):
        self.client = anthropic.Anthropic()
        self.model = model
        self.system = system
        self.messages: list[dict] = []

    def chat(self, user_message: str, max_tokens: int = 1024) -> str:
        self.messages.append({"role": "user", "content": user_message})

        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=self.system,
            messages=self.messages
        )

        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

    def reset(self):
        self.messages = []


# Usage:
conv = ConversationManager(
    system="You are a helpful Python tutor. Be concise and practical."
)

print(conv.chat("What is a decorator?"))
print(conv.chat("Can you show a real-world example?"))
print(conv.chat("How is that different from a class-based decorator?"))
```

This pattern maintains conversation history correctly — each call adds to the history, and the full history is sent with each request.

---

## Key Takeaways

- Messages alternate strictly: user, assistant, user, assistant — never two of the same role in a row
- System prompts configure model behavior for the entire conversation and are powerful for agent personas
- Content blocks types: text (most common), image (vision), tool_use (model requests a tool), tool_result (your response to a tool request)
- Key parameters: `max_tokens` (required), `temperature` (default 1.0, lower for code), `tool_choice` (auto/any/specific)
- Always append responses to message history before the next request — the API is stateless

---

## Common Mistakes to Avoid

**Two consecutive messages with the same role.** This will return an API error. Messages must strictly alternate user/assistant. If you need to provide multiple user inputs at once, combine them in one user message.

**Setting max_tokens too low.** Responses cut off mid-generation (stop_reason = "max_tokens") create incomplete outputs. Set max_tokens based on realistic expected output length, not to save money on a single call.

**Not storing the assistant's response in message history.** If you call the API twice without appending the first response to the message array, the model has no memory of the first turn. The API is stateless — you manage the history.

---

Next Lesson: In **Lesson 20: Tool Use with the API**, we implement the full tool use cycle in Python — defining tools with JSON Schema, handling ToolUseBlock responses, calling the actual functions, and feeding results back via ToolResultBlocks.

---

[Back to Section Overview](./README.md) | [Next Lesson: Tool Use with the API →](./lesson-20-tool-use-with-the-api.md)
