---
phase: 09-content-foundations-s1-4
plan: "01"
subsystem: content
tags: [data-engineering, prose-lessons, section-1, markdown-content]
dependency_graph:
  requires: []
  provides:
    - courses/data-engineering/01-intro-data-engineering/ (8 lessons + README)
  affects:
    - lib/content.ts getAllCourses() (filesystem discovery picks up new directory)
tech_stack:
  added: []
  patterns:
    - Prose-only lessons with MDX callout components (Tip, Warning, Info)
    - Standard lesson format: H1 title, metadata line, ## sections, footer nav
key_files:
  created:
    - courses/data-engineering/01-intro-data-engineering/README.md
    - courses/data-engineering/01-intro-data-engineering/lesson-01-what-is-data-engineering.md
    - courses/data-engineering/01-intro-data-engineering/lesson-02-the-modern-data-stack.md
    - courses/data-engineering/01-intro-data-engineering/lesson-03-python-for-data-engineering.md
    - courses/data-engineering/01-intro-data-engineering/lesson-04-data-pipeline-concepts.md
    - courses/data-engineering/01-intro-data-engineering/lesson-05-batch-vs-streaming.md
    - courses/data-engineering/01-intro-data-engineering/lesson-06-data-storage-fundamentals.md
    - courses/data-engineering/01-intro-data-engineering/lesson-07-data-quality-overview.md
    - courses/data-engineering/01-intro-data-engineering/lesson-08-de-roles-and-tools.md
  modified: []
decisions:
  - "Prose-only lessons (no PracticeBlock) for Section 1 — conceptual foundation before hands-on sections"
  - "MDX callouts (Tip, Warning, Info) used contextually to highlight critical insights per plan spec"
  - "Lesson 8 footer links to Section 2 (../02-pandas-fundamentals/) rather than Next Lesson as it is the last in section"
metrics:
  duration: "~45 minutes"
  completed: "2026-03-14T17:35:18Z"
  tasks_completed: 2
  files_created: 9
---

# Phase 9 Plan 01: Section 1 — Introduction to Data Engineering Summary

**One-liner:** 8 prose-only DE landscape lessons covering what DE is, the modern data stack, Python's role, pipeline anatomy, batch vs streaming, storage types, data quality dimensions, and DE career roles.

---

## What Was Built

Created the complete `courses/data-engineering/01-intro-data-engineering/` directory with a README and 8 lesson markdown files. All content is explanatory prose with no interactive code blocks or PracticeBlock components. This section establishes the mental model and vocabulary for the entire Data Engineering course.

### Lesson Content Summary

| File | Title | Duration | Key Content |
|------|-------|----------|-------------|
| lesson-01 | What is Data Engineering? | 30 min | DE definition, DE vs data science vs analytics, day-in-the-life |
| lesson-02 | The Modern Data Stack | 40 min | 4-layer architecture, ingestion/storage/transformation/serving, OSS vs managed |
| lesson-03 | Python for Data Engineering | 35 min | Why Python dominates DE, 7 core libraries, Python vs Scala, course map |
| lesson-04 | Data Pipeline Concepts | 40 min | Pipeline anatomy, ETL vs ELT, idempotency, incremental loading, failure modes |
| lesson-05 | Batch Processing vs Streaming | 40 min | Batch paradigm, streaming use cases, micro-batching, decision framework |
| lesson-06 | Data Storage Fundamentals | 45 min | OLTP vs OLAP, data warehouse, data lake, Lakehouse pattern, file formats |
| lesson-07 | Introduction to Data Quality | 35 min | 6 quality dimensions, where quality breaks, data contracts and monitoring |
| lesson-08 | DE Roles and the Tooling Landscape | 35 min | 5 data team roles, toolbox categories, course scope rationale, learning path |

### Callouts Used

- `<Info>` in lessons 02, 03, 05, 08 — contextual informational highlights
- `<Tip>` in lessons 03, 06 — practical advice callouts
- `<Warning>` in lessons 04, 07 — critical reliability and quality warnings

### Format Verification

- All 8 lessons parse with `# Lesson N: ...` H1 matching `TITLE_REGEX`
- All 8 lessons have `**Course:** Data Engineering | **Duration:** ... | **Level:** Intermediate` metadata line
- All 8 lessons contain `## Key Takeaways`, `## Common Mistakes to Avoid`, `## Next Lesson Preview` (lesson-08 omits Next Lesson Preview per spec, has section link instead)
- No `PracticeBlock` or runnable code blocks anywhere in the section
- README.md present for `getAllCourses()` filesystem discovery

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Commits

| Hash | Description |
|------|-------------|
| fd95eaf | feat(v2.0): add Section 1 — Introduction to Data Engineering (8 lessons) |

---

## Self-Check

### Files Exist
- [x] courses/data-engineering/01-intro-data-engineering/README.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-01-what-is-data-engineering.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-02-the-modern-data-stack.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-03-python-for-data-engineering.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-04-data-pipeline-concepts.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-05-batch-vs-streaming.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-06-data-storage-fundamentals.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-07-data-quality-overview.md
- [x] courses/data-engineering/01-intro-data-engineering/lesson-08-de-roles-and-tools.md

### Commits Exist
- [x] fd95eaf — feat(v2.0): add Section 1 — Introduction to Data Engineering (8 lessons)

## Self-Check: PASSED
