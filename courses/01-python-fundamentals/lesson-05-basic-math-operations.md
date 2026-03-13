# Lesson 5: Basic Math Operations

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Use all Python arithmetic operators: +, -, *, /, //, %, **
- Understand operator precedence (order of operations)
- Convert user input (text) to numbers using `int()` and `float()`
- Build programs that perform mathematical calculations
- Solve real-world math problems with Python

---

## Prerequisites

- Lessons 1-4: Basic Python, print, input, variables

---

## Lesson Outline

### Part 1: Python as a Calculator (30 minutes)

#### Explanation

Python can do math - and it's very good at it. Before we do math with user input, let's learn all the math operators Python supports.

Think of Python operators like the buttons on a calculator:
- `+` is the plus button
- `-` is the minus button
- `*` is the multiply button (we use * instead of × because keyboards don't have ×)
- `/` is the divide button

But Python has some extra operators that calculators don't:
- `//` is **floor division** - divide and round DOWN to whole number
- `%` is **modulo** - the remainder after division
- `**` is **exponentiation** - raise to a power (2**3 means 2³)

#### Examples

```python
# Basic arithmetic
print(10 + 3)    # Addition:       13
print(10 - 3)    # Subtraction:    7
print(10 * 3)    # Multiplication: 30
print(10 / 3)    # Division:       3.3333333333333335
print(10 // 3)   # Floor division: 3  (drops the decimal)
print(10 % 3)    # Modulo:         1  (10 ÷ 3 = 3 remainder 1)
print(10 ** 3)   # Exponentiation: 1000  (10³)
```

**Understanding floor division and modulo:**
```python
# Imagine you have 17 cookies to share equally among 5 people
cookies = 17
people = 5

each_person_gets = 17 // 5   # 3 cookies each
leftover_cookies = 17 % 5    # 2 cookies left over

print(f"Each person gets {each_person_gets} cookies")
print(f"Leftover cookies: {leftover_cookies}")
```

**Understanding exponentiation:**
```python
print(2 ** 8)    # 256 - useful in computer science (bits!)
print(10 ** 6)   # 1,000,000 - one million
print(3 ** 3)    # 27 - "3 cubed"
```

**Operator precedence (order of operations):**
Python follows the same order of operations as math class (PEMDAS/BODMAS):
1. `**` (exponentiation) - first
2. `*`, `/`, `//`, `%` (multiplication/division) - second
3. `+`, `-` (addition/subtraction) - last

```python
print(2 + 3 * 4)      # 14  (not 20! - multiplication first)
print((2 + 3) * 4)    # 20  (parentheses override order)
print(10 - 2 + 3)     # 11  (left to right when same precedence)
print(2 ** 3 ** 2)    # 512 (right to left for exponentiation: 2 ** (3**2) = 2**9)
```

> **Teacher's Note:** The `%` (modulo) operator confuses many beginners. Use this analogy: "It's like asking 'after everyone gets an equal share, what's left over?'" - clock math is also good (5 hours after 10 o'clock = 10+5 = 15, and 15 % 12 = 3, so it's 3 o'clock).

#### Practice

**Mental math challenge:**
Before running the code, predict the output:
```python
print(7 + 3 * 2)
print((7 + 3) * 2)
print(20 / 4 + 1)
print(17 % 5)
print(2 ** 4)
```

---

### Part 2: Numbers with User Input (30 minutes)

#### Explanation

Here's the problem: `input()` always gives us text (a string). If the user types "42", we get the text "42", not the number 42.

Why does this matter?
```python
# This looks wrong:
number = input("Enter a number: ")  # User types: 10
doubled = number * 2
print(doubled)
# Output: 1010  ← Not what we wanted!
```

"10" * 2 means "repeat the text '10' twice" → "1010"

We need to **convert** the text to a number:
- `int(x)` converts `x` to an integer (whole number like 5, -3, 100)
- `float(x)` converts `x` to a float (decimal number like 3.14, -0.5, 100.0)

```python
# The right way:
text_number = input("Enter a number: ")  # User types: 10
actual_number = int(text_number)         # Convert text to integer
doubled = actual_number * 2
print(doubled)
# Output: 20  ← Correct!
```

**Shorthand (doing it on one line):**
```python
number = int(input("Enter a number: "))
doubled = number * 2
print(doubled)
```

#### Examples

**When to use int() vs float():**
```python
# Use int() for whole numbers
age = int(input("Enter your age: "))
num_students = int(input("How many students? "))

# Use float() for decimal numbers
price = float(input("Enter price: "))
temperature = float(input("Temperature in Celsius: "))
weight = float(input("Your weight in kg: "))
```

**A practical calculator:**
```python
# Simple calculator
print("Python Calculator")
print("-" * 20)

num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))

print(f"\nResults:")
print(f"{num1} + {num2} = {num1 + num2}")
print(f"{num1} - {num2} = {num1 - num2}")
print(f"{num1} × {num2} = {num1 * num2}")
print(f"{num1} ÷ {num2} = {num1 / num2:.2f}")
```

The `:.2f` means "show 2 decimal places". So `3.333...` shows as `3.33`.

```python
# Tip calculator
print("=== Tip Calculator ===")
bill = float(input("Enter the bill amount ($): "))
tip_percent = float(input("Tip percentage (e.g., 15 for 15%): "))

tip_amount = bill * (tip_percent / 100)
total = bill + tip_amount

print(f"\nBill:   ${bill:.2f}")
print(f"Tip:    ${tip_amount:.2f}")
print(f"Total:  ${total:.2f}")
```

> **Common Question:** "What happens if the user types text when we expect a number?"
> Python will crash with a `ValueError`. We'll learn how to handle this gracefully in Course 7 (Exception Handling). For now, trust users to enter numbers.

#### Practice

**Build a temperature converter:**
Ask the user for a temperature in Celsius and display it in Fahrenheit.
Formula: `F = (C × 9/5) + 32`

```python
celsius = float(input("Enter temperature in Celsius: "))
# Your calculation here
# Print the result nicely formatted
```

---

### Part 3: Practical Math Programs (30 minutes)

#### Explanation

Let's put math to practical use. Real-world problems are much more motivating than abstract exercises.

**Common math patterns in programs:**
```python
# Percentages
discount_rate = 0.20  # 20%
original_price = 100
discount_amount = original_price * discount_rate
final_price = original_price - discount_amount

# Averages
total = 85 + 90 + 78 + 92 + 88
num_grades = 5
average = total / num_grades

# Unit conversions
km = 42.195  # marathon distance
miles = km * 0.621371

# Areas and geometry
length = 5
width = 3
area = length * width
perimeter = 2 * (length + width)
```

**Rounding numbers:**
```python
import math  # We'll learn about imports in Course 4

pi = 3.14159265358979

print(round(pi))         # 3       (round to nearest integer)
print(round(pi, 2))      # 3.14    (round to 2 decimal places)
print(round(pi, 4))      # 3.1416  (round to 4 decimal places)

# Or use f-string formatting:
print(f"{pi:.2f}")       # 3.14
print(f"{pi:.4f}")       # 3.1416
```

#### Examples

**A complete unit converter:**
```python
print("=== Unit Converter ===")
print("Convert kilometers to miles and meters")
print()

km = float(input("Enter distance in kilometers: "))

miles = km * 0.621371
meters = km * 1000
cm = km * 100000

print()
print(f"{km} km = {miles:.2f} miles")
print(f"{km} km = {meters:.0f} meters")
print(f"{km} km = {cm:.0f} centimeters")
```

**A grade calculator:**
```python
print("=== Grade Calculator ===")
print()

name = input("Student name: ")
g1 = float(input("Grade 1 (out of 100): "))
g2 = float(input("Grade 2 (out of 100): "))
g3 = float(input("Grade 3 (out of 100): "))
g4 = float(input("Grade 4 (out of 100): "))
g5 = float(input("Grade 5 (out of 100): "))

average = (g1 + g2 + g3 + g4 + g5) / 5
total = g1 + g2 + g3 + g4 + g5

print()
print(f"Student: {name}")
print(f"Grades: {g1}, {g2}, {g3}, {g4}, {g5}")
print(f"Total Points: {total}")
print(f"Average: {average:.1f}/100")
```

#### Practice

**Area calculator:**
Write a program that:
1. Asks for the length and width of a room (in meters)
2. Calculates:
   - Area (length × width)
   - Perimeter (2 × (length + width))
   - Number of floor tiles needed if each tile is 0.5m × 0.5m
3. Displays all results neatly

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Tip Split Calculator

Build a restaurant bill splitter:

**Features:**
- Ask for the total bill amount
- Ask for the tip percentage (15, 18, 20, 25?)
- Ask for how many people are splitting
- Calculate and display:
  - Tip amount
  - Total bill (bill + tip)
  - Each person's share

**Expected output:**
```
=== Bill Splitter ===

Enter total bill: $125.50
Tip percentage: 20
Number of people: 4

--- Results ---
Bill:            $125.50
Tip (20%):       $25.10
Total:           $150.60
Each person pays: $37.65
```

#### Exercise 2: Savings Goal Calculator

Build a savings calculator:

**Features:**
- Ask for the user's savings goal (e.g., $5000 for a laptop)
- Ask how much they can save per month
- Calculate how many months it will take
- Calculate how many years and remaining months

**Expected output:**
```
=== Savings Goal Calculator ===

Savings goal: $5000
Monthly savings: $350

You will reach your goal in:
- 15 months (1 year, 3 months)
```

Hint: For the year/month calculation, use `//` and `%`:
```python
total_months = ??  # Calculate this
years = total_months // 12
remaining_months = total_months % 12
```

#### Bonus Challenge

**Body Mass Index (BMI) Calculator:**
Formula: BMI = weight(kg) / height(m)²

Build a BMI calculator that:
- Asks for weight (kg) and height (cm)
- Converts height from cm to meters
- Calculates BMI
- Displays the BMI to 1 decimal place
- Displays a category:
  - Under 18.5: Underweight
  - 18.5-24.9: Normal weight
  - 25-29.9: Overweight
  - 30+: Obese
(Use what you know - just print all categories, we'll learn how to choose one in Course 3!)

---

## Key Takeaways

- Python arithmetic operators: `+`, `-`, `*`, `/`, `//` (floor div), `%` (modulo), `**` (power)
- Operator precedence: `**` first, then `*/%//`, then `+-` (use parentheses to be explicit)
- `input()` always returns **text** - convert to numbers with `int()` or `float()`
- Use `float()` for decimals, `int()` for whole numbers
- Format decimal output with `:.2f` in f-strings for 2 decimal places
- `//` gives the whole-number result of division; `%` gives the remainder

---

## Common Mistakes to Avoid

- **Forgetting to convert input:** `num = input("...")` gives text - must use `int()` or `float()`
- **Using int() for decimals:** `int("3.14")` crashes - use `float("3.14")` for decimals
- **Dividing integers:** `7 / 2` gives `3.5` (Python 3 does this correctly, unlike Python 2)
- **Forgetting parentheses in formulas:** Write `(a + b) / 2` not `a + b / 2` for average

---

## Homework / Self-Study

1. **Build:** A currency converter. Ask the user for an amount in US dollars and convert it to:
   - Euros (× 0.92)
   - British Pounds (× 0.79)
   - Japanese Yen (× 149.50)
   - Indian Rupees (× 83.10)
   Display all conversions.

2. **Explore:** What happens when you do `1/0` in Python? What about `1//0`? What about `0 ** 0`? Try these in the Python shell and note the results.

3. **Challenge:** Write a program that calculates compound interest.
   Formula: `A = P * (1 + r/n) ** (n*t)`
   Where: P = principal, r = annual rate (as decimal), n = times compounded per year, t = years

---

## Next Lesson Preview

In **Lesson 6: Strings Basics**, we'll:
- Explore strings (text) in much more depth
- Learn indexing - accessing individual characters
- Learn string concatenation and repetition
- Use the `len()` function
- Start building programs that process text

---

[← Previous Lesson](./lesson-04-print-and-input.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-06-strings-basics.md)
