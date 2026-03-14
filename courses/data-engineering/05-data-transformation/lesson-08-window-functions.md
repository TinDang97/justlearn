# Lesson 8: Window Functions — Rolling, Expanding, and Rank

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Compute rolling statistics (moving average, rolling sum) with `.rolling()`
- Use expanding windows for cumulative statistics
- Rank values within groups using `rank()` and groupby + rank
- Use `shift()` and `diff()` for lag and period-over-period comparisons

---

## Prerequisites

- pandas Series operations and datetime handling
- Lesson 2: GroupBy Advanced (groupby + transform)

---

## Lesson Outline

### Part 1: Rolling Windows (30 minutes)

#### Explanation

A **rolling window** computes a statistic over a fixed-size sliding window of past N rows. It is essential for smoothing noisy time series and computing moving averages.

```python
import pandas as pd

# Daily revenue for a 30-day period
daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=20, freq="D"),
    "revenue": [1200,980,1400,1100,1650,900,1300,1800,1050,1250,
                1500,1350,1700,1150,1900,1100,1450,1600,1250,1800],
})

# 7-day moving average (smooths out weekly noise)
daily["ma_7d"] = daily["revenue"].rolling(window=7).mean()

# 14-day moving average (smoother, more lag)
daily["ma_14d"] = daily["revenue"].rolling(window=14).mean()

print(daily[["date", "revenue", "ma_7d", "ma_14d"]].round(0))
# Note: first 6 rows have NaN for 7d MA — not enough history yet
```

**min_periods** — compute partial windows at the start instead of NaN:

```python
import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=10, freq="D"),
    "revenue": [1200, 980, 1400, 1100, 1650, 900, 1300, 1800, 1050, 1250],
})

# With min_periods=1: compute average even with only 1 data point
daily["ma_7d_partial"] = daily["revenue"].rolling(window=7, min_periods=1).mean()
print(daily[["date", "revenue", "ma_7d_partial"]].round(0))
```

**Rolling sum** — useful for tracking revenue over a trailing window:

```python
import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=15, freq="D"),
    "revenue": [1200,980,1400,1100,1650,900,1300,1800,1050,1250,1500,1350,1700,1150,1900],
})

# 7-day rolling sum (trailing week revenue)
daily["revenue_7d_sum"] = daily["revenue"].rolling(window=7).sum()
print(daily[["date", "revenue", "revenue_7d_sum"]])
```

<PracticeBlock
  prompt="Add two new columns to the daily DataFrame: 'ma_7d' (7-day rolling mean) and 'ma_14d' (14-day rolling mean). Use min_periods=1 for both so no NaN appears at the start. Print all columns."
  initialCode={`import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=20, freq="D"),
    "revenue": [1200,980,1400,1100,1650,900,1300,1800,1050,1250,
                1500,1350,1700,1150,1900,1100,1450,1600,1250,1800],
})

# 7-day rolling average
daily["ma_7d"] =

# 14-day rolling average
daily["ma_14d"] =

print(daily[["date", "revenue", "ma_7d", "ma_14d"]].round(1))
`}
  hint="daily['revenue'].rolling(window=7, min_periods=1).mean() and .rolling(window=14, min_periods=1).mean()"
  solution={`import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=20, freq="D"),
    "revenue": [1200,980,1400,1100,1650,900,1300,1800,1050,1250,
                1500,1350,1700,1150,1900,1100,1450,1600,1250,1800],
})

daily["ma_7d"]  = daily["revenue"].rolling(window=7,  min_periods=1).mean()
daily["ma_14d"] = daily["revenue"].rolling(window=14, min_periods=1).mean()

print(daily[["date", "revenue", "ma_7d", "ma_14d"]].round(1))
`}
/>

---

### Part 2: Expanding and EWM (30 minutes)

#### Explanation

An **expanding window** starts at the first row and grows to include all rows up to the current one — it computes cumulative statistics.

An **exponentially weighted moving average (EWM)** gives more weight to recent observations, decaying older observations exponentially. It responds faster than a simple rolling average.

```python
import pandas as pd

monthly = pd.DataFrame({
    "month":   ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    "revenue": [15000,18000,14000,21000,19000,22000,17000,23000,20000,25000,22000,28000],
})

# Expanding (cumulative) statistics
monthly["cumulative_revenue"] = monthly["revenue"].expanding().sum()
monthly["ytd_avg"]            = monthly["revenue"].expanding().mean().round(0)
monthly["ytd_max"]            = monthly["revenue"].expanding().max()

print(monthly[["month", "revenue", "cumulative_revenue", "ytd_avg", "ytd_max"]])
```

**Shortcuts for common cumulative ops:**

```python
import pandas as pd

monthly = pd.DataFrame({
    "month":   ["Jan","Feb","Mar","Apr","May","Jun"],
    "revenue": [15000, 18000, 14000, 21000, 19000, 22000],
    "units":   [500, 600, 470, 700, 650, 730],
})

# Direct cumulative methods (equivalent to expanding().sum/max/min)
monthly["rev_cumsum"]  = monthly["revenue"].cumsum()
monthly["rev_cummax"]  = monthly["revenue"].cummax()
monthly["units_cumsum"] = monthly["units"].cumsum()

print(monthly)
```

**EWM (exponentially weighted moving average):**

```python
import pandas as pd

daily = pd.DataFrame({
    "day":     range(1, 16),
    "revenue": [1200,980,1400,1100,1650,900,1300,1800,1050,1250,1500,1350,1700,1150,1900],
})

# EWM with span=7 — approximate 7-period weighted average
# span controls how quickly old observations decay
daily["ewm_7"] = daily["revenue"].ewm(span=7, adjust=False).mean()

# Compare: simple 7d MA vs EWM
daily["ma_7d"] = daily["revenue"].rolling(window=7, min_periods=1).mean()

print(daily[["day", "revenue", "ma_7d", "ewm_7"]].round(1))
# EWM reacts faster to recent changes than the simple moving average
```

---

### Part 3: shift(), diff(), and rank() (30 minutes)

#### Explanation

**`shift(n)`** — lags (or leads) a column by n positions. Essential for comparing a value to the previous period.

**`diff(n)`** — computes the difference between the current value and the value n periods ago.

**`pct_change()`** — computes the percentage change from the previous row.

**`rank()`** — assigns a rank to each value in a Series.

```python
import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=10, freq="D"),
    "revenue": [1200, 980, 1400, 1100, 1650, 900, 1300, 1800, 1050, 1250],
})

# shift(1): previous day's revenue
daily["prev_revenue"] = daily["revenue"].shift(1)

# diff(1): day-over-day change (equivalent to revenue - shift(1))
daily["daily_change"] = daily["revenue"].diff(1)

# pct_change(): day-over-day percentage growth
daily["pct_growth"] = daily["revenue"].pct_change().round(3)

print(daily)
```

**rank()** — rank values within the entire Series:

```python
import pandas as pd

stores = pd.DataFrame({
    "store_id":   ["S1","S2","S3","S4","S5"],
    "region":     ["North","South","North","South","West"],
    "revenue":    [15000, 8000, 22000, 12000, 18000],
})

# Overall rank (descending: 1 = highest revenue)
stores["overall_rank"] = stores["revenue"].rank(ascending=False).astype(int)

# Rank within region
stores["region_rank"] = stores.groupby("region")["revenue"].rank(ascending=False).astype(int)

print(stores)
```

<PracticeBlock
  prompt="For the daily DataFrame: (1) add 'prev_revenue' using shift(1), (2) add 'daily_change' using diff(1), (3) add 'pct_growth' using pct_change() rounded to 3 decimal places. Print all columns."
  initialCode={`import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=10, freq="D"),
    "revenue": [1200, 980, 1400, 1100, 1650, 900, 1300, 1800, 1050, 1250],
})

# Previous day revenue
daily["prev_revenue"] =

# Day-over-day change
daily["daily_change"] =

# Percentage growth
daily["pct_growth"] =

print(daily)
`}
  hint="shift(1) for lag, diff(1) for difference, pct_change() for percentage. Round pct_growth with .round(3)."
  solution={`import pandas as pd

daily = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=10, freq="D"),
    "revenue": [1200, 980, 1400, 1100, 1650, 900, 1300, 1800, 1050, 1250],
})

daily["prev_revenue"] = daily["revenue"].shift(1)
daily["daily_change"] = daily["revenue"].diff(1)
daily["pct_growth"]   = daily["revenue"].pct_change().round(3)

print(daily)
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Website Traffic Analysis

```python
import pandas as pd

traffic = pd.DataFrame({
    "date":     pd.date_range("2024-01-01", periods=20, freq="D"),
    "visitors": [5200,4800,6100,5500,7200,4300,5800,8100,4900,5600,
                 6400,6100,7800,5200,8600,5100,6700,7300,5800,8200],
})

# 7-day rolling average
traffic["ma_7d"] = traffic["visitors"].rolling(window=7, min_periods=1).mean().round(0)

# 30-day rolling average (use min_periods=1 since we have < 30 rows)
traffic["ma_30d"] = traffic["visitors"].rolling(window=len(traffic), min_periods=1).mean().round(0)

# Day-over-day % change
traffic["dod_pct"] = traffic["visitors"].pct_change().mul(100).round(1)

# Flag days where actual > 7d moving average
traffic["above_ma7"] = traffic["visitors"] > traffic["ma_7d"]

print(traffic[["date","visitors","ma_7d","dod_pct","above_ma7"]])
print(f"\nDays above 7d MA: {traffic['above_ma7'].sum()}")
```

#### Exercise 2: Monthly Sales Ranking

```python
import pandas as pd

monthly_sales = pd.DataFrame({
    "month":   ["Jan","Jan","Jan","Feb","Feb","Feb","Mar","Mar","Mar"],
    "product": ["Widget","Gadget","Tool","Widget","Gadget","Tool","Widget","Gadget","Tool"],
    "revenue": [15000,8000,5000,16500,9500,4800,14000,10000,5500],
})

# Cumulative revenue per product (running total across months in order)
monthly_sales = monthly_sales.sort_values(["product","month"])
monthly_sales["cumrev"] = monthly_sales.groupby("product")["revenue"].cumsum()

# Rank products by revenue within each month
monthly_sales["monthly_rank"] = monthly_sales.groupby("month")["revenue"].rank(
    ascending=False, method="dense"
).astype(int)

print(monthly_sales.sort_values(["month","monthly_rank"]))
```

---

## Key Takeaways

- `rolling(window=N).mean()` — simple N-period moving average; produces NaN until N rows exist
- `rolling(window=N, min_periods=1).mean()` — compute with partial windows, no NaN at start
- `expanding().sum()` — cumulative total from first row to current row (same as `cumsum()`)
- `ewm(span=N).mean()` — exponentially weighted average; reacts faster to recent changes
- `shift(1)` — previous row value; `diff(1)` — change from previous row; `pct_change()` — % change
- `rank(ascending=False)` — rank values; `groupby + rank` — rank within groups

---

## Common Mistakes to Avoid

- **NaN at start of rolling**: first (window-1) rows are NaN unless you set `min_periods`
- **Forgetting to sort before shift/diff**: results are meaningless if data is not in chronological order
- **Rank ties**: default method is `"average"` — use `method="dense"` or `"min"` for integer ranks

---

[← Previous](./lesson-07-concat-append.md) | [Back to Course](./README.md) | [Next →](./lesson-09-apply-map-transform.md)
