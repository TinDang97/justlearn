# Lesson 21: Building an Agent Loop

**Course:** AI Code Agents | **Duration:** 50 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Implement the complete agent loop pattern in Python
- Handle all stop_reason values correctly
- Add iteration limits and logging to prevent runaway agents
- Build a simple code review agent using the loop pattern

---

## Prerequisites

- Lessons 17-20 of this section

---

## Part 1: The Agent Loop Pattern

The agent loop is the core pattern that enables multi-step autonomous behavior. The model keeps calling tools, receiving results, and reasoning about the next step until the task is complete.

The basic pattern:

```python
def run_agent(task: str, tools: list, execute_tool_fn) -> str:
    messages = [{"role": "user", "content": task}]
    max_iterations = 20  # Safety limit

    for iteration in range(max_iterations):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            # Model is done — extract the final text response
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        elif response.stop_reason == "tool_use":
            # Model wants to call tools — execute them and continue
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"[Tool call: {block.name}({block.input})]")
                    result = execute_tool_fn(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "user", "content": tool_results})

        elif response.stop_reason == "max_tokens":
            # Hit the token limit mid-generation — the response is incomplete
            raise RuntimeError("Hit max_tokens limit. Increase max_tokens or simplify the task.")

        else:
            raise RuntimeError(f"Unexpected stop_reason: {response.stop_reason}")

    raise RuntimeError(f"Agent did not complete task within {max_iterations} iterations")
```

The loop continues until `stop_reason == "end_turn"` (task complete) or the iteration limit is reached. The iteration limit is essential — without it, a confused agent could loop indefinitely and burn through your API budget.

---

## Part 2: Logging and Observability

An agent loop without logging is a black box. Add structured logging to understand what the agent is doing:

```python
import json
from datetime import datetime

class AgentLogger:
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.start_time = datetime.now()
        self.iterations = []

    def log_iteration(self, iteration: int, tool_calls: list, token_usage: dict):
        self.iterations.append({
            "iteration": iteration,
            "tool_calls": tool_calls,
            "tokens": token_usage,
            "timestamp": datetime.now().isoformat()
        })
        print(f"Iteration {iteration}: {len(tool_calls)} tool calls | "
              f"Input: {token_usage['input_tokens']} tokens | "
              f"Output: {token_usage['output_tokens']} tokens")

    def log_completion(self, result_length: int):
        duration = (datetime.now() - self.start_time).total_seconds()
        total_iterations = len(self.iterations)
        total_tokens = sum(i["tokens"]["input_tokens"] + i["tokens"]["output_tokens"]
                          for i in self.iterations)
        print(f"\nTask complete: {total_iterations} iterations, "
              f"{total_tokens} total tokens, {duration:.1f}s")
```

Add this to the loop:

```python
logger = AgentLogger(task_id="review-auth")

for iteration in range(max_iterations):
    response = client.messages.create(...)

    tool_calls = [{"name": b.name, "input": b.input}
                  for b in response.content if b.type == "tool_use"]
    logger.log_iteration(iteration, tool_calls, dict(response.usage))

    if response.stop_reason == "end_turn":
        logger.log_completion(len(final_text))
        return final_text
    # ...
```

Logging reveals patterns: if the agent is calling the same tool multiple times, it may be confused. If iterations are growing without progress, the task may be underspecified.

---

## Part 3: The Code Review Agent

Let us build the code review agent described in the section README:

```python
import anthropic
import subprocess
from pathlib import Path

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a senior Python engineer performing code review.

For each file you review, identify and report:
1. **Bugs**: Logic errors, potential exceptions, incorrect behavior
2. **Missing error handling**: Unhandled exceptions, missing input validation
3. **Style issues**: PEP 8 violations, naming convention issues
4. **Performance issues**: Obvious inefficiencies, N+1 queries, unnecessary computation

Format your review as markdown with sections for each category.
Be specific: include line numbers and exact descriptions of each issue.
At the end, provide an overall assessment: APPROVE / NEEDS CHANGES / MAJOR ISSUES."""

TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a Python file for review.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path to the Python file"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "run_lint",
        "description": "Run ruff linter on a file and return any violations found.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path to the Python file to lint"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_review",
        "description": "Write the completed review to a markdown file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Output path for the review file"},
                "content": {"type": "string", "description": "The review content in markdown"}
            },
            "required": ["path", "content"]
        }
    }
]

def execute_tool(name: str, args: dict) -> str:
    if name == "read_file":
        p = Path(args["path"])
        return p.read_text() if p.exists() else f"File not found: {p}"

    elif name == "run_lint":
        result = subprocess.run(
            ["ruff", "check", args["path"], "--output-format", "text"],
            capture_output=True, text=True
        )
        return result.stdout or "No lint issues found."

    elif name == "write_review":
        p = Path(args["path"])
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(args["content"])
        return f"Review written to {p}"

    return f"Unknown tool: {name}"

def review_file(file_path: str, output_path: str) -> str:
    task = f"""Review the Python file at {file_path}.

Steps:
1. Read the file to understand its contents
2. Run the linter on it to find style/syntax issues
3. Analyze the code for bugs, missing error handling, and performance issues
4. Write a comprehensive review to {output_path}

The review should be thorough but actionable."""

    messages = [{"role": "user", "content": task}]

    for iteration in range(30):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Review complete."

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        messages.append({"role": "user", "content": tool_results})

    raise RuntimeError("Agent did not complete review within iteration limit")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python review_agent.py <file_to_review.py> <output_review.md>")
        sys.exit(1)
    result = review_file(sys.argv[1], sys.argv[2])
    print(result)
```

---

## Key Takeaways

- The agent loop: send messages → if tool_use, execute tools and add results → repeat → stop on end_turn
- Always have an iteration limit — protect against infinite loops and runaway costs
- Log tool calls and token usage at each iteration to understand and debug agent behavior
- The code review agent pattern: read file + run lint + analyze + write review — 3-4 iterations typical
- Handle all stop_reason values: end_turn (done), tool_use (continue), max_tokens (error), unexpected (raise)

---

## Common Mistakes to Avoid

**No iteration limit.** An agent that misunderstands a task can loop indefinitely calling the same tools repeatedly. Always have a limit and raise an appropriate error when it is hit.

**Not appending the assistant message before tool results.** The assistant message (containing the ToolUseBlock) must appear in history before the user message with tool results. The history must be: ..., user message, assistant message with tool_use, user message with tool_result.

**Swallowing the max_tokens stop reason.** If the model hits max_tokens in the middle of a tool-use turn, you do not have a valid tool request to respond to. Raise an error or restart with a higher max_tokens.

---

Next Lesson: In **Lesson 22: Streaming Responses**, we learn to use the streaming API to display token output progressively as it is generated — improving perceived performance for interactive applications.

---

[Back to Section Overview](./README.md) | [Next Lesson: Streaming Responses →](./lesson-22-streaming-responses.md)
