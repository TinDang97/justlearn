# Lesson 1: Introduction to Series and DataFrame

**Course:** Data Engineering | **Duration:** 30 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain why pandas exists and what problems it solves over plain Python lists
- Describe the structure of a pandas Series (index + values)
- Describe the structure of a pandas DataFrame (rows, columns, shared index)
- Locate pandas in the data engineering workflow

---

## Prerequisites

- Python fundamentals: lists, dicts, loops, functions
- Section 1: Introduction to Data Engineering (conceptual foundation)

---

## Lesson Outline

### Part 1: Why pandas?

#### The Problem with Plain Python Lists

Before pandas, Python developers used nested lists and dicts to work with tabular data. This approach has three critical limitations:

**No labels.** A list is accessed by position only. `data[3]` tells you nothing about what that value represents.

```python
# Plain Python — position-based, no labels
prices = [1.20, 2.50, 0.89, 4.00, 1.75]
print(prices[0])  # What is this? No idea without reading the code
```

**No mixed-type column awareness.** A list of lists treats every value identically. You cannot ask "what type is the salary column?" or "give me all rows where salary > 50000".

```python
# A "table" in plain Python
employees = [
    ["Alice", "Engineering", 95000],
    ["Bob",   "Marketing",   72000],
]
# Getting all engineers requires manual loop + index magic
engineers = [row for row in employees if row[1] == "Engineering"]
```

**No vectorized operations.** To multiply every price by 1.1, you write a loop. For millions of rows, loops in pure Python are slow.

#### How pandas Solves This

pandas provides two data structures built on top of NumPy arrays that fix all three problems:

- **Labels everywhere** — rows and columns both have names
- **Rich type system** — each column knows its dtype
- **Vectorized operations** — math on entire columns happens in compiled C, not Python loops

---

### Part 2: The Series — One Column with an Index

A **Series** is a one-dimensional labeled array. Think of it as a single column from a spreadsheet: a sequence of values, each with a label (the index).

```python
import pandas as pd

# A Series of product prices
prices = pd.Series([1.20, 2.50, 0.89, 4.00, 1.75],
                   index=['apple', 'banana', 'carrot', 'date', 'eggplant'],
                   name='price_usd')

print(prices)
# apple      1.20
# banana     2.50
# carrot     0.89
# date       4.00
# eggplant   1.75
# Name: price_usd, dtype: float64
```

Key anatomy:
- **Values**: the data (`[1.20, 2.50, ...]`)
- **Index**: the labels (`apple`, `banana`, ...) — defaults to integers if not specified
- **dtype**: the data type pandas inferred or you assigned (`float64`)
- **name**: optional label for the Series itself

---

### Part 3: The DataFrame — A Table of Series

A **DataFrame** is a two-dimensional labeled table. Every column is a Series, and all columns share the same index (the row labels).

```python
import pandas as pd

# A DataFrame with 3 columns — each column is a Series
employees = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol'],
    'department': ['Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000]
})

print(employees)
#     name   department  salary
# 0  Alice  Engineering   95000
# 1    Bob    Marketing   72000
# 2  Carol  Engineering   88000
```

Key anatomy:
- **Columns**: each has a name and a dtype
- **Row index**: default integer index (0, 1, 2) — can be set to meaningful labels
- **Shape**: `(3, 3)` — 3 rows, 3 columns

The relationship: `df['salary']` returns the salary column as a Series. The DataFrame is the container; Series is the building block.

---

### Part 4: pandas in the Data Engineering Workflow

Every major step of a data pipeline uses DataFrames:

| Pipeline Step | pandas Operation |
|---|---|
| **Ingest** | `pd.read_csv()`, `pd.read_json()`, `pd.read_parquet()` |
| **Inspect** | `.info()`, `.describe()`, `.head()`, `.dtypes` |
| **Filter** | `df[df['col'] > value]`, `.query()` |
| **Transform** | `df['new_col'] = ...`, `.apply()`, `.rename()` |
| **Aggregate** | `.groupby()`, `.pivot_table()` |
| **Write** | `.to_csv()`, `.to_parquet()`, `.to_sql()` |

You will learn each of these across Sections 2–9. Section 2 covers the foundation: structure, selection, filtering, and statistics.

<Info>
pandas is built on NumPy. When you do `df['salary'] * 1.1`, the multiplication runs in compiled C code across the entire column at once — no Python loop. This is called **vectorization** and it is why pandas can process millions of rows in milliseconds.
</Info>

---

## Practice

<PracticeBlock
  prompt="Import pandas and check its version with `pd.__version__`. Then create a simple Series of 5 numbers (10, 20, 30, 40, 50) and print it."
  initialCode={`import pandas as pd\n\n# Check pandas version\n\n# Create a Series of 5 numbers\n`}
  hint="Use pd.__version__ to get the version string. Use pd.Series([10, 20, 30, 40, 50]) to create the Series."
  solution={`import pandas as pd\n\n# Check pandas version\nprint("pandas version:", pd.__version__)\n\n# Create a Series of 5 numbers\nnumbers = pd.Series([10, 20, 30, 40, 50])\nprint(numbers)`}
/>

---

## Key Takeaways

- pandas solves three problems with plain Python for tabular data: no labels, no type awareness, no vectorized operations
- A **Series** is a 1D labeled array — one column with an index
- A **DataFrame** is a 2D labeled table — a collection of Series sharing a row index
- Every column in a DataFrame is a Series; `df['col']` returns that Series
- pandas is used at every step of a data pipeline: ingest → inspect → filter → transform → aggregate → write

---

## Common Mistakes to Avoid

- **Confusing index and position**: the index is a label, not always the same as the row number
- **Treating DataFrames like 2D lists**: `df[0]` does NOT return the first row — use `.iloc[0]` (covered in Lesson 4)
- **Forgetting to import pandas**: always `import pandas as pd` at the top of every script

---

[← Back to Course Overview](./README.md) | [Next Lesson: Creating and Inspecting Series →](./lesson-02-creating-series.md)
