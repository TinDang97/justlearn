# Lesson 5: Filtering and Selecting

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Use boolean indexing for complex filtering
- Master `.loc` and `.iloc` for selection
- Apply `.query()` for readable filters
- Work with datetime indexes

---

## Lesson Outline

### Part 1: Boolean Indexing (30 minutes)

#### Explanation

```python
import pandas as pd

df = pd.read_csv("sales.csv", parse_dates=["date"])

# Single condition:
df[df["revenue"] > 1000]
df[df["region"] == "North"]
df[df["product"].isin(["Widget A", "Widget B"])]

# Multiple conditions (& = AND, | = OR, ~ = NOT):
df[(df["revenue"] > 500) & (df["region"] == "West")]
df[(df["category"] == "Electronics") | (df["category"] == "Appliances")]
df[~df["status"].isin(["cancelled", "refunded"])]

# String filtering:
df[df["name"].str.contains("Pro", case=False)]
df[df["email"].str.endswith("@company.com")]

# Date filtering:
df[df["date"] >= "2024-01-01"]
df[(df["date"] >= "2024-01-01") & (df["date"] < "2024-04-01")]  # Q1 2024
df[df["date"].dt.month == 3]   # March only
df[df["date"].dt.dayofweek < 5]  # Weekdays only
```

#### Practice

Filter a sales dataset to find: Q4 sales in the "North" region with revenue > $500.

---

### Part 2: .loc and .iloc (30 minutes)

#### Explanation

```python
# .loc - label-based selection:
df.loc[0]                    # Row with label 0
df.loc[0:5]                  # Rows 0 through 5 (inclusive!)
df.loc[:, "revenue"]         # All rows, "revenue" column
df.loc[0:10, "name":"revenue"]  # Rows 0-10, columns name through revenue
df.loc[df["region"] == "North", "revenue"]  # Filter + select column

# .iloc - position-based selection:
df.iloc[0]          # First row
df.iloc[-1]         # Last row
df.iloc[0:5]        # First 5 rows (exclusive end, like range)
df.iloc[:, 0:3]     # All rows, first 3 columns
df.iloc[0:10, 2:5]  # First 10 rows, columns 2-4

# .at / .iat - single value access (faster):
df.at[0, "name"]     # Label-based single value
df.iat[0, 0]         # Position-based single value

# Set values:
df.loc[df["status"] == "pending", "status"] = "active"
df.at[5, "price"] = 99.99
```

#### Practice

Using `.loc`: select all "A" grade students and show only name, score columns.
Using `.iloc`: show every other row for first 20 rows.

---

### Part 3: .query() Method (30 minutes)

#### Explanation

```python
# .query() - readable string-based filtering:
df.query("revenue > 1000")
df.query("region == 'North' and revenue > 500")
df.query("product in ['Widget A', 'Widget B']")
df.query("date >= '2024-01-01'")

# Use Python variables with @:
min_revenue = 500
region = "North"
df.query("revenue > @min_revenue and region == @region")

# Chaining (readable analysis pipeline):
result = (df
    .query("date >= '2024-Q1'")
    .query("region != 'Unknown'")
    .query("revenue > 0")
    .assign(margin=lambda x: x["profit"] / x["revenue"])
    .sort_values("margin", ascending=False)
    .head(20)
)

# .assign() adds columns without modifying original:
df = df.assign(
    revenue=lambda x: x["price"] * x["quantity"],
    is_high_value=lambda x: x["revenue"] > 1000
)
```

#### Practice

Using `.query()`, find all sales in Q1 2024 with revenue > $1000 that are NOT in the "Online" channel.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Sales Segmentation

Segment customers into groups using complex filtering:
- "VIP": total_spend > $10,000 and orders > 10
- "Regular": total_spend > $1,000
- "Occasional": otherwise

Use `.loc` to assign the segment column.

#### Exercise 2: Time Series Analysis

Given daily sales data for 2 years:
1. Filter to business days only
2. Find weeks with highest revenue
3. Compare Q1 vs Q2 performance
4. Find products that grew month-over-month

---

## Key Takeaways

- Boolean conditions with `&`, `|`, `~` (not `and`, `or`, `not`)
- `.loc[row_label, col_label]` — inclusive slicing by label
- `.iloc[row_pos, col_pos]` — exclusive slicing by integer position
- `.query("column > value")` — readable string-based filtering
- `.assign(new_col=lambda df: ...)` — add computed columns without mutation

---

[← Previous](./lesson-04-data-cleaning.md) | [Back to Course](./README.md) | [Next →](./lesson-06-groupby-aggregation.md)
