# Lesson 3: Reading JSON Files

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain when JSON appears in data engineering workflows
- Load flat JSON arrays into DataFrames with `pd.read_json()`
- Use the `orient` parameter to handle different JSON shapes
- Load JSON from both file paths and in-memory strings

---

## Prerequisites

- Lesson 1: Reading CSV Files with pandas
- Basic Python knowledge: lists and dictionaries

---

## Lesson Outline

### Part 1: JSON in Data Engineering (8 minutes)

#### Explanation

**JSON (JavaScript Object Notation)** is the dominant format for data exchange on the web. You encounter it in:

- **REST API responses** — nearly every web service returns JSON: weather APIs, payment APIs, social media APIs, internal microservices
- **Event logs** — clickstream data, application logs, IoT sensor readings
- **Configuration files** — package.json, settings files, pipeline definitions
- **Document databases** — MongoDB, Firestore, DynamoDB all store data as JSON documents

A simple JSON array of objects looks like this:

```json
[
  {"order_id": "O001", "customer": "Alice", "total": 1200.00},
  {"order_id": "O002", "customer": "Bob", "total": 50.00}
]
```

This maps naturally to a DataFrame: each object is a row, each key is a column.

The challenge in DE work is that JSON from real APIs is often **nested** — objects within objects, arrays within objects. We cover that in Lesson 4. This lesson focuses on the straightforward flat case.

<Info>
When consuming REST APIs, responses are often JSON arrays of objects. `pd.read_json()` with `orient='records'` handles this directly — no manual iteration needed.
</Info>

---

### Part 2: `pd.read_json()` for Arrays of Objects (10 minutes)

#### Explanation

`pd.read_json()` is the pandas function for loading JSON data. The simplest case — a JSON array of flat objects — loads directly:

```python
import pandas as pd

df = pd.read_json('data/products.json')
print(df.head())
```

pandas reads each JSON object as a row and each key as a column.

**Loading from a file vs a string:**

```python
# From a file path (same as pd.read_csv)
df = pd.read_json('data/products.json')

# From a JSON string (useful when you get data from an API)
json_string = '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]'
df = pd.read_json(json_string)
```

**What pandas infers:**

```python
df = pd.read_json('data/products.json')
print(df.dtypes)
# product_id     object
# name           object
# category       object
# price         float64
# in_stock         bool
# specs          object   <-- nested dict stored as a Python object
```

Notice that `in_stock` is correctly parsed as boolean, and `price` as float. JSON preserves type information (strings, numbers, booleans, null) — unlike CSV, which stores everything as text. This is one of JSON's advantages.

The `specs` column contains Python dicts — one per row. That is the nested structure problem, which Lesson 4 solves.

---

### Part 3: The `orient` Parameter (12 minutes)

#### Explanation

JSON does not have a single canonical shape. The same data can be stored in multiple ways:

**`orient='records'`** — array of objects (most common from web APIs):
```json
[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
```

**`orient='index'`** — dict where keys are row labels:
```json
{"0": {"id": 1, "name": "Alice"}, "1": {"id": 2, "name": "Bob"}}
```

**`orient='columns'`** — dict where keys are column names (pandas default export format):
```json
{"id": {"0": 1, "1": 2}, "name": {"0": "Alice", "1": "Bob"}}
```

**`orient='values'`** — array of arrays (no column names):
```json
[[1, "Alice"], [2, "Bob"]]
```

**`orient='split'`** — explicit columns + data (useful for round-tripping with pandas):
```json
{"columns": ["id", "name"], "index": [0, 1], "data": [[1, "Alice"], [2, "Bob"]]}
```

**Practical guidance:**

- API responses: use `orient='records'` (or omit — pandas detects it for top-level arrays)
- Pandas-to-pandas round trips: use `orient='split'` (lossless)
- When in doubt: inspect the JSON structure, then pick the matching `orient`

```python
import pandas as pd

# Most common: records format from a REST API
json_records = '[{"id": 1, "value": 42}, {"id": 2, "value": 87}]'
df = pd.read_json(json_records, orient='records')

# Columns format (what pd.to_json() produces by default)
json_cols = '{"id": {"0": 1, "1": 2}, "value": {"0": 42, "1": 87}}'
df = pd.read_json(json_cols, orient='columns')
```

---

### Part 4: Loading from String vs File Path (10 minutes)

#### Explanation

`pd.read_json()` accepts either a file path or a raw JSON string — the function signature is identical.

```python
import pandas as pd

# From file
df_file = pd.read_json('data/products.json')

# From string (same result if content matches)
import json
with open('data/products.json') as f:
    content = f.read()
df_string = pd.read_json(content)

# From an API response (requests library)
import requests
response = requests.get('https://api.example.com/products')
df_api = pd.read_json(response.text)
# or: pd.read_json(response.content) for bytes
```

**Handling `lines=True` — JSON Lines format:**

Some systems write one JSON object per line (no surrounding array brackets). This is called JSON Lines or NDJSON:

```
{"id": 1, "name": "Alice"}
{"id": 2, "name": "Bob"}
```

Load it with `lines=True`:
```python
df = pd.read_json('data/events.jsonl', lines=True)
```

---

## Practice

<PracticeBlock
  prompt="Load the products.json file with pd.read_json('data/products.json'). Print head() and dtypes. Notice what dtype the 'specs' column has — it contains nested dictionaries."
  initialCode={`import pandas as pd

df = pd.read_json('data/products.json')
print("First rows:")
print(df.head())
print()
print("Dtypes:")
print(df.dtypes)
print()
# What is in the specs column?
print("specs column sample:")
print(df['specs'].iloc[0])
`}
  hint="The specs column dtype will be 'object' — pandas stores dicts as Python objects. iloc[0] shows the first value."
  solution={`import pandas as pd

df = pd.read_json('data/products.json')
print("First rows:")
print(df.head())
print()
print("Dtypes:")
print(df.dtypes)
print()
print("specs column sample (it contains a Python dict):")
print(df['specs'].iloc[0])
print(type(df['specs'].iloc[0]))
`}
/>

<PracticeBlock
  prompt="Create a JSON string representing 3 sales records (with keys: sale_id, rep, amount) and load it into a DataFrame using pd.read_json with orient='records'."
  initialCode={`import pandas as pd

json_string = '''[
  {"sale_id": "S001", "rep": "Alice", "amount": 1500},
  {"sale_id": "S002", "rep": "Bob", "amount": 2200},
  {"sale_id": "S003", "rep": "Charlie", "amount": 980}
]'''

df = pd.read_json(___, orient=___)
print(df)
print()
print("Shape:", df.shape)
`}
  hint="Pass json_string as the first argument and 'records' as orient."
  solution={`import pandas as pd

json_string = '''[
  {"sale_id": "S001", "rep": "Alice", "amount": 1500},
  {"sale_id": "S002", "rep": "Bob", "amount": 2200},
  {"sale_id": "S003", "rep": "Charlie", "amount": 980}
]'''

df = pd.read_json(json_string, orient='records')
print(df)
print()
print("Shape:", df.shape)
`}
/>

---

## Key Takeaways

- JSON is the dominant format for web APIs and event logs — you will use `pd.read_json()` frequently
- A flat JSON array of objects loads directly into a DataFrame with correct types (bool, float, string) — better type preservation than CSV
- The `orient` parameter tells pandas which JSON shape to expect; `'records'` is most common for API data
- `lines=True` handles JSON Lines format (one object per line, no array brackets)
- Nested JSON (objects within objects) loads as `object` dtype — flatten it with `pd.json_normalize()` (Lesson 4)

---

## Common Mistakes

- **Not checking the `specs` column type.** When a JSON field is a nested object, pandas stores it as a Python dict in an `object` column — you cannot filter or aggregate it directly. Use `json_normalize` instead.
- **Omitting `orient` when the JSON shape is not a top-level array.** If your JSON is a dict of columns, `orient='columns'` is required or pandas will misinterpret the structure.
- **Confusing JSON Lines and JSON Array.** Standard JSON (`[{}, {}]`) and JSON Lines (`{}\n{}`) look similar but require different loading approaches.

---

## Next Lesson Preview

In **Lesson 4: Flattening Nested JSON**, we cover:
- Why nested JSON creates analysis problems
- `pd.json_normalize()` to flatten dicts into flat columns
- Handling arrays nested inside objects with `record_path`

---

[Back to Section Overview](./README.md) | [Next Lesson: Flattening Nested JSON →](./lesson-04-normalizing-json.md)
