# Lesson 3: Transform — Business Logic as Functions

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Structure transformation logic as composable, single-responsibility functions
- Chain multiple transformation steps using a list-of-functions pattern
- Validate data shape and dtypes at each transformation boundary
- Use a transformation registry for configurable pipelines

---

## Prerequisites

- Lesson 2: Extract Patterns
- pandas column operations, filtering, groupby (Sections 2–5)
- Python functions, functools

---

## Lesson Outline

### Part 1: Single-Responsibility Transforms (30 minutes)

#### One Function, One Responsibility

A transform function should do exactly one thing: clean, enrich, filter, aggregate, or reshape. This makes each step independently testable and replaceable.

```python
import pandas as pd
import io

RAW_DATA = """id,region,product,quantity,unit_price,status
1,EU,laptop,2,800.0,active
2,US,keyboard,5,45.0,active
3,EU,mouse,3,25.0,inactive
4,US,monitor,1,350.0,active
5,EU,cable,-2,10.0,active
"""

def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))


# ---------------------------------------------------------------
# Three single-responsibility transform functions
# ---------------------------------------------------------------

def remove_inactive(df: pd.DataFrame) -> pd.DataFrame:
    """Remove rows where status is not 'active'."""
    return df[df["status"] == "active"].copy()


def remove_negative_quantities(df: pd.DataFrame) -> pd.DataFrame:
    """Remove rows with quantity <= 0."""
    return df[df["quantity"] > 0].copy()


def add_revenue(df: pd.DataFrame) -> pd.DataFrame:
    """Add a revenue column: quantity * unit_price."""
    result = df.copy()
    result["revenue"] = result["quantity"] * result["unit_price"]
    return result


# ---------------------------------------------------------------
# Chain them in sequence
# ---------------------------------------------------------------

raw_df = extract(RAW_DATA)
print(f"Raw rows: {len(raw_df)}")

step1 = remove_inactive(raw_df)
print(f"After remove_inactive: {len(step1)} rows")

step2 = remove_negative_quantities(step1)
print(f"After remove_negative_quantities: {len(step2)} rows")

step3 = add_revenue(step2)
print(f"After add_revenue: {len(step3)} rows")
print(step3[["id", "region", "product", "revenue"]])
```

Notice three rules are followed by every function:
1. Accept a DataFrame, return a DataFrame (consistent interface)
2. Use `.copy()` before modifications — never mutate the input in place
3. No I/O, no side effects, no printing inside the function

---

### Part 2: Validation Inside Transforms (30 minutes)

#### Validate at Stage Boundaries

Transforms should fail loudly when preconditions are violated. A silent failure — returning wrong data — is far worse than a crash.

```python
import pandas as pd
import io

SALES_DATA = """order_id,amount,region
1001,250.0,EU
1002,150.0,US
1003,-50.0,EU
1004,0.0,US
1005,400.0,AP
"""


def validate_schema(df: pd.DataFrame, required_cols: list) -> None:
    """Raise ValueError if required columns are missing."""
    missing = set(required_cols) - set(df.columns)
    if missing:
        raise ValueError(f"Schema validation failed. Missing: {sorted(missing)}")


def filter_valid_amounts(df: pd.DataFrame) -> dict:
    """
    Filter rows where amount > 0.
    Returns dict with 'data' (valid rows) and 'rejected' (invalid rows).
    """
    validate_schema(df, ["order_id", "amount", "region"])

    valid = df[df["amount"] > 0].copy()
    rejected = df[df["amount"] <= 0].copy()
    rejected["reject_reason"] = "amount <= 0"

    if len(valid) == 0:
        raise ValueError("All rows rejected — no valid data to process")

    return {"data": valid, "rejected": rejected}


def add_region_label(df: pd.DataFrame) -> pd.DataFrame:
    """Add a human-readable region name column."""
    validate_schema(df, ["region"])

    region_map = {"EU": "Europe", "US": "United States", "AP": "Asia Pacific"}
    result = df.copy()
    result["region_name"] = result["region"].map(region_map).fillna("Unknown")
    return result


# Run the transform chain
df = pd.read_csv(io.StringIO(SALES_DATA))
result = filter_valid_amounts(df)
valid_df = result["data"]
rejected_df = result["rejected"]

print(f"Valid rows: {len(valid_df)}")
print(f"Rejected rows: {len(rejected_df)}")
print(rejected_df[["order_id", "amount", "reject_reason"]])

enriched_df = add_region_label(valid_df)
print("\nEnriched:")
print(enriched_df)
```

The `{"data": ..., "rejected": ...}` pattern gives callers full visibility into what happened without hiding rows.

---

### Part 3: Transform Composition Patterns (30 minutes)

#### List-of-Functions Pipeline

When you have multiple sequential steps, a list-of-functions pattern is cleaner than chained assignments:

```python
import pandas as pd
import io
from functools import reduce

RAW = """id,region,quantity,unit_price,status
1,EU,5,20.0,active
2,US,-1,15.0,active
3,EU,3,30.0,inactive
4,US,2,25.0,active
5,EU,0,10.0,active
"""

def remove_inactive(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["status"] == "active"].copy()

def remove_bad_quantities(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["quantity"] > 0].copy()

def add_revenue(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()
    result["revenue"] = result["quantity"] * result["unit_price"]
    return result


# ---------------------------------------------------------------
# Pattern 1: explicit list of steps (most readable)
# ---------------------------------------------------------------

def run_transforms(df: pd.DataFrame, steps: list) -> pd.DataFrame:
    for step in steps:
        rows_before = len(df)
        df = step(df)
        print(f"  {step.__name__}: {rows_before} -> {len(df)} rows")
    return df


raw_df = pd.read_csv(io.StringIO(RAW))
print("Running explicit step list:")
clean_df = run_transforms(raw_df, [remove_inactive, remove_bad_quantities, add_revenue])
print(clean_df[["id", "region", "revenue"]])


# ---------------------------------------------------------------
# Pattern 2: functools.reduce (functional style)
# ---------------------------------------------------------------

pipeline = [remove_inactive, remove_bad_quantities, add_revenue]
result = reduce(lambda df, fn: fn(df), pipeline, raw_df)
print("\nResult via reduce:", len(result), "rows")


# ---------------------------------------------------------------
# Pattern 3: transform registry — steps selected by name
# ---------------------------------------------------------------

TRANSFORM_REGISTRY = {
    "remove_inactive": remove_inactive,
    "remove_bad_quantities": remove_bad_quantities,
    "add_revenue": add_revenue,
}

def run_configured_pipeline(df: pd.DataFrame, step_names: list) -> pd.DataFrame:
    """Run a pipeline configured as a list of step names."""
    for name in step_names:
        if name not in TRANSFORM_REGISTRY:
            raise ValueError(f"Unknown transform step: '{name}'")
        df = TRANSFORM_REGISTRY[name](df)
    return df


# Configure pipeline from a list (could come from config file / YAML)
config_steps = ["remove_inactive", "add_revenue"]
print("\nConfigured pipeline (skipping bad_quantities check):")
configured_result = run_configured_pipeline(raw_df, config_steps)
print(configured_result[["id", "region", "revenue"]])
```

The registry pattern is powerful because the step list can come from a config file, environment variable, or database — the code does not need to change.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Three Composable Employee Transforms

<PracticeBlock
  prompt="Write three composable transform functions for an employee dataset: (1) filter_active — keep only active employees, (2) add_full_name — add full_name = first_name + ' ' + last_name, (3) compute_bonus — add annual_bonus = salary * 0.1. Chain them with run_transforms() and verify row counts and columns at each step."
  initialCode={`import pandas as pd
import io

EMPLOYEES = """employee_id,first_name,last_name,salary,status
1,Alice,Smith,95000,active
2,Bob,Jones,72000,inactive
3,Carol,Lee,88000,active
4,Dave,Brown,65000,active
5,Eve,Wilson,55000,inactive
"""

def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def run_transforms(df: pd.DataFrame, steps: list) -> pd.DataFrame:
    for step in steps:
        df = step(df)
    return df

# TODO: write filter_active(df), add_full_name(df), compute_bonus(df)
# Then chain them and print final DataFrame shape and columns
`}
  hint="filter_active: df[df['status'] == 'active'].copy(). add_full_name: result['full_name'] = result['first_name'] + ' ' + result['last_name']. compute_bonus: result['annual_bonus'] = result['salary'] * 0.1."
  solution={`import pandas as pd
import io

EMPLOYEES = """employee_id,first_name,last_name,salary,status
1,Alice,Smith,95000,active
2,Bob,Jones,72000,inactive
3,Carol,Lee,88000,active
4,Dave,Brown,65000,active
5,Eve,Wilson,55000,inactive
"""

def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def run_transforms(df: pd.DataFrame, steps: list) -> pd.DataFrame:
    for step in steps:
        rows_before = len(df)
        df = step(df)
        print(f"  {step.__name__}: {rows_before} -> {len(df)} rows")
    return df

def filter_active(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["status"] == "active"].copy()

def add_full_name(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()
    result["full_name"] = result["first_name"] + " " + result["last_name"]
    return result

def compute_bonus(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()
    result["annual_bonus"] = result["salary"] * 0.1
    return result

raw_df = extract(EMPLOYEES)
print(f"Raw: {len(raw_df)} rows, columns: {list(raw_df.columns)}")
final_df = run_transforms(raw_df, [filter_active, add_full_name, compute_bonus])
print(f"\\nFinal: {len(final_df)} rows, columns: {list(final_df.columns)}")
print(final_df[["employee_id", "full_name", "salary", "annual_bonus"]])`}
/>

#### Exercise 2: Schema Validator

<PracticeBlock
  prompt="Write a validate_schema(df, schema_dict) function where schema_dict maps column names to expected dtype strings (e.g., {'amount': 'float64', 'id': 'int64'}). Raise a SchemaError with a clear message listing all violations (wrong dtype or missing column)."
  initialCode={`import pandas as pd
import io

class SchemaError(Exception):
    pass

GOOD_DATA = """id,amount,product
1,100.0,apple
2,200.0,orange
"""

BAD_DATA = """product,amount
apple,not_a_number
orange,also_text
"""

SCHEMA = {"id": "int64", "amount": "float64", "product": "object"}

# TODO: write validate_schema(df, schema_dict) -> None
# It should raise SchemaError listing all violations
# Test with both GOOD_DATA and BAD_DATA
`}
  hint="Check missing columns first. Then for present columns, compare str(df[col].dtype) to expected. Collect all violations in a list before raising."
  solution={`import pandas as pd
import io

class SchemaError(Exception):
    pass

GOOD_DATA = """id,amount,product
1,100.0,apple
2,200.0,orange
"""

BAD_DATA = """product,amount
apple,not_a_number
orange,also_text
"""

SCHEMA = {"id": "int64", "amount": "float64", "product": "object"}

def validate_schema(df: pd.DataFrame, schema_dict: dict) -> None:
    violations = []
    for col, expected_dtype in schema_dict.items():
        if col not in df.columns:
            violations.append(f"  - Column '{col}' missing")
        else:
            actual = str(df[col].dtype)
            if actual != expected_dtype:
                violations.append(
                    f"  - Column '{col}': expected {expected_dtype}, got {actual}"
                )
    if violations:
        raise SchemaError("Schema validation failed:\\n" + "\\n".join(violations))

# Test 1: valid data
good_df = pd.read_csv(io.StringIO(GOOD_DATA))
try:
    validate_schema(good_df, SCHEMA)
    print("GOOD_DATA passed schema validation")
except SchemaError as e:
    print("Unexpected error:", e)

# Test 2: bad data
bad_df = pd.read_csv(io.StringIO(BAD_DATA))
try:
    validate_schema(bad_df, SCHEMA)
except SchemaError as e:
    print("\\nExpected SchemaError:")
    print(e)`}
/>

---

## Key Takeaways

- **One-responsibility transform functions** — each does one thing: filter, enrich, aggregate, or reshape
- **Validate at boundaries** — call `validate_schema()` at the start of transforms that depend on specific columns
- **Chain as a list-of-functions** — `for step in [clean, enrich, aggregate]: df = step(df)` is readable and flexible
- **Transform returns a new DataFrame** — never mutate the input; always `.copy()` before modifying
- **Transform registry** — map names to functions so pipeline steps can be configured externally

---

## Common Mistakes to Avoid

- Mutating `df` in place (e.g., `df["col"] = ...` without `.copy()`) — creates hard-to-trace bugs
- Doing I/O inside a transform (reading a lookup file) — pass lookup data as a parameter instead
- Ignoring rejected rows — always surface them in the return value or a separate output
- Writing one giant `transform()` function — split by responsibility for testability

---

[← Previous](./lesson-02-extract-patterns.md) | [Back to Course](./README.md) | [Next →](./lesson-04-load-patterns.md)
