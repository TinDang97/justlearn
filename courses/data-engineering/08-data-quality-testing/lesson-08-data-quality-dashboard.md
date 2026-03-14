# Lesson 8: Data Quality Dashboard

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Aggregate per-column quality metrics into a weighted overall quality score
- Format a quality report as a structured text table with box-drawing characters
- Define quality thresholds (PASS/WARN/FAIL) and compute per-dimension status
- Build a `run_quality_check(df, thresholds)` function that returns a structured result dict
- Integrate the quality dashboard into a simulated pipeline run with blocking logic

---

## Prerequisites

- Lesson 1: Why Data Quality Matters (quality dimensions)
- Lesson 3: Data Profiling with Pandas (null rates, cardinality)
- Lesson 4: Detecting Anomalies and Outliers (IQR, domain rules)

---

## Lesson Outline

### Part 1: Quality Score Aggregation (30 minutes)

#### Explanation

A single quality number is easier to act on than six separate dimension scores. The approach: compute each dimension score (0.0-1.0) using pandas checks, then compute a **weighted average** as the overall score. Weights reflect business priority.

```python
import pandas as pd

# Dimension weights — must sum to 1.0
# Adjust these weights based on business requirements
WEIGHTS = {
    'completeness': 0.30,   # missing data is the most common pain point
    'validity':     0.30,   # invalid values corrupt downstream calculations
    'uniqueness':   0.20,   # duplicates cause double-counting
    'consistency':  0.20,   # inconsistent values break JOINs and groupbys
}

assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9, "Weights must sum to 1.0"


def compute_dimension_scores(
    df: pd.DataFrame,
    id_col: str = None,
    amount_col: str = None,
    date_col: str = None,
    status_col: str = None,
    valid_statuses: set = None,
) -> dict:
    """
    Compute a 0.0-1.0 score for each quality dimension.
    Returns a dict: {dimension_name: score}
    """
    scores = {}

    # --- COMPLETENESS: fraction of non-null values across all columns ---
    scores['completeness'] = float(1 - df.isnull().mean().mean())

    # --- VALIDITY: check date column for bad/future dates + amount column for negatives ---
    validity_violations = 0
    validity_checks = 0

    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        validity_violations += int(dates.isna().sum())
        validity_violations += int((dates > pd.Timestamp.today()).sum())
        validity_checks += len(df)

    if amount_col and amount_col in df.columns:
        validity_violations += int((df[amount_col] < 0).sum())
        validity_checks += len(df)

    if validity_checks > 0:
        scores['validity'] = max(0.0, 1 - (validity_violations / validity_checks))
    else:
        scores['validity'] = 1.0

    # --- UNIQUENESS: fraction of non-duplicate rows ---
    if id_col and id_col in df.columns:
        n_dupes = df.duplicated(subset=[id_col]).sum()
    else:
        n_dupes = df.duplicated().sum()
    scores['uniqueness'] = float(1 - (n_dupes / len(df)))

    # --- CONSISTENCY: fraction of rows with valid status values ---
    if status_col and status_col in df.columns and valid_statuses:
        normalized = df[status_col].str.lower().str.strip()
        bad = ~normalized.isin(valid_statuses)
        scores['consistency'] = float(1 - (bad.sum() / len(df)))
    else:
        scores['consistency'] = 1.0

    return scores


def compute_overall_score(dimension_scores: dict, weights: dict) -> float:
    """Weighted average of dimension scores."""
    total = sum(dimension_scores.get(dim, 1.0) * w for dim, w in weights.items())
    return round(total, 4)


# --- Demo ---
df = pd.DataFrame({
    'order_id':   [1001, 1002, 1003, 1002, 1004, 1005, 1006, 1007, 1008, 1009],
    'customer_id': [101, 102, None, 104, 105, None, 107, 108, 109, 110],
    'amount':     [49.99, -5.00, 120.0, 89.50, 0.0, 250.0, 33.0, 88.5, 200.0, 12.5],
    'status':     ['shipped', 'SHIPPED', 'pending', 'delivered', 'shipped',
                   'Pending', 'complete', 'shipped', 'pending', 'delivered'],
    'order_date': ['2024-01-01', '2024-01-02', '2024-01-03', '2099-12-01', '2024-01-05',
                   '2024-01-06', '2024-01-07', 'not-a-date', '2024-01-09', '2024-01-10'],
})

scores = compute_dimension_scores(
    df,
    id_col='order_id',
    amount_col='amount',
    date_col='order_date',
    status_col='status',
    valid_statuses={'shipped', 'pending', 'delivered', 'cancelled'},
)

overall = compute_overall_score(scores, WEIGHTS)

print("Dimension scores:")
for dim, score in scores.items():
    print(f"  {dim:<14}: {score:.4f}  (weight: {WEIGHTS[dim]:.0%})")
print(f"\nOverall score: {overall:.4f}")
```

---

### Part 2: Formatted Text Report (30 minutes)

#### Explanation

A quality report should be readable at a glance in any terminal or log file — no external libraries needed, just Python string formatting with box-drawing characters.

```python
import pandas as pd

def format_quality_report(
    results: dict,
    dataset_name: str = "dataset",
    n_rows: int = 0,
    n_cols: int = 0,
) -> str:
    """
    Format quality results as a structured text table.

    results must have keys:
      'overall'    — float score 0.0-1.0
      'status'     — 'PASS' | 'WARN' | 'FAIL'
      'dimensions' — dict of {dim_name: {'score': float, 'status': str}}
      'blocking'   — bool

    Returns a multi-line string suitable for printing or logging.
    """
    lines = []

    # ─── Header ──────────────────────────────────────────────────────────────
    lines.append("┌─────────────────────────────────────────┐")
    lines.append("│  DATA QUALITY REPORT                    │")
    lines.append(f"│  Dataset: {dataset_name:<30} │")
    lines.append(f"│  Rows: {n_rows:>6,}  |  Columns: {n_cols:<3}          │")
    lines.append("├──────────────────────┬─────────┬────────┤")
    lines.append("│ Dimension            │  Score  │ Status │")
    lines.append("├──────────────────────┼─────────┼────────┤")

    # ─── Dimension rows ───────────────────────────────────────────────────────
    for dim_name, dim_data in results['dimensions'].items():
        score  = dim_data['score']
        status = dim_data['status']

        # Color indicators using ASCII (works in any terminal)
        status_display = {
            'PASS': ' PASS ',
            'WARN': ' WARN ',
            'FAIL': ' FAIL ',
        }.get(status, status)

        dim_display = dim_name.capitalize()
        lines.append(
            f"│ {dim_display:<20} │  {score:.4f} │{status_display}│"
        )

    # ─── Overall row ──────────────────────────────────────────────────────────
    lines.append("├──────────────────────┼─────────┼────────┤")
    overall_status = results['status']
    overall_score  = results['overall']
    status_display = {
        'PASS': ' PASS ',
        'WARN': ' WARN ',
        'FAIL': ' FAIL ',
    }.get(overall_status, overall_status)

    lines.append(
        f"│ {'Overall Score':<20} │  {overall_score:.4f} │{status_display}│"
    )
    lines.append("└──────────────────────┴─────────┴────────┘")

    # ─── Blocking flag ────────────────────────────────────────────────────────
    if results['blocking']:
        lines.append("")
        lines.append("  *** PIPELINE BLOCKED — one or more dimensions FAILED ***")
        lines.append("  Action: investigate FAIL dimensions before proceeding.")

    return "\n".join(lines)


# --- Demo ---
sample_results = {
    'overall': 0.90,
    'status': 'WARN',
    'blocking': False,
    'dimensions': {
        'completeness': {'score': 0.97, 'status': 'PASS'},
        'validity':     {'score': 0.89, 'status': 'WARN'},
        'uniqueness':   {'score': 1.00, 'status': 'PASS'},
        'consistency':  {'score': 0.72, 'status': 'FAIL'},
    }
}

report = format_quality_report(
    sample_results,
    dataset_name="transactions.csv",
    n_rows=1000,
    n_cols=8,
)
print(report)

# Output:
# ┌─────────────────────────────────────────┐
# │  DATA QUALITY REPORT                    │
# │  Dataset: transactions.csv              │
# │  Rows:  1,000  |  Columns: 8           │
# ├──────────────────────┬─────────┬────────┤
# │ Dimension            │  Score  │ Status │
# ├──────────────────────┼─────────┼────────┤
# │ Completeness         │  0.9700 │ PASS  │
# │ Validity             │  0.8900 │ WARN  │
# │ Uniqueness           │  1.0000 │ PASS  │
# │ Consistency          │  0.7200 │ FAIL  │
# ├──────────────────────┼─────────┼────────┤
# │ Overall Score        │  0.9000 │ WARN  │
# └──────────────────────┴─────────┴────────┘
```

---

### Part 3: Thresholds and `run_quality_check()` (30 minutes)

#### Explanation

The thresholds determine when each dimension is PASS, WARN, or FAIL. Making them configurable (not hardcoded) lets you tune per-pipeline without changing the function.

```python
import pandas as pd

# Configurable thresholds
THRESHOLDS = {
    'pass': 0.95,   # score >= 0.95 → PASS
    'warn': 0.80,   # score >= 0.80 → WARN, else FAIL
}

WEIGHTS = {
    'completeness': 0.30,
    'validity':     0.30,
    'uniqueness':   0.20,
    'consistency':  0.20,
}


def score_to_status(score: float, thresholds: dict) -> str:
    """Convert a 0.0-1.0 score to PASS / WARN / FAIL."""
    if score >= thresholds['pass']:
        return 'PASS'
    elif score >= thresholds['warn']:
        return 'WARN'
    else:
        return 'FAIL'


def run_quality_check(
    df: pd.DataFrame,
    thresholds: dict,
    weights: dict = None,
    id_col: str = None,
    amount_col: str = None,
    date_col: str = None,
    status_col: str = None,
    valid_statuses: set = None,
) -> dict:
    """
    Run a full quality check on df.

    Returns:
      {
        'overall':    float,          # weighted average score
        'status':     str,            # 'PASS' | 'WARN' | 'FAIL'
        'dimensions': {               # per-dimension results
            dim_name: {
                'score':  float,
                'status': str,
                'weight': float,
            }
        },
        'blocking':   bool,           # True if any dimension is FAIL
        'metadata': {
            'n_rows': int,
            'n_cols': int,
        }
      }
    """
    if weights is None:
        weights = WEIGHTS

    # --- Compute dimension scores ---
    dimension_scores = {}

    # Completeness
    dimension_scores['completeness'] = float(1 - df.isnull().mean().mean())

    # Validity
    validity_violations = 0
    validity_checks = 0
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        validity_violations += int(dates.isna().sum())
        validity_violations += int((dates > pd.Timestamp.today()).sum())
        validity_checks += len(df)
    if amount_col and amount_col in df.columns:
        validity_violations += int((df[amount_col] < 0).sum())
        validity_checks += len(df)
    dimension_scores['validity'] = (
        max(0.0, 1 - validity_violations / validity_checks)
        if validity_checks > 0 else 1.0
    )

    # Uniqueness
    if id_col and id_col in df.columns:
        n_dupes = df.duplicated(subset=[id_col]).sum()
    else:
        n_dupes = df.duplicated().sum()
    dimension_scores['uniqueness'] = float(1 - (n_dupes / len(df)))

    # Consistency
    if status_col and status_col in df.columns and valid_statuses:
        normalized = df[status_col].str.lower().str.strip()
        bad = ~normalized.isin(valid_statuses)
        dimension_scores['consistency'] = float(1 - (bad.sum() / len(df)))
    else:
        dimension_scores['consistency'] = 1.0

    # --- Apply thresholds and weights ---
    dimensions = {}
    for dim, score in dimension_scores.items():
        w = weights.get(dim, 0)
        dimensions[dim] = {
            'score':  round(score, 4),
            'status': score_to_status(score, thresholds),
            'weight': w,
        }

    # --- Overall score (weighted average) ---
    overall = sum(
        dimensions[dim]['score'] * dimensions[dim]['weight']
        for dim in dimensions
    )
    overall_status = score_to_status(overall, thresholds)

    # --- Blocking: True if any dimension is FAIL ---
    blocking = any(d['status'] == 'FAIL' for d in dimensions.values())

    return {
        'overall':    round(overall, 4),
        'status':     overall_status,
        'dimensions': dimensions,
        'blocking':   blocking,
        'metadata': {
            'n_rows': len(df),
            'n_cols': len(df.columns),
        },
    }


# --- Demo ---
df = pd.DataFrame({
    'order_id':   list(range(1001, 1021)),
    'customer_id': [i if i % 5 != 0 else None for i in range(20)],
    'amount':     [round(50 + i * 10, 2) for i in range(20)],
    'status':     ['shipped', 'PENDING', 'delivered', 'cancelled', 'SHIPPED'] * 4,
    'order_date': ['2024-01-' + str(i + 1).zfill(2) for i in range(19)] + ['2099-12-31'],
})

result = run_quality_check(
    df,
    thresholds=THRESHOLDS,
    id_col='order_id',
    amount_col='amount',
    date_col='order_date',
    status_col='status',
    valid_statuses={'shipped', 'pending', 'delivered', 'cancelled'},
)

print(f"Overall: {result['overall']:.4f} [{result['status']}]")
print(f"Blocking: {result['blocking']}")
for dim, data in result['dimensions'].items():
    print(f"  {dim:<14}: {data['score']:.4f}  [{data['status']}]")
```

---

### Part 4: Practice (30 minutes)

#### Explanation

Build an end-to-end quality check: create a transactions DataFrame, run `run_quality_check()`, print the formatted report, assert the overall score is above 0.80, and print "Pipeline blocked" if `blocking=True`.

<PracticeBlock
  prompt="Run run_quality_check() on the transactions DataFrame. Print the formatted report. Assert overall score > 0.80. Print 'Pipeline blocked' if blocking=True."
  initialCode={`import pandas as pd

THRESHOLDS = {'pass': 0.95, 'warn': 0.80}
WEIGHTS = {'completeness': 0.30, 'validity': 0.30, 'uniqueness': 0.20, 'consistency': 0.20}

def score_to_status(score, thresholds):
    if score >= thresholds['pass']: return 'PASS'
    elif score >= thresholds['warn']: return 'WARN'
    else: return 'FAIL'

def run_quality_check(df, thresholds, weights=None, id_col=None, amount_col=None,
                      date_col=None, status_col=None, valid_statuses=None):
    if weights is None: weights = WEIGHTS
    dim_scores = {}
    dim_scores['completeness'] = float(1 - df.isnull().mean().mean())
    vv, vc = 0, 0
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        vv += int(dates.isna().sum()) + int((dates > pd.Timestamp.today()).sum())
        vc += len(df)
    if amount_col and amount_col in df.columns:
        vv += int((df[amount_col] < 0).sum()); vc += len(df)
    dim_scores['validity'] = max(0.0, 1 - vv / vc) if vc > 0 else 1.0
    n_dupes = df.duplicated(subset=[id_col]).sum() if id_col and id_col in df.columns else df.duplicated().sum()
    dim_scores['uniqueness'] = float(1 - n_dupes / len(df))
    if status_col and status_col in df.columns and valid_statuses:
        bad = ~df[status_col].str.lower().str.strip().isin(valid_statuses)
        dim_scores['consistency'] = float(1 - bad.sum() / len(df))
    else:
        dim_scores['consistency'] = 1.0
    dimensions = {d: {'score': round(s, 4), 'status': score_to_status(s, thresholds),
                       'weight': weights.get(d, 0)} for d, s in dim_scores.items()}
    overall = sum(dimensions[d]['score'] * dimensions[d]['weight'] for d in dimensions)
    return {'overall': round(overall, 4), 'status': score_to_status(overall, thresholds),
            'dimensions': dimensions, 'blocking': any(d['status'] == 'FAIL' for d in dimensions.values()),
            'metadata': {'n_rows': len(df), 'n_cols': len(df.columns)}}

def format_quality_report(results, dataset_name="dataset", n_rows=0, n_cols=0):
    lines = [
        "┌─────────────────────────────────────────┐",
        "│  DATA QUALITY REPORT                    │",
        f"│  Dataset: {dataset_name:<30} │",
        f"│  Rows: {n_rows:>6,}  |  Columns: {n_cols:<3}          │",
        "├──────────────────────┬─────────┬────────┤",
        "│ Dimension            │  Score  │ Status │",
        "├──────────────────────┼─────────┼────────┤",
    ]
    for dim, data in results['dimensions'].items():
        s = {' PASS ': data['status'] == 'PASS', ' WARN ': data['status'] == 'WARN', ' FAIL ': data['status'] == 'FAIL'}
        sd = next(k for k, v in s.items() if v)
        lines.append(f"│ {dim.capitalize():<20} │  {data['score']:.4f} │{sd}│")
    lines += [
        "├──────────────────────┼─────────┼────────┤",
        f"│ {'Overall Score':<20} │  {results['overall']:.4f} │ {results['status']:<5}│",
        "└──────────────────────┴─────────┴────────┘",
    ]
    if results['blocking']:
        lines += ["", "  *** PIPELINE BLOCKED — one or more dimensions FAILED ***"]
    return "\\n".join(lines)

# Transactions DataFrame
import random
random.seed(123)
n = 50
df = pd.DataFrame({
    'txn_id':   list(range(1001, 1001 + n)),
    'amount':   [round(random.uniform(5, 500), 2) if i % 20 != 0 else -10.0 for i in range(n)],
    'status':   ['complete', 'pending', 'refunded', 'complete', 'pending'] * (n // 5),
    'txn_date': ['2024-0' + str((i % 9) + 1) + '-' + str((i % 28 + 1)).zfill(2)
                 if i % 15 != 0 else '2099-01-01' for i in range(n)],
    'notes':    [None if i % 3 == 0 else f'note {i}' for i in range(n)],
})

# TODO: run run_quality_check() with appropriate parameters
# TODO: print format_quality_report()
# TODO: assert overall score > 0.80
# TODO: print "Pipeline blocked" if blocking=True
`}
  hint="Call run_quality_check(df, THRESHOLDS, id_col='txn_id', amount_col='amount', date_col='txn_date', status_col='status', valid_statuses={'complete','pending','refunded'}). Then print format_quality_report(result, ...) and check result['blocking']."
  solution={`import pandas as pd
import random

THRESHOLDS = {'pass': 0.95, 'warn': 0.80}
WEIGHTS = {'completeness': 0.30, 'validity': 0.30, 'uniqueness': 0.20, 'consistency': 0.20}

def score_to_status(score, thresholds):
    if score >= thresholds['pass']: return 'PASS'
    elif score >= thresholds['warn']: return 'WARN'
    else: return 'FAIL'

def run_quality_check(df, thresholds, weights=None, id_col=None, amount_col=None,
                      date_col=None, status_col=None, valid_statuses=None):
    if weights is None: weights = WEIGHTS
    dim_scores = {}
    dim_scores['completeness'] = float(1 - df.isnull().mean().mean())
    vv, vc = 0, 0
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        vv += int(dates.isna().sum()) + int((dates > pd.Timestamp.today()).sum())
        vc += len(df)
    if amount_col and amount_col in df.columns:
        vv += int((df[amount_col] < 0).sum()); vc += len(df)
    dim_scores['validity'] = max(0.0, 1 - vv / vc) if vc > 0 else 1.0
    n_dupes = df.duplicated(subset=[id_col]).sum() if id_col and id_col in df.columns else df.duplicated().sum()
    dim_scores['uniqueness'] = float(1 - n_dupes / len(df))
    if status_col and status_col in df.columns and valid_statuses:
        bad = ~df[status_col].str.lower().str.strip().isin(valid_statuses)
        dim_scores['consistency'] = float(1 - bad.sum() / len(df))
    else:
        dim_scores['consistency'] = 1.0
    dimensions = {d: {'score': round(s, 4), 'status': score_to_status(s, thresholds),
                       'weight': weights.get(d, 0)} for d, s in dim_scores.items()}
    overall = sum(dimensions[d]['score'] * dimensions[d]['weight'] for d in dimensions)
    return {'overall': round(overall, 4), 'status': score_to_status(overall, thresholds),
            'dimensions': dimensions, 'blocking': any(d['status'] == 'FAIL' for d in dimensions.values()),
            'metadata': {'n_rows': len(df), 'n_cols': len(df.columns)}}

def format_quality_report(results, dataset_name="dataset", n_rows=0, n_cols=0):
    lines = [
        "┌─────────────────────────────────────────┐",
        "│  DATA QUALITY REPORT                    │",
        f"│  Dataset: {dataset_name:<30} │",
        f"│  Rows: {n_rows:>6,}  |  Columns: {n_cols:<3}          │",
        "├──────────────────────┬─────────┬────────┤",
        "│ Dimension            │  Score  │ Status │",
        "├──────────────────────┼─────────┼────────┤",
    ]
    for dim, data in results['dimensions'].items():
        sd = f" {data['status']:<5}"
        lines.append(f"│ {dim.capitalize():<20} │  {data['score']:.4f} │{sd}│")
    lines += [
        "├──────────────────────┼─────────┼────────┤",
        f"│ {'Overall Score':<20} │  {results['overall']:.4f} │ {results['status']:<5}│",
        "└──────────────────────┴─────────┴────────┘",
    ]
    if results['blocking']:
        lines += ["", "  *** PIPELINE BLOCKED — one or more dimensions FAILED ***"]
    return "\\n".join(lines)

random.seed(123)
n = 50
df = pd.DataFrame({
    'txn_id':   list(range(1001, 1001 + n)),
    'amount':   [round(random.uniform(5, 500), 2) if i % 20 != 0 else -10.0 for i in range(n)],
    'status':   ['complete', 'pending', 'refunded', 'complete', 'pending'] * (n // 5),
    'txn_date': ['2024-0' + str((i % 9) + 1) + '-' + str((i % 28 + 1)).zfill(2)
                 if i % 15 != 0 else '2099-01-01' for i in range(n)],
    'notes':    [None if i % 3 == 0 else f'note {i}' for i in range(n)],
})

# Run quality check
result = run_quality_check(
    df,
    thresholds=THRESHOLDS,
    id_col='txn_id',
    amount_col='amount',
    date_col='txn_date',
    status_col='status',
    valid_statuses={'complete', 'pending', 'refunded'},
)

# Print formatted report
report = format_quality_report(
    result,
    dataset_name="transactions",
    n_rows=result['metadata']['n_rows'],
    n_cols=result['metadata']['n_cols'],
)
print(report)

# Assert overall score > 0.80
assert result['overall'] > 0.80, f"Quality score {result['overall']} is below 0.80 threshold"
print(f"\\nAssertion passed: overall score {result['overall']} > 0.80")

# Pipeline blocking check
if result['blocking']:
    print("Pipeline blocked — investigate FAIL dimensions before loading data.")
else:
    print("Pipeline not blocked — data can proceed to load stage.")
`}
/>

---

## Key Takeaways

- Quality dashboards should run in CI on every pipeline execution — not just ad hoc when something looks wrong
- Weighted scoring lets you prioritize dimensions: completeness and validity typically have higher weight than consistency for most pipelines
- `blocking=True` prevents bad data from reaching downstream consumers — it is the circuit breaker pattern applied to data pipelines
- Thresholds must be configurable (not hardcoded): financial pipelines need `pass=0.999`, exploratory analytics may tolerate `pass=0.90`
- The formatted report should be logged to a file, not just printed — ephemeral terminal output is useless for debugging pipeline runs from 3 days ago
- Dimension scores below WARN (< 0.80) warrant immediate investigation; scores below FAIL (< 0.60) are pipeline blockers

---

## Common Mistakes to Avoid

- **Hardcoding thresholds**: `PASS_THRESHOLD = 0.95` at the top of the file is not configurable — pass `thresholds` as a parameter so each pipeline can tune independently
- **Computing quality on a sample**: if you profile only the first 1,000 rows of a 10M-row dataset, rare violations (0.01% occurrence) will be invisible
- **Not logging the report**: a print statement to stdout is ephemeral; write the report to a structured log file or send it to your observability platform so you can compare runs over time
- **Using the same thresholds for all dimensions**: a pipeline where `order_id` uniqueness is 0.90 is far more broken than one where `notes` is 0.90 — per-dimension thresholds are more precise

---

## Next Lesson Preview

- Section 9 covers performance and optimization: vectorization vs loops, chunked processing for large files
- You will apply the quality functions built in this section to production-scale datasets

---

[← Previous: Testing Pipelines with pytest](./lesson-07-testing-pipelines-with-pytest.md) | [Next: Section 9 — Performance & Optimization →](../09-performance-optimization/README.md)
