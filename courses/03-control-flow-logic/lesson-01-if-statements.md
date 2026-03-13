# Lesson 1: If Statements

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Write correct if statements in Python
- Understand indentation as Python's block delimiter
- Use any Boolean expression as a condition
- Trace program execution through conditional branches

---

## Prerequisites

- Courses 1-2: Python basics, variables, types, booleans

---

## Lesson Outline

### Part 1: The if Statement (30 minutes)

#### Explanation

An **if statement** lets your program make decisions: "IF this condition is true, THEN execute these lines."

Before if statements, your programs always did the same thing. With if statements, they can respond differently to different situations.

**Syntax:**
```python
if condition:
    # Code here runs ONLY IF condition is True
    # This is called the "body" of the if statement
    # The 4-space indent is REQUIRED - it defines the block
```

**Critical rule: indentation defines blocks**
Python uses indentation (whitespace) to define code blocks. This is unique - most languages use `{}`. The standard is 4 spaces.

```python
score = 85

if score >= 60:
    print("You passed!")
    print("Congratulations!")   # Also inside the if block (same indent)

print("End of program")  # Always runs (not indented)
```

#### Examples

```python
# Temperature warning system
temperature = 38.5  # Body temperature in Celsius

if temperature > 37.5:
    print("WARNING: Fever detected!")
    print(f"Temperature: {temperature}°C")
    print("Please see a doctor.")

print("Check complete.")

# Checking login
is_logged_in = True
username = "alice"

if is_logged_in:
    print(f"Welcome back, {username}!")
    print("Your dashboard is ready.")

# Using input
age = int(input("Enter your age: "))

if age >= 18:
    print("You are an adult.")
    print("You can vote!")
```

> **Teacher's Note:** Demonstrate what happens with WRONG indentation. Show IndentationError. This is where many beginners struggle - Python is strict. VS Code's auto-indent helps enormously.

#### Practice

Write programs that:
1. Check if a number is positive
2. Check if a password is at least 8 characters
3. Check if a temperature is above boiling (100°C)

---

### Part 2: Truthy/Falsy in if Statements (30 minutes)

#### Explanation

Remember truthy and falsy from Course 2? Any expression can be used as an if condition:

```python
# Checking non-empty strings
name = input("Enter your name (or press Enter to skip): ")

if name:   # True if name has content, False if empty
    print(f"Hello, {name}!")

# Checking non-zero numbers
balance = float(input("Your bank balance: "))

if balance:    # True if non-zero
    print(f"You have ${balance:.2f}")

# More Pythonic than: if balance != 0:
```

**One-liner if (only for very simple cases):**
```python
# Inline if (ternary expression)
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # adult

# Only use when it's clearly readable
x = 5
absolute = x if x >= 0 else -x
```

#### Examples

```python
# Input validation pattern
username = input("Username (min 4 chars): ").strip()

if len(username) >= 4:
    print(f"Username '{username}' accepted!")

if not username:
    print("Error: Username cannot be empty!")

# Multiple checks
email = input("Email: ").strip()

if "@" in email:
    print("Email format looks valid")

if email.endswith(".com") or email.endswith(".org"):
    print("Common domain recognized")
```

#### Practice

Build a "form validator" that checks: name not empty, age between 1-150, email contains @.

---

### Part 3: Common if Patterns (30 minutes)

#### Explanation

Learn to recognize these common patterns:

```python
# Pattern 1: Guard clause (validate early)
password = input("Password: ")

if len(password) < 8:
    print("Error: Password too short!")
    # In a function, you'd put 'return' here

# Pattern 2: Threshold checking
score = int(input("Score (0-100): "))

if score >= 90:
    print("Excellent!")

if score >= 80:   # This runs independently of above
    print("Above average")  # Wait... this logic might be wrong. We need elif (next lesson)
```

#### Examples

```python
# Practical example: ticket pricing
age = int(input("Your age: "))

# Regular ticket price
ticket_price = 25.00

if age < 5:
    ticket_price = 0     # Free for toddlers

if age >= 60:
    ticket_price = 15.00  # Senior discount

if age < 12:
    ticket_price = 12.00  # Child price

print(f"Your ticket price: ${ticket_price:.2f}")
# Wait - what happens if age is 8? It first goes to 0... no wait age isn't < 5...
# Hmm, 8 < 12 → $12.00. Let's trace it.
# This is why elif is better (next lesson)!
```

> **Teacher's Note:** Show this example as a "bug" - what if age = 70? It first sets $15 (senior), then doesn't change (not < 12). But this is fragile - explain why separate ifs can lead to unintended behavior. This motivates elif.

#### Practice

Write a delivery fee calculator: free if order > $50, $5 if order > $25, $10 otherwise (using only `if` - notice the problems, which elif in the next lesson will solve).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Grade Announcement

```python
score = int(input("Enter your exam score (0-100): "))

# Using only if statements (no elif yet), display:
# - "Excellent!" if >= 90
# - "Good work!" if >= 80
# - "Passed!" if >= 60
# - "Better luck next time" if < 60
# Notice the problem with overlapping conditions...
```

#### Exercise 2: Smart Thermostat

Build a thermostat that shows recommendations:
- Below 18°C: "Turn on heating"
- Above 26°C: "Turn on cooling"
- Between 22-26°C: "Perfect temperature!"
- Humidity (input separately): if > 70%, "High humidity alert"

#### Bonus Challenge

Build a "number classifier" that displays ALL properties of a number:
- Positive/negative/zero
- Even/odd
- Divisible by 3 and/or 5
- Perfect square (hint: `import math; math.sqrt(n) == int(math.sqrt(n))`)
- Above/below 100

---

## Key Takeaways

- `if condition:` - executes the indented block ONLY when condition is True
- **Indentation (4 spaces)** defines code blocks - Python requires it
- Any truthy/falsy expression works as a condition
- Multiple `if` statements are independent - all are checked
- Ternary: `value = x if condition else y`

---

## Common Mistakes to Avoid

- **Missing colon:** `if x > 0` → should be `if x > 0:`
- **Wrong indentation:** mixed spaces/tabs, or inconsistent indentation
- **Using `=` instead of `==`:** `if x = 5:` is a SyntaxError (assignment inside condition)

---

## Homework

1. Build a "movie ticket price calculator" with different prices based on age and day of week
2. Write a program that checks 5 different properties of any number

---

[Back to Course](./README.md) | [Next →](./lesson-02-if-else-elif.md)
