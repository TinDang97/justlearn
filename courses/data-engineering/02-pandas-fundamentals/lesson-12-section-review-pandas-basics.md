# Lesson 12: Section Review: Pandas Basics

**Course:** Data Engineering | **Duration:** 60 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Recall the core pandas operations from Lessons 1–11
- Apply Series and DataFrame creation, selection, filtering, column ops, statistics, and renaming to a single realistic dataset
- Diagnose type issues in a freshly loaded DataFrame
- Build a clean summary pipeline from raw dict data

---

## Prerequisites

- Lessons 1–11: All of Section 2

---

## Lesson Outline

### Part 1: Quick Reference Table — What You've Learned

| Concept | Method / Operation | Lesson |
|---------|-------------------|--------|
| Create Series | `pd.Series([...], index=[...])` | 02 |
| Create DataFrame | `pd.DataFrame({'col': [...]})` | 03 |
| Column selection | `df['col']`, `df[['col1', 'col2']]` | 04 |
| Label-based selection | `df.loc[row, col]` | 04 |
| Position-based selection | `df.iloc[row, col]` | 04 |
| Boolean filter | `df[df['col'] > value]` | 05 |
| Compound filter | `(cond1) & (cond2)` | 05 |
| String filter | `df.query("col == 'val'")` | 05 |
| Add column | `df['new'] = expression` | 06 |
| Drop column | `df.drop(columns=['col'])` | 06 |
| Custom function | `df['col'].apply(fn)` | 06 |
| Inspect types | `df.dtypes`, `df.info()` | 07 |
| Convert type | `df['col'].astype(float)` | 07 |
| Sort ascending | `df.sort_values('col')` | 08 |
| Sort descending | `df.sort_values('col', ascending=False)` | 08 |
| Top N rows | `df.nlargest(n, 'col')` | 08 |
| Summary stats | `df.describe()` | 09 |
| Column stats | `.mean()`, `.median()`, `.std()` | 09 |
| Frequencies | `df['col'].value_counts()` | 09 |
| Correlations | `df.corr()` | 09 |
| Shape | `df.shape` | 10 |
| Full inspection | `df.info()` | 10 |
| Preview | `df.head()`, `df.tail()` | 10 |
| Missing values | `df.isnull().sum()` | 10 |
| Rename columns | `df.rename(columns={...})` | 11 |
| Set index | `df.set_index('col')` | 11 |
| Reset index | `df.reset_index()` | 11 |

---

### Part 2: The Orders Dataset

For this section review, you will work with a synthetic online store orders dataset. All four exercises below use this same data.

```python
orders = {
    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],
    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],
    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],
    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],
    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],
    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],
    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']
}
```

This dataset represents 10 orders. It has:
- **String columns**: order_id, customer, product, category, order_date
- **Integer column**: quantity
- **Float column**: unit_price
- **Type issue to spot**: `order_date` is stored as `object` (string), not `datetime64`

---

### Part 3: Guided Exercises

#### Exercise 1: Load and Inspect

<PracticeBlock
  prompt="Load the orders dict into a DataFrame. Inspect its shape, call .info() to check dtypes and null counts, and print the first 5 rows. Identify any type issues — which column has the wrong dtype for its purpose?"
  initialCode={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\n\n# Load into a DataFrame\ndf = pd.DataFrame(orders)\n\n# Check shape\n\n# Check dtypes and null counts with .info()\n\n# Preview first 5 rows\n\n# What type issue do you see?\n`}
  hint="Call df.shape, df.info(), and df.head(). Look at the dtypes in .info() output — order_date shows as object (string) but it should be datetime64 for date operations."
  solution={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\n\n# Load into a DataFrame\ndf = pd.DataFrame(orders)\n\n# Check shape\nprint("Shape:", df.shape)  # (10, 7)\nprint()\n\n# Check dtypes and null counts with .info()\ndf.info()\nprint()\n\n# Preview first 5 rows\nprint(df.head())\nprint()\n\n# Type issue: order_date is 'object' (string) but should be datetime64\n# Fix it for completeness\ndf['order_date'] = pd.to_datetime(df['order_date'])\nprint("After fixing order_date:", df['order_date'].dtype)  # datetime64[ns]`}
/>

#### Exercise 2: Add Column, Filter, Sort

<PracticeBlock
  prompt="Add a 'total_price' column (quantity * unit_price). Then filter orders where total_price > 50. Sort the filtered result by total_price descending and print it."
  initialCode={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\ndf = pd.DataFrame(orders)\n\n# Step 1: Add total_price column\n\n# Step 2: Filter orders where total_price > 50\n\n# Step 3: Sort filtered result by total_price descending\n\nprint(result)\n`}
  hint="df['total_price'] = df['quantity'] * df['unit_price']. Then filter: result = df[df['total_price'] > 50]. Then sort: result = result.sort_values('total_price', ascending=False)"
  solution={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\ndf = pd.DataFrame(orders)\n\n# Step 1: Add total_price column\ndf['total_price'] = df['quantity'] * df['unit_price']\n\n# Step 2: Filter orders where total_price > 50\nresult = df[df['total_price'] > 50]\n\n# Step 3: Sort filtered result by total_price descending\nresult = result.sort_values('total_price', ascending=False)\n\nprint(result[['order_id', 'product', 'quantity', 'unit_price', 'total_price']])`}
/>

#### Exercise 3: Value Counts and Category Statistics

<PracticeBlock
  prompt="After adding 'total_price' (quantity * unit_price), use value_counts() to find the order count by category. Then compute the mean total_price for Electronics orders and the mean total_price for Accessories orders by filtering manually."
  initialCode={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\ndf = pd.DataFrame(orders)\ndf['total_price'] = df['quantity'] * df['unit_price']\n\n# Order count by category\n\n# Mean total_price for Electronics\n\n# Mean total_price for Accessories\n\n`}
  hint="df['category'].value_counts() for counts. Filter then .mean(): df[df['category']=='Electronics']['total_price'].mean()"
  solution={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\ndf = pd.DataFrame(orders)\ndf['total_price'] = df['quantity'] * df['unit_price']\n\n# Order count by category\nprint("Order count by category:")\nprint(df['category'].value_counts())\nprint()\n\n# Mean total_price for Electronics\nelec_mean = df[df['category'] == 'Electronics']['total_price'].mean()\nprint(f"Mean total_price for Electronics: ${elec_mean:.2f}")\n\n# Mean total_price for Accessories\nacc_mean = df[df['category'] == 'Accessories']['total_price'].mean()\nprint(f"Mean total_price for Accessories: ${acc_mean:.2f}")\nprint()\nprint("Electronics orders are much higher value on average due to Laptop prices.")`}
/>

#### Exercise 4: Rename, Reset Index, Final Inspection

<PracticeBlock
  prompt="Starting from the full orders DataFrame (with total_price added), rename 'unit_price' to 'price'. Then set 'order_id' as the index. Print .info() for the final clean DataFrame."
  initialCode={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\ndf = pd.DataFrame(orders)\ndf['total_price'] = df['quantity'] * df['unit_price']\n\n# Step 1: Rename 'unit_price' to 'price'\n\n# Step 2: Set 'order_id' as the row index\n\n# Step 3: Print .info() for the final DataFrame\n\n# Step 4: Show the first 3 rows with .head(3)\n\n`}
  hint="df = df.rename(columns={'unit_price': 'price'}). Then df = df.set_index('order_id'). Then df.info() and df.head(3)."
  solution={`import pandas as pd\n\norders = {\n    'order_id': ['O001','O002','O003','O004','O005','O006','O007','O008','O009','O010'],\n    'customer': ['Alice','Bob','Alice','Charlie','Bob','Diana','Charlie','Alice','Bob','Diana'],\n    'product': ['Laptop','Mouse','Keyboard','Monitor','Laptop','USB Hub','Mouse','Webcam','Keyboard','Monitor'],\n    'category': ['Electronics','Accessories','Accessories','Electronics','Electronics','Accessories','Accessories','Electronics','Accessories','Electronics'],\n    'quantity': [1, 2, 1, 1, 1, 3, 1, 1, 2, 2],\n    'unit_price': [1200.0, 25.0, 75.0, 350.0, 1200.0, 15.0, 25.0, 89.0, 75.0, 350.0],\n    'order_date': ['2024-01-15','2024-01-16','2024-01-17','2024-01-18','2024-01-19','2024-01-20','2024-01-21','2024-01-22','2024-01-23','2024-01-24']\n}\ndf = pd.DataFrame(orders)\ndf['total_price'] = df['quantity'] * df['unit_price']\n\n# Step 1: Rename 'unit_price' to 'price'\ndf = df.rename(columns={'unit_price': 'price'})\n\n# Step 2: Set 'order_id' as the row index\ndf = df.set_index('order_id')\n\n# Step 3: Print .info() for the final DataFrame\nprint("Final DataFrame info:")\ndf.info()\nprint()\n\n# Step 4: Show the first 3 rows with .head(3)\nprint("First 3 rows:")\nprint(df.head(3))`}
/>

---

### Part 4: What's Next

You have covered the complete pandas foundation:

- **Structure**: Series (1D), DataFrame (2D table), index
- **Creation**: from dict of lists, list of dicts
- **Selection**: column selection, `loc`, `iloc`
- **Filtering**: boolean masks, `.query()`
- **Column operations**: add, modify, drop, `.apply()`
- **Type system**: inspect with `.dtypes`/`.info()`, convert with `.astype()`
- **Sorting**: `.sort_values()`, `.nlargest()`, `.nsmallest()`
- **Statistics**: `.describe()`, `.mean()`, `.value_counts()`, `.corr()`
- **Inspection**: `.shape`, `.info()`, `.head()`, `.isnull().sum()`
- **Renaming**: `.rename()`, `.set_index()`, `.reset_index()`

**Section 3: Data Loading & File Formats** picks up from here. Instead of hardcoded dicts, you will load DataFrames from CSV, JSON, Excel, and Parquet files — the formats you encounter in real data engineering work.

---

## Key Takeaways

- A data engineering workflow with pandas: load → inspect (shape + info) → clean types → filter → transform → aggregate → write
- The orders dataset illustrated: type detection (object vs datetime), derived columns (total_price), category analysis (value_counts + filtered mean), and clean index management
- Every pandas operation is a building block — real pipelines chain these operations sequentially

---

[Back to Course Overview](./README.md) | [Next Section: Data Loading & File Formats →](../03-data-loading-file-formats/lesson-01-reading-csv-files.md)
