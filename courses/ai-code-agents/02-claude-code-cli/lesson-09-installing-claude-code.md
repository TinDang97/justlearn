# Lesson 9: Installing Claude Code

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Install Claude Code CLI and its dependencies
- Authenticate Claude Code with your Anthropic API key
- Run a successful first session to verify the installation works
- Understand the system requirements and common installation issues

---

## Prerequisites

- Section 1 complete (especially Lesson 3: Introduction to Claude)
- Node.js 18 or later installed
- An Anthropic API account and API key (create at console.anthropic.com)
- A terminal you are comfortable using

---

## Part 1: System Requirements

Claude Code is a Node.js CLI application. Before installing, verify your environment meets the requirements.

**Node.js version:**

```bash
node --version
# Expect: v18.x.x or higher
```

If Node.js is not installed or the version is below 18, install it from nodejs.org or use a version manager like `nvm` (recommended):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use Node 20 LTS
nvm install 20
nvm use 20
node --version
# Now shows v20.x.x
```

**Operating system:** Claude Code works on macOS, Linux, and Windows (via WSL2). Native Windows support exists but WSL2 is recommended for the best experience with bash commands and git operations.

**Available disk space:** Claude Code itself is small (< 50MB), but plan for conversation caches and temporary files. 1GB free space is a comfortable minimum.

**Anthropic API key:** You will need an active API key from console.anthropic.com. Free tier keys work but have rate limits. For regular use, a paid account is strongly recommended to avoid interruptions.

---

## Part 2: Installation

Claude Code is installed as a global npm package:

```bash
npm install -g @anthropic-ai/claude-code
```

Verify the installation:

```bash
claude --version
# Expected output: claude/X.Y.Z ...
```

If the command is not found after installation, your Node.js global bin directory may not be in your PATH. Check with:

```bash
npm bin -g
# Shows the global bin directory, e.g., /Users/you/.nvm/versions/node/v20.x.x/bin
```

Add that directory to your PATH in your shell configuration file (`.zshrc`, `.bashrc`, etc.):

```bash
export PATH="$(npm bin -g):$PATH"
```

Then restart your terminal or run `source ~/.zshrc`.

---

## Part 3: Authentication

Claude Code needs access to the Anthropic API. You can authenticate in two ways:

**Option 1: Environment variable (recommended for development)**

Set your API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

For persistence across terminal sessions, add this to your shell configuration:

```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

**Option 2: Claude Code login command**

```bash
claude login
# Opens browser for OAuth authentication with your Anthropic account
# Credentials are stored in ~/.claude/credentials.json
```

The login command connects directly to your Anthropic account. This is convenient but ties Claude Code to a specific account on the machine.

**Verifying authentication:**

```bash
claude --print "Say hello in one sentence"
# Expected: Some greeting text
```

If you get an authentication error, verify your API key is correct in the Anthropic console and that it has not expired or been revoked.

---

## Part 4: First Session

Navigate to a project directory and start Claude Code:

```bash
cd /path/to/your/project
claude
```

Claude Code starts an interactive session. You will see a prompt that shows the current directory and invites you to type.

Try a simple orientation task:

```
What files are in this project? Give me a brief overview of what this codebase does.
```

Claude Code will use its tools to list files, read key files like README.md and package.json or pyproject.toml, and give you a summary. Watch the output — you will see it using tools in real time.

Now try something slightly more involved:

```
Are there any obvious issues in this codebase? Check for common problems like missing error handling, unused imports, or TODO comments.
```

Claude Code will search through the files, look for common issues, and report what it finds. This gives you a feel for how it works: it is not just answering from its training data — it is actually reading your specific files.

To exit a session, type `exit` or press `Ctrl+D`.

---

## Part 5: Configuration Overview

Claude Code stores its configuration in `~/.claude/`. Key files:

- `~/.claude/credentials.json` — authentication credentials (from `claude login`)
- `~/.claude/settings.json` — global settings (model preferences, defaults)
- `~/.claude/todos/` — persistent task tracking across sessions

You will not need to edit these files directly in most cases. Claude Code provides commands to configure settings when needed, and the CLAUDE.md system (covered in Lesson 15) provides project-level configuration.

**Checking your current model:**

Claude Code defaults to a Sonnet-tier model. You can see what model is being used by running:

```bash
claude --model claude-opus-4-5 "What model are you?"
# Or just ask in a session: "What model and version are you?"
```

For most tasks, the default model is appropriate. Lesson 3 covered when to choose Haiku vs Sonnet vs Opus.

---

## Key Takeaways

- Claude Code installs via `npm install -g @anthropic-ai/claude-code`
- Authentication via `ANTHROPIC_API_KEY` environment variable is the most portable approach
- Starting a session is just `claude` in your project directory
- Claude Code uses tools in real time — you can watch it read files and run commands as it works
- Configuration lives in `~/.claude/`; project-specific configuration uses CLAUDE.md (Lesson 15)

---

## Common Mistakes to Avoid

**Using an old Node.js version.** Node 16 and below may have compatibility issues. Use Node 18 or 20 LTS.

**Hardcoding your API key in shell scripts or committing it to version control.** The API key is a secret. Use environment variables, not hardcoded values. Add `.env` files to `.gitignore`.

**Starting Claude Code outside a project directory.** Claude Code works best when run from the root of a project it can explore. Starting from your home directory or an empty directory gives it nothing to work with.

---

Next Lesson: In **Lesson 10: Your First Conversation**, we explore the conversation flow in depth — how to ask questions effectively, how to understand Claude Code's responses, and how to build a productive back-and-forth with the agent.

---

[Back to Section Overview](./README.md) | [Next Lesson: Your First Conversation →](./lesson-10-your-first-conversation.md)
