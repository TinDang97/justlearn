# Lesson 8: File System Operations

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Navigate and manipulate the file system with `pathlib`
- Create, rename, delete files and directories
- Search for files using glob patterns
- Understand relative vs absolute paths

---

## Lesson Outline

### Part 1: pathlib Fundamentals (30 minutes)

#### Explanation

```python
from pathlib import Path

# Create path objects:
p = Path(".")                    # Current directory
home = Path.home()               # Home directory: /Users/username
cwd = Path.cwd()                 # Current working directory

# Building paths (/ operator):
data_dir = Path("data")
config = data_dir / "config" / "settings.json"
print(config)    # data/config/settings.json

# Path properties:
p = Path("/home/alice/docs/report.txt")
p.name       # "report.txt"
p.stem       # "report"
p.suffix     # ".txt"
p.parent     # Path("/home/alice/docs")
p.parts      # ('/', 'home', 'alice', 'docs', 'report.txt')
p.absolute() # Full absolute path

# Checking path state:
p = Path("myfile.txt")
p.exists()       # Does path exist?
p.is_file()      # Is it a file?
p.is_dir()       # Is it a directory?

# File metadata:
p = Path("existing_file.txt")
stat = p.stat()
print(stat.st_size)    # Size in bytes
print(stat.st_mtime)   # Modification time (timestamp)
```

#### Practice

Write a function `get_file_info(path)` that returns a dict with name, size, extension, and modification date.

---

### Part 2: File and Directory Operations (30 minutes)

#### Explanation

```python
from pathlib import Path
import shutil

# Create directories:
Path("output/reports/2024").mkdir(parents=True, exist_ok=True)

# Create file:
Path("newfile.txt").touch()

# Read/write (pathlib shortcuts):
Path("output.txt").write_text("Hello!", encoding="utf-8")
content = Path("output.txt").read_text(encoding="utf-8")

# Rename/move:
Path("old.txt").rename("new.txt")          # Rename in same directory
Path("file.txt").rename("other/file.txt")  # Move to different directory

# Copy (needs shutil):
shutil.copy("source.txt", "destination.txt")           # Copy file
shutil.copytree("source_dir", "destination_dir")       # Copy directory

# Delete:
Path("file.txt").unlink()              # Delete file
Path("empty_dir").rmdir()              # Delete empty directory
shutil.rmtree("nonempty_dir")          # Delete directory and contents

# Safe delete:
path = Path("maybe_exists.txt")
path.unlink(missing_ok=True)           # No error if doesn't exist
```

#### Practice

Write a function `organize_files(directory)` that moves files into subdirectories by extension (`.txt` → `text/`, `.jpg` → `images/`, etc.).

---

### Part 3: Searching and Globbing (30 minutes)

#### Explanation

```python
from pathlib import Path

# List directory contents:
for item in Path(".").iterdir():
    print(item.name, "DIR" if item.is_dir() else "FILE")

# Glob patterns (* = any characters, ** = recursive):
for py_file in Path(".").glob("*.py"):      # Current dir only
    print(py_file)

for py_file in Path(".").rglob("*.py"):     # Recursive
    print(py_file)

# Pattern examples:
Path(".").glob("*.txt")          # All .txt in current dir
Path(".").glob("**/*.txt")       # All .txt recursively
Path(".").glob("data_*.csv")     # Files starting with "data_"
Path(".").glob("**/__pycache__") # All __pycache__ dirs


# Find largest files:
def find_largest_files(directory: str, n: int = 10) -> list:
    files = [p for p in Path(directory).rglob("*") if p.is_file()]
    return sorted(files, key=lambda p: p.stat().st_size, reverse=True)[:n]


# Find files modified recently:
from datetime import datetime, timedelta

def find_recent_files(directory: str, days: int = 7) -> list:
    cutoff = datetime.now() - timedelta(days=days)
    result = []
    for p in Path(directory).rglob("*"):
        if p.is_file():
            mtime = datetime.fromtimestamp(p.stat().st_mtime)
            if mtime > cutoff:
                result.append(p)
    return result
```

#### Practice

Write a `find_duplicates(directory)` function that finds files with identical names in different subdirectories.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: File Backup System

Build a backup function that:
- Takes source directory and backup directory
- Copies all files (preserving structure)
- Names backup folder with timestamp: `backup_2024-01-15_14-30`
- Skips hidden files (starting with `.`)
- Reports: files copied, total size, time taken

#### Exercise 2: Project Cleaner

Build a `ProjectCleaner` that:
- Finds and deletes `__pycache__` directories
- Finds and deletes `.pyc` files
- Finds empty directories
- Reports what would be deleted (dry run mode) before actually deleting

---

## Key Takeaways

- `pathlib.Path` is the modern, cross-platform way to work with file paths
- Use `/` operator to build paths: `Path("data") / "file.txt"`
- `mkdir(parents=True, exist_ok=True)` — safe directory creation
- `glob()` for current directory patterns; `rglob()` for recursive
- `shutil` for copy/move/delete operations on directories

---

[← Previous](./lesson-07-working-with-json.md) | [Back to Course](./README.md) | [Next →](./lesson-09-binary-files-other-formats.md)
