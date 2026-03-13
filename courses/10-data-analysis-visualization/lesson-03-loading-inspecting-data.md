# Lesson 3: Loading and Inspecting Data

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Load data from CSV, JSON, Excel, and SQLite
- Inspect DataFrame shape, types, and sample data
- Identify data quality issues early

---

## Lesson Outline

### Part 1: Loading Data (30 minutes)

#### Explanation

```python
import pandas as pd

# CSV:
df = pd.read_csv("data.csv")
df = pd.read_csv("data.csv", sep=";", encoding="utf-8",
                 parse_dates=["date_column"],
                 dtype={"id": str, "price": float})

# JSON:
df = pd.read_json("data.json")
df = pd.read_json("https://api.example.com/data.json")  # URL!

# Excel:
df = pd.read_excel("report.xlsx", sheet_name="Sales")

# SQLite:
import sqlite3
conn = sqlite3.connect("database.db")
df = pd.read_sql("SELECT * FROM sales WHERE year = 2024", conn)
conn.close()

# From dict/list (we've seen this):
df = pd.DataFrame({"col1": [1, 2, 3], "col2": ["a", "b", "c"]})

# Save:
df.to_csv("output.csv", index=False)
df.to_json("output.json", orient="records")
df.to_excel("output.xlsx", index=False)
```

#### Practice

Download the Titanic dataset (titanic.csv) from a public URL and load it into a DataFrame.

---

### Part 2: Inspecting Data (30 minutes)

#### Explanation

```python
# First look at the data:
df.shape         # (891, 12) - rows, columns
df.head(10)      # First 10 rows
df.tail(5)       # Last 5 rows
df.sample(5)     # 5 random rows

# Column info:
df.columns       # All column names
df.dtypes        # Data type per column
df.info()        # Summary: dtype + non-null count

# Statistical summary:
df.describe()              # numeric columns only
df.describe(include="all") # all columns including categoricals

# Null values:
df.isnull().sum()          # Count nulls per column
df.isnull().mean() * 100   # Percentage nulls per column

# Unique values:
df["status"].value_counts()      # Counts
df["status"].value_counts(normalize=True)  # Proportions

# Quick exploration:
df.corr()          # Correlation matrix (numeric columns)
df.nlargest(5, "salary")    # Top 5 by salary
df.nsmallest(5, "age")      # Bottom 5 by age
```

#### Practice

Load a dataset and generate a "data quality report": column types, null percentages, unique value counts, and descriptive statistics.

---

### Part 3: First Analysis (30 minutes)

#### Explanation

```python
# Data profiling function:
def profile_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Generate a summary profile of a DataFrame."""
    profile = pd.DataFrame({
        "dtype": df.dtypes,
        "null_count": df.isnull().sum(),
        "null_pct": (df.isnull().mean() * 100).round(1),
        "unique_count": df.nunique(),
        "sample_value": df.iloc[0],
    })
    return profile


# Exploratory questions:
# 1. How many rows and columns?
# 2. What are the data types?
# 3. Which columns have missing data?
# 4. What's the range of numeric values?
# 5. What are the unique categories?
# 6. Are there obvious outliers?

# Example with Titanic:
# df = pd.read_csv("titanic.csv")
# print(df.describe())
# print(df["Survived"].value_counts())   # 0=died, 1=survived
# print(df.groupby("Pclass")["Survived"].mean())  # Survival by class
```

#### Practice

Load a real dataset (Titanic, iris, etc.) and answer 5 exploratory questions about it.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: World Bank Data

Load a CSV with country economic data. Answer:
- Which countries have the highest GDP per capita?
- What's the correlation between life expectancy and GDP?
- How many countries have data for all columns?

#### Exercise 2: Data Quality Report

Build a `DataQualityReport` class that:
- Accepts a DataFrame
- Reports: missing values, constant columns, high cardinality columns (>50% unique)
- Identifies potential duplicate rows
- Prints a formatted summary

---

## Key Takeaways

- `pd.read_csv(file)` is the most common entry point; customize with `dtype`, `parse_dates`, `sep`
- `.info()` shows dtypes and non-null counts; `.describe()` shows statistics
- `.isnull().sum()` counts missing values per column — run this before any analysis
- `.value_counts()` is essential for understanding categorical columns
- Always answer: How many rows? Missing data? Correct types? Outliers?

---

[← Previous](./lesson-02-pandas-introduction.md) | [Back to Course](./README.md) | [Next →](./lesson-04-data-cleaning.md)
