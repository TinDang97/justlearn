# Lesson 7: Testing Pipelines with pytest

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Write pytest fixtures that create reusable sample DataFrames
- Use `pytest.mark.parametrize` to test multiple input variants without code duplication
- Use `pd.testing.assert_frame_equal` to compare DataFrame outputs with column-level diff on failure
- Test that invalid inputs raise expected exceptions with `pytest.raises`
- Structure a pipeline test file following the fixture → act → assert pattern

---

## Prerequisites

- Lesson 6: Implementing Data Contracts
- Python testing basics (what a test function is, how to run pytest)

---

## Lesson Outline

### Part 1: pytest Fixtures for DataFrames (30 minutes)

#### Explanation

A **fixture** is a reusable piece of test setup. Instead of copying a 10-row DataFrame into every test, you define it once as a fixture and inject it by name. pytest manages fixture lifecycle, including teardown when needed.

For pipeline tests, you typically need two fixtures:
- A **clean fixture** (happy path — all valid data)
- A **dirty fixture** (edge cases — nulls, invalid values, duplicates)

```python
# test_orders_pipeline.py
import pytest
import pandas as pd
from pandas.testing import assert_frame_equal


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_orders():
    """5-row orders DataFrame with all valid data. Happy path."""
    return pd.DataFrame({
        'order_id':    [1001, 1002, 1003, 1004, 1005],
        'customer_id': [101, 102, 103, 104, 105],
        'amount':      [49.99, 120.0, 89.50, 250.0, 15.0],
        'status':      ['pending', 'shipped', 'delivered', 'shipped', 'cancelled'],
    })


@pytest.fixture
def dirty_orders(sample_orders):
    """Extends sample_orders with 3 problematic rows."""
    extra = pd.DataFrame({
        'order_id':    [1006, 1007, 1008],
        'customer_id': [None, 107, 108],        # null customer_id
        'amount':      [0.0, -5.0, 99.99],       # zero and negative amount
        'status':      ['shipped', 'UNKNOWN', 'pending'],  # invalid status
    })
    return pd.concat([sample_orders, extra], ignore_index=True)


@pytest.fixture
def orders_with_duplicates(sample_orders):
    """sample_orders with one duplicate order_id."""
    dupe = sample_orders.iloc[[0]].copy()  # duplicate first row
    return pd.concat([sample_orders, dupe], ignore_index=True)


# ─── Tests ───────────────────────────────────────────────────────────────────

def test_sample_orders_shape(sample_orders):
    """Fixture sanity check: correct shape and columns."""
    assert sample_orders.shape == (5, 4)
    assert list(sample_orders.columns) == ['order_id', 'customer_id', 'amount', 'status']


def test_sample_orders_no_nulls(sample_orders):
    """Happy path: clean fixture has no nulls."""
    assert sample_orders.isnull().sum().sum() == 0


def test_dirty_orders_has_null_customer(dirty_orders):
    """Dirty fixture contains the expected null."""
    assert dirty_orders['customer_id'].isnull().sum() == 1


def test_orders_with_duplicates_count(orders_with_duplicates):
    """Duplicate fixture has correct row count."""
    assert len(orders_with_duplicates) == 6


# Run this file with: pytest test_orders_pipeline.py -v
```

**Fixture composition:**

`dirty_orders` takes `sample_orders` as a parameter — pytest injects the `sample_orders` fixture into `dirty_orders` automatically. This means the dirty fixture always starts from the same clean base, making tests independent.

**Keep fixtures small:** A 5-row clean fixture and an 8-row dirty fixture is ideal. Fixtures with 50+ rows make test failures hard to read — when `assert_frame_equal` shows a diff, smaller fixtures produce readable output.

---

### Part 2: `parametrize` for Edge Cases (30 minutes)

#### Explanation

`@pytest.mark.parametrize` runs the same test function with multiple input sets. It eliminates copy-paste test functions and makes the intent clear: "this function should behave correctly for all of these inputs."

```python
import pytest
import pandas as pd


def validate_amount(amount: float) -> bool:
    """Return True if amount is valid (positive, non-zero, <= 100,000)."""
    return isinstance(amount, (int, float)) and 0 < amount <= 100_000


# Without parametrize — tedious and error-prone:
def test_validate_amount_positive():
    assert validate_amount(10.0) is True

def test_validate_amount_zero():
    assert validate_amount(0.0) is False

def test_validate_amount_negative():
    assert validate_amount(-5.0) is False

def test_validate_amount_large():
    assert validate_amount(999999.0) is False


# With parametrize — same coverage, cleaner intent:
@pytest.mark.parametrize("amount,expected", [
    (10.0,      True),    # normal positive amount
    (0.0,       False),   # zero is not a valid order amount
    (-5.0,      False),   # negative amount
    (100_000.0, True),    # at the limit — valid
    (100_001.0, False),   # over the limit
    (0.01,      True),    # smallest valid amount
    (99999.99,  True),    # just under the limit
])
def test_validate_amount(amount, expected):
    assert validate_amount(amount) == expected


# Parametrize with multiple columns — testing a normalization function
def normalize_status(status: str) -> str:
    """Normalize status to lowercase, strip whitespace."""
    return status.lower().strip()


@pytest.mark.parametrize("raw_status,expected", [
    ("shipped",    "shipped"),
    ("SHIPPED",    "shipped"),
    ("Shipped",    "shipped"),
    ("  shipped ", "shipped"),
    ("PENDING",    "pending"),
    ("Delivered",  "delivered"),
])
def test_normalize_status(raw_status, expected):
    assert normalize_status(raw_status) == expected


# Parametrize for DataFrame transformations
def drop_zero_amounts(df: pd.DataFrame) -> pd.DataFrame:
    """Remove rows where amount <= 0."""
    return df[df['amount'] > 0].reset_index(drop=True)


@pytest.mark.parametrize("amounts,expected_len", [
    ([1.0, 2.0, 3.0],       3),  # all positive — nothing dropped
    ([0.0, 1.0, 2.0],       2),  # one zero dropped
    ([-1.0, 0.0, 1.0],      1),  # two dropped
    ([-5.0, -1.0, -0.1],    0),  # all dropped
    ([100.0],               1),  # single valid row
])
def test_drop_zero_amounts(amounts, expected_len):
    df = pd.DataFrame({'amount': amounts})
    result = drop_zero_amounts(df)
    assert len(result) == expected_len
```

**When to use parametrize:**
- Testing boundary values (0, negative, max)
- Testing multiple input formats (mixed case, whitespace)
- Testing different combinations of valid/invalid inputs
- Any time you notice yourself writing `test_X_case1`, `test_X_case2`, `test_X_case3`

---

### Part 3: `assert_frame_equal` for Transformations (30 minutes)

#### Explanation

`pd.testing.assert_frame_equal` is the pandas-aware equivalent of `assert result == expected`. When it fails, it shows a column-level diff — far more useful than "DataFrames are not equal."

```python
import pytest
import pandas as pd
from pandas.testing import assert_frame_equal, assert_series_equal


# ─── The function under test ──────────────────────────────────────────────────

def normalize_amounts(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize amounts:
    - Convert all amounts to USD (assume EUR * 1.08, GBP * 1.27, else USD)
    - Round to 2 decimal places
    - Drop the currency column
    """
    df = df.copy()
    rates = {'USD': 1.0, 'EUR': 1.08, 'GBP': 1.27}
    df['amount'] = df.apply(
        lambda row: round(row['amount'] * rates.get(row['currency'], 1.0), 2),
        axis=1
    )
    return df.drop(columns=['currency'])


# ─── Tests using assert_frame_equal ──────────────────────────────────────────

def test_normalize_amounts_usd_unchanged():
    """USD amounts should remain unchanged after normalization."""
    input_df = pd.DataFrame({
        'order_id': [1, 2],
        'amount':   [100.0, 50.0],
        'currency': ['USD', 'USD'],
    })
    expected = pd.DataFrame({
        'order_id': [1, 2],
        'amount':   [100.0, 50.0],
    })
    result = normalize_amounts(input_df)
    assert_frame_equal(
        result,
        expected,
        check_dtype=True,     # int64 vs int32 will fail — explicit is better
        check_exact=False,     # allow floating-point tolerance
        rtol=1e-5,            # relative tolerance for floats
    )


def test_normalize_amounts_eur_conversion():
    """EUR amounts should be multiplied by 1.08."""
    input_df = pd.DataFrame({
        'order_id': [1],
        'amount':   [100.0],
        'currency': ['EUR'],
    })
    expected = pd.DataFrame({
        'order_id': [1],
        'amount':   [108.0],
    })
    result = normalize_amounts(input_df)
    assert_frame_equal(result, expected, check_exact=False, rtol=1e-5)


def test_normalize_amounts_drops_currency_column():
    """The currency column should not be present in the output."""
    input_df = pd.DataFrame({
        'order_id': [1],
        'amount':   [50.0],
        'currency': ['GBP'],
    })
    result = normalize_amounts(input_df)
    assert 'currency' not in result.columns


# ─── Using assert_series_equal for single-column checks ──────────────────────

def test_normalize_amounts_gbp_series():
    """GBP conversion as a series-level check."""
    input_df = pd.DataFrame({
        'order_id': [1, 2],
        'amount':   [100.0, 200.0],
        'currency': ['GBP', 'GBP'],
    })
    result = normalize_amounts(input_df)
    expected_amounts = pd.Series([127.0, 254.0], name='amount')
    assert_series_equal(
        result['amount'],
        expected_amounts,
        check_exact=False,
        rtol=1e-5,
    )


# ─── pytest.approx for floating-point assertions ─────────────────────────────

def test_normalize_eur_with_approx():
    """Alternative: use pytest.approx for a single value assertion."""
    input_df = pd.DataFrame({
        'order_id': [1],
        'amount':   [99.99],
        'currency': ['EUR'],
    })
    result = normalize_amounts(input_df)
    assert result['amount'].iloc[0] == pytest.approx(107.99, rel=1e-5)
```

**`assert_frame_equal` key parameters:**

| Parameter | Default | When to change |
|-----------|---------|---------------|
| `check_dtype` | True | Keep True — silent dtype promotion is a bug |
| `check_exact` | False | Set True only for integer columns |
| `rtol` | 1e-5 | Loosen to 1e-3 for financial rounding |
| `check_names` | True | Keep True — column name mismatches are bugs |
| `check_like` | False | Set True if column/row order doesn't matter |

---

### Part 4: Testing Exception Paths (30 minutes)

#### Explanation

A pipeline that raises the wrong exception (or no exception) for invalid input is a silent failure. `pytest.raises` verifies that the correct exception is raised for the correct reason.

```python
import pytest
import pandas as pd
from dataclasses import dataclass


# ─── Setup: contract classes from Lesson 6 ───────────────────────────────────

class ContractViolationError(Exception):
    def __init__(self, contract_name, version, violations):
        self.contract_name = contract_name
        self.version = version
        self.violations = violations
        message = (
            f"Contract '{contract_name}' v{version} violated "
            f"({len(violations)} violation(s)):\n"
            + "\n".join(f"  - {v}" for v in violations)
        )
        super().__init__(message)


class SimpleOrdersContract:
    """Simplified contract for testing examples."""
    def __init__(self, min_row_count=1):
        self.min_row_count = min_row_count

    def enforce(self, df: pd.DataFrame) -> None:
        violations = []
        required_cols = {'order_id', 'amount', 'status'}
        missing = required_cols - set(df.columns)
        if missing:
            violations.append(f"missing columns: {missing}")
        if 'amount' in df.columns and (df['amount'] <= 0).any():
            count = (df['amount'] <= 0).sum()
            violations.append(f"{count} negative or zero amount(s)")
        if len(df) < self.min_row_count:
            violations.append(
                f"min_row_count: got {len(df)}, need >= {self.min_row_count}"
            )
        if violations:
            raise ContractViolationError("SimpleOrdersContract", "1.0", violations)


# ─── Tests for exception paths ────────────────────────────────────────────────

contract = SimpleOrdersContract(min_row_count=2)


def test_contract_passes_valid_df():
    """No exception raised for valid DataFrame."""
    df = pd.DataFrame({
        'order_id': [1, 2],
        'amount':   [50.0, 100.0],
        'status':   ['pending', 'shipped'],
    })
    contract.enforce(df)  # should not raise


def test_contract_raises_for_negative_amount():
    """ContractViolationError raised when amount <= 0."""
    df = pd.DataFrame({
        'order_id': [1, 2],
        'amount':   [-5.0, 100.0],
        'status':   ['pending', 'shipped'],
    })
    with pytest.raises(ContractViolationError, match="negative or zero amount"):
        contract.enforce(df)


def test_contract_raises_for_missing_column():
    """ContractViolationError raised when required column is absent."""
    df = pd.DataFrame({
        'order_id': [1, 2],
        'amount':   [50.0, 100.0],
        # 'status' column deliberately omitted
    })
    with pytest.raises(ContractViolationError, match="missing columns"):
        contract.enforce(df)


def test_contract_raises_for_min_row_count():
    """ContractViolationError raised when row count is below minimum."""
    small_contract = SimpleOrdersContract(min_row_count=100)
    df = pd.DataFrame({
        'order_id': [1],
        'amount':   [50.0],
        'status':   ['pending'],
    })
    with pytest.raises(ContractViolationError, match="min_row_count"):
        small_contract.enforce(df)


def test_contract_violation_contains_all_errors():
    """When multiple violations exist, ContractViolationError lists all of them."""
    df = pd.DataFrame({
        'order_id': [1],
        'amount':   [-5.0],
        # 'status' omitted — two violations: missing column + negative amount
    })
    small_contract = SimpleOrdersContract(min_row_count=5)  # also fails row count
    with pytest.raises(ContractViolationError) as exc_info:
        small_contract.enforce(df)

    error = exc_info.value
    assert len(error.violations) >= 3  # missing status, negative amount, row count


# ─── Running tests (simulation output) ───────────────────────────────────────
# pytest test_orders_pipeline.py -v
#
# PASSED test_contract_passes_valid_df
# PASSED test_contract_raises_for_negative_amount
# PASSED test_contract_raises_for_missing_column
# PASSED test_contract_raises_for_min_row_count
# PASSED test_contract_violation_contains_all_errors
# 5 passed in 0.12s
```

**`pytest.raises` usage patterns:**

```python
# Basic: just check the exception type
with pytest.raises(ValueError):
    int("not-a-number")

# With match: check that the message contains a substring
with pytest.raises(ContractViolationError, match="min_row_count"):
    contract.enforce(empty_df)

# Inspect the exception after the block
with pytest.raises(ContractViolationError) as exc_info:
    contract.enforce(bad_df)
error = exc_info.value
assert len(error.violations) == 3

# pytest.approx for floating-point value checks
assert 0.1 + 0.2 == pytest.approx(0.3)
assert result_dict['score'] == pytest.approx(0.95, rel=1e-3)
```

---

## Key Takeaways

- Fixtures are reusable setup — define a `sample_orders` fixture once and inject it into every test that needs it
- `dirty_orders(sample_orders)` shows fixture composition: build edge-case fixtures on top of clean fixtures
- `pytest.mark.parametrize` eliminates copy-paste test functions — one test function, N inputs, N assertions
- `assert_frame_equal` with `check_dtype=True` catches silent type promotions that would be invisible with `==`
- `pytest.raises(ContractViolationError, match="min_row_count")` verifies the right exception for the right reason
- Keep fixtures small (5-10 rows) — large fixtures make failure diffs unreadable

---

## Common Mistakes to Avoid

- **Building fixtures with 50+ rows**: test failures in large DataFrames produce huge diffs; 5-10 rows per fixture is sufficient for structural testing
- **Not setting `check_dtype=True`**: a silent `int32` → `int64` promotion will cause downstream bugs but won't fail `assert_frame_equal` without this flag
- **Testing implementation details instead of behavior**: don't assert that a specific internal variable has a value; assert the output DataFrame is correct
- **One test for happy path, zero for edge cases**: the happy path rarely breaks in production; edge cases (null, negative, empty DataFrame) do

---

## Next Lesson Preview

- How to aggregate quality metrics into a weighted overall score
- How to build a formatted text quality report with PASS/WARN/FAIL thresholds
- How `blocking=True` prevents bad data from reaching downstream consumers

---

[← Previous: Implementing Data Contracts](./lesson-06-implementing-data-contracts.md) | [Next: Data Quality Dashboard →](./lesson-08-data-quality-dashboard.md)
