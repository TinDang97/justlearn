# Lesson 8: Nested Data Structures

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Create and navigate lists of dicts, dicts of lists, and deeper nesting
- Access nested data with chained indexing
- Process JSON-like data structures
- Transform nested data with comprehensions

---

## Prerequisites

- Lessons 1-7: All data structures

---

## Lesson Outline

### Part 1: Lists of Dicts (30 minutes)

#### Explanation

The most common nested structure in real applications: a list of records, where each record is a dict.

```python
# List of student records (like database rows):
students = [
    {"id": 1, "name": "Alice", "age": 20, "gpa": 3.9, "courses": ["Python", "Math"]},
    {"id": 2, "name": "Bob", "age": 22, "gpa": 3.5, "courses": ["Python", "English"]},
    {"id": 3, "name": "Carol", "age": 19, "gpa": 3.8, "courses": ["Chemistry"]},
]

# Accessing:
print(students[0]["name"])           # Alice
print(students[1]["courses"][0])     # Python
print(len(students))                 # 3

# Iterating:
for student in students:
    print(f"{student['name']}: GPA {student['gpa']}")

# Finding:
alice = next((s for s in students if s["name"] == "Alice"), None)

# Filtering:
honor_roll = [s for s in students if s["gpa"] >= 3.7]

# Sorting:
by_gpa = sorted(students, key=lambda s: s["gpa"], reverse=True)
```

#### Examples

```python
# Product catalog:
catalog = [
    {"sku": "PY001", "name": "Python Book", "price": 29.99, "stock": 50, "category": "education"},
    {"sku": "PY002", "name": "USB Keyboard", "price": 49.99, "stock": 0, "category": "hardware"},
    {"sku": "PY003", "name": "Coffee Mug", "price": 12.99, "stock": 100, "category": "merchandise"},
]

# In-stock products sorted by price:
in_stock = sorted([p for p in catalog if p["stock"] > 0], key=lambda p: p["price"])

# Category totals:
by_category = {}
for product in catalog:
    cat = product["category"]
    by_category.setdefault(cat, {"count": 0, "total_value": 0.0})
    by_category[cat]["count"] += 1
    by_category[cat]["total_value"] += product["price"] * product["stock"]
```

#### Practice

Process the product catalog: find all out-of-stock items, calculate total inventory value, find the most expensive item per category.

---

### Part 2: Dicts of Dicts and Complex Nesting (30 minutes)

#### Explanation

```python
# Dict of dicts (user profiles keyed by username):
users = {
    "alice": {
        "email": "alice@example.com",
        "age": 28,
        "preferences": {"theme": "dark", "notifications": True},
        "roles": ["admin", "editor"],
    },
    "bob": {
        "email": "bob@example.com",
        "age": 32,
        "preferences": {"theme": "light", "notifications": False},
        "roles": ["viewer"],
    },
}

# Accessing nested:
print(users["alice"]["email"])                    # alice@example.com
print(users["alice"]["preferences"]["theme"])     # dark
print(users["bob"]["roles"][0])                   # viewer

# Safe nested access:
alice_notify = users.get("alice", {}).get("preferences", {}).get("notifications", True)

# Modifying nested:
users["alice"]["preferences"]["theme"] = "light"
users["bob"]["roles"].append("editor")
```

**Deep nesting - when to reconsider:**
```python
# If you find yourself writing: data[0]["users"][2]["address"]["city"]
# Consider: should this be a class? A function? A flatter structure?
# 3 levels is usually fine. 4+ levels is often a design problem.
```

#### Examples

```python
# Grade book: {teacher: {student: {subject: grade}}}
grade_book = {
    "Ms. Smith": {
        "Alice": {"Math": 92, "Science": 88, "English": 90},
        "Bob": {"Math": 78, "Science": 82, "English": 75},
    },
    "Mr. Jones": {
        "Carol": {"History": 95, "Art": 88},
        "David": {"History": 82, "Art": 91},
    }
}

# Get all students:
all_students = [student for teacher_students in grade_book.values()
                for student in teacher_students.keys()]

# Get Alice's math grade:
alice_math = grade_book["Ms. Smith"]["Alice"]["Math"]
```

#### Practice

Build a company org chart: department → list of {name, title, salary}. Query: all employees, by department, salary stats.

---

### Part 3: JSON-Like Data Processing (30 minutes)

#### Explanation

Real-world data from APIs, databases, and files often looks like Python's nested structures (that's no coincidence - JSON maps directly to Python dicts and lists).

```python
import json

# JSON string to Python:
json_str = '{"name": "Alice", "age": 28, "scores": [92, 85, 90]}'
data = json.loads(json_str)   # Loads = Load String
print(data["name"])    # Alice
print(data["scores"])  # [92, 85, 90]

# Python to JSON:
person = {"name": "Bob", "age": 30, "active": True}
json_str = json.dumps(person)           # Dumps = Dump String
pretty = json.dumps(person, indent=2)   # Pretty-print
print(pretty)
```

**Safely navigating unknown nested data:**
```python
api_response = {
    "status": "success",
    "data": {
        "user": {
            "profile": {
                "name": "Alice",
                "address": None
            }
        }
    }
}

# Safe deep access:
name = api_response.get("data", {}).get("user", {}).get("profile", {}).get("name")
address = api_response.get("data", {}).get("user", {}).get("profile", {}).get("address", "Not provided")
```

#### Practice

Process a simulated API response (nested dict) to extract specific fields and display a summary.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Social Network Data

Model and process a social network:
```python
network = {
    "users": [
        {"id": 1, "name": "Alice", "friends": [2, 3], "posts": [...]},
        ...
    ]
}
# Find mutual friends, friend count, most active user
```

#### Exercise 2: E-commerce Order System

Design and process order data:
```python
orders = [
    {
        "order_id": "ORD-001",
        "customer": {"name": "Alice", "email": "..."},
        "items": [{"product": "...", "qty": 2, "price": 29.99}],
        "status": "shipped"
    }
]
# Total revenue, items per order, customers with multiple orders
```

#### Bonus Challenge

**Data flattener:** Write a recursive function that "flattens" any deeply nested dict into a flat dict with dot-notation keys. `{"a": {"b": {"c": 1}}}` → `{"a.b.c": 1}`.

---

## Key Takeaways

- List of dicts = database table rows (most common real-world structure)
- Dict of dicts = keyed records (user profiles, config)
- Access nested: `data[0]["name"]["first"]`
- Safe deep access: `.get()` chaining
- `json.loads()` converts JSON string to Python; `json.dumps()` does reverse
- Keep nesting depth ≤ 3 levels; deeper suggests redesign

---

## Homework

1. Scrape (or hardcode) a "menu" for a restaurant as nested data structure, then build a function to display it formatted
2. Research: What is a "data class" in Python? How does it compare to dicts of dicts?

---

[← Previous](./lesson-07-sets.md) | [Back to Course](./README.md) | [Next →](./lesson-09-choosing-right-structure.md)
