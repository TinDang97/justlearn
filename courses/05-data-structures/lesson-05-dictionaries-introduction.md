# Lesson 5: Dictionaries Introduction

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Create dictionaries and access values by key
- Add, modify, and delete key-value pairs
- Use `.get()` for safe access
- Understand when to use dicts over lists

---

## Prerequisites

- Lessons 1-4: Lists and Tuples

---

## Lesson Outline

### Part 1: Dictionary Basics (30 minutes)

#### Explanation

A **dictionary** stores data as **key-value pairs**. Unlike lists (which use integer indexes), dicts let you use meaningful keys.

**Analogy:** A real dictionary. You look up a word (the key) to find its definition (the value). The words are unique - you can't have the same word twice.

```python
# Creating dictionaries
empty = {}
person = {"name": "Alice", "age": 28, "city": "New York"}
grades = {"math": 92, "english": 85, "science": 90}
mixed = {1: "one", "two": 2, (1, 2): "tuple key"}  # Keys can be any hashable type

# Access by key:
print(person["name"])   # Alice
print(grades["math"])   # 92

# KeyError if key doesn't exist:
# print(person["phone"])   → KeyError: 'phone'

# Safe access with .get():
phone = person.get("phone")          # None (no error)
phone = person.get("phone", "N/A")   # "N/A" (default value)
```

**Dict characteristics:**
- Keys must be unique and hashable (str, int, tuple - not list!)
- Values can be anything
- Since Python 3.7+: dicts preserve insertion order
- O(1) lookup - finding a value by key is instant regardless of dict size

#### Examples

```python
# Student record
student = {
    "id": "STU-001",
    "name": "Alice Johnson",
    "age": 20,
    "email": "alice@university.edu",
    "gpa": 3.85,
    "enrolled": True,
    "courses": ["Python 101", "Data Science", "Web Dev"],  # Value can be a list!
}

print(f"Name: {student['name']}")
print(f"GPA: {student['gpa']}")
print(f"Courses: {', '.join(student['courses'])}")

# Nested access:
print(f"First course: {student['courses'][0]}")
```

#### Practice

Create a dictionary for a product. Access, display all fields. Use `.get()` for optional fields.

---

### Part 2: Modifying Dictionaries (30 minutes)

#### Explanation

```python
contact = {"name": "Bob", "email": "bob@example.com"}

# Adding new key-value pair:
contact["phone"] = "555-1234"
contact["city"] = "Chicago"

# Modifying existing value:
contact["email"] = "new_bob@example.com"

# Removing:
del contact["city"]              # Remove key-value pair
phone = contact.pop("phone")     # Remove and return value
phone = contact.pop("phone", None)  # Remove safely (no KeyError)

# Check if key exists:
if "name" in contact:
    print(contact["name"])

if "phone" not in contact:
    print("No phone number")

# Update multiple values at once:
contact.update({"age": 25, "city": "Boston", "email": "bob@newmail.com"})

# Merge dicts (Python 3.9+):
defaults = {"role": "user", "active": True}
user_data = {"name": "Bob", "age": 25}
merged = {**defaults, **user_data}  # Unpack and merge
```

#### Examples

```python
# Shopping cart as dictionary {item_name: quantity}
cart = {}

def add_to_cart(item, quantity=1):
    cart[item] = cart.get(item, 0) + quantity

def remove_from_cart(item):
    return cart.pop(item, None)

add_to_cart("apples", 3)
add_to_cart("bread", 1)
add_to_cart("apples", 2)  # Now 5 apples

print(cart)  # {'apples': 5, 'bread': 1}
```

#### Practice

Build a word counter: read a text, count each word's occurrences using a dict (use `.get()` pattern).

---

### Part 3: Dictionary from Sequences (30 minutes)

#### Explanation

```python
# dict() constructor:
person = dict(name="Alice", age=28, city="NYC")

# From list of key-value pairs:
pairs = [("a", 1), ("b", 2), ("c", 3)]
d = dict(pairs)

# From two lists using zip:
keys = ["name", "age", "city"]
values = ["Alice", 28, "NYC"]
person = dict(zip(keys, values))

# Dict comprehension:
squares = {n: n**2 for n in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Invert a dictionary (swap keys and values):
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
# {1: "a", 2: "b", 3: "c"}
```

#### Practice

Create a "phone book" dict from two separate lists (names and phone numbers) using zip.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Student Grade Book

```python
# Build a grade book as a dict of dicts:
grade_book = {
    "Alice": {"math": 92, "english": 85, "science": 90},
    "Bob": {"math": 78, "english": 91, "science": 83},
}

# Operations:
# 1. Add a new student
# 2. Add a new subject grade for existing student
# 3. Calculate each student's average
# 4. Find top student per subject
# 5. Display formatted report
```

#### Exercise 2: Inventory Manager

Build a product inventory:
- Stock levels (product → quantity)
- Restock (add quantity)
- Sell (reduce quantity, prevent negative)
- Low stock alert (below threshold)
- Total inventory value (need price dict too)

#### Bonus Challenge

**Frequency analyzer:** Read a text, build a word frequency dict, find top-10 words, display as a bar chart using print statements.

---

## Key Takeaways

- `{key: value}` - dictionary literal
- `d[key]` - access; `d.get(key, default)` - safe access
- `d[key] = value` - add/modify; `del d[key]` - delete; `d.pop(key)` - remove+return
- `key in d` - check existence
- `{**d1, **d2}` - merge dicts (Python 3.5+)
- Dict comprehension: `{k: v for k, v in pairs}`
- O(1) lookup makes dicts perfect for counting and lookup tables

---

## Homework

1. Build a "recipe book" as a nested dict (recipe name → {ingredients: [...], steps: [...], time: int})
2. Research: How do Python dicts work internally? (Hash tables - look it up!)

---

[← Previous](./lesson-04-tuples.md) | [Back to Course](./README.md) | [Next →](./lesson-06-dictionary-methods-iteration.md)
