# Lesson 6: The Tool Use Paradigm

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain how function calling / tool use works mechanically
- Describe the structure of a tool definition (JSON Schema)
- Trace the observe-think-act loop through a concrete tool call sequence
- Identify what grounding means and why it matters for reliable agent behavior

---

## Prerequisites

- Lessons 1-5 of this section
- Basic familiarity with JSON structure

---

## Part 1: The Problem That Tool Use Solves

Language models, at their core, are text-in, text-out systems. They take a sequence of tokens as input and produce a sequence of tokens as output. This is powerful for generating text, answering questions, and writing code — but it does not connect the model to the real world.

For an agent to be useful, it needs to do more than generate text. It needs to read actual files, not just imagine their contents. It needs to run actual commands, not just describe what they would do. It needs to make actual API calls, not just write the code to do so.

The bridge between the text-generating model and real-world actions is **tool use** (also called function calling).

Tool use is a capability built into modern language models that allows the model to output a structured request to call a specific function with specific arguments, pause generation, and receive the result of that function call as additional context before continuing to generate.

From the model's perspective, tool use looks like this:
1. The model generates a structured tool call request: "I want to call the `read_file` tool with `path='/src/auth.py'`."
2. The agent runtime intercepts this, calls the actual `read_file` function, and gets the file contents back.
3. The file contents are added to the model's context as a tool result.
4. The model continues generating with the actual file contents now available.

The model never directly interacts with the file system — that happens in the agent runtime. But the model can reason about the results of file reads, command executions, and API calls as if it had taken those actions directly.

---

## Part 2: Tool Definitions — JSON Schema

Tools are defined using JSON Schema, a standard format for describing the structure of JSON objects. The model uses tool definitions to know what tools are available, what each tool does, and what arguments each tool expects.

A typical tool definition looks like this:

```json
{
  "name": "read_file",
  "description": "Read the contents of a file at the given path. Returns the file contents as a string.",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "The path to the file to read, relative to the project root."
      }
    },
    "required": ["path"]
  }
}
```

Three components matter:

**`name`:** The identifier the model uses to request this tool. Must be unique. The agent runtime maps this name to the actual function to call.

**`description`:** Natural language explanation of what the tool does. This is not just documentation — the model uses the description to decide when to call this tool versus other tools. A well-written description is critical for the model to use the tool correctly.

**`input_schema`:** A JSON Schema object describing the arguments the tool accepts. The model will generate arguments that conform to this schema. The agent runtime can validate the model's output against the schema before calling the function.

Here is a more complex example — a tool that executes a shell command:

```json
{
  "name": "bash",
  "description": "Execute a bash command and return its stdout and stderr. Use this to run tests, install dependencies, check system state, or perform any shell operation. Prefer specific targeted commands over broad exploratory ones.",
  "input_schema": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "description": "The bash command to execute."
      },
      "timeout": {
        "type": "integer",
        "description": "Maximum time in seconds to wait for the command to complete. Defaults to 30.",
        "default": 30
      }
    },
    "required": ["command"]
  }
}
```

The quality of tool descriptions directly affects agent behavior. A vague description leads to incorrect tool selection. An ambiguous schema leads to malformed tool calls. Writing good tool definitions is a significant part of building a good agent.

---

## Part 3: The Tool Call Cycle in Detail

Let us trace through a complete tool call cycle to see exactly how the data flows. Suppose the agent is working on this task: "Check if the tests pass for the auth module."

**Step 1 — Model generates a tool call.**

The model, given the task and the available tools, generates an output that includes a tool use request:

```json
{
  "type": "tool_use",
  "id": "call_abc123",
  "name": "bash",
  "input": {
    "command": "cd /project && python -m pytest tests/test_auth.py -v"
  }
}
```

Note: the model does not just describe what it wants to do — it outputs a structured JSON object that the agent runtime can parse and dispatch.

**Step 2 — Agent runtime executes the tool.**

The agent runtime receives this tool use request, identifies the `bash` tool, validates the input against the schema, and calls the actual `subprocess.run()` function (or equivalent) with the command.

**Step 3 — Result is added to context.**

The command output is captured and added to the model's context as a tool result:

```json
{
  "type": "tool_result",
  "tool_use_id": "call_abc123",
  "content": "============================== test session starts ==============================\npython -m pytest tests/test_auth.py -v\n...\nFAILED tests/test_auth.py::test_login_invalid_email - AssertionError\n============================== 1 failed in 0.3s =============================="
}
```

**Step 4 — Model continues reasoning.**

The model now has the real test output in its context. It can reason about which test failed, why it might have failed, and what to do next. It might read the test file, read the auth module, identify the bug, fix it, and run the tests again.

This cycle repeats for every tool call in the agent loop. The model is reasoning over accumulating real-world evidence, not imagining hypothetical outcomes.

---

## Part 4: Grounding and Why It Matters

**Grounding** is the property of an AI system's outputs being anchored in real, observed information rather than generated from the model's prior knowledge alone.

An ungrounded agent might write a test suite based on what it imagines the module's interface looks like. If the model's imagination is close but wrong, the tests will be based on incorrect assumptions.

A grounded agent reads the actual module, observes its actual interface, and writes tests based on what is actually there.

Grounding is what separates useful agents from hallucination factories. The key principle: **every claim the agent acts on should be grounded in an observation from a tool call, not generated from the model's prior.**

Practical examples of grounding in action:

- **File reads before edits.** A good agent reads a file before modifying it. It does not assume it knows the current contents — it observes them.
- **Test runs after code generation.** A good agent runs the tests after writing code. It does not assume the code is correct — it observes whether it passes.
- **Version checks before API usage.** If an agent needs to use a specific library feature, it should check the installed version rather than assuming the version it was trained on.

Building grounding into agent behavior is partly about the tools you provide (you cannot ground a claim in a file read if no file read tool exists) and partly about the prompts and instructions that guide the agent's behavior (you can instruct the agent to always read before writing, always test after implementing, etc.).

---

## Key Takeaways

- Tool use bridges the text-generating model to real-world actions: the model outputs structured tool requests; the runtime executes them and returns results
- Tools are defined with JSON Schema, specifying the tool name, description, and input schema — the description is critical for the model to select and use tools correctly
- The tool call cycle: model generates tool request → runtime executes → result added to context → model continues reasoning
- Grounding means basing agent actions on observed information from tool calls, not on the model's prior assumptions — this is what makes agents reliable rather than confabulatory

---

## Common Mistakes to Avoid

**Writing vague tool descriptions.** The model uses the description to decide when and how to call a tool. "Do something with a file" is unusable. "Read the contents of a file and return them as a string" is actionable.

**Not validating tool call inputs.** The model can generate malformed inputs. The agent runtime should validate tool call inputs against the JSON Schema before executing.

**Trusting model priors over observations.** When you see an agent skip the "read file before editing" step because it "already knows" the file contents from earlier in the conversation, that is a grounding failure. Observations can become stale; re-read when in doubt.

---

Next Lesson: In **Lesson 7: Safety and Responsible Use**, we examine the safety considerations that arise specifically when agents have the ability to take real-world actions — and practical patterns for managing those risks.

---

[Back to Section Overview](./README.md) | [Next Lesson: Safety and Responsible Use →](./lesson-07-safety-and-responsible-use.md)
