# Lesson 6: For Loops & Range

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use for loops to iterate over sequences
- Generate number sequences with `range()`
- Iterate over strings character by character
- Choose between for and while loops appropriately

---

## Prerequisites

- Lesson 5: while loops

---

## Lesson Outline

### Part 1: The for Loop (30 minutes)

#### Explanation

A `for` loop iterates over each item in a sequence (string, list, range). Unlike while loops which run on a condition, for loops run a fixed number of times (once per item).

```python
# Syntax:
for variable in sequence:
    # body runs once per item
    # 'variable' holds the current item
```

**Analogy:** A for loop is like reading a playlist. For each song in the playlist, play it. When you've played every song, you're done.

```python
# Iterating over a list (preview of Course 5)
fruits = ["apple", "banana", "cherry", "mango"]

for fruit in fruits:
    print(f"Fruit: {fruit}")

# Iterating over a string
for letter in "Python":
    print(letter)
# P
# y
# t
# h
# o
# n
```

#### Examples

```python
# Processing student grades
grades = [85, 92, 78, 95, 88, 73, 90]

total = 0
for grade in grades:
    total += grade

average = total / len(grades)
print(f"Grades: {grades}")
print(f"Average: {average:.1f}")

# Uppercase each word
words = ["hello", "python", "world"]
for word in words:
    print(word.upper())
```

> **Teacher's Note:** Point out that the loop variable (`fruit`, `letter`, `grade`) is just a temporary name - it could be called anything. Convention is to use the singular of the collection name.

#### Practice

For each of these, use a for loop:
1. Print each character of a name with its index
2. Calculate the sum of a list of prices
3. Count how many names start with 'A'

---

### Part 2: The range() Function (30 minutes)

#### Explanation

`range()` generates a sequence of numbers:

```python
range(stop)           # 0 to stop-1
range(start, stop)    # start to stop-1
range(start, stop, step)  # start to stop-1, stepping by step
```

```python
for i in range(5):         # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):      # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 20, 2):  # 0, 2, 4, 6, ..., 18 (evens)
    print(i)

for i in range(10, 0, -1): # 10, 9, 8, ..., 1 (countdown)
    print(i)

for i in range(0, 100, 10): # 0, 10, 20, ..., 90
    print(i)
```

**Converting range to a list:**
```python
numbers = list(range(1, 11))    # [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(range(2, 21, 2))   # [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

#### Examples

```python
# Times table for any number
number = int(input("Times table for: "))
print(f"\n{number} Times Table:")
print("-" * 20)
for i in range(1, 13):
    print(f"{number} × {i:2d} = {number * i:3d}")

# Fibonacci sequence
a, b = 0, 1
print("Fibonacci sequence:")
for _ in range(15):   # _ is convention for "unused variable"
    print(a, end=" ")
    a, b = b, a + b
print()

# Factorial calculation
n = int(input("Calculate factorial of: "))
result = 1
for i in range(2, n + 1):
    result *= i
print(f"{n}! = {result}")
```

#### Practice

Using range():
1. Print the squares of numbers 1-10
2. Print all multiples of 7 up to 100
3. Calculate sum of all odd numbers from 1 to 99

---

### Part 3: for vs while - When to Use Which (30 minutes)

#### Explanation

**Use for when:**
- You know exactly how many times to loop
- You're iterating over a collection (list, string, range)
- You want to process each item exactly once

**Use while when:**
- You don't know in advance how many iterations
- You're waiting for a condition to change
- User input validation
- Game loops that continue until player quits

```python
# FOR - iterate over known collection:
for grade in [85, 90, 78, 92]:
    print(grade)

# WHILE - unknown number of iterations:
while user_wants_to_continue:
    get_next_input()

# FOR with range - fixed count:
for i in range(10):
    process_item(i)

# WHILE - until condition:
while balance > 0 and not account_frozen:
    process_transaction()
```

**Equivalence (for can always be rewritten as while):**
```python
# These do the same thing:
for i in range(5):
    print(i)

i = 0
while i < 5:
    print(i)
    i += 1
```

#### Examples

```python
# Finding prime numbers up to N (uses both patterns)
n = int(input("Find primes up to: "))
print("Primes:", end=" ")

for num in range(2, n + 1):
    is_prime = True
    for divisor in range(2, int(num**0.5) + 1):   # Nested loop (Lesson 8)
        if num % divisor == 0:
            is_prime = False
            break
    if is_prime:
        print(num, end=" ")
print()
```

#### Practice

Solve the same problem two ways (once with for, once with while): print all powers of 2 that are less than 10000.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Grade Report Generator

```python
# Inputs: student names (hardcoded list) and their 5 grades each
students = [
    ("Alice", [85, 90, 78, 92, 88]),
    ("Bob", [72, 68, 75, 80, 70]),
    ("Carol", [95, 98, 92, 96, 99]),
]

# Display formatted report showing:
# Name, all grades, average, letter grade
# Class statistics: highest/lowest average, class average
```

#### Exercise 2: Pattern Generator

Print these patterns using for loops and range():
```
Pattern 1:          Pattern 2:
1                   *
12                  **
123                 ***
1234                ****
12345               *****
```

#### Bonus Challenge

**Multiplication table grid:** Print the full 10×10 multiplication table with proper alignment.

---

## Key Takeaways

- `for item in sequence:` - iterates over each item, one at a time
- `range(stop)`, `range(start, stop)`, `range(start, stop, step)`
- `for` is best when you know the number of iterations or iterating over items
- `while` is best when you don't know how many iterations in advance
- `_` as variable name = "I don't need this value"
- Any `for` loop can be rewritten as `while` (but for is usually cleaner)

---

## Common Mistakes to Avoid

- **`range(n)` starts at 0, not 1**: `range(5)` gives 0,1,2,3,4
- **Modifying the list you're iterating**: can cause unexpected behavior - iterate over a copy
- **`range(1, 11)` not `range(1, 10)`**: common off-by-one error, range stop is exclusive

---

## Homework

1. Build a multiplication table program that lets the user choose which table(s) to display
2. Find all perfect numbers up to 10000 (a perfect number equals the sum of its proper divisors)

---

[← Previous](./lesson-05-while-loops.md) | [Back to Course](./README.md) | [Next →](./lesson-07-loop-control.md)
