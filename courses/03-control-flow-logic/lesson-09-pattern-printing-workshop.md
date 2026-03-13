# Lesson 9: Pattern Printing Workshop

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Apply nested loops to print ASCII art patterns
- Use string multiplication and formatting in loops
- Think algorithmically to generate patterns
- Build increasingly complex patterns systematically

---

## Prerequisites

- Lessons 1-8: All control flow concepts

---

## Lesson Outline

### Part 1: Simple Patterns (30 minutes)

#### Explanation

Pattern printing is a classic exercise that builds algorithmic thinking. The key insight: analyze the pattern mathematically - how many characters per row? What's the relationship between row number and character count?

#### Examples

```python
# Square patterns
n = int(input("Size: "))

# Solid square
for i in range(n):
    print("*" * n)

# Hollow square
for i in range(n):
    if i == 0 or i == n - 1:
        print("*" * n)
    else:
        print("*" + " " * (n - 2) + "*")

# Right-aligned triangle
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * i)

# Diamond
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
for i in range(n - 1, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))
```

#### Practice

Generate a "number pyramid":
```
    1
   121
  12321
 1234321
123454321
```

---

### Part 2: Number and Letter Patterns (30 minutes)

#### Explanation

Patterns using numbers and letters test understanding of ASCII values and loop variable relationships.

#### Examples

```python
# Floyd's triangle
n = 5
count = 1
for i in range(1, n + 1):
    for j in range(i):
        print(count, end=" ")
        count += 1
    print()

# Pascal's triangle
import math

n = 6
for i in range(n):
    row = ""
    for j in range(i + 1):
        row += f"{math.comb(i, j):4d}"
    print(row.center(n * 4))

# Letter triangle
for i in range(65, 65 + n):   # ASCII codes for A-E etc
    print(" " * (90 - i) + "".join([chr(c) for c in range(65, i + 1)]))
```

#### Practice

Generate a "Christmas tree" pattern:
```
    *
   ***
  *****
 *******
*********
    |
```

---

### Part 3: Complex Patterns (30 minutes)

#### Explanation

Combine multiple nested loops, strings, and conditional logic for advanced patterns.

#### Examples

```python
# Spiral pattern (just corners):
# *****
# *   *
# * * *
# *   *
# *****

n = int(input("Size (odd number): "))
for i in range(n):
    for j in range(n):
        # Complex condition for border and center
        if i == 0 or i == n-1 or j == 0 or j == n-1:
            print("*", end="")
        elif i == j or i + j == n - 1:
            print("X", end="")
        else:
            print(" ", end="")
    print()

# Hourglass pattern
n = 5
for i in range(n, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))
print(" " * (n - 1) + "*")
for i in range(2, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
```

#### Practice

Create a "flag" pattern with horizontal stripes using different characters for each stripe.

---

### Part 4: Creative Workshop (30 minutes)

#### Exercise 1: Pattern Collection

Write code to generate these 5 patterns (let n=5):
```
Pattern A       Pattern B       Pattern C
*               12345           E
**              1234            DE
***             123             CDE
****            12              BCDE
*****           1               ABCDE
```

#### Exercise 2: Animation (Static Frame)

Print an ASCII art scene with:
- Sky (dots/spaces)
- Mountains (triangle shapes)
- Ground (dashes)
- A sun (circle approximation)

#### Bonus Challenge

**Rotating square frame:** Print a square border where the border rotates through `*`, `#`, `+`, `@` for each side.

---

## Key Takeaways

- Pattern = formula: find relationship between row number and content
- `print("*" * n)` and `print(" " * (n-i) + "*" * i)` are basic building blocks
- Analyze pattern on paper first: label rows 0,1,2... and count characters
- Nested loops power all 2D patterns

---

## Homework

1. Generate your initials using ASCII art (block letters)
2. Print a "sine wave" pattern using spaces and *

---

[← Previous](./lesson-08-nested-loops.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)
