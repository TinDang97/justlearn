# Lesson 11: Setting Up Google Colab for Python Practice

**Course:** Python Fundamentals | **Duration:** 30 min | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Understand what Google Colab is and why it is useful for learning Python
- Create a new Colab notebook from scratch
- Write and run Python code in Colab cells
- Understand the difference between code cells and text cells
- Save notebooks to Google Drive and share them

---

## Prerequisites

- A Google account (Gmail)
- A web browser (Chrome recommended)
- No software installation required

---

## Lesson Outline

### Part 1: What is Google Colab? (~5 min)

#### Explanation

Google Colab (short for Google Colaboratory) is a free, cloud-based service that lets you write and run Python code directly in your browser. You do not need to install anything on your computer.

Think of it as a Python notebook that lives on the internet. You open it like a Google Doc, write your Python code, click a button, and the code runs instantly.

Here is what makes Colab special for beginners:
- **Free** — no cost, no credit card, no software to download
- **Browser-based** — works on any computer with a modern browser
- **Pre-installed Python 3** — plus common libraries like NumPy and Pandas
- **Saves to Google Drive automatically** — your work is always backed up
- **Easy to share** — share a link just like you share a Google Doc

<Tip>
You only need a Google account (Gmail) to get started. No credit card or software downloads needed.
</Tip>

<Info>
Colab is perfect for following along with lessons. You can run the exact same Python code you see in this course.
</Info>

---

### Part 2: Creating Your First Notebook (~10 min)

#### Explanation

Creating a notebook in Google Colab takes about 30 seconds. Here are the exact steps:

**Step 1: Open Google Colab**
Go to **colab.research.google.com** in your browser.

**Step 2: Sign in with your Google account**
If you are not already signed in to Google, you will be prompted to sign in. Use your Gmail account.

**Step 3: Create a new notebook**
Once you are on the Colab homepage, click the **"New notebook"** button. You can also go to **File → New notebook** from the menu bar.

**Step 4: Your notebook is ready**
The notebook opens with one empty code cell. You are ready to start writing Python!

#### Understanding the Colab Interface

When your notebook opens, here is what you see:

- **Toolbar** (top) — menu items like File, Edit, Runtime, and buttons to add cells
- **Code cell** — the gray box where you type Python code. It has a "play" button (triangle) on the left side
- **Text cell** — you can add text cells for notes and descriptions (like headings or explanations)
- **Runtime indicator** — in the top right, it shows whether your Python environment is connected and running
- **Notebook title** — at the top left (currently says "Untitled0.ipynb") — click it to rename

<Warning>
Colab sessions disconnect after being idle for a while. Your notebook file is saved, but any variables or outputs you created are lost when the session ends. Just click "Runtime → Run all" to restore everything.
</Warning>

---

### Part 3: Running Python Code (~10 min)

#### Explanation

Each "cell" in Colab is like a mini Python script. You type code in the cell, then run it to see the output immediately below.

**How to run a cell:**
- Click the **Play button** (triangle icon) on the left side of the cell, OR
- Press **Shift+Enter** on your keyboard (most common way)

#### Examples

Try typing this in the first code cell and pressing Shift+Enter:

```python
print("Hello from Google Colab!")
```

You should see the output appear directly below the cell:
```
Hello from Google Colab!
```

Now try some arithmetic in a new cell:

```python
# Try some math
2 + 2
```

Colab shows the result of the last expression automatically — you will see `4` without needing `print()`.

Now try this interactive example:

```python
name = input("What is your name? ")
print(f"Welcome to Python, {name}!")
```

When you run this cell, a text input box will appear below the cell. Type your name and press Enter — Colab will greet you!

#### Adding New Cells

You will often need to add more cells as you practice. Here is how:

- **Add a code cell:** Click the **"+ Code"** button at the top, or press **Ctrl+M B** (Cmd+M B on Mac)
- **Add a text cell:** Click the **"+ Text"** button to add a Markdown text cell for notes

<Tip>
Use text cells to write notes to yourself as you practice. It helps you remember what you learned! For example, add a text cell before each exercise that says what you are about to try.
</Tip>

#### Understanding Cell Output

- Output appears **directly below the cell** that produced it
- Each cell runs independently — you can run them in any order, but it is best to run from top to bottom
- If a cell has an error, the error message appears below the cell in red text — this is normal and helpful!

---

### Part 4: Saving and Organizing Your Work (~5 min)

#### Explanation

One of the best things about Colab is that your work is automatically saved to Google Drive. You rarely need to manually save anything.

**Automatic saving:**
Colab auto-saves your notebook to Google Drive every few minutes. You will see "All changes saved" appear in the title bar when it saves.

**Finding your notebooks in Google Drive:**
Your notebooks are saved in a folder called **"Colab Notebooks"** in your Google Drive. Go to drive.google.com to find them.

**Renaming your notebook:**
Click the notebook title at the top left (where it says "Untitled0.ipynb") and type a new name. Good names help you find notebooks later. For example: `lesson-03-print-practice.ipynb`.

**Downloading your notebook:**
- **As a .ipynb file:** File → Download → Download .ipynb (Jupyter notebook format)
- **As a .py file:** File → Download → Download .py (plain Python script)

**Sharing your notebook:**
Click the **"Share"** button in the top right corner. It works exactly like sharing a Google Doc — you can share with specific people or copy a link that anyone can view.

<Info>
Create a folder called "Python Course" in your Google Drive and move your Colab notebooks there to stay organized. You can drag notebooks from the "Colab Notebooks" folder into your new folder inside Google Drive.
</Info>

---

## Key Takeaways

- **Google Colab** is a free, browser-based Python environment — no installation required
- All you need is a **Google account** to get started
- Notebooks are made of **cells** — code cells run Python, text cells hold notes
- Run a cell with the **Play button** or **Shift+Enter**
- Output appears **directly below** the cell that produced it
- Work is **automatically saved** to Google Drive in the "Colab Notebooks" folder
- Colab sessions **disconnect when idle** — use "Runtime → Run all" to restore your work

---

## Colab vs Local Python

| Feature | Google Colab | Local (VS Code) |
|---|---|---|
| Setup time | Instant | 30-60 minutes |
| Requires installation | No | Yes |
| Works offline | No | Yes |
| Saves automatically | Yes | Manual |
| Good for | Quick practice, sharing | Real projects, large programs |

Both tools have their place. Use Colab when you want to quickly try something or follow along with a lesson. Use VS Code (from Lesson 2) when you are building a real project you want to keep on your computer.

---

## Common Mistakes to Avoid

- **Running cells out of order:** If cell 3 uses a variable defined in cell 1, you need to run cell 1 first. Run cells top-to-bottom to avoid confusion.
- **Forgetting the session disconnected:** If you come back to a notebook and outputs are gone, just use "Runtime → Run all" to re-run everything.
- **Using Python 2 syntax:** Colab uses Python 3. All code in this course is Python 3 compatible.

---

## Practice

**Try it yourself in Colab:**

1. Go to colab.research.google.com and create a new notebook
2. In the first cell, type `print("I am learning Python with Google Colab!")` and run it
3. Add a new code cell and try: `10 * 5 + 2`
4. Add a text cell and write: "These are my first Colab experiments"
5. Rename the notebook to `my-first-colab-notebook`

---

## Next Lesson Preview

In **Section 2: Data Types & Variables**, we move from setup to core Python concepts:
- What are variables and why we need them
- Python's built-in data types: integers, floats, strings, booleans
- How to store and reuse values in your programs
- Type conversion and common type errors

You will be able to follow along using either Colab (from this lesson) or VS Code (from Lesson 2) — whichever you prefer!

---

[← Previous Lesson](./lesson-10-course-review-mini-project.md) | [Back to Course Overview](./README.md) | [Next Section →](../02-data-types-variables/README.md)
