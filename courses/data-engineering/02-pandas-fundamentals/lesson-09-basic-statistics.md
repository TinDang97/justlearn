# Lesson 9: Basic Statistics with pandas

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Generate summary statistics for a DataFrame with `.describe()`
- Compute column-level statistics: `.mean()`, `.median()`, `.std()`, `.min()`, `.max()`, `.sum()`
- Count value frequencies with `.value_counts()` including normalized proportions
- Compute pairwise correlations between numeric columns using `.corr()`
- Count distinct values with `.nunique()` and list them with `.unique()`

---

## Prerequisites

- Lesson 8: Sorting and Ranking

---

## Lesson Outline

### Part 1: `.describe()` — Summary Statistics

`.describe()` produces a statistical summary for all numeric columns in one call. It is the first thing to run when you receive a new dataset.

```python
import pandas as pd

df = pd.DataFrame({
    'product':  ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam',
                 'Laptop', 'Keyboard', 'Mouse', 'Monitor', 'USB Hub'],
    'category': ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics',
                 'Electronics', 'Accessories', 'Accessories', 'Electronics', 'Accessories'],
    'quantity': [1, 2, 1, 1, 1, 2, 3, 1, 2, 4],
    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0,
                   1200.0, 75.0, 25.0, 350.0, 15.0]
})

print(df.describe())
#        quantity   unit_price
# count  10.000000    10.00000
# mean    1.800000   240.40000
# std     0.918937   416.14873
# min     1.000000    15.00000
# 25%     1.000000    25.00000
# 50%     1.500000    82.00000
# 75%     2.000000   412.50000
# max     4.000000  1200.00000
```

Reading `.describe()` output:
- **count**: non-null row count (if lower than expected, missing values exist)
- **mean**: arithmetic mean
- **std**: standard deviation — how spread out the values are
- **min / max**: range of values
- **25% / 50% / 75%**: quartiles — 50% is the median

---

### Part 2: Column-Level Statistics

For individual statistics on a single column:

```python
import pandas as pd

df = pd.DataFrame({
    'quantity':   [1, 2, 1, 1, 1, 2, 3, 1, 2, 4],
    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0,
                   1200.0, 75.0, 25.0, 350.0, 15.0]
})

# Mean
print("Mean price:", df['unit_price'].mean())    # 240.4

# Median (middle value when sorted — robust to outliers)
print("Median price:", df['unit_price'].median())  # 82.0

# Standard deviation
print("Std price:", df['unit_price'].std())       # 416.15

# Variance
print("Var price:", df['unit_price'].var())

# Min and max
print("Min price:", df['unit_price'].min())       # 15.0
print("Max price:", df['unit_price'].max())       # 1200.0

# Sum
print("Total quantity ordered:", df['quantity'].sum())  # 18

# Count non-null values
print("Count:", df['unit_price'].count())         # 10
```

<Tip>
Use `.median()` instead of `.mean()` for skewed data (like salaries or prices) where a few extreme values would inflate the mean. The median is resistant to outliers.
</Tip>

---

### Part 3: `.value_counts()` — Frequency Counts

`.value_counts()` counts how often each unique value appears in a column. Essential for exploring categorical data.

```python
import pandas as pd

df = pd.DataFrame({
    'category': ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics',
                 'Electronics', 'Accessories', 'Accessories', 'Electronics', 'Accessories'],
    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0,
                   1200.0, 75.0, 25.0, 350.0, 15.0]
})

# Count occurrences of each category
print(df['category'].value_counts())
# Accessories    5
# Electronics    5
# Name: category, dtype: int64

# Proportions — normalize=True converts counts to fractions
print(df['category'].value_counts(normalize=True))
# Accessories    0.5
# Electronics    0.5
# Name: proportion, dtype: float64

# Sort by category name instead of count
print(df['category'].value_counts().sort_index())
```

---

### Part 4: `.corr()` — Pairwise Correlations

`.corr()` computes the Pearson correlation coefficient between every pair of numeric columns. Values range from -1 (perfect negative) to +1 (perfect positive); 0 means no linear relationship.

```python
import pandas as pd

df = pd.DataFrame({
    'quantity':   [1, 2, 1, 1, 1, 2, 3, 1, 2, 4],
    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0,
                   1200.0, 75.0, 25.0, 350.0, 15.0],
    'total_price': [1200.0, 50.0, 75.0, 350.0, 89.0,
                    2400.0, 225.0, 25.0, 700.0, 60.0]
})

print(df.corr())
#             quantity  unit_price  total_price
# quantity    1.000000   -0.547...    0.673...
# unit_price -0.547...    1.000000    0.970...
# total_price 0.673...    0.970...    1.000000
```

Interpret: `unit_price` and `total_price` have a correlation of ~0.97 — very high, expected since total = quantity × unit_price.

<Info>
`.corr()` only works on numeric columns. Non-numeric columns are automatically excluded from the correlation matrix.
</Info>

---

### Part 5: `.nunique()` and `.unique()` — Distinct Values

```python
import pandas as pd

df = pd.DataFrame({
    'category': ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics'],
    'product':  ['Laptop', 'Mouse', 'Keyboard', 'Laptop', 'Monitor']
})

# Count distinct values per column
print(df.nunique())
# category    2
# product     4
# dtype: int64

# Count distinct values in one column
print(df['category'].nunique())  # 2

# List distinct values (unordered)
print(df['category'].unique())   # ['Electronics' 'Accessories']
print(df['product'].unique())    # ['Laptop' 'Mouse' 'Keyboard' 'Monitor']
```

---

## Practice

<PracticeBlock
  prompt="Create a sales DataFrame with 8 rows (product, category, quantity, unit_price) and run .describe() on it. Identify which column has the highest standard deviation and what that means."
  initialCode={`import pandas as pd\n\n# Create a sales DataFrame\ndf = pd.DataFrame({\n    'product':    ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'USB Hub', 'Mouse', 'Laptop'],\n    'category':   ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories', 'Accessories', 'Electronics'],\n    'quantity':   [1, 3, 2, 1, 1, 5, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0, 15.0, 25.0, 1200.0]\n})\n\n# Run describe() on the DataFrame\n\n`}
  hint="Just call df.describe(). Look at the 'std' row — higher std means more spread-out values. unit_price likely has the highest std because prices range from 15 to 1200."
  solution={`import pandas as pd\n\n# Create a sales DataFrame\ndf = pd.DataFrame({\n    'product':    ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'USB Hub', 'Mouse', 'Laptop'],\n    'category':   ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories', 'Accessories', 'Electronics'],\n    'quantity':   [1, 3, 2, 1, 1, 5, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0, 15.0, 25.0, 1200.0]\n})\n\n# Run describe() on the DataFrame\nprint(df.describe())\nprint()\nprint("unit_price has the highest std — prices range from $15 to $1200, so they are highly spread out.")\nprint("Mean unit_price:", df['unit_price'].mean())\nprint("Median unit_price:", df['unit_price'].median())\nprint("The median ($99.5) is much lower than the mean ($247.4) — the Laptop price skews the average up.")`}
/>

<PracticeBlock
  prompt="Use .value_counts(normalize=True) to find the percentage breakdown of products by category. Which category makes up a larger share?"
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'product':    ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'USB Hub', 'Mouse', 'Laptop'],\n    'category':   ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories', 'Accessories', 'Electronics'],\n    'quantity':   [1, 3, 2, 1, 1, 5, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0, 15.0, 25.0, 1200.0]\n})\n\n# Percentage breakdown by category\n\n`}
  hint="Use df['category'].value_counts(normalize=True). Multiply by 100 if you want percentages: * 100"
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'product':    ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'USB Hub', 'Mouse', 'Laptop'],\n    'category':   ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories', 'Accessories', 'Electronics'],\n    'quantity':   [1, 3, 2, 1, 1, 5, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0, 15.0, 25.0, 1200.0]\n})\n\n# Percentage breakdown by category\nproportions = df['category'].value_counts(normalize=True) * 100\nprint("Category breakdown (%):")\nprint(proportions)\nprint()\nprint("Both categories have equal share: 50% each (4 of 8 rows each)")`}
/>

<PracticeBlock
  prompt="Compute the mean unit_price for the Electronics category only. Do this by filtering the DataFrame first (no groupby — that's Section 5), then calling .mean()."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'product':    ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'USB Hub', 'Mouse', 'Laptop'],\n    'category':   ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories', 'Accessories', 'Electronics'],\n    'quantity':   [1, 3, 2, 1, 1, 5, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0, 15.0, 25.0, 1200.0]\n})\n\n# Mean unit_price for Electronics only\n# Step 1: filter to Electronics rows\n# Step 2: select the unit_price column and call .mean()\n\n`}
  hint="Filter first: electronics = df[df['category'] == 'Electronics']. Then: electronics['unit_price'].mean(). Or combine: df[df['category'] == 'Electronics']['unit_price'].mean()"
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'product':    ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Webcam', 'USB Hub', 'Mouse', 'Laptop'],\n    'category':   ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories', 'Accessories', 'Electronics'],\n    'quantity':   [1, 3, 2, 1, 1, 5, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 89.0, 15.0, 25.0, 1200.0]\n})\n\n# Mean unit_price for Electronics only\nelectronics = df[df['category'] == 'Electronics']\nmean_price = electronics['unit_price'].mean()\nprint("Mean unit_price for Electronics:", mean_price)\n\n# Also compute for Accessories\naccessories_mean = df[df['category'] == 'Accessories']['unit_price'].mean()\nprint("Mean unit_price for Accessories:", accessories_mean)`}
/>

---

## Key Takeaways

- `.describe()` — one-call summary: count, mean, std, min, quartiles, max for all numeric columns
- Column statistics: `.mean()`, `.median()`, `.std()`, `.var()`, `.min()`, `.max()`, `.sum()`, `.count()`
- `.value_counts()` — frequency table for categorical columns; `normalize=True` gives proportions
- `.corr()` — pairwise Pearson correlation matrix; values -1 to +1; 0 = no linear relationship
- `.nunique()` — count of distinct values; `.unique()` — array of distinct values

---

## Common Mistakes to Avoid

- **Running `.describe()` and getting only 2 columns**: non-numeric columns are excluded by default; pass `include='all'` for all dtypes
- **Using `.mean()` on skewed data without checking**: always compare mean vs median for numeric columns; large gap = skewed data
- **Interpreting correlation as causation**: high `.corr()` value means linear relationship, not causation

---

[← Previous Lesson](./lesson-08-sorting-and-ranking.md) | [Back to Course Overview](./README.md) | [Next Lesson: Inspecting DataFrames: Shape and Info →](./lesson-10-dataframe-shape-and-info.md)
