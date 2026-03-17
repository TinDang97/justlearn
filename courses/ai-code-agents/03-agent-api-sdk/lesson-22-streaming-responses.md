# Lesson 22: Streaming Responses

**Course:** AI Code Agents | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Use the streaming API to receive tokens progressively
- Handle all streaming event types correctly
- Build a streaming agent loop that displays output in real time
- Understand when streaming is and is not appropriate

---

## Prerequisites

- Lessons 17-21 of this section

---

## Part 1: Why Streaming Matters

Without streaming, you wait for the entire response to be generated before seeing any output. For a 500-token response at typical generation speeds (40-60 tokens/second), that is 8-12 seconds of silence.

With streaming, you see tokens as they are generated. The first token appears in under 1 second, and the full response gradually populates. This dramatically improves perceived performance for interactive applications.

Streaming also enables:
- **Real-time display in terminal applications:** Users can read the beginning of a response while the rest is still being generated
- **Progressive UI updates:** Web applications can show partial responses instead of a spinner
- **Early termination:** If you can see the response is going in the wrong direction, you can cancel before it completes
- **Streaming agent loops:** Display tool calls and results as they happen, giving users visibility into the agent's work

---

## Part 2: The Streaming SDK Interface

The Python SDK provides a context manager for streaming:

```python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain Python decorators in detail."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

print()  # Newline after completion
```

The `text_stream` iterator yields text chunks as they are generated. This is the simplest interface — it handles all the underlying events and just gives you the text.

---

## Part 3: Streaming Event Types

For more control, iterate over raw events instead of the text stream:

```python
with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    tools=TOOLS,
    messages=messages
) as stream:
    for event in stream:
        if event.type == "content_block_start":
            if event.content_block.type == "text":
                pass  # Text block starting
            elif event.content_block.type == "tool_use":
                print(f"\n[Tool call: {event.content_block.name}]")

        elif event.type == "content_block_delta":
            if event.delta.type == "text_delta":
                print(event.delta.text, end="", flush=True)
            elif event.delta.type == "input_json_delta":
                # Streaming JSON input for a tool call
                pass  # Usually accumulated, not displayed

        elif event.type == "content_block_stop":
            pass  # Content block complete

        elif event.type == "message_stop":
            pass  # Full message complete

    final_message = stream.get_final_message()
    # Full message with stop_reason, usage, and complete content
```

The key event types:
- `content_block_start` — A new content block begins (text or tool_use)
- `content_block_delta` — Incremental content (text chunk or tool input JSON fragment)
- `content_block_stop` — Content block is complete
- `message_stop` — Message is complete

After the stream context exits, call `stream.get_final_message()` to get the complete `Message` object including stop_reason and usage.

---

## Part 4: Streaming Agent Loop

Combining streaming with the agent loop:

```python
import anthropic
from pathlib import Path

client = anthropic.Anthropic()

def run_streaming_agent(task: str, tools: list, execute_tool_fn) -> str:
    messages = [{"role": "user", "content": task}]

    for iteration in range(20):
        print(f"\n--- Iteration {iteration + 1} ---")

        with client.messages.stream(
            model="claude-sonnet-4-5",
            max_tokens=4096,
            tools=tools,
            messages=messages
        ) as stream:
            for event in stream:
                if event.type == "content_block_start":
                    if hasattr(event, "content_block") and event.content_block.type == "tool_use":
                        print(f"\n[Calling: {event.content_block.name}]", end="")

                elif event.type == "content_block_delta":
                    if hasattr(event.delta, "text"):
                        print(event.delta.text, end="", flush=True)

            response = stream.get_final_message()

        print()  # Newline after the streaming output

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        elif response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"  -> Executing {block.name}...")
                    result = execute_tool_fn(block.name, block.input)
                    # Truncate long results for display
                    display_result = result[:200] + "..." if len(result) > 200 else result
                    print(f"  -> Result: {display_result}")
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "user", "content": tool_results})

    raise RuntimeError("Agent loop exceeded iteration limit")
```

---

## Part 5: When Not to Use Streaming

Streaming is not always appropriate:

**Batch processing.** If you are processing 100 files and do not need to display results immediately, streaming adds complexity without benefit. Use non-streaming for batch jobs.

**When you need the complete response before proceeding.** If your code logic depends on the entire response (e.g., parsing structured JSON output), waiting for the complete response is cleaner than accumulating streaming chunks.

**Very short responses.** For responses under ~50 tokens, the latency difference between streaming and non-streaming is negligible. Do not add streaming complexity for simple, fast responses.

**Intermediate tool calls.** When a model is calling tools (not generating the final answer), streaming the tool use setup is not useful to display. You usually want to stream the final answer, not the reasoning.

A pragmatic pattern: use non-streaming during development (easier to debug), add streaming in the final application layer for user-facing output.

---

## Key Takeaways

- Streaming shows tokens as they are generated, improving perceived performance from 8-12 second wait to immediate display
- Use `client.messages.stream()` as a context manager; iterate `stream.text_stream` for simple text or `stream` for full event control
- After the stream context exits, call `stream.get_final_message()` for the complete response including stop_reason and usage
- Key events: content_block_start (new block), content_block_delta (incremental text), message_stop (done)
- Skip streaming for batch processing, short responses, and when the full response is needed before proceeding

---

## Common Mistakes to Avoid

**Forgetting to call `stream.get_final_message()`.** The streaming iterator gives you events but not the final message with stop_reason and usage. Always call `get_final_message()` to get the complete response.

**Trying to parse partial tool use inputs.** Tool input JSON arrives as fragments (`input_json_delta`). Do not try to parse it mid-stream. Wait for `content_block_stop`, then use the complete input from `get_final_message()`.

**Using streaming in synchronous contexts where `print` is buffered.** Include `flush=True` in your `print` calls when streaming to ensure each chunk appears immediately.

---

Next Lesson: In **Lesson 23: Error Handling and Retries**, we cover the error types you will encounter in production and implement correct retry logic with exponential backoff.

---

[Back to Section Overview](./README.md) | [Next Lesson: Error Handling and Retries →](./lesson-23-error-handling-and-retries.md)
