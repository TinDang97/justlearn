# Lesson 8: Nested Loops

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Write loops inside other loops (nested loops)
- Trace the execution of nested loops
- Use nested loops for grid/matrix problems
- Count iterations and understand complexity

---

## Prerequisites

- Lessons 5-7: loops and loop control

---

## Lesson Outline

### Part 1: Understanding Nested Loops (30 minutes)

#### Explanation

A **nested loop** is a loop inside another loop. For every ONE iteration of the outer loop, the inner loop runs COMPLETELY.

```python
# Outer loop: runs 3 times
for i in range(3):
    # Inner loop: runs 4 times FOR EACH outer iteration
    for j in range(4):
        print(f"  i={i}, j={j}")

# Total iterations: 3 × 4 = 12
```

**Analogy:** A clock. The minute hand (inner loop) completes a full revolution (60 ticks) for every one tick of the hour hand (outer loop).

```python
# Multiplication table - classic nested loop
for row in range(1, 6):
    for col in range(1, 6):
        print(f"{row * col:4d}", end="")
    print()   # New line after each row

# Output:
#    1   2   3   4   5
#    2   4   6   8  10
#    3   6   9  12  15
#    4   8  12  16  20
#    5  10  15  20  25
```

#### Examples

```python
# Grade matrix - multiple students, multiple assignments
students = ["Alice", "Bob", "Carol"]
assignments = ["HW1", "HW2", "HW3"]

for student in students:
    print(f"\n{student}:")
    for assignment in assignments:
        grade = int(input(f"  {student}'s grade for {assignment}: "))
        print(f"  ✓ {assignment}: {grade}")
```

#### Practice

Use nested loops to display a times table for all numbers 1-5 (5×5 grid).

---

### Part 2: Nested Loop Patterns (30 minutes)

#### Explanation

```python
# Pattern 1: Square grid (n×n)
n = 5
for i in range(n):
    for j in range(n):
        print("*", end=" ")
    print()

# Pattern 2: Right triangle
for i in range(1, n + 1):
    for j in range(i):
        print("*", end=" ")
    print()

# Pattern 3: Hollow square
for i in range(n):
    for j in range(n):
        if i == 0 or i == n-1 or j == 0 or j == n-1:
            print("*", end=" ")
        else:
            print(" ", end=" ")
    print()
```

#### Examples

```python
# Seating chart generator
rows = 5
seats_per_row = 8

print("Seating Chart:")
for row in range(1, rows + 1):
    print(f"Row {row}: ", end="")
    for seat in range(1, seats_per_row + 1):
        print(f"[{row}{chr(64+seat)}]", end=" ")
    print()

# Output: Row 1: [1A] [1B] [1C] [1D] [1E] [1F] [1G] [1H]
```

#### Practice

Generate a number pyramid:
```
        1
      1 2 1
    1 2 3 2 1
  1 2 3 4 3 2 1
1 2 3 4 5 4 3 2 1
```

---

### Part 3: Breaking Out of Nested Loops (30 minutes)

#### Explanation

`break` only exits the INNERMOST loop:

```python
# Break only exits inner loop:
for i in range(5):
    for j in range(5):
        if j == 2:
            break   # Exits inner loop only
        print(f"{i},{j}")
    print(f"Outer i={i} continuing")  # This still runs
```

**To break out of multiple loops - use a flag:**
```python
found = False
for i in range(10):
    for j in range(10):
        if some_condition(i, j):
            found = True
            break   # Exit inner loop
    if found:
        break   # Exit outer loop too
```

#### Examples

```python
# 2D search: find target in grid
grid = [
    [1, 5, 3, 8],
    [4, 7, 2, 9],
    [6, 3, 8, 1],
    [2, 9, 4, 7],
]
target = int(input("Search for: "))
found = False

for row_idx, row in enumerate(grid):   # enumerate gives index + value
    for col_idx, value in enumerate(row):
        if value == target:
            print(f"Found {target} at row {row_idx+1}, column {col_idx+1}")
            found = True
            break
    if found:
        break

if not found:
    print(f"{target} not found in grid")
```

#### Practice

Search a 5×5 grid for all occurrences of a value (not just the first).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Full Times Table

Print the complete 12×12 multiplication table with proper alignment and row/column headers.

#### Exercise 2: Grade Matrix

Build a grade tracking system:
- 5 students × 4 assignments
- Input all grades using nested loops
- Calculate: each student's average, each assignment's average, class average

#### Bonus Challenge

**Sudoku validator:** Given a 9×9 grid (hardcoded), use nested loops to check if each row contains 1-9 exactly once.

---

## Key Takeaways

- Nested loops: inner loop completes FULLY for each outer iteration
- Total iterations = outer_count × inner_count
- `break` in inner loop only exits the inner loop
- To break all loops: use a flag variable
- Common applications: grids, matrices, comparing all pairs, table generation

---

## Common Mistakes to Avoid

- **Using same variable name for inner and outer**: `for i in range(3): for i in range(4):` - inner overwrites outer!
- **Off by one in grid coordinates**: remember 0-based vs 1-based indexing

---

## Homework

1. Build a "chess board" printer: 8×8 alternating black/white squares using unicode: ■□
2. Find all Pythagorean triples where all values are under 100

---

[← Previous](./lesson-07-loop-control.md) | [Back to Course](./README.md) | [Next →](./lesson-09-pattern-printing-workshop.md)
