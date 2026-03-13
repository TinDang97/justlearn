# Lesson 6: Dictionary Methods & Iteration

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Iterate over keys, values, and key-value pairs
- Use `.keys()`, `.values()`, `.items()` effectively
- Apply dict comprehensions
- Use `setdefault()` and `update()` for common patterns

---

## Prerequisites

- Lesson 5: Dictionaries Introduction

---

## Lesson Outline

### Part 1: Iterating Over Dictionaries (30 minutes)

#### Explanation

```python
student = {"name": "Alice", "age": 20, "gpa": 3.9}

# Iterating over keys (default):
for key in student:
    print(key)   # name, age, gpa

# .keys() - explicit keys view:
for key in student.keys():
    print(key)

# .values() - values view:
for value in student.values():
    print(value)   # Alice, 20, 3.9

# .items() - key-value pair tuples (most common!):
for key, value in student.items():
    print(f"{key}: {value}")
```

**Views are dynamic:**
```python
d = {"a": 1, "b": 2}
keys_view = d.keys()   # Not a copy - a "live view"

d["c"] = 3
print(keys_view)  # dict_keys(['a', 'b', 'c']) - automatically updated!

# Convert to list if you need a static snapshot:
key_list = list(d.keys())
```

#### Examples

```python
# Scores analysis
scores = {"Alice": 92, "Bob": 78, "Carol": 95, "David": 81}

# Report
print(f"{'Student':<15} {'Score':>6} {'Grade':>6}")
print("-" * 28)
for name, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
    grade = "A" if score >= 90 else "B" if score >= 80 else "C"
    print(f"{name:<15} {score:>6} {grade:>6}")

average = sum(scores.values()) / len(scores)
print(f"\nClass average: {average:.1f}")
print(f"Top student: {max(scores, key=scores.get)}")
```

#### Practice

Process a frequency dict: display as sorted bar chart using print statements.

---

### Part 2: Advanced Dict Methods (30 minutes)

#### Explanation

```python
inventory = {}

# setdefault: set value only if key doesn't exist
inventory.setdefault("apples", 0)       # Creates with 0 if not exists
inventory.setdefault("apples", 100)     # Does nothing - key already exists
inventory["apples"] += 5               # Now can safely increment

# Alternative pattern for counting:
word_count = {}
for word in text.split():
    word_count[word] = word_count.get(word, 0) + 1

# update: merge/update multiple keys at once
settings = {"theme": "light", "font": 12}
settings.update({"theme": "dark", "language": "en"})
# {"theme": "dark", "font": 12, "language": "en"}

# copy: shallow copy
original = {"a": [1, 2], "b": [3, 4]}
copy = original.copy()

# fromkeys: create dict with same value for multiple keys
defaults = dict.fromkeys(["name", "email", "phone"], None)
# {"name": None, "email": None, "phone": None}

# popitem: remove and return last item (Python 3.7+: LIFO)
key, value = settings.popitem()
```

#### Examples

```python
# Word frequency with setdefault:
text = "python is great python is fun python rocks"
freq = {}
for word in text.split():
    freq.setdefault(word, 0)
    freq[word] += 1

# Grouping items:
students = [
    {"name": "Alice", "dept": "CS"},
    {"name": "Bob", "dept": "Math"},
    {"name": "Carol", "dept": "CS"},
    {"name": "David", "dept": "Physics"},
]

by_dept = {}
for s in students:
    by_dept.setdefault(s["dept"], []).append(s["name"])

print(by_dept)
# {'CS': ['Alice', 'Carol'], 'Math': ['Bob'], 'Physics': ['David']}
```

#### Practice

Group a list of transactions by month using setdefault grouping pattern.

---

### Part 3: Dict Comprehensions (30 minutes)

#### Explanation

```python
# Basic dict comprehension:
squares = {n: n**2 for n in range(1, 6)}

# With condition:
even_squares = {n: n**2 for n in range(1, 11) if n % 2 == 0}

# Transform keys or values:
prices = {"apple": 1.50, "banana": 0.75, "cherry": 3.00}

# Apply 20% discount:
discounted = {k: round(v * 0.8, 2) for k, v in prices.items()}

# Invert dict:
inverted = {v: k for k, v in prices.items()}

# Filter by value:
expensive = {k: v for k, v in prices.items() if v > 1.00}

# From two dicts (merge with condition):
a = {"x": 1, "y": 2}
b = {"y": 10, "z": 3}
merged = {**a, **b}  # b values win for duplicates
```

#### Examples

```python
# Processing student data:
students = [
    {"name": "Alice", "grades": [85, 90, 92]},
    {"name": "Bob", "grades": [72, 68, 75]},
    {"name": "Carol", "grades": [95, 98, 92]},
]

# Name → average grade dict:
averages = {
    s["name"]: sum(s["grades"]) / len(s["grades"])
    for s in students
}

# Only above-average students:
class_avg = sum(averages.values()) / len(averages)
above_avg = {name: avg for name, avg in averages.items() if avg >= class_avg}
```

#### Practice

Create comprehensions for: phone book inversion, inventory restock (add 10 to each quantity), filter only in-stock products.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Contact Book

Full contact book with operations:
- Add/update/delete contacts
- Search by name, email, or phone
- Group contacts by city
- Export as formatted text

#### Exercise 2: Vote Counter

Process election results:
- Count votes for each candidate
- Calculate percentages
- Determine winner
- Display ranked results with bar chart

#### Bonus Challenge

**Histogram:** Build a text histogram that reads a file and creates a frequency dict, then displays it as a horizontal bar chart (using stars) sorted by frequency.

---

## Key Takeaways

- `.keys()`, `.values()`, `.items()` return dynamic views
- Iterate with `for k, v in d.items():` (most common pattern)
- `.setdefault(k, default)` - set only if not exists (great for grouping)
- `.update(other)` - merge/update multiple keys
- Dict comprehension: `{k_expr: v_expr for item in iterable if condition}`

---

## Homework

1. Build a "grade book" with letter grade distribution using dict comprehensions
2. Research: What is `collections.defaultdict`? How does it improve the grouping pattern?

---

[← Previous](./lesson-05-dictionaries-introduction.md) | [Back to Course](./README.md) | [Next →](./lesson-07-sets.md)
