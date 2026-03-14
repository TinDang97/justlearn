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

