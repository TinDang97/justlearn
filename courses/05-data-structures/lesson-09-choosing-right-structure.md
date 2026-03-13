# Lesson 9: Choosing the Right Structure

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Choose the best data structure for each problem type
- Understand the performance characteristics of each structure
- Recognize common anti-patterns (using wrong structure)
- Refactor code to use optimal data structures

---

## Prerequisites

- Lessons 1-8: All data structures

---

## Lesson Outline

### Part 1: Decision Guide (30 minutes)

#### Explanation

| Need | Use | Why |
|------|-----|-----|
| Ordered sequence, need to change it | `list` | Mutable, indexed |
| Ordered sequence, should NOT change | `tuple` | Immutable, hashable |
| Key-value lookup, fast access by key | `dict` | O(1) lookup |
| Unique elements, set operations | `set` | No duplicates, O(1) membership |
| Counting things | `Counter` (collections) | Built for counting |
| Queue (FIFO) | `collections.deque` | O(1) both ends |
| Records with named fields | `namedtuple` or `dataclass` | Readable, typed |

**Quick decision flowchart:**
```
Do you need to look up by key?
  → YES: dict
  → NO: Do you need unique elements?
         → YES: set
         → NO: Does order matter and can it change?
                → ORDERED + MUTABLE: list
                → ORDERED + IMMUTABLE: tuple
```

#### Examples

```python
# WRONG structure → RIGHT structure

# WRONG: List for lookups (O(n) - slow for large data)
users = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
for user in users:           # Scan entire list!
    if user["id"] == 2:
        print(user["name"])

# RIGHT: Dict for lookups (O(1) - instant)
users = {1: {"name": "Alice"}, 2: {"name": "Bob"}}
print(users[2]["name"])   # Instant!

# WRONG: List for checking membership (O(n))
valid_roles = ["admin", "editor", "viewer", "moderator"]
if user_role in valid_roles:   # Scans up to 4 items each time

# RIGHT: Set for membership testing (O(1))
valid_roles = {"admin", "editor", "viewer", "moderator"}
if user_role in valid_roles:   # Instant regardless of set size
```

#### Practice

For each scenario, identify which data structure is best and explain why:
1. Student roster for a class (ordered, need to add/remove)
2. Configuration settings for an application
3. Unique tags on a blog post
4. RGB color values (never change)
5. Words to spell-check against

---

### Part 2: Performance Considerations (30 minutes)

#### Explanation

Big O notation describes how an operation's time scales with data size:

- **O(1)**: Instant, regardless of size (dict/set lookup)
- **O(n)**: Scales linearly (list search, list insertion at start)
- **O(log n)**: Scales slowly (sorted list binary search)
- **O(n²)**: Scales quadratically (nested loops over same list)

```python
import time

# O(n) vs O(1) membership test:
items_list = list(range(1000000))
items_set = set(range(1000000))

# Timing list membership:
start = time.time()
999999 in items_list    # Scans entire list
list_time = time.time() - start

# Timing set membership:
start = time.time()
999999 in items_set     # Instant hash lookup
set_time = time.time() - start

print(f"List: {list_time:.6f}s")  # ~0.01s
print(f"Set:  {set_time:.6f}s")   # ~0.000001s (~10000x faster)
```

**Common performance anti-patterns:**
```python
# SLOW: Repeated membership test on list:
seen = []
for item in large_dataset:
    if item not in seen:   # O(n) each time → O(n²) total
        seen.append(item)

# FAST: Use set:
seen = set()
for item in large_dataset:
    if item not in seen:   # O(1) each time → O(n) total
        seen.add(item)

# FAST: Simpler:
unique_items = list(dict.fromkeys(large_dataset))  # Preserves order
```

#### Practice

Find performance bottlenecks in provided code and optimize with proper data structures.

---

### Part 3: Refactoring with Better Structures (30 minutes)

#### Explanation

```python
# Before: Multiple parallel lists (fragile, error-prone)
names = ["Alice", "Bob", "Carol"]
ages = [20, 22, 19]
gpas = [3.9, 3.5, 3.8]

for i in range(len(names)):
    print(names[i], ages[i], gpas[i])

# After: List of dicts (cohesive)
students = [
    {"name": "Alice", "age": 20, "gpa": 3.9},
    {"name": "Bob", "age": 22, "gpa": 3.5},
    {"name": "Carol", "age": 19, "gpa": 3.8},
]

for s in students:
    print(s["name"], s["age"], s["gpa"])

# Even better: named tuple or dataclass
from collections import namedtuple
Student = namedtuple("Student", ["name", "age", "gpa"])
students = [Student("Alice", 20, 3.9), Student("Bob", 22, 3.5)]
for s in students:
    print(s.name, s.age, s.gpa)
```

#### Practice

Refactor a program that uses 4 parallel lists into a single list of dicts (or named tuples).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Choose and Implement

For each problem below, choose the best structure, justify your choice, and implement:
1. Store student information with fast lookup by student ID
2. Track which items a user has "liked" (fast add, remove, check)
3. Store daily high/low temperatures for a year (paired data)
4. Count how many times each word appears in a book

#### Exercise 2: Performance Comparison

Write a benchmark that compares:
- `list.append()` vs `deque.append()`
- `list.insert(0, x)` vs `deque.appendleft(x)` (for queue behavior)
- `x in list` vs `x in set` for various sizes

#### Bonus Challenge

**Data structure selection quiz:** Given 10 scenarios, choose and defend the best structure for each. Your defense should mention time complexity for the most common operations.

---

## Key Takeaways

- **List**: ordered, mutable, O(n) search, O(1) append, O(n) insert/delete
- **Tuple**: ordered, immutable, good for fixed records and dict keys
- **Dict**: key→value, O(1) lookup/insert/delete, ordered (Python 3.7+)
- **Set**: unique elements, O(1) membership, set math operations
- The choice of data structure dramatically affects performance at scale
- "Don't use a list when you need a set" is one of the most impactful optimizations

---

## Homework

1. Review all your previous code and identify 3 places where a different data structure would be better
2. Research: What is a B-tree? A hash table? How do they implement dict and list internally?

---

[← Previous](./lesson-08-nested-data-structures.md) | [Back to Course](./README.md) | [Next →](./lesson-10-iterators-generators.md)
