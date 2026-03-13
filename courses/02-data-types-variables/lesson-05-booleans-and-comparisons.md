# Lesson 5: Booleans & Comparisons

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Explain what Boolean values are and why they're fundamental
- Use all comparison operators correctly
- Understand Python's "truthy" and "falsy" values
- Combine comparisons using logical operators (and, or, not)
- Use comparison chains unique to Python

---

## Prerequisites

- Lessons 1-4 of this course

---

## Lesson Outline

### Part 1: The bool Type (30 minutes)

#### Explanation

A **Boolean** (named after mathematician George Boole) has only two possible values: `True` or `False`. It's the simplest data type in Python, but it's the foundation of ALL decision-making in every program.

Every "if this happens, do that" in programming comes down to a Boolean: is this True or False?

```python
# Boolean values (capital T and F!)
is_student = True
has_graduated = False

print(type(True))   # <class 'bool'>
print(type(False))  # <class 'bool'>

# Booleans are actually integers!
print(True + True)    # 2  (True == 1)
print(False + True)   # 1  (False == 0)
print(True * 10)      # 10
```

**Comparison operators - produce Boolean results:**
```python
x = 10
y = 20

print(x == y)    # False  (equal to)
print(x != y)    # True   (not equal to)
print(x < y)     # True   (less than)
print(x > y)     # False  (greater than)
print(x <= y)    # True   (less than or equal to)
print(x >= y)    # False  (greater than or equal to)
```

> **Teacher's Note:** Stress the difference between `=` (assignment) and `==` (comparison). This is the single most common beginner error when they learn if-statements in Course 3.

#### Examples

```python
# Real-world comparisons
age = 18
salary = 50000
password = "secret123"

print(age >= 18)                    # True  - is adult
print(salary > 100000)              # False - is high earner
print(password == "secret123")      # True  - password correct
print(len(password) >= 8)           # True  - password long enough

# String comparisons (alphabetical)
print("apple" < "banana")    # True  (a comes before b)
print("Python" == "python")  # False (case sensitive!)
print("Z" > "A")             # True  (Z comes after A in ASCII)
```

#### Practice

Write 10 comparison expressions and predict whether each evaluates to True or False before running them. Test your predictions.

---

### Part 2: Logical Operators (30 minutes)

#### Explanation

Logical operators combine Boolean values: `and`, `or`, `not`

```python
# AND: both conditions must be True
print(True and True)    # True
print(True and False)   # False
print(False and True)   # False
print(False and False)  # False

# OR: at least one condition must be True
print(True or True)     # True
print(True or False)    # True
print(False or True)    # True
print(False or False)   # False

# NOT: reverses the Boolean
print(not True)    # False
print(not False)   # True
```

**Short-circuit evaluation:**
```python
# AND stops at first False (doesn't evaluate rest)
# OR stops at first True (doesn't evaluate rest)

x = 5
print(x > 3 and x < 10)    # True  (both conditions true)
print(x < 3 and x > 0)     # False (first is False, stops there)

# Practical: check before dividing
denominator = 0
# Safe check - won't cause ZeroDivisionError
print(denominator != 0 and 100 / denominator > 10)   # False (stops at first False)
```

**Python's unique comparison chaining:**
```python
age = 25

# Other languages need:
print(age >= 18 and age <= 65)   # Works

# Python also supports chaining:
print(18 <= age <= 65)   # Same! More readable.
print(1 < 2 < 3 < 4)    # True - all comparisons must hold
print(1 < 2 > 1.5)      # True - 2 > 1 AND 2 > 1.5
```

#### Examples

```python
# Eligibility checker (without if/else - just showing Boolean results)
username = "alice_2024"
password = "SecurePass123"
age = 25

has_valid_username = len(username) >= 6 and username.replace("_", "").isalnum()
has_valid_password = len(password) >= 8
is_adult = age >= 18

can_register = has_valid_username and has_valid_password and is_adult
print(f"Can register: {can_register}")

# All must be True for registration
```

#### Practice

Build a password validator that checks multiple criteria and displays True/False for each:
- At least 8 characters long
- Contains at least one digit (use any() with comprehension - preview!)
- Does not equal "password" or "123456"

---

### Part 3: Truthy and Falsy Values (30 minutes)

#### Explanation

In Python, every value has a Boolean meaning when used in a conditional context. Values that act like `True` are called **truthy**, values that act like `False` are called **falsy**.

**Falsy values (there are only a few):**
```python
# These all evaluate to False in a boolean context:
bool(False)     # False (obviously)
bool(0)         # False (zero integer)
bool(0.0)       # False (zero float)
bool("")        # False (empty string)
bool(None)      # False (None value)
bool([])        # False (empty list)
bool({})        # False (empty dict)
bool(())        # False (empty tuple)
bool(set())     # False (empty set)
```

**Truthy values (everything else):**
```python
# These all evaluate to True:
bool(True)      # True
bool(1)         # True
bool(-1)        # True (any non-zero number)
bool(42)        # True
bool("hello")   # True (non-empty string)
bool(" ")       # True (space is a character!)
bool([1, 2])    # True (non-empty list)
```

**Practical use:**
```python
# Instead of: if len(name) > 0:
# You can write: if name:
name = input("Enter your name: ")
if name:   # True if not empty
    print(f"Hello, {name}!")
else:
    print("No name entered")

# This is idiomatic Python - more readable
```

#### Examples

```python
# Truthy/falsy in practice
user_input = input("Enter a value (or press Enter to skip): ")

# Check if user entered something
has_input = bool(user_input)
print(f"User provided input: {has_input}")

# Checking scores
scores = [85, 92, 78, 0, 95]
for score in scores:
    if score:   # 0 is falsy!
        print(f"Score {score} is valid")
    else:
        print(f"Score {score} - student absent or invalid")
```

#### Practice

Write a program that demonstrates 5 truthy values and 5 falsy values, using `bool()` to show the Boolean equivalent of each.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Voting Eligibility Checker

Build a complete voter eligibility system:

```python
# Get inputs
name = input("Full name: ")
age = int(input("Age: "))
is_citizen = input("Are you a citizen? (yes/no): ").lower() == "yes"
is_registered = input("Are you registered? (yes/no): ").lower() == "yes"

# Evaluate eligibility
is_old_enough = age >= 18
can_vote = is_old_enough and is_citizen and is_registered

# Display results
print(f"\nEligibility Report for {name}:")
print(f"  Age requirement (18+): {is_old_enough}")
print(f"  Citizenship:           {is_citizen}")
print(f"  Registration:          {is_registered}")
print(f"  CAN VOTE:              {can_vote}")
```

#### Exercise 2: Product Filter

Given product data (name, price, in_stock), create Boolean expressions to filter:
- Products under $50
- Products in stock
- Products in stock AND under $50
- Products out of stock OR over $100 (clearance candidates)

#### Bonus Challenge

**Logic gate simulator:** Implement AND, OR, XOR, NAND, NOR gates using Python's Boolean operators. Display truth tables for each.

---

## Key Takeaways

- `bool` has two values: `True` and `False` (capitalize!)
- Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical operators: `and` (both true), `or` (either true), `not` (reverse)
- Python **comparison chaining**: `18 <= age <= 65` (unique to Python)
- **Falsy**: `False`, `0`, `0.0`, `""`, `None`, `[]`, `{}`, `()`
- Everything else is **truthy**
- `bool(value)` converts any value to True/False

---

## Common Mistakes to Avoid

- **`=` vs `==`**: `age = 18` (assignment), `age == 18` (comparison returning True/False)
- **Case sensitivity**: `True` and `False` must be capitalized (not `true`, `TRUE`, `false`)
- **Assuming `" "` is falsy**: a space character is truthy - only empty string `""` is falsy

---

## Homework

1. Build a "loan qualifier" that evaluates 5 criteria (income, credit score, employment years, debt ratio, down payment) and shows which criteria are met
2. Experiment with comparison chains: what does `1 < 2 < 3 < 4 < 5` return?
3. Research: What is "De Morgan's law" and how does it apply to Python `and`/`or`/`not`?

---

[← Previous](./lesson-04-string-methods-formatting.md) | [Back to Course](./README.md) | [Next →](./lesson-06-type-conversion.md)
