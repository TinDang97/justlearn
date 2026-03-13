# Lesson 6: Type Conversion

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Convert between int, float, str, and bool using built-in functions
- Distinguish between implicit and explicit type conversion
- Handle conversion errors gracefully
- Apply type conversion in real-world data processing
- Use `isinstance()` to check types before conversion

---

## Prerequisites

- Lessons 1-5 of this course

---

## Lesson Outline

### Part 1: Explicit Type Conversion (30 minutes)

#### Explanation

**Type conversion** (also called **type casting**) converts a value from one type to another.

**Why we need it:** `input()` always returns a string. To do math, you must convert.

```python
# Explicit conversions using built-in functions:

# int() - converts to integer
print(int("42"))       # 42
print(int(3.7))        # 3  (truncates decimal - doesn't round!)
print(int(3.2))        # 3
print(int(True))       # 1
print(int(False))      # 0
# print(int("hello"))  # ValueError! Can't convert text to int

# float() - converts to float
print(float("3.14"))   # 3.14
print(float("42"))     # 42.0
print(float(5))        # 5.0
print(float(True))     # 1.0
# print(float("abc")) # ValueError!

# str() - converts to string (everything can be converted to string)
print(str(42))         # "42"
print(str(3.14))       # "3.14"
print(str(True))       # "True"
print(str(None))       # "None"

# bool() - converts to boolean
print(bool(0))         # False
print(bool(1))         # True
print(bool(""))        # False
print(bool("hello"))   # True
print(bool(None))      # False
```

#### Examples

```python
# Real-world: processing user input
user_age = input("Enter your age: ")
print(type(user_age))   # <class 'str'>

age_as_int = int(user_age)
print(type(age_as_int)) # <class 'int'>

birth_year = 2024 - age_as_int
print(f"You were born around {birth_year}")

# One-liner (common pattern):
age = int(input("Enter your age: "))
```

#### Practice

Write a program that:
1. Reads 3 values as strings (they happen to be numbers)
2. Converts them to appropriate types
3. Performs a calculation
4. Converts the result back to a formatted string for display

---

### Part 2: Implicit Conversion (Type Promotion) (30 minutes)

#### Explanation

Python sometimes converts types automatically (**implicitly**) in mixed-type operations:

```python
# int + float → float (automatic promotion)
result = 5 + 3.0
print(result)        # 8.0
print(type(result))  # float

# int + bool → int
result = 10 + True
print(result)        # 11  (True is 1)

# Comparison: Python does NOT implicitly convert str to int
# "5" + 5 → TypeError: must be str, not int
# "5" + str(5) → "55"  (string concatenation)
# int("5") + 5 → 10    (explicit conversion)
```

**The `==` comparison with type mismatch:**
```python
print(5 == 5.0)       # True  (numeric equality across types)
print(5 == "5")       # False (Python doesn't implicitly compare int to str)
print(True == 1)      # True  (bool is subtype of int)
print(True == "True") # False
```

#### Examples

```python
# Counting using booleans as integers
data = [1, -5, 3, -2, 8, -1, 4]
# Count positive numbers
positive_count = sum(x > 0 for x in data)   # Each comparison is True (1) or False (0)
print(f"Positive numbers: {positive_count}")
```

#### Practice

Create 5 expressions with mixed types and predict the result type before running them.

---

### Part 3: Safe Conversion Patterns (30 minutes)

#### Explanation

Raw `int()` and `float()` crash on invalid input. Production code needs safer conversion:

```python
# UNSAFE:
age = int(input("Age: "))   # Crashes if user types "twenty-five"

# SAFE with exception handling (preview of Course 7):
try:
    age = int(input("Age: "))
    print(f"Age: {age}")
except ValueError:
    print("Please enter a valid number!")

# Check before converting:
text = input("Enter a number: ")
if text.isdigit():
    number = int(text)
    print(f"Doubled: {number * 2}")
else:
    print("That's not a positive integer!")

# For floats, isdigit() doesn't work (won't handle decimals or negatives)
# Use try/except instead
```

**Using `isinstance()` to check type:**
```python
value = 42

print(isinstance(value, int))         # True
print(isinstance(value, float))       # False
print(isinstance(value, (int, float))) # True (check multiple types)
print(isinstance(value, bool))        # False (42 is int, not bool)

# Note: bool is a subtype of int!
flag = True
print(isinstance(flag, bool))   # True
print(isinstance(flag, int))    # True  (bool IS an int)
print(type(flag) == bool)       # True  (exact type check)
print(type(flag) == int)        # False
```

#### Examples

```python
# Robust input handler
def get_number(prompt, data_type=float):
    """Keep asking until user provides valid number."""
    while True:
        try:
            return data_type(input(prompt))
        except ValueError:
            print(f"  Invalid! Please enter a valid {data_type.__name__}.")

# Usage:
age = get_number("Your age: ", int)
price = get_number("Item price: $", float)
print(f"In 5 years: {age + 5}, plus tax: ${price * 1.15:.2f}")
```

#### Practice

Build a "type-safe input collector" that asks for 3 different types of input (integer, float, string with minimum length) and validates each before proceeding.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Type Converter

Build a program that:
1. Asks the user for a value
2. Attempts to convert it to int, float, bool
3. Shows which conversions succeed and their results
4. Shows what type the original input was

#### Exercise 2: Contact Importer

Simulate importing contact data from CSV text:

```python
# Raw CSV data (as strings)
raw_data = [
    "Alice Johnson, 28, 95000.50, True",
    "Bob Smith, 35, 72000.00, False",
    "Carol Davis, 42, 120000.75, True",
]

# Parse and convert each field to appropriate types:
# name (str), age (int), salary (float), is_manager (bool)
# Display in formatted table
```

#### Bonus Challenge

**Safe calculator:** Build a calculator that:
1. Gets two values from user (they could enter text or numbers)
2. Validates both are valid numbers
3. Gets an operator (+, -, *, /)
4. Validates division by zero
5. Computes and displays result with proper type handling

---

## Key Takeaways

- `int()`, `float()`, `str()`, `bool()` - explicit type conversion functions
- `int(3.7)` → `3` (truncates, doesn't round)
- `int("hello")` → `ValueError` (strings that aren't numbers can't be converted)
- **Implicit conversion**: int + float → float (Python promotes automatically)
- `isinstance(value, type)` - check type without crashing
- Use `try/except` for safe conversion of user input (Course 7 will cover this deeply)

---

## Common Mistakes to Avoid

- **`int("3.14")`**: fails! Must `float("3.14")` then `int()` if needed
- **Confusing `type() ==` vs `isinstance()`**: `isinstance(True, int)` is True (bool inherits from int)
- **Not converting input:** forgetting `int()` around `input()` then doing math

---

## Homework

1. Build a data normalizer: takes a list of mixed-type strings and converts each to the most appropriate type (int, float, or keep as string)
2. Explore: What does `int("0x1A", 16)` do? What about `int("1111", 2)`?

---

[← Previous](./lesson-05-booleans-and-comparisons.md) | [Back to Course](./README.md) | [Next →](./lesson-07-constants-and-naming.md)
