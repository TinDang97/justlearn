# Lesson 4: Print & Input

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Use `input()` to collect text from users at runtime
- Store user input in a variable
- Display personalized output using the stored input
- Build interactive programs that respond to user data
- Understand the difference between what's in the program vs. what comes from the user

---

## Prerequisites

- Lessons 1-3 complete
- Can write and run a Python program with `print()`
- VS Code set up and working

---

## Lesson Outline

### Part 1: The input() Function (30 minutes)

#### Explanation

So far, our programs always do the same thing every time they run. That's not very useful in the real world. Real programs respond to the person using them.

Think about any app on your phone:
- WhatsApp asks: "What's your name?" → you type it → it shows your name everywhere
- Google Maps asks: "Where do you want to go?" → you type it → it gives directions
- Instagram: "Username?" → you type it → it shows your feed

This is called **user input** - the program pauses and waits for the user to type something.

In Python, we use `input()` to do this.

**How input() works:**
1. Python displays a message to the user (called a **prompt**)
2. Python **pauses** and waits for the user to type something
3. The user types text and presses Enter
4. Python **returns** whatever the user typed
5. You can **store** that text to use later

#### Examples

**The most basic input:**
```python
input("What is your name? ")
```

When run, Python displays:
```
What is your name?
```
...and waits. When the user types "Maria" and presses Enter, the program... does nothing with it. We forgot to save what they typed!

**Saving the input - storing in a variable:**
```python
name = input("What is your name? ")
print("Hello,", name)
```

Run this program. It will:
1. Display: `What is your name? `
2. Wait for you to type
3. When you type "Maria" and press Enter:
4. Display: `Hello, Maria`

A **variable** is a named container that holds a value. `name` now holds whatever the user typed. We'll study variables extensively in Course 2.

```python
# More examples of input and print together:

name = input("Enter your name: ")
city = input("What city are you from? ")

print("Welcome,", name)
print("Nice to meet someone from", city + "!")
```

Sample run:
```
Enter your name: Carlos
What city are you from? Bogota
Welcome, Carlos
Nice to meet someone from Bogota!
```

> **Teacher's Note:** This is the moment students realize programming is interactive and personal. The "Hello, [their name]" reaction is always delightful. Give everyone time to run this and show each other.

#### Practice

**Interactive greeter:**
Write a program that:
1. Asks for the user's name
2. Asks for the user's favorite color
3. Prints a message like: "Hello, [name]! [color] is a great color choice!"

---

### Part 2: Building Interactive Programs (30 minutes)

#### Explanation

With `input()` and `print()` together, we can already build programs that feel real and personal.

**Key concept:** Everything `input()` returns is text (a **string**). Even if the user types "42", Python stores it as the text "42", not the number 42. We'll deal with numbers in Lesson 5.

For now, let's build programs that work with text.

**Combining text with variables:**

There are two common ways to combine text and variables:

**Method 1: Comma in print (simplest)**
```python
name = "Alice"
print("Hello,", name, "!")
# Output: Hello, Alice !   (notice the space before !)
```

**Method 2: f-strings (cleanest - Python 3.6+)**
```python
name = "Alice"
print(f"Hello, {name}!")
# Output: Hello, Alice!

age = "25"
print(f"You are {age} years old.")
# Output: You are 25 years old.
```

The `f` before the string stands for "formatted". The `{variable_name}` in curly braces gets replaced by the variable's value. This is the modern, professional way to combine text and variables.

**Method 3: String concatenation (joining with +)**
```python
name = "Alice"
print("Hello, " + name + "!")
# Output: Hello, Alice!
```

> **Common Question:** "Which method should I use?"
> Use f-strings (Method 2) - they're the modern Python standard and much easier to read. We'll use them throughout this curriculum.

#### Examples

**A friendly interview program:**
```python
# A simple interview program
print("Welcome to the Python Interview!")
print("=" * 40)
print()

name = input("What is your name? ")
hobby = input("What is your favorite hobby? ")
food = input("What is your favorite food? ")
age = input("How old are you? ")

print()
print("=" * 40)
print("Here's your profile!")
print("=" * 40)
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Favorite hobby: {hobby}")
print(f"Favorite food: {food}")
print()
print(f"Nice to meet you, {name}!")
print(f"I hope you enjoy Python as much as {food}!")
```

Sample run:
```
Welcome to the Python Interview!
========================================

What is your name? Priya
What is your favorite hobby? painting
What is your favorite food? curry
How old are you? 22

========================================
Here's your profile!
========================================
Name: Priya
Age: 22
Favorite hobby: painting
Favorite food: curry

Nice to meet you, Priya!
I hope you enjoy Python as much as curry!
```

#### Practice

**Mad Libs generator:**
Create a "Mad Libs" style program:
1. Ask the user for: an adjective, a noun, a verb, a place name, a number
2. Print a funny story using all their answers

Example output:
```
Once there was a [adjective] [noun] who loved to [verb].
Every Tuesday, they traveled to [place] to do it [number] times.
```

---

### Part 3: Multiple Inputs and Formatted Output (30 minutes)

#### Explanation

Real programs ask many questions and present information clearly. Let's practice collecting multiple pieces of information and displaying them nicely.

**Organizing a multi-input program:**
```python
# Pattern for a clean multi-input program:

# 1. Introduction
print("Welcome to [Program Name]")

# 2. Collect all inputs
variable1 = input("Question 1: ")
variable2 = input("Question 2: ")
variable3 = input("Question 3: ")

# 3. Process (we'll learn more complex processing later)

# 4. Display results
print()
print("Results:")
print(f"  {variable1}")
print(f"  {variable2}")
print(f"  {variable3}")
```

**Formatting output neatly:**
```python
# Using alignment with f-strings
name = input("Name: ")
city = input("City: ")
job = input("Job: ")

# Display as a formatted table
print()
print(f"{'Field':<15} {'Value':<20}")
print("-" * 35)
print(f"{'Name':<15} {name:<20}")
print(f"{'City':<15} {city:<20}")
print(f"{'Job':<15} {job:<20}")
```

The `:<15` means "left-align and take up 15 characters". This creates nice columns. (We'll explore string formatting more in Course 2.)

#### Examples

**A complete student registration form:**
```python
# Student Registration System
print("=" * 50)
print("      PYTHON BOOTCAMP - STUDENT REGISTRATION")
print("=" * 50)
print()

# Collect student information
first_name = input("First name: ")
last_name = input("Last name: ")
email = input("Email address: ")
phone = input("Phone number: ")
experience = input("Previous programming experience (yes/no): ")

# Display confirmation
print()
print("=" * 50)
print("REGISTRATION CONFIRMATION")
print("=" * 50)
print(f"Full Name:    {first_name} {last_name}")
print(f"Email:        {email}")
print(f"Phone:        {phone}")
print(f"Experience:   {experience}")
print()
print(f"Welcome to the course, {first_name}!")
print("Your registration is complete.")
print("=" * 50)
```

> **Common Question:** "What if the user types nothing and just presses Enter?"
> `input()` will return an empty string `""`. You can test this. In real programs, you'd check if the input is empty - we'll learn how to do that in Course 3 (conditions).

#### Practice

**Build a to-do list builder:**
Write a program that:
1. Asks for the user's name
2. Asks for 3 tasks they need to do today
3. Displays a formatted to-do list with their name at the top

```
=== [Name]'s To-Do List ===
[ ] Task 1: [task1]
[ ] Task 2: [task2]
[ ] Task 3: [task3]
===========================
Good luck today!
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Personal Introduction Generator

Build a program that collects information and generates a short paragraph introduction:

**Inputs to collect:**
- Full name
- Age
- Hometown
- Current job or student status
- Favorite Python application (web apps, games, data, etc.)
- One fun fact about themselves

**Output format:**
```
========================================
Hi, my name is [name], and I'm [age] years old.
I'm from [hometown] and I'm currently a/an [job/student status].
I'm most excited about using Python for [application].
One interesting thing about me: [fun fact].
========================================
Looking forward to learning Python with you!
========================================
```

#### Exercise 2: Simple Story Generator

Build a program that creates a personalized adventure story:

**Inputs:**
- Hero's name
- A superpower
- A villain's name
- A location
- How the hero wins (just a word like "bravely" or "cleverly")

**Output:** A 4-5 sentence adventure story using all the inputs, with proper formatting.

Example:
```
*** THE ADVENTURE OF [HERO NAME] ***

[Hero] was an ordinary person until they discovered the power of [superpower].
When the evil [villain] threatened [location], [hero] knew what to do.
Using their [superpower] [how they win], [hero] defeated [villain].
[Location] was saved, and everyone celebrated!

THE END
```

#### Bonus Challenge

**Menu-driven greeter:**
Create a program that shows a "greeting style menu" and then asks the user to pick a style (by typing the number). Then greet them in that style.

```
Choose your greeting style:
1. Formal
2. Casual
3. Enthusiastic
4. Mysterious

Your choice: [user types here]
Your name: [user types here]

[Program generates greeting based on choice]
```

For now, just collect the choice number and name, then use if/elif (or just print all options based on what they typed - we'll learn proper conditions in Course 3).

---

## Key Takeaways

- `input("prompt")` pauses the program and waits for the user to type something
- Everything `input()` returns is **text (a string)**, even if the user types numbers
- Store input in a **variable**: `name = input("Your name: ")`
- **f-strings** are the cleanest way to combine text and variables: `f"Hello, {name}!"`
- Programs flow from top to bottom: ask all questions first, then display results
- The user's experience matters - write clear, helpful prompts

---

## Common Mistakes to Avoid

- **Not storing the input:** `input("Name: ")` without `name =` loses the value immediately
- **Forgetting the f prefix:** `"Hello, {name}"` won't substitute - need `f"Hello, {name}"`
- **Expecting numbers from input:** `age = input("Age: ")` gives you text "25", not the number 25
- **Unclear prompts:** Always write prompts that tell users exactly what to type (include format if needed)

---

## Homework / Self-Study

1. **Build:** A "restaurant order" program. Ask the user for:
   - Their name
   - What they want to eat (main course)
   - What they want to drink
   - Dessert choice
   Then print a formatted receipt with all their choices and "Thank you for your order, [name]!"

2. **Experiment:** What happens when you use `input()` twice asking the same question? What does Python do? Run it and find out.

3. **Challenge:** Create a "compliment machine" - the user enters their name and the program responds with 3 different compliments using their name (e.g., "Great name, [name]!", "[name] has wonderful taste!", etc.)

---

## Next Lesson Preview

In **Lesson 5: Basic Math Operations**, we'll:
- Use Python as a powerful calculator
- Learn all arithmetic operators: +, -, *, /, //, %, **
- Understand operator precedence (order of operations)
- Convert text input to numbers so we can do math with user input
- Build programs that calculate tips, discounts, and unit conversions

---

[← Previous Lesson](./lesson-03-your-first-python-program.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-05-basic-math-operations.md)
