# Lesson 10: Mini-Project — Sales Analytics with SQL + pandas

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Build a complete database-backed analytics pipeline
- Use SQLAlchemy to create schema and load seed data with `to_sql()`
- Use `pd.read_sql()` with JOIN and GROUP BY queries for analytics
- Combine SQL aggregation with pandas reshaping and post-processing

---

## Prerequisites

- All previous lessons in this section (01–09)
- Section 2: Pandas Fundamentals (groupby, pivot, pct_change)

---

## Project Overview

You will build a **sales analytics pipeline** for a small e-commerce business. The pipeline:

1. Loads seed data (customers, products, orders) into an in-memory SQLite database
2. Runs SQL queries with JOINs and GROUP BY to extract analytics
3. Applies pandas post-processing (pivoting, MoM growth, cumulative totals)
4. Upserts a new batch of orders and re-runs analytics to verify

Everything runs in-browser with no external files or servers.

---

## Part 1: Project Setup and Schema (30 minutes)

#### Creating the Database and Loading Seed Data

```python
import pandas as pd
from sqlalchemy import create_engine, text

# In-memory SQLite — no file system access needed
engine = create_engine("sqlite:///:memory:", echo=False)

# --- Seed DataFrames ---

customers = pd.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "name":        ["Alice Chen", "Bob Smith", "Carol Park", "Dave Lee", "Eve Wang"],
    "segment":     ["Premium", "Standard", "Premium", "Standard", "Premium"],
    "city":        ["New York", "Chicago", "New York", "Houston", "Seattle"],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103, 104, 105],
    "name":       ["Widget A", "Gadget Pro", "Tool Kit", "Smart Device", "Basic Pack"],
    "category":   ["Hardware", "Electronics", "Hardware", "Electronics", "Accessories"],
    "unit_price": [29.99, 149.99, 49.99, 299.99, 9.99],
})

orders = pd.DataFrame({
    "order_id":    range(1, 21),
    "customer_id": [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5],
    "product_id":  [101,102,103,104,105,102,103,104,105,101,103,104,105,101,102,104,105,101,102,103],
    "quantity":    [2,1,3,1,5,1,2,1,4,1,3,1,2,2,1,1,3,2,1,4],
    "order_date":  pd.date_range("2024-01-15", periods=20, freq="4D").strftime("%Y-%m-%d").tolist(),
})

# --- Load to DB ---
customers.to_sql("customers", engine, if_exists="replace", index=False)
products.to_sql("products",   engine, if_exists="replace", index=False)
orders.to_sql("orders",       engine, if_exists="replace", index=False)

# Verify
with engine.connect() as conn:
    for table in ["customers", "products", "orders"]:
        count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
        print(f"  {table}: {count} rows")

print("\nSchema loaded successfully")
print(f"Date range: {orders['order_date'].min()} to {orders['order_date'].max()}")
```

#### Exploring the Schema

```python
# Preview each table
print("=== Customers ===")
print(pd.read_sql_table("customers", engine))

print("\n=== Products ===")
print(pd.read_sql_table("products", engine))

print("\n=== Orders (first 5) ===")
print(pd.read_sql("SELECT * FROM orders LIMIT 5", engine))
print(f"Total orders: {pd.read_sql('SELECT COUNT(*) AS n FROM orders', engine).iloc[0, 0]}")
```

---

## Part 2: SQL Queries for Analytics (30 minutes)

#### Query 1: Revenue by Customer Segment

```python
revenue_by_segment = pd.read_sql("""
    SELECT
        c.segment,
        COUNT(DISTINCT o.order_id)             AS order_count,
        SUM(o.quantity * p.unit_price)         AS total_revenue,
        ROUND(AVG(o.quantity * p.unit_price), 2) AS avg_order_value
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN products  p ON o.product_id  = p.product_id
    GROUP BY c.segment
    ORDER BY total_revenue DESC
""", engine)

print("=== Revenue by Segment ===")
print(revenue_by_segment.to_string(index=False))
```

#### Query 2: Top Products by Revenue

```python
product_revenue = pd.read_sql("""
    SELECT
        p.name,
        p.category,
        p.unit_price,
        SUM(o.quantity)                  AS units_sold,
        ROUND(SUM(o.quantity * p.unit_price), 2) AS total_revenue
    FROM products p
    LEFT JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.name, p.category, p.unit_price
    ORDER BY total_revenue DESC
""", engine)

print("=== Product Revenue Ranking ===")
print(product_revenue.to_string(index=False))
```

#### Query 3: Monthly Revenue Trend

```python
monthly_revenue = pd.read_sql("""
    SELECT
        strftime('%Y-%m', o.order_date)           AS month,
        c.segment,
        ROUND(SUM(o.quantity * p.unit_price), 2)  AS revenue
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN products  p ON o.product_id  = p.product_id
    GROUP BY month, c.segment
    ORDER BY month, c.segment
""", engine)

print("=== Monthly Revenue by Segment ===")
print(monthly_revenue.to_string(index=False))
```

---

## Part 3: pandas Post-Processing (30 minutes)

#### Revenue Share per Product

```python
# product_revenue DataFrame from Part 2
product_revenue["revenue_pct"] = (
    product_revenue["total_revenue"] / product_revenue["total_revenue"].sum() * 100
).round(1)

product_revenue["cumulative_revenue"] = product_revenue["total_revenue"].cumsum().round(2)

print("=== Product Revenue with Share and Cumulative ===")
print(product_revenue[["name", "category", "total_revenue", "revenue_pct", "cumulative_revenue"]]
      .to_string(index=False))
```

#### Monthly Pivot: Segments as Columns

```python
# monthly_revenue DataFrame from Part 2
pivot = monthly_revenue.pivot(
    index="month",
    columns="segment",
    values="revenue"
).fillna(0)

# Add total column
pivot["Total"] = pivot.sum(axis=1)

print("=== Monthly Revenue Pivot (segments as columns) ===")
print(pivot.to_string())
```

#### Month-over-Month Growth

```python
# Compute MoM growth percentage for each segment
pivot_growth = pivot.copy()
for col in [c for c in pivot.columns if c != "Total"]:
    growth_col = f"{col}_MoM%"
    pivot_growth[growth_col] = pivot[col].pct_change() * 100

# Show months with MoM data (first month has no prior month)
mom_cols = [c for c in pivot_growth.columns if "MoM%" in c]
print("=== Month-over-Month Growth % ===")
print(pivot_growth[mom_cols].round(1).to_string())
```

#### Customer Summary

```python
customer_summary = pd.read_sql("""
    SELECT
        c.name,
        c.segment,
        c.city,
        COUNT(o.order_id)                         AS order_count,
        ROUND(SUM(o.quantity * p.unit_price), 2)  AS lifetime_value
    FROM customers c
    LEFT JOIN orders   o ON c.customer_id = o.customer_id
    LEFT JOIN products p ON o.product_id  = p.product_id
    GROUP BY c.customer_id, c.name, c.segment, c.city
    ORDER BY lifetime_value DESC
""", engine)

# pandas: compute LTV percentile ranking
customer_summary["ltv_rank"] = customer_summary["lifetime_value"].rank(
    ascending=False, method="min"
).astype(int)

print("=== Customer Lifetime Value ===")
print(customer_summary.to_string(index=False))
```

---

## Part 4: Final Output and Reflection (30 minutes)

#### Upsert New Orders and Re-Run Analytics

```python
# New batch of 5 orders (order_ids 21-25)
new_orders = pd.DataFrame({
    "order_id":    [21, 22, 23, 24, 25],
    "customer_id": [1,  3,  5,  2,  4],
    "product_id":  [104, 102, 103, 104, 101],
    "quantity":    [1,   2,   3,   1,   4],
    "order_date":  ["2024-04-01", "2024-04-05", "2024-04-08", "2024-04-10", "2024-04-12"],
})

# Load using INSERT OR REPLACE via raw SQL for upsert semantics
with engine.begin() as conn:
    for _, row in new_orders.iterrows():
        conn.execute(text("""
            INSERT OR REPLACE INTO orders (order_id, customer_id, product_id, quantity, order_date)
            VALUES (:order_id, :customer_id, :product_id, :quantity, :order_date)
        """), row.to_dict())

total_orders = pd.read_sql("SELECT COUNT(*) AS n FROM orders", engine).iloc[0, 0]
print(f"Total orders after upsert: {total_orders}")

# Re-run revenue by segment to verify update
revenue_updated = pd.read_sql("""
    SELECT
        c.segment,
        COUNT(DISTINCT o.order_id) AS order_count,
        ROUND(SUM(o.quantity * p.unit_price), 2) AS total_revenue
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN products  p ON o.product_id  = p.product_id
    GROUP BY c.segment
    ORDER BY total_revenue DESC
""", engine)
print("\n=== Updated Revenue by Segment ===")
print(revenue_updated.to_string(index=False))
```

#### Challenge: Multi-Category Customers

Find customers who have ordered from at least 3 different product categories.

```python
# Approach 1: SQL subquery
sql_approach = pd.read_sql("""
    SELECT
        c.name,
        COUNT(DISTINCT p.category) AS category_count,
        GROUP_CONCAT(DISTINCT p.category) AS categories
    FROM customers c
    JOIN orders   o ON c.customer_id = o.customer_id
    JOIN products p ON o.product_id  = p.product_id
    GROUP BY c.customer_id, c.name
    HAVING category_count >= 3
    ORDER BY category_count DESC
""", engine)

print("=== Customers with 3+ Categories (SQL) ===")
print(sql_approach.to_string(index=False))

# Approach 2: pandas groupby
orders_enriched = pd.read_sql("""
    SELECT o.customer_id, c.name, p.category
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN products  p ON o.product_id  = p.product_id
""", engine)

pandas_approach = (
    orders_enriched
    .groupby(["customer_id", "name"])["category"]
    .nunique()
    .reset_index()
    .rename(columns={"category": "unique_categories"})
    .query("unique_categories >= 3")
    .sort_values("unique_categories", ascending=False)
)
print("\n=== Customers with 3+ Categories (pandas) ===")
print(pandas_approach.to_string(index=False))
```

#### When SQL Shone vs When pandas Was Better

```python
# This cell documents the architectural reflection — run it to see the output

reflections = {
    "SQL was better for": [
        "Multi-table JOINs — databases execute joins efficiently with indexes",
        "GROUP BY aggregations — SUM/COUNT/AVG at the database level",
        "Filtering before Python — WHERE clause reduces data transferred",
        "Upsert logic — INSERT OR REPLACE is atomic at the DB level",
    ],
    "pandas was better for": [
        "pivot() — reshaping data by segment into columns",
        "pct_change() — computing MoM growth across rows",
        "rank() — assigning LTV rankings",
        "cumsum() — building cumulative revenue column",
        "Complex Python logic — any transformation requiring Python functions",
    ],
}

print("=== Reflection: SQL vs pandas ===\n")
for category, items in reflections.items():
    print(f"{category}:")
    for item in items:
        print(f"  - {item}")
    print()
```

---

<PracticeBlock
  prompt="Extend the sales analytics project: write a query that finds the most popular product in each city (the product ordered most often by customers from that city). Use a multi-table JOIN and GROUP BY. Then use pandas to add a column showing each city's top product's unit price."
  initialCode={`import pandas as pd\nfrom sqlalchemy import create_engine, text\n\nengine = create_engine("sqlite:///:memory:", echo=False)\n\n# Reload the seed data\ncustomers = pd.DataFrame({"customer_id": [1,2,3,4,5], "name": ["Alice Chen","Bob Smith","Carol Park","Dave Lee","Eve Wang"], "segment": ["Premium","Standard","Premium","Standard","Premium"], "city": ["New York","Chicago","New York","Houston","Seattle"]})\nproducts  = pd.DataFrame({"product_id": [101,102,103,104,105], "name": ["Widget A","Gadget Pro","Tool Kit","Smart Device","Basic Pack"], "category": ["Hardware","Electronics","Hardware","Electronics","Accessories"], "unit_price": [29.99,149.99,49.99,299.99,9.99]})\norders    = pd.DataFrame({"order_id": range(1,21), "customer_id": [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5], "product_id": [101,102,103,104,105,102,103,104,105,101,103,104,105,101,102,104,105,101,102,103], "quantity": [2,1,3,1,5,1,2,1,4,1,3,1,2,2,1,1,3,2,1,4], "order_date": pd.date_range("2024-01-15", periods=20, freq="4D").strftime("%Y-%m-%d").tolist()})\n\ncustomers.to_sql("customers", engine, if_exists="replace", index=False)\nproducts.to_sql("products",   engine, if_exists="replace", index=False)\norders.to_sql("orders",       engine, if_exists="replace", index=False)\n\n# Write your query here: most popular product per city\n# Then add unit_price via pandas merge\n`}
  hint="GROUP BY c.city, p.product_id, p.name with COUNT(o.order_id) AS times_ordered. Use a subquery or HAVING to keep only the max count per city. Then pd.merge with products to add unit_price."
  solution={`import pandas as pd\nfrom sqlalchemy import create_engine\n\nengine = create_engine("sqlite:///:memory:", echo=False)\n\ncustomers = pd.DataFrame({"customer_id": [1,2,3,4,5], "name": ["Alice Chen","Bob Smith","Carol Park","Dave Lee","Eve Wang"], "segment": ["Premium","Standard","Premium","Standard","Premium"], "city": ["New York","Chicago","New York","Houston","Seattle"]})\nproducts  = pd.DataFrame({"product_id": [101,102,103,104,105], "name": ["Widget A","Gadget Pro","Tool Kit","Smart Device","Basic Pack"], "category": ["Hardware","Electronics","Hardware","Electronics","Accessories"], "unit_price": [29.99,149.99,49.99,299.99,9.99]})\norders    = pd.DataFrame({"order_id": range(1,21), "customer_id": [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5], "product_id": [101,102,103,104,105,102,103,104,105,101,103,104,105,101,102,104,105,101,102,103], "quantity": [2,1,3,1,5,1,2,1,4,1,3,1,2,2,1,1,3,2,1,4], "order_date": pd.date_range("2024-01-15", periods=20, freq="4D").strftime("%Y-%m-%d").tolist()})\n\ncustomers.to_sql("customers", engine, if_exists="replace", index=False)\nproducts.to_sql("products",   engine, if_exists="replace", index=False)\norders.to_sql("orders",       engine, if_exists="replace", index=False)\n\n# Step 1: product count per city\ncity_product = pd.read_sql("""\n    SELECT\n        c.city,\n        p.product_id,\n        p.name AS product_name,\n        COUNT(o.order_id) AS times_ordered\n    FROM orders o\n    JOIN customers c ON o.customer_id = c.customer_id\n    JOIN products  p ON o.product_id  = p.product_id\n    GROUP BY c.city, p.product_id, p.name\n    ORDER BY c.city, times_ordered DESC\n""", engine)\n\n# Step 2: keep most popular per city using pandas\ntop_per_city = (\n    city_product\n    .sort_values("times_ordered", ascending=False)\n    .drop_duplicates(subset="city", keep="first")\n    .reset_index(drop=True)\n)\n\n# Step 3: add unit_price via pandas merge\ntop_per_city = top_per_city.merge(products[["product_id", "unit_price"]], on="product_id", how="left")\n\nprint("Most popular product per city:")\nprint(top_per_city[["city", "product_name", "times_ordered", "unit_price"]].to_string(index=False))`}
/>

---

## Key Takeaways

- `df.to_sql(table, engine, if_exists="replace", index=False)` is the standard way to seed an in-memory database from pandas DataFrames
- `pd.read_sql(sql, engine)` with JOIN + GROUP BY queries delegates aggregation to the database — the most efficient approach for summary analytics
- pandas excels at **reshaping** (`.pivot()`), **time-series math** (`.pct_change()`, `.cumsum()`), and **ranking** (`.rank()`) — operations that SQL handles awkwardly
- Use **SQL for extraction and aggregation**, then **pandas for reshaping and enrichment**: each tool does what it does best
- `INSERT OR REPLACE` provides upsert semantics — re-running ingestion with the same primary keys updates rather than duplicates records

---

## Common Mistakes to Avoid

- **Over-using Python for aggregation**: if you can write `GROUP BY` in SQL, let the database do it — it is faster and uses less Python memory
- **Not verifying row counts after `to_sql()`**: always read back a count to confirm the expected number of rows were written
- **Forgetting `index=False` in `to_sql()`**: the default adds a pandas RangeIndex column which becomes an unwanted `"index"` column in the database

---

[← Previous](./lesson-09-database-patterns.md) | [Back to Course](./README.md) | [Next: Section 8 →](../08-data-quality/lesson-01-data-quality-overview.md)
