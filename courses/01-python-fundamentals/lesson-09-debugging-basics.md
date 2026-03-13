# Lesson 9: Debugging Basics

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Identify the three types of Python errors: syntax, runtime, and logic errors
- Read and interpret Python error messages
- Use `print()` statements strategically to debug programs
- Apply a systematic debugging process
- Fix at least 5 common beginner programming errors

---

## Prerequisites

- Lessons 1-8: All Python fundamentals

---

## Lesson Outline

### Part 1: Understanding Python Errors (30 minutes)

#### Explanation

Here's a truth: **every programmer encounters bugs. Every single day.** The ability to find and fix bugs is just as important as the ability to write code. In fact, experienced programmers spend as much time debugging as coding.

A **bug** is a mistake in your code that makes it behave incorrectly. The term comes from 1947 when a literal moth got stuck in a Harvard computer's relay switches and caused it to malfunction. Programmer Grace Hopper documented it as the "first actual case of bug being found" - and the term stuck.

**The Three Types of Errors:**

**Type 1: Syntax Errors**
The code violates Python's grammar rules. Python spots these before even running your program.

```python
# Syntax error - Python shows this before running
print("Hello"       # Missing closing parenthesis
pront("Hello")      # Misspelled function name
print "Hello"       # Python 2 style (wrong in Python 3)
```

Error message:
```
  File "program.py", line 1
    print("Hello"
                 ^
SyntaxError: '(' was never closed
```

**Type 2: Runtime Errors**
Syntax is correct, but something goes wrong while running. Python encounters an impossible operation.

```python
# Runtime error - program starts, then crashes mid-execution
age = int(input("Enter your age: "))
# If user types "abc" instead of a number:
# ValueError: invalid literal for int() with base 10: 'abc'

# Or:
number = 10
result = number / 0
# ZeroDivisionError: division by zero
```

**Type 3: Logic Errors**
Python runs without crashing, but the output is wrong. These are the hardest to find.

```python
# Logic error - runs fine, but gives wrong answer
# Supposed to calculate average of 5 grades:
average = (80 + 90 + 75 + 85 + 95) / 4   # WRONG! Should divide by 5
print(f"Average: {average}")              # Shows 106.25 (wrong!)
# Python doesn't know dividing by 4 is wrong - it just does what you said
```

> **Teacher's Note:** Understanding error types helps students know where to look. Syntax → read the error line number. Runtime → add defensive code. Logic → add print statements to trace values.

#### Examples

**Reading error messages - the 5-step approach:**

```
Traceback (most recent call last):
  File "calculator.py", line 8, in <module>
    result = first_number / second_number
ZeroDivisionError: division by zero
```

Step 1: Look at the **last line** - it tells you what went wrong: `ZeroDivisionError: division by zero`
Step 2: Look at the **file name**: `calculator.py`
Step 3: Look at the **line number**: `line 8`
Step 4: Look at the **specific code** that failed: `result = first_number / second_number`
Step 5: Go to that line in your file and investigate

#### Practice

**Error identification exercise:**
Identify whether each is a syntax, runtime, or logic error:

```python
# Error 1:
print("The answer is " + 42)

# Error 2:
primt("Hello")

# Error 3:
temperature_f = temperature_c * 1.8 + 32
# (wrong - should be: (celsius * 9/5) + 32)
# Actually: 1.8 is 9/5, so this might be right... test it!

# Error 4:
name = input("Name: "
```

---

### Part 2: Common Error Messages and Their Fixes (30 minutes)

#### Explanation

Python has many different error types. Here are the ones you'll see most often as a beginner:

**NameError:** Using a variable that doesn't exist yet
```python
print(my_name)   # NameError: name 'my_name' is not defined
# Fix: Define the variable first
my_name = "Alice"
print(my_name)
```

**TypeError:** Wrong type of data for an operation
```python
age = input("Age: ")    # age is a string like "25"
doubled = age * 2       # Result: "2525" - string repetition!
# Fix: Convert to int first
age = int(input("Age: "))
doubled = age * 2       # Now: 50 - math!

# Another TypeError:
result = "Hello" + 5    # TypeError: can only concatenate str (not "int") to str
# Fix: Convert 5 to string
result = "Hello" + str(5)    # "Hello5"
```

**ValueError:** Correct type, wrong value
```python
age = int("hello")      # ValueError: invalid literal for int() with base 10: 'hello'
# Fix: Validate input before converting (we'll learn this in Course 3)
```

**IndexError:** Trying to access a position that doesn't exist
```python
name = "Hi"
print(name[10])    # IndexError: string index out of range
# "Hi" only has positions 0 and 1 (or -2 and -1)
```

**ZeroDivisionError:** Dividing by zero
```python
result = 10 / 0   # ZeroDivisionError: division by zero
# Fix: Check before dividing (Course 3)
```

> **Common Question:** "There are so many different error types - do I need to memorize them all?"
> No! You'll naturally learn the common ones from experience. Whenever you see a new error, Google "Python [ErrorName]" and you'll find an explanation and fix within seconds. Googling errors is normal, professional behavior.

#### Examples

**Error fix workshop:**
```python
# Program with multiple bugs - fix them all:

name = input("Your name: )          # Bug 1
age = input("Your age: ")
years_until_100 = 100 - age         # Bug 2
print("Hello" name)                 # Bug 3
print(f"You'll turn 100 in {years_until_100 years}")  # Bug 4
```

**Fixed version:**
```python
name = input("Your name: ")              # Bug 1: missing closing quote
age = int(input("Your age: "))           # Bug 2: need int() for math
years_until_100 = 100 - age
print("Hello", name)                     # Bug 3: missing comma
print(f"You'll turn 100 in {years_until_100} years")  # Bug 4: missing closing brace
```

---

### Part 3: Print Debugging (30 minutes)

#### Explanation

The most powerful debugging tool for beginners is the humble `print()` statement. It's also what experienced programmers fall back to when other tools fail.

**Print debugging:** Add temporary `print()` statements to see what values your variables hold at various points in the program.

**The debugging mindset:**
- "This program is wrong. Let me find exactly WHERE it goes wrong."
- Add prints to check each variable
- Narrow down the problem
- Remove debug prints when done

**Debug print format:**
```python
# Standard: print the variable name and value together
print(f"DEBUG: variable_name = {variable_name}")

# This way you know WHICH variable you're looking at
```

#### Examples

**Finding a logic bug with print debugging:**

```python
# A grade average calculator with a bug:
grade1 = float(input("Grade 1: "))
grade2 = float(input("Grade 2: "))
grade3 = float(input("Grade 3: "))

total = grade1 + grade2
average = total / 3

print(f"Your average is: {average:.1f}")
```

Let's say user enters 80, 90, 100. Expected average: 90. Actual output: 56.7 - clearly wrong!

Adding debug prints:
```python
grade1 = float(input("Grade 1: "))
grade2 = float(input("Grade 2: "))
grade3 = float(input("Grade 3: "))

print(f"DEBUG: grade1 = {grade1}")   # Check: 80.0 ✓
print(f"DEBUG: grade2 = {grade2}")   # Check: 90.0 ✓
print(f"DEBUG: grade3 = {grade3}")   # Check: 100.0 ✓

total = grade1 + grade2
print(f"DEBUG: total = {total}")     # Shows: 170.0 ← BUG FOUND! grade3 not included!

average = total / 3
print(f"DEBUG: average = {average}") # Shows: 56.7

print(f"Your average is: {average:.1f}")
```

The debug prints reveal: `total = 170` (should be 270). Bug: `grade3` was never added to total!

**The fix:**
```python
total = grade1 + grade2 + grade3    # Fixed!
```

> **Teacher's Note:** Walk through this entire process live. The "aha moment" when students see the bug in the debug output is very satisfying. Make sure everyone adds debug prints to their own programs.

#### Practice

**Debug this program:**
The following program is supposed to calculate how many weeks and days until an event, but gives wrong answers:

```python
days_until_event = int(input("Days until the event: "))
weeks = days_until_event / 7
remaining_days = days_until_event - weeks
print(f"That's {weeks} weeks and {remaining_days} days")
```

Add debug prints to find the bugs. There are 2 bugs. Fix them.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Bug Hunt

The following programs all have bugs. Use debug prints to find and fix every bug:

**Buggy Program 1:**
```python
# Should print: "Alice is 25 years old and will be 35 in 10 years"
name = "Alice"
age = "25"
future_age = age + 10
print(f"{name} is {age} years old and will be {future_age} in 10 years")
```

**Buggy Program 2:**
```python
# Should calculate the area of a rectangle
length = float(input("Length: "))
width = float(input("Width: "))
area = length + width    # This is wrong
print(f"Area: {area}")
```

**Buggy Program 3:**
```python
# Should reverse a string
word = input("Enter a word: ")
reversed_word = word[1:]   # This is wrong
print(f"Reversed: {reversed_word}")
```

#### Exercise 2: Defensive Programming

Take any program from a previous lesson. Try to "break" it by entering unexpected inputs:
- Enter text when a number is expected
- Enter 0 where it might cause problems
- Enter a very large number
- Press Enter without typing anything

Document each test case:
- What you entered
- What happened (error message or wrong output)
- What the correct behavior should be

This is called **testing** - and it's a crucial professional skill we'll develop more in Course 12.

#### Bonus Challenge

**Write a buggy program for a classmate:**
Write a working program, then intentionally introduce 3-4 bugs (mix of syntax, runtime, and logic errors). Swap with a classmate and see who can find and fix all the bugs fastest.

Keep a record of:
1. What bugs you introduced and where
2. What bugs your classmate found and fixed
3. Were any bugs NOT found? Why?

---

## Key Takeaways

- **Three error types**: Syntax (grammar), Runtime (crashes during execution), Logic (wrong output)
- **Read error messages top to bottom**: last line = error type, middle = file and line number
- **Print debugging**: add temporary `print(f"DEBUG: var = {var}")` statements to trace values
- The debugging process: reproduce → locate → understand → fix → verify
- **Googling error messages** is normal and professional
- Every programmer has bugs - the skill is finding and fixing them efficiently

---

## Common Mistakes to Avoid

- **Ignoring the error message:** The error message tells you exactly what's wrong - read it carefully
- **Fixing the wrong thing:** Make sure you understand WHY the fix works, not just that it does
- **Leaving debug prints in production code:** Remove all `print("DEBUG:...")` before submitting
- **Changing multiple things at once:** When debugging, change ONE thing at a time. Otherwise you don't know what fixed it.

---

## Homework / Self-Study

1. **Debug log:** For the next week, every time you get an error, write it down: what the error was, what caused it, how you fixed it. After 10 entries, you'll start recognizing patterns.

2. **Intentional errors:** Take a working program and intentionally introduce each type of error (syntax, runtime, logic). Fix them. This builds pattern recognition.

3. **Research:** Look up "Python traceback how to read" - there are good visual guides that show you exactly how to interpret complex error messages.

---

## Next Lesson Preview

In **Lesson 10: Course 1 Review & Mini Project**, we'll:
- Review all concepts from Course 1
- Build a complete personal calculator application
- Apply everything you've learned in one polished project
- Prepare for Course 2

---

[← Previous Lesson](./lesson-08-simple-programs-workshop.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-10-course-review-mini-project.md)
