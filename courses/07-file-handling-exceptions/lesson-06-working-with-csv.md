# Lesson 6: Working with CSV

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Read CSV files using `csv.reader` and `csv.DictReader`
- Write CSV files using `csv.writer` and `csv.DictWriter`
- Handle CSV edge cases (quoted fields, different delimiters)
- Process real-world CSV data

---

## Lesson Outline

### Part 1: Reading CSV Files (30 minutes)

#### Explanation

```python
import csv

# Basic csv.reader:
with open("students.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)   # First row is header
    print(header)           # ['name', 'age', 'gpa']

    for row in reader:
        name, age, gpa = row
        print(f"{name}: GPA {gpa}")


# DictReader - rows as dicts (using header names):
with open("students.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    students = list(reader)

# Each row is a dict:
for student in students:
    print(student["name"], student["gpa"])


# Custom delimiter (TSV, pipe-separated):
with open("data.tsv", "r", newline="") as f:
    reader = csv.reader(f, delimiter="\t")   # Tab-separated
    for row in reader:
        print(row)
```

**Why `newline=""` in CSV?** The `csv` module handles newlines internally. Passing `newline=""` prevents double newline translation on Windows.

#### Practice

Read a CSV file of products (name, price, category) and calculate total value per category.

---

### Part 2: Writing CSV Files (30 minutes)

#### Explanation

```python
import csv

# csv.writer:
students = [
    ("Alice", 20, 3.9),
    ("Bob", 22, 3.5),
    ("Carol", 21, 3.7),
]

with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "age", "gpa"])   # Header
    writer.writerows(students)                 # All rows at once


# DictWriter - write from dicts:
students = [
    {"name": "Alice", "age": 20, "gpa": 3.9},
    {"name": "Bob", "age": 22, "gpa": 3.5},
]

fieldnames = ["name", "age", "gpa"]
with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()     # Write header row
    writer.writerows(students)


# CSV with quoted fields (handles commas in values):
data = [["Alice Smith", "New York, NY", "3.9"]]
with open("output.csv", "w", newline="") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerows(data)
# Output: Alice Smith,"New York, NY",3.9
```

#### Practice

Write a function that exports a list of dictionaries to CSV, auto-detecting fieldnames from the first dictionary.

---

### Part 3: CSV Processing Patterns (30 minutes)

#### Explanation

```python
import csv
from typing import Iterator

# Generator for large files (memory efficient):
def read_large_csv(filepath: str) -> Iterator[dict]:
    with open(filepath, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row   # Yield one row at a time


# Filter and transform CSV:
def process_sales_csv(input_path: str, output_path: str, min_amount: float):
    with open(input_path, newline="") as infile, \
         open(output_path, "w", newline="") as outfile:

        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + ["total"]
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            amount = float(row["amount"])
            if amount >= min_amount:
                row["total"] = f"{amount * 1.1:.2f}"  # Add tax
                writer.writerow(row)


# Aggregate CSV data:
def summarize_by_category(filepath: str) -> dict:
    totals = {}
    with open(filepath, newline="") as f:
        for row in csv.DictReader(f):
            category = row["category"]
            amount = float(row["amount"])
            totals[category] = totals.get(category, 0) + amount
    return totals
```

#### Practice

Write a CSV transformation pipeline: read a sales CSV, add a "profit" column (revenue - cost), filter rows where profit > 100, write to new CSV.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Grade Book

Given a CSV with columns: `student_name, math, science, english, history`:
1. Read all grades
2. Calculate average for each student
3. Find top student per subject
4. Write results to a new summary CSV

#### Exercise 2: Data Cleaning

Given a messy CSV (mixed case headers, extra spaces, empty rows):
- Normalize headers to lowercase with underscores
- Strip whitespace from values
- Skip empty rows
- Write cleaned data to new file

---

## Key Takeaways

- Always use `newline=""` when opening CSV files
- `DictReader`/`DictWriter` make code clearer with named columns
- Use generators for large CSV files to avoid loading all into memory
- `csv.writer` handles quoting automatically (commas in values are safe)
- Specify `encoding="utf-8"` to handle international characters

---

[← Previous](./lesson-05-exception-handling-patterns.md) | [Back to Course](./README.md) | [Next →](./lesson-07-working-with-json.md)
