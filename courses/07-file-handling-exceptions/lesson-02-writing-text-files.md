# Lesson 2: Writing Text Files

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Write content to files using write modes
- Append to existing files
- Write lists of lines with writelines
- Build safe file writing patterns

---

## Lesson Outline

### Part 1: Write and Append Modes (30 minutes)

#### Explanation

```python
# Write mode "w" - creates file or overwrites:
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("First line\n")
    f.write("Second line\n")

# Append mode "a" - adds to end of existing file:
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("New log entry\n")

# Writing multiple lines at once:
lines = ["Alice\n", "Bob\n", "Carol\n"]
with open("names.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)   # writelines doesn't add \n automatically

# Using print() to write (adds \n automatically):
with open("output.txt", "w") as f:
    print("Line 1", file=f)
    print("Line 2", file=f)
    print("Total:", 42, file=f)
```

#### Practice

Write a function `save_shopping_list(items: list[str], filename: str)` that saves items one per line.

---

### Part 2: Writing Structured Data (30 minutes)

#### Explanation

```python
# Write a formatted report:
def write_report(students: list[dict], filepath: str):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("=" * 50 + "\n")
        f.write("STUDENT REPORT\n")
        f.write("=" * 50 + "\n\n")

        for student in students:
            f.write(f"Name: {student['name']}\n")
            f.write(f"GPA:  {student['gpa']:.2f}\n")
            f.write("-" * 30 + "\n")

# Atomic write (write to temp, then rename):
import os
import tempfile

def safe_write(filepath: str, content: str):
    """Write atomically - prevents partial writes on crash."""
    dir_path = os.path.dirname(filepath) or "."
    with tempfile.NamedTemporaryFile(
        "w", dir=dir_path, delete=False, encoding="utf-8"
    ) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    os.replace(tmp_path, filepath)   # Atomic on most systems
```

#### Practice

Write a function that appends timestamped log entries to a log file.

---

### Part 3: File Utilities (30 minutes)

#### Explanation

```python
from pathlib import Path

# Check and create directories:
output_dir = Path("reports/2024")
output_dir.mkdir(parents=True, exist_ok=True)   # Create full path

# Write using pathlib:
path = Path("output.txt")
path.write_text("Hello, World!", encoding="utf-8")   # One-liner

# Read using pathlib:
content = path.read_text(encoding="utf-8")

# Copy a file:
import shutil
shutil.copy("source.txt", "destination.txt")

# Delete a file:
path = Path("temp.txt")
if path.exists():
    path.unlink()   # Delete the file
```

#### Practice

Build a `FileManager` class with methods: `write(content)`, `append(content)`, `read()`, `exists()`, `delete()`.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: CSV-like Writer

Write a function that takes a list of dictionaries and writes them as a pipe-delimited file:
```
name|age|email
Alice|25|alice@example.com
```

#### Exercise 2: Rotating Log File

Build a logger that:
- Appends to a log file
- When file exceeds 1KB, renames it to `log.txt.1` and starts fresh
- Keeps only the last 3 rotated files

---

## Key Takeaways

- `"w"` mode overwrites; `"a"` mode appends; always choose intentionally
- `f.write()` doesn't add newlines; add `\n` explicitly
- Use `Path.mkdir(parents=True, exist_ok=True)` to create directories safely
- For critical data, use atomic writes (write to temp, then rename)

---

[← Previous](./lesson-01-reading-text-files.md) | [Back to Course](./README.md) | [Next →](./lesson-03-context-managers.md)
