# Lesson 20: Tool Use with the API

**Course:** AI Code Agents | **Duration:** 50 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Define tools using JSON Schema in the Anthropic Python SDK
- Handle ToolUseBlock responses from the model
- Execute tool functions and format results as ToolResultBlocks
- Build a complete single-tool-call cycle from definition to result

---

## Prerequisites

- Lessons 17-19 of this section

---

## Part 1: Defining Tools

Tools are defined as a list of dictionaries passed to the `tools` parameter. Each tool definition has three required fields:

```python
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city. Returns temperature in Celsius and weather condition.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city name, e.g. 'London' or 'Tokyo'"
                },
                "country_code": {
                    "type": "string",
                    "description": "ISO 3166-1 alpha-2 country code, e.g. 'GB' or 'JP'",
                }
            },
            "required": ["city"]
        }
    }
]
```

For coding agents, typical tools include:

```python
FILE_TOOLS = [
    {
        "name": "read_file",
        "description": "Read the complete contents of a file. Returns the file content as a string.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to the file, relative to the project root."
                }
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file, creating it if it does not exist or overwriting if it does.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to the file to write."
                },
                "content": {
                    "type": "string",
                    "description": "The complete content to write to the file."
                }
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "run_command",
        "description": "Execute a shell command and return stdout and stderr. Use for running tests, linting, etc.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The shell command to run."
                }
            },
            "required": ["command"]
        }
    }
]
```

---

## Part 2: Making a Tool-Enabled Request

Pass the tools to the API call:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    tools=FILE_TOOLS,
    messages=[
        {
            "role": "user",
            "content": "Read the file src/main.py and tell me what the main function does."
        }
    ]
)

print(response.stop_reason)
# "tool_use" — the model wants to call a tool
```

When the model decides to call a tool, `stop_reason` is `"tool_use"` and `response.content` contains one or more `ToolUseBlock` objects.

---

## Part 3: Handling ToolUseBlock Responses

When `stop_reason == "tool_use"`, iterate over the content blocks to find tool requests:

```python
for block in response.content:
    if block.type == "tool_use":
        print(f"Tool requested: {block.name}")
        print(f"Tool ID: {block.id}")
        print(f"Arguments: {block.input}")
        # {"path": "src/main.py"}
```

A single model response can contain multiple tool use blocks — the model can request multiple tools in one turn. Always iterate over all content blocks, not just the first.

---

## Part 4: Executing the Tool and Returning Results

After identifying the tool requests, execute each tool and collect the results:

```python
import subprocess
from pathlib import Path

def execute_tool(name: str, input_args: dict) -> str:
    """Execute a named tool with the given arguments. Returns string result."""
    if name == "read_file":
        path = Path(input_args["path"])
        if not path.exists():
            return f"Error: File not found: {path}"
        return path.read_text(encoding="utf-8")

    elif name == "write_file":
        path = Path(input_args["path"])
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(input_args["content"], encoding="utf-8")
        return f"Successfully wrote {len(input_args['content'])} characters to {path}"

    elif name == "run_command":
        result = subprocess.run(
            input_args["command"],
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        output = result.stdout + result.stderr
        return output if output else "(command produced no output)"

    else:
        return f"Error: Unknown tool: {name}"
```

Return the tool results to the model by adding a new user message with `tool_result` content blocks:

```python
# Collect tool results
tool_results = []
for block in response.content:
    if block.type == "tool_use":
        result = execute_tool(block.name, block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,   # Must match the tool_use block's id
            "content": result
        })

# Add the tool results as a new user message
new_messages = list(messages)  # Copy existing history
new_messages.append({"role": "assistant", "content": response.content})
new_messages.append({"role": "user", "content": tool_results})
```

Note: The assistant message must contain the original `response.content` (including the `ToolUseBlock`), not just the text. Then the user message contains the tool results.

---

## Part 5: Complete Single-Tool Example

Putting it all together — a complete round-trip with one tool call:

```python
import anthropic
from pathlib import Path

client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to read"}
            },
            "required": ["path"]
        }
    }
]

def execute_tool(name: str, args: dict) -> str:
    if name == "read_file":
        path = Path(args["path"])
        return path.read_text() if path.exists() else f"File not found: {path}"
    return f"Unknown tool: {name}"

# Step 1: Initial request
messages = [{"role": "user", "content": "Read src/auth.py and describe the login function."}]

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    tools=TOOLS,
    messages=messages
)

# Step 2: Handle tool call
if response.stop_reason == "tool_use":
    # Append assistant response (with tool request) to history
    messages.append({"role": "assistant", "content": response.content})

    # Execute all tool requests and collect results
    tool_results = []
    for block in response.content:
        if block.type == "tool_use":
            result = execute_tool(block.name, block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result
            })

    # Append tool results as user message
    messages.append({"role": "user", "content": tool_results})

    # Step 3: Final response with tool results in context
    final_response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        tools=TOOLS,
        messages=messages
    )
    print(final_response.content[0].text)
else:
    # Model answered without tool use
    print(response.content[0].text)
```

---

## Key Takeaways

- Tools are defined with three fields: `name`, `description` (critical for model selection), `input_schema` (JSON Schema object)
- When `stop_reason == "tool_use"`, the response content includes `ToolUseBlock` objects with tool name and input
- Execute the tool, get the result, and return it as `ToolResultBlock` in a new user message
- The assistant message appended to history must include the original `ToolUseBlock` — not just text
- Each `ToolResultBlock` must reference the matching `tool_use_id` from the `ToolUseBlock`

---

## Common Mistakes to Avoid

**Forgetting to include ToolUseBlock in the assistant message.** When you append the model's response to history, you must include the complete `response.content` list (which contains the ToolUseBlock), not just any text content. If you strip the ToolUseBlock from the history, the model loses track of what tools it called.

**Mismatching tool_use_id.** Every `ToolResultBlock` must have a `tool_use_id` that exactly matches the `id` field from the corresponding `ToolUseBlock`. A mismatch causes an API error.

**Not handling multiple tool calls per turn.** A model response can contain multiple ToolUseBlock objects. Always iterate over all content blocks and process each tool call.

---

Next Lesson: In **Lesson 21: Building an Agent Loop**, we combine everything from Lessons 17-20 into a complete agent loop — the while-loop pattern that lets the model take as many tool calls as needed to complete a task.

---

[Back to Section Overview](./README.md) | [Next Lesson: Building an Agent Loop →](./lesson-21-building-an-agent-loop.md)
