# Lesson 2: Pandas Introduction

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand Series and DataFrame
- Create DataFrames from various sources
- Access and modify data
- Understand index and column labels

---

## Lesson Outline

### Part 1: Series and DataFrame (30 minutes)

#### Explanation

```python
import pandas as pd
import numpy as np

# Series: 1D labeled array
s = pd.Series([10, 20, 30, 40], index=["a", "b", "c", "d"])
print(s["b"])      # 20
print(s[1])        # 20 (integer index also works)
print(s.mean())    # 25.0

# DataFrame: 2D labeled table
data = {
    "name":  ["Alice", "Bob", "Carol", "Dave"],
    "age":   [25, 30, 28, 35],
    "score": [92, 85, 78, 91],
    "grade": ["A", "B", "C", "A"]
}
df = pd.DataFrame(data)
print(df)
#     name  age  score grade
# 0  Alice   25     92     A
# 1    Bob   30     85     B
# 2  Carol   28     78     C
# 3   Dave   35     91     A

# Access columns:
df["name"]          # Series of names
df[["name", "age"]] # DataFrame with 2 columns
df.name             # Same as df["name"] (attribute access)

# Access rows:
df.loc[0]           # Row by label (index)
df.iloc[0]          # Row by position

# Properties:
df.shape    # (4, 4) - rows, columns
df.dtypes   # dtype of each column
df.index    # RangeIndex(start=0, stop=4, step=1)
df.columns  # Index(['name', 'age', 'score', 'grade'])
```

#### Practice

Create a DataFrame from a list of student dictionaries. Access the scores column and compute the mean.

---

### Part 2: Basic Operations (30 minutes)

#### Explanation

```python
import pandas as pd

# Arithmetic (vectorized):
df["score_normalized"] = df["score"] / 100
df["age_group"] = df["age"].apply(lambda x: "young" if x < 30 else "senior")

# Filtering:
df[df["age"] > 25]           # Rows where age > 25
df[df["grade"] == "A"]       # Rows where grade is A
df[(df["age"] > 25) & (df["score"] > 85)]  # Multiple conditions

# Sorting:
df.sort_values("score", ascending=False)
df.sort_values(["grade", "score"], ascending=[True, False])

# Add/remove columns:
df["passed"] = df["score"] >= 70         # Add column
df.drop("grade", axis=1)                 # Remove column (returns new df)
df.drop(columns=["grade", "age"])        # Remove multiple

# Statistics:
df["score"].mean()         # Mean
df["score"].describe()     # count, mean, std, min, 25%, 50%, 75%, max
df.describe()              # Describes all numeric columns
```

#### Practice

Add a `grade_letter` column to your DataFrame based on score: A(90+), B(80+), C(70+), D(60+), F(below 60).

---

### Part 3: Index and Reshaping (30 minutes)

#### Explanation

```python
# Set custom index:
df = df.set_index("name")
print(df.loc["Alice"])     # Row for Alice

# Reset to default integer index:
df = df.reset_index()

# Transpose:
df.T   # Rows become columns, columns become rows

# Rename columns:
df.rename(columns={"score": "test_score", "age": "years"}, inplace=True)

# Select by column type:
df.select_dtypes(include="number")    # Only numeric columns
df.select_dtypes(include="object")   # Only string columns

# Value counts:
df["grade"].value_counts()
# A    2
# B    1
# C    1

# Unique values:
df["grade"].unique()    # ['A', 'B', 'C']
df["grade"].nunique()   # 3 (number of unique values)
```

#### Practice

Load the following data, set student_id as index, and find all students with grade "A" sorted by score descending.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Employee Analysis

```python
employees = [
    {"id": 1, "name": "Alice", "dept": "Engineering", "salary": 90000, "years": 5},
    {"id": 2, "name": "Bob", "dept": "Marketing", "salary": 65000, "years": 3},
    # Add 8 more employees...
]
df = pd.DataFrame(employees)

# Tasks:
# 1. Find average salary by department
# 2. Find the highest-paid employee in each department
# 3. Add "senior" flag for employees with 5+ years
# 4. Sort by salary, show top 3
```

#### Exercise 2: Sales Data

Create a DataFrame of 20 sales records with: date, product, region, quantity, unit_price.
Calculate: revenue (quantity × price), total by region, best-selling product.

---

## Key Takeaways

- `Series`: 1D array with labels; `DataFrame`: 2D table with row and column labels
- `df["column"]` returns a Series; `df[["col1", "col2"]]` returns a DataFrame
- `df[condition]` filters rows; conditions use `&`, `|`, `~` (not `and`, `or`, `not`)
- `.describe()` gives quick statistical summary of numeric columns
- `.value_counts()` counts occurrences of each unique value

---

[← Previous](./lesson-01-numpy-fundamentals.md) | [Back to Course](./README.md) | [Next →](./lesson-03-loading-inspecting-data.md)
