# Lesson 24: Multi-Turn Conversations

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Implement correct multi-turn conversation state management
- Apply message history pruning strategies to manage context length
- Use system prompts effectively for stateful agents
- Build a simple interactive coding assistant using multi-turn patterns

---

## Prerequisites

- Lessons 17-23 of this section (all of Section 3)

---

## Part 1: Conversation State

The Messages API is stateless: each request is independent. Your application is responsible for maintaining conversation state — the history of messages.

The fundamental state in a multi-turn conversation is the messages array:

```python
from dataclasses import dataclass, field
from typing import Any

@dataclass
class ConversationState:
    system: str
    messages: list[dict[str, Any]] = field(default_factory=list)
    turn_count: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0

    def add_user_message(self, content: str | list):
        self.messages.append({"role": "user", "content": content})
        self.turn_count += 1

    def add_assistant_response(self, content: list, usage: Any):
        self.messages.append({"role": "assistant", "content": content})
        self.total_input_tokens += usage.input_tokens
        self.total_output_tokens += usage.output_tokens

    def estimated_tokens(self) -> int:
        # Rough estimate: 4 chars per token
        total_chars = len(self.system)
        for msg in self.messages:
            content = msg["content"]
            if isinstance(content, str):
                total_chars += len(content)
            elif isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and "text" in block:
                        total_chars += len(block["text"])
        return total_chars // 4
```

Track token consumption across turns so you know when you are approaching context limits.

---

## Part 2: Message History Pruning

As conversations grow, the message history grows too. Long histories consume tokens on every request, increasing cost and eventually hitting the context limit.

**Strategy 1: Rolling window.** Keep only the last N messages:

```python
def prune_to_window(messages: list, window_size: int = 20) -> list:
    """Keep the most recent window_size messages. Always keep the first message."""
    if len(messages) <= window_size:
        return messages
    # Keep first message (task context) + last window_size - 1 messages
    return [messages[0]] + messages[-(window_size - 1):]
```

**Strategy 2: Summarize and truncate.** Summarize older history and replace it with the summary:

```python
def summarize_and_prune(
    client: anthropic.Anthropic,
    state: ConversationState,
    keep_recent: int = 10
) -> None:
    """Summarize old history and replace it with a condensed version."""
    if len(state.messages) <= keep_recent + 2:
        return

    old_messages = state.messages[:-keep_recent]
    recent_messages = state.messages[-keep_recent:]

    # Ask the model to summarize the old history
    summary_response = client.messages.create(
        model="claude-haiku-4-5",  # Use fast model for summaries
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": f"Summarize this conversation history in 3-5 bullet points. "
                           f"Capture all decisions made and important context:\n\n"
                           + str(old_messages)
            }
        ]
    )

    summary = summary_response.content[0].text
    summary_message = {
        "role": "user",
        "content": f"[Previous conversation summary: {summary}]"
    }

    state.messages = [summary_message] + recent_messages
```

**Strategy 3: Only keep essential messages.** For agent loops, tool call results can often be pruned after the agent has used them:

```python
def prune_tool_results(messages: list, keep_last_n_results: int = 3) -> list:
    """Remove old tool results, keeping only the most recent ones."""
    pruned = []
    tool_result_count = sum(
        1 for msg in messages
        if isinstance(msg.get("content"), list)
        and any(b.get("type") == "tool_result" for b in msg["content"] if isinstance(b, dict))
    )
    removed = 0
    target_remove = max(0, tool_result_count - keep_last_n_results)

    for msg in messages:
        if (isinstance(msg.get("content"), list)
                and any(b.get("type") == "tool_result" for b in msg["content"] if isinstance(b, dict))
                and removed < target_remove):
            removed += 1
            continue
        pruned.append(msg)
    return pruned
```

---

## Part 3: System Prompt Design for Multi-Turn

System prompts for multi-turn conversations need to be designed differently than one-shot prompts:

**Persistent context:** Information that should apply throughout the entire conversation:

```python
CODING_ASSISTANT_SYSTEM = """You are an expert Python engineer helping a developer.

You have access to the following tools:
- read_file: Read source code files
- run_tests: Execute the test suite
- search_code: Search for patterns across files

Guidelines:
- Always read a file before editing it
- Run tests after any code change to verify correctness
- Explain your reasoning when making significant decisions
- Ask clarifying questions before making large changes

Project context:
- This is a FastAPI application using SQLAlchemy 2.x
- Tests use pytest with async fixtures
- All API endpoints are in src/api/; database logic in src/repositories/
"""
```

**Session context:** Information accumulated during the conversation that should persist:

```python
def update_system_with_context(base_system: str, context: dict) -> str:
    """Append accumulated session context to the system prompt."""
    if not context:
        return base_system

    context_lines = ["\\n\\n## Session Context (accumulated during this conversation)"]
    for key, value in context.items():
        context_lines.append(f"- {key}: {value}")

    return base_system + "\\n".join(context_lines)
```

---

## Part 4: Interactive Coding Assistant

Putting multi-turn conversation patterns together into a reusable assistant:

```python
import anthropic
import subprocess
from pathlib import Path

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "read_file",
        "description": "Read a source code file.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    },
    {
        "name": "run_tests",
        "description": "Run the test suite and return results.",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Test file pattern, e.g. 'tests/test_auth.py' or 'tests/'",
                    "default": "tests/"
                }
            },
            "required": []
        }
    }
]

def execute_tool(name: str, args: dict) -> str:
    if name == "read_file":
        p = Path(args["path"])
        return p.read_text() if p.exists() else f"File not found: {p}"
    elif name == "run_tests":
        pattern = args.get("pattern", "tests/")
        result = subprocess.run(
            ["python", "-m", "pytest", pattern, "-v", "--tb=short"],
            capture_output=True, text=True
        )
        return result.stdout + result.stderr
    return f"Unknown tool: {name}"

class CodingAssistant:
    def __init__(self, project_context: str = ""):
        self.messages = []
        self.system = f"You are an expert Python engineer. {project_context}"

    def send(self, user_input: str) -> str:
        self.messages.append({"role": "user", "content": user_input})

        for _ in range(10):  # Tool call loop for this turn
            response = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=4096,
                system=self.system,
                tools=TOOLS,
                messages=self.messages
            )

            if response.stop_reason == "end_turn":
                self.messages.append({"role": "assistant", "content": response.content})
                return next(
                    (b.text for b in response.content if hasattr(b, "text")), ""
                )

            elif response.stop_reason == "tool_use":
                self.messages.append({"role": "assistant", "content": response.content})
                results = []
                for block in response.content:
                    if block.type == "tool_use":
                        result = execute_tool(block.name, block.input)
                        results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result
                        })
                self.messages.append({"role": "user", "content": results})

        return "Error: tool loop exceeded limit"


# Interactive REPL:
if __name__ == "__main__":
    assistant = CodingAssistant("We are working on a Python web API.")
    print("Coding Assistant ready. Type 'exit' to quit.")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "exit":
            break
        if not user_input:
            continue
        response = assistant.send(user_input)
        print(f"Assistant: {response}\n")
```

---

## Key Takeaways

- Conversation state is your responsibility — the API is stateless; you manage the messages array
- Pruning strategies: rolling window (keep last N), summarize-and-truncate (condense old history), prune-tool-results (remove old tool outputs)
- System prompts should be split into persistent context (always true) and session context (accumulated during the conversation)
- The interactive assistant pattern: send user input → handle tool loop → append assistant response → repeat
- Track token consumption across turns to detect when pruning is needed

---

## Section 3 Complete

You have now covered the complete Messages API surface: authentication, request structure, tool use, agent loops, streaming, error handling, and multi-turn conversation management. Section 4 builds on this foundation with the Model Context Protocol.

---

## Common Mistakes to Avoid

**Not tracking token consumption.** Without tracking, you discover context limit issues by hitting errors rather than by managing proactively. Always track usage across turns.

**Pruning without keeping essential context.** Removing the user's initial task description from history means the model loses the goal. Always keep the first message and any other messages that define the task.

**Forgetting the tool_use loop within a single turn.** When a user sends one message, the model may call multiple tools before generating its final response. The inner tool-loop (within a single user turn) is distinct from the outer conversation loop.

---

Next Section: In **Section 4: MCP and Tool Use**, we explore the Model Context Protocol — the open standard that makes it possible to build reusable, interoperable tool servers that any MCP-compatible client can use.

---

[Back to Section Overview](./README.md) | [Next Section: MCP and Tool Use →](../04-mcp-tool-use/README.md)
