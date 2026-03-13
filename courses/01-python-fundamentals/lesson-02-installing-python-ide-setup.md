# Lesson 2: Installing Python & IDE Setup

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Download and install Python 3 on Windows, Mac, or Linux
- Verify that Python installed correctly using the command line
- Install and configure VS Code as their code editor
- Create a new Python file and run it from VS Code
- Use the Python interactive shell (REPL) for quick experiments

---

## Prerequisites

- Lesson 1: What is Programming?
- A laptop with internet connection
- Administrator/admin password for your computer (to install software)

---

## Lesson Outline

### Part 1: Installing Python (30 minutes)

#### Explanation

Before we can write Python programs, we need to install two things:
1. **Python itself** - the interpreter that runs our code
2. **A code editor** - a program we use to write code comfortably

Think of it this way: Python is the engine, and the code editor is the steering wheel and dashboard. You could technically write Python in Notepad, but a proper editor gives you helpful features like syntax highlighting (colors that help you read code), error detection, and much more.

> **Teacher's Note:** This lesson can get messy in a large class because every student has a different computer setup. Plan for this. Have teaching assistants walk the aisles, and use the troubleshooting guide at the end of this lesson. Common issues are documented there.

**What version of Python?**
Always install Python 3 (specifically Python 3.10 or newer). Python 2 is old and no longer supported. If you see "Python 3.11" or "Python 3.12", that's great - install it!

#### Step-by-Step Installation

**Windows:**
1. Open your web browser and go to **python.org**
2. Click the yellow "Download Python 3.X.X" button (the big one)
3. Run the downloaded `.exe` file
4. **IMPORTANT:** Check the box that says "Add Python to PATH" (this is crucial!)
5. Click "Install Now"
6. Wait for installation to complete
7. Click "Close"

**Mac:**
1. Open your web browser and go to **python.org**
2. Click "Downloads" then "macOS"
3. Download the latest Python 3 installer (.pkg file)
4. Double-click the downloaded file
5. Follow the installation wizard
6. When asked about SSL certificates, run the "Install Certificates" command

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

#### Examples

**Verifying the installation works:**

After installing, open your Terminal (Mac/Linux) or Command Prompt (Windows):

```bash
# Type this and press Enter:
python --version

# You should see something like:
# Python 3.11.4

# If that doesn't work, try:
python3 --version
```

> **Common Question:** "I typed python --version and it says 'Python 2.7'. What do I do?"
> Use `python3` instead of `python`. Some computers have both Python 2 and Python 3 installed. We always want Python 3.

```bash
# To check which Python you're using:
python3 --version
# Should show Python 3.x.x

# Where is Python installed?
which python3    # Mac/Linux
where python     # Windows
```

#### Practice

**Verify your installation:**
1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Type `python3 --version` and press Enter
3. Write down the version number you see
4. Raise your hand if you see an error - we'll help you fix it

---

### Part 2: Installing VS Code (30 minutes)

#### Explanation

VS Code (Visual Studio Code) is a free code editor made by Microsoft. It's used by millions of professional developers worldwide and it's perfect for beginners too.

Why VS Code over other editors?
- Free and open source
- Works on Windows, Mac, and Linux
- Excellent Python support
- Great extensions (add-ons)
- Used by professionals (relevant for future employment)
- The most popular developer tool in the world

**Alternative editors (if VS Code doesn't work on your computer):**
- IDLE (comes with Python - basic but works)
- Thonny (specifically designed for beginners - great fallback)
- PyCharm Community Edition (powerful but heavy)

#### Step-by-Step VS Code Setup

**Installation:**
1. Go to **code.visualstudio.com**
2. Click the big "Download" button (it auto-detects your OS)
3. Run the installer and follow the prompts
4. Launch VS Code

**Installing the Python extension:**
1. Open VS Code
2. Click the Extensions icon on the left sidebar (looks like 4 squares)
3. In the search bar, type "Python"
4. Click "Install" on the extension by Microsoft (it's the top result)
5. Wait for it to install

**Selecting your Python interpreter:**
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Python: Select Interpreter"
3. Choose the Python 3.x version you installed

#### Examples

**Creating and running your first file:**

```
1. In VS Code, click File → New File
2. Save it as "hello.py" (File → Save As)
3. Type this code:
   print("Hello from VS Code!")
4. Right-click anywhere in the file
5. Click "Run Python File in Terminal"
```

Expected result in the terminal at the bottom:
```
Hello from VS Code!
```

If you see that - congratulations! Your setup is working!

> **Teacher's Note:** Walk around the room at this point. At least 20-30% of students in a class of 300 will have issues. Common fixes: wrong Python version selected, Python not added to PATH on Windows, Mac permission issues. The bonus section below addresses most of these.

#### Practice

**Setup verification checklist:**
- [ ] Python installed (run `python3 --version` to confirm)
- [ ] VS Code installed and opened
- [ ] Python extension installed in VS Code
- [ ] Python interpreter selected
- [ ] Created a file called `hello.py`
- [ ] Successfully ran `print("Hello from VS Code!")` and saw output

---

### Part 3: The Python Interactive Shell (REPL) (30 minutes)

#### Explanation

Python has a secret superpower for learners: the **interactive shell** (also called the REPL - Read, Evaluate, Print Loop).

Think of it as a calculator that speaks Python. You type one line of Python, press Enter, and immediately see the result. It's perfect for experimenting and trying out ideas quickly.

The `>>>` symbol is the Python prompt. It means "Python is waiting for your input."

You can open the Python shell in two ways:
1. In your terminal: type `python3` and press Enter
2. In VS Code: use the Python Interactive window

#### Examples

```python
# Start the Python shell (in terminal, type: python3)
# You'll see:
# Python 3.11.4 (default, ...)
# Type "help", "copyright", "credits" or "license" for more information.
# >>>

# Now you can type Python and see results immediately:

>>> 2 + 2
4

>>> 10 * 5
50

>>> "Hello" + " " + "World"
'Hello World'

>>> 100 / 4
25.0

>>> print("This works in the shell too!")
This works in the shell too!
```

**Exiting the shell:**
```python
>>> exit()
# or press Ctrl+D (Mac/Linux) or Ctrl+Z then Enter (Windows)
```

**When to use the shell vs. a .py file:**

| Use the Shell When... | Use a .py File When... |
|---|---|
| Testing a quick idea | Writing a real program |
| Checking how something works | Code you want to save |
| Doing quick calculations | More than 2-3 lines |
| Learning new concepts | Sharing code with others |

> **Common Question:** "Why does the shell show a result without print(), but my .py file doesn't?"
> In the shell, Python automatically shows the result of every expression. In a .py file, you must explicitly use `print()` to display output.

```python
# In the shell:
>>> 5 + 3
8          # Shown automatically

# In a .py file:
5 + 3      # Nothing shown - calculation done but discarded
print(5 + 3)   # 8 - shown because you asked for it
```

#### Practice

**Shell exploration (5 minutes):**
Open the Python shell and try these:
```python
>>> 365 * 24       # Hours in a year
>>> "Python" * 3   # What happens when you multiply a string?
>>> type(42)       # What type of thing is 42?
>>> type("hello")  # What type of thing is "hello"?
```

Write down what you see. We'll explain `type()` in Course 2!

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: The Setup Gauntlet

Complete all steps and check them off. Don't skip ahead - each step must work before moving to the next.

```
Step 1: Open Terminal/Command Prompt
         Run: python3 --version
         Result: _____________ (write the version number)

Step 2: Open VS Code
         Create a file: my_first_program.py
         Type: print("My name is [your name]")
         Run the file
         Result: _____________ (take a screenshot or write what you see)

Step 3: Open the Python Shell
         In terminal, type: python3
         Calculate: 365 * 24 * 60 * 60
         Result: _____________ (seconds in a year!)
         Type: exit()
```

#### Exercise 2: Customizing VS Code (Optional but Recommended)

Make VS Code more comfortable for long coding sessions:

1. **Change the theme:**
   - Press `Ctrl+K Ctrl+T` (Windows) or `Cmd+K Cmd+T` (Mac)
   - Try "Dark+" (popular choice), or browse themes
   - Pick what's comfortable for your eyes

2. **Increase font size:**
   - Go to File → Preferences → Settings
   - Search for "font size"
   - Try size 16 (bigger is better when you're starting)

3. **Install "Rainbow Brackets" extension:**
   - In Extensions, search "Rainbow Brackets"
   - This color-codes your brackets to prevent common errors

#### Bonus Challenge

**For fast learners:**
Try these Python shell experiments and document what you discover:
```python
>>> print("Ha" * 10)
>>> print("I am learning Python" + "!")
>>> 2 ** 10
>>> 17 % 5
>>> len("Hello, World!")
```

Write a one-sentence explanation of what each line does based on the output you see. Bring your explanations to discuss in Lesson 3!

---

## Key Takeaways

- **Python 3** is the current version - always use Python 3, not Python 2
- **VS Code** is a professional code editor that makes writing Python much easier
- When installing Python on Windows, **always check "Add Python to PATH"**
- The **Python shell (REPL)** lets you run Python commands interactively - great for experiments
- Use `python3 --version` to verify your installation
- Python files end in **.py** extension

---

## Common Mistakes to Avoid

- **Forgetting "Add Python to PATH" on Windows:** This causes the `python` command to not be found. Solution: reinstall Python and check that box.
- **Using Python 2 by accident:** Always check `python3 --version`, not just `python --version`.
- **Not saving the file before running:** VS Code has an "autosave" option - enable it in File → Auto Save.

---

## Troubleshooting Guide

**"'python' is not recognized as an internal or external command" (Windows):**
- Python wasn't added to PATH during installation
- Fix: Reinstall Python and check "Add Python to PATH"
- Alternative fix: Run the Python installer again, choose "Modify", and add to PATH

**"Permission denied" when installing (Mac):**
- Try running with sudo: `sudo python3 setup.py install`
- Or download from python.org instead of using Homebrew

**VS Code can't find Python interpreter:**
- Press Ctrl+Shift+P → "Python: Select Interpreter"
- Browse to the Python 3 installation manually
- On Mac it's usually: `/usr/local/bin/python3`
- On Windows it's usually: `C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe`

---

## Homework / Self-Study

1. **Practice:** Open VS Code and create a file called `practice.py`. Write 5 different `print()` statements - make them say something about yourself (your name, your hobby, your favorite food, etc.). Run the file and make sure it works.

2. **Customize:** Spend 10 minutes customizing VS Code (theme, font size). A comfortable environment matters for long study sessions.

3. **Explore:** In the Python shell, try multiplying a word by a number (e.g., `"hello" * 5`). What happens? Try a few variations. Come prepared to explain what you observed.

---

## Next Lesson Preview

In **Lesson 3: Your First Python Program**, we'll:
- Understand the exact structure of a Python program
- Learn how Python reads and executes code
- Write our first multi-line program
- Learn about syntax errors and how to read them
- Build a program that actually does something useful

---

[← Previous Lesson](./lesson-01-what-is-programming.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-03-your-first-python-program.md)
