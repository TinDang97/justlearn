# Lesson 18: Authentication and Setup

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Install the Anthropic Python SDK in a virtual environment
- Configure API authentication securely using environment variables
- Make a successful first API call and parse the response
- Handle the most common setup issues (import errors, authentication failures)

---

## Prerequisites

- Lesson 17: What is the Agent API?
- Python 3.9+ installed; uv or virtualenv available

---

## Part 1: Project Setup

Set up a clean Python environment for the agent projects in this section:

```bash
# Create a new directory for agent projects
mkdir ai-agents && cd ai-agents

# Create a virtual environment with uv (preferred) or venv
uv venv
# or: python -m venv .venv

# Activate the environment
source .venv/bin/activate
# Windows: .venv\Scripts\activate
```

Install the Anthropic SDK:

```bash
uv pip install anthropic
# or: pip install anthropic
```

Verify the installation:

```python
import anthropic
print(anthropic.__version__)
# Expected: 0.x.x (any recent version)
```

The Anthropic Python SDK requires Python 3.8+ and has minimal dependencies. It is safe to install in any Python environment.

---

## Part 2: API Key Management

Your API key is a secret credential. Treat it like a password: never hardcode it in source code, never commit it to version control, and never share it in plain text.

**Getting your API key:**
1. Go to console.anthropic.com
2. Navigate to API Keys
3. Create a new key (give it a descriptive name: "learning-agents" or similar)
4. Copy the key immediately — it will not be shown again after creation

**Setting up the key as an environment variable:**

For local development, create a `.env` file in your project directory:

```bash
# .env (add this file to .gitignore immediately)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Add `.env` to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

Load the `.env` file in your Python scripts:

```bash
uv pip install python-dotenv
```

```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("ANTHROPIC_API_KEY")
```

**For production environments:** Use your platform's secrets management (AWS Secrets Manager, Heroku Config Vars, GitHub Secrets, etc.). Never use `.env` files in production.

---

## Part 3: First API Call

Let us make the simplest possible API call to verify everything is working:

```python
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()
# The SDK automatically reads ANTHROPIC_API_KEY from environment

message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=100,
    messages=[
        {"role": "user", "content": "In exactly one sentence, what is Python?"}
    ]
)

print(message.content[0].text)
```

Expected output: A single sentence defining Python.

Let us examine the response structure:

```python
print(type(message))
# <class 'anthropic.types.message.Message'>

print(message.id)
# msg_01abc... (unique ID for this response)

print(message.model)
# claude-sonnet-4-5

print(message.stop_reason)
# "end_turn" (model finished naturally)

print(message.usage)
# Usage(input_tokens=18, output_tokens=25)

print(message.content)
# [TextBlock(text='Python is a high-level...', type='text')]

print(message.content[0].text)
# "Python is a high-level..."
```

The response is a `Message` object with several important fields:
- `id`: Unique identifier for this specific response
- `model`: Which model generated the response
- `stop_reason`: Why generation stopped (`end_turn`, `max_tokens`, `tool_use`, `stop_sequence`)
- `usage`: Token consumption (important for cost management)
- `content`: List of content blocks (usually one `TextBlock`, but can include `ToolUseBlock`)

---

## Part 4: SDK Initialization Options

The `Anthropic()` client supports several initialization options:

```python
client = anthropic.Anthropic(
    api_key="sk-ant-...",           # Explicit key (avoid in production)
    base_url="https://...",         # Custom base URL (for proxies or enterprise)
    timeout=30.0,                   # Request timeout in seconds
    max_retries=3,                  # Automatic retry count for transient errors
    default_headers={"X-...": "."}, # Custom headers for all requests
)
```

**Recommended production initialization:**

```python
import anthropic
import os

client = anthropic.Anthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"],  # Fail fast if not set
    timeout=60.0,                             # Generous timeout for long responses
    max_retries=3,                            # Automatic retry for rate limits
)
```

Using `os.environ["ANTHROPIC_API_KEY"]` (with square brackets, not `.get()`) will raise a `KeyError` immediately if the key is not set — this fail-fast behavior is better than discovering missing credentials after the first API call fails.

---

## Part 5: Common Setup Issues

**ImportError: No module named 'anthropic'**

The SDK is not installed in the active environment:
```bash
# Verify you are in the correct environment
which python
pip list | grep anthropic

# Install if missing
pip install anthropic
```

**AuthenticationError: invalid x-api-key**

The API key is wrong or not being loaded:
```python
import os
print(os.getenv("ANTHROPIC_API_KEY"))  # Check if it is set and correct
print(len(os.getenv("ANTHROPIC_API_KEY", "")))  # Check key length (should be ~100+ chars)
```

**PermissionDeniedError: Your credit balance is too low**

Your Anthropic account has no credits. Add payment information at console.anthropic.com.

**APIConnectionError: Connection refused**

Network issue or firewall blocking the API. Check that `api.anthropic.com` is accessible:
```bash
curl -I https://api.anthropic.com
# Should return HTTP/2 200
```

---

## Key Takeaways

- Install with `uv pip install anthropic` or `pip install anthropic` in a virtual environment
- Store the API key in a `.env` file (never committed) for local development; use secrets management in production
- The `Anthropic()` client reads `ANTHROPIC_API_KEY` from environment automatically
- Response objects have: `id`, `model`, `stop_reason`, `usage`, `content` — understand all of them
- Use `os.environ["KEY"]` (not `.get()`) in production to fail fast on missing credentials

---

## Common Mistakes to Avoid

**Committing API keys to git.** Even accidentally committing a key and immediately removing it is a problem — the key appears in git history and should be immediately revoked. Add `.env` to `.gitignore` before creating the file.

**Not checking the stop_reason.** When building agents, the stop reason is critical — it tells you whether the model finished naturally, hit the token limit, or is requesting a tool call. Lesson 21 covers this in depth.

**Ignoring usage statistics.** The `message.usage` object tells you exactly how many tokens were consumed. Monitor this to manage costs, especially as you build longer agent loops.

---

Next Lesson: In **Lesson 19: Messages API Fundamentals**, we explore the complete request and response structure of the Messages API — roles, content blocks, system prompts, and how to structure multi-turn conversations correctly.

---

[Back to Section Overview](./README.md) | [Next Lesson: Messages API Fundamentals →](./lesson-19-messages-api-fundamentals.md)
