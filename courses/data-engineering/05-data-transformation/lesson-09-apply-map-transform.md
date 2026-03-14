# Lesson 9: Apply, Map, and Vectorized Operations

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Apply element-wise functions with `.map()` and `Series.apply()`
- Apply row-wise or column-wise functions with `DataFrame.apply()`
- Prefer vectorized operations over `apply()` for performance
- Use `np.where()` and `np.select()` for conditional column creation

---

## Prerequisites

- pandas Series and DataFrame operations
- Python functions, lambda expressions
- NumPy basics (arrays, broadcasting)

---

## Lesson Outline

### Part 1: Series.map() and Series.apply() (30 minutes)

#### Explanation

**`Series.map()`** applies a transformation element by element using a function, dict, or Series.

Use it when you need to:
- Translate values using a lookup dict (e.g., product_id → product_name)
- Apply a simple function to each element independently

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id":   [1, 2, 3, 4, 5],
    "product_id": [101, 102, 101, 103, 102],
    "quantity":   [3, 1, 5, 2, 4],
})

# Map product_id to name using a dict
product_lookup = {101: "Widget", 102: "Gadget", 103: "Tool"}
orders["product_name"] = orders["product_id"].map(product_lookup)
print(orders)
```

**Lambda with map** — apply a transformation function:

```python
import pandas as pd

scores = pd.DataFrame({
    "student": ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "score":   [92, 74, 88, 61, 95],
})

# Map numeric score to letter grade
def score_to_grade(s):
    if s >= 90: return "A"
    elif s >= 80: return "B"
    elif s >= 70: return "C"
    else: return "D"

scores["grade"] = scores["score"].map(score_to_grade)
print(scores)
```

**`Series.apply()`** is nearly identical to map for single-argument functions. Use apply when your function has complex branching or needs access to external state.

```python
import pandas as pd

employees = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave"],
    "salary": [110000, 72000, 88000, 65000],
    "years":  [7, 2, 5, 3],
})

# Apply a custom bonus calculation function per row's salary
def compute_bonus(salary):
    if salary >= 100000:
        return salary * 0.15
    elif salary >= 80000:
        return salary * 0.10
    else:
        return salary * 0.07

employees["bonus"] = employees["salary"].apply(compute_bonus)
print(employees)
```

<PracticeBlock
  prompt="Use .map() with a dict to add a 'category' column to the orders DataFrame (map product_id to category). Then use .map() with a function to add a 'size_label' column: quantity >= 5 → 'Large', >= 2 → 'Medium', else 'Small'."
  initialCode={`import pandas as pd

orders = pd.DataFrame({
    "order_id":   [1, 2, 3, 4, 5, 6],
    "product_id": [101, 102, 101, 103, 102, 103],
    "quantity":   [3, 1, 5, 2, 4, 6],
})

# Map product_id to category
category_lookup = {101: "Hardware", 102: "Electronics", 103: "Hardware"}
orders["category"] =

# Map quantity to size label
def size_label(qty):
    # your logic here
    pass

orders["size_label"] =

print(orders)
`}
  hint="orders['category'] = orders['product_id'].map(category_lookup). For size_label: if qty >= 5 return 'Large', elif qty >= 2 return 'Medium', else 'Small'. Then orders['size_label'] = orders['quantity'].map(size_label)."
  solution={`import pandas as pd

orders = pd.DataFrame({
    "order_id":   [1, 2, 3, 4, 5, 6],
    "product_id": [101, 102, 101, 103, 102, 103],
    "quantity":   [3, 1, 5, 2, 4, 6],
})

category_lookup = {101: "Hardware", 102: "Electronics", 103: "Hardware"}
orders["category"] = orders["product_id"].map(category_lookup)

def size_label(qty):
    if qty >= 5:
        return "Large"
    elif qty >= 2:
        return "Medium"
    else:
        return "Small"

orders["size_label"] = orders["quantity"].map(size_label)
print(orders)
`}
/>

---

### Part 2: DataFrame.apply() (30 minutes)

#### Explanation

`DataFrame.apply()` applies a function across an axis:
- `axis=0` (default) — applies function to each **column** as a Series
- `axis=1` — applies function to each **row** as a Series

Use `axis=0` to compute column-level summaries. Use `axis=1` for row-wise calculations.

```python
import pandas as pd

data = pd.DataFrame({
    "product": ["Widget", "Gadget", "Tool"],
    "q1_rev":  [12000, 8000, 5000],
    "q2_rev":  [14000, 9500, 4800],
    "q3_rev":  [11000, 8800, 5200],
    "q4_rev":  [16000, 11000, 6200],
})

# axis=0: apply to each column (column-level range)
numeric_cols = ["q1_rev", "q2_rev", "q3_rev", "q4_rev"]
col_ranges = data[numeric_cols].apply(lambda col: col.max() - col.min())
print("Range per quarter:", col_ranges)

# axis=1: apply to each row (row-level calculation)
data["annual_rev"] = data[numeric_cols].apply(lambda row: row.sum(), axis=1)
data["best_quarter"] = data[numeric_cols].apply(lambda row: row.idxmax(), axis=1)
print(data)
```

**Returning multiple new columns from apply:**

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id":   [1, 2, 3, 4],
    "price":      [29.99, 49.99, 19.99, 39.99],
    "quantity":   [3, 1, 5, 2],
    "discount":   [0.10, 0.00, 0.15, 0.05],
})

def compute_order_stats(row):
    gross   = row["price"] * row["quantity"]
    net     = gross * (1 - row["discount"])
    savings = gross - net
    return pd.Series({"gross": gross, "net": net, "savings": savings})

# Returns a DataFrame with the new columns
stats = orders.apply(compute_order_stats, axis=1)
result = pd.concat([orders, stats], axis=1)
print(result)
```

**Performance note** — `apply(axis=1)` is a Python loop over rows. For large DataFrames, this is 10-100x slower than vectorized pandas/numpy operations. Always check if a vectorized alternative exists.

```python
import pandas as pd

orders = pd.DataFrame({
    "price":    [29.99, 49.99, 19.99, 39.99],
    "quantity": [3, 1, 5, 2],
    "discount": [0.10, 0.00, 0.15, 0.05],
})

# Slow: Python loop via apply
orders["net_apply"] = orders.apply(
    lambda row: row["price"] * row["quantity"] * (1 - row["discount"]), axis=1
)

# Fast: vectorized arithmetic (equivalent result, ~100x faster for large data)
orders["net_vectorized"] = orders["price"] * orders["quantity"] * (1 - orders["discount"])

print(orders)
# Both columns are identical — always prefer the vectorized version
```

---

### Part 3: Vectorized Alternatives — np.where and np.select (30 minutes)

#### Explanation

Replacing `apply(axis=1)` with vectorized operations is the most impactful performance improvement you can make in pandas.

**`np.where(condition, true_value, false_value)`** — single-condition branch:

```python
import pandas as pd
import numpy as np

employees = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "salary": [110000, 72000, 88000, 65000, 95000],
    "years":  [7, 2, 5, 3, 6],
})

# Classify as Senior (>= 5 years) or Junior (< 5 years)
employees["seniority"] = np.where(employees["years"] >= 5, "Senior", "Junior")
print(employees)
```

**`np.select(conditions, choices, default)`** — multi-condition branch (replaces a chain of if/elif/else):

```python
import pandas as pd
import numpy as np

employees = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "salary": [110000, 72000, 88000, 65000, 95000, 78000],
    "years":  [7, 2, 5, 3, 6, 4],
})

# Three-tier seniority classification
conditions = [
    employees["years"] >= 6,
    employees["years"] >= 4,
    employees["years"] >= 2,
]
choices = ["Senior", "Mid", "Junior"]

employees["tier"] = np.select(conditions, choices, default="Trainee")
print(employees)
```

**Side-by-side comparison** — apply vs np.select:

```python
import pandas as pd
import numpy as np

products = pd.DataFrame({
    "product":    ["A","B","C","D","E"],
    "price":      [29.99, 199.99, 9.99, 99.99, 49.99],
    "units_sold": [1500, 200, 3000, 600, 900],
})

# Tier assignment: apply approach (slow)
def get_tier_apply(row):
    score = row["price"] * row["units_sold"]
    if score >= 50000:   return "Gold"
    elif score >= 20000: return "Silver"
    else:                return "Bronze"

products["tier_apply"] = products.apply(get_tier_apply, axis=1)

# Tier assignment: vectorized approach (fast)
score = products["price"] * products["units_sold"]
products["tier_vectorized"] = np.select(
    [score >= 50000, score >= 20000],
    ["Gold",         "Silver"],
    default="Bronze"
)

print(products)
# Both columns identical — vectorized is correct AND fast
```

<PracticeBlock
  prompt="Use np.select() to add a 'tier' column to the employees DataFrame based on salary: >= 100000 → 'Gold', >= 80000 → 'Silver', >= 60000 → 'Bronze', else 'Entry'. Do NOT use apply()."
  initialCode={`import pandas as pd
import numpy as np

employees = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "salary": [110000, 72000, 88000, 65000, 95000, 58000],
})

# Define conditions list
conditions = [
    # condition for Gold
    # condition for Silver
    # condition for Bronze
]

# Define choices list (must match conditions order)
choices = []

# Apply np.select
employees["tier"] =

print(employees)
`}
  hint="conditions = [employees['salary'] >= 100000, employees['salary'] >= 80000, employees['salary'] >= 60000]. choices = ['Gold', 'Silver', 'Bronze']. Then np.select(conditions, choices, default='Entry')."
  solution={`import pandas as pd
import numpy as np

employees = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "salary": [110000, 72000, 88000, 65000, 95000, 58000],
})

conditions = [
    employees["salary"] >= 100000,
    employees["salary"] >= 80000,
    employees["salary"] >= 60000,
]
choices = ["Gold", "Silver", "Bronze"]

employees["tier"] = np.select(conditions, choices, default="Entry")
print(employees)
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Employee Data Processing

```python
import pandas as pd
import numpy as np

employees = pd.DataFrame({
    "name":   ["Alice","Bob","Carol","Dave","Eve","Frank","Grace","Hank"],
    "dept":   ["Eng","Mktg","Eng","Sales","Mktg","Eng","Sales","Mktg"],
    "dept_code": ["E","M","E","S","M","E","S","M"],
    "salary": [110000,72000,88000,82000,95000,78000,70000,68000],
    "years":  [7, 2, 5, 4, 6, 3, 3, 2],
})

# Step 1: Map dept_code to full name using a dict
dept_map = {"E": "Engineering", "M": "Marketing", "S": "Sales"}
employees["dept_full"] = employees["dept_code"].map(dept_map)

# Step 2: Create seniority tier using np.select
conditions = [employees["years"] >= 6, employees["years"] >= 4, employees["years"] >= 2]
choices    = ["Senior", "Mid", "Junior"]
employees["seniority"] = np.select(conditions, choices, default="Trainee")

# Step 3: Compute annual bonus using vectorized math
rate = np.select(
    [employees["seniority"] == "Senior", employees["seniority"] == "Mid"],
    [0.15, 0.10],
    default=0.07,
)
employees["annual_bonus"] = (employees["salary"] * rate).round(2)

print(employees[["name", "dept_full", "seniority", "salary", "annual_bonus"]])
```

#### Exercise 2: Product Catalog Cleaning

```python
import pandas as pd
import numpy as np

catalog = pd.DataFrame({
    "product_id": [1, 2, 3, 4, 5],
    "raw_name":   ["  widget A  ", "GADGET-B", "tool_c", "Widget A", "  TOOL C "],
    "quality":    [88, 72, 91, 65, 80],
    "popularity": [9200, 5500, 8800, 3200, 7100],
    "margin":     [0.35, 0.22, 0.41, 0.18, 0.38],
})

# Step 1: Clean product names using DataFrame.apply (complex string ops)
def clean_name(name):
    return name.strip().title().replace("-", " ").replace("_", " ")

catalog["clean_name"] = catalog["raw_name"].apply(clean_name)

# Step 2: Compute composite score using vectorized math
catalog["composite_score"] = (
    catalog["quality"] * 0.4
    + (catalog["popularity"] / 100) * 0.4
    + catalog["margin"] * 100 * 0.2
).round(1)

# Step 3: Classify products by composite score using np.select
conditions = [catalog["composite_score"] >= 70, catalog["composite_score"] >= 50]
choices    = ["Priority", "Standard"]
catalog["priority_tier"] = np.select(conditions, choices, default="Review")

print(catalog[["clean_name", "composite_score", "priority_tier"]])
```

---

## Key Takeaways

- `Series.map(dict_or_func)` — element-wise lookup or transform
- `Series.apply(func)` — element-wise for complex logic; nearly equivalent to map
- `DataFrame.apply(func, axis=0)` — apply to each column; `axis=1` — apply to each row
- `apply(axis=1)` is a Python loop — avoid for large DataFrames
- `np.where(cond, true, false)` — vectorized single-condition branch
- `np.select([cond1, cond2], [val1, val2], default)` — vectorized multi-condition branch
- Always try vectorized arithmetic first; fall back to apply only when logic is too complex to vectorize

---

## Common Mistakes to Avoid

- **Using apply for simple math**: `df.apply(lambda row: row['a'] + row['b'], axis=1)` is slow — use `df['a'] + df['b']` instead
- **np.select condition order matters**: conditions are evaluated in order, first match wins — put most specific conditions first
- **Forgetting the default in np.select**: omitting `default` returns 0 for unmatched rows — always specify a meaningful default

---

[← Previous](./lesson-08-window-functions.md) | [Back to Course](./README.md) | [Next →](./lesson-10-transformation-project.md)
