# Lesson 7: Project 6 — Data Quality Monitor

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

Production data pipelines need automated health checks that run before data is processed. Build a data quality monitor that runs against both the transactions and employees datasets, computes a quality score for each across four dimensions (completeness, uniqueness, validity, consistency), applies PASS/WARN/FAIL thresholds, and produces a combined system health report with specific remediation recommendations for any failing dimensions.

**Deliverable:** A multi-section health report showing per-dataset quality scores, dimension-level breakdown, overall system status (HEALTHY/DEGRADED/CRITICAL), and actionable recommendations.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| Quality dimensions: completeness, uniqueness, validity, consistency | Section 8: Data Quality & Testing |
| Pipeline structure with dataclasses and step logging | Section 6: ETL Pipelines |
| Vectorized operations for efficient null and duplicate detection | Section 9: Performance & Optimization |
| Threshold-based status classification | Section 8: Data Quality & Testing |

---

## Architecture

```
load_datasets()
        |
        v
run_quality_check(df, name, thresholds)   <-- per-dataset, returns DatasetHealthResult
        |         |
        |    (transactions)
        |
run_quality_check(df, name, thresholds)   <-- per-dataset (employees)
        |
        v
aggregate_health(results)    <-- combine two results into system-level status
        |
        v
format_health_report(results, system_status)  <-- multi-section report
        |
        v
        STDOUT: system health report
```

---

## Dataset

Two datasets are checked simultaneously:

**Transactions** (`data/transactions.csv`): Expected quality issues — ~12 null regions, ~18 duplicate order IDs, ~5 invalid amounts.

**Employees** (`data/employees.csv`): Expected to be cleaner — but may have inconsistent `active` column formatting or salary outliers.

---

## Starter Code

```python
import pandas as pd
import numpy as np
import io
from dataclasses import dataclass, field
from typing import Optional

# --- Bundled datasets ---
TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,220.00,completed,2024-01-17,East
1004,C001,149.99,completed,2024-01-15,North
1005,C004,,pending,2024-01-18,West
1006,C005,-15.00,cancelled,2024-01-19,North
1007,C006,55.25,completed,2024-01-20,
1008,C007,320.80,completed,2024-01-21,South
1009,C008,90.00,refunded,2024-01-22,East
1010,C009,410.50,completed,2024-01-23,West
"""

EMPLOYEES_CSV = """employee_id,name,department,salary,hire_date,active
EMP-001,Alice Johnson,Engineering,95000,2021-03-15,True
EMP-002,Bob Chen,Marketing,72000,2022-07-01,True
EMP-003,Carol White,Sales,58000,2020-11-20,False
EMP-004,David Kim,Engineering,105000,2023-01-10,True
EMP-005,Eve Martinez,Finance,82000,2021-08-15,True
EMP-006,Frank Brown,Operations,61000,2022-03-22,True
EMP-007,Grace Lee,Marketing,77000,2020-05-18,False
EMP-008,Henry Davis,Engineering,112000,2019-09-30,True
"""

# --- Quality thresholds ---
THRESHOLDS = {
    'pass': 0.95,    # score >= 0.95 → PASS
    'warn': 0.80,    # 0.80 <= score < 0.95 → WARN
    # score < 0.80 → FAIL
}

VALID_STATUSES = {'completed', 'pending', 'cancelled', 'refunded'}
VALID_DEPARTMENTS = {'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'}


@dataclass
class DimensionResult:
    """Quality result for one dimension of one dataset."""
    name: str          # completeness, uniqueness, validity, consistency
    score: float       # 0.0–1.0
    status: str        # PASS, WARN, FAIL
    detail: str        # human-readable explanation


@dataclass
class DatasetHealthResult:
    """Aggregated quality result for one dataset."""
    dataset_name: str
    row_count: int
    overall_score: float
    overall_status: str        # PASS, WARN, FAIL
    dimensions: list = field(default_factory=list)  # list of DimensionResult
    recommendations: list = field(default_factory=list)


def load_datasets() -> tuple:
    """Load both datasets from bundled CSV strings.

    Returns:
        Tuple of (transactions_df, employees_df).
    """
    trans_df = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
    emp_df = pd.read_csv(io.StringIO(EMPLOYEES_CSV))
    return trans_df, emp_df


def score_to_status(score: float, thresholds: dict) -> str:
    """Convert a quality score to a PASS/WARN/FAIL status string."""
    if score >= thresholds['pass']:
        return 'PASS'
    elif score >= thresholds['warn']:
        return 'WARN'
    else:
        return 'FAIL'


def run_quality_check(df: pd.DataFrame, dataset_name: str, thresholds: dict,
                      valid_categoricals: Optional[dict] = None) -> DatasetHealthResult:
    """Run quality checks across four dimensions for a single dataset.

    Dimensions:
    - Completeness: 1 - (total null cells / total cells)
    - Uniqueness: fraction of rows with no exact duplicates
    - Validity: fraction of rows with no null or negative numeric values
    - Consistency: fraction of rows where categorical columns are in their expected sets

    Args:
        df: The dataset to check.
        dataset_name: Label for this dataset in the report.
        thresholds: Dict with 'pass' and 'warn' float keys.
        valid_categoricals: Optional dict mapping column name → set of valid values.
                            Used for consistency check.

    Returns:
        DatasetHealthResult with all four dimension scores.
    """
    dimensions = []
    n = len(df)

    # TODO: Dimension 1 — Completeness
    # total_cells = df.size
    # null_cells = df.isnull().sum().sum()
    # completeness_score = 1.0 - (null_cells / total_cells) if total_cells > 0 else 1.0
    # completeness_status = score_to_status(completeness_score, thresholds)
    # dimensions.append(DimensionResult(
    #     name='completeness',
    #     score=round(completeness_score, 4),
    #     status=completeness_status,
    #     detail=f"{null_cells} null cells across {df.columns.tolist()}",
    # ))
    dimensions.append(DimensionResult('completeness', 1.0, 'PASS', 'not implemented'))

    # TODO: Dimension 2 — Uniqueness
    # dup_count = df.duplicated().sum()
    # uniqueness_score = 1.0 - (dup_count / n) if n > 0 else 1.0
    # uniqueness_status = score_to_status(uniqueness_score, thresholds)
    # dimensions.append(DimensionResult(
    #     name='uniqueness',
    #     score=round(uniqueness_score, 4),
    #     status=uniqueness_status,
    #     detail=f"{dup_count} exact duplicate rows",
    # ))
    dimensions.append(DimensionResult('uniqueness', 1.0, 'PASS', 'not implemented'))

    # TODO: Dimension 3 — Validity (no null or negative numerics)
    # numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    # invalid_mask = pd.Series([False] * n, index=df.index)
    # for col in numeric_cols:
    #     invalid_mask = invalid_mask | df[col].isna() | (df[col] < 0)
    # invalid_count = invalid_mask.sum()
    # validity_score = 1.0 - (invalid_count / n) if n > 0 else 1.0
    # validity_status = score_to_status(validity_score, thresholds)
    # dimensions.append(DimensionResult(
    #     name='validity',
    #     score=round(validity_score, 4),
    #     status=validity_status,
    #     detail=f"{invalid_count} rows with null or negative numeric values",
    # ))
    dimensions.append(DimensionResult('validity', 1.0, 'PASS', 'not implemented'))

    # TODO: Dimension 4 — Consistency (categorical values in expected sets)
    # if valid_categoricals:
    #     bad_rows = pd.Series([False] * n, index=df.index)
    #     for col, valid_set in valid_categoricals.items():
    #         if col in df.columns:
    #             bad_rows = bad_rows | ~df[col].str.lower().isin({v.lower() for v in valid_set})
    #     bad_count = bad_rows.sum()
    #     consistency_score = 1.0 - (bad_count / n) if n > 0 else 1.0
    # else:
    #     bad_count = 0
    #     consistency_score = 1.0
    # consistency_status = score_to_status(consistency_score, thresholds)
    # dimensions.append(DimensionResult(
    #     name='consistency',
    #     score=round(consistency_score, 4),
    #     status=consistency_status,
    #     detail=f"{bad_count} rows with out-of-set categorical values",
    # ))
    dimensions.append(DimensionResult('consistency', 1.0, 'PASS', 'not implemented'))

    # Compute overall: weighted average (equal weights for now)
    overall_score = round(sum(d.score for d in dimensions) / len(dimensions), 4)
    overall_status = score_to_status(overall_score, thresholds)

    # TODO: generate recommendations for WARN/FAIL dimensions
    recommendations = []
    # for dim in dimensions:
    #     if dim.status != 'PASS':
    #         recommendations.append(_build_recommendation(dataset_name, dim))

    return DatasetHealthResult(
        dataset_name=dataset_name,
        row_count=n,
        overall_score=overall_score,
        overall_status=overall_status,
        dimensions=dimensions,
        recommendations=recommendations,
    )


def _build_recommendation(dataset_name: str, dim: DimensionResult) -> str:
    """Map a failing dimension to a specific recommendation string."""
    templates = {
        'completeness': f"completeness {dim.status} on {dataset_name} → Investigate upstream source for missing fields",
        'uniqueness': f"uniqueness {dim.status} on {dataset_name} → Add deduplication step in extract phase",
        'validity': f"validity {dim.status} on {dataset_name} → Add range checks in transform phase",
        'consistency': f"consistency {dim.status} on {dataset_name} → Add enum validation contract for categorical columns",
    }
    return templates.get(dim.name, f"{dim.name} {dim.status} on {dataset_name} → Review data source")


def aggregate_health(results: list) -> str:
    """Compute overall system health status from multiple dataset results.

    Rules:
    - Any FAIL → system status is CRITICAL
    - Any WARN (no FAIL) → system status is DEGRADED
    - All PASS → system status is HEALTHY

    Returns:
        'HEALTHY', 'DEGRADED', or 'CRITICAL'
    """
    statuses = [r.overall_status for r in results]
    if 'FAIL' in statuses:
        return 'CRITICAL'
    elif 'WARN' in statuses:
        return 'DEGRADED'
    else:
        return 'HEALTHY'


def format_health_report(results: list, system_status: str) -> str:
    """Format the combined health report.

    Structure:
    1. System header with overall status
    2. Per-dataset section with dimension breakdown
    3. Recommendations section
    4. Footer with system status

    Returns:
        Formatted report string (also prints to stdout).
    """
    status_icon = {'HEALTHY': 'OK', 'DEGRADED': 'WARN', 'CRITICAL': 'FAIL'}[system_status]
    lines = [
        f"DATA QUALITY HEALTH REPORT",
        f"System Status: [{status_icon}] {system_status}",
        "=" * 55,
    ]

    for result in results:
        lines += [
            f"\nDataset: {result.dataset_name} ({result.row_count} rows)",
            f"Overall Score: {result.overall_score:.1%} [{result.overall_status}]",
            f"  {'Dimension':<16} {'Score':>7} {'Status':>6}  Detail",
            f"  {'-'*50}",
        ]
        for dim in result.dimensions:
            lines.append(
                f"  {dim.name:<16} {dim.score:>7.1%} {dim.status:>6}  {dim.detail}"
            )

    all_recommendations = []
    for result in results:
        all_recommendations.extend(result.recommendations)

    if all_recommendations:
        lines += ["", "RECOMMENDATIONS:", "-" * 55]
        for i, rec in enumerate(all_recommendations, 1):
            lines.append(f"  {i}. {rec}")
    else:
        lines += ["", "RECOMMENDATIONS: None — all dimensions passing"]

    lines += [
        "",
        "=" * 55,
        f"System Status: {system_status}",
        f"Blocking: {'YES — do not proceed with pipeline' if system_status == 'CRITICAL' else 'NO'}",
    ]

    report = "\n".join(lines)
    print(report)
    return report


def main():
    """Orchestrate the data quality monitoring run."""
    trans_df, emp_df = load_datasets()

    results = [
        run_quality_check(
            trans_df, 'transactions', THRESHOLDS,
            valid_categoricals={'status': VALID_STATUSES}
        ),
        run_quality_check(
            emp_df, 'employees', THRESHOLDS,
            valid_categoricals={'department': VALID_DEPARTMENTS}
        ),
    ]

    system_status = aggregate_health(results)
    format_health_report(results, system_status)


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Implement Completeness (15 minutes)

Completeness measures how many cells have non-null values. A dataset where 95% of cells are non-null has a completeness score of 0.95:

```python
total_cells = df.size        # rows × columns
null_cells = df.isnull().sum().sum()   # sum nulls across all cells
completeness_score = 1.0 - (null_cells / total_cells)
```

`df.isnull()` returns a boolean DataFrame. `.sum()` collapses it to a Series (nulls per column). `.sum()` again gives the total null cell count. This is two vectorized operations — no loops.

---

### Step 2: Implement Uniqueness and Validity (20 minutes)

```python
# Uniqueness: fraction of rows with no duplicates
dup_count = df.duplicated().sum()
uniqueness_score = 1.0 - (dup_count / n)
```

```python
# Validity: no null or negative numeric values
numeric_cols = df.select_dtypes(include=[np.number]).columns
invalid_mask = pd.Series(False, index=df.index)
for col in numeric_cols:
    invalid_mask = invalid_mask | df[col].isna() | (df[col] < 0)
validity_score = 1.0 - (invalid_mask.sum() / n)
```

The `invalid_mask` accumulates row-level flags using boolean OR (`|`). A row is invalid if any numeric column is null or negative. Note that this is OR per row across columns, not per column.

---

### Step 3: Implement Consistency (15 minutes)

Consistency checks whether categorical values are in their expected sets:

```python
if valid_categoricals:
    bad_rows = pd.Series(False, index=df.index)
    for col, valid_set in valid_categoricals.items():
        if col in df.columns:
            # Case-insensitive comparison
            bad_rows = bad_rows | ~df[col].str.lower().isin({v.lower() for v in valid_set})
    bad_count = bad_rows.sum()
    consistency_score = 1.0 - (bad_count / n)
```

The `.str.lower()` normalization handles mixed-case values. The `isin()` check tests each value against the set — this is vectorized (no apply).

---

### Step 4: Generate Recommendations (15 minutes)

Map failing dimensions to actionable recommendations:

```python
for dim in dimensions:
    if dim.status != 'PASS':
        recommendations.append(_build_recommendation(dataset_name, dim))
```

The `_build_recommendation()` helper maps dimension name to a template string. In production, these recommendations would appear in a Slack alert or monitoring dashboard.

---

## Expected Output

```
DATA QUALITY HEALTH REPORT
System Status: [WARN] DEGRADED
=======================================================

Dataset: transactions (10 rows)
Overall Score: 88.5% [WARN]
  Dimension        Score  Status  Detail
  --------------------------------------------------
  completeness    90.0%   WARN  2 null cells across [...]
  uniqueness      90.0%   WARN  1 exact duplicate rows
  validity        90.0%   WARN  2 rows with null or negative numeric values
  consistency    100.0%   PASS  0 rows with out-of-set categorical values

Dataset: employees (8 rows)
Overall Score: 100.0% [PASS]
  Dimension        Score  Status  Detail
  --------------------------------------------------
  completeness   100.0%   PASS  0 null cells across [...]
  uniqueness     100.0%   PASS  0 exact duplicate rows
  validity       100.0%   PASS  0 rows with null or negative numeric values
  consistency    100.0%   PASS  0 rows with out-of-set categorical values

RECOMMENDATIONS:
-------------------------------------------------------
  1. completeness WARN on transactions → Investigate upstream source for missing fields
  2. uniqueness WARN on transactions → Add deduplication step in extract phase
  3. validity WARN on transactions → Add range checks in transform phase

=======================================================
System Status: DEGRADED
Blocking: NO
```

---

## Practice Exercises

<PracticeBlock
  prompt="Implement `run_quality_check(df, dataset_name, thresholds, valid_categoricals)`. Compute all four dimensions: completeness (1 - null_rate), uniqueness (1 - dup_rate), validity (fraction with no null/negative numerics), consistency (fraction with valid categorical values). Return a DatasetHealthResult with all four DimensionResult objects."
  initialCode={`import pandas as pd
import numpy as np
import io
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class DimensionResult:
    name: str
    score: float
    status: str
    detail: str

@dataclass
class DatasetHealthResult:
    dataset_name: str
    row_count: int
    overall_score: float
    overall_status: str
    dimensions: list = field(default_factory=list)
    recommendations: list = field(default_factory=list)

THRESHOLDS = {'pass': 0.95, 'warn': 0.80}

def score_to_status(score, thresholds):
    if score >= thresholds['pass']:
        return 'PASS'
    elif score >= thresholds['warn']:
        return 'WARN'
    return 'FAIL'

TEST_CSV = """id,amount,status,region
1,149.99,completed,North
2,84.50,pending,South
2,84.50,pending,South
4,,cancelled,
5,-15.00,BAD_STATUS,East
"""

def run_quality_check(df, dataset_name, thresholds, valid_categoricals=None):
    # TODO: implement all 4 dimensions
    return DatasetHealthResult(dataset_name, len(df), 0.0, 'FAIL')

df = pd.read_csv(io.StringIO(TEST_CSV))
result = run_quality_check(df, 'test', THRESHOLDS, valid_categoricals={'status': {'completed','pending','cancelled','refunded'}})
print(f"Dataset: {result.dataset_name} ({result.row_count} rows)")
print(f"Overall: {result.overall_score:.1%} [{result.overall_status}]")
for d in result.dimensions:
    print(f"  {d.name:<16} {d.score:.1%} [{d.status}]  {d.detail}")`}
  hint="Completeness: df.isnull().sum().sum() / df.size. Uniqueness: df.duplicated().sum() / n. Validity: build invalid_mask with | operator for each numeric col. Consistency: bad_rows = df[col].str.lower().isin(valid_set) for each col."
  solution={`import pandas as pd
import numpy as np
import io
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class DimensionResult:
    name: str
    score: float
    status: str
    detail: str

@dataclass
class DatasetHealthResult:
    dataset_name: str
    row_count: int
    overall_score: float
    overall_status: str
    dimensions: list = field(default_factory=list)
    recommendations: list = field(default_factory=list)

THRESHOLDS = {'pass': 0.95, 'warn': 0.80}

def score_to_status(score, thresholds):
    if score >= thresholds['pass']:
        return 'PASS'
    elif score >= thresholds['warn']:
        return 'WARN'
    return 'FAIL'

TEST_CSV = """id,amount,status,region
1,149.99,completed,North
2,84.50,pending,South
2,84.50,pending,South
4,,cancelled,
5,-15.00,BAD_STATUS,East
"""

def run_quality_check(df, dataset_name, thresholds, valid_categoricals=None):
    dimensions = []
    n = len(df)

    # Completeness
    null_cells = df.isnull().sum().sum()
    comp_score = 1.0 - (null_cells / df.size) if df.size > 0 else 1.0
    dimensions.append(DimensionResult('completeness', round(comp_score, 4),
        score_to_status(comp_score, thresholds), f"{null_cells} null cells"))

    # Uniqueness
    dup_count = df.duplicated().sum()
    uniq_score = 1.0 - (dup_count / n) if n > 0 else 1.0
    dimensions.append(DimensionResult('uniqueness', round(uniq_score, 4),
        score_to_status(uniq_score, thresholds), f"{dup_count} duplicate rows"))

    # Validity
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    invalid_mask = pd.Series(False, index=df.index)
    for col in numeric_cols:
        invalid_mask = invalid_mask | df[col].isna() | (df[col] < 0)
    invalid_count = invalid_mask.sum()
    val_score = 1.0 - (invalid_count / n) if n > 0 else 1.0
    dimensions.append(DimensionResult('validity', round(val_score, 4),
        score_to_status(val_score, thresholds), f"{invalid_count} rows with null/negative numerics"))

    # Consistency
    if valid_categoricals:
        bad_rows = pd.Series(False, index=df.index)
        for col, valid_set in valid_categoricals.items():
            if col in df.columns:
                bad_rows = bad_rows | ~df[col].str.lower().isin({v.lower() for v in valid_set})
        bad_count = bad_rows.sum()
    else:
        bad_count = 0
    cons_score = 1.0 - (bad_count / n) if n > 0 else 1.0
    dimensions.append(DimensionResult('consistency', round(cons_score, 4),
        score_to_status(cons_score, thresholds), f"{bad_count} rows with invalid categorical values"))

    overall = round(sum(d.score for d in dimensions) / len(dimensions), 4)
    return DatasetHealthResult(dataset_name, n, overall, score_to_status(overall, thresholds), dimensions)

df = pd.read_csv(io.StringIO(TEST_CSV))
result = run_quality_check(df, 'test', THRESHOLDS, valid_categoricals={'status': {'completed','pending','cancelled','refunded'}})
print(f"Dataset: {result.dataset_name} ({result.row_count} rows)")
print(f"Overall: {result.overall_score:.1%} [{result.overall_status}]")
for d in result.dimensions:
    print(f"  {d.name:<16} {d.score:.1%} [{d.status}]  {d.detail}")`}
/>

---

## Extension Challenges

1. **Historical comparison**: Modify `run_quality_check()` to accept an optional `previous_result: DatasetHealthResult` parameter. If provided, compare the overall score to the previous run and add a delta to the report: `"Score: 91.2% [WARN] (↓ 2.3% from previous run)"`.

2. **Column-level breakdown**: Add a `column_details` section to `DatasetHealthResult` that shows the null rate per column. Update `format_health_report()` to include a sub-table for the dataset with the worst completeness score.

3. **Pytest tests for threshold logic**: Write three pytest tests for `score_to_status()` and `aggregate_health()`: (a) score of 0.96 → PASS, (b) score of 0.85 → WARN, (c) score of 0.75 → FAIL. Write a test for `aggregate_health()` that verifies any FAIL result → CRITICAL system status.

---

## Key Takeaways

- Quality checks should run before data is processed, not after — catching problems at the source is cheaper than discovering them downstream
- Four quality dimensions cover most real-world issues: completeness (nulls), uniqueness (duplicates), validity (value ranges), consistency (enum conformance)
- `df.isnull().sum().sum()` counts total null cells in two vectorized operations — no looping over columns
- Boolean masks with `|` (OR) accumulate row-level validity flags across multiple columns efficiently
- PASS/WARN/FAIL thresholds convert continuous scores to discrete status labels — store thresholds as a dict to make them configurable

---

[← Lesson 6: Project 5 — Performance Benchmark Suite](./lesson-06-project-5-performance-benchmark-suite.md) | [Next Lesson: Project 7 — Multi-Source Pipeline →](./lesson-08-project-7-multi-source-pipeline.md)
