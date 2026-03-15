# Quick Task 4: Research to deploy Unsloth model (Qwen 3.5 4B) in Chrome - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Task Boundary

Research and build a working prototype to deploy an Unsloth fine-tuned model (like Qwen 3.5 4B from https://unsloth.ai/docs/models/qwen3.5-4B) running directly in Chrome browser for interactive chat.

</domain>

<decisions>
## Implementation Decisions

### Deployment Approach
- In-browser inference via WebGPU/WebLLM — no server needed, fully client-side
- Model runs directly in the browser using WebGPU acceleration

### Output Deliverable
- Working prototype — actual HTML + JS code that runs the model in Chrome
- Not just a research doc or guide, but runnable code

### Use Case
- Chat / Q&A — interactive conversational AI in the browser
- User types messages, model responds in real-time

### Claude's Discretion
- Choice of specific WebGPU framework (WebLLM, Transformers.js, etc.)
- Model quantization format (GGUF, ONNX, etc.) based on browser compatibility
- UI framework for the chat interface

</decisions>

<specifics>
## Specific Ideas

- Reference model: Qwen 3.5 4B from Unsloth (https://unsloth.ai/docs/models/qwen3.5-4B)
- Must work in Chrome with WebGPU support
- Unsloth provides optimized/quantized model exports — research which export format works for in-browser inference

</specifics>
