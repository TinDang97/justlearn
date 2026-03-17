# Lesson 23: Error Handling and Retries

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Identify the error types returned by the Anthropic API and their causes
- Implement exponential backoff for rate limit and overloaded errors
- Distinguish between retryable and non-retryable errors
- Build a production-grade retry wrapper for API calls

---

## Prerequisites

- Lessons 17-22 of this section

---

## Part 1: Anthropic API Error Types

The Anthropic Python SDK raises typed exceptions for different error conditions:

```python
import anthropic

# All exceptions inherit from anthropic.APIError
# More specific types:
# anthropic.APIConnectionError — Network failure, connection refused
# anthropic.APITimeoutError — Request timed out
# anthropic.AuthenticationError — Invalid API key (status 401)
# anthropic.PermissionDeniedError — Insufficient permissions (status 403)
# anthropic.NotFoundError — Resource not found (status 404)
# anthropic.RateLimitError — Too many requests (status 429)
# anthropic.APIStatusError — Any non-2xx response (base for 4xx/5xx)
# anthropic.InternalServerError — Server error (status 500)
# anthropic.OverloadedError — Server overloaded (status 529)
```

**Retryable errors** (temporary conditions that may resolve):
- `RateLimitError` (429) — Too many requests; wait and retry
- `APIConnectionError` — Network issue; retry after brief wait
- `APITimeoutError` — Request timed out; retry
- `InternalServerError` (500) — Server error; usually transient; retry
- `OverloadedError` (529) — Server overloaded; retry with backoff

**Non-retryable errors** (require code or configuration fix):
- `AuthenticationError` (401) — API key is wrong or expired; fix the key
- `PermissionDeniedError` (403) — Account lacks permissions; check account
- `NotFoundError` (404) — Model or endpoint does not exist; fix the request

---

## Part 2: Exponential Backoff

Exponential backoff is the correct strategy for retrying transient failures: wait a base amount of time on the first retry, double it on the second, double again on the third, up to a maximum wait. Add jitter (random variation) to prevent thundering herd problems when many clients retry simultaneously.

```python
import time
import random
import anthropic

def exponential_backoff_wait(attempt: int, base_seconds: float = 1.0, max_seconds: float = 60.0):
    """Wait with exponential backoff plus jitter."""
    wait = min(base_seconds * (2 ** attempt), max_seconds)
    # Add ±25% jitter
    wait = wait * (0.75 + random.random() * 0.5)
    print(f"  Waiting {wait:.1f}s before retry (attempt {attempt + 1})...")
    time.sleep(wait)
```

Retry schedule with base=1s, max=60s:
- Attempt 0 (first retry): ~0.75-1.25s
- Attempt 1: ~1.5-2.5s
- Attempt 2: ~3-5s
- Attempt 3: ~6-10s
- Attempt 4: ~12-20s
- Attempt 5+: ~45-60s (capped at max)

---

## Part 3: A Production-Grade Retry Wrapper

```python
import anthropic
import time
import random
from typing import Callable, TypeVar

T = TypeVar("T")

RETRYABLE_ERRORS = (
    anthropic.RateLimitError,
    anthropic.InternalServerError,
    anthropic.OverloadedError,
    anthropic.APIConnectionError,
    anthropic.APITimeoutError,
)

def with_retry(
    fn: Callable[[], T],
    max_attempts: int = 5,
    base_wait: float = 1.0,
    max_wait: float = 60.0,
) -> T:
    """
    Execute fn with exponential backoff retry for transient errors.
    Raises the final error if all attempts are exhausted.
    """
    last_error = None

    for attempt in range(max_attempts):
        try:
            return fn()

        except anthropic.RateLimitError as e:
            last_error = e
            # Check if the API returned a Retry-After header
            retry_after = getattr(e.response, "headers", {}).get("retry-after")
            if retry_after:
                wait = float(retry_after)
                print(f"  Rate limited. API says retry after {wait}s")
                time.sleep(wait)
            else:
                exponential_backoff_wait(attempt, base_wait, max_wait)

        except RETRYABLE_ERRORS as e:
            last_error = e
            if attempt < max_attempts - 1:
                exponential_backoff_wait(attempt, base_wait, max_wait)

        except (anthropic.AuthenticationError, anthropic.PermissionDeniedError):
            raise  # Non-retryable — fail immediately

    raise last_error  # type: ignore


def exponential_backoff_wait(attempt: int, base: float, maximum: float):
    wait = min(base * (2 ** attempt), maximum) * (0.75 + random.random() * 0.5)
    print(f"  Retrying in {wait:.1f}s...")
    time.sleep(wait)


# Usage in agent loop:
client = anthropic.Anthropic()

def create_message_with_retry(messages, tools=None, system=None):
    return with_retry(lambda: client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4096,
        messages=messages,
        tools=tools or [],
        system=system or "",
    ))
```

---

## Part 4: Rate Limit Management

Rate limits on the Anthropic API are defined per tier (requests per minute, tokens per minute, tokens per day). Exceeding any of these triggers a 429 response.

**Understanding your limits:** Check console.anthropic.com under your account for current rate limit tiers.

**Proactive rate limit management** for batch processing:

```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.rpm = requests_per_minute
        self.window = 60.0
        self.timestamps: deque = deque()

    def wait_if_needed(self):
        now = time.time()
        # Remove timestamps older than the window
        while self.timestamps and now - self.timestamps[0] > self.window:
            self.timestamps.popleft()

        if len(self.timestamps) >= self.rpm:
            # Need to wait until oldest timestamp exits the window
            wait = self.window - (now - self.timestamps[0])
            if wait > 0:
                print(f"Rate limit: waiting {wait:.1f}s")
                time.sleep(wait)

        self.timestamps.append(time.time())


# Usage for batch processing:
limiter = RateLimiter(requests_per_minute=50)

for file_path in files_to_process:
    limiter.wait_if_needed()
    response = client.messages.create(...)
```

---

## Part 5: Error Handling in Agent Loops

In an agent loop, error handling needs to consider which phase the error occurs in:

```python
def run_agent_with_error_handling(task: str) -> str:
    messages = [{"role": "user", "content": task}]

    for iteration in range(20):
        try:
            response = create_message_with_retry(messages)
        except anthropic.AuthenticationError:
            raise RuntimeError("Authentication failed. Check ANTHROPIC_API_KEY.")
        except anthropic.APIStatusError as e:
            raise RuntimeError(f"API error after retries: {e.status_code} {e.message}")

        if response.stop_reason == "end_turn":
            # Extract text response
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        elif response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []

            for block in response.content:
                if block.type == "tool_use":
                    try:
                        result = execute_tool(block.name, block.input)
                    except FileNotFoundError as e:
                        # Return the error to the model — let it decide what to do
                        result = f"Error: {e}"
                    except PermissionError as e:
                        result = f"Permission denied: {e}"
                    except Exception as e:
                        result = f"Tool execution failed: {type(e).__name__}: {e}"

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "user", "content": tool_results})

    raise RuntimeError("Agent did not complete task within iteration limit")
```

Note: Tool execution errors are returned to the model as error strings, not raised as Python exceptions. This lets the model recover: it can try a different path, fix the input, or report the error in its final response.

---

## Key Takeaways

- Retryable errors: RateLimitError, InternalServerError, OverloadedError, connection errors — retry with exponential backoff
- Non-retryable errors: AuthenticationError, PermissionDeniedError — fail fast, fix configuration
- Exponential backoff formula: `min(base * 2^attempt, max) * jitter`
- Always check the `Retry-After` header on 429 responses — the API tells you exactly how long to wait
- Tool execution errors should be returned to the model as string errors, not raised as Python exceptions

---

## Common Mistakes to Avoid

**Retrying immediately on rate limit.** Retrying immediately after a 429 will just get another 429. Always wait before retrying, and prefer the `Retry-After` header value when it is provided.

**Retrying authentication errors.** An `AuthenticationError` will not resolve by retrying — the API key is wrong. Retrying wastes time and counts against rate limits.

**Raising exceptions from tool execution.** When a tool fails (file not found, command error), return the error as a string to the model. The model can often recover by trying a different approach. Raising an exception kills the entire agent loop.

---

Next Lesson: In **Lesson 24: Multi-Turn Conversations**, we look at the patterns for managing long-running conversations — state management, message history pruning, and system prompts for multi-turn agents.

---

[Back to Section Overview](./README.md) | [Next Lesson: Multi-Turn Conversations →](./lesson-24-multi-turn-conversations.md)
