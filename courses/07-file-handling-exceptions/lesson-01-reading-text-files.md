# Lesson 1: Reading Text Files

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Open files using `open()` and file modes
- Read entire file, line by line, or into a list
- Understand file encoding
- Handle missing files safely

---

## Lesson Outline

### Part 1: Opening and Reading Files (30 minutes)

#### Explanation

```python
# Basic file reading:
file = open("data.txt", "r")   # "r" = read mode (default)
content = file.read()           # Read entire file as string
file.close()                    # MUST close - releases system resource
print(content)

# Better: use 'with' statement (auto-closes):
with open("data.txt", "r") as file:
    content = file.read()
# File is automatically closed here, even if error occurs
print(content)

# Reading line by line (memory efficient for large files):
with open("data.txt", "r") as file:
    for line in file:              # Iterate directly
        print(line.strip())        # strip() removes \n

# All reading methods:
with open("data.txt") as f:
    content = f.read()              # Entire file as one string
    # OR
    lines = f.readlines()           # List of all lines (with \n)
    # OR
    first_line = f.readline()       # Read one line at a time
```

**File modes:**
```python
# "r"  - read (default); error if file doesn't exist
# "w"  - write; creates file or overwrites existing
# "a"  - append; adds to end of file
# "rb" - read binary
# "wb" - write binary
# "r+" - read AND write
```

#### Practice

Create `sample.txt` with 5 lines of text, then read and print each line with its line number.

---

### Part 2: Encoding and File Paths (30 minutes)

#### Explanation

```python
# Encoding - always specify for text files:
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Using pathlib for cross-platform paths:
from pathlib import Path

# Build paths safely:
data_dir = Path("data")
file_path = data_dir / "users.txt"   # Works on Windows AND Mac/Linux

# Check if file exists before reading:
if file_path.exists():
    with open(file_path, encoding="utf-8") as f:
        content = f.read()
else:
    print(f"File not found: {file_path}")

# Path operations:
p = Path("/home/user/documents/report.txt")
print(p.name)       # report.txt
print(p.stem)       # report
print(p.suffix)     # .txt
print(p.parent)     # /home/user/documents
```

#### Practice

Write a function `read_file_safe(path)` that returns the file content or `None` if the file doesn't exist.

---

### Part 3: Practical Reading Patterns (30 minutes)

#### Explanation

```python
# Count lines and words in a file:
def analyze_file(filepath: str) -> dict:
    with open(filepath, encoding="utf-8") as f:
        lines = f.readlines()

    word_count = sum(len(line.split()) for line in lines)
    char_count = sum(len(line) for line in lines)

    return {
        "lines": len(lines),
        "words": word_count,
        "characters": char_count
    }

# Search for lines containing a keyword:
def grep(filepath: str, keyword: str) -> list[str]:
    matches = []
    with open(filepath, encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            if keyword.lower() in line.lower():
                matches.append(f"{line_num}: {line.rstrip()}")
    return matches

# Read configuration file:
def read_config(filepath: str) -> dict:
    config = {}
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):   # Skip comments
                key, _, value = line.partition("=")
                config[key.strip()] = value.strip()
    return config
```

#### Practice

Write a function that reads a text file and returns the 10 most common words.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Log File Parser

Given a log file with lines like `2024-01-15 ERROR: Database connection failed`:
- Read the file
- Count occurrences of ERROR, WARNING, INFO
- Return the 5 most recent ERROR messages

#### Exercise 2: Contact List Reader

Read a contacts file formatted as:
```
Name: Alice Smith
Email: alice@example.com
Phone: 555-1234

Name: Bob Jones
...
```
Parse into a list of dictionaries.

---

## Key Takeaways

- Always use `with open(...)` — never forget to close files
- Specify `encoding="utf-8"` for text files
- Use `pathlib.Path` for cross-platform file paths
- Iterate the file object directly for memory-efficient line-by-line reading

---

[Back to Course](./README.md) | [Next →](./lesson-02-writing-text-files.md)
