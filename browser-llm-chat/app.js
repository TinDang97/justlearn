/**
 * Browser LLM Chat — WebLLM + Qwen via WebGPU
 *
 * HOW THIS WORKS
 * ==============
 * WebLLM (https://github.com/mlc-ai/web-llm) uses pre-compiled MLC-format models
 * that are hosted on HuggingFace and streamed directly into the browser.
 *
 * IMPORTANT: These are NOT the same as Unsloth GGUF exports.
 * WebLLM requires models compiled with MLC-LLM's model compilation pipeline.
 *
 * HOW TO USE A CUSTOM FINE-TUNED (UNSLOTH) MODEL
 * ================================================
 * 1. Export your fine-tuned model to a standard HuggingFace safetensors format.
 *    Unsloth provides this via: model.save_pretrained("my-model")
 *
 * 2. Compile the model to MLC format using the MLC-LLM compiler:
 *    https://llm.mlc.ai/docs/compilation/compile_models.html
 *    Command: mlc_llm compile ./my-model --quantization q4f16_1 -o ./my-model-mlc/
 *
 * 3. Upload the compiled model weights + mlc-chat-config.json to HuggingFace.
 *
 * 4. Register the custom model in WebLLM's appConfig:
 *    const myModel = {
 *      model: "https://huggingface.co/your-org/my-model-mlc",
 *      model_id: "my-model-q4f16_1-MLC",
 *      model_lib: webllm.modelLibURLPrefix + webllm.modelVersion + "/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
 *    };
 *    const engine = await webllm.CreateMLCEngine("my-model-q4f16_1-MLC", { appConfig: { model_list: [myModel] } });
 *
 * See full guide: https://llm.mlc.ai/docs/deploy/javascript.html
 */

import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// ─── Configuration ──────────────────────────────────────────────────────────

/**
 * Preferred model ID from WebLLM's pre-compiled catalog.
 *
 * Qwen2.5-3B-Instruct-q4f16_1-MLC is the best available Qwen model for browser
 * inference: small enough to fit in typical GPU VRAM (~3–4 GB) while still being
 * capable for Q&A tasks.
 *
 * To see all available models, open DevTools after page load and inspect the
 * console output — we log all Qwen models from the catalog below.
 */
const PREFERRED_MODEL_ID = "Qwen2.5-3B-Instruct-q4f16_1-MLC";

const SYSTEM_PROMPT =
  "You are a helpful AI assistant running locally in the browser via WebGPU. Be concise and helpful.";

// ─── DOM refs ────────────────────────────────────────────────────────────────

const statusText = document.getElementById("status-text");
const modelBadge = document.getElementById("model-badge");
const progressBar = document.getElementById("progress-bar");
const progressDetail = document.getElementById("progress-detail");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ─── State ───────────────────────────────────────────────────────────────────

/** @type {webllm.MLCEngineInterface | null} */
let engine = null;

/** @type {Array<{role: string, content: string}>} */
const conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

// ─── WebGPU Detection ────────────────────────────────────────────────────────

function checkWebGPU() {
  if (!navigator.gpu) {
    showFatalError(
      "WebGPU not available",
      "Your browser does not support WebGPU. Please use Chrome 113+ on a device with a compatible GPU. " +
        "On Windows/Linux, make sure hardware acceleration is enabled in Chrome settings."
    );
    return false;
  }
  return true;
}

function showFatalError(title, detail) {
  statusText.textContent = title;
  statusText.style.color = "var(--color-error)";
  progressDetail.textContent = detail;
  progressBar.style.width = "0%";
  progressBar.style.backgroundColor = "var(--color-error)";
  modelBadge.textContent = "Unavailable";
  modelBadge.classList.add("badge-error");
}

// ─── Engine Initialization ───────────────────────────────────────────────────

async function initEngine() {
  if (!checkWebGPU()) return;

  // Log available Qwen models from catalog (helps user identify alternatives)
  try {
    const allModels = webllm.prebuiltAppConfig.model_list;
    const qwenModels = allModels.filter((m) =>
      m.model_id.toLowerCase().includes("qwen")
    );
    console.group("Available Qwen models in WebLLM catalog:");
    qwenModels.forEach((m) => console.log(m.model_id));
    console.groupEnd();
  } catch (err) {
    console.warn("Could not enumerate model catalog:", err);
  }

  statusText.textContent = "Loading model…";
  progressDetail.textContent =
    "Downloading model shards from HuggingFace CDN. First load is ~1.5–2 GB.";

  try {
    engine = await webllm.CreateMLCEngine(PREFERRED_MODEL_ID, {
      initProgressCallback: onInitProgress,
    });

    // Ready
    modelBadge.textContent = PREFERRED_MODEL_ID;
    modelBadge.classList.add("badge-ready");
    statusText.textContent = "Model ready";
    progressBar.style.width = "100%";
    progressBar.style.backgroundColor = "var(--color-success)";
    progressDetail.textContent =
      "Model loaded and running locally. Weights are cached — next load will be instant.";

    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();

    appendMessage(
      "assistant",
      "Model loaded! I am ready to chat. What would you like to know?"
    );
  } catch (err) {
    console.error("Engine initialization failed:", err);
    showFatalError(
      "Failed to load model",
      `Error: ${err.message || err}. Check the browser console for details.`
    );
  }
}

/**
 * @param {{ progress: number, text: string }} report
 */
function onInitProgress(report) {
  const pct = Math.round((report.progress ?? 0) * 100);
  progressBar.style.width = `${pct}%`;
  progressDetail.textContent = report.text ?? "";
  if (pct > 0) {
    statusText.textContent = `Loading model… ${pct}%`;
  }
}

// ─── Chat Logic ──────────────────────────────────────────────────────────────

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = userInput.value.trim();
  if (!userText || !engine) return;

  userInput.value = "";
  userInput.style.height = "auto";
  setInputEnabled(false);

  appendMessage("user", userText);
  conversationHistory.push({ role: "user", content: userText });

  const assistantBubble = appendMessage("assistant", "");
  const tokenSpan = assistantBubble.querySelector(".message-content");
  let fullReply = "";

  try {
    const stream = await engine.chat.completions.create({
      messages: conversationHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      fullReply += delta;
      tokenSpan.textContent = fullReply;
      scrollToBottom();
    }

    conversationHistory.push({ role: "assistant", content: fullReply });
  } catch (err) {
    console.error("Chat completion failed:", err);
    tokenSpan.textContent =
      "[Error generating response. Check the console for details.]";
    tokenSpan.style.color = "var(--color-error)";
  } finally {
    setInputEnabled(true);
    userInput.focus();
  }
});

// Auto-grow textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = `${Math.min(userInput.scrollHeight, 160)}px`;
});

// Send on Enter (Shift+Enter for newline)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

// ─── DOM Helpers ─────────────────────────────────────────────────────────────

/**
 * Append a message bubble and return the bubble element.
 * @param {"user"|"assistant"} role
 * @param {string} text
 * @returns {HTMLElement}
 */
function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const content = document.createElement("span");
  content.className = "message-content";
  content.textContent = text;

  bubble.appendChild(content);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setInputEnabled(enabled) {
  userInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

// ─── Boot ────────────────────────────────────────────────────────────────────

initEngine();
