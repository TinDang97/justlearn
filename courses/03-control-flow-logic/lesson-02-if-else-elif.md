# Lesson 2: If-Else & Elif

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use if-else for two-way decisions
- Build multi-way decisions with elif chains
- Understand mutual exclusivity in elif chains
- Avoid common elif logic errors

---

## Prerequisites

- Lesson 1: if statements

---

## Lesson Outline

### Part 1: if-else (30 minutes)

#### Explanation

`if-else` adds a "what to do when the condition is False" branch:

```python
if condition:
    # Runs when condition is True
else:
    # Runs when condition is False
# Exactly ONE branch always runs
```

**Key property:** With if-else, exactly ONE branch always executes. Never both, never neither.

```python
age = 20

if age >= 18:
    print("You can vote!")
else:
    print(f"You'll be able to vote in {18 - age} years.")

# The 'else' catches everything the 'if' doesn't
```

#### Examples

```python
# Password checker
password = input("Enter password: ")

if len(password) >= 8:
    print("✓ Password meets length requirement")
else:
    print(f"✗ Password too short ({len(password)} chars, need 8+)")

# Even/odd
number = int(input("Enter a number: "))

if number % 2 == 0:
    print(f"{number} is even")
else:
    print(f"{number} is odd")
```

#### Practice

Build a bank balance checker: if balance > 0, display "Your account is active with ${balance:.2f}". Else display "Your account is overdrawn by ${abs(balance):.2f}".

---

### Part 2: elif - Multi-Way Decisions (30 minutes)

#### Explanation

`elif` (else-if) lets you test multiple conditions in sequence. Python checks them top to bottom and executes ONLY the FIRST one that's True:

```python
if condition1:
    # Runs if condition1 is True
elif condition2:
    # Runs if condition1 False AND condition2 True
elif condition3:
    # Runs if 1 and 2 False AND condition3 True
else:
    # Runs if ALL conditions above are False
```

**Critical:** Once a True branch is found, Python skips all remaining elif/else.

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"    # This runs (85 >= 80), and Python stops
elif score >= 70:
    grade = "C"    # Skipped
elif score >= 60:
    grade = "D"    # Skipped
else:
    grade = "F"    # Skipped

print(f"Grade: {grade}")  # B
```

#### Examples

```python
# BMI classifier
bmi = float(input("Enter your BMI: "))

if bmi < 18.5:
    category = "Underweight"
    advice = "Consider increasing caloric intake"
elif bmi < 25.0:
    category = "Normal weight"
    advice = "Keep up the good work!"
elif bmi < 30.0:
    category = "Overweight"
    advice = "Consider increasing physical activity"
else:
    category = "Obese"
    advice = "Please consult a healthcare provider"

print(f"Category: {category}")
print(f"Advice: {advice}")

# Traffic light simulator
light = input("Traffic light color (red/yellow/green): ").lower()

if light == "red":
    action = "STOP - Do not cross"
elif light == "yellow":
    action = "SLOW DOWN - Prepare to stop"
elif light == "green":
    action = "GO - Proceed safely"
else:
    action = f"ERROR: Unknown light color '{light}'"

print(f"Action: {action}")
```

#### Practice

Build a coffee shop menu:
- "espresso" → $2.50
- "latte" → $4.00
- "cappuccino" → $4.50
- "americano" → $3.00
- Any other input → "Sorry, we don't have that"

---

### Part 3: elif vs Multiple ifs (30 minutes)

#### Explanation

Understanding when to use `elif` vs separate `if` statements:

```python
# MULTIPLE IFs - all conditions checked independently
score = 75

if score >= 90: print("A")   # Not printed (75 < 90)
if score >= 80: print("B")   # Not printed (75 < 80)
if score >= 70: print("C")   # PRINTED! (75 >= 70)
if score >= 60: print("D")   # ALSO PRINTED! (75 >= 60)
# Output: C and D both print!

# ELIF CHAIN - stops at first True
score = 75

if score >= 90: print("A")
elif score >= 80: print("B")
elif score >= 70: print("C")   # PRINTED (75 >= 70)
elif score >= 60: print("D")   # SKIPPED (C already matched)
# Output: only C prints
```

**Use `elif` when:** conditions are mutually exclusive (only one should apply)
**Use separate `if`s when:** conditions are independent (multiple can apply)

#### Examples

```python
# Case where SEPARATE IFs are correct:
# Multiple characteristics can be true simultaneously
number = 12

if number % 2 == 0:
    print("Even")           # Printed
if number % 3 == 0:
    print("Divisible by 3") # Printed
if number > 10:
    print("Greater than 10") # Printed
# All three should print for 12!

# Case where ELIF is correct:
# Only one category applies
if number < 0:
    print("Negative")
elif number == 0:
    print("Zero")
else:
    print("Positive")
# Only one category is appropriate
```

#### Practice

For each problem, decide if elif or separate ifs is more appropriate, then implement:
1. Checking if a year is a leap year (multiple conditions can be true)
2. Categorizing income into tax brackets (one bracket applies)

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Shipping Cost Calculator

Build a comprehensive shipping calculator:

```python
weight_kg = float(input("Package weight (kg): "))
is_express = input("Express shipping? (yes/no): ").lower() == "yes"
destination = input("Destination (domestic/international): ").lower()

# Base rates:
# 0-0.5 kg: $5
# 0.5-2 kg: $10
# 2-5 kg: $20
# 5+ kg: $35

# Multipliers:
# Express: 1.5x
# International: 2x
# Express + International: 3x

# Calculate and display final price
```

#### Exercise 2: Restaurant Bill Manager

```python
# Collect: item count, subtotal, membership type (gold/silver/none)
# Gold members: 20% discount + free delivery
# Silver members: 10% discount
# Non-members: no discount
# Add 8% tax to discounted price
# If total > $100: offer free dessert message
# Display full receipt with all calculations shown
```

#### Bonus Challenge

**Rock Paper Scissors:** Implement a game where the user picks rock, paper, or scissors, and the computer "picks" based on a hardcoded choice. Display who wins with proper reasoning. Use elif chains for all 9 possible combinations (or find a smarter approach with fewer branches).

---

## Key Takeaways

- `if-else`: exactly one of two branches always runs
- `elif`: test multiple conditions, ONLY first True branch runs
- `elif` vs multiple `if`: use elif when conditions are mutually exclusive
- Common pattern: `if ... elif ... elif ... else` for comprehensive coverage
- The `else` at the end catches all cases not covered by if/elif

---

## Common Mistakes to Avoid

- **Putting elif after else:** `else` must always be last
- **Overlapping conditions with separate ifs:** when you want mutual exclusivity, use elif
- **Missing else for unhandled cases:** add `else: print("Unexpected input")` for robustness

---

## Homework

1. Build a comprehensive grade-to-letter converter with comments, GPA equivalent, and study advice
2. Build a "zodiac sign finder" based on birth month and day (using elif chains)

---

[← Previous](./lesson-01-if-statements.md) | [Back to Course](./README.md) | [Next →](./lesson-03-nested-conditions.md)
