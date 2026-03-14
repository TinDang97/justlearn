# Lesson 2: Schema Validation with Pandera

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Define a `DataFrameSchema` with typed `Column` definitions and `Check` constraints
- Run `.validate()` against a DataFrame and catch `SchemaError`
- Use built-in checks: `greater_than`, `isin`, `str_matches`, `less_than_or_equal_to`
- Write custom `Check` functions with error messages
- Use lazy validation to collect all violations in a single pass

---

## Prerequisites

- Lesson 1: Why Data Quality Matters
- Section 2: Pandas Fundamentals (DataFrames, dtypes)

---

## Lesson Outline

### Part 1: DataFrameSchema Basics (30 minutes)

#### Explanation

Pandera is a schema validation library for pandas DataFrames. A schema is a declaration of what a DataFrame **should** look like: column names, types, nullability, and value constraints. When you call `.validate()`, pandera checks every rule and raises a `SchemaError` if any violation is found.

Without pandera (or equivalent validation), a broken upstream change propagates silently through your pipeline until it surfaces as a wrong dashboard number — often hours or days later. With pandera, it fails immediately at the boundary.

**Note:** In this course, pandera is implemented manually using pandas to ensure compatibility with Pyodide (browser-based Python). The code below shows the pandera API pattern, and the manual implementation follows the same contract.

```python
import pandas as pd

# --- Manual schema validation (pandera-compatible pattern) ---
# We implement this without the pandera package for Pyodide compatibility.
# The API mirrors pandera's DataFrameSchema + Column + Check pattern.

class SchemaError(Exception):
    """Raised when a DataFrame fails schema validation."""
    def __init__(self, message, failure_cases=None):
        super().__init__(message)
        self.failure_cases = failure_cases or []

class Check:
    """Encapsulates a single validation rule for a column."""

    @staticmethod
    def greater_than(value):
        return lambda s: s > value

    @staticmethod
    def greater_than_or_equal_to(value):
        return lambda s: s >= value

    @staticmethod
    def less_than_or_equal_to(value):
        return lambda s: s <= value

    @staticmethod
    def isin(allowed):
        allowed_set = set(allowed)
        return lambda s: s.isin(allowed_set)

    @staticmethod
    def str_matches(pattern):
        return lambda s: s.str.match(pattern)

    @staticmethod
    def custom(fn, error="custom check failed"):
        fn._error = error
        return fn


class Column:
    """Schema definition for a single DataFrame column."""

    def __init__(self, dtype, checks=None, nullable=False, required=True):
        self.dtype = dtype          # expected pandas dtype string, e.g. 'int64', 'float64', 'object'
        self.checks = checks or []  # list of check functions (lambdas)
        self.nullable = nullable
        self.required = required


class DataFrameSchema:
    """Schema for validating an entire DataFrame."""

    def __init__(self, columns: dict):
        self.columns = columns  # {col_name: Column(...)}

    def validate(self, df: pd.DataFrame, lazy: bool = False):
        """
        Validate df against schema.
        lazy=False: raise on first violation.
        lazy=True:  collect all violations then raise SchemaError.
        """
        violations = []

        # 1. Check required columns are present
        for col_name, col_def in self.columns.items():
            if col_def.required and col_name not in df.columns:
                msg = f"Column '{col_name}' is required but missing from DataFrame"
                if not lazy:
                    raise SchemaError(msg)
                violations.append({'column': col_name, 'check': 'required', 'failure': msg})

        for col_name, col_def in self.columns.items():
            if col_name not in df.columns:
                continue

            series = df[col_name]

            # 2. Check nullability
            null_count = series.isnull().sum()
            if not col_def.nullable and null_count > 0:
                msg = f"Column '{col_name}': {null_count} null value(s) found (nullable=False)"
                if not lazy:
                    raise SchemaError(msg, failure_cases=df[series.isnull()].index.tolist())
                violations.append({'column': col_name, 'check': 'not_nullable', 'failure': msg})

            # 3. Run each check (skip nulls unless nullable=False already caught them)
            non_null = series.dropna()
            for check_fn in col_def.checks:
                try:
                    mask = check_fn(non_null)
                    failed = non_null[~mask]
                    if len(failed) > 0:
                        error_label = getattr(check_fn, '_error', check_fn.__name__)
                        msg = f"Column '{col_name}': {len(failed)} value(s) failed check '{error_label}'. Examples: {failed.head(3).tolist()}"
                        if not lazy:
                            raise SchemaError(msg, failure_cases=failed.index.tolist())
                        violations.append({'column': col_name, 'check': error_label, 'failure': msg})
                except SchemaError:
                    raise
                except Exception as e:
                    msg = f"Column '{col_name}': check raised exception: {e}"
                    if not lazy:
                        raise SchemaError(msg)
                    violations.append({'column': col_name, 'check': 'error', 'failure': msg})

        if violations:
            summary = f"Schema validation failed with {len(violations)} violation(s):\n"
            for v in violations:
                summary += f"  - [{v['column']}] {v['check']}: {v['failure']}\n"
            raise SchemaError(summary, failure_cases=violations)

        return df  # return validated DataFrame (pandera convention)
```

Now define a schema and validate an orders DataFrame:

```python
# Define schema for an orders table
orders_schema = DataFrameSchema({
    'order_id': Column(dtype='int64',   nullable=False),
    'amount':   Column(dtype='float64', nullable=False,
                       checks=[Check.greater_than(0)]),
    'status':   Column(dtype='object',  nullable=False,
                       checks=[Check.isin(['pending', 'shipped', 'delivered', 'cancelled'])]),
})

# Valid DataFrame — passes validation
valid_orders = pd.DataFrame({
    'order_id': [1001, 1002, 1003],
    'amount':   [49.99, 120.0, 89.50],
    'status':   ['pending', 'shipped', 'delivered'],
})

result = orders_schema.validate(valid_orders)
print("Validation passed:", result.shape)
# Validation passed: (3, 3)

# Invalid DataFrame — triggers SchemaError
bad_orders = pd.DataFrame({
    'order_id': [1004, 1005, 1006],
    'amount':   [55.0, -3.00, 0.0],       # -3.00 fails greater_than(0), 0.0 also fails
    'status':   ['shipped', 'unknown', 'delivered'],  # 'unknown' not in isin list
})

try:
    orders_schema.validate(bad_orders)
except SchemaError as e:
    print("SchemaError caught:")
    print(e)
```

---

### Part 2: Custom Checks and Lazy Validation (30 minutes)

#### Explanation

Built-in checks cover common cases. For business-specific rules, write a custom check function. With `lazy=True`, pandera collects **all** violations in a single pass instead of stopping at the first one — essential for batch reporting.

```python
import pandas as pd

# Re-use the schema classes from Part 1 (copy them into your script)

# Custom check: string length <= 50
def name_length_ok(series):
    return series.str.len() <= 50

name_length_ok._error = "name must be 50 characters or fewer"

# Custom check: email format (basic pattern)
def valid_email(series):
    return series.str.match(r'^[^@]+@[^@]+\.[^@]+$')

valid_email._error = "invalid email format"

# Schema with custom checks
employees_schema = DataFrameSchema({
    'employee_id': Column(dtype='int64',   nullable=False),
    'full_name':   Column(dtype='object',  nullable=False,
                          checks=[name_length_ok]),
    'email':       Column(dtype='object',  nullable=True,
                          checks=[valid_email]),
    'salary':      Column(dtype='float64', nullable=False,
                          checks=[Check.greater_than(0),
                                  Check.less_than_or_equal_to(500_000)]),
})

# DataFrame with multiple violations
df = pd.DataFrame({
    'employee_id': [1, 2, 3],
    'full_name':   ['Alice',
                    'B' * 60,        # too long — 60 chars
                    'Charlie'],
    'email':       ['alice@corp.com',
                    'not-an-email',   # invalid format
                    None],            # null is OK (nullable=True)
    'salary':      [85_000.0, 600_000.0, -1_000.0],  # 600k too high, -1000 negative
})

# Lazy=False (default): stops at FIRST violation
try:
    employees_schema.validate(df, lazy=False)
except SchemaError as e:
    print("First violation only:")
    print(e)
    print()

# Lazy=True: collect ALL violations before raising
try:
    employees_schema.validate(df, lazy=True)
except SchemaError as e:
    print(f"All violations ({len(e.failure_cases)}):")
    for case in e.failure_cases:
        print(f"  [{case['column']}] {case['check']}: {case['failure']}")
```

**When to use lazy=True:**
- Batch ingestion — you want a complete error report, not "fix one thing, re-run, find next error"
- Reporting pipelines — collect all violations, write them to a quality log, continue processing clean rows

---

### Part 3: Schema Inference from a DataFrame (30 minutes)

#### Explanation

Writing a schema from scratch for a 30-column DataFrame is tedious. An `infer_schema()` function bootstraps a schema by inspecting a DataFrame's dtypes. You then review and add domain-specific checks.

```python
import pandas as pd

def infer_schema(df: pd.DataFrame) -> dict:
    """
    Infer a basic schema from a DataFrame.
    Returns a dict of {col_name: {'dtype': str, 'nullable': bool, 'sample_values': list}}
    that you can use to bootstrap a DataFrameSchema.
    """
    schema_info = {}
    for col in df.columns:
        null_rate = df[col].isnull().mean()
        schema_info[col] = {
            'dtype':         str(df[col].dtype),
            'nullable':      null_rate > 0,
            'null_rate':     round(float(null_rate), 3),
            'unique_count':  int(df[col].nunique()),
            'sample_values': df[col].dropna().unique()[:3].tolist(),
        }
    return schema_info


def print_inferred_schema(schema_info: dict):
    """Pretty-print the inferred schema as Python code you can copy."""
    print("DataFrameSchema({")
    for col, info in schema_info.items():
        nullable_str = "True" if info['nullable'] else "False"
        print(f"    '{col}': Column(dtype='{info['dtype']}', nullable={nullable_str}),")
        print(f"    # null_rate={info['null_rate']}, unique={info['unique_count']}, "
              f"sample={info['sample_values']}")
    print("})")


# Example: infer from a transactions DataFrame
transactions = pd.DataFrame({
    'txn_id':    [1, 2, 3, 4, 5],
    'amount':    [49.99, 120.0, None, 89.50, 250.0],
    'currency':  ['USD', 'EUR', 'USD', 'USD', 'GBP'],
    'txn_date':  ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
    'status':    ['complete', 'pending', 'complete', 'refunded', 'complete'],
})

schema_info = infer_schema(transactions)
print("Inferred schema (bootstrap — review before production use):\n")
print_inferred_schema(schema_info)

# Output:
# DataFrameSchema({
#     'txn_id': Column(dtype='int64', nullable=False),
#     # null_rate=0.0, unique=5, sample=[1, 2, 3]
#     'amount': Column(dtype='float64', nullable=True),
#     # null_rate=0.2, unique=4, sample=[49.99, 120.0, 89.5]
#     ...
# })
```

**Workflow:** Infer → review → add domain checks (`greater_than(0)`, `isin(...)`) → version in source control → wire into pipeline.

---

### Part 4: Practice (30 minutes)

#### Explanation

A pre-written employees DataFrame has 3 injected schema violations. Your task is to read the `SchemaError` output and fix the **data** (not the schema) to make validation pass.

<PracticeBlock
  prompt="The employees DataFrame below has 3 schema violations. Run validate() with lazy=True to find all of them, then fix the data so validation passes. Do not modify the schema."
  initialCode={`import pandas as pd

# --- Schema classes (copy from lesson) ---
class SchemaError(Exception):
    def __init__(self, message, failure_cases=None):
        super().__init__(message)
        self.failure_cases = failure_cases or []

class Check:
    @staticmethod
    def greater_than(value):
        return lambda s: s > value
    @staticmethod
    def isin(allowed):
        allowed_set = set(allowed)
        return lambda s: s.isin(allowed_set)

class Column:
    def __init__(self, dtype, checks=None, nullable=False):
        self.dtype = dtype
        self.checks = checks or []
        self.nullable = nullable

class DataFrameSchema:
    def __init__(self, columns):
        self.columns = columns
    def validate(self, df, lazy=False):
        violations = []
        for col_name, col_def in self.columns.items():
            if col_name not in df.columns:
                msg = f"Column '{col_name}' missing"
                if not lazy: raise SchemaError(msg)
                violations.append({'column': col_name, 'check': 'required', 'failure': msg})
                continue
            series = df[col_name]
            null_count = series.isnull().sum()
            if not col_def.nullable and null_count > 0:
                msg = f"Column '{col_name}': {null_count} null(s) (nullable=False)"
                if not lazy: raise SchemaError(msg)
                violations.append({'column': col_name, 'check': 'not_nullable', 'failure': msg})
            non_null = series.dropna()
            for check_fn in col_def.checks:
                try:
                    mask = check_fn(non_null)
                    failed = non_null[~mask]
                    if len(failed) > 0:
                        label = getattr(check_fn, '_error', 'check')
                        msg = f"Column '{col_name}': {len(failed)} value(s) failed '{label}'. Examples: {failed.head(3).tolist()}"
                        if not lazy: raise SchemaError(msg)
                        violations.append({'column': col_name, 'check': label, 'failure': msg})
                except SchemaError:
                    raise
        if violations:
            summary = f"{len(violations)} violation(s) found:\\n"
            for v in violations:
                summary += f"  [{v['column']}] {v['check']}: {v['failure']}\\n"
            raise SchemaError(summary, failure_cases=violations)
        return df

# Schema (do NOT modify)
employees_schema = DataFrameSchema({
    'emp_id':     Column(dtype='int64',   nullable=False),
    'department': Column(dtype='object',  nullable=False,
                         checks=[Check.isin(['Engineering', 'Marketing', 'Finance', 'HR'])]),
    'salary':     Column(dtype='float64', nullable=False,
                         checks=[Check.greater_than(0)]),
})

# DataFrame with 3 violations — fix the DATA to make validation pass
df = pd.DataFrame({
    'emp_id':     [1, 2, 3, 4, 5],
    'department': ['Engineering', 'Marketing', 'IT',    # 'IT' not in allowed set
                   'Finance', None],                      # None violates nullable=False
    'salary':     [75000.0, 82000.0, 68000.0, -1000.0, 95000.0],  # -1000 violates > 0
})

# Step 1: run with lazy=True to see all violations
try:
    employees_schema.validate(df, lazy=True)
except SchemaError as e:
    print("Violations found:")
    print(e)

# Step 2: fix df here
# df = df.copy()
# df.loc[...] = ...

# Step 3: validate again — should pass with no errors
# employees_schema.validate(df)
# print("Validation passed!")
`}
  hint="Violation 1: row 2, department='IT' → change to 'Engineering'. Violation 2: row 4, department=None → fill with a valid department. Violation 3: row 3, salary=-1000.0 → change to a positive value like 68000.0."
  solution={`import pandas as pd

class SchemaError(Exception):
    def __init__(self, message, failure_cases=None):
        super().__init__(message)
        self.failure_cases = failure_cases or []

class Check:
    @staticmethod
    def greater_than(value):
        return lambda s: s > value
    @staticmethod
    def isin(allowed):
        allowed_set = set(allowed)
        return lambda s: s.isin(allowed_set)

class Column:
    def __init__(self, dtype, checks=None, nullable=False):
        self.dtype = dtype
        self.checks = checks or []
        self.nullable = nullable

class DataFrameSchema:
    def __init__(self, columns):
        self.columns = columns
    def validate(self, df, lazy=False):
        violations = []
        for col_name, col_def in self.columns.items():
            if col_name not in df.columns:
                msg = f"Column '{col_name}' missing"
                if not lazy: raise SchemaError(msg)
                violations.append({'column': col_name, 'check': 'required', 'failure': msg})
                continue
            series = df[col_name]
            null_count = series.isnull().sum()
            if not col_def.nullable and null_count > 0:
                msg = f"Column '{col_name}': {null_count} null(s) (nullable=False)"
                if not lazy: raise SchemaError(msg)
                violations.append({'column': col_name, 'check': 'not_nullable', 'failure': msg})
            non_null = series.dropna()
            for check_fn in col_def.checks:
                try:
                    mask = check_fn(non_null)
                    failed = non_null[~mask]
                    if len(failed) > 0:
                        label = getattr(check_fn, '_error', 'check')
                        msg = f"Column '{col_name}': {len(failed)} value(s) failed '{label}'. Examples: {failed.head(3).tolist()}"
                        if not lazy: raise SchemaError(msg)
                        violations.append({'column': col_name, 'check': label, 'failure': msg})
                except SchemaError:
                    raise
        if violations:
            summary = f"{len(violations)} violation(s) found:\\n"
            for v in violations:
                summary += f"  [{v['column']}] {v['check']}: {v['failure']}\\n"
            raise SchemaError(summary, failure_cases=violations)
        return df

employees_schema = DataFrameSchema({
    'emp_id':     Column(dtype='int64',   nullable=False),
    'department': Column(dtype='object',  nullable=False,
                         checks=[Check.isin(['Engineering', 'Marketing', 'Finance', 'HR'])]),
    'salary':     Column(dtype='float64', nullable=False,
                         checks=[Check.greater_than(0)]),
})

df = pd.DataFrame({
    'emp_id':     [1, 2, 3, 4, 5],
    'department': ['Engineering', 'Marketing', 'IT', 'Finance', None],
    'salary':     [75000.0, 82000.0, 68000.0, -1000.0, 95000.0],
})

print("Before fix — violations:")
try:
    employees_schema.validate(df, lazy=True)
except SchemaError as e:
    print(e)

# Fix the data
df = df.copy()
df.loc[2, 'department'] = 'Engineering'   # 'IT' → valid department
df.loc[4, 'department'] = 'HR'            # None → valid department
df.loc[3, 'salary'] = 68000.0             # -1000 → positive salary

print("After fix:")
result = employees_schema.validate(df)
print("Validation passed! Shape:", result.shape)
print(result)
`}
/>

---

## Key Takeaways

- A `DataFrameSchema` is executable documentation — it lives in version control alongside pipeline code
- `nullable=False` is the correct default; use `nullable=True` only when null is a valid business value
- `lazy=True` is essential for batch validation — you want all violations at once, not one at a time
- Custom `Check` functions encapsulate domain rules that built-in checks cannot express
- `infer_schema()` bootstraps schema generation from an existing DataFrame — always review and add domain checks before using in production
- `SchemaError` should include enough detail to identify the affected rows — not just "validation failed"

---

## Common Mistakes to Avoid

- **Validating after transformation instead of before**: validate raw input before transforming it; validation of transformed output catches different (and later) issues
- **Using `nullable=True` everywhere**: this defeats the purpose of schema validation; every column should have a documented null policy
- **Not catching `SchemaError` in production code**: unhandled `SchemaError` crashes the pipeline; wrap `contract.enforce()` calls in try/except and route violations to a dead-letter queue or alert system
- **Writing schemas once and never updating them**: schemas need to evolve with the data; version them (`v1.0`, `v2.0`) and update when upstream contracts change

---

## Next Lesson Preview

- How to build a `profile_dataframe()` function that produces per-column statistics
- How to detect high-cardinality columns and near-zero variance columns
- How profiling output guides cleaning priority decisions

---

[← Previous: Why Data Quality Matters](./lesson-01-why-data-quality-matters.md) | [Next: Data Profiling with Pandas →](./lesson-03-data-profiling-with-pandas.md)
