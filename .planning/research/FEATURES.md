# Feature Research

**Domain:** JustLearn v2.1 — AI Learning Assistant (in-browser LLM, RAG, practice hints, teacher personas)
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH (WebLLM/RAG patterns verified against official docs and academic surveys; educational AI patterns verified against live platforms)

---

## Existing v2.0 Baseline (Do Not Re-Implement)

These are BUILT. New AI features compose with them — never replace.

| Existing Feature | File/Component | v2.1 Role |
|-----------------|---------------|-----------|
| Pyodide PracticeBlock | `components/code-runner/` | Extend with AI hint injection point |
| NotebookLM integration | Referenced in PROJECT.md | Preserve alongside new AI chat; they serve different use cases |
| Full-text search (Fuse.js) | `components/search/` | Lesson index already exists — RAG reuses this content source |
| Lesson MD files | `courses/` directory | Primary RAG knowledge base (120+ Python lessons, 98 DE lessons) |
| Progress tracking (Zustand) | `lib/store/progress` | AI can read current lesson context from store |
| Per-lesson ToC with scroll spy | Lesson layout | Provides current section signal for lesson-aware context injection |
| Animated mindmaps | `components/mindmap/` | No changes needed |
| Lesson navigation (sidebar, prev/next, breadcrumbs) | Multiple components | No changes needed |

---

## Feature Landscape

### Table Stakes (Users Expect These for v2.1)

Features that must exist for the AI milestone to feel complete and useful. Missing any = AI assistant feels like a toy or demo.

| Feature | Why Expected | Complexity | Dependencies on Existing |
|---------|--------------|------------|--------------------------|
| **In-lesson AI chat panel** | Any AI-augmented learning platform has a chat interface alongside content; the absence signals "AI-washing" | HIGH | New: WebLLM service worker, chat panel UI component. Connects to: Zustand store for current lesson context, lesson MD content for system prompt injection |
| **Streaming response rendering** | Non-streaming AI chat (full response then display) feels broken in 2026; users expect incremental token display | MEDIUM | WebLLM supports streaming chat completions natively; needs a token-streaming React component (similar to chat.webllm.ai patterns) |
| **Model download progress indicator** | First load requires downloading 1-4GB model; without a clear download progress UI with percentage and ETA, users think the page is broken | MEDIUM | New: download progress component with bytes-level tracking. WebLLM emits progress events during model fetch |
| **Lesson-aware context injection** | AI that gives generic Python answers when you're on a pandas lesson is useless; the assistant must know what lesson the user is currently reading | MEDIUM | Reads current lesson slug from URL/router; injects lesson MD content into system prompt. Reuses content loading already done for page render |
| **WebGPU capability detection** | WebGPU is unavailable in Firefox (disabled by default) and some Chrome versions without a GPU; launching WebLLM against an unsupported browser crashes silently | LOW | New: browser capability check before model load attempt; graceful fallback UI message |
| **AI practice hints in PracticeBlock** | Interactive code blocks without AI help feel isolated; users need error explanations and step-by-step guidance without leaving the practice context | HIGH | Extends existing `PracticeBlock` component; requires AI service to be initialized before hint requests. Hint trigger: error output OR explicit "Get hint" button |
| **Clear AI scope messaging** | Users ask AI questions outside its knowledge (e.g., "will I get a job?"); without clear scope messaging, they're confused when AI deflects or hallucinates | LOW | System prompt configuration; UI copy in chat panel header |

### Differentiators (Competitive Advantage)

Features that set JustLearn apart from generic AI tutors and competing LMS platforms.

| Feature | Value Proposition | Complexity | Dependencies on Existing |
|---------|-------------------|------------|--------------------------|
| **Per-course teacher persona system** | Khanmigo and SchoolAI use generic AI; per-course personas (e.g., "Pythia" for Python course, "DE Dev" for Data Engineering) create a sense of a dedicated instructor who knows that specific course's content and tone | MEDIUM | New: course config extension with `aiPersona` field (name, systemPrompt, teachingStyle, tone). Loaded at lesson page render time. Composes with lesson-aware context injection |
| **Socratic hint mode (don't give away answers)** | Standard LLMs optimize for answering directly; effective tutoring requires guiding students to discover answers. Research shows direct-answer AI reduces learning retention. Socratic mode asks "What do you think might cause this?" before providing explanation | MEDIUM | System prompt engineering; hint mode toggle in PracticeBlock. Requires explicit persona prompt instruction: "Never provide the complete solution; guide with questions first" |
| **Full RAG across lesson corpus** | Lesson-aware context only injects the current lesson; RAG retrieves the most relevant lesson chunks across all 218 lessons when a question spans multiple topics (e.g., "you explained list comprehensions in the Python course, how does that apply here?") | HIGH | New: Transformers.js embeddings for all lesson content chunks; Voy (WASM) vector store; IndexedDB persistence. Runs entirely in-browser — no server |
| **Zero-cost, zero-server operation** | All inference and RAG runs in the browser via WebGPU + WebAssembly. No API keys, no backend, no per-user cost. Platform serves 300 students with no marginal AI cost | HIGH | WebLLM (inference) + Transformers.js (embeddings) + Voy (vector search). IndexedDB for model cache and vector persistence |
| **NotebookLM preservation** | NotebookLM provides audio overview and deep-dive features that in-browser LLM cannot match; keeping both creates a complementary AI stack rather than forcing users to choose | LOW | No code changes; UI clearly labels each AI entry point (inline chat vs. NotebookLM link) |
| **Per-session conversation memory** | AI remembers earlier questions in the same session ("Like I mentioned, you already struggled with X") creating a coherent tutoring arc rather than stateless Q&A | LOW | Chat history stored in component state (or Zustand slice); injected into WebLLM messages array as conversation context |
| **Warm-up compilation indicator** | WebLLM uses ahead-of-time shader compilation on first use after download; a secondary "Warming up..." indicator after download completes manages user expectations during compilation wait | LOW | WebLLM progress event differentiation: fetch phase vs. compile phase. Composable with download progress component |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like natural additions but create significant downstream problems for this platform.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Server-side LLM API (OpenAI/Anthropic)** | "Just use the API, it's easier and better quality" | Requires backend infrastructure (breaks static SSG), API costs scale with 300 students, requires API key management and secrets, eliminates privacy-first positioning | In-browser WebLLM. Accept quality tradeoff for privacy + zero-cost architecture |
| **Always-on AI (model loads on every page visit)** | "Make AI immediately available" | 1-4GB model download on first visit; shader compilation; significant memory footprint (~2-4GB VRAM). Loading on every lesson page load is user-hostile | Lazy initialization: AI loads only when user explicitly opens the chat panel or requests a hint; first-load download is gated behind user intent |
| **AI-generated lesson content replacement** | "Let AI generate lessons on-demand" | Hallucination risk in educational content is unacceptably high; RAG mitigates this but doesn't eliminate it for topics not in the corpus | AI answers questions about existing lesson content; does not generate new lessons. RAG grounds responses in verified MD content |
| **Multi-turn agentic AI (browsing web, executing code)** | "The AI should be able to run code to verify its answers" | Agent loops require external tool calls or server-side sandboxes; in-browser Pyodide execution is already available but wiring AI to control it creates prompt injection attack surface | AI provides code snippets for user to run manually in PracticeBlock; AI does not autonomously execute code |
| **Streaming to IndexedDB for vector persistence during session** | "Persist embeddings immediately as user reads" | IndexedDB writes during active inference cause UI jank; embedding computation during page load delays time-to-interactive | Pre-build all lesson embeddings at deploy time (Node.js script); store as static JSON artifact; load into Voy on first AI activation |
| **Per-user AI personalization (learning style tracking)** | "AI should adapt based on student history" | Requires user accounts and persistent storage per user identity; platform has no auth system and no user accounts (PROJECT.md: "out of scope") | Per-session context via conversation history; per-course persona provides subject-matter specialization without user identity |
| **AI-graded code submissions** | "AI can tell me if my code is correct" | LLMs produce confident wrong grades; educational platforms require trusted assessment; hallucinated correctness is worse than no grade | Pyodide runs actual test assertions for deterministic grading; AI provides qualitative hints, not pass/fail grades |

---

## Feature Dependencies

```
[WebLLM Engine (Core Dependency)]
    └──required-by──> [AI Chat Panel]
    └──required-by──> [AI Practice Hints]
    └──requires──> [WebGPU Capability Detection] (must gate initialization)
    └──requires──> [Model Download Progress Component] (UX during 1-4GB fetch)
    └──requires──> [Warm-up Compilation Indicator] (UX during shader compile)

[Lesson-Aware Context Injection]
    └──requires──> [Current lesson MD content] (already loaded for page render — extract and inject)
    └──requires──> [Current lesson slug/URL] (from Next.js router — available in layout)
    └──feeds-into──> [AI Chat Panel] (enriches system prompt)
    └──feeds-into──> [AI Practice Hints] (provides lesson context for hint generation)

[Per-Course Teacher Persona System]
    └──requires──> [Course config extension with aiPersona field]
    └──requires──> [WebLLM Engine] (persona is delivered via system prompt)
    └──feeds-into──> [AI Chat Panel] (persona shapes all chat responses)
    └──feeds-into──> [AI Practice Hints] (persona shapes hint tone/style)
    └──composes-with──> [Lesson-Aware Context Injection] (persona + lesson context combined)

[RAG — Full Corpus Retrieval]
    └──requires──> [Transformers.js] (all-MiniLM-L6-v2 for embedding generation)
    └──requires──> [Voy WASM] (in-browser vector store with HNSW indexing)
    └──requires──> [Pre-built lesson chunk embeddings] (build-time script, output: static JSON)
    └──requires──> [IndexedDB] (persist vector index across sessions)
    └──feeds-into──> [AI Chat Panel] (RAG results injected as context before generation)
    └──feeds-into──> [AI Practice Hints] (relevant lesson chunks ground hint generation)
    └──independent-of──> [WebLLM Engine] (embedding model is separate from generation model)

[AI Chat Panel]
    └──requires──> [WebLLM Engine]
    └──requires──> [Lesson-Aware Context Injection]
    └──requires──> [Streaming Response Renderer]
    └──enhanced-by──> [Per-Course Teacher Persona]
    └──enhanced-by──> [RAG — Full Corpus Retrieval]
    └──coexists-with──> [NotebookLM integration] (separate UI entry points)

[AI Practice Hints in PracticeBlock]
    └──requires──> [WebLLM Engine] (must be initialized before hint request)
    └──requires──> [Existing PracticeBlock component extension]
    └──requires──> [Lesson-Aware Context Injection] (hint must know what exercise the student is on)
    └──enhanced-by──> [Per-Course Teacher Persona] (hint tone matches course persona)
    └──enhanced-by──> [Socratic Hint Mode] (hint prompting strategy)

[Socratic Hint Mode]
    └──requires──> [System prompt engineering] (no code changes — prompt-only feature)
    └──requires──> [Per-Course Teacher Persona System] (Socratic behavior encoded in persona prompt)
    └──feeds-into──> [AI Practice Hints] (determines how hints are structured)

[Pre-built Lesson Chunk Embeddings]
    └──requires──> [Build-time Node.js script] (runs Transformers.js in Node, outputs JSON)
    └──requires──> [All 218+ lesson MD files] (chunks by section headings)
    └──feeds-into──> [RAG — Full Corpus Retrieval]
    └──independent-of──> [WebLLM Engine] (embedding runs before page load)
```

### Critical Dependency Notes

- **WebLLM is the hardest dependency.** WebGPU availability gates everything. Firefox users are locked out by default. Must detect and degrade gracefully before any AI initialization.
- **RAG embedding pre-build is architecturally critical.** Do NOT compute embeddings at runtime during page load — this would freeze the UI for 30+ seconds. Pre-build at deploy time (Next.js build script), store as static JSON artifact, load from IndexedDB cache on subsequent visits.
- **WebLLM and Transformers.js are separate models.** The embedding model (all-MiniLM-L6-v2 via Transformers.js, ~22MB) is much smaller than the generation model (Llama/Phi via WebLLM, 1-4GB). Load embedding model at RAG initialization; generation model only when user opens chat.
- **AI Practice Hints require WebLLM to already be initialized.** If user clicks "Get Hint" before model is loaded, show initialization progress inline — do not silently fail. Eager hint requests during model load should queue and resolve after initialization.
- **Per-course persona is purely prompt-based.** No model fine-tuning, no separate model per course. Persona = system prompt + course-specific lesson corpus in RAG index. This is a configuration feature, not an ML feature.

---

## MVP Definition for v2.1

### Launch With (P1 — define the milestone)

- [ ] **WebGPU capability detection with graceful fallback** — Gates all AI features; must be first. No AI initialization without confirmed WebGPU support
- [ ] **Model download progress + warm-up indicator** — UX prerequisite for model load; without this, 2-3 minute first-load appears as a broken page
- [ ] **Lesson-aware context injection** — Minimum viable AI relevance; without current lesson context, AI answers are generic and unhelpful
- [ ] **Per-course teacher persona system** — Core differentiator; persona config in course files, system prompt assembly at chat initialization
- [ ] **In-lesson AI chat panel with streaming** — Primary AI feature; slide-in panel, conversation history in session, streaming token render
- [ ] **AI practice hints in PracticeBlock** — "Get Hint" button in existing PracticeBlock; Socratic mode by default

### Add After Validation (P2 — after core AI is working)

- [ ] **RAG across full lesson corpus** — Highest complexity; requires pre-build pipeline, WASM vector store, IndexedDB persistence. Validate chat panel utility first, then add retrieval
- [ ] **Socratic mode toggle in PracticeBlock** — Allow students to opt into "just tell me" mode; default is Socratic. Add after hint baseline is validated

### Future Consideration (v2.2+)

- [ ] **Multi-course RAG with course-scoped retrieval** — RAG currently retrieves across all courses; adding per-course retrieval scope requires metadata filtering in Voy
- [ ] **Voice input to AI chat** — Web Speech API integration; deferred until text chat UX is validated
- [ ] **AI-generated practice problem variants** — New exercises based on lesson content; requires hallucination mitigation and human review pipeline before ship

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | WebGPU Required | Priority |
|---------|------------|---------------------|-----------------|----------|
| WebGPU detection + fallback | CRITICAL | LOW | Yes (it IS the gate) | P1 |
| Model download/warm-up indicator | HIGH | LOW | Yes | P1 |
| Lesson-aware context injection | HIGH | LOW | Yes | P1 |
| Per-course teacher persona | HIGH | LOW | Yes (prompt-only) | P1 |
| AI chat panel with streaming | HIGH | HIGH | Yes | P1 |
| AI practice hints in PracticeBlock | HIGH | MEDIUM | Yes | P1 |
| Socratic hint mode | MEDIUM | LOW | Yes (prompt-only) | P1 |
| RAG full corpus retrieval | MEDIUM | HIGH | Embedding: No; Generation: Yes | P2 |
| Pre-build embedding pipeline | MEDIUM | MEDIUM | No (Node.js build) | P2 |
| Multi-course RAG scope filter | LOW | LOW | No | P3 |
| Voice input | LOW | MEDIUM | No | P3 |

---

## Competitor Feature Analysis

Reference platforms for UX patterns and pedagogical design relevant to this milestone:

| Feature | Khanmigo (Khan Academy) | GitHub Copilot Chat | SchoolAI | Our Approach |
|---------|------------------------|---------------------|----------|--------------|
| AI chat placement | Floating sidebar alongside content | Inline in editor panel | Dedicated chat interface | Slide-in panel, lesson content remains visible |
| Lesson context awareness | Full Khan Academy lesson graph | File/code context | Teacher-uploaded course materials | Current lesson MD injected into system prompt; RAG for cross-lesson references |
| Hint strategy | Socratic questioning — never gives complete answers | Direct code completion | Configurable per teacher | Socratic by default (system prompt); "just tell me" toggle available |
| Teacher persona | Generic "Khanmigo" assistant | None | Teacher creates custom bot | Per-course persona defined in course config (name, tone, teaching style) |
| Privacy | Server-side (Khan Academy infrastructure) | Server-side (GitHub) | Server-side (SchoolAI) | Fully in-browser — no data leaves device (key differentiator) |
| Model | GPT-4 class (server) | GPT-4o (server) | GPT-4 class (server) | WebLLM (Phi-3-mini or Llama-3.2-3B) — smaller but private and free |
| Cost to platform | Per-token API cost | Subscription | Subscription | Zero marginal cost after initial build |

---

## Educational AI Best Practices (Research-Verified)

These inform implementation decisions, not just feature selection.

### Hallucination Mitigation (HIGH confidence — academic survey 2025)

RAG significantly reduces hallucination by grounding generation in retrieved lesson content. For educational use, this is non-negotiable: a student receiving confident wrong information about Python syntax does measurable learning harm. Mitigation strategies:

1. **RAG grounding** — retrieve relevant lesson chunks before generation; inject as context
2. **Scope restriction in system prompt** — "Only answer questions about the content in these lessons. If the question is outside this scope, say so clearly."
3. **Source citation** — when RAG retrieves a chunk, indicate which lesson it came from ("According to Lesson 3.2: Functions...")

### Socratic Pedagogy (HIGH confidence — multiple peer-reviewed sources 2024-2025)

Standard LLMs optimized for answering perform poorly as tutors: they give away solutions rather than guiding discovery. Research shows students who receive guided hints (questions before answers) outperform those receiving direct answers on subsequent independent problem-solving. Implementation implication: system prompt must explicitly instruct the model to ask clarifying questions before providing explanations.

### First-Load UX for Local Models (MEDIUM confidence — WebLLM docs + UX patterns article)

The download-then-compile lifecycle of WebLLM has four distinct phases users encounter:

1. **Model fetch** (1-4GB download, 2-10 min on average connection) — show byte-level progress with ETA
2. **Model cache** (IndexedDB) — subsequent visits skip download; communicate "loading from cache"
3. **WebGPU shader compilation** (30-60s, happens once after download) — show "Warming up..." distinct from download
4. **Inference ready** — clear "Ready" state; only then enable chat input and hint buttons

Skipping any of these phase indicators causes user abandonment.

### Privacy as Educational Differentiator (MEDIUM confidence — SchoolAI + Merlyn positioning)

FERPA and COPPA compliance drives institutional educational technology decisions. In-browser LLM eliminates the entire data-residency concern: student questions, errors, and conversation history never leave the device. This is a legitimate differentiator for any student who is privacy-conscious or in an institutional setting with data governance requirements. Surface this positioning in the AI panel UI ("All AI runs on your device. Nothing is sent to a server.").

---

## Implementation Notes by Feature

### AI Chat Panel

Slide-in panel component anchored to lesson layout right edge (or bottom on mobile). Contains: model status header (loading/ready), chat message list with streaming token append, user input textarea, send button. Conversation history kept in Zustand AI slice (or component state if simpler). On first open: trigger model download flow if not cached. System prompt assembled from: persona config + current lesson MD content (truncated to fit context window). Chat completions use WebLLM `chat.completions.create({ stream: true })` API.

### AI Practice Hints in PracticeBlock

Add "Get Hint" button to existing `PracticeBlock` component. On click: if WebLLM not initialized, show inline loading state and queue hint request. Hint prompt constructed from: persona system prompt + current lesson context + the student's current code + the error output (if any). Socratic mode (default): prompt instructs model to ask a diagnostic question before explaining. Direct mode (toggle): prompt instructs model to explain the error and suggest a fix.

### Per-Course Teacher Persona

Extend course config type with:
```typescript
aiPersona: {
  name: string           // e.g., "Pythia" for Python, "DE Dev" for Data Engineering
  systemPrompt: string   // teaching style and persona definition
  tone: 'encouraging' | 'direct' | 'socratic'
  scope: string          // what topics this persona is authoritative on
}
```
Persona loaded at lesson page render; injected as the first system message in every WebLLM conversation. This is a configuration-only feature — no ML work required.

### RAG Pre-Build Pipeline

Node.js script (`scripts/build-embeddings.ts`) runs at build time (or as a separate `pnpm build:embeddings` step):
1. Reads all lesson MD files from `courses/`
2. Chunks each lesson by H2/H3 headings (each chunk ~300-500 tokens)
3. Runs Transformers.js `all-MiniLM-L6-v2` model in Node.js to embed each chunk
4. Outputs `public/embeddings.json` (or per-course JSON files) with `{ chunkId, courseSlug, lessonSlug, heading, text, embedding: number[] }[]`

At runtime: load `embeddings.json`, hydrate Voy vector store, persist to IndexedDB. On subsequent visits: load from IndexedDB (skip JSON fetch). RAG query: embed user question with Transformers.js, search Voy for top-K chunks, inject retrieved chunks into generation context.

**Scale check:** 218 lessons × avg 5 chunks = ~1,090 chunks. Well within Voy's 5,000-10,000 chunk practical ceiling.

---

## Sources

- [WebLLM official documentation](https://webllm.mlc.ai/docs/) — streaming API, initialization lifecycle, model list — HIGH confidence
- [WebLLM GitHub repository](https://github.com/mlc-ai/web-llm) — model sizes, WebGPU requirements, Web Worker support — HIGH confidence
- [Building a Browser-Based RAG System with WebGPU — DEV Community](https://dev.to/emanuelestrazzullo/building-a-browser-based-rag-system-with-webgpu-h2n) — Transformers.js + Voy + WebLLM pattern — MEDIUM confidence
- [Privacy-Preserving RAG System in the Browser — SitePoint](https://www.sitepoint.com/browser-based-rag-private-docs/) — Voy + Transformers.js + IndexedDB pattern — MEDIUM confidence
- [RAG Chatbots for Education: A Survey — MDPI Applied Sciences 2025](https://www.mdpi.com/2076-3417/15/8/4234) — RAG architecture for educational applications — HIGH confidence (peer-reviewed)
- [Instruct, Not Assist: LLM-based Multi-Turn Planning and Hierarchical Questioning for Socratic Code Debugging — arXiv 2024](https://arxiv.org/abs/2406.11709) — Socratic tutoring via LLM, TreeInstruct architecture — HIGH confidence (peer-reviewed)
- [UX Patterns for Local AI Inference — SitePoint](https://www.sitepoint.com/ux-patterns-local-inference/) — download progress, warm-up, streaming UX — MEDIUM confidence
- [Khanmigo AI tutor](https://www.khanmigo.ai/) — Socratic hint approach, lesson context awareness — MEDIUM confidence (live platform inspection)
- [SchoolAI platform](https://schoolai.com/) — per-teacher persona, course customization, privacy positioning — MEDIUM confidence (live platform inspection)
- [Build a local and offline-capable chatbot with WebLLM — web.dev](https://web.dev/articles/ai-chatbot-webllm) — first-load UX patterns, Service Worker integration — HIGH confidence (Google official)

---

*Feature research for: JustLearn v2.1 AI Learning Assistant milestone*
*Researched: 2026-03-15*
