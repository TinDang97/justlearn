# Lesson 3: Your First Python Program

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Write a multi-line Python program from scratch
- Understand what happens when Python executes code line by line
- Read and understand basic Python syntax errors
- Use `print()` with different types of data
- Explain what a "string" is and why quotes are needed

---

## Prerequisites

- Lesson 1: What is Programming?
- Lesson 2: Python and VS Code are installed and working

---

## Lesson Outline

### Part 1: The Hello World Tradition (30 minutes)

#### Explanation

In programming, every journey begins with "Hello, World!" - a program that simply displays those words on screen. It's a tradition going back to 1972, used by programmers worldwide to verify that a new environment is working. When you write Hello World, you're joining a global tradition of millions of programmers before you.

But more importantly, Hello World teaches us the fundamental structure of a Python program.

**The anatomy of a Python program:**
- A Python program is a plain text file ending in `.py`
- It contains Python statements - instructions for the computer
- Python reads and executes statements from top to bottom
- Each line is typically one statement
- Blank lines are allowed and encouraged for readability

#### Examples

**The simplest Python program:**
```python
print("Hello, World!")
```

That's it. One line. This complete, functional program will display `Hello, World!` when run.

Let's understand each part:
- `print` - a built-in Python function that displays output
- `(` and `)` - parentheses tell Python "these are the inputs to print"
- `"Hello, World!"` - the text we want to display (called a **string**)
- The quotes tell Python "this is text, not a command"

**A slightly more interesting program:**
```python
# My first Python program
# Written by: [your name]

print("Hello, World!")
print("My name is Alex.")
print("I am learning Python.")
print("This is exciting!")
```

When run, this displays:
```
Hello, World!
My name is Alex.
I am learning Python.
This is exciting!
```

**Programs run top to bottom:**
```python
print("I run first")
print("I run second")
print("I run third")

# Output (in order):
# I run first
# I run second
# I run third
```

> **Teacher's Note:** Have every student write and run Hello World right now. Don't move on until every hand is raised showing they've seen the output. This is the first victory and it should feel like one.

#### Practice

**Your turn:** Create a file called `hello.py` and write a program that prints:
- Your name
- Your city
- One thing you want to learn in this course

Run it. Show your neighbor. Celebrate.

---

### Part 2: Understanding Syntax (30 minutes)

#### Explanation

**Syntax** is the set of rules that define how Python code must be written. Just like English has grammar rules ("I am" not "Am I" as a statement), Python has syntax rules.

The good news: Python's syntax is very clean and minimal. The bad news: computers are completely unforgiving about syntax. One wrong character = program crashes.

**The most common syntax error beginners make:** Forgetting quotes around text.

```python
# WRONG - Python tries to find a variable named Hello
print(Hello)
# Error: NameError: name 'Hello' is not defined

# RIGHT - quotes tell Python this is text
print("Hello")
# Output: Hello
```

**What is a string?**
A **string** is Python's term for text. Any text in your program must be wrapped in quotes (either single `'` or double `"`). The quotes themselves are not displayed - they're just Python's way of knowing "this is text, not a command."

```python
# Both of these work - single or double quotes
print("Hello")     # Double quotes
print('Hello')     # Single quotes - same result

# When to use which:
print("It's a beautiful day")   # Single quote IN the text → use double quotes
print('She said "hi"')          # Double quote IN the text → use single quotes
```

#### Examples

**Reading error messages:**
Python error messages look scary but they're actually helpful once you know how to read them.

```python
# This code has an error:
print("Hello, World!"
```

Python's error message:
```
  File "hello.py", line 1
    print("Hello, World!"
                         ^
SyntaxError: '(' was never closed
```

How to read this:
- `File "hello.py"` - tells you which file has the problem
- `line 1` - tells you which line the problem is on
- The `^` (caret) points to where Python got confused
- `SyntaxError: '(' was never closed` - tells you what's wrong

Common errors and their fixes:

```python
# Error 1: Missing closing parenthesis
print("Hello"     # Fix: print("Hello")

# Error 2: Missing quotes
print(Hello)      # Fix: print("Hello")

# Error 3: Wrong capitalization
Print("Hello")    # Fix: print("Hello")
# (Python is case-sensitive: print ≠ Print ≠ PRINT)

# Error 4: Mixing quote types
print("Hello')    # Fix: print("Hello") or print('Hello')
```

> **Common Question:** "Is there a way to know all the rules before I start?"
> No, and that's okay! Nobody memorizes all the rules. You learn them by making mistakes and reading error messages. Error messages are your friends.

#### Practice

**Debug these programs (find and fix the errors):**
```python
# Program 1 - Find the error(s):
print("Welcome to Python"
print('My name is Bob)
print("I love coding!")

# Program 2 - Find the error(s):
Print("Hello")
print(Goodbye)
```

---

### Part 3: Making Programs Interesting (30 minutes)

#### Explanation

A program that only displays the same text every time it runs gets boring quickly. Let's make programs that are a bit more dynamic.

`print()` can display more than just text. It can display:
- Text (strings): `print("Hello")`
- Numbers: `print(42)` or `print(3.14)`
- Calculations: `print(10 + 5)`
- Multiple things at once: `print("The answer is", 42)`

**Printing multiple things:**
```python
print("The answer is", 42)
# Output: The answer is 42

print("Two plus two equals", 2 + 2)
# Output: Two plus two equals 4
```

When you separate items with commas inside `print()`, Python:
1. Evaluates each item
2. Converts everything to text
3. Joins them with a space
4. Displays the result

**Blank lines in output:**
```python
print("First section")
print()           # Empty print() creates a blank line
print("Second section")
```
Output:
```
First section

Second section
```

#### Examples

**Building a simple information display:**
```python
# Student report card header
print("=" * 40)           # Prints 40 equal signs in a row
print("PYTHON COURSE - STUDENT INFO")
print("=" * 40)
print()
print("Student:", "Maria Garcia")
print("Course:", "Python Fundamentals")
print("Lesson:", 3)
print("Progress:", "Going great!")
print()
print("=" * 40)
```

Output:
```
========================================
PYTHON COURSE - STUDENT INFO
========================================

Student: Maria Garcia
Course: Python Fundamentals
Lesson: 3
Progress: Going great!

========================================
```

**Interesting print tricks:**
```python
# Repeat a character
print("-" * 20)         # --------------------

# Print multiple values
print("Hello", "World", "Python")   # Hello World Python

# Print on the same line (no newline at the end)
print("Loading...", end="")
print(" Done!")
# Output: Loading... Done!
```

> **Teacher's Note:** The `"=" * 40` trick is always a crowd pleaser. Demonstrate it live and let students experiment with different numbers and characters.

#### Practice

**Design a personal business card:**
Create a program that displays your "business card":
```
=====================================
Name: [Your Name]
Title: Python Student (Beginner)
Course: Python Fundamentals
Status: Learning and loving it!
=====================================
```

Make it look professional and neat. Use `print("=" * n)` for the borders (experiment with the number).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Story Program

Write a program that tells a short story (5-8 lines). The story should:
- Have a title (displayed with decorative borders)
- At least 4 sentences that form a coherent story
- A blank line between sections
- A closing line like "The End"

Example structure (write your own story):
```python
print("*" * 30)
print("    THE LOST PROGRAMMER")
print("*" * 30)
print()
print("Once upon a time, there was a student.")
print("She decided to learn Python.")
print("She made many mistakes and learned from them.")
print("Eventually, she became a great developer.")
print()
print("*" * 30)
print("          THE END")
print("*" * 30)
```

#### Exercise 2: Receipt Generator

Write a program that prints a fake shopping receipt:
```
============================
    PYTHON MARKET
============================
Item              Price
----------------------------
Coffee            $3.50
Banana            $0.75
Python Book       $29.99
----------------------------
TOTAL:            $34.24
============================
   Thank you for shopping!
============================
```

Requirements:
- Use `print()` for every line
- Use string repetition for separator lines
- The receipt must be properly aligned (spacing matters)
- Include at least 3 items

#### Bonus Challenge

**Artistic Python:** Using only `print()` and string repetition, create a piece of ASCII art. For example, a simple house, a mountain, or any shape made from text characters.

Example (a simple diamond):
```
   *
  ***
 *****
*******
 *****
  ***
   *
```

Hint: You can use spaces in your strings: `print("   *")`

---

## Key Takeaways

- A Python program is a text file with `.py` extension, executed line by line from top to bottom
- **Syntax** is the set of rules Python requires - one mistake = error
- **Strings** are text values that must be wrapped in quotes (`"text"` or `'text'`)
- `print()` displays output - it's the most basic Python function
- Python is **case-sensitive**: `print` works, `Print` doesn't
- **Error messages** tell you exactly which line has a problem - read them carefully

---

## Common Mistakes to Avoid

- **Forgetting to close parentheses:** `print("Hello"` → should be `print("Hello")`
- **Not putting text in quotes:** `print(Hello)` → should be `print("Hello")`
- **Mixing up case:** `Print()` and `PRINT()` won't work - only `print()` is correct
- **Copy-pasting code:** Always TYPE the code yourself. Your fingers need to learn this, not just your eyes.

---

## Homework / Self-Study

1. **Program:** Write a program that displays your weekly schedule (7 days, what you do each day). Make it look nice with headers and alignment.

2. **Experiment:** What happens when you `print()` these things? Try each one:
   - `print(1 + 1)`
   - `print("1" + "1")`
   - `print(10 / 3)`
   - `print(10 // 3)`
   Write down the results and why you think they're different.

3. **Error hunt:** Ask a classmate to introduce 3 intentional errors into your program. Can you find them all? Can you fix them by reading the error messages without looking at the original?

---

## Next Lesson Preview

In **Lesson 4: Print & Input**, we'll:
- Learn `input()` to collect information from users
- Make programs that respond differently based on what the user types
- Build your first interactive program
- Combine `print()` and `input()` to create a real conversation

---

[← Previous Lesson](./lesson-02-installing-python-ide-setup.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-04-print-and-input.md)
