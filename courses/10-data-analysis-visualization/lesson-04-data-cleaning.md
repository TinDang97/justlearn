# Lesson 4: Data Cleaning

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Handle missing values (drop, fill, interpolate)
- Fix data types and format inconsistencies
- Remove duplicates
- Detect and handle outliers

---

## Lesson Outline

### Part 1: Missing Values (30 minutes)

#### Explanation

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name":  ["Alice", "Bob", None, "Dave"],
    "age":   [25, None, 28, 35],
    "score": [92, 85, None, 91]
})

# Strategies:
# 1. Drop rows with any null:
df.dropna()

# 2. Drop rows where specific column is null:
df.dropna(subset=["name"])

# 3. Fill with a constant:
df["score"].fillna(0)

# 4. Fill with mean/median/mode:
df["age"].fillna(df["age"].mean())
df["score"].fillna(df["score"].median())
df["name"].fillna(df["name"].mode()[0])

# 5. Forward fill (use previous value):
df["score"].ffill()

# 6. Interpolate (for time series):
df["score"].interpolate()

# In-place vs returning new DataFrame:
df["age"] = df["age"].fillna(df["age"].median())  # Modify original
df_clean = df.dropna()   # New DataFrame
```

#### Practice

Given a sales dataset with 30% missing prices, fill with median price by product category.

---

### Part 2: Type Conversion and String Cleaning (30 minutes)

#### Explanation

```python
# Type conversion:
df["price"] = pd.to_numeric(df["price"], errors="coerce")  # errors="coerce" → NaN for bad values
df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d")
df["is_active"] = df["is_active"].astype(bool)
df["category"] = df["category"].astype("category")  # Memory efficient for repetitive strings

# String cleaning:
df["name"] = df["name"].str.strip()          # Remove whitespace
df["email"] = df["email"].str.lower()        # Lowercase
df["phone"] = df["phone"].str.replace(r"[^\d]", "", regex=True)  # Remove non-digits
df["code"] = df["code"].str.upper()

# Split strings:
df[["first", "last"]] = df["full_name"].str.split(" ", n=1, expand=True)

# Extract with regex:
df["area_code"] = df["phone"].str.extract(r"(\d{3})")

# String contains/startswith:
df[df["email"].str.endswith("@gmail.com")]
df[df["name"].str.contains("Smith", case=False, na=False)]
```

#### Practice

Clean a messy names column: strip whitespace, title-case, remove special characters, split into first/last name.

---

### Part 3: Duplicates and Outliers (30 minutes)

#### Explanation

```python
# Duplicates:
df.duplicated().sum()              # Count duplicates
df[df.duplicated()]                # View duplicates
df.drop_duplicates(inplace=True)   # Remove all duplicates
df.drop_duplicates(subset=["email"])  # Based on specific columns
df.drop_duplicates(keep="last")    # Keep last occurrence

# Outlier detection:
# Method 1: IQR (Interquartile Range)
Q1 = df["salary"].quantile(0.25)
Q3 = df["salary"].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
df_clean = df[(df["salary"] >= lower) & (df["salary"] <= upper)]

# Method 2: Z-score
from scipy import stats
z_scores = np.abs(stats.zscore(df["salary"]))
df_clean = df[z_scores < 3]   # Remove rows >3 std devs from mean

# Cap instead of remove (winsorizing):
df["salary"] = df["salary"].clip(lower, upper)
```

#### Practice

Given a salary dataset, identify and remove outliers using the IQR method. Report how many were removed.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Full Cleaning Pipeline

```python
def clean_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    """Full cleaning pipeline for sales data."""
    df = df.copy()

    # 1. Fix column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # 2. Convert types
    df["date"] = pd.to_datetime(df["date"])
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")

    # 3. Fill missing values
    df["price"].fillna(df["price"].median(), inplace=True)
    df["quantity"].fillna(1, inplace=True)

    # 4. Remove duplicates
    df.drop_duplicates(inplace=True)

    # 5. Remove outliers from price
    Q1, Q3 = df["price"].quantile([0.25, 0.75])
    IQR = Q3 - Q1
    df = df[(df["price"] >= Q1 - 1.5*IQR) & (df["price"] <= Q3 + 1.5*IQR)]

    # 6. Add computed column
    df["revenue"] = df["price"] * df["quantity"]

    return df
```

Apply this to a real dataset and compare before/after statistics.

---

## Key Takeaways

- `.dropna()` removes rows with any null; `.fillna(value)` fills them
- Fill strategy matters: mean for normally distributed, median for skewed, mode for categorical
- `pd.to_numeric(errors="coerce")` converts strings to numbers, bad values → NaN
- `.str.strip()`, `.str.lower()`, `.str.replace()` clean string columns
- IQR method: outliers are > 1.5×IQR below Q1 or above Q3

---

[← Previous](./lesson-03-loading-inspecting-data.md) | [Back to Course](./README.md) | [Next →](./lesson-05-filtering-selecting.md)
