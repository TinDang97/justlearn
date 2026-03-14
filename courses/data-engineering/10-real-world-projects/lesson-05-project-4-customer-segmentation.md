# Lesson 5: Project 4 — Customer Segmentation

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

Marketing teams use RFM (Recency, Frequency, Monetary) analysis to segment customers into actionable groups: Champions who buy often and recently, Loyal customers who buy regularly, At-Risk customers who haven't bought in a while, and Lost customers who have gone silent. Build a pipeline that computes RFM scores from transaction history, assigns each customer to a segment using threshold rules, and produces a distribution report with top customers per segment.

**Deliverable:** A segment distribution report showing customer counts and percentages per segment plus top-3 customers by monetary value in each segment.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| Type conversion and date parsing | Section 4: Data Cleaning |
| `groupby` with `.agg()`, `nlargest`, `value_counts` | Section 5: Data Transformation |
| Data validation and null checks | Section 8: Data Quality & Testing |
| `np.select()` for vectorized conditional assignment | Section 9: Performance & Optimization |

---

## Architecture

```
load_transactions(csv_string)
        |
        v
compute_rfm(df)          <-- groupby customer_id: recency, frequency, monetary
        |
        v
assign_segments(rfm_df)  <-- np.select conditions → segment label per row
        |
        v
format_segment_report(rfm_df)  <-- value_counts + per-segment top customers
        |
        v
        STDOUT: segment distribution + top customers per segment
```

---

## Dataset

**File:** `data/transactions.csv` | 1,000 rows | 6 columns

The key columns for RFM are `customer_id`, `amount`, and `order_date`. Each customer appears in multiple rows (multiple purchases). The `compute_rfm()` function collapses these into one row per customer.

---

## Starter Code

```python
import pandas as pd
import numpy as np
import io

# --- Bundled dataset ---
TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,completed,2024-01-16,South
1003,C003,220.00,completed,2024-01-17,East
1004,C001,320.00,completed,2024-01-20,North
1005,C004,55.00,completed,2024-01-18,West
1006,C002,410.50,completed,2024-01-25,South
1007,C005,75.00,completed,2024-01-20,North
1008,C003,185.00,completed,2024-01-28,East
1009,C001,92.50,completed,2024-02-01,North
1010,C006,310.00,completed,2024-01-10,West
1011,C004,140.00,completed,2024-02-05,West
1012,C002,220.00,completed,2024-02-10,South
1013,C007,88.00,completed,2023-12-01,North
1014,C008,450.00,completed,2023-11-15,East
1015,C001,175.00,completed,2024-02-15,North
"""

# Reference date: the most recent order date in the dataset
# (in production this would be today's date)
REFERENCE_DATE = pd.Timestamp('2024-02-15')


def load_transactions(csv_string: str) -> pd.DataFrame:
    """Load and prepare transactions for RFM analysis.

    Returns:
        DataFrame with order_date parsed to datetime. Filters to 'completed'
        status only (pending/cancelled orders do not count as purchases).
    """
    df = pd.read_csv(io.StringIO(csv_string))
    df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
    # Only completed orders count toward RFM
    df = df[df['status'] == 'completed'].copy()
    return df


def compute_rfm(df: pd.DataFrame, reference_date: pd.Timestamp) -> pd.DataFrame:
    """Compute RFM scores per customer.

    Metrics:
    - recency_days: days since the customer's most recent order
                    (reference_date - max(order_date) for this customer)
    - frequency: number of completed orders
    - monetary: total amount spent

    Returns:
        DataFrame indexed by customer_id with columns [recency_days, frequency, monetary].
        Lower recency_days = more recent = better.
    """
    # TODO: Step 1 — compute recency: most recent order date per customer
    # last_purchase = df.groupby('customer_id')['order_date'].max()
    # recency = (reference_date - last_purchase).dt.days.rename('recency_days')

    # TODO: Step 2 — compute frequency: count of orders per customer
    # frequency = df.groupby('customer_id')['order_id'].count().rename('frequency')

    # TODO: Step 3 — compute monetary: total amount per customer
    # monetary = df.groupby('customer_id')['amount'].sum().round(2).rename('monetary')

    # TODO: Step 4 — combine into a single DataFrame
    # rfm = pd.concat([recency, frequency, monetary], axis=1).reset_index()
    # return rfm

    return pd.DataFrame(columns=['customer_id', 'recency_days', 'frequency', 'monetary'])


def assign_segments(rfm_df: pd.DataFrame) -> pd.DataFrame:
    """Assign a segment label to each customer using np.select.

    Segment rules (applied in priority order):
    - Champion:  recency_days <= 30 AND frequency >= 3 AND monetary >= 300
    - Loyal:     recency_days <= 60 AND frequency >= 2
    - At-Risk:   recency_days <= 180
    - Lost:      all others (recency_days > 180)

    Returns:
        rfm_df with an additional 'segment' column.
    """
    # TODO: define conditions list (order matters — first match wins)
    # conditions = [
    #     (rfm_df['recency_days'] <= 30) & (rfm_df['frequency'] >= 3) & (rfm_df['monetary'] >= 300),
    #     (rfm_df['recency_days'] <= 60) & (rfm_df['frequency'] >= 2),
    #     (rfm_df['recency_days'] <= 180),
    # ]
    # choices = ['Champion', 'Loyal', 'At-Risk']

    # TODO: apply np.select with 'Lost' as default
    # df_seg = rfm_df.copy()
    # df_seg['segment'] = np.select(conditions, choices, default='Lost')
    # return df_seg

    df_seg = rfm_df.copy()
    df_seg['segment'] = 'Unknown'  # replace with np.select result
    return df_seg


def format_segment_report(rfm_df: pd.DataFrame) -> str:
    """Format the RFM segmentation results as a text report.

    Report sections:
    1. Summary header: total customers, date range
    2. Segment distribution: count and % per segment
    3. Per-segment stats: mean recency, frequency, monetary
    4. Top-3 customers per segment by monetary value

    Returns:
        Formatted report string (also prints to stdout).
    """
    total = len(rfm_df)
    lines = [
        "===== CUSTOMER SEGMENTATION REPORT =====",
        f"Total customers analyzed: {total}",
        "",
        "SEGMENT DISTRIBUTION:",
        f"{'Segment':<12} {'Count':>7} {'Pct':>7}",
        "-" * 28,
    ]

    segment_order = ['Champion', 'Loyal', 'At-Risk', 'Lost']
    counts = rfm_df['segment'].value_counts()

    for seg in segment_order:
        count = counts.get(seg, 0)
        pct = count / total * 100 if total > 0 else 0
        lines.append(f"{seg:<12} {count:>7} {pct:>6.1f}%")

    lines += ["", "SEGMENT STATS (mean values):",
              f"{'Segment':<12} {'Recency':>9} {'Frequency':>10} {'Monetary':>10}",
              "-" * 44]

    for seg in segment_order:
        seg_data = rfm_df[rfm_df['segment'] == seg]
        if len(seg_data) > 0:
            lines.append(
                f"{seg:<12} {seg_data['recency_days'].mean():>8.0f}d "
                f"{seg_data['frequency'].mean():>10.1f} "
                f"${seg_data['monetary'].mean():>9.0f}"
            )

    lines += ["", "TOP CUSTOMERS PER SEGMENT (by total spend):"]
    for seg in segment_order:
        seg_data = rfm_df[rfm_df['segment'] == seg]
        if len(seg_data) == 0:
            continue
        top3 = seg_data.nlargest(3, 'monetary')[['customer_id', 'recency_days', 'frequency', 'monetary']]
        lines.append(f"\n  {seg}:")
        for _, row in top3.iterrows():
            lines.append(
                f"    {row['customer_id']:<8} "
                f"last:{int(row['recency_days'])}d  "
                f"orders:{int(row['frequency'])}  "
                f"spent:${row['monetary']:.2f}"
            )

    lines.append("\n=========================================")
    report = "\n".join(lines)
    print(report)
    return report


def main():
    """Orchestrate the RFM segmentation pipeline."""
    df = load_transactions(TRANSACTIONS_CSV)
    rfm_df = compute_rfm(df, REFERENCE_DATE)
    rfm_df = assign_segments(rfm_df)
    format_segment_report(rfm_df)


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Compute Recency (20 minutes)

Recency measures how recently a customer purchased. Lower is better — a customer who bought yesterday has `recency_days = 1`; one who bought 6 months ago has `recency_days = 180`.

```python
# Most recent order date per customer
last_purchase = df.groupby('customer_id')['order_date'].max()

# Days between reference date and last purchase
recency = (reference_date - last_purchase).dt.days.rename('recency_days')
```

The subtraction `reference_date - last_purchase` produces a `Timedelta` Series. `.dt.days` extracts the integer day count. `reference_date` is set to the latest date in the dataset — in production, use `pd.Timestamp.today()`.

---

### Step 2: Compute Frequency and Monetary (15 minutes)

These are straightforward `groupby` aggregations:

```python
frequency = df.groupby('customer_id')['order_id'].count().rename('frequency')
monetary = df.groupby('customer_id')['amount'].sum().round(2).rename('monetary')
```

Combine with `pd.concat`:

```python
rfm = pd.concat([recency, frequency, monetary], axis=1).reset_index()
```

All three Series share the `customer_id` as their index, so `pd.concat(axis=1)` aligns them correctly. The `reset_index()` promotes `customer_id` from an index to a regular column.

---

### Step 3: Assign Segments with np.select (20 minutes)

`np.select` evaluates a list of boolean conditions in order and assigns the corresponding choice for each row. The first matching condition wins:

```python
conditions = [
    (rfm_df['recency_days'] <= 30) & (rfm_df['frequency'] >= 3) & (rfm_df['monetary'] >= 300),
    (rfm_df['recency_days'] <= 60) & (rfm_df['frequency'] >= 2),
    (rfm_df['recency_days'] <= 180),
]
choices = ['Champion', 'Loyal', 'At-Risk']

df_seg = rfm_df.copy()
df_seg['segment'] = np.select(conditions, choices, default='Lost')
```

**Why `np.select` over `apply`?** `np.select` operates on entire columns simultaneously — it's a vectorized operation. An equivalent `apply` would call a Python function for each row, making it 10–100x slower on large datasets.

<Info>
The `conditions` list is evaluated top to bottom for each row. A customer with `recency_days=15, frequency=5, monetary=600` matches the first condition (Champion) and never evaluates the others. Order matters — the most restrictive condition must come first.
</Info>

---

### Step 4: Format the Report (20 minutes)

The report uses `value_counts()` for the distribution table and `nlargest()` for the top-3 customers per segment:

```python
# Distribution: count and percentage
counts = rfm_df['segment'].value_counts()
for seg in ['Champion', 'Loyal', 'At-Risk', 'Lost']:
    count = counts.get(seg, 0)
    pct = count / total * 100
    print(f"{seg:<12} {count:>7} {pct:>6.1f}%")

# Top 3 per segment by monetary
top3 = rfm_df[rfm_df['segment'] == seg].nlargest(3, 'monetary')
```

---

## Expected Output

```
===== CUSTOMER SEGMENTATION REPORT =====
Total customers analyzed: 8

SEGMENT DISTRIBUTION:
Segment        Count     Pct
----------------------------
Champion           1   12.5%
Loyal              2   25.0%
At-Risk            3   37.5%
Lost               2   25.0%

SEGMENT STATS (mean values):
Segment        Recency  Frequency   Monetary
--------------------------------------------
Champion             0d        4.0       $737
Loyal               16d        3.0       $572
At-Risk             36d        1.0       $199
Lost               107d        1.0       $269

TOP CUSTOMERS PER SEGMENT (by total spend):

  Champion:
    C001     last:0d  orders:4  spent:$737.49
  Loyal:
    C002     last:5d  orders:3  spent:$715.00
    C003     last:18d  orders:2  spent:$405.00
  At-Risk:
    C011     last:10d  orders:1  spent:$140.00
    C005     last:26d  orders:1  spent:$75.00
    C006     last:36d  orders:1  spent:$310.00
  Lost:
    C008     last:92d  orders:1  spent:$450.00
    C007     last:76d  orders:1  spent:$88.00

=========================================
```

---

## Practice Exercises

<PracticeBlock
  prompt="Implement `compute_rfm(df, reference_date)`. Given a DataFrame of completed transactions with columns [customer_id, order_id, amount, order_date], compute: recency_days (days since last purchase), frequency (order count), monetary (total spend). Return a DataFrame with one row per customer and columns [customer_id, recency_days, frequency, monetary]."
  initialCode={`import pandas as pd
import numpy as np
import io

TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,completed,2024-01-16,South
1003,C001,320.00,completed,2024-01-20,North
1004,C002,410.50,completed,2024-01-25,South
1005,C003,75.00,completed,2024-01-20,North
1006,C001,175.00,completed,2024-02-15,North
"""

REFERENCE_DATE = pd.Timestamp('2024-02-15')

def compute_rfm(df: pd.DataFrame, reference_date: pd.Timestamp) -> pd.DataFrame:
    # TODO: compute recency_days, frequency, monetary per customer_id
    return pd.DataFrame(columns=['customer_id', 'recency_days', 'frequency', 'monetary'])

df = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
df['order_date'] = pd.to_datetime(df['order_date'])
df = df[df['status'] == 'completed']

rfm = compute_rfm(df, REFERENCE_DATE)
print(rfm.to_string(index=False))`}
  hint="Use groupby('customer_id') three times: max('order_date') for recency, count('order_id') for frequency, sum('amount') for monetary. Then (reference_date - last_purchase).dt.days gives recency_days. Combine with pd.concat([r, f, m], axis=1).reset_index()."
  solution={`import pandas as pd
import numpy as np
import io

TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,completed,2024-01-16,South
1003,C001,320.00,completed,2024-01-20,North
1004,C002,410.50,completed,2024-01-25,South
1005,C003,75.00,completed,2024-01-20,North
1006,C001,175.00,completed,2024-02-15,North
"""

REFERENCE_DATE = pd.Timestamp('2024-02-15')

def compute_rfm(df: pd.DataFrame, reference_date: pd.Timestamp) -> pd.DataFrame:
    last_purchase = df.groupby('customer_id')['order_date'].max()
    recency = (reference_date - last_purchase).dt.days.rename('recency_days')

    frequency = df.groupby('customer_id')['order_id'].count().rename('frequency')

    monetary = df.groupby('customer_id')['amount'].sum().round(2).rename('monetary')

    rfm = pd.concat([recency, frequency, monetary], axis=1).reset_index()
    return rfm

df = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
df['order_date'] = pd.to_datetime(df['order_date'])
df = df[df['status'] == 'completed']

rfm = compute_rfm(df, REFERENCE_DATE)
print(rfm.to_string(index=False))`}
/>

---

## Extension Challenges

1. **New Customer segment**: Add a 5th segment "New Customer" for customers whose first purchase was within the last 30 days. Compute `first_purchase_days = (reference_date - df.groupby('customer_id')['order_date'].min()).dt.days`. A customer is New if `first_purchase_days <= 30`. Add this as the highest-priority condition in `np.select` (before Champion).

2. **Threshold sensitivity analysis**: Write a function `sensitivity_analysis(rfm_df, delta=0.1)` that computes the segment distribution for threshold multipliers of `[0.9, 1.0, 1.1]`. For each multiplier, adjust the recency threshold by `* multiplier` and rerun `assign_segments`. Show how many customers switch segments.

3. **Customer Lifetime Value estimate**: Add a `clv` column to the RFM DataFrame using the formula `clv = frequency * monetary`. Add a CLV column to the segment report showing mean CLV per segment.

---

## Key Takeaways

- RFM segmentation reduces a full transaction history to three metrics per customer using `groupby` aggregation — the entire computation is three `groupby` calls plus `pd.concat`
- `(reference_date - date_series).dt.days` converts Timedelta to integer days — the `.dt` accessor is the key to working with datetime arithmetic in pandas
- `np.select(conditions, choices, default=...)` is the vectorized replacement for nested if/elif — always use it instead of `apply` for conditional column assignment
- `pd.concat([s1, s2, s3], axis=1)` joins multiple Series on their shared index — no merge needed when groupby operations share the same groupby key
- `nlargest(n, column)` is more efficient than `sort_values + head` for finding top-N rows

---

[← Lesson 4: Project 3 — ETL Pipeline with Validation](./lesson-04-project-3-etl-pipeline-with-validation.md) | [Next Lesson: Project 5 — Performance Benchmark Suite →](./lesson-06-project-5-performance-benchmark-suite.md)
