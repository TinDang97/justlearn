# Lesson 4: Flattening Nested JSON

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain why nested JSON creates problems for tabular analysis
- Use `pd.json_normalize()` to flatten nested dicts into flat columns
- Use `record_path` to expand arrays nested within objects
- Use `meta` to preserve top-level fields alongside flattened nested arrays
- Decide when to normalize vs when to keep nested structure

---

## Prerequisites

- Lesson 3: Reading JSON Files

---

## Lesson Outline

### Part 1: The Problem with Nested JSON (10 minutes)

#### Explanation

When you load `products.json` with `pd.read_json()`, the `specs` field — which is a nested object — becomes a Python dict in each cell:

```python
import pandas as pd

df = pd.read_json('data/products.json')
print(df['specs'].iloc[0])
# {'weight_kg': 1.8, 'warranty_years': 2}

print(df['specs'].dtype)
# object
```

This means you **cannot** filter by `weight_kg`:

```python
# This fails — pandas sees dicts, not floats
df[df['specs']['weight_kg'] > 1.0]  # KeyError or wrong result
```

You also cannot aggregate, sort, or export the nested field cleanly. The nested structure has to be **flattened** — expanded into separate columns — before you can do any meaningful analysis.

This is the core problem `pd.json_normalize()` solves.

---

### Part 2: `pd.json_normalize()` (15 minutes)

#### Explanation

`pd.json_normalize()` takes a **list of dicts** (not a DataFrame) and flattens nested dicts into columns. The column names use a separator between the parent key and the child key.

```python
import pandas as pd
import json

# Load the raw JSON as a Python list (not a DataFrame)
with open('data/products.json') as f:
    products = json.load(f)

# Normalize: flattens nested 'specs' dict
df = pd.json_normalize(products)
print(df.columns.tolist())
# ['product_id', 'name', 'category', 'price', 'in_stock',
#  'specs.weight_kg', 'specs.warranty_years']
```

The nested keys become `specs.weight_kg` and `specs.warranty_years` — the parent key and child key joined by `.` (the default separator).

Now you can filter and aggregate normally:

```python
# Filter products over 1kg
heavy = df[df['specs.weight_kg'] > 1.0]
print(heavy[['name', 'specs.weight_kg']])
```

**Inline normalization without a file:**

```python
import pandas as pd

records = [
    {"id": 1, "name": "Alice", "address": {"city": "Paris", "zip": "75001"}},
    {"id": 2, "name": "Bob",   "address": {"city": "Lyon",  "zip": "69001"}},
]

df = pd.json_normalize(records)
print(df)
#    id   name  address.city  address.zip
# 0   1  Alice         Paris        75001
# 1   2    Bob          Lyon        69001
```

**Deeply nested structures** — `json_normalize` handles arbitrary nesting depth:

```python
records = [
    {"id": 1, "location": {"country": {"code": "FR", "name": "France"}}}
]
df = pd.json_normalize(records)
# Columns: id, location.country.code, location.country.name
```

---

### Part 3: Handling Mixed Depth — `meta` Parameter (10 minutes)

#### Explanation

A common JSON pattern is an object with top-level fields and a nested **array** of child records:

```json
{
  "order_id": "O001",
  "customer": "Alice",
  "items": [
    {"product": "Laptop", "qty": 1},
    {"product": "Mouse",  "qty": 2}
  ]
}
```

Here you want each item in `items` to become its own row, with `order_id` and `customer` repeated alongside it.

**`record_path`** specifies which nested array to expand:
**`meta`** specifies top-level fields to include alongside each expanded row:

```python
import pandas as pd

orders = [
    {
        "order_id": "O001",
        "customer": "Alice",
        "items": [
            {"product": "Laptop", "qty": 1},
            {"product": "Mouse",  "qty": 2}
        ]
    },
    {
        "order_id": "O002",
        "customer": "Bob",
        "items": [
            {"product": "Keyboard", "qty": 1}
        ]
    }
]

df = pd.json_normalize(
    orders,
    record_path='items',          # expand the 'items' array
    meta=['order_id', 'customer'] # bring these top-level fields along
)
print(df)
#     product  qty order_id customer
# 0    Laptop    1     O001    Alice
# 1     Mouse    2     O001    Alice
# 2  Keyboard    1     O002      Bob
```

This pattern is extremely common when APIs return "one-to-many" structures (one order with many line items, one user with many events, etc.).

---

### Part 4: Separators and When to Normalize (10 minutes)

#### Explanation

**Changing the separator** with the `sep` parameter:

By default, nested key levels are joined with `.`. Change it with `sep`:

```python
import pandas as pd
import json

with open('data/products.json') as f:
    products = json.load(f)

# Use double underscore as separator
df = pd.json_normalize(products, sep='__')
print(df.columns.tolist())
# ['product_id', 'name', 'category', 'price', 'in_stock',
#  'specs__weight_kg', 'specs__warranty_years']
```

Double underscore is common in systems where column names with dots cause issues (e.g., SQL column names, some ORM frameworks).

**When to normalize vs when to keep nested:**

| Scenario | Recommendation |
|----------|---------------|
| You will filter, aggregate, or export the nested fields | Normalize with `json_normalize()` |
| You are loading into a relational database or DataFrame for analytics | Normalize |
| You are storing in a document database (MongoDB, Firestore) | Keep nested |
| You are passing the data through a pipeline without analyzing the nested fields | Keep nested for now, normalize at the analysis step |
| The nested array has variable length per record (one-to-many) | Normalize with `record_path` + `meta` |

**Normalization creates rows**, not just columns. When you expand a `record_path` array, the result has more rows than the input — one per array element. Make sure downstream code expects this.

---

## Practice

<PracticeBlock
  prompt="Use pd.json_normalize() on the products JSON list to flatten the 'specs' nested dict. The result should have columns 'specs.weight_kg' and 'specs.warranty_years'. Print the normalized DataFrame."
  initialCode={`import pandas as pd
import json

products = [
  {"product_id": "P001", "name": "Laptop", "category": "Electronics", "price": 1200.00, "in_stock": True, "specs": {"weight_kg": 1.8, "warranty_years": 2}},
  {"product_id": "P002", "name": "Mouse", "category": "Accessories", "price": 25.00, "in_stock": True, "specs": {"weight_kg": 0.1, "warranty_years": 1}},
  {"product_id": "P003", "name": "Keyboard", "category": "Accessories", "price": 75.00, "in_stock": False, "specs": {"weight_kg": 0.8, "warranty_years": 1}},
  {"product_id": "P004", "name": "Monitor", "category": "Electronics", "price": 350.00, "in_stock": True, "specs": {"weight_kg": 4.5, "warranty_years": 3}},
]

df = pd.json_normalize(___)
print(df.columns.tolist())
print(df[['name', 'specs.weight_kg', 'specs.warranty_years']])
`}
  hint="Pass the products list directly to pd.json_normalize(). No extra parameters needed for simple nested dicts."
  solution={`import pandas as pd
import json

products = [
  {"product_id": "P001", "name": "Laptop", "category": "Electronics", "price": 1200.00, "in_stock": True, "specs": {"weight_kg": 1.8, "warranty_years": 2}},
  {"product_id": "P002", "name": "Mouse", "category": "Accessories", "price": 25.00, "in_stock": True, "specs": {"weight_kg": 0.1, "warranty_years": 1}},
  {"product_id": "P003", "name": "Keyboard", "category": "Accessories", "price": 75.00, "in_stock": False, "specs": {"weight_kg": 0.8, "warranty_years": 1}},
  {"product_id": "P004", "name": "Monitor", "category": "Electronics", "price": 350.00, "in_stock": True, "specs": {"weight_kg": 4.5, "warranty_years": 3}},
]

df = pd.json_normalize(products)
print(df.columns.tolist())
print(df[['name', 'specs.weight_kg', 'specs.warranty_years']])
`}
/>

<PracticeBlock
  prompt="Normalize the same products list but use '__' (double underscore) as the separator instead of '.'. Print the column names to verify the result."
  initialCode={`import pandas as pd

products = [
  {"product_id": "P001", "name": "Laptop", "price": 1200.00, "specs": {"weight_kg": 1.8, "warranty_years": 2}},
  {"product_id": "P002", "name": "Mouse", "price": 25.00, "specs": {"weight_kg": 0.1, "warranty_years": 1}},
  {"product_id": "P003", "name": "Keyboard", "price": 75.00, "specs": {"weight_kg": 0.8, "warranty_years": 1}},
]

df = pd.json_normalize(products, sep=___)
print(df.columns.tolist())
# Should show 'specs__weight_kg' and 'specs__warranty_years'
`}
  hint="Pass sep='__' to pd.json_normalize()."
  solution={`import pandas as pd

products = [
  {"product_id": "P001", "name": "Laptop", "price": 1200.00, "specs": {"weight_kg": 1.8, "warranty_years": 2}},
  {"product_id": "P002", "name": "Mouse", "price": 25.00, "specs": {"weight_kg": 0.1, "warranty_years": 1}},
  {"product_id": "P003", "name": "Keyboard", "price": 75.00, "specs": {"weight_kg": 0.8, "warranty_years": 1}},
]

df = pd.json_normalize(products, sep='__')
print(df.columns.tolist())
# ['product_id', 'name', 'price', 'specs__weight_kg', 'specs__warranty_years']
`}
/>

---

## Key Takeaways

- `pd.read_json()` stores nested dicts as Python `object` dtype — you cannot filter or aggregate them
- `pd.json_normalize()` flattens nested dicts into flat columns with `parent.child` naming
- The `sep` parameter changes the join character (use `'__'` when dots cause issues)
- `record_path` expands a nested array into one row per array element
- `meta` carries top-level fields alongside each expanded array element
- Normalize for analytics; keep nested for document storage

---

## Common Mistakes

- **Passing a DataFrame to `json_normalize()`.** It expects a list of dicts. Either load with `json.load()` directly, or use `df.to_dict('records')` to convert back.
- **Forgetting `meta` when using `record_path`.** Without `meta`, you lose the parent-level context that identifies which record each child row belongs to.
- **Not accounting for row multiplication.** A `record_path` expansion can produce many more rows than the input. Downstream code must expect this.

---

## Next Lesson Preview

In **Lesson 5: Reading Excel Files**, we cover:
- Why data engineers must handle Excel files (finance, HR, legacy systems)
- `pd.read_excel()` and the `sheet_name` parameter
- Loading multi-sheet workbooks

---

[Back to Section Overview](./README.md) | [Next Lesson: Reading Excel Files →](./lesson-05-reading-excel-files.md)
