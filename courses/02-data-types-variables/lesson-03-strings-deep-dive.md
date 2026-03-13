# Lesson 3: Strings Deep Dive

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Create strings using all four quote styles (single, double, triple-single, triple-double)
- Use escape sequences correctly
- Understand raw strings and when to use them
- Work with multi-line strings
- Understand string immutability

---

## Prerequisites

- Course 1: basic strings, indexing, slicing
- Lesson 1-2 of this course

---

## Lesson Outline

### Part 1: String Creation Methods (30 minutes)

#### Explanation

Strings are sequences of Unicode characters. Python supports multiple ways to create them, each with its own use case.

```python
# Four ways to create strings
single = 'Hello, World!'
double = "Hello, World!"
triple_single = '''Hello,
World!'''
triple_double = """Hello,
World!"""

# Single vs double: use whichever avoids backslash escapes
# "It's a beautiful day!"  (single quote inside → use double outer)
# 'She said "hello"'        (double quote inside → use single outer)
```

**Escape sequences:**
```python
# \n  - newline
# \t  - tab
# \\  - literal backslash
# \"  - double quote inside double-quoted string
# \'  - single quote inside single-quoted string
# \r  - carriage return
# \0  - null character

print("Line 1\nLine 2\nLine 3")
print("Name:\tAlice\nAge:\t25")
print("C:\\Users\\Alice\\Documents")
print("She said \"Python is amazing!\"")
```

**Raw strings (r-strings):**
```python
# In regular strings, \ has special meaning
path = "C:\new_folder\test"   # \n and \t are escape codes! Bug!
print(path)
# C:
# ew_folder	est   ← broken path!

# Raw string: \ is treated literally
path = r"C:\new_folder\test"
print(path)
# C:\new_folder\test   ← correct!

# Use raw strings for:
# - Windows file paths
# - Regular expressions
# - Any string where \ should be literal
```

#### Examples

```python
# Multi-line strings preserve formatting
poem = """
Roses are red,
Violets are blue,
Python is wonderful,
And so are you!
"""
print(poem)

# Docstrings (multi-line strings used as documentation)
def calculate_area():
    """
    Calculates the area of a rectangle.

    This is a docstring - Python uses it as built-in documentation.
    We'll use functions in Course 4.
    """
    pass

# Access docstring:
print(calculate_area.__doc__)
```

#### Practice

Write a program that uses all four quote types for different purposes. Demonstrate why each is useful in its scenario.

---

### Part 2: String Immutability (30 minutes)

#### Explanation

Strings in Python are **immutable** - once created, they cannot be changed. You can create new strings but not modify existing ones.

```python
name = "Alice"

# WRONG - you cannot modify a string in place:
name[0] = "J"   # TypeError: 'str' object does not support item assignment

# RIGHT - create a new string:
name = "J" + name[1:]   # "Jlice"

# String methods always return NEW strings (original unchanged):
greeting = "hello world"
upper_greeting = greeting.upper()

print(greeting)        # "hello world" - UNCHANGED
print(upper_greeting)  # "HELLO WORLD" - new string
```

**Why immutability matters:**
```python
# This is safe:
text = "Python"
copy = text      # Both point to same string
text = text + " is great"   # Creates NEW string, copy unaffected

print(text)   # "Python is great"
print(copy)   # "Python"   (unchanged)
```

#### Examples

```python
# Building strings with concatenation
words = ["Python", "is", "a", "great", "language"]
sentence = ""

for word in words:   # We'll learn loops in Course 3
    sentence += word + " "

sentence = sentence.strip()  # Remove trailing space
print(sentence)

# More efficient: join (we'll use this a lot)
sentence = " ".join(words)
print(sentence)
```

#### Practice

Demonstrate string immutability:
1. Create a string
2. Store it in two variables (both pointing to same string)
3. Show that modifying one doesn't affect the other
4. Create a "modified" version using string operations

---

### Part 3: Unicode and Encoding (30 minutes)

#### Explanation

Python 3 strings are **Unicode** - they can represent characters from any language on Earth, plus emoji!

```python
# Unicode strings work naturally in Python 3
japanese = "こんにちは"     # "Hello" in Japanese
arabic = "مرحبا"            # "Hello" in Arabic
emoji = "Python is 🐍🔥"   # Emoji!

print(japanese)
print(arabic)
print(emoji)
print(len(emoji))   # 12 (emoji is one character)

# Unicode escapes
heart = "\u2764"       # ❤ heart symbol
snowflake = "\u2744"   # ❄ snowflake
print(f"I {heart} Python {snowflake}")

# Get the Unicode code point of a character
print(ord('A'))    # 65
print(ord('a'))    # 97
print(ord('😀'))  # 128512

# Get character from code point
print(chr(65))     # A
print(chr(9731))   # ☃ snowman
```

**String encoding vs. string:**
```python
# A string is a sequence of Unicode characters
text = "Hello"

# Bytes are raw binary data
encoded = text.encode('utf-8')
print(encoded)    # b'Hello'  (bytes object)

# Decode bytes back to string
decoded = encoded.decode('utf-8')
print(decoded)    # 'Hello'
```

> **Teacher's Note:** Encoding is important for file I/O, web requests, and databases. Introduce it here conceptually - students will see it in practice in Course 7 (File Handling).

#### Practice

Build a "Unicode Explorer":
- Ask user for any character
- Display: the character, its Unicode code point (`ord()`), its name if possible

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: String Art Generator

Using escape sequences and multiline strings, create a program that displays:
- A decorated header with the user's name
- A formatted poem (at least 4 lines)
- A "business card" with proper tab alignment

#### Exercise 2: Text Processor

Build a program that:
1. Accepts a multi-line text as input (the user types multiple sentences)
2. Counts: total characters, total words, total lines
3. Displays the first 50 characters, last 50 characters
4. Displays the text reversed

Hint: use `\n` to separate "lines" in input, then `.split('\n')` to process.

#### Bonus Challenge

**Caesar cipher:** Implement a basic encryption where each letter is shifted by N positions:
- A→D, B→E, ... Z→C (shift of 3)
- Ask user for message and shift amount
- Encrypt and display the result
- Hint: use `ord()` and `chr()` with modulo arithmetic

---

## Key Takeaways

- Four quote styles: `'`, `"`, `'''`, `"""` - choose based on content
- **Escape sequences**: `\n` (newline), `\t` (tab), `\\` (backslash)
- **Raw strings** (`r"..."`) treat backslash literally - use for file paths and regex
- Strings are **immutable** - you can't change them, only create new ones
- Python 3 strings are Unicode - support all world languages and emoji
- `ord()` → Unicode code point, `chr()` → character from code point

---

## Common Mistakes to Avoid

- **Forgetting raw strings for Windows paths:** `"C:\new\file"` has `\n` and `\f` escape codes
- **Assuming string modification works:** `name[0] = 'J'` raises TypeError
- **Mixing up encode/decode:** `str.encode()` → bytes, `bytes.decode()` → str

---

## Homework

1. Write a program that generates a greeting in 5 different languages using Unicode strings
2. Build a Windows path fixer: takes a path with forward slashes and converts to backslashes (use raw strings)
3. Research: What is UTF-8? Why is it the most common text encoding?

---

[← Previous](./lesson-02-numbers-int-float.md) | [Back to Course](./README.md) | [Next →](./lesson-04-string-methods-formatting.md)
