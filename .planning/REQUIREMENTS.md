# Requirements: JustLearn

**Defined:** 2026-03-16
**Core Value:** Students can learn programming and data skills step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification

## v2.1 Requirements

Requirements for AI Learning Assistant milestone. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Browser detects WebGPU support and shows graceful fallback (NotebookLM link) when unavailable
- [ ] **INFRA-02**: Model download displays progress bar with phase indicators (fetch → cache → compile → ready)
- [ ] **INFRA-03**: COEP/COOP headers configured in next.config.mjs for SharedArrayBuffer support in production
- [ ] **INFRA-04**: WebLLM engine uses module-level singleton pattern surviving route navigation
- [ ] **INFRA-05**: Pyodide and WebLLM use mutual-exclusion lazy loading to prevent memory crashes on <8GB devices

### AI Chat

- [ ] **CHAT-01**: User can open an inline sliding chat panel on any lesson page
- [ ] **CHAT-02**: AI responses stream token-by-token with markdown rendering
- [ ] **CHAT-03**: AI receives current lesson context for lesson-specific answers
- [ ] **CHAT-04**: AI searches across all 218 lessons via RAG for cross-topic answers with source citations
- [ ] **CHAT-05**: Each course has a configurable AI teacher persona (name, system prompt, tone, teaching style)
- [ ] **CHAT-06**: Chat maintains per-session conversation history for multi-turn context

### RAG Pipeline

- [ ] **RAG-01**: Build-time script chunks all lesson markdown by heading boundaries and generates embeddings
- [ ] **RAG-02**: Pre-computed embeddings served as static JSON from public/ directory
- [ ] **RAG-03**: In-browser vector search retrieves top-K relevant chunks using HNSW index

### Practice AI

- [ ] **PRAC-01**: User can click "Get Hint" in PracticeBlock to receive Socratic guidance without direct answers
- [ ] **PRAC-02**: AI explains Python/pandas errors when code execution fails in practice exercises
- [ ] **PRAC-03**: AI responses cite the source lesson section the answer comes from

## v2.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced AI

- **ADV-01**: Multi-course RAG scope filtering (per-course retrieval vs. cross-course)
- **ADV-02**: Voice input via Web Speech API
- **ADV-03**: AI-generated practice problem variants
- **ADV-04**: Socratic mode toggle (allow "just tell me" mode)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side LLM API (OpenAI/Claude) | Breaks SSG, introduces API costs, eliminates privacy positioning |
| Always-on AI model loading | Hostile UX for 1-4GB model download; must be lazy/on-demand |
| AI-generated lesson content | Hallucination risk unacceptable in educational context |
| AI-graded code submissions | LLMs produce confident wrong grades; use Pyodide test assertions |
| Per-user AI personalization | Requires auth system (out of scope) |
| Multi-turn agentic AI (code execution) | Prompt injection attack surface; users run code manually |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 13 | Pending |
| INFRA-02 | Phase 13 | Pending |
| INFRA-03 | Phase 13 | Pending |
| INFRA-04 | Phase 13 | Pending |
| INFRA-05 | Phase 13 | Pending |
| CHAT-01 | Phase 15 | Pending |
| CHAT-02 | Phase 15 | Pending |
| CHAT-03 | Phase 15 | Pending |
| CHAT-04 | Phase 15 | Pending |
| CHAT-05 | Phase 14 | Pending |
| CHAT-06 | Phase 15 | Pending |
| RAG-01 | Phase 14 | Pending |
| RAG-02 | Phase 14 | Pending |
| RAG-03 | Phase 14 | Pending |
| PRAC-01 | Phase 15 | Pending |
| PRAC-02 | Phase 15 | Pending |
| PRAC-03 | Phase 15 | Pending |

**Coverage:**
- v2.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after roadmap creation (traceability complete)*
