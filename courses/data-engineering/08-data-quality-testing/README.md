# Section 8: Data Quality & Testing

**Course:** Data Engineering | **Lessons:** 8 | **Level:** Intermediate → Advanced

Data quality is what separates a hobby pipeline from a production pipeline. In this section, you will learn to measure, enforce, and test data quality systematically — using only pandas and standard Python, no external validation libraries required.

## What You'll Learn

- Measure data quality across 6 dimensions using pandas
- Validate DataFrame schemas with a custom pandera-compatible validator
- Build a `profile_dataframe()` function for per-column statistics and cardinality analysis
- Detect statistical outliers with IQR and z-score, and domain anomalies with explicit business rules
- Write data contracts as code and enforce them at pipeline boundaries
- Test pipelines with pytest fixtures, parametrize, and `assert_frame_equal`
- Build a quality dashboard with weighted scores, thresholds, and blocking logic

## Lessons

| # | Title | Key Skill | Has Practice |
|---|-------|-----------|--------------|
| 1 | [Why Data Quality Matters](./lesson-01-why-data-quality-matters.md) | Quality dimensions, cost of bad data, `quality_report()` | Yes |
| 2 | [Schema Validation with Pandera](./lesson-02-schema-validation-with-pandera.md) | DataFrameSchema, Column, Check, SchemaError, lazy validation | Yes |
| 3 | [Data Profiling with Pandas](./lesson-03-data-profiling-with-pandas.md) | Null rates, cardinality, `profile_dataframe()` | Yes |
| 4 | [Detecting Anomalies and Outliers](./lesson-04-detecting-anomalies-and-outliers.md) | IQR, z-score, domain rules, winsorization | Yes |
| 5 | [Data Contracts: Introduction](./lesson-05-data-contracts-introduction.md) | Producer/consumer model, schema/semantics/SLA layers | No |
| 6 | [Implementing Data Contracts](./lesson-06-implementing-data-contracts.md) | `enforce()`, `ContractViolationError`, ETL wiring | Yes |
| 7 | [Testing Pipelines with pytest](./lesson-07-testing-pipelines-with-pytest.md) | Fixtures, parametrize, assert_frame_equal, pytest.raises | No |
| 8 | [Data Quality Dashboard](./lesson-08-data-quality-dashboard.md) | Weighted score, thresholds, blocking logic, formatted report | Yes |

## Prerequisites

- Section 2: Pandas Fundamentals (DataFrames, `.describe()`, `.value_counts()`, boolean filtering)
- Section 4: Data Cleaning (data types, missing value handling)
- Basic Python: functions, classes, dataclasses, try/except

## Learning Path

```
Lesson 1 (dimensions)
    ↓
Lesson 2 (schema validation)  ←──── used in Lesson 6 (contracts)
    ↓
Lesson 3 (profiling)           ←──── feeds Lesson 8 (dashboard)
    ↓
Lesson 4 (anomaly detection)   ←──── feeds Lesson 8 (dashboard)
    ↓
Lesson 5 (contract concepts)
    ↓
Lesson 6 (contract implementation)  ←──── tested in Lesson 7
    ↓
Lesson 7 (pytest testing)
    ↓
Lesson 8 (dashboard — synthesizes all previous lessons)
```

## Key Code Patterns

After completing this section, you will have written:

- `quality_report(df)` — returns a dict of 6 dimension scores
- `DataFrameSchema + Column + Check` — schema validation without external libraries
- `profile_dataframe(df)` — per-column stats DataFrame
- `check_domain_rules(df)` — explicit business rule enforcement
- `OrdersContract.enforce(df)` — contract enforcement at pipeline boundaries
- `run_quality_check(df, thresholds)` — full quality check with blocking logic
- `format_quality_report(results)` — terminal-friendly formatted report

## Next Section

[Section 9: Performance & Optimization →](../09-performance-optimization/README.md)
