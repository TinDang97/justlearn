# Lesson 1: What is Programming?

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Explain what a computer program is using their own words
- Describe what Python is and give 3 examples of what it's used for
- Explain the difference between high-level and machine language
- Name the tools they'll need for this course and why
- Feel excited and ready to start learning Python

---

## Prerequisites

- None. This is lesson 1. All you need is a willingness to learn.

---

## Lesson Outline

### Part 1: What is a Computer Program? (30 minutes)

#### Explanation

Imagine you're teaching a very literal-minded robot to make a peanut butter sandwich. You can't just say "make a sandwich" - the robot has no idea what that means. You have to give it exact, step-by-step instructions:

1. Go to the pantry
2. Pick up the bread bag with your right hand
3. Open the bread bag by twisting the tie counterclockwise
4. Remove two slices of bread
5. Place both slices on the counter
6. ...and so on

A **computer program** is exactly this: a precise, step-by-step set of instructions that tells a computer what to do. Computers are incredibly fast and obedient, but they are also incredibly literal. They do exactly what you tell them - no more, no less.

**Key insight:** Computers don't think. They execute. Your job as a programmer is to think carefully and translate your thoughts into instructions the computer can follow.

**What can computers do?**
- Store and retrieve information (your files, photos, contacts)
- Perform calculations (billions per second)
- Show things on screen (every pixel you see is code)
- Receive input (keyboard, mouse, microphone)
- Communicate over networks (the internet is just computers talking)

#### Examples

Here's what a simple program looks like before we even learn Python syntax:

```
# This is a recipe for a "Hello World" program
# (Not real Python yet - just pseudocode)

DISPLAY "Hello, World!"
```

And here's what it actually looks like in Python:

```python
print("Hello, World!")
```

Notice how readable that is? That's one of Python's greatest strengths.

> **Teacher's Note:** Pause here and ask the class: "Can anyone think of a program they use every day?" Let 5-6 students answer. Instagram, Google Maps, Spotify, WhatsApp - all programs. This connects the abstract to the familiar.

#### Practice

**Discussion Question (2 minutes, think-pair-share):**
Think of one task you do every day (making coffee, commuting, checking email). How would you write step-by-step instructions for a robot to do that task? Share with a partner.

---

### Part 2: Why Python? (30 minutes)

#### Explanation

There are hundreds of programming languages in the world. Why are we learning Python?

**Python's Story:**
Python was created by Guido van Rossum in 1991. He named it after "Monty Python's Flying Circus" (the British comedy show) - not the snake. His goal was to create a language that was simple and readable enough that programmers could focus on solving problems, not fighting with the language.

**Reason 1: Python reads like English**

Compare doing the same thing in different languages:

Java (before Python):
```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Python:
```python
print("Hello, World!")
```

Same result. Which one would you rather write on your first day?

**Reason 2: Python is used everywhere**

Real companies using Python right now:
- **Instagram** - Python handles the backend for 1 billion users
- **Google** - Python is one of their primary languages
- **NASA** - Uses Python for scientific research and space mission analysis
- **Netflix** - Python for recommendations and data analysis
- **Spotify** - Music recommendation algorithms are Python
- **Your bank** - Financial analysis and fraud detection

**Reason 3: Python is in demand**

According to job boards, Python is consistently among the top 3 most requested programming skills. The average Python developer salary in the US is $120,000+/year.

**Reason 4: Python is versatile**

What can you build with Python?
- Web applications (Instagram, Pinterest)
- Data analysis dashboards (finance, healthcare)
- Machine learning / AI (ChatGPT is built on Python)
- Automation scripts (save hours of repetitive work)
- Games (Minecraft's server software)
- Scientific research tools (astronomy, biology)
- Mobile app backends
- Desktop applications

#### Examples

Here are real snippets of Python code doing real things (don't worry about understanding these yet - just see how readable they are):

```python
# Sending an email automatically
import smtplib
email.send_to("boss@company.com", subject="Report ready!")

# Downloading data from the internet
import requests
weather = requests.get("https://api.weather.com/london")

# Analyzing a spreadsheet
import pandas
sales_data = pandas.read_csv("sales_2024.csv")
best_month = sales_data["revenue"].max()
```

Notice: even though you don't know Python yet, you can roughly understand what each program does. That's the beauty of Python.

#### Practice

**Quick Quiz (ungraded):**
1. Who created Python and when?
2. Name 3 companies that use Python
3. Name 3 different types of things you can build with Python
4. What is one reason Python is considered beginner-friendly?

---

### Part 3: How Programming Works (30 minutes)

#### Explanation

Let's understand what actually happens when you run a Python program.

**The Computer's Native Language: Binary**

Deep inside, computers only understand 0s and 1s (binary). Everything - your photos, music, emails - is stored as combinations of 0s and 1s. A typical computer instruction in binary looks like:

```
10110001 00000101
```

Nobody writes code in binary anymore. That's what we call **machine language** - the computer's native tongue.

**Assembly Language: One step up**

In the 1950s, programmers wrote in "assembly language" - still incredibly tedious:
```
MOV AL, 5
ADD AL, 3
```
Still very close to machine language.

**High-Level Languages: Where we live**

Modern languages like Python let us write in something close to human language. The Python "interpreter" translates our readable code into machine language automatically.

```python
# What we write (Python - high level)
total = 5 + 3
print(total)

# What the computer actually executes (machine language - simplified)
# 10110001 00000101 00000011 11010001 ...
```

**The Python Interpreter: Your translator**

When you run a Python program:
1. You write code in a `.py` file (just a text file)
2. You tell Python to run it: `python myprogram.py`
3. Python reads your code line by line, top to bottom
4. Python translates each line into machine instructions
5. The computer executes those instructions instantly

**Important:** Python reads your code **line by line, top to bottom**. Order matters. This is fundamental.

```python
# This works:
name = "Alice"
print(name)

# This would fail - using 'greeting' before it's created:
print(greeting)
greeting = "Hello"
```

> **Common Question:** "Does Python run the whole program before showing any output?"
> No! Python runs line 1, then line 2, then line 3... Output appears as each print statement is reached. This is why order matters.

#### Examples

**Example 1: Sequential execution**
```python
# Python runs these in order, top to bottom
print("Line 1")    # This runs first
print("Line 2")    # This runs second
print("Line 3")    # This runs third

# Output:
# Line 1
# Line 2
# Line 3
```

**Example 2: What happens when there's an error**
```python
print("This runs fine")
print("This too")
primt("Oops - typo!")      # Error! Python stops here
print("This never runs")   # Never reached
```

#### Practice

**Predict the Output (2 minutes):**
What will this program print? Write your answer before running it.
```python
print("Python is")
print("really")
print("cool!")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Meet Your Classmates

**Goal:** Without any computer, practice thinking like a programmer.

Write step-by-step instructions (pseudocode) for ONE of these tasks:
- How to find someone's phone number in your contacts
- How to search for a video on YouTube
- How to lock your phone screen

Make your instructions specific enough that a robot with no common sense could follow them. You'll discover this is harder than it sounds!

**Share:** Read your instructions to a partner. Can they identify any steps you missed?

#### Exercise 2: Python in the Wild

**Research task (5 minutes):**
Pick ONE of these industries and look up how Python is used in it:
- Healthcare
- Finance/Banking
- Entertainment
- Transportation
- Agriculture

Be ready to share: What does Python do in that industry? Why is it useful there?

#### Bonus Challenge

**For fast learners:** Write pseudocode for a program that:
- Asks a user for their name
- Asks for their age
- Calculates what year they were born
- Tells them how old they'll be in 10 years

Don't write Python yet - just describe the steps in plain English. We'll turn this into real Python code in Lesson 4!

---

## Key Takeaways

- A **program** is a precise set of instructions for a computer to follow
- **Python** is a high-level programming language known for readability
- Python is used by Instagram, Google, NASA, Netflix, and thousands of other companies
- Python code is translated to machine language by the **Python interpreter**
- Python executes code **line by line, top to bottom** - order matters
- Python is versatile: web apps, data analysis, AI, automation, and much more

---

## Common Mistakes to Avoid

- **"I need to be good at math to program."** False. Most programming is logic, not math. Basic arithmetic is all you need for 90% of real-world code.
- **"I need to be smart to learn programming."** False. You need patience and practice. Programming is a skill, not a talent.
- **"I should understand everything immediately."** False. Confusion is normal. Every programmer you admire was confused at the beginning.

---

## Homework / Self-Study

1. **Watch:** Search YouTube for "What is programming? Explained for beginners" - watch one 5-10 minute video of your choice. Come back next class ready to share one thing you learned.

2. **Explore:** Go to python.org and look at the "About Python" section. Note 3 facts you didn't know about Python.

3. **Think:** Write down 3 programs you would like to build someday (doesn't matter how ambitious - dream big). We'll return to this list at the end of the course.

---

## Next Lesson Preview

In **Lesson 2: Installing Python & IDE Setup**, we'll:
- Download and install Python on your computer
- Set up VS Code (our code editor)
- Run your very first Python command
- Learn what a file with `.py` extension is

Bring your laptop fully charged and make sure you have administrator access to install software!

---

[Back to Course Overview](./README.md) | [Next Lesson: Installing Python →](./lesson-02-installing-python-ide-setup.md)
