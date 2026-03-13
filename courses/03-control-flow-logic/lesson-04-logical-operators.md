# Lesson 4: Logical Operators (and/or/not)

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use `and`, `or`, `not` to build complex conditions
- Understand short-circuit evaluation and its practical use
- Apply De Morgan's laws to simplify conditions
- Avoid common logical operator errors

---

## Prerequisites

- Lessons 1-3

---

## Lesson Outline

### Part 1: and, or, not in Conditions (30 minutes)

#### Explanation

Logical operators combine multiple Boolean expressions into one:

```python
# AND: both must be True
age = 25
income = 60000
if age >= 18 and income >= 50000:
    print("Eligible for premium card")

# OR: at least one must be True
is_student = True
is_senior = False
if is_student or is_senior:
    print("Discounted ticket: $8")

# NOT: reverse the boolean
is_banned = False
if not is_banned:
    print("Welcome! You can access this content.")
```

**Truth tables (commit these to memory):**
```
AND:  True and True  → True
      True and False → False
      False and True → False
      False and False → False

OR:   True or True   → True
      True or False  → True
      False or True  → True
      False or False → False

NOT:  not True  → False
      not False → True
```

#### Examples

```python
# Comprehensive user validation
username = input("Username: ").strip()
password = input("Password: ").strip()
confirm = input("Confirm password: ").strip()

username_valid = len(username) >= 4 and username.isalnum()
password_valid = len(password) >= 8
passwords_match = password == confirm

if username_valid and password_valid and passwords_match:
    print("Account created successfully!")
else:
    if not username_valid:
        print("✗ Username must be 4+ alphanumeric characters")
    if not password_valid:
        print("✗ Password must be 8+ characters")
    if not passwords_match:
        print("✗ Passwords do not match")
```

#### Practice

Build a "loan pre-qualification" checker with 4 conditions combined using and/or.

---

### Part 2: Short-Circuit Evaluation (30 minutes)

#### Explanation

Python evaluates logical expressions **lazily** - it stops as soon as the result is known:

```python
# AND short-circuits on first False:
False and (expensive_function())   # expensive_function() never called!

# OR short-circuits on first True:
True or (expensive_function())     # expensive_function() never called!
```

**Practical uses:**

```python
# Safe division (check before dividing)
denominator = 0
if denominator != 0 and 100 / denominator > 10:   # safe - won't divide by zero
    print("Result is large")

# Null check before accessing attributes
user = None
if user is not None and user.get("name") == "Alice":
    print("Hello Alice")

# Default values using 'or'
name = input("Name (press Enter for 'Guest'): ") or "Guest"
print(f"Welcome, {name}!")
# If user presses Enter, name = "" (falsy), so "Guest" is used
```

**Python's or returns the actual value, not just True/False:**
```python
x = None
y = 0
z = "Hello"

print(x or y or z)   # "Hello" (returns first truthy value)
print(x or y)        # 0 (returns last value even if both falsy)

# Use this for default values:
config_value = user_input or default_value or fallback_value
```

#### Examples

```python
# Chaining for defaults
user_color = None
system_color = ""
default_color = "blue"

chosen_color = user_color or system_color or default_color
print(f"Using color: {chosen_color}")   # blue

# Safe member access
user_data = {"name": "Alice", "age": 28}
name = user_data.get("name") or "Anonymous"
phone = user_data.get("phone") or "No phone"
```

#### Practice

Rewrite a previous program that uses nested conditions, simplifying to combined logical operators where possible.

---

### Part 3: De Morgan's Laws (30 minutes)

#### Explanation

De Morgan's Laws let you transform `not (A and B)` into `not A or not B` (and vice versa):

```
not (A and B)  ≡  (not A) or (not B)
not (A or B)   ≡  (not A) and (not B)
```

```python
# These are equivalent:
if not (is_banned or is_inactive):
    grant_access()

if not is_banned and not is_inactive:
    grant_access()
```

**Why does this matter?**
Sometimes the negated form is clearer. Learn to recognize and use whichever reads more naturally.

```python
# Example: "Is the input NOT a letter?"
char = input("Enter a character: ")

# Option 1:
if not char.isalpha():
    print("Not a letter!")

# Option 2 (equivalent):
if char.isdigit() or char.isspace() or not char.isalnum():
    print("Not a letter!")

# Option 1 is clearer here - use not when it's simpler
```

#### Examples

```python
# Password strength: NOT (too short OR all digits OR all lowercase)
password = input("Password: ")

too_short = len(password) < 8
all_digits = password.isdigit()
all_lower = password.islower()

# "Strong" means none of those bad things are true:
is_strong = not (too_short or all_digits or all_lower)

# Equivalent:
is_strong = not too_short and not all_digits and not all_lower

print(f"Password strong: {is_strong}")
```

#### Practice

Write the same condition in 3 equivalent ways using De Morgan's laws.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Comprehensive Form Validation

Build a user registration form with these validation rules:
- Username: 4-20 chars, alphanumeric + underscore only
- Email: must contain @ and a dot after @
- Password: 8+ chars, not equal to username
- Age: between 13 and 120
- Accept terms: must be "yes"

Display specific errors for each failing validation.

#### Exercise 2: Smart Search Filter

Simulate a product search filter:
- User can specify: min_price, max_price, category, in_stock (optional)
- A product "matches" if: price in range AND (category matches OR no category specified) AND (in_stock matches OR in_stock not specified)

#### Bonus Challenge

**Logic puzzle solver:** Implement the "Farmer crossing" puzzle logic:
- A farmer has a fox, a chicken, and grain
- Can't leave fox+chicken alone, can't leave chicken+grain alone
- Validate each "move" the user attempts

---

## Key Takeaways

- `and`: all conditions must be True
- `or`: at least one condition must be True
- `not`: reverses True/False
- **Short-circuit**: `and` stops on first False; `or` stops on first True
- `x = a or b or default` - returns first truthy value, or last value
- **De Morgan's**: `not (A and B)` ≡ `not A or not B`

---

## Common Mistakes to Avoid

- **`0 < x < 10` is fine in Python** (chaining), but `0 < x and x < 10` is equivalent
- **Short-circuit side effects**: `x or y` might not evaluate `y` - be aware
- **Precedence**: `not` > `and` > `or` - use parentheses when in doubt

---

## Homework

1. Build a "flight booking eligibility" checker with 6+ conditions using all three operators
2. Research: What is "truth table" and draw all truth tables for and/or/not by hand

---

[← Previous](./lesson-03-nested-conditions.md) | [Back to Course](./README.md) | [Next →](./lesson-05-while-loops.md)
