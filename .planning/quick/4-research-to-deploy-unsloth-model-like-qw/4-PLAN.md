---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - browser-llm-chat/index.html
  - browser-llm-chat/app.js
  - browser-llm-chat/style.css
autonomous: false
requirements: [QUICK-4]
must_haves:
  truths:
    - "User can open index.html in Chrome and see a chat interface"
    - "Model downloads and loads via WebGPU on first visit"
    - "User can type a message and receive a streamed response from Qwen model"
    - "Chat history is visible in the conversation area"
  artifacts:
    - path: "browser-llm-chat/index.html"
      provides: "Entry point HTML with chat UI structure"
    - path: "browser-llm-chat/app.js"
      provides: "WebLLM engine initialization, chat logic, streaming"
    - path: "browser-llm-chat/style.css"
      provides: "Chat interface styling"
  key_links:
    - from: "browser-llm-chat/app.js"
      to: "@mlc-ai/web-llm (CDN)"
      via: "ES module import from jsDelivr CDN"
      pattern: "import.*web-llm"
    - from: "browser-llm-chat/app.js"
      to: "WebGPU"
      via: "WebLLM engine uses navigator.gpu internally"
      pattern: "CreateMLCEngine|MLCEngine"
---

<objective>
Build a standalone browser-based chat prototype that runs a Qwen3 model locally via WebGPU using the MLC-AI WebLLM library. Zero server dependencies — just open index.html in Chrome.

Purpose: Prove that an Unsloth-compatible Qwen model can run entirely client-side in Chrome with WebGPU acceleration for interactive chat/Q&A.
Output: A `browser-llm-chat/` directory with 3 files (HTML, JS, CSS) that work by opening index.html directly or via a local HTTP server.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/4-research-to-deploy-unsloth-model-like-qw/4-CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create WebLLM chat prototype with Qwen model</name>
  <files>browser-llm-chat/index.html, browser-llm-chat/app.js, browser-llm-chat/style.css</files>
  <action>
Create a `browser-llm-chat/` directory at the project root with three files:

**index.html:**
- Minimal HTML5 page with meta viewport for responsiveness
- Import `@mlc-ai/web-llm` from jsDelivr CDN as ES module: `https://esm.run/@mlc-ai/web-llm`
- Chat container with: model status/progress bar area, message history area, input form (textarea + send button)
- Link to style.css and app.js (type="module")

**app.js:**
- Import `CreateMLCEngine` (or `MLCEngine`) from the WebLLM CDN
- Use model ID `Qwen2.5-3B-Instruct-q4f16_1-MLC` (Qwen 2.5 3B quantized, closest available pre-compiled Qwen model in WebLLM's model catalog that fits in browser VRAM). Note: WebLLM uses pre-compiled MLC format models from HuggingFace, not raw GGUF. Qwen3.5-4B may not be in the catalog yet — use the best available Qwen model. Check `webllm.prebuiltAppConfig.model_list` at runtime and log available Qwen models to console to help user identify alternatives.
- Show download/initialization progress via `initProgressCallback` — update a progress bar and status text as model shards download
- On form submit: disable input, append user message to chat, call `engine.chat.completions.create()` with streaming enabled, append assistant tokens as they arrive, re-enable input when done
- Handle errors gracefully: detect missing WebGPU support (`!navigator.gpu`), show clear error if browser unsupported
- System prompt: "You are a helpful AI assistant running locally in the browser via WebGPU. Be concise and helpful."
- Maintain conversation history array for multi-turn chat context

**style.css:**
- Clean, modern chat UI: centered container (max-width 720px), message bubbles (user right-aligned blue, assistant left-aligned gray), monospace for code blocks
- Progress/status area at top with a visual progress bar
- Input area fixed at bottom of chat container with a textarea that grows and a send button
- Responsive: works on desktop Chrome (primary target)
- Dark/light neutral theme — light background, dark text

**Key technical notes:**
- WebLLM models are pre-compiled to MLC format and hosted on HuggingFace. They are NOT the same as Unsloth GGUF exports. This prototype demonstrates the concept of running Qwen models in-browser. For actual Unsloth fine-tuned models, one would need to compile them using MLC-LLM's model compilation pipeline.
- Add a comment block at the top of app.js explaining: (1) how to use a custom fine-tuned model with MLC-LLM compilation, (2) link to MLC-LLM docs for model compilation, (3) that Unsloth exports need conversion to MLC format first.
- First load downloads ~1.5-2GB of model weights (cached by browser afterward)
  </action>
  <verify>
    <automated>test -f browser-llm-chat/index.html && test -f browser-llm-chat/app.js && test -f browser-llm-chat/style.css && echo "All files exist" && grep -q "web-llm" browser-llm-chat/app.js && grep -q "WebGPU" browser-llm-chat/app.js && grep -q "Qwen" browser-llm-chat/app.js && echo "Key patterns found"</automated>
  </verify>
  <done>
    - Three files exist in browser-llm-chat/
    - index.html loads WebLLM from CDN and references app.js as ES module
    - app.js initializes WebLLM engine with a Qwen model, handles streaming chat completions, shows progress
    - style.css provides a usable chat interface layout
    - Opening in Chrome with WebGPU downloads model and enables chat (manual verification by user)
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify browser chat works end-to-end</name>
  <files>browser-llm-chat/index.html</files>
  <action>User verifies the prototype runs correctly in Chrome with WebGPU.</action>
  <what-built>Browser-based LLM chat running Qwen model via WebGPU — no server required</what-built>
  <how-to-verify>
    1. Start a local server: `cd browser-llm-chat && python3 -m http.server 8080`
    2. Open Chrome and navigate to `http://localhost:8080`
    3. Wait for model to download (progress bar should show shard downloads, ~1.5-2GB first time)
    4. Once loaded, type "What is WebGPU?" and press Send
    5. Verify: response streams in token-by-token from the local Qwen model
    6. Try a follow-up message to test multi-turn conversation
    Note: Requires Chrome 113+ with WebGPU enabled and a GPU with sufficient VRAM (~3-4GB)
  </how-to-verify>
  <verify>User confirms chat works</verify>
  <done>User has approved the prototype or provided feedback for fixes</done>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- All 3 files exist in browser-llm-chat/ directory
- No external server dependencies — purely client-side
- WebLLM imported from CDN (no npm/build step needed)
- Qwen model ID referenced in code
- WebGPU detection and error handling present
- Streaming chat completions implemented
</verification>

<success_criteria>
Working browser chat prototype that loads a Qwen model via WebGPU and enables real-time conversational Q&A — confirmed by user testing in Chrome.
</success_criteria>

<output>
After completion, create `.planning/quick/4-research-to-deploy-unsloth-model-like-qw/4-01-SUMMARY.md`
</output>
