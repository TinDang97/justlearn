# Lesson 6: Implementing Data Contracts

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Implement a data contract as a Python dataclass with an embedded schema
- Write an `enforce()` method that validates schema, row count, and null rate at a pipeline boundary
- Raise a `ContractViolationError` with actionable details for each violation
- Version a contract using a `version` field
- Wire `contract.enforce()` into an ETL pipeline at extract, transform, and load boundaries

---

## Prerequisites

- Lesson 5: Data Contracts — Introduction
- Lesson 2: Schema Validation with Pandera (the schema classes are reused here)

---

## Lesson Outline

### Part 1: Contract as a Dataclass (30 minutes)

#### Explanation

The contract dataclass is the core pattern. It bundles:
- A `DataFrameSchema` (schema layer — from Lesson 2)
- SLA parameters (`min_row_count`, `max_null_rate`)
- A `version` string for change tracking
- An `enforce()` method that runs all checks

```python
import pandas as pd
from dataclasses import dataclass, field

# --- Reuse schema classes from Lesson 2 ---
class SchemaError(Exception):
    def __init__(self, message, failure_cases=None):
        super().__init__(message)
        self.failure_cases = failure_cases or []

class ContractViolationError(Exception):
    """
    Raised when a DataFrame fails a data contract.
    Contains enough detail to identify the boundary, version, and specific failures.
    """
    def __init__(self, contract_name: str, version: str, violations: list):
        self.contract_name = contract_name
        self.version = version
        self.violations = violations
        message = (
            f"Contract '{contract_name}' v{version} violated "
            f"({len(violations)} violation(s)):\n"
            + "\n".join(f"  - {v}" for v in violations)
        )
        super().__init__(message)

class Check:
    @staticmethod
    def greater_than(value):
        fn = lambda s: s > value
        fn._error = f"greater_than({value})"
        return fn
    @staticmethod
    def less_than_or_equal_to(value):
        fn = lambda s: s <= value
        fn._error = f"less_than_or_equal_to({value})"
        return fn
    @staticmethod
    def isin(allowed):
        allowed_set = set(allowed)
        fn = lambda s: s.isin(allowed_set)
        fn._error = f"isin({sorted(allowed_set)})"
        return fn

class Column:
    def __init__(self, dtype, checks=None, nullable=False):
        self.dtype = dtype
        self.checks = checks or []
        self.nullable = nullable

class DataFrameSchema:
    def __init__(self, columns: dict):
        self.columns = columns

    def validate(self, df: pd.DataFrame, lazy: bool = False) -> list:
        """Returns list of violation strings (empty = valid)."""
        violations = []
        for col_name, col_def in self.columns.items():
            if col_name not in df.columns:
                msg = f"column '{col_name}' is required but missing"
                if not lazy:
                    return [msg]
                violations.append(msg)
                continue
            series = df[col_name]
            null_count = series.isnull().sum()
            if not col_def.nullable and null_count > 0:
                msg = f"column '{col_name}': {null_count} null value(s) found (nullable=False)"
                if not lazy:
                    return [msg]
                violations.append(msg)
            non_null = series.dropna()
            for check_fn in col_def.checks:
                try:
                    mask = check_fn(non_null)
                    failed = non_null[~mask]
                    if len(failed) > 0:
                        label = getattr(check_fn, '_error', 'custom_check')
                        msg = f"column '{col_name}': {len(failed)} value(s) failed check '{label}'. Examples: {failed.head(3).tolist()}"
                        if not lazy:
                            return [msg]
                        violations.append(msg)
                except Exception as e:
                    violations.append(f"column '{col_name}': check raised exception: {e}")
        return violations


# --- The contract dataclass ---
@dataclass
class OrdersContract:
    """
    Data contract for the orders pipeline boundary.

    Schema layer:    defined in _build_schema()
    Semantics layer: amount > 0, status in allowed set (embedded in schema checks)
    SLA layer:       min_row_count, max_null_rate
    """
    version: str       = "1.0"
    min_row_count: int = 100
    max_null_rate: float = 0.05

    def _build_schema(self) -> DataFrameSchema:
        return DataFrameSchema({
            'order_id': Column(dtype='int64',   nullable=False),
            'amount':   Column(dtype='float64', nullable=False,
                               checks=[Check.greater_than(0),
                                       Check.less_than_or_equal_to(100_000)]),
            'status':   Column(dtype='object',  nullable=False,
                               checks=[Check.isin(['pending', 'shipped', 'delivered', 'cancelled'])]),
            'customer_id': Column(dtype='int64', nullable=False),
        })

    def enforce(self, df: pd.DataFrame) -> None:
        """
        Validate df against all contract layers.
        Raises ContractViolationError with full violation list if any check fails.
        """
        violations = []

        # --- Schema layer ---
        schema = self._build_schema()
        schema_violations = schema.validate(df, lazy=True)
        violations.extend(schema_violations)

        # --- SLA: minimum row count ---
        if len(df) < self.min_row_count:
            violations.append(
                f"min_row_count: got {len(df)} rows, expected >= {self.min_row_count}"
            )

        # --- SLA: maximum null rate across all columns ---
        actual_null_rate = float(df.isnull().mean().max())
        if actual_null_rate > self.max_null_rate:
            worst_col = df.isnull().mean().idxmax()
            violations.append(
                f"max_null_rate: column '{worst_col}' has null rate "
                f"{actual_null_rate:.3f}, exceeds limit {self.max_null_rate}"
            )

        if violations:
            raise ContractViolationError(
                contract_name="OrdersContract",
                version=self.version,
                violations=violations,
            )


# --- Test the contract ---
contract = OrdersContract(version="1.0", min_row_count=3, max_null_rate=0.05)

# Valid DataFrame
valid_df = pd.DataFrame({
    'order_id':    [1001, 1002, 1003, 1004, 1005],
    'amount':      [49.99, 120.0, 89.50, 250.0, 15.0],
    'status':      ['pending', 'shipped', 'delivered', 'shipped', 'cancelled'],
    'customer_id': [101, 102, 103, 104, 105],
})

contract.enforce(valid_df)   # no exception raised
print("Valid DataFrame: contract passed.")

# Invalid DataFrame — too few rows
small_df = pd.DataFrame({
    'order_id':    [1],
    'amount':      [49.99],
    'status':      ['pending'],
    'customer_id': [101],
})

try:
    contract.enforce(small_df)
except ContractViolationError as e:
    print(f"\nContractViolationError caught:\n{e}")
```

---

### Part 2: The `enforce()` Implementation in Detail (30 minutes)

#### Explanation

Let's walk through a more complete `enforce()` that handles all three contract layers explicitly and produces a clear, actionable error message.

```python
import pandas as pd
from dataclasses import dataclass

# (Assume all schema classes are available from Part 1)

@dataclass
class TransactionsContract:
    """
    Contract for the transactions pipeline: ingestion → transform boundary.
    Semantics: amounts in USD, positive; currency ISO codes.
    SLA: at least 500 transactions per daily run, < 2% nulls.
    """
    version: str        = "2.0"
    min_row_count: int  = 500
    max_null_rate: float = 0.02
    allowed_currencies: tuple = ('USD', 'EUR', 'GBP', 'JPY', 'CAD')

    def _build_schema(self) -> DataFrameSchema:
        currency_check = Check.isin(self.allowed_currencies)
        return DataFrameSchema({
            'txn_id':    Column(dtype='int64',   nullable=False),
            'amount':    Column(dtype='float64', nullable=False,
                                checks=[Check.greater_than(0)]),
            'currency':  Column(dtype='object',  nullable=False,
                                checks=[currency_check]),
            'customer_id': Column(dtype='int64', nullable=False),
            'txn_date':  Column(dtype='object',  nullable=False),
        })

    def enforce(self, df: pd.DataFrame) -> None:
        violations = []

        # --- Schema layer (lazy=True collects all column violations) ---
        schema = self._build_schema()
        schema_violations = schema.validate(df, lazy=True)
        violations.extend(schema_violations)

        # --- SLA: row count ---
        if len(df) < self.min_row_count:
            violations.append(
                f"min_row_count: {len(df)} rows received, minimum is {self.min_row_count}. "
                f"Possible data source issue or incomplete daily load."
            )

        # --- SLA: null rate ---
        null_rates = df.isnull().mean()
        bad_cols = null_rates[null_rates > self.max_null_rate]
        for col_name, rate in bad_cols.items():
            violations.append(
                f"max_null_rate: column '{col_name}' has {rate:.1%} nulls "
                f"(limit: {self.max_null_rate:.1%})"
            )

        # --- Semantics: txn_date must be parseable ---
        if 'txn_date' in df.columns:
            unparseable = pd.to_datetime(df['txn_date'], errors='coerce').isna().sum()
            if unparseable > 0:
                violations.append(
                    f"semantics: {unparseable} txn_date value(s) cannot be parsed as datetime"
                )

        if violations:
            raise ContractViolationError(
                contract_name="TransactionsContract",
                version=self.version,
                violations=violations,
            )


# --- Demo: enforce at pipeline boundary ---
# Build a DataFrame that fails on multiple checks
df_bad = pd.DataFrame({
    'txn_id':      [1, 2, 3],
    'amount':      [50.0, -10.0, 200.0],          # -10 violates > 0
    'currency':    ['USD', 'BTC', 'EUR'],           # 'BTC' not in allowed currencies
    'customer_id': [101, 102, 103],
    'txn_date':    ['2024-01-01', 'not-a-date', '2024-01-03'],  # bad date
})

contract_v2 = TransactionsContract(version="2.0", min_row_count=10, max_null_rate=0.02)

try:
    contract_v2.enforce(df_bad)
except ContractViolationError as e:
    print("All violations collected (lazy=True behavior):")
    for i, v in enumerate(e.violations, 1):
        print(f"  {i}. {v}")
```

---

### Part 3: Wiring Contracts into a Pipeline (30 minutes)

#### Explanation

Where exactly in an ETL function do you call `contract.enforce(df)`? The answer: **at every boundary crossing** — after extract, after transform, before load.

```python
import pandas as pd
from dataclasses import dataclass

# (Assume schema classes and ContractViolationError are available)

# Define two contracts: raw (extract boundary) and processed (load boundary)
raw_contract = OrdersContract(version="1.0", min_row_count=1, max_null_rate=0.10)
processed_contract = OrdersContract(version="1.0", min_row_count=1, max_null_rate=0.02)


def extract_orders(source_data: list) -> pd.DataFrame:
    """Extract: convert raw source data to DataFrame."""
    df = pd.DataFrame(source_data)
    # Guarantee: raw data matches ingestion contract before any transformation
    # This catches upstream schema changes immediately at the source boundary.
    raw_contract.enforce(df)  # <-- Contract A: raw boundary
    return df


def transform_orders(df: pd.DataFrame) -> pd.DataFrame:
    """Transform: clean and enrich orders."""
    df = df.copy()

    # Normalize status to lowercase
    df['status'] = df['status'].str.lower().str.strip()

    # Cap extreme amounts at 50,000
    df['amount'] = df['amount'].clip(upper=50_000.0)

    return df


def load_orders(df: pd.DataFrame, target: list) -> None:
    """Load: write processed orders to target."""
    # Guarantee: processed data matches output contract before touching storage
    # This prevents bad data from reaching downstream consumers.
    processed_contract.enforce(df)  # <-- Contract B: load boundary
    target.extend(df.to_dict('records'))
    print(f"Loaded {len(df)} rows.")


def run_pipeline(source_data: list, target: list) -> None:
    """Full ETL pipeline with contract enforcement at both boundaries."""
    try:
        raw_df   = extract_orders(source_data)         # Contract A enforced here
        clean_df = transform_orders(raw_df)
        load_orders(clean_df, target)                   # Contract B enforced here
        print("Pipeline complete.")
    except ContractViolationError as e:
        # In production: route to dead-letter queue, send alert, do NOT swallow
        print(f"PIPELINE BLOCKED: {e}")
        raise  # re-raise so the caller knows the pipeline failed


# Happy path
source_records = [
    {'order_id': 1001, 'amount': 49.99, 'status': 'Pending', 'customer_id': 101},
    {'order_id': 1002, 'amount': 120.0, 'status': 'SHIPPED', 'customer_id': 102},
    {'order_id': 1003, 'amount': 89.50, 'status': 'delivered', 'customer_id': 103},
]
warehouse = []
run_pipeline(source_records, warehouse)
print(f"Warehouse has {len(warehouse)} records.")

# Broken source: upstream renamed 'order_id' to 'id'
broken_source = [
    {'id': 2001, 'amount': 75.0, 'status': 'pending', 'customer_id': 201},
]
try:
    run_pipeline(broken_source, warehouse)
except ContractViolationError:
    print("\nPipeline correctly blocked bad source data.")
```

**Annotation: what each `enforce()` call guarantees:**

```python
raw_contract.enforce(df)
# Guarantee: upstream schema has not changed (no missing columns,
# no type changes, no null explosion). Catches: field renames,
# upstream data model changes, incomplete loads.

processed_contract.enforce(df)
# Guarantee: transformation logic did not introduce bugs (no new nulls,
# no invalid status values, no negative amounts post-transform).
# Catches: transform regressions, logic bugs in cleaning code.
```

---

### Part 4: Practice (30 minutes)

#### Explanation

A pre-written `transform_orders()` function is provided. Define an `OrdersContract`, inject a DataFrame that has only 50 rows (less than `min_row_count=100`), call `contract.enforce()`, and handle `ContractViolationError`.

<PracticeBlock
  prompt="Define an OrdersContract with min_row_count=100. Build a 50-row DataFrame, call contract.enforce(df), catch ContractViolationError, and print the violation details."
  initialCode={`import pandas as pd
from dataclasses import dataclass

# Schema classes (available from previous lessons)
class ContractViolationError(Exception):
    def __init__(self, contract_name, version, violations):
        self.contract_name = contract_name
        self.version = version
        self.violations = violations
        message = (
            f"Contract '{contract_name}' v{version} violated "
            f"({len(violations)} violation(s)):\\n"
            + "\\n".join(f"  - {v}" for v in violations)
        )
        super().__init__(message)

class Check:
    @staticmethod
    def greater_than(value):
        fn = lambda s: s > value
        fn._error = f"greater_than({value})"
        return fn
    @staticmethod
    def isin(allowed):
        allowed_set = set(allowed)
        fn = lambda s: s.isin(allowed_set)
        fn._error = f"isin({sorted(allowed_set)})"
        return fn

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
                msg = f"column '{col_name}' is required but missing"
                if not lazy: return [msg]
                violations.append(msg)
                continue
            series = df[col_name]
            null_count = series.isnull().sum()
            if not col_def.nullable and null_count > 0:
                msg = f"column '{col_name}': {null_count} null(s) (nullable=False)"
                if not lazy: return [msg]
                violations.append(msg)
            non_null = series.dropna()
            for check_fn in col_def.checks:
                try:
                    mask = check_fn(non_null)
                    failed = non_null[~mask]
                    if len(failed) > 0:
                        label = getattr(check_fn, '_error', 'check')
                        msg = f"column '{col_name}': {len(failed)} value(s) failed '{label}'"
                        if not lazy: return [msg]
                        violations.append(msg)
                except Exception as e:
                    violations.append(f"column '{col_name}': exception: {e}")
        return violations

# TODO: define OrdersContract with version="1.0", min_row_count=100, max_null_rate=0.05

# TODO: build a 50-row DataFrame with valid schema but < 100 rows
# df = pd.DataFrame({...})

# TODO: call contract.enforce(df) and catch ContractViolationError
# Print the violations list
`}
  hint="The @dataclass decorator is optional here — just define __init__ with version, min_row_count, max_null_rate. In enforce(): check len(df) < self.min_row_count and append to violations list. At the end, if violations: raise ContractViolationError(...)."
  solution={`import pandas as pd
from dataclasses import dataclass

class ContractViolationError(Exception):
    def __init__(self, contract_name, version, violations):
        self.contract_name = contract_name
        self.version = version
        self.violations = violations
        message = (
            f"Contract '{contract_name}' v{version} violated "
            f"({len(violations)} violation(s)):\\n"
            + "\\n".join(f"  - {v}" for v in violations)
        )
        super().__init__(message)

class Check:
    @staticmethod
    def greater_than(value):
        fn = lambda s: s > value
        fn._error = f"greater_than({value})"
        return fn
    @staticmethod
    def isin(allowed):
        allowed_set = set(allowed)
        fn = lambda s: s.isin(allowed_set)
        fn._error = f"isin({sorted(allowed_set)})"
        return fn

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
                msg = f"column '{col_name}' is required but missing"
                if not lazy: return [msg]
                violations.append(msg)
                continue
            series = df[col_name]
            null_count = series.isnull().sum()
            if not col_def.nullable and null_count > 0:
                msg = f"column '{col_name}': {null_count} null(s) (nullable=False)"
                if not lazy: return [msg]
                violations.append(msg)
            non_null = series.dropna()
            for check_fn in col_def.checks:
                try:
                    mask = check_fn(non_null)
                    failed = non_null[~mask]
                    if len(failed) > 0:
                        label = getattr(check_fn, '_error', 'check')
                        msg = f"column '{col_name}': {len(failed)} value(s) failed '{label}'"
                        if not lazy: return [msg]
                        violations.append(msg)
                except Exception as e:
                    violations.append(f"column '{col_name}': exception: {e}")
        return violations

@dataclass
class OrdersContract:
    version: str        = "1.0"
    min_row_count: int  = 100
    max_null_rate: float = 0.05

    def _build_schema(self):
        return DataFrameSchema({
            'order_id':    Column(dtype='int64',   nullable=False),
            'amount':      Column(dtype='float64', nullable=False,
                                  checks=[Check.greater_than(0)]),
            'status':      Column(dtype='object',  nullable=False,
                                  checks=[Check.isin(['pending', 'shipped', 'delivered', 'cancelled'])]),
            'customer_id': Column(dtype='int64',   nullable=False),
        })

    def enforce(self, df):
        violations = []
        schema = self._build_schema()
        violations.extend(schema.validate(df, lazy=True))
        if len(df) < self.min_row_count:
            violations.append(
                f"min_row_count: got {len(df)} rows, expected >= {self.min_row_count}"
            )
        actual_null_rate = float(df.isnull().mean().max())
        if actual_null_rate > self.max_null_rate:
            worst_col = df.isnull().mean().idxmax()
            violations.append(
                f"max_null_rate: column '{worst_col}' has null rate "
                f"{actual_null_rate:.3f}, exceeds limit {self.max_null_rate}"
            )
        if violations:
            raise ContractViolationError("OrdersContract", self.version, violations)

# Build 50-row DataFrame (valid schema, but too few rows)
n = 50
df = pd.DataFrame({
    'order_id':    list(range(1001, 1001 + n)),
    'amount':      [round(10 + i * 4.9, 2) for i in range(n)],
    'status':      ['pending', 'shipped', 'delivered', 'cancelled'] * (n // 4) + ['pending'] * (n % 4),
    'customer_id': list(range(201, 201 + n)),
})

contract = OrdersContract(version="1.0", min_row_count=100, max_null_rate=0.05)
print(f"DataFrame has {len(df)} rows. Contract requires {contract.min_row_count}.")

try:
    contract.enforce(df)
    print("Contract passed (unexpected).")
except ContractViolationError as e:
    print(f"ContractViolationError raised!")
    print(f"Contract: {e.contract_name} v{e.version}")
    print(f"Violations ({len(e.violations)}):")
    for v in e.violations:
        print(f"  - {v}")
`}
/>

---

## Key Takeaways

- A contract is a **value object**: immutable, version-stamped, and independently testable
- `enforce()` at boundaries = shift-left quality — bad data is caught at the source, not at the dashboard
- `ContractViolationError` must include enough detail to fix the data: which column, which rule, how many rows affected
- Two contract positions in ETL: raw boundary (after extract) and load boundary (before load) — these catch different failure modes
- Versioning contracts (`v1.0`, `v2.0`) enables safe evolution — consumers can pin to a version and migrate on their schedule

---

## Common Mistakes to Avoid

- **Swallowing `ContractViolationError` with bare `except`**: always re-raise or route to an alert/dead-letter queue; silent swallowing defeats the purpose
- **Not versioning contracts**: without version fields, `v1` and `v2` become ambiguous; callers cannot detect which contract they are enforcing
- **Enforcing contracts only at the end of the pipeline**: a contract at the load boundary catches transformation bugs, but won't tell you *which* transformation introduced them; enforce at both raw and load boundaries

---

## Next Lesson Preview

- How pytest fixtures create reusable test DataFrames
- How `pytest.mark.parametrize` eliminates copy-paste edge case tests
- How `pd.testing.assert_frame_equal` gives column-level diffs when a transformation test fails

---

[← Previous: Data Contracts — Introduction](./lesson-05-data-contracts-introduction.md) | [Next: Testing Pipelines with pytest →](./lesson-07-testing-pipelines-with-pytest.md)
