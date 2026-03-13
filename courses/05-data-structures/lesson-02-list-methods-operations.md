# Lesson 2: List Methods & Operations

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Use all major list methods: append, extend, insert, remove, pop, sort, reverse
- Understand in-place modification vs returning new lists
- Use list as a stack and queue
- Combine lists using concatenation and repetition

---

## Prerequisites

- Lesson 1: Lists Introduction

---

## Lesson Outline

### Part 1: Adding and Removing Elements (30 minutes)

#### Explanation

```python
fruits = ["apple", "banana", "cherry"]

# ADDING ELEMENTS:
fruits.append("date")        # Add to end: ['apple','banana','cherry','date']
fruits.insert(1, "apricot")  # Insert at index 1
fruits.extend(["elderberry", "fig"])  # Add all items from iterable
fruits += ["grape"]          # Same as extend with concatenation

# REMOVING ELEMENTS:
fruits.remove("banana")    # Remove first occurrence of value
popped = fruits.pop()      # Remove and return last element
popped2 = fruits.pop(0)    # Remove and return element at index 0
del fruits[2]              # Delete element at index 2
del fruits[1:3]            # Delete a slice
fruits.clear()             # Remove all elements

# SEARCHING:
numbers = [10, 20, 30, 20, 40, 20]
print(numbers.index(20))    # 1 (first occurrence)
print(numbers.count(20))    # 3 (number of occurrences)
```

#### Examples

```python
# Stack (LIFO - Last In, First Out) using list:
stack = []
stack.append("first")   # push
stack.append("second")  # push
stack.append("third")   # push
print(stack.pop())       # third (last in, first out)
print(stack.pop())       # second

# Queue (FIFO - First In, First Out):
from collections import deque
queue = deque()
queue.append("first")    # enqueue
queue.append("second")   # enqueue
print(queue.popleft())   # first (first in, first out)
```

> **Teacher's Note:** Using a list as a queue (with pop(0)) is inefficient - O(n) - because all elements shift. `deque` is O(1). Mention this is a preview of algorithm efficiency (Big O).

#### Practice

Build a browser history manager: "visit" pages (append), "back" (pop), "clear history" (clear), "is in history?" (in).

---

### Part 2: Sorting and Ordering (30 minutes)

#### Explanation

```python
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

# In-place sort (modifies original):
numbers.sort()                    # Ascending
numbers.sort(reverse=True)       # Descending

# Returns new sorted list (original unchanged):
sorted_nums = sorted(numbers)
sorted_desc = sorted(numbers, reverse=True)

# Sort with key function:
names = ["Charlie", "alice", "BOB", "David"]
names.sort(key=str.lower)    # Case-insensitive sort

students = [("Alice", 92), ("Bob", 78), ("Carol", 95)]
students.sort(key=lambda s: s[1], reverse=True)  # Sort by grade

# Reverse in-place:
items = [1, 2, 3, 4, 5]
items.reverse()               # [5, 4, 3, 2, 1]
reversed_items = items[::-1]  # New reversed list
```

#### Examples

```python
# Leaderboard system
scores = [
    {"name": "Alice", "score": 9500},
    {"name": "Bob", "score": 8700},
    {"name": "Carol", "score": 9500},
    {"name": "David", "score": 9800},
]

# Sort by score descending, then name ascending
leaderboard = sorted(scores, key=lambda p: (-p["score"], p["name"]))

for rank, player in enumerate(leaderboard, 1):
    print(f"{rank}. {player['name']}: {player['score']:,}")
```

#### Practice

Implement a "to-do list" with priority sorting: each task has a name and priority (1-5). Display tasks sorted by priority (highest first).

---

### Part 3: List Operations and Copying (30 minutes)

#### Explanation

```python
# Concatenation and repetition:
a = [1, 2, 3]
b = [4, 5, 6]

combined = a + b      # [1, 2, 3, 4, 5, 6] - new list
repeated = a * 3      # [1, 2, 3, 1, 2, 3, 1, 2, 3] - new list

a += b                # Same as a.extend(b) - modifies a
a *= 2                # Repeat in place

# Copying (IMPORTANT):
original = [[1, 2], [3, 4], [5, 6]]

shallow = original.copy()     # Shallow copy
deep_copy = [row[:] for row in original]  # Deep copy for nested

import copy
deep = copy.deepcopy(original)  # Full deep copy

# Shallow copy problem:
shallow[0][0] = 99
print(original[0][0])   # 99! (shared inner list)

deep[0][0] = 0
print(original[0][0])   # 99 (unchanged - truly independent)
```

#### Practice

Demonstrate shallow vs deep copy with a nested list. Show the difference in behavior.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Playlist Manager

Full-featured playlist:
- Add songs (append/insert at position)
- Remove songs (by name or position)
- Move song up/down (swap adjacent elements)
- Sort alphabetically or keep custom order
- Display with track numbers

#### Exercise 2: Statistical Calculator

Given a dataset, implement:
- Running average (after each addition, recalculate)
- Median (requires sorted list and middle element logic)
- Outlier detection (values more than 2x std from mean)

#### Bonus Challenge

**Implement merge sort** using Python lists - a classic recursive sorting algorithm.

---

## Key Takeaways

- `append(x)`, `extend(iterable)`, `insert(i, x)` - adding
- `remove(x)`, `pop(i)`, `del list[i]`, `clear()` - removing
- `sort()` - in-place; `sorted()` - returns new list
- `index(x)`, `count(x)` - searching
- Lists as stacks: `append` + `pop`; as queues: use `collections.deque`
- Shallow copy: `.copy()` - ok for flat lists; deep copy needed for nested

---

## Homework

1. Build a "deck of cards" using a list of tuples. Implement shuffle, deal, and check hand value
2. Research: What is time complexity? What's the difference O(1), O(n), O(n²) for list operations?

---

[← Previous](./lesson-01-lists-introduction.md) | [Back to Course](./README.md) | [Next →](./lesson-03-list-comprehensions.md)
