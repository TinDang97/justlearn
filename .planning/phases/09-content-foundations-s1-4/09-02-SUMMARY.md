---
phase: 09-content-foundations-s1-4
plan: 02
subsystem: content
tags: [pandas, data-engineering, mdx, practiceblock, pyodide, interactive-lessons]

requires:
  - phase: 08-pyodide-pandas
    provides: "PracticeBlock MDX component, Pyodide + micropip pandas execution runtime"

provides:
  - "12 Section 2 lesson markdown files covering pandas fundamentals (Series through section review)"
  - "README.md with 12-lesson table, learning objectives, and section navigation"
  - "27 PracticeBlocks across 12 lessons with initialCode and solution for interactive practice"
  - "Integrative section review (lesson-12) using orders dataset combining all Section 2 skills"

affects:
  - 09-content-foundations-s1-4 (plan 03, 04 — subsequent sections depend on pandas knowledge)
  - content discovery via lib/content.ts getAllCourses() filesystem scan

tech-stack:
  added: []
  patterns:
    - "Lesson format: H1 title, metadata line (Course | Duration | Level), Learning Objectives, Prerequisites, Lesson Outline with numbered Parts, Key Takeaways, Common Mistakes, navigation footer"
    - "PracticeBlock props: prompt (required), initialCode (template literal with \\n), hint, solution (complete working code)"
    - "Callout components: <Info>, <Warning>, <Tip> used inline within lesson prose"
    - "PracticeBlocks in each lesson use self-contained code (imports included in initialCode and solution)"

key-files:
  created:
    - courses/data-engineering/02-pandas-fundamentals/README.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-01-series-and-dataframe-intro.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-02-creating-series.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-03-creating-dataframes.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-04-indexing-and-selection.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-05-boolean-filtering.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-06-column-operations.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-07-dtypes-and-type-inspection.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-08-sorting-and-ranking.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-09-basic-statistics.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-10-dataframe-shape-and-info.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-11-renaming-and-reindexing.md
    - courses/data-engineering/02-pandas-fundamentals/lesson-12-section-review-pandas-basics.md
  modified: []

key-decisions:
  - "Lesson 01 has 1 PracticeBlock (pd.__version__ + basic Series) rather than none — intro lessons benefit from at least one hands-on confirmation even when the focus is conceptual"
  - "All PracticeBlock code is self-contained (imports included) so each block runs independently in Pyodide without state from prior blocks"
  - "Lesson 12 section review uses a single consistent orders dataset across all 4 exercises to build progressive complexity (load → transform → analyze → rename)"
  - "Used pandas 2.x corr() without the numeric_only argument since the DataFrame in lesson-09 only has numeric columns — avoids FutureWarning noise in practice blocks"

patterns-established:
  - "Pattern: Each lesson Part maps to a named H3 section (### Part N: Topic), keeping content scannable by the TOC scroll spy"
  - "Pattern: Warning callouts used for inclusive/exclusive slice confusion (loc vs iloc) and & vs and for boolean ops — highest-frequency beginner errors"
  - "Pattern: Solution code includes print statements so Pyodide output is visible to students (not just assignment with no output)"
  - "Pattern: Multi-step exercises scaffold — exercise 1 builds the DataFrame, exercise 2 operates on it using the same initialCode setup"

requirements-completed:
  - CONT-02

duration: 45min
completed: 2026-03-15
---

# Phase 9 Plan 02: Section 2 — Pandas Fundamentals Summary

**27 PracticeBlocks across 12 pandas lessons covering Series, DataFrame creation, loc/iloc, boolean filtering, column ops, dtypes, sorting, statistics, shape/info, renaming, and an orders dataset section review**

## Performance

- **Duration:** 45 min
- **Started:** 2026-03-15T00:00:00Z
- **Completed:** 2026-03-15T00:45:00Z
- **Tasks:** 2
- **Files modified:** 13 (12 lessons + README)

## Accomplishments

- Created all 12 Section 2 lessons with correct H1 titles and metadata lines parseable by `lib/content.ts`
- 27 PracticeBlocks total (min 1 per lesson, max 4 in lesson-12), all with `initialCode` and `solution` using pandas 2.x API
- Section review (lesson-12) uses the exact orders dict from the plan spec — 4 exercises building progressively: load+inspect → add column+filter+sort → value_counts+category stats → rename+set_index
- Added `<Info>`, `<Warning>`, `<Tip>` callouts at the highest-risk conceptual points (loc inclusive vs iloc exclusive, `&` not `and`, `.astype()` return value, `.drop()` return value)

## Task Commits

1. **Task 1: README and lessons 1-6** - `57cd418` (feat)
2. **Task 2: Lessons 7-12** - `e658e1c` (feat)

## Files Created/Modified

- `courses/data-engineering/02-pandas-fundamentals/README.md` - Section overview with 12-lesson table and learning objectives
- `courses/data-engineering/02-pandas-fundamentals/lesson-01-series-and-dataframe-intro.md` - Why pandas, Series anatomy, DataFrame anatomy, DE workflow
- `courses/data-engineering/02-pandas-fundamentals/lesson-02-creating-series.md` - Series from list/dict/scalar, custom index, attributes, vectorized ops
- `courses/data-engineering/02-pandas-fundamentals/lesson-03-creating-dataframes.md` - Dict of lists, list of dicts, shape/columns/dtypes attributes
- `courses/data-engineering/02-pandas-fundamentals/lesson-04-indexing-and-selection.md` - Column selection, loc (label/inclusive), iloc (position/exclusive), when to use each
- `courses/data-engineering/02-pandas-fundamentals/lesson-05-boolean-filtering.md` - Boolean masks, & | ~ operators, .query() with @variable reference
- `courses/data-engineering/02-pandas-fundamentals/lesson-06-column-operations.md` - Add/modify/drop columns, .apply() with lambda, vectorized vs apply performance
- `courses/data-engineering/02-pandas-fundamentals/lesson-07-dtypes-and-type-inspection.md` - 6 dtypes, .dtypes/.info()/.dtype, .astype(), object vs StringDtype
- `courses/data-engineering/02-pandas-fundamentals/lesson-08-sorting-and-ranking.md` - sort_values single+multi, sort_index, rank with tie methods, nlargest/nsmallest
- `courses/data-engineering/02-pandas-fundamentals/lesson-09-basic-statistics.md` - describe(), mean/median/std, value_counts(normalize=True), corr(), nunique/unique
- `courses/data-engineering/02-pandas-fundamentals/lesson-10-dataframe-shape-and-info.md` - shape, info() interpretation, head/tail, sample(random_state), isnull().sum()
- `courses/data-engineering/02-pandas-fundamentals/lesson-11-renaming-and-reindexing.md` - rename(columns={}), .columns assignment, set_index, reset_index, reindex
- `courses/data-engineering/02-pandas-fundamentals/lesson-12-section-review-pandas-basics.md` - Quick reference table, orders dataset, 4 progressive exercises

## Decisions Made

- Lesson 01 includes 1 PracticeBlock (version check + basic Series) rather than zero — even conceptual intro lessons benefit from one hands-on confirmation step
- All PracticeBlock code is self-contained with imports included in both initialCode and solution — each block runs independently in Pyodide without shared state
- Section review (lesson-12) uses a single consistent orders dataset across all 4 exercises — builds progressive complexity without requiring students to remember earlier exercise output
- Used `df.corr()` without `numeric_only=True` in lesson-09 since the example DataFrames only contain numeric columns — keeps the code clean without triggering FutureWarning in pandas 2.x

## Deviations from Plan

None — plan executed exactly as written. All 12 lessons created with specified content, PracticeBlock counts match or exceed plan minimums, and lesson-12 uses the exact orders dict from the plan spec.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required. Lessons are static markdown files; PracticeBlocks execute via the existing Pyodide + micropip pandas setup from Phase 8.

## Next Phase Readiness

- Section 2 complete — students can create Series and DataFrames, select/filter data, inspect dtypes, and compute basic statistics
- Ready for Phase 09 Plan 03: Section 3 (Data Loading & File Formats)
- No blockers

---
*Phase: 09-content-foundations-s1-4*
*Completed: 2026-03-15*
