# Lesson 6: Strings Basics

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Create strings using single, double, and triple quotes
- Find the length of a string using `len()`
- Access individual characters using indexing
- Extract parts of a string using slicing
- Concatenate and repeat strings
- Use common string methods: `.upper()`, `.lower()`, `.strip()`, `.replace()`

---

## Prerequisites

- Lessons 1-5: Basic Python, print, input, variables, math

---

## Lesson Outline

### Part 1: What Are Strings? (30 minutes)

#### Explanation

A **string** is Python's way of representing text. Strings are everywhere in programming - usernames, messages, file names, URLs, emails. Understanding strings is essential.

Think of a string like a necklace: each bead on the necklace is one character, and the whole necklace is the string. The beads are in a specific order, and you can count them, look at any individual bead, or cut out a section.

**Creating strings:**
```python
# Single quotes
name = 'Alice'

# Double quotes (same result)
name = "Alice"

# Triple quotes (for multi-line text)
message = """This is line 1.
This is line 2.
This is line 3."""
```

**When to use which:**
```python
# When text contains single quote, use double quotes
message = "It's a beautiful day!"

# When text contains double quotes, use single quotes
quote = 'She said "hello" to everyone.'

# Either quote style works for normal text
greeting = "Hello"    # same as
greeting = 'Hello'    # these two
```

**Escape characters (special characters inside strings):**
```python
# \n = new line
print("Line 1\nLine 2\nLine 3")

# \t = tab
print("Name:\tAlice")

# \\ = a literal backslash
print("C:\\Users\\Alice\\Documents")

# \" = double quote inside double-quoted string
print("She said \"hello\"")
```

> **Teacher's Note:** Escape characters look confusing at first. Focus on `\n` (most common) and mention the others briefly. Students will encounter `\n` constantly.

#### Examples

```python
# Strings in action
username = "python_learner_2024"
email = "alice@example.com"
full_name = "Alice Johnson"

# Multi-line string (like a message)
welcome_message = """
Welcome to Python Fundamentals!
We're excited to have you here.
Let's start learning together!
"""

print(full_name)
print(email)
print(welcome_message)
```

#### Practice

**Experiment with quotes:**
Create 3 strings:
1. A string that contains a single quote (apostrophe) in it
2. A string that contains a double quote in it
3. A multi-line string with 3 lines using triple quotes

Print all three and verify they work.

---

### Part 2: String Length and Indexing (30 minutes)

#### Explanation

**Length with len():**
`len()` returns the number of characters in a string. Every character counts - including spaces!

```python
word = "Python"
print(len(word))    # 6

sentence = "Hello, World!"
print(len(sentence))  # 13 (including comma, space, and !)
```

**Indexing - accessing individual characters:**

Imagine a string as a row of boxes, each containing one character. Python numbers these boxes starting from 0 (not 1 - this surprises everyone at first).

```
String: P  y  t  h  o  n
Index:  0  1  2  3  4  5
```

To access a specific character, use square brackets `[]` with the index number:

```python
word = "Python"
print(word[0])   # P  (first character)
print(word[1])   # y  (second character)
print(word[5])   # n  (last character)
```

**Negative indexing - counting from the end:**
Python also allows negative indexes to count from the end:

```
String:   P  y  t  h  o  n
Negative: -6 -5 -4 -3 -2 -1
```

```python
word = "Python"
print(word[-1])   # n  (last character)
print(word[-2])   # o  (second to last)
print(word[-6])   # P  (same as word[0])
```

> **Common Question:** "Why does indexing start at 0 and not 1?"
> Historical reasons from how computer memory works. Almost all programming languages do this. It feels weird at first but becomes natural with practice. Accept it, don't fight it!

#### Examples

**Practical indexing:**
```python
name = "Alice Johnson"
#       0123456789...

print(name[0])     # A  (first letter of first name)
print(name[-1])    # n  (last letter)
print(len(name))   # 13

# Getting the first and last characters of any string
first_char = name[0]
last_char = name[-1]
print(f"First: {first_char}, Last: {last_char}")

# Checking a specific position
email = "user@example.com"
at_position = 4  # manually found
print(email[at_position])  # @
```

**Slicing - getting a portion of a string:**
```python
word = "Python Programming"
#       0123456789...

# Syntax: string[start:end]   (end is NOT included)
print(word[0:6])     # Python   (positions 0,1,2,3,4,5)
print(word[7:18])    # Programming
print(word[7:])      # Programming  (to the end)
print(word[:6])      # Python       (from the beginning)
print(word[::2])     # Pto rgamn   (every 2nd character)
print(word[::-1])    # gnimmargorP nohtyP  (reversed!)
```

#### Practice

**String detective:**
Given the string `sentence = "The quick brown fox"`:
1. What is `sentence[4]`?
2. What is `sentence[-3]`?
3. What does `sentence[4:9]` give you?
4. How do you get just "fox"?
5. How do you reverse the whole string?

Figure it out, then verify with Python.

---

### Part 3: String Operations and Methods (30 minutes)

#### Explanation

**String concatenation (+):**
```python
first = "Hello"
second = "World"
combined = first + " " + second
print(combined)   # Hello World
```

**String repetition (*):**
```python
separator = "-" * 30
print(separator)  # ------------------------------

warning = "WARNING! " * 3
print(warning)    # WARNING! WARNING! WARNING!
```

**String methods:**
A method is a function that belongs to a string. You use it with a dot: `string.method()`

```python
text = "  Hello, Python World!  "

# Case methods
print(text.upper())    # "  HELLO, PYTHON WORLD!  "
print(text.lower())    # "  hello, python world!  "
print(text.title())    # "  Hello, Python World!  " (Title Case)

# Whitespace methods
print(text.strip())    # "Hello, Python World!" (removes spaces from edges)
print(text.lstrip())   # "Hello, Python World!  " (left only)
print(text.rstrip())   # "  Hello, Python World!" (right only)

# Search and replace
print(text.replace("Python", "Amazing"))   # "  Hello, Amazing World!  "
print(text.count("o"))   # 3 (counts occurrences of "o")

# Check content
print(text.strip().startswith("Hello"))   # True
print(text.strip().endswith("!"))         # True
print("  " in text)                       # True (checks if substring exists)
```

> **Teacher's Note:** Methods are an early introduction to OOP concepts. Keep it practical: "A method is like a special operation that belongs to a specific type of data. Strings have string methods, numbers have number methods."

#### Examples

**Cleaning user input (very practical):**
```python
# Users often type with extra spaces or wrong case
name = input("Enter your username: ")

# Clean up the input
name = name.strip()    # Remove leading/trailing spaces
name = name.lower()    # Standardize to lowercase

print(f"Welcome, {name}!")

# Example: user types "  ALICE  "
# After cleaning: "alice"
```

**Building a name formatter:**
```python
full_name = input("Enter your full name: ")

# Format different ways
print(f"Original:   {full_name}")
print(f"Uppercase:  {full_name.upper()}")
print(f"Lowercase:  {full_name.lower()}")
print(f"Title case: {full_name.title()}")
print(f"Length:     {len(full_name)} characters")

# Get first and last name (assuming "First Last" format)
words = full_name.split()   # Split into list of words
first = words[0]
last = words[-1]
print(f"First name: {first}")
print(f"Last name:  {last}")
print(f"Initials:   {first[0].upper()}.{last[0].upper()}.")
```

#### Practice

**Username generator:**
Write a program that:
1. Asks for first name and last name
2. Generates a username: first letter of first name + last name, all lowercase
3. Example: "Alice Johnson" → "ajohnson"

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Password Strength Analyzer (Visual)

Build a program that analyzes a password visually (without checking actual security - we'll do logic in Course 3):

```python
password = input("Enter a password to analyze: ")

print("\n=== Password Analysis ===")
print(f"Password:    {password}")
print(f"Length:      {len(password)} characters")
print(f"Uppercase:   {password.upper()}")
print(f"Lowercase:   {password.lower()}")
print(f"Reversed:    {password[::-1]}")
print(f"Starts with: {password[0]}")
print(f"Ends with:   {password[-1]}")
```

#### Exercise 2: Name Card Generator

Build a program that creates a personalized name card:

```
+----------------------------------+
|                                  |
|    ALICE JOHNSON                 |
|    Python Developer (Student)    |
|    @: alice.johnson              |
|                                  |
+----------------------------------+
```

Requirements:
- Input: first name, last name, title/role
- Generate username automatically (lowercase, no spaces)
- Display name in uppercase
- Use string methods for formatting
- Create consistent-width borders (use len() to calculate padding)

#### Bonus Challenge

**Word count and analysis:**
Build a text analyzer:
1. Ask the user to type a sentence
2. Display:
   - Total character count (including spaces)
   - Total character count (excluding spaces) - hint: use `.replace(" ", "")`
   - Word count - hint: use `.split()` and `len()`
   - The sentence in reverse
   - The sentence with all vowels replaced by `*`

---

## Key Takeaways

- Strings are **sequences of characters** - ordered, with positions starting at 0
- Use `len(string)` to get the number of characters
- **Indexing** `string[i]` gets one character; negative indexes count from the end
- **Slicing** `string[start:end]` gets a portion of the string
- **String methods** like `.upper()`, `.lower()`, `.strip()`, `.replace()` create new strings (they don't change the original)
- **Concatenation** uses `+`; **repetition** uses `*`
- Always `.strip()` user input to remove accidental whitespace

---

## Common Mistakes to Avoid

- **Index out of range:** `"Hello"[10]` crashes - index must be between -5 and 4 for a 5-char string
- **Forgetting that methods return new strings:** `name.upper()` doesn't change `name` - you must save it: `name = name.upper()`
- **Off-by-one in slicing:** `"Python"[0:6]` gives all 6 chars, `"Python"[0:5]` gives only 5
- **Trying to do math on string numbers:** `"5" + "3"` gives `"53"` not `8` - use `int()` first

---

## Homework / Self-Study

1. **Build:** A "secret message encoder" that takes user input and outputs the message in reverse with every character doubled. (e.g., "hi" → "iihh" reversed = "hhii")

2. **Experiment:** Try these in the Python shell and explain what each does:
   - `"hello"[1:4]`
   - `"hello"[::-1]`
   - `"  spaces  ".strip()`
   - `"hello world".split()`
   - `"ha".upper() * 5`

3. **Challenge:** Write a program that checks if a word is a palindrome (reads the same forward and backward, like "racecar" or "level"). Display the word forward and backward. (We'll add the actual true/false check in Course 3!)

---

## Next Lesson Preview

In **Lesson 7: Comments & Code Style**, we'll:
- Learn how to write comments that explain your code
- Discover PEP 8 - Python's official style guide
- Learn naming conventions for variables
- Understand why readable code is professional code
- Practice writing clean, well-documented programs

---

[← Previous Lesson](./lesson-05-basic-math-operations.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-07-comments-and-code-style.md)
