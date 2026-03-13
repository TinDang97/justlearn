# Lesson 8: argparse: CLI Tools

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Build command-line tools using `argparse`
- Define positional and optional arguments
- Create subcommands
- Validate and type-convert input

---

## Lesson Outline

### Part 1: argparse Basics (30 minutes)

#### Explanation

```python
import argparse

# Create parser:
parser = argparse.ArgumentParser(
    description="My awesome CLI tool",
    epilog="Example: tool.py --count 5 input.txt"
)

# Positional argument (required, no flag):
parser.add_argument("filename", help="Input file to process")

# Optional argument (flag):
parser.add_argument("--count", "-c", type=int, default=10,
                    help="Number of lines to display")
parser.add_argument("--verbose", "-v", action="store_true",
                    help="Enable verbose output")
parser.add_argument("--output", "-o", help="Output file path")

# Parse arguments:
args = parser.parse_args()

print(args.filename)   # "input.txt"
print(args.count)      # 10 (or user-provided number)
print(args.verbose)    # True or False
```

**Running from command line:**
```bash
python tool.py input.txt --count 5 --verbose
python tool.py input.txt -c 5 -v
python tool.py --help    # Auto-generated help text
```

#### Practice

Create a CLI tool `word_count.py` that counts lines, words, and characters in a file (like the `wc` command).

---

### Part 2: Argument Types and Validation (30 minutes)

#### Explanation

```python
import argparse
from pathlib import Path

parser = argparse.ArgumentParser(description="Data processor")

# Type conversion:
parser.add_argument("--port", type=int, default=8080)
parser.add_argument("--ratio", type=float, default=0.5)

# Choices (restricted options):
parser.add_argument("--format", choices=["csv", "json", "txt"],
                    default="csv", help="Output format")
parser.add_argument("--level", choices=["debug", "info", "warning", "error"],
                    default="info")

# Multiple values:
parser.add_argument("files", nargs="+", help="One or more files")
parser.add_argument("--tags", nargs="*", help="Zero or more tags")
parser.add_argument("--range", nargs=2, type=int, metavar=("START", "END"))

# Custom type (validation function):
def positive_int(value):
    ivalue = int(value)
    if ivalue <= 0:
        raise argparse.ArgumentTypeError(f"{value} is not a positive integer")
    return ivalue

parser.add_argument("--workers", type=positive_int, default=4)

# Path type:
def existing_file(path_str):
    p = Path(path_str)
    if not p.is_file():
        raise argparse.ArgumentTypeError(f"File not found: {path_str}")
    return p

parser.add_argument("input", type=existing_file)
```

#### Practice

Create a CLI that accepts: input file (must exist), output directory (optional), format (csv/json), and max records (positive int).

---

### Part 3: Subcommands (30 minutes)

#### Explanation

```python
import argparse

def cmd_add(args):
    print(f"Adding: {args.name} = {args.value}")

def cmd_get(args):
    print(f"Getting: {args.key}")

def cmd_delete(args):
    print(f"Deleting: {args.key}")


# Main parser:
parser = argparse.ArgumentParser(description="Key-value store CLI")
subparsers = parser.add_subparsers(dest="command", required=True,
                                    title="commands")

# 'add' subcommand:
add_parser = subparsers.add_parser("add", help="Add a key-value pair")
add_parser.add_argument("name", help="Key name")
add_parser.add_argument("value", help="Value")
add_parser.set_defaults(func=cmd_add)

# 'get' subcommand:
get_parser = subparsers.add_parser("get", help="Get a value")
get_parser.add_argument("key", help="Key to look up")
get_parser.set_defaults(func=cmd_get)

# 'delete' subcommand:
del_parser = subparsers.add_parser("delete", help="Delete a key")
del_parser.add_argument("key")
del_parser.set_defaults(func=cmd_delete)

args = parser.parse_args()
args.func(args)   # Dispatch to correct function
```

**Usage:**
```bash
python kv.py add mykey "my value"
python kv.py get mykey
python kv.py delete mykey
python kv.py --help
python kv.py add --help
```

#### Practice

Add a `list` subcommand that shows all keys (optionally filtered by prefix).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: File Organizer CLI

```bash
organize.py --source ~/Downloads --dest ~/Sorted --by extension --dry-run
organize.py --source . --by date --after 2024-01-01
```

Build with:
- `--source` / `--dest` (path args)
- `--by` choices: `extension`, `date`, `size`
- `--dry-run` flag (show what would happen, don't do it)
- `--after` / `--before` date filters

#### Exercise 2: Image Resizer CLI

```bash
# Resize single file:
imgr.py resize input.jpg --width 800 --output thumb.jpg

# Batch resize directory:
imgr.py batch ./photos --width 1200 --dest ./resized --format png

# Show info:
imgr.py info photo.jpg
```

Implement all three subcommands using Pillow from the previous lesson.

---

## Key Takeaways

- `add_argument("name")` for positional; `add_argument("--name")` for optional
- `type=int` / `type=float` converts from string automatically
- `action="store_true"` for boolean flags (present = True)
- `choices=[...]` restricts valid values (argparse handles error message)
- Subcommands with `add_subparsers()` scale to complex CLI tools

---

[← Previous](./lesson-07-pillow-image-processing.md) | [Back to Course](./README.md) | [Next →](./lesson-09-logging-module.md)
