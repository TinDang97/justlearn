# Lesson 2: Numbers - int and float

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Distinguish between integers (int) and floating-point numbers (float)
- Understand Python's automatic integer promotion
- Explain floating-point precision issues and how to handle them
- Use the math module for advanced mathematical operations
- Work with large numbers and Python's unlimited integer precision

---

## Prerequisites

- Course 1 complete, Lesson 1 of this course

---

## Lesson Outline

### Part 1: Integers (int) (30 minutes)

#### Explanation

An **integer** is a whole number with no decimal point: ..., -3, -2, -1, 0, 1, 2, 3, ...

Python integers have unlimited precision - they can be as large as your computer's memory allows. This is unusual - most languages cap integers at a maximum value.

```python
# Regular integers
age = 25
year = 2024
temperature = -10
population = 8_000_000_000   # Underscores for readability (8 billion)

# Python handles HUGE numbers natively
googol = 10 ** 100
print(googol)   # 10000000000...0 (100 zeros) - no problem!

# Check the type
print(type(42))    # <class 'int'>
print(type(-5))    # <class 'int'>
```

**Different number bases:**
```python
# Decimal (normal): base 10
decimal = 255

# Binary: base 2 (prefix 0b)
binary = 0b11111111   # 255 in binary

# Hexadecimal: base 16 (prefix 0x)
hex_num = 0xFF        # 255 in hex

# Octal: base 8 (prefix 0o)
octal = 0o377         # 255 in octal

print(decimal, binary, hex_num, octal)  # All print as 255
```

#### Examples

```python
# Integer operations - results stay int
print(10 + 3)   # 13  (int)
print(10 - 3)   # 7   (int)
print(10 * 3)   # 30  (int)
print(10 // 3)  # 3   (int - floor division)
print(10 % 3)   # 1   (int - modulo)
print(10 ** 3)  # 1000 (int)

# But regular division always returns float
print(10 / 2)   # 5.0  (float - even though it's exact)
print(10 / 3)   # 3.333... (float)
```

#### Practice

Write a program that calculates and displays properties of any integer the user enters:
- Is it even or odd? (`number % 2 == 0`)
- What is it squared and cubed?
- What is it in binary, octal, and hex? (use `bin()`, `oct()`, `hex()`)

---

### Part 2: Floating-Point Numbers (float) (30 minutes)

#### Explanation

A **float** (floating-point number) represents numbers with decimal points. The "floating" refers to how the decimal point can be positioned anywhere in the number.

```python
price = 29.99
height = 1.75
temperature = -3.5
very_small = 1.5e-10   # Scientific notation: 1.5 × 10⁻¹⁰
very_large = 6.022e23  # Avogadro's number: 6.022 × 10²³
```

**The Surprising Float Problem:**

Here's something that shocks every programming beginner:

```python
print(0.1 + 0.2)
# Expected: 0.3
# Actual:   0.30000000000000004
```

This is NOT a Python bug - it's a fundamental limitation of how computers store decimal numbers in binary. Computers can't represent most decimal fractions exactly in binary, just like you can't write 1/3 exactly in decimal (0.333...).

**How to deal with float imprecision:**
```python
# Option 1: Round the result
result = round(0.1 + 0.2, 10)   # 0.3

# Option 2: Use f-string formatting
print(f"{0.1 + 0.2:.2f}")        # 0.30

# Option 3: Use the decimal module (for financial calculations)
from decimal import Decimal
result = Decimal('0.1') + Decimal('0.2')
print(result)  # 0.3 (exact!)
```

> **Teacher's Note:** The 0.1 + 0.2 demo is always a shock. Take time with it. Emphasize: this is why you NEVER use regular floats for money - use `Decimal` or store amounts as integer cents.

#### Examples

```python
# Float vs int division
print(7 / 2)     # 3.5  (float)
print(7 // 2)    # 3    (int - floor division)
print(7.0 // 2)  # 3.0  (float floor division)

# Auto-promotion: int + float = float
result = 5 + 3.0
print(result)         # 8.0
print(type(result))   # <class 'float'>

# Common float operations
import math
print(math.pi)      # 3.141592653589793
print(math.e)       # 2.718281828459045
```

#### Practice

Build a price calculator that handles float precision correctly:
- Ask for 3 item prices
- Calculate subtotal, 15% tax, and total
- Display all amounts formatted to 2 decimal places using `:.2f`

---

### Part 3: The math Module (30 minutes)

#### Explanation

Python's `math` module provides mathematical functions beyond basic arithmetic.

```python
import math

# Constants
print(math.pi)      # π = 3.14159...
print(math.e)       # e = 2.71828...
print(math.tau)     # τ = 2π = 6.28318...
print(math.inf)     # Infinity

# Rounding
print(math.floor(3.7))   # 3  (round down)
print(math.ceil(3.2))    # 4  (round up)
print(round(3.5))        # 4  (round to nearest)

# Powers and roots
print(math.sqrt(16))     # 4.0  (square root)
print(math.pow(2, 10))   # 1024.0  (2 to the power 10)

# Logarithms
print(math.log(100, 10)) # 2.0  (log base 10 of 100)
print(math.log2(1024))   # 10.0 (log base 2)

# Trigonometry (angles in radians)
print(math.sin(math.pi/2))   # 1.0
print(math.cos(0))            # 1.0

# Factorial
print(math.factorial(5))    # 120 (5! = 5×4×3×2×1)

# Absolute value (also built-in)
print(abs(-42))     # 42
print(math.fabs(-3.14))  # 3.14
```

#### Examples

```python
# Practical example: distance between two points
import math

x1, y1 = 0, 0   # Point A (origin)
x2, y2 = 3, 4   # Point B

distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
print(f"Distance: {distance:.2f}")   # 5.00

# Circle calculations
radius = 7
area = math.pi * radius ** 2
circumference = 2 * math.pi * radius
print(f"Area: {area:.2f}")
print(f"Circumference: {circumference:.2f}")
```

#### Practice

Build a geometry calculator using the math module. Calculate area and perimeter for: circle, rectangle, triangle, and regular hexagon.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Financial Calculator

Build a loan/mortgage calculator that handles floats correctly:

- Inputs: loan amount, annual interest rate (%), loan term (years)
- Monthly payment formula: `P × (r(1+r)^n) / ((1+r)^n - 1)`
  where P=principal, r=monthly rate, n=number of payments
- Display: monthly payment, total paid, total interest, payment schedule summary
- All amounts to 2 decimal places

#### Exercise 2: Math Quiz Generator

Build a program that generates 5 math problems and scores the user:
- Problems should use random integers between 1 and 20
- Include addition, subtraction, multiplication
- Track score and display final results

```python
import random
# random.randint(1, 20) generates a random integer between 1 and 20
```

#### Bonus Challenge

**Scientific calculator:**
Using the math module, build a calculator that can compute:
- Compound interest: A = P(1 + r/n)^(nt)
- Pythagorean theorem
- Circle from area (find radius)
- Any base logarithm

---

## Key Takeaways

- `int`: whole numbers, unlimited precision in Python
- `float`: decimal numbers, limited precision (approximately 15-17 significant digits)
- **Float precision problem**: `0.1 + 0.2 != 0.3` - use `Decimal` for money
- `7 / 2 = 3.5` (float), `7 // 2 = 3` (int floor division)
- `int + float = float` - Python automatically promotes to float
- The `math` module provides: sqrt, floor, ceil, log, sin, cos, pi, e, factorial

---

## Common Mistakes to Avoid

- **Using float for money:** Always use `Decimal` or integer cents for financial calculations
- **Integer division confusion:** `3 / 2 = 1.5` in Python 3 (unlike Python 2 where `3/2 = 1`)
- **Forgetting to import math:** `math.sqrt(16)` requires `import math` first

---

## Homework / Self-Study

1. Build a currency calculator that handles decimal precision correctly using `Decimal`
2. Research: What is IEEE 754? (The standard for floating-point representation)
3. Experiment: What is `math.inf + 1`? `math.inf - math.inf`? `math.nan == math.nan`?

---

[← Previous](./lesson-01-variables-and-assignment.md) | [Back to Course](./README.md) | [Next →](./lesson-03-strings-deep-dive.md)
