# Lesson 7: Comments & Code Style

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Write single-line and multi-line comments in Python
- Explain why comments and readable code matter
- Apply basic PEP 8 style guidelines
- Use consistent naming conventions for variables
- Recognize the difference between well-written and poorly-written code

---

## Prerequisites

- Lessons 1-6: All fundamentals so far

---

## Lesson Outline

### Part 1: Comments - Talking to Future You (30 minutes)

#### Explanation

Imagine you write a Python program today. Six months later, you open it and think: "What does this code do? Why did I write it this way?" Without comments, you're a stranger to your own code.

A **comment** is a note you leave in your code for yourself and other programmers. Python completely ignores comments when running the program - they exist purely for humans.

Comments are NOT optional. Professional programmers comment their code. Companies require it. Teams depend on it. Start the habit now.

**When to comment:**
- Explain WHY you did something (not just what)
- Explain complex logic
- Add section headers in long programs
- Explain formulas and calculations
- Mark TODOs for future work

**When NOT to comment:**
- Don't state the obvious: `x = 5  # set x to 5` (useless)
- Don't comment every line
- Comments should add understanding, not repeat the code

#### Examples

```python
# This is a single-line comment
# Python ignores everything from # to the end of the line

print("Hello")  # This comment is at the end of a line

# BAD comment (obvious, adds nothing):
x = 5  # set x to 5

# GOOD comment (explains WHY):
# Sales tax rate for California (as of 2024 tax year)
TAX_RATE = 0.0725

# GOOD comment (explains complex logic):
# Convert seconds to HH:MM:SS format
# 3661 seconds → 1:01:01 (1 hour, 1 minute, 1 second)
hours = total_seconds // 3600
minutes = (total_seconds % 3600) // 60
seconds = total_seconds % 60
```

**Multi-line comments (docstrings):**
For longer explanations, use triple quotes:
```python
"""
This program calculates the monthly payment for a loan.

Inputs:
    - Principal amount (how much you borrowed)
    - Annual interest rate (as a percentage)
    - Loan term (number of months)

Output:
    Monthly payment amount

Author: Alice Johnson
Date: 2024-01-15
"""

# Program code starts here...
```

> **Teacher's Note:** Show students a real piece of uncommented code versus well-commented code. Ask: "Which would you rather inherit from a colleague?" The answer is always clear.

#### Practice

**Comment audit:**
Take a program you wrote in a previous lesson. Add meaningful comments:
- A block comment at the top explaining what the program does
- Inline comments explaining any non-obvious lines
- Section headers for different parts of the program

---

### Part 2: PEP 8 - Python's Style Guide (30 minutes)

#### Explanation

**PEP 8** is the official Python style guide. "PEP" stands for "Python Enhancement Proposal" and number 8 is the style guide. It's a document that describes how Python code should be formatted so all Python code looks consistent, whether written by you, by Google, or by Netflix.

You don't need to memorize it - you need to form good habits. The key rules for beginners:

**Indentation:** Use 4 spaces (not tabs, not 2 spaces, not 8 spaces - 4 spaces)
```python
# We haven't learned indentation yet, but this is what it looks like:
if True:
    print("4 spaces of indentation")   # 4 spaces
    print("Always consistent")          # 4 spaces
```

**Line length:** Keep lines under 79 characters (about the width of a printed page)
```python
# TOO LONG - hard to read:
result = some_very_long_function_name(argument_one, argument_two, argument_three, argument_four)

# BETTER - break it up:
result = some_very_long_function_name(
    argument_one,
    argument_two,
    argument_three,
    argument_four
)
```

**Blank lines:** Use them for readability
```python
# Related code groups together, blank lines between groups
name = input("Name: ")
age = input("Age: ")

# Process the data
name = name.strip().title()

# Display results
print(f"Hello, {name}!")
```

**Spaces around operators:**
```python
# GOOD: spaces around operators
x = 5 + 3
y = x * 2
name = "Alice"

# BAD: no spaces (hard to read)
x=5+3
y=x*2
name="Alice"
```

#### Examples

**Naming conventions - the most important style rule:**

Variable names should be descriptive and use `snake_case` (words separated by underscores):

```python
# BAD: Unclear names
x = 42
y = "John"
z = 3.14
n = 5

# GOOD: Descriptive names
student_age = 42
student_name = "John"
pi_value = 3.14
num_students = 5

# BAD: camelCase (not Python style)
studentAge = 42      # This is Java/JavaScript style
FirstName = "Alice"  # This looks like a class name

# GOOD: snake_case (Python style)
student_age = 42
first_name = "Alice"

# Constants (values that never change): ALL_CAPS_WITH_UNDERSCORES
MAX_STUDENTS = 300
TAX_RATE = 0.20
SPEED_OF_LIGHT = 299792458  # meters per second
```

**Before and after:**
```python
# BEFORE (bad style):
n=input("enter ur name: ")
a=int(input("enter age: "))
print("hello "+n+" ur "+str(a)+" years old")

# AFTER (good style):
# Get student information
student_name = input("Enter your name: ")
student_age = int(input("Enter your age: "))

# Display personalized greeting
print(f"Hello, {student_name}! You are {student_age} years old.")
```

> **Common Question:** "Does Python care about style? Will it run bad-style code?"
> Python will run ugly code just fine. Style is for humans. But in a job, your team will reject poorly-styled code in code review. Starting with good habits now is much easier than fixing bad habits later.

#### Practice

**Style makeover:**
Rewrite this poorly-styled code to follow PEP 8:
```python
x=input("whats ur name")
Y=input("age")
Z=float(input("gpa"))
print("name: "+x+" age: "+Y+" gpa: "+str(Z))
```

---

### Part 3: Writing Readable Code (30 minutes)

#### Explanation

Beyond comments and PEP 8, there's a philosophy: **code is read far more often than it is written**. Write code for the reader, not just to make the computer work.

**Choose good names:**
```python
# Bad: What is d? What is n? What is r?
d = 1000
n = 12
r = 0.05
m = d * (r/n) / (1 - (1 + r/n)**(-n*12))

# Good: The code is self-documenting
loan_principal = 1000
payments_per_year = 12
annual_interest_rate = 0.05
monthly_payment = loan_principal * (annual_interest_rate/payments_per_year) / \
                  (1 - (1 + annual_interest_rate/payments_per_year)**(-payments_per_year * 12))
```

**Use constants for magic numbers:**
```python
# Bad: What is 0.0725? Why 365?
final_price = price * 1.0725
daily_rate = annual_rate / 365

# Good: Named constants explain the meaning
CALIFORNIA_SALES_TAX = 0.0725
DAYS_IN_YEAR = 365

final_price = price * (1 + CALIFORNIA_SALES_TAX)
daily_rate = annual_rate / DAYS_IN_YEAR
```

**Organize code logically:**
```python
"""
Program: Loan Payment Calculator
Purpose: Calculate monthly payment for a fixed-rate loan
Author: Student Name
Date: 2024-01
"""

# ========================
# CONSTANTS
# ========================
MONTHS_IN_YEAR = 12

# ========================
# GET USER INPUT
# ========================
print("=== Loan Payment Calculator ===")
loan_amount = float(input("Loan amount ($): "))
annual_rate = float(input("Annual interest rate (%): "))
loan_years = int(input("Loan term (years): "))

# ========================
# CALCULATIONS
# ========================
monthly_rate = (annual_rate / 100) / MONTHS_IN_YEAR
num_payments = loan_years * MONTHS_IN_YEAR

# Standard loan payment formula
monthly_payment = loan_amount * (monthly_rate * (1 + monthly_rate)**num_payments) \
                  / ((1 + monthly_rate)**num_payments - 1)

total_paid = monthly_payment * num_payments
total_interest = total_paid - loan_amount

# ========================
# DISPLAY RESULTS
# ========================
print(f"\nLoan Summary:")
print(f"  Principal:       ${loan_amount:,.2f}")
print(f"  Monthly Payment: ${monthly_payment:,.2f}")
print(f"  Total Paid:      ${total_paid:,.2f}")
print(f"  Total Interest:  ${total_interest:,.2f}")
```

#### Practice

**Write and organize a new program:**
Pick any real-world calculation (temperature converter, body mass index, compound interest) and write it with:
- A docstring at the top
- Section headers with comments
- Descriptive variable names
- Proper spacing and formatting
- No "magic numbers" - use named constants

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Code Review

Here is a working but poorly-written program. Rewrite it to be professional quality:

```python
x=float(input("c: "))
y=x*1.8+32
z=x+273.15
print("f: "+str(y))
print("k: "+str(z))
```

Your improved version should:
- Have a descriptive header comment
- Use proper variable names
- Follow PEP 8 spacing
- Have output that explains what each number means
- Be something you'd be proud to show in a job interview

#### Exercise 2: Well-Documented Calculator

Write a complete, well-documented simple calculator:
- Must include a program header (docstring)
- Must have section comments (INPUT, CALCULATIONS, OUTPUT)
- All variables must be descriptively named
- Must calculate at least 4 operations (add, subtract, multiply, divide)
- Must display results with labels

#### Bonus Challenge

**Style police:** Find 3 examples of Python code online (try python.org examples, or a coding tutorial). Analyze each one:
- Does it follow PEP 8?
- Are variable names descriptive?
- Are there useful comments?
- Would you understand this code in 6 months?

Write a brief critique of each (2-3 sentences).

---

## Key Takeaways

- **Comments** explain your code to humans - Python ignores them
- Use `#` for single-line comments and `"""..."""` for multi-line descriptions
- **PEP 8** is Python's official style guide - read it once, then develop good habits
- Use **snake_case** for variable names: `student_name`, not `studentName`
- Use **ALL_CAPS** for constants: `TAX_RATE = 0.20`
- **Descriptive names** make code self-documenting
- Organize code into logical sections with blank lines and section comments

---

## Common Mistakes to Avoid

- **Commenting the obvious:** `x = 5  # set x to 5` is not a useful comment
- **Over-commenting:** Don't explain every line - only what needs explanation
- **Cryptic names:** `x`, `temp`, `val`, `data` are often too vague - be specific
- **Inconsistent style:** Pick a style and stick with it throughout your program

---

## Homework / Self-Study

1. **Read:** Skim the key sections of PEP 8 at peps.python.org/pep-0008 - focus on "Naming Conventions" and "Comments" sections.

2. **Refactor:** Pick any program from Lessons 3-6. Rewrite it completely with good style, comments, and descriptive names. It should look like professional code.

3. **Reflect:** Write a comment at the top of each of your previous programs (now that you know how). Even if the comment just says "This program calculates X", it's better than nothing.

---

## Next Lesson Preview

In **Lesson 8: Simple Programs Workshop**, we'll:
- Build 3 complete, polished programs from scratch
- Apply everything from Lessons 1-7 together
- Practice the full development process (think → plan → code → test → improve)
- Work in pairs to review each other's code

---

[← Previous Lesson](./lesson-06-strings-basics.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-08-simple-programs-workshop.md)
