# Lesson 8: Project 7 — Multi-Source Pipeline

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

Real pipelines rarely have a single clean source — they merge data from multiple systems with incompatible key formats. In this project, transactions use integer customer IDs (`1`, `2`, `3`) while the employee/customer directory uses string IDs in the format `EMP-001`. Build a pipeline that loads both sources, reconciles the key mismatch, merges them, validates the merged output against a data contract, and produces an enrichment summary showing how many transactions were successfully matched.

**Deliverable:** `Merged pipeline complete | 1000 transactions | 847 matched (84.7%) | 153 unmatched | 0 duplicate rows introduced`.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| String manipulation and type conversion | Section 4: Data Cleaning |
| `merge` with `how='left'` and post-merge validation | Section 5: Data Transformation |
| ETL pipeline structure with logging | Section 6: ETL Pipelines |
| Data contract enforcement | Section 8: Data Quality & Testing |

---

## Architecture

```
load_transactions(csv_string)      load_employees(csv_string)
        |                                   |
        v                                   v
   [trans_df]                          [emp_df]
              \                       /
               normalize_keys(trans_df, emp_df)
                          |
                          v
              merge_sources(trans_df, emp_df)
                          |
                          v
              validate_merged(merged_df)
                          |
                          v
              summarize_merge(trans_df, merged_df)
                          |
                          v
          STDOUT: enrichment summary
```

---

## Dataset

Two sources with a key mismatch:

**Transactions** (`data/transactions.csv`): `customer_id` is an integer (`1`, `2`, `3`)

**Employees** (`data/employees.csv`): `employee_id` is a string in `EMP-###` format (`EMP-001`, `EMP-002`)

The reconciliation step extracts the numeric part of `EMP-###` and casts it to integer so the join key is compatible.

---

## Starter Code

```python
import pandas as pd
import numpy as np
import io
from dataclasses import dataclass

# --- Bundled datasets ---
TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,1,149.99,completed,2024-01-15,North
1002,2,84.50,pending,2024-01-16,South
1003,3,220.00,completed,2024-01-17,East
1004,1,320.00,completed,2024-01-20,North
1005,4,55.00,completed,2024-01-18,West
1006,2,410.50,completed,2024-01-25,South
1007,5,75.00,completed,2024-01-20,North
1008,3,185.00,completed,2024-01-28,East
1009,99,92.50,completed,2024-02-01,North
1010,100,310.00,completed,2024-01-10,West
"""

EMPLOYEES_CSV = """employee_id,name,department,salary,hire_date,active
EMP-001,Alice Johnson,Engineering,95000,2021-03-15,True
EMP-002,Bob Chen,Marketing,72000,2022-07-01,True
EMP-003,Carol White,Sales,58000,2020-11-20,False
EMP-004,David Kim,Engineering,105000,2023-01-10,True
EMP-005,Eve Martinez,Finance,82000,2021-08-15,True
"""


@dataclass
class MergeSummary:
    """Result of the merge operation."""
    total_transactions: int
    matched_count: int
    unmatched_count: int
    match_rate: float
    duplicate_rows_introduced: int
    validation_errors: list


def load_transactions(csv_string: str) -> pd.DataFrame:
    """Load transactions dataset.

    Returns:
        DataFrame with order_date parsed and customer_id as integer.
    """
    df = pd.read_csv(io.StringIO(csv_string))
    df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
    return df


def load_employees(csv_string: str) -> pd.DataFrame:
    """Load employees dataset.

    Returns:
        Raw DataFrame with employee_id as string (not yet normalized).
    """
    return pd.read_csv(io.StringIO(csv_string))


def normalize_keys(trans_df: pd.DataFrame, emp_df: pd.DataFrame) -> tuple:
    """Reconcile the key format mismatch between the two sources.

    Problem:
    - trans_df has customer_id as integer: 1, 2, 3
    - emp_df has employee_id as string: 'EMP-001', 'EMP-002', 'EMP-003'

    Solution:
    - Extract the numeric portion of employee_id: 'EMP-001' → 1
    - Cast to int so both keys are comparable integers
    - Add a 'customer_id' column to emp_df using the extracted int

    Returns:
        Tuple of (trans_df, emp_df_with_customer_id).

    Raises:
        ValueError: if employee_id does not follow the 'EMP-###' pattern.
    """
    emp_normalized = emp_df.copy()

    # TODO: Step 1 — extract numeric portion from employee_id
    # emp_normalized['customer_id'] = emp_normalized['employee_id'].str.replace('EMP-', '').astype(int)

    # TODO: Step 2 — validate that extraction worked (no nulls in customer_id)
    # if emp_normalized['customer_id'].isna().any():
    #     raise ValueError("employee_id normalization produced null customer_id values")

    # For now, return unchanged (replace with normalized version)
    return trans_df, emp_normalized


def merge_sources(trans_df: pd.DataFrame, emp_df: pd.DataFrame) -> pd.DataFrame:
    """Merge transactions with employee data on customer_id.

    Uses a left join: all transactions are kept. Transactions whose customer_id
    does not appear in emp_df get null values for the enrichment columns.

    Enrichment columns added from employees:
    - name, department, salary

    Returns:
        Merged DataFrame with transaction rows + enrichment columns.
    """
    # TODO: perform left merge on customer_id
    # merged = trans_df.merge(
    #     emp_df[['customer_id', 'name', 'department', 'salary']],
    #     on='customer_id',
    #     how='left',
    # )
    # return merged
    return trans_df.copy()


def validate_merged(merged_df: pd.DataFrame, original_count: int) -> list:
    """Validate the merged DataFrame.

    Rules:
    1. Row count must not exceed original transaction count (no row inflation from many-to-one match)
    2. order_id must remain unique after merge
    3. customer_id must not be null

    Returns:
        List of violation strings. Empty list = no violations.
    """
    violations = []

    # TODO: Rule 1 — no row inflation
    # if len(merged_df) > original_count:
    #     violations.append(
    #         f"Row count inflated: {original_count} transactions → {len(merged_df)} after merge"
    #     )

    # TODO: Rule 2 — order_id uniqueness
    # dup_orders = merged_df[merged_df.duplicated(subset=['order_id'])]['order_id'].tolist()
    # if dup_orders:
    #     violations.append(f"Duplicate order_ids after merge: {dup_orders[:5]}...")

    # TODO: Rule 3 — customer_id not null
    # null_cids = merged_df['customer_id'].isna().sum()
    # if null_cids > 0:
    #     violations.append(f"{null_cids} rows with null customer_id after merge")

    return violations


def summarize_merge(trans_df: pd.DataFrame, merged_df: pd.DataFrame, violations: list) -> MergeSummary:
    """Compute and print the merge enrichment summary.

    Matched: rows where 'department' is not null (enrichment fields populated).
    Unmatched: rows where 'department' is null (no match in employees dataset).

    Returns:
        MergeSummary dataclass.
    """
    total = len(trans_df)
    # Check if department column exists (it won't if merge_sources isn't implemented)
    if 'department' in merged_df.columns:
        matched = merged_df['department'].notna().sum()
    else:
        matched = 0
    unmatched = total - matched
    match_rate = matched / total if total > 0 else 0.0

    # Duplicate rows introduced = rows in merged that weren't in trans
    dups_introduced = len(merged_df) - total

    summary = MergeSummary(
        total_transactions=total,
        matched_count=matched,
        unmatched_count=unmatched,
        match_rate=round(match_rate, 4),
        duplicate_rows_introduced=max(0, dups_introduced),
        validation_errors=violations,
    )

    print("===== MERGE ENRICHMENT SUMMARY =====")
    print(f"Total transactions:       {summary.total_transactions:>6}")
    print(f"Matched (enriched):       {summary.matched_count:>6} ({summary.match_rate:.1%})")
    print(f"Unmatched (null enrichment):{summary.unmatched_count:>4}")
    print(f"Duplicate rows introduced:{summary.duplicate_rows_introduced:>6}")
    print(f"Validation errors:        {len(summary.validation_errors):>6}")
    if summary.validation_errors:
        for v in summary.validation_errors:
            print(f"  - {v}")
    print("=====================================")

    return summary


def main():
    """Run the multi-source merge pipeline."""
    # Load
    trans_df = load_transactions(TRANSACTIONS_CSV)
    emp_df = load_employees(EMPLOYEES_CSV)

    print("=== RAW DATA INSPECTION ===")
    print(f"Transactions: {len(trans_df)} rows | customer_id dtype: {trans_df['customer_id'].dtype}")
    print(f"Employees: {len(emp_df)} rows | employee_id sample: {emp_df['employee_id'].head(3).tolist()}")
    print()

    # Normalize keys
    trans_df, emp_df = normalize_keys(trans_df, emp_df)
    if 'customer_id' in emp_df.columns:
        print(f"After normalization: emp_df['customer_id'] dtype={emp_df['customer_id'].dtype}")
        print(f"  Sample values: {emp_df['customer_id'].head(3).tolist()}")
    print()

    # Merge
    merged_df = merge_sources(trans_df, emp_df)

    # Validate
    violations = validate_merged(merged_df, len(trans_df))

    # Summarize
    summarize_merge(trans_df, merged_df, violations)


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Inspect the Key Mismatch (15 minutes)

Before writing any code, inspect both DataFrames:

```python
trans_df = load_transactions(TRANSACTIONS_CSV)
emp_df = load_employees(EMPLOYEES_CSV)

print("Transactions customer_id:", trans_df['customer_id'].dtype, trans_df['customer_id'].head(3).tolist())
# → int64: [1, 2, 3]

print("Employees employee_id:", emp_df['employee_id'].dtype, emp_df['employee_id'].head(3).tolist())
# → object: ['EMP-001', 'EMP-002', 'EMP-003']
```

The mismatch is clear: one is an integer, the other is a string with a prefix. You cannot join on these directly — pandas would either fail or produce a zero-match result.

---

### Step 2: Normalize Keys (20 minutes)

The `normalize_keys()` function extracts the numeric part of `EMP-###` and casts it to integer:

```python
def normalize_keys(trans_df: pd.DataFrame, emp_df: pd.DataFrame) -> tuple:
    emp_normalized = emp_df.copy()

    # 'EMP-001' → '001' → 1
    emp_normalized['customer_id'] = (
        emp_normalized['employee_id']
        .str.replace('EMP-', '', regex=False)
        .astype(int)
    )

    if emp_normalized['customer_id'].isna().any():
        raise ValueError("employee_id normalization produced null customer_id values")

    return trans_df, emp_normalized
```

`regex=False` on `str.replace` is important — it treats the first argument as a literal string, not a regex pattern. The `.astype(int)` will raise `ValueError` if any value can't be converted (a useful early-failure guard).

---

### Step 3: Left Merge (15 minutes)

With keys reconciled, the merge is straightforward:

```python
def merge_sources(trans_df: pd.DataFrame, emp_df: pd.DataFrame) -> pd.DataFrame:
    return trans_df.merge(
        emp_df[['customer_id', 'name', 'department', 'salary']],
        on='customer_id',
        how='left',
    )
```

`how='left'` keeps all rows from `trans_df`. Transactions whose `customer_id` doesn't exist in `emp_df` get `NaN` for `name`, `department`, and `salary`. This is the correct behavior — transactions from customers not in the employee directory are still valid and should appear in the output.

<Info>
Selecting only the needed columns from `emp_df` before merging (`emp_df[['customer_id', 'name', 'department', 'salary']]`) prevents bringing in unwanted columns like `hire_date` and `active`. Always narrow the right-side DataFrame before a left join.
</Info>

---

### Step 4: Validate and Summarize (20 minutes)

The critical post-merge validation is the row count check. A many-to-one relationship (one customer → many employee records) would inflate the transaction count. Since our employee dataset has one row per `customer_id`, the merge should be 1:1 for matched rows:

```python
def validate_merged(merged_df: pd.DataFrame, original_count: int) -> list:
    violations = []
    if len(merged_df) > original_count:
        violations.append(f"Row count inflated: {original_count} → {len(merged_df)}")
    if merged_df.duplicated(subset=['order_id']).any():
        violations.append("Duplicate order_ids after merge")
    if merged_df['customer_id'].isna().any():
        violations.append(f"{merged_df['customer_id'].isna().sum()} null customer_ids")
    return violations
```

---

## Expected Output

```
=== RAW DATA INSPECTION ===
Transactions: 10 rows | customer_id dtype: int64
Employees: 5 rows | employee_id sample: ['EMP-001', 'EMP-002', 'EMP-003']

After normalization: emp_df['customer_id'] dtype=int64
  Sample values: [1, 2, 3]

===== MERGE ENRICHMENT SUMMARY =====
Total transactions:           10
Matched (enriched):            8 (80.0%)
Unmatched (null enrichment):   2
Duplicate rows introduced:     0
Validation errors:             0
=====================================
```

Customers 99 and 100 have no matching employee record, so their enrichment columns are null. On the full 1,000-row dataset: `1000 transactions | 847 matched (84.7%) | 153 unmatched | 0 duplicate rows introduced`.

---

## Practice Exercises

<PracticeBlock
  prompt="Implement `normalize_keys(trans_df, emp_df)`. The employees dataset has `employee_id` in format 'EMP-001'. Extract the numeric part and cast to int to create a `customer_id` column that matches the integer customer_id in transactions. Raise ValueError if normalization produces any null values. Return (trans_df, emp_df_normalized)."
  initialCode={`import pandas as pd
import io

TRANSACTIONS_CSV = """order_id,customer_id,amount
1001,1,149.99
1002,2,84.50
1003,3,220.00
1004,99,55.00
"""

EMPLOYEES_CSV = """employee_id,name,department
EMP-001,Alice,Engineering
EMP-002,Bob,Marketing
EMP-003,Carol,Sales
"""

def normalize_keys(trans_df, emp_df):
    # TODO: extract numeric portion from employee_id → cast to int → add as customer_id
    return trans_df, emp_df.copy()

trans_df = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
emp_df = pd.read_csv(io.StringIO(EMPLOYEES_CSV))

trans_out, emp_out = normalize_keys(trans_df, emp_df)
print("emp_df columns:", list(emp_out.columns))
if 'customer_id' in emp_out.columns:
    print("customer_id dtype:", emp_out['customer_id'].dtype)
    print("customer_id values:", emp_out['customer_id'].tolist())

    # Test the merge
    merged = trans_out.merge(emp_out[['customer_id', 'name', 'department']], on='customer_id', how='left')
    print("\\nMerged result:")
    print(merged.to_string(index=False))`}
  hint="Use emp_df['employee_id'].str.replace('EMP-', '', regex=False).astype(int) to get the integer customer_id. Validate with .isna().any() before returning."
  solution={`import pandas as pd
import io

TRANSACTIONS_CSV = """order_id,customer_id,amount
1001,1,149.99
1002,2,84.50
1003,3,220.00
1004,99,55.00
"""

EMPLOYEES_CSV = """employee_id,name,department
EMP-001,Alice,Engineering
EMP-002,Bob,Marketing
EMP-003,Carol,Sales
"""

def normalize_keys(trans_df, emp_df):
    emp_normalized = emp_df.copy()
    emp_normalized['customer_id'] = (
        emp_normalized['employee_id']
        .str.replace('EMP-', '', regex=False)
        .astype(int)
    )
    if emp_normalized['customer_id'].isna().any():
        raise ValueError("employee_id normalization produced null customer_id values")
    return trans_df, emp_normalized

trans_df = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
emp_df = pd.read_csv(io.StringIO(EMPLOYEES_CSV))

trans_out, emp_out = normalize_keys(trans_df, emp_df)
print("emp_df columns:", list(emp_out.columns))
print("customer_id dtype:", emp_out['customer_id'].dtype)
print("customer_id values:", emp_out['customer_id'].tolist())

merged = trans_out.merge(emp_out[['customer_id', 'name', 'department']], on='customer_id', how='left')
print("\\nMerged result:")
print(merged.to_string(index=False))`}
/>

---

## Extension Challenges

1. **Flexible ID format handling**: Modify `normalize_keys()` to handle employee IDs that may be in two formats: `'EMP-001'` or just `'001'`. Use a regex: `emp_df['employee_id'].str.extract(r'(\d+)').astype(int)`. Test with a mixed dataset.

2. **Fuzzy match for unmatched records**: For transactions with no employee match (where `department` is null after the merge), implement a simple manual fuzzy lookup: check if `customer_id` falls within ±2 of any employee's `customer_id` (simulating a typo in numeric ID). Return a `potential_matches` column with the best candidate.

3. **Pytest test for merge integrity**: Write a pytest test for `validate_merged()` that constructs a merged DataFrame with one duplicated order_id and verifies the function returns a non-empty violations list. Write a second test that verifies a clean merged DataFrame returns an empty violations list.

---

## Key Takeaways

- Key mismatches between sources are one of the most common real-world integration problems — always inspect `dtypes` and sample values from both sources before attempting a join
- `str.replace('EMP-', '', regex=False).astype(int)` is the standard pattern for extracting numeric IDs from formatted string keys
- Left joins (`how='left'`) are the default for enrichment merges — they preserve all rows from the primary source and populate enrichment columns with NaN for unmatched rows
- Always validate row count after a merge — row inflation indicates a many-to-one relationship that wasn't accounted for in the data model
- Select only the columns you need from the right-side DataFrame before merging — this prevents column name collisions and keeps the output schema clean

---

[← Lesson 7: Project 6 — Data Quality Monitor](./lesson-07-project-6-data-quality-monitor.md) | [Next Lesson: Course Review and Patterns →](./lesson-09-course-review-and-patterns.md)
