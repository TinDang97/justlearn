# Section 10: Real-World Projects

**Course:** Data Engineering | **Lessons:** 10 | **Level:** Advanced

This section puts everything together. Seven self-contained projects of increasing complexity, plus a course review and learning path forward.

## Projects

| # | Project | Skills | Deliverable |
|---|---------|--------|-------------|
| 1 | Sales Data Cleaner | S3, S4, S8 | Cleaning summary report |
| 2 | Log File Analyzer | S3, S4, S5, S9 | Error rate report |
| 3 | ETL Pipeline with Validation | S6, S7, S8 | Pipeline run log |
| 4 | Customer Segmentation | S4, S5, S8, S9 | RFM segment distribution |
| 5 | Performance Benchmark Suite | S9 | Timing comparison table |
| 6 | Data Quality Monitor | S6, S8, S9 | System health report |
| 7 | Multi-Source Pipeline | S4, S5, S6, S8 | Enrichment summary report |

**Section key:** S3=File I/O, S4=Data Cleaning, S5=Transformation, S6=ETL, S7=SQL, S8=Data Quality, S9=Performance

## Lessons

| # | Title | Type | Key Skill |
|---|-------|------|-----------|
| 1 | Project Overview and Setup | Guide | How to use project lessons; bundled dataset inventory |
| 2 | Project 1 — Sales Data Cleaner | Project | Profile → clean → validate → summarize |
| 3 | Project 2 — Log File Analyzer | Project | Groupby error rates + top-N message ranking |
| 4 | Project 3 — ETL Pipeline with Validation | Project | PipelineResult + contract enforcement |
| 5 | Project 4 — Customer Segmentation | Project | RFM with groupby + np.select |
| 6 | Project 5 — Performance Benchmark Suite | Project | Benchmark harness + vectorization comparison |
| 7 | Project 6 — Data Quality Monitor | Project | 4-dimension quality scoring + health report |
| 8 | Project 7 — Multi-Source Pipeline | Project | Key reconciliation + left merge + validation |
| 9 | Course Review and Patterns | Review | Decision tree for DE problems |
| 10 | Next Steps and Resources | Guide | Learning path beyond this course |

## Project Format

Each project lesson (lessons 2–8) follows this structure:

1. **Project Overview** — the real-world problem and deliverable
2. **Skills Integrated** — table mapping skills to source sections
3. **Architecture** — data flow diagram
4. **Dataset** — what data is available and its known quality issues
5. **Starter Code** — complete scaffold with `TODO` comments
6. **Step-by-Step Walkthrough** — explanation and solution code for each step
7. **Expected Output** — exact text the project should print
8. **Practice Exercises** — interactive `PracticeBlock` for the core step
9. **Extension Challenges** — three optional deeper challenges

## Prerequisites

Complete Sections 1–9 before starting projects. Each project states specific section prerequisites in its Skills Integrated table.

## Recommended Order

Complete projects in order (1 → 7). Projects build on each other:
- Projects 1–2: core pandas — cleaning and aggregation
- Projects 3–4: pipeline structure and business logic
- Projects 5–6: performance and quality monitoring
- Project 7: integration — everything together

## Datasets

All projects use bundled data (no external downloads required):

| Dataset | Rows | Columns | Used In |
|---------|------|---------|---------|
| `data/transactions.csv` | 1,000 | 6 | Projects 1, 3, 4, 7 |
| `data/employees.csv` | 200 | 6 | Projects 6, 7 |
| `data/logs.csv` | 5,000 | 4 | Project 2 |

Project 5 generates synthetic data in-memory — no dataset file needed.

## Completion

Completing all 7 projects gives you:
- 7 working pipelines demonstrating real-world DE skills
- Code you can show in a portfolio or technical interview
- Hands-on experience with every major pattern from the course

## Previous Section

[← Section 9: Performance & Optimization](../09-performance-optimization/README.md)
