# Milestones

## v1.1 JustLearn UX Overhaul (Shipped: 2026-03-14)

**Phases completed:** 3 phases (4-6), 8 plans, 33 commits
**Codebase:** 7,035 LOC TypeScript/CSS | +4,669 lines added

**Key accomplishments:**
- Zustand progress store migrated from 12 course keys to unified `python` key with zero data loss
- 12 courses virtually consolidated into unified Python Course via section-map config (no file moves)
- JustLearn homepage with hero section, section overview cards, and progress tracking
- Course overview redesigned as accordion with per-section progress and collapsible sidebar
- Lesson pages enhanced with sticky ToC, scroll spy, scroll progress bar, and warm-neutral typography (18px/1.75)
- Code blocks upgraded with language badges, @shikijs/transformers diff/highlight/focus, and PracticeBlock MDX component

---

## v2.0 Data Engineering Course (Shipped: 2026-03-14)

**Phases completed:** 6 phases (7-12), 17 plans, ~49 commits
**Content:** 98 lessons across 10 sections + 3 bundled datasets
**Tests:** 286 passing (228 pre-v2.0 + 58 new)

**Key accomplishments:**
- Multi-course platform infrastructure: course registry, generalized routing, per-course progress tracking
- Homepage course catalog replacing single-course display
- Pandas support in Pyodide via micropip with loading indicator and DataFrame HTML rendering
- Dataset loading mechanism for in-browser practice exercises
- Data Engineering course: 10 sections covering intro, pandas fundamentals, file formats, data cleaning, transformation, ETL pipelines, SQL & databases, data quality, performance optimization, and real-world projects
- Cross-course navigation with recommendation banner and prerequisite notices
- Unified multi-course search with description field indexing
- Accessibility audit script (axe-core) for WCAG 2.1 AA compliance

---

## v2.1 AI Learning Assistant (Shipped: 2026-03-16)

**Phases completed:** 3 phases (13-15), 7 plans, ~19 commits
**New dependencies:** @mlc-ai/web-llm, @huggingface/transformers, streamdown
**Tests:** 417+ passing

**Key accomplishments:**
- In-browser LLM inference via WebGPU (WebLLM) with module-level singleton surviving route navigation
- COEP/COOP headers for SharedArrayBuffer support in production
- WebGPU capability detection with graceful NotebookLM fallback
- Pyodide + WebLLM mutual-exclusion lazy loading for memory safety
- Build-time RAG pipeline: 220 lessons chunked by heading boundary with pre-computed embeddings
- In-browser cosine similarity vector search over 3,766 lesson chunks
- Per-course AI teacher personas (Alex for Python, Sam for Data Engineering)
- Zustand chat store with streaming orchestration and 6-message history cap
- AIChatPanel sliding sheet with streaming markdown rendering via streamdown
- AIHintButton in PracticeBlock with Socratic guidance and auto error-explanation

---

